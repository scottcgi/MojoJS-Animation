/*
TERMS OF USE - EASING EQUATIONS
Open source under the BSD License.
Copyright 2001 Robert Penner All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

 * Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
 * Neither the name of the author nor the names of contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/**
 * Easing alogrithm
 * 
 * @param {Number} t current time    
 * @param {Number} b beginning value 
 * @param {Number} c change value    
 * @param {Number} d duration        
 */
(function($){
	var 
		M = Math,
	
	    E = {
			/*Quad*/
			quadIn: function(t, b, c, d) {
				return c * (t /= d) * t + b;
			},
			quadOut: function(t, b, c, d) {
				return -c * (t /= d) * (t - 2) + b;
			},
			quadBoth: function(t, b, c, d) {
				if ((t /= d / 2) < 1) {
					return c / 2 * t * t + b;
				}
				return -c / 2 * ((--t) * (t - 2) - 1) + b;
			},
			
			/*Cubic*/
			cubicIn: function(t, b, c, d) {
				return c * (t /= d) * t * t + b;
			},
			cubicOut: function(t, b, c, d) {
				return c * ((t = t / d - 1) * t * t + 1) + b;
			},
			cubicBoth: function(t, b, c, d) {
				if ((t /= d / 2) < 1) {
					return c / 2 * t * t * t + b;
				}
				return c / 2 * ((t -= 2) * t * t + 2) + b;
			},
			
			/*Quart*/
			quartIn: function(t, b, c, d) {
				return c * (t /= d) * t * t * t + b;
			},
			quartOut: function(t, b, c, d) {
				return -c * ((t = t / d - 1) * t * t * t - 1) + b;
			},
			quartBoth: function(t, b, c, d) {
				if ((t /= d / 2) < 1) {
					return c / 2 * t * t * t * t + b;
				}
				return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
			},
			
			/*Quint*/
			quintIn: function(t, b, c, d) {
				return c * (t /= d) * t * t * t * t + b;
			},
			quintOut: function(t, b, c, d) {
				return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
			},
			quintBoth: function(t, b, c, d) {
				if ((t /= d / 2) < 1) {
					return c / 2 * t * t * t * t * t + b;
				}
				return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
			},
			
			/*Sine*/
			sineIn: function(t, b, c, d) {
				return -c * M.cos(t / d * (M.PI / 2)) + c + b;
			},
			sineOut: function(t, b, c, d) {
				return c * M.sin(t / d * (M.PI / 2)) + b;
			},
			sineBoth: function(t, b, c, d) {
				return -c / 2 * (M.cos(M.PI * t / d) - 1) + b;
			},
			
			/*Expo*/
			expoIn: function(t, b, c, d) {
				return (t === 0) ? b : c * M.pow(2, 10 * (t / d - 1)) + b;
			},
			expoOut: function(t, b, c, d) {
				return (t === d) ? b + c : c * (-M.pow(2, -10 * t / d) + 1) + b;
			},
			expoBoth: function(t, b, c, d) {
				if (t === 0) {
					return b;
				}
				if (t === d) {
					return b + c;
				}
				if ((t /= d / 2) < 1) {
					return c / 2 * M.pow(2, 10 * (t - 1)) + b;
				}
				return c / 2 * (-M.pow(2, -10 * --t) + 2) + b;
			},
			
			/*Circ*/
			circIn: function(t, b, c, d) {
				return -c * (M.sqrt(1 - (t /= d) * t) - 1) + b;
			},
			circOut: function(t, b, c, d) {
				return c * M.sqrt(1 - (t = t / d - 1) * t) + b;
			},
			circBoth: function(t, b, c, d) {
				if ((t /= d / 2) < 1) {
					return -c / 2 * (M.sqrt(1 - t * t) - 1) + b;
				}
				return c / 2 * (M.sqrt(1 - (t -= 2) * t) + 1) + b;
			},
			
			/*Elastic*/
			elasticIn: function(t, b, c, d) {
				var s = 1.70158, p = 0, a = c;
				if (t === 0) {
					return b;
				}
				if ((t /= d) === 1) {
					return b + c;
				}
				if (!p) {
					p = d * .3;
				}
				if (a < M.abs(c)) {
					a = c;
					s = p / 4;
				} else {
					s = p / (2 * M.PI) * M.asin(c / a);
				}
				return -(a * M.pow(2, 10 * (t -= 1)) * M.sin((t * d - s) * (2 * M.PI) / p)) + b;
			},
			elasticOut: function(t, b, c, d) {
				var s = 1.70158, p = 0, a = c;
				if (t === 0) {
					return b;
				}
				if ((t /= d) === 1) {
					return b + c;
				}
				if (!p) {
					p = d * .3;
				}
				if (a < M.abs(c)) {
					a = c;
					s = p / 4;
				} else {
					s = p / (2 * M.PI) * M.asin(c / a);
				}
				return a * M.pow(2, -10 * t) * M.sin((t * d - s) * (2 * M.PI) / p) + c + b;
			},
			elasticBoth: function(t, b, c, d) {
				var s = 1.70158, p = 0, a = c;
				if (t === 0) {
					return b;
				}
				if ((t /= d / 2) === 2) {
					return b + c;
				}
				if (!p) {
					p = d * (.3 * 1.5);
				}
				if (a < M.abs(c)) {
					a = c;
					s = p / 4;
				} else {
					s = p / (2 * M.PI) * M.asin(c / a);
				}
				if (t < 1) {
					return -.5 * (a * M.pow(2, 10 * (t -= 1)) * M.sin((t * d - s) * (2 * M.PI) / p)) + b;
				}
				return a * M.pow(2, -10 * (t -= 1)) * M.sin((t * d - s) * (2 * M.PI) / p) * .5 + c + b;
			},
			
			/*Back*/
			backIn: function(t, b, c, d) {
				var s = 1.70158;
				return c * (t /= d) * t * ((s + 1) * t - s) + b;
			},
			backOut: function(t, b, c, d) {
				var s = 1.70158;
				return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
			},
			backBoth: function(t, b, c, d) {
				var s = 1.70158;
				if ((t /= d / 2) < 1) {
					return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
				}
				return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
			},
			
			/*Bounce*/
			bounceIn: function(t, b, c, d) {
				return c - E.bounceOut(d - t, 0, c, d) + b;
			},
			bounceOut: function(t, b, c, d) {
				if ((t /= d) < (1 / 2.75)) {
					return c * (7.5625 * t * t) + b;
				} else if (t < (2 / 2.75)) {
					return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
				} else if (t < (2.5 / 2.75)) {
					return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
				} else {
					return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
				}
			},
			bounceBoth: function(t, b, c, d) {
				if (t < d / 2) {
					return E.bounceIn(t * 2, 0, c, d) * 0.5 + b;
				}
				return E.bounceOut(t * 2 - d, 0, c, d) * 0.5 + c * 0.5 + b;
			}
		};
	
	$.addEasing(E);
	
})(mojoFx || mojo);
