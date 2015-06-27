if(typeof dm === "undefined") dm = new Object();

dm.Event = function(type, data, bubble) {
	this.target = null;
	this.currentTarget = null;
	this.type = type;
	this.data = data;
	this.bubble = bubble;
	this.isBubbling = false;
	
	this.getType = function() {
		return this.type;
	};
	
	this.getdata = function() {
		return this.data;
	};
	
	this.getBubble = function() {
		return this.bubble;
	};
};

dm.EventTarget = function() {
	
	var listeners = new Object();
	var listenersdata = new Object();
	var listenersCallees = new Object();
	
//	console.info("EventTarget constructor", self);
	
	function bubbleEvent(parent) {
		
	}
	
	this.addEventListener = function(type, listener, callee, data) {
		
		if(!listeners[type]) {
			listeners[type] = new Array();
			listenersdata[type] = new Array();
			listenersCallees[type] = new Array();
		}
		
		if(listeners.length == 0 || listeners[type].indexOf(listener) == -1) {
			listeners[type].push(listener);
			listenersdata[type].push(data);
			listenersCallees[type].push(callee);
		}
	};
		
	this.removeEventListener = function(type, listener) {
		if(!listeners[type]) return;
		
		var index = listeners[type].indexOf(listener)
		if(index != -1) {
			listeners[type].splice(index, 1);
			listenersdata[type].splice(index, 1);
		}
	};
		
	this.hasEventListener = function(type, listener) {
		return listeners.length > 0 && listeners[type] && listeners[type].indexOf(listener) != -1;
	};
		
	this.dispatchEvent = function(event) {
//		console.info(event, event.type, listeners);
		
		if(!event || (event && (!event.type || event.type == ""))) return;
		
		if(!event.isBubbling)
			event.currentTarget = this;
		event.target = this;
		
		if(listeners[event.type] && listeners[event.type].length > 0) {
			var listener = listeners[event.type];
			var i, j, data, dataKeys, callee, key;
			for(i = 0; i<listener.length; i++) {
				data = listenersdata[event.type][i];
				callee = listenersCallees[event.type][i];
				if(data) {
					if(!event.data)
						event.data = data;
					else {
						dataKeys = Object.keys(data);
						for (j = 0; j < dataKeys.length; j++) {
							key = dataKeys[j];
							event.data[key] = data[key];
						}						
					}
				}
				listener[i].call(callee || this, event);
			}
		}
		if(event.bubble && this.parent && this.parent.isEventDispatcher) {
			event.isBubbling = true;
			this.parent.dispatchEvent(event);
		}
	};
	
	this.isEventDispatcher = true;
};

if(typeof dm === "undefined") dm = new Object();

