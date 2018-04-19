/*
分割した画像の画像オブジェクトをクリックすると、前後左右のスペースを検索する
パネルサイズはプログラム側にはわかるので(現在のオブジェクトサイズはそりゃわからないと困る)クリックされたところから上下左右にmouse.x,mouse.yにオブジェクトのWidth,heightを足した値分移動させ、その位置で存在判定をする。
Hitしたら座標を配列でリターンし、クリックしたオブジェクトをオブジェクトサイズ分移動させる


具体的にはサイズ50，50のオブジェクトが並んでおり、右下が空いていると仮定
中央下のオブジェクト位置は50、100～100、150　その間なら反応する
クリックしたのが62、120だとすると、前後左右にWidth,heithを足した値を出して存在判定、右側は存在しないのがわかる(Hitしない)
HitしなかったらHitしなかった位置をリターン(左：1、右：2、上：3、下：4、ヒットなし：0)
この場合2がリターンする
そしたらオブジェクトの座標(50,100)に50、0を足して移動させるイベントを発生させる
また移動中はイベント自体を止める(移動中に上とかのタイルをクリックしたら何が起きるかわからん)

移動判定はそれでよい
問題はクリア判定

移動が終わるたびにAnswerCheckイベントを発火させる
オブジェクトには0～13までのナンバーを振っておく
そしてそれぞれのオブジェクト位置を判定していく

オブジェクトには名前つけられそうなので、まずはクリックしたらオブジェクトの名前をリターンするようにしてみよう
*/

$(window).on("load",function(){
	//一応ここが起点
	$("#pz_canvas1").css('visibility','visible'); 
	$("#pz_canvas2").css('visibility','hidden');
	
	initialize();
	
	$("button").on("click",function(){
		shufle();
	});
	
});

function initialize(){
	var preloadImages = function (srcs) {
	  if (!srcs.length) {
	    return;
	  }
	  var dfd = $.Deferred();
	  var imgs = [];
	  for (var i=0, l=srcs.length; i<l; i++) {
	    var img = new Image();
	    img.src = srcs[i];
	    imgs.push(img);
	  }
	  var check = function () {
	    for (var i=0, l=imgs.length; i<l; i++) {
	      if (imgs[i].complete !== true) {
	        setTimeout(check, 250);
	        return false;
	      }
	    }
	    dfd.resolve(imgs);
	  };
	  check();
	  return dfd.promise();
	}

	

	var arr = canvas_change();
	
	var Obj=[];
		
	let srcs = [];
	for (var i=1; i<=15; i++){
		srcs.push("./img/"+i+".png");
	}
	let promise = preload(srcs);
	
	promise.then(function(){
		let num=0;
		
		for (var i=0,true_x=0; i<4; i++,true_x+=50){
			for(var k=0,true_y=0; k<4; k++,true_y+=50){
				if(num==15){
					break;
				}
				/* Imageオブジェクトを生成 */
				let img = new Image();
				img.src = "./img/"+(num+1)+".png";
				Obj[num] = new CanvasObj(img,true_x,true_y,50,50,img.src);
				
				Obj[num].draw(arr[0]);
				num++;
			}
		}
		$("#pz_canvas"+arr[1]).css('visibility','visible'); 
		//必ず描画してから消さないと意味がない
		$("#pz_canvas"+arr[2]).css('visibility','hidden');
		
		//ローカルストレージに配列を保存
		storager.set("panelObj", Obj);
		
	},
	function(){
		alert("an error");
	});
}

function canvas_change(){

	if(!window.sessionStorage.getItem("canvas_kind")){
		var old_canvas_kind = 1;
		var canvas_kind = 2;
	}else{
		var old_canvas_kind = storager.get("canvas_kind");
		var canvas_kind = (old_canvas_kind % 2) + 1;
		//1を2で割ったあまりは1、＋1すれば2
		//2を1で割ったあまりは0、＋1すれば1
	}
	
	storager.set("canvas_kind",canvas_kind);
	
	let canvas = $("#pz_canvas"+canvas_kind)[0];
	if ( !canvas || !canvas.getContext ) { return false; }
	let ctx = canvas.getContext('2d');
	let arr = [ctx,parseInt(canvas_kind),parseInt(old_canvas_kind)];
	
	ctx.clearRect(0,0,200,200);
	ctx.fillStyle="rgb(0,0,0)";
	ctx.fillRect(0,0,200,200);
	
	//オブジェクトと現在のキャンバス(Visible用)と過去のキャンバス(Hidden用)を送る
	return arr;
	
}
//→CTXを切り替える
//切り替わったCTXで全オブジェクトのDrawを実行
//Hiddenを切り替える

