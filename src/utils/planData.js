/**
 * 生活美学计划 - 任务数据与打卡逻辑
 * V1 本地模拟版，后续接入后端 API
 */

// 计划类型
export const PLAN_TYPES = {
  skincare: { id: 1, label: '日常护肤', icon: '🧴', color: '#7c3aed' },
  diet: { id: 2, label: '饮食建议', icon: '🥗', color: '#10b981' },
  sleep: { id: 3, label: '作息管理', icon: '🌙', color: '#f59e0b' }
}

// 预设计划模板
const PLAN_TEMPLATES = {
  skincare: [
    {
      id: 'skincare-7d',
      title: '7天焕肤计划',
      type: 'skincare',
      days: 7,
      description: '适合干性/混合性皮肤的基础护肤流程，每天早晚各一次，培养良好护肤习惯。',
      dailyTasks: [
        { day: 1, items: ['早晨温和洁面', '爽肤水轻拍', '保湿乳液涂抹', '晚间卸妆清洁'] },
        { day: 2, items: ['早晨温和洁面', '精华液按摩', '保湿面霜', '晚间卸妆清洁'] },
        { day: 3, items: ['早晨温和洁面', '补水面膜（15min）', '保湿乳液', '晚间卸妆清洁'] },
        { day: 4, items: ['早晨温和洁面', '爽肤水+精华', '防晒隔离', '晚间卸妆清洁'] },
        { day: 5, items: ['早晨温和洁面', '去角质（温和）', '补水面膜', '晚间卸妆清洁'] },
        { day: 6, items: ['早晨温和洁面', '精华液按摩', '保湿面霜', '晚间放松面膜'] },
        { day: 7, items: ['早晨温和洁面', '全流程护理', '记录皮肤状态', '总结本周变化'] }
      ]
    }
  ],
  diet: [
    {
      id: 'diet-7d',
      title: '7天均衡饮食',
      type: 'diet',
      days: 7,
      description: '科学搭配每日三餐，增加蔬果摄入，减少高糖高油，养成健康饮食习惯。',
      dailyTasks: [
        { day: 1, items: ['早餐：全麦面包+鸡蛋+牛奶', '午餐：杂粮饭+鸡胸肉+青菜', '晚餐：蔬菜沙拉+鱼肉', '饮水2000ml'] },
        { day: 2, items: ['早餐：燕麦粥+水果', '午餐：藜麦饭+虾仁+西兰花', '晚餐：豆腐汤+杂粮', '饮水2000ml'] },
        { day: 3, items: ['早餐：酸奶+坚果+全麦吐司', '午餐：荞麦面+牛肉+蔬菜', '晚餐：番茄蛋汤+杂粮', '饮水2000ml'] },
        { day: 4, items: ['早餐：鸡蛋羹+红薯', '午餐：糙米饭+三文鱼+菠菜', '晚餐：菌菇汤+蔬菜', '饮水2000ml'] },
        { day: 5, items: ['早餐：牛奶+玉米+鸡蛋', '午餐：全麦三明治+鸡胸肉', '晚餐：紫菜汤+豆腐', '饮水2000ml'] },
        { day: 6, items: ['早餐：水果沙拉+坚果', '午餐：杂粮饭+鱼肉+时蔬', '晚餐：蔬菜汤+杂粮', '饮水2000ml'] },
        { day: 7, items: ['早餐：自由搭配（健康）', '午餐：均衡膳食', '晚餐：清淡饮食', '总结本周饮食'] }
      ]
    }
  ],
  sleep: [
    {
      id: 'sleep-7d',
      title: '7天作息调整',
      type: 'sleep',
      days: 7,
      description: '逐步调整作息时间，养成早睡早起的好习惯，改善皮肤状态和精神面貌。',
      dailyTasks: [
        { day: 1, items: ['22:30 放下手机', '22:45 轻柔拉伸', '23:00 入睡', '07:30 起床'] },
        { day: 2, items: ['22:15 放下手机', '22:30 阅读放松', '22:45 入睡', '07:15 起床'] },
        { day: 3, items: ['22:00 放下手机', '22:15 冥想放松', '22:30 入睡', '07:00 起床'] },
        { day: 4, items: ['22:00 放下手机', '22:15 温水泡脚', '22:30 入睡', '07:00 起床'] },
        { day: 5, items: ['21:45 放下手机', '22:00 轻柔拉伸', '22:15 入睡', '06:45 起床'] },
        { day: 6, items: ['21:45 放下手机', '22:00 冥想放松', '22:15 入睡', '06:45 起床'] },
        { day: 7, items: ['21:30 放下手机', '21:45 放松准备', '22:00 入睡', '06:30 起床'] }
      ]
    }
  ]
}

