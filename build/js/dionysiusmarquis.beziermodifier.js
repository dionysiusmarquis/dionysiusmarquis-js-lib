if(typeof dm === "undefined") dm = new Object();
/**
 * @requires dm/namespaces.js
 */

if(typeof dm.ShaderLib === "undefined") dm.ShaderLib = new Object();
if(typeof dm.Fluids === "undefined") dm.Fluids = new Object();
if(typeof dm.Fluids.Shaders === "undefined") dm.Fluids.Shaders = new Object();
if(typeof dm.Fluids.ShaderMaterials === "undefined") dm.Fluids.ShaderMaterials = new Object();;
/**
 * @requires dm/namespaces.js
 * @requires dm/webgl/namespaces.js
 */

dm.ShaderLib.BezierModifier = {
	uniforms: THREE.UniformsUtils.merge([
		{
		"size" : { type: "v2", value: new THREE.Vector2( 0, 0 ) },
		"center" : { type: "v3", value: new THREE.Vector3( 0, 0, 0 ) },
		"respectBounds" : { type: "i", value: 0 },
		"anchorTL" : { type: "v3", value: new THREE.Vector3( 0, 0, 0 ) },
		"controlTLH" : { type: "v3", value: new THREE.Vector3( 0, 0, 0 ) },
		"controlTLV" : { type: "v3", value: new THREE.Vector3( 0, 0, 0 ) },
		"anchorTR" : { type: "v3", value: new THREE.Vector3( 0, 0, 0 ) },
		"controlTRH" : { type: "v3", value: new THREE.Vector3( 0, 0, 0 ) },
		"controlTRV" : { type: "v3", value: new THREE.Vector3( 0, 0, 0 ) },
		"anchorBL" : { type: "v3", value: new THREE.Vector3( 0, 0, 0 ) },
		"controlBLH" : { type: "v3", value: new THREE.Vector3( 0, 0, 0 ) },
		"controlBLV" : { type: "v3", value: new THREE.Vector3( 0, 0, 0 ) },
		"anchorBR" : { type: "v3", value: new THREE.Vector3( 0, 0, 0 ) },
		"controlBRH" : { type: "v3", value: new THREE.Vector3( 0, 0, 0 ) },
		"controlBRV" : { type: "v3", value: new THREE.Vector3( 0, 0, 0 ) },
		"debugMode" : { type: "i", value: 0 },
		"tDiffuse" : { type: "t", value: null },
		}
	]),
	vertexShader: [
		'uniform vec2 size;',
		'uniform vec3 center;',
		'uniform bool respectBounds;',
		'uniform vec3 anchorTL;',
		'uniform vec3 controlTLH;',
		'uniform vec3 controlTLV;',
		'uniform vec3 anchorTR;',
		'uniform vec3 controlTRH;',
		'uniform vec3 controlTRV;',
		'uniform vec3 anchorBL;',
		'uniform vec3 controlBLH;',
		'uniform vec3 controlBLV;',
		'uniform vec3 anchorBR;',
		'uniform vec3 controlBRH;',
		'uniform vec3 controlBRV;',
		'uniform int debugMode;',
		'varying vec2 vUv;',
		'varying vec3 vNormal;',
		'vec3 rotateVector(vec4 quat, vec3 vec) {',
		'	return vec + 2.0 * cross( cross( vec, quat.xyz ) + quat.w * vec, quat.xyz );',
		'}',
		'vec4 quatBetweenVectors(vec3 u, vec3 v) {',
		'	vec3 w = cross(u, v);',
		'	vec4 q = vec4(1.0 + dot(u, v), w.x, w.y, w.z);',
		'	return normalize(q);',
		'}',
		'vec3 interpolate(vec3 v1, vec3 v2, float f) {',
		'	return v1 + (v2 - v1) * f;',
		'}',
		'vec3 bezierDerivative(vec3 anchor1, vec3 control1, vec3 anchor2, vec3 control2, float t) {',
		'	vec3 a = 3.0 * ( control1 - anchor1 );',
		'	vec3 b = 3.0 * ( control2 - control1 );',
		'	vec3 c = 3.0 * ( anchor2 - control2 );',
		'	return a * pow( 1.0 - t, 2.0 ) + 2.0 * b * (1.0 - t) * t + 3.0 * c * pow( t, 2.0 );',
		'}',
		'vec3 bezier(vec3 anchor1, vec3 control1, vec3 anchor2, vec3 control2, float t) {',
		'	return pow( t, 3.0 ) * ( anchor2 + 3.0 * ( control1 - control2 ) - anchor1 ) + 3.0 * pow( t, 2.0 ) * ( anchor1 - 2.0 * control1 + control2 ) + 3.0 * t * ( control1 - anchor1 ) + anchor1;',
		'}',
		'void main()	{',
		'	vec2 t;',
		'	vec3 displacedPostion;',
		'	#ifdef MODE_SIZE',
		'		t = (position.xy + size / 2.0 - center.xy) / size;',
		'	#elif defined(MODE_UV)',
		'		t = uv;',
		'	#endif',
		'	vec3 anchorH1 = bezier(anchorBL, controlBLH, anchorBR, controlBRH, t.x);',
		'	vec3 anchorH2 = bezier(anchorTL, controlTLH, anchorTR, controlTRH, t.x);',
		'	vec3 controlH1 = bezier(controlBLV, controlBLH + (controlBLV - anchorBL), controlBRV, controlBRH + (controlBRV - anchorBR), t.x);',
		'	vec3 controlH2 = bezier(controlTLV, controlTLH + (controlTLV - anchorTL), controlTRV, controlTRH + (controlTRV - anchorTR), t.x);',
		'	// vec3 controlH1 = interpolate(controlBLV, controlBRV, t.x);',
		'	// vec3 controlH2 = interpolate(controlTLV, controlTRV, t.x);',
		'	vec3 anchorV1 = bezier(anchorBL, controlBLV, anchorTL, controlTLV, t.y);',
		'	vec3 anchorV2 = bezier(anchorBR, controlBRV, anchorTR, controlTRV, t.y);',
		'	vec3 controlV1 = bezier(controlBLH, controlBLV + (controlBLH - anchorBL), controlTLH, controlTLV + (controlTLH - anchorTL), t.y);',
		'	vec3 controlV2 = bezier(controlBRH, controlBRV + (controlBRH - anchorBR), controlTRH, controlTRV + (controlTRH - anchorTR), t.y);',
		'	// vec3 controlV1 = interpolate(controlBLH, controlTLH, t.y);',
		'	// vec3 controlV2 = interpolate(controlBRH, controlTRH, t.y);',
		'	vec3 bezierPosition = bezier(anchorV1, controlV1, anchorV2, controlV2, t.x);',
		'	// vec3 bezierPosition = bezier(anchorH1, controlH1, anchorH2, controlH2, t.y);',
		'	// debug = bezierPosition;',
		'	#ifdef MODE_SIZE',
		'		bool inBounds = t.x > 0.0 && t.y > 0.0 && t.x < 1.0 && t.y < 1.0;',
		'		if(!respectBounds || inBounds)',
		'			bezierPosition.z += position.z - center.z;',
		'		else',
		'			bezierPosition = position;',
		'	#elif defined(MODE_UV)',
		'		bezierPosition.xy -= t;',
		'		bezierPosition += position;',
		'	#endif',
		'	// normal += 1.0 - pow(dot(position, bezierPosition), 5.0);',
		'	vec3 debug;',
		'	vec3 derivativeH;',
		'	vec4 derivativeHQuat;',
		'	vec3 rotatedNormalH;',
		'	vec3 derivativeV;',
		'	vec4 derivativeVQuat;',
		'	vec3 rotatedNormalV;',
		'	if(normal.x == 1.0 || normal.x == -1.0) {',
		'		derivativeH = vec3(1.0, 0.0, 0.0);',
		'		rotatedNormalH = normal;',
		'	} else {',
		'		derivativeH = normalize(bezierDerivative(anchorV1, controlV1, anchorV2, controlV2, t.x + .01));',
		'		derivativeHQuat = quatBetweenVectors(vec3(1.0, 0.0, 0.0), derivativeH) * vec4(1.0, 1.0, -1.0, 1.0);',
		'		rotatedNormalH = normalize(rotateVector(derivativeHQuat.zyxw, normal));',
		'		rotatedNormalH *= vec3(-1.0, -1.0, 1.0);',
		'	}',
		'	',
		'	if(normal.y == 1.0 || normal.y == -1.0) {',
		'		derivativeV = vec3(0.0, 1.0, 0.0);',
		'		rotatedNormalV = normal;',
		'	} else {',
		'		derivativeV = normalize(bezierDerivative(anchorH1, controlH1, anchorH2, controlH2, t.y));',
		'		derivativeVQuat = quatBetweenVectors(vec3(0.0, 1.0, 0.0), derivativeV) * vec4(-1.0, 1.0, -1.0, 1.0);',
		'		rotatedNormalV = normalize(rotateVector(derivativeVQuat.zyxw, normal));',
		'		rotatedNormalV *= vec3(-1.0, 1.0, 1.0);',
		'	}',
		'	if(debugMode == 0)',
		'		debug = normal;',
		'	else if(debugMode == 1)',
		'		debug = derivativeH;',
		'	else',
		'		debug = rotatedNormalH;',
		'	// debug = mix(rotatedNormalV, rotatedNormalH, .5);',
		'	// vec3 rotatedNormal = vec3(rotatedNormalH.x, rotatedNormalV.y, normal.z);',
		'	vNormal = (debug + 1.0) / 2.0;',
		'	vUv = uv;',
		'	// vNormal = debug;',
		'	gl_Position = projectionMatrix * modelViewMatrix * vec4(bezierPosition, 1.0 );',
		'}'].join("\n"),
	fragmentShader: [
		'uniform sampler2D tDiffuse;',
		'varying vec2 vUv;',
		'varying vec3 vNormal;',
		'void main() {',
		'	vec4 color = texture2D(tDiffuse, vUv);',
		'	float f;',
		'	if(color.r == 0.0 && color.g == 0.0 && color.b == 0.0)',
		'		gl_FragColor = vec4(vNormal, 1.0);',
		'	else',
		'		gl_FragColor = color;',
		'}'].join("\n")
};

