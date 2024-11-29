#  SmellLink
スメルセンス（においセンサー）のデータを WiFi 経由で転送するアプリケーション 
## 使用方法
### 環境設定ファイル
`..\data\config.json`
```
{
    "ssid": "ssid", 
    "password": "password",
    "ip": "xxx.xxx.xxx.xxx",
    "port": 10000,
    "interval": 2000,
    "lcdVisible": true
}
```
### 環境設定ファイルのアップロード
以下をプロジェクトフォルダ内で実行する 
```
platformio run --target uploadfs
```

## 改版履歴
ver 0.1.0 プログラムのたたき台（SPI通信は仮に 気圧センサBME280 を使用） 
 
## ライセンス
