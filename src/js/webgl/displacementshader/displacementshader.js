if(typeof dm === "undefined") dm = new Object();

dm.DisplacementShaderMaterial = function(texture, displacementMap, componentX, componentY, scaleX, scaleY, mode, color, offset) {

	THREE.ShaderMaterial.call(this, dm.ShaderLib.Displacement );
	this.uniforms = THREE.UniformsUtils.clone(this.uniforms);

	this.uniforms.tDiffuse.value = texture;
	this.uniforms.tDisplacement.value = displacementMap;

	this.uniforms.scaleX.value 		= scaleX || .01;
	this.uniforms.scaleY.value 		= scaleY || .01;
	this.uniforms.color.value 		= color || new THREE.Vector4(0.0, 0.0, 0.0, 1.0);
	this.uniforms.offset.value 		= offset || .5;

	this.setMode = function(mode) {
		this.defines = {COMPONENT_X: this.defines.COMPONENT_X, COMPONENT_Y: this.defines.COMPONENT_Y};
		this.defines[mode] = "";
	};

	this.setComponentX = function(componentX) {
		this.defines.COMPONENT_X = componentX;
	};

	this.setComponentY = function(componentY) {
		this.defines.COMPONENT_Y = componentY;
	};

	this.setComponentX(componentX || dm.DisplacementShaderMaterial.CHANNEL_RED);
	this.setComponentY(componentY || dm.DisplacementShaderMaterial.CHANNEL_RED);
	this.setMode(mode || dm.DisplacementShaderMaterial.MODE_WRAP);
};
dm.DisplacementShaderMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype);

dm.DisplacementShaderMaterial.MODE_WRAP 		= "MODE_WRAP";
dm.DisplacementShaderMaterial.MODE_CLAMP 	= "MODE_CLAMP";
dm.DisplacementShaderMaterial.MODE_IGNORE	= "MODE_IGNORE";
dm.DisplacementShaderMaterial.MODE_COLOR		= "MODE_COLOR";

dm.DisplacementShaderMaterial.CHANNEL_RED	= 0;
dm.DisplacementShaderMaterial.CHANNEL_GREEN	= 1;
dm.DisplacementShaderMaterial.CHANNEL_BLUE 	= 2;
dm.DisplacementShaderMaterial.CHANNEL_ALPHA = 3;