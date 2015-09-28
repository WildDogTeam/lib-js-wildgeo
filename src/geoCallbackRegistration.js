/**
 * 建立一个GeoCallbackRegistration实例。
 * 
 * @constructor
 * @this {GeoCallbackRegistration}
 * @callback 当回调注册被取消时，cancelCallback回调将运行。
 */
var GeoCallbackRegistration = function(cancelCallback) {
  /********************/
  /*  PUBLIC METHODS  */
  /********************/
  /**
   * 取消一个事件的回调注册，于是将不会再触发回调。对其他你创建的事件回调无影响。
   */
  this.cancel = function() {
    if (typeof _cancelCallback !== "undefined") {
      _cancelCallback();
      _cancelCallback = undefined;
    }
  };

  /*****************/
  /*  CONSTRUCTOR  */
  /*****************/
  if (typeof cancelCallback !== "function") {
    throw new Error("callback must be a function");
  }

  var _cancelCallback = cancelCallback;
};