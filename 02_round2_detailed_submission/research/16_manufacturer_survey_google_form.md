# Manufacturer survey: Google Form questionnaire

## Short version: 12 questions, about 3 minutes (send this one)

Tap-only: no names, no numbers to type, no contact details, one page. Build it with `survey/manufacturer_survey_short.gs` (same steps as below, but run `buildShortSurvey`). Every question is required; question 6 allows up to 3 picks.

1. **What does your unit mainly make?** Hosiery, innerwear or socks · Home textiles (bedsheets, towels, curtains) · Sarees or dress material · Readymade garments · Plastic household items · Imitation jewellery · Steel kitchenware · Footwear · Brass or metal décor · Bags · Other
2. **Where is your unit?** Tiruppur · Panipat · Ludhiana · Surat · Erode · Rajkot · Moradabad · Agra · Delhi NCR · Kolkata · Other
3. **What was your turnover last financial year?** Under ₹10 crore · ₹10-50 crore · ₹50-100 crore · More than ₹100 crore · Prefer not to say
4. **In a normal month, how much of your production capacity is unused?** Under 10% · 10-20% · 20-30% · More than 30% · Don't know
5. **Have you ever sold online through your own seller account?** (Selling through a trader or reseller does not count.) No, never · Yes, on Meesho, and we still do · Yes, on Meesho, but we stopped · Yes, but only on other marketplaces (Amazon, Flipkart and others)
6. **What makes (or made) selling online hard for you? Pick up to 3.** We don't know how to start · Returns and damaged goods coming back · Orders that could not be delivered and came back · Packing and shipping every order ourselves · Keeping stock ready before orders come · Too few orders in the first months · Fees and commission · Online prices are too low for us · Payment comes too late · It would upset our distributors · Other
7. **When do your distributors or B2B buyers usually pay you?** Before or at delivery · Within 30 days · 30-45 days after delivery · 45-60 days after delivery · More than 60 days after delivery
8. **On B2B orders, what is your usual profit as a share of your selling price?** Under 5% · 5-8% · 8-12% · 12-20% · More than 20% · Prefer not to say
9. **What is the smallest batch of one design you can make without losing money?** Under 200 pieces · 200-500 pieces · 500-1,000 pieces · More than 1,000 pieces
10. **Ideas we are testing: how useful would each be for your business?** (Grid; these are ideas, not real offers.) Rows: A free price check before you list · A weekly report of demand for your product, by district · Making only prepaid, confirmed orders (plus 15% extra) · A warehouse near you that packs, ships and handles returns · 30% of the order value paid when you hand over the goods · Orders and batch confirmation on WhatsApp. Columns: Not useful · A little useful · Very useful
11. **That warehouse charges a fee for each piece it packs, ships and handles returns for. Would you use it at each fee?** (Grid) Rows: ₹10 a piece · ₹20 a piece · ₹30 a piece. Columns: Yes · Maybe · No
12. **If these were available in your cluster next month, how likely is it that you would start or grow selling online within 30 days?** (Scale 1-5: Not at all likely to Very likely)

| # | What the answer tells us |
|---|---|
| 1-4 | Category, cluster, size and idle capacity (who answered, and the motivation to take batches) |
| 5 | Segment: offline (Cohort A), stopped on Meesho (C), other marketplaces (B), on Meesho now |
| 6 | Barriers, read by segment from question 5 (Primary Research barrier grid, personas) |
| 7 | The 45-60 day distributor terms (cash cycle) |
| 8 | Target margin on price, 9% (A23) |
| 9 | Minimum batch (Demand Brief pools demand into batches of 500+) |
| 10 | Value of each Factory Direct lever (RICE impact and confidence) |
| 11 | Node fee acceptance at ₹10 / ₹20 / ₹30 (A28: ₹20) |
| 12 | Stated intent: count it at 50% before using it as an adoption rate |

Left out to keep it short: the ₹80 making cost (A22) and prices need typed numbers, so ask them on follow-up calls. The full version below has them, plus the per-segment sections.

## Full version: 43 questions with branching

A questionnaire for factory owners and managers. It gives the deck its own manufacturer numbers: which group each factory is in, what keeps it offline or made it leave Meesho, its real costs and payment terms, and how it values each Factory Direct lever. It replaces the 8-question "manufacturer pulse" in `13_survey_and_interview_kit.md` (section B); where the questions overlap, the answer options are the same, so any pulse responses can be merged.

