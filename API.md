## API Reference

### WildGeo

WildGeo实例可以对Wilddog数据库进行读写地理位置数据和查询。

#### new WildGeo(WilddogRef)
创建并返回一个新的`WildGeo`实例来操作地理位置数据，这些地理位置数据将被存储在 wilddogRef 指向的节点中。注意，这个 wilddogRef必须能到达你的Wilddog数据库中的任何节点。

```JavaScript
//创建一个Wilddog引用，WildGeo将在其中存储数据。
var wilddogRef = new Wilddog("https://<your-wilddog>.wilddogio.com/");

// 创建一个WildGeo的索引
var wildGeo = new WildGeo(wilddogRef);
```

#### WildGeo.ref()

返回用来创建 WildGeo 实例的 Wilddog 引用
```JavaScript
var wilddogRef = new Wilddog("https://<your-wilddog>.wilddogio.com/");
var wildGeo = new WildGeo(wilddogRef);

var ref = wildGeo.ref();  // ref === wilddogRef
```

#### WildGeo.set(keyOrLocations[, location])
添加指定的key - 位置对到WildGeo.如果提供的`keyOrLocations`参数是一个string字符串， 只有这一个位置信息会被添加。 `keyOrLocations`参数也可以是一个包含key值和位置数值的Map对象，你可以一次写入多个位置数据，这样更加高效。
如果参数中传递的Key值已经存在于`WildGeo`中，那么它的键值对将被新的位置数据覆盖，位置信息必须是`[latitude, longitude]`格式的。
Keys必须是 String 类型的并且是 Wilddog 数据库可用的key。

```JavaScript
wildGeo.set("some_key", [37.79, 122.41]).then(function() {
  console.log("Provided key has been added to WildGeo");
}, function(error) {
  console.log("Error: " + error);
});
```

```JavaScript
wildGeo.set({
  "some_key": [37.79, 122.41],
  "another_key": [36.98, 122.56]
}).then(function() {
  console.log("Provided keys have been added to WildGeo");
}, function(error) {
  console.log("Error: " + error);
});
```

#### WildGeo.get(key)

抓取对应`key`存储的位置信息。
如果`key`不存在， 返回值为null。
```JavaScript
wildGeo.get("some_key").then(function(location) {
  if (location === null) {
    console.log("Provided key is not in WildGeo");
  }
  else {
    console.log("Provided key has a location of " + location);
  }
}, function(error) {
  console.log("Error: " + error);
});
```

#### WildGeo.remove(key)
在`WildGeo`中删除指定的`key`,

等价于调用`set(key, null)` or `set({ <key>: null })`。
```JavaScript
wildGeo.remove("some_key").then(function() {
  console.log("Provided key has been removed from WildGeo");
}, function(error) {
  console.log("Error: " + error);
});
```

#### WildGeo.query(queryCriteria)

根据提供的`queryCriteria`查询条件，创建并返回一个新的`GeoQuery`实例
`queryCriteria`描述了一个圆形区域的查询，必须包含以下keys:
* `center` - 查询的圆心, 形式是 `[latitude, longitude]`
* `radius` - 查询的半径, 单位是km。

```JavaScript
var geoQuery = wildGeo.query({
  center: [10.38, 2.41],
  radius: 10.5
});
```

### GeoQuery

一个查找符合查询条件的数据集合的查询，每当调用`WildGeo.query()`就会创建一个新的`GeoQuery`。
#### GeoQuery.center()

返回一个查询的圆心坐标。返回值的格式是 `[latitude, longitude]`。

```JavaScript
var geoQuery = wildGeo.query({
  center: [10.38, 2.41],
  radius: 10.5
});

var center = geoQuery.center();  // center === [10.38, 2.41]
```

#### GeoQuery.radius()

返回查询的半径，单位是km。
```JavaScript
var geoQuery = wildGeo.query({
  center: [10.38, 2.41],
  radius: 10.5
});

var radius = geoQuery.radius();  // radius === 10.5
```

#### GeoQuery.updateCriteria(newQueryCriteria)

更新查询的查询条件
`newQueryCriteria`必须是一个包含`center`, `radius`，或者两者都包含的对象
```JavaScript
var geoQuery = wildGeo.query({
  center: [10.38, 2.41],
  radius: 10.5
});

var center = geoQuery.center();  // center === [10.38, 2.41]
var radius = geoQuery.radius();  // radius === 10.5

geoQuery.updateCriteria({
  center: [-50.83, 100.19],
  radius: 5
});

center = geoQuery.center();  // center === [-50.83, 100.19]
radius = geoQuery.radius();  // radius === 5

geoQuery.updateCriteria({
  radius: 7
});

center = geoQuery.center();  // center === [-50.83, 100.19]
radius = geoQuery.radius();  // radius === 7
```

