/**
 * 风格测试题目数据与计算逻辑
 * V1 内置 10 道题，覆盖风格偏好、颜色、发型、场合、妆容等维度
 */

// 题目列表
export const questions = [
  {
    id: 'q1',
    text: '你最喜欢哪种风格的穿搭？',
    options: [
      { value: 'A', label: '甜美可爱', tags: { 甜美: 3, 浪漫: 1 } },
      { value: 'B', label: '优雅知性', tags: { 优雅: 3, 温柔: 1 } },
      { value: 'C', label: '干练简约', tags: { 干练: 3, 简约: 1 } },
      { value: 'D', label: '自然休闲', tags: { 自然: 3, 休闲: 1 } }
    ]
  },
  {
    id: 'q2',
    text: '你平时更偏爱什么颜色的衣服？',
    options: [
      { value: 'A', label: '暖色系（粉、橙、红）', tags: { 甜美: 2, 浪漫: 2 } },
      { value: 'B', label: '冷色系（蓝、紫、绿）', tags: { 优雅: 2, 冷艳: 2 } },
      { value: 'C', label: '中性色（黑、白、灰）', tags: { 干练: 2, 简约: 2 } },
      { value: 'D', label: '大地色系（米、棕、驼）', tags: { 自然: 2, 温柔: 2 } }
    ]
  },
  {
    id: 'q3',
    text: '你更喜欢哪种发型风格？',
    options: [
      { value: 'A', label: '长发飘逸', tags: { 浪漫: 2, 温柔: 2 } },
      { value: 'B', label: '短发利落', tags: { 干练: 2, 简约: 1 } },
      { value: 'C', label: '卷发浪漫', tags: { 浪漫: 3, 优雅: 1 } },
      { value: 'D', label: '直发简约', tags: { 简约: 2, 自然: 1 } }
    ]
  },
  {
    id: 'q4',
    text: '你平时出席最多的场合是？',
    options: [
      { value: 'A', label: '日常通勤/办公', tags: { 干练: 2, 简约: 1 } },
      { value: 'B', label: '约会聚会/社交', tags: { 浪漫: 2, 优雅: 2 } },
      { value: 'C', label: '休闲运动/户外', tags: { 休闲: 3, 自然: 1 } },
      { value: 'D', label: '正式场合/活动', tags: { 优雅: 2, 冷艳: 1 } }
    ]
  },
  {
    id: 'q5',
    text: '你对妆容的偏好是？',
    options: [
      { value: 'A', label: '自然裸妆，清透感', tags: { 自然: 2, 简约: 1 } },
      { value: 'B', label: '精致全妆，气场感', tags: { 优雅: 2, 冷艳: 2 } },
      { value: 'C', label: '淡雅妆容，温柔感', tags: { 温柔: 2, 甜美: 1 } },
      { value: 'D', label: '个性妆容，创意感', tags: { 个性: 3, 潮流: 2 } }
    ]
  },
  {
    id: 'q6',
    text: '你觉得自己更适合哪种气质？',
    options: [
      { value: 'A', label: '温柔知性', tags: { 温柔: 3, 优雅: 1 } },
      { value: 'B', label: '干练潇洒', tags: { 干练: 3, 简约: 1 } },
      { value: 'C', label: '活泼可爱', tags: { 甜美: 3, 休闲: 1 } },
      { value: 'D', label: '冷艳高级', tags: { 冷艳: 3, 个性: 1 } }
    ]
  },
  {
    id: 'q7',
    text: '你最喜欢的配饰风格是？',
    options: [
      { value: 'A', label: '简约精致的小饰品', tags: { 简约: 2, 优雅: 1 } },
      { value: 'B', label: '浪漫优雅的珍珠/丝巾', tags: { 浪漫: 2, 优雅: 2 } },
      { value: 'C', label: '个性潮流的金属/链条', tags: { 个性: 2, 潮流: 2 } },
      { value: 'D', label: '自然随性的编织/木质', tags: { 自然: 2, 休闲: 1 } }
    ]
  },
  {
    id: 'q8',
    text: '你希望整体造型给人什么感觉？',
    options: [
      { value: 'A', label: '亲和温暖，容易亲近', tags: { 温柔: 2, 甜美: 1 } },
      { value: 'B', label: '专业自信，值得信赖', tags: { 干练: 2, 优雅: 1 } },
      { value: 'C', label: '时尚前卫，与众不同', tags: { 个性: 2, 潮流: 2 } },
      { value: 'D', label: '舒适自然，毫不费力', tags: { 自然: 2, 休闲: 2 } }
    ]
  },
  {
    id: 'q9',
    text: '你更倾向于哪种穿衣剪裁？',
    options: [
      { value: 'A', label: '修身显形，突出曲线', tags: { 优雅: 2, 浪漫: 1 } },
      { value: 'B', label: '宽松舒适，自由随性', tags: { 休闲: 2, 自然: 2 } },
      { value: 'C', label: '利落剪裁，线条简洁', tags: { 干练: 2, 简约: 2 } },
      { value: 'D', label: '设计感强，细节丰富', tags: { 个性: 2, 潮流: 1 } }
    ]
  },
  {
    id: 'q10',
    text: '你的日常穿搭频率是？',
    options: [
      { value: 'A', label: '每天精心搭配', tags: { 优雅: 2, 个性: 1 } },
      { value: 'B', label: '有几套固定搭配轮换', tags: { 简约: 2, 干练: 1 } },
      { value: 'C', label: '看心情随意搭配', tags: { 休闲: 2, 自然: 1 } },
      { value: 'D', label: '追求舒适为主', tags: { 自然: 2, 休闲: 2 } }
    ]
  }
]

