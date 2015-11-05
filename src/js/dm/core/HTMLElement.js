/**
 * @requires dm/namespaces.js
 * @requires dm/core/EventTarget.js
 */

dm.HTMLElement = function(element, id, className, style) {
	dm.EventTarget.call(this);
	var self = this;
	
	this.id = id;
	this.className = className;
	this.style = style;
	this.parent = null;

	this.isSelectable = true;
	this.isFullscreen = false;

	this.element = null;
	this.children = new Array();
	this.transitions = new Object();

	if(!element)
		throw new Error("dm.HTMLElement: element attribute can not be null.");

	if(!(element instanceof HTMLElement) && !(element instanceof SVGElement))
		throw new Error("dm.HTMLElement: " + element.constructor.name + " not allowed as element attribute.");
	
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
		
		setTimeout( function() {
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
			value = values[property] ? String(values[property]) : "";
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
			
			setTimeout( function() {
				// self.setStyle(values, false); ???
				self.setStyle(values);
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
		var transitionString = property + " " + (duration || 0) + "s" + ((delay != undefined || timingFunction != "ease") ? " " + timingFunction : "" ) + (delay != undefined ? " " + delay + "s" : "");
		
		this.transitions[className][property] = new Object();
		this.transitions[className][property][0] = transitionString;
		this.transitions[className][property][1] = callback;
		this.transitions[className][property][2] = callee;
		if (update) this.updateTransitionString();
		
		return transitionString;
	};
	
	this.addTransitions = function(className, properties, durations, timingFunctions, delays, callback, callee, override, update) {
		update = update == false ? false : true;
		var multipleDurations = !(!durations || typeof durations == "number");
		var multipleTimingFunctions = !(!timingFunctions || typeof timingFunctions == "string");
		var multipleDelays = !(!delays || typeof delays == "number");
		
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
					if(!mergedTransitions[key])
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
		
		// if(styleTransitionString != "") console.log(styleTransitionString);
		if(supportsTransition)
			this.setStyle({
				transition : styleTransitionString == "" ? null : styleTransitionString
			});
	};

	this.removeTransition = function(property, className, styleValues) {
		if(className !== undefined) {
			delete this.transitions[className || 0][property];
		} else {
			for(className in this.transitions)
				delete self.transitions[className][property];
		}

		this.updateTransitionString();

		if(styleValues) {
			setTimeout( function() {
				self.setStyle(styleValues);
			}, Number.MIN_VALUE);
		}
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