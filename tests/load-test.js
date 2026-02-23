import { sleep, group, check } from 'k6';
import { login } from '../scripts/auth.js';
import { SharedArray } from 'k6/data';
import papaparse from 'https://jslib.k6.io/papaparse/5.1.1/index.js';
import { Trend, Rate } from 'k6/metrics';

// Métricas customizadas para análise granular
const loginDuration = new Trend('login_duration', true);
const loginSuccessRate = new Rate('login_success_rate');

// Carregar dados de usuários do CSV
const usuarios = new SharedArray('bytoken_usuarios', function () {
    const csvData = open('../data/users.csv');
    return papaparse.parse(csvData, { header: true }).data.filter(u => u.email && u.password);
});

export const options = {
    // Cenário Operacional: Dia típico de alta demanda
    stages: [
        { duration: '2m', target: 100 }, // Ramp-up: 0 a 100 VUs
        { duration: '10m', target: 100 }, // Plateau: Estabilidade em 100 VUs
        { duration: '2m', target: 0 },   // Ramp-down: Descompressão
    ],
    thresholds: {
        'http_req_duration': ['avg<400', 'p(95)<800'], // SLA de Tempo de Resposta
        'http_req_failed': ['rate==0'],               // Rigorosamente 0% de erro
        'login_success_rate': ['rate>0.99'],          // Taxa de sucesso de negócio
    },
    tags: {
        name: 'ByToken-Auth-Load-Test',
        environment: 'homologation',
        scenario: 'High-Demand-Daily',
    },
};

const BASE_URL = __ENV.BASE_URL || 'https://hom.bytoken.com.br';

export default function () {
    const usuario = usuarios[Math.floor(Math.random() * usuarios.length)];

    group('ByToken - Fluxo de Autenticação (Load Test)', function () {
        const result = login(BASE_URL, usuario.email, usuario.password);

        // Registro de métricas customizadas
        loginSuccessRate.add(result.success);
        if (result.response) {
            loginDuration.add(result.response.timings.duration, { scenario: 'load_test' });
        }

        // Validação Adicional: Verifica se o token está no corpo (JSON ou HTML)
        const hasToken = result.response && (
            result.response.body.includes('access_token') ||
            result.response.body.includes('_token')
        );

        check(result.response, {
            'status is 200 or 302': (r) => r.status === 200 || r.status === 302,
            'token is present in response': () => hasToken,
        }, { name: 'Audit: Authentication Success' });

        if (!result.success) {
            console.error(`❌ Falha Crítica: ${usuario.email} | Status: ${result.response ? result.response.status : 'Timeout'}`);
        }
    });

    // Think Time Progressivo: Simula comportamento humano (1-3s)
    // Evita o efeito de "atropelamento" do Spike Test.
    sleep(Math.random() * 2 + 1);
}
