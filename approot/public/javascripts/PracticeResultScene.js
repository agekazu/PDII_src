function PracticeResultScene(game,context,Images,name){
  //この関数はSceneを元にして出来ている(Sceneの継承)
  this.__proto__ = new Scene(game,context,name);

  this.init = function(){
    console.log(this);
    // buttonWidth
    var bw = 200;
    // buttonHeight
    var bh = 75;
    var ch = this.game.canvas.height;
    var cw = this.game.canvas.width;
    //ボタンの描画
    var toStartButton = new PracticeResultButton(this,"toStartButton",1,Images["toStart"],
        cw/4 - bw/2 , ch-200, bw, bh); 
    var postTwitterButton = new PracticeResultButton(this,"postTwitterButton",1,Images["postTwitter"],cw/2 - bw/2, ch-200, bw, bh); 

    //タイトルの描画
    var resultCharacter = new PracticeResultCharacter(this,"resultTilteText","結果発表",
        "30pt Arial","#000000",1,cw/2-40,50,100,20);

    //スコアを計算する
    //game.resultData("score":membersScore[id](0:勝ち数,1:使わない,2:進捗の合計),"members":idの配列,"myId":自分のid) 

    //得点を出す。(1位の数+1) * 進捗(%)の和
    score = 0;
    this.myScore = score;
    //配列rankにプッシュ

    //ランキング表示
    var rankingCharacter = new PracticeResultCharacter(this,"rankingCharacter","あなたのスコアは"+this.myScore+"点です。","25pt Arial","#000000",1,cw/2-50,75*i+45,200,25);

    this.addParts(toStartButton);
    this.addParts(postTwitterButton);
    this.addParts(resultCharacter);
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
    console.log(mouseX);
    if(mouseX >= this.x && mouseX <= this.x + this.width
        && mouseY >= this.y && mouseY <= this.y+this.height){
          switch(name){
            case "toStartButton": 
              console.log("Title画面へ遷移");
              this.game.changeScene("titleScene");
              break;
            case "postTwitterButton":
              window.open("https://twitter.com/intent/tweet?text=あなたの順位は4人中"
                  +this.scene.myRank+"位で、スコアは"+this.scene.myScore
                  +"点でした!  http://soda-riceamerican.dotcloud.com/", "_blank");
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

