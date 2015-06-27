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