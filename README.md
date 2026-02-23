# ByToken K6 Performance Testing

Repositório de testes de performance utilizando K6 para o sistema ByToken.

## 🛠️ Tecnologias
- [K6](https://k6.io/)
- JavaScript

## 🚀 Como Executar
1. Certifique-se de ter o K6 instalado.
2. Configure as variáveis de ambiente no arquivo `config/environment.env` (não versionado com dados reais).
3. Execute os testes:
   - **Smoke Test**: `npm run test:smoke`
   - **Load Test**: `npm run test:load`
   - **Spike Test**: `npm run test:spike`

## 📊 Resultado do Spike Test — 23/02/2026

Teste focado no endpoint de autenticação com rampa agressiva de 0 a 200 VUs em 10 segundos, utilizando uma única credencial de acesso.

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

## 🔒 Proteção de Dados
As informações sensíveis (URLs de homologação e credenciais) estão protegidas e devem ser gerenciadas via variáveis de ambiente.

- **Base URL**: `https://***.*******.com.br`
- **Usuário**: `t****.******@******.***.br`
- **Senha**: `********`
