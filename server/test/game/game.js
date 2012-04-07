var util = require("util");
var scene = require("./Scene").obj;
//var MessageHandle = require("./MessageHandle");
var player_manager = require("./PlayerManager").obj;

var game = {};
game.time = 0;
game.server = null;
game.event_list = new Array();


//game.message_handler = new MessageHandle.Class();
var filter = new Array();
var filter_n = 0;
//var speed = 3.0;
function filter_interval(interval)
{
    filter[filter_n] = interval;
	filter_n++;
	if(filter_n == 10)
	{
        filter_n = 0;
	}
	var all = 0;
	for(var i=0; i<filter.length; ++i)
	{
		all += filter[i];
	}
	return all/filter.length;		
}
game.receive_message = function(id, msg)
{
    var evt = {}
    evt.id = id;
    evt.msg = msg;
    
    util.log("game: receive message! id:"+ id + "; msg = " + msg + ";");
    game.event_list.push(evt);
}
//game.render = function()
//{
    
//}
game.feedback = function()
{
    if(game.server)
    {
        //game.server.broadcast("哈哈哈哈哈");
    }else
    { 
        util.log("game feedback: error! no server!");
    }

}
game.init = function(server)
{
   game.server = server; 
}
game.shutdown = function()
{

}

game.update = function(step)
{
    //遍历消息对列
    for(var i = 0; i< game.event_list.length; ++i)
    {
        // 分发消息
        var evt = game.event_list[i];
        player_manager.receive_event(step, evt);
    }
   
    // 更新场景
    scene.fresh(step, player_manager);
    // 反馈消息
    game.feedback();
    // 清空消息对列
    game.event_list = new Array();
    game.time+= step;
};

game.add_player = function(id)
{
    util.log("game: add player! id:"+ id);
    player_manager.add_player(id, 0, 0);
}

game.remove_player = function(id)
{
    util.log("game: remove player! id:"+ id);
    player_manager.remove_player(id);
}
game.run = function()
{

    setTimeout(go, 1000/60);
	//requestAnimationFrame( go );
	var old_time = (new Date()).getTime();
	var accumulator = 0;
	var step_time = 17;
				
	function go(timestamp) {
       // root.render();
		//stats.update();
		timestamp = timestamp || (new Date()).getTime();
		var interval = filter_interval(timestamp - old_time);
		old_time = timestamp;
		accumulator += interval;
		var step = 0;
		while(accumulator > step_time)
		{
			accumulator -= step_time;
			step++;
        }
        if(step != 0)
            game.update(step);
			setTimeout(go, 1000/60);
    }
                
    
    
};

exports.root = game;