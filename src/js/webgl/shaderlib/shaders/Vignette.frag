uniform float size;
uniform float softness;
uniform vec2 scale;
uniform vec2 offset;
uniform bool debug;

uniform sampler2D tDiffuse;

varying vec2 vUv;

void main() {

	vec4 texColor = texture2D(tDiffuse, vUv);

    vec2 uv = vec2((vUv.x - 0.5 - offset.x) * size * (1.0/scale.x), (vUv.y - 0.5 - offset.y) * size * (1.0/scale.y));
    float vignette = smoothstep(size/4.0, (1.0-softness)*size/4.0, dot( uv, uv ));

    if(debug)
    	gl_FragColor = vec4(0.0, 0.0, 0.0, vignette);
    else
    	gl_FragColor = texColor * vignette;
}
