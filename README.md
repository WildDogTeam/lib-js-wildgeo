# lib-js-wildgeo — Wilddog 实现实时位置查询

基于地理坐标位置存储，使用存储位置坐标的geo hash值查询附近的信息。结合[野狗实时](https://www.wilddog.com)，能够动态跟踪给定的地理区域内移动的数据。

WildGeo 使用 [Wilddog](https://www.wilddog.com) 数据库进行数据存储，允许查询结果根据数据变化实时变化。


## 在线示例
http://geomap.wilddogapp.com/

我们提供了一个实例，这个实例将展示在北京市某片区域内的某快递公司快递员的实时动态位置信息，点击地图内的任意点更改紫色圆圈的位置。
[![ 在 GeoMap 演示截图](screenshot.jpg)](http://geomap.wilddogapp.com/)

## 本地运行
首先确认本机已经安装 [Node.js](http://nodejs.org/) 运行环境，然后执行下列指令：

```
git clone git@github.com:WildDogTeam/lib-js-wildgeo.git
cd  lib-js-wildgeo
```

安装依赖：

```
npm install
bower install
```

启动项目：

```
gulp build
```

## 下载

要在你的工程中使用WildGeo， 你需要在你的HTML页面中引入以下文件。
```html
<!-- RSVP -->
<script src="rsvp.min.js"></script>

<!-- Wilddog -->
<script src="https://cdn.wilddog.com/js/client/current/wilddog.js"></script>

<!-- WildGeo -->
<script src="https://cdn.wilddog.com/app/wildgeo/0.5.0/wildgeo.min.js"></script>
```

使用上面提到的URL可以从Wilddog的CDN上下载到WildGeo的精简版和非精简版。你也可以从Wilddog的Github中下载他们。当然啦，Wilddog和RSVP可以在各自的官网上下载。


你也可以通过npm 或者 bowr安装WildGeo, 他们会自动下载依赖。

```bash
$ npm install wildgeo --save
```

```bash
$ bower install wildgeo --save
```

## API 文档


- new WildGeo(WilddogRef)
创建并返回一个新的`WildGeo`实例来操作地理位置数据，这些地理位置数据将被存储在 wilddogRef 指向的节点中。

- WildGeo.set(keyOrLocations[, location])
添加指定的key - 位置对到WildGeo。

- WildGeo.get(key)
抓取对应`key`存储的位置信息。

[更多API文档](API.md)


## 注册Wilddog
WildGeo需要用Wilddog数据库存储位置数据， 你可以在此[注册](https://www.wilddog.com/my-account/signup)Wilddog账户

## TODO

- 2015-09-30。 gulp 测试未完全通过
```
gulp test
```
测试结果
```
=============================== Coverage summary ===============================
Statements   : 48.49% ( 209/431 )
Branches     : 47.41% ( 110/232 )
Functions    : 33.33% ( 21/63 )
Lines        : 48.49% ( 209/431 )
```

## 支持
如果在使用过程中有任何问题，请提 [issue](https://github.com/WildDogTeam/lib-js-wildgeo/issues) ，我会在 Github 上给予帮助。

## 相关文档

* [Wilddog 概览](https://z.wilddog.com/overview/introduction)
* [JavaScript SDK快速入门](https://z.wilddog.com/web/quickstart)
* [JavaScript SDK API](https://z.wilddog.com/web/api)
* [下载页面](https://www.wilddog.com/download/)
* [Wilddog FAQ](https://z.wilddog.com/questions)


## License
MIT
http://wilddog.mit-license.org/

## 感谢 Thanks

lib-js-wildgeo is built on and with the aid of several  projects. We would like to thank the following projects for helping us achieve our goals:

Open Source:

* [GeoFire](https://github.com/firebase/geofire-js) Realtime location queries with Firebase
* [JQuery](http://jquery.com) The Write Less, Do More, JavaScript Library
