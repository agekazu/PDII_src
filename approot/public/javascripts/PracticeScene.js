//現在scene.出題されている文字の先頭からの文字数
__charCounter__ = 0;
__tabSpace__ = 4;
//入力済み文字列が格納される
__input__ = new String();

function PracticeScene(game,context,name){
  //この関数はSceneを元にして出来ている(継承)
  this.__proto__ = new Scene(game,context,name);
  //初期化処理
  this.init = function(){
    this.clearParts();
    var scene = this;
    /*----Session----*/
    var socket = io.connect(location.href, {"force new connection":true});
    this.socket = socket;
    this.gameStartFlag = false;

    socket.on('connect', function(){
      if(!this.gameStartFlag){
        //getStandbyイベント発火
        socket.emit('getPracticeQuestions');
      }
      socket.on('getQuestion', function(questions){
        this.gameStartFlag = true;
        gameStart(scene,questions)
      });
    });

    function gameStart(scene,questions) {
      this.scene = scene;
      this.keyDownFlag = false;
      var keyCodeHashs = keyCodeHash("JIS");
      this.scene.smallHash = keyCodeHashs[0];
      this.scene.capitalHash = keyCodeHashs[1];
      //0:0:問題番号,1:言語名_問題の種類 1:問題文
      this.scene.questions = questions;
      this.scene.questionNumber = 0;
      this.scene.myPercentage = 0;
      this.scene.nowQuestion = this.scene.questions[0][1];
      this.scene.nowQuestionInfo = this.scene.questions[0][0];
      this.scene.tabCount = 0;
      this.scene.questionNumberList = [];
      this.scene.questions.forEach(function(question){
        this.scene.questionNumberList.push(question[0][0]);
      },this);

      /*----カウントダウンParts生成----*/
      this.scene.completedTextList = new Array();
      var pratcepracticeCountDownCharacter = new practiceCountDownCharacter(this.scene,"pratcepracticeCountDownCharacter","30pt monospace","#000000",1,game.canvas.width/2,game.canvas.height/2,100,100);
      //0:1位になった回数 1:現在の進捗(％) 2:スコア(進捗の合計)
      this.scene.membersScore = {};
      scene.addParts(pratcepracticeCountDownCharacter);
      this.scene.onkeydown = function(e){
        practiceWhatKey(this.game.scene.nowQuestion,this.game);
      }
    }
  }
}


function PracticeQuestionInfoCharacter(scene,name,text,font,color,layer,x,y,width,height){
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

function practiceCharacter(scene,name,textList,point,font,color,layer,x,y,width,height){
  this.__proto__ = new Parts(scene,name,layer,x,y,width,height);
  this.x = x;
  this.y = y;
  this.tmpY = y;
  this.font = font;
  this.color = color;
  this.tmp = textList.replace(/\n/g,'↵\n');
  this.tmp = this.tmp.replace(/\t/g,'»---');
  this.tmp = this.tmp.replace(/ /g,'␣');
  this.scene.point = point;
  this.scene.textList = this.tmp.split('\n');
  console.log(this.scene);

  //loop関数を上書き
  this.loop = function(){
    this.tmpY=this.y;
    //配列textListをy座標+35しながら一つずつの要素を描画
    this.scene.textList.forEach(function(text){
      this.context.fillStyle = this.color;
      this.context.font = this.scene.point+"pt "+this.font;
      this.context.fillText(text,this.x,this.tmpY);
      this.tmpY += 35;
    },this);
  }
}

function practiceCompletedCharacter(scene,name,textList,point,font,color,layer,x,y,width,height){
  this.__proto__ = new Parts(scene,name,layer,x,y,width,height);
  this.x = x;
  this.y = y;
  this.tmpY = y;
  this.font = font;
  this.color = color;
  this.textList = textList;
  this.scene.point = point;
  console.log(this);
  //loop関数を上書き
  this.loop = function(){
    this.tmpY=this.y;
    //配列textListをy座標+35しながら一つずつの要素を描画
    this.textList.forEach(function(text){
      this.context.fillStyle = this.color;
      this.context.font = this.scene.point+"pt "+this.font;
      this.context.fillText(text,this.x,this.tmpY);
      this.tmpY += 35;
    },this);
  }
}

function practiceCountDownCharacter(scene,name,font,color,layer,x,y,width,height){
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
        var date = new Date();
        this.scene.time = date.getTime();
        this.scene.correctCount = 0;
        this.scene.missCount= 0;
        var ch = this.game.canvas.height;
        var cw = this.game.canvas.width;


        var mypracticeProgressBar = new practiceProgressBar(this.scene,"mypracticeProgressBar",1,20,500,680,50,this.scene.myId);
        this.scene.bar = mypracticeProgressBar;
        progressBarCounter = 0;
        var questionCharacter = new practiceCharacter(this.scene,"QuestionCharacter",this.scene.questions[0][1],20,"monospace","#999999",2,30,100,100,100);
        this.scene.bar.emitCounter = this.scene.questions[0][1].length / 10;
        this.scene.practiceComplatedCharacter = new practiceCompletedCharacter(this.scene,"practiceCompletedCharacter",this.scene.completedTextList,20,"monospace","#000000",2,30,100,100,100);
        this.scene.questionInfoCharacter = new PracticeQuestionInfoCharacter(this.scene,"questionInfoCharacter",this.scene.nowQuestionInfo[0]+" "+this.scene.nowQuestionInfo[1],"17pt monospace","#000000",1,30,35,100,100);

        var characterSizePlusButton = new PracticeCharacterSizeConvButton(this.scene, "characterSizePlusButton",1,this.game.resouces["csPlus"],cw-225, ch-170, 150, 50);
        var characterSizeMinusButton = new PracticeCharacterSizeConvButton(this.scene, "characterSizeMinusButton",1,this.game.resouces["csMinus"],cw-225, ch-110, 150, 50);
        this.scene.addParts(mypracticeProgressBar);
        this.scene.addParts(this.scene.questionInfoCharacter);
        this.scene.addParts(questionCharacter);
        this.scene.addParts(this.scene.practiceComplatedCharacter);
        this.scene.addParts(characterSizePlusButton);
        this.scene.addParts(characterSizeMinusButton);

        //画面遷移音
        this.game.sounds["changeSound"].play();
      }
    }else{  
      count--;
    }
  }
}

