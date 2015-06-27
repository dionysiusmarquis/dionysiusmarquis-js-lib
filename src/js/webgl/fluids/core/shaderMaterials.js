if(typeof dm === "undefined") dm = new Object();
if(typeof dm.Fluids === "undefined") dm.Fluids = new Object();

dm.Fluids.ShaderMaterials = new Object();

dm.Fluids.ShaderMaterials.Advect = function(settings, textures) {
	
	THREE.ShaderMaterial.call(this, dm.Fluids.Shaders.Advect);

	this.update = function(settings, textures) {
		this.uniforms.VelocityTexture.value 	= textures.velocity.texture;
		this.uniforms.SourceTexture.value		= textures.velocity.texture;
		this.uniforms.Obstacles.value			= textures.obstacles.texture;
		this.uniforms.InverseSize.value			= settings.inverseSize;
		this.uniforms.TimeStep.value			= settings.timeStep;
		this.uniforms.Dissipation.value			= settings.velocityDissipation;
		this.uniforms.ObstacleThreshold.value	= settings.obstacleThreshold;
	};

	this.update(settings, textures);
};
dm.Fluids.ShaderMaterials.Advect.prototype = Object.create(THREE.ShaderMaterial.prototype);


dm.Fluids.ShaderMaterials.Buoyancy = function(settings, textures) {

	THREE.ShaderMaterial.call(this, dm.Fluids.Shaders.Buoyancy);

	this.update = function(settings, textures) {
		this.uniforms.Velocity.value 			= textures.velocity.texture;
		this.uniforms.Temperature.value			= textures.temperature.texture;
		this.uniforms.Density.value				= textures.density.texture;
		this.uniforms.AmbientTemperature.value	= settings.ambientTemperature;
		this.uniforms.TimeStep.value			= settings.timeStep;
		this.uniforms.Sigma.value				= settings.smokeBuoyancy;
		this.uniforms.Kappa.value				= settings.smokeWeight;
	};
	
	this.update(settings, textures);
};
dm.Fluids.ShaderMaterials.Buoyancy.prototype = Object.create(THREE.ShaderMaterial.prototype);


dm.Fluids.ShaderMaterials.ApplyImpulse = function(settings, textures) {
	
	THREE.ShaderMaterial.call(this, dm.Fluids.Shaders.Splat);

	this.update = function(settings, textures) {
		this.uniforms.Sampler.value 		= textures.density.texture;
		this.uniforms.Point.value			= settings.circleImpulsePosition;
		this.uniforms.Radius.value			= settings.splatRadius;
		this.uniforms.FillColor.value		= settings.impulseTemperature;
	};
	
	this.update(settings, textures);
	
};
dm.Fluids.ShaderMaterials.ApplyImpulse.prototype = Object.create(THREE.ShaderMaterial.prototype);


dm.Fluids.ShaderMaterials.ComputeDivergence = function(settings, textures) {
	
	THREE.ShaderMaterial.call(this, dm.Fluids.Shaders.ComputeDivergence);

	this.update = function(settings, textures) {
		this.uniforms.Velocity.value 				= textures.velocity.texture;
		this.uniforms.Obstacles.value				= textures.obstacles.texture;
		this.uniforms.InverseSize.value				= settings.inverseSize;
		this.uniforms.HalfInverseCellSize.value		= 0.5 / settings.cellSize;
		this.uniforms.ObstacleThreshold.value		= settings.obstacleThreshold;
	};
	
	this.update(settings, textures);
	
};
dm.Fluids.ShaderMaterials.ComputeDivergence.prototype = Object.create(THREE.ShaderMaterial.prototype);


dm.Fluids.ShaderMaterials.Jacobi = function(settings, textures) {
	
	THREE.ShaderMaterial.call(this, dm.Fluids.Shaders.Jacobi);

	this.update = function(settings, textures) {
		this.uniforms.Pressure.value 			= textures.pressure.texture;
		this.uniforms.Divergence.value			= textures.divergence.texture;
		this.uniforms.Obstacles.value			= textures.obstacles.texture;
		this.uniforms.InverseSize.value			= settings.inverseSize;
		this.uniforms.Alpha.value				= -settings.cellSize * settings.cellSize;
		this.uniforms.InverseBeta.value			= 0.25;
		this.uniforms.ObstacleThreshold.value	= settings.obstacleThreshold;
	};
	
	this.update(settings, textures);

};
dm.Fluids.ShaderMaterials.Jacobi.prototype = Object.create(THREE.ShaderMaterial.prototype);


dm.Fluids.ShaderMaterials.SubtractGradient = function(settings, textures) {
	
	THREE.ShaderMaterial.call(this, dm.Fluids.Shaders.SubtractGradient);

	this.update = function(settings, textures) {
		this.uniforms.Velocity.value 			= textures.velocity.texture;
		this.uniforms.Pressure.value			= textures.pressure.texture;
		this.uniforms.Obstacles.value			= textures.obstacles.texture;
		this.uniforms.InverseSize.value			= settings.inverseSize;
		this.uniforms.GradientScale.value		= settings.gradientScale;
		this.uniforms.ObstacleThreshold.value	= settings.obstacleThreshold;
	};
	
	this.update(settings, textures);

};
dm.Fluids.ShaderMaterials.SubtractGradient.prototype = Object.create(THREE.ShaderMaterial.prototype);


dm.Fluids.ShaderMaterials.Boundary = function(settings, textures) {
	
	THREE.ShaderMaterial.call(this, dm.Fluids.Shaders.Boundary);

	this.update = function(settings, textures) {
		// this.uniforms.Sampler.value 		= textures.obstacles.texture;
		this.uniforms.Color.value			= new THREE.Vector4(0, 0, 0, 1);
		this.uniforms.Boundary.value		= [settings.boundaryTop, settings.boundaryRight, settings.boundaryBottom, settings.boundaryLeft];
		this.uniforms.InverseSize.value		= settings.inverseSize;
	};
	
	this.update(settings, textures);

};
dm.Fluids.ShaderMaterials.Boundary.prototype = Object.create(THREE.ShaderMaterial.prototype);


dm.Fluids.ShaderMaterials.Vignette = function(settings, textures) {
	
	THREE.ShaderMaterial.call(this, dm.ShaderLib.Vignette);

	this.update = function(settings, textures) {
		this.uniforms.tDiffuse.value 		= textures.density.texture;
		this.uniforms.size.value 			= settings.vignetteSize;
		this.uniforms.softness.value 		= settings.vignetteSoftness;
		this.uniforms.scale.value 			= settings.vignetteScale;
		this.uniforms.offset.value 			= settings.vignetteOffset;
		this.uniforms.debug.value 			= settings.vignetteDebug;
	};
	
	this.update(settings, textures);

};
dm.Fluids.ShaderMaterials.Vignette.prototype = Object.create(THREE.ShaderMaterial.prototype);


dm.Fluids.ShaderMaterials.Visualize = function(settings, textures) {
	
	THREE.ShaderMaterial.call(this, dm.Fluids.Shaders.Visualize);

	this.update = function(settings, textures) {
		this.uniforms.Sampler.value 		= textures.density.texture;
		this.uniforms.FillColor.value		= new THREE.Vector3(1.0, 1.0, 1.0);
	};
	
	this.update(settings, textures);

};
dm.Fluids.ShaderMaterials.Visualize.prototype = Object.create(THREE.ShaderMaterial.prototype);