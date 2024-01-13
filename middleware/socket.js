const io = require("socket.io");
let socket;

const createSocket = (httpServer) => {
  socket = io(httpServer);

  socket.on("connect", (result) => {
    result.on("join_room", (room) => {
      result.join(room);
    });
  });
};

const sendEvent = (event, data) => {
  socket.emit(event, data);
};

const sendEventRoom = (room, event, data) => {
  socket.to(room).emit(event, data);
};

module.exports = {
  socket,
  sendEvent,
  createSocket,
  sendEventRoom,
};
