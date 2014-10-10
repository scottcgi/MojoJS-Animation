/**
 * Copyright (c) 2010 scott.cgi
 * http://mojo-js.appspot.com
 * under MIT License
 * Since  2009-9-1
 * Nightly Builds
 */ 
(function(window){ 
	var 
		document = window.document,
		
		mojo = window.mojo = function(selector, context) {
			switch(typeof selector) {
				case "string":
					return new mo(selector, mojo.query(selector, context));
				
				case "object":
				 	return new mo(selector, [selector]);	
			}
			
		},
		
		/**
		 * The mojo constructor's return object
		 * 
		 * @param {String} selector
		 * @param {Array}  elements
		 */
		mo = function(selector, elements) {
			this.selector = selector;
			this.elements = elements;
		},

		jo = {
			
			/**
			 * Execute the function on each element
			 * 
			 * @param {Object}   target  
			 * @param {String}   name   
			 * @param {Function} method  
			 */
			applyOnEach: function(target, name, method) {
				var joSelf = this;
				
				target[name] = function() {
					var 
						returnVal = [],
						els = this.elements, 
						len = els.length, 
						i = 0, 
						el, context;	

					for (; i < len; i++) {
						el = els[i];
						context = {
							el          : el,
							index       : i,
							self        : method,
							returnVal   : returnVal,
							elData      : joSelf.getELData(el),
							getArgsCode : joSelf.getArgsCode
						};
						
						if (method.apply(context, arguments) === false) {
							break;
						}
					}
					
					return returnVal.length ? returnVal : this;										
				};	
			},
			
			/**
			 * Get data object bind in HTMLElement
			 * 
			 * @param  {HTMLElement} el
			 * @return {Object}
			 */
			getELData: function(el) {
				var x;
				if(!(x = el.mojoData)) {
					x = el.mojoData = {};
				}
				
				return x;				
			},
			
			/**
			 * Get arguments type code
			 * 
			 * @param {Object} args  Function arguments object
			 */
			getArgsCode: function(args) {
				var 
				    i    = 0,
					len  = args.length,
					code = len + "";
			    
				for(; i < len; i++) {
					switch(typeof args[i]) {
						case "string":
							code += "S";
							break;
						
						case "number":
							code += "N";
							break;
						
						case "object":
							code += "O";
							break;
						
						case "boolean":
							code += "B";	
							break;
						
						case "function":
							code += "F";			
					}
				}
				
				return code;		
			}
		};
	
	// Export mo prototype	
	mojo.fn = mo.prototype;
	
	/**
	 * Extend mojo and mo object 
	 * 
	 * @param {Object}  o 
	 * @param {Boolean} onEach 
	 */
	mojo.extend = mojo.fn.extend = function(o, onEach) {
		var p;
		if (onEach) {
			for (p in o) {
				jo.applyOnEach(this, p, o[p]);
			}
		} else {
			for (p in o) {
				this[p] = o[p];
			}
		}
		
		return this;
	};
	
})(window);
