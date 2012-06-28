function TitleScene(game,context,name){
  //この関数はSceneを元にして出来ている(Sceneの継承)
  this.__proto__ = new Scene(game,context,name);

  this.init = function(){
    //ボタン(画像)の大きさ
    var buttonwidth = 200;
    var buttonheight = 75;
    var startTitle = new StartTitle(this,"startTitle",0,"codaTitle.png",(game.canvas.width/2)-250,0,400,400);

    var startButton = new StartButton(this,"startButton",1,"practice.png",(game.canvas.width/2)-buttonwidth/2,(game.canvas.height)/2 + buttonheight/2,buttonwidth,buttonheight);

    this.addParts(startTitle);
    this.addParts(startButton);
  }
} 

function StartTitle(scene,name,layer,imgName,x,y,width,height) {
  this.__proto__ = new Parts(scene,name,layer,x,y,width,height);
  var img = new Image();
  this.loop = function(){
    img.src = "./"+imgName;
    //GUI部品の画像の描画
    this.context.drawImage(img,this.x,this.y);
  }
}

//GUI部品(gif)の描画
function StartButton(scene,name,layer,imgName,x,y,width,height){
  this.__proto__ = new Parts(scene,name,layer,x,y,width,height);
  var img = new Image();
  this.loop = function(){
    img.src = "./GUI/" + imgName;
    //GUI部品の画像の描画
    this.context.drawImage(img,this.x,this.y);
  }
  //clickされた座標を取得、ボタンの範囲内かを調べる
  this.onclick = function(e){
    var mouseX = this.game.mouseX;
    var mouseY = this.game.mouseY;
    if(mouseX >= this.x && mouseX <= this.x + this.width
        && mouseY >= this.y && mouseY <= this.y+this.height){
          console.log("Play画面へ遷移");
          this.game.changeScene("playScene");
        } 
  }
}



