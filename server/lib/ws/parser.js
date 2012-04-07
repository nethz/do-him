
var util = require('../_util'),
    events = require('events');

module.exports = Parser;


/*-----------------------------------------------
  The new onData callback for
  http.Server IncomingMessage
-----------------------------------------------*/
function Parser() {
  events.EventEmitter.call(this);

  this.frameData = [];
  this.order = 0;
  this.closing = false;
}

util.inherits(Parser, events.EventEmitter);

var debug = function() {
      util.error(
          '\033[90mWS: ' +
          Array.prototype.join.call(arguments, ' ') +
          '\033[39m'
      );
      //process.stdout.flush();
    };



 Parser.prototype.unmask = function (mask, buf) {
  if (mask != null) {
    for (var i = 0, ll = buf.length; i < ll; i++) {
      buf[i] ^= mask[i % 4];
    }    
  }
  return buf != null ? buf.toString('utf8') : '';
}   

 Parser.prototype.unpack = function (buffer) {
  var n = 0;
  for (var i = 0; i < buffer.length; ++i) {
    n = (i == 0) ? buffer[i] : (n * 256) + buffer[i];
  }
  return n;
}

Parser.prototype.write = function(data) {
  var pkt, msg;
  debug('parse.write', data.inspect());

  // TODO : support draft 7 8 13
  // var lastFragment = (data[0] & 0x80) == 0x80; 



 
  // var opcode = data[0] & 0xf;

var end = false;
var i=-1;
var msg="";
while(!end){
   i++;
     if (this.order == 0) {
      if (data[i] & 0x80 == 0x80) {
        this.order = 1;
      } else {
        this.order = -1;
      }
    }
    if (this.order == -1){
       if (data[i] === 0xFF) {
        end=true;
      } else if (data[i] !== 0x00) {
        this.frameData.push(data[i]);
      }

    }else if (this.order == 1){
      
      if (this.closing && data[i] === 0x00) {
        this.emit('close');
        this.closing = false;
      } else if (data[i] === 0xFF && this.frameData.length == 0) {
        this.closing = true;
      } else {
        var length = data[1] & 0x7f;
        var masked = !data[1]?false:(data[1] & 0x80) == 0x80;

        util.log(3123)
          if (data[0] != 0x81){
            return ;    
          } 
          if (length < 128) {
            startIdx=0;
            if (length < 126) {
              startIdx=2;
            }else if (length == 126) {
              length=this.unpack(data.slice(2,4));
            }else if (length == 127) {
             length=this.unpack(data.slice(8));
             startIdx=2;
            }
            var mask=data.slice(startIdx,startIdx+4);
            var endIdx=startIdx+4+length;
            var text=data.slice(startIdx+4,endIdx);
            msg+=(this.unmask(mask,text));
            if ( (endIdx) == data.length ){
              end=true;
            }else{
              data=data.slice(endIdx)
            }
          }

        }
      }
}
if (this.frameData.length>0){
  var pkt = new Buffer(this.frameData);
msg=pkt.toString("utf8");
}
util.log(this.frameData.length);
util.log(msg)
this.emit('message',msg);
this.order = 0;
this.frameData = [];


};

/*
function ondata(data, start, end) {
  if (this.state == 2 && this.version == 'draft76') {
    // TODO: I need to figure out an alternative here.
    // data.copy(this._req.upgradeHead, 0, start, end);
    debug.call(this, 'Using draft76 & upgrade body not sent with request.');
    this.reject('missing upgrade body');
  // Assume the data is now a message:
  } else if (this.state == 4) {
    data = data.slice(start, end);

    var frame_type = null, length, b;
    var parser_offset = -1;
    var raw_data = [];

    while(parser_offset < data.length-2) {
      frame_type = data[parser_offset ++ ];

      if (frame_type & 0x80 == 0x80) {
        debug.call(this, 'high');
        b = null;
        length = 1;
        while(length--) {
          b = data[parser_offset ++ ];
          length = length * 128 + (b & 0x7F);
          if (b & 0x80 == 0) {
            break;
          }
        }
        parser_offset += length;
        if (frame_type == 0xFF && length == 0) {
          this.close();
        }
      } else {
        raw_data = [];

        while(parser_offset <= data.length) {
          b = data[parser_offset ++ ];
          if (b == 0xFF) {
            var buf = new Buffer(raw_data);
            this.emit('message', buf.toString('utf8', 0, buf.length));
            break;
          }
          raw_data.push(b);
        }
      }
    }
  }
};
*/


// TODO

/*-----------------------------------------------
  The new onData callback for
  http.Server IncomingMessage
-----------------------------------------------*/
// var util = require('util'),
//     events = require('events');

// module.exports = Parser;

// function Parser(version) {
//   events.EventEmitter.call(this);
//   this.version = version.toLowerCase() || 'draft76';
//   this.readable = true;
//   this.paused = false;

//   if (this.version == 'draft76' || this.version == 'draft75') {
//     this.frameData = [];
//     this.frameStage = 'begin';
//   }else {
//     var ver=this.version;
//     if (ver=="7" || ver=="8" || ver=="13"){
//       // TODO
//     }
//   }

// }

// util.inherits(Parser, events.EventEmitter);


// Parser.prototype.write = function(data) {
//   var pkt, msg;
//   for (var i = 0, len = data.length; i < len; i++) {
//     if (this.order == 0) {
//       if (data[i] & 0x80 == 0x80) {
//         this.order = 1;
//       } else {
//         this.order = -1;
//       }
//     } else if (this.order == -1) {
//       if (data[i] === 0xFF) {
//         pkt = new Buffer(this.frameData);
//         this.order = 0;
//         this.frameData = [];

//         this.emit('data', pkt.toString('utf8', 0, pkt.length));
//       } else {
//         this.frameData.push(data[i]);
//       }
//     } else if (this.order == 1) {
//       this.emit('error', 'High Order packet handling is not yet implemented.');
//       this.order = 0;
//     }
//   }
// };

// Parser.prototype.destroy = function() {
//   delete this.order;
//   delete this.frameData;
// };



// exports.createParseStream = function(version) {
//   return new ParserStream(version);
// };

// var ParserStream = exports.ParseStream = function(version) {
//   events.EventEmitter.call(this);

//   // states
//   this.readable = true;
//   this.writable = true;
//   this.paused = false;

//   // stream options
//   this.version = version.toLowerCase() || 'draft76';

//   // A buffer to store #write data
//   this.bufferSize = 40 * 1024;
//   this.buffer = new Buffer(this.bufferSize);

//   // we need to use a
//   this.frameBuffer = [];
//   this.parseState = '';
// };

// util.inherits(ParserStream, events.EventEmitter);

// // Readable Stream
// ParserStream.prototype._read = function() {
//   var self = this;

//   // can't read a paused stream.
//   if (!self.readable || self.paused) return;


//   // on new frame:
//   var msg = new events.EventEmitter();

//   this.emit('message', msg);

//   /*while len,
//     if this.frameState is 'start' or 'part'
//       // when we get part of a message:
//       // say, we buffer 100 bytes or something, a small buffer amount.
//       msg.emit('data', this.frameBuffer);

//     else,
//       // when the frame finishes:
//       msg.emit('end', this.frameBuffer);
//   end
//   */
// };

// ParserStream.prototype.pause = function() {
//   this.paused = true;
// };

// ParserStream.prototype.resume = function() {
//   this.paused = false;

//   //this.buffer.length >
// };

// ParserStream.prototype.destroy = function() {};


// // Writable Stream
// ParserStream.prototype.write = function() {};
// ParserStream.prototype.flush = function() {};
// ParserStream.prototype.end = function() {};
