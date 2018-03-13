'use strict'

var SerialPort = require('serialport')
const seqqueue = require('seq-queue')
// const EventEmitter = require("events").EventEmitter

const F_gfx_Cls = 0xffd7
const F_gfx_Line = 0xffd2
const F_gfx_LinePattern = 0xff65
const F_gfx_BGcolour = 0xff6e
const F_txt_BGcolour = 0xff7e
const F_SSTimeout = 0x000c
const F_gfx_Contrast = 0xff66

const CMD_ACK = 0x06

var log = {
  debug: function() {},
  // debug: console.log, // function(msg) {console.log("OLED: ", msg)},
  level: function() {},
  error: console.log,
  info: console.log
}

class OLED {
  constructor() {
    // Colors
    this.COLOR_BLACK = 0x0000
    this.COLOR_WHITE = 0xffff
    // Commands that have been sent queue
    // this.cmd_q = []
    // Device actions queue
    log.debug("OLED started")
    // log.level("debug")
    log.level("info")
    this.queue = seqqueue.createQueue(20000)
    this.port = null
    // return this.connect()
  }

  connect() {
    return new Promise((resolve, reject) => {
      console.log("OLED: Connect called")
      // List ports and connect
      SerialPort.list().then((ports) => {
        // console.log(ports)
        return ports.filter((ser_port) => {
          if (ser_port.vendorId != undefined && ser_port.vendorId.replace(/^0x/, '').toLowerCase() == "10c4" && ser_port.productId.replace(/^0x/, '').toLowerCase() == "ea60") {
            log.debug("Found device")
            log.debug(ser_port.comName)
            log.debug(ser_port.pnpId)
            log.debug(ser_port.manufacturer)
            log.debug(ser_port.vendorId)
            // __this.emit("device_found", ser_port)
            return ser_port
          }
        })
      }).then((oled) => {
        console.log(oled)
        if (oled.length === 0) {
          reject(new Error("No device found"))
        } else {
          this.port = null
          this.port = new SerialPort(oled[0].comName, {autoOpen: false, rtscts: false})
          console.log("pre Serialport isOpen", this.port.isOpen)
          this.port.setMaxListeners(500)
          this.port.open((err) => {
            if (err) {
              reject(err)
              return console.log("Error: ", err)
            }
            this.port.set({
              dtr: false,
              rts: false
            })
            setTimeout(() => {
              this.port.set({
                dtr: true,
                rts: true
              })
              this.port.flush(() => {
                setTimeout(resolve, 4000)
              })
            }, 3000)
          })
        }
      })
    })
  }

  sendCommand(cmd, data) {
    return new Promise((resolve, reject) => {
      this.queue.push((task) => {
        this.device_command(cmd, data).then(() => {
          task.done()
          resolve()
        })
      })
    })
  }

  connected() {
    // console.log("Connection check: ", this.port, SerialPort, this.port.binding)
    return (this.port !== undefined && this.port !== null && this.port.isOpen)
  }

  disconnect() {
    if (this.port) this.port.close()
  }

  sendSync(src) {
    return new Promise((resolve, reject) => {
      this.port.write(src)
      this.port.once("data", data => resolve(data))
      this.port.once('error', err => reject(err))
    })
  }

  device_command(cmd, data) {
    return new Promise((resolve, reject) => {
      const buf_cmd = Buffer.alloc(2)
      let data_buf = Buffer.alloc(data.length * 2)
      let send_buf
      buf_cmd.writeUInt16BE(cmd, 0)

      data.map((val, index) => {
        data_buf.writeUInt16BE(val, index * 2)
      })

      if (data !== undefined && data !== null) {
        send_buf = Buffer.concat([buf_cmd, data_buf])
      } else {
        send_buf = buf_cmd
      }
      log.debug("RAW_DATA ", send_buf)

      // this.cmd_q.push({cmd: buf_cmd, cb: callback, send_data: send_buf})
      return this.sendSync(send_buf)
        .then((data) => {
          console.log("CMD return ", data)
          if (data[0] == CMD_ACK) {
            resolve(data)
          } else {
            reject(new Error("Command returned NACK"), data)
          }
        })
    })
  }

  gfx_Cls() {
    return this.sendCommand(F_gfx_Cls, [])
  }

  gfx_Line(X1, Y1, X2, Y2, Color) {
    return this.sendCommand(F_gfx_Line, [X1, Y1, X2, Y2, Color])
  }

  gfx_LinePattern(pattern) {
    return this.sendCommand(F_gfx_LinePattern, [pattern])
  }

  gfx_Contrast(contrast) {
    return this.sendCommand(F_gfx_Contrast, [contrast])
  }

  txt_BGcolour(color) {
    return this.sendCommand(F_txt_BGcolour, [color])
  }

  gfx_BGcolour(color) {
    return this.sendCommand(F_gfx_BGcolour, [color])
  }

  SSTimeout(seconds) {
    return this.sendCommand(F_SSTimeout, [seconds])
  }
}

module.exports = new OLED()
