// indexedDBの名前などの設定
const dbName = "kakeiboDB";
const storeName = "kakeiboStore";
const dbVersion = 1;


// データベース接続。データベースが未作成なら新規作成
let database = indexedDB.open(dbName, dbVersion);

// データベースとオブジェクトストアの作成
database.onupgradeneeded = (event) => {
  let db = event.target.result;
  db.createObjectStore(storeName, {keyPath: "id"});
}

// データベースに接続に成功した時に発生するイベント
database.onsuccess = (event) => {
  let db = event.target.result;
  // 接続を解除する
  db.close;
  console.log("データベースに接続できました");
}
database.onerror = (event) => {
  console.log("データベースに接続できませんでした");
}
