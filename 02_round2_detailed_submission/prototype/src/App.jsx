import { useEffect, useMemo, useState } from 'react';
import { GATE, TEAM } from './config.js';
import { generateMarket } from './lib/generate.js';
import { runPTI } from './lib/pti.js';
import { generateCohort, cohortSummary } from './lib/health.js';
import { runExperiment } from './lib/experiment.js';
import { useRoute, href } from './lib/router.js';
import Overview from './views/Overview.jsx';
import PriceTruth from './views/PriceTruth.jsx';
import Experiment from './views/Experiment.jsx';
import Health from './views/Health.jsx';
import Maker from './views/Maker.jsx';
import Method from './views/Method.jsx';
import diceLogo from './assets/dice-s3-logo.png';

const NAV = [
  { path: 'overview', label: 'Overview' },
  { path: 'pti', label: 'Price Truth Index', num: 1 },
  { path: 'experiment', label: 'Day-30 readout', num: 2 },
  { path: 'health', label: 'Seller Health', num: 3 },
  { path: 'maker', label: 'Manufacturer app', num: 4 },
  { path: 'method', label: 'How Meesho runs it' },
];

export default function App() {
  const route = useRoute();
  const [gate, setGate] = useState(GATE);

  const market = useMemo(() => generateMarket(), []);
  const pti = useMemo(() => runPTI(market, gate), [market, gate]);
  const cohort = useMemo(() => generateCohort(), []);
  const summary = useMemo(() => cohortSummary(cohort), [cohort]);
  const baseRun = useMemo(() => runExperiment(pti, gate, 'base'), [pti, gate]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route.path]);

  const shared = { gate, setGate, market, pti, cohort, summary, baseRun, params: route.params };
  const View = { overview: Overview, pti: PriceTruth, experiment: Experiment, health: Health, maker: Maker, method: Method }[route.path] ?? Overview;

  return (
    <>
      <header className="topbar">
        <div className="topbar-row">
          <div className="brand">
            <a className="dice-logo" href={href('overview')} title="Meesho DICE Challenge Season 3 entry">
              <img src={diceLogo} alt="Meesho DICE Challenge Season 3" />
            </a>
            <div>
              <h1>C2M Control Tower</h1>
              <p>{TEAM.entry} · {TEAM.team}</p>
            </div>
          </div>
          <div className="spacer" />
          <span className="sample-pill" title="All sellers, prices and orders are synthetic and seeded. Seller names are fictional.">
            Working prototype · synthetic data
          </span>
        </div>
        <nav className="nav" aria-label="Sections">
          {NAV.map((n) => (
            <a key={n.path} href={href(n.path)} className={route.path === n.path ? 'active' : ''}>
              {n.num && <span className="num">{n.num}</span>}
              {n.label}
            </a>
          ))}
        </nav>
      </header>
      <main>
        <View {...shared} />
      </main>
      <footer className="footer">
        Prototype built for the Meesho DICE Challenge S3 detailed submission by {TEAM.members}. All sellers, prices,
        orders and demand are synthetic and generated from a fixed seed; seller names are fictional. Every assumption
        lives in <code>src/config.js</code>.
      </footer>
    </>
  );
}
