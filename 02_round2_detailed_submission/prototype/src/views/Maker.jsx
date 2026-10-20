import { useMemo, useState } from 'react';
import { CATEGORIES, ECONOMICS, EXPERIMENT, FD, GATE, OPS, PERSONA } from '../config.js';
import { priceCheck, cashCycle, routeTable, ratesFor, MODES } from '../lib/economics.js';
import { batchCash } from '../lib/factoryDirect.js';
import { demandBrief, batchPlan, whatsappBrief, whatsappConfirm, whatsappTopUp, QUICK_REPLIES, TOPUP_REPLIES } from '../lib/demand.js';
import { addDays, advanceTiming, avgTransit, batchDates, daysBetween, fmtDate, fmtDay, fmtRange, nextCutoff, nodeFlow, sizing, splitBy, zoneFor } from '../lib/operations.js';
import meeshoIcon from '../assets/meesho-icon.png';
import { categoryById, typeById } from '../lib/generate.js';
import { href, setParams } from '../lib/router.js';
import { num, pct, rupees } from '../lib/format.js';
import { Card, Chip, Seg, waText } from '../components/ui.jsx';

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
  const [topReply, setTopReply] = useState(null);
  const [batchView, setBatchView] = useState('week');
  const today = useMemo(() => new Date(), []);

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
  const table = useMemo(() => routeTable({ unitCost, category: categoryId, typeId, margin, medians: pti.medians }), [unitCost, categoryId, typeId, margin, pti]);
  const brief = useMemo(() => demandBrief({ typeId, marketMedian: check.marketMedian }), [typeId, check.marketMedian]);
  // The week's batch is sized from demand: this factory's share of the brief districts, half prepaid. The deck's
  // worked batch (1,000 pre-orders) is the same week at the share that brings 1,000.
  const showDeck = isPersona && batchView === 'deck';
  const basePlan = useMemo(() => sizing({ dailyDemand: brief.weeklyTotal / 7 }), [brief]);
  const plan = useMemo(() => (showDeck ? sizing({ dailyDemand: brief.weeklyTotal / 7, share: basePlan.shareFor(PERSONA.preOrders, 7) }) : basePlan), [showDeck, basePlan, brief]);
  // Pre-orders are priced off the gate price and must still clear the prepaid-batch floor.
  const batch = useMemo(() => ({ ...batchPlan({ brief, listingPrice: check.gatePrice, minViablePrice: table[3].floor, preOrders: plan.preOrders }), make: plan.make }), [brief, check.gatePrice, table, plan]);
  const rates = ratesFor(categoryId);
  const ledger = useMemo(() => batchCash({ confirmed: batch.preOrders, price: batch.preorderPrice, rates }), [batch, rates]);
  const dates = useMemo(() => batchDates(nextCutoff(today, plan.cutoffs)), [today, plan.cutoffs]);
  const advance = advanceTiming({ preOrders: batch.preOrders, price: batch.preorderPrice, make: batch.make, transit: avgTransit(brief.rows) });
  const flow = nodeFlow({ plan, rates });
  const topUp = Math.round(flow.topUp);
  const zones = brief.rows.map((r) => zoneFor(r.state));
  const firstIn = addDays(dates.ship, Math.min(...zones.map((z) => z.days[0])));
  const lastIn = addDays(dates.ship, Math.max(...zones.map((z) => z.days[1])));
  const daysLeft = daysBetween(today, dates.cutoff);
  const cash = cashCycle();
  const maxWeekly = Math.max(...brief.rows.map((r) => r.weekly));

  const pickCategory = (id) => {
    const first = categoryById[id].types[0].id;
    setCategoryId(id);
    setTypeId(first);
    setUnitCost(defaultCost(first));
    setCommitted(false);
    setWaReply(null);
    setTopReply(null);
  };
  const pickType = (id) => {
    setTypeId(id);
    setUnitCost(defaultCost(id));
    setCommitted(false);
    setWaReply(null);
    setTopReply(null);
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
                    <Seg label="Fulfilment" value={mode} onChange={setMode} options={['self', 'node', 'batch'].map((m) => ({ value: m, label: MODES[m].label }))} />
                  </div>
                </div>

                <div className={`verdict-box ${check.qualifies ? 'ok' : 'no'}`}>
                  <Chip tone={check.qualifies ? 'good' : 'critical'}>{check.qualifies ? 'Qualifies' : 'Not yet'}</Chip>
                  <div>
                    <div className="big">{rupees(check.floor)}</div>
                    <div className="small">
                      Your lowest price at a {pct(margin)} margin is {check.gap >= 0 ? `${pct(check.gap, 1)} below` : `${pct(-check.gap, 1)} above`} the
                      {' '}{rupees(check.marketMedian)} that buyers pay today ({check.marketSource}). The C2M badge needs {pct(GATE.deltaThreshold)}.
                      {!check.qualifies && mode === 'self' && other.qualifies && ' Switch to the Factory Node and it qualifies.'}
                    </div>
                  </div>
                </div>

                <div className="pcard">
                  <h4>Per pack the buyer keeps, listed at {rupees(check.suggested)}</h4>
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
                    Margin {pct(check.atSuggested.margin, 1)} after {pct(cat.returnRate)} returns and {pct(check.atSuggested.rtoRate, 1)} failed deliveries. Returns alone cost
                    {' '}{rupees(check.atSuggested.returnCostPerKept)} per pack kept.
                  </p>
                </div>

                <div className="pcard">
                  <h4>Cash comes back faster</h4>
                  <div className="grid cols-2" style={{ gap: 8 }}>
                    <div><div className="small">Distributor terms</div><div style={{ fontSize: 20, fontWeight: 700 }}>{cash.b2bDays} days</div></div>
                    <div><div className="small">Meesho batch</div><div style={{ fontSize: 20, fontWeight: 700 }} className="good-ink">~{Math.round(cash.batchDays)} days</div></div>
                  </div>
                  <p className="small mt">{pct(ECONOMICS.prepaymentShare)} advanced before delivery ({pct(OPS.advanceAtCutoff)} at the cut-off, {pct(OPS.advanceAtHandover)} at handover), the rest {ECONOMICS.settlementDays} days after delivery.</p>
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
                  <h4>Your share, next 14 days: {num(brief.suggested)} units</h4>
                  <div className="small" style={{ marginBottom: 8 }}>
                    {pct(ECONOMICS.newSellerShare)} of the next 14 days of demand in these districts. About half prepay as pre-orders (weekly
                    batches of {num(basePlan.make)}); the rest buy from your node stock. Split by {brief.axis.toLowerCase()}:
                  </div>
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
                {isPersona && (
                  <Seg label="Batch" value={batchView} onChange={(v) => { setBatchView(v); setCommitted(false); }}
                    options={[{ value: 'week', label: `This week · ${num(basePlan.preOrders)}` }, { value: 'deck', label: `Deck batch · ${num(PERSONA.preOrders)}` }]} />
                )}
                <div className="pcard">
                  <div className="row between">
                    <h4 style={{ margin: 0 }}>{showDeck ? 'The deck’s worked batch' : 'This week’s batch'}</h4>
                    <Chip tone="warning">{daysLeft ? `Cut-off in ${daysLeft} day${daysLeft > 1 ? 's' : ''}` : 'Cut-off tonight'}</Chip>
                  </div>
                  <div className="small mt">
                    {pct(plan.share, showDeck ? 1 : 0)} of these districts’ {num(plan.dailyDemand)} orders a day, half prepaid: {num(plan.preDay)} pre-orders
                    a day{showDeck ? '. One week at this share is the deck’s 1,000.' : `, until ${fmtDay(dates.cutoff)}, 11:59 pm.`}
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 700, marginTop: 4 }}>{num(batch.preOrders)} <span className="small muted" style={{ fontWeight: 500 }}>pre-orders · make {num(batch.make)}</span></div>
                  <div className="progress mt">
                    <div className="a" style={{ width: `${(batch.preOrders / batch.make) * 100}%` }} />
                    <div className="b" style={{ width: `${((batch.make - batch.preOrders) / batch.make) * 100}%` }} />
                  </div>
                  <div className="legend mt" style={{ marginBottom: 0 }}>
                    <span className="key"><span className="sw" style={{ background: 'var(--s1)' }} />Pre-orders</span>
                    <span className="key"><span className="sw" style={{ background: '#9ec5f4' }} />Buffer ({pct(ECONOMICS.batchBuffer)}){plan.toNode ? ` + ${num(plan.toNode)} for node stock` : ''}</span>
                  </div>
                  <div className="small mt">
                    {plan.clearsMinRun ? `✓ Above your ${plan.minRun}-piece minimum run.` : `Topped up to your ${plan.minRun}-piece minimum run; the ${num(plan.toNode)} extra packs go to node stock.`}
                  </div>
                </div>
                <div className="pcard">
                  <h4>Make {num(batch.make)} units, {fmtDate(dates.makeStart)} to {fmtDate(dates.truck)}</h4>
                  <table className="pl">
                    <tbody>
                      <tr><td>Pre-order price</td><td>{rupees(batch.preorderPrice)}</td></tr>
                      <tr><td>Confirmed order value</td><td>{rupees(batch.confirmedValue)}</td></tr>
                      <tr><td>NBFC at the cut-off ({pct(OPS.advanceAtCutoff)})</td><td>{rupees(advance.atCutoff)}</td></tr>
                      <tr><td>NBFC when the node counts the truck ({pct(OPS.advanceAtHandover)})</td><td>{rupees(advance.atHandover)}</td></tr>
                      <tr><td>Truck to</td><td>{cluster} Factory Node, {fmtDay(dates.truck)}</td></tr>
                    </tbody>
                  </table>
                  <p className="small mt">Nothing beyond paid orders and the buffer is made. A QC partner samples {OPS.qcSample.n} packs at your unit before the truck; the node counts, packs, ships and takes returns.</p>
                </div>
                {!committed ? (
                  <button className="btn primary" type="button" onClick={() => setCommitted(true)}>Commit batch of {num(batch.make)}</button>
                ) : (
                  <div className="pcard" style={{ background: '#e7f5e7', borderColor: 'transparent' }}>
                    <h4>✓ Batch committed</h4>
                    <ul className="timeline wide">
                      <li><span className="when">{fmtDay(dates.cutoff)}</span><span>11:59 pm cut-off: batch locked at {num(batch.make)} units</span></li>
                      <li><span className="when">{fmtDay(dates.advance)}</span><span>{rupees(advance.atCutoff)} advance arrives · cut fabric</span></li>
                      <li><span className="when">{fmtDate(addDays(dates.advance, 1))}–{fmtDate(dates.truck)}</span><span>Stitch, pack, QC sample; evening truck to the {cluster} node</span></li>
                      <li><span className="when">{fmtDay(dates.ship)}</span><span>Node counts the truck · {rupees(advance.atHandover)} · every pre-order ships</span></li>
                      <li><span className="when">{fmtRange(firstIn, lastIn)}</span><span>Valmo delivers, nearest districts first</span></li>
                      <li><span className="when">From {fmtDate(addDays(firstIn, OPS.settleDays))}</span><span>Balance, {OPS.settleDays} days after each delivery</span></li>
                    </ul>
                  </div>
                )}
                {committed && (
                  <div className="pcard">
                    <h4>Your cash from this batch</h4>
                    <table className="pl">
                      <tbody>
                        <tr><td>Pre-orders × {rupees(ledger.price)}</td><td>{rupees(ledger.value)}</td></tr>
                        <tr><td>{fmtDay(dates.advance)} · NBFC, 20%</td><td className="good-ink">+{rupees(advance.atCutoff)}</td></tr>
                        <tr><td>{fmtDay(dates.ship)} · NBFC, 10%</td><td className="good-ink">+{rupees(advance.atHandover)}</td></tr>
                        <tr><td>Kept after {num(ledger.failed)} failed, {num(ledger.returns)} returned</td><td>{num(ledger.kept)} packs</td></tr>
                        <tr><td>Revenue on kept packs</td><td>{rupees(ledger.revenue)}</td></tr>
                        <tr><td>Shipping, node and return fees</td><td>−{rupees(ledger.feeTotal)}</td></tr>
                        <tr><td>Payout, {OPS.settleDays} days after each delivery, advance repaid</td><td>{rupees(ledger.payout)}</td></tr>
                        <tr className="total"><td>Balance to you</td><td>+{rupees(ledger.balance)}</td></tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {step === 'whatsapp' && (
              <div className="wa">
                <div className="wa-bubble">
                  {waText(whatsappBrief({ seller: sellerName, brief, batch, dates, fmt: fmtDay }).join('\n'))}
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
                      {waReply === 0 ? waText(whatsappConfirm({ batch, cluster, dates, fmt: fmtDay, advance })) : waReply === 1
                        ? 'Review the suggested size mix in your Demand Brief before committing. Open the Demand tab above.'
                        : 'Callback request recorded in this demo. No message was sent and no batch was committed.'}
                      <span className="time">9:31 AM</span>
                    </div>
                    {waReply === 1 && <button className="btn" type="button" onClick={() => goStep('brief')}>Open size mix →</button>}
                    {waReply === 0 && (
                      <>
                        <div className="wa-bubble">
                          {waText(whatsappTopUp({ stock: flow.safety, days: OPS.safetyDays, topUp, sizes: splitBy(topUp, brief.split), dates, fmt: fmtDay }).join('\n'))}
                          <span className="time">9:31 AM</span>
                        </div>
                        {topReply === null ? (
                          <div className="wa-quick">
                            {TOPUP_REPLIES.map((q, i) => <button key={q} type="button" onClick={() => setTopReply(i)}>{q}</button>)}
                          </div>
                        ) : (
                          <>
                            <div className="wa-reply">{topReply + 1}</div>
                            <div className="wa-bubble">
                              {topReply === 0
                                ? `✅ ${num(topUp)} packs added to ${fmtDay(dates.truck)}’s truck: ${num(batch.make + topUp)} packs, ${rupees((batch.make + topUp) * FD.makingCost)} at making cost. Meesho pre-fills the e-way bill; you confirm it when the truck is loaded.`
                                : topReply === 1
                                  ? 'Reply with the number of packs, for example 200. Nothing moves until you reply.'
                                  : `Skipped. Node stock may run out around ${fmtDay(addDays(dates.ship, Math.floor((flow.safety + flow.fromBatchFit) / plan.nodeDay)))}; buyers then see only the pre-order.`}
                              <span className="time">9:32 AM</span>
                            </div>
                          </>
                        )}
                      </>
                    )}
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
              <Card title="Which route clears the 8% badge?" sub={`Same product, same ₹${unitCost} making cost, ${pct(margin)} margin, against the ${rupees(check.marketMedian)} buyers pay today`}>
                <table>
                  <thead><tr><th>Route</th><th className="num">Cost per pack</th><th className="num">Lowest viable price</th><th className="num">Below market</th><th className="num">Badge</th></tr></thead>
                  <tbody>
                    {table.map((r) => (
                      <tr key={r.key} className={r.key === mode ? 'hl' : ''}>
                        <td><b>{r.label}</b><div className="small muted">{r.sub}</div></td>
                        <td className="num">{rupees(r.cost)}</td>
                        <td className="num"><b>{rupees(r.floor)}</b></td>
                        <td className="num">{r.gap >= 0 ? pct(r.gap, 1) : `−${pct(-r.gap, 1)}`}</td>
                        <td className="num">{r.passes ? <Chip tone="good">Qualifies</Chip> : <Chip tone="critical">Not yet</Chip>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="small muted mt">
                  Each step removes one cost: the wholesaler mark-up, then packing every order, then stock built blind and
                  cash-on-delivery failures. Same cost model as the deck: ₹150 per return, no failed-delivery fee, 18% working capital.
                </p>
                <div className="note-box mt">
                  <b>Factory Node:</b> a shared stocking point at a Meesho partner hub. The factory keeps part of its finished goods there and
                  the rest at its own unit, and the hub is topped up from factory stock as orders use it up. A prepaid batch arrives in one truck.
                </div>
              </Card>
              <Card title="Barriers this step removes">
                <Barrier t="Unit-level fulfilment" d="The Factory Node option: one bulk handover; the node picks, packs, ships and takes returns." />
                <Barrier t="Returns and RTO exposure" d={`Priced in up front: ${rupees(check.atSuggested.returnCostPerKept)} per unit kept in ${cat.short.toLowerCase()}.`} />
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
              <Card title="Barriers this step removes">
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
                  accept the wait pay ₹{batch.discount} less (capped to protect the factory’s chosen margin). Every Thursday the week’s paid
                  pre-orders lock; the factory makes them plus a {pct(ECONOMICS.batchBuffer)} buffer, never below its {OPS.minRun}-piece minimum
                  run, and trucks them to the node on Sunday. {pct(ECONOMICS.prepaymentShare)} of confirmed value is advanced: {pct(OPS.advanceAtCutoff)} at the
                  cut-off, before fabric is cut, and {pct(OPS.advanceAtHandover)} when the node counts the truck.
                </p>
              </Card>
              <Card title="Why a weekly batch, not 1,000 in 3 days" sub={`${num(basePlan.preDay)} pre-orders a day at a ${pct(basePlan.share)} share`}>
                <Barrier t={`1,000 pre-orders take ${basePlan.fill1000.toFixed(0)} days`} d={`In 3 days they would need ${pct(basePlan.shareFor(1000, 3))} of these districts’ demand, more than the ${pct(EXPERIMENT.impressionCap)} of impressions all badged factories share.`} />
                <Barrier t={`A week gives ${num(basePlan.preOrders)} + 15% = ${num(basePlan.preOrders + basePlan.buffer)}`} d={`${basePlan.clearsMinRun ? `Above the ${OPS.minRun}-piece minimum` : `Made up to the ${OPS.minRun}-piece minimum, the extra ${num(basePlan.toNode)} packs for node stock`}, and no buyer waits more than ${basePlan.wait.max} days for the node to ship (${basePlan.wait.avg.toFixed(0)} on average).`} />
                <Barrier t={isPersona ? 'The deck’s 1,000 is a later week' : 'When the week reaches 1,000'} d={`${isPersona ? 'Kavin’s' : 'This factory’s'} week reaches 1,000 at a ${pct(basePlan.shareFor(1000, 7), 1)} share. Above that, two cut-offs a week (Monday and Thursday) keep the wait under a week.`} />
                <div className="row mt"><a className="btn" href={href('ops')}>Batch operations, day by day →</a></div>
              </Card>
              <Card title="Where returns go" sub={`${num(ledger.returns)} returns and ${num(ledger.failed)} failed deliveries on this batch`}>
                <Barrier t="Returns end at the node, not at the factory" d={`Valmo brings every return to the ${cluster} Factory Node. The factory never handles a single return.`} />
                <Barrier t="Graded, and resold where fit" d="The node grades each pack; sealed packs fit to sell go back into node stock (about 90% of their making cost recovered). Opened innerwear goes back to the factory as seconds." />
                <Barrier t="Priced in before listing" d={`₹150 per return and ₹0 per failed delivery, already in the price check: ${rupees(check.atSuggested.returnCostPerKept)} per pack kept.`} />
                <Barrier t="Rules if returns rise" d="Size-led returns get a size-chart fix from return reasons; above 1.5× the category norm the SKU goes on QC hold at the node. A returns pool caps a new factory’s early losses." />
              </Card>
              <Card title="Barriers this step removes">
                <Barrier t="Inventory risk, build-to-stock" d={`Stock at risk is the ${num(batch.make - batch.preOrders)}-unit buffer, which sells as node stock within about ${Math.max(1, Math.round(flow.coverDays))} days, not a warehouse of guesses.`} />
                <Barrier t="Cash cycle, settlement lag" d={`${rupees(advance.atCutoff)} arrives the morning after the cut-off, before fabric is cut; cash is back in about ${Math.round(advance.cashDays)} days from cutting.`} />
                <Barrier t="Unit-level operations" d="One truck a week. The node does unit picking, packing, shipping and returns." />
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
              <Card title="The factory approves every top-up" sub="Commit the batch with reply 1 to see it">
                <Barrier t="Meesho suggests, the owner decides" d={`The node keeps about a week of node-stock orders. Before each truck, Meesho suggests a top-up from the factory’s own stock (${num(topUp)} packs this week, by size); nothing moves without the owner’s reply.`} />
                <Barrier t="Inside the FDI rules" d="Press Note 2 lets a marketplace offer warehousing and fulfilment to sellers; it bars owning or controlling their stock. The factory owns every pack and can recall it on any truck." />
                <Barrier t="Paperwork pre-filled" d={`This week’s truck is ${num(batch.make + topUp)} packs, ${rupees((batch.make + topUp) * FD.makingCost)} at making cost: Meesho pre-fills the delivery challan and e-way bill from the batch.`} />
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Barrier({ t, d }) {
  return (
    <div className="barrier">
      <div className="ic" aria-hidden>✓</div>
      <div><b>{t}</b><span>{d}</span></div>
    </div>
  );
}
