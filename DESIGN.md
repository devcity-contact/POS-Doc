<!-- Generated from stitch-prompts.html by tools/build_design_md.py. Edit the HTML page, then re-run. -->

# RetailOS design system & Google Stitch prompts

Copy-ready prompts for designing every RetailOS screen in Google Stitch. Paste the master prompt first so Stitch learns the product and design system. Then add screens one at a time, and ask for a dark version of each.

Brand: RetailOS by DevCity · Style: clean modern SaaS · Themes: light + dark for every screen · Scope: all screens (R, A, P, mobile)

## Brand palette and usage rules

| Hex | Role |
|---|---|
| `#3772FF` | Primary · brand, buttons, selection, info |
| `#22C55E` | Success · totals, synced, complete |
| `#272932` | Charcoal · text, dark surfaces |
| `#FDFFFC` | Off-white · light background |
| `#FF7F11` | Warning · offline, expiry, low stock |
| `#FF1B1C` | Error · blocked, void, failure |

### Contrast-safe usage (measured)

| Pairing | Contrast | Rule |
|---|---|---|
| White text on #3772FF | 4.2 : 1 | OK for button labels at **16 px semibold or larger** (and all register buttons, which are 18 px+). For small blue link text on light backgrounds use **#2A5BD9** (5.8 : 1). |
| White text on #22C55E | 2.3 : 1 ✗ | **Never put white text on green.** Use green fills and badges with charcoal #272932 text (6.4 : 1). |
| #22C55E text on #FDFFFC | 2.3 : 1 ✗ | For green *text* (totals, change due) in light mode use **#15803D** (5.0 : 1). In dark mode #22C55E text is fine (7.1 : 1). |
| #FF7F11 text on light | 2.5 : 1 ✗ | Orange as a fill or icon with charcoal text (5.7 : 1). Orange *text* in light mode: **#C2410C**. |
| #FF1B1C on light | 3.9 : 1 | Red text and destructive buttons in light mode: **#D91415** (5.1 : 1). Dark mode red: **#FF4D4E**. |
| #272932 on #FDFFFC | 14.4 : 1 | Body text. Muted text **#6B7080** (4.9 : 1). |

### Full token set

| Token | Light | Dark |
|---|---|---|
| Background | #FDFFFC | #1E2028 |
| Surface (cards, panels) | #FFFFFF | #272932 |
| Surface subtle / raised | #F3F5F9 | #31343F |
| Border | #E4E7EC | #3A3D4A |
| Text / muted text | #272932 / #6B7080 | #FDFFFC / #A3A8B8 |
| Primary (fill) / primary text-link | #3772FF / #2A5BD9 | #3772FF / #5B8CFF |
| Primary tint (selected row, focus) | #EBF1FF | #25335C |
| Success fill / success text / tint | #22C55E / #15803D / #E8F9EE | #22C55E / #22C55E / #173826 |
| Warning fill / text / tint | #FF7F11 / #C2410C / #FFF1E5 | #FF7F11 / #FF7F11 / #3D2A17 |
| Error fill / text / tint | #D91415 / #D91415 / #FFE8E8 | #FF4D4E / #FF4D4E / #3D1C1E |

