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