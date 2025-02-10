import { Server } from 'socket.io';

const io = new Server({
  cors: {
    origin: "http://localhost:3000"
  }
})

io.on('connection', (socket) => {
  socket.on('chat message', msg => {
    io.emit('chat message', msg);
  });
  socket.on('move message', msg => {
    io.emit('move message', msg);
  });
});

io.listen(5000);