function CanvasObj(img,x,y,width,height,url){
	this.x=x;
	this.y=y;
	this.width=width;
	this.height=height;
	this.img = img;
	this.url=url;
	this.draw = function(ctx){
		ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
	}
}

function RectObj(x,y,width,height,r,g,b,ctx){
	this.x=x;
	this.y=y;
	this.width=width;
	this.height=height;
	this.r=r;
	this.g=g;
	this.b=b;
	
	this.draw = function(ctx){
		ctx.fillStyle="rgb("+this.r+","+this.g+","+this.b+")";
		ctx.fillRect(this.x, this.y, this.width, this.height);
	}
}


function rewrite(Obj){
	
	//移動用の再描画システム
	var arr = canvas_change();
	let num=0;
	
	for (let i=0; i<15; i++){
		let img = new Image();
		img.src = Obj[num].url;
		Obj[num].img = img;
		Obj[num].draw(arr[0]);
		num++;
	}
	$("#pz_canvas"+arr[1]).css('visibility','visible'); 
	//必ず描画してから消さないと意味がない
	$("#pz_canvas"+arr[2]).css('visibility','hidden');
}


function shufle(){

	//シャッフル
	var blankObj = new RectObj(150,150,50,50,0,0,0);
	let Obj = storager.get("panelObj");
	Obj.push(blankObj);
	rewrite(Obj);
	Obj.pop;
	
	//目隠し用の関数なのだが、最初はデバック用に呼ばないでおこう
	//blind();
	
/**
case:0=左
case:1=上
case:2=右
case:3=下

*/
	let loop_count = 0;
	let move_point = 2;
	//何フレームで移動を完了するか
	
	//while(loop<15){
	
	
	loopFn(Obj,blankObj,loop_count,move_point);
	
}
function move_pos(temp,Obj,blankObj){
	let zahyou = [];
	let move = 0;
	/*
	考え方
	上下左右をチェック
	→枠外に出るなら無視
	→一度通った場所も無視
	Blankデータに足した、引いた値がオーバーラップしている部分は配列に入れない
	最初の位置なら上(2)か左(1)しか入らない
	*/
	var count = 0;
	//左
	if(blankObj.x -50 > 0){
		zahyou[count]={
			x:blankObj.x -50,
			y:blankObj.y,
			move:-50,
			houkou:0
		}
		move = -50;
		count++;
	}
	//上
	if(blankObj.y - 50 > 0){
		zahyou[count]={
			x:blankObj.x,
			y:blankObj.y - 50,
			move:-50,
			houkou:1
		}
		move = -50;
		count++;
	}
	//右
	if(blankObj.x +50 < 200){
		zahyou[count]={
			x:blankObj.x + 50,
			y:blankObj.y,
			move:50,
			houkou:2
		}
		move = -50;
		count++;
	}
	//下
	if(blankObj.y + 50 < 200){
		zahyou[count]={
			x:blankObj.x,
			y:blankObj.y + 50,
			move:50,
			houkou:3
		}
		move = -50;
		count++;
	}
	//一度通った場所にはいかない
	for(let i=0; i>zahyou.length; i++){
		for(let k=0; k>temp.length; k++){
			if(zahyou[i].x == temp[k].x && zahyou[i].y == temp[k].y){
				zahyou.splice(i, 1);
				continue;
			}
		}
	}
	
	//交換できるものが何もなければ処理を戻す
	if(zahyou.length == 0){
		return "end";
	}
	
	/**
	整理
	zahyou配列にはブランクオブジェクトの移動先=移動するパネルのいる場所が入る
	changeXは移動するパネルの位置X座標なので、
	*/
	
	
	//ランダムに存在する座標のどこかに移動
	var change = Math.floor( Math.random() * zahyou.length );
	var changeX = zahyou[change].x;
	var changeY = zahyou[change].y;
	var houkou = zahyou[change].houkou;
	
	for(let i=0; i<Obj.length; i++){
		if(changeX == Obj[i].x && changeY == Obj[i].y){
			//ループ用保存
			Obj[i].x=blankObj.x;
			Obj[i].y=blankObj.y;
			//ループ使いたいのでここではブランクを入れ替えない
		
			return [i,changeX,changeY,temp,houkou,move];
		}
	}
}

