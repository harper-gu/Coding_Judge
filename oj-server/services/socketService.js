module.exports = function(io) {
  io.on('connection', (socket) => {
    console.log('socket.id: '+ socket.id);
    var message = socket.handshake.query['message'];
    console.log('server receives: ' + message);
    //send confirm message to client
    io.to(socket.id).emit('message', 'server is ready');
  })
}
