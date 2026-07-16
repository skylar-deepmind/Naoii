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
    zh: "时间：\n地点：\n和谁一起：\n做了什么：\n感受：",
    en: "When:\nWhere:\nWith whom:\nWhat you did:\nHow you felt:",
    ja: "時間：\n場所：\n誰と：\n何をした：\n感想：",
  },
  work: {
    zh: "收件人：\n\n主题：\n\n正文要点：\n1.\n2.\n3.\n\n结尾：\n署名：",
    en: "To:\n\nSubject:\n\nKey points:\n1.\n2.\n3.\n\nClosing:\n- [Name]",
    ja: "宛先：\n\n件名：\n\n本文のポイント：\n1.\n2.\n3.\n\n結び：\n- [名前]",
  },
  request_help: {
    zh: "称呼：\n\n当前情况：\n具体需要什么帮助：\n时间或条件：\n感谢：",
    en: "Greeting:\n\nCurrent situation:\nWhat help you need:\nTiming or conditions:\nThanks:",
    ja: "呼びかけ：\n\n現在の状況：\n必要な助け：\n時間や条件：\nお礼：",
  },
  apology: {
    zh: "开头致歉：\n\n道歉的具体内容：\n原因（不找借口）：\n改进措施：\n再次致歉：",
    en: "Opening apology:\n\nWhat you're sorry for:\nReason (no excuses):\nHow you'll improve:\nClosing apology:",
    ja: "謝罪の言葉：\n\n謝る内容：\n理由（言い訳せず）：\n改善策：\nもう一度謝罪：",
  },
  gratitude: {
    zh: "称呼：\n\n对方做了什么：\n这件事对你的意义：\n对方的付出：\n再次感谢：",
    en: "Greeting:\n\nWhat they did for you:\nWhy it mattered:\nAcknowledging their effort:\nThanks again:",
    ja: "呼びかけ：\n\n相手がしてくれたこと：\nその意味：\n相手の努力への言及：\nもう一度お礼：",
  },
  invitation: {
    zh: "邀请内容（时间、地点、活动）：\n\n邀请理由：\n\n方便的时间：\n\n联系方式：",
    en: "What (time, place, activity):\n\nWhy you're inviting them:\n\nFlexibility for their schedule:\n\nContact/RSVP:",
    ja: "内容（時間、場所、活動）：\n\n招待する理由：\n\n相手の都合への配慮：\n\n連絡先：",
  },
  refusal: {
    zh: "感谢邀请：\n\n委婉拒绝：\n\n简单理由：\n\n友好结尾：",
    en: "Thank them:\n\nPolitely decline:\n\nBrief reason:\n\nFriendly closing:",
    ja: "お礼：\n\n丁寧に断る：\n\n簡単な理由：\n\n友好的な結び：",
  },
  self_intro: {
    zh: "姓名：\n\n来自哪里 / 身份：\n\n学习 / 工作：\n\n兴趣爱好：\n\n很高兴认识你：",
    en: "Name:\n\nWhere you're from / background:\n\nWhat you do (study/work):\n\nInterests/hobbies:\n\nNice to meet you:",
    ja: "名前：\n\n出身 / 背景：\n\n勉強・仕事：\n\n趣味・関心：\n\nよろしくお願いします：",
  },
  social_media: {
    zh: "吸引人的开头：\n\n主要内容：\n\n感受或观点：\n\n互动提问：\n\n话题标签：",
    en: "Engaging opening:\n\nMain content:\n\nYour thoughts/feelings:\n\nEngagement question:\n\nHashtags:",
    ja: "注目を引く書き出し：\n\nメイン内容：\n\n感想や意見：\n\n交流のための質問：\n\nハッシュタグ：",
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
