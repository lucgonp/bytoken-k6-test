import http from 'k6/http';
import { check } from 'k6';

/**
 * Realiza o login no sistema ByToken (Laravel)
 * @param {string} baseUrl - URL base do sistema
 * @param {string} email - Email do usuário
 * @param {string} password - Senha do usuário
 * @returns {object} Objeto com sucesso e resposta
 */
export function login(baseUrl, email, password) {
    const loginUrl = `${baseUrl}/login`;
    
    // 1. GET inicial para obter o CSRF Token
    const initialResponse = http.get(loginUrl, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        }
    });

    const csrfMatch = initialResponse.body.match(/name="_token"\s+value="([^"]+)"/);
    if (!csrfMatch) {
        return { success: false, error: 'CSRF Token não encontrado', status: initialResponse.status };
    }

    const csrfToken = csrfMatch[1];

    // 2. POST do Login
    const payload = {
        _token: csrfToken,
        email: email,
        password: password,
        recaptcha: ''
    };

    const loginResponse = http.post(loginUrl, payload, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Referer': loginUrl,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        }
    });

    const success = check(loginResponse, {
        'status is 200 or 302': (r) => r.status === 200 || r.status === 302,
        'redirected to dashboard': (r) => r.url.includes('/dashboard'),
    });

    return { success, response: loginResponse };
}
