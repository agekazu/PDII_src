function ResultScene(game,context,name){
  //この関数はSceneを元にして出来ている(Sceneの継承)
  this.__proto__ = new Scene(game,context,name);

  this.init = function(){
    this.clearParts();
    // buttonWidth
    var bw = 200;
    // buttonHeight
    var bh = 75;
    var ch = this.game.canvas.height;
    var cw = this.game.canvas.width;
    //ボタンの描画
    var toStartButton = new ResultButton(this,"toStartButton",1,game.resouces["toStart"],
        cw/4 - bw/2 , ch-200, bw, bh); 
    var postTwitterButton = new ResultButton(this,"postTwitterButton",1,game.resouces["postTwitter"],cw/2 - bw/2, ch-200, bw, bh); 

    //タイトルの描画
    var resultCharacter = new ResultCharacter(this,"resultTilteText","結果発表",
        "30pt Arial","#000000",1,cw/2-40,50,100,20);
    
    var i = 0;
    this.game.resultData["questionNumberList"].forEach(function(questionNumber){
      var questionDocumentButton = new QuestionDocumentButton(this,"questionDocumentButton",1,questionNumber,i+1,0+i*200,525,200,75);
      i++;
      this.addParts(questionDocumentButton);
    },this);
      
      
    //スコアを計算する
    //game.resultData("score":membersScore[id](0:勝ち数,1:使わない,2:進捗の合計),"members":idの配列,"myId":自分のid) 
    this.rank = [];
    this.myScore = 0;
    //resltDataに格納されたキーmembersを回す
    this.members = this.game.resultData["members"];
    this.members.forEach(function(id){
      var score;
      //resltData["score"][id]が存在するなら
      if(this.game.resultData["score"][id]){
        //得点を出す。(1位の数+1) * 進捗(%)の和
        score = (this.game.resultData["score"][id][0] + 1) * this.game.resultData["score"][id][2];
      }else{
        score = 0;
      }
      //もし自分のデータならば
      if(id == this.game.resultData["myId"]){
        this.myScore = score;
      }
      //配列rankにプッシュ
      this.rank.push([id,score]);
    },this);

    //スコアを昇順に配列に格納
    this.rank.sort(function(a,b){
      return(b[1] - a[1]);
    });

    //ランキング表示
    var i = 1;
    this.rank.forEach(function(rank){
      if(rank[0] != this.game.resultData["myId"]){
        console.log(i);
        var rankingCharacter = new ResultCharacter(this,"rankingCharacter",i+"位  "+rank[1]+"点",
          "25pt Arial","#000000",1,cw/2-50,75*i+45,200,25);
      }else{
        this.myRank = i;
        var rankingCharacter = new ResultCharacter(this,"rankingCharacter",i+"位  "+rank[1]+"点",
          "25pt Arial","#ff0000",1,cw/2-50,75*i+45,200,25);
      }
      i++;
      this.addParts(rankingCharacter);
    },this);

    this.addParts(toStartButton);
    this.addParts(postTwitterButton);
    this.addParts(resultCharacter);
  }
}


//GUI部品(.png)の描画
function ResultButton(scene,name,layer,imgObj,x,y,width,height){
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
              window.open("https://twitter.com/intent/tweet?text=あなたの順位は"
                  +this.scene.members.length+"人中"
                  +this.scene.myRank+"位で、スコアは"+this.scene.myScore
                  +"点でした! "+location.href+" #Souda_PD2", "_blank");
              break;
          }
        }
  } 
}

function QuestionDocumentButton(scene,name,layer,number,count,x,y,width,height){
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
function ResultCharacter(scene,name,text,font,color,layer,x,y,width,height){
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

