// indexedDBの名前などの設定
const dbName = "kakeiboDB";
const storeName = "kakeiboStore";
const dbVersion = 1;


// データベース接続。データベースが未作成なら新規作成
const database = indexedDB.open(dbName, dbVersion);

// データベースとオブジェクトストアの作成
database.onupgradeneeded = (event) => {
  let db = event.target.result;
  db.createObjectStore(storeName, {keyPath: "id"});
}

// データベースに接続に成功した時に発生するイベント
database.onsuccess = (event) => {
  let db = event.target.result;
  // 接続を解除する
  db.close();
  console.log("データベースに接続できました");
}
database.onerror = (event) => {
  console.log("データベースに接続できませんでした");
}

// フォームの内容をDBに登録する
const regist = () => {
  if (!inputCheck()) {
    return;
  }

  // ラジオボタンの取得
  let radios = document.getElementsByName("balance");
  let balance;
  for (let radio of radios) {
    if (radio.checked) {
      balance = radio.value;
      break;
    }
  }

  // フォームに入力された値を取得
  let date = document.getElementById("date").value;
  let category = document.getElementById("category").value;
  let amount = document.getElementById("amount").value;
  let memo = document.getElementById("memo").value;
  // ラジオボタンが収入を選択時はカテゴリを「収入」とする
  if (balance === "収入") {
    category = balance;
  }

  // データベースにデータを登録する
  insertData(balance, date, category, amount, memo);
}

// データの挿入
const insertData = (balance, date, category, amount, memo) => {
  // 一意のIDを現在の日時から作成
  let uniqueID = new Date().getTime().toString();
  console.log(uniqueID);

  // DBに登録するための連想配列のデータ作成
  let data = {
    id: uniqueID,
    balance: balance,
    date: String(date),
    category: category,
    amount: amount,
    memo: memo,
  }

  // データベースを開く
  const database = indexedDB.open(dbName, dbVersion);

  // データベースの開なかった時の処理
  database.onerror = (event) => {
    console.log("データベースに接続できませんでした");
  }

  // データベースを開いたらデータの登録を実行
  database.onsuccess = (event) => {
    let db = event.target.result;
    let transaction = db.transaction(storeName, "readwrite");
    transaction.oncomplete = (event) => {
      console.log("トランザクション完了");
    }
    transaction.onerror = (event) => {
      console.log("トランザクションエラー");
    }

    const store = transaction.objectStore(storeName);
    let addData = store.add(data);
    addData.onsuccess = () => {
      console.log("データが登録できました");
      // 入出金一覧を作成
      createList();
    }
    addData.onerror = () => {
      console.log("データが登録できませんでした");
    }
    db.close();
  }
}

const createList = () => {
  const database = indexedDB.open(dbName, dbVersion);
  database.onsuccess = (event) => {
    let db = event.target.result;
    let transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);
    store.getAll().onsuccess = (data) => {
      console.log(data);
      let rows = data.target.result;

      let section = document.getElementById("list");
      // 入出金一覧のテーブルを作成
      let table = `
        <table>
          <thead>
            <tr>
              <th>日付</th>
              <th>収支</th>
              <th>カテゴリ</th>
              <th>金額</th>
              <th>メモ</th>
              <th>削除</th>
            </tr>
          </thead>
          <body>
      `;

      // 入出金のデータを表示
      rows.forEach((element) => {
        console.log(element);
        table += `
          <tr>
            <td>${element.date}</td>
            <td>${element.balance}</td>
            <td>${element.category}</td>
            <td>${element.amount}</td>
            <td>${element.memo}</td>
            <td><button onclick="deleteData('${element.id}');">x</button></td>
          </tr>
        `;
      });
      table += `
          </tbody>
        </table>
      `;
      section.innerHTML = table;
    }
  }
}

// データの削除
const deleteData = (id) => {
  const database = indexedDB.open(dbName, dbVersion);
  database.onupgradeneeded = (event) => {
    let db = event.target.result;
  }
  database.onsuccess = (event) => {
    let db = event.target.result;
    let transaction = db.transaction(storeName, "readwrite");
    transaction.oncomplete = (event) => {
      console.log("トランザクション完了");
    }
    transaction.onerror = (event) => {
      console.log("トランザクションエラー");
    }
    const store = transaction.objectStore(storeName);

    // idは文字列(データベースに登録したものと同じ型)を入力
    let deleteData = store.delete(id);
    deleteData.onsuccess = (event) => {
      console.log(`削除成功${id}`);
      createList();
    }
    deleteData.onerror = (event) => {
      console.log("削除失敗");
    }
    db.close();
  }
  // データベースの開なかった時の処理
  database.onerror = (event) => {
    console.log("データベースに接続できませんでした");
  }
}
