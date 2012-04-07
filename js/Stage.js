
;(function(scope,undefined){

var DH=scope.DH;

DH.Stage=DH.newClass({

	id : null ,
	index : null ,
	game : null ,
	container : null ,

	beforeInit : DH.noop,	
	init : function(game){
		this.beforeInit(game);
		this.game=game;
		this.onInit(game);
	},
	onInit : DH.noop,

	beforeRun : DH.noop,

	update : DH.noop,

	render : DH.noop,

	handleInput : DH.noop,
	
	destroy : DH.noop

});
	
})(this);