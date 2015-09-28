# GeoDog Demo


开源js库 GeoDog 可以基于地理坐标位置存储和查询一组key值，它的核心是，只存储位置坐标的key值。这最大的好处是能够实时地在给定的地理区域内查询key的集合。

GeoDog 使用 [Wilddog](https://www.wilddog.com) 数据库进行数据存储，允许查询结果根据数据变化实时变化。GeoDog *选择性地加载特定位置附近的数据， 能够使你的应用轻量而且高响应*，即使你的数据库里存在一个巨大的数据集。

## 本地运行

要在本地运行以下的例子，你需要clone整个`geodog`仓库，然后你只需在你的浏览器中打开各个例子中的 `index.html`文件即可。

## [fish - 使用geoQuery]

这个例子稍微复杂一点，将展示如何创建一个`GeoQuery`并对进入查询范围，移出查询范围，在查询范围内部的key做出响应。它还展示了如何取消事件回调的注册。

## [queryBuilder - 建立自定义GeoQuery]

这个demo允许你创建一个自定义的 `GeoQuery` ，能观察到fish进入和离开查询范围时的动态信息

## [securityRules -  安全规则]

毫无疑问，用[Wilddog and Security Rules](https://z.wilddog.com/rule/quickstart)保护你的数据安全是非常重要的。
这个例子包含若干不同版本的针对GeoDog索引的安全规则。
* **[Default rules]** - 
这些安全规则允许任意的客户端添加，修改，删除你的数据，这个不能阻止一个恶意的用户重写修改你的数据

* **[Authenticated rules]** -
这些安全规则规定只有登录认证过的客户端才能更新你的数据。注意，如果没有经过登录认证的客户端调用`GeoDog.add()` 和 `GeoDog.remove()`方法都会失败。
* **[No deletes rules]** - 
这些安全规则阻止客户端常识删除你的数据，客户端调用`GeoDog.remove()`方法会失败

* **[No updates rules]** - 
这些安全规则阻止客户端常识更新或者删除你数据库中存在的key。所有客户端调用`GeoDog.remove()`和对已经存在的key调用`GeoDog.add()`都会失败。

你可以进一步把例子中的`".write"`规则替换成自定义的逻辑重新定义哪些用户和这些用户能怎样对你的GeoDog进行写操作

以上所有的安全规则例子都确保一个客户端不能使用一个方法调用就能重写你的整个GeoDog数据节点。
但是，他们没有一个能阻止一个恶意的用户读取你的整个GeoDog数据，你可以自定义`".read"` 规则来防止。

## [geoDelivery - Fully-featured Example]
这是一个结合了GeoDog和高德地图完整特性，复杂的例子
这是一个结合了GeoDog，高德地图和Wilddog的多特色，复杂的例子。
Wilddog提供数据存储，GeoDog实现geo查询，高德地图提供地图功能。点击鼠标变幻紫色圆圈的位置，就能查到不同区域内的快递员的位置动态信息。
