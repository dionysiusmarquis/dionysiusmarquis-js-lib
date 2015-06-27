if(typeof dm === "undefined") dm = new Object();
if(typeof dm.Fluids === "undefined") dm.Fluids = new Object();

dm.Fluids.Simulator = function(alpha) {
	THREE.WebGLRenderer.call(this, { antialiasing: false, alpha: true, premultipliedAlpha: true });
	var self = this;

	var settings = this.settings = new dm.Fluids.Settings();

	var lastSimulated = new Date().getTime();
	
	var scene;
	var impulseDensityScene;
	var impulseTemperatureScene;
	var obstaclesScene;
	var camera;
	var renderGeometry;
	var renderMesh;
	var densityMesh;
	var temperatureMesh;

	var renderMaterial;

	var textures;
	var shaderMaterials;
	
	var advectShaderMaterial;
	var buoyancyShaderMaterial;
	var applyImpulseShaderMaterial;
	var computeDivergenceShaderMaterial;
	var jacobiShaderMaterial;
	var subtractGradientShaderMaterial;
	var visualizeShaderMaterial;
	var boundaryShaderMaterial;
	var vignetteShaderMaterial;
	var overrideColorShaderMaterial;
	var premultiplyAlphaShaderMaterial;
	var unpremultiplyAlphaShaderMaterial;

	this.impulseObjects = new Array();
	this.obstacleObjects = new Array();

	// this.autoClear = false;
	// this.state.setBlending(THREE.CustomBlending, null, THREE.SrcAlphaFactor, THREE.OneMinusSrcAlphaFactor, null, THREE.OneFactor, THREE.OneFactor);

	this.applyCircleImpulse = false;
	this.applyTextureImpulse = false;

	this.autoClearImpulse = false;
	this.autoClearObstacles = false;

	this.isInitialized = false;
	this.isSupported = Detector.webgl && this.supportsHalfFloatTextures();

	// this.isSupported = false;

	// this.setSize(width, height);

	function addObject(id, type, texture, x, y, width, height, overrideColor, asOverlay) {
		x = x ? x*settings.sampling : 0;
		y = y ? -y*settings.sampling : 0;
		width = width ? width*settings.sampling : texture.image.width*settings.sampling;
		height = height ? height*settings.sampling : texture.image.height*settings.sampling;

		var percWidth = width/settings.width;
		var percHeight = height/settings.height;
		var percX = x/settings.width*2+(percWidth-1);
		var percY = y/settings.height*2+(1-percHeight);

		// overrideColor = false;

		var material;
		if(overrideColor) {
			material = overrideColorShaderMaterial.clone();
			material.uniforms.tDiffuse.value = texture;
			material.uniforms.color.value = overrideColor;
			if(settings.blendImpulse)
				material.uniforms.premultiplied.value = 1;
			else
				material.uniforms.premultiplied.value = 0;
		} else {
			if(settings.blendImpulse) {
				material = new THREE.MeshBasicMaterial();
				material.map = texture;	
			} else {
				material = unpremultiplyAlphaShaderMaterial.clone();
				material.uniforms.tDiffuse.value = texture;
			}
		}


		material.transparent = true;

		var mesh = new THREE.Mesh( renderGeometry, material );
		mesh.userData = id;

		mesh.scale.set(percWidth, percHeight, 1);
		mesh.position.set(percX, percY, 0);

		var targetScene;
		var renderTarget;
		switch(type) {
			case "impulsedensity":
				if(!asOverlay) {
					if(settings.blendImpulse) {
						material.blending = THREE.CustomBlending;
						material.blendSrc = THREE.SrcAlphaFactor;
						material.blendDst = THREE.OneMinusSrcAlphaFactor;
						material.blendEquation = THREE.AddEquation;
					}
				} else {
					mesh.renderOrder = 2;
					material.blending = THREE.AdditiveBlending;
				}
				targetScene = impulseDensityScene;
				// renderTarget = textures.impulseDensity.texture;
				break;
			case "impulsetemperature":
				targetScene = impulseTemperatureScene;
				// renderTarget = textures.impulseTemperature.texture;
				break;
			case "obstacle":
				targetScene = obstaclesScene;
				renderTarget = textures.obstacles.texture;
				break;
			default:
				console.error("Wrong type specified.");
		}

		if(id) {
			var existingObject = self.getObject(id, targetScene);
			if(existingObject) {
				targetScene.remove(existingObject);
			}
		}

		targetScene.add(mesh);
		// targetScene.children.splice(-1, 1);
		// targetScene.children.unshift(mesh);

		// console.log(self.getObject("density", impulseDensityScene));

		if(renderTarget)
			self.render(targetScene, camera, renderTarget);

		return mesh;
	}

	this.getObject = function(id, scene) {
		var i;
		for (i = 0; i < scene.children.length; i++)
			if(scene.children[i].userData == id)
				return scene.children[i];
	};

	this.getObjectIndex = function(id, scene) {
		var i;
		for (i = 0; i < scene.children.length; i++)
			if(scene.children[i].userData == id)
				return i;
	};

	this.addCircleImpulse = function(radius, x, y, temperature, fillColor, asOverlay) {
		return;
		renderMesh.material = applyImpulseShaderMaterial;

		x *= settings.sampling;
		y *= settings.sampling;
		y = settings.height - y;

		var impulseTexture;
		var temperatureTexture;
		if(asOverlay) {
			impulseTexture = textures.impulseOverlay;
			temperatureTexture = textures.impulseOverlayTemperature;
		} else {
			impulseTexture = textures.impulse;
			temperatureTexture = textures.impulseTemperature;
		}

		applyImpulseShaderMaterial.uniforms.Sampler.value = impulseTexture.texture;
		applyImpulseShaderMaterial.uniforms.Point.value = new THREE.Vector2(x, y);
		applyImpulseShaderMaterial.uniforms.Radius.value = radius ? radius * settings.sampling : 50 * settings.sampling;
		applyImpulseShaderMaterial.uniforms.FillColor.value = fillColor || settings.impulseDensity;
		
		this.render(scene, camera, impulseTexture.texture2);
		impulseTexture.swapTexture();

		applyImpulseShaderMaterial.uniforms.Sampler.value = temperatureTexture.texture;
		applyImpulseShaderMaterial.uniforms.FillColor.value = temperature || settings.impulseTemperature;

		this.render(scene, camera, temperatureTexture.texture2);
		temperatureTexture.swapTexture();

		applyImpulseShaderMaterial.uniforms.Point.value = settings.circleImpulsePosition;
		applyImpulseShaderMaterial.uniforms.Radius.value = settings.circleImpulseRadius;
	};

	this.addBoundary = function() {
		// renderMesh.material = boundaryShaderMaterial;

		// boundaryShaderMaterial.uniforms.Sampler.value 	= textures.obstacles.texture;
		// boundaryShaderMaterial.uniforms.Boundary.value 	= [settings.boundaryTop, settings.boundaryRight, settings.boundaryBottom, settings.boundaryLeft];

		// this.render(scene, camera, textures.obstacles.texture2);
		// textures.obstacles.swapTexture();

		// advectShaderMaterial.uniforms.Obstacles.value = textures.obstacles.texture;
		// computeDivergenceShaderMaterial.uniforms.Obstacles.value = textures.obstacles.texture;
		// jacobiShaderMaterial.uniforms.Obstacles.value = textures.obstacles.texture;
		// subtractGradientShaderMaterial.uniforms.Obstacles.value = textures.obstacles.texture;

		boundaryShaderMaterial.uniforms.Boundary.value 	= [settings.boundaryTop, settings.boundaryRight, settings.boundaryBottom, settings.boundaryLeft];

		var mesh = new THREE.Mesh( renderGeometry, boundaryShaderMaterial );
		mesh.userData = "boundary";

		obstaclesScene.add(mesh);

		// this.render(obstaclesScene, camera, textures.obstacles.texture);
	};

	this.addObstacle = function(id, texture, x, y, width, height, overrideColor) {
		addObject(id, "obstacle", texture, x, y, width, height, overrideColor);
	};

	this.addImpulse = function(id, texture, x, y, width, height, temperature, overrideColor) {
		addObject(id, "impulsedensity", texture, x, y, width, height, overrideColor);
		addObject(id, "impulsetemperature", texture, x, y, width, height, temperature || new THREE.Vector4(settings.impulseTemperature.x, settings.impulseTemperature.y, settings.impulseTemperature.z, 1.0));
		// console.log(id, impulseDensityScene.children.length);
	};

	this.addImpulseOverlay = function(id, texture, x, y, width, height, temperature, overrideColor) {
		addObject(id, "impulsedensity", texture, x, y, width, height, overrideColor, true);
		addObject(id, "impulsetemperature", texture, x, y, width, height, temperature || new THREE.Vector4(settings.impulseTemperature.x, settings.impulseTemperature.y, settings.impulseTemperature.z, 1.0), true);
		// console.log(impulseDensityScene.children.length);
	};

	// this.clearImpulse = function(overlay, keep) {
	this.clearImpulse = function(keep) {
		// return;

		keep = keep || new Array(); 

		var i = 0;
		var child;
		while(impulseDensityScene.children.length > i) {
			child = impulseDensityScene.children[i]

			if(child.userData != "density" && keep.indexOf(child.userData) == -1)
				impulseDensityScene.remove(child);
			else
				i++;
		}

		// console.log(impulseDensityScene.children.length);

		i = 0;
		while(impulseTemperatureScene.children.length > i) {
			child = impulseTemperatureScene.children[i]

			if(child.userData != "temperature" && keep.indexOf(child.userData) == -1)
				impulseTemperatureScene.remove(child);
			else
				i++;
		}

		// console.log(impulseDensityScene.children.length, keep.length + 1);
		// console.log(impulseTemperatureScene.children.length, keep.length + 1);
	};

	this.clearObstacles = function(keep) {
		// this.clearTarget(textures.obstacles.texture);

		keep = keep || new Array(); 

		var i = 0;
		var child;
		while(obstaclesScene.children.length > i) {
			child = obstaclesScene.children[i]

			if(child.userData != "boundary" && keep.indexOf(child.userData) == -1)
				obstaclesScene.remove(child);
			else
				i++;
		}

		// console.log(obstaclesScene.children.length);
		this.render(obstaclesScene, camera, textures.obstacles.texture);
	};
	

	this.init = function(width, height, setSize) {
		this.isInitialized = true;

		// console.log(this.context.getSupportedExtensions());
		if(!this.isSupported) return;

		width = width || this.domElement.width;
		height = height || this.domElement.height;
		settings.setSize(width, height);
		textures = new dm.Fluids.Textures(settings);

		scene = new THREE.Scene();
		impulseDensityScene = new THREE.Scene();
		impulseTemperatureScene = new THREE.Scene();
		obstaclesScene = new THREE.Scene();

		camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
		renderGeometry = new THREE.PlaneBufferGeometry( 2, 2 );
		renderMesh = new THREE.Mesh( renderGeometry, null );

		renderMaterial = new THREE.MeshBasicMaterial();
		renderMesh.material = renderMaterial;

		advectShaderMaterial 				= new dm.Fluids.ShaderMaterials.Advect(settings, textures);
		buoyancyShaderMaterial 				= new dm.Fluids.ShaderMaterials.Buoyancy(settings, textures);
		applyImpulseShaderMaterial 			= new dm.Fluids.ShaderMaterials.ApplyImpulse(settings, textures);
		computeDivergenceShaderMaterial	 	= new dm.Fluids.ShaderMaterials.ComputeDivergence(settings, textures);
		jacobiShaderMaterial 				= new dm.Fluids.ShaderMaterials.Jacobi(settings, textures);
		subtractGradientShaderMaterial 		= new dm.Fluids.ShaderMaterials.SubtractGradient(settings, textures);
		// visualizeShaderMaterial 			= new dm.Fluids.ShaderMaterials.Visualize(settings, textures);
		boundaryShaderMaterial 				= new dm.Fluids.ShaderMaterials.Boundary(settings, textures);
		vignetteShaderMaterial 				= new dm.Fluids.ShaderMaterials.Vignette(settings, textures);
		overrideColorShaderMaterial 		= new THREE.ShaderMaterial(dm.ShaderLib.OverrideColor);
		premultiplyAlphaShaderMaterial  	= new THREE.ShaderMaterial(dm.ShaderLib.PremultiplyAlpha);
		unpremultiplyAlphaShaderMaterial  	= new THREE.ShaderMaterial(dm.ShaderLib.UnpremultiplyAlpha);

		shaderMaterials = [
			advectShaderMaterial, 
			buoyancyShaderMaterial, 
			applyImpulseShaderMaterial, 
			computeDivergenceShaderMaterial,
			jacobiShaderMaterial,
			subtractGradientShaderMaterial,
			// visualizeShaderMaterial,
			boundaryShaderMaterial,
			vignetteShaderMaterial,
		];
		
		this.clearTarget(textures.density.texture);
		this.clearTarget(textures.temperature.texture);
		this.clearTarget(textures.obstacles.texture);
		
		scene.add(renderMesh);

		densityMesh = new THREE.Mesh( renderGeometry, unpremultiplyAlphaShaderMaterial.clone());
		densityMesh.renderOrder = 1;
		densityMesh.userData = "density";
		densityMesh.material.transparent = true;

		impulseDensityScene.add(densityMesh);


		temperatureMesh = new THREE.Mesh( renderGeometry, unpremultiplyAlphaShaderMaterial.clone());
		temperatureMesh.renderOrder = 1;
		temperatureMesh.userData = "temperature";
		temperatureMesh.material.transparent = true;

		impulseTemperatureScene.add(temperatureMesh);


		self.addBoundary();

		if(setSize !== false)
			this.setSize(width, height);
	};
	
	this.simulate = function(force) {
		// return;
		//createObstacles();
		
		/*renderMesh.material = advectShaderMaterial
		
		advectShaderMaterial.uniforms.VelocityTexture.value	= textures.velocity.texture;
		advectShaderMaterial.uniforms.SourceTexture.value	= textures.velocity.texture;
		
		this.render(scene, camera, textures.velocity.texture2);
		textures.velocity.swapTexture();*/

		if(!this.isInitialized)
			return;

		var deltaTime = new Date().getTime() - lastSimulated;
		if(!force && settings.fps != -1 && deltaTime < 1000/settings.fps)
			return false;
		
		renderMesh.material = advectShaderMaterial;
		
		advectShaderMaterial.uniforms.VelocityTexture.value	= textures.velocity.texture;
		advectShaderMaterial.uniforms.SourceTexture.value	= textures.velocity.texture;
		advectShaderMaterial.uniforms.Dissipation.value		= settings.velocityDissipation;
		
		this.render(scene, camera, textures.velocity.texture2);
		textures.velocity.swapTexture();
		
		advectShaderMaterial.uniforms.VelocityTexture.value	= textures.velocity.texture;
		advectShaderMaterial.uniforms.SourceTexture.value	= textures.temperature.texture;
		advectShaderMaterial.uniforms.Dissipation.value		= settings.temperatureDissipation;
		
		this.render(scene, camera, textures.temperature.texture2);
		textures.temperature.swapTexture();
		
		advectShaderMaterial.uniforms.VelocityTexture.value = textures.velocity.texture;
		advectShaderMaterial.uniforms.SourceTexture.value	= textures.density.texture;
		advectShaderMaterial.uniforms.Dissipation.value		= settings.densityDissipation;
		
		this.render(scene, camera, textures.density.texture2);
		textures.density.swapTexture();
		
		renderMesh.material = buoyancyShaderMaterial;
		buoyancyShaderMaterial.uniforms.Velocity.value 		= textures.velocity.texture;
		buoyancyShaderMaterial.uniforms.Temperature.value 	= textures.temperature.texture;
		buoyancyShaderMaterial.uniforms.Density.value 		= textures.density.texture;
		
		buoyancyShaderMaterial.uniforms.Sigma.value = settings.invertBuoyancy ? -settings.smokeBuoyancy : settings.smokeBuoyancy;
		buoyancyShaderMaterial.uniforms.Kappa.value = settings.smokeWeight;

		// console.log(buoyancyShaderMaterial.uniforms.Sigma.value);
		
		this.render(scene, camera, textures.velocity.texture2);
		textures.velocity.swapTexture();
		
		if(this.applyCircleImpulse) {
			renderMesh.material = applyImpulseShaderMaterial;
			applyImpulseShaderMaterial.uniforms.Sampler.value = textures.temperature.texture;
			applyImpulseShaderMaterial.uniforms.FillColor.value = settings.circleImpulseTemperature || settings.impulseTemperature;
			applyImpulseShaderMaterial.uniforms.Radius.value = settings.circleImpulseRadius;
			this.render(scene, camera, textures.temperature.texture2);
			textures.temperature.swapTexture();	
			
			
			applyImpulseShaderMaterial.uniforms.Sampler.value = textures.density.texture;
			applyImpulseShaderMaterial.uniforms.FillColor.value = settings.circleImpulseDensity || settings.impulseDensity;

			renderMesh.material = applyImpulseShaderMaterial;
			this.render(scene, camera, textures.density.texture2);
			textures.density.swapTexture();
		}

		if (this.applyTextureImpulse && impulseDensityScene.children.length > 1) {
			// temperatureMesh.material.map = textures.temperature.texture;
			temperatureMesh.material.uniforms.tDiffuse.value = textures.temperature.texture;
			this.render(impulseTemperatureScene, camera, textures.temperature.texture2);
			textures.temperature.swapTexture();

			// densityMesh.material.map = textures.density.texture;
			densityMesh.material.uniforms.tDiffuse.value = textures.density.texture;
			this.render(impulseDensityScene, camera, textures.density.texture2);
			textures.density.swapTexture();
		}
		
		renderMesh.material = computeDivergenceShaderMaterial;
		computeDivergenceShaderMaterial.uniforms.Obstacles.value = textures.obstacles.texture;
		computeDivergenceShaderMaterial.uniforms.Velocity.value = textures.velocity.texture;
		this.render(scene, camera, textures.divergence.texture);
		
		renderMesh.material = jacobiShaderMaterial;
		jacobiShaderMaterial.uniforms.Obstacles.value = textures.obstacles.texture;
		this.clearTarget(textures.pressure.texture1, true, true, true);
		var i;
		for(i = 0; i < settings.numJacobiIterations; i++) {
			jacobiShaderMaterial.uniforms.Pressure.value = textures.pressure.texture;
	        this.render(scene, camera, textures.pressure.texture2, i === 0);
	        textures.pressure.swapTexture();
	    }
		
		renderMesh.material = subtractGradientShaderMaterial;
		subtractGradientShaderMaterial.uniforms.Obstacles.value = textures.obstacles.texture;
		subtractGradientShaderMaterial.uniforms.Velocity.value = textures.velocity.texture;
		subtractGradientShaderMaterial.uniforms.Pressure.value = textures.pressure.texture;
		this.render(scene, camera, textures.velocity.texture2);
		textures.velocity.swapTexture();
		
		/*renderMesh.material = visualizeShaderMaterial;
		visualizeShaderMaterial.uniforms.Velocity.value = textures.velocity.texture;
		visualizeShaderMaterial.uniforms.Pressure.value = textures.pressure.texture;
		
		renderMesh.material = visualizeShaderMaterial;
		visualizeShaderMaterial.uniforms.Sampler.value = textures.density.texture;
		this.render(scene, camera, textures.visualize.texture);*/
		// settings.enableVignette = false;

		// settings.enableVignette = false;	
		if(settings.enableVignette) {
			renderMesh.material = vignetteShaderMaterial;
			vignetteShaderMaterial.uniforms.tDiffuse.value = textures.density.texture;
		} else {
			renderMesh.material = renderMaterial;
			renderMaterial.map = textures.density.texture;
			// renderMaterial.map = textures.visualize.texture;
			// renderMaterial.map = textures.obstacles.texture;
			// renderMaterial.map = textures.temperature.texture;
			// renderMaterial.map = textures.divergence.texture;
			// renderMaterial.map = textures.velocity.texture;
			// renderMaterial.map = textures.pressure.texture;
			// renderMaterial.map = textures.impulseDensity.texture;
			// renderMaterial.map = textures.impulseOverlay.texture;
			// renderMaterial.map = textures.impulseTemperature.texture;
		}

		this.render(scene, camera);

		if(this.autoClearImpulse)
			this.clearImpulse();
		
		if(this.autoClearObstacles)
			this.clearObstacles();

		lastSimulated = new Date().getTime();

		return true;
	};

	this.setSize = function(width, height, force) {
		if(!force && this.domElement.width == width && this.domElement.height == height)
			return;

		this.domElement.width = width;
		this.domElement.height = height;
		this.domElement.style.width = width+"px";
		this.domElement.style.height = height+"px";
		this.setViewport( 0, 0, width, height );

		settings.setSize(width, height);
		
		if(!this.isInitialized)
			this.init(width, height, false);

		textures.update();

		var i, shaderMaterial;
		for (i = shaderMaterials.length - 1; i >= 0; i--) {
			shaderMaterial = shaderMaterials[i];
			shaderMaterial.update(settings, textures);
		}

		this.clearTarget(textures.density.texture);
		this.clearTarget(textures.temperature.texture);
		this.clearTarget(textures.obstacles.texture);
	};

	this.setSampling = function(sampling) {
		settings.sampling = sampling;
		this.setSize(settings.originWidth, settings.originHeight, true);
		this.render(obstaclesScene, camera, textures.obstacles.texture);
	};
};
dm.Fluids.Simulator.prototype = Object.create(THREE.WebGLRenderer.prototype);

