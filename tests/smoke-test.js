import { sleep, group } from 'k6';
import { login } from '../scripts/auth.js';
import { Trend, Rate } from 'k6/metrics';

// Métricas customizadas
const loginDuration = new Trend('login_duration');
const loginSuccessRate = new Rate('login_success_rate');

export const options = {
    vus: 1,
    duration: '10s',
    thresholds: {
        'login_success_rate': ['rate>0.9'],
        'http_req_duration': ['p(95)<2000'],
    },
};

const BASE_URL = __ENV.BASE_URL || 'https://hom.bytoken.com.br';
const USER_EMAIL = __ENV.USER_EMAIL || 'tulio.amaral@values.com.br';
const USER_PASSWORD = __ENV.USER_PASSWORD || '12345678';

export default function () {
    group('ByToken Login Smoke Test', function () {
        const result = login(BASE_URL, USER_EMAIL, USER_PASSWORD);

        loginSuccessRate.add(result.success);
        if (result.response) {
            loginDuration.add(result.response.timings.duration);
        }

        if (result.success) {
            console.log(`✅ Login realizado com sucesso para: ${USER_EMAIL}`);
        } else {
            console.log(`❌ Falha no login para: ${USER_EMAIL}. Status: ${result.status || 'N/A'}`);
        }
    });

    sleep(1);
}
