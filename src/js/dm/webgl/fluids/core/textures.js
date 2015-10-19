/**
 * @requires dm/namespaces.js
 * @requires dm/webgl/namespaces.js
 */

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