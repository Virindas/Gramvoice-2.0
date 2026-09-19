import http from 'http';
import https from 'https';

/**
 * Free, zero-API-key translation helper using public MyMemory translation API
 * with fallback to original text if offline or unreachable.
 */
export async function translateText(text: string, targetLang: 'hi' | 'ta' | 'en'): Promise<string> {
  if (!text || text.trim() === '' || targetLang === 'en') {
    return text;
  }

  // Handle common system-generated voice complaint text
  if (text.toLowerCase() === 'voice recording submitted') {
    if (targetLang === 'hi') return 'वॉयस रिकॉर्डिंग जमा की गई';
    if (targetLang === 'ta') return 'குரல் பதிவு சமர்ப்பிக்கப்பட்டது';
  }

  const langPair = `en|${targetLang}`;
  const encodedText = encodeURIComponent(text.trim());
  const url = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=${langPair}`;

  return new Promise((resolve) => {
    const req = https.get(url, { timeout: 4000 }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed && parsed.responseData && parsed.responseData.translatedText) {
            const translated = parsed.responseData.translatedText.trim();
            if (translated && !translated.startsWith('QUERY LENGTH LIMIT EXCEEDED')) {
              return resolve(translated);
            }
          }
          resolve(text);
        } catch (e) {
          resolve(text);
        }
      });
    });

    req.on('error', () => {
      resolve(text); // Fallback gracefully to original text
    });

    req.on('timeout', () => {
      req.destroy();
      resolve(text);
    });
  });
}
