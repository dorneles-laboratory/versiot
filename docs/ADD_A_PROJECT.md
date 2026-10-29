# Como Adicionar um Novo Projeto IoT ao VersIOT

O **VersIOT** foi projetado para ser extensível e modular. Para adicionar um novo projeto IoT ao catálogo e ao workspace interativo, siga os passos abaixo:

---

## 1. Definir o Identificador e os Metadados

Abra `src/types/project.ts` se for necessário criar uma nova categoria ou microcontrolador.
Crie um novo arquivo de definição em `src/data/projects/<slug>.ts`:

```typescript
import { IoTProject } from '../../types/project';

export const meuProjeto: IoTProject = {
  slug: 'meu-projeto',
  name: 'Meu Projeto IoT — Título Completo',
  shortName: 'MeuProjeto',
  tagline: 'Descrição de impacto de uma frase.',
  description: 'Explicação detalhada sobre o funcionamento e sensores.',
  icon: '🚀',
  category: 'Robótica & Radar',
  categoryKey: 'robotics',
  difficulty: 'Iniciante',
  difficultyKey: 'beginner',
  microcontrollers: ['ESP32', 'Arduino'],
  featured: true,
  badge: 'Novo',
  accentColor: '#00e5ff',
  defaultBaud: 115200,
  components: [
    {
      name: 'ESP32 DevKit v1',
      quantity: 1,
      role: 'Microcontrolador',
      description: 'Executa o firmware e transmite dados pela serial.',
    },
  ],
  pinout: [
    {
      pinMicro: 'GPIO 21 (SDA)',
      pinSensor: 'SDA',
      sensor: 'Sensor X',
      wireColor: '#38bdf8',
    },
  ],
  circuitWarnings: [
    'Alimente o sensor com 3.3V para evitar sobretensão.',
  ],
  firmware: {
    filename: 'MeuProjeto.ino',
    language: 'cpp',
    code: `// Código Arduino C++ aqui...`,
    libraries: [],
    instructions: 'Abra no Arduino IDE e selecione sua placa.',
  },
  telemetryFields: [],
  samplePayload: 'VAL:123',
  payloadFormatDescription: 'Linhas no formato VAL:X',
};
```

---

## 2. Registrar no Índice de Projetos

Abra `src/data/projects/index.ts` e adicione seu projeto ao array `ALL_PROJECTS`:

```typescript
import { meuProjeto } from './meu-projeto';

export const ALL_PROJECTS: IoTProject[] = [
  // ...outros projetos
  meuProjeto,
];
```

---

## 3. Adicionar o Parser Serial e o Gerador de Simulação

1. Em `src/types/telemetry.ts`: defina a interface dos dados (ex: `MeuProjetoPoint`) e adicione ao tipo `UniversalTelemetryData`.
2. Em `src/utils/parseSerial.ts`: adicione o branch de parsing para as linhas recebidas pela porta USB.
3. Em `src/utils/simulationGenerators.ts`: adicione a função geradora procedural `generateMeuProjetoSimPoint()`.

---

## 4. Criar o Visualizador (3D ou 2D)

Crie seu componente visualizador em `src/components/Visualizers/MeuProjetoVisualizer/` com seu respectivo CSS Module.

No arquivo `src/pages/WorkspacePage/WorkspacePage.tsx`, plugue o componente na aba `visualizer`:

```tsx
{project.slug === 'meu-projeto' && <MeuProjetoVisualizer telemetry={meuProjetoPoint} />}
```

---

## 5. Validar Testes e Build

Execute:
```bash
npm run test
npm run build
```

Pronto! Seu projeto agora faz parte da galeria e do workspace do VersIOT.
