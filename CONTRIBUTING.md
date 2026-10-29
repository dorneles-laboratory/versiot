# Guia de Contribuição para o VersIOT

Obrigado pelo seu interesse em contribuir para o **VersIOT**! Este é um projeto open source dedicado a democratizar o aprendizado e visualização de telemetria IoT com microcontroladores (Arduino, ESP32, Raspberry Pi Pico) e navegadores web através da Web Serial API e Three.js.

---

## 📜 Código de Conduta

Esperamos que todos os colaboradores mantenham um ambiente acolhedor, profissional e respeitoso.
- Seja construtivo e colaborativo em issues, pull requests e discussões.
- Respeite diferentes níveis de experiência: o VersIOT é utilizado tanto por iniciantes em eletrônica quanto por desenvolvedores avançados.

---

## 🚀 Como Começar

### Pré-requisitos
- **Node.js**: v20+ recomendado
- **Navegador**: Google Chrome, Microsoft Edge ou Opera (com suporte à Web Serial API)
- **Hardware (Opcional)**: ESP32 ou Arduino Uno/Nano + cabo USB de dados (a plataforma possui modo simulação autônomo completo para desenvolvimento).

### Instalação Local
```bash
git clone git@github.com:dorneles-laboratory/versiot.git
cd versiot
npm install
npm run dev
```

### Scripts Disponíveis
- `npm run dev`: Inicia o servidor de desenvolvimento Vite (porta 5190).
- `npm run build`: Executa a checagem de tipos TypeScript (`tsc -b`) e o build de produção Vite.
- `npm run preview`: Visualiza o build de produção localmente.
- `npm run test`: Executa a suíte de testes unitários com Vitest.

---

## 🛠️ Padrões de Desenvolvimento

- **Zero Tailwind:** Este projeto utiliza **exclusivamente CSS Modules** (`.module.css`) com tokens e variáveis CSS nativas.
- **Internacionalização (i18n):** Todas as strings visíveis de interface devem ser extraídas para `src/i18n/locales/pt-BR/*.json` utilizando `useTranslation()`.
- **TypeScript Estrito:** Não utilize `any`. Tipagens completas para payloads, sensores e esquemas de fiação.
- **Adicionando Novos Projetos IoT:** Consulte o guia em [`docs/ADD_A_PROJECT.md`](./docs/ADD_A_PROJECT.md).

---

## 🔄 Fluxo de Pull Requests

1. Crie uma branch para sua funcionalidade: `git checkout -b feat/meu-novo-recurso` ou correção `git checkout -b fix/ajuste-sensor`.
2. Garanta que o projeto compila sem erros: `npm run build && npm run test`.
3. Escreva commits semânticos:
   - `feat(...)`: nova funcionalidade ou projeto
   - `fix(...)`: correção de bug
   - `docs(...)`: documentação
   - `style(...)`: formatação ou ajustes visuais
   - `refactor(...)`: refatoração sem alteração de funcionalidade
4. Abra seu Pull Request detalhando as alterações e prints/vídeos das mudanças visuais.

---

## ⚖️ Licença

Ao contribuir para o VersIOT, você concorda que suas contribuições serão disponibilizadas sob a licença **Apache-2.0**.
