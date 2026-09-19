import { useState, useEffect } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { api } from "./api";
import type { Complaint, Rule, Announcement } from "./mock-data";

export interface TranslatedContent {
  title: string;
  body: string;
  reply?: string;
  category?: string;
  isTranslated: boolean;
  loading: boolean;
}

const SEED_COMPLAINTS_I18N: Record<string, {
  hi: { title: string; body: string; reply?: string; category?: string };
  ta: { title: string; body: string; reply?: string; category?: string };
}> = {
  "GV-2041": {
    hi: {
      title: "मंदिर के पास की स्ट्रीट लाइट काम नहीं कर रही है",
      body: "अम्मन मंदिर जंक्शन के पास की स्ट्रीट लाइट ग्यारह दिनों से काम नहीं कर रही है। शाम 7 बजे के बाद बहुत अंधेरा हो जाता है और ट्यूशन से लौटने वाले बच्चे वहां चलने से डरते हैं।",
      reply: "एक इलेक्ट्रीशियन को नियुक्त किया गया है। नया सामान इस सप्ताह आ जाएगा।",
      category: "बिजली",
    },
    ta: {
      title: "கோவில் அருகே உள்ள தெருவிளக்கு எரியவில்லை",
      body: "அம்மன் கோவில் சந்திப்பு அருகே உள்ள தெருவிளக்கு பதினொரு நாட்களாக எரியவில்லை. இரவு 7 மணிக்கு மேல் மிகவும் இருட்டாக இருப்பதால், டியூஷனில் இருந்து திரும்பும் குழந்தைகள் அங்கு செல்ல பயப்படுகிறார்கள்.",
      reply: "மின்சார பணியாளர் நியமிக்கப்பட்டுள்ளார். மாற்று உபகரணம் இந்த வாரம் வந்துவிடும்.",
      category: "மின்சாரம்",
    },
  },
  "GV-2038": {
    hi: {
      title: "पीने के पानी का टैंकर नहीं आया",
      body: "सोमवार और मंगलवार को हमारी गली में पानी का टैंकर नहीं आया। इससे बीस परिवार प्रभावित हैं।",
      reply: "टैंकर का मार्ग ठीक कर दिया गया है। बुधवार से आपूर्ति फिर से शुरू हो गई है।",
      category: "जल आपूर्ति",
    },
    ta: {
      title: "குடிநீர் டேங்கர் லாரி வரவில்லை",
      body: "திங்கள் மற்றும் செவ்வாய்க்கிழமைகளில் எங்கள் தெருவுக்கு தண்ணீர் டேங்கர் வரவில்லை. இருபது குடும்பங்கள் பாதிக்கப்பட்டுள்ளன.",
      reply: "டேங்கர் வழித்தடம் சரிசெய்யப்பட்டது. புதன்கிழமை முதல் விநியோகம் மீண்டும் தொடங்கப்பட்டது.",
      category: "குடிநீர்",
    },
  },
  "GV-2035": {
    hi: {
      title: "नहर के बांध वाले रास्ते को चौड़ा करने का अनुरोध",
      body: "फसल कटाई के मौसम में ट्रैक्टरों के लिए नहर के बांध वाला रास्ता बहुत संकरा है। जून से पहले इसे चौड़ा करने का अनुरोध है।",
      category: "सड़कें",
    },
    ta: {
      title: "கால்வாய் கரை சாலையை அகலப்படுத்த கோரிக்கை",
      body: "அறுவடை காலத்தில் டிராக்டர்கள் செல்வதற்கு கால்வாய் கரை சாலை மிகவும் குறுகலாக உள்ளது. ஜூன் மாதத்திற்குள் அகலப்படுத்த வேண்டுகிறோம்.",
      category: "சாலைகள்",
    },
  },
  "GV-2030": {
    hi: {
      title: "वार्ड 4 में कचरा नहीं उठाया गया",
      body: "स्कूल परिसर के पीछे दो सप्ताह से कचरा जमा हो रहा है। वहां से दुर्गंध आ रही है और आवारा कुत्ते घूम रहे हैं।",
      reply: "यह स्थान नगरपालिका सीमा के अंतर्गत आता है, पंचायत के नहीं। कृपया नगर कार्यालय में इसकी शिकायत दर्ज करें।",
      category: "स्वच्छता",
    },
    ta: {
      title: "வார்டு 4-ல் குப்பை சேகரிக்கப்படவில்லை",
      body: "பள்ளி வளாகத்தின் பின்னால் இரண்டு வாரங்களாக குப்பைகள் தேங்கி கிடக்கின்றன. துர்நாற்றம் வீசுகிறது மற்றும் தெருநாய்கள் சுற்றித் திரிகின்றன.",
      reply: "இந்த இடம் நகராட்சி எல்லைக்குள் வருகிறது, பஞ்சாயத்து எல்லைக்குள் இல்லை. நகராட்சி அலுவலகத்தில் புகார் செய்யவும்.",
      category: "சுகாதாரம்",
    },
  },
};

