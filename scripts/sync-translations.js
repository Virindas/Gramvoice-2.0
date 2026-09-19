const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

// Helper to parse an export const en = { ... } file into a JS object
function loadTranslationFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  // Match key: value pairs
  const map = {};
  const regex = /["']([^"']+)["']\s*:\s*("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const key = match[1];
    let val = match[2];
    // strip quotes
    val = val.slice(1, -1);
    // unescape quotes
    val = val.replace(/\\"/g, '"').replace(/\\'/g, "'");
    map[key] = val;
  }
  return map;
}

// Canonical overrides per locale
const CANONICAL_OVERRIDES = {
  en: {
    // Landing canonical
    "landing.badge": "Built for every villager",
    "landing.title": "Your village. Your voice.",
    "landing.title_part1": "Your village.",
    "landing.title_part2": "Your voice.",
    "landing.subtitle": "GramVoice carries your complaint straight to the Panchayat — and shows you what happens next. No queues, no paperwork, no waiting at the office.",
    "landing.role.villager": "I'm a Citizen",
    "landing.role.admin": "I'm an Administrator",
    "landing.point1.title": "Speak, don't type",
    "landing.point1.text": "Record your complaint in your own words.",
    "landing.point2.title": "Track every step",
    "landing.point2.text": "See exactly where your complaint stands.",
    "landing.point3.title": "Reaches the right desk",
    "landing.point3.text": "Straight to your Panchayat office.",

    // Login & Auth
    "passwordLabel": "Password",
    "login.forgot_pin": "Forgot PIN?",
    "login.new_here": "New here?",
    "login.phone_placeholder": "10-digit mobile number",
    "auth.verified_title": "Verified successfully",

    // Validation & Character limits
    "complaint.min_chars": "{count}/10 characters minimum",
    "complaint.detail_err": "Please add at least 10 characters of detail.",
    "complaint.submit_btn": "Submit Grievance",
    "complaint.voice_submitted": "Voice recording submitted",
    "complaint.success_toast": "Grievance submitted successfully!",
    "voiceRecordingSubmitted": "Voice recording submitted",
    "record.voice.tap": "Tap to Start Recording",
    "record.voice.hint": "Speak clearly in your chosen language",
    "record.voice.recording": "Recording... Speak clearly",

    // PIN & Forgot PIN
    "pin.set": "Set 4-Digit PIN",
    "pin.confirm": "Confirm 4-Digit PIN",
    "pin.err.4digits": "PIN must be exactly 4 digits.",
    "pin.err.mismatch": "PIN entries do not match. Please try again.",
    "pin.err.incorrect": "Incorrect PIN. Please try again.",
    "forgot_pin.title": "Reset Your PIN",
    "forgot_pin.desc": "Enter your registered phone number to reset your PIN.",
    "forgot_pin.confirm_user": "Is this you, {name}?",
    "forgot_pin.confirm_yes": "Yes, this is me",
    "forgot_pin.confirm_no": "No, this is not me",
    "forgot_pin.not_user_msg": "Please make sure you are using your own phone number.",
    "forgot_pin.remembered": "Remembered your PIN?",
    "forgot_pin.mobile_fmt": "Mobile: +91 {phone}",
    "forgot_pin.new_pin_hint": "Set a new 4-digit PIN for your account.",
    "forgot_pin.success": "PIN updated successfully! Logged in.",

    // Services
    "service.birth_cert": "Birth Certificate",
    "service.death_cert": "Death Certificate",
    "service.income_cert": "Income Certificate",
    "service.tanker": "Water Tanker Request",
    "service.streetlight": "Street Light Installation",
    "service.ration": "Ration Card Update",
    "services.err_details": "Add at least 10 characters of detail.",

    // Rules & Contacts
    "rules.empty.title": "No rules published yet",
    "rules.empty.desc": "Once your Panchayat publishes rules, you will be able to read them here.",
    "contacts.empty.title": "No contacts found",
    "contacts.empty.desc": "Try a different name or role, for example “health” or “secretary”.",
    "home.noAnnouncements": "No announcements right now.",
    "dash.announcements": "Announcements"
  },
  hi: {
    // Landing canonical
    "landing.badge": "हर ग्रामीण के लिए निर्मित",
    "landing.title": "आपका गाँव। आपकी आवाज़।",
    "landing.title_part1": "आपका गाँव।",
    "landing.title_part2": "आपकी आवाज़।",
    "landing.subtitle": "ग्रामवॉइस आपकी शिकायत सीधे पंचायत तक पहुँचाता है — और आपको आगे क्या होता है वह दिखाता है। कोई कतार नहीं, कोई कागजी कार्रवाई नहीं, दफ्तर में कोई इंतज़ार नहीं।",
    "landing.role.villager": "मैं एक नागरिक हूँ",
    "landing.role.admin": "मैं एक प्रशासक हूँ",
    "landing.point1.title": "बोलें, टाइप न करें",
    "landing.point1.text": "अपनी शिकायत अपने शब्दों में रिकॉर्ड करें।",
    "landing.point2.title": "हर कदम को ट्रैक करें",
    "landing.point2.text": "देखें कि आपकी शिकायत कहाँ तक पहुँची है।",
    "landing.point3.title": "सही पटल तक पहुँचे",
    "landing.point3.text": "सीधे आपके पंचायत कार्यालय तक।",

    // Login & Auth
    "passwordLabel": "पासवर्ड",
    "login.forgot_pin": "पिन भूल गए?",
    "login.new_here": "यहाँ नए हैं?",
    "login.phone_placeholder": "10-अंकों का मोबाइल नंबर",
    "auth.verified_title": "सफलतापूर्वक सत्यापित किया गया",

    // Validation & Character limits
    "complaint.min_chars": "न्यूनतम {count}/10 अक्षर",
    "complaint.detail_err": "कृपया कम से कम 10 अक्षरों का विवरण जोड़ें।",
    "complaint.submit_btn": "शिकायत जमा करें",
    "complaint.voice_submitted": "वॉयस शिकायत दर्ज की गई",
    "complaint.success_toast": "शिकायत सफलतापूर्वक दर्ज की गई!",
    "voiceRecordingSubmitted": "वॉयस रिकॉर्डिंग दर्ज की गई",
    "record.voice.tap": "रिकॉर्डिंग शुरू करने के लिए टैप करें",
    "record.voice.hint": "अपनी चुनी हुई भाषा में स्पष्ट रूप से बोलें",
    "record.voice.recording": "रिकॉर्डिंग जारी है... स्पष्ट बोलें",

    // PIN & Forgot PIN
    "pin.set": "4-अंकों का पिन सेट करें",
    "pin.confirm": "4-अंकों के पिन की पुष्टि करें",
    "pin.err.4digits": "पिन ठीक 4 अंकों का होना चाहिए।",
    "pin.err.mismatch": "पिन प्रविष्टियाँ मेल नहीं खाती हैं। कृपया पुनः प्रयास करें।",
    "pin.err.incorrect": "गलत पिन। कृपया पुनः प्रयास करें।",
    "forgot_pin.title": "अपना पिन रीसेट करें",
    "forgot_pin.desc": "अपना पिन रीसेट करने के लिए अपना पंजीकृत फ़ोन नंबर दर्ज करें।",
    "forgot_pin.confirm_user": "क्या यह आप हैं, {name}?",
    "forgot_pin.confirm_yes": "हाँ, यह मैं हूँ",
    "forgot_pin.confirm_no": "नहीं, यह मैं नहीं हूँ",
    "forgot_pin.not_user_msg": "कृपया सुनिश्चित करें कि आप अपने खुद के मोबाइल नंबर का उपयोग कर रहे हैं।",
    "forgot_pin.remembered": "अपना पिन याद आ गया?",
    "forgot_pin.mobile_fmt": "मोबाइल: +91 {phone}",
    "forgot_pin.new_pin_hint": "अपने खाते के लिए नया 4-अंकीय पिन सेट करें।",
    "forgot_pin.success": "पिन सफलतापूर्वक अपडेट हो गया! लॉगिन किया गया।",

    // Services
    "service.birth_cert": "जन्म प्रमाण पत्र",
    "service.death_cert": "मृत्यु प्रमाण पत्र",
    "service.income_cert": "आय प्रमाण पत्र",
    "service.tanker": "पानी के टैंकर का अनुरोध",
    "service.streetlight": "स्ट्रीट लाइट स्थापना",
    "service.ration": "राशन कार्ड अपडेट",
    "services.err_details": "कम से कम 10 अक्षरों का विवरण जोड़ें।",

    // Rules & Contacts
    "rules.empty.title": "अभी तक कोई नियम प्रकाशित नहीं हुए हैं",
    "rules.empty.desc": "जैसे ही आपकी पंचायत नियम प्रकाशित करेगी, आप उन्हें यहाँ पढ़ सकेंगे।",
    "contacts.empty.title": "कोई संपर्क नहीं मिला",
    "contacts.empty.desc": "कोई अलग नाम या पद खोजें, जैसे “स्वास्थ्य” या “सचिव”।",
    "home.noAnnouncements": "अभी कोई घोषणा नहीं है।",
    "dash.announcements": "घोषणाएँ"
  },
  ta: {
    // Landing canonical
    "landing.badge": "ஒவ்வொரு கிராமவாசிக்குமானது",
    "landing.title": "உங்கள் கிராமம். உங்கள் குரல்.",
    "landing.title_part1": "உங்கள் கிராமம்.",
    "landing.title_part2": "உங்கள் குரல்.",
    "landing.subtitle": "கிராம்வாய்ஸ் உங்கள் புகாரை நேரடியாக பஞ்சாயத்துக்கு கொண்டு சேர்க்கிறது — அடுத்தது என்ன நடக்கிறது என்பதையும் காட்டுகிறது. வரிசைகள் இல்லை, ஆவணங்கள் இல்லை, அலுவலகத்தில் காத்திருக்க வேண்டாம்.",
    "landing.role.villager": "நான் ஒரு குடிமகன்",
    "landing.role.admin": "நான் ஒரு நிர்வாகி",
    "landing.point1.title": "பேசுங்கள், தட்டச்சு செய்யாதீர்கள்",
    "landing.point1.text": "உங்கள் புகாரை உங்கள் சொந்த வார்த்தைகளில் பதிவு செய்யுங்கள்.",
    "landing.point2.title": "ஒவ்வொரு படியையும் கண்காணிக்கவும்",
    "landing.point2.text": "உங்கள் புகார் எந்த நிலையில் உள்ளது என்பதை துல்லியமாகப் பாருங்கள்.",
    "landing.point3.title": "சரியான மேசையை சென்றடையும்",
    "landing.point3.text": "நேரடியாக உங்கள் பஞ்சாயத்து அலுவலகத்திற்கு.",

    // Login & Auth
    "passwordLabel": "கடவுச்சொல்",
    "login.forgot_pin": "PIN மறந்துவிட்டதா?",
    "login.new_here": "இங்கே புதியவரா?",
    "login.phone_placeholder": "10 இலக்க கைபேசி எண்",
    "auth.verified_title": "வெற்றிகரமாக சரிபார்க்கப்பட்டது",

    // Validation & Character limits
    "complaint.min_chars": "குறைந்தது {count}/10 எழுத்துகள்",
    "complaint.detail_err": "தயவுசெய்து குறைந்தது 10 எழுத்துகள் சேர்க்கவும்.",
    "complaint.submit_btn": "புகாரை சமர்ப்பி",
    "complaint.voice_submitted": "குரல் புகார் சமர்ப்பிக்கப்பட்டது",
    "complaint.success_toast": "புகார் வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது!",
    "voiceRecordingSubmitted": "குரல் பதிவு சமர்ப்பிக்கப்பட்டது",
    "record.voice.tap": "பதிவைத் தொடங்க தொடவும்",
    "record.voice.hint": "நீங்கள் தேர்ந்தெடுத்த மொழியில் தெளிவாகப் பேசுங்கள்",
    "record.voice.recording": "பதிவு செய்யப்படுகிறது... தெளிவாகப் பேசவும்",

    // PIN & Forgot PIN
    "pin.set": "4-இலக்க PIN அமைக்கவும்",
    "pin.confirm": "4-இலக்க PIN ஐ உறுதிப்படுத்தவும்",
    "pin.err.4digits": "PIN சரியாக 4 இலக்கங்களாக இருக்க வேண்டும்.",
    "pin.err.mismatch": "PIN உள்ளீடுகள் பொருந்தவில்லை. மீண்டும் முயற்சிக்கவும்.",
    "pin.err.incorrect": "தவறான PIN. மீண்டும் முயற்சிக்கவும்.",
    "forgot_pin.title": "உங்கள் PIN ஐ மீட்டமைக்கவும்",
    "forgot_pin.desc": "உங்கள் PIN ஐ மீட்டமைக்க உங்கள் பதிவுசெய்யப்பட்ட தொலைபேசி எண்ணை உள்ளிடவும்.",
    "forgot_pin.confirm_user": "இது நீங்களா, {name}?",
    "forgot_pin.confirm_yes": "ஆம், இது நான் தான்",
    "forgot_pin.confirm_no": "இல்லை, இது நான் இல்லை",
    "forgot_pin.not_user_msg": "தயவுசெய்து உங்கள் சொந்த தொலைபேசி எண்ணைப் பயன்படுத்துகிறீர்களா என்பதை உறுதிப்படுத்தவும்.",
    "forgot_pin.remembered": "உங்கள் PIN நினைவிருக்கிறதா?",
    "forgot_pin.mobile_fmt": "மொபைல்: +91 {phone}",
    "forgot_pin.new_pin_hint": "உங்கள் கணக்கிற்கு புதிய 4 இலக்க PIN ஐ அமைக்கவும்.",
    "forgot_pin.success": "PIN வெற்றிகரமாக புதுப்பிக்கப்பட்டது! உள்நுழைந்தது.",

    // Services
    "service.birth_cert": "பிறப்பு சான்றிதழ்",
    "service.death_cert": "இறப்பு சான்றிதழ்",
    "service.income_cert": "வருமான சான்றிதழ்",
    "service.tanker": "தண்ணீர் டேங்கர் கோரிக்கை",
    "service.streetlight": "தெரு விளக்கு பொருத்துதல்",
    "service.ration": "ரேஷன் கார்டு புதுப்பிப்பு",
    "services.err_details": "குறைந்தது 10 எழுத்துகள் சேர்க்கவும்.",

    // Rules & Contacts
    "rules.empty.title": "விதிகள் இதுவரை வெளியிடப்படவில்லை",
    "rules.empty.desc": "உங்கள் பஞ்சாயத்து விதிகளை வெளியிட்டதும், அவற்றை இங்கே படிக்கலாம்.",
    "contacts.empty.title": "தொடர்புகள் எதுவும் இல்லை",
    "contacts.empty.desc": "வேறு பெயர் அல்லது பதவியை முயற்சிக்கவும்.",
    "home.noAnnouncements": "தற்போது எந்த அறிவிப்பும் இல்லை.",
    "dash.announcements": "அறிவிப்புகள்"
  }
};

