/*-----------------------------------------------
  Requirements:
-----------------------------------------------*/
var debug = function() {};

var util = require('../_util'),
    events = require('events'),
    Url = require('url'),
    Buffer = require('buffer').Buffer,
    Crypto = require('crypto'),
    Constants = require('constants');
    Parser = require('./parser');

var _events = require('../_events');
var Mixin = require('../lang/mixin');

var CLOSE_FRAME = new Buffer(2);

CLOSE_FRAME[0] = 0xFF;
CLOSE_FRAME[1] = 0x00;

/*-----------------------------------------------
  The Connection:
-----------------------------------------------*/
module.exports = Connection;

// Our connection instance:
function Connection(manager, options, req, socket, upgradeHead) {
  var _firstFrame, connection = this;

  _events.EventEmitter.call(this);

  this._req = req;
  this._socket = socket;
  this._manager = manager;
  this.id = manager.createId(socket.remotePort);

  this._options = Mixin({
    version: 'auto',    // String: Value must be either: draft75, draft76, 13, auto
    origin: '*',        // String,Array: Valid connection origins.
    subprotocol: '*',   // String,Array: Valid connection subprotocols.
    debug: true
  }, options);

  if (connection._options.debug) {
    debug = function() {
      util.error(
          '\033[90mWS: ' +
          Array.prototype.join.call(arguments, ' ') +
          '\033[39m'
      );
      //process.stdout.flush();
    };
  }

  this.version=(function(){
        var ver=req.headers["sec-websocket-version"];
        if (ver){
          return ver;
        }else if (req.headers['sec-websocket-key1'] &&
            req.headers['sec-websocket-key2']) {
          return 'draft76';
        }
        return 'draft75';
      })();

  // Close timeout, for browsers that don't send the close packet.
  connection._closeTimer = undefined;

  // Set the initial connecting state.
  connection.state(1);
  // Setup the connection manager's state change listeners:
  connection.on('stateChange', function(state, laststate) {
    if (connection._options.debug) {
      debug(connection.id, 'stateChange: ', laststate, '->', state);
    }

    if (state === 4) {
      manager.attach(connection);
      // Handle first frame breakages.
      if (_firstFrame) {
        parser.write(_firstFrame);
        delete _firstFrame;
      }
    } else if (state === 5 && laststate !== 6 && laststate !== 5) {
      close(connection);
    } else if (state === 6 && laststate === 5) {
      manager.detach(connection);
      connection.emit('close');
    }
  });

  var wsServer= this._options.wsServer;
  connection.on("close",function(){
    wsServer.emit('close',connection)
  });

  // Start to process the connection
  if (!checkVersion(this)) {
    this.reject('Invalid version.');
  } else {
    // Let the debug mode know that we have a connection:
    debug(this.id, this.version + ' connection');

    socket.setTimeout(0);
    socket.setNoDelay(true);
    socket.setKeepAlive(true, 0);

    // Handle incoming data:
    var parser = new Parser(this);

    parser.on('message', function(message) {
      debug(connection.id, 'recv: ' + message);
      connection.emit('message', message);
    });

    parser.on('close', function() {
      debug(connection.id, 'requested close');

      // Timer to catch clients that don't send close packets.
      // I'm looking at you safari and chrome.
      if (connection._closeTimer) {
        clearTimeout(connection._closeTimer);
      }
      connection.state(5);
    });

    socket.on('data', function(data) {
      parser.write(data);
    });

    // Handle the end of the stream, and set the state
    // appropriately to notify the correct events.
    socket.on('end', function() {
      debug(connection.id, 'end');
      connection.state(5);
    });

    socket.on('timeout', function() {
      debug(connection.id, 'timed out');
      connection.emit('timeout');
    });

    socket.on('error', function(e) {
      debug(connection.id, 'error', e);
      if (e.errno != Constants.EPIPE ||
          e.errno != connection.ECONNRESET) {
        connection.emit('error', e);
      }
      connection.state(5);
    });

    // Bubble errors up to the manager.
    connection.bubbleEvent('error', manager);

    // Carry out the handshaking.
    //    - Draft75: There's no upgradeHead, goto Then.
    //      Draft76: If there's an upgradeHead of the right length, goto Then.
    //      Then: carry out the handshake.
    //
    //    - Currently no browsers to my knowledge split the upgradeHead off
    //      the request,
    //      but in the case it does happen, then the state is set to waiting for
    //      the upgradeHead.
    //
    // This switch is sorted in order of probably of occurence.
    switch (this.version) {
      case 'draft76':
        if (upgradeHead.length >= 8) {
          if (upgradeHead.length > 8) {
            _firstFrame = upgradeHead.slice(8, upgradeHead.length);
          }

          handshakes.draft76(connection, upgradeHead.slice(0, 8));
        } else {
          connection.reject('Missing key3');
        }
        break;
      case 'draft75':
        handshakes.draft75(connection);
        break;
      case '7':
      case '8':
      case '13':
        handshakes.draft13(connection);
        break;       
      default:
        connection.reject('Unknown version: ' + this.version);
        break;
    }
  }
}

