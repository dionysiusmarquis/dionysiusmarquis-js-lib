uniform sampler2D Velocity;
uniform sampler2D Temperature;
uniform sampler2D Density;

uniform float AmbientTemperature;
uniform float TimeStep;
uniform float Sigma;
uniform float Kappa;

varying vec2 vUv;

void main()
{
    float T = texture2D(Temperature, vUv).r;
    vec2 V = texture2D(Velocity, vUv).xy;

    vec2 outColor = V;

    if (T > AmbientTemperature) {
        float D = texture2D(Density, vUv).x;
        outColor += (TimeStep * (T - AmbientTemperature) * Sigma - D * Kappa ) * vec2(0.0, 1.0);
    }
    
    gl_FragColor = vec4(outColor, 0.0, 1.0);
}