if(typeof dm === "undefined") dm = new Object();
if(typeof dm.Fluids === "undefined") dm.Fluids = new Object();

dm.Fluids.Settings = function() {
	this.fps 							= -1;
	this.sampling 							= 1;
	this.cellSize 						= 1.25;
	this.width	 						= 500;
	this.height 						= 500;
	this.originWidth 					= 500;
	this.originHeight	 				= 500;
	this.gridWidth 						= 500/2;
	this.gridHeight 					= 500/2;
	this.boundaryTop					= -1;
	this.boundaryRight					= -1;
	this.boundaryBottom					= -1;
	this.boundaryLeft					= -1;
	this.obstacleThreshold				= 0.001;

	this.enableVignette					= false;
	this.vignetteSize					= 1.0;
	this.vignetteSoftness				= 1.0;
	this.vignetteScale					= new THREE.Vector2(1.0, 1.0);	
	this.vignetteOffset					= new THREE.Vector2(0.0, 0.0);	
	this.vignetteDebug					= false;
	
	this.ambientTemperature 			= 0.0;

	this.blendImpulse					= true;
	this.impulseTemperature 			= new THREE.Vector4(14.0, 14.0, 14.0, 1.0);
	this.impulseDensity					= new THREE.Vector4(1.0, 1.0, 1.0, 1.0);
	this.impulseDensityColor			= [255, 255, 255];

	/*var this.impulseTemperature	 	= new THREE.Vector3(145.0, 145.0, 145.0);
	this.var impulseDensity				= new THREE.Vector3(45.0, 45.0, 45.0);*/
	this.numJacobiIterations 			= 15;
	this.timeStep 						= 0.125;
	this.smokeBuoyancy 					= 1.0;
	this.invertBuoyancy 				= false;
	this.smokeWeight 					= 0.005;
	this.gradientScale 					= 1.125/this.cellSize;
	this.temperatureDissipation 		= 0.99;
	this.velocityDissipation 			= 0.99;
	this.densityDissipation 			= 0.99;
	
	this.circleImpulseRadius 			= 20;
	this.circleImpulsePosition 			= new THREE.Vector2(this.width/2, this.splatRadius);
	this.circleImpulseTemperature 		= null;
	this.circleImpulseDensity			= null;
	
	this.inverseSize					= new THREE.Vector2(1/this.width, 1/this.height);
	
	this.linearFloatParams 				= 	{
											    minFilter: THREE.LinearFilter,
											    magFilter: THREE.LinearFilter,
											    // wrapS: THREE.RenderTargetWrapping,
											    // wrapT: THREE.RenderTargetWrapping,
											    format: THREE.RGBAFormat,
											    //mapping: THREE.UVMapping,
											    // type: THREE.FloatType
											    type: THREE.HalfFloatType
											};

	this.setSize = function(width, height) {
		this.originWidth = width;
		this.originHeight = height;

		width *= this.sampling;
		height *= this.sampling;

		width = Math.round(width);
		height = Math.round(height);

		this.width = width;
		this.height = height;
		this.gridWidth = Math.round(width/2);
		this.gridHeight = Math.round(height/2);

		this.circleImpulsePosition.x = width/2;
		this.inverseSize.x = 1/width;
		this.inverseSize.y = 1/height;
		// console.log(this);
	};

	this.setSampling = function(sampling) {
		this.sampling = sampling;
		this.setSize(this.originWidth, this.originHeight);
	};
};

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

