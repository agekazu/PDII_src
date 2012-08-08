function TitleScene(game,context,name){

  //この関数はSceneを元にして出来ている(Sceneの継承)
  this.__proto__ = new Scene(game,context,name);

  this.init = function(){
    this.clearParts();
    // titleImageWidth
    var tw = 600;
    // titleImageHeight
    var th = 200;
    // buttonWidth
    var bw= 200;
    // buttonHeight
    var bh= 75;
    var ch = game.canvas.height;
    var cw = game.canvas.width;

    var titleLogo = new StartTitle(this,"startTitleLogo",0,game.resouces["titleLogo"],(cw/2) - th,0,th,th);
    var practiceImg = new StartButton(this,"practiceButton",1,game.resouces["practice"],
        cw/2 + bw/2, ch/2 - bh, bw, bh);
    var rankingImg = new StartButton(this, "rankingButton",1,game.resouces["ranking"], 
        cw/2 + bw/2, ch/2 + bh, bw, bh);
    var oppositionImg =  new StartButton(this, "oppositionButton",1,game.resouces["opposition"], 
        cw/2 - bw * 2, ch/2 - bh, bw, bh);
    var questionsImg =  new StartButton(this, "questionsButton",1,game.resouces["questions"], 
        cw/2 - bw * 2, ch/2 + bh, bw, bh);

    this.addParts(titleLogo);
    this.addParts(oppositionImg);
    this.addParts(rankingImg);
    this.addParts(practiceImg);
    this.addParts(questionsImg);
  }

  function StartTitle(scene,name,layer,imgObj,x,y,width,height) {
    this.__proto__ = new Parts(scene,name,layer,x,y,width,height);
    this.imgObj = imgObj;
    this.loop = function(){
      //GUI部品の画像の描画
      this.context.drawImage(this.imgObj,this.x,this.y);
    }
  }

  //GUI部品(png)の描画
  function StartButton(scene,name,layer,imgObj,x,y,width,height){
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
              case "oppositionButton": 
                console.log("Play画面へ遷移");
                this.game.changeScene("playScene");
                break;
              case "practiceButton":
                console.log("Practice画面へ遷移");
                this.game.changeScene("practiceScene");
                break;
            } 
          }
    }
  }
}



