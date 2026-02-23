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
🚀 ByToken Auth → https://hom.bytoken.com.br/login
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

### 📊 Resultado do Spike Test — 23/02/2026

Teste focado no endpoint de autenticação com rampa agressiva de **0 a 200 VUs em 10 segundos**.

```
┌─────────────────────────────────────────────────────────────┐
│               SPIKE TEST — AUTENTICAÇÃO                     │
├─────────────────────────┬───────────────────────────────────┤
│ Total de requests       │ 402                               │
│ Total de iterações      │ 201                               │
│ VUs máximos             │ 200                               │
│ Requests/segundo        │ 5.04 req/s                        │
│ Dados transferidos      │ 12.4 MB recebidos                 │
├─────────────────────────┼───────────────────────────────────┤
│ Taxa sucesso login      │ 73.6% (148 / 201)                 │
│ Taxa erro HTTP          │ 0.00%  (0 / 402)                  │
│ Tempo médio resposta    │ 939ms                             │
│ p50 (mediana)           │ 1.01s                             │
│ p90                     │ 1.18s                             │
│ p95                     │ 1.24s                             │
├─────────────────────────┴───────────────────────────────────┤
│ ❌ Thresholds de p95 (1.0s) ULTRA PASSADOS                  │
│ ⚠️  Degradação severa com 200 VUs simultâneos (pico)        │
│ ✅ Validação de status 200 mantida                          │
└─────────────────────────────────────────────────────────────┘
```

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
