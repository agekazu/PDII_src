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

    //スコアを計算する
    //game.resultData("score":membersScore[id](0:勝ち数,1:使わない,2:進捗の合計),"members":idの配列,"myId":自分のid) 
    this.rank = [];
    this.myScore = 0;
    //resltDataに格納されたキーmembersを回す
    game.resultData["members"].forEach(function(id){
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
      var rankingCharacter = new ResultCharacter(this.scene,"rankingCharacter",rank[1]+"位"+rank,600,50*i,200,25);
      i++;
      this.scene.addParts(rankingCharacter);
    },this);

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