export const CATEGORIES_I18N: Record<string, { hi: string; ta: string }> = {
  "water": { hi: "जल आपूर्ति", ta: "குடிநீர் வழங்கல்" },
  "water supply": { hi: "जल आपूर्ति", ta: "குடிநீர் வழங்கல்" },
  "sanitation": { hi: "स्वच्छता", ta: "சுகாதாரம்" },
  "waste": { hi: "कचरा प्रबंधन", ta: "திடக்கழிவு மேலாண்மை" },
  "electricity": { hi: "बिजली", ta: "மின்சாரம்" },
  "roads": { hi: "सड़कें", ta: "சாலைகள்" },
  "road": { hi: "सड़कें", ta: "சாலைகள்" },
  "health": { hi: "स्वास्थ्य", ta: "சுகாதாரம் / மருத்துவம்" },
  "street light": { hi: "स्ट्रीट लाइट", ta: "தெரு விளக்குகள்" },
  "street lights": { hi: "स्ट्रीट लाइट", ta: "தெரு விளக்குகள்" },
  "education": { hi: "शिक्षा", ta: "கல்வி" },
  "general": { hi: "सामान्य", ta: "பொதுவானவை" },
  "other": { hi: "अन्य", ta: "மற்றவை" },
};

export const RULES_I18N: Record<string, {
  hi: { section: string; title: string; body: string };
  ta: { section: string; title: string; body: string };
}> = {
  "r1": {
    hi: {
      section: "जल",
      title: "साझा बोरवेल का समय",
      body: "सार्वजनिक बोरवेल का उपयोग सुबह 6 से 9 बजे और शाम 5 से 7 बजे के बीच किया जा सकता है। इन घंटों के अलावा मोटर पंप बंद रखने होंगे।",
    },
    ta: {
      section: "நீர்",
      title: "பொது போர்வெல் நேரம்",
      body: "பொது போர்வெல்லை காலை 6 மணி முதல் 9 மணி வரையிலும், மாலை 5 மணி முதல் 7 மணி வரையிலும் பயன்படுத்தலாம். இந்த நேரங்களுக்கு வெளியே மோட்டார் பம்புகள் அணைக்கப்பட வேண்டும்.",
    },
  },
  "r2": {
    hi: {
      section: "स्वच्छता",
      title: "कचरा पृथक्करण",
      body: "गीला और सूखा कचरा अलग-अलग डिब्बों में रखना आवश्यक है। कचरा संग्रहण प्रत्येक मंगलवार और शुक्रवार सुबह 8 बजे से पहले होता है।",
    },
    ta: {
      section: "சுகாதாரம்",
      title: "குப்பைகளை பிரித்தல்",
      body: "மக்கும் மற்றும் மக்காத குப்பைகளை தனித்தனி தொட்டிகளில் வைக்க வேண்டும். செவ்வாய் மற்றும் வெள்ளிக்கிழமை காலை 8 மணிக்கு முன் சேகரிக்கப்படும்.",
    },
  },
  "r3": {
    hi: {
      section: "समुदाय",
      title: "ग्राम सभा की बैठकें",
      body: "ग्राम सभा की बैठक प्रत्येक माह के पहले रविवार को सुबह 10 बजे पंचायत भवन में होती है। प्रत्येक परिवार एक प्रतिनिधि भेज सकता है।",
    },
    ta: {
      section: "சமூகம்",
      title: "கிராம சபை கூட்டங்கள்",
      body: "ஒவ்வொரு மாதமும் முதல் ஞாயிற்றுக்கிழமை காலை 10 மணிக்கு பஞ்சாயத்து மண்டபத்தில் கிராம சபை கூடுகிறது. ஒவ்வொரு குடும்பமும் ஒரு பிரதிநிதியை அனுப்பலாம்.",
    },
  },
  "r4": {
    hi: {
      section: "भूमि और मवेशी",
      title: "सार्वजनिक भूमि पर चराई",
      body: "स्कूल के खेल के मैदान और मंदिर के तालाब के बांध को छोड़कर सार्वजनिक भूमि पर मवेशी चर सकते हैं। फसलों को नुकसान होने पर 24 घंटे के भीतर सूचना दी जानी चाहिए।",
    },
    ta: {
      section: "நிலம் மற்றும் கால்நடைகள்",
      title: "பொது நிலத்தில் மேய்ச்சல்",
      body: "பள்ளி விளையாட்டு மைதானம் மற்றும் கோவில் குளம் கரையைத் தவிர பொது நிலத்தில் கால்நடைகள் மேயலாம். பயிர்களுக்கு சேதம் ஏற்பட்டால் 24 மணி நேரத்திற்குள் தெரிவிக்க வேண்டும்.",
    },
  },
};

