const { addData, queryByID, updateData, compareAndSortData } = require("../config/dbConfig");

exports = module.exports = function (io) {
  const users = {};
  io.on("connection", (socket) => {
    socket.on("new-user", async (cID, userName) => {
      users[socket.id] = userName;
      socket.join(cID);
    });

    // Create function to send status
    sendStatus = function (s) {
      socket.emit("status", s);
    };

    socket.on("send-chat-message", async (data) => {
      if (data.message.length >= 1) {
        const toDB = {
          cID: data.cID,
          mID: users[socket.id],
          message: data.message,
          time: Date.now(),
          from: data.from,
          to: data.to,
        };
        await addData("messages", toDB);
        socket.broadcast.to(data.cID).emit("chat-message", { message: data.message, mID: users[socket.id] });

        sendStatus({
          message: "Message sent",
          clear: true,
        });
      } else sendStatus("Please enter a message");
    });

    socket.on("disconnect", () => {
      delete users[socket.id];
    });
  });
};
