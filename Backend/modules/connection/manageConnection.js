const { getData, queryByID, multipleQuery } = require("../config/dbConfig");

async function allMembers(currMemID) {
  let members = await getData("users");
  let membersArr = [];
  members.forEach((member) => {
    if (member.id !== currMemID) membersArr.push(member);
  });
  return membersArr;
}

async function allActiveMembers(currMemID) {
  let members = await getData("users");
  let membersArr = [];
  members.forEach((member) => {
    if (member.id !== currMemID && member.info.status === "active" && member.info.type !== "Admin")
      membersArr.push(member);
  });
  return membersArr;
}

async function newRequest(currMemID) {
  let newReq = [];
  let requests = await multipleQuery("Connections", "friendID", currMemID, "status", "0");
  for (let i = 0; i < requests.length; i++) {
    let info = await queryByID("users", requests[i].info.memberID);
    newReq.push({ id: requests[i].id, info });
  }
  return newReq;
}

async function sentRequest(currMemID) {
  let sentReq = [];
  let requests = await multipleQuery("Connections", "memberID", currMemID, "status", "0");
  for (let i = 0; i < requests.length; i++) {
    let info = await queryByID("users", requests[i].info.friendID);
    sentReq.push({ id: requests[i].id, info });
  }
  return sentReq;
}

async function acceptedReq(currMemID) {
  let connections = [];
  let connectedMembers = [];
  //Requests that are sent and accepted.
  let sentAndAccepted = await multipleQuery("Connections", "memberID", currMemID, "status", "1");
  for (let i = 0; i < sentAndAccepted.length; i++) {
    connections.push({ id: sentAndAccepted[i].id, connectionID: sentAndAccepted[i].info.friendID });
  }
  //Requests that are received and accepted.
  let receivedAndAccepted = await multipleQuery("Connections", "friendID", currMemID, "status", "1");
  for (let j = 0; j < receivedAndAccepted.length; j++) {
    connections.push({ id: receivedAndAccepted[j].id, connectionID: receivedAndAccepted[j].info.memberID });
  }
  //Get Info of all matching members
  for (let k = 0; k < connections.length; k++) {
    let info = await queryByID("users", connections[k].connectionID);
    connectedMembers.push({ id: connections[k].id, info, memberID: connections[k].connectionID });
  }
  return connectedMembers;
}

async function isPending(currMemID, friendID) {
  let requests = await multipleQuery("Connections", "friendID", currMemID, "status", "0");
  for (let i = 0; i < requests.length; i++) {
    if (requests[i].info.memberID === friendID) return requests[i].id;
  }
  return false;
}

async function isSent(currMemID, friendID) {
  let requests = await multipleQuery("Connections", "memberID", currMemID, "status", "0");
  for (let i = 0; i < requests.length; i++) {
    if (requests[i].info.friendID === friendID) return requests[i].id;
  }
  return false;
}

async function isFriend(currMemID, friendID) {
  let count = 0;
  //Requests that are sent and accepted.
  let sentAndAccepted = await multipleQuery("Connections", "memberID", currMemID, "status", "1");
  for (let i = 0; i < sentAndAccepted.length; i++) {
    if (friendID === sentAndAccepted[i].info.friendID) return sentAndAccepted[i].id;
  }
  //Requests that are received and accepted.
  let receivedAndAccepted = await multipleQuery("Connections", "friendID", currMemID, "status", "1");
  for (let j = 0; j < receivedAndAccepted.length; j++) {
    if (friendID === receivedAndAccepted[j].info.memberID) return receivedAndAccepted[j].id;
  }
  return false;
}

module.exports = { allMembers, allActiveMembers, newRequest, sentRequest, acceptedReq, isPending, isSent, isFriend };
