const { queryByID, compareAndSortData, sortData, compareInequalityAndQueryData } = require("../config/dbConfig");
const { acceptedReq } = require("../connection/manageConnection");

//Get Unique Objects from an Array:
uniqueArray = (a) => [...new Set(a.map((o) => JSON.stringify(o)))].map((s) => JSON.parse(s));

//Get Recently posted Jobs unapplied jobs
async function getRecentJobs(userID) {
  const jobs = await sortData("jobs", "date", "desc", 5);
  const oldDate = new Date().setDate(new Date().getDate() - 90); //date timestamp of 90 days ago
  const appliedJobs = await compareInequalityAndQueryData("appliedJobs", "creativeID", userID, "date", oldDate);
  const recentJobs = [];
  for (let i = 0; i < jobs.length; i++) {
    for (let j = 0; j < appliedJobs.length; j++) {
      if (jobs[i].id !== appliedJobs[j].info.jobID) {
        postedBy = await queryByID("users", jobs[i].info.postedBy);
        data = {
          jobID: jobs[i].id,
          postedBy: jobs[i].info.postedBy,
          Name: postedBy.firstName + " " + postedBy.lastName,
          title: jobs[i].info.title,
          date: jobs[i].info.date,
        };
        recentJobs.push(data);
      }
    }
  }
  return recentJobs;
}

//Get recently made connections of connection and recently posted Portfolio of Connections
async function getRecentConnAndPortfolio(userID) {
  const recentConnections = await compareAndSortData("Connections", "status", "1", "date", "desc", 5);
  const portfolios = await sortData("creativePortfolio", "date", "desc", 5);
  const myConnections = await acceptedReq(userID);
  const connections = [];
  const intersection = [];

  for (let j = 0; j < myConnections.length; j++) {
    //Get recently made connections of my connections
    for (let i = 0; i < recentConnections.length; i++) {
      if (
        //check if my connections has made any recent connections
        myConnections[j].memberID === recentConnections[i].info.memberID ||
        myConnections[j].memberID === recentConnections[i].info.friendID
      ) {
        //check if that recent connection is myself
        if (recentConnections[i].info.memberID === userID || recentConnections[i].info.friendID === userID) continue;
        else {
          //if that is not me find who it is and push to array
          if (myConnections[j].memberID === recentConnections[i].info.memberID) {
            mutualConnection = await queryByID("users", recentConnections[i].info.friendID);
            id = recentConnections[i].info.friendID;
          } else if (myConnections[j].memberID === recentConnections[i].info.friendID) {
            mutualConnection = await queryByID("users", recentConnections[i].info.memberID);
            id = recentConnections[i].info.memberID;
          }
          let data = {
            friend: myConnections[j].info.firstName + " " + myConnections[j].info.lastName,
            friendID: myConnections[j].memberID,
            mutualFriend: mutualConnection.firstName + " " + mutualConnection.lastName,
            mutualFriendID: id,
            date: recentConnections[i].info.date,
          };
          connections.push(data);
        }
      }
    }
    //Get recently posted Portfolio of Connections
    for (let k = 0; k < portfolios.length; k++) {
      if (myConnections[j].memberID === portfolios[k].info.postedBy) {
        data = {
          firstName: myConnections[j].info.firstName,
          lastName: myConnections[j].info.lastName,
          userID: myConnections[j].memberID,
        };
        intersection.push(data);
      }
    }
  }
  return [uniqueArray(intersection), connections];
}

async function userFeed(userID) {
  const jobs = await getRecentJobs(userID);
  const connAndPortfolio = await getRecentConnAndPortfolio(userID);
  const data = {
    jobs: jobs,
    portfolio: connAndPortfolio[0],
    mutualConnection: connAndPortfolio[1],
  };
  return data;
}

module.exports = { userFeed };
