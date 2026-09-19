/**
 * AI 能力封装 — 所有密钥走环境变量，V1 未配置时返回 mock 数据但结构一致
 *
 * 环境变量（.env）：
 *   TENCENTCLOUD_SECRET_ID=xxx
 *   TENCENTCLOUD_SECRET_KEY=xxx
 *   TENCENTCLOUD_REGION=ap-shanghai
 *   QWEN_API_KEY=sk-xxx
 */

const TENCENTCLOUD_SECRET_ID = process.env.TENCENTCLOUD_SECRET_ID
const TENCENTCLOUD_SECRET_KEY = process.env.TENCENTCLOUD_SECRET_KEY
const QWEN_API_KEY = process.env.QWEN_API_KEY

const AI_CONFIGURED = !!(TENCENTCLOUD_SECRET_ID && TENCENTCLOUD_SECRET_KEY && QWEN_API_KEY)

/* ========== 1. 腾讯云人脸分析 ========== */

export interface FaceAnalysisResult {
  face_shape: string
  skin_color: string      // 暖杏皮/冷白皮...
  skin_confidence: number
  features: {
    eyes: string          // 桃花眼/杏眼/丹凤眼...
    eyebrows: string
    nose: string
    mouth: string
    face_ratio: string   // 三庭五眼描述
    golden_ratio: boolean
  }
  skin_problems: string[]
  score: number          // 颜值打分 0-100
  landmarks: number[][]  // 888 密集关键点坐标（前 88 个关键点）
}

/**
 * 人脸分析：前端传图片 URL 或 base64，服务端调腾讯云 DetectFaceAttributes
 * 未配置密钥时返回稳定 mock（前端 UI 可正常渲染）
 */
export async function analyzeFace(imageUrl: string): Promise<FaceAnalysisResult> {
  if (!AI_CONFIGURED) {
    // Mock：基于 URL hash 生成稳定的伪随机结果，避免每次刷新都变
    const seed = hashString(imageUrl)
    const faces = ['鹅蛋脸', '心形脸', '方圆脸', '瓜子脸', '长鹅蛋脸']
    const skins = ['暖杏皮', '冷白皮', '暖调小麦', '中性粉白', '暖调瓷白']
    const eyes = ['桃花眼', '杏眼', '丹凤眼', '圆眼', '细长眼']
    const brows = ['平眉', '微挑眉', '柳叶眉', '野生眉']
    const noses = ['小巧精致', '挺直秀气', '圆润可爱', '立体欧美']
    const mouths = ['唇形饱满', 'M 唇形', '薄唇精致', '微笑唇']

    return {
      face_shape: faces[seed % faces.length],
      skin_color: skins[seed % skins.length],
      skin_confidence: 0.85 + ((seed % 10) / 100),
      features: {
        eyes: eyes[seed % eyes.length],
        eyebrows: brows[(seed >> 3) % brows.length],
        nose: noses[(seed >> 5) % noses.length],
        mouth: mouths[(seed >> 7) % mouths.length],
        face_ratio: ['三庭五眼协调', '上庭略长', '中庭偏短', '下庭饱满'][seed % 4],
        golden_ratio: (seed % 3) !== 0,
      },
      skin_problems: ['细纹', '轻微暗沉', 'T 区出油'].filter((_, i) => ((seed >> i) & 1) === 1),
      score: 72 + (seed % 24), // 72-95 区间
      landmarks: Array.from({ length: 88 }, () => [Math.random() * 100, Math.random() * 100]),
    }
  }

  // TODO: 真实调用腾讯云 iai v20200303
  // const iai = require('tencentcloud-sdk-nodejs').iai.v20200303.Client
  // const client = new iai({ credential: { secretId, secretKey }, region })
  // const res = await client.DetectFaceAttributes({ Image: imageUrl })
  // 错误码：NO_FACE(未检出) / MULTI_FACE(多人) / FACE_TOO_SMALL / BIG_POSE / MASK
  throw new Error('腾讯云人脸分析真实调用 TODO — 请在 .env 配置 TENCENTCLOUD_SECRET_ID/KEY')
}

/* ========== 2. 通义千问文案生成 ========== */

export interface ReportTextSection {
  section_type: 'face' | 'body' | 'hair' | 'outfit' | 'makeup'
  title: string
  content: string
}

export interface AIReportInput {
  faceResult: FaceAnalysisResult
  profile: {
    height?: number
    weight?: number
    skinType?: string
    hairType?: string
    goals?: string[]
    scene?: string
  }
}

/**
 * 生成文字报告 + 推荐方案
 * 未配置 QWEN_API_KEY 时返回基于模板的稳定 mock
 */
export async function generateReportText(input: AIReportInput): Promise<{
  text_sections: ReportTextSection[]
  recommendations: Array<{
    type: 'hair' | 'outfit' | 'makeup' | 'beauty'
    material_tags: string[]
    description: string
  }>
}> {
  if (!AI_CONFIGURED) {
    const f = input.faceResult
    const shape = f.face_shape
    const skin = f.skin_color
    return {
      text_sections: [
        {
          section_type: 'face',
          title: '面部比例',
          content: `你的${shape}搭配${f.features.face_ratio}，${f.features.golden_ratio ? '完美符合黄金比例' : '接近黄金比例'}。五官中${f.features.eyes}是你的亮点，${f.features.nose}与${f.features.mouth}整体协调。`,
        },
        {
          section_type: 'body',
          title: '身形分析',
          content: input.profile.height
            ? `身高${input.profile.height}cm，建议${input.profile.goals?.includes('想更显瘦') ? '深色系纵向线条' : '根据你的身材特点搭配'}。`
            : '身形数据待补充后生成完整方案。',
        },
        {
          section_type: 'makeup',
          title: '妆容建议',
          content: `${skin}推荐使用暖色调底妆，${f.skin_problems.length > 0 ? '注意遮瑕：' + f.skin_problems.join('、') : '肤质状态良好，保持保湿即可'}。`,
        },
      ],
      recommendations: [
        { type: 'hair', material_tags: ['法式刘海', '慵懒大卷'], description: '根据你的脸型推荐轻盈蓬松发型，两侧柔化轮廓' },
        { type: 'outfit', material_tags: ['V 领', '垂坠面料', '米白色系'], description: '通勤约会都能穿的优雅方案，显瘦又显气质' },
        { type: 'makeup', material_tags: ['暖杏底妆', '珊瑚色唇釉', '大地色眼影'], description: '自然清透妆容，提升气色但不过分厚重' },
      ],
    }
  }

  // TODO: 真实调用通义千问 chat completions
  throw new Error('通义千问真实调用 TODO — 请在 .env 配置 QWEN_API_KEY')
}

/* ========== 3. 通用工具 ========== */

function hashString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}
