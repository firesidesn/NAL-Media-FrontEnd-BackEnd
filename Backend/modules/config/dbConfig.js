let admin = require("firebase-admin");
let serviceAccount = require("./firebaseServiceAccount.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://nal-media.firebaseio.com",
});

let db = admin.firestore();

//Add Data
async function addData(collectionName, data) {
  const accountRef = db.collection(collectionName);
  await accountRef.add(data);
}

//Get Data
async function getData(collectionName) {
  const accountRef = db.collection(collectionName);
  let data = await accountRef.get();
  let allData = [];
  data.forEach((record) => {
    info = record.data();
    response = { id: record.id, info: info };
    allData.push(response);
  });
  return allData;
}

//Update Data
async function updateData(collectionName, recordID, updatedData) {
  const accountRef = db.collection(collectionName);
  await accountRef.doc(recordID).update(updatedData);
}

//Delete Data
async function removeData(collectionName, recordID) {
  const accountRef = db.collection(collectionName);
  await accountRef.doc(recordID).delete();
}

//Set Custom ID
async function setData(collectionName, customID, data) {
  const accountRef = db.collection(collectionName);
  await accountRef.doc(customID).set(data);
}

// Compare and Query Data
async function compareAndQueryData(collectionName, searchOn, searchFor) {
  const accountRef = db.collection(collectionName).where(searchOn, "==", searchFor);
  let data = await accountRef.get();
  let allData = [];
  data.forEach((record) => {
    info = record.data();
    response = { id: record.id, info: info };
    allData.push(response);
  });
  return allData;
}

//Compare, Sort and Limit Data
async function compareAndSortData(collectionName, searchOn, searchFor, orderBy, order, limit) {
  const accountRef = db
    .collection(collectionName)
    .where(searchOn, "==", searchFor)
    .orderBy(orderBy, order)
    .limit(limit);

  let data = await accountRef.get();
  let allData = [];
  data.forEach((record) => {
    info = record.data();
    response = { id: record.id, info: info };
    allData.push(response);
  });
  return allData;
}

//Compare, Sort and Limit Data
async function sortData(collectionName, orderBy, order, limit) {
  const accountRef = db.collection(collectionName).orderBy(orderBy, order).limit(limit);

  let data = await accountRef.get();
  let allData = [];
  data.forEach((record) => {
    info = record.data();
    response = { id: record.id, info: info };
    allData.push(response);
  });
  return allData;
}

//Query Data based on ID
async function queryByID(collectionName, recordID) {
  const accountRef = db.collection(collectionName).doc(recordID);
  let data = await accountRef.get();
  return data.data();
}

//Query Data based on Multiple Condition
async function multipleQuery(collectionName, firstSearchOn, firstSearchFor, secondSearchOn, secondSearchFor) {
  const accountRef = db
    .collection(collectionName)
    .where(firstSearchOn, "==", firstSearchFor)
    .where(secondSearchOn, "==", secondSearchFor);
  let data = await accountRef.get();
  let allData = [];
  data.forEach((record) => {
    info = record.data();
    response = { id: record.id, info: info };
    allData.push(response);
  });
  return allData;
}

// Compare Inequality and Query Data
async function compareInequalityAndQueryData(collectionName, fSearchOn, fSearchFor, sSearchOn, sSearchFor) {
  const accountRef = db
    .collection(collectionName)
    .where(fSearchOn, "==", fSearchFor)
    .where(sSearchOn, ">=", sSearchFor);
  let data = await accountRef.get();
  let allData = [];
  data.forEach((record) => {
    info = record.data();
    response = { id: record.id, info: info };
    allData.push(response);
  });
  return allData;
}

module.exports = {
  addData,
  getData,
  updateData,
  removeData,
  setData,
  compareAndQueryData,
  queryByID,
  multipleQuery,
  compareAndSortData,
  sortData,
  compareInequalityAndQueryData,
};
