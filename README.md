MojoJS
======

It's a JavaScript library that includes **Animation Engine** and **CSS Selector Engine**.

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
 * @param  {Object} animStyle 
 * @return {Object} animation
 */
 animation.animate(animStyle, params);
```


### CSS Selector Engine


#### Features

* Support CSS 3 Selector full and more.