/**
* @requires dm/namespaces.js
* @requires dm/webgl/namespaces.js
* @requires dm/webgl/beziermodifier/shaders.js
*/

dm.BezierModifier = function(target, mode, width, height, center) {

	mode = mode || dm.BezierModifier.MODE_SIZE;

	var size = new THREE.Vector2(width, height);

	if(!width || !height) {
		var boundingBox = new THREE.Box3().setFromObject(target);
		var boundingBoxSize = boundingBox.size();

		size.x = boundingBoxSize.x;
		size.y = boundingBoxSize.y;

		center = boundingBox.center();
	} else if (!center) {
		center = new THREE.Vector3(0.0, 0.0, 0.0, 0.0);
	}

	center.sub(target.position);

	this.controlPoints = new dm.BezierModifierControlPoints(mode, size, center);
	target.add(this.controlPoints);

	this.material = new THREE.ShaderMaterial(dm.ShaderLib.BezierModifier);
	this.material.side = THREE.DoubleSide;
	this.material.uniforms = THREE.UniformsUtils.clone(this.material.uniforms);

	target.material = this.material;

	this.material.uniforms.size.value			= size;
	this.material.uniforms.center.value			= center;
	this.material.uniforms.respectBounds.value	= 0;
	this.material.uniforms.tDiffuse.value		= null;

	this.material.uniforms.anchorTL.value	= this.controlPoints.topLeft.getAnchorPosition();
	this.material.uniforms.controlTLH.value	= this.controlPoints.topLeft.getControlHPosition();
	this.material.uniforms.controlTLV.value	= this.controlPoints.topLeft.getControlVPosition();

	this.material.uniforms.anchorTR.value	= this.controlPoints.topRight.getAnchorPosition();
	this.material.uniforms.controlTRH.value	= this.controlPoints.topRight.getControlHPosition();
	this.material.uniforms.controlTRV.value	= this.controlPoints.topRight.getControlVPosition();

	this.material.uniforms.anchorBL.value	= this.controlPoints.bottomLeft.getAnchorPosition();
	this.material.uniforms.controlBLH.value	= this.controlPoints.bottomLeft.getControlHPosition();
	this.material.uniforms.controlBLV.value	= this.controlPoints.bottomLeft.getControlVPosition();

	this.material.uniforms.anchorBR.value	= this.controlPoints.bottomRight.getAnchorPosition();
	this.material.uniforms.controlBRH.value	= this.controlPoints.bottomRight.getControlHPosition();
	this.material.uniforms.controlBRV.value	= this.controlPoints.bottomRight.getControlVPosition();

	this.setCenter = function(x, y, z) {
		if(x !== undefined) center.x = x;
		if(y !== undefined) center.y = y;
		if(z !== undefined) center.z = z;

		this.controlPoints.reset(size, center);
	};

	this.setSize = function(width, height) {
		size.x = width;
		size.y = height;

		this.controlPoints.reset(size, center);
	};

	this.setMode = function(mode) {
		this.material.defines[mode] = "";
	};

	this.setMode(mode);
};
dm.BezierModifier.prototype = Object.create(THREE.ShaderMaterial.prototype);

