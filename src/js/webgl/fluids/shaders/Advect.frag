uniform sampler2D VelocityTexture;
uniform sampler2D SourceTexture;
uniform sampler2D Obstacles;

uniform vec2 InverseSize;
uniform float TimeStep;
uniform float Dissipation;
uniform float ObstacleThreshold;

varying vec2 vUv;

void main()
{
    float solid = texture2D(Obstacles, vUv).a;
    
    if (solid >= ObstacleThreshold) {
        gl_FragColor = vec4(0.0);
        return;
    }
    
    vec2 u = texture2D(VelocityTexture, vUv).xy;
    vec2 coord = InverseSize * (gl_FragCoord.xy - TimeStep * u);
    gl_FragColor = Dissipation * texture2D(SourceTexture, coord);
}