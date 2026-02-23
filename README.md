<p align="center">
  <img src="https://img.shields.io/badge/k6-v0.47+-7d64ff?style=for-the-badge&logo=k6" alt="k6">
  <img src="https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/Platform-Windows-0078D6?style=for-the-badge&logo=windows" alt="Platform">
  <img src="https://img.shields.io/badge/License-MIT-brightgreen?style=for-the-badge" alt="License">
</p>

# ⚡ ByToken — Performance Testing Suite

> Suíte completa de testes de performance e stress para a plataforma **ByToken** usando [Grafana k6](https://k6.io/).

<p align="center">
  <img src="https://img.shields.io/badge/Testes-Spike_&_Load-4CAF50?style=flat-square" alt="Tests">
  <img src="https://img.shields.io/badge/Max_VUs-200-E53935?style=flat-square" alt="VUs">
  <img src="https://img.shields.io/badge/Status-Active-brightgreen?style=flat-square" alt="Status">
  <img src="https://img.shields.io/badge/Usuários-Unico-2196F3?style=flat-square" alt="Users">
</p>

---

## � Índice

- [Visão Geral](#-visão-geral)
- [Arquitetura do Projeto](#-arquitetura-do-projeto)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [ByToken — Testes de Performance](#-bytoken--testes-de-performance)
- [Scripts de Execução](#-scripts-de-execução)
- [Configuração](#️-configuração)
- [Relatórios](#-relatórios)
- [🔒 Segurança](#-segurança)

---

## 🎯 Visão Geral

Este projeto visa testar a **resiliência e escalabilidade** da autenticação no sistema ByToken, focando em cenários de alta concorrência com credenciais únicas.

| Plataforma | Stack | Auth | Usuários | Objetivo |
|------------|-------|------|----------|-----------|
| **ByToken (Homologação)** | Laravel (PHP) | Sessão/Cookie + CSRF | 1 (Tulio) | Stress do Login |

### API Testada

```
🚀 ByToken Auth → https://<BYTOKEN_HOST>/login
```

---

## 📁 Arquitetura do Projeto

```
bytoken-k6-test/
├── tests/
│   ├── smoke-test.js          # Verificação básica de sanidade
│   ├── load-test.js           # Carga progressiva (5 VUs)
│   └── spike-test.js          # Spike agressivo (200 VUs em 10s)
├── scripts/
│   └── auth.js                # Lógica de extração de CSRF e Login
├── data/
│   └── users.csv              # Massa de dados de usuários
├── config/
│   ├── environment.env        # Variáveis de ambiente (ignorado no git)
│   └── k6-config.json         # Configurações globais do k6
├── reports/                   # Relatórios de execução
└── package.json               # Gerenciamento de scripts npm
```

---

## 🛠 Pré-requisitos

- [k6](https://k6.io/docs/get-started/installation/) instalado (v0.47+)
- Windows PowerShell ou terminal compatível
- Credenciais válidas no ambiente de homologação

## 📦 Instalação

```bash
git clone https://github.com/lucgonp/bytoken-k6-test.git
cd bytoken-k6-test
k6 version   # Verificar instalação
```

---

## 🚀 ByToken — Testes de Performance

### Fluxo de Autenticação

O sistema utiliza proteção **CSRF**, exigindo um fluxo em 2 etapas:
1. **GET `/login`**: Captura o token `_token` do formulário HTML.
2. **POST `/login`**: Envia os dados de autenticação incluindo o token capturado.

### Testes Disponíveis

| Teste | Arquivo | VUs Máx | Duração | Objetivo |
|-------|---------|---------|----------|----------|
| 🔍 **Smoke** | `smoke-test.js` | 1 | 30s | Validação de sanidade do script |
| 📈 **Load** | `load-test.js` | 5 | 2m | Simular carga leve e constante |
| ⚡ **Spike** | `spike-test.js` | 200 | 50s | **Estresse máximo (Zero Think Time)** |

### Uso Rápido

```bash
# Execução via NPM (Recomendado)
npm run test:smoke
npm run test:load
npm run test:spike

# Direto via K6
k6 run tests/spike-test.js
```

---

### 📊 Case de Performance: Stress & Spike Test (Autenticação)

#### 1. Cenário e Objetivo
O objetivo deste teste foi identificar o comportamento do serviço de autenticação sob um regime de carga agressiva (**Spike Test**). Simulamos a entrada súbita de **200 usuários simultâneos** em um intervalo de **10 segundos**, visando validar a elasticidade da infraestrutura e o tempo de resposta do endpoint de login.

#### 2. Resultados Obtidos
Abaixo, apresento a síntese do comportamento do sistema durante o pico de estresse:

| Métrica | Resultado | Critério de Aceite | Status |
|---------|-----------|--------------------|--------|
| **Vazão (Throughput)** | 5.04 req/s | > 10.0 req/s | ⚠️ Abaixo do esperado |
| **Tempo Médio** | 939ms | < 800ms | ⚠️ Alerta de Degradacão |
| **p95 (Latência)** | 1.24s | < 1.0s | ❌ Falha (SLA) |
| **Sucesso (Login)** | 73.6% | > 95% | ❌ Crítico |
| **Erro HTTP** | 0.00% | < 2% | ✅ Estável |

#### 3. Análise Técnica e Conclusões (Post-Mortem)
Embora a camada de rede e o servidor tenham se mantido estáveis (0% de erro HTTP), o teste revelou um gargalo de processamento na camada de aplicação ou banco de dados.

- **Vazão Insuficiente (Throughput)**: A marca de 5.04 req/s ficou significativamente abaixo do critério de aceite (> 10 req/s), evidenciando que o sistema não consegue sustentar o processamento contínuo sob a rampa de 200 VUs distribuída.
- **Divergência de Sucesso**: A taxa de 73.6% de sucesso no login, mesmo com Status 200, indica que o sistema sofreu de timeouts internos. O servidor aceitou a conexão, mas não conseguiu processar a regra de negócio (geração de Token/Sessão) a tempo para todos os usuários.
- **Degradação de Latência**: O p95 de 1.24s confirma que o sistema começou a enfileirar requisições sob alta concorrência, ultrapassando o limite aceitável de 1 segundo estabelecido para o produto.

#### 4. Plano de Mitigação Proposto
Como ação corretiva, foram sugeridas as seguintes frentes:
- **Otimização de Pool de Conexões**: Revisar o limite de conexões simultâneas do banco de dados.
- **Escalabilidade Horizontal**: Ajustar as regras de Auto-scaling para responder a picos de tráfego em janelas inferiores a 10 segundos.
- **Refatoração de Hash**: Avaliar o custo computacional do algoritmo de criptografia de senha durante processos massivos.

---

### 📈 Case de Performance: Load Test (Estabilidade de Autenticação)

#### 1. Cenário e Objetivo
Simulação de um cenário de carga constante para validar a estabilidade do sistema sob demanda típica. Diferente do Spike Test, este cenário utiliza **Think Time** (1-3s) e uma rampa gradual para atingir o estado estável.

#### 2. Resultados Obtidos
Métricas consolidadas durante a janela de estabilidade:

| Métrica | Resultado | Critério de Aceite | Status |
|---------|-----------|--------------------|--------|
| **Throughput** | 0.76 iter/s | > 2.0 req/s | ⚠️ Abaixo do esperado |
| **Tempo Médio** | 3.36s | < 400ms | ❌ Falha Crítica |
| **p95 (Latência)** | 6.30s | < 800ms | ❌ Falha (SLA) |
| **Sucesso (Login)** | 30.0% | > 99% | ❌ Crítico |
| **Erro HTTP** | 0.00% | < 1% | ✅ Estável |

#### 3. Diagnóstico do Especialista
O teste de carga confirmou que o sistema apresenta alta latência mesmo sem um pico agressivo (Spike). A taxa de sucesso de 30% indica que, sob carga constante, o sistema sofre de **contenção de recursos**.
- **Latência Elevada**: A média de 3.36s é quase 10x superior ao SLA de 400ms.
- **Falha de Negócio**: Embora não ocorram erros 5xx (Erro HTTP 0%), o sistema falha em processar o login (redirecionamento para o dashboard), indicando possíveis timeouts em microserviços internos ou deadlocks no banco de dados.

---

---

## 🔒 Segurança

> ⚠️ **IMPORTANTE**: As credenciais reais e URLs completas de infraestrutura nunca são versionadas.

- **Autenticação**: Gerenciada via variáveis de ambiente (`__ENV`).
- **Config**: Arquivos `.env` estão no `.gitignore`.
- **Mitigação de Cache**: O script utiliza parâmetros dinâmicos (`?v=${Math.random()}`) para garantir requests reais ao servidor.

---

<p align="center">
  <img src="https://img.shields.io/badge/Made%20with-❤️-E53935?style=for-the-badge" alt="Made with Love">
  <img src="https://img.shields.io/badge/k6-Performance_Testing-7d64ff?style=for-the-badge&logo=k6" alt="k6">
  <img src="https://img.shields.io/badge/ByToken-API_Testing-4CAF50?style=for-the-badge" alt="ByToken">
</p>

<p align="center">
  <strong>⚡ Suíte de Performance Testing otimizada para ByToken ⚡</strong><br>
  <a href="https://github.com/lucgonp/bytoken-k6-test">github.com/lucgonp/bytoken-k6-test</a>
</p>
