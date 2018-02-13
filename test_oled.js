var oled = require('./oled.js')

const DISPLAY_PIXEL_X_BEGIN = 0
const DISPLAY_PIXEL_X_END = 127

const DISPLAY_PIXEL_Y_BEGIN = 0
const DISPLAY_PIXEL_Y_END = 127

oled.connect().then(() => {
  console.log("Connected")
  oled.SSTimeout(0)
  // .then(() => {
  //   console.log("success")
  // }, (err) => {
  //   console.log("failed", err)
  // }) // 0 disables the screen-saver
  oled.gfx_Cls() // Clear screen
  oled.gfx_Contrast(15)
  oled.gfx_LinePattern(0, console.log) // Reset line-pattern to solid line
  oled.gfx_BGcolour(oled.COLOR_BLACK, console.log) // Reset background-color
  oled.txt_BGcolour(oled.COLOR_BLACK, console.log) // Reset text background-color
  oled.gfx_Cls() // Clear screen
  oled.gfx_Line(DISPLAY_PIXEL_X_BEGIN, DISPLAY_PIXEL_Y_BEGIN, DISPLAY_PIXEL_X_BEGIN, DISPLAY_PIXEL_Y_END, oled.COLOR_WHITE)
  oled.gfx_Line(DISPLAY_PIXEL_X_BEGIN, DISPLAY_PIXEL_Y_BEGIN, DISPLAY_PIXEL_X_END, DISPLAY_PIXEL_Y_BEGIN, oled.COLOR_WHITE)
  oled.gfx_Line(DISPLAY_PIXEL_X_END, DISPLAY_PIXEL_Y_END, DISPLAY_PIXEL_X_END, DISPLAY_PIXEL_Y_BEGIN, oled.COLOR_WHITE)
  oled.gfx_Line(DISPLAY_PIXEL_X_END, DISPLAY_PIXEL_Y_END, DISPLAY_PIXEL_X_BEGIN, DISPLAY_PIXEL_Y_END, oled.COLOR_WHITE)
  oled.gfx_Line(DISPLAY_PIXEL_X_BEGIN, DISPLAY_PIXEL_Y_BEGIN, DISPLAY_PIXEL_X_END, DISPLAY_PIXEL_Y_END, oled.COLOR_WHITE)
  oled.gfx_Line(DISPLAY_PIXEL_X_BEGIN, DISPLAY_PIXEL_Y_END, DISPLAY_PIXEL_X_END, DISPLAY_PIXEL_Y_BEGIN, oled.COLOR_WHITE)
}, (err) => {
  return console.log(err)
})

// oled.connect((err) => {
//   if (err) {
//     return console.log("connection failed")
//   }
//   console.log("Connected")
// })

// oled.connect((err) => {
//   if (err) {
//     return console.log("connection failed")
//   }
//   console.log("Connected")
// })
