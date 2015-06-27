uniform vec4 color;
uniform bool premultiplied;

uniform sampler2D tDiffuse;
varying vec2 vUv;

void main()
{
    float texAlpha = color.a * texture2D(tDiffuse, vUv).a;
    
    if(premultiplied)
    	gl_FragColor = vec4(color.rgb * texAlpha, texAlpha);
    else
    	gl_FragColor = vec4(color.rgb, texAlpha);
}