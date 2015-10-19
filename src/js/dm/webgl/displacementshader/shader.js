/**
 * @requires dm/namespaces.js
 * @requires dm/webgl/namespaces.js
 */


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
