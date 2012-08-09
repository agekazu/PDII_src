//現在scene.出題されている文字の先頭からの文字数
__charCounter__ = 0;
__tabSpace__ = 4;
//入力済み文字列が格納される
__input__ = new String();

function PlayScene(game,context,name){
  //この関数はSceneを元にして出来ている(継承)
  this.__proto__ = new Scene(game,context,name);
  //初期化処理
  this.init = function(){
    this.clearParts();
    var scene = this;
    /*----Session----*/
    var socket = io.connect(location.href, {"force new connection":true});
    this.socket = socket;

    socket.on('connect', function(){
      //getStandbyイベント発火
      socket.emit('getStandby');
      socket.on('getRoomKey', function(data){
        createRoom(data);
      });
    });
    //waitingを表示
    var waitingCharacter = new WaitingCharacter(this,"waitingCharacter","waiting...","30pt monospace","#000000",0,game.canvas.width-300,game.canvas.height-50,100,100);
    this.addParts(waitingCharacter);
    function createRoom(key){
      var room = io.connect(location.href + key, {"force new connection":true});
      room.on('connect', function(){
        room.on('gameStart', function(data){
          scene.myId = room.socket.sessionid;
          gameStart(scene,data);;
        });  
        room.on('getProgress', function(data){
          progressUpdata(game,scene,data["id"],data["percentage"]);
        });
        room.on('addMember',function(data){
          console.log(data);
          scene.membersLength = data[0]+1;
          scene.maxMembers = data[1];
        });
      });
      scene.room = room;
    }

    function gameStart(scene,data){
      waitingCharacter.delete();
      this.scene = scene;
      this.keyDownFlag = false;
      var keyCodeHashs = keyCodeHash("JIS");
      this.scene.smallHash = keyCodeHashs[0];
      this.scene.capitalHash = keyCodeHashs[1];
      this.scene.members = data["members"];
      //0:0:0:問題番号,0:0:1:言語名_問題の種類 0:1:1:問題文
      this.scene.questions = data["questions"];
      this.scene.questionNumber = 0;
      this.scene.nowQuestion = this.scene.questions[0][1];
      this.scene.nowQuestionInfo = this.scene.questions[0][0];
      this.scene.tabCount = 0;
      this.scene.questionNumberList = [];
      this.scene.questions.forEach(function(question){
        this.scene.questionNumberList.push(question[0][0]);
      },this);


      /*----カウントダウンParts生成----*/
      this.scene.completedTextList = new Array();
      var countDownCharacter = new CountDownCharacter(this.scene,"countDownCharacter","30pt monospace","#000000",1,game.canvas.width/2,game.canvas.height/2,100,100);
      //0:1位になった回数 1:現在の進捗(％) 2:スコア(進捗の合計)
      this.scene.membersScore = {};
      scene.addParts(countDownCharacter);
      this.scene.onkeydown = function(e){
        whatKey(this.game.scene.nowQuestion,this.game);
      }
    }
  }
}

function QuestionInfoCharacter(scene,name,text,font,color,layer,x,y,width,height){
  this.__proto__ = new Parts(scene,name,layer,x,y,width,height);
  this.x = x;
  this.y = y;
  this.font = font;
  this.color = color;
  this.text = text;

  //loop関数を上書き
  this.loop = function(){
    this.context.fillStyle = this.color;
    this.context.font = this.font;
    this.context.fillText(this.text,this.x,this.y);
    this.context.rect(20,50,680,450);
    this.context.stroke();
  }
}


function WaitingCharacter(scene,name,text,font,color,layer,x,y,width,height){
  this.__proto__ = new Parts(scene,name,layer,x,y,width,height);
  this.x = x;
  this.y = y;
  this.font = font;
  this.color = color;
  this.text = text;

  //loop関数を上書き
  this.loop = function(){
    this.context.fillStyle = this.color;
    this.context.font = this.font;
    if(this.scene.membersLength){
      this.context.fillText("("+this.scene.membersLength+"/"+this.scene.maxMembers+")"+this.text,this.x,this.y);
    }else{
      this.context.fillText(this.text,this.x,this.y);
    }
  }
}