if(typeof dm === "undefined") dm = new Object();
if(typeof dm.Fluids === "undefined") dm.Fluids = new Object();

dm.Fluids.Shaders = new Object();

dm.Fluids.Shaders.Advect = {
	uniforms: THREE.UniformsUtils.merge([
		{
		"VelocityTexture" : { type: "t", value: null },
		"SourceTexture" : { type: "t", value: null },
		"Obstacles" : { type: "t", value: null },
		"InverseSize" : { type: "v2", value: new THREE.Vector2( 0, 0 ) },
		"TimeStep" : { type: "f", value: -1 },
		"Dissipation" : { type: "f", value: -1 },
		"ObstacleThreshold" : { type: "f", value: -1 },
		}
	]),
	vertexShader: [
		'varying vec2 vUv;',
		'void main()	{',
		'    vUv = uv;',
		'	gl_Position = vec4( position, 1.0 );',
		'}'].join("\n"),
	fragmentShader: [
		'uniform sampler2D VelocityTexture;',
		'uniform sampler2D SourceTexture;',
		'uniform sampler2D Obstacles;',
		'uniform vec2 InverseSize;',
		'uniform float TimeStep;',
		'uniform float Dissipation;',
		'uniform float ObstacleThreshold;',
		'varying vec2 vUv;',
		'void main()',
		'{',
		'    float solid = texture2D(Obstacles, vUv).a;',
		'    ',
		'    if (solid >= ObstacleThreshold) {',
		'        gl_FragColor = vec4(0.0);',
		'        return;',
		'    }',
		'    ',
		'    vec2 u = texture2D(VelocityTexture, vUv).xy;',
		'    vec2 coord = InverseSize * (gl_FragCoord.xy - TimeStep * u);',
		'    gl_FragColor = Dissipation * texture2D(SourceTexture, coord);',
		'}'].join("\n")
};
dm.Fluids.Shaders.Boundary = {
	uniforms: THREE.UniformsUtils.merge([
		{
		"Color" : { type: "v4", value: new THREE.Vector4( 0, 0, 0, 0 ) },
		"Boundary" : { type: "fv1", value: [] },
		"InverseSize" : { type: "v2", value: new THREE.Vector2( 0, 0 ) },
		}
	]),
	vertexShader: [
		'varying vec2 vUv;',
		'void main()	{',
		'    vUv = uv;',
		'	gl_Position = vec4( position, 1.0 );',
		'}'].join("\n"),
	fragmentShader: [
		'// uniform_ sampler2D Sampler;',
		'uniform vec4 Color;',
		'uniform float Boundary[4];',
		'uniform vec2 InverseSize;',
		'varying vec2 vUv;',
		'void main()',
		'{',
		'	// vec4 outColor = texture2D(Sampler, vUv);',
		'	float bbN = 1.0 - Boundary[0] * InverseSize.y;',
		'	float bbS = Boundary[2] * InverseSize.y;',
		'	float bbE = 1.0 - Boundary[1] * InverseSize.x;',
		'	float bbW = Boundary[3] * InverseSize.x;',
		'    // gl_FragColor = vUv.y > bbN || vUv.y < bbS || vUv.x > bbE || vUv.x < bbW ? mix(outColor, Color, Color.a) : outColor;',
		'    gl_FragColor = vUv.y > bbN || vUv.y < bbS || vUv.x > bbE || vUv.x < bbW ? vec4(Color.rgb * Color.a, Color.a) : vec4(0.0);',
		'}'].join("\n")
};
dm.Fluids.Shaders.Buoyancy = {
	uniforms: THREE.UniformsUtils.merge([
		{
		"Velocity" : { type: "t", value: null },
		"Temperature" : { type: "t", value: null },
		"Density" : { type: "t", value: null },
		"AmbientTemperature" : { type: "f", value: -1 },
		"TimeStep" : { type: "f", value: -1 },
		"Sigma" : { type: "f", value: -1 },
		"Kappa" : { type: "f", value: -1 },
		}
	]),
	vertexShader: [
		'varying vec2 vUv;',
		'void main()	{',
		'    vUv = uv;',
		'	gl_Position = vec4( position, 1.0 );',
		'}'].join("\n"),
	fragmentShader: [
		'uniform sampler2D Velocity;',
		'uniform sampler2D Temperature;',
		'uniform sampler2D Density;',
		'uniform float AmbientTemperature;',
		'uniform float TimeStep;',
		'uniform float Sigma;',
		'uniform float Kappa;',
		'varying vec2 vUv;',
		'void main()',
		'{',
		'    float T = texture2D(Temperature, vUv).r;',
		'    vec2 V = texture2D(Velocity, vUv).xy;',
		'    vec2 outColor = V;',
		'    if (T > AmbientTemperature) {',
		'        float D = texture2D(Density, vUv).x;',
		'        outColor += (TimeStep * (T - AmbientTemperature) * Sigma - D * Kappa ) * vec2(0.0, 1.0);',
		'    }',
		'    ',
		'    gl_FragColor = vec4(outColor, 0.0, 1.0);',
		'}'].join("\n")
};
dm.Fluids.Shaders.ComputeDivergence = {
	uniforms: THREE.UniformsUtils.merge([
		{
		"Velocity" : { type: "t", value: null },
		"Obstacles" : { type: "t", value: null },
		"InverseSize" : { type: "v2", value: new THREE.Vector2( 0, 0 ) },
		"HalfInverseCellSize" : { type: "f", value: -1 },
		"ObstacleThreshold" : { type: "f", value: -1 },
		}
	]),
	vertexShader: [
		'void main()	{',
		'	gl_Position = vec4( position, 1.0 );',
		'}'].join("\n"),
	fragmentShader: [
		'uniform sampler2D Velocity;',
		'uniform sampler2D Obstacles;',
		'uniform vec2 InverseSize;',
		'uniform float HalfInverseCellSize;',
		'uniform float ObstacleThreshold;',
		'void main()',
		'{',
		'    vec2 fragCoord = gl_FragCoord.xy;',
		'    ',
		'    // vec2 c = fragCoord * InverseSize;',
		'    vec2 cN = (fragCoord + vec2(0.0, 1.0)) * InverseSize;',
		'    vec2 cS = (fragCoord + vec2(0.0, -1.0)) * InverseSize;',
		'    vec2 cE = (fragCoord + vec2(1.0, 0.0)) * InverseSize;',
		'    vec2 cW = (fragCoord + vec2(-1.0, 0.0)) * InverseSize;',
		'    ',
		'    // Find neighboring obstacles:',
		'    vec4 oN = texture2D(Obstacles, cN);',
		'    vec4 oS = texture2D(Obstacles, cS);',
		'    vec4 oE = texture2D(Obstacles, cE);',
		'    vec4 oW = texture2D(Obstacles, cW);',
		'    ',
		'    // Find neighboring velocities:',
		'    vec2 vN;',
		'    vec2 vS;',
		'    vec2 vE;',
		'    vec2 vW;',
		'    if(oN.a >= ObstacleThreshold) vN = oN.rg; else vN = texture2D(Velocity, cN).rg;',
		'    if(oS.a >= ObstacleThreshold) vS = oS.rg; else vS = texture2D(Velocity, cS).rg;',
		'    if(oE.a >= ObstacleThreshold) vE = oE.rg; else vE = texture2D(Velocity, cE).rg;',
		'    if(oW.a >= ObstacleThreshold) vW = oW.rg; else vW = texture2D(Velocity, cW).rg;',
		'    gl_FragColor = vec4(HalfInverseCellSize * (vE.r - vW.r + vN.g - vS.g));',
		'  }'].join("\n")
};
dm.Fluids.Shaders.Jacobi = {
	uniforms: THREE.UniformsUtils.merge([
		{
		"Pressure" : { type: "t", value: null },
		"Divergence" : { type: "t", value: null },
		"Obstacles" : { type: "t", value: null },
		"InverseSize" : { type: "v2", value: new THREE.Vector2( 0, 0 ) },
		"Alpha" : { type: "f", value: -1 },
		"InverseBeta" : { type: "f", value: -1 },
		"ObstacleThreshold" : { type: "f", value: -1 },
		}
	]),
	vertexShader: [
		'varying vec2 vUv;',
		'void main()	{',
		'    vUv = uv;',
		'	gl_Position = vec4( position, 1.0 );',
		'}'].join("\n"),
	fragmentShader: [
		'uniform sampler2D Pressure;',
		'uniform sampler2D Divergence;',
		'uniform sampler2D Obstacles;',
		'uniform vec2 InverseSize;',
		'uniform float Alpha;',
		'uniform float InverseBeta;',
		'uniform float ObstacleThreshold;',
		'varying vec2 vUv;',
		'void main()',
		'{',
		'    vec2 fragCoord = gl_FragCoord.xy;',
		'    ',
		'    vec2 cN = (fragCoord + vec2(0.0, 1.0)) * InverseSize;',
		'    vec2 cS = (fragCoord + vec2(0.0, -1.0)) * InverseSize;',
		'    vec2 cE = (fragCoord + vec2(1.0, 0.0)) * InverseSize;',
		'    vec2 cW = (fragCoord + vec2(-1.0, 0.0)) * InverseSize;',
		'    ',
		'    // Find neighboring obstacles:',
		'    vec4 oN = texture2D(Obstacles, cN);',
		'    vec4 oS = texture2D(Obstacles, cS);',
		'    vec4 oE = texture2D(Obstacles, cE);',
		'    vec4 oW = texture2D(Obstacles, cW);',
		'    ',
		'    // Find neighboring pressure:',
		'    vec4 pN;',
		'    vec4 pS;',
		'    vec4 pE;',
		'    vec4 pW;',
		'    ',
		'    // Use center pressure for solid cells:',
		'    vec4 pC = texture2D(Pressure, vUv);',
		'    if(oN.a >= ObstacleThreshold) pN = pC; else pN = texture2D(Pressure, cN); ',
		'    if(oS.a >= ObstacleThreshold) pS = pC; else pS = texture2D(Pressure, cS); ',
		'    if(oE.a >= ObstacleThreshold) pE = pC; else pE = texture2D(Pressure, cE); ',
		'    if(oW.a >= ObstacleThreshold) pW = pC; else pW = texture2D(Pressure, cW); ',
		'    float bC = texture2D(Divergence, vUv).x;',
		'    gl_FragColor = vec4((pW + pE + pN + pS + Alpha * bC) * InverseBeta);',
		'}'].join("\n")
};
dm.Fluids.Shaders.Splat = {
	uniforms: THREE.UniformsUtils.merge([
		{
		"Sampler" : { type: "t", value: null },
		"Point" : { type: "v2", value: new THREE.Vector2( 0, 0 ) },
		"Radius" : { type: "f", value: -1 },
		"FillColor" : { type: "v4", value: new THREE.Vector4( 0, 0, 0, 0 ) },
		}
	]),
	vertexShader: [
		'varying vec2 vUv;',
		'void main()	{',
		'    vUv = uv;',
		'	gl_Position = vec4( position, 1.0 );',
		'}'].join("\n"),
	fragmentShader: [
		'uniform sampler2D Sampler;',
		'uniform vec2 Point;',
		'uniform float Radius;',
		'uniform vec4 FillColor;',
		'varying vec2 vUv;',
		'void main()',
		'{',
		'    float d = distance(Point, gl_FragCoord.xy);',
		'    vec4 color = texture2D(Sampler, vUv);',
		'    ',
		'    if (d < Radius) {',
		'        float a = (Radius - d) * 0.5;',
		'        gl_FragColor = vec4(FillColor.rgb * FillColor.a, FillColor.a); ',
		'    } ',
		'    else {',
		'        gl_FragColor = color;',
		'        // gl_FragColor = vec4(0.0);',
		'    }',
		'}'].join("\n")
};
dm.Fluids.Shaders.SubtractGradient = {
	uniforms: THREE.UniformsUtils.merge([
		{
		"Velocity" : { type: "t", value: null },
		"Pressure" : { type: "t", value: null },
		"Obstacles" : { type: "t", value: null },
		"InverseSize" : { type: "v2", value: new THREE.Vector2( 0, 0 ) },
		"GradientScale" : { type: "f", value: -1 },
		"ObstacleThreshold" : { type: "f", value: -1 },
		}
	]),
	vertexShader: [
		'varying vec2 vUv;',
		'void main()	{',
		'    vUv = uv;',
		'	gl_Position = vec4( position, 1.0 );',
		'}'].join("\n"),
	fragmentShader: [
		'uniform sampler2D Velocity;',
		'uniform sampler2D Pressure;',
		'uniform sampler2D Obstacles;',
		'uniform vec2 InverseSize;',
		'uniform float GradientScale;',
		'uniform float ObstacleThreshold;',
		'varying vec2 vUv;',
		'void main()',
		'{',
		'   vec2 fragCoord = gl_FragCoord.xy;',
		'    ',
		'    vec2 cN = (fragCoord + vec2(0.0, 1.0)) * InverseSize;',
		'    vec2 cS = (fragCoord + vec2(0.0, -1.0)) * InverseSize;',
		'    vec2 cE = (fragCoord + vec2(1.0, 0.0)) * InverseSize;',
		'    vec2 cW = (fragCoord + vec2(-1.0, 0.0)) * InverseSize;',
		'    // Find neighboring obstacles:',
		'    vec4 oN = texture2D(Obstacles, cN);',
		'    vec4 oS = texture2D(Obstacles, cS);',
		'    vec4 oE = texture2D(Obstacles, cE);',
		'    vec4 oW = texture2D(Obstacles, cW);',
		'    ',
		'    // Find neighboring pressure:',
		'    float pN;',
		'    float pS;',
		'    float pE;',
		'    float pW;',
		'    ',
		'    // Use center pressure for solid cells:',
		'    vec2 obstV = vec2(0.0);',
		'    vec2 vMask = vec2(1.0);',
		'    float pC = texture2D(Pressure, vUv).r;',
		'    if(oN.a >= ObstacleThreshold) { pN = pC; obstV.g = oN.b; vMask.g = 0.0; } else pN = texture2D(Pressure, cN).r;',
		'    if(oS.a >= ObstacleThreshold) { pS = pC; obstV.g = oS.b; vMask.g = 0.0; } else pS = texture2D(Pressure, cS).r; ',
		'    if(oE.a >= ObstacleThreshold) { pE = pC; obstV.r = oE.g; vMask.r = 0.0; } else pE = texture2D(Pressure, cE).r; ',
		'    if(oW.a >= ObstacleThreshold) { pW = pC; obstV.r = oW.g; vMask.r = 0.0; } else pW = texture2D(Pressure, cW).r; ',
		'    // Enforce the free-slip boundary condition:',
		'    vec2 oldV = texture2D(Velocity, vUv).rg;',
		'    vec2 grad = vec2(pE - pW, pN - pS) * GradientScale;',
		'    vec2 newV = oldV - grad;',
		'    gl_FragColor = vec4((vMask * newV) + obstV, 0.0, 1.0);',
		'}'].join("\n")
};
dm.Fluids.Shaders.Visualize = {
	uniforms: THREE.UniformsUtils.merge([
		{
		"Sampler" : { type: "t", value: null },
		"FillColor" : { type: "v3", value: new THREE.Vector3( 0, 0, 0 ) },
		}
	]),
	vertexShader: [
		'varying vec2 vUv;',
		'void main()	{',
		'    vUv = uv;',
		'	gl_Position = vec4( position, 1.0 );',
		'}'].join("\n"),
	fragmentShader: [
		'uniform sampler2D Sampler;',
		'uniform vec3 FillColor;',
		'varying vec2 vUv;',
		'void main()',
		'{',
		'  float L = texture2D(Sampler, vUv).r;',
		'  gl_FragColor = vec4(FillColor, L);',
		'}'].join("\n")
};


