# Guia de Internacionalização & Tradução (i18n)

O **VersIOT** utiliza a biblioteca `react-i18next` com namespaces modulares para todas as strings da interface.

---

## 📁 Estrutura de Arquivos

As traduções residem em `src/i18n/locales/<idioma>/`:

- `common.json`: Marca, termos globais de navegação, ações de botões e rodapé.
- `landing.json`: Textos da Landing Page (Hero, Como Funciona, Destaques, Recursos, CTA final).
- `catalog.json`: Textos do Catálogo de Projetos (Filtros, Busca, Cards, Estado vazio).
- `workspace.json`: Textos do Espaço de Trabalho (Topbar, Abas, Diagrama de sensores, Código, Terminal).
- `projects.json`: Nomes, descrições e títulos específicos de cada projeto IoT.
- `errors.json`: Mensagens de erro de hardware, porta USB e avisos do navegador.

---

## 🌐 Como Adicionar um Novo Idioma (ex: Inglês `en`)

1. Crie a pasta `src/i18n/locales/en/`.
2. Copie os 6 arquivos JSON de `src/i18n/locales/pt-BR/` para a nova pasta e traduza os valores mantendo as chaves exatas.
3. No arquivo `src/i18n/index.ts`:
   - Importe os arquivos JSON de `en`.
   - Adicione `'en'` ao objeto `resources` e ao array `supportedLngs`.
4. Execute `npm run test` para validar a inicialização e tipagens.
