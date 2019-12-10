MojoJS v2.0.0
=============

MojoJS is a JavaScript library that includes **Animation Engine** and **CSS Selector Engine**. And it's licensed under the [MIT License](https://github.com/scottcgi/MojoJS/blob/master/LICENSE "Mojoc Under MIT License").

### Animation Engine

The [MojoJS.animation](https://github.com/scottcgi/MojoJS/blob/master/animation/MojoJS.animation.js) is a very **lightweight** and **powerful** JS animation library. It also has very **simple**, **beautiful**, **easy-to-understand** source code and **"Make-You-Happy"** API.

The [Online Demo](https://scottcgi.github.io/MojoJS/animation/demo/animation-demo.html) shows the effect and code usage.

#### Features

* Support CSS and Transform properties animation.
* Support queue and concurrent animation.
* Support a group of elements animation.
* Support delay animation.
* Support complete callback on animate (not on element).
* Support configurable chained complete callbacks.
* Support fully compatible standard easing effect.
* Creative default configuration API.

```js
/**
 * Create animation object.
 *
 * @param {String (selector) | Array<HTMLElement> | NodeList | HTMLElement} targets
 */
 MojoJS.createAnimation(targets)
 
 
/**
 * Animate with config.
 *
 * the variable params is optional and no order limit, they can be:
 * 
 * duration (Number)  : animation time.
 * isQueue  (Boolean) : inqueue or concurrent.                       
 * complete (Function): complete callback.                       
 * args     (Array)   : complete function args.
 * easing   (String)  : easing function name.
 * config   (Object)  : variable params in object and three more settings:
 *   {
 *       id       (String) : the animation id.
 *       appendTo (String) : callback when animation of this id is completed.
 *       delay    (Number) : delay time before animation starts.
 *   }  
 * 
 * @param  {Object} animStyle 
 * @return {Object} animation
 */
 animation.animate(animStyle[, duration, isQueue, complete, args, easing, config]);


/**
 * The animation complete callback function.
 *
 * args    (Array)     : apply from [config.args].
 * thisArg (Animation) : apply from current animation.
 */
 function completeCallback([arg0, arg1, ...]);
 
```

### CSS Selector Engine

The [MojoJS.query](https://github.com/scottcgi/MojoJS/blob/master/query/MojoJS.query.js) is a pure JS **CSS Selector Engine**. 

It not only supports **full CSS3 Selectors** and more and **easy-to-extend**, but also has very **simple**, **beautiful**, **easy-to-understand** code structure and implementation ideas.

The [Online Speed-Test](https://scottcgi.github.io/MojoJS/query/speed-test/index.html) shows the support selectors and speed comparison with native query.

```js
/**
 * Select HTMLElements by css seletor and context.
 * 
 * @param  {String}                                                          selector
 * @param  {String (selector) | HTMLElement | Array<HTMLElement> | NodeList} context (optional)
 * @return {Array<HTMLElement>}                                              HTMLElements Array
 */
 MojoJS.query(selector, context);
```

#### Support CSS Selectors

```css
*
#myid
E
E.warning
E F
E > F
E + F
E ~ F

E[foo]  
E[foo="bar"]    
E[foo~="bar"]   
E[foo^="bar"]   
E[foo$="bar"]   
E[foo*="bar"]   
E[foo|="en"]

E:checked
E:disabled
E:enabled
E:empty

E:only-child
E:last-child
E:first-child
E:first-of-type
E:last-of-type
E:only-of-type

E:not(s)
E:nth-child(n)
E:nth-last-child(n)
E:nth-of-type(n)
E:nth-last-of-type(n)

// Extra Selectors

:not(E)
:not(E.cls)
:not(:not(E,F))

:has(E)
:has(E.cls)
:has(:not(E,F))
:has(E > F)

[NAME!=VALUE]
:contains(TEXT)
:selected

:first
:last
:even
:odd
:nth
```

## Support

I hope if you are **enjoying** my work and the source code is **useful** for you, :coffee: maybe you could buy me a coffee via [Paypal-0.99](https://www.paypal.me/PayScottcgi/0.99):kissing_heart:~
