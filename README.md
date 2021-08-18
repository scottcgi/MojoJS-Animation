## MojoJS-Animation v2.1.0

MojoJS-Animation is a very **lightweight** and **powerful** javascript **Animation** engine. 

It also has very **simple**, **beautiful**, **easy-to-understand** source code and **"Make-You-Happy"** API.

* Released versions in [releases](https://github.com/scottcgi/MojoJS-Animation/releases).
* Release changes in [ChangeLog](https://github.com/scottcgi/MojoJS-Animation/blob/master/ChangeLog.md).

The [Online Demo](https://scottcgi.github.io/MojoJS-Animation/demo/animation-demo.html) shows the effect and code usage.

## License

MojoJS-Animation is licensed under the [MIT License](https://github.com/scottcgi/MojoJS-Animation/blob/master/LICENSE "MojoJS-Animation Under MIT License").

## Features

* Support CSS and Transform properties animation.
* Support queue and concurrent animation.
* Support a group of elements animation.
* Support delay animation.
* Support complete callback on animate (not on element).
* Support configurable chained complete callbacks.
* Support fully compatible standard easing effect and more.
  ```js
  linear,        smooth,
  quadraticIn,   quadraticOut,   quadraticInOut
  cubicIn,       cubicOut,       cubicInOut
  quarticIn,     quarticOut,     quarticInOut
  quinticIn,     quinticOut,     quinticInOut
  exponentialIn, exponentialOut, exponentialInOut
  sineIn,        sineOut,        sineInOut
  circularIn,    circularOut,    circularInOut
  elasticIn,     elasticOut,     elasticInOut
  backIn,        backOut,        backInOut,  backInExponentialOut, backInElasticOut
  bounceIn,      bounceOut,      bounceInOut,
  ```

## Code Structure
![MojoJS-Animation Code Structure](https://github.com/scottcgi/MojoJS-Animation/raw/master/demo/code-structure.png "MojoJS-Animation Code Structure")


## How to use

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

## Support

If the source code is **useful** or **helpful** for you, maybe buy me a coffee via **Sponsor Button**.