function PlayCharacter(scene,name,textList,font,color,layer,x,y,width,height){
  this.__proto__ = new Parts(scene,name,layer,x,y,width,height);
  this.x = x;
  this.y = y;
  this.tmpY = y;
  this.font = font;
  this.color = color;
  this.tmp = textList.replace(/\n/g,'↲\n');
  this.tmp = this.tmp.replace(/\t/g,'»---');
  this.tmp = this.tmp.replace(/ /g,'␣');
  this.scene.textList = this.tmp.split('\n');

  //loop関数を上書き
  this.loop = function(){
    this.tmpY=this.y;
    //配列textListをy座標+35しながら一つずつの要素を描画
    this.scene.textList.forEach(function(text){
      this.context.fillStyle = this.color;
      this.context.font = this.font;
      this.context.fillText(text,this.x,this.tmpY);
      this.tmpY += 35;
    },this);
  }
}

function CompletedCharacter(scene,name,textList,font,color,layer,x,y,width,height){
  this.__proto__ = new Parts(scene,name,layer,x,y,width,height);
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
  this.__proto__ = new Parts(scene,name,layer,x,y,width,height);
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
      if(countDown != 1){
        //カウントダウン音
        this.game.sounds["countdownSound"].play();
      }
      countDown--;
      count = 30;
      if (0 >= countDown) {
        this.delete();
        this.scene.score = 0;
        this.scene.winnerCount = 0;
        this.scene.keyDownFlag = true;
        var myProgressBar = new ProgressBar(this.scene,"myProgressBar",1,20,500,680,50,this.scene.myId);
        this.scene.bar = myProgressBar;
        this.scene.playerBars = [];
        progressBarCounter = 0;
        console.log(this.scene.members);
        console.log(this.scene.myId);
        this.scene.members.forEach(function(id){
          if (this.scene.myId != id){
            var playerProgressBar = new ProgressBar(this.scene,"PlayerProgressBar",1,750,50+(progressBarCounter*50+5),200,25,id);
            progressBarCounter++;
            this.scene.playerBars[id] = playerProgressBar;
            this.scene.addParts(playerProgressBar);
          }
        },this);
        var questionCharacter = new PlayCharacter(this.scene,"QuestionCharacter",this.scene.questions[0][1],"30pt monospace","#7d7d7d",0,20,100,100,100);
        this.scene.bar.emitCounter = this.scene.questions[0][1].length / 10;
        this.scene.completedCharacter = new CompletedCharacter(this.scene,"CompletedCharacter",this.scene.completedTextList,"30pt monospace","#000000",1,20,100,100,100);
        this.scene.questionInfoCharacter = new QuestionInfoCharacter(this.scene,"questionInfoCharacter",this.scene.nowQuestionInfo[0]+" "+this.scene.nowQuestionInfo[1],"17pt monospace","#000000",1,20,20,100,100);

        this.scene.addParts(myProgressBar);
        this.scene.addParts(questionCharacter);
        this.scene.addParts(this.scene.questionInfoCharacter);
        this.scene.addParts(this.scene.completedCharacter);
        //画面遷移音
        this.game.sounds["changeSound"].play();
      }
    }  
    count--;
  }
}

function ProgressBar(scene,name,layer,x,y,width,height,id){
  this.__proto__ = new Parts(scene,name,layer,x,y,width,height);
  this.scene = scene;
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.id = id;
  this.volume = 0;
  this.increment = 0;
  this.emitCounter = 0;
  this.speed = 1;

  this.grad = this.context.createLinearGradient(this.x,this.y,this.x,this.y+this.height);
  this.grad.addColorStop(0,'rgb(192, 80, 77)');
  this.grad.addColorStop(1,'rgb(255, 205, 205)');

  this.loop = function(){
    if(this.increment > 0){
      this.increment -= this.speed;
      this.volume += this.speed;
    }else if(this.increment < 0){
      this.increment += this.speed;
      this.volume -= this.speed;
    }

    if(this.volume > 100){
      this.volume = 100;
    }else if(this.volume < 0){
      this.volume = 0;
    }
    this.context.beginPath();
    this.context.fillStyle = this.grad;
    this.context.rect(this.x,this.y,(this.volume/100)*this.width,this.height);
    this.context.fill();
    this.context.strokeRect(this.x,this.y,this.width,this.height);
    this.context.closePath();
  }
}