export const ANNOUNCEMENTS_I18N: Record<string, {
  hi: { title: string; body: string };
  ta: { title: string; body: string };
}> = {
  "n1": {
    hi: {
      title: "रविवार को निःशुल्क स्वास्थ्य शिविर",
      body: "पंचायत भवन में सुबह 9 बजे से दोपहर 3 बजे तक सामान्य स्वास्थ्य एवं नेत्र जांच शिविर आयोजित किया जाएगा। अपना राशन कार्ड साथ लाएं।",
    },
    ta: {
      title: "ஞாயிற்றுக்கிழமை இலவச மருத்துவ முகாம்",
      body: "காலை 9 மணி முதல் மாலை 3 மணி வரை பஞ்சாயத்து மண்டபத்தில் பொது மருத்துவம் மற்றும் கண் பரிசோதனை முகாம் நடைபெறும். உங்கள் ரேஷன் கார்டை கொண்டு வாருங்கள்.",
    },
  },
  "n2": {
    hi: {
      title: "जलापूर्ति रखरखाव कार्य",
      body: "पाइपलाइन मरम्मत के कारण गुरुवार को सुबह 10 बजे से दोपहर 2 बजे तक वार्ड 2 और 4 में जलापूर्ति बंद रहेगी।",
    },
    ta: {
      title: "குடிநீர் விநியோக பராமரிப்பு",
      body: "பைப்லைன் பழுது காரணமாக வியாழக்கிழமை காலை 10 மணி முதல் மதியம் 2 மணி வரை வார்டு 2 மற்றும் 4-ல் குடிநீர் விநியோகம் நிறுத்தப்படும்.",
    },
  },
};

