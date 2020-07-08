---
templateKey: blog-post
title: 【swift】swift+node.jsでWebSocket
date: 2020-07-08T00:29:16.019Z
description: ---
featuredpost: true
featuredimage: /img/swift_logo.png
tags:
  - swift
  - websocket
---


# WebSocketとは...
- 双方向通信を低コストで行うための仕組みのこと
- 平たく言えばチャットとか、常に通信が開いたままの状態でサーバとやりとりするような通信方式の事
- `ws://`と`wss://`という通信スキーマを使っている。httpとhttpsのようなもの
- wsの挙動としては、まずhttpでハンドシェイクを行い、その後にwsにプロトコルを変更して通信する流れ
- もっと詳しくは以下の記事を参照
- https://qiita.com/chihiro/items/9d280704c6eff8603389

## 利用するライブラリ
- StarscreamやSwiftWebSocket、Socket.io-client-swift
等色々ある
- サーバ側がnode.jsの場合、基本的に`SocketIO`を使う模様
- そのため、node.jsとのやりとりが簡単にできるSocket.io-client-swiftを使う
- 参考）https://github.com/socketio/socket.io-client-swift

## 実装
### 1.node.jsでサーバ側のプログラムを作成
- 今回サーバーがnode.jsなのでnodeのインストールが必要ですが、省きます:sweat_smile:
- 適当なフォルダにsocket.ioをインストール

```
npm install socket.io
```

- 1秒ごとに、現在のサーバー時間をクライアントに送るプログラム
- "from_client"のイベントで送信された情報をコンソールに出力する

```websocket_server.js
var http = require("http");
var server = http.createServer(function(req,res) {
    res.write("Hello World!!");
    res.end();
});

// socket.ioの準備
var io = require('socket.io')(server);

// クライアント接続時の処理
io.on('connection', function(socket) {
    console.log("client connected!!")

    // クライアント切断時の処理
    socket.on('disconnect', function() {
        console.log("client disconnected!!")
    });
    // クライアントからの受信を受ける (socket.on)
    socket.on("from_client", function(obj){
        console.log(obj)
    });
});

// とりあえず一定間隔でサーバ時刻を"全"クライアントに送る (io.emit)
var send_servertime = function() {
    var now = new Date();
    io.emit("from_server", now.toLocaleString());
    console.log(now.toLocaleString());
    setTimeout(send_servertime, 1000)
};
send_servertime();

server.listen(8080);
```

- 以下のコマンドを実行する

```
node websocket_server.js
```

- 成功すれば毎秒ログが表示されます

### 2. アプリ側を実装
- Podfileに以下を記載し、```pod install``` でSocketIOをinstallする

```
pod 'Socket.IO-Client-Swift', '~> 15.2.0'
```

- 以下コーディング内容

```TestViewController.swift
import UIKit
import SocketIO

class TestViewController: UIViewController,UITableViewDataSource, UITableViewDelegate{

    let manager = SocketManager(socketURL: URL(string:"http://localhost:8080/")!, config: [.log(true), .compress])
    var socket : SocketIOClient!
    var dataList :NSMutableArray! = []

    @IBOutlet weak var testTableView: UITableView!
    @IBAction func tapButtonAction(_ sender: Any) {
        socket.emit("from_client", "button pushed!!")
    }
    @IBAction func reconnectButtonAction(_ sender: Any) {
        socket.connect()
    }
    @IBAction func desconnectButtonAction(_ sender: Any) {
        socket.disconnect()
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        testTableView.delegate = self
        testTableView.dataSource = self

        socket = manager.defaultSocket

        socket.on(clientEvent: .connect){ data, ack in
            print("socket connected!")
        }

        socket.on(clientEvent: .disconnect){data, ack in
            print("socket disconnected!")
        }

        socket.on("from_server"){data, ack in
            if let message = data as? [String]{
                print(message[0])
                self.dataList.insert(message[0],at: 0)
                self.testTableView.reloadData()
            }
        }
        socket.connect()
    }


    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return dataList.count
    }

    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = UITableViewCell(style: UITableViewCell.CellStyle.default, reuseIdentifier: "Cell")
        cell.textLabel?.text = dataList[indexPath.row] as? String;
        return cell
    }
}
```

- **localhostに繋ぎに行くため、ATSを許可しておく事**
- アプリを開いた段階でlocalhostとの通信が実行される
- `TapButton`を押すと、`from_client`にデータが乗ってサーバー側へ送られる。
- `websocket_server.js`の以下の部分がクライアントからの情報を受け取る

```
    // クライアントからの受信を受ける (socket.on)
    socket.on("from_client", function(obj){
        console.log(obj)
    });
```

- `disconnectButton`を押すとsocketをdisconnectする
- `reconnectButton`を押すと再度connectionを張る

## 成功すると、こんな感じ
![スクリーンショット 2020-04-02 16.29.08.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/425007/fee21ed8-d989-e865-88ee-efed51a41c99.png)

- ちゃんとアプリでの動作がサーバに反映されている
- disconnect、reconnectの動作が正常に動いているのがわかる

## 所感
- StarscreamやSwiftWebSocketは、websocketが繋がらない場合にpollingなどをする場合自前で書かなければならないらしい
- 今回はSocket.io-client-swiftを利用したが、これを使う場合はサーバも必ずSocket.ioを使う必要がある
- しかし、WebSocketが繋がらなかった時に代替手段としてLong Pollingやpollingを行ってくれるので、若干楽？
- 応用すれば様々なサービスで使えそう
