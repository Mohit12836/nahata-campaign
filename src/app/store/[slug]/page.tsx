import { Suspense } from 'react';
import StoreCampaignClient from './StoreCampaignClient';

export default function StoreCampaignPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-[#26030A] via-[#35050D] to-[#120104] flex items-center justify-center text-[#FFC857] text-sm font-bold">
          लकी कार्ड लोड हो रहा है...
        </div>
      }
    >
      <StoreCampaignClient params={params} />
    </Suspense>
  );
}
