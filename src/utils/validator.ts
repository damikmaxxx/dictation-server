
export const validateWordContent = (text: string, language: string) => {
  if (text.length > 200) {
    throw new Error(`Word "${text.slice(0, 20)}..." is too long (max 200 chars).`);
  }

  if (language === 'en') {
    const hasCyrillic = /[а-яА-ЯёЁ]/.test(text);
    if (hasCyrillic) {
      throw new Error(`English dictation cannot contain Russian text: "${text}"`);
    }
  }

  if (language === 'ru') {
    const hasLatin = /[a-zA-Z]/.test(text);
    if (hasLatin) {
      throw new Error(`Russian dictation cannot contain English text: "${text}"`);
    }
  }
  
  const hasLetters = /[a-zA-Zа-яА-ЯёЁ0-9]/.test(text);
  if (!hasLetters) {
      throw new Error(`Word must contain at least one letter or number: "${text}"`);
  }

  return true;
};