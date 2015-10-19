uniform sampler2D tDiffuse;

varying vec2 vUv;
varying vec3 vNormal;

void main() {
	vec4 color = texture2D(tDiffuse, vUv);
	float f;
	if(color.r == 0.0 && color.g == 0.0 && color.b == 0.0)
		gl_FragColor = vec4(vNormal, 1.0);
	else
		gl_FragColor = color;
}