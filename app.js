// 初期化処理
onload = function(){
  init();
}

var app = require('express').createServer()
, io = require('socket.io').listen(app)
function init(){
  // requireして各種サーバを立てる
  var roomList = {} // 生成された部屋が格納される連想配列
  , standbyQueue = new Array // 待機中のユーザを格納 
  , members = new Array // roomListのnextkeyのユーザが格納される配列
  , nextKey = 0; // 次のゲームのkey


  // connectionイベント

  io.sockets.on('connection', function(){
    sockets.on('getStandby', function (socket){
      getStandby(socket);
    });
    sockets.on('getPracticeQuestion',function(){
    });
    sockets.on('sendNewRecord',function(){
    });
    // disconnectイベント
    socket.on('disconnect', function(){
      console.log("server :" + socket.id + 'が切断しました。');
    });
  });

  function getStandby(socket){
    if(nextKey == 0){
      var date = new Date();
      nextkey = String(date.getTime());
      createNameSpece(nextkey);
      roomList.nextKey.members.push(socket.id);
      socket.emit("getRoomKey", nextKey);
    }else{
      roomList.nextKey.members.push(socket.id);
      socket.emit("getRoomKey", nextKey);
    }
  }

  function createNameSpece(key){
    var room = io
      .of("/" + key)
      .on("connection",function(socket){
        console.log("server :nextKey=> " + key + "に" + socket.id +"というclientが接続しました");
        room.on('connection',function(msg){
          /*clientとのやりとりはここから書いていく*/ 
        });
      }); 
  }
}

//httpサーバを立てる
app.listen(8080);    
//ルートディレクトリにアクセスがあったら、index.htmlへ
app.get('/', function(req, res) {
  res.sendfile(__dirname + '/views/index.html');
});


