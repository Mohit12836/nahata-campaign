import test from 'node:test';
import assert from 'node:assert/strict';
import { assemblePublicStore, isValidStoreSlug } from '../src/lib/public-store-model.ts';

const NOW = new Date('2026-10-19T12:00:00.000Z');
const merchant = {
  id: 'm-1', slug: 'shree-general-store', name: 'Shree General Store',
  category: 'General', location: 'Main Market', shop_number: 'A-1',
  whatsapp_number: '919876543210', status: 'active',
};
const campaign = {
  id: 'c-1', merchant_id: 'm-1', slug: 'new-offer',
  title: 'October Offers', headline: 'Shop & Save', subheadline: 'Terms apply',
  location: 'Main Market', is_active: true,
  start_date: '2026-10-18T00:00:00.000Z', end_date: '2026-10-25T00:00:00.000Z',
};
const prize = {
  id: 'p-1', campaign_id: 'c-1', title: '₹100 off',
  discount_type: 'fixed_amount', discount_value: 100, min_order_value: 1000,
  total_quantity: 10, claimed_quantity: 2, is_active: true,
  terms_and_conditions: 'Valid in store',
};
const assemble = (changes = {}) => assemblePublicStore(
  changes.slug ?? merchant.slug,
  Object.hasOwn(changes, 'merchant') ? changes.merchant : merchant,
  Object.hasOwn(changes, 'campaign') ? changes.campaign : campaign,
  Object.hasOwn(changes, 'prizes') ? changes.prizes : [prize],
  changes.now ?? NOW,
);

test('accepts only lowercase safe slug', () => {
  assert.equal(isValidStoreSlug('shree-general-store'), true);
  for (const slug of ['', 'NAHATA', '../admin', 'two--hyphens', '-start', 'end-', 'é', 'a'.repeat(64)]) {
    assert.equal(isValidStoreSlug(slug), false, String(slug));
  }
});
test('correct merchant values populate campaign page', () => {
  const data = assemble();
  assert.equal(data.merchant.name, merchant.name);
  assert.equal(data.campaign.headline, campaign.headline);
  assert.equal(data.offers[0].title, prize.title);
  assert.equal(data.offers[0].minimumBill, 1000);
  assert.equal(data.merchant.whatsappUrl.startsWith('https://wa.me/919876543210'), true);
});
test('rejects unknown store with no merchant', () => assert.equal(assemble({merchant:null}), null));
test('rejects cross-store URL', () => assert.equal(assemble({slug:'someone-else'}), null));
test('rejects pending and suspended merchants', () => {
  for (const status of ['pending','suspended']) assert.equal(assemble({merchant:{...merchant,status}}), null);
});
test('rejects campaign belonging to another merchant', () => {
  assert.equal(assemble({campaign:{...campaign,merchant_id:'m-2'}}),null);
});
test('rejects inactive campaign', () => assert.equal(assemble({campaign:{...campaign,is_active:false}}),null));
test('rejects not-yet-started and expired campaigns', () => {
  assert.equal(assemble({now:new Date('2026-10-17T00:00:00.000Z')}),null);
  assert.equal(assemble({now:new Date('2026-10-25T00:00:00.000Z')}),null);
});
test('rejects invalid start/end time and reversed date window', () => {
  assert.equal(assemble({campaign:{...campaign,start_date:'not-a-date'}}),null);
  assert.equal(assemble({campaign:{...campaign,end_date:'2026-10-17T00:00:00Z'}}),null);
});
test('filters exhausted, cross-campaign and inactive prizes', () => {
  const data=assemble({prizes:[
    {...prize,id:'wrong',campaign_id:'different'},
    {...prize,id:'exhausted',claimed_quantity:10},
    {...prize,id:'inactive',is_active:false},
    prize,
  ]});
  assert.deepEqual(data.offers.map(p=>p.id),['p-1']);
});
test('no prizes means unpublished, not a mock fallback', () => assert.equal(assemble({prizes:[]}),null));
test('untrusted prize type is excluded', () => {
  assert.equal(assemble({prizes:[{...prize,discount_type:'unsupported'}]}),null);
});
test('does not fabricate phone number or public link', () => {
  const data=assemble({merchant:{...merchant,whatsapp_number:'not-provided'}});
  assert.equal(data.merchant.whatsappUrl,null);
});
test('normalizes a valid 10 digit Indian merchant number', () => {
  const data=assemble({merchant:{...merchant,whatsapp_number:'9876543210'}});
  assert.match(data.merchant.whatsappUrl,/wa.me\/919876543210/);
});
test('page projection excludes merchant private phone and customer records', () => {
  const data=assemble();
  assert.equal(Object.hasOwn(data.merchant,'whatsapp_number'),false);
  assert.equal(Object.hasOwn(data,'customers'),false);
});
