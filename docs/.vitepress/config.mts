import { defineConfig } from 'vitepress'
import routes from '../../routes.json'
// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Nest通关秘籍",
  ignoreDeadLinks: true,
  markdown: {
    image: {
      // 默认禁用图片懒加载
      lazyLoading: true
    }
  },
  locales: {
    root: {
      label: "中文",
      lang: "zh-CN",
    },
  },
  // description: "最流行的 Node 企业级框架",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: "搜索"
          },
          modal: {
            displayDetails: "显示详情",
            resetButtonTitle: "重置",
            backButtonTitle: "返回",
            noResultsText: "未找到结果",
            footer: {
              selectText: "选择",
              navigateText: "导航",
              closeText: "关闭",
            }
          }
        }
      }
    },

    nav: [
      { text: '开始学习', link: '/1. 开篇词' },
    ],

    sidebar: [
      {
        text: '目录',
        items: routes
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/LsyWeb' }
    ],
    
    // 文章翻页
    docFooter: {
      prev: '上一篇',
      next: '下一篇'
    },

    

    // 移动端 - 外观
    darkModeSwitchLabel: '外观',

    // 移动端 - 返回顶部
    returnToTopLabel: '返回顶部',

    // 移动端 - menu
    sidebarMenuLabel: '菜单',

    // 侧边导航（右侧）
    outline:{
      label: '页面导航'
    }
  }
})
