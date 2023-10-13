/*
 * Scokets listener.
 * Este controlador se encarga de manejar las conexiones, escuchar los eventos y delegar
 * la responsabilidad a quien corresponda.
 */

module.exports = function (server) {
  var io = require("socket.io")(server);
  io.sockets.on("connection", function (socket) {
    socket.on("startGame", function (data) {
      // console.log(data);
      socket.emit("instructionGame", { msg: "reply to event" });
    });

    socket.on("event", function (data) {
      // console.log(data);
      socket.emit("reply-event", { msg: "reply to event" });
    });

    //Podemos dividir en controladores de sockets, pasandoles io y socket
    //como se indica acontinuación:
    //require('../controllers/shoutbox.js')(io, socket);
    require("../controllers/gameAquarium.js")(io, socket);
  });
};