| | |
|---|---|
| **Who answers** | Owners or managers of manufacturing units in Meesho's categories, in all four groups: never sold online, sell on other marketplaces, stopped selling on Meesho, sell on Meesho now |
| **Length** | About 8 minutes. Question 10 sends each person to the one section for their group (sections 4 to 7); everyone sees the rest |
| **Questions** | 43 in the form. Each person answers 30 to 33 (5 of them optional), plus 3 optional contact fields if they agree to a follow-up call |
| **Wording rules** | Plain words, one idea per question, a rupee amount on every price question, ideas described as tests rather than offers, no leading wording |

## Build it in Google Forms

**Fastest (about 2 minutes):** `survey/manufacturer_survey_form.gs` builds the whole form, with its sections and branching, plus a Google Sheet for the responses.

1. Go to [script.google.com](https://script.google.com) and click **New project**.
2. Delete the sample code, paste the whole `.gs` file, and click **Save**.
3. Pick `buildManufacturerSurvey` in the function list and click **Run**. Allow access when Google asks.
4. Open the **Execution log**: it shows the link to edit the form, the link to share, and the response sheet.

**By hand:** create the 11 sections below in order, then set the branching: question 1, question 10 and question 40 use "Go to section based on answer", and sections 4, 5 and 6 end with "After section … go to section 8".

Before sharing: preview the form once as each of the four groups, then send it to 2 or 3 owners as a pilot and fix any word they stumble on.

**Test run (optional):** in the same Apps Script project, run `addTestResponses`. It submits 12 made-up responses (5 never online, 3 left Meesho, 2 on other marketplaces, 2 on Meesho), each tagged TEST, so you can check the branching, the response sheet and the summary charts. Then run `deleteTestResponses`, which removes them from the form and the sheet. Test answers are not survey data: never put them in the deck.

## The questionnaire

### Section 1 of 11 · About this survey

**Form title:** Factory survey: how you sell today, and what would help you sell online

**Form description:**

> We are two students at IIT Bombay doing research for the Meesho DICE Challenge, a student case competition. This survey asks how your factory sells today and what makes selling online hard. It takes about 8 minutes, and there are no right or wrong answers.
>
> Your answers are confidential: we report totals only, never names. Contact details at the end are optional.
>
> Some questions describe ideas we are testing. They are not offers from Meesho or any other company.

**1. Do you agree to take part?**  
*Multiple choice · required*
- Yes, I agree. My answers can be used without my name. → continue
- No → submit the form

### Section 2 of 11 · Your factory

**2. What does your unit mainly make?**  
*Multiple choice · required · "Other" option on*
- Hosiery, innerwear or socks
- Home textiles (bedsheets, towels, curtains)
- Sarees or dress material
- Readymade garments (kurtis, shirts, kidswear)
- Plastic household items
- Imitation jewellery
- Steel kitchenware
- Footwear
- Brass or metal décor
- Bags
- Electronics accessories

**3. Where is your unit?**  
*Multiple choice · required · "Other" option on*
- Tiruppur
- Erode
- Coimbatore
- Panipat
- Ludhiana
- Surat
- Bhiwandi
- Rajkot
- Moradabad
- Agra
- Jaipur
- Delhi NCR
- Kolkata

**4. What is your role?**  
*Multiple choice · required · "Other" option on*
- Owner or partner
- Family member working in the business
- Manager

**5. What was your unit's turnover last financial year?**  
*Multiple choice · required*
- Under ₹10 crore
- ₹10-25 crore
- ₹25-50 crore
- ₹50-100 crore
- More than ₹100 crore
- Prefer not to say

**6. In a normal month, how much of your production capacity is unused?**  
*Multiple choice · required*
- Under 10%
- 10-20%
- 20-30%
- More than 30%
- Don't know

**7. Who do you sell to today? Tick all that apply.**  
*Checkboxes · required · "Other" option on*
- Distributors or wholesalers
- Retail shops directly
- Export buyers
- Brands (job work or private label)
- Our own shop
- Online marketplaces
- Our own website, Instagram or WhatsApp
- Government or institutions

**8. Which ONE of these brings you the most sales?**  
*Multiple choice · required · "Other" option on*
- Distributors or wholesalers
- Retail shops directly
- Export buyers
- Brands (job work or private label)
- Our own shop
- Online marketplaces
- Our own website, Instagram or WhatsApp
- Government or institutions

**9. In the last 12 months, your export orders have:**  
*Multiple choice · required*
- Fallen a lot
- Fallen a little
- Stayed about the same
- Grown
- We do not export

### Section 3 of 11 · Selling online

**10. Has your unit ever sold to online buyers through its own seller account on a marketplace?**  
*Multiple choice · required*
Help text: Selling through a trader or reseller who lists your goods does not count.
- No, never → go to Section 4 (You have not sold online yet)
- Yes, on Meesho, and we still do → go to Section 7 (You sell on Meesho now)
- Yes, on Meesho, but we stopped → go to Section 6 (You stopped selling on Meesho)
- Yes, but only on other marketplaces (Amazon, Flipkart and others) → go to Section 5 (You sell on other marketplaces)

### Section 4 of 11 · You have not sold online yet

**11. What has kept you from selling online so far? Pick up to 3.**  
*Checkboxes, pick up to 3 · required · "Other" option on*
- We don't know how to start
- Returns and damaged goods coming back
- Packing and shipping every order ourselves
- Keeping stock ready before orders come
- Platform fees and commission
- Online prices are too low for us
- Payment comes too late
- No staff or tech skills for online orders
- It would upset our distributors or buyers
- Our current buyers already take everything we make

*After this section: go to Section 8 (Costs, cash and batches).*

### Section 5 of 11 · You sell on other marketplaces

**12. Where do you sell online? Tick all that apply.**  
*Checkboxes · required · "Other" option on*
- Amazon
- Flipkart
- Myntra or Ajio
- JioMart
- IndiaMART
- Our own website

**13. About what share of your sales is online?**  
*Multiple choice · required*
- Under 10%
- 10-25%
- 25-50%
- More than 50%

**14. Why don't you sell on Meesho? Pick up to 2.**  
*Checkboxes, pick up to 2 · required · "Other" option on*
- Order values are too low for our products
- Prices on Meesho are below our cost
- Too many returns
- It could hurt our brand
- We have not looked at Meesho
- Fees or payment terms
- We already have enough sales

*After this section: go to Section 8 (Costs, cash and batches).*

### Section 6 of 11 · You stopped selling on Meesho

**15. How long did you sell on Meesho?**  
*Multiple choice · required*
- Under 3 months
- 3-12 months
- 1-2 years
- More than 2 years

**16. Why did you stop? Pick up to 3.**  
*Checkboxes, pick up to 3 · required · "Other" option on*
- Too few orders in the first months
- Too many returns
- Too many orders could not be delivered and came back
- Return and shipping charges were too high
- Prices were too low to make money
- Penalties or account problems
- Packing and shipping every order was too much work
- Payment came too late
- We moved to another marketplace

**17. Which ONE reason mattered most?**  
*Multiple choice · required · "Other" option on*
- Too few orders in the first months
- Too many returns
- Too many orders could not be delivered and came back
- Return and shipping charges were too high
- Prices were too low to make money
- Penalties or account problems
- Packing and shipping every order was too much work
- Payment came too late
- We moved to another marketplace

**18. Is your Meesho seller account (KYC and catalogue) still active?**  
*Multiple choice · required*
- Yes
- No
- Not sure

*After this section: go to Section 8 (Costs, cash and batches).*

### Section 7 of 11 · You sell on Meesho now

**19. How long have you sold on Meesho?**  
*Multiple choice · required*
- Under 3 months
- 3-12 months
- 1-2 years
- More than 2 years

**20. About how many Meesho orders do you get a day?**  
*Multiple choice · required*
- Under 10
- 10-50
- 50-200
- More than 200

**21. What is hardest about selling on Meesho? Pick up to 2.**  
*Checkboxes, pick up to 2 · required · "Other" option on*
- Returns
- Orders that could not be delivered and came back
- Low prices
- Getting orders for new listings
- Packing and shipping every order
- Payment timing

### Section 8 of 11 · Costs, cash and batches

**22. When do your distributors or B2B buyers usually pay you?**  
*Multiple choice · required*
- Before or at delivery
- Within 30 days of delivery
- 30-45 days after delivery
- 45-60 days after delivery
- More than 60 days after delivery

**23. On B2B orders for your main product, what is your usual profit as a share of your selling price?**  
*Multiple choice · required*
- Under 5%
- 5-8%
- 8-12%
- 12-20%
- More than 20%
- Prefer not to say

**24. How much do distributors or wholesalers usually add to your price before selling to shops?**  
*Multiple choice · required*
- Under 10%
- 10-20%
- 20-30%
- More than 30%
- Don't know

**25. If you make men's cotton briefs (pack of 3): what does one pack cost you to make, in rupees?**  
*Short answer, a number from 10 to 1000 · optional*
Help text: Material, labour and overheads; not packing or shipping. Leave blank if you don't make this product.

**26. What is your best-selling product?**  
*Short answer · optional*
Help text: For example: double bedsheet with 2 pillow covers.

**27. What price do you sell it at to B2B buyers (ex-factory), in rupees per piece or pack?**  
*Short answer, a number from 1 to 100000 · optional*

**28. About what price does it sell for in a shop, in rupees?**  
*Short answer, a number from 1 to 100000 · optional*

**29. What is the smallest batch of one design you can make without losing money?**  
*Multiple choice · required*
- Under 200 pieces
- 200-500 pieces
- 500-1,000 pieces
- More than 1,000 pieces

**30. Once an order is confirmed, how many days do you need to make and pack 1,000 pieces of your main product?**  
*Multiple choice · required*
- 1-3 days
- 4-7 days
- 8-14 days
- More than 14 days

**31. How do you usually pay for raw material for an order?**  
*Multiple choice · required · "Other" option on*
- Our own money
- Bank loan or overdraft
- Advance from the buyer
- Credit from our material supplier

### Section 9 of 11 · Ideas we are testing

> Imagine an online marketplace offered these to factories like yours. These are ideas we are testing, not real offers.  
> A. Price check: enter your making cost and see, free, whether your price would be at least 8% below what buyers pay for the same product today.  
> B. Demand report: every week, orders for your product by district, the prices that sell, and the best-selling sizes and colours.  
> C. Make to confirmed orders: buyers pay in advance and accept 7-8 day delivery; you make only the confirmed orders plus 15% extra.  
> D. Cluster warehouse: you drop goods in bulk at a warehouse near you; it packs, ships and handles returns, for a fee per piece.  
> E. Early payment: 30% of the order value paid when you hand over the goods, the rest 7 days after delivery.  
> F. Visibility boost: extra views for your listings in your first two weeks.  
> G. WhatsApp ordering: weekly demand and batch confirmation on WhatsApp, with no app to learn.  

**32. How useful would each idea be for your business?**  
*Multiple-choice grid · required*
- Rows: A. Price check · B. Demand report · C. Make to confirmed orders · D. Cluster warehouse · E. Early payment · F. Visibility boost · G. WhatsApp ordering
- Columns: Not useful · A little useful · Very useful · Not sure

**33. If you could have only ONE of these, which would you choose?**  
*Multiple choice · required*
- A. Price check
- B. Demand report
- C. Make to confirmed orders
- D. Cluster warehouse
- E. Early payment
- F. Visibility boost
- G. WhatsApp ordering
- None of these

**34. The cluster warehouse (idea D) charges a fee for each piece it packs and ships, and it handles returns. Would you use it at each fee?**  
*Multiple-choice grid · required*
- Rows: ₹10 a piece · ₹20 a piece · ₹30 a piece
- Columns: Yes · Maybe · No

**35. For a confirmed batch, how much of the order value would you need at handover before agreeing to make it?**  
*Multiple choice · required*
- Nothing upfront; payment after delivery is fine
- 10%
- 20%
- 30%
- 50% or more

**36. Would you give buyers ₹10 off a ₹250 pack if every order were prepaid and confirmed before you start making it?**  
*Multiple choice · required*
- Yes
- Maybe
- No

**37. Making only confirmed orders means buyers wait 7-8 days. Would that work with your production?**  
*Multiple choice · required*
- Yes, easily
- Yes, with some planning
- No, we need to sell from stock

### Section 10 of 11 · Your view

**38. If these ideas were available in your cluster next month, how likely is it that you would start or grow online selling within 30 days?**  
*Linear scale 1-5 · required*
- 1 = Not at all likely, 5 = Very likely

**39. What else would you need before selling online, or selling more online?**  
*Paragraph · optional*

**40. Can we call you for a 15-minute follow-up conversation?**  
*Multiple choice · required*
- Yes → go to Section 11 (Contact details (optional))
- No → submit the form

### Section 11 of 11 · Contact details (optional)

> Used only to call you about this research. We never share them.  

**41. Your name and your unit's name**  
*Short answer · optional*

**42. Phone or WhatsApp number**  
*Short answer, a 10-digit number · optional*

**43. Best time to call**  
*Short answer · optional*

## What each answer feeds

| # | What the answer tells us |
|---|---|
| 2 | Category, against the 12-category screen (Segmentation) |
| 3 | Cluster (Cluster Criteria: Tiruppur, Panipat first) |
| 4 | Checks that owners or managers answered |
| 5 | Size: micro vs small and medium (SAM is above micro) |
| 6 | Idle capacity: the motivation to take batches |
| 7 | Channel mix; dependence on distributors (channel conflict) |
| 8 | Main channel |
| 9 | Export shock: the motivation behind the domestic hedge |
| 10 | Segment: offline (Cohort A), online elsewhere (B), stopped on Meesho (C), active on Meesho |
| 11 | Cohort A barriers (Primary Research barrier grid; personas) |
| 12 | Cohort B profile |
| 13 | Cohort B profile |
| 14 | Cohort B barriers (the order-value and brand-dilution claims) |
| 15 | Cohort C: when sellers leave (the first-30-days problem) |
| 16 | Cohort C churn reasons (Journey: activation and grants) |
| 17 | Main churn reason |
| 18 | Cohort C re-invite: KYC and catalogue on file |
| 19 | Comparison group |
| 20 | Comparison group: orders a day per seller |
| 21 | Pain points of active sellers (Journey) |
| 22 | The 45-60 day distributor terms (A30, cash cycle) |
| 23 | Target margin on price, 9% (A23) |
| 24 | Wholesaler mark-up, 15% (A24) and the ₹1,049 cr problem size |
| 25 | Making cost of a 3-pack, ₹80 (A22): the assumption the deck flags to confirm |
| 26 | Price chain check, with 27 and 28 |
| 27 | Ex-factory price |
| 28 | Shop price: mark-up from factory to buyer |
| 29 | Minimum batch (Demand Brief pools demand into batches of 500+) |
| 30 | Fit with the 7-8 day pre-order window |
| 31 | Need for the NBFC advance (A20) |
| 32 | Lever value by segment (RICE impact and confidence) |
| 33 | The single most valued lever |
| 34 | Node fee acceptance at ₹10 / ₹20 / ₹30 (A28: ₹20) |
| 35 | Upfront cash needed (A20: 30% advance) |
| 36 | Who funds the ₹10 pre-order discount (A32) |
| 37 | Make-to-order fit |
| 38 | Stated intent, counted at 50% before use as an adoption rate |
| 39 | Open answers: quotes for the stakeholder-voice table |
| 40 | Interview recruits |

How to read the results:

- Give counts with their base, as "x of y owners". Use percentages only for groups with 30 or more answers.
- Question 38 is stated intent: count it at 50% before using it as an adoption rate, as the buyer survey does.
- The split across the four groups shows who the survey reached, not the market. Keep the cohort sizes in the deck (8,400 / 2,200 / 1,050) from the model.
- Questions 23 to 25 check the three assumptions the unit economics rest on (9% margin, 15% mark-up, ₹80 making cost). If the answers differ, change the values in `deck/source/model.mjs` and every slide updates.

## Fielding

- **For today's deck:** close responses by 8 PM IST on 4 Oct to leave time to update slides 2, 3 and 10 before the 11:59 PM deadline. Even 10 to 15 answers are useful as "x of y owners".
- **Where to send it:** the Round 1 interviewees (ask each to forward it to 3 to 5 peers); the Tiruppur and Panipat association contacts; IndiaMART suppliers in the nine categories (call first, then WhatsApp the link); Meesho seller groups on Facebook, Telegram and WhatsApp, for active and former sellers.
- **On calls:** read the questions aloud and fill in the form for the owner.
- **Target:** 30 or more in each group you report on.
- **Export:** responses land in the linked Google Sheet; count the answers per option and keep the base n for each question.
