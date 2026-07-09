/**
 * 成就系统 - 勋章数据与解锁逻辑
 * V1 本地模拟版，后续接入后端 API
 */

// 12枚勋章完整列表
export const ACHIEVEMENTS = [
  {
    id: 'first_analysis',
    name: '初次分析',
    icon: '✨',
    category: 'analysis',
    description: '完成第一次面部分析',
    points: 50,
    condition: '完成第一次面部分析后自动发放',
    progressMax: 1
  },
  {
    id: 'persistence',
    name: '坚持不懈',
    icon: '📅',
    category: 'plan',
    description: '连续打卡7天',
    points: 100,
    condition: '连续打卡7天后自动发放',
    progressMax: 7
  },
  {
    id: 'style_explorer',
    name: '风格探索者',
    icon: '🎨',
    category: 'style',
    description: '完成风格测试',
    points: 30,
    condition: '完成风格测试后自动发放',
    progressMax: 1
  },
  {
    id: 'sharing_guru',
    name: '分享达人',
    icon: '📤',
    category: 'social',
    description: '成功分享5次',
    points: 80,
    condition: '成功分享5次后自动发放',
    progressMax: 5
  },
  {
    id: 'invite_friend',
    name: '邀请好友',
    icon: '👭',
    category: 'social',
    description: '邀请1位好友注册',
    points: 100,
    condition: '邀请1位好友注册后延时24小时发放',
    progressMax: 1
  },
  {
    id: 'plan_completer',
    name: '计划完成者',
    icon: '🏆',
    category: 'plan',
    description: '完成一个完整计划',
    points: 150,
    condition: '完成一个完整计划后自动发放',
    progressMax: 1
  },
  {
    id: 'photo_verify',
    name: '照片验证',
    icon: '📷',
    category: 'analysis',
    description: '上传验证照通过',
    points: 50,
    condition: '上传验证照通过后自动发放',
    progressMax: 1
  },
  {
    id: 'continuous_analysis',
    name: '连续分析',
    icon: '🔄',
    category: 'analysis',
    description: '每月完成4次分析',
    points: 200,
    condition: '每月完成4次分析后每月结算发放',
    progressMax: 4
  },
  {
    id: 'group_leader',
    name: '闺蜜组长',
    icon: '👑',
    category: 'social',
    description: '创建闺蜜小组',
    points: 100,
    condition: '创建闺蜜小组后自动发放',
    progressMax: 1
  },
  {
    id: 'group_active',
    name: '小组活跃',
    icon: '💬',
    category: 'social',
    description: '小组内互动10次',
    points: 80,
    condition: '小组内互动10次后自动发放',
    progressMax: 10
  },
  {
    id: 'ai_consultant',
    name: 'AI顾问用户',
    icon: '🤖',
    category: 'other',
    description: '与AI顾问对话3次',
    points: 50,
    condition: '与AI顾问对话3次后自动发放',
    progressMax: 3
  },
  {
    id: 'vip_upgrade',
    name: '会员升级',
    icon: '⭐',
    category: 'other',
    description: '升级为白银会员',
    points: 300,
    condition: '升级为白银会员后自动发放',
    progressMax: 1
  }
]

// 成就分类
export const ACHIEVEMENT_CATEGORIES = {
  all: { label: '全部', icon: '🏅' },
  analysis: { label: '分析', icon: '✨' },
  plan: { label: '计划', icon: '📅' },
  style: { label: '风格', icon: '🎨' },
  social: { label: '社交', icon: '👭' },
  other: { label: '其他', icon: '🔖' }
}

// 生成唯一ID
function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

/**
 * 获取用户成就状态
 */
export function getUserAchievements() {
  const stored = uni.getStorageSync('userAchievements')
  if (!stored) {
    // 初始化成就数据
    const initial = {}
    for (const ach of ACHIEVEMENTS) {
      initial[ach.id] = {
        progress: 0,
        unlocked: false,
        unlockedAt: null
      }
    }
    const initialData = {
      achievements: initial,
      totalPoints: 0,
      unlockedCount: 0
    }
    uni.setStorageSync('userAchievements', initialData)
    return initialData
  }
  return stored
}

/**
 * 保存成就数据
 */
