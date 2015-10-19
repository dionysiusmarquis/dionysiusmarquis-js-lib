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