import { Metadata } from 'next';
import ScratchDirectClient from './ScratchDirectClient';

export const metadata: Metadata = {
  title: '🎁 Scratch & Win — हर कूपन में इनाम! | नाहाटा जनरल स्टोर्स',
  description:
    'हर खरीदारी पर गिफ्ट हैम्पर! ₹1,000 की खरीदारी पर ₹50 EXTRA। नाहाटा जनरल स्टोर्स (बस स्टैंड रोड, कुशलगढ़)। खरीदारी करें, स्क्रैच करें और इनाम जीतें!',
  openGraph: {
    title: '🎁 Scratch & Win — हर कूपन में इनाम! | Nahata General Stores',
    description:
      'हर खरीदारी पर गिफ्ट हैम्पर! ₹1,000 की खरीदारी पर ₹50 EXTRA। लकी कार्ड स्क्रैच करें और तुरंत इनाम जीतें!',
    url: 'https://nahata-campaign.vercel.app/scratch',
    siteName: 'Nahata General Stores',
    images: [
      {
        url: '/nahata-logo.jpg',
        width: 800,
        height: 800,
        alt: 'Nahata General Stores Scratch & Win',
      },
    ],
    locale: 'hi_IN',
    type: 'website',
  },
};

export default function ScratchPage() {
  return <ScratchDirectClient />;
}
