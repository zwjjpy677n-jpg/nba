# NBA PWA 設計書

- 日付: 2026-11-06
- 状態: レビュー待ち

## 1. 目的と前提

自分用の、スマホで使うNBAアプリ。次の3つを1つのアプリでできるようにする。

1. 試合速報・結果（スコア、日程、順位表）
2. 選手・チームのスタッツ検索と比較
3. 推しチーム（初期値: ミネソタ・ティンバーウルブズ）の追跡

### 決まっていること（ユーザー回答）
- 利用者は本人のみ。スマホで使う
- 形式は PWA（ブラウザで開いて「ホーム画面に追加」）
- 推しチームの初期値はウルブズ（ESPN略称 `min`）

### 前提（確認済み）
- 表示は日本語、時刻は日本時間（Asia/Tokyo）
- ログイン・サーバーなし。設定は端末内に保存
- 速報は数十秒間隔の自動更新で足りる。プッシュ通知はしない
- データ源は ESPN の非公開API（無料・キー不要）。`access-control-allow-origin: *` が返ることを確認済みで、ブラウザから直接呼べる

### 対象外（YAGNI）
- プッシュ通知、ログイン、複数端末での同期
- プレーオフのトーナメント表、ニュース、動画
- 過去シーズンの成績の閲覧（今季のみ）
- 英語表示への切り替え

## 2. 技術構成

- React 18 + TypeScript + Vite
- `vite-plugin-pwa`（manifest と Service Worker）
- TanStack Query（取得・キャッシュ・自動更新）
- React Router（HashRouter。GitHub Pages で再読み込みしても 404 にならないようにするため）
- テスト: Vitest（データ変換・ロジック）、Playwright（スマホの画面サイズでのE2E）
- 公開: GitHub Actions で GitHub Pages にデプロイ

## 3. 画面構成

画面下に4つのタブを置く。右上の歯車から設定画面を開く。

### 3.1 ホーム（推しチーム）
- 次の試合: 対戦相手、日本時間の日時、ホーム/アウェイ
- 試合中ならライブスコア（30秒ごとに更新）
- 直近5試合の結果（勝敗、スコア）
- カンファレンス順位と勝敗
- 主力選手の今季成績（ロスターから平均得点の上位5人）

### 3.2 試合
- 日付ごとの全試合のスコアカード一覧。前日・翌日ボタンで切り替え。初期表示は日本時間の今日
- その日に試合中のものがあれば30秒ごとに自動更新
- カードをタップすると試合詳細へ: クォーター別スコアと、両チームの選手別ボックススコア（出場時間、得点、リバウンド、アシストなど）

### 3.3 順位
- 東・西カンファレンスの切り替え。列は順位、チーム、勝、敗、勝率、ゲーム差、連勝・連敗
- 推しチームの行を強調表示

### 3.4 スタッツ
- 選手名で検索し、結果から選手を選ぶと今季成績（試合数、出場時間、得点、リバウンド、アシスト、スティール、ブロック、FG%、3P%、FT%）を表示
- 比較: 選手を2人選び、主要項目を横棒で並べる
- チーム成績: チームを選ぶと今季のチーム平均成績を表示

### 3.5 設定
- 推しチームの選択（30チーム）。初期値は `min`

## 4. ディレクトリ構成

```
src/
  api/          ESPN呼び出しとデータ変換（ESPNの形を知っているのはここだけ）
    client.ts   fetch の共通処理（タイムアウト、エラー型）
    scoreboard.ts / standings.ts / team.ts / player.ts / game.ts
    types.ts    アプリ内で使う型（Game, StandingRow, PlayerStats など）
  hooks/        TanStack Query のフック（useScoreboard など）
  screens/      Home / Games / GameDetail / Standings / Stats / Settings
  components/   ScoreCard, StandingsTable, CompareBars, ErrorState, StaleBadge など
  lib/          日付（日本時間）、数値の書式、設定の保存
tests/
  fixtures/     本物のESPNの返却データを保存したJSON
  e2e/          Playwright
```

## 5. データ源（ESPNエンドポイント）

| 用途 | エンドポイント |
|---|---|
| 日付別の試合 | `site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=YYYYMMDD` |
| 試合詳細 | `site.api.espn.com/apis/site/v2/sports/basketball/nba/summary?event={id}` |
| 順位 | `site.api.espn.com/apis/v2/sports/basketball/nba/standings` |
| チーム一覧 | `site.api.espn.com/apis/site/v2/sports/basketball/nba/teams` |
| チーム日程 | `site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/{abbr}/schedule` |
| ロスター | `site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/{abbr}/roster` |
| チーム成績 | `site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/{abbr}/statistics` |
| 選手検索 | `site.web.api.espn.com/apis/common/v3/search?query=...&type=player&sport=basketball&league=nba` |
| 選手成績 | `site.web.api.espn.com/apis/common/v3/sports/basketball/nba/athletes/{id}/overview` |
| ロゴ・顔写真 | `a.espncdn.com` |

日付の扱い: ESPNの `dates` パラメータは米国の日付。日本時間の「今日」を選んだときは、その日本時間の日付に始まる試合をまとめて表示する。具体的には、米国日付の前日分と当日分を取得し、開始時刻を日本時間に変換して絞り込む。

## 6. データの流れとキャッシュ

- 画面 → `hooks/` → `api/` → ESPN の一方向
- `api/` は ESPN の返却データをアプリ内の型（`types.ts`）に変換して返す。画面は ESPN の形を知らない
- キャッシュ時間の目安:
  - 試合中のスコアボード・試合詳細: 30秒ごとに再取得
  - 試合中でないスコアボード: 5分
  - 順位、チーム日程、選手成績: 30分
  - チーム一覧、ロスター: 24時間
- アプリを再び表示したときに再取得する（TanStack Query の既定の動作）
- 推しチームは localStorage に保存。読み書きに失敗した場合は初期値 `min` を使う

## 7. エラー時の扱い

- オフライン: Service Worker が最後に成功した API 応答を返す（NetworkFirst）。画面には「◯分前の情報」のバッジを出す
- 取得失敗: 画面またはセクションごとに `ErrorState`（「読み込めませんでした」と再試行ボタン）を出す。ほかのタブには影響させない
- データの形が想定と違う: 変換処理は欠けた項目を `null` にし、画面では「—」と表示する。例外で画面全体を落とさない
- 画面ごとに ErrorBoundary を置き、想定外の例外はその画面の中だけで受け止める

## 8. テスト方針

- `api/` の変換処理: 保存した本物の ESPN 返却データ（`tests/fixtures/`）を入力にした Vitest の単体テスト。項目が欠けたデータでも落ちないことも確認する
- `lib/` の日付・書式処理: 単体テスト（日本時間への変換と日付またぎ）
- E2E: Playwright でスマホの画面サイズ（iPhone 相当）にして、ネットワークをフィクスチャで差し替え、4タブの表示、試合詳細への遷移、選手比較、推しチームの変更を確認する
- 最後に本物の API でスモークテストを行い、画面を確認する

## 9. 公開

- `main` への push で GitHub Actions がビルドし、GitHub Pages に公開する
- Vite の `base` はリポジトリ名（`/nba/`）
- 初回のみ、ユーザーがリポジトリ設定で Pages の公開元を「GitHub Actions」にする
- 利用者はスマホで公開URLを開き、「ホーム画面に追加」する

## 10. リスク

- ESPN の非公開APIは予告なく変わる可能性がある。影響は `api/` に閉じ込め、フィクスチャのテストで変換処理を守る
- シーズン外（オフシーズン）は試合データが空になる。空のときの表示（「この日の試合はありません」など）を用意する
