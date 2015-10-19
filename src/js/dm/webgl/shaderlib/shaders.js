/**
 * @requires dm/namespaces.js
 * @requires dm/webgl/namespaces.js
 */

dm.ShaderLib.AlphaBlend = {
	uniforms: THREE.UniformsUtils.merge([
		{
		"Sampler" : { type: "t", value: null },
		"Sampler2" : { type: "t", value: null },
		}
	]),
	vertexShader: [
		'varying vec2 vUv;',
		'void main()	{',
		'    vUv = uv;',
		'	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
		'}'].join("\n"),
	fragmentShader: [
		'uniform sampler2D Sampler;',
		'uniform sampler2D Sampler2;',
		'varying vec2 vUv;',
		'void main()',
		'{',
		'    vec4 color1 = texture2D(Sampler, vUv);',
		'    vec4 color2 = texture2D(Sampler2, vUv);',
		'    if(color1.a == 0.0 || color2.a >= 1.0)',
		'    	gl_FragColor = color2;',
		'    else if(color2.a == 0.0)',
		'    	gl_FragColor = color1;',
		'    else',
		'		gl_FragColor = mix(color1, color2, color2.a);',
		'}'].join("\n")
};
dm.ShaderLib.Color = {
	uniforms: THREE.UniformsUtils.merge([
		{
		"tDiffuse" : { type: "t", value: null },
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
		'varying vec2 vUv;',
		'void main()',
		'{',
		'    gl_FragColor = texture2D(tDiffuse, vUv);',
		'}'].join("\n")
};
dm.ShaderLib.NormalBlend = {
	uniforms: THREE.UniformsUtils.merge([
		{
		"Sampler" : { type: "t", value: null },
		"Sampler2" : { type: "t", value: null },
		}
	]),
	vertexShader: [
		'varying vec2 vUv;',
		'void main()	{',
		'    vUv = uv;',
		'	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
		'}'].join("\n"),
	fragmentShader: [
		'uniform sampler2D Sampler;',
		'uniform sampler2D Sampler2;',
		'varying vec2 vUv;',
		'void main()',
		'{',
		'    vec4 color1 = texture2D(Sampler, vUv);',
		'    vec4 color2 = texture2D(Sampler2, vUv);',
		'    if(color1.a == 0.0 || color2.a >= 1.0)',
		'    	gl_FragColor = color2;',
		'    else if(color2.a == 0.0)',
		'    	gl_FragColor = color1;',
		'    else',
		'		gl_FragColor = vec4(color2.rgb + (1.0 - color2.a) * color1.rgb, color2.a + color1.a - color2.a * color1.a);',
		'}'].join("\n")
};
dm.ShaderLib.OverrideColor = {
	uniforms: THREE.UniformsUtils.merge([
		{
		"color" : { type: "v4", value: new THREE.Vector4( 0, 0, 0, 0 ) },
		"premultiplied" : { type: "i", value: 0 },
		"tDiffuse" : { type: "t", value: null },
		}
	]),
	vertexShader: [
		'varying vec2 vUv;',
		'void main()	{',
		'    vUv = uv;',
		'	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
		'}'].join("\n"),
	fragmentShader: [
		'uniform vec4 color;',
		'uniform bool premultiplied;',
		'uniform sampler2D tDiffuse;',
		'varying vec2 vUv;',
		'void main()',
		'{',
		'    float texAlpha = color.a * texture2D(tDiffuse, vUv).a;',
		'    ',
		'    if(premultiplied)',
		'    	gl_FragColor = vec4(color.rgb * texAlpha, texAlpha);',
		'    else',
		'    	gl_FragColor = vec4(color.rgb, texAlpha);',
		'}'].join("\n")
};
dm.ShaderLib.PremultiplyAlpha = {
	uniforms: THREE.UniformsUtils.merge([
		{
		"tDiffuse" : { type: "t", value: null },
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
		'varying vec2 vUv;',
		'void main()',
		'{',
		'    vec4 texColor = texture2D(tDiffuse, vUv);',
		'    gl_FragColor = vec4(texColor.rgb * texColor.a, texColor.a);',
		'}'].join("\n")
};
dm.ShaderLib.UnpremultiplyAlpha = {
	uniforms: THREE.UniformsUtils.merge([
		{
		"tDiffuse" : { type: "t", value: null },
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
		'varying vec2 vUv;',
		'void main()',
		'{',
		'    vec4 texColor = texture2D(tDiffuse, vUv);',
		'    if(texColor.a != 0.0)',
		'    	gl_FragColor = vec4(texColor.rgb / texColor.a, texColor.a);',
		'    else',
		'    	gl_FragColor = texColor;',
		'}'].join("\n")
};
dm.ShaderLib.Vignette = {
	uniforms: THREE.UniformsUtils.merge([
		{
		"size" : { type: "f", value: -1 },
		"softness" : { type: "f", value: -1 },
		"scale" : { type: "v2", value: new THREE.Vector2( 0, 0 ) },
		"offset" : { type: "v2", value: new THREE.Vector2( 0, 0 ) },
		"debug" : { type: "i", value: 0 },
		"tDiffuse" : { type: "t", value: null },
		}
	]),
	vertexShader: [
		'varying vec2 vUv;',
		'void main()	{',
		'    vUv = uv;',
		'	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
		'}'].join("\n"),
	fragmentShader: [
		'uniform float size;',
		'uniform float softness;',
		'uniform vec2 scale;',
		'uniform vec2 offset;',
		'uniform bool debug;',
		'uniform sampler2D tDiffuse;',
		'varying vec2 vUv;',
		'void main() {',
		'	vec4 texColor = texture2D(tDiffuse, vUv);',
		'    vec2 uv = vec2((vUv.x - 0.5 - offset.x) * size * (1.0/scale.x), (vUv.y - 0.5 - offset.y) * size * (1.0/scale.y));',
		'    float vignette = smoothstep(size/4.0, (1.0-softness)*size/4.0, dot( uv, uv ));',
		'    if(debug)',
		'    	gl_FragColor = vec4(0.0, 0.0, 0.0, vignette);',
		'    else',
		'    	gl_FragColor = texColor * vignette;',
		'}'].join("\n")
};
