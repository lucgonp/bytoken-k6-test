import { sleep, group } from 'k6';
import { login } from '../scripts/auth.js';
import { SharedArray } from 'k6/data';
import papaparse from 'https://jslib.k6.io/papaparse/5.1.1/index.js';
import { Trend, Rate } from 'k6/metrics';

// Métricas customizadas
const loginDuration = new Trend('login_duration');
const loginSuccessRate = new Rate('login_success_rate');

// Carregar dados de usuários do CSV
const usuarios = new SharedArray('bytoken_usuarios', function () {
    const csvData = open('../data/users.csv');
    return papaparse.parse(csvData, { header: true }).data.filter(u => u.email && u.password);
});

export const options = {
    stages: [
        { duration: '30s', target: 5 }, // Ramp-up
        { duration: '1m', target: 5 },  // Manter
        { duration: '30s', target: 0 }, // Ramp-down
    ],
    thresholds: {
        'login_success_rate': ['rate>0.9'],
        'http_req_duration': ['p(95)<2500'],
    },
};

const BASE_URL = __ENV.BASE_URL || 'https://hom.bytoken.com.br';

export default function () {
    const usuario = usuarios[Math.floor(Math.random() * usuarios.length)];

    group('ByToken Load Test - Login', function () {
        const result = login(BASE_URL, usuario.email, usuario.password);

        loginSuccessRate.add(result.success);
        if (result.response) {
            loginDuration.add(result.response.timings.duration);
        }

        if (result.success) {
            console.log(`✅ Login OK: ${usuario.email} (${result.response.timings.duration.toFixed(0)}ms)`);
        } else {
            console.log(`❌ Login FALHOU: ${usuario.email}. Status: ${result.response ? result.response.status : 'N/A'}`);
        }
    });

    sleep(Math.random() * 2 + 1);
}