dm.HTMLElement = function(element, id, className, style) {
	dm.EventTarget.call(this);
	var self = this;
	
	this.id = id;
	this.className = className;
	this.style = style;
	this.parent = null;

	this.isSelectable = true;
	this.isFullscreen = false;

	this.children = new Array();
	this.transitions = new Object();
	
	function addDefaultListener() {
		if (typeof document.body.style['transition'] != "undefined")
			self.element.addEventListener('transitionend', transitionEndHandler);

		else if (typeof document.body.style['WebkitTransition'] != "undefined")
			self.element.addEventListener('webkitTransitionEnd', transitionEndHandler);

		else if (typeof document.body.style['MozTransition'] != "undefined")
			self.element.addEventListener('transitionend', transitionEndEventHandler);

		else if (typeof document.body.style['OTransition'] != "undefined")
			self.element.addEventListener('oTransitionEnd', transitionEndHandler);
	}

	function transitionEndHandler(event) {
		if(event.target != self.element)
			return;
			
		//if(event.stopPropagation)
			//event.stopPropagation();
		
		var transition = self.getTransition(event.propertyName);
		
		if(self.transitions[1]) {
			var transitions = self.transitions[1][event.propertyName];
			if(transitions) {
				delete self.transitions[1][event.propertyName];
				self.updateTransitionString();
			}
		}
		
		if(transition && transition[1])
			transition[1].call(transition[2] || self);
		
		self.dispatchEvent(new dm.Event("transitionend", event));
	}

	function fullscreenChangeHandler(event) {
		var isFullscreen = document.isFullscreen || document.mozIsFillScreen
				|| document.webkitIsFullScreen;

		self.isFullscreen = isFullscreen;

		self.dispatchEvent(new dm.Event("fullscreenchange", { isFullscreen : isFullscreen}));
	}
	
	function validateProperty(property, lowercase) {
		var regex = self.ATTRIBUTE_REGEX;
		if(regex.test(property)) 
			property = property.replace(regex, function(match, firstLetter){return firstLetter.toUpperCase();});
		
		if(typeof(document.body.style[property]) != "undefined") 
			if(lowercase) {
				if(property.indexOf(self.VENDOR_PREFIX) == -1)
					return getCssProperty(property);
				else
					property = property.replace(self.VENDOR_PREFIX, "");
			} else
				return property;
		
		var vendorProperty = self.VENDOR_PREFIX + property.charAt(0).toUpperCase() + property.slice(1);
		if(typeof document.body.style[vendorProperty] != "undefined") 
			if(lowercase)
				return "-"+getCssProperty(vendorProperty);
			else
				return vendorProperty;
		
		if(property == "float" && document.body.style["cssFloat"] != "undefined")
			return "cssFloat";
			
		//console.error("no valid property found for ", property);
	}
	
	function validateProperties(properties, lowercase) {
		var validatedObject = new Object();
		for(var property in properties)
			validatedObject[validateProperty(property, lowercase)] = properties[property];
		return validatedObject;
	}
	
	function getCssProperty(property) {
		return property.replace(/[A-Z]/g, function(match){return "-"+match.toLowerCase();});
	}
	
	function hasClassTransition() {
		var classNames = self.getClassNames();
		for(var i = 0; i < classNames.length ; i++)
			if(self.transitions[classNames[i]])
				return true;
		
		return false;
	}

	this.addChild = function(child) {
		this.children.push(child);
		child.setParent(this);

		return child;
	};
	
	this.addChildAt = function(child, index) {
		this.addChild(child);
		this.setChildIndex(child, index);
		
		return child;
	};

	this.removeChild = function(child) {
		this.children.splice(this.children.indexOf(child), 1);
		child.setParent(null);

		return child;
	};

	this.createElement = function(src) {
		if (!src)
			return;
		
//		var classNames;
		if (typeof src == "string") {
			this.element = document.createElement('div');
			this.element.innerHTML = src;
			this.element = this.element.firstChild;
		} else {
			this.element = src;
//			classNames = this.getClassNames().join(" ");
		}
		
		this.parent = this.element.parentElement;
		this.setId(this.id || this.element.id);
		if(this.style)
			this.setStyle(this.style);
		else
			this.style = this.element.style;
//		this.setClassName((classNames ? classNames+" " : "")+(this.className || ""));
		
		var classNameToAdd = this.className;
		this.className = this.getClassNames().join(" ");
		this.addClassName(classNameToAdd || "");
		
		addDefaultListener();
	};

	this.appendToElement = function(parentElement) {
		parentElement.appendChild(this.element);
	};
	
	this.setStyle = function(style, validate) {
		if (!style) return;
		validate = validate == undefined ? true : validate;
		
		for ( var key in style) {
			var property = validate ? validateProperty(key) : key;
			if(property)
				this.element.style[property] = style[key] == null ? "" : style[key];
		}
		this.style = this.element.style;
	};

	this.setId = function(id) {
		this.id = (!id || id == "") ? null : id;
		if(this.element) {
			if(this.id)
				this.element.id = this.id;
			else
				this.element.removeAttribute('id');
		}
	};

	this.setClassName = function(className) {
//		if (!className && className != "")
//			return;
//		this.element.className = this.className = className == "" ? null : className;
		this.className = (!className || className == "") ? null : className;
		if(this.className)
			this.element.setAttribute("class", this.className);
		else
			this.element.removeAttribute("class");
			
		this.updateTransitionString();
	};

	this.addClassName = function(className) {
		if(!className || className == "" || (this.className && this.hasClassName(className)))
			return;
		var startString = this.className && this.className != "" ? this.className + " " : "";
		this.setClassName( startString + className );
	};
	
	this.toggleClassName = function(className) {
		var classNames = this.getClassNames();
		var index = classNames.indexOf(className);
		if(index != -1)
			classNames.splice(index, 1);
		else
			classNames.push(className);
		
		this.setClassName(classNames.join(" "));
	};

	this.removeClassName = function(className) {
		if (!this.className)
			return;
		var classNames = this.getClassNames();
		var index = classNames.indexOf(className);
		if (index == -1)
			return;
		classNames.splice(index, 1);
		this.setClassName(classNames.join(" "));
	};

	this.setParent = function(targetParent) {
		if (targetParent){
			if(targetParent.element != this.element.parentElement)
				targetParent.element.appendChild(this.element);
		} else if (this.parent)
			this.parent.element.removeChild(this.element);
		
		this.parent = targetParent;
	};
	
	this.setIndex = function(index) {
		if(!this.parent) return;
		var children = this.parent.children
		
		if(index < 0)
			if(children.length <= -index)
				index = 0;
			else
				index = children.length+index;
		if(children.length < index)
			index = children.length-1;
		
		
//		log(parentElement, index, childIndex);
		
		if(this.parent.isDisplayObject)
			this.parent.setChildIndex(this, index);
		else {			
			var childIndex = this.getIndex();
			var nextChild = childIndex > index ? this.parent.children[index] : this.parent.children[index+1];
	    	this.parent.insertBefore(nextChild);
		}
	};
	
	this.setChildIndex = function(child, index) {
		var childIndex = this.getChildIndex(child);
		if(childIndex == index) return;
		
		if(child.isDisplayObject) {
			var nextChild = childIndex > index ? this.children[index] : this.children[index+1];
			
			this.children.splice(childIndex, 1);
			this.children.splice(index, 0, child);
			
			if(nextChild)
				this.element.insertBefore(child.element, nextChild.element);
			else
				this.element.appendChild(child.element);			
		}
	};
	
	this.setPointer = function(pointer) {
		if (pointer)
			this.setStyle({ cursor : "pointer" });
		else
			this.setStyle({ cursor : null });
	};
	
	this.setPointerEvents = function(pointerEvents, force) {
		if (pointerEvents) {
			if(force)
				this.setStyle({ pointerEvents : "all" });			
			else
				this.setStyle({ pointerEvents : null });
		} else
			this.setStyle({ pointerEvents: "none" });
	};

	this.setSelectable = function(selectable) {
		this.isSelectable = selectable;

		if (!selectable) {
			this.setStyle({
				userSelect : "none"
			});
		} else {
			this.setStyle({
				userSelect : null
			});
		}
	};
	
	this.setVisible = function(visible) {
		if(visible)
			this.setStyle({display: null});
		else
			this.setStyle({display: "none"});
	};

	this.toggleFullscreen = function() {
		if (this.isFullscreen)
			this.cancelFullscreen();
		else
			this.requestFullscreen();
	};

	this.requestFullscreen = function() {
		this.isFullscreen = true;

		if (this.element.requestFullscreen)
			this.element.requestFullscreen();
		else if (this.element.mozRequestFullScreen)
			this.element.mozRequestFullScreen();
		else if (this.element.webkitRequestFullscreen)
			this.element.webkitRequestFullscreen();

		document.addEventListener("fullscreenchange", fullscreenChangeHandler);
		document.addEventListener("webkitfullscreenchange", fullscreenChangeHandler);
		document.addEventListener("mozfullscreenchange", fullscreenChangeHandler);
	};

	this.cancelFullscreen = function() {
		this.isFullscreen = false;

		if (this.element.cancelFullscreen)
			this.element.cancelFullscreen();
		else if (this.element.mozCancelFullScreen)
			this.element.mozCancelFullScreen();
		else if (this.element.webkitCancelFullScreen)
			this.element.webkitCancelFullScreen();
	};
	
	this.transitionFrom = function(startValues, values, duration, timingFunction, delay, callback) {
		this.setStyle(startValues);
		
		window.setTimeout( function() {
			self.transition(values, duration, timingFunction, delay, callback);
		}, 50);
	};
	
	this.transition = function(values, duration, timingFunction, delay, callback, callee) {
		if (duration == 0) return;
		
		values = validateProperties(values)
		
		var value;
		var properties = new Array();
		var property;
		var propertyFound = false;
		var supportsTransition = validateProperty("transition");
		
		for(property in values) {
			value = String(values[property]);
			// console.log(property, this.getComputetStyleProperty(property), this.style[property], value);
			// if (this.style[property] && this.style[property] == values[property])
			if (this.style[property] == value || this.getComputetStyleProperty(property) == value)
				delete values[property];
			else {
				propertyFound = true;
				properties.push(property);
			}
		}

		if(!propertyFound && callback) {	
			callback.call(callee || this);
			return;
		}
		
		if(properties.length) {
			if(supportsTransition)
				this.addTransitions(1, properties, duration, timingFunction, delay, callback, callee, true);
			
			window.setTimeout( function() {
				self.setStyle(values, false);
				if(!supportsTransition && callback)
					callback.call(callee || this);
			}, Number.MIN_VALUE);
		}
	};

	this.addTransition = function(className, property, duration, timingFunction, delay, callback, callee, override, update) {
		className = className || 0;
		if(!this.transitions[className]) this.transitions[className] = new Object();
		if(!override && this.transitions[className][property]) return;
		update = update == false ? false : true;
		timingFunction = timingFunction || "ease";
		property = validateProperty(property, true);
		var transitionString = property + " " + (duration || 0) + "s" + ((delay || timingFunction != "ease") ? " " + timingFunction : "" ) + (delay ? " " + delay + "s" : "");
		
		this.transitions[className][property] = new Object();
		this.transitions[className][property][0] = transitionString;
		this.transitions[className][property][1] = callback;
		this.transitions[className][property][2] = callee;
		if (update) this.updateTransitionString();
		
		return transitionString;
	};
	
	this.addTransitions = function(className, properties, durations, timingFunctions, delays, callback, callee, override, update) {
		update = update == false ? false : true;
		var multipleDurations = !(!durations || typeof (durations) == "number");
		var multipleTimingFunctions = !(!timingFunctions || typeof (timingFunctions) == "string");
		var multipleDelays = !(!delays || typeof (delays) == "number");
		
		var transitionStrings = new Array();
		var transitionString;
		var transitions;
		var property;
		for ( var i = 0; i < properties.length; i++) {
			transitions = this.transitions[className || 0];
			property = validateProperty(properties[i], true);
			if(!override && transitions && transitions[property])
				continue;
			
			transitionString = this.addTransition(
					className,
					property,
					multipleDurations ? durations[i] : durations,
					multipleTimingFunctions ? timingFunctions[i] : timingFunctions, 
					multipleDelays ? delays[i] : delays,
					i === 0 ? callback : null,
					i === 0 ? callee : null,
					override,
					false);
			
			transitionStrings.push(transitionString);
		}
		
		if (update) this.updateTransitionString();
		return transitionStrings;
	};
	
	this.updateTransition = function(className, property, duration, timingFunction, delay ) {
		className = className || 0;
		var transitions = this.transitions[className];
		if(!transitions) return;
		
		property = validateProperty(property, true);
		var transition = transitions[property][0];
		if(!transition) return;
		
		transition = transition.split(" ");
		for ( var i = 1; i < 4; i++) {
			if(i == 1 && duration !== undefined) 
				transition[1] = duration+"s";
			if(i == 2 && timingFunction) 
				transition[2] = timingFunction;
			if(i == 3 && delay !== undefined) 
				transition[3] = delay+"s";
		}
		
		transitions[property][0] = transition.join(" ");
		
		this.updateTransitionString();
	};

	this.updateTransitionString = function() {
		
		var styleTransitionString = "";
		var mergedTransitions;
		var supportsTransition = validateProperty("transition");
		
		var i, key, hasKeys;
		for(key in this.transitions[1]) {
			hasKeys = true;
			break;
		}
		
		if(hasKeys)
			mergedTransitions = dm.Utils.Object.clone(this.transitions[1]);
		else 
			mergedTransitions = dm.Utils.Object.clone(this.transitions[0]);
		
		//if(!this.transitions[1] && this.className) {
		if(this.className) {
			var className;
			var transitions;

			i = 0;
			
			if(!mergedTransitions)
				mergedTransitions = new Object();
			
			//if(this.transitions[0])
			if(this.transitions[0] && hasKeys)
				for(key in this.transitions[0])
					mergedTransitions[key] = this.transitions[0][key];
			
			var classNames = this.getClassNames();
			for(i = 0; i < classNames.length ; i++) {
				className = classNames[i];
				transitions = this.transitions[className];
				if(transitions)
					for(key in transitions)
						mergedTransitions[key] = transitions[key];
			}
		}
		
		i = 0;
		for(key in mergedTransitions) {
			if(supportsTransition) {
				if (i != 0)
					styleTransitionString += ", ";
				styleTransitionString += mergedTransitions[key][0];
				i++;				
			} else
				transitionEndHandler({target: this.element, propertyName: key});
		}
		
		//if(styleTransitionString != "") console.log(styleTransitionString);
		if(supportsTransition)
			this.setStyle({
				transition : styleTransitionString == "" ? null : styleTransitionString
			});
	};
	
	this.getTransition = function(property, className) {
		if(className)
			return this.transitions[className || 0][property];
		
		var classNames = this.getClassNames();
		classNames.unshift(0);
		classNames.push(1);
		
		var transitions;
		var transition;
		for(var i = 0; i < classNames.length ; i++) {
			transitions = self.transitions[classNames[i]];
			if(transitions && transitions[property])
				transition = transitions[property];
		}
		
		return transition;
	};
	
	this.getComputetStyleProperty = function(property, asNumber) {
		var styleProperty = window.getComputedStyle(this.element, null).getPropertyValue(property);
		if(asNumber)
			return Number(styleProperty.replace("px", ""))
			
		return styleProperty;
	};
	
	this.getClassNames = function() {
		if(!this.element.className) return new Array();
		
		if(this.element.className.split)
			return this.element.className.split(" ");
		
		if(this.element.className.baseVal)
			return this.element.className.baseVal.split(" ");
		
		var elementClassList = this.element.classList;
		if(elementClassList) {
			var classList = new Array();
			for ( var i = 0; i < elementClassList.length; i++)
				classList.push(elementClassList[i]);
			
			return classList;
		}
		
		return new Array();
	};
	
	this.getIndex = function() {
		var index;
		if(this.parent.isDisplayObject)
			index = this.parent.getChildIndex(this);
		else {
			index = 0;
			var child = this.element;
			while( (child = child.previousSibling) != null ) 
				index++;
		}
		
		return index;
	};
	
	this.isVisible = function() {return !(this.getComputetStyleProperty("display") === "none")}
	
	this.hasClassName = function(className) {return this.getClassNames().indexOf(className) != -1}
	this.getChildIndex = function(child) { return this.children.indexOf(child) }
	this.getStyleProperty = function(property) {return this.style[property]}
	
	this.getChildren = function() { return this.children; }
	this.getId = function() { return this.element.id; }
	this.getStyle = function() { return this.style; }
	this.getClassName = function() { return this.className; }
	this.getElement = function() { return this.element; }
	this.getParent = function() { return this.parent; }

	this.getWidth = function() { return this.element.offsetWidth };
	this.getHeight = function() { return this.element.offsetHeight };

	this.getIsSelectable = function() { return this.isSelectable; }
	this.getIsFullscreen = function() { return this.isFullscreen; }

	this.createElement(element);
	
	this.isDisplayObject = true;
};