util.inherits(Connection, _events.EventEmitter);

/*-----------------------------------------------
  Various utility style functions:
-----------------------------------------------*/
function write(connection, data) {
  debug(connection.id, 'write: ', data.inspect());
  if (connection._socket.writable) {
    return connection._socket.write(data);
  }
  return false;
}

function close(connection) {
  connection._socket.end();
  connection._socket.destroy();
  debug(connection.id, 'socket closed');
  connection.state(6);
}

function checkVersion(connection) {
  var server_version = connection._options.version.toLowerCase();

  return (server_version == 'auto' || server_version == connection.version);
}


function pack(num) {
  var result = '';
  result += String.fromCharCode(num >> 24 & 0xFF);
  result += String.fromCharCode(num >> 16 & 0xFF);
  result += String.fromCharCode(num >> 8 & 0xFF);
  result += String.fromCharCode(num & 0xFF);
  return result;
}


/*-----------------------------------------------
  Formatters for the urls
-----------------------------------------------*/

// TODO: Properly handle origin headers.
function websocket_origin(connection) {
  var origin = connection._options.origin || '*';

  if (origin == '*' || Array.isArray(origin)) {
    origin = connection._req.headers.origin;
  }

  return origin;
}

function websocket_location(connection) {
  if (connection._req.headers['host'] === undefined) {
    connection.reject('Missing host header');
    return;
  }

  var location = '',
      secure = connection._socket.secure,
      host = connection._req.headers.host.split(':'),
      port = host[1] !== undefined ? host[1] : (secure ? 443 : 80);

  location += secure ? 'wss://' : 'ws://';
  location += host[0];

  if (!secure && port != 80 || secure && port != 443) {
    location += ':' + port;
  }

  location += connection._req.url;

  return location;
}


/*-----------------------------------------------
  0. unknown
  1. opening
  2. waiting
  3. handshaking
  4, connected
  5. closing
  6. closed
-----------------------------------------------*/
Connection.prototype._state = 0;


/*-----------------------------------------------
  Connection Public API
-----------------------------------------------*/
Connection.prototype.state = function(state) {
  if (state !== undefined && typeof state === 'number') {
    var oldstate = this._state;
    this._state = state;
    this.emit('stateChange', this._state, oldstate);
  }
};

Connection.prototype.inspect = function() {
  return '<WS:Connection ' + this.id + '>';
};

Connection.prototype.frame = function (opcode, str) {
  var dataBuffer = new Buffer(str)
    , dataLength = dataBuffer.length
    , startOffset = 2
    , secondByte = dataLength;
  if (dataLength > 65536) {
    startOffset = 10;
    secondByte = 127;
  }
  else if (dataLength > 125) {
    startOffset = 4;
    secondByte = 126;
  }
  var outputBuffer = new Buffer(dataLength + startOffset);
  outputBuffer[0] = opcode;
  outputBuffer[1] = secondByte;
  dataBuffer.copy(outputBuffer, startOffset);
  switch (secondByte) {
  case 126:
    outputBuffer[2] = dataLength >>> 8;
    outputBuffer[3] = dataLength % 256;
    break;
  case 127:
    var l = dataLength;
    for (var i = 1; i <= 8; ++i) {
      outputBuffer[startOffset - i] = l & 0xff;
      l >>>= 8;
    }
  }
  return outputBuffer;
};


Connection.prototype.write = function(data) {
  if (this._state === 4) {

   if (this.version=="draft75" || this.version=="draft76"){
      var byteLen = Buffer.byteLength(data, 'utf8'),
          bytes = new Buffer(byteLen + 2);
      bytes[0] = 0x00;
      bytes.write(data, 1, 'utf8');
      bytes[byteLen + 1] = 0xFF;
    }else{
      bytes=this.frame(0x81,data);

    }
    return write(this, bytes);
  } else {
    debug(this.id, '\033[31mCould not send.');
  }
  return false;
};

Connection.prototype.send = Connection.prototype.write;

Connection.prototype.broadcast = function(data) {
  this._manager.forEach(function(client) {
    if (client && client._state === 4 && client.id != this.id) {
      client.write(data);
    }
  }, this);
};

