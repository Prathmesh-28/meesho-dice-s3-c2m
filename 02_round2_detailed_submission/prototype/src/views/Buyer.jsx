import { useMemo, useState } from 'react';
import { PERSONA, SPONSOR } from '../config.js';
import { personaFlow } from '../lib/flow.js';
import { categoryById } from '../lib/generate.js';
import { href } from '../lib/router.js';
import { num, pct, rupees } from '../lib/format.js';
import { Card, Chip } from '../components/ui.jsx';
import meeshoIcon from '../assets/meesho-icon.png';

const shipDate = (days) => new Date(Date.now() + days * 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

export default function Buyer({ pti }) {
  const { check, batch, ledger } = useMemo(() => personaFlow(pti), [pti]);
  const [choice, setChoice] = useState('preorder');
  const [placed, setPlaced] = useState(false);
  const market = check.marketMedian;
  const pre = batch.preorderPrice;
  const confirmed = batch.preOrders + (placed ? 1 : 0);
  const failCod = ledger.failed / ledger.confirmed; // prepaid failure rate on the batch
  const options = [
    { id: 'preorder', title: 'Pre-order from the factory', when: `Ships in 7-8 days · by ${shipDate(8)}`, price: pre, pay: 'Pay now by UPI', tag: `Save ${rupees(market - pre)}` },
    { id: 'now', title: 'Buy now from other sellers', when: `Delivered in 3-4 days · by ${shipDate(4)}`, price: market, pay: 'Cash on delivery or UPI', tag: null },
  ];

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="eyebrow">Module 5 · The buyer’s side</div>
          <h2>Prepaid pre-orders: the buyer pays less and the batch is sold before it is made</h2>
          <p className="lede">
            A buyer sees the factory’s product with a “Sold directly by the manufacturer” badge and a choice: wait 7-8
            days and pay {rupees(pre)} now, or buy from stock at {rupees(market)}. Every pre-order lands in the factory’s
            batch count, so the factory makes only what is already paid for.
          </p>
        </div>
      </div>

      <div className="maker">
        <div className="phone" aria-label="Buyer app preview">
          <div className="phone-screen">
            <div className="phone-status"><span>9:41</span><span>4G ▮▮▮</span></div>
            <div className="phone-head">
              <img src={meeshoIcon} alt="Meesho" className="phone-logo" />
              <div><div className="who">meesho</div><div className="where">Search · Men’s innerwear</div></div>
            </div>
            {!placed ? (
              <div className="phone-body">
                <div className="product-img" aria-hidden>
                  <span style={{ background: '#2c3a5e' }} /><span style={{ background: '#8a8f99' }} /><span style={{ background: '#1e1e22' }} />
                  <div className="pack">Pack of 3</div>
                </div>
                <div>
                  <div style={{ fontWeight: 650, fontSize: 15 }}>Men’s cotton briefs, pack of 3</div>
                  <div className="badge-direct">✓ Sold directly by the manufacturer · {PERSONA.name}, {PERSONA.cluster}</div>
                </div>
                {options.map((o) => (
                  <button key={o.id} type="button" className={`buy-opt${choice === o.id ? ' on' : ''}`} onClick={() => setChoice(o.id)}>
                    <div className="row between" style={{ gap: 6 }}>
                      <b>{o.title}</b><span className="buy-price">{rupees(o.price)}</span>
                    </div>
                    <div className="small">{o.when}</div>
                    <div className="row between small" style={{ marginTop: 4 }}>
                      <span className="muted">{o.pay}</span>{o.tag && <Chip tone="good">{o.tag}</Chip>}
                    </div>
                  </button>
                ))}
                <div className="small muted">Delivery date and price are shown before you pay. No extra charges.</div>
                <button className="btn primary" type="button" onClick={() => choice === 'preorder' && setPlaced(true)} disabled={choice !== 'preorder'}>
                  {choice === 'preorder' ? `Pre-order for ${rupees(pre)} · pay by UPI` : `Buy now for ${rupees(market)}`}
                </button>
              </div>
            ) : (
              <div className="phone-body">
                <div className="pcard" style={{ background: '#e7f5e7', borderColor: 'transparent' }}>
                  <h4>✓ Pre-order placed · {rupees(pre)} paid</h4>
                  <div className="small">Arrives by {shipDate(8)}. You saved {rupees(market - pre)} against buying from stock.</div>
                </div>
                <div className="pcard">
                  <h4>Your pack joins {PERSONA.name}’s batch</h4>
                  <div style={{ fontSize: 26, fontWeight: 700 }}>{num(confirmed)} <span className="small muted" style={{ fontWeight: 500 }}>pre-orders confirmed</span></div>
                  <div className="small mt">The factory makes confirmed orders plus 15% and drops them at the {PERSONA.cluster} Factory Node. The node packs and ships yours.</div>
                </div>
                <ul className="timeline">
                  <li><span className="when">Today</span><span>Paid by UPI, order confirmed</span></li>
                  <li><span className="when">Day 3</span><span>Factory hands the batch to the node</span></li>
                  <li><span className="when">Day 4-8</span><span>Valmo delivers to your door</span></li>
                </ul>
                <button className="btn" type="button" onClick={() => setPlaced(false)}>Back to the product</button>
              </div>
            )}
          </div>
        </div>

        <div className="stack">
          <Card className="explain" title="Why the buyer says yes">
            <p>
              The same product for <b>{rupees(market - pre)} less</b> ({pct((market - pre) / market, 1)}), from the factory that made it. The
              price sits {pct(check.suggestedGap, 1)} under what buyers pay today ({check.marketSource}) before the {rupees(10)} pre-order saving.
            </p>
          </Card>
          <Card title="What prepaid pre-orders change" sub={`Meesho: ${SPONSOR.buyersMn} mn buyers, ${pct(SPONSOR.prepaid)} of orders prepaid today`}>
            <table>
              <tbody>
                <tr><td>Failed deliveries on this batch</td><td className="num"><b>{pct(failCod, 1)}</b> of orders, against {pct(categoryById[PERSONA.category].rtoRate)} for {categoryById[PERSONA.category].short.toLowerCase()} today</td></tr>
                <tr><td>Stock the factory builds blind</td><td className="num"><b>None</b>: it makes {num(batch.make)} for {num(batch.preOrders)} paid orders</td></tr>
                <tr><td>Cash before delivery</td><td className="num"><b>{rupees(ledger.advance)}</b> advanced to the factory at handover</td></tr>
                <tr><td>Factory’s balance on Day 15</td><td className="num"><b>+{rupees(ledger.balance)}</b> after fees and the advance</td></tr>
              </tbody>
            </table>
          </Card>
          <Card title="Guardrails for the buyer and for other sellers">
            <ul className="rule-list">
              <li>✓ The badge shows only on factories that keep 60% of SKUs 8% under the market, re-scored weekly.</li>
              <li>✓ Badged listings are capped at 20% of a category’s impressions, so resellers keep the rest.</li>
              <li>✓ The wait and the saving are shown before payment, never as a countdown or a hidden term.</li>
            </ul>
            <div className="row mt"><a className="btn" href={href('maker', { step: 'batch' })}>See the factory’s batch →</a></div>
          </Card>
        </div>
      </div>
    </div>
  );
}