export const CONTACT_ROLES_I18N: Record<string, { hi: string; ta: string }> = {
  "Panchayat President": { hi: "पंचायत अध्यक्ष", ta: "பஞ்சாயத்து தலைவர்" },
  "Panchayat Secretary": { hi: "पंचायत सचिव", ta: "பஞ்சாயத்து செயலாளர்" },
  "Primary Health Centre": { hi: "प्राथमिक स्वास्थ्य केंद्र", ta: "ஆரம்ப சுகாதார நிலையம்" },
  "Power complaints": { hi: "बिजली शिकायतें", ta: "மின்சார புகார்கள்" },
  "Anganwadi Worker": { hi: "आंगनवाड़ी कार्यकर्ता", ta: "அங்கன்வாடி பணியாளர்" },
  "Emergency": { hi: "आपातकालीन", ta: "அவசர உதவி" },
};

export const SERVICE_TYPES_I18N: Record<string, { hi: string; ta: string }> = {
  "Birth Certificate": { hi: "जन्म प्रमाण पत्र", ta: "பிறப்புச் சான்றிதழ்" },
  "Death Certificate": { hi: "मृत्यु प्रमाण पत्र", ta: "இறப்புச் சான்றிதழ்" },
  "Income Certificate": { hi: "आय प्रमाण पत्र", ta: "வருமானச் சான்றிதழ்" },
  "Water Tanker Request": { hi: "पानी के टैंकर का अनुरोध", ta: "தண்ணீர் டேங்கர் கோரிக்கை" },
  "Street Light Installation": { hi: "स्ट्रीट लाइट स्थापना", ta: "தெருவிளக்கு அமைத்தல்" },
  "Ration Card Update": { hi: "राशन कार्ड अपडेट", ta: "ரேஷன் கார்டு திருத்தம்" },
};

export const COMMON_REPLIES_I18N: Record<string, { hi: string; ta: string }> = {
  "an electrician has been assigned. replacement fitting arrives this week.": {
    hi: "एक इलेक्ट्रीशियन को नियुक्त किया गया है। नया सामान इस सप्ताह आ जाएगा।",
    ta: "மின்சார பணியாளர் நியமிக்கப்பட்டுள்ளார். மாற்று உபகரணம் இந்த வாரம் வந்துவிடும்.",
  },
  "tanker route corrected. supply resumed from wednesday.": {
    hi: "टैंकर का मार्ग ठीक कर दिया गया है। बुधवार से आपूर्ति फिर से शुरू हो गई है।",
    ta: "டேங்கர் வழித்தடம் சரிசெய்யப்பட்டது. புதன்கிழமை முதல் விநியோகம் மீண்டும் தொடங்கப்பட்டது.",
  },
  "this location falls under municipal jurisdiction, not panchayat. please lodge at the municipal office.": {
    hi: "यह स्थान नगरपालिका सीमा के अंतर्गत आता है, पंचायत के नहीं। कृपया नगर कार्यालय में इसकी शिकायत दर्ज करें।",
    ta: "இந்த இடம் நகராட்சி எல்லைக்குள் வருகிறது, பஞ்சாயத்து எல்லைக்குள் இல்லை. நகராட்சி அலுவலகத்தில் புகார் செய்யவும்.",
  },
  "electrician assigned": {
    hi: "इलेक्ट्रीशियन नियुक्त किया गया",
    ta: "மின்சார பணியாளர் நியமிக்கப்பட்டுள்ளார்",
  },
  "supply resumed": {
    hi: "आपूर्ति फिर से शुरू हो गई",
    ta: "விநியோகம் மீண்டும் தொடங்கப்பட்டது",
  },
  "work in progress": {
    hi: "कार्य प्रगति पर है",
    ta: "பணி நடைபெற்று வருகிறது",
  },
  "resolved": {
    hi: "समाधान किया गया",
    ta: "தீர்க்கப்பட்டது",
  },
  "under inspection": {
    hi: "निरीक्षण जारी है",
    ta: "ஆய்வு செய்யப்பட்டு வருகிறது",
  },
  "assigned to maintenance team": {
    hi: "रखरखाव दल को सौंपा गया",
    ta: "பராமரிப்புக் குழுவிற்கு ஒதுக்கப்பட்டது",
  },
  "action taken": {
    hi: "कार्रवाई की गई",
    ta: "நடவடிக்கை எடுக்கப்பட்டது",
  },
  "field verification completed": {
    hi: "क्षेत्र सत्यापन पूर्ण हुआ",
    ta: "கள ஆய்வு முடிந்தது",
  },
  "inspection scheduled": {
    hi: "निरीक्षण निर्धारित किया गया",
    ta: "ஆய்வு திட்டமிடப்பட்டுள்ளது",
  },
  "complaint verified and sent for resolution": {
    hi: "शिकायत का सत्यापन किया गया और समाधान हेतु भेजा गया",
    ta: "புகார் சரிபார்க்கப்பட்டு தீர்வுக்கு அனுப்பப்பட்டுள்ளது",
  },
  "duplicate complaint": {
    hi: "शिकायत की प्रतिलिपि",
    ta: "நகல் புகார்",
  },
  "completed": {
    hi: "पूर्ण हुआ",
    ta: "நிறைவடைந்தது",
  },
};

