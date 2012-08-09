function PracticeResultScene(game,context,name){
  //この関数はSceneを元にして出来ている(Sceneの継承)
  this.__proto__ = new Scene(game,context,name);

  this.init = function(){
    this.clearParts();
    var bw = 200;
    var bh = 75;
    var ch = this.game.canvas.height;
    var cw = this.game.canvas.width;
    //ボタンの描画
    var toStartButton = new PracticeResultButton(this,"toStartButton",1,game.resouces["toStart"],
        cw/4 - bw/2 , ch-200, bw, bh); 
    var postTwitterButton = new PracticeResultButton(this,"postTwitterButton",1,game.resouces["postTwitter"],
        cw/2 - bw/2, ch-200, bw, bh); 

    //タイトルの描画
    var resultTitleCharacter = new PracticeResultCharacter(this,"resultTilteText","結果発表",
        "30pt Arial","#000000",1,cw/2-40,50,100,20);
    
    console.log(this.game.resultData["questionNumberList"]);
    console.log(this.game.resultData);

    //game.resultData("score":membersScore[id](0:勝ち数,1:使わない,2:進捗の合計),"members":idの配列,"myId":自分のid) 

    var time = this.game.resultData.time;
    var correct = this.game.resultData.correct;
    var miss = this.game.resultData.miss;
    
    //msをh,m,sに変換
    var h = String(Math.floor(time / 3600000) + 100).substring(1);
    var m = String(Math.floor((time - h * 3600000)/60000)+ 100).substring(1);
    var s = String(Math.round((time - h * 3600000 - m * 60000)/1000)+ 100).substring(1);

    //表示する文字列
    this.rankingCharacter = ["時間:"+s+"秒","正タイプ率:"+((correct/(correct+miss))*100).toFixed(2)+"％","一秒あたり:"+(correct/(time/1000)).toFixed(2)+"key/s"];

    var i = 1;
    this.rankingCharacter.forEach(function(rc){
      var rankingCharacter = new PracticeResultCharacter(this,"rankingCharacter",
        rc,"25pt Arial","#ff0000",1,cw/2-250,90*i+45,200,25);
      this.addParts(rankingCharacter);
      i++;
    },this);

    this.addParts(resultTitleCharacter);
    this.addParts(toStartButton);
    this.addParts(postTwitterButton);
  }
}

//GUI部品(.png)の描画
function PracticeResultButton(scene,name,layer,imgObj,x,y,width,height){
  this.__proto__ = new Parts(scene,name,layer,x,y,width,height);
  this.scene = scene;
  this.imgObj = imgObj;
  this.loop = function(){
    this.context.drawImage(this.imgObj,this.x,this.y);
  }    
  this.onclick = function(e){
    var mouseX = this.game.mouseX;
    var mouseY = this.game.mouseY;
    if(mouseX >= this.x && mouseX <= this.x + this.width
        && mouseY >= this.y && mouseY <= this.y+this.height){
          switch(name){
            case "toStartButton": 
              console.log("Title画面へ遷移");
              this.game.changeScene("titleScene");
              break;
            case "postTwitterButton":
              window.open("https://twitter.com/intent/tweet?text=あなたの成績は、"
                  +this.scene.rankingCharacter[0]+" "+this.scene.rankingCharacter[1]
                  +" "+this.scene.rankingCharacter[2]+"でした！"+location.href, "_blank");
              break;
          }
        }
  } 
}


//文字列の描画
function PracticeResultCharacter(scene,name,text,font,color,layer,x,y,width,height){
  this.__proto__ = new Parts(scene,name,layer,x,y,width,height);
  this.font = font;
  this.color = color;
  //loop関数を上書き
  this.loop = function(){
    this.context.fillStyle = this.color;
    this.context.font = this.font;
    //font変更
    this.context.fillText(text,this.x,this.y);            
  }
}

