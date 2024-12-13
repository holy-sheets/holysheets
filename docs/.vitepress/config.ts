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
          text: '🇺🇸 English',
          link: '/en'
        },
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
      ],
      '/pt-br/': [
        { text: '🇧🇷 Português', link: '/pt-br/' },
        {
          text: 'Introdução',
          link: '/pt-br/introducao'
        },
        {
          text: 'Início Rápido',
          link: '/pt-br/inicio-rapido'
        },
        {
          text: 'Conceitos',
          items: [
            {
              text: 'Fundamentos de Planilhas',
              link: '/pt-br/conceitos/fundamentos-planilhas'
            },
            {
              text: 'Consultando Dados',
              link: '/pt-br/conceitos/consultando-dados'
            },
            {
              text: 'Operações de Dados',
              link: '/pt-br/conceitos/operacoes-dados'
            },
            { text: 'Filtros Where', link: '/pt-br/conceitos/filtros-where' }
          ]
        },
        {
          text: 'Guias',
          items: [
            { text: 'Inserindo Dados', link: '/pt-br/guias/inserindo-dados' },
            {
              text: 'Encontrando Dados',
              link: '/pt-br/guias/encontrando-dados'
            },
            {
              text: 'Atualizando Dados',
              link: '/pt-br/guias/atualizando-dados'
            },
            { text: 'Deletando Dados', link: '/pt-br/guias/deletando-dados' },
            { text: 'Limpando Dados', link: '/pt-br/guias/limpando-dados' }
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
        },
        {
          text: 'Referência',
          items: [
            { text: 'Autenticação', link: '/pt-br/referencia/autenticacao' },
            { text: 'Operações', link: '/pt-br/referencia/operacoes' },
            {
              text: 'Tratamento de Erros',
              link: '/pt-br/referencia/tratamento-erros'
            }
          ]
        },
        {
          text: 'Configuração',
          link: '/pt-br/configuracao'
        }
      ]
    }
  }
})