dm.HTMLElement.prototype = Object.create(dm.EventTarget.prototype);
dm.HTMLElement.prototype.ATTRIBUTE_REGEX = /\-([a-z])/gi;
	
document.addEventListener('DOMContentLoaded', function() {
	dm.HTMLElement.prototype.VENDOR_PREFIX = function() {
		var regex = /^(Moz|Webkit|webkit|Khtml|O|ms|Icab)(?=[A-Z])/;
		var vendorPrefix = "";
		
		for(var key in document.body.style)
			if(regex.test(key))
				return vendorPrefix = key.match(regex)[0];
		
		regex = /(moz|webkit|ms)/;
		
		var i, property;
		var styleProperties = window.getComputedStyle(document.documentElement, '');
		for (i = 0; i < styleProperties.length; i++) {
			property = styleProperties[i];
			if(regex.test(property))
				return property.match(regex)[0];
		}
		
	}();
});

if(typeof dm === "undefined") dm = new Object();
dm.Utils = new Object();

dm.Utils.Math = {
	random: function( min, max, digits)
	{
		digits = digits || 0;
		return Number( ( Math.random() * ( max - min ) ).toFixed( digits ) ) + min;
	},
	
	percentage : function(base, value) {
		return value / (base / 100);
	},
	
	interpolate : function(start, end, percentage) {
		return start + (end - start) * percentage;
	},

	interpolate2 : function(start, end, percentage) {
		return (1 - percentage) * start + percentage * end;
	},
	
	distance : function(x1, y1, x2, y2) {
	  var xs = 0;
	  var ys = 0;
	 
	  xs = x2 - x1;
	  xs = xs * xs;
	 
	  ys = y2 - y1;
	  ys = ys * ys;
	 
	  return Math.sqrt( xs + ys );
	},
	
	angle : function(x1, y1, x2, y2) {
		var angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
		return angle < 0 ? angle + 360 : angle;
    },

    percSin : function(percentage, scale, offset, digits) {
    	scale = 1/scale || 1;
    	offset = offset || 0;
    	digits = 10 * digits || 100;
    	return Math.round(Math.sin((offset + percentage) * (Math.PI/2 * scale)) * digits) / digits;
    }
};

