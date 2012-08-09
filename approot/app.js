// 初期化処理

  var express = require('express')
, app = express.createServer()
  app.listen(process.env['PORT_WWW'] || 8080);
  var io = require('socket.io').listen(app);

  io.configure('production', function(){
    io.set('transports', ['websocket']);
  });

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

var fs = require('fs');
init();

function init(){
  // requireして各種サーバを立てる
  var roomList = {} // 生成された部屋が格納される連想配列
  , standbyQueue = new Array() // 待機中のユーザを格納 
    , nextKey = 0 // 次のゲームのkey
    , MAXMEMBERS = 2 // ゲーム開始時の人数
    , MAXQUESTIONS = 5; // 出題数
  // connectionイベント
  io.sockets.on('connection', function(socket){
    socket.on('getStandby', function (){
      getStandby(socket);
    });
    socket.on('getPracticeQuestions',function(){
      socket.emit("getQuestion", createQuestion());
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
      roomList[nextKey] = {"members":new Array(), "questions":new Array()};
      createNameSpece(nextKey);
      socket.emit("getRoomKey", nextKey);
    }else{
      socket.emit("getRoomKey", nextKey);
    }
  }

  function createNameSpece(key){
    var room = io
      .of("/" + key)
      .on("connection",function(socket){
        if(nextKey != 0){
          console.log("server :nextKey=> " + key + "に" + socket.id +"というclientが接続しました");
          room.emit("addMember", [roomList[nextKey]["members"].length, MAXMEMBERS]);

          //規定人数と等しいか？
          if(roomList[nextKey]["members"].length + 1 == MAXMEMBERS){
            roomList[nextKey]["members"].push(socket.id);
            roomList[nextKey]["questions"] = createQuestion();
            room.emit('gameStart', roomList[nextKey]);
            room.startFlag = true;
            nextKey = 0;
          }else if(roomList[nextKey]["members"].length + 1 >= MAXMEMBERS){
            // 規定人数以上だった場合 
          }else{
            roomList[nextKey]["members"].push(socket.id);
          }
        }
        socket.on('sendProgress', function(membersScore){
          room.emit('getProgress', {"id":socket.id, "percentage":membersScore[1]});
          console.log("server:membersScore="+membersScore);
        });
        socket.on('disconnect', function(){
          if(!room.startFlag){
            room.emit("addMember", [roomList[nextKey]["members"].length - 2, MAXMEMBERS]);
            roomList[nextKey]["members"].pop(socket.id);
            if(roomList[nextKey]["members"].length == 0){
              nextKey = 0;
            }
          }
        });
        /*clientとのやりとりはここから書いていく*/ 
      }); 
    room.startFlag = false;
  }

  function createQuestion(){
    var questions = new Array()
      , queDir;
    // questionsディレクトリ以下のファイルを配列で返す
    queDir = fs.readdirSync('./questions/');
    var i = queDir.length;
    //配列をシャッフルする。
    while(i){
      var j = Math.floor(Math.random()*i);
      var t = queDir[--i];
      queDir[i] = queDir[j];
      queDir[j] = t;
    }

    for(var i=0; i < MAXQUESTIONS; i++){
      var info = [];
      var input = fs.readFileSync('./questions/'+queDir[i],encoding='utf8');
      //問題の1行目：問題文の番号<tab>言語名_HelloWorld
      var infoline = input.split("\n")[0];
      info[0] = infoline.split("\t")[0];
      info[1] = infoline.split("\t")[1];
      console.log(info[0]);
      console.log(info[1]);
      console.log(info);
      questions[i] = [info, input.replace(infoline+"\n", "")];
    }
    //問題番号、言語名、問題文が格納された配列を返す
    return questions;
  }
}//init()

// httpサーバを立てる
// ルートディレクトリにアクセスがあったら、index.htmlへ
app.get('/', function(req, res){
  res.sendfile(__dirname + '/views/index.html');
});
// 解説ページにアクセスがあったら、questions.htmlへ
app.get('/questions/', function(req, res){
  if(!req.query.number){
    res.sendfile(__dirname + '/views/questions0.html');
  }else{
    var pageNumber = Math.floor((parseInt(req.query.number)-1)/10+1);
    res.sendfile(__dirname + '/views/questions'+pageNumber+'.html');
  }
});



