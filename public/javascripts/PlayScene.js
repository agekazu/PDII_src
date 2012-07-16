//現在scene.出題されている文字の先頭からの文字数
__charCounter__ = 0;
//入力済み文字列が格納される
__input__ = new String();

function PlayScene(game,context,Images,name){
  //この関数はSceneを元にして出来ている(継承)
  this.__proto__ = new Scene(game,context,name);
  //初期化処理
  this.init = function(){
    var scene = this;
    /*----Session----*/
    var socket = io.connect('http://localhost:8080');
    console.log(socket);

    socket.on('connect', function(){
      //getStandbyイベント発火
      socket.emit('getStandby');
      socket.on('getRoomKey', function(key){
        console.log("client: 受け取ったkey:" + key);
        createRoom(key);
      });
    });

    function createRoom(key){
      var room = io.connect('http://localhost:8080/' + key);
      room.on('connect', function(){
        room.on('gameStart', function(data){
          gameStart(scene,data);
        });  
        room.on('getProgress', function(data){
          progressUpdata(scene,data["id"],data["percentage"]);
        });
      });
      scene.room = room;
    }

    function gameStart(scene,data) {
      this.scene = scene;
      this.keyDownFlag = false;
      var keyCodeHashs = keyCodeHash("JIS");
      this.scene.smallHash = keyCodeHashs[0];
      this.scene.capitalHash = keyCodeHashs[1];
      this.scene.members = data["members"];
      //0:問題名 1:問題文
      this.scene.questions = data["questions"];
      this.scene.questionNumber = 0;
      this.scene.nowQuestion = this.scene.questions[0][1];
      console.log(this.scene.questions);

      /*----カウントダウンParts生成----*/
      this.scene.completedTextList = new Array();
      var countDownCharacter = new CountDownCharacter(this.scene,"countDownCharacter","30pt Arial","#000000",1,game.canvas.width/2,game.canvas.height/2,100,100);
      //0:1位になった回数 1:現在の進捗(％)
      this.scene.membersScore = {"membersId":[0,0]}
      scene.addParts(countDownCharacter);
      this.scene.onkeydown = function(e){
        whatKey(this.game.scene.nowQuestion,this.game);
      }
    }
  }
}


function PlayCharacter(scene,name,textList,font,color,layer,x,y,width,height){
  this.__proto__ = new Parts(scene,name,x,y,width,height);
  this.x = x;
  this.y = y;
  this.tmpY = y;
  this.font = font;
  this.color = color;
  this.tmp = textList;
  this.scene.textLength = this.tmp.length;//出題されている問題の文字数
  this.scene.textList = this.tmp.split('\n');

  //loop関数を上書き
  this.loop = function(){
    this.tmpY=this.y;
    //配列textListをy座標+35しながら一つずつの要素を描画
    this.scene.textList.forEach(function(text){
      this.context.fillStyle = this.color;
      this.context.font = this.font;
      this.context.fillText(text + "↲",this.x,this.tmpY);
      this.tmpY += 35;
    },this);
  }
}

function CompletedCharacter(scene,name,textList,font,color,layer,x,y,width,height){
  this.__proto__ = new Parts(scene,name,x,y,width,height);
  this.x = x;
  this.y = y;
  this.tmpY = y;
  this.font = font;
  this.color = color;
  this.textList = textList;
  //loop関数を上書き
  this.loop = function(){
    this.tmpY=this.y;
    //配列textListをy座標+35しながら一つずつの要素を描画
    this.textList.forEach(function(text){
      this.context.fillStyle = this.color;
      this.context.font = this.font;
      this.context.fillText(text,this.x,this.tmpY);
      this.tmpY += 35;
    },this);
  }
}

function CountDownCharacter(scene,name,font,color,layer,x,y,width,height){
  this.__proto__ = new Parts(scene,name,x,y,width,height);
  this.x = x;
  this.y = y;
  this.font = font;
  this.color = color;
  var count = 30;
  var countDown = 5;

  this.loop = function(){
    this.context.fillStyle = this.color;
    this.context.font = this.font;
    this.context.fillText(String(countDown),this.x,this.y);            
    if (0 >= count) {
      countDown--;
      count = 30;
      if (0 >= countDown) {
        this.delete();
        this.scene.keyDownFlag = true;
        var progressBar = new ProgressBar(this.scene,"ProgressBar",1,20,500,700,50);
        var questionCharacter = new PlayCharacter(this.scene,"QuestionCharacter",this.scene.questions[0][1]+"↲","30pt Arial","#7d7d7d",0,20,100,100,100);
        this.scene.completedCharacter = new CompletedCharacter(this.scene,"CompletedCharacter",this.scene.completedTextList,"30pt Arial","#000000",1,20,100,100,100);

        this.scene.addParts(progressBar);
        this.scene.addParts(questionCharacter);
        this.scene.addParts(this.scene.completedCharacter);
      }
    }  
    count--;
  }
}

