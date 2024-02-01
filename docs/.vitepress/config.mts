import { defineConfig } from 'vitepress'
import routes from '../../routes.json'
// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Nest通关秘籍",
  // description: "最流行的 Node 企业级框架",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    search: {
      provider: 'local',
      options: {
        locales: {
          zh: {
            translations: {
              button: {
                buttonText: '搜索文档',
                buttonAriaLabel: '搜索文档'
              },
              modal: {
                noResultsText: '无法找到相关结果',
                resetButtonTitle: '清除查询条件',
                footer: {
                  selectText: '选择',
                  navigateText: '切换'
                }
              }
            }
          }
        }
      }
    },

    nav: [
      { text: '开始学习', link: '/第01章—开篇词' },
    ],

    sidebar: [
      {
        text: '目录',
        items: routes
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/LsyWeb' }
    ]
  }
})
