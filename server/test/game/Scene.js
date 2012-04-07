var util = require("util");


var scene = {};
scene.width = 2000;
scene.hight = 2000;
scene.collision_results = null;
scene.fresh = function(step, player_manager)
{

    var player_list = player_manager.list;
    for(var key in player_list)
    {
        util.log("scene: fresh: player id = " + key);
        
    }
}

exports.obj = scene;