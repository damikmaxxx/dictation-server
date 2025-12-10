// test-tokens.js - Скрипт для проверки двух токенов и их продления

const BASE_URL = 'http://localhost:5000/api';

// --- ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ (имитируют память браузера) ---
const TEST_USER_EMAIL = `test_double_token_${Date.now()}@example.com`;
const TEST_PASSWORD = 'password123';

let accessToken = ''; // Хранится в памяти фронтенда
let refreshToken = ''; // Должен храниться в HttpOnly Cookie

// --- Утилиты ---
const log = (msg) => console.log(`\x1b[36m${msg}\x1b[0m`);
const success = (msg) => console.log(`\x1b[32m  ✅ ${msg}\x1b[0m`);
const fail = (msg, err) => { 
  console.error(`\x1b[31m❌ ${msg}\x1b[0m`);
  if (err) console.error(err);
  process.exit(1); 
};

// --- ФУНКЦИИ ИМИТАЦИИ БРАУЗЕРА ---

// 1. Имитация установки куки (поскольку Node.js не устанавливает куки в браузере)
function setCookie(res) {
    const setCookieHeader = res.headers.get('set-cookie');
    if (!setCookieHeader) return false;

    // Ищем refreshToken в заголовке
    const match = setCookieHeader.match(/refreshToken=([^;]+)/i);
    if (match && match[1]) {
        refreshToken = match[1]; // Сохраняем "куку" в переменной
        return true;
    }
    return false;
}

// 2. Имитация запроса, который автоматически прикрепляет куку
async function refreshTokens() {
    log('   -> Имитация запроса на /auth/refresh...');
    
    // В Node.js мы должны вручную прикрепить "куку"
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': `refreshToken=${refreshToken}` // <--- КЛЮЧЕВОЙ МОМЕНТ
        }
    });
    
    // Обрабатываем ответ (получаем новый Access Token и новую Куку)
    if (!res.ok) throw await res.json();
    
    const data = await res.json();
    
    // 1. Сохраняем новый Access Token
    accessToken = data.accessToken;
    
    // 2. Обновляем Refresh Token (имитируем новую куку)
    if (setCookie(res)) {
        success('Refresh Token обновлен (имитация новой куки)');
    } else {
        fail('Refresh Token не был обновлен в куках!');
    }
    
    return data;
}

// 3. Имитация защищенного API запроса
async function protectedRequest(endpoint, expectedStatus = 200) {
    log(`   -> Имитация запроса на ${endpoint} с Access Token...`);
    
    const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    if (res.status === expectedStatus) {
        success(`Защищенный запрос на ${endpoint} успешен (Status ${res.status})`);
        return true;
    } else {
        fail(`Защищенный запрос на ${endpoint} провален! Ожидали ${expectedStatus}, получили ${res.status}`, await res.json());
    }
}


// --- ГЛАВНЫЙ СЦЕНАРИЙ ТЕСТИРОВАНИЯ ---
async function runTest() {
    // 0. ПРЕДВАРИТЕЛЬНАЯ НАСТРОЙКА
    log(`\n======================================================`);
    log(`ШАГ 0: Подготовка (Создание тестового пользователя)`);
    log(`======================================================`);
    try {
        const res = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: TEST_USER_EMAIL, password: TEST_PASSWORD, name: 'Test Token' })
        });
        
        if (!res.ok) throw await res.json();
        const data = await res.json();
        
        accessToken = data.accessToken;
        
        // Получаем Refresh Token из заголовков ответа
        if (!setCookie(res)) {
            fail('Refresh Token не был установлен в куках после регистрации!');
        }

        success(`Регистрация и получение токенов для ${TEST_USER_EMAIL} (Access Token, Refresh Cookie)`);
    } catch (e) {
        fail('Критическая ошибка на регистрации', e);
    }
    
    // 1. ПРОВЕРКА РАБОТОСПОСОБНОСТИ (Access Token)
    log(`\n======================================================`);
    log(`ШАГ 1: Проверка Access Token'а`);
    log(`======================================================`);
    await protectedRequest('/auth/me'); // Должен сработать, токен свежий

    // 2. ИМИТАЦИЯ ПРОСРОЧКИ (ХАК)
    log(`\n======================================================`);
    log(`ШАГ 2: Имитация просрочки Access Token'а (ждем 100мс)`);
    log(`======================================================`);
    // Просто меняем Access Token на невалидный (имитируем просрочку)
    accessToken = 'invalid.' + accessToken.split('.')[1] + '.token'; 
    
    // Проверка, что запрос НЕ СРАБОТАЕТ
    log('   -> Проверяем, что запрос с невалидным токеном возвращает 401...');
    const invalidRes = await fetch(`${BASE_URL}/auth/me`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    if (invalidRes.status === 401) {
        success('Запрос с невалидным токеном отклонен (401)! (Имитация просрочки)');
    } else {
        fail(`Запрос с невалидным токеном не вернул 401, а вернул ${invalidRes.status}`);
    }


    // 3. ПРОВЕРКА ОБНОВЛЕНИЯ (Refresh)
    log(`\n======================================================`);
    log(`ШАГ 3: Запрос на Обновление Токена (/refresh)`);
    log(`======================================================`);
    try {
        await refreshTokens(); // Получаем новый, свежий Access Token
        success('Обновление токена прошло успешно!');
    } catch (e) {
        fail('Ошибка при обновлении токена (Refresh Token не сработал!)', e);
    }
    
    // 4. ПРОВЕРКА НОВОГО ACCESS TOKEN'А
    log(`\n======================================================`);
    log(`ШАГ 4: Проверка НОВОГО Access Token'а`);
    log(`======================================================`);
    await protectedRequest('/auth/me'); // Должен сработать, потому что токен свежий

    log('\n\n\x1b[35m[ФИНАЛ] Двухтокенная система работает по всей цепочке! 🎉\x1b[0m');
}

runTest();