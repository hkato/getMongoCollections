// 出力フォーマットを得る
const format = process.env.FORMAT || 'text';

// ヘッダー出力
if (format === 'csv') {
  print('Database,Collection,Index');
} else if (format === 'plantuml') {
  print('@startuml');
}

// データベース一覧を取得
const databases = db.adminCommand('listDatabases').databases;

// データベースをそれぞれ調べる
databases.forEach(database => {
  const dbName = database.name;

  // システムデータベースは無視する
  if (dbName === 'admin' || dbName === 'config' || dbName === 'local') {
    return;
  }

  // データベース名を表示
  if (format === 'csv') {
    print(`${dbName},,`);
  } else if (format === 'plantuml') {
    print(`database ${dbName} {`);
  } else {
    print(`Database: ${dbName}`);
  }

  // データベースを切り替え
  const currentDb = db.getSiblingDB(dbName);

  // コレクション一覧を取得
  const collections = currentDb.getCollectionNames();

  // コレクションを調べる
  collections.forEach(collection => {

    // コレクション名を表示
    if (format === 'csv') {
      print(`,${collection},`);
    } else if (format === 'plantuml') {
      print(`  folder ${collection} {`);
    } else {
      print(`  Collection: ${collection}`);
    }

    // インデックス一覧を取得
    const indexList = currentDb.getCollection(collection).getIndexKeys();

    // インデックスのヘッダーを表示(PlantUML)
    if (format === 'plantuml') {
      print(`    card ${collection.replaceAll("-", "_")}_index [`); // PlantUML対策
      print(`      Index`);
    }
    // 各インデックスに対して処理を行う
    indexList.forEach(index => {
      // インデックスを表示
      if (format === 'csv') {
        print(`,,"${JSON.stringify(index).replaceAll('"', '""')}"`);
      } else if (format === 'plantuml') {
        print(`      ....`)
        print(`      ${JSON.stringify(index)}`);
      } else {
        print(`    Index: ${JSON.stringify(index)}`);
      }
    });
    // コレクション終了(PlantUML)
    if (format === 'plantuml') {
      print(`    ]`);
      print(`  }`);
    }
  });
  // データベース終了(PlantUML)
  if (format === 'plantuml') {
    print('}');
  }
});

// フッター出力
if (format === 'plantuml') {
  print('@enduml');
}
