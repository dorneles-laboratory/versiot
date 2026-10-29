# 🌐 VersIOT — Central Interativa de Projetos IoT & Telemetria Visual

> **VersIOT** é uma plataforma educacional e laboratório interativo de Internet das Coisas (IoT). Conecta microcontroladores (Arduino Uno, Nano, ESP32) diretamente ao navegador via **Web Serial API**, oferecendo representações visuais lúdicas e imersivas (3D e 2D), esquemas de ligação de sensores detalhados, códigos de firmware prontos para uso e monitor serial em tempo real.

🌐 **Ambiente de Produção:** [https://versiot.dorneles.dev/](https://versiot.dorneles.dev/)

---

## 🎯 Catálogo de Projetos IoT Integrados

A central já conta com **5 projetos completos** cobrindo diferentes áreas da tecnologia, robótica e ciência:

```
VersIOT (Hub Central)
├── ✈️ FlightScope   (Aeroespacial: Simulação 3D, Cockpit 1:1, HUD Militar, MPU-6050 + HC-SR04)
├── 📡 SonarScope    (Robótica: Radar Militar 180° CRT de fósforo, Servo SG90 + HC-SR04)
├── 🌱 BioScope      (Ambiente: Estufa/Terrário vivo reativo ao LDR, DHT22 + Solo)
├── 🏠 HomeScope     (Domótica: Maquete Isométrica 3D com Presença PIR e Alarme de Gás MQ-2)
└── 🫀 PulseScope    (Saúde: Monitor Biométrico Cyberpunk, Coração 3D, ECG Neon e SpO2)
```

---

### 1. ✈️ FlightScope — Telemetria Aeroespacial & HUD 3D
- **Hardware:** MPU-6050 (Acelerômetro e Giroscópio I2C de 6 eixos) + HC-SR04 (Sonar Altimétrico).
- **Representação Visual:** Simulador de caça delta 3D fotorrealista (Three.js), visão externa cinemática e cockpit 1:1, Head-Up Display (HUD) militar com altitude, velocidade, bússola e barreira holográfica LiDAR.
- **Gráficos Reativos:** Plotagem em tempo real com Recharts dos ângulos de Arfagem (Pitch), Rolamento (Roll) e Altitude Radar.

### 2. 📡 SonarScope — Radar Sonar Militar 180°
- **Hardware:** Micro Servo Motor SG90 (rotação de 15° a 165°) + Sensor Ultrassônico HC-SR04 montado na cruzeta.
- **Representação Visual:** Tela de radar circular militar verde/ciano CRT com feixe contínuo de varredura, anéis de distância (15cm a 80cm), marcações angulares, rastro com decaimento suave de fósforo e detecção holográfica de alvos com avisos sonoros/visuais de proximidade crítica.

### 3. 🌱 BioScope — Estufa & Terrário Inteligente
- **Hardware:** Sensor DHT22/DHT11 (Temperatura e Umidade do ar) + Sensor de Umidade do Solo + Fotorresistor LDR 5mm + Mini Bomba d'água / Relé.
- **Representação Visual:** Bioma virtual estilizado onde o ciclo dia/entardecer/noite responde em tempo real à luz solar incidente no LDR, chuva/nuvens animadas surgem com a umidade e uma planta botânica floresce com vigor ou fica murcha e amarelada dependendo das condições da terra.

### 4. 🏠 HomeScope — Casa Inteligente 3D (Smart Home)
- **Hardware:** Sensor de Presença PIR (HC-SR501) + Sensor de Gás/Fumaça (MQ-2) + LDR Crepuscular + LEDs de Iluminação.
- **Representação Visual:** Maquete isométrica 3D dos cômodos da casa (sala, quarto, cozinha, jardim). A lâmpada da sala acende dinamicamente na presença de pessoas, luzes externas ligam ao anoitecer e um alarme visual com partículas de fumaça é disparado em caso de vazamento.

### 5. 🫀 PulseScope — Monitor Biométrico Cyberpunk
- **Hardware:** Sensor Óptico de Pulso e Oximetria (MAX30102 / MAX30100 ou Pulse Sensor analógico).
- **Representação Visual:** Monitor médico de ficção científica com coração anatômico holográfico pulsando com fidelidade no ritmo exato dos batimentos por minuto (BPM), osciloscópio neon de ECG com traçado de ondas P-Q-R-S-T, anel de oximetria de pulso (SpO2 %) e cálculo de estresse e variabilidade cardíaca (HRV).

---

## 🔌 Recursos em Cada Projeto

Cada projeto da plataforma possui uma interface unificada em 4 abas:

| Aba | Funcionalidades |
| :--- | :--- |
| **🎮 Visualizador Interativo** | Renderização gráfica lúdica reativa com interpolação suave (60-144 FPS) aos pacotes seriais. Acompanha modo de demonstração autônomo procedural. |
| **🔌 Esquema de Sensores** | Tabela detalhada de conexões pino a pino (Arduino e ESP32), código de cores de jumpers, lista de componentes com quantidades e avisos elétricos vitais. |
| **💻 Código & Firmware** | Código completo C++ (Arduino IDE) pronto para copiar ou **baixar diretamente o arquivo `.ino`**, instruções passo a passo e bibliotecas necessárias. |
| **📟 Console Serial & Debug** | Terminal de dados brutos com auto-scroll, pausa de stream, seletor de baud rate (9600 a 115200 bps) e envio manual de comandos/payloads. |

---

## 🛠️ Stack Tecnológica

- **Frontend:** React 19, TypeScript (modo estrito), Vite 6
- **Renderização Gráfica:** Three.js, `@react-three/fiber`, `@react-three/drei`, Canvas API 2D e SVG animado
- **Gráficos e Métricas:** Recharts
- **Estilização:** CSS Modules puros (`.module.css`) — Zero Tailwind / Zero dependências utilitárias
- **Protocolo de Hardware:** Web Serial API (W3C standard), Arduino C++
- **Servidor de Produção:** Nginx 1.27 Alpine + Docker + Caddy Reverse Proxy

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- **Node.js** (v18 ou superior) e **npm**
- Navegador com suporte à Web Serial API (**Google Chrome**, **Microsoft Edge** ou **Opera**)

### 1. Clonar e Instalar Dependências
```bash
git clone https://github.com/dorneles-dev/flightscope.git versiot
cd versiot
npm install
```

### 2. Iniciar Servidor de Desenvolvimento
```bash
npm run dev
```
Acesse `http://localhost:5173/` no seu navegador.

### 3. Build de Produção
```bash
npm run build
npm run preview
```

---

## 🐳 Executando com Docker

```bash
# Build e execução do container Nginx otimizado
docker compose -f docker-compose.prod.yml up -d --build
```

---

## 👨‍💻 Autor & Créditos

Desenvolvido por **Fernando Dorneles da Silva**  
Laboratório Dorneles (Dorneles Laboratory) / Universidade Federal de Santa Maria (UFSM)  
Website: [https://dorneles.dev](https://dorneles.dev)
