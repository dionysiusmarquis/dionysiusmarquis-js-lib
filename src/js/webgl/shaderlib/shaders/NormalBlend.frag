uniform sampler2D Sampler;
uniform sampler2D Sampler2;

varying vec2 vUv;

void main()
{
    vec4 color1 = texture2D(Sampler, vUv);
    vec4 color2 = texture2D(Sampler2, vUv);

    if(color1.a == 0.0 || color2.a >= 1.0)
    	gl_FragColor = color2;
    else if(color2.a == 0.0)
    	gl_FragColor = color1;
    else
		gl_FragColor = vec4(color2.rgb + (1.0 - color2.a) * color1.rgb, color2.a + color1.a - color2.a * color1.a);
}