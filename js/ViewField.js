var ViewField=function(cfg){	

	for (var property in cfg ){
		this[property]=cfg[property];
	}

};


ViewField.prototype={

	constructor : ViewField ,

	person : null ,
	poly : null,

	init : function(){
		var cx=this.person.x;
		var cy=this.person.y;

		var length=250;
		var width=250;

		this.poly=[
			[cx,cy],
			[cx+length,cy-width/2],
			[cx+length,cy+width/2]
		]
	},

	move : function(x,y){
		var poly=this.poly;

		var len=poly.length;
		for(var i = 0; i < len; i++){
			var p=poly[i];
			p[0]=p[0]+x;
			p[1]=p[1]+y;
		}	
	},

	rotate : function(dr){

		
		var poly=this.poly;
		var len=poly.length;

		var rad=dr*DH.CONST.DEG_TO_RAD;
		var cos=Math.cos(rad), sin=Math.sin(rad);

		var cx=poly[0][0],
			cy=poly[0][1];
		for(var i = 1; i < len; i++){
			var p=poly[i];
			var px=p[0]-cx, py=p[1]-cy;
			var x= px*cos- py*sin;
			var y= px*sin+ py*cos;
			p[0]=x+cx;
			p[1]=y+cy;
		}
	},

	drawPath : function(context){
		var poly=this.poly;
		context.beginPath();

		context.moveTo( poly[0][0] ,poly[0][1]);
		for (var i=1,len=poly.length;i<len;i++){
			context.lineTo( poly[i][0] ,poly[i][1] );
		}
		context.lineTo( poly[0][0] ,poly[0][1]);

		context.closePath();

	}


}