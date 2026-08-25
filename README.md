# 養成講座 修了試験対策 総合400問

Excelの全400問を取り込んだ、スマートフォン対応のReact + Vite製4択学習アプリです。

## 主な機能
- 4分野（基礎理論、キャリア理論、労働関連、自己理解・検査）の選択
- 10・25・50・100・全問から出題数を選択
- 問題順と選択肢順をランダム化
- 採点、正答率表示、誤答のみの復習
- GitHub Pagesへの自動公開

## GitHubだけで公開する手順
1. GitHubで `career-consultant-quiz-400` という公開リポジトリを新規作成します。
2. このフォルダ内のファイルを、フォルダ構成を保ったまま全部アップロードします。
3. リポジトリの `Settings` → `Pages` を開きます。
4. `Build and deployment` の `Source` を `GitHub Actions` に設定します。
5. `Actions` タブの処理が完了するとPagesで公開されます。

リポジトリ名を変更する場合は `vite.config.js` の `base` を `/<新しいリポジトリ名>/` に変更してください。

## PCで確認する場合
```bash
npm install
npm run dev
```

## データ
`src/data/questions.json` に400問が入っています。各問題は次の項目を持ちます。

`id`, `field`, `no`, `theme`, `question`, `options`, `answer`, `explanation`, `difficulty`, `format`

## 注意
問題・解説の内容はアップロードされたExcelをそのまま使用しています。外部公開前に、配布権限・著作権・法改正の影響がある設問を確認してください。
