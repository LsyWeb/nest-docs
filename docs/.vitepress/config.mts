import { defineConfig } from 'vitepress'
import routes from '../../routes.json'
// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Nest通关秘籍",
  ignoreDeadLinks: true,
  // description: "最流行的 Node 企业级框架",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    search: {
      provider: 'local',
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
