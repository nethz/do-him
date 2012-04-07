var util = require("util");
var Person = require("./Person").Person;

var Player = function()
{
    this.id = null;
    this.x = null;
    this.y = null;
    this.person = new Person();
    this.init = function(id, x, y)
    {
        this.id = id;
        this.x = x;
        this.y = y;

        util.log("Player: init! id:"+ id);
    };
    
    this.update = function(step)
    {
        this.person.update(step * 17);
    }
    this.shutdown = function()
    {
        util.log("Player: shutdown! id:");
    };
    this.receive_message = function(step, msg)
    {
        
        if(msg.rotation)
        {
            this.person.setRotation(msg.rotation); 
        }
       
        util.log("Player: post_message! text:" + msg.text);
    };
};


exports.Class = Player;

