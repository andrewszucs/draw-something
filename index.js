const express = require('express');
const path = require('path');
const socketIO = require('socket.io');

const PORT = process.env.SERVER_PORT || process.env.PORT;

const app = express();
const server = require('http').Server(app);
const io = socketIO(server);

app.use(express.static('public'));

app.use(express.static(path.join(__dirname, 'public', 'build')));

app.get('/canvas', function (req, res) {
  res.sendFile(__dirname + '/public/canvas.html');
});

app.get('/palette', function (req, res) {
  res.sendFile(path.join(__dirname, 'public', 'build', 'index.html'));
});

/**
* Convert rgba colour value to hex string
* @param {string} rgba is a comma separated r,g,b,a string
*/
const rgbaToHex = (rgba) => {

  const componentToHex = (c) => {
    const hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  }

  const parts = rgba.substring(5, rgba.length - 1).split(",");
  const r = parseInt(parts[0].trim());
  const g = parseInt(parts[1].trim());
  const b = parseInt(parts[2].trim());
  const a = parseFloat(parts[3].trim());

  return ('#' +
    componentToHex(r) +
    componentToHex(g) +
    componentToHex(b)
  );

}

/**
* Sending palette property updates to socket client, which is the canvas
*/
const palettes = io
  .of('/palette')
  .on('connection', (socket) => {
    console.log('a user connected to palette');

    socket.on('spray-color', ({ color }) => {
      console.log('server' + color)
      io.emit('spray-color', {
        color: rgbaToHex(color)
      });
    });

    socket.on('spray-size', data => {
      console.log('server' + data)
      io.emit('spray-size', data);
    });

    socket.on('bg-color', ({ color }) => {
      console.log('server' + color)
      io.emit('bg-color', {
        color: rgbaToHex(color)
      });
    });

    socket.on('undo', () => {
      io.emit('undo');
    });

    socket.on('redo', () => {
      io.emit('redo');
    });

    socket.on('clear', () => {
      io.emit('clear');
    });

    socket.on('disconnect', () => {
      console.log('user disconnected from palette');
    });
  });

/**
* Show console feedback when a user is connected or disconnected from a canvas 
*/
const canvases = io
  .of('/canvas')
  .on('connection', (socket) => {
    console.log('a user connected to canvas', socket);

    socket.on('disconnect', () => {
      console.log('user disconnected from canvas');
    });
  });

// const canvases = [{
//   id: 1,

// }, ...]

// const sprays = [{
//   size: 10,
//   color: "#hex",
//   canvas: 1,
// }, ...]

server.listen(PORT, () => console.log(`Draw-Something is running on: ${PORT}`));