#### GeoQuery.on(eventType, callback)
当`eventType`触发时，查询的回调将执行。可用的`eventType`的值有：`ready`, `key_entered`, `key_exited`, and `key_moved`。`ready`事件的回调不被传递任何参数。其他的回调会被传递三个参数：

1. 位置的key
2. 位置的坐标对[latitude, longitude] 
3. 与查询圆心的距离，单位km。

当查询从服务器中初始化的时候就会触发一次`ready`事件。当所有其他的加载数据的事件触发后`ready`事件会触发。
每次用`updateQuery()`的时候`ready`事件将被立即触发一次，当所有的数据被加载并且其他所有的事件都被触发后也会引发`ready`事件。
当一个key进入了查询范围内时触发`key_entered`事件。当一个key从查询范围外进入查询范围内或者一个key被写入数据正好落入查询范围内时会触发`key_entered`事件。
当一个Key从查询范围内移出查询范围时，会触发`key_exited`事件。如果这个key被彻底从`WildGeo`中删除的话，被传递给回调函数的位置信息和距离信息将为null。
当一个key已经在查询范围内部，当它在内部发生移动的时候，会触发`key_moved`事件。

返回一个`GeoCallbackRegistration`，用来取消 `callback`回调。
```JavaScript
var onReadyRegistration = geoQuery.on("ready", function() {
  console.log("GeoQuery has loaded and fired all other events for initial dat");
});

var onKeyEnteredRegistration = geoQuery.on("key_entered", function(key, location, distance) {
  console.log(key + " entered query at " + location + " (" + distance + " km from center)");
});

var onKeyExitedRegistration = geoQuery.on("key_exited", function(key, location, distance) {
  console.log(key + " exited query to " + location + " (" + distance + " km from center)");
});

var onKeyMovedRegistration = geoQuery.on("key_moved", function(key, location, distance) {
  console.log(key + " moved within query to " + location + " (" + distance + " km from center)");
});
```

#### GeoQuery.cancel()

终止一个Geo查询，它将不再更新位置信息。所有通过`on()`附加到这个查询上的回调函数都会被取消。这个查询在未来都不能再被使用了。
```JavaScript
// 这个例子表达了：当一个查询范围内的key离开时，将终止监听任何事件。
var onKeyEnteredRegistration = geoQuery.on("key_entered", function(key, location, distance) {
  console.log(key + " entered query at " + location + " (" + distance + " km from center)");
});

var onKeyExitedRegistration = geoQuery.on("key_exited", function(key, location, distance) {
  console.log(key + " exited query to " + location + " (" + distance + " km from center)");

  // 取消所有回调
  geoQuery.cancel();
});
```

### GeoCallbackRegistration

注册事件被用来取消一个不会再被使用的`GeoQuery.on()`回调，每次调用 `GeoQuery.on()`都将返回一个新的`GeoCallbackRegistration`。当你想停止针对某个事件的回调，同时并不想取消查询的所有事件回调的时候，GeoCallbackRegistration是很有用的。
#### GeoCallbackRegistration.cancel()

取消一个事件的回调注册，于是将不会再触发回调。对其他你创建的事件回调无影响。
```JavaScript

var onKeyEnteredRegistration = geoQuery.on("key_entered", function(key, location, distance) {
  console.log(key + " entered query at " + location + " (" + distance + " km from center)");
});

var onKeyExitedRegistration = geoQuery.on("key_exited", function(key, location, distance) {
  console.log(key + " exited query to " + location + " (" + distance + " km from center)");

  // Cancel the "key_entered" callback
  onKeyEnteredRegistration.cancel();
});
```

### Helper Methods

#### WildGeo.distance(location1, location2)

返回两个位置坐标之间的距离的静态方法。
`location1` 和 `location1` 必须是 `[latitude, longitude]`格式的.

```JavaScript
var location1 = [10.3, -55.3];
var location2 = [-78.3, 105.6];

var distance = WildGeo.distance(location1, location2);  // distance === 12378.536597423461
```

## Promises
读写数据时，WildGeo使用promises。Promises代表一个潜在的长时间运行的操作的结果，允许代码异步执行。当操作完成的时候，promise将会根据操作结果被"resolved" 或者 "fulfilled"，结果会被传递到promise定义的`then()`方法中。
WildGeo用轻量级别RSVP.js库提供JavaScript promises的实现。如果你对promises不熟悉，请参考[RSVP.js documentation](https://github.com/tildeio/rsvp.js/)。下面是一个promise的例子：

```JavaScript
promise.then(function(result) {
  console.log("Promise was successfully resolved with the following value: " + result);
}, function(error)
  console.log("Promise was rejected with the following error: " + error);
})
```


