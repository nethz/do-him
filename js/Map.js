
var Map=function(cfg){	

	for (var property in cfg ){
		this[property]=cfg[property];
	}

};


Map.prototype={

	constructor : Map ,

	x : 0,
	y : 0,

	img : null ,

	tileSize : 32 ,

	init : function(){
		this.tileCols=Math.ceil(this.game.width/this.tileSize)+2;
		this.tileRows=Math.ceil(this.game.height/this.tileSize)+2;
	},

	update : function(deltaTime ){


	},
	render : function(context){
		var mapRows=this.tileRows;
		var mapCols=this.tileCols;
		var tileSize=this.tileSize;
		var offsetX=this.x%this.tileSize;
		var offsetY=this.y%this.tileSize;
		for (var r=0;r<mapRows;r++){
			for (var c=0;c<mapCols;c++){
				var no=1;
				context.drawImage(this.img,0,0, tileSize,tileSize,
						c*tileSize+offsetX,r*tileSize+offsetY, tileSize, tileSize);
			}	
		}
	}



}
