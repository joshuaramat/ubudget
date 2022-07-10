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
    uploadTransaction();
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

function uploadTransaction() {
  // open a transaction in db
  const transaction = db.transaction(['new_transaction'], 'readwrite');

  // access object store
  const transactionObjectStore = transaction.objectStore('new_transaction');

  // get all records from store and assign to variable
  const getAll = transactionObjectStore.getAll();

  // successful .getAll() execution
  getAll.onsuccess = function() {
    // if there is is data in indexedDB store, send it to api server
    if (getAll.result.length > 0) {
      fetch('/api/transactions', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
         headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
         }
      })
      .then(response => response.json())
      .then(serverResponse => {
        if  (serverResponse.message) {
          throw new Error(serverResponse);
        }

        // open one more transaction
        const transaction =db.transaction(['new_transaction'], 'readwrite');

        // access new_transaction obejct store
        const transactionObjectStore = transaction.objectStore('new_transaction');

        // clear all items in store
        transactionObjectStore.clear();

        alert('All saved transactions have been submitted');
      })
      .catch(err => {
        console.log(err)
      });
    }
  };
}

// listen for app coming back online
window.addEventListener('online', uploadTransaction);