dm.BezierModifier.MODE_UV 	= "MODE_UV";
dm.BezierModifier.MODE_SIZE = "MODE_SIZE";


dm.BezierModifierControlPoints = function(mode, size, center) {
	THREE.Object3D.call(this);

	this.topLeft = new dm.BezierModifierControlPoint();
	this.topRight = new dm.BezierModifierControlPoint();
	this.bottomLeft = new dm.BezierModifierControlPoint();
	this.bottomRight = new dm.BezierModifierControlPoint();

	var controlPoints = [this.topLeft, this.topRight, this.bottomLeft, this.bottomRight];

	this.add(this.topLeft);
	this.add(this.topRight);
	this.add(this.bottomLeft);
	this.add(this.bottomRight);

	console.log(center);

	// center = new THREE.Vector3();

	this.reset = function(size, center) {
		var w;
		var h;

		switch(mode) {
			case dm.BezierModifier.MODE_SIZE:
				w = size.x;
				h = size.y;
				break;

			case dm.BezierModifier.MODE_UV:
				w = 1;
				h = 1;
				break;
		}

		var third  = 1 / 3;
		var sixth  = third * 2;
		
		this.topLeft.anchor.x = 0;
		this.topLeft.anchor.y = h;
		this.topLeft.anchor.z = 0;
		this.topLeft.controlH.x = w * third;
		this.topLeft.controlH.y = h;
		this.topLeft.controlH.z = 0;
		this.topLeft.controlV.x = 0;
		this.topLeft.controlV.y = h * sixth;
		this.topLeft.controlV.z = 0;
		
		this.topRight.anchor.x = w;
		this.topRight.anchor.y = h;
		this.topRight.anchor.z = 0;
		this.topRight.controlH.x = w * sixth;
		this.topRight.controlH.y = h;
		this.topRight.controlH.z = 0;
		this.topRight.controlV.x = w;
		this.topRight.controlV.y = h * sixth;
		this.topRight.controlV.z = 0;
		
		this.bottomLeft.anchor.x = 0;
		this.bottomLeft.anchor.y = 0;
		this.bottomLeft.anchor.z = 0;
		this.bottomLeft.controlH.x = w * third;
		this.bottomLeft.controlH.y = 0;
		this.bottomLeft.controlH.z = 0;
		this.bottomLeft.controlV.x = 0;
		this.bottomLeft.controlV.y = h * third;
		this.bottomLeft.controlV.z = 0;
		
		this.bottomRight.anchor.x = w;
		this.bottomRight.anchor.y = 0;
		this.bottomRight.anchor.z = 0;
		this.bottomRight.controlH.x = w * sixth;
		this.bottomRight.controlH.y = 0;
		this.bottomRight.controlH.z = 0;
		this.bottomRight.controlV.x = w;
		this.bottomRight.controlV.y = h * third;
		this.bottomRight.controlV.z = 0;

		switch(mode) {
			case dm.BezierModifier.MODE_SIZE:
				var i, controlPoint;
				for (i = 0; i < controlPoints.length; i++) {
					controlPoint = controlPoints[i];
					controlPoint.anchor.x -= w * .5 - center.x;
					controlPoint.anchor.y -= h * .5 - center.y;
					controlPoint.anchor.z += center.z;
					controlPoint.controlH.x -= w * .5 - center.x;
					controlPoint.controlH.y -= h * .5 - center.y;
					controlPoint.controlH.z += center.z;
					controlPoint.controlV.x -= w * .5 - center.x;
					controlPoint.controlV.y -= h * .5 - center.y;
					controlPoint.controlV.z += center.z;
				}
				break;

			case dm.BezierModifier.MODE_UV:
				this.scale.set(size.x, size.y, 1.0);
				this.position.set(- size.x * .5 - center.x, - size.y * .5 - center.y, center.z);
				break;
		}

		this.update();
	};

	this.update = function() {
		this.topLeft.update();
		this.topRight.update();
		this.bottomLeft.update();
		this.bottomRight.update();
	};

	this.reset(size, center);
};
dm.BezierModifierControlPoints.prototype = Object.create(THREE.Object3D.prototype);