// 生成唯一ID
function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

/**
 * 获取预设计划模板
 */
export function getPlanTemplate(type) {
  const templates = PLAN_TEMPLATES[type]
  return templates ? templates[0] : null
}

/**
 * 获取所有预设计划模板
 */
export function getAllTemplates() {
  return Object.values(PLAN_TEMPLATES).flat()
}

/**
 * 根据模板创建计划实例
 */
export function createPlanFromTemplate(templateId) {
  const allTemplates = getAllTemplates()
  const template = allTemplates.find(t => t.id === templateId)
  if (!template) return null

  const now = new Date()
  const startDate = new Date(now)
  const endDate = new Date(now)
  endDate.setDate(endDate.getDate() + template.days - 1)

  // 计算当前在第几天
  const dayIndex = 0 // 从第1天开始

  return {
    id: genId(),
    templateId: template.id,
    title: template.title,
    type: template.type,
    description: template.description,
    totalDays: template.days,
    currentDay: dayIndex + 1,
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    status: 'active', // active / completed / interrupted
    progress: 0,
    createdAt: now.toISOString(),
    checkins: {} // { dayIndex_itemIndex: timestamp }
  }
}

/**
 * 获取计划今天的任务
 */
export function getTodayTasks(plan) {
  const dayData = PLAN_TEMPLATES[plan.type]?.find(t => t.id === plan.templateId)
  if (!dayData) return []
  const today = dayData.dailyTasks[plan.currentDay - 1] || dayData.dailyTasks[0]
  return today.items.map((item, idx) => ({
    key: `${plan.currentDay}_${idx}`,
    label: item,
    dayIndex: plan.currentDay,
    itemIndex: idx,
    checked: !!plan.checkins?.[`${plan.currentDay}_${idx}`],
    checkinTime: plan.checkins?.[`${plan.currentDay}_${idx}`] || null
  }))
}

/**
 * 执行打卡
 */
export function doCheckin(plan, dayIndex, itemIndex) {
  const key = `${dayIndex}_${itemIndex}`
  if (plan.checkins[key]) return plan // 已打卡

  plan.checkins[key] = new Date().toISOString()

  // 计算进度
  const dayData = PLAN_TEMPLATES[plan.type]?.find(t => t.id === plan.templateId)
  if (dayData) {
    const totalTasks = dayData.days * dayData.dailyTasks[0].items.length
    const doneCount = Object.keys(plan.checkins).length
    plan.progress = Math.min(100, Math.round((doneCount / totalTasks) * 100))
  }

  return plan
}

/**
 * 检查当天是否全部完成
 */
export function isTodayCompleted(plan) {
  const tasks = getTodayTasks(plan)
  return tasks.length > 0 && tasks.every(t => t.checked)
}

/**
 * 获取计划完成天数
 */
export function getCompletedDays(plan) {
  const dayData = PLAN_TEMPLATES[plan.type]?.find(t => t.id === plan.templateId)
  if (!dayData) return 0

  let completed = 0
  for (let d = 0; d < plan.currentDay; d++) {
    const dayTasks = dayData.dailyTasks[d]
    if (!dayTasks) continue
    const allDone = dayTasks.items.every((_, idx) => plan.checkins[`${d + 1}_${idx}`])
    if (allDone) completed++
  }
  return completed
}