if(typeof dm === "undefined") dm = new Object();

dm.SemShaderMaterial = function(materialCapture, usePhong) {

	THREE.ShaderMaterial.call(this, usePhong ? dm.ShaderLib.SemPhong : dm.ShaderLib.Sem );
	this.uniforms = THREE.UniformsUtils.clone(this.uniforms);

	this.uniforms.tMatCap.value = materialCapture;
};
dm.SemShaderMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype);


dm.SemNormalShaderMaterial = function(materialCapture, normalMap) {

	THREE.ShaderMaterial.call(this, dm.ShaderLib.SemNormal);
	this.uniforms = THREE.UniformsUtils.clone(this.uniforms);

	this.uniforms.tNormal.value 		= normalMap;
	this.uniforms.tMatCap.value 		= materialCapture;
	this.uniforms.time.value 			= 0;
	this.uniforms.bump.value 			= 0;
	this.uniforms.noise.value 			= 0.04;
	this.uniforms.repeat.value	 		= new THREE.Vector2( 1, 1 );
	this.uniforms.useNormal.value 		= 0;
	this.uniforms.useRim.value			= 0;
	this.uniforms.rimPower.value		= 2;
	this.uniforms.useScreen.value		= 0;
	this.uniforms.normalScale.value		= 0.5;
	this.uniforms.normalRepeat.value 	= 1;

	this.wrapping = THREE.ClampToEdgeWrapping;
	this.shading = THREE.SmoothShading;
	this.side = THREE.DoubleSide;
};
dm.SemNormalShaderMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype);