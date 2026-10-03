/**
 * Factory survey for the Meesho DICE S3 C2M case (Team 23B0747, IIT Bombay).
 * Builds the whole Google Form, with its sections and branching, in your Google Drive,
 * plus a Google Sheet that collects the responses.
 *
 * 1. Go to https://script.google.com and click "New project".
 * 2. Delete the sample code, paste this whole file, and click Save.
 * 3. Pick "buildManufacturerSurvey" in the function list at the top and click Run. Allow access when asked.
 * 4. Open the Execution log: it shows the link to edit the form, the link to share, and the response sheet.
 *
 * The questions live in SURVEY below. The readable version is research/16_manufacturer_survey_google_form.md.
 * A choice written as [label, section id] sends the respondent to that section ("submit" ends the form);
 * a section's "then" sends respondents who finish it to another section.
 */

const IDEAS = ['A. Price check', 'B. Demand report', 'C. Make to confirmed orders', 'D. Cluster warehouse', 'E. Early payment', 'F. Visibility boost', 'G. WhatsApp ordering'];
const CHANNELS = ['Distributors or wholesalers', 'Retail shops directly', 'Export buyers', 'Brands (job work or private label)', 'Our own shop', 'Online marketplaces', 'Our own website, Instagram or WhatsApp', 'Government or institutions'];
const STOP_REASONS = ['Too few orders in the first months', 'Too many returns', 'Too many orders could not be delivered and came back', 'Return and shipping charges were too high', 'Prices were too low to make money', 'Penalties or account problems', 'Packing and shipping every order was too much work', 'Payment came too late', 'We moved to another marketplace'];

