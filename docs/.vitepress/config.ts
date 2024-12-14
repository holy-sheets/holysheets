import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'HolySheets!',
  description: 'Documentation for HolySheets!',
  themeConfig: {
    logo: '/logo.svg',
    search: {
      provider: 'local'
    },
    sidebar: {
      '/en/': [
        {
          text: 'Introduction',
          link: '/en/introduction'
        },
        {
          text: 'Quickstart',
          link: '/en/quickstart'
        },
        {
          text: 'Concepts',
          items: [
            { text: 'Sheets Basics', link: '/en/concepts/sheets-basics' },
            { text: 'Querying Data', link: '/en/concepts/querying-data' },
            { text: 'Data Operations', link: '/en/concepts/data-operations' },
            { text: 'Where Filters', link: '/en/concepts/where-filters' }
          ]
        },
        {
          text: 'Authentication',
          link: '/en/authentication/authentication',
          items: [
            {
              text: 'OAuth2',
              link: '/en/authentication/oauth2'
            },
            {
              text: 'JWT',
              link: '/en/authentication/jwt'
            }
          ]
        },
        {
          text: 'Guides',
          items: [
            { text: 'Inserting Data', link: '/en/guides/inserting-data' },
            { text: 'Finding Data', link: '/en/guides/finding-data' },
            { text: 'Updating Data', link: '/en/guides/updating-data' },
            { text: 'Deleting Data', link: '/en/guides/deleting-data' },
            { text: 'Clearing Data', link: '/en/guides/clearing-data' }
          ]
        },
        {
          text: 'Examples',
          items: [
            { text: 'Basic Queries', link: '/en/examples/basic-queries' },
            { text: 'Advanced Queries', link: '/en/examples/advanced-queries' }
          ]
        },
        {
          text: 'Reference',
          items: [
            { text: 'Authentication', link: '/en/reference/authentication' },
            { text: 'Error Handling', link: '/en/reference/error-handling' },
            { text: 'Operations', link: '/en/reference/operations' }
          ]
        },
        {
          text: 'Configuration',
          link: '/en/configuration'
        }
      ]
    },
    editLink: {
      pattern: 'https://github.com/holy-sheets/holysheets/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    }
  }
})
