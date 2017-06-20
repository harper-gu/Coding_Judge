var redisClient = require('../modules/redisClient');

const TIMEOUT = 3600;

module.exports = function(io) {

  var collaborations = []; //map each session(problem) to its participants
  var socketIdToSessionId = [];

  var sessionPath = '/oj_server/';  //path in redis

  io.on('connection', (socket) => {

    console.log('socket.id: '+ socket.id);
    var message = socket.handshake.query['message']; //get confirmation from client //not necessary
    console.log('server receives: ' + message);
    io.to(socket.id).emit('message', 'server is ready'); //send confirm message to client

    var sessionId = socket.handshake.query['sessionId'];

    if (sessionId in collaboration) {
      collaboration[sessionId]['participants'].push(socket.id);
    } else {
      redisClient.get(sessionPath+sessionId, function(data) {
        if (data) {  //session exists previously
          console.log('session terminated. pulling back...');
          collaboration[sessionId] = {
            'cachedInstructions': JSON.parse(data),
            'participants': []
          };
        } else { //session was never visited
          collaborations[sessionId] = {
            'cachedInstructions': [],
            'participants': []
          }
        }
        collaborations[sessionId]['participants'].push(socket.id);
      });
    }

    //add socket id to corresponding collaboration session participants
    if (! (sessionId in collaborations)) {
      collaborations[sessionId] = {
        'participants': []
      }
    }
    collaborations[sessionId]['participants'].push(socket.id);

    //change event listener
    socket.on('change', delta => {
      console.log('lets change problem '+ socketIdToSessionId[socket.id] + delta);
      let sessionId = socketIdToSessionId[socket.id];
      collaborations[sessionId][cachedInstructions].push(
        ['change', delta, Date.now()]
      );
      forwardEvent(socket.id, 'change', delta);
    });

    //cursor event listener
    socket.on('cursorMove', cursor => {
      forwardEvent(socket.id, 'cursorMove', JSON.stringify(cursor));
    });

    socket.on('restoreBuffer', () => {
      let sessionId = socketIdToSessionId[socket.id];
      if (sessionId in collaborations) {
        let cachedInstructions = collaborations[sessionId][cachedInstructions]
          for (let i = 0; i < cachedInstructions.length; i++) {
            socket.emit(cachedInstructions[i][0], cachedInstructions[i][1]);
          }
      } else {
        console.log('warning');
      }
    });

    socket.on('disconnect', () => {
      let sessionId = socketIdToSessionId[socket.id];
      console.log('disconnecting socket '+ socket.id);
      let foundAndRemoved = false;
      let participants = collaborations[sessionId]['participants'];
      let index = participants.indexOf(socket.id);
      if (index >= 0) {
        participants.splice(index, 1);
        foundAndRemoved = true;

        if (participants.length === 0) {
          console.log('NO one left. Saving to Redis...');
          let key = sessionPath + sessionId;
          let value = JSON.stringify(collaborations[sessionId][cachedInstructions]);

          redisClient.set(key, value, redisPrint);
          redisClient.expire(key, TIMEOUT);
          delete collaborations[sessionId];
        }
      }
      if (!foundAndRemoved) {
        console.log('session record fail to remove');
      }
    });
  });

  var forwardEvent = function(socketId, eventName, dataString) {
    let sessionId = socketIdToSessionId[socketId];
    if (sessionId in collaborations) {
      let participants = collaborations[sessionId]['participants'];
      for (let i = 0; i < participants.length; i ++) {
        if (participants[i] != socketId) {
          io.to(participants[i]).emit(eventName, dataString);
        }
      }
    } else {
      console.log('warning');
    }
  }
}
