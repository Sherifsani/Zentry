const { Server } = require('socket.io');

let _io = null;

const init = (httpServer) => {
  _io = new Server(httpServer, {
    cors: {
      origin: [process.env.CLIENT_URL, 'http://localhost:3000'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });
  return _io;
};

const getIO = () => {
  if (!_io) throw new Error('Socket.io not initialized');
  return _io;
};

module.exports = { init, getIO };