export function getTranslatedReply(reply?: string, lang: "en" | "hi" | "ta" = "en"): string {
  if (!reply || lang === "en") return reply || "";
  const normalized = reply.trim().toLowerCase();
  const directMatch = COMMON_REPLIES_I18N[normalized];
  if (directMatch && directMatch[lang]) return directMatch[lang];

  for (const [key, val] of Object.entries(COMMON_REPLIES_I18N)) {
    if (normalized.includes(key) && val[lang]) {
      return val[lang];
    }
  }

  return reply;
}

export function getTranslatedTimelineNote(note?: string, lang: "en" | "hi" | "ta" = "en"): string {
  if (!note || lang === "en") return note || "";
  return getTranslatedReply(note, lang);
}

const runtimeTranslationCache: Record<string, string> = {};

export function getTranslatedCategory(category?: string, lang: "en" | "hi" | "ta" = "en"): string {
  if (!category || lang === "en") return category || "";
  const key = category.trim().toLowerCase();
  const entry = CATEGORIES_I18N[key];
  if (entry && entry[lang]) return entry[lang];
  return category;
}

export function getTranslatedContactRole(role?: string, lang: "en" | "hi" | "ta" = "en"): string {
  if (!role || lang === "en") return role || "";
  const entry = CONTACT_ROLES_I18N[role];
  if (entry && entry[lang]) return entry[lang];
  return role;
}

export function getTranslatedServiceType(type?: string, lang: "en" | "hi" | "ta" = "en"): string {
  if (!type || lang === "en") return type || "";
  const entry = SERVICE_TYPES_I18N[type];
  if (entry && entry[lang]) return entry[lang];
  return type;
}

export function getTranslatedRule(rule: Rule, lang: "en" | "hi" | "ta" = "en"): { section: string; title: string; body: string } {
  if (lang === "en") {
    return { section: rule.section, title: rule.title, body: rule.body };
  }
  const seed = RULES_I18N[rule.id];
  if (seed && seed[lang]) {
    return seed[lang];
  }
  const transSection = getTranslatedCategory(rule.section, lang);
  return { section: transSection, title: rule.title, body: rule.body };
}

export function getTranslatedAnnouncement(ann: Announcement, lang: "en" | "hi" | "ta" = "en"): { title: string; body: string } {
  if (lang === "en") {
    return { title: ann.title, body: ann.body };
  }
  const seed = ANNOUNCEMENTS_I18N[ann.id];
  if (seed && seed[lang]) {
    return seed[lang];
  }
  return { title: ann.title, body: ann.body };
}

