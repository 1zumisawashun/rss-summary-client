// NOTE:RSSの中身、bot_idは全て同じなのか？
const rssObj = {
  type: "message",
  subtype: "bot_message",
  text: "Next.js & supabase & LangChainでAIがsakeをおすすめする『sake ai』作ってみた備忘録（後編）\n概要\n表題の通りで、日本酒が好きなので勉強がてら作ってみましたという話の後半戦です。\nhttps://github.com/moepyxxx/sake_ai\n色々と備忘録を残していたらめちゃくちゃ長くなってたので前後半にわけており、前半はどんな技術を使ったかや作ってみての所感（supabase Auth × Next.js Server Actions, postgreSQLのRLS, tailwindcssのUI周辺など）をまとめました。\nhttps://zenn.dev/moepyxxx/articles/c629c27c45d732\n引き続き実装の学びをつらつら書いていきます。...",
  ts: "1686751360.695789",
  username: "Zennの「Next.js」のフィード",
  icons: {
    image_36: "https://a.slack-edge.com/80588/img/services/rss_36.png",
    image_48: "https://a.slack-edge.com/80588/img/services/rss_48.png",
    image_72: "https://a.slack-edge.com/80588/img/services/rss_72.png",
  },
  bot_id: "B03GXHC7BMF",
  blocks: [
    {
      type: "rich_text",
      block_id: "WoWrM",
      elements: [
        {
          type: "rich_text_section",
          elements: [
            {
              type: "link",
              url: "https://zenn.dev/moepyxxx/articles/3486fe54cd8ce2",
              text: "Next.js & supabase & LangChainでAIがsakeをおすすめする『sake ai』作ってみた備忘録（後編）",
              unsafe: true,
            },
            {
              type: "text",
              text: "\n概要\n表題の通りで、日本酒が好きなので勉強がてら作ってみましたという話の後半戦です。\n",
            },
            { type: "link", url: "https://github.com/moepyxxx/sake_ai" },
            {
              type: "text",
              text: "\n色々と備忘録を残していたらめちゃくちゃ長くなってたので前後半にわけており、前半はどんな技術を使ったかや作ってみての所感（supabase Auth × Next.js Server Actions, postgreSQLのRLS, tailwindcssのUI周辺など）をまとめました。\n",
            },
            {
              type: "link",
              url: "https://zenn.dev/moepyxxx/articles/c629c27c45d732",
            },
            {
              type: "text",
              text: "\n引き続き実装の学びをつらつら書いていきます。...",
            },
          ],
        },
      ],
    },
  ],
  channel: "C05BZT995K8",
  event_ts: "1686751360.695789",
  channel_type: "channel",
};
