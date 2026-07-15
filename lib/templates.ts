export interface ExpressionTemplate {
  key: string;
  tips: string[];
  skeleton: string | null;
}

// Each locale has its own template set with localized names/descriptions/tips
// Structure: templatesByLocale[locale][templateKey]
// The "name" and "description" come from the dictionary's `templates.scenes` section

const tips = {
  daily_life: {
    zh: [
      "简单描述时间、地点和场景",
      "说明你和谁在一起或做了什么",
      "补充你的感受或想法",
      "如果有后续，简单提一句",
      "使用日常自然的语气",
    ],
    en: [
      "Briefly describe the time, place, and setting",
      "Mention who you were with or what you did",
      "Add your feelings or thoughts",
      "If there's a follow-up, briefly mention it",
      "Use a natural, everyday tone",
    ],
    ja: [
      "時間、場所、状況を簡単に説明する",
      "誰といたか、何をしたかを書く",
      "自分の気持ちや考えを補足する",
      "続きがあれば一言添える",
      "日常的で自然なトーンを使う",
    ],
  },
  work: {
    zh: [
      "说明发消息的背景和目的",
      "清晰地表达你的工作需求或建议",
      "补充相关的截止时间或条件",
      "提供对方需要的必要信息",
      "使用得体的商务语气",
    ],
    en: [
      "State the context and purpose of your message",
      "Clearly express your work request or suggestion",
      "Add relevant deadlines or conditions",
      "Provide necessary information the recipient needs",
      "Use an appropriate business tone",
    ],
    ja: [
      "メッセージの背景と目的を説明する",
      "仕事の要件や提案を明確に伝える",
      "関連する締切や条件を補足する",
      "相手が必要とする情報を提供する",
      "適切なビジネストーンを使う",
    ],
  },
  request_help: {
    zh: [
      "简单说明当前情况",
      "清楚说明需要什么帮助",
      "补充时间或条件",
      "使用符合关系和场合的语气",
      "表达感谢",
    ],
    en: [
      "Briefly explain your current situation",
      "Clearly state what help you need",
      "Add timing or conditions",
      "Use a tone appropriate to the relationship and setting",
      "Express gratitude",
    ],
    ja: [
      "現在の状況を簡単に説明する",
      "どのような助けが必要かを明確に書く",
      "時間や条件を補足する",
      "関係性や場面に合ったトーンを使う",
      "感謝の気持ちを伝える",
    ],
  },
  apology: {
    zh: [
      "先表达歉意",
      "清楚说明需要道歉的事情",
      "解释原因但不找借口",
      "提出弥补或改进的方法",
      "表达今后会注意的态度",
    ],
    en: [
      "Start by expressing your apology",
      "Clearly state what you're apologizing for",
      "Explain the reason without making excuses",
      "Suggest how to make amends or improve",
      "Express your intention to be more careful going forward",
    ],
    ja: [
      "まず謝罪の言葉を述べる",
      "謝罪する内容を明確に説明する",
      "言い訳にならないように理由を説明する",
      "改善策や埋め合わせを提案する",
      "今後気をつける姿勢を伝える",
    ],
  },
  gratitude: {
    zh: [
      "说明对方做了什么，你因此受益",
      "说明这件事为什么对你意义重大",
      "提及对方为此付出的努力",
      "可适当表达回报的意愿",
      "保持真诚自然的语气",
    ],
    en: [
      "Describe what the person did and how it benefited you",
      "Explain why this mattered to you",
      "Acknowledge the effort they put in",
      "Optionally express your willingness to return the favor",
      "Keep a sincere and natural tone",
    ],
    ja: [
      "相手が何をしてくれて、自分がどう助かったかを書く",
      "そのことが自分にとってなぜ大切かを説明する",
      "相手の努力に触れる",
      "お返ししたい気持ちを適宜伝える",
      "誠実で自然なトーンを保つ",
    ],
  },
  invitation: {
    zh: [
      "说明邀请的事项（时间、地点、活动）",
      "简要说明为什么要邀请对方",
      "给对方留出方便的余地",
      "提供必要的联系方式或确认方式",
      "保持友好热情的语气",
    ],
    en: [
      "State the details (time, place, activity)",
      "Briefly explain why you're inviting them",
      "Leave room for their convenience",
      "Provide contact info or way to confirm",
      "Keep a friendly and warm tone",
    ],
    ja: [
      "招待の詳細（時間、場所、内容）を伝える",
      "なぜ招待するのかを簡単に説明する",
      "相手の都合を気遣う余白を残す",
      "連絡先や確認方法を伝える",
      "親しみやすく温かいトーンを保つ",
    ],
  },
  refusal: {
    zh: [
      "先表达感谢或理解对方的好意",
      "委婉说明无法接受的原因",
      "避免过于直接或冷漠",
      "如果合适，提一个替代方案",
      "结尾保持友好",
    ],
    en: [
      "Start by expressing thanks or acknowledging their goodwill",
      "Gently explain why you can't accept",
      "Avoid being too direct or cold",
      "If appropriate, suggest an alternative",
      "End on a friendly note",
    ],
    ja: [
      "まず感謝や相手の好意への理解を示す",
      "受けられない理由を柔らかく説明する",
      "直接的すぎたり冷たくなったりしない",
      "適切であれば代替案を提案する",
      "友好的に締めくくる",
    ],
  },
  self_intro: {
    zh: [
      "介绍姓名和简单的身份背景",
      "说明当前的学习或工作状态",
      "如果是语言交换，说明你的语言水平和目标",
      "补充一两个兴趣爱好",
      "以友好的语气结尾",
    ],
    en: [
      "Introduce your name and brief background",
      "State your current study or work situation",
      "For language exchange, mention your level and goals",
      "Add one or two interests or hobbies",
      "End with a friendly tone",
    ],
    ja: [
      "名前と簡単な背景を紹介する",
      "現在の学習や仕事の状況を伝える",
      "言語交換の場合は、レベルと目標を書く",
      "趣味や関心を1〜2つ補足する",
      "友好的なトーンで締めくくる",
    ],
  },
  social_media: {
    zh: [
      "一个吸引人的开头",
      "你的主要内容或观点",
      "适当使用感叹、表情或语气词",
      "如果需要互动，提一个小问题",
      "添加相关的话题标签",
    ],
    en: [
      "An engaging opening line",
      "Your main content or opinion",
      "Use appropriate exclamations or emojis",
      "If you want engagement, ask a small question",
      "Add relevant hashtags",
    ],
    ja: [
      "目を引く書き出し",
      "メインの内容や意見",
      "適度に感嘆符や絵文字を使う",
      "交流したい場合は小さな質問を投げかける",
      "関連するハッシュタグを追加する",
    ],
  },
};