// 风格结果配置
const styleResults = {
  // 甜美浪漫型
  甜美: {
    label: '甜美浪漫系',
    description: '你拥有温柔可爱的气质，适合柔和甜美、富有浪漫气息的造型。粉色系、蕾丝、荷叶边等元素能很好地衬托你的魅力，让你看起来更加亲切动人。',
    tags: ['甜美', '浪漫', '温柔'],
    colors: ['粉色', '浅紫', '暖白'],
    icons: ['🌸', '💕', '✨']
  },
  // 优雅气质型
  优雅: {
    label: '优雅气质系',
    description: '你散发着优雅知性的魅力，简约大方的穿搭最能展现你的品味。经典款式的单品、高级感的配色、精致的配饰，都能让你在人群中脱颖而出。',
    tags: ['优雅', '知性', '高级'],
    colors: ['米色', '驼色', '深蓝'],
    icons: ['👑', '💎', '🌹']
  },
  // 干练简约型
  干练: {
    label: '干练简约系',
    description: '你有着独立自信的气质，简洁利落的造型最适合你。剪裁考究的基础款、黑白灰的中性配色、干净利落的线条，都能突显你的专业与果敢。',
    tags: ['干练', '简约', '自信'],
    colors: ['黑色', '白色', '灰色'],
    icons: ['💼', '⭐', '🎯']
  },
  // 自然清新型
  自然: {
    label: '自然清新系',
    description: '你崇尚自然舒适的生活方式，清新淡雅的风格最能体现你的本真。大地色系、棉麻材质、宽松廓形，让你在舒适中展现独特的自然之美。',
    tags: ['自然', '清新', '舒适'],
    colors: ['米白', '卡其', '豆绿'],
    icons: ['🌿', '🍃', '☀️']
  },
  // 个性潮流型
  个性: {
    label: '个性潮流系',
    description: '你有着独特的时尚品味，敢于尝试不同风格的搭配。设计感强的单品、大胆的色彩碰撞、个性化的配饰，都能彰显你不随波逐流的个性态度。',
    tags: ['个性', '潮流', '前卫'],
    colors: ['亮色', '金属色', '撞色'],
    icons: ['🔥', '💫', '🎨']
  },
  // 温婉休闲型
  温柔: {
    label: '温婉休闲系',
    description: '你温柔体贴，亲和力十足，柔和舒适的穿搭最能衬托你的气质。暖色调的搭配、柔软的面料、简约而有细节的单品，让你温暖又迷人。',
    tags: ['温柔', '休闲', '亲和'],
    colors: ['暖粉', '米色', '浅咖'],
    icons: ['☕', '🌸', '🕊️']
  }
}

// 计算风格结果
export function calculateStyleResult(answers) {
  // 累计各风格标签分值
  const scores = {}
  for (const qId in answers) {
    const question = questions.find(q => q.id === qId)
    if (!question) continue
    const option = question.options.find(o => o.value === answers[qId])
    if (!option) continue
    for (const tag in option.tags) {
      scores[tag] = (scores[tag] || 0) + option.tags[tag]
    }
  }

  // 找出得分最高的风格维度
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1])

  // 取前两个风格作为主副风格
  const primaryTag = sorted[0]?.[0] || '自然'
  const secondaryTag = sorted[1]?.[0] || '温柔'

  // 确定主风格结果
  const primaryResult = styleResults[primaryTag] || styleResults.自然
  const secondaryResult = styleResults[secondaryTag] || styleResults.温柔

  // 组合风格名称
  const combinedLabel = `${primaryResult.label.split('系')[0]}${secondaryResult.label.split('系')[0]}系`

  return {
    label: combinedLabel,
    primaryStyle: primaryResult.label,
    secondaryStyle: secondaryResult.label,
    description: `${primaryResult.description}\n\n搭配建议：在日常穿搭中融入${secondaryResult.label}的元素，可以让你的风格更加丰富多元。`,
    tags: [...new Set([...primaryResult.tags, ...secondaryResult.tags])],
    colors: primaryResult.colors,
    icons: primaryResult.icons,
    scores,
    primaryTag,
    secondaryTag
  }
}