// uniform_ sampler2D Sampler;

uniform vec4 Color;
uniform float Boundary[4];
uniform vec2 InverseSize;

varying vec2 vUv;

void main()
{
	// vec4 outColor = texture2D(Sampler, vUv);

	float bbN = 1.0 - Boundary[0] * InverseSize.y;
	float bbS = Boundary[2] * InverseSize.y;
	float bbE = 1.0 - Boundary[1] * InverseSize.x;
	float bbW = Boundary[3] * InverseSize.x;

    // gl_FragColor = vUv.y > bbN || vUv.y < bbS || vUv.x > bbE || vUv.x < bbW ? mix(outColor, Color, Color.a) : outColor;
    gl_FragColor = vUv.y > bbN || vUv.y < bbS || vUv.x > bbE || vUv.x < bbW ? vec4(Color.rgb * Color.a, Color.a) : vec4(0.0);
}