const skeletons: Record<string, Record<string, string | null>> = {
  daily_life: {
    zh: "今日は○○に行ってきました。\n\n○○に着いてすぐ、\n\nそのあと、\n\nとても楽しかったです。",
    en: "Today I went to [place/event].\n\nWhen I arrived,\n\nThen I [what happened].\n\nIt was a great day!",
    ja: "今日は○○に行ってきました。\n\n○○に着いてすぐ、\n\nそのあと、\n\nとても楽しかったです。",
  },
  work: {
    zh: "○○さん\n\nお世話になっております。\n\n○○の件について、\n\nご確認のほどよろしくお願いいたします。",
    en: "Hi [Name],\n\nRegarding [topic],\n\nI'd like to [request/confirm/discuss]...\n\nPlease let me know your thoughts.\n\nThanks,\n[Your name]",
    ja: "○○さん\n\nお世話になっております。\n\n○○の件について、\n\nご確認のほどよろしくお願いいたします。",
  },
  request_help: {
    zh: "○○さん\n\n今、○○について困っています。\n\n具体的には、\n\nもし可能でしたら、助けていただけると嬉しいです。\n\nよろしくお願いします。",
    en: "Hi [Name],\n\nI'm having trouble with [situation].\n\nSpecifically, I need help with:\n\nIf you could assist, I'd really appreciate it.\n\nThank you!",
    ja: "○○さん\n\n今、○○について困っています。\n\nもし可能でしたら、助けていただけると嬉しいです。\n\nよろしくお願いします。",
  },
  apology: {
    zh: "○○さん\n\nこのたびは、○○についてご迷惑をおかけし、申し訳ありませんでした。\n\n原因は、\n\n今後は同じことがないよう、○○に気をつけます。\n\n本当に申し訳ありませんでした。",
    en: null,
    ja: "○○さん\n\nこのたびは、○○についてご迷惑をおかけし、申し訳ありませんでした。\n\n今後は同じことがないよう、気をつけます。\n\n本当に申し訳ありませんでした。",
  },
  gratitude: {
    zh: "○○さん\n\nこのたびは○○をありがとうございました。\n\nおかげで、\n\n本当に助かりました。また何かありましたら、ぜひお手伝いさせてください。",
    en: null,
    ja: "○○さん\n\nこのたびは○○をありがとうございました。\n\nおかげで、\n\n本当に助かりました。また何かありましたら、ぜひお手伝いさせてください。",
  },
  invitation: {
    zh: "来週の○○に一緒に行きませんか？\n\n場所は○○です。時間は○○からを考えています。\n\nもし興味があれば、ぜひ！",
    en: "Would you like to join me for [activity] next [time]?\n\nIt's at [place], starting around [time].\n\nLet me know if you're interested!",
    ja: "来週の○○に一緒に行きませんか？\n\nもし興味があれば、ぜひご連絡ください！",
  },
  refusal: {
    zh: "お誘いありがとうございます。\n\n残念ながら、今回は○○のため参加できません。\n\nまた次の機会にぜひ誘ってください。",
    en: "Thank you for the invitation!\n\nUnfortunately, I can't make it this time due to [reason].\n\nPlease keep me in mind for next time!",
    ja: "お誘いありがとうございます。\n\n残念ながら、今回は○○のため参加できません。\n\nまた次の機会にぜひ誘ってください。",
  },
  self_intro: {
    zh: "はじめまして。○○と申します。\n\n今は○○を勉強しています。\n\n趣味は○○です。\n\nよろしくお願いします。",
    en: "Hi, I'm [Name].\n\nI'm currently learning [language/studying X].\n\nIn my free time, I enjoy [hobby].\n\nNice to meet you!",
    ja: "はじめまして。○○と申します。\n\n今は○○を勉強しています。\n\n趣味は○○です。\n\nよろしくお願いします。",
  },
  social_media: {
    zh: "今日は○○に行ってきました！\n\n思ったよりも○○で、\n\nみなさんもぜひ行ってみてください。\n\n#Naoii #日本語学習",
    en: "Just [did/went to X] today!\n\nIt was more [adjective] than I expected.\n\nHighly recommend checking it out!\n\n#Naoii #JapaneseLearning",
    ja: "今日は○○に行ってきました！\n\n思ったよりも○○で、\n\nみなさんもぜひ行ってみてください。\n\n#Naoii #日本語学習",
  },
};

type Locale = "zh" | "en" | "ja";

export function getTemplateData(locale: Locale): { key: string; tips: string[]; skeleton: string | null }[] {
  const sceneKeys = Object.keys(tips) as (keyof typeof tips)[];
  return sceneKeys.map((key) => ({
    key,
    tips: tips[key][locale] || tips[key].zh,
    skeleton: skeletons[key]?.[locale] ?? skeletons[key]?.zh ?? null,
  }));
}