function PracticeCharacterSizeConvButton(scene,name,layer,imgObj,x,y,width,height){
  this.__proto__ = new Parts(scene,name,layer,x,y,width,height);
  this.loop = function(){
    //GUI部品の画像の描画
    this.imgObj = imgObj;
    this.context.drawImage(this.imgObj,this.x,this.y);
  }
  //clickされた座標を取得、ボタンの範囲内かを調べる
  this.onclick = function(e){
    var mouseX = this.game.mouseX;
    var mouseY = this.game.mouseY;
    if(mouseX >= this.x && mouseX <= this.x + this.width
        && mouseY >= this.y && mouseY <= this.y + this.height){
          switch(name){
            case "characterSizeMinusButton": 
              this.scene.point -= 1;
              break;
            case "characterSizePlusButton":
              this.scene.point += 1;
              break;
          } 
        }
  }
}

function practiceProgressBar(scene,name,layer,x,y,width,height,id){
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


function practiceProgressUpdata(game,scene,percentage){
  //  if(!scene.membersScore[id]){
  //    scene.membersScore[id] = [0,0,0];
  //  }
  //  scene.membersScore[id][1] = percentage;
  //console.log("scene.memgersScore:" + scene.membersScore[id][1]);

  if (percentage >= 100){
    __charCounter__ = 0;
    game.scene.tabCount = 0;
    __input__ = new String();
    game.scene.practiceComplatedCharacter = new Array();
    game.scene.questionNumber++;
    //ゲームが終了した場合
    if(game.scene.questionNumber >= game.scene.questions.length){ 
      game.sounds["finishSound"].play();
      var date = new Date();
      //プレイ時間を求める
      game.scene.time = date.getTime() - game.scene.time;
      game.scene.questionNumber = 0;
      game.resultData = {"time":game.scene.time,"correct":game.scene.correctCount,"miss":game.scene.missCount,"questionNumberList":game.scene.questionNumberList};
      console.log("PracticeResult画面へ遷移");
      game.changeScene('practiceResultScene');
    }else{
      //問題遷移音
      game.sounds["changeSound"].play();
      game.scene.nowQuestion = game.scene.questions[game.scene.questionNumber][1];
      game.scene.textList = game.scene.nowQuestion.replace(/\n/g,'↵\n');
      game.scene.textList = game.scene.textList.replace(/\t/g,'»---');
      game.scene.textList = game.scene.textList.replace(/ /g,'␣');
      game.scene.textList = game.scene.textList.split('\n');
      game.scene.bar.emitCounter = game.scene.nowQuestion.length/10;
      game.scene.nowQuestionInfo = game.scene.questions[game.scene.questionNumber][0];
      game.scene.questionInfoCharacter.text = game.scene.nowQuestionInfo[0]+" "+game.scene.nowQuestionInfo[1];
      repaint(game.scene,game);
    }
    scene.bar.volume = 0;
    scene.bar.increment = 0;
    scene.myPercentage = 0;
  }
}



//入力文字と出題文字が同じかを確かめるメソッド
function practiceWhatKey(text,game){
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
  //console.log("入力された文字=> " + event.keyCode);

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
    game.scene.correctCount += 1;
    __charCounter__++;
    // 10％打ったら
    if(__charCounter__ >= game.scene.bar.emitCounter){
      game.scene.bar.increment += 10;
      game.scene.myPercentage += 10;
      game.scene.bar.emitCounter += game.scene.nowQuestion.length/10;
      practiceProgressUpdata(game,game.scene,game.scene.myPercentage);
      game.scene.score += 10;
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
    game.scene.missCount += 1
  }
}

//入力済み文字列の描画
function repaint(scene,game) {
  if(scene.completedTextList){
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
}

