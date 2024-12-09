// docs/.vitepress/config.ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  // Configurações gerais do site
  title: 'HolySheets Documentation',
  description: 'Comprehensive documentation for HolySheets.',

  // Configuração de i18n
  locales: {
    root: {
      lang: 'en-US',
      label: 'English',
      link: '/en/' // Ao selecionar inglês no menu, ir para /en/
    },
    '/pt-br/': {
      lang: 'pt-BR',
      label: 'Português',
      link: '/pt-br/' // Ao selecionar português, ir para /pt-br/
    }
  },

  themeConfig: {
    // Configurações de seleção de idioma (aparecerá como um dropdown no topo)
    selectLanguageText: 'Languages',
    selectLanguageAriaLabel: 'Select language',

    // Definindo sidebars por locale
    locales: {
      root: {
        // Sidebar para inglês
        sidebar: [
          {
            text: 'Getting Started',
            items: [
              { text: 'Introduction', link: '/en/introduction' },
              { text: 'Quickstart', link: '/en/quickstart' },
              { text: 'Configuration', link: '/en/configuration' }
            ]
          },
          {
            text: 'Concepts',
            items: [
              { text: 'Sheets Basics', link: '/en/concepts/sheets-basics' },
              { text: 'Data Operations', link: '/en/concepts/data-operations' },
              { text: 'Querying Data', link: '/en/concepts/querying-data' },
              { text: 'Where Filters', link: '/en/concepts/where-filters' }
            ]
          },
          {
            text: 'Guides',
            items: [
              { text: 'Inserting Data', link: '/en/guides/inserting-data' },
              { text: 'Updating Data', link: '/en/guides/updating-data' },
              { text: 'Deleting Data', link: '/en/guides/deleting-data' },
              { text: 'Clearing Data', link: '/en/guides/clearing-data' },
              { text: 'Finding Data', link: '/en/guides/finding-data' }
            ]
          },
          {
            text: 'Reference',
            items: [
              { text: 'Operations', link: '/en/reference/operations' },
              { text: 'Authentication', link: '/en/reference/authentication' },
              { text: 'Error Handling', link: '/en/reference/error-handling' }
            ]
          },
          {
            text: 'Examples',
            items: [
              { text: 'Basic Queries', link: '/en/examples/basic-queries' },
              {
                text: 'Advanced Queries',
                link: '/en/examples/advanced-queries'
              }
            ]
          }
        ]
      },
      '/pt-br/': {
        // Sidebar para português
        sidebar: [
          {
            text: 'Início Rápido',
            items: [
              { text: 'Introdução', link: '/pt-br/introducao' },
              { text: 'Início Rápido', link: '/pt-br/inicio-rapido' },
              { text: 'Configuração', link: '/pt-br/configuracao' }
            ]
          },
          {
            text: 'Conceitos',
            items: [
              {
                text: 'Fundamentos das Planilhas',
                link: '/pt-br/conceitos/fundamentos-planilhas'
              },
              {
                text: 'Operações com Dados',
                link: '/pt-br/conceitos/operacoes-dados'
              },
              {
                text: 'Consultando Dados',
                link: '/pt-br/conceitos/consultando-dados'
              },
              { text: 'Filtros Where', link: '/pt-br/conceitos/filtros-where' }
            ]
          },
          {
            text: 'Guias',
            items: [
              { text: 'Inserindo Dados', link: '/pt-br/guias/inserindo-dados' },
              {
                text: 'Atualizando Dados',
                link: '/pt-br/guias/atualizando-dados'
              },
              { text: 'Deletando Dados', link: '/pt-br/guias/deletando-dados' },
              { text: 'Limpando Dados', link: '/pt-br/guias/limpando-dados' },
              {
                text: 'Encontrando Dados',
                link: '/pt-br/guias/encontrando-dados'
              }
            ]
          },
          {
            text: 'Referência',
            items: [
              { text: 'Operações', link: '/pt-br/referencia/operacoes' },
              { text: 'Autenticação', link: '/pt-br/referencia/autenticacao' },
              {
                text: 'Tratamento de Erros',
                link: '/pt-br/referencia/tratamento-erros'
              }
            ]
          },
          {
            text: 'Exemplos',
            items: [
              {
                text: 'Consultas Básicas',
                link: '/pt-br/exemplos/consultas-basicas'
              },
              {
                text: 'Consultas Avançadas',
                link: '/pt-br/exemplos/consultas-avancadas'
              }
            ]
          }
        ]
      }
    },

    // Rodapé e links sociais
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2023-present HolySheets'
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/your-repo' }]
  }
})
