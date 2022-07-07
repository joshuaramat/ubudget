// db variable will hold database connection
let db;

// request establishes connection to IndexedDB database called 'uBudget'
const request = indexedDB.open('uBudget', 1);

// This event will emit if database version changes
request.onupgradeneeded = function(event) {
  // save reference to database
  const db = event.target.result;

  // create object store called 'new transaction' set it to auto-increment index primary key to sort
  db.createObjectStore('new transaction', { autoIncrement: true });
};

// successful request
request.onsuccess = function(event) {
  // save reference to global variable when db is successfully created with its object store from onupgradeneeded event or when connection is established 
  db = event.target.result;

  // check that app is online, if yes run uploadTransaction() function to send local data to api
  if (navigator.online) {
    // uploadTransaction();
  }
};

request.onerror = function(event) {
  // log error here
  console.log(event.target.errorCode);
};

// function will execute if submission attempted with no internet connection
function saveRecord(record) {
  // open new transaction with database with read/write permissions
  const transaction = db.transaction(['new_transaction'], 'readwrite');

  // accessing object store
  const transactionObjectStore = transaction.objectStore('new_transaction');

  // add record to store
  transactionObjectStore.add(record);
}