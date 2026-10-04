/**
 * Factory survey, short version: 12 tap-only questions, about 3 minutes, no names, no numbers to type.
 * For the Meesho DICE S3 C2M case (Team 23B0747, IIT Bombay).
 *
 * 1. Go to https://script.google.com and click "New project".
 * 2. Delete the sample code, paste this whole file, and click Save.
 * 3. Pick "buildShortSurvey" in the function list at the top and click Run. Allow access when asked.
 * 4. Open the Execution log: it shows the link to edit the form and the link to share.
 *
 * Responses show in the form's Responses tab (Google Forms can link a Sheet from there if you want one).
 * The full 43-question version is manufacturer_survey_form.gs; this one keeps the questions the deck needs most.
 */

const SHORT_SURVEY = {
  title: 'Factory survey: selling online (3 minutes)',
  description: [
    'We are two students at IIT Bombay doing research for the Meesho DICE Challenge, a student case competition. There are 12 quick questions and no names or numbers to type.',
    'Questions 10 and 11 describe ideas we are testing. They are not offers from Meesho or any other company.',
    'By submitting, you agree that your answers can be used in our research. We report totals only.',
  ].join('\n\n'),
  confirmation: 'Thank you for your time. We report totals only.',
  questions: [
    { n: 1, type: 'choice', title: 'What does your unit mainly make?', other: true,
      choices: ['Hosiery, innerwear or socks', 'Home textiles (bedsheets, towels, curtains)', 'Sarees or dress material', 'Readymade garments', 'Plastic household items', 'Imitation jewellery', 'Steel kitchenware', 'Footwear', 'Brass or metal décor', 'Bags'] },
    { n: 2, type: 'choice', title: 'Where is your unit?', other: true,
      choices: ['Tiruppur', 'Panipat', 'Ludhiana', 'Surat', 'Erode', 'Rajkot', 'Moradabad', 'Agra', 'Delhi NCR', 'Kolkata'] },
    { n: 3, type: 'choice', title: 'What was your turnover last financial year?',
      choices: ['Under ₹10 crore', '₹10-50 crore', '₹50-100 crore', 'More than ₹100 crore', 'Prefer not to say'] },
    { n: 4, type: 'choice', title: 'In a normal month, how much of your production capacity is unused?',
      choices: ['Under 10%', '10-20%', '20-30%', 'More than 30%', "Don't know"] },
    { n: 5, type: 'choice', title: 'Have you ever sold online through your own seller account?', help: 'Selling through a trader or reseller does not count.',
      choices: ['No, never', 'Yes, on Meesho, and we still do', 'Yes, on Meesho, but we stopped', 'Yes, but only on other marketplaces (Amazon, Flipkart and others)'] },
    { n: 6, type: 'checkbox', title: 'What makes (or made) selling online hard for you? Pick up to 3.', max: 3, other: true,
      choices: ["We don't know how to start", 'Returns and damaged goods coming back', 'Orders that could not be delivered and came back', 'Packing and shipping every order ourselves', 'Keeping stock ready before orders come', 'Too few orders in the first months', 'Fees and commission', 'Online prices are too low for us', 'Payment comes too late', 'It would upset our distributors'] },
    { n: 7, type: 'choice', title: 'When do your distributors or B2B buyers usually pay you?',
      choices: ['Before or at delivery', 'Within 30 days', '30-45 days after delivery', '45-60 days after delivery', 'More than 60 days after delivery'] },
    { n: 8, type: 'choice', title: 'On B2B orders, what is your usual profit as a share of your selling price?',
      choices: ['Under 5%', '5-8%', '8-12%', '12-20%', 'More than 20%', 'Prefer not to say'] },
    { n: 9, type: 'choice', title: 'What is the smallest batch of one design you can make without losing money?',
      choices: ['Under 200 pieces', '200-500 pieces', '500-1,000 pieces', 'More than 1,000 pieces'] },
    { n: 10, type: 'grid', title: 'Ideas we are testing: how useful would each be for your business?', help: 'These are ideas, not real offers.',
      rows: ['A free price check before you list', 'A weekly report of demand for your product, by district', 'Making only prepaid, confirmed orders (plus 15% extra)', 'A warehouse near you that packs, ships and handles returns', '30% of the order value paid when you hand over the goods', 'Orders and batch confirmation on WhatsApp'],
      columns: ['Not useful', 'A little useful', 'Very useful'] },
    { n: 11, type: 'grid', title: 'That warehouse charges a fee for each piece it packs, ships and handles returns for. Would you use it at each fee?',
      rows: ['₹10 a piece', '₹20 a piece', '₹30 a piece'], columns: ['Yes', 'Maybe', 'No'] },
    { n: 12, type: 'scale', title: 'If these were available in your cluster next month, how likely is it that you would start or grow selling online within 30 days?',
      from: 1, to: 5, fromLabel: 'Not at all likely', toLabel: 'Very likely' },
  ],
};

function buildShortSurvey() {
  const form = FormApp.create(SHORT_SURVEY.title)
    .setDescription(SHORT_SURVEY.description)
    .setConfirmationMessage(SHORT_SURVEY.confirmation)
    .setAllowResponseEdits(false)
    .setShowLinkToRespondAgain(false);
  SHORT_SURVEY.questions.forEach((q) => addShortQuestion(form, q));
  let share = form.getPublishedUrl();
  try { share = form.shortenFormUrl(share); } catch (e) { /* keep the long link */ }
  console.log(`Edit the form: ${form.getEditUrl()}`);
  console.log(`Link to share: ${share}`);
}

function addShortQuestion(form, q) {
  let item;
  switch (q.type) {
    case 'choice':
      item = form.addMultipleChoiceItem().setChoiceValues(q.choices);
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
    default:
      throw new Error(`Unknown question type: ${q.type}`);
  }
  item.setTitle(q.title).setRequired(true);
  if (q.help) item.setHelpText(q.help);
  return item;
}
