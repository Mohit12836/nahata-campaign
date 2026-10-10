export interface WhatsAppClaimParams {
  whatsappNumber: string;
  customerName: string;
  customerPhone: string;
  couponCode: string;
  prizeTitle: string;
  terms?: string;
  storeName?: string;
}

export const getNahataWhatsAppClaimUrl = ({
  whatsappNumber,
  customerName,
  customerPhone,
  couponCode,
  prizeTitle,
  terms,
  storeName = 'नाहाटा जनरल स्टोर्स (Nahata General Stores)',
}: WhatsAppClaimParams): string => {
  const cleanNumber = whatsappNumber.replace(/\D/g, '');
  
  const text = `🎉 *फेस्टिवल ऑफर क्लेम रिक्वेस्ट* 🛍️
━━━━━━━━━━━━━━━━━━
दुकान: *${storeName}*

नमस्ते मनोज जी,
मैंने आपके लकी ड्रॉ कैंपेन में भाग लिया है और यह ऑफर जीता है:

🎁 *इनाम / ऑफर:* ${prizeTitle}
🎟️ *कूपन कोड:* *${couponCode}*
👤 *ग्राहक नाम:* ${customerName}
📞 *मोबाइल:* ${customerPhone}
${terms ? `📌 *नियम:* ${terms}` : ''}
━━━━━━━━━━━━━━━━━━
कृपया मेरा कूपन कन्फर्म करें ताकि मैं खरीदारी / होम डिलीवरी पर इसे रिडीम कर सकूँ। धन्यवाद!`;

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`;
};

export const getNahataShareUrl = (
  campaignTitle: string,
  prizeWonTitle?: string,
  campaignUrl?: string
): string => {
  const url = campaignUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://nahata-campaign.vercel.app');
  const wonText = prizeWonTitle ? `मुझे अभी *${prizeWonTitle}* मिला है! 🎁` : `मुझे अभी शानदार डिस्काउंट कूपन मिला है! 🎁`;
  
  const text = `🪔 *नाहाटा जनरल स्टोर्स (कुशलगढ़) — महा बचत धमाका!* 🛍️

भाई, नाहाटा स्टोर्स पर लकी स्क्रैच कार्ड और स्पिन व्हील चल रहा है! 
${wonText}

आप भी 1 सेकंड में अपनी किस्मत आजमाएं और फ्री गिफ्ट व महा छूट पाएं! 👇
👉 *यहाँ क्लिक करके अपना इनाम निकालें:* ${url}

(नोट: यह ऑफर केवल सीमित समय और पहले 500 ग्राहकों के लिए है)`;

  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
};