function formatAsTs(locale, obj) {
  const lines = [`export const ${locale} = {`];
  const keys = Object.keys(obj).sort();
  for (const k of keys) {
    const v = obj[k].replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
    lines.push(`  "${k}": "${v}",`);
  }
  lines.push('};\n');
  return lines.join('\n');
}

function sync() {
  const locales = ['en', 'hi', 'ta'];
  for (const loc of locales) {
    const webFile = path.join(ROOT_DIR, 'web', 'src', 'i18n', 'translations', `${loc}.ts`);
    const mobileFile = path.join(ROOT_DIR, 'mobile', 'i18n', 'translations', `${loc}.ts`);

    const webDict = loadTranslationFile(webFile);
    const mobileDict = loadTranslationFile(mobileFile);

    // Merge: start with mobile, override with web, then apply canonical overrides
    const merged = { ...mobileDict, ...webDict, ...CANONICAL_OVERRIDES[loc] };

    // Also ensure mobile and web keys are preserved
    for (const [k, v] of Object.entries(mobileDict)) {
      if (!merged[k]) merged[k] = v;
    }
    for (const [k, v] of Object.entries(webDict)) {
      if (!merged[k]) merged[k] = v;
    }

    const outputContent = formatAsTs(loc, merged);

    fs.writeFileSync(webFile, outputContent, 'utf-8');
    fs.writeFileSync(mobileFile, outputContent, 'utf-8');

    console.log(`Synced ${loc}.ts -> ${Object.keys(merged).length} keys written to Web and Mobile.`);
  }
}

sync();
