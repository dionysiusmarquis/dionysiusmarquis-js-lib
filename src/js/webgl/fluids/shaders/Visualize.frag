uniform sampler2D Sampler;
uniform vec3 FillColor;

varying vec2 vUv;

void main()
{
  float L = texture2D(Sampler, vUv).r;
  gl_FragColor = vec4(FillColor, L);
}