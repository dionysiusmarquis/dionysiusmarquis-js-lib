if(typeof dm === "undefined") dm = new Object();

dm.SemShaderMaterial = function(materialCapture, usePhong) {

	THREE.ShaderMaterial.call(this, usePhong ? dm.ShaderLib.SemPhong : dm.ShaderLib.Sem );
	this.uniforms = THREE.UniformsUtils.clone(this.uniforms);

	this.uniforms.tMatCap.value = materialCapture;
};
dm.SemShaderMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype);


dm.SemNormalShaderMaterial = function(materialCapture, normalMap) {

	THREE.ShaderMaterial.call(this, dm.ShaderLib.SemNormal);
	this.uniforms = THREE.UniformsUtils.clone(this.uniforms);

	this.uniforms.tNormal.value 		= normalMap;
	this.uniforms.tMatCap.value 		= materialCapture;
	this.uniforms.time.value 			= 0;
	this.uniforms.bump.value 			= 0;
	this.uniforms.noise.value 			= 0.04;
	this.uniforms.repeat.value	 		= new THREE.Vector2( 1, 1 );
	this.uniforms.useNormal.value 		= 0;
	this.uniforms.useRim.value			= 0;
	this.uniforms.rimPower.value		= 2;
	this.uniforms.useScreen.value		= 0;
	this.uniforms.normalScale.value		= 0.5;
	this.uniforms.normalRepeat.value 	= 1;

	this.wrapping = THREE.ClampToEdgeWrapping;
	this.shading = THREE.SmoothShading;
	this.side = THREE.DoubleSide;
};
dm.SemNormalShaderMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype);

if(typeof dm === "undefined") dm = new Object();
if(typeof dm.ShaderLib === "undefined") dm.ShaderLib = new Object();

