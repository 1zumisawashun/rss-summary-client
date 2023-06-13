// import { getChatGptMessage } from "./helpers";

export const sendToSlack = (
  channelId?: string,
  thread_ts?: string,
  message?: any
) => {
  const url = process.env.SLACK_INCOMING_WEBHOOK;

  if (!url) return;

  const payload = JSON.stringify({
    token: process.env.BOT_USER_OAUTH_TOKEN,
    channel: channelId,
    text: JSON.stringify(message),
    thread_ts: thread_ts,
  });

  UrlFetchApp.fetch(url, {
    method: "post",
    contentType: "application/json",
    payload: payload,
  });
};

const getConversationsReplies = (channelId: string, ts: string) => {
  /**
   * 初めはreactions.getでリアクション（スタンプ）したメッセージを取得していたが
   * まるっと情報を取得するならconversations.historyの方が期待値に近いので採用。
   * しかしconversations.historyがアップデートに伴いconversations.repliesを使う必要があった。
   */
  const payload = {
    token: process.env.BOT_USER_OAUTH_TOKEN,
    channel: channelId,
    ts: ts,
    limit: 1,
    inclusive: true,
  };

  const response = UrlFetchApp.fetch(
    "https://slack.com/api/conversations.replies",
    {
      method: "post",
      contentType: "application/x-www-form-urlencoded",
      payload: JSON.stringify(payload),
    }
  );

  const conversationsHistory = JSON.parse(response as any);
  return conversationsHistory.messages[0];
};

const main = (e: any) => {
  const params = JSON.parse(e.postData.getDataAsString());

  // NOTE:SlackのEvent SubscriptionのRequest Verification用
  if (params.type === "url_verification") {
    return ContentService.createTextOutput(params.challenge);
  }

  const event = params.event;

  const subtype = event.subtype;
  const type = event.type;
  const user = event.user;

  // NOTE:Slack Botによるメンションを無視する（無限ループを回避する）
  if (subtype) return;

  // NOTE:Slackの3秒ルールで発生するリトライをキャッシュする
  const cache = CacheService.getScriptCache();
  if (cache.get(params.event_id) == "done") return;
  cache.put(params.event_id, "done", 600);

  // NOTE:以下からメインの処理

  // NOTE:ログをとる
  sendToSlack(undefined, undefined, user);

  if (["message"].includes(type)) {
    const channelId = event.channel;
    const thread_ts = event.thread_ts || event.ts;
    // NOTE:RSSの内容だけに反応させる
    sendToSlack(channelId, thread_ts, event);
  }

  if (["reaction_added"].includes(type)) {
    // NOTE:「要約して」スタンプだけに反応させる
    if (event.reaction !== "youyaku") return;

    const channelId = event.item.channel;
    const thread_ts = event.item.ts;

    // NOTE:スタンプを押下したメッセージ（単体）の内容を取得する
    const message = getConversationsReplies(channelId, thread_ts);
    sendToSlack(channelId, thread_ts, message);
  }

  return;
};

(global as any).doPost = main;