export function useTranslatedComplaint(complaint?: Complaint | null): TranslatedContent {
  const { language } = useLanguage();
  const currentLang = (language as "en" | "hi" | "ta") || "en";

  const rawTitle = complaint?.title || "";
  const rawBody = complaint?.complaint_text || complaint?.body || "";
  const rawReply = complaint?.reply || (complaint as any)?.adminReply || "";
  const rawCategory = complaint?.category || "";

  const [translated, setTranslated] = useState<TranslatedContent>(() => ({
    title: rawTitle,
    body: rawBody,
    reply: getTranslatedReply(rawReply, currentLang),
    category: getTranslatedCategory(rawCategory, currentLang),
    isTranslated: false,
    loading: false,
  }));

  useEffect(() => {
    if (!complaint) return;

    if (currentLang === "en") {
      setTranslated({
        title: rawTitle,
        body: rawBody,
        reply: rawReply,
        category: rawCategory,
        isTranslated: false,
        loading: false,
      });
      return;
    }

    const dbTransText = currentLang === "hi" ? (complaint as any).complaint_text_hi : (complaint as any).complaint_text_ta;
    const dbTransReply = currentLang === "hi" ? (complaint as any).adminReply_hi : (complaint as any).adminReply_ta;

    if (dbTransText) {
      const resolvedReply = dbTransReply || getTranslatedReply(rawReply, currentLang);
      setTranslated({
        title: dbTransText.split("\n")[0]?.slice(0, 60) || rawTitle,
        body: dbTransText,
        reply: resolvedReply,
        category: getTranslatedCategory(rawCategory, currentLang),
        isTranslated: true,
        loading: false,
      });
      return;
    }

    const seed = SEED_COMPLAINTS_I18N[complaint.id];
    if (seed && seed[currentLang]) {
      const match = seed[currentLang];
      setTranslated({
        title: match.title,
        body: match.body,
        reply: match.reply || getTranslatedReply(rawReply, currentLang),
        category: match.category || getTranslatedCategory(rawCategory, currentLang),
        isTranslated: true,
        loading: false,
      });
      return;
    }

    const cacheKeyText = `${complaint.id}_text_${currentLang}`;
    const cacheKeyReply = `${complaint.id}_reply_${currentLang}`;
    const cachedText = runtimeTranslationCache[cacheKeyText];
    const cachedReply = runtimeTranslationCache[cacheKeyReply] || getTranslatedReply(rawReply, currentLang);

    if (cachedText) {
      setTranslated({
        title: cachedText.split("\n")[0]?.slice(0, 60) || rawTitle,
        body: cachedText,
        reply: cachedReply,
        category: getTranslatedCategory(rawCategory, currentLang),
        isTranslated: true,
        loading: false,
      });
      return;
    }

    if (complaint.id) {
      let isMounted = true;
      setTranslated((prev) => ({
        ...prev,
        reply: getTranslatedReply(rawReply, currentLang),
        loading: true
      }));

      api.translateComplaintText(complaint.id, currentLang)
        .then((res: any) => {
          if (isMounted && res.success) {
            const transText = res.translatedText || rawBody;
            const transReply = res.translatedReply || getTranslatedReply(rawReply, currentLang);
            if (res.translatedText) runtimeTranslationCache[cacheKeyText] = res.translatedText;
            if (res.translatedReply) runtimeTranslationCache[cacheKeyReply] = res.translatedReply;

            setTranslated({
              title: transText.split("\n")[0]?.slice(0, 60) || rawTitle,
              body: transText,
              reply: transReply,
              category: getTranslatedCategory(rawCategory, currentLang),
              isTranslated: true,
              loading: false,
            });
          }
        })
        .catch(() => {
          if (isMounted) {
            setTranslated({
              title: rawTitle,
              body: rawBody,
              reply: getTranslatedReply(rawReply, currentLang),
              category: getTranslatedCategory(rawCategory, currentLang),
              isTranslated: false,
              loading: false,
            });
          }
        });

      return () => {
        isMounted = false;
      };
    }
  }, [complaint?.id, rawTitle, rawBody, rawReply, rawCategory, currentLang]);

  return translated;
}
