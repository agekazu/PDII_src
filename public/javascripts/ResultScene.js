function ResultScene(game,context,Images,name){
  //この関数はSceneを元にして出来ている(Sceneの継承)
  this.__proto__ = new Scene(game,context,name);

  this.init = function(){
    // buttonWidth
    var bw = 200;
    // buttonHeight
    var bh = 75;
    var ch = game.canvas.height;
    var cw = game.canvas.width;

    //ボタンの描画
    var toStartButton = new ResultButton(this,"toStartButton",1,Images.toStart,
        cw/2 - bw/2, ch/2 - bh, bw, bh); 

    //タイトルの描画
    var resultCharacter = new ResultCharacter(this,"resultTilteText","結果発表",
        "30pt Arial",1,game.canvas.width/2-100,50,100,20);

    this.addParts(toStartButton);
    this.addParts(resultCharacter);
  }
} 


//GUI部品(.png)の描画
function ResultButton(scene,name,layer,imgObj,x,y,width,height){
  this.__proto__ = new Parts(scene,name,layer,x,y,width,height);
  this.imgObj = imgObj;
  this.loop = function(){
    this.context.drawImage(this.imgObj,this.x,this.y);
  }    
  this.onclick = function(e){
    var mouseX = this.game.mouseX;
    var mouseY = this.game.mouseY;
    console.log(mouseX);
    if(mouseX >= this.x && mouseX <= this.x + this.width
        && mouseY >= this.y && mouseY <= this.y+this.height){
          console.log("Title画面へ遷移");
          this.game.changeScene("titleScene");
        } 
  }
}
//文字列の描画
function ResultCharacter(scene,name,text,font,layer,x,y,width,height){
  this.__proto__ = new Parts(scene,name,layer,x,y,width,height);
  this.font = font;
  //loop関数を上書き
  this.loop = function(){
       this.context.font = this.font;
    //font変更
    this.context.fillText(text,this.x,this.y);            
  }
}

