const BASE_URL = 'http://localhost:5000/api';

// --- ГЕНЕРАТОР СЛУЧАЙНЫХ ДАННЫХ ---
const getRandomString = (len = 6) => Math.random().toString(36).substring(2, 2 + len);
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const wordBank = ["Apple", "Bicycle", "Connection", "Developer", "Elephant", "Freedom", "Galaxy", "Harmony", "Internet", "Jungle", "Kingdom", "Liberty", "Moment", "Network", "Ocean", "Planet", "Quality", "Robot", "System", "Tiger", "Universe", "Victory", "Window", "Xylophone", "Yellow", "Zebra"];

// Функция паузы (чтобы не дудосить свой же сервер слишком быстро)
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// Логи
const log = (msg) => console.log(`\x1b[36m${msg}\x1b[0m`);
const success = (msg) => console.log(`\x1b[32m  ✅ ${msg}\x1b[0m`);
const fail = (msg, err) => { console.error(`\x1b[31m❌ ${msg}\x1b[0m`, err); };

// --- ГЛАВНЫЙ СЦЕНАРИЙ ---
async function runMassiveTest() {
  log(`🚀 ЗАПУСК МАССОВОГО ТЕСТИРОВАНИЯ...`);
  console.log(`Цель: 5 юзеров, у каждого 2 диктанта по 5 слов + Удаление.`);

  const usersCreated = [];
  const allCreatedWords = []; // Сохраним все слова, чтобы потом одно удалить

  // 1. ЦИКЛ ПО ЮЗЕРАМ (5 штук)
  for (let i = 1; i <= 5; i++) {
    const email = `user_${getRandomString()}@test.com`;
    const password = 'password123';
    const name = `User ${getRandomString(4)}`;

    log(`\n👤 [Юзер ${i}/5] Регистрация (${email})...`);
    
    // Регистрация
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });
    
    if (!regRes.ok) { fail(`Не удалось создать юзера ${i}`); continue; }
    const userData = await regRes.json();
    const token = userData.token;
    
    // 2. ЦИКЛ ПО ДИКТАНТАМ (2 штуки на юзера)
    for (let d = 1; d <= 2; d++) {
      const dictTitle = `Dictation ${getRandomString(3).toUpperCase()}`;
      
      const dictRes = await fetch(`${BASE_URL}/dictations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ title: dictTitle })
      });
      
      const dictData = await dictRes.json();
      success(`Создан диктант: "${dictTitle}" (ID: ${dictData.id})`);

      // 3. ЦИКЛ ПО СЛОВАМ (5 штук на диктант)
      for (let w = 1; w <= 5; w++) {
        // Берем случайное слово из банка + добавляем суффикс, чтобы были уникальными
        const randomBase = wordBank[getRandomInt(0, wordBank.length - 1)];
        const wordText = `${randomBase}_${getRandomString(3)}`;
        const hint = `Translation for ${wordText}`;

        const wordRes = await fetch(`${BASE_URL}/words`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ 
            text: wordText, 
            hint: hint,
            dictationId: dictData.id 
          })
        });

        const wordData = await wordRes.json();
        
        // Сохраняем инфу о слове, чтобы потом потестить удаление
        allCreatedWords.push({ 
          id: wordData.id, 
          text: wordData.text, 
          token: token, // Сохраняем токен владельца, чтобы он мог удалить
          ownerEmail: email 
        });
      }
      console.log(`    ... добавлено 5 слов в "${dictTitle}"`);
    }
    usersCreated.push(userData);
  }

  log(`\n📋 ИТОГ ЗАПОЛНЕНИЯ:`);
  log(`Всего слов в базе создано за этот тест: ${allCreatedWords.length}`);

  // 4. ТЕСТ УДАЛЕНИЯ (Берем случайное слово)
  if (allCreatedWords.length > 0) {
    const victimIndex = getRandomInt(0, allCreatedWords.length - 1);
    const victim = allCreatedWords[victimIndex];

    log(`\n🗑️ [ТЕСТ УДАЛЕНИЯ] Удаляем слово "${victim.text}" (ID: ${victim.id})...`);
    log(`   (Владелец: ${victim.ownerEmail})`);

    const delRes = await fetch(`${BASE_URL}/words/${victim.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${victim.token}` }
    });

    if (delRes.ok) {
      success(`Слово успешно удалено!`);
      
      // Проверка (попытка получить это слово или проверить список - опционально)
      // В идеале GetById должен вернуть 404, но у нас пока нет метода GetWordById,
      // поэтому просто верим статусу 200 от DELETE.
    } else {
      const err = await delRes.json();
      fail(`Ошибка удаления`, err);
    }
  }

  log('\n✨✨✨ ТЕСТИРОВАНИЕ ЗАВЕРШЕНО ✨✨✨');
}

runMassiveTest();