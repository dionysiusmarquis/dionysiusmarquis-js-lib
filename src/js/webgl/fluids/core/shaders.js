if(typeof dm === "undefined") dm = new Object();
if(typeof dm.Fluids === "undefined") dm.Fluids = new Object();

dm.Fluids.Shaders = new Object();

dm.Fluids.Shaders.Advect = {
	uniforms: THREE.UniformsUtils.merge([
		{
		"VelocityTexture" : { type: "t", value: null },
		"SourceTexture" : { type: "t", value: null },
		"Obstacles" : { type: "t", value: null },
		"InverseSize" : { type: "v2", value: new THREE.Vector2( 0, 0 ) },
		"TimeStep" : { type: "f", value: -1 },
		"Dissipation" : { type: "f", value: -1 },
		"ObstacleThreshold" : { type: "f", value: -1 },
		}
	]),
	vertexShader: [
		'varying vec2 vUv;',
		'void main()	{',
		'    vUv = uv;',
		'	gl_Position = vec4( position, 1.0 );',
		'}'].join("\n"),
	fragmentShader: [
		'uniform sampler2D VelocityTexture;',
		'uniform sampler2D SourceTexture;',
		'uniform sampler2D Obstacles;',
		'uniform vec2 InverseSize;',
		'uniform float TimeStep;',
		'uniform float Dissipation;',
		'uniform float ObstacleThreshold;',
		'varying vec2 vUv;',
		'void main()',
		'{',
		'    float solid = texture2D(Obstacles, vUv).a;',
		'    ',
		'    if (solid >= ObstacleThreshold) {',
		'        gl_FragColor = vec4(0.0);',
		'        return;',
		'    }',
		'    ',
		'    vec2 u = texture2D(VelocityTexture, vUv).xy;',
		'    vec2 coord = InverseSize * (gl_FragCoord.xy - TimeStep * u);',
		'    gl_FragColor = Dissipation * texture2D(SourceTexture, coord);',
		'}'].join("\n")
};
dm.Fluids.Shaders.Boundary = {
	uniforms: THREE.UniformsUtils.merge([
		{
		"Color" : { type: "v4", value: new THREE.Vector4( 0, 0, 0, 0 ) },
		"Boundary" : { type: "fv1", value: [] },
		"InverseSize" : { type: "v2", value: new THREE.Vector2( 0, 0 ) },
		}
	]),
	vertexShader: [
		'varying vec2 vUv;',
		'void main()	{',
		'    vUv = uv;',
		'	gl_Position = vec4( position, 1.0 );',
		'}'].join("\n"),
	fragmentShader: [
		'// uniform_ sampler2D Sampler;',
		'uniform vec4 Color;',
		'uniform float Boundary[4];',
		'uniform vec2 InverseSize;',
		'varying vec2 vUv;',
		'void main()',
		'{',
		'	// vec4 outColor = texture2D(Sampler, vUv);',
		'	float bbN = 1.0 - Boundary[0] * InverseSize.y;',
		'	float bbS = Boundary[2] * InverseSize.y;',
		'	float bbE = 1.0 - Boundary[1] * InverseSize.x;',
		'	float bbW = Boundary[3] * InverseSize.x;',
		'    // gl_FragColor = vUv.y > bbN || vUv.y < bbS || vUv.x > bbE || vUv.x < bbW ? mix(outColor, Color, Color.a) : outColor;',
		'    gl_FragColor = vUv.y > bbN || vUv.y < bbS || vUv.x > bbE || vUv.x < bbW ? vec4(Color.rgb * Color.a, Color.a) : vec4(0.0);',
		'}'].join("\n")
};
dm.Fluids.Shaders.Buoyancy = {
	uniforms: THREE.UniformsUtils.merge([
		{
		"Velocity" : { type: "t", value: null },
		"Temperature" : { type: "t", value: null },
		"Density" : { type: "t", value: null },
		"AmbientTemperature" : { type: "f", value: -1 },
		"TimeStep" : { type: "f", value: -1 },
		"Sigma" : { type: "f", value: -1 },
		"Kappa" : { type: "f", value: -1 },
		}
	]),
	vertexShader: [
		'varying vec2 vUv;',
		'void main()	{',
		'    vUv = uv;',
		'	gl_Position = vec4( position, 1.0 );',
		'}'].join("\n"),
	fragmentShader: [
		'uniform sampler2D Velocity;',
		'uniform sampler2D Temperature;',
		'uniform sampler2D Density;',
		'uniform float AmbientTemperature;',
		'uniform float TimeStep;',
		'uniform float Sigma;',
		'uniform float Kappa;',
		'varying vec2 vUv;',
		'void main()',
		'{',
		'    float T = texture2D(Temperature, vUv).r;',
		'    vec2 V = texture2D(Velocity, vUv).xy;',
		'    vec2 outColor = V;',
		'    if (T > AmbientTemperature) {',
		'        float D = texture2D(Density, vUv).x;',
		'        outColor += (TimeStep * (T - AmbientTemperature) * Sigma - D * Kappa ) * vec2(0.0, 1.0);',
		'    }',
		'    ',
		'    gl_FragColor = vec4(outColor, 0.0, 1.0);',
		'}'].join("\n")
};
dm.Fluids.Shaders.ComputeDivergence = {
	uniforms: THREE.UniformsUtils.merge([
		{
		"Velocity" : { type: "t", value: null },
		"Obstacles" : { type: "t", value: null },
		"InverseSize" : { type: "v2", value: new THREE.Vector2( 0, 0 ) },
		"HalfInverseCellSize" : { type: "f", value: -1 },
		"ObstacleThreshold" : { type: "f", value: -1 },
		}
	]),
	vertexShader: [
		'void main()	{',
		'	gl_Position = vec4( position, 1.0 );',
		'}'].join("\n"),
	fragmentShader: [
		'uniform sampler2D Velocity;',
		'uniform sampler2D Obstacles;',
		'uniform vec2 InverseSize;',
		'uniform float HalfInverseCellSize;',
		'uniform float ObstacleThreshold;',
		'void main()',
		'{',
		'    vec2 fragCoord = gl_FragCoord.xy;',
		'    ',
		'    // vec2 c = fragCoord * InverseSize;',
		'    vec2 cN = (fragCoord + vec2(0.0, 1.0)) * InverseSize;',
		'    vec2 cS = (fragCoord + vec2(0.0, -1.0)) * InverseSize;',
		'    vec2 cE = (fragCoord + vec2(1.0, 0.0)) * InverseSize;',
		'    vec2 cW = (fragCoord + vec2(-1.0, 0.0)) * InverseSize;',
		'    ',
		'    // Find neighboring obstacles:',
		'    vec4 oN = texture2D(Obstacles, cN);',
		'    vec4 oS = texture2D(Obstacles, cS);',
		'    vec4 oE = texture2D(Obstacles, cE);',
		'    vec4 oW = texture2D(Obstacles, cW);',
		'    ',
		'    // Find neighboring velocities:',
		'    vec2 vN;',
		'    vec2 vS;',
		'    vec2 vE;',
		'    vec2 vW;',
		'    if(oN.a >= ObstacleThreshold) vN = oN.rg; else vN = texture2D(Velocity, cN).rg;',
		'    if(oS.a >= ObstacleThreshold) vS = oS.rg; else vS = texture2D(Velocity, cS).rg;',
		'    if(oE.a >= ObstacleThreshold) vE = oE.rg; else vE = texture2D(Velocity, cE).rg;',
		'    if(oW.a >= ObstacleThreshold) vW = oW.rg; else vW = texture2D(Velocity, cW).rg;',
		'    gl_FragColor = vec4(HalfInverseCellSize * (vE.r - vW.r + vN.g - vS.g));',
		'  }'].join("\n")
};
dm.Fluids.Shaders.Jacobi = {
	uniforms: THREE.UniformsUtils.merge([
		{
		"Pressure" : { type: "t", value: null },
		"Divergence" : { type: "t", value: null },
		"Obstacles" : { type: "t", value: null },
		"InverseSize" : { type: "v2", value: new THREE.Vector2( 0, 0 ) },
		"Alpha" : { type: "f", value: -1 },
		"InverseBeta" : { type: "f", value: -1 },
		"ObstacleThreshold" : { type: "f", value: -1 },
		}
	]),
	vertexShader: [
		'varying vec2 vUv;',
		'void main()	{',
		'    vUv = uv;',
		'	gl_Position = vec4( position, 1.0 );',
		'}'].join("\n"),
	fragmentShader: [
		'uniform sampler2D Pressure;',
		'uniform sampler2D Divergence;',
		'uniform sampler2D Obstacles;',
		'uniform vec2 InverseSize;',
		'uniform float Alpha;',
		'uniform float InverseBeta;',
		'uniform float ObstacleThreshold;',
		'varying vec2 vUv;',
		'void main()',
		'{',
		'    vec2 fragCoord = gl_FragCoord.xy;',
		'    ',
		'    vec2 cN = (fragCoord + vec2(0.0, 1.0)) * InverseSize;',
		'    vec2 cS = (fragCoord + vec2(0.0, -1.0)) * InverseSize;',
		'    vec2 cE = (fragCoord + vec2(1.0, 0.0)) * InverseSize;',
		'    vec2 cW = (fragCoord + vec2(-1.0, 0.0)) * InverseSize;',
		'    ',
		'    // Find neighboring obstacles:',
		'    vec4 oN = texture2D(Obstacles, cN);',
		'    vec4 oS = texture2D(Obstacles, cS);',
		'    vec4 oE = texture2D(Obstacles, cE);',
		'    vec4 oW = texture2D(Obstacles, cW);',
		'    ',
		'    // Find neighboring pressure:',
		'    vec4 pN;',
		'    vec4 pS;',
		'    vec4 pE;',
		'    vec4 pW;',
		'    ',
		'    // Use center pressure for solid cells:',
		'    vec4 pC = texture2D(Pressure, vUv);',
		'    if(oN.a >= ObstacleThreshold) pN = pC; else pN = texture2D(Pressure, cN); ',
		'    if(oS.a >= ObstacleThreshold) pS = pC; else pS = texture2D(Pressure, cS); ',
		'    if(oE.a >= ObstacleThreshold) pE = pC; else pE = texture2D(Pressure, cE); ',
		'    if(oW.a >= ObstacleThreshold) pW = pC; else pW = texture2D(Pressure, cW); ',
		'    float bC = texture2D(Divergence, vUv).x;',
		'    gl_FragColor = vec4((pW + pE + pN + pS + Alpha * bC) * InverseBeta);',
		'}'].join("\n")
};
dm.Fluids.Shaders.Splat = {
	uniforms: THREE.UniformsUtils.merge([
		{
		"Sampler" : { type: "t", value: null },
		"Point" : { type: "v2", value: new THREE.Vector2( 0, 0 ) },
		"Radius" : { type: "f", value: -1 },
		"FillColor" : { type: "v4", value: new THREE.Vector4( 0, 0, 0, 0 ) },
		}
	]),
	vertexShader: [
		'varying vec2 vUv;',
		'void main()	{',
		'    vUv = uv;',
		'	gl_Position = vec4( position, 1.0 );',
		'}'].join("\n"),
	fragmentShader: [
		'uniform sampler2D Sampler;',
		'uniform vec2 Point;',
		'uniform float Radius;',
		'uniform vec4 FillColor;',
		'varying vec2 vUv;',
		'void main()',
		'{',
		'    float d = distance(Point, gl_FragCoord.xy);',
		'    vec4 color = texture2D(Sampler, vUv);',
		'    ',
		'    if (d < Radius) {',
		'        float a = (Radius - d) * 0.5;',
		'        gl_FragColor = vec4(FillColor.rgb * FillColor.a, FillColor.a); ',
		'    } ',
		'    else {',
		'        gl_FragColor = color;',
		'        // gl_FragColor = vec4(0.0);',
		'    }',
		'}'].join("\n")
};
dm.Fluids.Shaders.SubtractGradient = {
	uniforms: THREE.UniformsUtils.merge([
		{
		"Velocity" : { type: "t", value: null },
		"Pressure" : { type: "t", value: null },
		"Obstacles" : { type: "t", value: null },
		"InverseSize" : { type: "v2", value: new THREE.Vector2( 0, 0 ) },
		"GradientScale" : { type: "f", value: -1 },
		"ObstacleThreshold" : { type: "f", value: -1 },
		}
	]),
	vertexShader: [
		'varying vec2 vUv;',
		'void main()	{',
		'    vUv = uv;',
		'	gl_Position = vec4( position, 1.0 );',
		'}'].join("\n"),
	fragmentShader: [
		'uniform sampler2D Velocity;',
		'uniform sampler2D Pressure;',
		'uniform sampler2D Obstacles;',
		'uniform vec2 InverseSize;',
		'uniform float GradientScale;',
		'uniform float ObstacleThreshold;',
		'varying vec2 vUv;',
		'void main()',
		'{',
		'   vec2 fragCoord = gl_FragCoord.xy;',
		'    ',
		'    vec2 cN = (fragCoord + vec2(0.0, 1.0)) * InverseSize;',
		'    vec2 cS = (fragCoord + vec2(0.0, -1.0)) * InverseSize;',
		'    vec2 cE = (fragCoord + vec2(1.0, 0.0)) * InverseSize;',
		'    vec2 cW = (fragCoord + vec2(-1.0, 0.0)) * InverseSize;',
		'    // Find neighboring obstacles:',
		'    vec4 oN = texture2D(Obstacles, cN);',
		'    vec4 oS = texture2D(Obstacles, cS);',
		'    vec4 oE = texture2D(Obstacles, cE);',
		'    vec4 oW = texture2D(Obstacles, cW);',
		'    ',
		'    // Find neighboring pressure:',
		'    float pN;',
		'    float pS;',
		'    float pE;',
		'    float pW;',
		'    ',
		'    // Use center pressure for solid cells:',
		'    vec2 obstV = vec2(0.0);',
		'    vec2 vMask = vec2(1.0);',
		'    float pC = texture2D(Pressure, vUv).r;',
		'    if(oN.a >= ObstacleThreshold) { pN = pC; obstV.g = oN.b; vMask.g = 0.0; } else pN = texture2D(Pressure, cN).r;',
		'    if(oS.a >= ObstacleThreshold) { pS = pC; obstV.g = oS.b; vMask.g = 0.0; } else pS = texture2D(Pressure, cS).r; ',
		'    if(oE.a >= ObstacleThreshold) { pE = pC; obstV.r = oE.g; vMask.r = 0.0; } else pE = texture2D(Pressure, cE).r; ',
		'    if(oW.a >= ObstacleThreshold) { pW = pC; obstV.r = oW.g; vMask.r = 0.0; } else pW = texture2D(Pressure, cW).r; ',
		'    // Enforce the free-slip boundary condition:',
		'    vec2 oldV = texture2D(Velocity, vUv).rg;',
		'    vec2 grad = vec2(pE - pW, pN - pS) * GradientScale;',
		'    vec2 newV = oldV - grad;',
		'    gl_FragColor = vec4((vMask * newV) + obstV, 0.0, 1.0);',
		'}'].join("\n")
};
dm.Fluids.Shaders.Visualize = {
	uniforms: THREE.UniformsUtils.merge([
		{
		"Sampler" : { type: "t", value: null },
		"FillColor" : { type: "v3", value: new THREE.Vector3( 0, 0, 0 ) },
		}
	]),
	vertexShader: [
		'varying vec2 vUv;',
		'void main()	{',
		'    vUv = uv;',
		'	gl_Position = vec4( position, 1.0 );',
		'}'].join("\n"),
	fragmentShader: [
		'uniform sampler2D Sampler;',
		'uniform vec3 FillColor;',
		'varying vec2 vUv;',
		'void main()',
		'{',
		'  float L = texture2D(Sampler, vUv).r;',
		'  gl_FragColor = vec4(FillColor, L);',
		'}'].join("\n")
};
