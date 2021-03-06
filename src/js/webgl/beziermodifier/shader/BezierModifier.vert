uniform vec2 size;
uniform vec3 center;

uniform bool respectBounds;

uniform vec3 anchorTL;
uniform vec3 controlTLH;
uniform vec3 controlTLV;

uniform vec3 anchorTR;
uniform vec3 controlTRH;
uniform vec3 controlTRV;

uniform vec3 anchorBL;
uniform vec3 controlBLH;
uniform vec3 controlBLV;

uniform vec3 anchorBR;
uniform vec3 controlBRH;
uniform vec3 controlBRV;

uniform int debugMode;

varying vec2 vUv;
varying vec3 vNormal;

vec3 rotateVector(vec4 quat, vec3 vec) {
	return vec + 2.0 * cross( cross( vec, quat.xyz ) + quat.w * vec, quat.xyz );
}

vec4 quatBetweenVectors(vec3 u, vec3 v) {
	vec3 w = cross(u, v);
	vec4 q = vec4(1.0 + dot(u, v), w.x, w.y, w.z);
	return normalize(q);
}

vec3 interpolate(vec3 v1, vec3 v2, float f) {
	return v1 + (v2 - v1) * f;
}

vec3 bezierDerivative(vec3 anchor1, vec3 control1, vec3 anchor2, vec3 control2, float t) {
	vec3 a = 3.0 * ( control1 - anchor1 );
	vec3 b = 3.0 * ( control2 - control1 );
	vec3 c = 3.0 * ( anchor2 - control2 );
	return a * pow( 1.0 - t, 2.0 ) + 2.0 * b * (1.0 - t) * t + 3.0 * c * pow( t, 2.0 );
}

vec3 bezier(vec3 anchor1, vec3 control1, vec3 anchor2, vec3 control2, float t) {
	return pow( t, 3.0 ) * ( anchor2 + 3.0 * ( control1 - control2 ) - anchor1 ) + 3.0 * pow( t, 2.0 ) * ( anchor1 - 2.0 * control1 + control2 ) + 3.0 * t * ( control1 - anchor1 ) + anchor1;
}

void main()	{

	vec2 t;
	vec3 displacedPostion;

	#ifdef MODE_SIZE
		t = (position.xy + size / 2.0 - center.xy) / size;
	#elif defined(MODE_UV)
		t = uv;
	#endif

	vec3 anchorH1 = bezier(anchorBL, controlBLH, anchorBR, controlBRH, t.x);
	vec3 anchorH2 = bezier(anchorTL, controlTLH, anchorTR, controlTRH, t.x);

	vec3 controlH1 = bezier(controlBLV, controlBLH + (controlBLV - anchorBL), controlBRV, controlBRH + (controlBRV - anchorBR), t.x);
	vec3 controlH2 = bezier(controlTLV, controlTLH + (controlTLV - anchorTL), controlTRV, controlTRH + (controlTRV - anchorTR), t.x);
	// vec3 controlH1 = interpolate(controlBLV, controlBRV, t.x);
	// vec3 controlH2 = interpolate(controlTLV, controlTRV, t.x);


	vec3 anchorV1 = bezier(anchorBL, controlBLV, anchorTL, controlTLV, t.y);
	vec3 anchorV2 = bezier(anchorBR, controlBRV, anchorTR, controlTRV, t.y);

	vec3 controlV1 = bezier(controlBLH, controlBLV + (controlBLH - anchorBL), controlTLH, controlTLV + (controlTLH - anchorTL), t.y);
	vec3 controlV2 = bezier(controlBRH, controlBRV + (controlBRH - anchorBR), controlTRH, controlTRV + (controlTRH - anchorTR), t.y);
	// vec3 controlV1 = interpolate(controlBLH, controlTLH, t.y);
	// vec3 controlV2 = interpolate(controlBRH, controlTRH, t.y);

	vec3 bezierPosition = bezier(anchorV1, controlV1, anchorV2, controlV2, t.x);
	// vec3 bezierPosition = bezier(anchorH1, controlH1, anchorH2, controlH2, t.y);

	// debug = bezierPosition;


	#ifdef MODE_SIZE
		bool inBounds = t.x > 0.0 && t.y > 0.0 && t.x < 1.0 && t.y < 1.0;
		if(!respectBounds || inBounds)
			bezierPosition.z += position.z - center.z;
		else
			bezierPosition = position;
	#elif defined(MODE_UV)
		bezierPosition.xy -= t;
		bezierPosition += position;
	#endif

	// normal += 1.0 - pow(dot(position, bezierPosition), 5.0);

	vec3 debug;

	vec3 derivativeH;
	vec4 derivativeHQuat;
	vec3 rotatedNormalH;

	vec3 derivativeV;
	vec4 derivativeVQuat;
	vec3 rotatedNormalV;

	if(normal.x == 1.0 || normal.x == -1.0) {
		derivativeH = vec3(1.0, 0.0, 0.0);
		rotatedNormalH = normal;
	} else {
		derivativeH = normalize(bezierDerivative(anchorV1, controlV1, anchorV2, controlV2, t.x + .01));
		derivativeHQuat = quatBetweenVectors(vec3(1.0, 0.0, 0.0), derivativeH) * vec4(1.0, 1.0, -1.0, 1.0);

		rotatedNormalH = normalize(rotateVector(derivativeHQuat.zyxw, normal));
		rotatedNormalH *= vec3(-1.0, -1.0, 1.0);
	}
	
	if(normal.y == 1.0 || normal.y == -1.0) {
		derivativeV = vec3(0.0, 1.0, 0.0);
		rotatedNormalV = normal;
	} else {
		derivativeV = normalize(bezierDerivative(anchorH1, controlH1, anchorH2, controlH2, t.y));
		derivativeVQuat = quatBetweenVectors(vec3(0.0, 1.0, 0.0), derivativeV) * vec4(-1.0, 1.0, -1.0, 1.0);

		rotatedNormalV = normalize(rotateVector(derivativeVQuat.zyxw, normal));
		rotatedNormalV *= vec3(-1.0, 1.0, 1.0);
	}

	if(debugMode == 0)
		debug = normal;
	else if(debugMode == 1)
		debug = derivativeH;
	else
		debug = rotatedNormalH;
	// debug = mix(rotatedNormalV, rotatedNormalH, .5);

	// vec3 rotatedNormal = vec3(rotatedNormalH.x, rotatedNormalV.y, normal.z);

	vNormal = (debug + 1.0) / 2.0;
	vUv = uv;

	// vNormal = debug;

	gl_Position = projectionMatrix * modelViewMatrix * vec4(bezierPosition, 1.0 );
}