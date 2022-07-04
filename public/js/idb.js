let db;

const request = indexedDB.open('uBudget', 1);

request.onupgradeneeded = function(event) {
  const db = event.target.result;

  db.createObjectStore('new transaction', { autoIncrement: true });
};