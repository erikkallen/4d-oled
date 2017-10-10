var SerialPort = require('serialport');
const seqqueue = require('seq-queue');
const EventEmitter = require("events").EventEmitter;

const F_gfx_Cls = 0xffd7;
const F_gfx_Line = 0xffd2;
const F_gfx_LinePattern = 0xff65;
const F_gfx_BGcolour = 0xff6e;
const F_txt_BGcolour = 0xff7e;
const F_SSTimeout = 0x000c;

const CMD_ACK = 0x06;



var log = {
  debug: console.log,
  level: function(){},
  error: console.log,
  info: console.log
}


class OLED extends EventEmitter {

  constructor() {
    super()
    // Commands that have been sent queue
    this.cmd_q = [];
    // Device actions queue
    this.queue = seqqueue.createQueue(20000);
    this.on("device_found", function(device){
      this.connect_to_device(device.comName)
    })
    log.debug("Com lib started")
    //log.level("debug")
    log.level("info")
  }

  connect() {
    var __this = this
    // List ports and connect
    SerialPort.list(function (err, ports) {
      ports.some(function(ser_port) {
        // log.debug(ser_port);
        // log.debug(ser_port.pnpId);
        // log.debug(ser_port.manufacturer);
        // log.debug(ser_port.vendorId)
        // log.debug(ser_port.productId)
        if (ser_port.vendorId != undefined && ser_port.vendorId.replace(/^0x/,'').toLowerCase() == "10c4" && ser_port.productId.replace(/^0x/,'').toLowerCase() == "ea60") {
          log.debug("Found device");
          log.debug(ser_port.comName);
          log.debug(ser_port.pnpId);
          log.debug(ser_port.manufacturer);
          log.debug(ser_port.vendorId)
          __this.emit("device_found", ser_port)
          return true
        }
        __this.emit("error", new Error("No device found"))
      });
    });
  };

  connect_to_device(name) {
    var __this = this
    this.port = new SerialPort(name);
    this.port.flush(function(){
      //var Delimiter = SerialPort.parsers.Delimiter;
      //__this.parser = __this.port.pipe(new Delimiter({delimiter: new Buffer([0])}))

      
      // If data from the device is received it is parsed here
      // an answer is expected from each sent command so it is simply mached in the same order the commands are sent
      __this.port.on('data', function(data){
        __this.emit("raw_data", data)
        log.debug('Data (raw)', data)
        log.debug('Data (raw) size:', data.length);
        
        var queued_comand = __this.cmd_q.shift()
        //log.debug("Matching ",queued_comand.cmd);
        // Handle Measurement data
        if (data[0] == CMD_ACK) {
          __this.emit("command_ack", data)
          queued_comand.cb(null,data)
        } else {
          __this.emit("command_nack", data)
          queued_comand.cb(new Error("Command returned NACK"),data)
        }

      });

      __this.on('error', function(err){
        log.error("Ooh noo")
        log.error(err)
        __this.emit("error", err)
      })
      // The device needs 3 seconds to boot
      setTimeout(()=>{
      __this.emit('connected')
      },3000);
    })
    __this.port.on('error', function(err){
      log.error("Ooh noo")
      log.error(err)
      __this.emit("error", err)
    })


  }
  


  sendCommand(cmd, data, callback) {
    var __this = this
    //log.debug("send:", cmd)
    this.queue.push(function(task){
      __this.device_command(cmd, data, function(err,d){
        task.done()
        if (callback) callback(err,d)
      })
    },function() {
      __this.queue.close(true)
      __this.emit("error", new Error("Command timeout"))
      
    }
  )
  }

  disconnect() {
    if (this.port != undefined) this.port.close()
  }

  device_command(cmd, data, callback) {
    
    var __this = this
    const buf_cmd = new Buffer(2)
    var data_buf = new Buffer(data.length*2)
    var send_buf
    buf_cmd.writeUInt16BE(cmd,0)

    data.map((val,index)=>{
      data_buf.writeUInt16BE(val,index*2)
    })

    if (data != undefined) {
      send_buf = Buffer.concat([buf_cmd,data_buf])
    } else {
      send_buf = buf_cmd
    }
    log.debug("RAW_DATA ",send_buf)

    this.cmd_q.push({cmd:buf_cmd, cb:callback, send_data:send_buf})
    this.port.write(send_buf, function(err) {
      if (err) {
        callback(err,null)
        __this.emit("error", err)
        return log.debug('Error on write: ', err.message);
      }
      //log.debug('Log set');
    });
  }

  gfx_Cls(done)
  {
    this.sendCommand(F_gfx_Cls, [],done)
  }

  gfx_Line(X1, Y1, X2, Y2, Color,done) {
    this.sendCommand(F_gfx_Line, [X1,Y1,X2,Y2,Color],done)
  }

  gfx_LinePattern(pattern, done) {
    this.sendCommand(F_gfx_LinePattern, [pattern],done)
  }

  txt_BGcolour(color, done) {
    this.sendCommand(F_txt_BGcolour, [color],done)
  }

  gfx_BGcolour(color, done) {
    this.sendCommand(F_gfx_BGcolour, [color],done)
  }

  SSTimeout(seconds, done) {
    this.sendCommand(F_SSTimeout, [seconds],done)
  }

  COLOR_BLACK = 0x0000
  COLOR_WHITE = 0xFFFF

}

module.exports = new OLED()
