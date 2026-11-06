# NBA

自分用のスマホ向けNBAアプリ（PWA）です。推しチーム（初期値: ミネソタ・ティンバーウルブズ）の試合・順位・スタッツをまとめて見られます。

公開URL: https://zwjjpy677n-jpg.github.io/nba/

## 画面

- **ホーム**: 推しチームの試合中スコア、次の試合（日本時間）、直近5試合、順位、主力選手
- **試合**: 日付ごとの全試合スコア（試合中は30秒ごとに更新）。タップでボックススコア
- **順位**: 東西カンファレンスの順位表
- **スタッツ**: 選手検索、2人の比較、チーム成績
- **設定**（右上の⚙）: 推しチームの変更

データはESPNの非公開APIから直接取得しています（APIキー不要）。仕様が予告なく変わることがあります。

## スマホのホーム画面に追加する

- iPhone（Safari）: 公開URLを開く → 共有ボタン → 「ホーム画面に追加」
- Android（Chrome）: 公開URLを開く → メニュー → 「ホーム画面に追加」

## 公開の初回設定

1. GitHubのリポジトリ → Settings → Pages → Build and deployment の Source を「GitHub Actions」にする
2. `main` ブランチにマージ（push）すると、GitHub Actionsがテスト・ビルドして公開します

## 開発

```bash
npm install
npm run dev        # 開発サーバー
npm test           # 単体テスト（Vitest）
npm run e2e        # 画面テスト（Playwright、ESPNはフィクスチャで差し替え）
npm run build      # 本番ビルド
scripts/capture-fixtures.sh   # テスト用のESPN応答を取り直す
```
