var util = require("util");
var Player = require("./Player");
var player_manager = {};

player_manager.list = {};

player_manager.add_player = function(id, x, y)
{
    util.log("player_manager: add player! id:"+ id + ", x =" + x +", y =" + y);
    player_manager.list[id] = new Player.Class;
    player_manager.list[id].init(id, x, y);
}

player_manager.remove_player = function(id)
{
    util.log("player_manager: remove player! id:"+ id);
    player_manager.list[id].shutdown();
    delete player_manager.list[id];
}

player_manager.receive_event = function(step, evt)
{

    util.log("player_manager: post_event!");
    player_manager.list[evt.id].receive_message(step, evt.msg);
}


exports.obj = player_manager;