These tokens replace the placeholder colours in [UI design → colour](ui-design.html#colour), and go into `packages/ui/tokens`.

## How to use these prompts in Stitch

1. **One Stitch project per app:** "RetailOS Register" (Web mode), "RetailOS Admin" (Web mode), "RetailOS Mobile" (Mobile mode), "RetailOS Console" (Web mode). This keeps each project's context focused.
2. **First message in each project:** paste the [master prompt](#master-prompt-paste-first-in-every-project), then the first screen prompt. Stitch keeps the conversation as context for later screens.
3. **One screen per prompt.** Stitch gives better results for focused requests. Paste the next screen prompt only when the current one looks right.
4. **Dark mode:** after each light screen is accepted, send the [dark variant prompt](#dark-variant-prompt-after-each-screen).
5. **Refine with small edits** ([refinement prompts](#refinement-prompts-one-change-at-a-time)), one change at a time. Big multi-change edits tend to drift from the design system.
6. **Export** to Figma (for the design file) or copy the HTML/CSS as a starting point. Then rebuild with `packages/ui` components, because the generated code is a reference, not production code.
7. **Keep the screen ID** (e.g. R-04) in each Stitch screen name so designs, docs and code match.

> **If Stitch cuts off a long prompt**  
> Use the [short master prompt](#short-master-prompt), and repeat "Use the RetailOS design system: primary #3772FF, success #22C55E, charcoal #272932, background #FDFFFC" at the top of each screen prompt.

## Master prompt (paste first in every project)

```text
Design "RetailOS by DevCity", a modern point-of-sale (POS) and back-office system for retail shops, pharmacies and grocery stores in Sri Lanka. It must feel fast, calm and trustworthy, in a clean modern SaaS style similar to Shopify POS, Square and Linear.

USERS: cashiers at a busy counter (barcode scanner + keyboard + touch), pharmacists, branch managers, shop owners and accountants. The register works offline and syncs later, so always show sync/online status.

LOCALE: currency LKR shown as "Rs 1,250.00" with tabular numbers. A language switch EN | සිං | தமி is available; layouts must allow longer Sinhala/Tamil text without clipping.

COLOURS (light theme):
- Background #FDFFFC, cards #FFFFFF, subtle panels #F3F5F9, borders #E4E7EC
- Text #272932, muted text #6B7080
- PRIMARY #3772FF for brand, primary buttons (white label, semibold 16px+), selected states, active nav, info badges; small link text #2A5BD9; selected row tint #EBF1FF
- SUCCESS #22C55E for totals, "synced", "online", "sale complete", success badges. Use green as a fill/badge with charcoal #272932 text; green TEXT on light backgrounds must be #15803D. Never white text on green.
- WARNING #FF7F11 (fill/icon with charcoal text; tint #FFF1E5; text #C2410C) for offline, near-expiry, low stock
- ERROR #FF1B1C family (red text and destructive buttons #D91415; tint #FFE8E8) for blocked, void, errors

STYLE: 8px spacing grid; cards 12px radius; buttons and inputs 10px radius; very soft shadows; Inter font (Noto Sans Sinhala/Tamil for local text); Lucide-style outline icons; generous whitespace; exactly one primary button per screen; status badges always include an icon and a text label.

REGISTER RULES: body text at least 16px, totals 32-48px, touch targets at least 48px, F-key shortcut hints shown as small key caps on buttons, no page scrolling (only lists scroll).

Do not design anything yet; confirm you understand the RetailOS design system. I will send screens one by one.
```

### Short master prompt

```text
RetailOS by DevCity: modern POS + back office for Sri Lankan retail, pharmacy and grocery. Clean SaaS style (Shopify POS / Linear). Light theme: bg #FDFFFC, cards #FFFFFF, border #E4E7EC, text #272932, muted #6B7080. Primary #3772FF (buttons, brand, selection). Success #22C55E for totals/synced (charcoal text on green; green text #15803D). Warning #FF7F11 (offline, expiry). Error #D91415. Inter font, 12px radius cards, Lucide icons, Rs currency, EN/සිං/தமி switch, one primary button per screen, badges with icon + label.
```

## Dark variant prompt (after each screen)

```text
Create a dark mode version of this exact screen with the same layout and content.
Dark tokens: background #1E2028, cards/panels #272932, raised elements #31343F, borders #3A3D4A, text #FDFFFC, muted text #A3A8B8.
Primary stays #3772FF for buttons (white label); links and primary text #5B8CFF; selected row tint #25335C.
Success #22C55E (text allowed in dark mode), warning #FF7F11, error #FF4D4E.
Keep contrast at WCAG AA, keep shadows minimal, and do not change any spacing or sizes.
```

## Register app prompts

Stitch project: **RetailOS Register**, Web mode. Every prompt starts with the frame size. For the Android tablet (R2), re-run the same prompts with "1280×800 Android tablet landscape, bottom sheets instead of modals".

### R-01 · Device setup

```text
Screen R-01 "Device setup" for the RetailOS register, full-screen desktop app 1366x768, no browser chrome.
A centered 4-step wizard card with a progress stepper: 1 Enter enrollment code, 2 Download catalog, 3 Test hardware, 4 Ready.
Show step 3 active: three test rows, each with an icon, name, status badge and "Test" button: Receipt printer (badge "Ready" green), Cash drawer (badge "Not tested" neutral), Barcode scanner ("Scan any barcode to test", waiting animation).
Small text at the bottom: "Register CMB01-R02 · City Pharmacy & Mart · v1.6.0". Primary button "Continue" in #3772FF, secondary "Back".
```

### R-02 · PIN sign-in

```text
Screen R-02 "Sign in" for the RetailOS register, 1366x768 full-screen.
Top bar: RetailOS logo (blue #3772FF mark), "City Pharmacy & Mart · Colombo 03 · Register R02", on the right a green badge "Online · synced 10:41" and a language switch EN | සිං | தமி.
Left 60%: heading "Who's working?" and a grid of 6 large user tiles (initials avatar, name, role): Nimal Perera (Cashier), Sachini Kumari (Cashier), Rizwan Farook (Pharmacist), Malini Jayasuriya (Manager), etc. One tile selected with blue #3772FF outline.
Right 40%: "Enter PIN for Sachini" with 4 PIN dots (2 filled), a large 3x4 numeric keypad (64px keys, 10px radius), and a primary "Sign in" button.
Footer small muted text: "Device WIN-CMB01-02 · v1.6.0 · 5 wrong PINs lock this user for 5 minutes".
```

### R-03 · Open shift

```text
Screen R-03 "Open shift" for the RetailOS register, 1366x768.
Title "Open your shift, Sachini". Left: a denomination counter table with rows Rs 5000, 1000, 500, 100, 50, 20, coins (each with minus/plus steppers and a quantity input) and row subtotals. Right: a large summary card "Opening float" showing "Rs 5,000.00" in green text #15803D, the note "Count the cash placed in the drawer", and a primary blue button "Open shift". Small secondary link "Use last float (Rs 5,000)".
```

### R-04 · Checkout (most important)

```text
Screen R-04 "Checkout", the main sale screen of the RetailOS register, 1366x768, no page scroll.
TOP BAR (48px): menu icon, "CMB01 · R02", cashier chip "Sachini K. · shift 3h 12m", spacer, orange warning badge "Offline · 12 sales waiting" (#FF7F11 with charcoal text), green badge "Printer ready", clock.
LEFT PANE (60%): a large always-focused search field "Scan barcode or search by name, generic or SKU (F2)" with a scan icon. Below it the cart list with 4 lines; each line shows product name, small variant text, badges, qty x unit price and line total right-aligned:
1. Paracetamol 500mg (10s), badge "Batch B2 · exp 09/27" (blue tint), 2 x 32.00 = 64.00
2. Amoxicillin 500mg capsules, badge "Rx" (blue), 1 x 450.00 = 450.00
3. Basmati rice (loose), badge "1.250 kg", 1.250 x 640.00 = 800.00 (this row selected, tint #EBF1FF)
4. Milk powder 400g, orange badge "-10%", 1 x 1,150.00 = 1,035.00
Under the list, small action buttons with key caps: Qty F4, Discount F5, Remove Del, Note.
RIGHT PANE (40%): customer card "Perera Stores · credit available Rs 10,000" with change button (F3); totals card (Subtotal 2,464.00, Discounts -115.00, VAT incl. 358.32, TOTAL "Rs 2,349.00" very large in green text #15803D); a 4x2 quick-keys grid (Bread, Eggs, Bags, Vegetables, Milk, Water, Phone reload, More); a row of secondary buttons Hold F6, Recall F7, Return F8, Cash F9; and a full-width large primary button "PAY · F10 · Rs 2,349.00" in #3772FF.
```

### R-05 · Product lookup

```text
Screen R-05 "Product lookup" as a large modal over the checkout screen (dimmed background), 1366x768.
Search field with text "paracet" and filter chips: All, Name, Generic, SKU. Results table: product name (with a Sinhala name below in muted text), variant, price, stock estimate badge (green "48 in stock", orange "Low: 3", red "Out of stock"), nearest expiry. First row highlighted. Footer hint with key caps: ↑↓ select, Enter add to cart, Esc close.
Right side panel for the highlighted product: image placeholder, generic name "Paracetamol", strength 500mg, form Tablet, batches list with expiry and price, button "Add to cart".
```

### R-06 · Batch picker

```text
Screen R-06 "Choose batch" as a medium modal over checkout. Title "Choose batch · Paracetamol 500mg (10s)".
Three selectable rows as cards: B1 "exp 03/2027 · 48 in stock · Rs 30.00" with a green badge "FEFO, sells first" (selected, blue outline); B2 "exp 09/2027 · 120 in stock · Rs 32.00"; B0 "exp 10/2026 · expired" disabled with a red badge "Blocked".
Info hint with icon: "Tip: scan the 2D code on the pack to select the batch automatically." Buttons: primary "Use B1 (Enter)", secondary "Cancel (Esc)".
```

### R-07 · Line editor + R-08 manager override

```text
Screen R-07 "Edit line" as a right-side drawer over checkout for "Milk powder 400g".
Fields: quantity stepper with unit select (piece/box), unit price (read-only, lock icon), line discount with a % / Rs toggle and quick chips 5%, 10%, 15%, note field, "Performed by" staff select. Live line total at the bottom.
The discount field shows 25%, which is above the cashier limit of 10%: an inline orange warning "Manager approval needed" and a small embedded panel "Manager override" with a PIN keypad, the approver select "Malini J. (Manager)" and a reason select "Damaged packaging".
Primary button "Apply", secondary "Cancel".
```

### R-09 · Customer

```text
Screen R-09 "Select customer" modal over checkout. Search by name or phone with recent customers listed: name, masked phone 077****321, tags (Credit, Loyalty). Selected customer detail card: Perera Stores, credit limit Rs 100,000, outstanding Rs 90,000 shown with a progress bar (orange when above 80%), last purchase date. Buttons: "Quick add customer" (secondary), primary "Attach to sale".
```

### R-10 · Payment

```text
Screen R-10 "Payment" for the RetailOS register, 1366x768.
Top: "← Back to cart (Esc)" and receipt number "CMB01-R02-000155".
Left half: "Amount due" card with "Rs 2,349.00" very large; four large payment type buttons with key caps: Cash F1 (selected, blue), Card F2, LankaQR F3, Credit F4; a "Payments added" list: "Card · approval 482913 · 1,000.00" and "Cash · 2,000.00", each with a remove icon; a big "Change Rs 651.00" in green text #15803D; a "Tax invoice" toggle with a "Buyer VAT number" field.
Right half: amount input showing 2,000.00, quick cash chips (Exact, 500, 1000, 5000), a large numeric keypad, and a full-width success-style primary action "Complete sale · Enter". Make it blue #3772FF with a green check icon (keep white text on blue).
A small note under card: "Card details are never entered here; type the approval code from the terminal slip."
```

### R-11 · Sale complete

```text
Screen R-11 "Sale complete", full screen, celebratory but calm.
Center: a large green #22C55E circle with a charcoal check icon, "Sale complete", receipt "CMB01-R02-000155", a big "Change due Rs 651.00" (green text #15803D), and a small receipt preview card on the right.
Buttons: primary "New sale (Enter)", secondary "Reprint (Ctrl+P)", "Email receipt", "Gift receipt". A small orange badge "Saved offline · will sync automatically".
```

### R-12 · Held bills

```text
Screen R-12 "Held bills" modal: a list of parked sales as cards with time held, cashier, item count, total, optional note ("Customer went to ATM"), and buttons Resume (primary) and Discard (red text). Empty state illustration text: "No held bills. Press F6 on checkout to hold one."
```

### R-13 · Returns

```text
Screen R-13 "Return items", 1366x768.
Step 1 already done: scanned receipt "CMB01-R02-000154 · 18 Nov 2026 · Rs 3,120.00". Main table of the original lines with columns Product, Sold, Already returned, Return qty (stepper), Refund amount. Two lines have return quantities.
Right panel: reason select (Damaged, Expired, Wrong item, Changed mind, Other), refund method (Original: Cash), refund total "Rs 450.00", and a notice "Above your refund limit, manager PIN required" with a lock icon.
Primary button "Approve & refund", secondary "Cancel". Blue-tinted info box: "Items go back to their original batch."
```

### R-14 · Sales history

```text
Screen R-14 "Today's sales" for the register: filter chips (This register, Whole branch), search by receipt number, and a table: time, receipt number, cashier, items, payment type icons, total, sync status badge (green "Synced", orange "Waiting", red "Error"). Selecting a row opens a right panel with the sale lines, payments and buttons Reprint, Start return.
```

### R-15 · Cash in / out

```text
Screen R-15 "Cash in / out" modal: segmented control Cash in | Cash out | Safe drop; amount input with keypad; reason select (Petty cash: transport, Float top-up, Safe drop, Supplier COD); note; current drawer estimate shown in muted text. Primary "Record", plus a note "Opens the drawer and is recorded in the audit log".
```

### R-16 · Close shift

```text
Screen R-16 "Close shift" for the register, 1366x768, a 3-step stepper: 1 Count cash (active), 2 Review, 3 Print Z-report.
Left: denomination counter (Rs 5000 x 3, 1000 x 14, 500 x 9, 100 x 22, coins 340.00).
Right: "Counted cash Rs 36,040.00" and a dashed placeholder box "Expected amount and difference appear after you confirm (blind count)". Primary "Confirm count".
Then design step 2 as a second screen: expected Rs 36,500.00, counted Rs 36,040.00, difference "-Rs 460.00 short" in red text #D91415 with a reason field, breakdown by payment type, and a primary "Close shift & print".
```

### R-17 · Goods receiving

```text
Screen R-17 "Receive goods" on the register, 1366x768.
Header fields: supplier select "Hemas Pharmaceuticals", supplier invoice no, date. Large scan field "Scan 2D code (GS1) or barcode". A highlighted toast: "Scanned: GTIN 08901234567890 · batch A123 · expiry 30 Sep 2027".
Lines table: product, batch, expiry (with an orange badge if under 6 months), qty, unit (Box of 100 / Strip), unit cost, line cost. Footer totals and buttons "Save draft" and primary "Post receipt".
```

### R-18 · Price & stock check

```text
Screen R-18 "Price check": a single big scan field, then a large product card showing name in English and Sinhala, price "Rs 320.00" very large, unit price per kg, stock estimate badge, batches with expiry, and active promotion badge "Buy 2 get 1". Button "Add to sale". Kiosk-like and very readable.
```

### R-19 · Status & diagnostics

```text
Screen R-19 "Status & diagnostics" for the register: a grid of status cards each with icon, value and badge:
Connection (orange "Offline since 09:12"), Last sync push/pull times, Waiting to sync 12 (orange), Blocked items 0 (green), Printer "Ready" (green), Disk free 42 GB, Clock difference 0 s, App version 1.6.0 / device ID.
Action buttons: Test connection, Sync now (primary), Test print, Open drawer, Upload logs to support, Full resync (requires manager PIN, red outline).
A collapsible "Recent errors" list with error codes in monospace.
```

### R-20 · Device settings

```text
Screen R-20 "Register settings" with left vertical tabs: Printer, Receipt, Scanner, Quick keys, Language, Training mode. Show the Printer tab: printer type (USB / Network / Bluetooth), IP 192.168.1.50 port 9100, paper width 80mm/58mm, "Print Sinhala/Tamil as image" switch, cash drawer kick switch, and a live receipt preview on the right. Buttons "Test print" and primary "Save".
```

### R-21 · Customer display

```text
Screen R-21 "Customer display", a second screen 1024x600 facing the customer: shop logo and name, the last scanned item large ("Basmati rice 1.250 kg · Rs 800.00"), a running list of items, a very large total "Rs 2,349.00", and a promotion banner area. Friendly greeting "ආයුබෝවන් · வணக்கம் · Welcome".
```

### R-30, R-31 · Pharmacy panels (R2)

```text
Screen R-30 "Prescription details", a modal opened before completing a sale that contains prescription items.
Fields: prescriber name, prescriber registration no., prescription date, Rx number, patient (linked customer), optional photo capture area (camera icon, "Take photo of prescription"), list of Rx items in this sale with checkboxes, pharmacist PIN keypad for sign-off. Blue info badge "Required for Rx items".
Then create screen R-31 "Generic alternatives": a side panel on checkout listing products with the same generic (Amoxicillin 500mg capsules): brand, manufacturer, price, stock, and a green "Save Rs 120" badge for cheaper options, with a "Swap" button.
```

### R-32, R-33 · Grocery panels (R2)

```text
Screen R-32 "Weigh item" panel on checkout: PLU code entry keypad, a large live scale reading "1.250 kg" with a "stable" green badge, tare button, item found "Carrots · Rs 320.00/kg", and the calculated price "Rs 400.00". Primary "Add to cart".
Then screen R-33 "Print shelf labels": list of 14 products whose prices changed today with checkboxes, a label template preview (product name in Sinhala and English, price, unit price, barcode), label size select, and primary "Print 14 labels".
```

## Admin web prompts

Stitch project: **RetailOS Admin**, Web mode, 1440×900. Every admin screen uses the same app shell, so describe the shell once (prompt A-shell), then refer to it.

### A-shell · Admin app shell

```text
Create the RetailOS Admin app shell at 1440x900 that every later admin screen will use.
Left sidebar (240px, white, border right #E4E7EC): RetailOS logo, branch switcher "All branches ▾", navigation with Lucide icons: Dashboard, Catalog, Pricing, Inventory, Purchasing, Sales, Customers, Tax, Reports, Settings; active item uses tint #EBF1FF with blue #3772FF text and a left indicator. Bottom: help, collapse.
Top bar: global search "Search products, receipts, customers (/)", notification bell with count, language switch, user menu "Malini J. · Owner".
Content area on background #FDFFFC with page title, breadcrumb and a page action area on the right.
Show the shell with an empty-state content area: "Welcome to RetailOS".
```

### A-01 to A-03 · Login, MFA, reset

```text
Screen A-01 "Sign in" for RetailOS Admin, 1440x900, split layout: left 45% a brand panel in #3772FF with the RetailOS logo, tagline "Sell anywhere, even offline" and a soft illustration of a shop counter; right a sign-in card with email, password (show/hide), "Remember this device", primary "Sign in", link "Forgot password?", language switch EN | සිං | தமி.
Then screen A-02 "Two-step verification": a 6-digit code input, "Use a recovery code" link, and a first-time setup variant showing a QR code, a manual key and recovery codes to download.
Then screen A-03 "Set a new password" with a strength meter and rules checklist.
```

### A-05 · Onboarding wizard

```text
Screen A-05 "Set up your business", a full-page onboarding wizard with a left vertical stepper: Business details, VAT & tax, Branches, Registers, Receipt, Import products, Invite staff. Show "Branches" active: list of branch cards (code CMB01, name, address, phone) with "Add branch". Progress 3 of 7, buttons Back and primary "Continue". A friendly side tip card: "You can change all of this later in Settings."
```

### A-10 · Dashboard

```text
Screen A-10 "Dashboard" inside the RetailOS Admin shell.
Row 1: four KPI cards: Sales today "Rs 486,200" with a green "+8% vs last Tuesday" trend chip, Transactions 612, Average basket Rs 794, Gross margin 18.4%.
Row 2: a line/area chart "Sales by hour: today vs last week" (today in #3772FF, last week in grey) with an "as of 10:45" note; next to it a "Needs attention" card listing actionable items with badges and chevrons: Sale exceptions 7 (orange), Shift differences to approve 2 (orange), Batches expiring in 30 days 23 (orange), Low stock items 41 (neutral), Registers offline > 24h 1 (red).
Row 3: "Branches today" table (branch, sales, transactions, registers online with a green/orange dot) and a "Top products" list with small bars.
```

### A-10m · Owner mobile dashboard (Mobile project)

```text
Mobile screen (Stitch Mobile mode) "Today" for shop owners in the RetailOS Admin mobile web.
Top: greeting "Good morning, Malini", branch switcher chip. A horizontally scrollable KPI carousel (Sales today Rs 486,200 with green trend, transactions, margin). "Needs attention" list first with large tappable rows (exceptions, shift differences, expiring batches, offline registers). A compact sparkline chart. Bottom navigation: Today, Sales, Stock, Approvals, More.
```

### A-20 · Products list

```text
Screen A-20 "Products" in the RetailOS Admin shell. Page actions: "Import" (secondary), "Export", primary "Add product".
Filter bar: search, Category, Brand, Tax class, Status, "Low stock only" toggle. Data table with a checkbox column, thumbnail, product name (with SKU count), category, price range, stock across branches with colored badge, status chip, last updated, row menu. Bulk action bar appears with 3 rows selected: "Change category", "Print labels", "Archive". Pagination with page size.
```

### A-21 · Product editor

```text
Screen A-21 "Product: Paracetamol 500mg" in the RetailOS Admin shell with breadcrumb Catalog › Products.
Tabs: General, Variants & SKUs, Barcodes & units, Prices, Stock & batches, Pharmacy, History. Show the General tab: product names in English, Sinhala (පැරසිටමෝල් 500mg) and Tamil (பாராசிட்டமால் 500mg); category, brand, item type (Stocked / Service / Weighed), "Batch tracked" switch, tax class select, image uploader. Right column card "Variants" listing two SKUs (Strip of 10 · Rs 32.00, Box of 100 · Rs 300.00) and "Barcodes" with GTIN chips.
A sticky bottom bar with "Unsaved changes", Cancel and primary "Save".
```

### A-22, A-24 · Categories, brands, units

```text
Screen A-22 "Categories & brands": two-column layout. Left: a draggable category tree (Pharmacy › Pain relief, Antibiotics; Grocery › Rice, Dairy; Household) with item counts and a colour dot used for register quick keys. Right: details form for the selected category (name in 3 languages, parent, quick-key colour picker using palette colours).
Then screen A-24 "Units": table of units (piece, strip, box, kg, g, litre) with conversion examples "1 box = 10 strips".
```

### A-23 · Import wizard

```text
Screen A-23 "Import products" wizard in the RetailOS Admin shell, horizontal stepper: Template, Upload, Map columns, Preview, Import.
Show the Preview step: summary cards "1,240 new" (green), "312 updated" (blue), "18 errors" (red); an errors table with row number, column, value, and message ("Barcode already used by 'Sugar 1kg'"); buttons "Download error report", "Back", and primary "Import 1,552 products". Info note: "Nothing changes until you press Import."
```

### A-30 to A-33 · Pricing

```text
Screen A-30 "Price lists": tabs Retail, Wholesale; table of SKUs with current price, scheduled new price with "from 20 Nov 00:00" chip, branch overrides indicator; primary "Schedule price change".
Then screen A-31 "Bulk price change": filter products, choose "+5%" or "+Rs 10", rounding rule, preview table old → new price, effective date-time, primary "Schedule for 248 products".
Then screen A-32 "Discount limits": table of roles with max % and max Rs inputs and "Requires manager PIN above" column.
Then screen A-33 "Promotion builder": rule type cards (Buy X get Y, Mix & match, Happy hour, Coupon), conditions builder, date range, branches, live example "Buy 2 biscuits get 1 free".
```

### A-40, A-41 · Stock and batches

```text
Screen A-40 "Stock on hand" in the RetailOS Admin shell: branch selector, search, filters (category, negative stock, near expiry). Table grouped by product with expandable batch rows: batch no, expiry (orange badge if under 60 days, red if expired), on hand, unit cost, value. Negative quantities in red text. Totals bar: stock value Rs 12.4M.
Then screen A-41 "Batch A123 · Amoxicillin 500mg": header with status chip and red outline button "Block batch (recall)", key facts (supplier, received date, expiry, cost), a movement ledger timeline (Receipt +200, Sale -2, Return +1, Adjustment -1) and a "Customers who bought from this batch" table.
```

### A-42 · Goods receipt

```text
Screen A-42 "Goods receipt GRN-2291" in the RetailOS Admin shell: status chip "Draft", supplier and invoice fields, a scan field for GS1 2D codes, and an editable lines grid (product, batch, expiry, quantity, unit, unit cost, line total) with inline validation (orange "Expiry under 6 months"). Right summary card: lines 12, total cost Rs 186,400.00, VAT input. Buttons "Save draft" and primary "Post receipt".
```

### A-43, A-44, A-45 · Adjustments, counts, expiry

```text
Screen A-43 "New stock adjustment": product/batch picker, quantity +/-, reason code (Damaged, Theft, Expired write-off, Found), note, approval notice above Rs 5,000.
Then screen A-44 "Stock count · Pain relief shelf": count sheet table with expected (hidden toggle), counted input, variance column colored green/red, progress "86 of 120 counted", buttons "Save" and primary "Review & post".
Then screen A-45 "Expiry board": four columns like a kanban: Expired (red), 0-30 days (orange), 31-60 days, 61-90 days; each card shows product, batch, branch, quantity, value, actions "Discount" and "Write off".
```

### A-46 to A-48 · Transfers, purchase orders, suppliers

```text
Screen A-46 "Stock transfer TR-0045": from CMB01 to KDY01, status stepper Requested → Shipped → Received, lines with requested/shipped/received quantities.
Then screen A-47 "Purchase order PO-0112": supplier, expected date, lines generated from low-stock suggestions with suggested quantity, send by email/PDF buttons.
Then screen A-48 "Suppliers": table with name, contact, VAT number, payment terms, last delivery, open POs, and a supplier detail drawer.
```

### A-50, A-51 · Sales history and sale detail

```text
Screen A-50 "Sales" in the RetailOS Admin shell: date range picker, filters (branch, register, cashier, payment type, customer), search by receipt number, table with time, receipt, branch/register, cashier, items, payment icons, total, status chips (Completed, Partly returned), sync source chip "offline" when applicable.
Then screen A-51 "Sale CMB01-R02-000154": header with totals and status, tabs Lines, Batches, Payments, Returns, Tax document, Audit trail. Show Lines with price/discount/tax snapshot columns, and a right card with customer, cashier, device, received time vs completed time, and "Reprint receipt".
```

### A-53 · Sale exceptions queue

```text
Screen A-53 "Sale exceptions" in the RetailOS Admin shell: filter chips by type (Negative stock, Price mismatch, Expired batch sold, Clock difference, Receipt collision), branch, age. A list on the left with type badges (orange/red), receipt numbers, and age. Right detail panel for the selected "Negative stock · Milk powder 400g": explanation "Sold 1 at 08:12 when stock at CMB01 was 0", evidence values, and suggested actions as buttons: primary "Post pending GRN-2291", "Adjust stock", "Resolve with note". Footer note: "The sale itself is never changed."
```

### A-55 · Shifts & cash

```text
Screen A-55 "Shifts & cash": table of shifts (register, cashier, opened, closed, expected, counted, difference). Differences colored: green 0, orange small, red large. Selected shift drawer with a Z-report summary, cash movements and buttons "Approve difference" (primary) and "Add note".
```

### A-60 to A-62 · Customers, credit, loyalty

```text
Screen A-60 "Customers": table with name, phone (masked), tags, credit outstanding, last visit, and "Merge duplicates" action.
Then screen A-61 "Customer: Perera Stores": profile card, credit summary (limit Rs 100,000, outstanding Rs 90,000 with an orange progress bar, overdue 30+ days Rs 22,000), tabs Purchases, Credit ledger, Statements, Consent. Show the credit ledger with debits/credits and a primary "Record payment" button opening a small modal.
Then screen A-62 "Loyalty": earn rule "1 point per Rs 100", redeem rule, points ledger table.
```

### A-65 to A-67 · Tax

```text
Screen A-65 "Tax documents": tabs Tax invoices, Credit notes, Debit notes; table with number, date, buyer and buyer VAT number, value, VAT, total, e-invoice status chip (Not applicable / Pending / Sent / Failed) and PDF action.
Then screen A-66 "Tax rates": table of rates with valid-from dates and product tax classes; "Add rate" with effective date.
Then screen A-67 "VAT report": period selector, summary cards (output VAT, credit note adjustments, net), breakdown table by rate, export buttons Excel and PDF.
```

### A-70 · Report centre

```text
Screen A-70 "Reports": a left list of report categories (Sales, Stock, Cash, Customers, Tax, Pharmacy) and a report gallery of cards (Daily sales, Sales by product, Margin, Stock valuation, Expiry, Z-reports, Credit ageing, Best/slow sellers, Peak hours). Then open "Sales by category": filters bar, a bar chart in #3772FF, a data table below, and export buttons (Excel, CSV, PDF).
```

### A-80 to A-84 · Settings

```text
Screen A-80 "Settings · Business": settings layout with a left settings nav (Business, Branches & registers, Users & roles, Devices, Receipts, Modules, Integrations, Audit log, Data & privacy, Subscription). Business form: name, VAT number, address, logo upload, time zone Asia/Colombo, currency LKR, languages.
Then screen A-81 "Branches & registers": branch cards each listing registers with status dots and a "Generate enrollment code" button that shows a large code "482-913" valid for 15 minutes.
Then screen A-83 "Devices": table with device name, platform (Windows/Android icon), app version, last seen, waiting to sync, status chip, and "Lock device" action.
Then screen A-84 "Receipt template": left form (header text, footer text, logo, show tax summary, languages, return policy text), right live 80mm receipt preview.
```

### A-82 · Users & roles

```text
Screen A-82 "Users & roles" with tabs Users and Roles. Users: table with avatar, name, email, roles per branch chips, MFA status, last active, "Invite user" primary button.
Roles tab: role list on the left (Owner, Manager, Cashier, Stock keeper, Pharmacist, Accountant, + New role), and a permission matrix on the right grouped by area (Sales, Refunds, Cash, Stock, Catalog, Pricing, Reports, Settings) with switches and limit inputs (Max discount 10%, Max refund Rs 5,000).
```

### A-85 to A-90 · Modules, integrations, audit, privacy, subscription, profile

```text
Screen A-85 "Modules": cards for Pharmacy, Grocery (and greyed "Restaurant · coming later", "Salon · coming later") with icon, description, features list, status switch and "Configure".
Then screen A-86 "Integrations": cards for IRD e-invoicing (status "Waiting for IRD specification"), Card terminal, LankaQR, SMS gateway, Accounting (QuickBooks, Xero, Zoho).
Then screen A-87 "Audit log": filters (user, action, entity, date) and a timeline table with who, action, entity, before → after diff, approver, device.
Then screen A-88 "Data & privacy": export all data, customer data export/erase search, support access requests with approve/deny.
Then screen A-89 "Subscription": current plan card, modules add-ons, registers count, invoices table.
Then screen A-90 "My profile": language, password change, two-step verification status, active sessions with "Sign out" actions.
```

### A-100 to A-103 · Pharmacy and grocery admin (R2)

```text
Screen A-100 "Prescriptions": table with Rx number, date, patient, prescriber, items, pharmacist, linked sale, a thumbnail of the prescription photo, and a detail drawer.
Then screen A-101 "Controlled drug register": drug selector, running register table (date, in, out, balance, reference, patient, pharmacist), export for inspection.
Then screen A-102 "PLU & scale settings": PLU code table and a barcode format builder (prefix 2, PLU 5 digits, weight 5 digits, 3 decimals) with a live parse example.
Then screen A-103 "Label templates": label designer canvas with draggable fields (name EN/SI, price, unit price, barcode), size presets, and a print queue.
```

## Platform console prompts (DevCity internal)

```text
Project "RetailOS Console", Web mode 1440x900, same design system but with a charcoal #272932 sidebar to distinguish internal tools, and a "DevCity internal" badge.
Screen P-01 "Tenants": table with tenant name, plan, modules chips, branches, registers, status, created date, health indicator.
Then screen P-03 "Register fleet": KPI cards (registers online, offline > 24h, blocked sync items, outdated versions) and a filterable table (tenant, branch, register, version, last heartbeat, waiting, blocked, clock difference) with a "Needs help" filter.
Then screen P-04 "Register detail": outbox items with error codes, buttons Requeue, Request logs, Force resync, Lock, "Reset receipt sequence" (requires second approver).
Then screen P-05 "Support access": requests with tenant approval status and expiry countdown.
Then screen P-06 "Releases & feature flags": rollout rings (Internal, Pilot, 10%, 50%, 100%) with crash rate per version and a pause button; feature flags table with per-tenant overrides.
```

## State and edge-case prompts

```text
For the current screen, create 4 additional variants side by side with the same layout:
1) Loading: skeleton placeholders, no spinners over content.
2) Empty: friendly empty state with a one-line explanation and the next action button.
3) Offline: an orange #FF7F11 banner "You're offline. Changes will sync automatically" and everything still usable.
4) Error: an inline error panel with a plain-language message, what to do next, a "Try again" button and a small monospace error code (e.g. SYNC-003).
```

```text
Show this register screen in Sinhala: translate all UI labels to Sinhala (keep product names, numbers and Rs amounts), make sure nothing is clipped, and increase line height to 1.5 for Sinhala text. Then do the same in Tamil.
```

```text
Create a "Training mode" variant of this register screen: an orange ribbon across the top "TRAINING MODE · sales are not real" and a subtle diagonal watermark on the receipt preview.
```

## Refinement prompts (one change at a time)

```text
Increase all touch targets on this screen to at least 48px and the keypad keys to 64px, without changing the layout.
```

```text
Reduce visual noise: use only one primary blue button, make other actions secondary or ghost, and remove decorative shadows.
```

```text
Make the totals area more prominent: total amount 40px bold in #15803D, labels muted #6B7080, numbers right-aligned with tabular figures.
```

```text
Add keyboard shortcut hints as small key caps (F2, F4, F10, Esc) on the related buttons, styled with a light border and monospace font.
```

```text
Check colour use against the RetailOS rules: no white text on green #22C55E, green text uses #15803D on light backgrounds, warnings use #FF7F11 with charcoal text, errors use #D91415. Fix any violations.
```

```text
Convert this admin table into a mobile layout at 390px width: each row becomes a card with the two most important fields on top and actions in a menu.
```

## From Stitch to code

- Export each accepted screen to Figma and name frames with the screen ID ("R-04 Checkout · light", "R-04 Checkout · dark").
- Put the tokens above into `packages/ui/tokens` (CSS variables + Tailwind theme). Generated Stitch code is a visual reference only.
- Check each design against [Screens & navigation](ui-screens.html) (required content) and [the UI checklist](ui-design.html#ui-checklist) (states, i18n, keyboard).
- Test the real UI with two cashiers at a pilot shop before polishing visuals further.

---

Related: [Screens & navigation](ui-screens.html) · [UI design & wireframes](ui-design.html) · [Technology stack](tech-stack.html)
