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
        <div className="min-h-screen bg-gradient-to-b from-red-950 via-[#2a0808] to-slate-950 flex items-center justify-center text-amber-300 text-sm font-bold">
          लकी कार्ड लोड हो रहा है...
        </div>
      }
    >
      <StoreCampaignClient params={params} />
    </Suspense>
  );
}