function progressUpdata(game,scene,id,percentage) {
  if(!scene.membersScore[id]){
    scene.membersScore[id] = [0,0,0];
  }
  scene.membersScore[id][1] = percentage;
  //console.log("scene.memgersScore:" + scene.membersScore[id][1]);

  if (percentage >= 100){
    //scene.myIdだった場合
    __charCounter__ = 0;
    game.scene.tabCount = 0;
    __input__ = new String();
    game.scene.completedCharacter = new Array();
    game.scene.questionNumber++;
    game.scene.score = 0;
    //ゲームが終了した場合
    if(game.scene.questionNumber >= game.scene.questions.length){ 
      //終了音
      game.sounds["finishSound"].play();
      game.resultData = {"score":game.scene.membersScore,"members":game.scene.members,"myId":game.scene.myId,"questionNumberList":game.scene.questionNumberList};
      console.log("Result画面へ遷移");
      game.changeScene('resultScene');
      scene.socket.disconnect();
    }else{
      //問題遷移音
      game.sounds["changeSound"].play();
      game.scene.nowQuestion = game.scene.questions[game.scene.questionNumber][1];
      game.scene.textList = game.scene.nowQuestion.replace(/\n/g,'↲\n');
      game.scene.textList = game.scene.textList.replace(/\t/g,'»---');
      game.scene.textList = game.scene.textList.replace(/ /g,'␣');
      game.scene.textList = game.scene.textList.split('\n');
      game.scene.bar.emitCounter = game.scene.nowQuestion.length/10;
      game.scene.nowQuestionInfo = game.scene.questions[game.scene.questionNumber][0];
      game.scene.questionInfoCharacter.text = game.scene.nowQuestionInfo[0]+" "+game.scene.nowQuestionInfo[1];
      repaint(game.scene,game)
    }
    scene.bar.volume = 0;
    scene.bar.increment = 0;
    scene.members.forEach(function(id){
      if(this.scene.myId != id){
        this.scene.playerBars[id].increment = 0;
        this.scene.playerBars[id].volume = 0;
      }
    },this);
    scene.membersScore[id][0]++;
    scene.members.forEach(function(id){
      if(this.scene.membersScore[id]){
        this.scene.membersScore[id][2] += this.scene.membersScore[id][1];
        this.scene.membersScore[id][1] = 0;
      }
    },this);
  }else{
    if(scene.myId != id){
      scene.playerBars[id].increment += 10;
    }
  }
}



//入力文字と出題文字が同じかを確かめるメソッド
function whatKey(text,game){
  if(!game.scene.keyDownFlag){
    return;
  }
  //打鍵音
  game.sounds["typeSound"].play();
  //現在打つべき文字の先頭からの文字数
  this.text = text;

  //charNumber文字目の文字列のUnicode値をa_charへ
  var a_char = this.text.charAt(__charCounter__);
  //console.log("出題文字=> " + a_char);
  //console.log("入力された文字=> " + String.fromCharCode(event.keyCode));

  // keyHashの選択
  var keyHash;
  if(event.shiftKey){
    keyHash = game.scene.capitalHash; 
  }else{
    keyHash = game.scene.smallHash;
  }

  if(!keyHash[event.keyCode]){
    return;
  }
  //console.log("出題文字のキーコード "+a_char.charCodeAt(0));
  //console.log("入力されたキーコード "+event.keyCode);

  if(keyHash[event.keyCode][0] == a_char || keyHash[event.keyCode][1] == a_char || keyHash[event.keyCode][2] == a_char){
    // 正解の時
    //console.log("正解です");
    //console.log("問題文の長さ="+game.scene.textLength);
    //console.log("問題文の長さ/10="+game.scene.textLength / 10);
    //console.log("問題文の長さ/10(小数点以下切り捨て)="+Math.floor(game.scene.textLength/10));
    //console.log("入力済み文字列の長さ="+__charCounter__);
    //console.log("入力済み文字列 % 問題文の長さ/10="+__charCounter__ % Math.floor(game.scene.textLength/10));

    __charCounter__++;
    // 10％打ったら
    if(__charCounter__ >= game.scene.bar.emitCounter){
      game.scene.bar.increment += 10;
      game.scene.bar.emitCounter += game.scene.nowQuestion.length/10;
      game.scene.score += 10;
      game.scene.room.emit('sendProgress',[game.scene.winnerCount, game.scene.score]);
      if(game.scene.score == 100){
        game.scene.winnerCount++;
        game.scene.score = 0;
      }
    }

    //タブキーが押されたら
    if(event.keyCode == 9){
      game.scene.tabCount += __tabSpace__ - 1;
    }
    repaint(game.scene,game);

  }else{
    //不正解の時
    //console.log("違います");
  }
}

//入力済み文字列の描画
function repaint(scene,game) {
  var x = -scene.tabCount;
  var textList = scene.textList;
  scene.completedTextList.length = 0;
  var tempText = scene.completedTextList;
  for(i=0;i<textList.length;i++){
    if(x + textList[i].length < __charCounter__){
      x += textList[i].length;
      tempText.push(textList[i]);
    }else{
      tempText.push(textList[i].slice(0,__charCounter__ - x));
      break;
    }
  }
}

