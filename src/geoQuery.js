/**
 * 创建一个GeoQuery实例
 * @constructor
 * @this {GeoQuery}
 * @param {Wilddog} wilddogRef 一个Wilddog实例
 * @param {Object} queryCriteria 一个指定了圆心和半径的查询条件
 */
var GeoQuery = function (wilddogRef, queryCriteria) {
  /*********************/
  /*  PRIVATE METHODS  */
  /*********************/
  /**
   * 为指定的时间类型触发各自的回调，传递给他key的数据
   *
   * @param {string} eventType 触发回调的事件类型. 包括 "key_entered", "key_exited", or "key_moved".
   * @param {string} key 位置坐标的key值，用来触发事件类型的回调.
   * @param {?Array.<number>} location [latitude, longitude]类型的坐标数组
   * @param {?double} distanceFromCenter 距离圆心的距离或者返回null
   */
  function _fireCallbacksForKey(eventType, key, location, distanceFromCenter) {
    _callbacks[eventType].forEach(function(callback) {
      if (typeof location === "undefined" || location === null) {
        callback(key, null, null);
      }
      else {
        callback(key, location, distanceFromCenter);
      }
    });
  }

  /**
   * 为"ready"事件触发回调
   */
  function _fireReadyEventCallbacks() {
    _callbacks.ready.forEach(function(callback) {
      callback();
    });
  }

  /**
   * Decodes a query string to a query
   * 将查询参数由string转化为一个查询数组对象
   * @param {string} str String类型的查询条件
   * @return {Array.<string>} 数组型的查询条件
   */
  function _stringToQuery(string) {
    var decoded = string.split(":");
    if (decoded.length !== 2) {
      throw new Error("Invalid internal state! Not a valid geohash query: " + string);
    }
    return decoded;
  }

  /**
   * 数组类型的查询转化为String类型的查询
   * 
   * @param {Array.<string>} query 数组类型的查询
   * @param {string} 字符串类型的查询
   */
  function _queryToString(query) {
    if (query.length !== 2) {
      throw new Error("Not a valid geohash query: " + query);
    }
    return query[0]+":"+query[1];
  }

  /**
   * Turns off all callbacks for the provide geohash query.
   * 关闭某geohash查询的所有回调
   * @param {Array.<string>} query 一个geohash查询
   * @param {Object} queryState 一个保存着当前查询现有状态的对象
   */
  function _cancelGeohashQuery(query, queryState) {
    var queryRef = _wilddogRef.orderByChild("g").startAt(query[0]).endAt(query[1]);
    queryRef.off("child_added", queryState.childAddedCallback);
    queryRef.off("child_removed", queryState.childRemovedCallback);
    queryRef.off("child_changed", queryState.childChangedCallback);
    queryRef.off("value", queryState.valueCallback);
  }

  /**
   * 删除当前正在查询的但是非必须的Wilddog查询
   */
  function _cleanUpCurrentGeohashesQueried() {
    var keys = Object.keys(_currentGeohashesQueried);
    var numKeys = keys.length;
    for (var i = 0; i < numKeys; ++i) {
      var geohashQueryStr = keys[i];
      var queryState = _currentGeohashesQueried[geohashQueryStr];
      if (queryState.active === false) {
        var query = _stringToQuery(geohashQueryStr);
        // 删除将来不会再进行查询操作的查询
        //_cancelGeohashQuery(query, queryState);
        delete _currentGeohashesQueried[geohashQueryStr];
      }
    }

    // 删除不会再被查询的位置信息
    keys = Object.keys(_locationsTracked);
    numKeys = keys.length;
    for (i = 0; i < numKeys; ++i) {
      var key = keys[i];
      if (!_geohashInSomeQuery(_locationsTracked[key].geohash)) {
        if (_locationsTracked[key].isInQuery) {
          throw new Error("Internal State error, trying to remove location that is still in query");
        }
        delete _locationsTracked[key];
      }
    }

    // 指示清除当前的geohash查询的任务已经结束
    _geohashCleanupScheduled = false;

    // 取消未完成的计划清理  
    if (_cleanUpCurrentGeohashesQueriedTimeout !== null) {
      clearTimeout(_cleanUpCurrentGeohashesQueriedTimeout);
      _cleanUpCurrentGeohashesQueriedTimeout = null;
    }
  }

  /**
   * 更新位置信息时的回调。当某key的位置信息改变时会更新key相关的信息并且触发相关的事件
   * 当一个key从GeoDog中删除时或者函数参数为null时，会执行必要的清理
   * @param {string} key geodog位置信息的key
   * @param {?Array.<number>} location  [latitude, longitude] 数组形式的位置信息
   */
  function _updateLocation(key, location) {
    validateLocation(location);
    // Get the key and location
    var distanceFromCenter, isInQuery;
    var wasInQuery = (_locationsTracked.hasOwnProperty(key)) ? _locationsTracked[key].isInQuery : false;
    var oldLocation = (_locationsTracked.hasOwnProperty(key)) ? _locationsTracked[key].location : null;

    // 确定参数location代表的位置是否在查询范围内
    distanceFromCenter = GeoDog.distance(location, _center);
    isInQuery = (distanceFromCenter <= _radius);

    // 把参数传递的location添加到位置查询字典中，即使他不在查询范围内
    _locationsTracked[key] = {
      location: location,
      distanceFromCenter: distanceFromCenter,
      isInQuery: isInQuery,
      geohash: encodeGeohash(location, g_GEOHASH_PRECISION)
    };
    // 如果参数key进入查询范围，触发"key_entered"事件
    if (isInQuery && !wasInQuery) {
      _fireCallbacksForKey("key_entered", key, location, distanceFromCenter);
    } else if (isInQuery && oldLocation !== null && (location[0] !== oldLocation[0] || location[1] !== oldLocation[1])) {
      _fireCallbacksForKey("key_moved", key, location, distanceFromCenter);
    } else if (!isInQuery && wasInQuery) {
      _fireCallbacksForKey("key_exited", key, location, distanceFromCenter);
    }
  }

  /**
   * 检查参数geohash当前是否在任意查询中
   * @param {string} geohash The geohash.
   * @param {boolean} Returns 当geohash在某个geohash查询当中时返回true
   */
  function _geohashInSomeQuery(geohash) {
    var keys = Object.keys(_currentGeohashesQueried);
    var numKeys = keys.length;
    for (var i = 0; i < numKeys; ++i) {
      var queryStr = keys[i];
      if (_currentGeohashesQueried.hasOwnProperty(queryStr)) {
        var query = _stringToQuery(queryStr);
        if (geohash >= query[0] && geohash <= query[1]) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * 删除某个位置信息，必要时触发事件
   * @param {string} key 要被删除的key
   * @param {?Array.<number>} currentLocation [latitude, longitude]型式的当前位置信息，如果已经被删除了，为null
   */
  function _removeLocation(key, currentLocation) {
    var locationDict = _locationsTracked[key];
    delete _locationsTracked[key];
    if (typeof locationDict !== "undefined" && locationDict.isInQuery) {
      var distanceFromCenter = (currentLocation) ? GeoDog.distance(currentLocation, _center) : null;
      _fireCallbacksForKey("key_exited", key, currentLocation, distanceFromCenter);
    }
  }

  /**
   * 当有字节点被添加的时候执行的回调
   * @param {Wilddog DataSnapshot} locationDataSnapshot 删除节点的数据快照
   */
  function _childAddedCallback(locationDataSnapshot) {
    _updateLocation(locationDataSnapshot.key(), decodeGeoDogObject(locationDataSnapshot.val()));
  }

  /**
   * 子节点改变事件的回调
   * @param {Wilddog DataSnapshot} locationDataSnapshot 变化节点的数据快照
   */
  function _childChangedCallback(locationDataSnapshot) {
    _updateLocation(locationDataSnapshot.key(), decodeGeoDogObject(locationDataSnapshot.val()))
  }

  /**
   * Callback for child removed events
   * 子节点被删除事件的回调
   * @param {Wilddo DataSnapshot} locationDataSnapshot 被删除节点存在时的数据快照
   */
  function _childRemovedCallback(locationDataSnapshot) {
    var key = locationDataSnapshot.key();
    if (_locationsTracked.hasOwnProperty(key)) {
      _wilddogRef.child(key).once("value", function(snapshot) {
        var location = snapshot.val() === null ? null : decodeGeoDogObject(snapshot.val());
        var geohash = (location !== null) ? encodeGeohash(location) : null;
        if (!_geohashInSomeQuery(geohash)) {
          _removeLocation(key, location);
        }
      });
    }
  }

  /**
   * 当所有的geohash查询都已经获取完所有的子节点添加事件并且必要时触发了ready事件时，调用此回调。
   */
  function _geohashQueryReadyCallback(queryStr) {
    var index = _outstandingGeohashReadyEvents.indexOf(queryStr);
    if (index > -1) {
      _outstandingGeohashReadyEvents.splice(index, 1);
    }
    _valueEventFired = (_outstandingGeohashReadyEvents.length === 0);

    // 如果所有的查询都已经被执行，触发ready事件。
    if (_valueEventFired) {
      _fireReadyEventCallbacks();
    }
  }

  /**
   * 当有新的geohash进入查询边界时附加一个监听器到Wilddo
   */
  function _listenForNewGeohashes() {
    // 获取所有geohash查询列表
    var geohashesToQuery = geohashQueries(_center, _radius*1000).map(_queryToString);

    //去重
    geohashesToQuery = geohashesToQuery.filter(function(geohash, i){
      return geohashesToQuery.indexOf(geohash) === i;
    });

    // 对于我们正在查询的geohash，检查他们是否还需要查询。如果是，不要再查询他们。
    // 否则当我们下一次清理查询字典的时候把他们标记为未查询状态
    var keys = Object.keys(_currentGeohashesQueried);
    var numKeys = keys.length;
    for (var i = 0; i < numKeys; ++i) {
      var geohashQueryStr = keys[i];
      var index = geohashesToQuery.indexOf(geohashQueryStr);
      if (index === -1) {
        _currentGeohashesQueried[geohashQueryStr].active = false;
      }
      else {
        _currentGeohashesQueried[geohashQueryStr].active = true;
        geohashesToQuery.splice(index, 1)
      }
    }

    // 如果还没有清理现有的geohash查询，并且geohash数量超过25个，
    // 剔除掉一个超时的geohash来清理，避免我们创建无限大的无用查询。
    if (_geohashCleanupScheduled === false && Object.keys(_currentGeohashesQueried).length > 25) {
      _geohashCleanupScheduled = true;
      _cleanUpCurrentGeohashesQueriedTimeout = setTimeout(_cleanUpCurrentGeohashesQueried, 10);
    }

    // 追踪那些已经执行的geohash，从而知道何时触发"ready"事件
    _outstandingGeohashReadyEvents = geohashesToQuery.slice();

    
    //轮询所有geohash找到并监听到新的具有相同前缀的geohash，每有一个匹配，就附加一个回调触发相应的事件
    // 当所有的geohash查询都完成后，触发"ready"事件
    geohashesToQuery.forEach(function(toQueryStr) {
      // 解码geohash查询字符串
      var query = _stringToQuery(toQueryStr);

      // 建立Wilddog查询
      var wilddogQuery = _wilddogRef.orderByChild("g").startAt(query[0]).endAt(query[1]);

      // 对于新的匹配的geohash,决定是否触发"key_entered"事件
      var childAddedCallback = wilddogQuery.on("child_added", _childAddedCallback);
      var childRemovedCallback = wilddogQuery.on("child_removed", _childRemovedCallback);
      var childChangedCallback = wilddogQuery.on("child_changed", _childChangedCallback);

      // 当当前的geohash查询被执行，看看它是否是最后一个被执行的
      // 如果是，标记"value"事件已经触发
      // 注意: Wilddog在所有的"child_added" 事件触发后触发"value"事件
      var valueCallback = wilddogQuery.on("value", function() {
        wilddogQuery.off("value", valueCallback);
        _geohashQueryReadyCallback(toQueryStr);
      });

      // 把geohash添加到当前的geohash查询字典中并保存他的状态
      _currentGeohashesQueried[toQueryStr] = {
        active: true,
        childAddedCallback: childAddedCallback,
        childRemovedCallback: childRemovedCallback,
        childChangedCallback: childChangedCallback,
        valueCallback: valueCallback
      };
    });
    // 基于计算geohash的算法，即使更新撸查询半径，也有可能查询不到新的geohash。
    // 这将导致，.updateQuery()被调用后不会触发"READY"事件
    // 查看是否是这种情况，然后出发"READY"事件
    if(geohashesToQuery.length === 0) {
      _geohashQueryReadyCallback();
    }
  }

  /********************/
  /*  PUBLIC METHODS  */
  /********************/
  /**
   * 返回查询的圆心坐标
   * @return {Array.<number>} 查询圆心的坐标，形式为[latitude, longitude]
   */
  this.center = function() {
    return _center;
  };

  /**
   * 返回查询的半径,单位km
   * @return {number} 查询的半径,单位km
   */
  this.radius = function() {
    return _radius;
  };

  /**
   * 更新查询条件
   * @param {Object} newQueryCriteria 指定了圆心坐标和半径的查询条件。
   */
  this.updateCriteria = function(newQueryCriteria) {
    // 校验并存储新的查询条件
    validateCriteria(newQueryCriteria);
    _center = newQueryCriteria.center || _center;
    _radius = newQueryCriteria.radius || _radius;

    // 遍历所有查询范围内的位置，更新它们到查询圆心的距离，并触发正确的事件
    var keys = Object.keys(_locationsTracked);
    var numKeys = keys.length;
    for (var i = 0; i < numKeys; ++i) {
      var key = keys[i];

      // 获取当前key的缓存信息
      var locationDict = _locationsTracked[key];

      // 查看这个位置是否已经在查询中
      var wasAlreadyInQuery = locationDict.isInQuery;

      // 更新该位置到新的查询圆心的距离
      locationDict.distanceFromCenter = GeoDog.distance(locationDict.location, _center);

      // 判断这个位置现在是否在查询中
      locationDict.isInQuery = (locationDict.distanceFromCenter <= _radius);

      // 如果这个位置刚好离开了查询范围， 触发"key_exited"事件
      if (wasAlreadyInQuery && !locationDict.isInQuery) {
        _fireCallbacksForKey("key_exited", key, locationDict.location, locationDict.distanceFromCenter);
      }

      // 如果这个位置刚好进入查询范围内， 触发"key_entered"事件回调
      else if (!wasAlreadyInQuery && locationDict.isInQuery) {
        _fireCallbacksForKey("key_entered", key, locationDict.location, locationDict.distanceFromCenter);
      }
    }

    // 重置控制核实触发"ready"事件的变量
    _valueEventFired = false;

    // 监听新的被添加到GeoDog中的geohash，并触发正确的事件
    _listenForNewGeohashes();
  };

  /**
   * 为查询附加某事件类型触发的回调。可用的事件包括： "ready", "key_entered", "key_exited", 和 "key_moved"。
   *  "ready"事件回调不传递参数。其他的回调将传递三个参数：(1)位置的key, (2) 位置的经纬坐标数组[latitude, longitude]，
   * (3)位置到查询圆心的距离，单位是km
   *
   * 当查询从服务器中初始化的时候就会触发一次ready事件。当所有其他的加载数据的事件触发后ready事件会触发。 每次用
   * updateQuery()的时候ready事件将被立即触发一次，当所有的数据被加载并且其他所有的事件都被触发后也会引发ready事件。
   * 
   * 当一个key进入了查询范围内时触发key_entered事件。当一个key从查询范围外进入查询范围内或者一个key被写入数据正好
   * 落入查询范围内时会触发key_entered事件。 
   *
   * 当一个Key从查询范围内移出查询范围时，会触发key_exited事件。如果这个key被彻底从GeoDo中删除的话，被传递给回调
   * 函数的位置信息和距离信息将为null。 
   * 
   * 当一个key已经在查询范围内部，当它在内部发生移动的时候，会触发key_moved事件。
   * 
   * 返回一个GeoCallbackRegistration，用来取消 callback回调。
   * 
   * @param {string} eventType 附加回调的事件类型，包括 "ready", "key_entered","key_exited", or "key_moved"
   * @callback callback 某个事件触发时调用的回调函数
   * @return {GeoCallbackRegistration} 用来取消一个回调
   */
  this.on = function(eventType, callback) {
    // 输入校验
    if (["ready", "key_entered", "key_exited", "key_moved"].indexOf(eventType) === -1) {
      throw new Error("event type must be \"ready\", \"key_entered\", \"key_exited\", or \"key_moved\"");
    }
    if (typeof callback !== "function") {
      throw new Error("callback must be a function");
    }

    // 把回调添加到查询的回调列表中
    _callbacks[eventType].push(callback);

    // 如果这是一个"key_entered"回调， 如果一个位置进入查询范围，触发此回调
    if (eventType === "key_entered") {
      var keys = Object.keys(_locationsTracked);
      var numKeys = keys.length;
      for (var i = 0; i < numKeys; ++i) {
        var key = keys[i];
        var locationDict = _locationsTracked[key];
        if (locationDict.isInQuery) {
          callback(key, locationDict.location, locationDict.distanceFromCenter);
        }
      }
    }

    // 如果这是一个"ready"回调， 如果查询准备就绪，触发此回调
    if (eventType === "ready") {
      if (_valueEventFired) {
        callback();
      }
    }

    // 返回一个事件注册，它能用来取消回调
    return new GeoCallbackRegistration(function() {
      _callbacks[eventType].splice(_callbacks[eventType].indexOf(callback), 1);
    });
  };

  /**
   * 终止这个查询，所有通过on()附加的回调都会被取消，这个查询在未来都不会再被使用了
   */
  this.cancel = function () {
    // 取消查询回调列表中的所有回调
    _callbacks = {
      ready: [],
      key_entered: [],
      key_exited: [],
      key_moved: []
    };

    // 关闭所有对当前geohash进行查询的Wilddog监听器
    var keys = Object.keys(_currentGeohashesQueried);
    var numKeys = keys.length;
    for (var i = 0; i < numKeys; ++i) {
      var geohashQueryStr = keys[i];
      var query = _stringToQuery(geohashQueryStr);
      _cancelGeohashQuery(query, _currentGeohashesQueried[geohashQueryStr]);
      delete _currentGeohashesQueried[geohashQueryStr];
    }

    // 删除所有缓存的位置
    _locationsTracked = {};

    // 关闭当前的geohash查询清理时间间隔
    clearInterval(_cleanUpCurrentGeohashesQueriedInterval);
  };


  /*****************/
  /*  CONSTRUCTOR  */
  /*****************/
  // 创建查询的GoeDog的Wilddog引用
  if (Object.prototype.toString.call(wilddogRef) !== "[object Object]") {
    throw new Error("wilddogRef must be an instance of Wilddog");
  }
  var _wilddogRef = wilddogRef;

  // 事件回调
  var _callbacks = {
    ready: [],
    key_entered: [],
    key_exited: [],
    key_moved: []
  };

  // 决定核实触发"ready"事件的变量
  var _valueEventFired = false;
  var _outstandingGeohashReadyEvents;

  // 一个保存当前查询中活跃的位置的字典
  // 注意，不是所有的位置都在查询范围内
  var _locationsTracked = {};

  // 保存有活跃回调的geohash查询的字典
  var _currentGeohashesQueried = {};

  // 每隔十秒钟，清理我们正在查询的geohash。这样做，是为了当他们移出查询范围的之后不久我们可以再次查询他们。
  var _geohashCleanupScheduled = false;
  var _cleanUpCurrentGeohashesQueriedTimeout = null;
  var _cleanUpCurrentGeohashesQueriedInterval = setInterval(function() {
      if (_geohashCleanupScheduled === false) {
        _cleanUpCurrentGeohashesQueried();
      }
    }, 10000);

  // 校验并存储查询条件
  validateCriteria(queryCriteria, /* requireCenterAndRadius */ true);
  var _center = queryCriteria.center;
  var _radius = queryCriteria.radius;

  // Listen for new geohashes being added around this query and fire the appropriate events
  // 监听被添加到当前查询附近geohash,并触发适当的事件
  _listenForNewGeohashes();
};