const SURVEY = {
  title: 'Factory survey: how you sell today, and what would help you sell online',
  description: [
    'We are two students at IIT Bombay doing research for the Meesho DICE Challenge, a student case competition. This survey asks how your factory sells today and what makes selling online hard. It takes about 8 minutes, and there are no right or wrong answers.',
    'Your answers are confidential: we report totals only, never names. Contact details at the end are optional.',
    'Some questions describe ideas we are testing. They are not offers from Meesho or any other company.',
  ].join('\n\n'),
  confirmation: 'Thank you for your time. We report totals only, never names. If you left a number, we will share a short summary of the results with you.',
  sections: [
    { id: 'start', title: 'About this survey', questions: [
      { n: 1, type: 'choice', title: 'Do you agree to take part?', choices: [['Yes, I agree. My answers can be used without my name.', 'next'], ['No', 'submit']], feeds: 'Consent' },
    ] },
    { id: 'factory', title: 'Your factory', questions: [
      { n: 2, type: 'choice', title: 'What does your unit mainly make?', other: true, feeds: 'Category, against the 12-category screen (Segmentation)',
        choices: ['Hosiery, innerwear or socks', 'Home textiles (bedsheets, towels, curtains)', 'Sarees or dress material', 'Readymade garments (kurtis, shirts, kidswear)', 'Plastic household items', 'Imitation jewellery', 'Steel kitchenware', 'Footwear', 'Brass or metal décor', 'Bags', 'Electronics accessories'] },
      { n: 3, type: 'choice', title: 'Where is your unit?', other: true, feeds: 'Cluster (Cluster Criteria: Tiruppur, Panipat first)',
        choices: ['Tiruppur', 'Erode', 'Coimbatore', 'Panipat', 'Ludhiana', 'Surat', 'Bhiwandi', 'Rajkot', 'Moradabad', 'Agra', 'Jaipur', 'Delhi NCR', 'Kolkata'] },
      { n: 4, type: 'choice', title: 'What is your role?', other: true, feeds: 'Checks that owners or managers answered',
        choices: ['Owner or partner', 'Family member working in the business', 'Manager'] },
      { n: 5, type: 'choice', title: "What was your unit's turnover last financial year?", feeds: 'Size: micro vs small and medium (SAM is above micro)',
        choices: ['Under ₹10 crore', '₹10-25 crore', '₹25-50 crore', '₹50-100 crore', 'More than ₹100 crore', 'Prefer not to say'] },
      { n: 6, type: 'choice', title: 'In a normal month, how much of your production capacity is unused?', feeds: 'Idle capacity: the motivation to take batches',
        choices: ['Under 10%', '10-20%', '20-30%', 'More than 30%', "Don't know"] },
      { n: 7, type: 'checkbox', title: 'Who do you sell to today? Tick all that apply.', other: true, choices: CHANNELS, feeds: 'Channel mix; dependence on distributors (channel conflict)' },
      { n: 8, type: 'choice', title: 'Which ONE of these brings you the most sales?', other: true, choices: CHANNELS, feeds: 'Main channel' },
      { n: 9, type: 'choice', title: 'In the last 12 months, your export orders have:', feeds: 'Export shock: the motivation behind the domestic hedge',
        choices: ['Fallen a lot', 'Fallen a little', 'Stayed about the same', 'Grown', 'We do not export'] },
    ] },
    { id: 'online', title: 'Selling online', questions: [
      { n: 10, type: 'choice', title: 'Has your unit ever sold to online buyers through its own seller account on a marketplace?', help: 'Selling through a trader or reseller who lists your goods does not count.',
        feeds: 'Segment: offline (Cohort A), online elsewhere (B), stopped on Meesho (C), active on Meesho',
        choices: [['No, never', 'never'], ['Yes, on Meesho, and we still do', 'meesho_now'], ['Yes, on Meesho, but we stopped', 'meesho_stopped'], ['Yes, but only on other marketplaces (Amazon, Flipkart and others)', 'elsewhere']] },
    ] },
    { id: 'never', title: 'You have not sold online yet', then: 'costs', questions: [
      { n: 11, type: 'checkbox', title: 'What has kept you from selling online so far? Pick up to 3.', max: 3, other: true, feeds: 'Cohort A barriers (Primary Research barrier grid; personas)',
        choices: ["We don't know how to start", 'Returns and damaged goods coming back', 'Packing and shipping every order ourselves', 'Keeping stock ready before orders come', 'Platform fees and commission', 'Online prices are too low for us', 'Payment comes too late', 'No staff or tech skills for online orders', 'It would upset our distributors or buyers', 'Our current buyers already take everything we make'] },
    ] },
    { id: 'elsewhere', title: 'You sell on other marketplaces', then: 'costs', questions: [
      { n: 12, type: 'checkbox', title: 'Where do you sell online? Tick all that apply.', other: true, choices: ['Amazon', 'Flipkart', 'Myntra or Ajio', 'JioMart', 'IndiaMART', 'Our own website'], feeds: 'Cohort B profile' },
      { n: 13, type: 'choice', title: 'About what share of your sales is online?', choices: ['Under 10%', '10-25%', '25-50%', 'More than 50%'], feeds: 'Cohort B profile' },
      { n: 14, type: 'checkbox', title: "Why don't you sell on Meesho? Pick up to 2.", max: 2, other: true, feeds: 'Cohort B barriers (the order-value and brand-dilution claims)',
        choices: ['Order values are too low for our products', 'Prices on Meesho are below our cost', 'Too many returns', 'It could hurt our brand', 'We have not looked at Meesho', 'Fees or payment terms', 'We already have enough sales'] },
    ] },
    { id: 'meesho_stopped', title: 'You stopped selling on Meesho', then: 'costs', questions: [
      { n: 15, type: 'choice', title: 'How long did you sell on Meesho?', choices: ['Under 3 months', '3-12 months', '1-2 years', 'More than 2 years'], feeds: 'Cohort C: when sellers leave (the first-30-days problem)' },
      { n: 16, type: 'checkbox', title: 'Why did you stop? Pick up to 3.', max: 3, other: true, choices: STOP_REASONS, feeds: 'Cohort C churn reasons (Journey: activation and grants)' },
      { n: 17, type: 'choice', title: 'Which ONE reason mattered most?', other: true, choices: STOP_REASONS, feeds: 'Main churn reason' },
      { n: 18, type: 'choice', title: 'Is your Meesho seller account (KYC and catalogue) still active?', choices: ['Yes', 'No', 'Not sure'], feeds: 'Cohort C re-invite: KYC and catalogue on file' },
    ] },
    { id: 'meesho_now', title: 'You sell on Meesho now', questions: [
      { n: 19, type: 'choice', title: 'How long have you sold on Meesho?', choices: ['Under 3 months', '3-12 months', '1-2 years', 'More than 2 years'], feeds: 'Comparison group' },
      { n: 20, type: 'choice', title: 'About how many Meesho orders do you get a day?', choices: ['Under 10', '10-50', '50-200', 'More than 200'], feeds: 'Comparison group: orders a day per seller' },
      { n: 21, type: 'checkbox', title: 'What is hardest about selling on Meesho? Pick up to 2.', max: 2, other: true, feeds: 'Pain points of active sellers (Journey)',
        choices: ['Returns', 'Orders that could not be delivered and came back', 'Low prices', 'Getting orders for new listings', 'Packing and shipping every order', 'Payment timing'] },
    ] },
    { id: 'costs', title: 'Costs, cash and batches', questions: [
      { n: 22, type: 'choice', title: 'When do your distributors or B2B buyers usually pay you?', feeds: 'The 45-60 day distributor terms (A30, cash cycle)',
        choices: ['Before or at delivery', 'Within 30 days of delivery', '30-45 days after delivery', '45-60 days after delivery', 'More than 60 days after delivery'] },
      { n: 23, type: 'choice', title: 'On B2B orders for your main product, what is your usual profit as a share of your selling price?', feeds: 'Target margin on price, 9% (A23)',
        choices: ['Under 5%', '5-8%', '8-12%', '12-20%', 'More than 20%', 'Prefer not to say'] },
      { n: 24, type: 'choice', title: 'How much do distributors or wholesalers usually add to your price before selling to shops?', feeds: 'Wholesaler mark-up, 15% (A24) and the ₹1,049 cr problem size',
        choices: ['Under 10%', '10-20%', '20-30%', 'More than 30%', "Don't know"] },
      { n: 25, type: 'number', title: "If you make men's cotton briefs (pack of 3): what does one pack cost you to make, in rupees?", required: false, min: 10, max: 1000,
        help: "Material, labour and overheads; not packing or shipping. Leave blank if you don't make this product.", feeds: 'Making cost of a 3-pack, ₹80 (A22): the assumption the deck flags to confirm' },
      { n: 26, type: 'text', title: 'What is your best-selling product?', required: false, help: 'For example: double bedsheet with 2 pillow covers.', feeds: 'Price chain check, with 27 and 28' },
      { n: 27, type: 'number', title: 'What price do you sell it at to B2B buyers (ex-factory), in rupees per piece or pack?', required: false, min: 1, max: 100000, feeds: 'Ex-factory price' },
      { n: 28, type: 'number', title: 'About what price does it sell for in a shop, in rupees?', required: false, min: 1, max: 100000, feeds: 'Shop price: mark-up from factory to buyer' },
      { n: 29, type: 'choice', title: 'What is the smallest batch of one design you can make without losing money?', feeds: 'Minimum batch (Demand Brief pools demand into batches of 500+)',
        choices: ['Under 200 pieces', '200-500 pieces', '500-1,000 pieces', 'More than 1,000 pieces'] },
      { n: 30, type: 'choice', title: 'Once an order is confirmed, how many days do you need to make and pack 1,000 pieces of your main product?', feeds: 'Fit with the 7-8 day pre-order window',
        choices: ['1-3 days', '4-7 days', '8-14 days', 'More than 14 days'] },
      { n: 31, type: 'choice', title: 'How do you usually pay for raw material for an order?', other: true, feeds: 'Need for the NBFC advance (A20)',
        choices: ['Our own money', 'Bank loan or overdraft', 'Advance from the buyer', 'Credit from our material supplier'] },
    ] },
    { id: 'ideas', title: 'Ideas we are testing', help: [
      'Imagine an online marketplace offered these to factories like yours. These are ideas we are testing, not real offers.',
      'A. Price check: enter your making cost and see, free, whether your price would be at least 8% below what buyers pay for the same product today.',
      'B. Demand report: every week, orders for your product by district, the prices that sell, and the best-selling sizes and colours.',
      'C. Make to confirmed orders: buyers pay in advance and accept 7-8 day delivery; you make only the confirmed orders plus 15% extra.',
      'D. Cluster warehouse: you drop goods in bulk at a warehouse near you; it packs, ships and handles returns, for a fee per piece.',
      'E. Early payment: 30% of the order value paid when you hand over the goods, the rest 7 days after delivery.',
      'F. Visibility boost: extra views for your listings in your first two weeks.',
      'G. WhatsApp ordering: weekly demand and batch confirmation on WhatsApp, with no app to learn.',
    ].join('\n'), questions: [
      { n: 32, type: 'grid', title: 'How useful would each idea be for your business?', rows: IDEAS, columns: ['Not useful', 'A little useful', 'Very useful', 'Not sure'], feeds: 'Lever value by segment (RICE impact and confidence)' },
      { n: 33, type: 'choice', title: 'If you could have only ONE of these, which would you choose?', choices: [...IDEAS, 'None of these'], feeds: 'The single most valued lever' },
      { n: 34, type: 'grid', title: 'The cluster warehouse (idea D) charges a fee for each piece it packs and ships, and it handles returns. Would you use it at each fee?',
        rows: ['₹10 a piece', '₹20 a piece', '₹30 a piece'], columns: ['Yes', 'Maybe', 'No'], feeds: 'Node fee acceptance at ₹10 / ₹20 / ₹30 (A28: ₹20)' },
      { n: 35, type: 'choice', title: 'For a confirmed batch, how much of the order value would you need at handover before agreeing to make it?', feeds: 'Upfront cash needed (A20: 30% advance)',
        choices: ['Nothing upfront; payment after delivery is fine', '10%', '20%', '30%', '50% or more'] },
      { n: 36, type: 'choice', title: 'Would you give buyers ₹10 off a ₹250 pack if every order were prepaid and confirmed before you start making it?', choices: ['Yes', 'Maybe', 'No'], feeds: 'Who funds the ₹10 pre-order discount (A32)' },
      { n: 37, type: 'choice', title: 'Making only confirmed orders means buyers wait 7-8 days. Would that work with your production?', choices: ['Yes, easily', 'Yes, with some planning', 'No, we need to sell from stock'], feeds: 'Make-to-order fit' },
    ] },
    { id: 'view', title: 'Your view', questions: [
      { n: 38, type: 'scale', title: 'If these ideas were available in your cluster next month, how likely is it that you would start or grow online selling within 30 days?', from: 1, to: 5, fromLabel: 'Not at all likely', toLabel: 'Very likely',
        feeds: 'Stated intent, counted at 50% before use as an adoption rate' },
      { n: 39, type: 'paragraph', title: 'What else would you need before selling online, or selling more online?', required: false, feeds: 'Open answers: quotes for the stakeholder-voice table' },
      { n: 40, type: 'choice', title: 'Can we call you for a 15-minute follow-up conversation?', choices: [['Yes', 'contact'], ['No', 'submit']], feeds: 'Interview recruits' },
    ] },
    { id: 'contact', title: 'Contact details (optional)', help: 'Used only to call you about this research. We never share them.', questions: [
      { n: 41, type: 'text', title: "Your name and your unit's name", required: false, feeds: 'Follow-up' },
      { n: 42, type: 'phone', title: 'Phone or WhatsApp number', required: false, feeds: 'Follow-up' },
      { n: 43, type: 'text', title: 'Best time to call', required: false, feeds: 'Follow-up' },
    ] },
  ],
};