function saveUserAchievements(data) {
  uni.setStorageSync('userAchievements', data)
}

/**
 * 更新成就进度
 */
export function updateAchievementProgress(achievementId, increment = 1) {
  const data = getUserAchievements()
  const ach = data.achievements[achievementId]
  if (!ach || ach.unlocked) return data

  // 查找成就定义
  const def = ACHIEVEMENTS.find(a => a.id === achievementId)
  if (!def) return data

  // 增加进度
  ach.progress = Math.min(def.progressMax, ach.progress + increment)

  // 检查是否达到解锁条件
  if (ach.progress >= def.progressMax) {
    ach.unlocked = true
    ach.unlockedAt = new Date().toISOString()
    data.totalPoints += def.points
    data.unlockedCount++
  }

  saveUserAchievements(data)
  return data
}

/**
 * 检查是否可解锁（条件已满足但未解锁的成就）
 */
export function checkUnlockableAchievements() {
  const data = getUserAchievements()
  let changed = false

  for (const ach of ACHIEVEMENTS) {
    const userAch = data.achievements[ach.id]
    if (!userAch || userAch.unlocked) continue
    if (userAch.progress >= ach.progressMax) {
      userAch.unlocked = true
      userAch.unlockedAt = new Date().toISOString()
      data.totalPoints += ach.points
      data.unlockedCount++
      changed = true
    }
  }

  if (changed) {
    saveUserAchievements(data)
  }
  return data
}

/**
 * 获取总积分
 */
export function getTotalPoints() {
  const data = getUserAchievements()
  return data.totalPoints
}

/**
 * 获取已解锁成就数
 */
export function getUnlockedCount() {
  const data = getUserAchievements()
  return data.unlockedCount
}

/**
 * 获取成就总数
 */
export function getTotalCount() {
  return ACHIEVEMENTS.length
}

/**
 * 模拟触发成就（用于测试/演示）
 * 按不同操作类型自动触发对应成就
 */
export function triggerAchievementAction(action) {
  const data = getUserAchievements()
  let changed = false

  switch (action) {
    case 'analysis_done':
      // 完成分析 → 初次分析
      changed = updateAchievementSingle(data, 'first_analysis', 1) || changed
      // 完成分析 → 连续分析
      changed = updateAchievementSingle(data, 'continuous_analysis', 1) || changed
      break
    case 'plan_checkin':
      // 打卡 → 坚持不懈
      changed = updateAchievementSingle(data, 'persistence', 1) || changed
      break
    case 'plan_completed':
      // 完成计划 → 计划完成者
      changed = updateAchievementSingle(data, 'plan_completer', 1) || changed
      break
    case 'style_test_done':
      // 完成风格测试 → 风格探索者
      changed = updateAchievementSingle(data, 'style_explorer', 1) || changed
      break
    case 'share_done':
      // 分享 → 分享达人
      changed = updateAchievementSingle(data, 'sharing_guru', 1) || changed
      break
    case 'ai_consult':
      // AI顾问对话 → AI顾问用户
      changed = updateAchievementSingle(data, 'ai_consultant', 1) || changed
      break
    case 'photo_verified':
      // 验证照通过 → 照片验证
      changed = updateAchievementSingle(data, 'photo_verify', 1) || changed
      break
  }

  if (changed) {
    saveUserAchievements(data)
  }
  return data
}

// 更新单个成就进度
function updateAchievementSingle(data, achievementId, increment) {
  const ach = data.achievements[achievementId]
  if (!ach || ach.unlocked) return false

  const def = ACHIEVEMENTS.find(a => a.id === achievementId)
  if (!def) return false

  const oldProgress = ach.progress
  ach.progress = Math.min(def.progressMax, ach.progress + increment)

  if (ach.progress >= def.progressMax && ach.progress >= oldProgress) {
    ach.unlocked = true
    ach.unlockedAt = new Date().toISOString()
    data.totalPoints += def.points
    data.unlockedCount++
  }
  return true
}

/**
 * 格式化解锁时间
 */
export function formatUnlockTime(timeStr) {
  if (!timeStr) return ''
  const d = new Date(timeStr)
  const M = String(d.getMonth() + 1).padStart(2, '0')
  const D = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  return `${M}月${D}日 ${h}:${m}`
}