dm.Utils.Color = {
	hsv2rgb : function(h, s, v) {
		// adapted from
		// http://schinckel.net/2012/01/10/hsv-to-rgb-in-javascript/
		var rgb, i, data = [];
		if (s === 0) {
			rgb = [ v, v, v ];
		} else {
			h = h / 60;
			i = Math.floor(h);
			data = [ v * (1 - s), v * (1 - s * (h - i)),
					v * (1 - s * (1 - (h - i))) ];
			switch (i) {
			case 0:
				rgb = [ v, data[2], data[0] ];
				break;
			case 1:
				rgb = [ data[1], v, data[0] ];
				break;
			case 2:
				rgb = [ data[0], v, data[2] ];
				break;
			case 3:
				rgb = [ data[0], data[1], v ];
				break;
			case 4:
				rgb = [ data[2], data[0], v ];
				break;
			default:
				rgb = [ v, data[0], data[1] ];
				break;
			}
		}
		
		for (i = 0; i < rgb.length; i++)
			rgb[i] = Math.round(rgb[i] * 255);
		
		return rgb;
	},
	
	hsv2hex : function(h, s, v) {
		var rgb = hsv2rgb(h, s, v);
		return '#' + rgb.map(function(x) {
			return ("0" + x.toString(16)).slice(-2);
		}).join('');
	},

	rgbToHex : function(r, g, b) {
	    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1,7);
	},
	
	hexToRgb : function(hex) {
		var bigint = parseInt(hex, 16);
	    var r = (bigint >> 16) & 255;
	    var g = (bigint >> 8) & 255;
	    var b = bigint & 255;

	    return [r, g, b];
	}
};

