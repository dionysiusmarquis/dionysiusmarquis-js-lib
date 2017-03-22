uniform sampler2D tDiffuse;
varying vec2 vUv;

void main()
{
    vec4 texColor = texture2D(tDiffuse, vUv);
    gl_FragColor = vec4(texColor.rgb * texColor.a, texColor.a);
}