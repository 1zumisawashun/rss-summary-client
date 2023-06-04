const greeting = () => {
  //スクリプトプロパティに設定したOpenAIのAPIキーを取得
  const apiKey = process.env.CHAT_GPT_API_KEY;
  //ChatGPTのAPIのエンドポイントを設定
  const apiUrl = "https://api.openai.com/v1/chat/completions";
  //ChatGPTに投げるメッセージを定義(ユーザーロールの投稿文のみ)
  const messages = [
    { role: "user", content: "Google Apps Scriptの活用事例を教えてください" },
  ];
  //OpenAIのAPIリクエストに必要なヘッダー情報を設定
  const headers = {
    Authorization: "Bearer " + apiKey,
    "Content-type": "application/json",
    "X-Slack-No-Retry": 1,
  };
  //ChatGPTモデルやトークン上限、プロンプトをオプションに設定
  const options = {
    muteHttpExceptions: true,
    headers: headers,
    method: "POST",
    payload: JSON.stringify({
      model: "gpt-3.5-turbo",
      max_tokens: 1024,
      temperature: 0.9,
      messages: messages,
    }),
  } as any;
  //OpenAIのChatGPTにAPIリクエストを送り、結果を変数に格納
  const response = JSON.parse(
    UrlFetchApp.fetch(apiUrl, options).getContentText()
  );
  //ChatGPTのAPIレスポンスをログ出力
  console.log(response.choices[0].message.content);
};

const main = (e: any) => {
  const params = JSON.parse(e.postData.getDataAsString());

  // NOTE:SlackのEvent SubscriptionのRequest Verification用
  if (params.type === "url_verification") {
    return ContentService.createTextOutput(params.challenge);
  }

  // NOTE:Slack Botによるメンションを無視する
  if ("subtype" in params.event) return;

  // NOTE:Slackの3秒ルールで発生するリトライをキャッシュする
  const cache = CacheService.getScriptCache();

  if (cache.get(params.event.client_msg_id) == "done") return;

  cache.put(params.event.client_msg_id, "done", 600);

  // NOTE:以下からメインの処理
  greeting();

  return;
};

(global as any).doPost = main;
