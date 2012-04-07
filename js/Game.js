
;(function(scope,undefined){

var DH=scope.DH;



DH.Game=DH.newClass({
	
	container : null ,
	width : 640,
	height : 480,
	viewWidth : null,
	viewHeight : null,
	
	FPS : 60 ,
	resourceCache : null,
	resList : null,

	uiCache : null ,
	
	state : null ,
	stageIndex : 0 ,
	currentStage : null,


	addRes : function(id,res){
		this.removeRes(id);
		this.resourceCache[id]=res;
	},
	getRes : function(id){
		return this.resourceCache[id];
	},	
	removeRes : function(id){
		delete this.resourceCache[id];
	},
	beforeLoad : DH.noop ,	
	load : function(force){

		this.initContainer();

		if (this.beforeLoad(force)===false){
			return false;
		}	
		this.resourceCache=this.resourceCache||{};
		var resList=[].concat(this.resList);
		
		var imgs=DH.loadImages(resList, DH.delegate(this._onLoad,this), DH.delegate(this._onLoading,this) );
		DH.merger( this.resourceCache, imgs );	
	},
	_onLoading : function(loadedCount,totalCount,img){
		return this.onLoading(loadedCount,totalCount,img);
	},
	_onLoad : function(loadedCount,totalCount){

		this.uiCache=DH.$id(this.uiCache)||document.body;
		if ( this.uiCache!=document.body ){
			this.uiCache.style.display="none";
		}
		
		this.viewWidth=this.viewWidth||this.width;
		this.viewHeight=this.viewHeight||this.height;
		
		this.initUI();
		this.bindUIEvent();

		this.onLoad=this.onLoad===DH.noop?this.init:this.onLoad;
		return this.onLoad(loadedCount,totalCount);
	},
	onLoading : DH.noop,
	onLoad : DH.noop,

	initContainer : function(){
		this.container=DH.$id(this.container)||this.container;
		if (!this.container){
			this.container=document.createElement("div");
			document.body.appendChild(this.container);
		}		
		var domStyle=this.container.style;
		DH.merger(domStyle,{
			position : "relative" ,
			overflow : "hidden" ,		
			padding : "0px" ,
			width : this.width+"px" ,
			height : this.height+"px"
		});	
		
		this.mask=document.createElement("div");
		this.container.appendChild(this.mask);
		DH.merger(this.mask.style,{
			position : "absolute" ,
			overflow : "hidden" ,	
			zIndex : 30000 ,
			padding : "0px" ,
			top : "0px",
			left : "0px",
			display : "none",
			//backgroundColor : "rgba(100,100,100,0.5)",
			width : this.width+"px" ,
			height : this.height+"px"
		});	
		try {
			this.mask.style.backgroundColor="rgba(100,100,100,0.5)";
		}catch(e){
			this.mask.style.backgroundColor="#999999";
		}
	},
		
	initViewport : function(){
		
		if (!this.viewport){
			this.viewport=document.createElement("div");
			this.container.appendChild(this.viewport);		
		}
		var domStyle=this.viewport.style;
		DH.merger(domStyle,{
			position : "relative" ,
			overflow : "hidden" ,	
			padding : "0px" ,
			width : this.viewWidth+"px" ,
			height : this.viewHeight+"px" ,
			//backgroundColor : "#fff",
			visibility : "hidden" 
		});

		this.viewport.style.visibility="visible";			
	
		this.initCanvas();		
	},

	initCanvas : function(){
	
		this.canvas=this.canvas||document.createElement("canvas");
		this.canvas.className="stage-canvas";
		this.canvas.width=this.width;
		this.canvas.height=this.height;
		this.context=this.canvas.getContext('2d');
		this.viewport.appendChild(this.canvas);
	
	},
	initUI : function(){
		
	},
	bindUIEvent : function(){
		
	},
	
	
	beforeInit : DH.noop ,	

	init : function(){

		if (this.beforeInit()===false){
			return false;
		}
					
		if (this.FPS){
			this._sleep=Math.floor(1000/this.FPS);
		}	


		this.stages=[];

		var Me=this;
		this.callRun = function(){
			Me.run();
		}		
		this.initViewport();
		
		this.onInit();
	},
	onInit : DH.noop ,
	
	_start : function(){
		var Me=this;
		setTimeout( function(){
			Me._start();
		},1);
	},	
	start : function(){
		this.init();
		this.stageIndex=0;
		this.restart();		
	},
	restart : function(){	
		this.stop();
		this.stageIndex=this.stageIndex||0;
		this.createStage(this.stageIndex);
		this.activeStage(this.stageIndex);
		this.play();		
	},	
	activeStage : function(idx){
		this.stageIndex=idx;
		this.currentStage=this.stages[idx];
		this.currentStage.init(this);
	
	},	
	createStage : function(idx){
		var stage=this.getStageInstance(idx);
		stage.index=idx;
		this.stages[idx]=stage;
		return stage;
	},
	getStageInstance : DH.noop ,	

	
	play : function(){
		if (!this.currentStage){
			return false;
		}
		this.currentStage.beforeRun(this);	
		this._playing=true;		
		this.timer=(new DH.Timer()).start();
		this.run();
	},
	pause : DH._TODO_,
	resume : DH._TODO_,
	exit : DH._TODO_,
	gameover : DH._TODO_,
	finished : DH._TODO_,

	
	
	run : function(){
		if (this._playing) {
			if (this.logger){
				this.logger.frameCount++;
			}

			this.mainLoop=setTimeout( this.callRun, this._sleep );
			this.timer.tick();
			var deltaTime=this.timer.deltaTime;
			if (this.pausing){
				this.onPausing(deltaTime);
			}else if ( deltaTime>1 ){
				this.timer.runDeferJobs();
				this.update(deltaTime);
				this.clear(deltaTime);
				this.render(deltaTime);
			}
			this.timer.last=this.timer.now;

			this.handleInput(deltaTime);

		}else{
			this.stop();
		}

	},
	onPausing : DH.noop,
	
	
	beforeUpdate : DH.noop ,
	update : function(deltaTime){
		if (this.beforeUpdate(deltaTime)===false){
			return;
		}
		this.currentStage.update(deltaTime);
		this.currentStage.handleInput(deltaTime);		
		this.onUpdate(deltaTime);
	},
	onUpdate : DH.noop ,	
	
	clear : DH.noop ,

	render : function(deltaTime){
		this.currentStage.render(deltaTime);
	},

	handleInput :  DH.noop ,
	
	stop : function(){
		this._playing=false;
		this.pausing=0;
		if (this.mainLoop){
			clearTimeout(this.mainLoop);
		}
		if (this.currentStage){
			this.currentStage.destroy(this);
			this.stages[this.stageIndex]=null;
			this.currentStage=null;
		}		
		this.onStop();
	},
	onStop : DH.noop ,
	
	destroy : DH.noop
	
});


})(this);
