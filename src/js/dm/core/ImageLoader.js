/**
 * @requires dm/namespaces.js
 * @requires dm/core/EventTarget.js
 */

dm.ImageLoader = function() {
	dm.EventTarget.call(this);

	var self = this;
	var images = new Object();

	detectSrcChange();

	function imageLoadHandler(event) {
		if(!self.isLoading()) {
			self.dispatchEvent(new dm.Event(dm.ImageLoader.EVENT_LOAD));
		}
	}

	function detectSrcChange() {
		requestAnimationFrame(detectSrcChange);

		var src, image, imageElement;
		for(src in images) {
			image = images[src];
			imageElement = image.image;
			if(imageElement.currentSrc && imageElement.currentSrc != image.currentSrc) {
				// console.log("New currentSrc:", dm.Utils.Image.getSrc(imageElement, true));
				image.currentSrc = imageElement.currentSrc;
				self.dispatchEvent(new dm.Event(dm.ImageLoader.EVENT_INVALIDATE, image));
				image.load();
			}
		}
	}

	this.loadImage = function(src) {
		var image = images[src];
		if(image) {
			image.load();
		} else
			console.warn("dm.ImageLoader: loadImage() No image found for", src);
	};

	this.stopImage = function(src) {
		var image = images[src];
		if(image) {
			image.stop();
		} else
			console.warn("dm.ImageLoader: stopImage() No image found for", src);
	};

	this.add = function(image, callback) {
		images[image.src] = new dm.ImageLoaderImage(image, callback);
		images[image.src].addEventListener(dm.ImageLoaderImage.EVENT_LOAD, imageLoadHandler);
	};

	this.remove = function(src) {
		var image = images[src];
		if(image) {
			image.removeEventListener(dm.ImageLoaderImage.EVENT_LOAD, imageLoadHandler);
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

		var imageElements = element.querySelectorAll("img");

		var index;
		for(index in imageElements)
			self.add(imageElements[index]);
	};

	this.initWithHtml = function(html) {
		var domParser = document.createElement("div");
		domParser.innerHTML = html;

		self.init(domParser);
	};

	this.load = function() {
		var src;
		for(src in images)
			images[src].load();
	};

	this.stop = function() {
		var src;
		for(src in images)
			images[src].stop();
	};

	this.isLoading = function() {
		var isLoading = false;

		var src;
		for(src in images)
			if(!isLoading && images[src].getIsLoading()) {
				isLoading = true;
				break;
			}

		return isLoading;
	};

	this.destroy = function() {
		var src;
		for(src in images)
			self.remove(src);

		images = null;
	};
};
dm.ImageLoader.prototype = Object.create(dm.EventTarget.prototype);
dm.ImageLoader.EVENT_LOAD = "load";
dm.ImageLoader.EVENT_INVALIDATE = "invalidate";


dm.ImageLoaderImage = function(image, callback) {
	dm.EventTarget.call(this);

	if(!image)
		console.error("dm.ImageLoaderImage: no valid image.");

	var self = this;

	this.image = image;
	this.callback = callback;
	this.currentSrc = image.src;

	var loadImage = null;
	var isLoading = false;

	function loadImageHandler(event) {
		self.stop();

		if(self.callback)
			self.callback.call(self);

		self.dispatchEvent(new dm.Event(dm.ImageLoaderImage.EVENT_LOAD));
	}

	this.load = function() {
		if(image.src != self.currentSrc) {
			if(loadImage)
				self.stop();

			loadImage = new Image();
			loadImage.addEventListener("load", loadImageHandler);
			loadImage.src = self.currentSrc;
			isLoading = true;
		}
	};

	this.stop = function() {
		if(loadImage) {
			loadImage.removeEventListener("load", loadImageHandler);
			loadImage.src = "";
			loadImage = null;
		}
		isLoading = false;
	};

	this.getIsLoading = function() {
		return isLoading;
	}
};
dm.ImageLoaderImage.prototype = Object.create(dm.EventTarget.prototype);
dm.ImageLoaderImage.EVENT_LOAD = "load";
