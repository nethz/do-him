

function Sprite(cfg){
	for (var attr in cfg){
		this[attr]=cfg[attr];
	}
}

Sprite.prototype={
	constructor :Sprite ,
	
	//精灵的坐标
	x : 0,
	y : 0,

	baseX : 0,
	baseY : 0,

	rotation : 0 ,

	//精灵的速度
	speedX : 0,
	speedY : 0,
	speedR : 0,

	acceX : 0 ,
	acceY : 0 ,

	//精灵的坐标区间
	minX : 0,
	maxX : Infinity,
	minY : 0,
	maxY : Infinity,
	
	//精灵包含的所有 Animation 集合. Object类型, 数据存放方式为" id : animation ".
	anims : null,
	//默认的Animation的Id , string类型
	defaultAnimId : null,
	
	//当前的Animation.
	currentAnim : null,	
	
	//初始化方法
	init : function(stage){
		//初始化所有Animtion
		this.stage=stage;
		for (var animId in this.anims){
			var anim=this.anims[animId];
			anim.id=animId;
			anim.init();
		}
		//设置当前Animation
		this.setAnim(this.defaultAnimId);
	},
	
	//设置当前Animation, 参数为Animation的id, String类型
	setAnim : function(animId){
		this.currentAnim=this.anims[animId];
		//重置Animation状态(设置为第0帧)
		this.currentAnim.setFrame(0);
	},
	
	// 更新精灵当前状态.
	update : function(deltaTime){
		this.lastX=this.x;
		this.lastY=this.y;

		this.rotation=this.rotation+ deltaTime*this.speedR

		
		//垂直方向竖直上抛	运动, 根据速度 加速度 时间 来计算位移,并确定新坐标.
		// 新的速度.
		var newSpeedX=this.speedX + this.acceX * deltaTime;		
		var newSpeedY=this.speedY + this.acceY * deltaTime;		
	
		this.x= Math.round(  this.x + (this.speedX + newSpeedX)/2 * deltaTime );
		this.y= Math.round(  this.y + (this.speedY + newSpeedY)/2 * deltaTime );
		// 更新速度
		this.speedX=newSpeedX;
		this.speedY=newSpeedY;

		
		//限定移动范围
		this.x=Math.max(this.minX,Math.min(this.x,this.maxX));
		this.y=Math.max(this.minY,Math.min(this.y,this.maxY));
		
		// console.log(this.x,this.y)
		if (this.currentAnim){
			this.currentAnim.update(deltaTime);
		}

		this.onUpdate(deltaTime);
		
	},

	onUpdate : noop ,

	//绘制精灵
	draw : function(ctx){
		if (this.currentAnim){
			var f=this.currentAnim.currentFrame;
			var img=this.currentAnim.img;
			var iX=f.x , iY=f.y, iW=f.w, iH=f.h , w=f.w, h=f.h ;

			ctx.save();
			ctx.translate(this.x,this.y);
			ctx.rotate(this.rotation*DEG_TO_RAD);
			ctx.translate(-this.baseX, -this.baseY);
			ctx.drawImage(img,iX,iY,iW,iH, 0,0, w, h);
			ctx.restore();
		}
	}
	
};