function buildManufacturerSurvey() {
  const form = FormApp.create(SURVEY.title)
    .setDescription(SURVEY.description)
    .setConfirmationMessage(SURVEY.confirmation)
    .setProgressBar(true)
    .setAllowResponseEdits(false)
    .setShowLinkToRespondAgain(false);
  const pages = {};
  const branching = [];
  SURVEY.sections.forEach((section, i) => {
    if (i > 0) {
      pages[section.id] = form.addPageBreakItem().setTitle(section.title);
      if (section.help) pages[section.id].setHelpText(section.help);
    }
    section.questions.forEach((q) => {
      const item = addQuestion(form, q);
      if (q.choices && q.choices.some(Array.isArray)) branching.push([item, q]);
    });
  });
  // Choices that send respondents to a section, set once every section exists.
  branching.forEach(([item, q]) => item.setChoices(q.choices.map(([label, to]) => item.createChoice(label, destination(to, pages)))));
  // Finishing a section with "then": the page break after it redirects (setGoToPage acts on the page before it).
  SURVEY.sections.forEach((section, i) => {
    if (section.then) pages[SURVEY.sections[i + 1].id].setGoToPage(pages[section.then]);
  });
  const sheet = SpreadsheetApp.create(`${SURVEY.title} (responses)`);
  form.setDestination(FormApp.DestinationType.SPREADSHEET, sheet.getId());
  let share = form.getPublishedUrl();
  try { share = form.shortenFormUrl(share); } catch (e) { /* keep the long link */ }
  console.log(`Edit the form: ${form.getEditUrl()}`);
  console.log(`Link to share: ${share}`);
  console.log(`Responses sheet: ${sheet.getUrl()}`);
}