window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame   ||
	window.webkitRequestAnimationFrame ||
	window.mozRequestAnimationFrame    ||
	window.oRequestAnimationFrame      ||
	window.msRequestAnimationFrame     ||
	function(callback){
		window.setTimeout(callback, 1000 / 60);
	};
})();
    
    
    
    
function loopFn(Obj,blankObj,loop_count,move_point){
	let Temp = function(x,y){
		this.x=x;
		this.y=y;
	}
	let temp = [];
	let flag = false;
	let left_move = 0;
	let array = move_pos(temp,Obj,blankObj);
	animation();
	function animation(){
		//描画系の処理は全部まとめて外に出す。
		//そして一回ずつ停止する
	    requestAnimFrame(animation);

		let speed = array[5]/move_point;
		
		if(!flag){
			left_move = Math.abs(array[5]);
			//移動距離の残り
			flag = true;
		}
		
		if(left_move < 0){
			left_move = 0;
			speed = speed * -1;
		}
		
		//ループ
		if(array[4] % 2 ==0){			//左右移動
			Obj[array[0]].x += speed;
		}else{						//上下移動
			Obj[array[0]].y += speed;
		}
		
		//move_pointは絶対値でガリガリ削る
		left_move -= Math.abs(speed);
		
		rewrite(Obj);
		
		if (left_move ==0){
			blankObj.x=array[1];
			blankObj.y=array[2];
			//最後にブランクオブジェクトのオブジェクト内容を書き直して、再描画
			Obj.push(blankObj);
			rewrite(Obj);
			Obj.pop();
			
			//ループごとに増えるんだからこれでいいはず
			temp[loop_count] = new Temp(blankObj.x,blankObj.y);
			
			loop_count++;
			array = move_pos(array[3],Obj,blankObj);
		}
		
		if(array == "end"){
			exit;
		}
	}
}

function blind(){
	//目隠し用(これがないと移動してるのがわかってしまう)
	//いわゆる再描画システムなのだが、位置を入れ替えるという制約が発生する
	//canvasの上に描画する？
	//これは別にキャンバス属性で作る必要もないように感じられるが、マップマスク等を作ることを考えると、できたほうがいいよね
	ctx.fillStyle=rgb(0, 0, 0);
	ctx.beginPath();
	ctx.fillRect(0,0, 250, 250);
}

function game(){
	if (this.x < Obj[i].x &&
		this.x + Obj[i].width > Obj[i].x &&
		this.y < Obj[i].y &&
		this.y + this.height > Obj[i].y) {
		// hit test succeeded, handle the click event!
		return true;
	}

	function clear_hantei(){
		if(hantei()){
			clear();
		}
	}
	
	function hantei(){
		for (i=0,true_x=0; i<4; i++,true_x+=50){
		//x座標・行数を指定
			for(k=0,true_y=0; k<4; k++,true_y+=50){
			//y座標・列数を指定
				if(Obj[i+k].x != true_x || Obj[i+k].y != true_y){
					return false;
				}
			}
		}
		return true;
	}

	function clear(){
		alert("clear!");
	}
}

//画像のプリロード関数
function preload() {
	var promises = [],
		retDefer = $.Deferred(),
		imgs = $.map(arguments, function (val) {
	   		return val;
		});

	$.each(imgs, function () {
		var img = new Image(),
			defer = $.Deferred();

		img.onload = function () {
			defer.resolve();
			defer = null;
		};
		img.onerror = function () {
			defer.reject();
			defer = null;
		};
		img.src = this;	//ここのthisは、それぞれの画像ファイル名
		promises.push(defer.promise());
	});

	$.when.apply(null, promises).done(function () {
		retDefer.resolve();
	});

	$.when.apply(null, promises).fail(function () {
		retDefer.reject();
	});
	return retDefer.promise();
}

//完成したら次のお仕事、擬似3D化
//基本的にオブジェクトを箱と考える
//まずは変換式(xyz立体平面→xy平面)
//イメージとしては立体で描いたブロックを写真に撮り、その頂点を立体として描画するイメージ
//描画の際は立体→平面を自動で切り替え、頂点を入れて描画するシステムを使う
//テクスチャも平面の上面に貼り付け
//混乱を避けるため、ボックスはワンサイズで変更不可
//正確である必要は全くなく、ちゃんと「見えれば」OK
//またパンやズームは不要なのでどんなに上っても、どんなに奥に行っても同じ画角

//乱戦の範囲は相変わらずボックス形式だが、距離は直線計算で(1ボックスの縦横を1mと判定)
//あくまで距離の判定はボックスの中央点から開始するため、たとえば地点Aから左に2、上に3移動したとすると横2m縦3mの三角移動をしたと判定される
//もしくは完全な位置座標でもいいけど・・・できるよ？達成可能になったよこれで




class storager{
	static set(Obj_name,Obj){
		Function.prototype.toJSON = Function.prototype.toString;
		window.sessionStorage.setItem(Obj_name, JSON.stringify(Obj));
	}
	
	static get(Obj_name){
		Function.prototype.toJSON = Function.prototype.toString;
		let Obj = window.sessionStorage.getItem(Obj_name);
		var parser = function(k,v){return v.toString().indexOf('function') === 0 ? eval('('+v+')') : v};
		return JSON.parse(Obj,parser);
	}
}