Connection.prototype.close = function() {
  var connection = this;

  if (connection._state == 4 && connection._socket.writable) {
    write(connection, CLOSE_FRAME);
  }

  // Add a two second timeout for closing connections.
  connection._closeTimer = setTimeout(function() {
    connection.state(5);
  }, 15 * 1000);
};

Connection.prototype.reject = function(reason) {
  debug(this.id, 'rejected. Reason: ' + reason);
  this.state(5);
};

Connection.prototype.handshake = function() {
  if (this._state < 3) {
    debug(this.id, this.version + ' handshake');

    this.state(3);

    doHandshake[this.version].call(this);
  } else {
    debug(this.id, 'Already handshaked.');
  }
};

/*-----------------------------------------------
  Do the handshake.
-----------------------------------------------*/
var handshakes = {


  // Using draft75, work out and send the handshake.
  draft75: function(connection) {
    connection.state(3);

    var location = websocket_location(connection), res;

    if (location) {
      res = 'HTTP/1.1 101 Web Socket Protocol Handshake\r\n' +
          'Upgrade: WebSocket\r\n' +
          'Connection: Upgrade\r\n' +
          'WebSocket-Origin: ' + websocket_origin(connection) + '\r\n' +
          'WebSocket-Location: ' + location;

      if (connection._options.subprotocol &&
          typeof connection._options.subprotocol == 'string') {
        res += '\r\nWebSocket-Protocol: ' + connection._options.subprotocol;
      }

      connection._socket.write(res + '\r\n\r\n', 'ascii');

      connection.state(4);
    }
  },

  draft13 : function(connection,upgradeHead){
    connection.state(3);


    var magic="258EAFA5-E914-47DA-95CA-C5AB0DC85B11";

    var key = connection._req.headers['sec-websocket-key'];

    var hash = Crypto.createHash("sha1");
    hash.update(key + magic);  
    key = hash.digest('base64');

    var location = websocket_location(connection), res;

    if (location) {
      var res = 'HTTP/1.1 101 Switching Protocols\r\n' +
        'Upgrade: websocket\r\n' +
        'Connection: Upgrade\r\n' +
       // 'Sec-WebSocket-Origin: ' + websocket_origin(connection) + '\r\n' +
       // 'Sec-WebSocket-Location: ' + location + '\r\n' +
        'Sec-WebSocket-Accept: ' + key ;

     if (connection._options.subprotocol &&
          typeof connection._options.subprotocol == 'string') {
        res += '\r\nWebSocket-Protocol: ' + connection._options.subprotocol;
      }
      res += '\r\n\r\n';

      connection._socket.write(res, 'binary');

      connection.state(4);

    }

  },

  // Using draft76 (security model), work out and send the handshake.
  draft76: function(connection, upgradeHead) {
    connection.state(3);

    var location = websocket_location(connection), res;

    if (location) {
      res = 'HTTP/1.1 101 WebSocket Protocol Handshake\r\n' +
          'Upgrade: WebSocket\r\n' +
          'Connection: Upgrade\r\n' +
          'Sec-WebSocket-Origin: ' + websocket_origin(connection) + '\r\n' +
          'Sec-WebSocket-Location: ' + location;

      if (connection._options.subprotocol &&
          typeof connection._options.subprotocol == 'string') {
        res += '\r\nSec-WebSocket-Protocol: ' + connection._options.subprotocol;
      }

      var strkey1 = connection._req.headers['sec-websocket-key1'],
          strkey2 = connection._req.headers['sec-websocket-key2'],
          numkey1 = parseInt(strkey1.replace(/[^\d]/g, ''), 10),
          numkey2 = parseInt(strkey2.replace(/[^\d]/g, ''), 10),
          spaces1 = strkey1.replace(/[^\ ]/g, '').length,
          spaces2 = strkey2.replace(/[^\ ]/g, '').length;


      if (spaces1 == 0 || spaces2 == 0 ||
          numkey1 % spaces1 != 0 || numkey2 % spaces2 != 0) {
        connection.reject('WebSocket Handshake contained an invalid key');
      } else {
        var hash = Crypto.createHash('md5'),
            key1 = pack(parseInt(numkey1 / spaces1)),
            key2 = pack(parseInt(numkey2 / spaces2));

        hash.update(key1);
        hash.update(key2);
        hash.update(upgradeHead.toString('binary'));

        res += '\r\n\r\n';
        res += hash.digest('binary');

        connection._socket.write(res, 'binary');

        connection.state(4);
      }
    }
  }
};

