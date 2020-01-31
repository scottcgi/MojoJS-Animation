/*
 * Copyright (c) scott.cgi All Rights Reserved.
 * 
 * This source code belongs to project MojoJS-Animation, which is a JS Animation Engine hosted on GitHub,
 * and licensed under the MIT License.
 * 
 * License: https://github.com/scottcgi/MojoJS-Animation/blob/master/LICENSE
 * GitHub : https://github.com/scottcgi/MojoJS-Animation
 * 
 * Since  : 2010-05-16
 * Update : 2019-10-08
 * Version: 2.0.2
 */

(function(window) { 
    var 
        /**
         * Animation object.
         * 
         * @param {String (selector) | Array<HTMLElement> | NodeList | HTMLElement} targets
         */
        Animation = function(targets) {
            switch (typeof targets) {
                case "string":
                    this.els = document.querySelectorAll(targets);
                    break;

                case "object":
                    this.els = targets.length ? targets : [targets];
                    break;    
            }

            // queue configs
            this.queConfigs = [];
            // current running queue config
            this.queConfig  = null;
            // current running actions include shift queue and nonqueued
            this.curActions = [];
            // whether animation is playing
            this.isPlaying  = false;
            // action with append callback actions 
            this.configMap  = {};
        },		

        animator = {

            frameTime: 1000 / 60.0,

            // the id of animations update timer
            timerID  : 0,

            // current update array of animations 
            anims    : [],

            // for unit convert
            unitEl   : document.createElement("div"),
            
            /**
             * Add animation with config to update array.
             * 
             * @param {Object} animation
             * @param {Object} config 
             */
            addAnim: function(anim, config) {
                var 
                    animStyle, steps, easing,
                    name,      value, operate, 
                    unit,      type;
  
                if (config.animStyle) {
                    steps     = config.steps = [];
                    animStyle = config.animStyle;
                    
                    for (name in animStyle) {
                        value   = animStyle[name]; 
                        operate = "";
                        unit    = "";
                        easing  = config.easing;
                        type    = this.isTransform(name) ? 2 : 0;

                        switch (typeof value) {
                            case "number":
                                break;
                            
                            case "object": // array
                                // override defalut
                                easing = value[1];
                                value  = value[0] + "";
                                // here no break
                                
                            case "string":
                                if (name.search(/color/i) === -1) {
                                    value   = value.match(/(\+=|-=)?(-?[0-9.]+)([a-z%]*)/);
                                    operate = value[1];
                                    unit    = value[3];
                                    // override value
                                    value   = value[2];
                                } else {
                                    // color  
                                    type    = 1;
                                }
                                break;

                            default:
                                throw "Type Error: MojoJS.animation with unsupported animStyle value [" + value + "]";
                        }

                        steps.push({
                            name    : name,
                            value   : value,
                            operate : operate,
                            unit    : unit,
                            fromUnit: "",
                            easing  : this.easing[easing],
                            type    : type,
                        });
                    }
                }

                if (anim.isPlaying === false) {
                    this.anims.push(anim);
                    anim.isPlaying = true;
                }

                config.isQueue ?
                    // into queue waiting to run
                    anim.queConfigs.push(config) :
                    // add action into curActions
                    anim.curActions.push(this.createAction(anim, config));	
            },			

            /**
             * Whether the name is transform property.
             * 
             * @param  {String}  name
             * @return {Boolean} whether is transform 
             */
            isTransform: function(name) {
                switch (name) {
                    case "translateX":
                    case "translateY":
                    case "translateZ":
                    case "scaleX":
                    case "scaleY":
                    case "scaleZ":
                    case "rotate":    
                    case "rotateX":
                    case "rotateY":
                    case "rotateZ":  
                    case "skewX":
                    case "skewY":                                                  
                        return true;
                    
                    case "matrix":    
                    case "matrix3d":
                    case "translate":
                    case "translate3d":
                    case "scale":
                    case "scale3d":    
                    case "rotate3d":
                    case "skew":    
                        throw "Type Error: MojoJS.animation not supported [" + name + "] !";
                }

                return false;
            },

            /**
             * Get el from value.
             * 
             * @param {HTMLElement} el 
             * @param {Object}      step 
             * @param {Array}       fromValue 
             */
            getFrom: function(el, step, fromValue) {
                var 
                    from, fromUnit;

                if (fromValue !== null) {
                    from     = fromValue[1] * 1;
                    fromUnit = fromValue[2];                    
                } else {
                    switch (step.name) {
                        case "scaleX":
                        case "scaleY":
                        case "scaleZ":
                            from     = 1;
                            fromUnit = "";
                            break;

                        case "rotate":    
                        case "rotateX":
                        case "rotateY":
                        case "rotateZ": 
                        case "skewX":
                        case "skewY":
                            from     = 0;
                            fromUnit = "deg";  
                            break;

                        default:
                            // from maybe "auto"
                            from     = 0; 
                            fromUnit = "px"; 
                            break;
                    }                 
                }

                unit = step.unit;

                if (unit === "") {
                    step.fromUnit = fromUnit;
                } else if (unit !== fromUnit && from !== 0) {
                    // convert from value to diff unit
                    
                    // add to same level as el for get same unit ratio
                    el.parentNode.appendChild(this.unitEl);

                    if (fromUnit !== "px") {
                        this.unitEl.style.width = 1 + fromUnit;
                        // convert to px
                        from                   *= this.unitEl.offsetWidth;
                    }

                    if (unit !== "px") {
                        this.unitEl.style.width = 1 + unit;
                        // convert to diff unit
                        from                   /= this.unitEl.offsetWidth;
                    }

                    el.parentNode.removeChild(this.unitEl);
                }

                return from;
            },

            /**
             * Create animation action.
             * 
             * one action to one config.
             * 
             * @param  {Object} animation
             * @param  {Object} config
             * @return {Object} action
             */
            createAction: function(anim, config) {
                var
                    action = {
                        // sharing config's [duration, complete, args]
                        config : config,
                        time   : 0,
                        delay  : config.delay,
                    };

                if (action.delay <= 0) {
                    action.delay = 0;
                    // no delay just create steps
                    this.createSteps(anim, action);
                }    

                return action;
            },

            /**
             * Create acton steps by config steps and els current style.
             * 
             * @param {Object} animation 
             * @param {Object} action 
             */
            createSteps: function(anim, action) {
                var 
                    steps =  action.config.steps,
                    elSteps, elTransform, 
                    step,    from, change, name, type, el,
                    eLen,    i,    
                    sLen,    j;

                if (!steps) {
                    // no steps but may hava complete function
                    return action;					
                }

                action.elsSteps      = [];
                // save els unchanged transform style
                action.elsTransform  = [];

                for (i = 0, eLen = anim.els.length; i < eLen; ++i) {
                    el           = anim.els[i];
                    elSteps      = [];
                    // get el current transform style
                    elTransform  = el.style.transform;

                    // fill config steps to el steps
                    for (j = 0, sLen = steps.length; j < sLen; ++j) {
                        step   = steps[j];
                        name   = step.name;
                        change = step.value;
                        type   = step.type;

                        switch (type) {
                            case 0: // defalut
                                from = (el.style[name] || getComputedStyle(el, null)[name]).match(/(-?[0-9.]+)([a-z%]*)/);                         
                                break;
                                
                            case 1: // color
                                from = this.convertToRGBA(el.style[name] || getComputedStyle(el, null)[name]);
                                break;

                            case 2: // transform
                                from = elTransform.match(name + "\\((-?[0-9.]+)([a-z%]*)\\)");
                                if (from !== null) {
                                    // remove changed
                                    elTransform = elTransform.replace(from[0], "");
                                }
                                break;
                        }

                        if (type != 1) {
                            from = this.getFrom(el, step, from);        
                                
                            switch (step.operate) {
                                case "+=":
                                    change = change *  1;
                                    break;
                                    
                                case "-=":
                                    change = change * -1;
                                    break;
                                    
                                default:
                                    change = change *  1 - from;
                            }  
                        } else {
                            change     = this.convertToRGBA(change);
                            change[0] -= from[0]; // r
                            change[1] -= from[1]; // g
                            change[2] -= from[2]; // b
                            change[3] -= from[3]; // a
                        }

                        if (type != 2) {
                            name = name.replace(/[A-Z]/g, "-$&");
                        }

                        elSteps.push({
                            name   : name,
                            from   : from,
                            change : change,
                            unit   : step.unit || step.fromUnit,
                            easing : step.easing,
                            type   : step.type,
                        });
                    }

                    // set el steps and transform
                    action.elsSteps    [i] = elSteps;
                    action.elsTransform[i] = elTransform;
                }
            },
            
            /**
             * Start global animations executor.
             */
            start: function() {
                var 
                    self, doFrame;	
                
                if (this.timerID === 0) {
                    self    = this;
                    doFrame = window.requestAnimationFrame;

                    this.timerID = doFrame(function() {
                        if (self.update(self.frameTime)) {
                            self.timerID = doFrame(arguments.callee);
                        } else {
                            self.timerID = 0;
                        }
                    });
                }
            },
            
            /**
             * Update animations array.
             * 
             * @param  {Number}  deltaTime
             * @return {Boolean} whether to continue updating.
             */
            update: function(deltaTime) {
                var 
                    anim, queConfigs, curActions, len, i;
            
                for (i = 0, len = this.anims.length; i < len; ++i) {
                    anim       = this.anims[i];
                    queConfigs = anim.queConfigs;
                    curActions = anim.curActions;
                    
                    if (anim.queConfig === null && queConfigs.length !== 0) {
                        // get one config from queue
                        anim.queConfig = queConfigs.shift();
                        // add queue action into current runnings
                        curActions.push(this.createAction(anim, anim.queConfig));
                    }
                    
                    if (curActions.length > 0) {
                        this.doActions(anim, curActions, deltaTime);
                    } else {
                        this.anims.splice(i--, 1);
                        anim.isPlaying = false;						
                        
                        // all animations complete
                        if ((len = this.anims.length) === 0) {
                            return false;
                        }						
                    }
                }		

                return true;
            },
            
            /**
             * Do animation current actions.
             * 
             * @param {Object} animation
             * @param {Array}  actions
             * @param {Number} deltaTime
             */
            doActions: function(anim, actions, deltaTime) {
                var 
                    cssText   = [], 
                    transform = [], 
                    completes = [],
                    action, time, config, appends,
                    aLen,   i,
                    eLen,   j,
                    cLen,   k;

                for (i = 0, eLen = anim.els.length; i < eLen; ++i) {
                    el = anim.els[i];

                    cssText.push("", ";");

                    // each el do current actions
                    for (j = 0, aLen = actions.length; j < aLen; ++j) {
                        action = actions[j];
    
                        if (action.delay === 0) {
                            time  = action.time += deltaTime;
                            time /= action.config.duration;		
    
                            if (time > 1.0) {
                                time = 1.0;
                                actions.splice(j--, 1);
                                --aLen;

                                // check whether the action is in queue
                                if (anim.queConfig === action.config) {
                                    anim.queConfig = null;
                                }
        
                                // action is complete
                                completes.push(action.config);
                            }

                            this.setCssText(action.elsSteps[i], time, cssText, transform);  

                        } else {
                            action.delay -= deltaTime;
    
                            if (action.delay < 0) {
                                action.delay = 0;
                                this.createSteps(anim, action);
                            }
                        }
                    }

                    if (transform.length > 0) {
                        cssText.push("transform:", action.elsTransform[i], transform.join(""), ";");
                        // for next el
                        transform.length = 0;
                    }

                    // check whether all actions are delayed
                    if (cssText.length > 2) {
                        cssText[0]       = el.style.cssText;
                        el.style.cssText = cssText.join("");
                        // for next el
                        cssText.length   = 0;
                    }

                    if (completes.length > 0) {
                        for (k = 0, cLen = completes.length; k < cLen; ++k) {
                            config = completes[k];
                            
                            if (config.complete !== null) {
                                // do action callback
                                config.complete.apply(anim, config.args);
                            }
    
                            // find append configs
                            appends = anim.configMap[config.id];
    
                            if (appends) {
                                // add all append configs 
                                for (j = 0, aLen = appends.length; j < aLen; ++j) {
                                    this.addAnim(anim, appends[j]);
                                }
    
                                // remove config id and related configs
                                delete anim.configMap[config.id];
                            }
                        }
                    }
                }
            },
            
            /**
             * Set cssText by steps.
             * 
             * @param {Array}  steps
             * @param {Number} time
             * @param {Array}  cssText
             * @param {Array}  transform
             */
            setCssText: function(steps, time, cssText, transform) {
                var 
                    step, from, change, time, len, i;

                for (i = 0, len = steps.length; i < len; ++i) {
                    step = steps[i]; 

                    switch (step.type) {
                        case 0: // default
                            cssText.push(	
                                step.name, ":", 
                                step.from + step.change * step.easing(time), 
                                step.unit, ";"
                            );
                            break;       

                        case 1: // color
                            from   = step.from;
                            change = step.change;
                            time   = step.easing(time);

                            cssText.push(
                                step.name, ":rgba(", 
                                from[0] + Math.ceil(change[0] * time), ",",
                                from[1] + Math.ceil(change[1] * time), ",",
                                from[2] + Math.ceil(change[2] * time), ",",
                                from[3] + Math.ceil(change[3] * time), ");"
                            );
                            break;

                        case 2: // transform
                            transform.push(
                                step.name, "(",
                                step.from + step.change * step.easing(time), 
                                step.unit, ")"
                            );
                            break;                            
                    }
                }		
            },
            
            /**
             * Convert color to rgba array.
             * 
             * @param  {String} color 
             * @return {Array}  rgba array
             */
            convertToRGBA: function(color) {
                var 
                    rgba = [0, 0, 0, 1], 
                    len, i;
                
                if (color.charAt(0) === "#") {
                    // #000
                    if (color.length === 4) {
                        color = color.replace(/\w/g, "$&$&");
                    }
                    
                    // #000000
                    for (i = 0; i < 3; ++i) {
                        rgba[i] = parseInt(color.substring(i * 2 + 1, i * 2 + 3), 16);
                    }		
                } else {	
                    // rgba(r, g, b, a)
                   if (color !== "transparent") {
                       color = color.match(/\d+/g);
                       for (i = 0, len = color.length; i < len; ++i) {
                           rgba[i] = parseInt(color[i]);
                       }
                    } else {
                       // alpha
                       rgba[3] = 0;
                   }
                }

                return rgba;				
            },
        };

        
    /**
     * Animation object API.  
     */    
    Animation.prototype = {

        /**
         * Animate with config.
         * 
         * @param  {Object} animStyle 
         * @return {Object} animation
         */
        animate: function(animStyle) {
            var 
                config = {
                    animStyle: animStyle,                        
                    duration : 382,
                    isQueue  : true,                       
                    complete : null,                       
                    args     : null,
                    easing   : "sineOut",
                    steps    : null,
                    delay    : 0,
                    id       : "",
                    appendTo : "",
                },
                param, name, len, i;

            for (i = 1, len = arguments.length; i < len; ++i) {
                param = arguments[i];

                switch(typeof param) {
                    case "number":
                        config.duration = param;
                        break;
                    
                    case "string":
                        config.easing   = param;
                        break;
                        
                    case "function":
                        config.complete = param;
                        break;
                    
                    case "boolean":
                        config.isQueue  = param;
                        break;	
                    
                    case "object":
                        if (param.length > 0) {
                            // assert param is an array
                            config.args = param;
                        } else {
                            for (name in param) {
                                config[name] = param[name];
                            }
                        }	
                        break;
                        
                    default:
                        throw "Type Error: MojoJS.animation with unsupported param [" + typeof param + "]";
                }
            }

            if (config.id !== "") {
                if (!this.configMap[config.id]) {
                    this.configMap[config.id] = [];
                } else {
                    throw "Error: MojoJS.animation id [" + config.id + "] already exist !";
                }
            }

            if (config.appendTo === "") {
                animator.addAnim(this, config);
                animator.start();
            } else {
                param = this.configMap[config.appendTo];

                if (!param) {
                    throw "Error: MojoJS.animation appendTo [" + config.appendTo + "] not exist !";
                }

                param.push(config);
            }
            
            return this;				
        },
    };


    if (!window.MojoJS) {
        window.MojoJS = {};
    }

    
    /**
     * Create Animation object.
     * 
     * @param  {String (selector) | Array<HTMLElement> | NodeList | HTMLElement} targets
     * @return {Object}                                                          aniamtion
     */
    window.MojoJS.createAnimation = function(targets) {
        return new Animation(targets);
    };	


//---------------------------------------------------------------------------------------------------------------------

    animator.unitEl.style.cssText = "position:absolute;width:0;display:block;";
    animator.unitEl.id            = "MojoJS-animation-unitEl";


    /**
     * The original algorithms of easing functions come from Robert Penner.
     * The open source licensed under the MIT License and the BSD License.
     *
     * Introduce: http://robertpenner.com/easing
     * License  : http://robertpenner.com/easing_terms_of_use.html
     */
    animator.easing = {

        linear: function(time) {
            return time;
        },


        quadraticIn: function(time) {
            return time * time;
        },
        quadraticOut: function(time) {
            return time * (2.0 - time);
        },
        quadraticInOut: function(time) {
            if (time < 0.5) {
                return time * time * 2.0;
            } 
                
            return 2.0 * time * (2.0 - time) - 1.0;
        },


        cubicIn: function(time) {
            return time * time * time;
        },
        cubicOut: function(time) {
            time -= 1.0;
            return time * time * time + 1.0;
        },
        cubicInOut: function(time) {
            if (time < 0.5) {
                return 4.0 * time * time * time;
            } 

            time -= 1.0;
            return 4.0 * time * time * time + 1.0;
        },


        quarticIn: function(time) {
            return time * time * time * time;
        },
        quarticOut: function(time) {
            time -= 1.0;
            return 1.0 - time * time * time * time;
        },
        quarticInOut: function(time) {
            if (time < 0.5) {
                return 8.0 * time * time * time * time;
            } 

            time -= 1.0;
            return 1.0 - 8.0 * time * time * time * time;
        },


        quinticIn: function(time) {
            return time * time * time * time * time;
        },
        quinticOut: function(time) {
            time -= 1.0;
            return time * time * time * time * time + 1.0;
        },
        quinticInOut: function(time) {
            if (time < 0.5) {
                return 16.0 * time * time * time * time * time;
            } 

            time -= 1.0;
            return 16.0 * time * time * time * time * time + 1.0;
        },      
        

        exponentialIn: function(time) {
            if (time <= 0.0) {
                return time;
            } 

            return Math.pow(2.0, 10.0 * (time - 1.0));
        },
        exponentialOut: function(time) {
            if (time >= 1.0) {
                return time;
            }

            return 1.0 - Math.pow(2.0, -10.0 * time);
        },
        exponentialInOut: function(time) {
            if (time <= 0.0 || time >= 1.0) {
                return time;
            }
        
            if (time < 0.5) {
                return 0.5 * Math.pow(2.0, 20.0 * time - 10.0);
            } 

            return 0.5 * (2.0 - Math.pow(2.0, -20.0 * time + 10.0));
        }, 


        sineIn: function(time) {
            return 1.0 - Math.cos(time * 1.570796326794897);
        },
        sineOut: function(time) {
            return Math.sin(time * 1.570796326794897);
        },
        sineInOut: function(time) {
            return 0.5 * (1.0 - Math.cos(time * 3.141592653589793));
        }, 


        circularIn: function(time) {
            return 1.0 - Math.sqrt(1.0 - time * time);
        },
        circularOut: function(time) {
            return Math.sqrt((2.0 - time) * time);
        },
        circularInOut: function(time) {
            if (time < 0.5) {
                return 0.5 * (1.0 - Math.sqrt(1.0 - 4.0 * time * time));
            }

            time = time * 2.0 - 2.0;
            return 0.5 * (Math.sqrt(1.0 - time * time) + 1.0);
        }, 


        elasticIn: function(time) {
            if (time <= 0.0 || time >= 1.0)
            {
                return time;
            }
        
            return -Math.pow(2.0, 10.0 * time - 10.0) * Math.sin(20.923007 * time - 22.493803);
        },
        elasticOut: function(time) {
            if (time <= 0.0 || time >= 1.0)
            {
                return time;
            }
        
            return Math.pow(2.0, -10.0 * time) * Math.sin(20.923007 * time - 1.570796) + 1.0;
        },
        elasticInOut: function(time) {
            if (time <= 0.0 || time >= 1.0) {
                return time;
            }
        
            if (time < 0.5) {
                return -0.5 * Math.pow(2.0, 20.0 * time - 10.0) * Math.sin(27.960175 * time - 15.550884);
            } 
    
            return Math.pow(2.0, -20.0 * time + 10.0) * Math.sin(27.960175 * time - 15.550884) * 0.5 + 1.0;
        }, 


        backIn: function(time) {
            return time * time * (2.70158 * time - 1.70158);
        },
        backOut: function(time) {
            time -= 1.0;
            return time * time * (2.70158 * time + 1.70158) + 1.0;
        },
        backInOut: function(time) {
            if (time < 0.5) {
                return time * time * (14.379636 * time - 5.189818);
            } 

            time -= 1.0;
            return time * time * (14.379636 * time + 5.189818) + 1.0;
        },
        backInExponentialOut: function(time) {
            if (time < 0.5) {
                return time * time * (14.379636 * time - 5.189818);
            } 

            return 0.5 * (2.0 - Math.pow(2.0, -20.0 * time + 10.0));
        },
        backInElasticOut: function(time) {
            if (time < 0.5) {
                return time * time * (14.379636 * time - 5.189818);
            } 

            return Math.pow(2.0, -20.0 * time + 10.0) * Math.sin(27.960175 * time - 15.550884) * 0.5 + 1.0;
        },


        bounceIn: function(time) {
            if (time > 0.636364) {
                time = 1.0 - time;
                return 1.0 - 7.5625 * time * time;
            } 

            if (time > 0.27273) {
                time = 0.454546 - time;
                return 0.25 - 7.5625 * time * time;
            } 

            if (time > 0.090909) {
                time = 0.181818 - time;
                return 0.0625 - 7.5625 * time * time;
            } 
            
            if (time >= 1.0) {
                return time;
            }

            time = 0.045455 - time;
            return 0.015625 - 7.5625 * time * time;
        },
        bounceOut: function(time) {
            if (time < 0.363636) {
                return 7.5625 * time * time;
            } 
            
            if (time < 0.72727) {
                time -= 0.545454;
                return 7.5625 * time * time + 0.75;
            } 
            
            if (time < 0.909091) {
                time -= 0.818182;
                return 7.5625 * time * time + 0.9375;
            } 
            
            if (time >= 1.0) {
                return time;
            }

            time -= 0.954545;
            return 7.5625 * time * time + 0.984375;
        },
        bounceInOut: function(time) {
            if (time < 0.5) {
                // bounce in
                if (time > 0.318182) {
                    time = 1.0 - time * 2.0;
                    return 0.5 - 3.78125 * time * time;
                } 
                
                if (time > 0.136365) {
                    time = 0.454546 - time * 2.0;
                    return 0.125 - 3.78125 * time * time;
                } 

                if (time > 0.045455) {
                    time = 0.181818 - time * 2.0;
                    return 0.03125 - 3.78125 * time * time;
                } 
                
                time = 0.045455 - time * 2.0;
                return 0.007813 - 3.78125 * time * time;
            } 

            // bounce out
            if (time < 0.681818) {
                time = time * 2.0 - 1.0;
                return 3.78125 * time * time + 0.5;
            } 
            
            if (time < 0.863635) {
                time = time * 2.0 - 1.545454;
                return 3.78125 * time * time + 0.875;
            } 
            
            if (time < 0.954546) {
                time = time * 2.0 - 1.818182;
                return 3.78125 * time * time + 0.96875;
            } 
            
            if (time >= 1.0) {
                return time;
            }

            time = time * 2.0 - 1.954545;
            return 3.78125 * time * time + 0.992188;
        },
    };

})(window);