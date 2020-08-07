(function () {
  const element = function (id) {
    return document.getElementById(id);
  };

  // Get Elements
  let status = element("status");
  const messages = element("messages");
  const textarea = element("textarea");
  const userName = element("getName").value;
  const cID = element("getCID").value;
  const from = element("from").value;
  const to = element("to").value;

  const messageCard = document.querySelector(".chat-message");

  //Scroll Down
  messages.scrollTop = messages.scrollHeight;

  const socket = io();
  socket.emit("new-user", cID, userName);

  socket.on("chat-message", (data) => {
    appendMessage(`${data.mID}: ${data.message}`);
  });

  textarea.addEventListener("keydown", function (event) {
    if (event.which === 13 && event.shiftKey == false) {
      event.preventDefault();
      const message = textarea.value;
      appendMessage(`${userName} : ${message}`);
      socket.emit("send-chat-message", { message, cID, from, to });
      textarea.value = "";
    }
  });

  function appendMessage(message) {
    const messageElement = document.createElement("div");
    messageElement.setAttribute("class", "chat-message");
    messageElement.innerText = message;
    messages.append(messageElement);
    messages.lastElementChild.scrollIntoView({ behavior: "smooth" });
  }

  // Set default status
  const statusDefault = status.textContent;

  const setStatus = function (s) {
    status.textContent = s;
    if (s !== statusDefault) {
      const delay = setTimeout(function () {
        setStatus(statusDefault);
      }, 2000);
    }
  };

  // Get Status From Server
  socket.on("status", function (data) {
    // get message status
    setStatus(typeof data === "object" ? data.message : data);

    // If status is clear, clear text
    if (data.clear) {
      textarea.value = "";
    }
  });
})();
