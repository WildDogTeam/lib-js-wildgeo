# GeoDog for JavaScript — Wilddog 实现实时位置查询


开源js库 GeoDog 可以基于地理坐标位置存储和查询一组key值，它的核心是，只存储位置坐标的key值。这最大的好处是能够实时地在给定的地理区域内查询符合条件的key值。

GeoDog 使用 [Wilddog](https://www.wilddog.com) 数据库进行数据存储，允许查询结果根据数据变化实时变化。GeoDog *选择性地加载特定位置附近的数据， 能够使你的应用轻量而且高响应*，即使你的数据库里存在一个巨大的数据集。


### 在你的数据上集成GeoDog


GeoDog 是 Wilddog 的一个轻量级附加组件。GeoDog简单地将它的数据以自己的格式和位置存储在Wilddog数据库中。因此在保持你现有数据的格式和安全规则都不变的情况下也能提供一个简单的地理查询解决方案。

### 示例使用



假设你正在构建一个酒吧相关的APP, 你把酒吧所有的信息，如酒吧的名字,营业时间和价格区间，存储在/bars/<bar-id>中，
然后你想为它增加一个功能，能让使用它的人用它查询出附近的酒吧，啊哈，这时候你就需要GeoDog了。你可以用GeoDog存储所有酒吧的位置信息，用酒吧的ID作为GeoDog的key值。GeoDog就能让你轻而易举地查询到哪些酒吧（IDs）在附近。如果你想展示酒吧其他的附加信息，你可以查询/bars/<bar-id>节点下存储的酒吧信息。

## 实例
我们提供了一个实例，这个实例将展示在北京市某片区域内的某快递公司快递员的实时动态位置信息，点击[实例](http://geomap.wilddogapp.com/)查看,点击地图内的任意点更改紫色圆圈的位置。


## Downloading GeoDog

要在你的工程中使用GeoDog， 你需要在你的HTML页面中引入以下文件。
```html
<!-- RSVP -->
<script src="rsvp.min.js"></script>

<!-- Wilddog -->
<script src="https://cdn.wilddog.com/js/client/current/wilddog.js"></script>

<!-- GeoDog -->
<script src="https://cdn.wilddog.com/app/geodog/0.5.0/geodog.min.js"></script>
```

使用上面提到的URL可以从Wilddog的CDN上下载到GeoDog的精简版和非精简版。你也可以从Wilddog的Github中下载他们。当然啦，Wilddog和RSVP可以在各自的官网上下载。

你也可以通过npm 或者 bowr安装GeoDog, 他们会自动下载依赖。

```bash
$ npm install GeoDog --save
```

```bash
$ bower install GeoDog --save
```


## Getting Started with Wilddog

GeoDog需要用Wilddog数据库存储位置数据， 你可以在此[注册](https://www.wilddog.com/my-account/signup)Wilddog账户


## API Reference

### GeoDog

GeoDog实例可以对Wilddog数据库进行读写地理位置数据和查询。
#### new GeoDog(WilddogRef)
创建并返回一个新的`GeoDog`实例来操作地理位置数据，这些地理位置数据将被存储在 wilddogRef 指向的节点中。注意，这个 wilddogRef必须能到达你的Wilddog数据库中的任何节点。

```JavaScript
//创建一个Wilddog引用，GeoDog将在其中存储数据。
var wilddogRef = new Wilddog("https://<your-wilddog>.wilddogio.com/");

// 创建一个GeoDog的索引
var geoDog = new GeoDog(wilddogRef);
```

#### GeoDog.ref()

返回用来创建 GeoDog 实例的 Wilddog 引用
```JavaScript
var wilddogRef = new Wilddog("https://<your-wilddog>.wilddogio.com/");
var geoDog = new GeoDog(wilddogRef);

var ref = geoDog.ref();  // ref === wilddogRef
```

#### GeoDog.set(keyOrLocations[, location])
添加指定的key - 位置对到GeoDog.如果提供的`keyOrLocations`参数是一个string字符串， 只有这一个位置信息会被添加。 `keyOrLocations`参数也可以是一个包含key值和位置数值的Map对象，你可以一次写入多个位置数据，这样更加高效。
如果参数中传递的Key值已经存在于`GeoDog`中，那么它的键值对将被新的位置数据覆盖，位置信息必须是`[latitude, longitude]`格式的。
Keys必须是 String 类型的并且是 Wilddog 数据库可用的key。

```JavaScript
geoDog.set("some_key", [37.79, 122.41]).then(function() {
  console.log("Provided key has been added to GeoDog");
}, function(error) {
  console.log("Error: " + error);
});
```

```JavaScript
geoDog.set({
  "some_key": [37.79, 122.41],
  "another_key": [36.98, 122.56]
}).then(function() {
  console.log("Provided keys have been added to GeoDog");
}, function(error) {
  console.log("Error: " + error);
});
```

#### GeoDog.get(key)

抓取对应`key`存储的位置信息。
如果`key`不存在， 返回值为null。
```JavaScript
geoDog.get("some_key").then(function(location) {
  if (location === null) {
    console.log("Provided key is not in GeoDog");
  }
  else {
    console.log("Provided key has a location of " + location);
  }
}, function(error) {
  console.log("Error: " + error);
});
```

#### GeoDog.remove(key)
在`GeoDog`中删除指定的`key`,

等价于调用`set(key, null)` or `set({ <key>: null })`。
```JavaScript
geoDog.remove("some_key").then(function() {
  console.log("Provided key has been removed from GeoDog");
}, function(error) {
  console.log("Error: " + error);
});
```

#### GeoDog.query(queryCriteria)

根据提供的`queryCriteria`查询条件，创建并返回一个新的`GeoQuery`实例
`queryCriteria`描述了一个圆形区域的查询，必须包含以下keys:
* `center` - 查询的圆心, 形式是 `[latitude, longitude]`
* `radius` - 查询的半径, 单位是km。

```JavaScript
var geoQuery = geoDog.query({
  center: [10.38, 2.41],
  radius: 10.5
});
```

### GeoQuery

一个查找符合查询条件的数据集合的查询，每当调用`GeoDog.query()`就会创建一个新的`GeoQuery`。
#### GeoQuery.center()

返回一个查询的圆心坐标。返回值的格式是 `[latitude, longitude]`。

```JavaScript
var geoQuery = geoDog.query({
  center: [10.38, 2.41],
  radius: 10.5
});

var center = geoQuery.center();  // center === [10.38, 2.41]
```

#### GeoQuery.radius()

返回查询的半径，单位是km。
```JavaScript
var geoQuery = geoDog.query({
  center: [10.38, 2.41],
  radius: 10.5
});

var radius = geoQuery.radius();  // radius === 10.5
```

#### GeoQuery.updateCriteria(newQueryCriteria)

更新查询的查询条件
`newQueryCriteria`必须是一个包含`center`, `radius`，或者两者都包含的对象
```JavaScript
var geoQuery = geoDog.query({
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
当一个Key从查询范围内移出查询范围时，会触发`key_exited`事件。如果这个key被彻底从`GeoDog`中删除的话，被传递给回调函数的位置信息和距离信息将为null。
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

#### GeoDog.distance(location1, location2)

返回两个位置坐标之间的距离的静态方法。
`location1` 和 `location1` 必须是 `[latitude, longitude]`格式的.

```JavaScript
var location1 = [10.3, -55.3];
var location2 = [-78.3, 105.6];

var distance = GeoDog.distance(location1, location2);  // distance === 12378.536597423461
```

## Promises
读写数据时，GeoDog使用promises。Promises代表一个潜在的长时间运行的操作的结果，允许代码异步执行。当操作完成的时候，promise将会根据操作结果被"resolved" 或者 "fulfilled"，结果会被传递到promise定义的`then()`方法中。
GeoDog用轻量级别RSVP.js库提供JavaScript promises的实现。如果你对promises不熟悉，请参考[RSVP.js documentation](https://github.com/tildeio/rsvp.js/)。下面是一个promise的例子：

```JavaScript
promise.then(function(result) {
  console.log("Promise was successfully resolved with the following value: " + result);
}, function(error)
  console.log("Promise was rejected with the following error: " + error);
})
```


## Contributing

如果你想参与到GeoDog中来，你需要运行下列命令：
```bash
$ git clone https://github.com/WildDogTeam/lib-js-wildgeo.git
$ cd geodog-js         # go to the geodog directory
$ npm install -g gulp   # globally install gulp task runner
$ npm install -g bower  # globally install Bower package manager
$ npm install           # install local npm build / test dependencies
$ bower install         # install local JavaScript dependencies
$ gulp watch            # watch for source file changes
```