dm.Utils.Date = {
	convert : function(timestamp, pattern) {
		var date = new Date(timestamp.replace(/-/g, "/"));
		
		var day = date.getDate();
		if(day<10) day = "0"+day;
		
		var month = date.getMonth()+1;
		if(month<10) month = "0"+month;
		
		var hours = date.getHours();
		if(hours<10) hours = "0"+hours;
		
		var minutes = date.getMinutes();
		if(minutes<10) minutes = "0"+minutes;
		
		if(!pattern)
			return day+"."+month+"."+date.getFullYear()+"; "+hours+":"+minutes;
		else {
			pattern = pattern.replace("d", day);
			pattern = pattern.replace("m", month);
			pattern = pattern.replace("Y", date.getFullYear());
			pattern = pattern.replace("H", hours);
			return pattern.replace("i", minutes);
		}
	}
};

dm.Utils.Draw = {
		
	getGap : function(x, y, x2, y2, minDistance, maxDistance) {
		minDistance = minDistance || 3;
		maxDistance = maxDistance || 250;

		var coordsArray = new Array();
		coordsArray.push({x: x, y: y});
		
		var xLength = x2 - x;
		var yLength = y2 - y;
		var distance  = Math.sqrt( Math.pow( xLength, 2 ) + Math.pow( yLength, 2 ) );
		
		if( distance > minDistance && distance < maxDistance ) {
			var i;
			for(i = 1; i < ( distance / minDistance ) + 1; i++ )
				coordsArray.push({x: x + ( xLength / ( distance / minDistance ) ) * i, y: y+ ( yLength / ( distance / minDistance ) ) * i } );
		}
		
		return coordsArray;
	}
};

