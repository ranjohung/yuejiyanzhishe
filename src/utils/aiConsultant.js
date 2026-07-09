/**
 * AI变美顾问 - 安全护栏与对话逻辑
 * V1 本地模拟版，后续接入后端 API
 */

// 敏感词过滤规则
const SENSITIVE_WORDS = {
  medical_diagnosis: ['诊断', '确诊', '患有', '疾病', '病症'],
  treatment_advice: ['治疗', '治愈', '根治', '疗效', '药方'],
  drug_recommendation: ['药', '药品', '药物', '药膏', '处方'],
  cosmetic_surgery: ['整形', '手术', '注射', '填充', '吸脂'],
  efficacy_claims: ['保证', '一定', '100%', '立刻见效', '包好']
}

// 合规回答模板
const COMPLIANCE_TEMPLATES = {
  medical: '根据你的描述，建议咨询专业医生获取专业意见。本平台提供的内容仅供参考，不能替代专业医疗建议。',
  drug: '关于产品选择，建议根据自身情况进行选择，如有过敏或不适请立即停止使用并就医。',
  surgery: '关于整形美容相关的内容，建议咨询专业机构和医生。本平台不提供相关建议。'
}

// 所有回答的尾部就医引导
const MEDICAL_DISCLAIMER = '\n\n——\n💡 本平台提供的内容仅供参考，不能替代专业医疗建议。如有健康问题，请及时就医。'

// 皮肤相关问题引导
const SKIN_DISCLAIMER = '\n\n如果您的皮肤问题持续或加重，建议咨询专业皮肤科医生。'

// 每日对话次数限制
const DAILY_LIMIT = 3

// 次数提示文案
const LIMIT_MESSAGES = {
  last_one: '您今天还剩1次AI顾问机会',
  exhausted: '您今天的AI顾问机会已用完，升级会员可获得更多机会',
  upgrade: '恭喜升级！您现在每天可使用更多次AI顾问'
}

// 本地预设回答库（V1 本地模拟）
const LOCAL_ANSWERS = {
  skin: [
    { keywords: ['皮肤干', '干燥', '起皮', '缺水'], answer: '干性皮肤建议注重保湿锁水。日常护肤可以选用含有玻尿酸、甘油等保湿成分的产品，洁面后及时涂抹保湿乳液或面霜。每周可做1-2次补水面膜。注意避免过度清洁和使用过热的水洗脸。' + SKIN_DISCLAIMER },
    { keywords: ['油性', '出油', '痘痘', '粉刺', '闭口'], answer: '油性皮肤建议注重清洁控油与保湿平衡。选择温和的洁面产品，早晚各清洁一次。含有水杨酸或烟酰胺的产品可以帮助调节油脂分泌。注意不要过度清洁，以免破坏皮肤屏障。' + SKIN_DISCLAIMER },
    { keywords: ['敏感', '泛红', '过敏', '刺痛', '红血丝'], answer: '敏感肌护理的核心是温和舒缓。建议选择成分简单、无酒精无香精的护肤品，优先考虑含有神经酰胺、积雪草等修护成分的产品。新护肤品使用前建议先在耳后做过敏测试。' + SKIN_DISCLAIMER },
    { keywords: ['混合', 'T区', '脸颊干'], answer: '混合性皮肤建议分区护理。T区使用清爽控油产品，脸颊使用保湿滋润产品。选择质地轻盈的乳液或啫喱状面霜，避免过于油腻的产品。' + SKIN_DISCLAIMER }
  ],
  makeup: [
    { keywords: ['妆容', '化妆', '粉底', '遮瑕', '底妆'], answer: '选择底妆产品时，建议根据肤质来选：干皮选滋润型粉底液，油皮选控油型粉底液或粉饼。上妆前做好保湿打底，妆容会更服帖持久。定妆喷雾或散粉可以帮助妆容更持久。' },
    { keywords: ['眼妆', '眼影', '眼线', '睫毛', '眉'], answer: '眼妆可以根据眼型来选择画法。日常通勤建议大地色系眼影，自然又百搭。画眼线时，内眼线可以让眼睛更有神。眉毛建议根据脸型选择眉形，自然眉形适合大多数脸型。' },
    { keywords: ['唇妆', '口红', '唇釉', '唇色'], answer: '选择唇色时，可以根据肤色来搭配：暖黄皮适合豆沙色、砖红色等暖调唇色；冷白皮适合玫红、浆果色等冷调唇色。日常可以备一支日常色和一支气场色，应对不同场合。' }
  ],
  hairstyle: [
    { keywords: ['发型', '头发', '刘海', '卷发', '直发'], answer: '选择发型时，脸型是重要参考因素：圆脸适合有层次感的中长发或侧分刘海，可以拉长脸型；方脸适合柔和的卷发或碎发修饰下颌线；长脸适合有刘海的发型，视觉上缩短脸型。' },
    { keywords: ['脱发', '掉发', '发量', '稀疏'], answer: '脱发问题建议从多方面入手：保持规律作息，减少熬夜；均衡饮食，补充蛋白质和维生素B族；选择温和的洗护产品，避免过度烫染。如果脱发严重，建议咨询专业医生。' + SKIN_DISCLAIMER }
  ],
  outfit: [
    { keywords: ['穿搭', '搭配', '穿衣', '风格', '配色'], answer: '穿搭的黄金法则是"扬长避短"。了解自己的身材特点，选择能突出优势的单品。基础色系（黑白灰）是百搭之选，可以在此基础上加入1-2个亮色单品作为点缀。配饰也是提升整体造型感的关键。' },
    { keywords: ['显瘦', '遮肉', '胖', '梨形', '苹果形'], answer: '不同体型有各自的穿搭技巧：梨形身材适合上紧下松的搭配，突出上半身优势；苹果形身材适合V领或收腰设计，拉长身形线条；H型身材可以通过腰带或腰封打造腰线。' }
  ],
  general: [
    { keywords: ['护肤', '保养', '抗老', '美白', '防晒'], answer: '日常护肤的基础步骤是：清洁→保湿→防晒。防晒是护肤中最重要的一步，无论晴天阴天都要做好防晒。抗老可以从25岁左右开始关注，选择含有视黄醇、维生素C等成分的产品。' + SKIN_DISCLAIMER },
    { keywords: ['减肥', '瘦身', '塑形', '健身', '运动'], answer: '健康的身材管理需要饮食和运动相结合。建议每周进行3-5次有氧运动，搭配力量训练。饮食上注意蛋白质摄入，减少高糖高油食物。每个人的体质不同，找到适合自己的节奏最重要。' }
  ]
}