dm.BezierModifierControlPoint = function() {
	THREE.Object3D.call(this);
	var self = this;

	var anchorPosition = new THREE.Vector3();
	var controlHPosition = new THREE.Vector3();
	var controlVPosition = new THREE.Vector3();

	this.anchor = new THREE.Vector3();
	this.controlH = new THREE.Vector3();
	this.controlV = new THREE.Vector3();

	this.anchorOffset = new THREE.Vector3();
	this.controlHOffset = new THREE.Vector3();
	this.controlVOffset = new THREE.Vector3();

	var hLineGeometry = new THREE.Geometry();
	hLineGeometry.dynamic = true;
	var vLineGeometry = new THREE.Geometry();
	vLineGeometry.dynamic = true;
	var pointsGeometry = new THREE.Geometry();
	pointsGeometry.dynamic = true;

	hLineGeometry.vertices[0] = anchorPosition;
	hLineGeometry.vertices[1] = controlHPosition;
	
	vLineGeometry.vertices[0] = anchorPosition;
	vLineGeometry.vertices[1] = controlVPosition;

	pointsGeometry.vertices[0] = anchorPosition;
	pointsGeometry.vertices[1] = controlHPosition;
	pointsGeometry.vertices[2] = controlVPosition;

	var hLine = new THREE.Line(hLineGeometry, new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 1 }));
	var vLine = new THREE.Line(vLineGeometry, new THREE.LineBasicMaterial({ color: 0x0000ff, linewidth: 1 }));
	var points = new THREE.PointCloud(pointsGeometry, new THREE.PointCloudMaterial( { color: 0x000000, size: .05 }));

	this.add(hLine);
	this.add(vLine);
	this.add(points);

	this.update = function() {
		anchorPosition.copy(this.anchor.clone().add(this.anchorOffset));
		controlHPosition.copy(this.controlH.clone().add(this.controlHOffset));
		controlVPosition.copy(this.controlV.clone().add(this.controlVOffset));

		vLineGeometry.verticesNeedUpdate = true;
		hLineGeometry.verticesNeedUpdate = true;
		pointsGeometry.verticesNeedUpdate = true;
	};

	this.getAnchorPosition = function() {
		return anchorPosition;
	};

	this.getControlHPosition = function() {
		return controlHPosition;
	};

	this.getControlVPosition = function() {
		return controlVPosition;
	};
};
dm.BezierModifierControlPoint.prototype = Object.create(THREE.Object3D.prototype);