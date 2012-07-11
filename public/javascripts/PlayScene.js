//現在出題されている文字の先頭からの文字数
__charCounter__ = 0;
//入力済み文字列が格納される
__input__ = new String();

function PlayScene(game,context,Images,name){
  //この関数はSceneを元にして出来ている(継承)
  this.__proto__ = new Scene(game,context,name);
  //初期化処理
  this.init = function(){
    var keyCodeHashs = keyCodeHash("JIS");
    this.smallHash = keyCodeHashs[0];
    this.capitalHash = keyCodeHashs[1];

    /*----Session----*/
    var socket = io.connect('http://localhost:8080');
    var scene = this;
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
          console.log(scene);
          gameStart(scene,data);
        });  
      });
      scene.room = room;
    }

    function gameStart(scene,data) {
      this.scene = scene;
      this.scene.members = data["members"];
      //0:問題名 1:問題文
      this.scene.questions = data["questions"];
      this.scene.questionNumber = 0;
      this.scene.nowQuestion = this.scene.questions[0][1];
      this.keyDownFlag = false;
      console.log(this.scene.questions);

      /*----Game----*/
      this.scene.completedTextList = new Array();
      var countDownCharacter = new CountDownCharacter(this.scene,"countDownCharacter","30pt sans-serif","#000000",1,game.canvas.width/2,game.canvas.height/2,100,100);
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
      var questionCharacter = new PlayCharacter(this.scene,"QuestionCharacter",this.scene.questions[0][1]+"↲","30pt sans-serif","#7d7d7d",0,100,100,100,100);
      this.scene.completedCharacter = new CompletedCharacter(this.scene,"CompletedCharacter",this.scene.completedTextList,"30pt sans-serif","#000000",1,100,100,100,100);
      this.scene.addParts(questionCharacter);
      this.scene.addParts(this.scene.completedCharacter);
      this.scene.keyDownFlag = true;
      }
    }  
    count--;
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
  console.log("入力された文字=> " + String.fromCharCode(event.keyCode).toLowerCase());

  //入力が正しいか？
  //  if(String.fromCharCode(event.keyCode).toLowerCase() == a_char
  console.log(a_char.charCodeAt(0));
  console.log(event.keyCode);
  
/* if文が二重の場合 
  if(event.shiftKey){
    if(this.scene.capitalHash[event.keyCode] == a_char){
      // 正解の時 
    }else{
      // 不正解の時
    }
  }else{
    if(this.scene.smallHash[event.keyCode] == a_char){
      // 正解の時 
    }else{
      // 不正解の時
    }
  }
*/

/* ハッシュを使い回す場合
  var keyHash;
  if(event.shiftKey){
    keyHash = this.scene.capitalHash; 
  }else{
    keyHash = this.scene.smallHash;
  }
  if(keyHash[event.keyCode] == a_char){
    //正解の時
  }else{
    //不正解の時
  }
*/


  //入力された文字==小文字？
  if(event.keyCode == a_char.charCodeAt(0) - 32
      || (event.keyCode == a_char.charCodeAt(0))
      || (event.keyCode == 188 && "<" == a_char)
      || (event.keyCode == 190 && ">" == a_char)
      || (event.keyCode == 56 && "(" == a_char)
      || (event.keyCode == 57 && ")" == a_char)
      || (event.keyCode == 186 && ";" == a_char)
      || (event.keyCode == 67 && ")" == a_char)
      || (event.keyCode == 222 && '"' == a_char)
      || (event.keyCode == 13 && "\n" == a_char)
      || (event.keyCode == 9 && "\t" == a_char)
      || (event.keyCode == 219 && "{" == a_char)
      || (event.keyCode == 221 && "}" == a_char)
      || (event.keyCode == 190 && "." == a_char)
      || (event.keyCode == 32 && " " == a_char)
      || (event.keyCode == 188 && "," == a_char)
      || (event.keyCode == 49 && "!" == a_char)
      || (event.keyCode == 32 && "0" == a_char)
      || (event.keyCode == 51 && "#" == a_char)
    ){
      console.log("正解です");
      __charCounter__++;
      if(__charCounter__ == this.text.length){
        __charCounter__ = 0;
        __input__ = new String();
        game.scene.completedCharacter = new Array();
        game.scene.questionNumber++;
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
    }else {
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



