/*
 * Copyright (c) 2012-2019 scott.cgi All Rights Reserved.
 * 
 * This source code belongs to project MojocJS, which is a CSS Seletor Engine hosted on GitHub, 
 * and licensed under the MIT License.
 * 
 * License: https://github.com/scottcgi/MojoJS/blob/master/LICENSE
 * GitHub : https://github.com/scottcgi/MojoJS
 * 
 * Since  : 2009-11-11
 * Update : 2019-10-8
 * Version: 2.0.0
 */

(function(window) {
    
    var   
        parser = {
            // cache in context
            document: window.document,
            // cache in context
            RegExp  : window.RegExp,

            // identifies HTMLElement whether matched in one query
            tagGuid : 0,
            
            rex: {
                // relative
                RE_RULE   : /[ +>~]/g,
                // not relative
                NRE_RULE  : /[^ +>~]+/g,
                TRIM_LR   : /^ +| +$/g,
                TRIM      : / *([^a-zA-Z*.:]) */g,
                TRIM_QUOTE: /["']/g,
                PSEU_PARAM: /\([^()]+\)/g,
                ATTR_PARAM: /[^\[]+(?=\])/g,
                ATTR      : /[!\^$*|~]?=/,
                CLS       : /\./g,
                PSEU      : /[^:]+/g,
                NUM       : /\d+/,
                // css nth
                NTH       : /(-?\d*)n([+-]?\d*)/,
                RULES     : /((?:#[^.:\[]+)*)([a-zA-Z*]*)([^\[:]*)((?:\[.+\])*)((?::.+)*)/
            },

            /**
             * Get HTMLElements array by selector and context.
             * 
             * @param  {String} selector 
             * @param  {String | HTMLElement | Array<HTMLElement> | NodeList} context (optional)
             * @return {Array} matched HTMLElements Array  
             */
            query: function(selector, context) {
                var 
                    contexts, undefined;
                
                switch (typeof context) {
                    case "string":
                        selector = context + " " + selector; 
                        // here no break

                    case "undefined":
                        contexts = [this.document];
                        break;
                        
                    case "object":
                        if (context.nodeType === 1) {
                            // HTMLElement
                            contexts = [context];
                        } else if (context.length !== undefined) {
                            // Array or NodeList
                            contexts = context;
                        } else {
                            throw "Type Error: MojoJS.query with wrong object context !";
                        }
                        break;

                    default:
                        throw "Type Error: MojoJS.query with unsupported context !";
                }
                
                return this.parse(this.replaceAttrPseudo(this.trim(selector)).split(","), contexts);
            },

            /**
             * Parse selectors with contexts.
             * 
             * @param  {Array} selector
             * @param  {Array} contexts
             * @return {Array} matched HTMLElements array
             */
            parse: function(selectors, contexts) {
                var 
                    results        = [],
                    relativeFilter = this.relativeFilter,
                    filterAttr     = this.filterAttr,
                    CLS            = this.rex.CLS,
                    ATTR_PARAM     = this.rex.ATTR_PARAM,
                    PSEU           = this.rex.PSEU,
                    RULES          = this.rex.RULES,
                    RE_RULE        = this.rex.RE_RULE,
                    NRE_RULE       = this.rex.NRE_RULE,
                    reRules, reContexts,
                    i, j, m, n, k, l, 
                    matched, rules, id, cls, attrs, pseudos;

                for (i = 0, j = selectors.length; i < j; ++i) {
                    // each selector split by comma
                    selector  = selectors[i];
                    
                    // relative rule array 
                    // add defalut rule " "
                    reRules   = (" " + selector).match(RE_RULE);
                                        
                    // selector on both sides of relative rule  
                    selector  = selector.match(NRE_RULE);
                    
                    // selector start with relative rule
                    // remove defalut rule " "
                    if (reRules.length > selector.length) {
                        reRules.shift();
                    }

                    // contexts for relative rule
                    reContexts = contexts;
                    
                    // parse each relative rule
                    for (n = 0, m = reRules.length; n < m; ++n) { 
                        // [1]: id 
                        // [2]: tag
                        // [3]: class
                        // [4]: attribute
                        // [5]: pseudo  
                        // selector[n]: each on both sides of relative rule
                        rules = selector[n].match(RULES);
                        
                        if ((id = rules[1])) { 
                            if ((id = this.document.getElementById(id.substring(1)))) {
                                matched = [id];
                            } else {
                                matched = [];
                            }
                        } else {
                            matched = relativeFilter[reRules[n]](this, reContexts, rules[2] || "*");
                        
                            if ((cls = rules[3])) {
                                matched = this.filterClass(matched, cls.replace(CLS, ""));
                            }
                            
                            if ((attrs = rules[4])) {
                                matched = filterAttr(
                                    matched, 
                                    this.getAttrRules(attrs.match(ATTR_PARAM), this.attrParams)
                                );
                            }
                            
                            if ((pseudos = rules[5])) {
                                matched = this.filterPseudo(
                                    matched, 
                                    this.getPseudoRules(pseudos.match(PSEU), this.pseudoParams)
                                );
                            }
                        }
                        
                        // each iteration, use before parse result as this context
                        reContexts = matched;
                    }

                     // concat results of comma delimited selector
                    for (k = 0, l = reContexts.length; k < l; ++k) {
                        results.push(reContexts[k]);
                    }
                }
                
                if (j > 1) {
                    // if here, may hava duplicate HTMLElement
                    // remove duplicate HTMLElements
                    return this.makeDiff(results);
                }
                
                return results;
            },
            
            /**
             * Trim extra spaces and quotes.
             * 
             * @param  {String} selector
             * @return {String} selector without spaces and quotes
             */
            trim: function(selector) {
                return selector
                                // trim left and right spaces
                                .replace(this.rex.TRIM_LR,    "")
                                
                                // trim spaces in selector
                                .replace(this.rex.TRIM,       "$1")
                                
                                // trim quotes in selector
                                .replace(this.rex.TRIM_QUOTE, "");
            },
            
            /**
             * Put attribute and pseudo selector (in "[]" and "()") to array,
             * and replace the original string with the array index.
             * 
             * @param  {String} selector  
             * @return {Array}  selectors split by comma
             */
            replaceAttrPseudo: function(selector) {
                var 
                    pseudoParams  = [],
                    attrParams    = [],
                    PSEU_PARAM    = this.rex.PSEU_PARAM;
                
                this.pseudoParams = pseudoParams;
                this.attrParams   = attrParams;

                // remove attribute and put in array
                selector = selector.replace(this.rex.ATTR_PARAM, function(matched) {
                    // record the index
                    return attrParams.push(matched) - 1;
                });
                
                // remove pseudo and put in array
                while (selector.indexOf("(") !== -1) {
                    selector = selector.replace(PSEU_PARAM, function(matched) {
                        // record the index
                        return pseudoParams.push(matched.substring(1, matched.length - 1)) - 1;
                    });
                }
                
                return selector;
            },
            
            /**
             * Get all types of rules.
             * 
             * rules[1]: id
             * rules[2]: tag
             * rules[3]: class
             * rules[4]: attribute
             * rules[5]: pseudo  
             * 
             * @param  {String} selector
             * @return {Array}  rules
             */
            getRules: function(selector) {
                var
                    rules, attrs, pseudos; 

                rules    = selector.match(this.rex.RULES);
                rules[2] = rules[2] || "*";
                rules[3] = rules[3].replace(this.rex.CLS, "");
                
                if ((attrs = rules[4])) {
                    //  attritubte parse rules
                    rules[4] = this.getAttrRules(attrs.match(this.rex.ATTR_PARAM), this.attrParams);
                }
                
                if ((pseudos = rules[5])) {
                    // pseudo parse rules
                    rules[5] = this.getPseudoRules(pseudos.match(this.rex.PSEU), this.pseudoParams)
                }
                
                return rules;
            },
            
            /**
             * Get attribute parse rules.
             *    
             * rule[index + 0]: parse function  
             * rule[index + 1]: attr name  
             * rule[index + 2]: attr value          
             * 
             * @param  {Array} attrs       
             * @param  {Array} attrParams  
             * @return {Array} attribute parse rules
             */
            getAttrRules: function(attrs, attrParams) {
                var
                    arr             = [],
                    ATTR            = this.rex.ATTR,
                    RegExp          = this.RegExp,
                    attributeFilter = this.attributeFilter,
                    len, i, attr;
                
                for (i = 0, len = attrs.length; i < len; ++i) {
                    attr = attrParams[attrs[i]];
                    
                    if (ATTR.test(attr)) {
                        attr = RegExp["$'"];
                        arr.push(attributeFilter[RegExp["$&"]], RegExp["$`"], attr);
                    } else {
                        arr.push(attributeFilter[" "], attr, "");
                    }
                }

                return arr;
            },
            
            /**
             * Get pseudo parse rules.
             * 
             * rule[index + 0]: whether has parameter
             * rule[index + 1]: parse function
             * rule[index + 2]: parameter
             * 
             * @param  {Array} pseudos 
             * @param  {Array} pseudoParams
             * @return {Array} pseudo parse rules
             */
            getPseudoRules: function(pseudos, pseudoParams) {
                var 
                    arr          = [],
                    guid         = ++this.tagGuid,
                    NUM          = this.rex.NUM,
                    RegExp       = this.RegExp,
                    pseudoFilter = this.pseudoFilter,
                    len, i, pseudo, param;
                
                for (i = 0, len = pseudos.length; i < len; ++i) {
                    pseudo = pseudos[i];
                    
                    // pseudo with parameter
                    if (NUM.test(pseudo)) { 
                        // pseudo filter rule object
                        pseudo = pseudoFilter[RegExp["$`"]];
                        // pseudo parameter
                        param  = pseudoParams[RegExp["$&"]];
                        
                        arr.push(
                            true, 
                            pseudo.fn, 
                            // if has getFnParam then do with param
                            pseudo.getFnParam ? pseudo.getFnParam(this, guid, param) : param
                        );
                    } else {
                        arr.push(false, pseudoFilter[pseudo], null);
                    }
                }

                return arr;
            },

            /**
             * Filter HTMLElements whether matched pseudo rules.
             * 
             * @param  {Array} els
             * @param  {Array} pseudoRules
             * @return {Array} matched HTMLElements array   
             */
            filterPseudo: function(els, pseudoRules) {
                var 
                    pseudoFn, hasParam, nthDataOrParam, matched,
                    el, eLen, i, pLen, j;
                
                for (j = 0, pLen = pseudoRules.length; j < pLen; j += 3) {
                    hasParam       = pseudoRules[j];
                    pseudoFn       = pseudoRules[j + 1];
                    nthDataOrParam = pseudoRules[j + 2];
                    matched        = [];
                    
                    for (i = 0, eLen = els.length; i < eLen; ++i) {
                        el = els[i];

                        // pseudoFn write twice for reduce define var
                        if (hasParam) {
                            if (pseudoFn(this, el, i, nthDataOrParam) === false) {
                                continue;
                            }
                        } else {
                            if (pseudoFn(this, el, i, eLen) === false) {
                                continue;
                            }
                        }
                        
                        matched.push(el);
                    }

                    els = matched;
                }

                return matched;
            },
            
            /**
             * Filter HTMLElements whether matched attribute rules
             * 
             * @param  {Array} els
             * @param  {Array} attrRules
             * @return {Array} matched HTMLElements array
             */
            filterAttr: function(els, attrRules) {
                var 
                    matched = [],
                    name, value, rule, el, undefined, 
                    elen, i, aLen, j;
                
                for (i = 0, elen = els.length, aLen = attrRules.length; i < elen; ++i) {
                    el = els[i];
                    
                    for (j = 0; j < aLen; j += 3) {
                        rule = attrRules[j];
                        name = attrRules[j + 1];
                        
                        if ((value = el.getAttribute(name)) === null) {
                            if ((value = el[name]) === undefined) {
                                break;
                            }
                        }
                        
                        if (rule(value + "", attrRules[j + 2]) === false) {
                            break;
                        }
                    }
                    
                    if (j === aLen) {
                        matched.push(el);
                    }
                }

                return matched;
            },
            
            /**
             * Filter HTMLElements whether matched class attribute.
             * 
             * @param  {Array}  els
             * @param  {String} cls
             * @return {Array}  matched HTMLElements array
             */ 
            filterClass: function(els, cls) {
                var 
                    matched = [],
                    RegExp  = this.RegExp,
                    clsName, rex, len, i;
                
                for (i = 0, len = els.length; i < len; ++i) {
                    el = els[i];
                    
                    if ((clsName = el.className)) {
                        rex = new RegExp(clsName.replace(" ", "|"), "g");
                        if (cls.replace(rex, "") === "") {
                            matched.push(el);
                        }
                    }
                }

                return matched;
            },

            /**
             * Filter HTMLElement whether matched rules.
             * 
             * @param  {HTMLElement} el
             * @param  {String}      tag
             * @param  {String}      cls
             * @param  {Array}       attrRules
             * @param  {Array}       pseudoRules
             * @return {Boolean}     matched or not
             */
            filterEl: function(el, tag, cls, attrRules, pseudoRules) {
                if (tag !== "*" && el.nodeName.toLowerCase() !== tag) {
                    return false;
                }
                
                if (cls !== "" && this.filterClass([el], cls).length === 0) {
                    return false;
                }
                
                if (attrRules !== "" && this.filterAttr([el], attrRules).length === 0) {
                    return false;
                }
                
                if (pseudoRules !== "" && this.filterPseudo([el], pseudoRules).length === 0) {
                    return false;
                }
                
                return true;
            },

            /**
             * Reomve duplicate HTMLElements.
             * 
             * @param  {Array} els
             * @return {Array} unique HTMLElements array
             */
            makeDiff: function(els) {
                var 
                    diff      = [], 
                    guid      = ++this.tagGuid,
                    getElData = this.getElData,
                    len, i, el, data;
                
                for (i = 0, len = els.length; i < len; ++i) {
                    el   = els[i];
                    data = getElData(el);
                    if (data.tagGuid !== guid) {
                        diff.push(el);
                        data.tagGuid = guid;
                    }
                }
                
                return diff;
            },

            /**
             * Convert NodeList to NodeArray.
             * 
             * @param  {NodeList} nodeList 
             * @return {Array}    nodes array
             */
            makeArray: function(nodeList) {
                var 
                    arr = [],
                    len, i;
                
                for (i = 0, len = nodeList.length; i < len; ++i) {
                    arr.push(nodeList[i]);
                }
                
                return arr;
            },
            
            /**
             * Get the data bind to HTMLElement.
             * 
             * @param  {HTMLElement} el
             * @return {Object}      data binded to HTMLElement.
             */
            getElData: function(el) {
                var 
                    data = el.dataForMojoJS,
                    undefined;
                    
                if (data === undefined) {
                    data = el.dataForMojoJS = {};
                }
                
                return data;
            },
            
            /**
             * Get the data of parsed nth pseudo parameter. 
             * 
             * @param  {Number} guid
             * @param  {String} param
             * @return {Object} parsed nth parameter data
             */
            getNthData: function(guid, param) {
                if (this.rex.NTH.test(param === "odd"  && "2n+1" ||
                                      param === "even" && "2n"   || param)) {

                    param = this.RegExp.$1;
                    param === ""  ? 
                    param = 1 : 
                    param === "-" ? 
                    param = -1 : 
                    param = param * 1;
                    
                    if (param !== 0) {
                        return {
                            // whether "nth-child()" has "n" parameter
                            hasParam: true,
                            // identifies HTMLElement
                            guid    : guid, 
                            // parameter before "n"
                            nFront  : param,
                            // paramter after "n"
                            nBehind : this.RegExp.$2 * 1
                        };
                    }
                    
                    // the "0n" matched
                    param = this.RegExp.$2;
                } 
                
                return {
                    // whether "nth-child()" has "n" parameter
                    hasParam: false,
                    // identifies HTMLElement
                    guid    : guid,
                    // number in such as "nth-child(5)"
                    n       : param * 1
                }
            },
            
            /**
             * Check the index whether matched nth pseudo parameter. 
             * 
             * @param  {Number}  index  
             * @param  {Object}  nthData  
             * @return {Boolean} matched or not 
             */
            checkNth: function(index, nthData) {
                if (nthData.hasParam) {
                    index   = index - nthData.nBehind;
                    nthData = nthData.nFront;
                    return index * nthData >= 0 && index % nthData === 0;
                }
                
                return index === nthData.n;
            },

            /**
             * Check el child whether matched nth pseudo parameter.
             * 
             * @param  {HTMLElement} el
             * @param  {Object}      nthData
             * @return {Booelan}     matched or not
             */
            checkNthChild: function(el, nthData) {
                var 
                    guid      = nthData.guid,
                    first     = nthData.first,
                    next      = nthData.next,
                    getElData = this.getElData,
                    node, parent, name, index, pData, tagMap, undefined;
                
                pData = getElData(parent = el.parentNode);
                
                if (pData.tagGuid !== guid) {
                    node = parent[first];

                    if (nthData.checkType) {
                        // need to check HTMLElement type
                        // so record the type
                        tagMap = pData.tagMap = {};

                        while (node !== null) {
                            if (node.nodeType === 1) {
                                name = node.nodeName;
                                if (tagMap[name] === undefined) {
                                    tagMap[name] = 0;
                                }
                                // count child by diff type
                                getElData(node).nodeIndex = ++tagMap[name];
                            }
                            node = node[next];
                        }
                    } else {
                        index = 0;
                        while (node !== null) {
                            if (node.nodeType === 1) {
                                getElData(node).nodeIndex = ++index;
                            }
                            node = node[next];
                        }
                    }

                    pData.tagGuid = guid;
                }

                return this.checkNth(getElData(el).nodeIndex, nthData);
            },
            
           /**
            * Check el has sibling. 
            * 
            * @param  {HTMLElement} el
            * @param  {String}      next
            * @param  {Boolean}     checkType
            * @param  {String}      name
            * @return {Boolean}     has or not
            */
            checkSibling: function(el, next, checkType, name) {
                while ((el = el[next]) !== null) {
                    if (el.nodeType === 1) {
                        if (checkType === false || name === el.nodeName) {
                            return false;
                        } 
                    }
                }
                
                return true;
            },

//---------------------------------------------------------------------------------------------------------------------
    
            relativeFilter: {

                " ": function(parser, contexts, tag) {
                    var 
                        guid      = ++parser.tagGuid,
                        arr       = [],
                        getElData = parser.getElData,
                        nodes, el, cLen, i, nLen, j;
                    
                    nextLoop:                        
                    for (i = 0, cLen = contexts.length; i < cLen; ++i) {
                        el = parent = contexts[i];
                                                
                        // test any parents have queried subelements
                        while ((parent = parent.parentNode) !== null) {
                            if (getElData(parent).tagGuid === guid) {
                                continue nextLoop;
                            }
                        }
                        
                        // el never query subelements
                        // so mark it
                        getElData(el).tagGuid = guid;
                        
                        nodes = el.getElementsByTagName(tag);
                        
                        for (j = 0, nLen = nodes.length; j < nLen; ++j) {
                            arr.push(nodes[j]);
                        }
                    }
                    
                    return arr;
                },
                
 
                ">": function(parser, contexts, tag) {
                    var 
                        arr = [], 
                        len, i, el;
                    
                    for (i = 0, len = contexts.length; i < len; ++i) {
                        el = contexts[i].firstChild;
                        while (el !== null) {
                            if (el.nodeType === 1) {
                                if (el.nodeName.toLowerCase() === tag || tag === "*") {
                                    arr.push(el);
                                }
                            }
                            el = el.nextSibling;
                        }
                    }
                    
                    return arr;
                },
                
                "+": function(parser, contexts, tag) {
                    var 
                        arr = [], 
                        len, i, el;
                        
                    for (i = 0, len = contexts.length; i < len; ++i) {
                        el = contexts[i];
                        while ((el = el.nextSibling) !== null) {
                            if (el.nodeType === 1) {
                                if (el.nodeName.toLowerCase() === tag || tag === "*") {
                                    arr.push(el);
                                }
                                break;
                            }
                        }
                    }
                    
                    return arr;
                },
                
                "~": function(parser, contexts, tag) {
                    var 
                        guid      = ++parser.tagGuid,
                        arr       = [], 
                        getElData = parser.getElData,
                        len, i, el, parent, data;

                    for (i = 0, len = contexts.length; i < len; ++i) {
                        el = contexts[i];
                        if ((parent = el.parentNode)) {
                            if ((data = getElData(parent)).tagGuid === guid) {
                                continue;
                            }
                            data.tagGuid = guid;
                        }
                        
                        while ((el = el.nextSibling) !== null) {
                            if (el.nodeType === 1) {
                                if (el.nodeName.toLowerCase() === tag || tag === "*") {
                                    arr.push(el);
                                }
                            }
                        }
                    }
                            
                    return arr;
                }
            },
            
//---------------------------------------------------------------------------------------------------------------------
        
            attributeFilter: {

                " ": function() { 
                    return true;
                },
                
                "=": function(attrVal, inputVal) {
                    return attrVal === inputVal;
                },
                
                "!=": function(attrVal, inputVal) { 
                    return attrVal !== inputVal;
                },
                
                "^=": function(attrVal, inputVal) {
                    return attrVal.indexOf(inputVal) === 0;
                },
                
                "$=": function(attrVal, inputVal) {
                    return attrVal.substring(attrVal.length - inputVal.length) === inputVal;
                },
                
                "*=": function(attrVal, inputVal) {
                    return attrVal.indexOf(inputVal) !== -1
                },
                
                "~=": function(attrVal, inputVal) {
                    return (" " + attrVal + " ").indexOf(" " + inputVal + " ") !== -1;
                },
                
                "|=" : function(attrVal, inputVal) {
                    return attrVal === inputVal || attrVal.substring(0, inputVal.length + 1) === inputVal + "-";
                }
            },

//---------------------------------------------------------------------------------------------------------------------

            pseudoFilter: {
                
                /* css */

                "nth-child": {
                    getFnParam: function(parser, guid, param) {
                        var 
                            nthData = parser.getNthData(guid, param);

                        nthData.first     = "firstChild";
                        nthData.next      = "nextSibling";
                        nthData.checkType = false;

                        return nthData;
                    },
                    fn: function(parser, el, index, nthData) {
                        return parser.checkNthChild(el, nthData);
                    }
                },
                
                "nth-last-child": {
                    getFnParam: function(parser, guid, param) {
                        var 
                            nthData = parser.getNthData(guid, param);

                        nthData.first     = "lastChild";
                        nthData.next      = "previousSibling";
                        nthData.checkType = false;

                        return nthData;
                    },
                    fn: function(parser, el, index, nthData) {
                        return parser.checkNthChild(el, nthData);
                    }
                },
                
                "nth-of-type": {
                    getFnParam: function(parser, guid, param) {
                        var 
                            nthData = parser.getNthData(guid, param);

                        nthData.first     = "firstChild";
                        nthData.next      = "nextSibling";
                        nthData.checkType = true;

                        return nthData;
                    },
                    fn: function(parser, el, index, nthData) {
                        return parser.checkNthChild(el, nthData);
                    }
                },
                
                "nth-last-of-type": {
                    getFnParam: function(parser, guid, param) {
                        var 
                            nthData = parser.getNthData(guid, param);

                        nthData.first     = "lastChild";
                        nthData.next      = "previousSibling";
                        nthData.checkType = true;

                        return nthData;
                    },
                    fn: function(parser, el, index, nthData) {
                        return parser.checkNthChild(el, nthData);
                    }
                },
                
                not: {
                    getFnParam: function(parser, guid, param) {
                        var 
                            // ":not()" may has "," in parameter
                            // such as ":not(a, p)"
                            selectors = param.split(","),
                            rulesArr  = [];

                        while (selectors.length !== 0) {
                            rulesArr.push(parser.getRules(selectors.pop()));
                        }
                        
                        return rulesArr;
                    },
                    fn: function(parser, el, index, rulesArr) {
                        var 
                            len, i, rules;
                            
                        for (i = 0, len = rulesArr.length; i < len; ++i) {
                            rules = rulesArr[i];
                            
                            if (rules[1]) {
                                if ("#" + el.id !== rules[1]) {
                                    continue;
                                }
                                return false;
                            }
                            
                            if (parser.filterEl(el, rules[2], rules[3], rules[4], rules[5])) {
                                return false;
                            }
                        }
                        
                        return true;
                    }
                },
                
                "first-child": function(parser, el, index, len) {
                    return parser.checkSibling(el, "previousSibling", false);
                },
                
                "last-child": function(parser, el, index, len) {
                    return parser.checkSibling(el, "nextSibling", false);
                },
                
                "only-child": function(parser, el, index, len) {
                    return parser.checkSibling(el, "previousSibling", false) &&
                           parser.checkSibling(el, "nextSibling",     false);
                },
                
                "first-of-type": function(parser, el, index, len) {
                    return parser.checkSibling(el, "previousSibling", true, el.nodeName);
                },
                
                "last-of-type": function(parser, el, index, len) {
                    return parser.checkSibling(el, "nextSibling", true, el.nodeName);;
                },
                
                "only-of-type": function(parser, el, index, len) {
                    var name = el.nodeName;
                    return parser.checkSibling(el, "previousSibling", true, name) &&
                           parser.checkSibling(el, "nextSibling",     true, name);
                },
                
                enabled: function(parser, el, index, len) {
                    return el.disabled === false;
                },
                
                disabled: function(parser, el, index, len) {
                    return el.disabled === true;
                },
                
                checked: function(parser, el, index, len) {
                    return el.checked === true;
                },
                
                empty: function(parser, el, index, len) {
                    return el.firstChild === null;
                },
                
                selected: function(parser, el, index, len) {
                    return el.selected === true;
                } ,
                
                /* position */

                first: function(parser, el, index, len) {
                    return index === 0;
                },

                last: function(parser, el, index, len) {
                    return index === (len - 1);
                },

                even: function(parser, el, index, len) {
                    return index % 2 === 0;
                },

                odd: function(parser, el, index, len) {
                    return index % 2 === 1;
                },
                
                nth: {
                    getFnParam: function(parser, guid, param) {
                        return parser.getNthData(guid, param);
                    },
                    fn: function(parser, el, index, nthData) {
                        return parser.checkNth(index, nthData);
                    }
                },
                
                /* additions */

                contains: {
                    fn: function(parser, el, index, param) {
                        return (el.textContent || el.innerText || "").indexOf(param) !== -1;
                    }
                },
                
                has: {
                    getFnParam: function(parser, guid, param) {
                        return param.split(",");
                    },
                    fn: function(parser, el, index, selectors) {
                        return parser.parse(selectors, [el]).length !== 0;
                    }
                }
            }
        };  

//---------------------------------------------------------------------------------------------------------------------
   
    if (window.document.querySelectorAll !== undefined) {        
        parser.oldQuery = parser.query;
        parser.document = window.document;
        parser.query    = function(selector, context) {
            if (context === undefined) {
                try {
                    return this.makeArray(this.document.querySelectorAll(selector));
                } catch (e) {}
            }
            
            return this.oldQuery(selector, context);
        }
    }

    if (window.MojoJS === undefined) {
        window.MojoJS = {};
    }

    /**
     * Select HTMLElements by css seletor and context.
     * 
     * @param  {String}                                                          selector
     * @param  {String (selector) | HTMLElement | Array<HTMLElement> | NodeList} context (optional)
     * @return {Array<HTMLElement>}                                              HTMLElements
     */
    window.MojoJS.query = function(selector, context) {
        return parser.query(selector, context);
    };
        
})(window);