if(typeof dm === "undefined") dm = new Object();
if(typeof dm.Fluids === "undefined") dm.Fluids = new Object();

dm.Fluids.Texture = function(settings) {
	//var size = 4*width*height;
	var renderTarget = new THREE.WebGLRenderTarget(settings.width, settings.height, settings.linearFloatParams);
	this.texture = renderTarget;

	this.setSize = function(width, height) {
		renderTarget = renderTarget.clone();
		renderTarget.setSize(width, height);
		this.texture = renderTarget;
	};

	this.update = function() {
		this.setSize(settings.width, settings.height);
	};
};

dm.Fluids.SwappableTexture = function(settings) {
	var textureSwitch = false;

	var renderTarget1 = new THREE.WebGLRenderTarget(settings.width, settings.height, settings.linearFloatParams);
	var renderTarget2 = new THREE.WebGLRenderTarget(settings.width, settings.height, settings.linearFloatParams);
	this.texture = renderTarget1;
	this.texture2 = renderTarget2;
	
	this.swapTexture = function() {
		textureSwitch = !textureSwitch;
		
		if(textureSwitch) {
			this.texture = renderTarget2;
			this.texture2 = renderTarget1;
		} else {
			this.texture = renderTarget1;
			this.texture2 = renderTarget2;
		}
	};

	this.setSize = function(width, height) {
		renderTarget1 = renderTarget1.clone();
		renderTarget1.setSize(width, height);

		renderTarget2 = renderTarget2.clone();
		renderTarget2.setSize(width, height);

		if(textureSwitch) {
			this.texture = renderTarget2;
			this.texture2 = renderTarget1;
		} else {
			this.texture = renderTarget1;
			this.texture2 = renderTarget2;
		}
	};

	this.update = function() {
		this.setSize(settings.width, settings.height);
	};
};

dm.Fluids.Textures = function(settings) {
	this.velocity					= new dm.Fluids.SwappableTexture(settings);
	this.density					= new dm.Fluids.SwappableTexture(settings);
	this.pressure					= new dm.Fluids.SwappableTexture(settings);
	this.temperature				= new dm.Fluids.SwappableTexture(settings);

	this.obstacles				= new dm.Fluids.Texture(settings);
	this.divergence				= new dm.Fluids.Texture(settings);
	// this.visualize			= new dm.Fluids.Texture(settings);

	this.update = function() {
		this.velocity.update();
		this.density.update();
		this.pressure.update();
		this.temperature.update();
		this.obstacles.update();

		this.divergence.update();
		// this.visualize.update();
	};
};

if(typeof dm === "undefined") dm = new Object();
if(typeof dm.Fluids === "undefined") dm.Fluids = new Object();