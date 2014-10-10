/**
 * mojo query CSS moudle
 * 
 * Copyright (c) 2009 scott.cgi
 * http://mojo-js.appspot.com
 * under MIT License
 */
(function(window){
	
	var 
		document = window.document,

		joQuery = {
		    // Identifies HTMLElement whether matched in one query
		    tagGuid: 1,			
			
			attrMap: {
				"class": "className",
				"for": "htmlFor"
			},
			
			rex: {
				RE_RULE: /[ +>~]/g,
				NRE_RULE: /[^ +>~]+/g,
				TRIM_LR: /^ +| +$/g,
				TRIM: / *([^a-zA-Z*]) */g,
				PSEU_PARAM: /\([^()]+\)/g,
				ATTR_PARAM: /[^\[]+(?=\])/g,
				ATTR: /[!\^$*|~]?=/,
				CLS: /\./g,
				PSEU: /[^:]+/g,
				NUM: /\d+/,
				NTH: /(-?\d*)n([+-]?\d*)/,
				RULES: /((?:#[^.:\[]+)*)([a-zA-Z*]*)([^\[:]*)((?:\[.+\])*)((?::.+)*)/
			},

			/**
			 * Get HTMLElement array by selector and context
			 * 
			 * @param  {String} selector  
			 * @param  {String | HTMLElement | Array[HTMLElement] | NodeList} context (optional)
			 * @return {Array} Array of HTMLElement 
			 */			
			query: function(selector, context) {
				var 
					results = [], 
					selectors, contexts, rules,
					i, j, n, m;
				
				switch (typeof context) {
					case "undefined":
						contexts = [document];
						break;
						
					case "string":
						selector = context + " " + selector; 
						contexts = [document];
						break;
						
					case "object":
						if (context.nodeType) {
							// HTMLElement
							contexts = [context];							
						} else {
							// assert HTMLElement Array or NodeList
                            contexts = context;
						}
				}				
									 
				selectors = this.replaceAttrPseudo(this.trim(selector)).split(",");
				
				context = contexts;
							
				// each selector split by comma
				for (i = 0, j = selectors.length; i < j; i++) {
					selector = selectors[i];
					
					// relative rule array 
					// add defalut rule " "
					rules = (" " + selector).match(this.rex.RE_RULE);
										
					// selector on both sides of relative rule  
					selector = selector.match(this.rex.NRE_RULE);
					
					// selector start with relative rule
					// remove defalut rule " "
					if(rules.length > selector.length) {
						rules.shift();
					}					
					
					// each iteration, use before parse result as this context
					contexts = context;
					
					// parse selector by each relative rule
					for (n = 0, m = rules.length; n < m; n++) { 
						contexts = this.parse(selector[n], contexts, rules[n]);
					}
				
					// concat results of comma delimited selector
					results = results.concat(contexts);
				}
				
				if(j > 1) {
					// if here, may hava duplicate HTMLElement
					// remove duplicate
					return this.makeDiff(results);
				}
				
				return results;				
			},
			
			/**
			 * Trim extra space
			 * 
			 * @param  {String} selector
			 * @return {String} Selector after tirm
			 */
			trim: function(selector) {
				return selector
								// trim left and right space
								.replace(this.rex.TRIM_LR, "")	
								
								// trim space in selector
								.replace(this.rex.TRIM, "$1");								
			},
			
			/**
			 * Replace attribute and pseudo selector which in "[]" and "()"
			 * 
			 * @param  {String} selector  
			 * @return {Array}  Selector split by comma
			 */
			replaceAttrPseudo: function(selector){
				var 
					pseuParams = [],
					attrParams = [];
				
				this.pseuParams = pseuParams;
				this.attrParams = attrParams;
				
				selector = selector
								// remove attribute selector parameter and put in array
								.replace(this.rex.ATTR_PARAM, function(matched){
									return attrParams.push(matched) - 1;
								});
				
				// remove pseudo selector parameter and put in array
				while(selector.indexOf("(") !== -1) {
					selector = selector.replace(this.rex.PSEU_PARAM, function(matched){
						return pseuParams.push(matched.substring(1, matched.length - 1)) - 1;
					});
				}
				
				return selector;					
			},				
			
		   /**
		 	* Parse selector and get matched HTMLElement array
		 	* 
		 	* @param  {String} selector      
		 	* @param  {Array}  contexts      
		 	* @param  {String} rule         
		 	* @return {Array}  Matched HTMLElement array
		 	*/
			parse: function(selector, contexts, rule){
				var 
					matched, rules, id, tag, cls, attrs, pseudos;
				
				// rules[1]: id selector 
				// rules[2]: tag selector
				// rules[3]: class selecotr
				// rules[4]: attribute selector
				// rules[5]: pseudo selector  									
				rules = this.rex.RULES.exec(selector);
				
				// id selector
				if (id = rules[1]) { 
					if (id = document.getElementById(id.substring(1))) {
						return [id];
					}
					
					return [];
				}
				
				matched = relative[rule](contexts, rules[2] || "*", this);
				
				if(cls = rules[3]) {
					matched = this.filterClass(matched, cls.replace(this.rex.CLS, ""));
				}
				
				if(attrs = rules[4]) {
					matched = this.filterAttr(matched, this.getAttrRules(attrs.match(this.rex.ATTR_PARAM), this.attrParams));
				}
				
				if(pseudos = rules[5]) {
					matched = this.filterPseudo(matched, this.getPseudoRules(pseudos.match(this.rex.PSEU), this.pseuParams));
				}
				
				return matched; 
			},
			
			/**
			 * Parse selector and get complex selector
			 * 
			 * @param  {String} selector
			 * @return {Array}  Array of parsed rule
			 */
			getRules : function(selector) {
				var	
					rules, attrs, pseudos; 
				
				// rules[1]: id selector 
				// rules[2]: tag selector
				// rules[3]: class selecotr
				// rules[4]: attribute selector
				// rules[5]: pseudo selector  	
				rules = this.rex.RULES.exec(selector);
				
				rules[2] = rules[2] || "*";
				
				rules[3] = rules[3].replace(this.rex.CLS, "");
				
				if (attrs = rules[4]) {
					// array of attritubte parse function
					rules[4] = this.getAttrRules(attrs.match(this.rex.ATTR_PARAM), this.attrParams);
				}
				
				if (pseudos = rules[5]) {
					// array of pseudo parse function
					 rules[5] = this.getPseudoRules(pseudos.match(this.rex.PSEU), this.pseuParams)
				}				
				
				return rules;	
			},			
			
			/**
			 * Get attribute parse functions
			 * 
			 * @param  {Array} arrAttr       
			 * @param  {Array} attrParams  
			 * @return {Array} Array of attribute parse function    
			 */
			getAttrRules: function(arrAttr, attrParams) {
				var
					arr   = [],
					len   = arrAttr.length,
					rex   = this.rex.ATTR,
					i     = 0,
					attrs = attributes,
					attr;
				
				for(; i < len; i++) {
					attr = attrParams[arrAttr[i]];
					
					if(this.rex.ATTR.test(attr)) {
						attr = RegExp["$'"];
						// [function, name, value] are put in arr
						arr.push(attrs[RegExp["$&"]], RegExp["$`"], attr);
					} else {
						// only has attribute name
						arr.push(attrs[" "], attr, "");
					}
				}	
				
				return arr;
			},		
			
			/**
			 * Get pesudo parse functions
			 * 
			 * @param  {Array} arrPseu 
			 * @param  {Array} pseuParams
			 * @return {Array} Array of pseudo parse function
			 */
			getPseudoRules: function(arrPseu, pseuParams) {
				var 
					arr   = [],
					i     = 0,
					len   = arrPseu.length,
					guid  = this.tagGuid++,
					pseus = pseudos,
					pseu, param;
				
				for(; i < len; i++) {
					pseu = arrPseu[i];
					
					// pesudo with parameter
					if (this.rex.NUM.test(pseu)) { 
						// pseudos's object property
						pseu  = pseus[RegExp["$`"]];	
						// pesudo parameter					
						param = pseuParams[RegExp["$&"]];
						
						
						// arr[0]: whether has parameter
						// arr[1]: pseudo parse function
						// arr[2]: parameter
						arr.push(
							true, 
							pseu.fn, 
							pseu.getParam ? pseu.getParam(param, this, guid) : param
						);
					} else {
						arr.push(false, pseus[pseu], null);
					}
				}	

				return arr;
			},

			/**
			 * Filter HTMLElement whether matched pseudo rules
			 * 
			 * @param  {Array} els
			 * @param  {Array} pseudoRules
			 * @return {Array} Matched HTMLElement array   
			 */
			filterPseudo: function(els, pseudoRules){
				var 
					n       = 0, 
					m       = pseudoRules.length,
					matched = els,
					len, el, pseudo, hasParam, param, i;
				
				for(; n < m; n += 3) {
					pseudo   = pseudoRules[n + 1];
					hasParam = pseudoRules[n];
					param    = pseudoRules[n + 2];
					els      = matched;
					matched  = [];
					
					for(i = 0, len = els.length; i < len; i++) {
						el = els[i];
						if(hasParam) {
							if (!pseudo(el, i, param, this)) {
								continue;
							}
						} else {
							if (!pseudo(el, i, len, this)) {
								continue;
							}
						}
						
						matched.push(el);
					}
				}

				return matched;
			},	
			
			/**
			 * Filter HTMLElement whether matched attribute rules
			 * 
			 * @param  {Array}  els
			 * @param  {Array}  attrRules
			 * @return {Array}  Matched HTMLElement array
			 */
			filterAttr: function(els, attrRules){
				var 
					len = els.length,
					i = 0, 
					m = attrRules.length,
					matched = [],
					n, el, rule, val, name;
				
				for(; i < len; i++) {
					el = els[i];
					
					for (n = 0; n < m; n += 3) {
						rule = attrRules[n];
						name = attrRules[n + 1];
						
						if (!(val = (name === "href" ? el.getAttribute(name, 2) : el.getAttribute(name)))) {
							if (!(val = el[this.attrMap[name] || name])) {
								break;
							}
						}
						
						if (!rule(val + "", attrRules[n + 2])) {
							break;
						}
					}
					
					if(n === m) {
						matched.push(el);
					}
				}

				return matched;
			},	
			
		   	/**
		 	 * Filter HTMLElement whether matched class attribute
		 	 * 
		 	 * @param  {Array}   els
		 	 * @param  {String}  cls
		 	 * @return {Array}   Matched HTMLElement array
		 	 */ 
		    filterClass: function(els, cls){
				var 
					i = 0,
					len = els.length,
					matched = [],
					clsName, rex;
				
				for(; i < len; i++) {
					el = els[i];
					
					if(clsName = el.className) {
						rex = new RegExp(clsName.replace(" ", "|"), "g");
						if(!cls.replace(rex, "")) {
							matched.push(el);
						}
					}
				}

				return matched;
			},										

			/**
			 * Filter HTMLElement 
			 * 
			 * @param  {HTMLElement} el
			 * @param  {String}      tag
			 * @param  {String}      cls
			 * @param  {Array}       attrRules
			 * @param  {Array}       pseudoRules
			 * @return {Boolean}     Whether HTMLElement matched
			 */
			filterEl: function(el, tag, cls, attrRules, pseudoRules) {
				if (tag !== "*" && el.nodeName.toLowerCase() !== tag) {
					return false;
				}
				
				if (cls && !this.filterClass([el], cls).length) {
					return false;
				}
				
				if (attrRules && !this.filterAttr([el], attrRules).length) {
					return false;
				}
				
				if (pseudoRules && !this.filterPseudo([el], pseudoRules).length) {
					return false;
				}				
				
				return true;
			},

		   /**
		 	* Reomve duplicate HTMLElement
		 	* 
		 	* @param  {Array} arr
		 	* @return {Array} Unique HTMLElement array
		 	*/
			makeDiff : function(arr){
				var 
					guid  = this.tagGuid++,
					len   = arr.length, 
					diff  = [], 
					i     = 0, 
					el, data;
				
				for (; i < len; i++) {
					el = arr[i];
					data = this.getElData(el);
					if (data.tagGuid !== guid) {
						diff.push(el);
						data.tagGuid = guid;
					}
				}
				
				return diff;
			},
			
			/**
			 * Get the data bind in HTMLElement
			 * 
			 * @param  {HTMLElement} el
			 * @return {Object}      Data bind in HTMLElement
			 */
			getElData: function(el) {
				var 
					data = el.mojoExpando;
					
				if(!data) {
					data = el.mojoExpando = {
						mQuery: {
							tagGuid: 0
						}
					};
				}
				
				if(!(data = data.mQuery)) {
					data = {
						tagGuid: 0
					};
				}
				
				return data;
			},
			
			/**
			 * Get nth pseudo parameter after parsed
			 * 
			 * @param  {String} param
			 * @param  {Object} joQuery
			 * @param  {Number} guid
			 * @return {Array}  Parsed parameter
			 */
			getNthParam: function(param, joQuery, guid) {
				if (joQuery.rex.NTH.test(param === "odd"  && "2n+1" ||
									     param === "even" && "2n"   || param)) {
					param = RegExp.$1;
					
					param === "" ? 
					param = 1 : 
					param === "-" ? 
					param = -1 : 
					param = param * 1;
					
					if(param !== 0) {
						// param[0]: Identifies HTMLElement
						// param[1]: whether "nth-child()" has "n" parameter
						// param[2]: parameter before "n"
						// param[3]: paramter after "n"
						return [guid, true, param, RegExp.$2 * 1];						
					}
					
					// the "0n" matched
					param = RegExp.$2;
				} 
				
				// param[0]: Identifies HTMLElement
				// param[1]: whether "nth-child()" has "n" parameter
				// param[2]: number in like "nth-child(5)"
				return [guid, false, param * 1, null];		
			},
			
			/**
			 * Check nth pseudo parameter whether matched condition
			 * 
			 * @param  {Array}  param  
			 * @param  {Number} index  
			 * @return {Boolean} Matched or not 
			 */
			checkNthParam: function(param, index) {
				if (param[1]) {
					index = index - param[3];
					param = param[2];
					return index * param >= 0 && index % param === 0;
				}
				
				return index === param[2];					
			},

			/**
			 * Check nth child HTMLELement whether matched condition
			 * 
			 * @param  {HTMLElement} el
			 * @param  {Number}      i
			 * @param  {Array}       param
			 * @param  {Object}      joQuery
			 * @return {Booelan}     Matched or not
			 */
			checkNthChild: function(el, i, param, joQuery) {
				var 
					data, pel, map, index, checkType,
					first = param[4],
					next  = param[5],
					guid  = param[0]; 
				
				data = joQuery.getElData(pel = el.parentNode);
				
				if (data.tagGuid !== guid) {
					if(checkType = param[6]) {
						// need to check HTMLElement type
						// so record the type
						map = data.tagMap = {};
					} else {
						index = 0;
					}
					
					node = pel[first];
					while (node) {
						if (node.nodeType === 1) {
							if(checkType) {
                                name = node.nodeName;
                                if (!map[name]) {
                                    map[name] = 1;
                                }				
								
								// count child by different type
								index = map[name]++;			
							} else {
								// count all child
								index++;
							}
							joQuery.getElData(node).nodeIndex = index;
						}
						node = node[next];
					}
					data.tagGuid = guid;
				}

				return joQuery.checkNthParam(param, joQuery.getElData(el).nodeIndex);
			},
			
			/**
			 * Check el has sibling 
			 * 
			 * @param {HTMLElement} el
			 * @param {String}      next
			 * @param {Boolean}     checkType
			 * @param {String}      name
			 * @return {Boolean}    Has or not
			 */
			checkSibling: function(el, next, checkType, name) {
				while(el = el[next]) {
					if(el.nodeType === 1) {
						if(!checkType || name === el.nodeName) {
							return false;
						} 
					}
				}
				
				return true;
			}			
		}, 
		
		relative = {
		   /**
 			* Get matched HTMLElement
 			*
 			* @param  {Array}  contexts   
 			* @param  {String} tag        
		  	* @return {Array}  Matched HTMLElement array
 			*/			
			" " : function(contexts, tag, joQuery) {
				var 
					guid  = joQuery.tagGuid++,
					len   = contexts.length,
					arr   = [],
					i     = 0,
					n, m, nodes, el, pel;			
					
				for(; i < len; i++) {
					el  = contexts[i];
					if(pel = el.parentNode) {
						joQuery.getElData(el).tagGuid = guid;
						if(joQuery.getElData(pel).tagGuid === guid) {
							continue;
						}
					}
					
					nodes = el.getElementsByTagName(tag);	
					for(n = 0, m = nodes.length; n < m; n++) {
						arr.push(nodes[n]);
					}
				}
				
				return arr;
			},
			
		   /**
 			* Get matched HTMLElement
 			*
 			* @param  {Array}  contexts   
 			* @param  {String} tag        
		  	* @return {Array}  Matched HTMLElement array
 			*/					
			">" : function(contexts, tag) {
				var 
					arr = [], 
					len = contexts.length,
					i   = 0, el;			
				
				for(; i < len; i++) {
					el = contexts[i].firstChild;	
					while(el) {
						if(el.nodeType === 1) {
							if(el.nodeName.toLowerCase() === tag || tag === "*") {
								arr.push(el);
							}
						}
						el = el.nextSibling;							
					}												
				}
				
				return arr;					
			},	
			
		   /**
 			* Get matched HTMLElement
 			*
 			* @param  {Array}  contexts   
 			* @param  {String} tag        
		  	* @return {Array}  Matched HTMLElement array
 			*/					
			"+" : function(contexts, tag) {
				var 
					arr = [], 
					len = contexts.length,
					i   = 0, el;	
					
				for (; i < len; i++) {
					el = contexts[i];
					while(el = el.nextSibling) {
						if(el.nodeType === 1) {
							if(el.nodeName.toLowerCase() === tag || tag === "*") {
								arr.push(el);
							}
							break;
						}
					}
				}
				
				return arr;											
			},					
			
		   /**
 			* Get matched HTMLElement
 			*
 			* @param  {Array}  contexts   
 			* @param  {String} tag        
		  	* @return {Array}  Matched HTMLElement array
 			*/					
			"~" : function(contexts, tag, joQuery) {
				var 
					guid  = joQuery.tagGuid++,
					len   = contexts.length,
					arr   = [], 
					i     = 0,
					el, pel, data;

				for (; i < len; i++) {
					el = contexts[i];
					if (pel = el.parentNode) {
						if((data = joQuery.getElData(pel)).tagGuid === guid) {
							continue;
						}
						data.tagGuid = guid;
					}
					
					while(el = el.nextSibling) {
						if (el.nodeType === 1) {
							if(el.nodeName.toLowerCase() === tag || tag === "*") {
								arr.push(el);
							}
						}
					}
				}
						
				return arr;											
			}			
		},
		
		attributes = {
			" " : function() { 
				return true;
			},
			
			"=" : function(attrVal, inputVal) {
				return attrVal === inputVal;
			},
			
			"!=" : function(attrVal, inputVal) { 
				return attrVal !== inputVal;
			},
			
			"^=" : function(attrVal, inputVal) {
				return attrVal.indexOf(inputVal) === 0;
			},
			
			"$=" : function(attrVal, inputVal) {
				return attrVal.substring(attrVal.length - inputVal.length) === inputVal;
			},
			
			"*=" : function(attrVal, inputVal) {
				return attrVal.indexOf(inputVal) !== -1
			},
			
			"~=" : function(attrVal, inputVal) {
				return (" " + attrVal + " ").indexOf(" " + inputVal + " ") !== -1;
			},
			
			"|=" : function(attrVal, inputVal) {
				return attrVal === inputVal || attrVal.substring(0, inputVal.length + 1) === inputVal + "-";
			}
		},

		pseudos = {
			
			//css//
			"nth-child": {
				getParam: function(param, joQuery, guid) {
					param = joQuery.getNthParam(param, joQuery, guid);
					param.push("firstChild", "nextSibling", false);
					return param;
				},
				fn: joQuery.checkNthChild
			},
			
			"nth-last-child": {
				getParam: function(param, joQuery, guid) {
					param = joQuery.getNthParam(param, joQuery, guid);
					param.push("lastChild", "previousSibling", false);
					return param;
				},
				fn: joQuery.checkNthChild
			},
			
			"nth-of-type": {
				getParam: function(param, joQuery, guid) {
					param = joQuery.getNthParam(param, joQuery, guid);
					param.push("firstChild", "nextSibling", true);
					return param;
				},
				fn: joQuery.checkNthChild
			},		
			
			"nth-last-of-type": {
				getParam: function(param, joQuery, guid) {
					param = joQuery.getNthParam(param, joQuery, guid);
					param.push("lastChild", "previousSibling", true);
					return param;
				},
				fn: joQuery.checkNthChild
			},					
			
			not: {
				getParam: function(param, joQuery) {
				    // ":not()" may has "," in parameter
					// like: ":not(a, p)"
					var rules = param.split(",");
					param = [];
					while(rules.length) {
						param.push(joQuery.getRules(rules.pop()));
					}			
					
					return param;		
				},
				fn: function(el, index, params, joQuery) {
					var 
						i   = 0,
						len = params.length,
						param;
						
					for(; i < len; i++) {
						param = params[i];
						
						if(param[1]) {
							if("#" + el.id !== param[1]) {
								continue;
							}
							return false;
						}
						
						if(joQuery.filterEl(el, param[2], param[3], param[4], param[5])) {
							return false;
						}
					}	
					
					return true;					
				}
			},			
			
			"first-child": function(el, i, len, joQuery) {
				return joQuery.checkSibling(el, "previousSibling", false);
			},
			
			"last-child": function(el, i, len, joQuery) {
				return joQuery.checkSibling(el, "nextSibling", false);				
			},
			
			"only-child": function(el, i, len, joQuery) {
				return joQuery.checkSibling(el, "previousSibling", false) &&
				       joQuery.checkSibling(el, "nextSibling", false);		
			},
			
			"first-of-type": function(el, i, len, joQuery) {
				return joQuery.checkSibling(el, "previousSibling", true, el.nodeName);				
			},
			
			"last-of-type": function(el, i, len, joQuery) {
				return joQuery.checkSibling(el, "nextSibling", true, el.nodeName);;					
			},
			
			"only-of-type": function(el) {
				var name = el.nodeName;
				return joQuery.checkSibling(el, "previousSibling", true, name) &&
				       joQuery.checkSibling(el, "nextSibling", true, name);		
			},						
			
			enabled: function(el) {
				return el.disabled === false;
			},
			
			disabled: function(el) {
				return el.disabled === true;
			},
			
			checked: function(el) {
				return el.checked === true;
			},
			
			empty: function(el){
				return !el.firstChild;
			},
			
			selected: function(el) {
				return el.selected === true;
			} ,
			
			
            //position//			
			first: function(el, i) {
				return i === 0;
			},
	
			last: function(el, i, len) {
				return i === (len - 1);
			},
	
			even: function(el, i) {
				return i % 2 === 0;
			},
	
			odd: function(el, i) {
				return i % 2 === 1;
			},
			
			nth: {
				getParam: joQuery.getNthParam,
				fn: function(el, index, param, joQuery) {
					return joQuery.checkNthParam(param, index);
				}
			},
			
			
			//additions//
			contains: {
				fn: function(el, index, param){
					return (el.textContent || el.innerText || "").indexOf(param) !== -1;
				}
			},
			
			has: {
				getParam: function(param, joQuery) {
					var
						selectors = param.split(","),
						i         = 0,
						len       = selectors.length,
						selector, rules;
					
					param = [];
					
					// each selector split by comma
					for(; i < len; i++) {
						selector = selectors[i];
						
						// relative rule array 
						// add defalut rule " "
						rules = (" " + selector).match(joQuery.rex.RE_RULE);
						
                        // selector on both sides of relative rule  
                        selector = selector.match(joQuery.rex.NRE_RULE);
						
                        // selector start with relative rule
                        if (rules.length > selector.length) {
                            rules.shift();
                        }					
						
						param.push(selector, rules);
					}	
						
					return param;	
				},
				fn: function(el, index, param, joQuery) {
					var 
						i        = 0,
						len      = param.length,
						results  = [],
						context  = [el],
						selector, rules,
						contexts, n, m;
					
					// each selector split by comma
					for(; i < len; i += 2) {
						contexts = context;
						
						selector = param[i];
						rules    = param[i + 1];
						
                        // parse selector by each relative rule
                        for (n = 0, m = rules.length; n < m; n++) {
                            contexts = joQuery.parse(selector[n], contexts, rules[n]);
                        }					
						
                        // concat results of comma delimited selector
                        results = results.concat(contexts);				
					}	
					
					return results.length !== 0;
				}
			}				
		};
		
		if(document.querySelectorAll) {
			try {
				// test browser has capable of
                // converting a NodeList to an array using builtin methods
				Array.prototype.slice.call(document.documentElement.childNodes, 0);
				joQuery.slice = Array.prototype.slice;
				joQuery.makeArray = function(nodeList) {
					return this.slice.call(nodeList, 0);
				};
			} catch(e) {
				joQuery.makeArray = function(nodeList) {
					var 
						results = [],
						i       = 0,
						len     = nodeList.length;
					
					for(; i < len; i++) {
						results.push(nodeList[i]);
					}	
					
					return results;
				}
			}
			
			joQuery.oldQuery = joQuery.query;
			joQuery.query    = function(selector, context) {
				if (!context) {
					try {
						return this.makeArray(document.querySelectorAll(selector));
					} catch (e) {}
				}
				
				return this.oldQuery(selector, context);
			}
		}

		
		window.mojo.extend({
			query: function(selector, context){
				return joQuery.query(selector, context);
			}
		});
		
})(window);	