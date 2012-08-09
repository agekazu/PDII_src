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

    var i = 0;
    //解説ボタンの描画
    this.game.resultData["questionNumberList"].forEach(function(questionNumber){
      var questionDocumentButton = new PracticeQuestionDocumentButton(this,"questionDocumentButton",1,questionNumber,i+1,0+i*200,525,200,75);
      i++;
      this.addParts(questionDocumentButton);
    },this);
    
    
    //game.resultData("score":membersScore[id](0:勝ち数,1:使わない,2:進捗の合計),"members":idの配列,"myId":自分のid) 

    var time = this.game.resultData.time;
    var correct = this.game.resultData.correct;
    var miss = this.game.resultData.miss;
    
    var s = String(time / 1000);

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
                  +" "+this.scene.rankingCharacter[2]+"でした！"+location.href+"#Souda_PD2", _blank");
              break;
          }
        }
  } 
}

function PracticeQuestionDocumentButton(scene,name,layer,number,count,x,y,width,height){
  this.__proto__ = new Parts(scene,name,layer,x,y,width,height);
  this.scene = scene;
  this.imgObj = this.game.resouces["questionDocumentImg"+count];
  this.loop = function(){
    this.context.drawImage(this.imgObj,this.x,this.y);
  } 
  this.onclick = function(e){
                
    var mouseX = this.game.mouseX;
    var mouseY = this.game.mouseY;
    if(mouseX >= this.x && mouseX <= this.x + this.width
        && mouseY >= this.y && mouseY <= this.y+this.height){
          window.open(location.href+"questions/?number="+number+"#"+("00"+number).slice(-3), "_blank");
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

