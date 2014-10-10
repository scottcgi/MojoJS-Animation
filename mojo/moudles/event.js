/**
 * mojo event moudle
 * 
 * Copyright (c) 2009 scott.cgi
 * http://mojo-js.appspot.com
 * under MIT License
 */
(function(window){
	var 
		document = window.document,
		
		joEvent = {
			// Generates a unique ID
			guid: 1,
			
			/**
			 * Fire event
			 * 
			 * @param  {HTMLElement} el       HTMLElement
			 * @param  {String}      evtType  Event type
			 * @param  {String}      initType Event init type
			 * @return {Boolean}              Event fire successfully or canceled 
			 */
			fireEvent: function(el, evtType, evtVal, initType) {
				var 
					evt, p, event;
				
				// Create event object
				if (document.createEvent) {
					evt = {
						canBubble: true,
						cancelable: true,
						view: window,
						detail: 1,
						screenX: 0,
						screenY: 0,
						clientX: 0,
						clientY: 0,
						ctrlKey: false,
						altKey: false,
						shiftKey: false,
						metaKey: false,
						button: 0,
						relatedTarget: null,
						bubbles: true,
						viewArg: null,
						ctrlKeyArg: false, 
						altKeyArg: false, 
						shiftKeyArg: false, 
						metaKeyArg: false, 
                        keyCodeArg: 0, 
						charCodeArg: 0
					};
					
					if (evtVal) {
						// override evt init value
						for (p in evtVal) {
							evt[p] = evtVal[p];
						}
					}					
					
					switch (initType || "MouseEvents") {
						case "MouseEvents":
							event = document.createEvent("MouseEvents");
							event.initMouseEvent(evtType, 
												          evt.canBubble, 
												          evt.cancelable, 
												          evt.view, 
												          evt.detail, 
												          evt.screenX, 
												          evt.screenY, 
												          evt.clientX, 
												          evt.clientY, 
												          evt.ctrlKey, 
												          evt.altKey, 
												          evt.shiftKey, 
												          evt.metaKey, 
												          evt.button, 
												          evt.relatedTarget);
							break;
						
						case "HTMLEvents":
							event = document.createEvent("HTMLEvents");
							event.initEvent(evtType, evt.bubbles, evt.cancelable);
							break;
						
						case "UIEvents":
							event = document.createEvent("UIEvents");	
							event.initUIEvent(evtType, evt.canBubble, evt.cancelable, evt.view, evt.detail);
							break;
							
						case "KeyboardEvent":
							event = document.createEvent("KeyboardEvent");	
							event.initKeyEvent(evtType, 
										  				evt.bubbles, 
														evt.cancelable, 
														evt.viewArg, 
                        								evt.ctrlKeyArg, 
														evt.altKeyArg, 
														evt.shiftKeyArg, 
														evt.metaKeyArg, 
                                                        evt.keyCodeArg, 
														evt.charCodeArg);			  			  						  
					}
					
				} else if (document.createEventObject) {
					event = document.createEventObject();
					if (evtVal) {
						// override evt init value
						for (p in evtVal) {
							event[p] = evtVal[p];
						}
					}
				}

				// fire event
				if(el.dispatchEvent) {
					return el.dispatchEvent(event);
				} else if(el.fireEvent) {
					return el.fireEvent("on" + evtType, event);
				}
			},		
			
			/**
			 * Add event function
			 * 
			 * @param {HTMLElement} el
			 * @param {String}      evtType  Event type
			 * @param {Function}    fn		 Event function
			 */
			addEvent: function(el, evtType, fn) {
				if(el.addEventListener) {
					el.addEventListener(evtType, fn, false);
				} else if(el.attachEvent) {
					el.attachEvent("on" + evtType, fn);
				}
			},		
			
			/**
			 * Remove event
			 * 
			 * @param {HTMLElement} el
			 * @param {String}      evtType Event type
			 * @param {Function}    fn	    Event function
			 */
			removeEvent: function(el, evtType, fn) {
				if(el.removeEventListener) {
					el.removeEventListener(evtType, fn, false);
				} else if(el.detachEvent) {
					el.detachEvent("on" + evtType, fn);
				}
			},
			
			/**
			 * Fix IE event object
			 * 
			 * @return Event object
			 */
			fixEvent: function() {
				var	
					event = this.event, undefined;
				
				if(event.charCode === undefined) {
					event.charCode = (event.type === "keypress") ? event.keyCode : 0;
				}	
				
				if(event.isChar === undefined) { 
					event.isChar = event.charCode > 0 ;
				}
				
				if(event.eventPhase === undefined) {
					event.eventPhase = 2;
				}
				
				if(event.pageX === undefined && event.pageY === undefined) {
					event.pageX = event.clientX + document.body.scrollLeft;
					event.pageY = event.clientY + document.body.scrollTop;
				}
				
				if(!event.preventDefault) {
					event.preventDefault = function() {
						this.returnValue = false;
					}
				}
				
				if(event.relatedTarget === undefined) {
					switch(event.type) {
						case "mouseout":
							event.relatedTarget = event.toElement;
							break;
						
						case "mouseover":
							event.relatedTarget = event.fromElement;
						
					}
				}
				
				if(!event.stopPropagation) {
					event.stopPropagation = function() {
						this.cancelBubble = true;
					}
				}
				
				if(event.target === undefined) {
					event.target = event.srcElement;
				}
				
				if(event.timeStamp === undefined) {
					event.timeStamp = new Date().getTime();
				} 
				
				return event;
			},
			
			/**
			 * Get event cache object which bind in element
			 * 
			 * @param {Object} elData Data object of element
			 * @return Cache object
			 */
			getELData: function(elData) {
				return elData.mEvent || (elData.mEvent = {});
			}							
		};
		
		window.mojo.fn.extend({
			
			/**
			 * Fire event
			 * 
			 * @param {String} evtType    Event type
			 * @param {Object} evtVal     Event value
			 * @param {String} initType   Event init type
			 */
			fireEvent: function(evtType, evtVal, initType) {
				joEvent.fireEvent(this.el, evtType, evtVal, initType);	
			},
			
			/**
			 * Add element event
			 * 
			 * addEvent(Object)
			 * addEvent(String, Function)
			 * addEvent(String, Object)
			 */
			addEvent: function(x, y) {
				var 
					index    = this.index,
					el       = this.el,
					argsCode = this.getArgsCode(arguments),
					guid     = joEvent.guid++,
					// cache element event function
					mEvent   = joEvent.getELData(this.elData),
					type, fn, args, undefined;
				
				if (argsCode === "1O") {
					for(type in x) {
						this.self.call(this, type, x[type]);
					}
					return;
				}
				
				if (!(type = mEvent[x])) {
					// cache events of one type on element
					type = mEvent[x] = {};
				}
				
				switch(argsCode) {
					case "2SF":
						args = [];
						break;
					
					case "2SO":
						args = y.args === undefined ? [] : [].concat(y.args);
						y    = y.fn;
				}	
		
				if (y.mEventGuid) {
					if (type[y.mEventGuid]) {
						// more than one event added on element
						// which same event type and same function
						return;
					}
					guid = y.mEventGuid;
				} else {
					y.mEventGuid = guid;
				}
					
				fn = function(event){
					y.apply({
						el: el,
						self: y,
						index: index,
						event: event || window.event,
						fixEvent: joEvent.fixEvent
					}, args);
				};
				
				type[guid]   = fn;  
				
				joEvent.addEvent(el, x, fn);
			},
			
			/**
			 * Remove element event
			 * 
			 * removeEvent()
			 * removeEvent(String)
			 * removeEvent(String, Function)
			 */
			removeEvent: function(x, y) {
				var		
					el       = this.el,
					argsCode = this.getArgsCode(arguments),
					mEvent   = joEvent.getELData(this.elData),
					type, fns, guid;
					
				if (argsCode === "0") {
					for (type in mEvent) {
						fns = mEvent[type];
						for(guid in fns) {
							joEvent.removeEvent(el, type, fns[guid]);
						}
						delete mEvent[type];
					}
					
					return;
				}	
					
				fns = mEvent[x];
					
				switch(argsCode) {
					case "1S":
						if (fns) {
							for (guid in fns) {
								joEvent.removeEvent(el, x, fns[guid]);
							}
							delete mEvent[x];
						}
						break;
					
					case "2SF":
						if(fns && (y = y.mEventGuid) && fns[y]) {
							joEvent.removeEvent(el, x, fns[y]);
							delete fns[y];
						}												
				}	
			}
			
		}, true);
	
})(window);
