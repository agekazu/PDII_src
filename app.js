// 初期化処理

  var express = require('express')
, app = express.createServer()
  app.listen(8080);    
  var io = require('socket.io').listen(app);

  app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
  });

app.configure('development',  function(){
  app.use(express.errorHandler({ dumpExceptions: true,  showStack: true }));
});

app.configure('production',  function(){
  app.use(express.errorHandler());
});

init();
function init(){
  // requireして各種サーバを立てる
  var roomList = {} // 生成された部屋が格納される連想配列
  , standbyQueue = new Array() // 待機中のユーザを格納 
    , nextKey = 0 // 次のゲームのkey
    , MAXMEMBERS = 2;
  // connectionイベント
  io.sockets.on('connection', function(socket){
    socket.on('getStandby', function (){
      getStandby(socket);
    });
    socket.on('getPracticeQuestion',function(){
    });
    socket.on('sendNewRecord',function(){
    });
    // disconnectイベント
    socket.on('disconnect', function(){
      console.log("server :" + socket.id + 'が切断しました。');
    });
  });

  function getStandby(socket){
    if(nextKey == 0){
      var date = new Date();
      nextKey = String(date.getTime());
      createNameSpece(nextKey);
      roomList[nextKey] = {"members":new Array()};
      socket.emit("getRoomKey", nextKey);
    }else{
      socket.emit("getRoomKey", nextKey);
    }
  }


  function createNameSpece(key){
    var room = io
      .of("/" + key)
      .on("connection",function(socket){
        console.log("server :nextKey=> " + key + "に" + socket.id +"というclientが接続しました");
        if(roomList[nextKey]["members"].length + 1 == MAXMEMBERS){
          roomList[nextKey]["members"].push(socket.id);
          room.emit('gameStart', roomList[nextKey]["members"]);
        }else if(roomList[nextKey]["members"].length + 1 >= MAXMEMBERS){
         // 規定人数以上だった場合 
        }else{
          roomList[nextKey]["members"].push(socket.id);
        }
        room.on('test',function(msg){
          /*clientとのやりとりはここから書いていく*/ 
        });
      }); 
  }
}

// httpサーバを立てる
// ルートディレクトリにアクセスがあったら、index.htmlへ
app.get('/', function(req, res) {
  res.sendfile(__dirname + '/views/index.html');
});


