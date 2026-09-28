import { useMemo, useState } from 'react';
import { CATEGORIES, ECONOMICS, GATE, PERSONA } from '../config.js';
import { priceCheck, cashCycle } from '../lib/economics.js';
import { demandBrief, batchPlan, whatsappBrief, whatsappConfirm, QUICK_REPLIES } from '../lib/demand.js';
import meeshoIcon from '../assets/meesho-icon.png';
import { categoryById, typeById } from '../lib/generate.js';
import { setParams } from '../lib/router.js';
import { num, pct, rupees } from '../lib/format.js';
import { Card, Chip, Seg } from '../components/ui.jsx';

const STEPS = [
  { id: 'price', label: 'Price check' },
  { id: 'brief', label: 'Demand' },
  { id: 'batch', label: 'Batch' },
  { id: 'whatsapp', label: 'WhatsApp' },
];

const defaultCost = (typeId) => (typeId === PERSONA.type ? PERSONA.unitCost : Math.round(typeById[typeId].ref * 0.4));

export default function Maker({ pti, params }) {
  const step = STEPS.some((s) => s.id === params.step) ? params.step : 'price';
  const goStep = (id) => setParams({ step: id === 'price' ? null : id });

  const [categoryId, setCategoryId] = useState(PERSONA.category);
  const [typeId, setTypeId] = useState(PERSONA.type);
  const [unitCost, setUnitCost] = useState(PERSONA.unitCost);
  const [mode, setMode] = useState('node');
  const [margin, setMargin] = useState(ECONOMICS.targetMarginB2B);
  const [committed, setCommitted] = useState(false);
  const [waReply, setWaReply] = useState(null);

  const cat = categoryById[categoryId];
  const isPersona = typeId === PERSONA.type;
  const sellerName = isPersona ? PERSONA.name : `${cat.clusters[0]} manufacturer`;
  const cluster = isPersona ? PERSONA.cluster : cat.clusters[0];

  const check = useMemo(
    () => priceCheck({ unitCost, category: categoryId, typeId, mode, margin, medians: pti.medians }),
    [unitCost, categoryId, typeId, mode, margin, pti],
  );
  const other = useMemo(
    () => priceCheck({ unitCost, category: categoryId, typeId, mode: mode === 'node' ? 'self' : 'node', margin, medians: pti.medians }),
    [unitCost, categoryId, typeId, mode, margin, pti],
  );
  const brief = useMemo(() => demandBrief({ typeId, marketMedian: check.marketMedian }), [typeId, check.marketMedian]);
  const batch = useMemo(() => batchPlan({ brief, listingPrice: check.suggested, minViablePrice: check.floor }), [brief, check.suggested, check.floor]);
  const cash = cashCycle();
  const maxWeekly = Math.max(...brief.rows.map((r) => r.weekly));

  const pickCategory = (id) => {
    const first = categoryById[id].types[0].id;
    setCategoryId(id);
    setTypeId(first);
    setUnitCost(defaultCost(first));
    setCommitted(false);
    setWaReply(null);
  };
  const pickType = (id) => {
    setTypeId(id);
    setUnitCost(defaultCost(id));
    setCommitted(false);
    setWaReply(null);
  };

  const self = mode === 'self' ? check : other;
  const node = mode === 'node' ? check : other;

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="eyebrow">Module 4 · The manufacturer’s side</div>
          <h2>Made-to-Meesho: what the factory owner sees</h2>
          <p className="lede">
            An offline B2B manufacturer asks three things before listing: will I make money at these prices, is there
            demand, and do I have to stock up blind? Each step of this app answers one of them with numbers from the same
            model the ops screens use.
          </p>
        </div>
        <Seg label="Step" value={step} onChange={goStep} options={STEPS.map((s, i) => ({ value: s.id, label: `${i + 1}. ${s.label}` }))} />
      </div>

      <div className="maker">
        <div className="phone" aria-label="Manufacturer app preview">
          <div className="phone-screen">
            <div className="phone-status"><span>9:41</span><span>4G ▮▮▮</span></div>
            {step !== 'whatsapp' ? (
              <div className="phone-head">
                <img src={meeshoIcon} alt="Meesho" className="phone-logo" />
                <div>
                  <div className="who">{sellerName}</div>
                  <div className="where">{cluster} · {cat.short} · C2M onboarding</div>
                </div>
              </div>
            ) : (
              <div className="phone-head" style={{ background: '#075e54' }}>
                <img src={meeshoIcon} alt="Meesho" className="phone-logo round" />
                <div>
                  <div className="who">Meesho C2M</div>
                  <div className="where">Business account · replies instantly</div>
                </div>
              </div>
            )}
            <div className="phone-tabs">
              {STEPS.map((s) => (
                <button key={s.id} type="button" className={s.id === step ? 'on' : ''} onClick={() => goStep(s.id)}>{s.label}</button>
              ))}
            </div>

            {step === 'price' && (
              <div className="phone-body">
                <div className="pcard">
                  <h4>Check your price before you list</h4>
                  <div className="pfield">
                    <label htmlFor="pc-cat">Category</label>
                    <select id="pc-cat" value={categoryId} onChange={(e) => pickCategory(e.target.value)}>
                      {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.short}</option>)}
                    </select>
                  </div>
                  <div className="pfield">
                    <label htmlFor="pc-type">Product</label>
                    <select id="pc-type" value={typeId} onChange={(e) => pickType(e.target.value)}>
                      {cat.types.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                  <div className="grid cols-2" style={{ gap: 10 }}>
                    <div className="pfield">
                      <label htmlFor="pc-cost">Your making cost (₹/unit)</label>
                      <input id="pc-cost" type="number" min={1} value={unitCost} onChange={(e) => setUnitCost(Math.max(1, Number(e.target.value) || 1))} />
                    </div>
                    <div className="pfield">
                      <label htmlFor="pc-margin">Margin you need</label>
                      <select id="pc-margin" value={margin} onChange={(e) => setMargin(Number(e.target.value))}>
                        {[0.06, 0.09, 0.12, 0.15].map((m) => <option key={m} value={m}>{pct(m)}{m === ECONOMICS.targetMarginB2B ? ' (your B2B)' : ''}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="pfield" style={{ marginBottom: 0 }}>
                    <label>How orders ship</label>
                    <Seg label="Fulfilment" value={mode} onChange={setMode} options={[{ value: 'node', label: 'Factory Node' }, { value: 'self', label: 'Ship myself' }]} />
                  </div>
                </div>

                <div className={`verdict-box ${check.qualifies ? 'ok' : 'no'}`}>
                  <Chip tone={check.qualifies ? 'good' : 'critical'}>{check.qualifies ? 'Qualifies' : 'Not yet'}</Chip>
                  <div>
                    <div className="big">{rupees(check.floor)}</div>
                    <div className="small">
                      Your lowest price at a {pct(margin)} margin is {check.gap >= 0 ? `${pct(check.gap, 1)} below` : `${pct(-check.gap, 1)} above`} the
                      {' '}{rupees(check.marketMedian)} that buyers pay today. The C2M badge needs {pct(GATE.deltaThreshold)}.
                      {!check.qualifies && mode === 'self' && other.qualifies && ' Switch to the Factory Node and it qualifies.'}
                    </div>
                  </div>
                </div>

                <div className="pcard">
                  <h4>Per unit the buyer keeps, listed at {rupees(check.suggested)}</h4>
                  <table className="pl">
                    <tbody>
                      {check.atSuggested.lines.map((l) => (
                        <tr key={l.label} className={l.total ? 'total' : ''}>
                          <td>{l.label}</td>
                          <td>{l.value < 0 ? `−${rupees(-l.value)}` : rupees(l.value)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="small mt">
                    Margin {pct(check.atSuggested.margin, 1)} after {pct(cat.returnRate)} returns and {pct(cat.rtoRate)} RTO. Returns alone cost
                    {' '}{rupees(check.atSuggested.returnCostPerKept)} per unit kept.
                  </p>
                </div>

                <div className="pcard">
                  <h4>Cash comes back faster</h4>
                  <div className="grid cols-2" style={{ gap: 8 }}>
                    <div><div className="small">Distributor terms</div><div style={{ fontSize: 20, fontWeight: 700 }}>{cash.b2bDays} days</div></div>
                    <div><div className="small">Meesho batch</div><div style={{ fontSize: 20, fontWeight: 700 }} className="good-ink">~{Math.round(cash.batchDays)} days</div></div>
                  </div>
                  <p className="small mt">{pct(ECONOMICS.prepaymentShare)} paid at node handover, the rest {ECONOMICS.settlementDays} days after delivery.</p>
                </div>
                <button className="btn primary" type="button" onClick={() => goStep('brief')}>See where it sells →</button>
              </div>
            )}

            {step === 'brief' && (
              <div className="phone-body">
                <div className="pcard">
                  <h4>Demand Brief · {brief.type.name}</h4>
                  <div className="small">Top 12 districts · {num(brief.weeklyTotal)} orders a week · updated every Monday</div>
                </div>
                <div className="pcard" style={{ padding: '6px 12px' }}>
                  {brief.rows.map((r, i) => (
                    <div key={r.district} style={{ padding: '7px 0', borderBottom: i < brief.rows.length - 1 ? '1px solid #f0efec' : 0 }}>
                      <div className="row between" style={{ gap: 6 }}>
                        <span style={{ fontWeight: 600, fontSize: 13 }}>{i + 1}. {r.district} <span className="muted" style={{ fontWeight: 400 }}>{r.pin}xxx</span></span>
                        <span style={{ fontWeight: 650, fontSize: 13, fontVariantNumeric: 'tabular-nums' }}>{num(r.weekly)}/wk</span>
                      </div>
                      <div className="progress" style={{ height: 6, margin: '5px 0' }}><div className="a" style={{ width: `${(r.weekly / maxWeekly) * 100}%` }} /></div>
                      <div className="small muted">Sells at ₹{r.priceBand[0]}–{r.priceBand[1]} · {r.variants.join(' · ')}</div>
                    </div>
                  ))}
                </div>
                <div className="pcard">
                  <h4>Suggested first batch: {num(brief.suggested)} units</h4>
                  <div className="small" style={{ marginBottom: 8 }}>{pct(ECONOMICS.newSellerShare)} of the next 14 days of demand in these districts, split by {brief.axis.toLowerCase()}:</div>
                  {brief.split.map((s) => (
                    <div key={s.value} className="row" style={{ gap: 8, fontSize: 12.5, margin: '4px 0' }}>
                      <span style={{ width: 70 }}>{s.value}</span>
                      <div className="progress" style={{ flex: 1, height: 8 }}><div className="a" style={{ width: `${(s.units / brief.suggested) * 100}%` }} /></div>
                      <span style={{ width: 44, textAlign: 'right', fontWeight: 600 }}>{num(s.units)}</span>
                    </div>
                  ))}
                </div>
                <button className="btn primary" type="button" onClick={() => goStep('batch')}>Plan my batch →</button>
              </div>
            )}

            {step === 'batch' && (
              <div className="phone-body">
                <div className="pcard">
                  <div className="row between"><h4 style={{ margin: 0 }}>Batch window</h4><Chip tone="warning">Closes in {batch.windowDaysLeft} days</Chip></div>
                  <div className="small mt">Buyers who chose “ships in 7 days, ₹{batch.discount} off” have confirmed:</div>
                  <div style={{ fontSize: 28, fontWeight: 700, marginTop: 4 }}>{num(batch.preOrders)} <span className="small muted" style={{ fontWeight: 500 }}>of {num(brief.suggested)} suggested</span></div>
                  <div className="progress mt">
                    <div className="a" style={{ width: `${(batch.preOrders / brief.suggested) * 100}%` }} />
                    <div className="b" style={{ width: `${(batch.buffer / brief.suggested) * 100}%` }} />
                  </div>
                  <div className="legend mt" style={{ marginBottom: 0 }}>
                    <span className="key"><span className="sw" style={{ background: 'var(--s1)' }} />Confirmed</span>
                    <span className="key"><span className="sw" style={{ background: '#9ec5f4' }} />Buffer ({pct(ECONOMICS.batchBuffer)})</span>
                  </div>
                </div>
                <div className="pcard">
                  <h4>Make {num(batch.make)} units now</h4>
                  <table className="pl">
                    <tbody>
                      <tr><td>Pre-order price</td><td>{rupees(batch.preorderPrice)}</td></tr>
                      <tr><td>Confirmed order value</td><td>{rupees(batch.confirmedValue)}</td></tr>
                      <tr><td>Paid at node handover ({pct(ECONOMICS.prepaymentShare)})</td><td>{rupees(batch.prepayment)}</td></tr>
                      <tr><td>Hand over at</td><td>{cluster} Factory Node</td></tr>
                    </tbody>
                  </table>
                  <p className="small mt">Nothing beyond confirmed orders and the buffer is made. The node picks, packs, ships and takes returns.</p>
                </div>
                {!committed ? (
                  <button className="btn primary" type="button" onClick={() => setCommitted(true)}>Commit batch of {num(batch.make)}</button>
                ) : (
                  <div className="pcard" style={{ background: '#e7f5e7', borderColor: 'transparent' }}>
                    <h4>✓ Batch committed</h4>
                    <ul className="timeline">
                      <li><span className="when">Today</span><span>Batch locked at {num(batch.make)} units</span></li>
                      <li><span className="when">Day 3</span><span>Bulk handover at the {cluster} Factory Node · {rupees(batch.prepayment)} paid</span></li>
                      <li><span className="when">Day 4–8</span><span>Node ships each pre-order to the buyer</span></li>
                      <li><span className="when">Day 15</span><span>Balance settled, {ECONOMICS.settlementDays} days after delivery</span></li>
                    </ul>
                  </div>
                )}
              </div>
            )}

            {step === 'whatsapp' && (
              <div className="wa">
                <div className="wa-bubble">
                  {waText(whatsappBrief({ seller: sellerName, brief, batch }).join('\n'))}
                  <span className="time">9:30 AM</span>
                </div>
                {waReply === null ? (
                  <div className="wa-quick">
                    {QUICK_REPLIES.map((q, i) => (
                      <button key={q} type="button" onClick={() => { setWaReply(i); if (i === 0) setCommitted(true); }}>{q}</button>
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="wa-reply">{waReply + 1}</div>
                    <div className="wa-bubble">
                      {waReply === 0 ? waText(whatsappConfirm({ batch, cluster })) : waReply === 1
                        ? 'Review the suggested size mix in your Demand Brief before committing. Open the Demand tab above.'
                        : 'Callback request recorded in this demo. No message was sent and no batch was committed.'}
                      <span className="time">9:31 AM</span>
                    </div>
                    {waReply === 1 && <button className="btn" type="button" onClick={() => goStep('brief')}>Open size mix →</button>}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="stack">
          {step === 'price' && (
            <>
              <Card className="explain" title="Step 1 · Is it worth it at Meesho prices?">
                <p>
                  A Cohort A factory has never sold unit by unit, and a Cohort B seller assumes a ₹265 basket sits below
                  its cost line. The price check answers both before anything is listed. It prices returns, RTO and
                  logistics per unit the buyer keeps, and compares the result with what buyers actually pay for the same
                  product today.
                </p>
                <p className="mt">
                  This is the Price Truth Index gate run <b>before</b> onboarding. Offline manufacturers have no listings
                  to score, so the gate runs on their quote instead.
                </p>
              </Card>
              <Card title="Ship yourself or use the Factory Node?" sub={`Same product, same ₹${unitCost} making cost, ${pct(margin)} margin`}>
                <table>
                  <thead><tr><th /><th className="num">Ship myself</th><th className="num">Factory Node</th></tr></thead>
                  <tbody>
                    <tr><td>Lowest viable price</td><td className="num">{rupees(self.floor)}</td><td className="num">{rupees(node.floor)}</td></tr>
                    <tr><td>Below market median</td><td className="num">{pct(self.gap, 1)}</td><td className="num">{pct(node.gap, 1)}</td></tr>
                    <tr><td>Returns cost per unit kept</td><td className="num">{rupees(self.atSuggested.returnCostPerKept)}</td><td className="num">{rupees(node.atSuggested.returnCostPerKept)}</td></tr>
                    <tr><td>Margin at {rupees(check.suggested)}</td><td className="num">{pct(unitMargin(self, check.suggested, unitCost, categoryId, 'self'), 1)}</td><td className="num">{pct(unitMargin(node, check.suggested, unitCost, categoryId, 'node'), 1)}</td></tr>
                    <tr><td>C2M badge</td><td className="num">{self.qualifies ? '✓ Yes' : '✕ No'}</td><td className="num">{node.qualifies ? '✓ Yes' : '✕ No'}</td></tr>
                  </tbody>
                </table>
                <p className="small muted mt">Node rates are illustrative assumptions (bulk freight in, consolidated forward rates, returns ending at the node). Edit them in <code>src/config.js</code>.</p>
              </Card>
              <Card title="Round 1 barriers this step removes">
                <Barrier t="Unit-level fulfilment" d="The Factory Node option: one bulk handover; the node picks, packs, ships and takes returns." />
                <Barrier t="Returns and RTO exposure" d={`Priced in up front with the Round 1 return math: ${rupees(check.atSuggested.returnCostPerKept)} per unit kept in ${cat.short.toLowerCase()}.`} />
                <Barrier t="Cash cycle" d={`Cash back in about ${Math.round(cash.batchDays)} days instead of ${cash.b2bDays}. Working-capital cost falls from ${pct(cash.b2bCost, 1)} to ${pct(cash.batchCost, 1)} of revenue.`} />
              </Card>
            </>
          )}
          {step === 'brief' && (
            <>
              <Card className="explain" title="Step 2 · Will there be enough demand?">
                <p>
                  The case says manufacturers get stuck on one question: will there be enough scale? The Demand Brief
                  answers it with numbers: anonymised district demand for this exact product, the price band that
                  converts, and the size mix. The pilot would generate this view each week from aggregated search and
                  delivered-order data.
                </p>
              </Card>
              <Card title="Round 1 barriers this step removes">
                <Barrier t="Unproven demand" d={`${num(brief.weeklyTotal)} orders a week across 12 districts for ${brief.type.name.toLowerCase()}, before the factory commits a rupee.`} />
                <Barrier t="Weak first 30 days" d="The same 12 pin-codes receive the seller’s starter impressions and any impression grant, so early traffic lands where the demand already is." />
              </Card>
              <Card title="Where this comes from on the platform" className="flat">
                <p className="small ink2">A weekly job over search and delivered-order logs, grouped by product type and pin-code prefix, with district-level aggregation so no buyer is identifiable. Here it is synthetic and seeded.</p>
              </Card>
            </>
          )}
          {step === 'batch' && (
            <>
              <Card className="explain" title="Step 3 · Do I have to stock up blind?">
                <p>
                  B2B manufacturers make nothing until it is sold. Made-to-Meesho batches keep that model: buyers who
                  accept “ships in 7 days” pay ₹{batch.discount} less (capped to protect the factory’s chosen margin), the factory makes the confirmed
                  orders plus a {pct(ECONOMICS.batchBuffer)} buffer, and hands them over in bulk. {pct(ECONOMICS.prepaymentShare)} of confirmed value
                  is paid at handover.
                </p>
              </Card>
              <Card title="Round 1 barriers this step removes">
                <Barrier t="Inventory risk, build-to-stock" d={`Stock at risk is the ${num(batch.buffer)}-unit buffer, not a warehouse of guesses.`} />
                <Barrier t="Cash cycle, settlement lag" d={`${rupees(batch.prepayment)} arrives at handover, before any unit is delivered.`} />
                <Barrier t="Unit-level operations" d="Bulk handover. The node does unit picking, packing, shipping and returns." />
              </Card>
            </>
          )}
          {step === 'whatsapp' && (
            <>
              <Card className="explain" title="Step 4 · Reach the owner where they already work">
                <p>
                  Cohort A owners run their business on WhatsApp and phone calls, not dashboards. The weekly brief arrives
                  as a WhatsApp message, and a batch is committed with a one-tap reply. No app install, no account
                  manager.
                </p>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// WhatsApp formatting: *text* renders bold.
function waText(text) {
  return text.split(/\*([^*]+)\*/g).map((part, i) => (i % 2 ? <b key={i}>{part}</b> : part));
}

function Barrier({ t, d }) {
  return (
    <div className="barrier">
      <div className="ic" aria-hidden>✓</div>
      <div><b>{t}</b><span>{d}</span></div>
    </div>
  );
}

// Margin at a common listing price, so the two fulfilment modes compare like for like.
function unitMargin(_check, price, unitCost, category, mode) {
  return unitEconomicsAt(price, unitCost, category, mode);
}

import { unitEconomics } from '../lib/economics.js';
function unitEconomicsAt(price, unitCost, category, mode) {
  return unitEconomics({ price, unitCost, category, mode }).margin;
}
