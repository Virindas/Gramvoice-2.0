// Force light mode on load
if (typeof window !== 'undefined') {
  document.documentElement.classList.remove('dark');
  localStorage.setItem('theme', 'light');

  // Override SpeechSynthesis to automatically set language based on user session
  if (window.speechSynthesis) {
    const originalSpeak = window.speechSynthesis.speak.bind(window.speechSynthesis);
    window.speechSynthesis.speak = (utterance: SpeechSynthesisUtterance) => {
      try {
        const sessionData = localStorage.getItem('gramvoice_user_session');
        if (sessionData) {
          const session = JSON.parse(sessionData);
          const lang = session.language;
          
          let langCode = 'en-US';
          if (lang === 'हिन्दी') {
            langCode = 'hi-IN';
          } else if (lang === 'தமிழ்') {
            langCode = 'ta-IN';
          }
          
          // Only override if not explicitly set to a non-English language
          if (!utterance.lang || utterance.lang === 'en-US' || utterance.lang === 'en') {
            utterance.lang = langCode;
          }
          
          // Apply matching voice if available
          const voices = window.speechSynthesis.getVoices();
          const matchedVoice = voices.find(v => v.lang.startsWith(utterance.lang));
          if (matchedVoice) {
            utterance.voice = matchedVoice;
          }
        }
      } catch (e) {
        console.error('Error applying speech language override:', e);
      }
      originalSpeak(utterance);
    };
  }
}
export {};
