# rss-summary-client

rss-summary-client

## Overview

- Slack RSS Appの要約をスレッドに投稿します。
- Slack RSS App以外に「要約して！」スタンプを押したメッセージの要約をスレッドに投稿することも可能です。
- 要約するためにChatGPTを使用しています。

## Installation

- clone

```bash
$ git clone git@github.com:1zumisawashun/rss-summary-client.git
$ cd rss-summary-client
```

- install

```bash
$ yarn install
```
- copy

```bash
$ cp .env.example .env2
$ cp .clasp.example.json .clasp.json
```

- 上記の手順で失敗する場合 [Troubleshoot](#Troubleshoot)を確認してください

## How to

- deployする

```bash
$ yarn deploy
```

- linterを当てる

```bash
$ yarn lint:fix
```

## Troubleshoot

- なし