dm.ShaderLib.Sem = {
	uniforms: THREE.UniformsUtils.merge([
		{
		"tMatCap" : { type: "t", value: null },
		}
	]),
	vertexShader: [
		'varying vec2 vN;',
		'void main() {',
		'	vec3 e = normalize( vec3( modelViewMatrix * vec4( position, 1.0 ) ) );',
		'	vec3 n = normalize( normalMatrix * normal );',
		'	vec3 r = reflect( e, n );',
		'	float m = 2. * sqrt( pow( r.x, 2. ) + pow( r.y, 2. ) + pow( r.z + 1., 2. ) );',
		'	vN = r.xy / m + .5;',
		'	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1. );',
		'}'].join("\n"),
	fragmentShader: [
		'uniform sampler2D tMatCap;',
		'varying vec2 vN;',
		'void main() {',
		'	',
		'	vec3 base = texture2D( tMatCap, vN ).rgb;',
		'	gl_FragColor = vec4( base, 1. );',
		'}'].join("\n")
};
dm.ShaderLib.SemNormal = {
	uniforms: THREE.UniformsUtils.merge([
		{
		"time" : { type: "f", value: -1 },
		"repeat" : { type: "v2", value: new THREE.Vector2( 0, 0 ) },
		"useNormal" : { type: "f", value: -1 },
		"useRim" : { type: "f", value: -1 },
		"bump" : { type: "f", value: -1 },
		"tNormal" : { type: "t", value: null },
		"tMatCap" : { type: "t", value: null },
		"noise" : { type: "f", value: -1 },
		"rimPower" : { type: "f", value: -1 },
		"useScreen" : { type: "f", value: -1 },
		"normalScale" : { type: "f", value: -1 },
		"normalRepeat" : { type: "f", value: -1 },
		}
	]),
	vertexShader: [
		'attribute vec4 tangent;',
		'uniform float time;',
		'uniform vec2 repeat;',
		'uniform float useNormal;',
		'uniform float useRim;',
		'varying vec2 vUv;',
		'varying vec3 vTangent;',
		'varying vec3 vBinormal;',
		'varying vec3 vNormal;',
		'varying vec3 vEye;',
		'varying vec3 vU;',
		'varying vec2 vN;',
		'void main() {',
		'	vU = normalize( vec3( modelViewMatrix * vec4( position, 1.0 ) ) );',
		'	if( useNormal == 0. ) {',
		'		vec3 n = normalize( normalMatrix * normal );',
		'		vec3 r = reflect( vU, n );',
		'		float m = 2.0 * sqrt( r.x * r.x + r.y * r.y + ( r.z + 1.0 ) * ( r.z+1.0 ) );',
		'		vN = vec2( r.x / m + 0.5,  r.y / m + 0.5 );',
		'	} else {',
		'		vN = vec2( 0. );',
		'	}',
		'	vUv = repeat * uv;',
		'	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
		'	vNormal = normalize( normalMatrix * normal );',
		'	if( useNormal == 1. ) {',
		'		vTangent = normalize( normalMatrix * tangent.xyz );',
		'		vBinormal = normalize( cross( vNormal, vTangent ) * tangent.w );',
		'	} else {',
		'		vTangent = vec3( 0. );',
		'		vBinormal = vec3( 0. );',
		'	}',
		'	if( useRim > 0. ) {',
		'		vEye = ( modelViewMatrix * vec4( position, 1.0 ) ).xyz;',
		'	} else {',
		'		vEye = vec3( 0. );',
		'	}',
		'}'].join("\n"),
	fragmentShader: [
		'uniform float time;',
		'uniform float bump;',
		'uniform sampler2D tNormal;',
		'uniform sampler2D tMatCap;',
		'uniform float noise;',
		'uniform float useNormal;',
		'uniform float useRim;',
		'uniform float rimPower;',
		'uniform float useScreen;',
		'uniform float normalScale;',
		'uniform float normalRepeat;',
		'varying vec2 vUv;',
		'varying vec3 vTangent;',
		'varying vec3 vBinormal;',
		'varying vec3 vNormal;',
		'varying vec3 vEye;',
		'varying vec3 vU;',
		'varying vec2 vN;',
		'float random(vec3 scale,float seed){return fract(sin(dot(gl_FragCoord.xyz+seed,scale))*43758.5453+seed);}',
		'void main() {',
		'	',
		'	vec3 finalNormal = vNormal;',
		'	vec2 calculatedNormal = vN;',
		'	if( useNormal == 1. ) {',
		'		vec3 normalTex = texture2D( tNormal, vUv * normalRepeat ).xyz * 2.0 - 1.0;',
		'		normalTex.xy *= normalScale;',
		'		normalTex.y *= -1.;',
		'		normalTex = normalize( normalTex );',
		'		mat3 tsb = mat3( normalize( vTangent ), normalize( vBinormal ), normalize( vNormal ) );',
		'		finalNormal = tsb * normalTex;',
		'		vec3 r = reflect( vU, normalize( finalNormal ) );',
		'		float m = 2.0 * sqrt( r.x * r.x + r.y * r.y + ( r.z + 1.0 ) * ( r.z+1.0 ) );',
		'		calculatedNormal = vec2( r.x / m + 0.5,  r.y / m + 0.5 );',
		'	}',
		'	vec3 base = texture2D( tMatCap, calculatedNormal ).rgb;',
		'	',
		'	// rim lighting',
		'	if( useRim > 0. ) {',
		'		float f = rimPower * abs( dot( vNormal, normalize( vEye ) ) );',
		'		f = useRim * ( 1. - smoothstep( 0.0, 1., f ) );',
		'        base += vec3( f );',
		'    }',
		'    // screen blending',
		'    if( useScreen == 1. ) {',
		'		base = vec3( 1. ) - ( vec3( 1. ) - base ) * ( vec3( 1. ) - base );',
		'	}',
		'    // noise ',
		'    base += noise * ( .5 - random( vec3( 1. ), length( gl_FragCoord ) ) );',
		'	gl_FragColor = vec4( base, 1. );',
		'}'].join("\n")
};
dm.ShaderLib.SemPhong = {
	uniforms: THREE.UniformsUtils.merge([
		{
		"tMatCap" : { type: "t", value: null },
		}
	]),
	vertexShader: [
		'uniform sampler2D tMatCap;',
		'varying vec2 vN;',
		'void main() {',
		'	',
		'	vec3 base = texture2D( tMatCap, vN ).rgb;',
		'	gl_FragColor = vec4( base, 1. );',
		'}'].join("\n"),
	fragmentShader: [
		'varying vec3 e;',
		'varying vec3 n;',
		'void main() {',
		'	e = normalize( vec3( modelViewMatrix * vec4( position, 1.0 ) ) );',
		'	n = normalize( normalMatrix * normal );',
		'	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1. );',
		'}'].join("\n")
};
