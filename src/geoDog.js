/**
 * 创建一个GeoDog实例
 * @constructor
 * @this {GeoDog}
 * @param {Wilddog} 存储GeoDog数据的Wilddog数据库wilddogRef.
 */
var GeoDog = function(wilddogRef) {
  /********************/
  /*  PUBLIC METHODS  */
  /********************/
  /**
   * 返回创建GeoDog实例的Wilddog实例
   * @return {Wilddog} 用来创建GeoDog实例的Wilddog实例
   */
  this.ref = function() {
    return _wilddogRef;
  };

  /*
   * 往Wilddog中写入key-location数据对。当写入成功后返回一个空的promise。
   * 如果要存入的key在GeoDog中已经存在，将被覆盖重写。
   * @param {string|Object} keyOrLocations 代表被增加的位置的key或者代表要被添加的key-location数据对。
   * @param {Array.<number>|undefined} location 要被添加的经纬坐标数组。
   * @return {Promise.<>} 写入成功后执行的Promise
   */
  this.set = function(keyOrLocations, location) {
    var locations;
    if (typeof keyOrLocations === "string" && keyOrLocations.length !== 0) {
      locations = {};
      locations[keyOrLocations] = location;
    } else if (typeof keyOrLocations === "object") {
      if (typeof location !== "undefined") {
        throw new Error("The location argument should not be used if you pass an object to set().");
      }
      locations = keyOrLocations;
    } else {
      throw new Error("keyOrLocations must be a string or a mapping of key - location pairs.");
    }

    var newData = {};

    Object.keys(locations).forEach(function(key) {
      validateKey(key);

      var location = locations[key];
      if (location === null) {
        newData[key] = null;
      } else {
        validateLocation(location);

        var geohash = encodeGeohash(location);
        newData[key] = encodeGeoDogObject(location, geohash);
      }
    });

    return new RSVP.Promise(function(resolve, reject) {
      function onComplete(error) {
        if (error !== null) {
          reject("Error: Wilddog synchronization failed: " + error);
        }
        else {
          resolve();
        }
      }

      _wilddogRef.update(newData, onComplete);
    });
  };

  /**
   * 返回key对应的一个包含地理位置信息的promise
   * 如果key参数在数据库中不存在，返回空的promise
   * @param {string} key 要检索的地理位置的key值
   * @return {Promise.<Array.<number>>} 包含根据key值检索到的位置信息的promise
   */
  this.get = function(key) {
    validateKey(key);
    return new RSVP.Promise(function(resolve, reject) {
      _wilddogRef.child(key).once("value", function(dataSnapshot) {
        if (dataSnapshot.val() === null) {
          resolve(null);
        } else {
          resolve(decodeGeoDogObject(dataSnapshot.val()));
        }
      }, function (error) {
        reject("Error: Wilddog synchronization failed: " + error);
      });
    });
  };

  /**
   * 删除GeoDog中的key，删除成功后返回一个空的promise
   * 如果参数key不在GeoDog中，promise仍能成功解析。
   * @param {string} key 被删除的地理位置的key值
   * @return {Promise.<string>} 输入的key被删除后返回的promise
   */
  this.remove = function(key) {
    return this.set(key, null);
  };

  /**
   * 根据查询条件返回一个新的GeoDog实例。
   * @param {Object} queryCriteria 指定了圆心坐标和半径的查询条件
   * @return {GeoQuery} 一个新的GeoQuery对象
   */
  this.query = function(queryCriteria) {
    return new GeoQuery(_wilddogRef, queryCriteria);
  };

  /*****************/
  /*  CONSTRUCTOR  */
  /*****************/
  if (Object.prototype.toString.call(wilddogRef) !== "[object Object]") {
    throw new Error("wilddogRef must be an instance of Wilddog");
  }

  var _wilddogRef = wilddogRef;
};

/**
 * 计算两点之间距离的静态方法，单位是km。
 * 通过Haversine公式
 *
 * @param {Array.<number>} location1 第一个位置的经纬度坐标数组
 * @param {Array.<number>} location2 第二个位置的经纬度坐标数组
 * @return {number} 两点间的距离，单位km
 */
GeoDog.distance = function(location1, location2) {
  validateLocation(location1);
  validateLocation(location2);

  var radius = 6371; // Earth's radius in kilometers
  var latDelta = degreesToRadians(location2[0] - location1[0]);
  var lonDelta = degreesToRadians(location2[1] - location1[1]);

  var a = (Math.sin(latDelta / 2) * Math.sin(latDelta / 2)) +
          (Math.cos(degreesToRadians(location1[0])) * Math.cos(degreesToRadians(location2[0])) *
          Math.sin(lonDelta / 2) * Math.sin(lonDelta / 2));

  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return radius * c;
};
