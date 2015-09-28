/*************/
/*  GLOBALS  */
/*************/
// 覆盖Jasmine默认的超时时
jasmine.DEFAULT_TIMEOUT_INTERVAL = 5000;

// 得到任意一个Wilddog demo的引
var demoWilddogUrl = 'https://' + generateRandomString() + '.wilddogio.com';
// 定义可用和不可用参数的例子
var invalidWilddogRefs = [null, undefined, NaN, true, false, [], 0, 5, "", "a", ["hi", 1]];
var validKeys = ["a", "loc1", "(e@Xi:4t>*E2)hc<5oa:1s6{B0d?u", Array(743).join("a")];
var invalidKeys = ["", true, false, null, undefined, {a: 1}, "loc.1", "loc$1", "[loc1", "loc1]", "loc#1", "loc/1", "a#i]$da[s", "te/nst", "te/rst", "te/u0000st", "te/u0015st", "te/007Fst", Array(800).join("a")];
var validLocations = [[0, 0], [-90, 180], [90, -180], [23, 74], [47.235124363, 127.2379654226]];
var invalidLocations = [[-91, 0], [91, 0], [0, 181], [0, -181], [[0, 0], 0], ["a", 0], [0, "a"], ["a", "a"], [NaN, 0], [0, NaN], [undefined, NaN], [null, 0], [null, null], [0, undefined], [undefined, undefined], "", "a", true, false, [], [1], {}, {a:1}, null, undefined, NaN];
var validGeohashes = ["4", "d62dtu", "000000000000"];
var invalidGeohashes = ["", "aaa", 1, true, false, [], [1], {}, {a:1}, null, undefined, NaN];
var validQueryCriterias = [{center: [0,0], radius: 1000}, {center: [1,-180], radius: 1.78}, {center: [22.22,-107.77], radius: 0}, {center: [0,0]}, {center: [1,-180]}, {center: [22.22,-107.77]}, {radius: 1000}, {radius: 1.78}, {radius: 0}];
var invalidQueryCriterias = [{}, {random: 100}, {center: [91,2], radius: 1000, random: "a"}, {center: [91,2], radius: 1000}, {center: [1,-181], radius: 1000}, {center: ["a",2], radius: 1000}, {center: [1,[1,2]], radius: 1000}, {center: [0,0], radius: -1}, {center: [null,2], radius: 1000}, {center: [1,undefined], radius: 1000}, {center: [NaN,0], radius: 1000}, {center: [1,2], radius: -10}, {center: [1,2], radius: "text"}, {center: [1,2], radius: [1,2]}, {center: [1,2], radius: null}, true, false, undefined, NaN, [], "a", 1];

// 创建全局的变量，用于保存Wilddog和GeoDog变量
var wilddogRef, geoDog, geoQueries;

/**********************/
/*  HELPER FUNCTIONS  */
/**********************/
/*在任意Jasmine测试开始之前执行的Helper函数 */
function beforeEachHelper(done) {
  // 创建一个拥有新的上下文的Wilddog引用
  wilddogRef = new Wilddog(demoWilddogUrl, Wilddog.Context());

  // 重置Wilddog
  wilddogRef.remove(function() {
    // 在任意节点创建一个新的wilddog引用
    wilddogRef = wilddogRef.child(generateRandomString());

    // 创建一个新的GeoDog
    geoDog = neGeoDog(wilddogRef);

    // 重置geo查询
    geoQueries = [];

    done();
  });
}

/*在任意Jasmine测试完成之后执行的Helper函数 */
function afterEachHelper(done) {
  // 取消一个未完成的geo查询
  geoQueries.forEach(function(geoQuery) {
    geoQuery.cancel();
  })

  // 等待50毫秒，使每一个测试能给旧的查询事件足够的时间过期
  wait(50).then(function() {
    done();
  });
}

/* 返回一个随机长度的随机字母数字字符串 */
function generateRandomString() {
  var possibleCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var numPossibleCharacters = possibleCharacters.length;

  var text = "";
  for (var i = 0; i < 10; i++) {
    text += possibleCharacters.charAt(Math.floor(Math.random() * numPossibleCharacters));
  }

  return text;
}

/*返回wilddog中的当前数据*/
function getWilddogData() {
  return new RSVP.Promise(function(resolve, reject) {
    wilddogRef.once("value", function(dataSnapshot) {
      resolve(dataSnapshot.exportVal());
    });
  });
};


/* 当参数毫秒过去后然会一个promise*/
function wait(milliseconds) {
  return new RSVP.Promise(function(resolve, reject) {
    var timeout = window.setTimeout(function() {
      window.clearTimeout(timeout);
      resolve();
    }, milliseconds);
  });
};

/* 追踪运行着的所有异步任务 */
function Checklist(items, expect, done) {
  var eventsToComplete = items;

  /* 从事件列表中删除一个任务*/
  this.x = function(item) {
    var index = eventsToComplete.indexOf(item);
    if (index === -1) {
      expect("Attempting to delete unexpected item '" + item + "' from Checklist").toBeFalsy();
    }
    else {
      eventsToComplete.splice(index, 1);
      if (this.isEmpty()) {
        done();
      }
    }
  };

  /* 返回事件队列的长度 */
  this.length = function() {
    return eventsToComplete.length;
  };

  /* 如果事件队列为空，返回true */
  this.isEmpty = function() {
    return (this.length() === 0);
  };
};

/**
 * 一个 Common error handler，在promise的.catch()方法中使用。它能导致测试失败，输出异常详情，否则测试会因为Jasmine异步超时而失败，但是没有失败详情可以追踪。
 **/
function failTestOnCaughtError(error) {
  expect(error).toBeNull();
}