dm.Utils.Object = {
	clone : function(object) {
	    if(object === null || typeof object != "object") return object;
	    var copy = new object.constructor();
	    for (var attr in object) {
	        if (object.hasOwnProperty(attr)) copy[attr] = object[attr];
	    }
	    return copy;
	},
	
	merge : function(target, object, createObject) {
		if(createObject) target = dm.Utils.Object.clone(target);
		for (var attr in object)
			target[attr] = object[attr];
		
		return target;
	},

	toQueryString : function(object){
	    var k = Object.keys(object);
	    var s = "";
	    for(var i=0;i<k.length;i++) {
	        s += k[i] + "=" + encodeURIComponent(object[k[i]]);
	        if (i != k.length -1) s += "&";
	    }
	    return s;
	 }
};


dm.Utils.Image = {
	getSrcset : function(image) {
		var src = image.src;


		if(image.srcset) {
			var windowWidth = window.innerWidth || document.documentElement.clientWidth;
			var windowHeight = window.innerHeight || document.documentElement.clientHeight;


			var pixelRatio = window.devicePixelRatio || 1;
			var srcsetParts = image.srcset.split(",");

			var minW = windowWidth/pixelRatio;
			var minH = windowHeight/pixelRatio;

			// var matches = new Array();
			
			var i, j, parts, part, x, w, h;
			for (i = 0; i < srcsetParts.length; i++) {

				parts = srcsetParts[i].split(" ");

				if(parts.length != 2)
					continue;

				x = pixelRatio;
				w = 0;
				h = 0;

				part = parts[1];
				if(part.slice(-1) == "x") {
					x = Number(part.slice(0, -1));
					if( x == pixelRatio)
						src = parts[0];
				}

				if(part.slice(-1) == "w") {
					w = Number(part.slice(0, -1));
					w /= pixelRatio;
					if( w <= minW)
						src = parts[0];
				}

				if(part.slice(-1) == "h") {
					h = Number(part.slice(0, -1));
					h /= pixelRatio;
					if( x <= minH)
						src = parts[0];
				}

				// console.log(src, x, w, h);

				// if(x == pixelRatio && w <= windowWidth && h <= windowHeight) 
				// 	matches.push([src, x, w, h]);
			}

			// console.log(matches);
		}

		return src;	
	}
};