// 默认回答
const DEFAULT_ANSWER = '感谢你的提问！变美是一个循序渐进的过程，建议从基础护肤和适合自己风格的穿搭开始尝试。如果你有具体的皮肤问题或穿搭需求，欢迎告诉我更多细节，我会为你提供更针对性的建议。' + MEDICAL_DISCLAIMER

/**
 * 检测是否命中敏感词
 */
export function checkSensitiveWords(text) {
  for (const category in SENSITIVE_WORDS) {
    const words = SENSITIVE_WORDS[category]
    for (const word of words) {
      if (text.includes(word)) {
        return { hit: true, category }
      }
    }
  }
  return { hit: false, category: null }
}

/**
 * 获取合规模板回答
 */
function getComplianceAnswer(category) {
  switch (category) {
    case 'medical_diagnosis':
      return COMPLIANCE_TEMPLATES.medical
    case 'treatment_advice':
      return COMPLIANCE_TEMPLATES.medical
    case 'drug_recommendation':
      return COMPLIANCE_TEMPLATES.drug
    case 'cosmetic_surgery':
      return COMPLIANCE_TEMPLATES.surgery
    case 'efficacy_claims':
      return '关于效果的问题，每个人的情况不同，建议根据自身实际情况进行判断。' + MEDICAL_DISCLAIMER
    default:
      return COMPLIANCE_TEMPLATES.medical
  }
}

/**
 * 获取本地匹配回答
 */
function getLocalAnswer(text) {
  // 按分类顺序匹配
  for (const category of Object.values(LOCAL_ANSWERS)) {
    for (const item of category) {
      for (const keyword of item.keywords) {
        if (text.includes(keyword)) {
          return item.answer
        }
      }
    }
  }
  return null
}

/**
 * 生成AI回答（V1 本地模拟版）
 * 1. 敏感词检测
 * 2. 关键词匹配本地回答
 * 3. 默认回答
 */
export function generateAnswer(text) {
  // 1. 敏感词检测
  const check = checkSensitiveWords(text)
  if (check.hit) {
    return getComplianceAnswer(check.category) + MEDICAL_DISCLAIMER
  }

  // 2. 关键词匹配本地回答
  const localAnswer = getLocalAnswer(text)
  if (localAnswer) {
    return localAnswer + MEDICAL_DISCLAIMER
  }

  // 3. 默认回答
  return DEFAULT_ANSWER
}

/**
 * 获取每日剩余次数
 */
export function getDailyRemaining() {
  const today = new Date().toDateString()
  const record = uni.getStorageSync('aiConsultant_daily')
  
  if (record?.date === today) {
    return Math.max(0, DAILY_LIMIT - record.count)
  }
  return DAILY_LIMIT
}

/**
 * 记录一次对话使用
 */
export function recordDailyUsage() {
  const today = new Date().toDateString()
  const record = uni.getStorageSync('aiConsultant_daily') || { date: today, count: 0 }
  
  if (record.date !== today) {
    record.date = today
    record.count = 0
  }
  
  record.count++
  uni.setStorageSync('aiConsultant_daily', record)
}

/**
 * 生成对话标题（取第一条消息的前15个字）
 */
export function generateTitle(content) {
  const clean = content.replace(/[\n\r]/g, ' ').trim()
  return clean.length > 15 ? clean.slice(0, 15) + '...' : clean
}

export { DAILY_LIMIT, LIMIT_MESSAGES }