import { useMemo, useState } from 'react';
import { OPS, PERSONA, SPONSOR } from '../config.js';
import { personaFlow } from '../lib/flow.js';
import { categoryById } from '../lib/generate.js';
import { addDays, batchDates, fmtDay, fmtRange, nextCutoff, zoneFor } from '../lib/operations.js';
import { href } from '../lib/router.js';
import { num, pct, rupees } from '../lib/format.js';
import { Card, Chip } from '../components/ui.jsx';
import meeshoIcon from '../assets/meesho-icon.png';

export default function Buyer({ pti }) {
  const { check, table, brief, plan, week, weekLedger: ledger } = useMemo(() => personaFlow(pti), [pti]);
  const today = useMemo(() => new Date(), []);
  const [district, setDistrict] = useState(brief.rows[0].district);
  const [choice, setChoice] = useState('preorder');
  const [placed, setPlaced] = useState(null);
  const [cancelled, setCancelled] = useState(false);

  const row = brief.rows.find((r) => r.district === district) ?? brief.rows[0];
  const zone = zoneFor(row.state);
  const dates = batchDates(nextCutoff(today, plan.cutoffs));
  const arrive = dates.deliver(zone);
  const nodeShip = addDays(today, OPS.nodeShipDays);
  const nodeArrive = [addDays(nodeShip, zone.days[0]), addDays(nodeShip, zone.days[1])];
  const market = check.marketMedian;
  const pre = week.preorderPrice;
  const nodePrice = check.gatePrice; // node stock lists at the gate price, 8% under the market
  const confirmed = week.preOrders + (placed === 'preorder' && !cancelled ? 1 : 0);
  const failRate = ledger.failed / ledger.confirmed; // prepaid failure rate on the batch
  const options = [
    { id: 'preorder', title: 'Pre-order from the factory', when: `Ships ${fmtDay(dates.ship)} · arrives ${fmtRange(...arrive)}`, price: pre, pay: 'Pay now by UPI · held until delivery', tag: `Save ${rupees(market - pre)}` },
    { id: 'node', title: 'From the factory’s stock', when: `Ships in ${OPS.nodeShipDays} days · arrives ${fmtRange(...nodeArrive)}`, price: nodePrice, pay: 'Cash on delivery or UPI', tag: `Save ${rupees(market - nodePrice)}` },
  ];
  const reset = () => { setPlaced(null); setCancelled(false); };

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="eyebrow">Module 5 · The buyer’s side</div>
          <h2>Prepaid pre-orders: the buyer pays less, sees the date, and the batch is sold before it is made</h2>
          <p className="lede">
            A buyer sees the factory’s product with a “Sold directly by the manufacturer” badge and two factory offers: pre-order
            at {rupees(pre)} for this week’s batch, or buy from the factory’s node stock at {rupees(nodePrice)}, cash on delivery allowed.
            Both sit under the {rupees(market)} buyers pay today, and the date for the buyer’s own district is shown before payment.
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
                <div className="pfield" style={{ marginBottom: 0 }}>
                  <label htmlFor="b-pin">Deliver to</label>
                  <select id="b-pin" value={district} onChange={(e) => setDistrict(e.target.value)}>
                    {brief.rows.map((r) => <option key={r.district} value={r.district}>{r.district}, {r.state} · {r.pin}xxx</option>)}
                  </select>
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
                <div className="small muted">Other sellers: from {rupees(market)}. Date and price are shown before you pay; no extra charges.</div>
                <button className="btn primary" type="button" onClick={() => setPlaced(choice)}>
                  {choice === 'preorder' ? `Pre-order for ${rupees(pre)} · pay by UPI` : `Order for ${rupees(nodePrice)} · pay on delivery`}
                </button>
              </div>
            ) : placed === 'preorder' ? (
              <div className="phone-body">
                {!cancelled ? (
                  <div className="pcard" style={{ background: '#e7f5e7', borderColor: 'transparent' }}>
                    <h4>✓ Pre-order placed · {rupees(pre)} paid</h4>
                    <div className="small">Arrives in {district} {fmtRange(...arrive)}. Meesho holds the money until delivery; you saved {rupees(market - pre)}.</div>
                  </div>
                ) : (
                  <div className="pcard" style={{ background: '#fdf3dc', borderColor: 'transparent' }}>
                    <h4>Pre-order cancelled · {rupees(pre)} refunded</h4>
                    <div className="small">Cancelled before the cut-off, so the full amount goes back to your UPI account now. The batch drops to {num(week.preOrders)}.</div>
                  </div>
                )}
                <div className="pcard">
                  <h4>Track your order</h4>
                  <ul className="track">
                    <li className="done"><b>Paid, held by Meesho until delivery</b><span>Today</span></li>
                    <li className={cancelled ? '' : 'now'}><b>In {PERSONA.name}’s batch · {num(confirmed)} pre-orders</b><span>Cancel free until {fmtDay(dates.cutoff)}, 11:59 pm</span></li>
                    <li><b>Batch locked, being made in {PERSONA.cluster}</b><span>{fmtDay(dates.advance)} to {fmtDay(dates.truck)}</span></li>
                    <li><b>Counted in at the {PERSONA.cluster} Factory Node</b><span>{fmtDay(dates.ship)} morning</span></li>
                    <li><b>Shipped by Valmo</b><span>{fmtDay(dates.ship)} · {zone.label}, {zone.days[0]}-{zone.days[1]} days</span></li>
                    <li><b>Arrives in {district}</b><span>{fmtRange(...arrive)}</span></li>
                  </ul>
                </div>
                {!cancelled && <button className="btn" type="button" onClick={() => setCancelled(true)}>Cancel pre-order</button>}
                <div className="small muted">
                  If the batch ships late, ₹{OPS.lateCredit} comes back automatically; more than {OPS.lateRefundDays} days late, one tap gives a full refund.
                  Questions go to Meesho support, which sees the batch status, not to the factory.
                </div>
                <button className="btn" type="button" onClick={reset}>Back to the product</button>
              </div>
            ) : (
              <div className="phone-body">
                <div className="pcard" style={{ background: '#e7f5e7', borderColor: 'transparent' }}>
                  <h4>✓ Order placed · pay {rupees(nodePrice)} on delivery</h4>
                  <div className="small">Ships from the {PERSONA.cluster} Factory Node by {fmtDay(nodeShip)}; arrives in {district} {fmtRange(...nodeArrive)}.</div>
                </div>
                <div className="pcard">
                  <h4>Where this pack comes from</h4>
                  <div className="small">
                    {PERSONA.name}’s own stock at the node: the buffer from its last batch, packs that came back sealed, and the top-ups the
                    factory approves. Meesho never owns it.
                  </div>
                </div>
                <button className="btn" type="button" onClick={reset}>Back to the product</button>
              </div>
            )}
          </div>
        </div>

        <div className="stack">
          <Card className="explain" title="Why the buyer says yes">
            <p>
              The same product for <b>{rupees(market - pre)} less</b> ({pct((market - pre) / market, 1)}), from the factory that made it, with the
              delivery date for their own district before paying. The price sits {pct(check.suggestedGap, 1)} under what buyers pay
              today ({check.marketSource}) before the {rupees(10)} pre-order saving.
            </p>
          </Card>
          <Card title="Two factory offers, both under the badge line" sub={`Gate ${rupees(check.gatePrice)}: 8% under the ${rupees(market)} median`}>
            <table>
              <tbody>
                <tr><td style={{ whiteSpace: 'nowrap' }}><b>Pre-order</b>, {rupees(pre)}</td><td className="ink2">For the half of buyers who prepay and wait. Made to order: the batch route’s floor is {rupees(table[3].floor)}.</td></tr>
                <tr><td style={{ whiteSpace: 'nowrap' }}><b>Node stock</b>, {rupees(nodePrice)}</td><td className="ink2">For buyers who want it in days or pay cash. Ships in {OPS.nodeShipDays} days; the node route’s floor is {rupees(table[2].floor)}. This is also where a batch’s buffer, failed deliveries and sealed returns sell.</td></tr>
              </tbody>
            </table>
          </Card>
          <Card title="What prepaid pre-orders change" sub={`Meesho: ${SPONSOR.buyersMn} mn buyers, ${pct(SPONSOR.prepaid)} of orders prepaid today`}>
            <table>
              <tbody>
                <tr><td>Failed deliveries on this batch</td><td><b>{pct(failRate, 1)}</b> of orders, against {pct(categoryById[PERSONA.category].rtoRate)} for {categoryById[PERSONA.category].short.toLowerCase()} today</td></tr>
                <tr><td>Stock the factory builds blind</td><td><b>None</b>: it makes {num(week.make)} for {num(week.preOrders)} paid orders</td></tr>
                <tr><td>Cash before delivery</td><td><b>{rupees(ledger.advance)}</b>: {pct(OPS.advanceAtCutoff)} at the cut-off, {pct(OPS.advanceAtHandover)} at handover</td></tr>
                <tr><td>Factory’s balance on this batch</td><td><b>+{rupees(ledger.balance)}</b>, {OPS.settleDays} days after each delivery</td></tr>
              </tbody>
            </table>
          </Card>
          <Card title="The buyer’s rules" sub="Shown before payment; the money is held by Meesho until delivery">
            <ul className="rule-list">
              <li>✓ <b>Cancel free</b> until the cut-off ({fmtDay(dates.cutoff)}, 11:59 pm): refunded to UPI at once.</li>
              <li>✓ <b>Cancel after the cut-off</b>, until it ships: refunded within 24 hours; the pack joins the factory’s node stock.</li>
              <li>✓ <b>Late batch:</b> ₹{OPS.lateCredit} back automatically; more than {OPS.lateRefundDays} days late, a one-tap full refund. Whoever caused the delay pays.</li>
              <li>✓ <b>Batch fails QC:</b> a new date and ₹{OPS.lateCredit} back, or a full refund if the batch is cancelled. The buyer never pays for a failed batch.</li>
              <li>✓ <b>Returns:</b> sealed packs only, for size or defects (innerwear hygiene). Refunded within 3 days of pick-up.</li>
            </ul>
            <div className="row mt"><a className="btn" href={href('ops', { tab: 'exceptions' })}>Every exception and who pays →</a></div>
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
