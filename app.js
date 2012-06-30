// 初期化処理
onload = function(){
  init();
}

function init(){
  // requireして各種サーバを立てる
  var app = require('express').createServer()
    , io = require('socket.io').listen(app)
    , mongo = require('mongodb')
    , Server = mongo.Server
    , Db = mongo.Db;
  // 生成された部屋が格納される連想配列
  var roomList = {};
  // 待機中のユーザを格納
  , standbyQueue  =  new Array;  
  // 次のゲームのkey
  , nextKey = 0;

  // connectionイベント
  io.sockets.on('getRanking', function (){
  }
  io.sockets.on('getStandby', function (socket){
    // queueに追加する設定
    if(nextKey == 0){
      var date = new Date();
      nextkey = String(new Date().getTime());
      createNameSpece(nextkey);
      roomList[nextKey]["members"].push(socket.id);
      socket.emit("getRoomKey", nextKey);
    }else{
      roomList[nextKey]["members"].push(socket.id);
      socket.emit("getRoomKey", nextKey);
    }
  });
  }

  function createNameSpece(key){
    var room = io
    .of("/" + key)
    .on("connection",function(socket){
      console.log("server :nextKey=> " + nextKey + "に" + socket.id +"というclientが接続しました");
      socket.on('connection',function(msg){
        /*clientとのやりとりはここから書いていく*/ 
      });
    }); 
  }

io.sockets.on('getPracticeQuestion', function (){
}
io.sockets.on('sendNewRecord', function (){
}

io.sockets.on('connection', function (socket){
  console.log("server :" + socket.id + 'が接続しました');
  // Clientで発火したkey sendイベントへのコールバック
  socket.on('key request',function(key){
    var date = new Date();
    var key = String(date.getTime());
    console.log("server :送ったkey=> " + key + " 受け取ったユーザのID=> " + socket.id);
    roomList[key] = generateRoom(key);
    socket.emit('key push',key);
  });
  // disconnectイベント
  socket.on('disconnect', function(){
    console.log("server :" + socket.id + 'が切断しました。');
  });
});




/**************
  以下、DBコード
 ***************/
// DBサーバーオブジェクトを新しく作る   
var server = new Server('sodadb-RiceAmerican-data-0.dotcloud.com', 30198, {auto_reconnect: true});
var db = new Db('mydb', server);

db.open(function(err,db){
  if(!err) {
    db.authenticate('dbuser', 'dbpassword', function(err, result){
      db.collection('things', function(err, collection){
        collection.update({"_id":4},{$set:{"value":4}});
        collection.find().toArray(function(err, items) {
          // DBの中身を表示
          //          console.log(items);
        });
      });
    });
  }
});
