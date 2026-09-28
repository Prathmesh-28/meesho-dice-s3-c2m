const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const sharp = require('sharp');
const QRCode = require('qrcode');
const fa6 = require('react-icons/fa6');
const fs = require('fs');
const NAMES = ['FaCalculator', 'FaMapLocationDot', 'FaClipboardCheck', 'FaWarehouse', 'FaTruckFast', 'FaRotateLeft',
  'FaIndianRupeeSign', 'FaIndustry', 'FaGlobe', 'FaUserClock', 'FaBolt', 'FaShieldHalved', 'FaTriangleExclamation',
  'FaRocket', 'FaWhatsapp', 'FaGaugeHigh', 'FaFlagCheckered', 'FaUserTie', 'FaRobot', 'FaMagnifyingGlassChart',
  'FaStore', 'FaLink', 'FaFlask', 'FaCircleCheck', 'FaScaleUnbalanced', 'FaSeedling'];
const COLORS = { w: '#FFFFFF', p: '#560547', o: '#E0960F' };
(async () => {
  fs.mkdirSync('assets/icons', { recursive: true });
  for (const n of NAMES) {
    if (!fa6[n]) { console.log('missing', n); continue; }
    for (const [k, c] of Object.entries(COLORS)) {
      const svg = renderToStaticMarkup(React.createElement(fa6[n], { color: c, size: 256 }));
      await sharp(Buffer.from(svg)).resize(256, 256, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(`assets/icons/${n}_${k}.png`);
    }
  }
  await QRCode.toFile('assets/qr_live.png', 'https://meesho-dice-c2m-iitb.vercel.app/', { width: 600, margin: 1, color: { dark: '#560547', light: '#FFFFFF' } });
  console.log('icons + qr done');
})();
