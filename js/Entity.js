
;(function(scope,undefined){

var DH=scope.DH;

DH.Entity=DH.newClass({

	id : null ,

	stage : null ,
	core : null ,

	x : 0,
	y : 0,
	z : 0,

	speedX : 0,
	speedY : 0,
	speedZ : 0,

	rx : 0,
	ry : 0,
	rz : 0,

	rSpeedX : 0,
	rSpeedY : 0,
	rSpeedZ : 0,

minX : -Number.MAX_VALUE,
maxX : Number.MAX_VALUE,
minY : -Number.MAX_VALUE,
maxY : Number.MAX_VALUE,
	

	beforeInit : DH.noop,	
	init : function(stage){
		this.beforeInit(stage);
		this.stage=stage;
		this.onInit(stage);
	},
	onInit : DH.noop,

	update : DH.noop,

	updateXYZ : function(deltaTime){
		
		this.x=this.x + deltaTime * this.speedX;
		this.y=this.y + deltaTime * this.speedY;
		this.z=this.z + deltaTime * this.speedZ;
		
		this.x=Math.min(this.maxX, Math.max(this.minX,this.x) );
		this.y=Math.min(this.maxY, Math.max(this.minY,this.y) );
		

		this.rx=this.rx + deltaTime * this.rSpeedX;
		this.ry=this.ry + deltaTime * this.rSpeedY;
		this.rz=this.rz + deltaTime * this.rSpeedZ;

		if (this.core){
			this.core.position.x=this.x;
			this.core.position.y=this.y;
			this.core.position.z=this.z;

			this.core.rotation.x=this.rx;
			this.core.rotation.y=this.ry;
			this.core.rotation.z=this.rz;
		}

	},

	render : DH.noop,

	handleInput : DH.noop,
	
	destroy : function(){
		this.core=null;
	}

});
	
})(this);