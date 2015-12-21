/**
 * @requires dm/namespaces.js
 * @requires dm/core/HTMLElement.js
 */

dm.HTMLCanvasElement = function(element, canvas, autoSize, useImageSize) {
	dm.HTMLElement.call(this, element);

	this.canvas = canvas || document.createElement("canvas");
	this.context = this.canvas.getContext("2d");
	// console.log(this.context);

	var self = this;

	var userAgend = navigator.userAgent;
	var isDesktopChrome = !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile/i.test(userAgend) && /Chrome/i.test(userAgend);
	isDesktopChrome = false;

	this.autoSize = autoSize !== false;
	this.useImageSize = useImageSize === undefined ? false : useImageSize;

	this.useDevicePixelRatio = false;

	// if(!isDesktopChrome)
	// 	this.canvas.style.letterSpacing = "normal";

	function getAlphaColor(color, alpha) {
		if(alpha < 1) {
			if(color.indexOf("rgb") == -1) {
				color = color.replace('#','');
			    r = parseInt(color.substring(0,2), 16);
			    g = parseInt(color.substring(2,4), 16);
			    b = parseInt(color.substring(4,6), 16);

			    return 'rgba('+r+','+g+','+b+','+alpha+')';
			} else {
				if(color.indexOf("rgba") == -1)
					color = color.replace("rgb", "rgba");
				else {
					var stringParts = color.split(",");
					stringParts[stringParts.length-1] = alpha+")";
					return stringParts.join(",");
				}

				return color.replace(")", ", "+alpha+")");
			}
		}

		return color;
	}

	function svgFixIE(xml) {
		// console.log(xml);

		var start = xml.indexOf("<svg");
		var end = xml.lastIndexOf("/svg>");
		xml = xml.substring(start,end+5);

		xml = xml.replace(/NS[0-9]+:ns[0-9]+:xmlns:ns[0-9]+=\"\"/g, "");
		xml = xml.replace(/NS[0-9]+:xmlns:ns[0-9]+=\"\"/g, "");
		xml = xml.replace(/xmlns:NS[0-9]+=\"\"/g, "");
		xml = xml.replace(/NS[0-9]+:xmlns:xml=\"http:\/\/www.w3.org\/XML\/[0-9]+\/namespace\"/g, "");
		xml = xml.replace(/xmlns:xml=\"http:\/\/www.w3.org\/XML\/[0-9]+\/namespace\"/g, "");
		xml = xml.replace(/NS[0-9]+(:ns[0-9]+)+:/g, "");

		xml = xml.replace(/NS1:xmlns:xlink=\"http:\/\/www.w3.org\/1999\/xlink\"/, 'xmlns:xlink=\"http:\/\/www.w3.org\/1999\/xlink\"');
		xml = xml.replace(/xmlns:xlink=\"http:\/\/www.w3.org\/1999\/xlink\" xlink:href/g, 'xlink:href');

		// console.log(xml);

		return xml;
	}

	function getLineHeight(element) {

		var clone = element.cloneNode();
		// text.innerHTML = "XpÉ +eta–x- OQ_ξ";
		clone.style.display = "block";
		clone.style.height = "auto";
		clone.textContent = "";

		element.parentElement.appendChild(clone);
		var height = clone.offsetHeight;

		clone.textContent = "M\ng";

		var result = clone.offsetHeight-height;

		element.parentElement.removeChild(clone);
		return result;
	}

	function getWidth(element, styleProperties, isImage) {
		// if(!styleProperties)
		// 	styleProperties = window.getComputedStyle(element, null);
		
		// var width = styleProperties.getPropertyValue("width");

		// if(isImage)
		// 	width = width === "auto" || width === "" ? element.width : Number(width.replace("px", ""));
		// else
		// 	width = width === "auto" || width === "" ? element.offsetWidth : Number(width.replace("px", ""));
		
		var width;
		if(isImage && self.useImageSize) {
			width = element.width;
		} else {
			width = element.offsetWidth;
			if(self.useDevicePixelRatio && window.devicePixelRatio)
				width *= window.devicePixelRatio;
		}

		return Math.floor(width);
	}

	function getHeight(element, styleProperties, isImage) {
		// if(!styleProperties)
		// 	styleProperties = window.getComputedStyle(element, null);

		// var height = styleProperties.getPropertyValue("height");

		// if(isImage)
		// 	height = height === "auto" || height === "" ? element.height : Number(height.replace("px", ""));
		// else
		// 	height = height === "auto" || height === "" ? element.offsetHeight : Number(height.replace("px", ""));

		var height;
		if(isImage && self.useImageSize) {
			height = element.height;
		} else {
			height = element.offsetHeight;
			if(self.useDevicePixelRatio && window.devicePixelRatio)
				height *= window.devicePixelRatio;
		}

		return Math.floor(height);
	}

	function drawBorder(styleProperties, width, height, color, alpha) {

		var borderTopWidth 		= styleProperties.getPropertyValue("border-top-width");
		var borderBottomWidth 	= styleProperties.getPropertyValue("border-bottom-width");
		var borderLeftWidth 	= styleProperties.getPropertyValue("border-left-width");
		var borderRightWidth 	= styleProperties.getPropertyValue("border-right-width");
		var borderTopColor 		= color || styleProperties.getPropertyValue("border-top-color");
		var borderBottomColor	= color || styleProperties.getPropertyValue("border-bottom-color");
		var borderLeftColor 	= color || styleProperties.getPropertyValue("border-left-color");
		var borderRightColor 	= color || styleProperties.getPropertyValue("border-right-color");

		borderTopWidth 		= Number(borderTopWidth.replace("px", ""));
		borderBottomWidth 	= Number(borderBottomWidth.replace("px", ""));
		borderLeftWidth 	= Number(borderLeftWidth.replace("px", ""));
		borderRightWidth 	= Number(borderRightWidth.replace("px", ""));

		if(borderTopWidth === 0 && borderBottomWidth === 0 && borderLeftWidth === 0 && borderRightWidth === 0)
			return;

		self.context.save();
		self.context.globalAlpha = alpha;
		self.context.beginPath();

		if(borderTopWidth !== 0) {
			// self.context.strokeStyle = getAlphaColor(borderTopColor, alpha);
			self.context.lineWidth = borderTopWidth*2;

			self.context.moveTo(0, 0);
			self.context.lineTo(width, 0);
		}
		if(borderBottomWidth !== 0) {
			// self.context.strokeStyle = getAlphaColor(borderBottomColor, alpha);
			self.context.lineWidth = borderBottomWidth*2;

			self.context.moveTo(0, height);
			self.context.lineTo(width, height);
		}
		if(borderLeftWidth !== 0) {
			// self.context.strokeStyle = getAlphaColor(borderLeftColor, alpha);
			self.context.lineWidth = borderLeftWidth*2;

			self.context.moveTo(0, 0);
			self.context.lineTo(0, height);
		}
		if(borderRightWidth !== 0) {
			// self.context.strokeStyle = getAlphaColor(borderRightColor, alpha);
			self.context.lineWidth = borderRightWidth*2;

			self.context.moveTo(width, 0);
			self.context.lineTo(width, height);
		}

		self.context.stroke();

		self.context.restore();
	}

	function drawBackground(styleProperties, width, height, alpha) {

		var backgroundColor	= styleProperties.getPropertyValue("background-color");

		if(backgroundColor.indexOf("0)") == -1) {
			self.context.save();

			self.context.globalAlpha = alpha;
			self.context.setTransform(1, 0, 0, 1, 0, 0);
			self.context.fillStyle = backgroundColor;
			self.context.fillRect(0, 0, width, height);

			self.context.restore();
		}
	}

	function drawBackgroundImage(image, styleProperties, width, height, alpha) {

		var backgroundRepeat	= styleProperties.getPropertyValue("background-repeat");
		var backgroundPositionX	= styleProperties.getPropertyValue("background-position-x");
		var backgroundPositionY	= styleProperties.getPropertyValue("background-position-y");

		backgroundPositionX = Number(backgroundPositionX.replace("px", ""));
		backgroundPositionY = Number(backgroundPositionY.replace("px", ""));

		self.context.save();

		var pattern = self.context.createPattern(image, backgroundRepeat);
		self.context.globalAlpha = alpha;
		self.context.setTransform(1, 0, 0, 1, 0, 0);
		self.context.translate(backgroundPositionX, backgroundPositionY);
		self.context.fillStyle = pattern;
		self.context.fillRect(-backgroundPositionX, -backgroundPositionY, width+backgroundPositionX, height+backgroundPositionY);

		self.context.restore();
	}

	function drawImage(image, element, styleProperties, offsetX, offsetY, alpha, autoSize, clipRect, clearBlack) {
		// console.log(image, image.width, image.height);
		// console.log(self.canvas, self.canvas.width, self.canvas.height);

		var borderTopWidth 		= styleProperties.getPropertyValue("border-top-width");
		var borderBottomWidth 	= styleProperties.getPropertyValue("border-bottom-width");
		var borderLeftWidth 	= styleProperties.getPropertyValue("border-left-width");
		var borderRightWidth 	= styleProperties.getPropertyValue("border-right-width");
		var paddingTop			= styleProperties.getPropertyValue("padding-top");
		var paddingBottom		= styleProperties.getPropertyValue("padding-bottom");
		var paddingLeft			= styleProperties.getPropertyValue("padding-left");
		var paddingRight		= styleProperties.getPropertyValue("padding-right");
		var width 				= clipRect ? clipRect.width : getWidth(element, styleProperties, true);
		var height 				= clipRect ? clipRect.height : getHeight(element, styleProperties, true);

		paddingTop 			= Number(paddingTop.replace("px", ""));
		paddingBottom 		= Number(paddingBottom.replace("px", ""));
		paddingLeft 		= Number(paddingLeft.replace("px", ""));
		paddingRight 		= Number(paddingRight.replace("px", ""));
		borderTopWidth 		= Number(borderTopWidth.replace("px", ""));
		borderBottomWidth 	= Number(borderBottomWidth.replace("px", ""));
		borderLeftWidth 	= Number(borderLeftWidth.replace("px", ""));
		borderRightWidth 	= Number(borderRightWidth.replace("px", ""));

		if(autoSize)
			self.setSize(width, height);

		drawBackground(styleProperties, width, height, alpha);
		drawBorder(styleProperties, width, height, null, alpha);
		
		width -= paddingLeft + paddingRight + borderLeftWidth + borderRightWidth;
		height -= paddingLeft + paddingRight + borderTopWidth + borderBottomWidth;

		offsetX += paddingLeft + borderLeftWidth;
		offsetY += paddingTop + borderTopWidth;

		self.context.save();
		self.context.globalAlpha = alpha;
		self.context.setTransform(1, 0, 0, 1, 0, 0);
		if(clipRect)
			self.context.drawImage(image, clipRect.x, clipRect.y, clipRect.width, clipRect.height, offsetX, offsetY, width, height);
		else
			self.context.drawImage(image, offsetX, offsetY, width, height);
		if(clearBlack) {
			var imageData = self.context.getImageData(offsetX, offsetY, width, height);
			var i, pixel;
			for(i = 0; i < imageData.data.length; i+=4)
				imageData.data[i+3] = imageData.data[i];
			self.context.putImageData(imageData, offsetX, offsetY);
		}
		self.context.restore();
	}

	function drawMaskedImage(image, element, styleProperties, offsetX, offsetY, alpha, autoSize) {
		var width = getWidth(element, styleProperties, true);
		var height = Math.floor(getHeight(element, styleProperties, true)/2);
		var compositeOperation = self.context.globalCompositeOperation;

		drawImage(image, element, styleProperties, offsetX, offsetY, alpha, autoSize, {x: 0, y: height, width: width, height: height}, true);
		self.context.globalCompositeOperation = "source-in";
		drawImage(image, element, styleProperties, offsetX, offsetY, alpha, autoSize, {x: 0, y: 0, width: width, height: height});
		self.context.globalCompositeOperation = compositeOperation;
	}

	function resizeToElement(element) {
		var styleProperties = window.getComputedStyle(element, null);
		var isImage = element.nodeName == "IMG";
		self.setSize(getWidth(element, styleProperties, isImage), getHeight(element, styleProperties, isImage));
	}

	function getNestedChildren(element, array) {
		var nestedChildren = array || new Array();

		var nestedCountTemp = nestedChildren.length;
		var children = element.children;
		var i, child;
		for (i = 0; i < children.length; i++) {
			child = children[i];
			if(child.childElementCount) {
				getNestedChildren(child, nestedChildren);
				if(nestedChildren.length == nestedCountTemp)
					nestedChildren.push(child);
			} else {
				if(child.nodeName != "BR")
					nestedChildren.push(child);
			}
		}

		return nestedChildren;
	}

	this.addDOMElement = function(element, offsetX, offsetY, color, alpha, autoSize) {
		if(element.childElementCount === undefined)
			return;

		autoSize = autoSize === undefined ? this.autoSize : autoSize;

		offsetX = offsetX || 0;
		offsetY = offsetY || 0;

		if(autoSize)
			resizeToElement(element);

		var children ;
		if(element.childElementCount) {
			children = getNestedChildren(element);
			// console.log(children);

			var i, child, elementRect, childRect;
			for (i = 0; i < children.length; i++) {
				child = children[i];
				elementRect = element.getBoundingClientRect();
				childRect = child.getBoundingClientRect();

				this.addDOMElement(child, childRect.left - elementRect.left + offsetX, childRect.top - elementRect.top + offsetY, color, alpha, false);
			}
		} else
			children = {length: 0};
			
		if(!children.length) {
			switch(element.nodeName) {
				case "SVG":
					this.addSvgElement(element, offsetX, offsetY, color, alpha, autoSize);
					break;
				case "IMG":
					this.addImage(element, offsetX, offsetY, alpha, autoSize);
					break;
				default:
					this.addElement(element, offsetX, offsetY, color, alpha, autoSize);
			}
		}
	};

	this.addImage = function(element, offsetX, offsetY, alpha, autoSize, maskedImage) {
		offsetX = offsetX || 0;
		offsetY = offsetY || 0;

		alpha = alpha === undefined ? 1 : alpha;
		autoSize = autoSize === undefined ? this.autoSize : autoSize;

		// console.log(element, offsetX, offsetY, element.width, element.height);

		var styleProperties = window.getComputedStyle(element, null);

		var image = new Image();
		image.onload = function() {
			if(maskedImage)
				drawMaskedImage(image, element, styleProperties, offsetX, offsetY, alpha, autoSize);
			else
				drawImage(image, element, styleProperties, offsetX, offsetY, alpha, autoSize);
			self.dispatchEvent(new dm.Event(dm.HTMLCanvasElement.EVENT_LOAD));
			self.dispatchEvent(new dm.Event(dm.HTMLCanvasElement.EVENT_UPDATE));
		};
		image.src = dm.Utils.Image.getSrcset(element);
	};

	this.addSvgElement = function(element, offsetX, offsetY, autoSize) { 
		autoSize = autoSize === undefined ? this.autoSize : autoSize;

		if(autoSize)
			resizeToElement(element);
		
		canvg(this.canvas, svgFixIE(element.innerHTML), { ignoreMouse: true, offsetX: offsetX, offsetY: offsetY });
		self.dispatchEvent(new dm.Event(dm.HTMLCanvasElement.EVENT_UPDATE));
	};

	this.addElement = function(element, offsetX, offsetY, color, alpha, autoSize) {
		// if((!element.textContent && !element.value) || (element.textContent === "" && element.value === ""))
		// 	return;

		var styleProperties = window.getComputedStyle(element, null);
		// console.log(element, styleProperties);

		offsetX = offsetX || 0;
		offsetY = offsetY || 0;
		alpha 	= alpha === undefined ? 1 : alpha;
		autoSize = autoSize === undefined ? this.autoSize : autoSize;

		var textAlign 			= styleProperties.getPropertyValue("text-align");
		var whiteSpace 			= styleProperties.getPropertyValue("white-space");
		var fontFamily 			= styleProperties.getPropertyValue("font-family");
		var fontSize 			= styleProperties.getPropertyValue("font-size");
		var fontStyle 			= styleProperties.getPropertyValue("font-style");
		var lineHeight 			= styleProperties.getPropertyValue("line-height");
		var letterSpacing 		= styleProperties.getPropertyValue("letter-spacing");
		var borderTopWidth 		= styleProperties.getPropertyValue("border-top-width");
		var borderLeftWidth 	= styleProperties.getPropertyValue("border-left-width");
		var borderRightWidth 	= styleProperties.getPropertyValue("border-right-width");
		var paddingTop			= styleProperties.getPropertyValue("padding-top");
		var paddingLeft			= styleProperties.getPropertyValue("padding-left");
		var paddingRight		= styleProperties.getPropertyValue("padding-right");
		var backgroundImage		= styleProperties.getPropertyValue("background-image");

		var width 				= getWidth(element, styleProperties);
		var height 				= getHeight(element, styleProperties);

		if(isDesktopChrome) {
			if(element.parentElement)
				element.parentElement.appendChild(this.canvas);
			this.canvas.style.letterSpacing = letterSpacing;
		}

		fontSize 			= Number(fontSize.replace("px", ""));
		lineHeight 			= lineHeight === "normal" ? getLineHeight(element) : Number(lineHeight.replace("px", ""));
		letterSpacing 		= isDesktopChrome || letterSpacing === "normal" ? 0 : Number(letterSpacing.replace("px", ""));
		paddingTop 			= Number(paddingTop.replace("px", ""));
		paddingLeft 		= Number(paddingLeft.replace("px", ""));
		paddingRight 		= Number(paddingRight.replace("px", ""));
		borderTopWidth 		= Number(borderTopWidth.replace("px", ""));
		borderLeftWidth 	= Number(borderLeftWidth.replace("px", ""));
		borderRightWidth 	= Number(borderRightWidth.replace("px", ""));
		
		if(autoSize)
			this.setSize(width, height);

		// var canvasWidth = this.canvas.width;

		// if(element.textContent == "DENNIS MARKGRAF" || element.textContent == "SR DEVELOPER")
		// 	console.log(getLineHeight(element));

		if(textAlign === "center")
			offsetX += width/2;
		else if(textAlign === "right")
			offsetX += width-paddingRight - borderRightWidth;
		else
			offsetX += paddingLeft + borderLeftWidth;

		offsetY += paddingTop + borderTopWidth;

		var text = "";
		if(element.nodeName != "INPUT" && whiteSpace !== "nowrap") {
			// letterSpacing = 0;

			var clone = element.cloneNode();
			clone.style.whiteSpace = "nowrap";	
			element.parentElement.appendChild(clone);

			var startWidth = element.scrollWidth;

			clone.textContent = "";
			if(clone.value)
				clone.value = "";
			var elementText = element.textContent || element.value;
			var lines = elementText ? elementText.split("\n") : [];

			// console.log(lines);

			var i, j, words, word, newLineFound;
			for (i = 0; i < lines.length; i++) {
				clone.textContent = "";
				words = lines[i].split(" ");
				for (j = 0; j < words.length; j++) {
					word = words[j];

					// if(i !== 0 && word === "") {
					// 	text += "\n";
					// 	continue;
					// }

					line = clone.textContent;
					clone.textContent += word;
					if(j != words.length-1)
						clone.textContent += " ";

					if(clone.scrollWidth > startWidth) {
						text += line + "\n";
						clone.textContent = word + " ";
					}
				}

				if(words.length)
					text += clone.textContent;

				if(i != lines.length-1)
					text += "\n";
			}

			element.parentElement.removeChild(clone);
		} else {
			text = element.textContent || element.value;
		}

		drawBackground(styleProperties, width, height, alpha);
		drawBorder(styleProperties, width, height, color, alpha);

		color = color || styleProperties.getPropertyValue("color");
		// color = getAlphaColor(color, alpha);

		this.context.globalAlpha = alpha;

		if(backgroundImage != "none") {
			var imageSource;
			var image;

			if(backgroundImage.indexOf("url(\"") != -1)
				imageSource = backgroundImage.substring(0, backgroundImage.length - 2).replace("url(\"", "");
			else
				imageSource = backgroundImage.substring(0, backgroundImage.length - 1).replace("url(", "");

			// console.log(imageSource);

			var image = new Image();
			image.onload = function() {
				drawBackgroundImage(image, styleProperties, width, height, alpha);
				self.dispatchEvent(new dm.Event(dm.HTMLCanvasElement.EVENT_LOAD));
				self.addText(text, textAlign, fontFamily, fontSize, fontStyle, color, lineHeight, letterSpacing, offsetX, offsetY);
			};
			image.src = imageSource;
		} else
			// console.log(element, element.textContent, textAlign, fontFamily, fontSize, fontStyle, color, lineHeight, letterSpacing, x, canvasWidth);
			this.addText(text, textAlign, fontFamily, fontSize, fontStyle, color, lineHeight, letterSpacing, offsetX, offsetY);


		if(isDesktopChrome) {
			if(element.parentElement)
				element.parentElement.removeChild(this.canvas);
			this.canvas.style.letterSpacing = null;
		}

		this.context.globalAlpha = 1;
	};

	this.addText = function(text, textAlign, fontFamily, fontSize, fontStyle, color, lineHeight, letterSpacing, x, y) {

		fontFamily 	= fontFamily || "'serif'";
		textAlign 	= textAlign || "left";
		fontSize 	= fontSize || 16;
		fontStyle 	= fontStyle || "normal";
		color 		= color || "#000000";

		lineHeight = lineHeight || fontSize;

		this.context.save();

		this.context.font = fontStyle + " " + fontSize + "px " + fontFamily;
		// console.log(this.context.font);
		this.context.fillStyle = color;
		this.context.translate(x || 0, y || 0);
		this.context.translate(0, (fontSize+lineHeight)/2);
		this.context.textAlign = textAlign;

		this.context.lineWidth = 1;
      	this.context.strokeStyle = color;

		// this.context.rotate(rotation * Math.PI / 180);

		// console.log(this.context.font, this.context.fillStyle);
		// console.log(fontStyle + " " + fontSize + "px " + fontFamily);

		var i;
		var lines = text.split("\n");
		// console.log(lines);
		for (i = 0; i < lines.length; i++)
 			this.addTextLine(lines[i], 0, i*lineHeight, letterSpacing, false, false);

		this.context.restore();
		self.dispatchEvent(new dm.Event(dm.HTMLCanvasElement.EVENT_UPDATE));
	};

	this.addTextLine = function(text, x, y, letterSpacing, saveRestore, dispatch) {
		if(letterSpacing === "normal" || letterSpacing === 0) {
			// console.log(letterSpacing);
			// this.context.fillText(text, x, y);
			this.context.strokeText(text, x, y);
			return;
		}

		if (!text || typeof text !== "string" || text.length === 0)
            return;
        
        if (!letterSpacing)
        	letterSpacing = 0;

        saveRestore = saveRestore !== false;
        dispatch = dispatch !== false;
        
        var characters = text.split("");
        var index = 0;
        var current;
        var currentPosition = x;
        var align = 1;

        if(saveRestore)
        	this.context.save();
        
        if (this.context.textAlign === "right") {
            characters = characters.reverse();
            align = -1;
        } else if (this.context.textAlign === "center") {
            var totalWidth = 0;
            for (var i = 0; i < characters.length; i++) {
                totalWidth += this.context.measureText(characters[i]).width;
                if(i != characters.length-1)
                	totalWidth += letterSpacing;
            }
            currentPosition = x - (totalWidth / 2);
        }
        

        while (index < text.length) {
            current = characters[index++];
            // this.context.fillText(current, currentPosition, y);
            this.context.strokeText(current, currentPosition, y);
            currentPosition += (align * (this.context.measureText(current).width + letterSpacing));
        }

        if(saveRestore)
        	this.context.restore();

        if(dispatch)
        	self.dispatchEvent(new dm.Event(dm.HTMLCanvasElement.EVENT_UPDATE));
	};

	this.setSize = function(width, height) {
		if(width == this.canvas.width && height == this.canvas.height)	
			return;

		this.canvas.width = width;
		this.canvas.height = height;

		// console.error(width, height);
		var scale = 1;
		if(this.useDevicePixelRatio && window.devicePixelRatio)
			scale = 1/window.devicePixelRatio;
		
		this.dispatchEvent(new dm.Event(dm.HTMLCanvasElement.EVENT_RESIZE, {width: width * scale, height: height * scale}));
	};

	this.clear = function() {
		this.context.clearRect (0 , 0, this.canvas.width, this.canvas.height);
	};
};
dm.HTMLCanvasElement.prototype = Object.create(dm.HTMLElement.prototype);
dm.HTMLCanvasElement.EVENT_UPDATE = "update";
dm.HTMLCanvasElement.EVENT_LOAD = "load";
dm.HTMLCanvasElement.EVENT_RESIZE = "resize";
