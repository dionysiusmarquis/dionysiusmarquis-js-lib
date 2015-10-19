uniform sampler2D Pressure;
uniform sampler2D Divergence;
uniform sampler2D Obstacles;

uniform vec2 InverseSize;
uniform float Alpha;
uniform float InverseBeta;
uniform float ObstacleThreshold;

varying vec2 vUv;

void main()
{
    vec2 fragCoord = gl_FragCoord.xy;
    
    vec2 cN = (fragCoord + vec2(0.0, 1.0)) * InverseSize;
    vec2 cS = (fragCoord + vec2(0.0, -1.0)) * InverseSize;
    vec2 cE = (fragCoord + vec2(1.0, 0.0)) * InverseSize;
    vec2 cW = (fragCoord + vec2(-1.0, 0.0)) * InverseSize;
    
    // Find neighboring obstacles:
    vec4 oN = texture2D(Obstacles, cN);
    vec4 oS = texture2D(Obstacles, cS);
    vec4 oE = texture2D(Obstacles, cE);
    vec4 oW = texture2D(Obstacles, cW);
    
    // Find neighboring pressure:
    vec4 pN;
    vec4 pS;
    vec4 pE;
    vec4 pW;
    
    // Use center pressure for solid cells:
    vec4 pC = texture2D(Pressure, vUv);

    if(oN.a >= ObstacleThreshold) pN = pC; else pN = texture2D(Pressure, cN); 
    if(oS.a >= ObstacleThreshold) pS = pC; else pS = texture2D(Pressure, cS); 
    if(oE.a >= ObstacleThreshold) pE = pC; else pE = texture2D(Pressure, cE); 
    if(oW.a >= ObstacleThreshold) pW = pC; else pW = texture2D(Pressure, cW); 

    float bC = texture2D(Divergence, vUv).x;
    gl_FragColor = vec4((pW + pE + pN + pS + Alpha * bC) * InverseBeta);
}