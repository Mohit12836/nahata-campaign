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
  const cleanNumber = (whatsappNumber || '919829012345').replace(/\D/g, '');
  
  const text = `🚩 *जय माता दी!* 🚩

नमस्ते मनोज भैया,
मैंने *${storeName} (बस स्टैंड रोड, कुशलगढ़)* का नवरात्रि स्पेशल ऑफर क्लेम कर लिया है!

🎟️ *मेरा कूपन कोड:* *${couponCode}*
👤 *ग्राहक का नाम:* ${customerName}
📞 *मोबाइल नंबर:* ${customerPhone}
🎁 *ऑफर:* ${prizeTitle || 'खरीदारी पर निश्चित स्पेशल गिफ्ट हैम्पर + महा-बचत ऑफर'}
${terms ? `📌 *नियम:* ${terms}\n` : ''}
📍 मैं जल्द ही आपकी दुकान (बस स्टैंड रोड, कुशलगढ़) पर आकर खरीदारी करके अपने गिफ्ट हैम्पर व ऑफर का लाभ उठाऊँगा/उठाऊँगी। कृपया मेरा कूपन रिकॉर्ड में दर्ज कर लें। धन्यवाद!`;

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`;
};

export const getNahataShareUrl = (
  customerNameOrCampaignTitle?: string,
  prizeWonTitle?: string,
  campaignUrl?: string
): string => {
  const url = campaignUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://nahata-campaign.vercel.app');
  const safeName = customerNameOrCampaignTitle && !customerNameOrCampaignTitle.includes('नाहाटा')
    ? customerNameOrCampaignTitle
    : 'आपके मित्र';

  const text = `🚩 *जय माता दी!* 🚩

*${safeName}* जी ने आपको *मनोज भैया (नाहाटा जनरल स्टोर्स, बस स्टैंड रोड, कुशलगढ़, राजस्थान)* का स्पेशल नवरात्रि गिफ्ट हैम्पर ऑफर भेजा है! 🎁✨

🛍️ नाहाटा जनरल स्टोर्स पर अपनी खरीदारी पर पाएं निश्चित गिफ्ट हैम्पर और महा-बचत ऑफर!
(नोट: आपके गिफ्ट हैम्पर में क्या खास निकला, यह दुकान जाकर खरीदारी करने पर पता चलेगा!)

👇 अपना फ्री कूपन अभी क्लेम व रिडीम करने के लिए तुरंत इस लिंक पर क्लिक करें:
👉 ${url}

📍 नाहाटा जनरल स्टोर्स, बस स्टैंड रोड, कुशलगढ़ (राज.)`;

  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
};

