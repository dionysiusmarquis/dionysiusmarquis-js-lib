if(typeof dm === "undefined") dm = new Object();

dm.DisplacementShaderMaterial = function(texture, displacementMap, componentX, componentY, scaleX, scaleY, mode, color, offset) {

	THREE.ShaderMaterial.call(this, dm.ShaderLib.Displacement );
	this.uniforms = THREE.UniformsUtils.clone(this.uniforms);

	this.uniforms.tDiffuse.value = texture;
	this.uniforms.tDisplacement.value = displacementMap;

	this.uniforms.scaleX.value 		= scaleX || .01;
	this.uniforms.scaleY.value 		= scaleY || .01;
	this.uniforms.color.value 		= color || new THREE.Vector4(0.0, 0.0, 0.0, 1.0);
	this.uniforms.offset.value 		= offset || .5;

	this.setMode = function(mode) {
		this.defines = {COMPONENT_X: this.defines.COMPONENT_X, COMPONENT_Y: this.defines.COMPONENT_Y};
		this.defines[mode] = "";
	};

	this.setComponentX = function(componentX) {
		this.defines.COMPONENT_X = componentX;
	};

	this.setComponentY = function(componentY) {
		this.defines.COMPONENT_Y = componentY;
	};

	this.setComponentX(componentX || dm.DisplacementShaderMaterial.CHANNEL_RED);
	this.setComponentY(componentY || dm.DisplacementShaderMaterial.CHANNEL_RED);
	this.setMode(mode || dm.DisplacementShaderMaterial.MODE_WRAP);
};
dm.DisplacementShaderMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype);

dm.DisplacementShaderMaterial.MODE_WRAP 		= "MODE_WRAP";
dm.DisplacementShaderMaterial.MODE_CLAMP 	= "MODE_CLAMP";
dm.DisplacementShaderMaterial.MODE_IGNORE	= "MODE_IGNORE";
dm.DisplacementShaderMaterial.MODE_COLOR		= "MODE_COLOR";

dm.DisplacementShaderMaterial.CHANNEL_RED	= 0;
dm.DisplacementShaderMaterial.CHANNEL_GREEN	= 1;
dm.DisplacementShaderMaterial.CHANNEL_BLUE 	= 2;
dm.DisplacementShaderMaterial.CHANNEL_ALPHA = 3;

if(typeof dm === "undefined") dm = new Object();
if(typeof dm.ShaderLib === "undefined") dm.ShaderLib = new Object();

dm.ShaderLib.Displacement = {
	uniforms: THREE.UniformsUtils.merge([
		{
		"tDiffuse" : { type: "t", value: null },
		"tDisplacement" : { type: "t", value: null },
		"scaleX" : { type: "f", value: -1 },
		"scaleY" : { type: "f", value: -1 },
		"offset" : { type: "f", value: -1 },
		"color" : { type: "v4", value: new THREE.Vector4( 0, 0, 0, 0 ) },
		}
	]),
	vertexShader: [
		'varying vec2 vUv;',
		'void main()	{',
		'    vUv = uv;',
		'	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
		'}'].join("\n"),
	fragmentShader: [
		'uniform sampler2D tDiffuse;',
		'uniform sampler2D tDisplacement;',
		'uniform float scaleX;',
		'uniform float scaleY;',
		'uniform float offset;',
		'uniform vec4 color;',
		'varying vec2 vUv;',
		'void main() {',
		'	vec4 texelDisplacement = texture2D(tDisplacement, vUv);',
		'	vec2 texCoordOffset = vUv + vec2((texelDisplacement[COMPONENT_X] - offset) * scaleX, (texelDisplacement[COMPONENT_Y] - offset) * scaleY);',
		'	// gl_FragColor = mix(texelDisplacement, texture2D(tDiffuse, vUv), .5);',
		'	if(texCoordOffset.x >= 0.0 && texCoordOffset.y >= 0.0 && texCoordOffset.x <= 1.0 && texCoordOffset.y <= 1.0)',
		'		gl_FragColor = texture2D(tDiffuse, texCoordOffset);',
		'	else {',
		'	#ifdef MODE_IGNORE',
		'		gl_FragColor = texture2D(tDiffuse, vUv);',
		'		',
		'	#elif defined(MODE_WRAP)',
		'		if(texCoordOffset.x < 0.0)',
		'			texCoordOffset.x = 1.0 + texCoordOffset.x;',
		'		',
		'		if(texCoordOffset.y < 0.0)',
		'			texCoordOffset.y = 1.0 + texCoordOffset.y;',
		'		',
		'		if(texCoordOffset.x > 1.0)',
		'			texCoordOffset.x = texCoordOffset.x - 1.0;',
		'		',
		'		if(texCoordOffset.y > 1.0)',
		'			texCoordOffset.y = texCoordOffset.y - 1.0;',
		'		gl_FragColor = texture2D(tDiffuse, texCoordOffset);',
		'	#elif defined(MODE_CLAMP)',
		'		if(texCoordOffset.x < 0.0)',
		'			texCoordOffset.x = 0.0;',
		'		',
		'		if(texCoordOffset.y < 0.0)',
		'			texCoordOffset.y = 0.0;',
		'		',
		'		if(texCoordOffset.x > 1.0)',
		'			texCoordOffset.x = 1.0;',
		'		',
		'		if(texCoordOffset.y > 1.0)',
		'			texCoordOffset.y = 1.0;',
		'		gl_FragColor = texture2D(tDiffuse, texCoordOffset);',
		'	#else',
		'		gl_FragColor = vec4(color.rgb * color.a, color.a);',
		'	#endif',
		'	}',
		'}'].join("\n")
};
