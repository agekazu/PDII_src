//明示的にグローバル変数であることを示している
var __game__;
var __startTime__;
var __count__ = 0;
var __fps__ = 60;

//全ての画面が継承するメソッドScene
function Scene(game,context,name){
  this.game = game;
  this.context = context;
  this.name = name;
  this.partsList = new Array();
  this.init = function(){
  }

}

//memo:prototype=>あるメソッドをオブジェクト化すると、そのオブジェクトから参照できるメソッド

/******************************************************
  Sceneの持つprototype
 *******************************************************/

//addParts(parts追加)
Scene.prototype.addParts = function(parts){
  this.partsList.push(parts);
  parts.init();
  this.partsList = this.partsList.sort(function(a,b){return a.layer-b.layer});
}

//delparts(parts削除)
Scene.prototype.delParts = function(parts){
  this.partsList.pop(parts);
}

//loop(画面初期化処理)
Scene.prototype.loop = function(){
  //画面全体を初期化
  this.context.clearRect(0,0,this.game.canvas.width,this.game.canvas.height);
  //partsList配列の各要素に対して
  this.partsList.forEach(function(obj){
    //loop関数を実行
    obj.loop();
  });
}

Scene.prototype.onclick = function(e){
  this.partsList.forEach(function(obj){
    obj.onclick(e);
  });
}
Scene.prototype.onKeyup = function(e){
  this.partsList.forEach(function(obj){
    obj.onKeyup(e);
  });
}

Scene.prototype.onkeydown = function(e){
  this.partsList.forEach(function(obj){
    obj.onkeydown(e);
  });
}

Scene.prototype.onKeypress = function(e){
  this.partsList.forEach(function(obj){
    obj.onKeypress(e);
  });
}


//全ての部品が継承するメソッドParts
function Parts(scene,name,layer,x,y,width,height){
  this.game = scene.game;
  this.scene = scene;
  this.context = scene.context;
  this.partsList = scene.partsList;
  this.name = name;
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.layer = layer;
}

/******************************************************
  Partsの持つprototype
 ******************************************************/
Parts.prototype.loop  = function(){
}

Parts.prototype.init = function(){
}

Parts.prototype.delete = function(){
  this.scene.delParts(this);
}

Parts.prototype.onclick = function(event){
}

Parts.prototype.onKeyup = function(event){
}

Parts.prototype.onkeydown = function(event){
}

Parts.prototype.onKeypress = function(event){
}


//全てのオブジェクトの継承元
function Game(canvas,width,height){
  this.canvas = canvas;
  this.canvas.width = width;
  this.canvas.height = height;
  this.context = this.canvas.getContext('2d');
  this.scene;
  //各シーンが格納される連想配列の宣言
  this.gameScenes = new Array();
  this.timerId;
  this.offsetLeft = canvas.offsetLeft;
  this.offsetTop = canvas.offsetTop;
  this.mouseX;
  this.mouseY;
}

/******************************************************
  Gameの持つprototype
 ******************************************************/

Game.prototype.setFPS = function(fps){
	__fps__ = fps;
}

Game.prototype.init = function(){
}

Game.prototype.start = function(){
  this.init();
  __game__ = this;
  __startTime__ = new Date();
  this.loop();
  onclick = function(e){
    __game__.mouseX = e.pageX-__game__.offsetLeft;
    __game__.mouseY = e.pageY-__game__.offsetTop;
    __game__.scene.onclick(e);
  }
  onkeydown = function(e){
    __game__.scene.onkeydown(e);
    //tab,spaceを取れるように
    return false;
  }

}

Game.prototype.loop = function loop(){
  var afterTime = ((new Date()).getTime())%100;
  var beforeTime = (__startTime__.getTime()+(__count__*(1000/__fps__)))%100;
  setTimeout(function(){
    loop();
  },(1000/__fps__)-(afterTime-beforeTime));
  __game__.scene.loop();
  __count__++;
}

Game.prototype.addScene= function(scene){
  this.gameScenes[scene.name]=scene;
}

Game.prototype.changeScene = function(sceneName){
  this.setScene(this.gameScenes[sceneName]);
}

//画面の切り替えを行う
Game.prototype.setScene = function(scene){
  this.scene = scene;
  this.scene.init();
  console.log("Set scene and init "+this.scene.name);
}
