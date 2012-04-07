var util = require("util");

var Player = function()
{
    this.id = null;
    this.x = null;
    this.y = null;
    this.person
    this.init = function(id, x, y)
    {
        this.id = id;
        this.x = x;
        this.y = y;
        util.log("Player: init! id:"+ id);
    };

    this.shutdown = function()
    {
        util.log("Player: shutdown! id:");
    };
    this.post_message = function(step, msg)
    {
        util.log("Player: post_message! text:" + msg.text);
    };
};


exports.Class = Player;

