// useMaterials.js — 素材库 composable
// 从 catalog.json 按模块加载素材，供各 Section 组件使用

import { ref, computed } from 'vue'
import catalog from '@/static/materials/catalog/catalog.json'

const loaded = ref(false)
const allMaterials = ref([])

// 初始化（模块加载时自动执行一次）
function init() {
  if (loaded.value) return
  if (catalog && catalog.items) {
    allMaterials.value = catalog.items
    loaded.value = true
  }
}
init()

/**
 * 按 module 过滤素材
 * @param {string} moduleKey - hairstyle | outfit | face | style
 * @param {object} options - { type?, kind?, style?: 'photo'|'illustrated', limit? }
 */
export function useMaterials(moduleKey, options = {}) {
  const { type = null, kind = null, style = null, limit = 12 } = options

  const items = computed(() => {
    let list = allMaterials.value.filter(m => m.module === moduleKey)
    if (type) list = list.filter(m => m.type === type)
    if (kind) list = list.filter(m => m.kind === kind)
    if (style) list = list.filter(m => m.style === style)
    return list.slice(0, limit)
  })

  const images = computed(() => items.value.filter(m => m.kind === 'image'))
  const videos = computed(() => items.value.filter(m => m.kind === 'video'))

  const summary = computed(() => ({
    total: items.value.length,
    images: images.value.length,
    videos: videos.value.length
  }))

  return { items, images, videos, summary }
}

/** 全局统计 */
export function useMaterialCatalog() {
  const modules = computed(() => catalog?.modules || {})
  const total = computed(() => catalog?.total || 0)
  const generatedAt = computed(() => catalog?.generated || '')
  return { modules, total, generatedAt, raw: catalog }
}

export default useMaterials
