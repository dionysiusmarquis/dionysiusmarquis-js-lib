uniform sampler2D Sampler;

uniform vec2 Point;
uniform float Radius;
uniform vec4 FillColor;

varying vec2 vUv;

void main()
{
    float d = distance(Point, gl_FragCoord.xy);
    vec4 color = texture2D(Sampler, vUv);
    
    if (d < Radius) {
        float a = (Radius - d) * 0.5;
        gl_FragColor = vec4(FillColor.rgb * FillColor.a, FillColor.a); 
    } 
    else {
        gl_FragColor = color;
        // gl_FragColor = vec4(0.0);
    }
}