dm.Utils.Form = {
	setFormDisabled : function(form, disabled) {
		var dataElements = form.querySelectorAll("input, textarea, select, option, button");
		var i, dataElement;
		for(i=0; i < dataElements.length; i++)
			dataElements[i].disabled = disabled;
	},
	
	resetForm : function(form) {
		var formElements = form.querySelectorAll("input:not([type=\"submit\"]), textarea, select, option");
		var i, formElement;
		for(i=0; i < formElements.length; i++) {
			formElement = formElements[i];
			switch(formElement.type) {
				case "checkbox":
					formElement.checked = false;
					break;
				default:
					formElement.value = "";
					break;
			}
		}
	},
	
	getFormValue : function(formElement) {
		switch(formElement.type) {
			case "checkbox":
				if(formElement.name.indexOf("[]" != -1)) {
					if(formElement.checked)
						return formElement.value;
					else
						return false;
				} else
					return formElement.checked ? 1 : 0;
				break;
			default:
				return formElement.value;
		}
	},
	
	getFormDataQuery : function(form) {
		var dataValues = new Array();
		var dataElements = form.querySelectorAll("input:not([type=\"submit\"]), textarea, select, option");
		var i, dataElement, value;
		for(i=0; i < dataElements.length; i++) {
			dataElement = dataElements[i];
			value = dm.Utils.Form.getFormValue(dataElement);
			if(value !== false)
				dataValues.push(dataElement.name+"="+encodeURIComponent(value));
		}

		return dataValues.join("&");
	},
	
	toQueryString : function(obj) {
	    var parts = [];
	    for (var i in obj) {
	        if (obj.hasOwnProperty(i)) {
	            parts.push(encodeURIComponent(i) + "=" + encodeURIComponent(obj[i]));
	        }
	    }
	    return parts.join("&");
	},
	
	getMultiPartFormData : function(form, boundary, filesData) {
		var body = "";
		var newLine = "\r\n";
		
		var dataElements = form.querySelectorAll("input:not([type=\"submit\"]), textarea, select, option");
		var i, dataElement, value;
		for(i=0; i < dataElements.length; i++) {
			dataElement = dataElements[i];
			
			if(dataElement.value === "");
				continue;
			body += "--"+boundary+newLine;
			body += "Content-Disposition: form-data; name=\""+dataElement.name+"\""+newLine;
			if(dataElement.type && dataElement.type != "file") {
				value = dm.Utils.Form.getFormValue(dataElement);
				if(value !== false) {
					body += newLine;
					body += value+newLine;			
				}
			} else if(filesData[dataElement.name]){
				body += "Content-Type: application/octet-stream"+newLine+newLine;
				body += filesData[dataElement.name]+newLine;
			}
		}
		body += "--"+boundary+"--";	
		
		return body;
	},
	
	getFormData : function(form) {
		var dataValues = new Object();
		var dataElements = form.querySelectorAll("input:not([type=\"submit\"]), textarea, select, option");
		var i, dataElement, value;
		for(i=0; i < dataElements.length; i++) {
			dataElement = dataElements[i];
			dataValues[dataElement.name] = dm.Utils.Form.getFormValue(dataElement);
		}

		return dataValues;
	},

	validateEmail: function(email) {
	    var regex = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
	    return regex.test(email);
	}
};