function ProgressBar(scene,name,layer,x,y,width,height){
  this.__proto__ = new Parts(scene,name,x,y,width,height);
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;

  this.grad = this.context.createLinearGradient(this.x,this.y,this.x,this.y+this.height);
  this.grad.addColorStop(0,'rgb(192, 80, 77)');
  this.grad.addColorStop(1,'rgb(255, 205, 205)');

  scene.volume = 0;
  scene.increment = 0;
  this.speed = 1;

  this.loop = function(){
    //this.increment = scene.membersScore.membersId[1];
    console.log(scene.increment);
    console.log(scene.volume);
    console.log(this.speed);
    
    if(scene.increment > 0){
      scene.increment -= this.speed;
      scene.volume += this.speed;
    }else if(scene.increment < 0){
      scene.increment += this.speed;
      scene.volume -= this.speed;
    }

    if(scene.volume > 100){
      scene.volume = 100;
    }else if(scene.volume < 0){
      scene.volume = 0;
    }
    this.context.beginPath();
    this.context.fillStyle = this.grad;
    this.context.rect(this.x,this.y,(scene.volume/100)*this.width,this.height);
    this.context.fill();
    this.context.strokeRect(this.x,this.y,this.width,this.height);
    this.context.closePath();
  }
}


function progressUpdata(scene,id,percentage) {
  console.log("progressUpdata実行");
  scene.membersScore.membersId[1] = percentage;
  console.log("scene.memgersScore[1]:" + scene.membersScore.membersId[1]);
  if (scene.membersScore.membersId[1] >= 100){
    scene.volume = 0;
    scene.increment = 0;
    scene.membersScore.membersId[1] = 0;
    scene.membersScore.membersId[0]++;
  }  
}
//入力文字と出題文字が同じかを確かめるメソッド
function whatKey(text,game){
  if(!game.scene.keyDownFlag){
    return;
  }
  //現在打つべき文字の先頭からの文字数
  this.text = text;

  //charNumber文字目の文字列のUnicode値をa_charへ
  var a_char = this.text.charAt(__charCounter__);
  console.log("出題文字=> " + a_char);
  console.log("入力された文字=> " + String.fromCharCode(event.keyCode));

  // ハッシュを使い回す場合
  var keyHash;
  if(event.shiftKey){
    keyHash = game.scene.capitalHash; 
  }else{
    keyHash = game.scene.smallHash;
  }
  
  console.log("出題文字のキーコード "+a_char.charCodeAt(0));
  console.log("入力されたキーコード "+event.keyCode);
  console.log(event);
  console.log(keyHash[event.keyCode]);
  console.log(a_char);

  if(keyHash[event.keyCode] == a_char){
    //正解の時
    console.log("正解です");
    console.log("問題文の長さ:"+game.scene.textLength);
    console.log("問題文の長さ/10:"+game.scene.textLength / 10);
    console.log("問題文の長さ/10(小数点以下切り捨て)"+Math.floor(game.scene.textLength/10));
    console.log("入力済み文字列 % 問題文の長さ/10"+__charCounter__ % Math.floor(game.scene.textLength/10));
    //10％打ったら
    if(__charCounter__ % Math.floor(game.scene.textLength/10)  == 0){
      //membersId[1]更新したフラグ
      this.scene.increment += 10;
      scene.membersScore.membersId[1] += 10;
      scene.room.emit('sendProgress',scene.membersScore.membersId);
    }

    __charCounter__++;
    if(__charCounter__ == this.text.length){
      __charCounter__ = 0;
      __input__ = new String();
      game.scene.completedCharacter = new Array();
      game.scene.questionNumber++;
      console.log(game.scene.textLength);
      if(game.scene.questionNumber >= game.scene.questions.length){ 
        game.changeScene('resultScene');
      }else{
        game.scene.nowQuestion = game.scene.questions[game.scene.questionNumber][1];
        game.scene.textList = game.scene.nowQuestion.split('\n');
        repaint(game.scene,game);
      }
    }else{
      repaint(game.scene,game);
      //scene.room.emit('test','test');
    }
  }else{
    //不正解の時
    console.log("違います");
  }
}

//入力済み文字列の描画
function repaint(scene,game) {
  var x = 0;
  var textList = scene.textList;
  scene.completedTextList.length = 0;
  var tempText = scene.completedTextList;
  for(i=0;i<textList.length;i++){
    if(x + textList[i].length < __charCounter__){
      x += textList[i].length + 1;
      tempText.push(textList[i]);
    }else{
      tempText.push(textList[i].slice(0,__charCounter__ - x));
      break;
    }
  }
}


