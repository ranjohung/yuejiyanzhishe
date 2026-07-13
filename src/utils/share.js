class ShareManager {
  constructor() {
    this.shareConfig = {
      shareUrl: 'https://aimeizhuang.libaodong4571.cn/share',
      posterUrl: 'https://aimeizhuang.libaodong4571.cn/share/poster'
    }
  }

  async shareReport(reportId, options = {}) {
    const { mode = 'full', type = 'analysis' } = options
    
    try {
      const shareLink = this.generateShareLink(reportId, mode)
      
      if (uni.share) {
        await uni.share({
          provider: 'weixin',
          scene: 'WXSceneSession',
          type: 0,
          title: this.getShareTitle(type),
          summary: this.getShareSummary(type, mode),
          href: shareLink,
          imageUrl: await this.generateShareImage(reportId, mode),
          success: () => {
            this.handleShareSuccess(reportId, 'wechat')
          },
          fail: (err) => {
            console.error('Share failed:', err)
            this.copyLink(shareLink)
          }
        })
      } else {
        this.copyLink(shareLink)
      }
    } catch (err) {
      console.error('Share error:', err)
      this.copyLink(this.generateShareLink(reportId, mode))
    }
  }

  async shareToTimeline(reportId, options = {}) {
    const { mode = 'full', type = 'analysis' } = options
    
    try {
      const shareLink = this.generateShareLink(reportId, mode)
      
      if (uni.share) {
        await uni.share({
          provider: 'weixin',
          scene: 'WXSceneTimeline',
          type: 0,
          title: this.getShareTitle(type),
          summary: this.getShareSummary(type, mode),
          href: shareLink,
          imageUrl: await this.generateShareImage(reportId, mode),
          success: () => {
            this.handleShareSuccess(reportId, 'timeline')
          },
          fail: (err) => {
            console.error('Share to timeline failed:', err)
            this.copyLink(shareLink)
          }
        })
      } else {
        this.copyLink(shareLink)
      }
    } catch (err) {
      console.error('Share to timeline error:', err)
      this.copyLink(this.generateShareLink(reportId, mode))
    }
  }

  copyLink(link) {
    uni.setClipboardData({
      data: link,
      success: () => {
        uni.showToast({
          title: '链接已复制',
          icon: 'success'
        })
      },
      fail: () => {
        uni.showToast({
          title: '复制失败',
          icon: 'error'
        })
      }
    })
  }

  async saveShareImage(reportId, options = {}) {
    const { mode = 'full' } = options
    
    try {
      const imageUrl = await this.generateShareImage(reportId, mode)
      
      uni.downloadFile({
        url: imageUrl,
        success: (res) => {
          if (res.statusCode === 200) {
            uni.saveImageToPhotosAlbum({
              filePath: res.tempFilePath,
              success: () => {
                uni.showToast({
                  title: '图片已保存',
                  icon: 'success'
                })
                this.handleShareSuccess(reportId, 'save_image')
              },
              fail: () => {
                uni.showToast({
                  title: '保存失败',
                  icon: 'error'
                })
              }
            })
          }
        },
        fail: () => {
          uni.showToast({
            title: '下载失败',
            icon: 'error'
          })
        }
      })
    } catch (err) {
      console.error('Save image error:', err)
      uni.showToast({
        title: '保存失败',
        icon: 'error'
      })
    }
  }

  generateShareLink(reportId, mode = 'full') {
    const timestamp = Date.now()
    const encodedId = encodeURIComponent(reportId)
    return `${this.shareConfig.shareUrl}?id=${encodedId}&mode=${mode}&t=${timestamp}`
  }

  async generateShareImage(reportId, mode = 'full') {
    const encodedId = encodeURIComponent(reportId)
    return `${this.shareConfig.posterUrl}?id=${encodedId}&mode=${mode}`
  }

  getShareTitle(type) {
    const titles = {
      analysis: '我的形象测评报告',
      makeup: '我的妆容推荐',
      outfit: '我的穿搭推荐',
      hairstyle: '我的发型推荐',
      beauty: '我的美容美体计划'
    }
    return titles[type] || '我的形象测评报告'
  }

  getShareSummary(type, mode) {
    const summaries = {
      analysis: 'AI分析我的面部特征和形体特点，生成专属形象报告',
      makeup: 'AI根据我的面部特征推荐专属妆容',
      outfit: 'AI根据我的体型特点推荐穿搭方案',
      hairstyle: 'AI根据我的脸型推荐适合的发型',
      beauty: 'AI为我制定专属美容美体计划'
    }
    
    if (mode === 'anonymous') {
      return '看看这份形象分析报告，也许对你有帮助'
    }
    
    return summaries[type] || 'AI形象测评报告'
  }

  async handleShareSuccess(reportId, channel) {
    try {
      await uni.request({
        url: `${this.shareConfig.shareUrl}/record`,
        method: 'POST',
        data: {
          reportId,
          channel,
          timestamp: Date.now()
        }
      })
    } catch (err) {
      console.error('Record share error:', err)
    }
  }

  showShareMenu() {
    if (typeof wx !== 'undefined' && wx.showShareMenu) {
      wx.showShareMenu({
        withShareTicket: true,
        menus: ['shareAppMessage', 'shareTimeline']
      })
    }
  }
}

export const shareManager = new ShareManager()

export default ShareManager
