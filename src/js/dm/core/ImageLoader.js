/**
 * @requires dm/namespaces.js
 * @requires dm/core/EventTarget.js
 */

dm.ImageLoader = function(autoStart, invalidateAll) {
	dm.EventTarget.call(this);

	var self = this;
	var images = new Object();

	if(autoStart !== false)
		detectSrcChange();

	function imageHandler(event) {
		switch(event.type) {
			case dm.ImageLoaderImage.EVENT_ERROR:
				self.dispatchEvent(new dm.Event(dm.ImageLoader.EVENT_ERROR, event.target));
				break;

			case dm.ImageLoaderImage.EVENT_LOAD:
				self.dispatchEvent(new dm.Event(dm.ImageLoader.EVENT_IMAGE_LOAD, event.target));

				if(!self.isLoading())
					self.dispatchEvent(new dm.Event(dm.ImageLoader.EVENT_LOAD));
				break;
		}
	}

	function detectSrcChange() {
		if(images)
			requestAnimationFrame(detectSrcChange);

		var src, image, imageElement;
		for(src in images) {
			image = images[src];
			imageElement = image.image;
			if(imageElement.currentSrc && imageElement.currentSrc != image.currentSrc) {
				// console.log("New currentSrc:", dm.Utils.Image.getSrc(imageElement, true));
				image.currentSrc = imageElement.currentSrc;

				if(!self.numLoading()) {
					if(invalidateAll) {
						var invalidateSrc;
						for(invalidateSrc in images)
							images[invalidateSrc].invalidate();
					}
					self.dispatchEvent(new dm.Event(dm.ImageLoader.EVENT_INVALIDATE, image));
				}

				image.load();
			}
		}
	}

	/*this.loadImage = function(src) {
		var image = images[src];
		if(image) {
			image.load();
		} else
			console.warn("dm.ImageLoader: loadingImage() No image found for", src);
	};

	this.stopImage = function(src) {
		var image = images[src];
		if(image) {
			image.stop();
		} else
			console.warn("dm.ImageLoader: stopImage() No image found for", src);
	};*/

	this.add = function(image, callback) {
		if(!image.src) {
			console.warning("dm.ImageLoader: add() No valid image");
			return;
		}
		images[image.src] = new dm.ImageLoaderImage(image, callback);
		images[image.src].addEventListener(dm.ImageLoaderImage.EVENT_LOAD, imageHandler);
		images[image.src].addEventListener(dm.ImageLoaderImage.EVENT_ERROR, imageHandler);
	};

	this.remove = function(src) {
		var image = images[src];
		if(image) {
			image.removeEventListener(dm.ImageLoaderImage.EVENT_LOAD, imageHandler);
			image.removeEventListener(dm.ImageLoaderImage.EVENT_ERROR, imageHandler);
			images[image.src] = null;
			delete images[image.src];
		}
	};

	this.get = function(src) {
		return images[src];
	};

	this.init = function(element) {
		if(self.isLoading())
			self.destroy();

		if(!images) {
			images = new Object();

			if(autoStart !== false)
				detectSrcChange();
		}

		var imageElements = element.querySelectorAll("img");

		var i;
		for(i = 0; i < imageElements.length; i++)
			self.add(imageElements[i]);
	};

	this.initWithHtml = function(html) {
		var domParser = document.createElement("div");
		domParser.innerHTML = html;

		self.init(domParser);
	};

	this.load = function() {
		if(autoStart == false)
			detectSrcChange();
	};

	this.stop = function() {
		var src;
		for(src in images)
			images[src].stop();
	};

	this.isLoading = function() {
		var isLoading = false;

		var src;
		for(src in images) {
			if(!isLoading && images[src].isLoading()) {
				isLoading = true;
				break;
			}
		}

		return isLoading;
	};

	this.numLoading = function() {
		var numLoading = 0;

		var src;
		for(src in images)
			if(images[src].isLoading())
				numLoading++;

		return numLoading;
	};

	this.numLoaded = function() {
		var numLoaded = 0;

		var src;
		for(src in images)
			if(!images[src].isLoading())
				numLoaded++;

		return numLoaded;
	};

	this.destroy = function() {
		var src;
		for(src in images)
			self.remove(src);

		images = null;
	};
};
dm.ImageLoader.prototype = Object.create(dm.EventTarget.prototype);
dm.ImageLoader.EVENT_IMAGE_LOAD = "imageload";
dm.ImageLoader.EVENT_LOAD = "load";
dm.ImageLoader.EVENT_ERROR = "error";
dm.ImageLoader.EVENT_INVALIDATE = "invalidate";


dm.ImageLoaderImage = function(image, callback) {
	dm.EventTarget.call(this);

	if(!image)
		console.error("dm.ImageLoaderImage: no valid image.");

	var self = this;

	this.image = image;
	this.callback = callback;
	this.currentSrc = image.src;

	var loadingImage = null;
	var isLoading = image.srcset !== "";

	function loadingImageHandler(event) {
		switch(event.type) {
			case "load":
				self.stop();

				if(self.callback)
					self.callback.call(self);

				self.dispatchEvent(new dm.Event(dm.ImageLoaderImage.EVENT_LOAD));
				break;

			case "error":
				self.stop();
				self.dispatchEvent(new dm.Event(dm.ImageLoaderImage.EVENT_ERROR));
				console.error("dm.ImageLoaderImage: Error loading image", image.src, "using", event.target.src);
				break;
		}
	}

	this.load = function() {
		if(image.src != self.currentSrc) {
			if(loadingImage)
				self.stop();

			loadingImage = new Image();
			loadingImage.addEventListener("load", loadingImageHandler);
			loadingImage.addEventListener("error", loadingImageHandler);
			loadingImage.src = self.currentSrc;
			isLoading = true;
		}
	};

	this.stop = function() {
		if(loadingImage) {
			loadingImage.removeEventListener("load", loadingImageHandler);
			loadingImage.removeEventListener("error", loadingImageHandler);
			loadingImage.src = "";
			loadingImage = null;
		}
		isLoading = false;
	};

	this.isLoading = function() {
		return isLoading;
	};

	this.invalidate = function() {
		this.stop();
		isLoading = image.srcset !== "";
	};
};
dm.ImageLoaderImage.prototype = Object.create(dm.EventTarget.prototype);
dm.ImageLoaderImage.EVENT_LOAD = "load";
dm.ImageLoaderImage.EVENT_ERROR = "error";
