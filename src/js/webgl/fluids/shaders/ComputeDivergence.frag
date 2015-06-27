uniform sampler2D Velocity;
uniform sampler2D Obstacles;

uniform vec2 InverseSize;
uniform float HalfInverseCellSize;
uniform float ObstacleThreshold;

void main()
{
    vec2 fragCoord = gl_FragCoord.xy;
    
    // vec2 c = fragCoord * InverseSize;
    vec2 cN = (fragCoord + vec2(0.0, 1.0)) * InverseSize;
    vec2 cS = (fragCoord + vec2(0.0, -1.0)) * InverseSize;
    vec2 cE = (fragCoord + vec2(1.0, 0.0)) * InverseSize;
    vec2 cW = (fragCoord + vec2(-1.0, 0.0)) * InverseSize;
    
    // Find neighboring obstacles:
    vec4 oN = texture2D(Obstacles, cN);
    vec4 oS = texture2D(Obstacles, cS);
    vec4 oE = texture2D(Obstacles, cE);
    vec4 oW = texture2D(Obstacles, cW);
    
    // Find neighboring velocities:
    vec2 vN;
    vec2 vS;
    vec2 vE;
    vec2 vW;

    if(oN.a >= ObstacleThreshold) vN = oN.rg; else vN = texture2D(Velocity, cN).rg;
    if(oS.a >= ObstacleThreshold) vS = oS.rg; else vS = texture2D(Velocity, cS).rg;
    if(oE.a >= ObstacleThreshold) vE = oE.rg; else vE = texture2D(Velocity, cE).rg;
    if(oW.a >= ObstacleThreshold) vW = oW.rg; else vW = texture2D(Velocity, cW).rg;

    gl_FragColor = vec4(HalfInverseCellSize * (vE.r - vW.r + vN.g - vS.g));
  }