
var util = require("util"),
    ws = require("../../lib/ws/server"),
    game = require("./Game").root;
var time = 0;
//创建WebSocket Server
var server = ws.createServer({
  debug : true
});

server.on('error', function (exc) {
    util.log("ignoring exception: " + exc);
});

//当有客户端接入时
server.on("connection", function(conn){
  game.add_player(conn.id);
  util.log("Connection: "+conn.id+" ver:"+conn.version);

  server.broadcast(conn.id+" has connected.");

  //当收到客户端发送的信息时
  conn.on("message", function(message){
    var msg = {};
    msg.text = message;
    game.receive_message(conn.id, msg);
    //向所有客户端发送信息.
    util.log(conn.id+" recive & send : "+message + "; time:" + game.time);
    server.broadcast(message + "; time:" + game.time);
    //server.send(id, message);
  });
});

//当有客户端断开连接时
server.on("close", function(conn){
    util.log("Disconnected: "+conn.id);
    game.remove_player(conn.id);
    //向所有客户端发送信息.
    server.broadcast(conn.id+" has disconnected.");
    
});

//启动服务 监听8000端口
var _port=process.argv[2]||8000;
server.listen(_port);
util.log("Server Started. port : "+_port);
game.init(server);
game.run();
game.shutdown();