function destination(to, pages) {
  if (to === 'next') return FormApp.PageNavigationType.CONTINUE;
  if (to === 'submit') return FormApp.PageNavigationType.SUBMIT;
  return pages[to];
}

function addQuestion(form, q) {
  let item;
  switch (q.type) {
    case 'choice':
      item = form.addMultipleChoiceItem();
      if (!q.choices.some(Array.isArray)) item.setChoiceValues(q.choices);
      if (q.other) item.showOtherOption(true);
      break;
    case 'checkbox':
      item = form.addCheckboxItem().setChoiceValues(q.choices);
      if (q.other) item.showOtherOption(true);
      if (q.max) item.setValidation(FormApp.createCheckboxValidation().setHelpText(`Pick up to ${q.max}.`).requireSelectAtMost(q.max).build());
      break;
    case 'grid':
      item = form.addGridItem().setRows(q.rows).setColumns(q.columns);
      break;
    case 'scale':
      item = form.addScaleItem().setBounds(q.from, q.to).setLabels(q.fromLabel, q.toLabel);
      break;
    case 'number':
      item = form.addTextItem().setValidation(FormApp.createTextValidation().setHelpText(`Enter a number from ${q.min} to ${q.max}.`).requireNumberBetween(q.min, q.max).build());
      break;
    case 'phone':
      item = form.addTextItem().setValidation(FormApp.createTextValidation().setHelpText('Enter a 10-digit mobile number.').requireTextMatchesPattern('^[+0-9 ]{10,15}$').build());
      break;
    case 'text':
      item = form.addTextItem();
      break;
    case 'paragraph':
      item = form.addParagraphTextItem();
      break;
    default:
      throw new Error(`Unknown question type: ${q.type}`);
  }
  item.setTitle(q.title).setRequired(q.required !== false);
  if (q.help) item.setHelpText(q.help);
  return item;
}
