import http from 'k6/http';
import { check, group } from 'k6';

/**
 * Script de Spike Test para o endpoint de autenticação.
 * Focado em estressar o servidor com uma rampa agressiva e zero think time.
 */

export const options = {
    stages: [
        { duration: '10s', target: 200 }, // Rampa agressiva: 0 a 200 VUs em 10s
        { duration: '30s', target: 200 }, // Manter o pico
        { duration: '10s', target: 0 },   // Descompressão rápida
    ],
    thresholds: {
        http_req_duration: ['p(95)<1000'], // Threshold de Head de QA: p95 < 1000ms
        http_req_failed: ['rate<0.02'],    // Threshold de Head de QA: taxa de erro < 2%
    },
};

// Variáveis de ambiente
const BASE_URL = __ENV.BASE_URL || 'https://hom.bytoken.com.br';
const USER_EMAIL = __ENV.USER_EMAIL || 'tulio.amaral@values.com.br';
const USER_PASSWORD = __ENV.USER_PASSWORD || '12345678';

export default function () {
    const loginUrl = `${BASE_URL}/login?v=${Math.random()}`; // Cache mitigation via query param

    group('Authentication Spike Test', function () {
        // 1. GET inicial para obter o CSRF Token (necessário para o flow do Laravel)
        const initialRes = http.get(loginUrl, {
            headers: {
                'Cache-Control': 'no-cache', // Cache mitigation via headers
                'X-V-Cache': Math.random().toString(),
                'User-Agent': 'K6-Spike-Test',
            }
        });

        const csrfMatch = initialRes.body.match(/name="_token"\s+value="([^"]+)"/);
        const csrfToken = csrfMatch ? csrfMatch[1] : '';

        // 2. POST de Login - Execução de fluxo contínuo (zero think time)
        const payload = {
            _token: csrfToken,
            email: USER_EMAIL,
            password: USER_PASSWORD,
            recaptcha: ''
        };

        const res = http.post(loginUrl, payload, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cache-Control': 'no-cache',
                'X-V-Cache': Math.random().toString(),
                'Referer': loginUrl,
                'User-Agent': 'K6-Spike-Test',
            },
        });

        // Validações Solicitadas
        check(res, {
            'status is 200': (r) => r.status === 200,
            'response contains access_token': (r) => {
                // Se o sistema for Laravel/Web, o token pode estar no corpo se for uma API ou não ser retornado em HTML tradicional.
                // O requisito pede para validar o "token de acesso" no payload.
                try {
                    const body = r.json() || r.body;
                    return JSON.stringify(body).includes('access_token');
                } catch (e) {
                    return r.body.includes('access_token');
                }
            },
        });
    });

    // Zero Think Time: Nenhuma chamada ao sleep() aqui.
}
