uniform sampler2D Velocity;
uniform sampler2D Pressure;
uniform sampler2D Obstacles;

uniform vec2 InverseSize;
uniform float GradientScale;
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
    float pN;
    float pS;
    float pE;
    float pW;
    
    // Use center pressure for solid cells:
    vec2 obstV = vec2(0.0);
    vec2 vMask = vec2(1.0);
    float pC = texture2D(Pressure, vUv).r;

    if(oN.a >= ObstacleThreshold) { pN = pC; obstV.g = oN.b; vMask.g = 0.0; } else pN = texture2D(Pressure, cN).r;
    if(oS.a >= ObstacleThreshold) { pS = pC; obstV.g = oS.b; vMask.g = 0.0; } else pS = texture2D(Pressure, cS).r; 
    if(oE.a >= ObstacleThreshold) { pE = pC; obstV.r = oE.g; vMask.r = 0.0; } else pE = texture2D(Pressure, cE).r; 
    if(oW.a >= ObstacleThreshold) { pW = pC; obstV.r = oW.g; vMask.r = 0.0; } else pW = texture2D(Pressure, cW).r; 

    // Enforce the free-slip boundary condition:
    vec2 oldV = texture2D(Velocity, vUv).rg;
    vec2 grad = vec2(pE - pW, pN - pS) * GradientScale;
    vec2 newV = oldV - grad;
    gl_FragColor = vec4((vMask * newV) + obstV, 0.0, 1.0);
}