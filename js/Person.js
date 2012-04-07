
var Person=function(cfg){	

	for (var property in cfg ){
		this[property]=cfg[property];
	}

};

Person.prototype={

	constructor : Person ,

	id : null,
	name : null,
	x : 0,
	y : 0,
	
	rotation : 0,
	rotationD : 0,
	
	speed : 3,
	speedR : 6,

	baseX : 25,
	baseY : 40,
	walk : false ,

	bodyLine : null,
	bodyAABB : null,
	AABB : null,

	view : null ,

	mapX : 0,
	mapY : 0,

	img : null ,

	raging : false ,

	imgWidth : 48 ,
	imgHeight : 80 ,

	weaponImgWidth : 56 ,
	weaponImgHeight : 24 ,

	power : 100 ,
	powerSpeed : 0.5,


	init : function(){

		this.view=new ViewField({
			person : this
		});

		this.view.init();
		this.AABB=[];

		this.updateAABB();

	},

	setPos : function(){

	},
	setRotation : function(rotation){
		this.rotationD=rotation;

	},
	rage : function(){
		if (this.power==100){
			this.raging=true;
		}
	},

	update : function(deltaTime ){
		if (this.raging){
			this.power-=this.powerSpeed;
			if (this.power<=0){
				this.power=0;
				this.raging=false;
			}
		}else{
			if (this.power<100){
				this.power+=this.powerSpeed;
			}else{
				this.power=100;
			}
		}

		if (!this.walk){
			return
		}
		var speedR=this.speedR*(this.raging?1.5:1);
		var speed=this.speed*(this.raging?1.5:1);

		this.rotation=(this.rotation+360)%360;
		this.rotationD=(this.rotationD+360)%360;

		var deltaR=0;
		var dr=this.rotationD-this.rotation;
		if (Math.abs(dr)<=speedR || Math.abs(dr)>=360-speedR){
			this.rotation=this.rotationD;
			this.view.rotate(dr);
			dr=0;
		}else{
			
			if (0<dr && dr<180){
				deltaR=speedR;
			}else if( 180<=dr && dr<360){
				deltaR=-speedR;
			}else if ( -180<dr && dr<0 ){
				deltaR=-speedR;
			}else if( -360<dr && dr<=-180){
				deltaR=speedR;
			}
			this.rotation+=deltaR;
			this.view.rotate(deltaR);
		}

		if (dr==0){
			var rad=this.rotation*DH.CONST.DEG_TO_RAD;
			var speedX=speed*Math.cos(rad);
			var speedY=speed*Math.sin(rad);
			this.x+=speedX;
			this.y+=speedY;

			this.view.move(speedX,speedY);


		}else{
		}

		this.updateAABB();

	},

	inAABB : function(px,py){
		var aabb=this.AABB;
		return px>aabb[0] && py>aabb[1] && px<aabb[2] && py<aabb[3] ;
	},

	updateAABB : function(){

		var poly=this.view.poly;
		var minX=Math.min( poly[0][0],poly[1][0],poly[2][0]);
		var maxX=Math.max( poly[0][0],poly[1][0],poly[2][0]);

		var minY=Math.min( poly[0][1],poly[1][1],poly[2][1]);
		var maxY=Math.max( poly[0][1],poly[1][1],poly[2][1]);

		var aabb=this.AABB;

		var ext=100;
		aabb[0]=minX-ext;
		aabb[1]=minY-ext;
		aabb[2]=maxX+ext;
		aabb[3]=maxY+ext;

	},

	render : function(context){
		
		context.save();

		var x=this.x-this.mapX;
		var y=this.y-this.mapY;

		context.translate( x , y );
		context.rotate( this.rotation*DH.CONST.DEG_TO_RAD );

		context.translate( -this.baseX , -this.baseY );

		if (this.raging){
			var ox=35, oy=30;
			context.translate( ox , oy );
			context.drawImage(this.img, this.imgWidth,0, this.weaponImgWidth , this.weaponImgHeight,
						0,0,this.weaponImgWidth , this.weaponImgHeight );
			context.translate( -ox , -oy );
		}

		context.drawImage(this.img, 0,0, this.imgWidth ,this.imgHeight,
						0,0,this.imgWidth ,this.imgHeight);
				

		context.restore();

		var x=this.AABB[0]-this.mapX;
		var y=this.AABB[1]-this.mapY;
		var w=this.AABB[2]-this.AABB[0];
		var h=this.AABB[3]-this.AABB[1];
		context.strokeRect(x,y,w,h);

		// this.power
		context.fillStyle=this.raging?"red":(this.power==100?"blue":"green");
		context.fillRect(500,50, this.power, 10);
	}

}

var PersonShare=function(cfg){	

	for (var property in cfg ){
		this[property]=cfg[property];
	}

};

PersonShare.prototype={

	constructor : PersonShare ,
	id : null ,
	img : null,
	baseX : 0,
	baseY : 0,

	imgWidth : 48 ,
	imgHeight : 80 ,

	weaponImgWidth : 56 ,
	weaponImgHeight : 24 ,
	
	x : 0,
	y : 0,
	rotation : 0,
	raging : false ,


	mapX : 0,
	mapY : 0,


	render : function(context){
		
		context.save();

		var x=this.x-this.mapX;
		var y=this.y-this.mapY;

		context.translate( x , y );
		context.rotate( this.rotation*DH.CONST.DEG_TO_RAD );

		context.translate( -this.baseX , -this.baseY );

		if (this.raging){
			var ox=35, oy=30;
			context.translate( ox , oy );
			context.drawImage(this.img, this.imgWidth,0, this.weaponImgWidth , this.weaponImgHeight,
						0,0,this.weaponImgWidth , this.weaponImgHeight );
			context.translate( -ox , -oy );
		}

		context.drawImage(this.img, 0,0, this.imgWidth ,this.imgHeight,
						0,0,this.imgWidth ,this.imgHeight);
				

		context.restore();

	}

}