dm.Utils.CSS = {
	getFontFaces : function() {
		var sheets = document.styleSheets;
		var fontFaces = new Array();

		var i, j, fontFamily;
        for (i = 0; i < sheets.length; i += 1) {
            var rules = sheets[i].cssRules;

            for (j = 0; j < rules.length; j += 1)
                if (rules[j].constructor === CSSFontFaceRule) {
                	fontFamily = rules[j].style.getPropertyValue("font-family").replace(/'|"/g, "");
                	if(fontFaces.indexOf(fontFamily) == -1)
                		fontFaces.push(fontFamily);
                }
        }
        return fontFaces;
    }
};

if(typeof dm === "undefined") dm = new Object();

dm.HTMLCanvasElement = function(element, canvas, autoSize) {
	dm.HTMLElement.call(this, element);

	this.canvas = canvas || document.createElement("canvas");
	this.context = this.canvas.getContext("2d");
	// console.log(this.context);

	var self = this;

	var userAgend = navigator.userAgent;
	var isDesktopChrome = !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile/i.test(userAgend) && /Chrome/i.test(userAgend);
	isDesktopChrome = false;

	this.autoSize = autoSize !== false;

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

		var width = element.offsetWidth;

		if(self.useDevicePixelRatio && window.devicePixelRatio)
			width *= window.devicePixelRatio;

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

		var height = element.offsetHeight;

		if(self.useDevicePixelRatio && window.devicePixelRatio)
			height *= window.devicePixelRatio;

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

	function drawImage(image, element, styleProperties, offsetX, offsetY, alpha, autoSize) {
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
		var width 				= getWidth(element, styleProperties, true);
		var height 				= getHeight(element, styleProperties, true);

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
		self.context.drawImage(image, offsetX, offsetY, width, height);
		self.context.restore();
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

	this.addImage = function(element, offsetX, offsetY, alpha, autoSize) {
		offsetX = offsetX || 0;
		offsetY = offsetY || 0;

		alpha = alpha === undefined ? 1 : alpha;
		autoSize = autoSize === undefined ? this.autoSize : autoSize;

		// console.log(element, offsetX, offsetY, element.width, element.height);

		var styleProperties = window.getComputedStyle(element, null);

		var image = new Image();
		image.onload = function() {
			drawImage(image, element, styleProperties, offsetX, offsetY, alpha, autoSize);
			self.dispatchEvent(new dm.Event("load"));
			self.dispatchEvent(new dm.Event("update"));
		};
		image.src = dm.Utils.Image.getSrcset(element);
	};

	this.addSvgElement = function(element, offsetX, offsetY, autoSize) { 
		autoSize = autoSize === undefined ? this.autoSize : autoSize;

		if(autoSize)
			resizeToElement(element);
		
		canvg(this.canvas, svgFixIE(element.innerHTML), { ignoreMouse: true, offsetX: offsetX, offsetY: offsetY });
		self.dispatchEvent(new dm.Event("update"));
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
				self.dispatchEvent(new dm.Event("load"));
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
		self.dispatchEvent(new dm.Event("update"));
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
        	self.dispatchEvent(new dm.Event("update"));
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

		this.dispatchEvent(new dm.Event("resize", {width: width * scale, height: height * scale}));
	};

	this.clear = function() {
		this.context.clearRect (0 , 0, this.canvas.width, this.canvas.height);
	};
};
dm.HTMLCanvasElement.prototype = Object.create(dm.HTMLElement.prototype);
