/* RetailOS POS prototype — behaviour.
   Plain JS, no build step. Money is held in integer cents (the real app uses decimal.js; INV-03).
   Everything is demo data; nothing is sent anywhere. */
(function () {
  "use strict";

  // ---------- Icons (Lucide-style, 24px viewBox) ----------
  const I = {
    search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>', plus:'<path d="M5 12h14"/><path d="M12 5v14"/>', minus:'<path d="M5 12h14"/>',
    x:'<path d="M18 6 6 18"/><path d="m6 6 12 12"/>', check:'<path d="M20 6 9 17l-5-5"/>', chevDown:'<path d="m6 9 6 6 6-6"/>', chevRight:'<path d="m9 18 6-6-6-6"/>',
    arrowRight:'<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>', trash:'<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
    pencil:'<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>', maximize:'<path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/>',
    bell:'<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>', cloudCheck:'<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/><path d="m9 14 2 2 4-4"/>',
    printer:'<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/>',
    dashboard:'<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>',
    cart:'<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',
    receipt:'<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6"/><path d="M16 12h-6"/><path d="M12 16h-2"/>',
    undo:'<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>', users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    package:'<path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
    warehouse:'<path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z"/><path d="M6 18h12"/><path d="M6 14h12"/><rect width="12" height="12" x="6" y="10"/>',
    truck:'<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
    calendar:'<path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h5"/><path d="M17.5 17.5 16 16.3V14"/><circle cx="16" cy="16" r="6"/>',
    wallet:'<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
    chart:'<path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>', landmark:'<path d="M3 22h18"/><path d="M6 18v-7"/><path d="M10 18v-7"/><path d="M14 18v-7"/><path d="M18 18v-7"/><path d="M12 2 20 7H4Z"/>',
    percent:'<path d="M19 5 5 19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>', userCog:'<circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4"/><circle cx="18" cy="18" r="3"/><path d="M18 13v2"/><path d="M18 21v2"/><path d="M13 18h2"/><path d="M21 18h2"/>',
    help:'<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>', settings:'<path d="M21 4h-7"/><path d="M10 4H3"/><path d="M21 12h-9"/><path d="M8 12H3"/><path d="M21 20h-5"/><path d="M12 20H3"/><path d="M14 2v4"/><path d="M8 10v4"/><path d="M16 18v4"/>',
    logout:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>', wifiOff:'<path d="M12 20h.01"/><path d="M8.5 16.43a5 5 0 0 1 7 0"/><path d="M5 12.86a10 10 0 0 1 5.17-2.69"/><path d="M19 12.86a10 10 0 0 0-2-1.54"/><path d="M2 8.82a15 15 0 0 1 4.17-2.65"/><path d="M10.66 5c4.01-.36 8.14.9 11.34 3.76"/><path d="m2 2 20 20"/>',
    card:'<rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/>', qr:'<rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M16 12h1"/><path d="M12 21v-1"/>',
    cash:'<rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01"/><path d="M18 12h.01"/>', userPlus:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6"/><path d="M22 11h-6"/>',
    more:'<circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>', grid:'<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
    list:'<path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/>', scan:'<path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M8 7v10"/><path d="M12 7v10"/><path d="M17 7v10"/>',
    backspace:'<path d="M20 5H9l-7 7 7 7h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Z"/><path d="M18 9l-6 6"/><path d="M12 9l6 6"/>', alert:'<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    panel:'<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/>', store:'<path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M2 7h20"/><path d="M15 22v-4a3 3 0 0 0-6 0v4"/>',
    clock:'<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>', note:'<path d="M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z"/><path d="M15 3v6h6"/>',
    camera:'<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>', lock:'<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    mail:'<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>', gift:'<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',
    tag:'<path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/>', trendUp:'<path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/>', trendDown:'<path d="m22 17-8.5-8.5-5 5L2 7"/><path d="M16 17h6v-6"/>',
    pill:'<path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/>', milk:'<path d="M8 2h8"/><path d="M9 2v2.79a4 4 0 0 1-.67 2.22l-.66.98A4 4 0 0 0 7 10.21V20a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-9.79a4 4 0 0 0-.67-2.22l-.66-.98A4 4 0 0 1 15 4.79V2"/><path d="M7 15a6.47 6.47 0 0 1 5 0 6.47 6.47 0 0 0 5 0"/>',
    wheat:'<path d="M2 22 16 8"/><path d="M3.47 12.53 5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/><path d="M7.47 8.53 9 7l1.53 1.53a3.5 3.5 0 0 1 0 4.94L9 15l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/><path d="M11.47 4.53 13 3l1.53 1.53a3.5 3.5 0 0 1 0 4.94L13 11l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/><path d="M20 2h2v2a4 4 0 0 1-4 4h-2V6a4 4 0 0 1 4-4Z"/>',
    egg:'<path d="M12 22c6.23-.05 7.87-5.57 7.5-10-.36-4.34-3.95-9.96-7.5-10-3.55.04-7.14 5.66-7.5 10-.37 4.43 1.27 9.95 7.5 10z"/>', droplet:'<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>',
    cookie:'<path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/><path d="M8.5 8.5v.01"/><path d="M16 15.5v.01"/><path d="M12 12v.01"/><path d="M11 17v.01"/><path d="M7 14v.01"/>',
    carrot:'<path d="M2.27 21.7s9.87-3.5 12.73-6.36a4.5 4.5 0 0 0-6.36-6.37C5.77 11.84 2.27 21.7 2.27 21.7z"/><path d="M8.64 14l-2.05-2.04"/><path d="M15.34 15l-2.46-2.46"/><path d="M22 9s-1.33-2-3.5-2C16.86 7 15 9 15 9s1.33 2 3.5 2S22 9 22 9z"/><path d="M15 2s-2 1.33-2 3.5S15 9 15 9s2-1.84 2-3.5C17 3.33 15 2 15 2z"/>',
    leaf:'<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>', sparkles:'<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>',
    smile:'<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><path d="M9 9h.01"/><path d="M15 9h.01"/>', sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
    moon:'<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>', sliders:'<path d="M4 21v-7"/><path d="M4 10V3"/><path d="M12 21v-9"/><path d="M12 8V3"/><path d="M20 21v-5"/><path d="M20 12V3"/><path d="M1 14h6"/><path d="M9 8h6"/><path d="M17 16h6"/>',
    keyboard:'<rect width="20" height="16" x="2" y="4" rx="2"/><path d="M6 8h.01"/><path d="M10 8h.01"/><path d="M14 8h.01"/><path d="M18 8h.01"/><path d="M8 12h.01"/><path d="M12 12h.01"/><path d="M16 12h.01"/><path d="M7 16h10"/>'
  };
  const ic = (n, s = 20, cls = "") => `<svg class="ic ${cls}" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[n] || ""}</svg>`;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmt = c => "Rs " + (c / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtQty = (q, w) => w ? q.toFixed(3) : String(q);
  const store = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } };

  // ---------- Demo data ----------
  const PRODUCTS = [
    { id: "mp", name: "Milk powder 400g", cat: "Dairy", meta: "400 g · MP-400", price: 115000, icon: "milk", tone: "blue", code: "4791111000011", stock: 24, offer: 10, badge: ["warning", "Offer −10%", "tag"] },
    { id: "br", name: "Basmati rice 5kg", cat: "Grocery", meta: "5 kg bag · BR-5K", price: 325000, icon: "wheat", tone: "yellow", code: "4791111000028", stock: 40 },
    { id: "pc", name: "Paracetamol 500mg", cat: "Pharmacy", meta: "Strip of 10 · PC-500", price: 3200, icon: "pill", tone: "teal", code: "4791111000035", stock: 168, badge: ["info", "Batch", "package"],
      batches: [{ id: "B1", exp: "03/2027", price: 3000, stock: 48 }, { id: "B2", exp: "09/2027", price: 3200, stock: 120 }] },
    { id: "am", name: "Amoxicillin 500mg", cat: "Pharmacy", meta: "10 capsules · AM-500", price: 45000, icon: "pill", tone: "purple", code: "4791111000042", stock: 60, rx: true, badge: ["info", "Rx", "note"] },
    { id: "tp", name: "Toothpaste 120g", cat: "Personal care", meta: "120 g · TP-120", price: 38000, icon: "smile", tone: "teal", code: "4791111000059", stock: 35 },
    { id: "sh", name: "Shampoo 340ml", cat: "Personal care", meta: "340 ml · SH-340", price: 109000, icon: "sparkles", tone: "pink", code: "4791111000066", stock: 3, badge: ["warning", "Low · 3", "alert"] },
    { id: "cc", name: "Cream crackers 500g", cat: "Grocery", meta: "500 g · CC-500", price: 52000, icon: "cookie", tone: "orange", code: "4791111000073", stock: 52 },
    { id: "eg", name: "Eggs 10-pack", cat: "Grocery", meta: "10 eggs · EG-10", price: 65000, icon: "egg", tone: "yellow", code: "4791111000080", stock: 30 },
    { id: "bw", name: "Bottled water 1.5L", cat: "Beverages", meta: "1.5 L · BW-15", price: 14000, icon: "droplet", tone: "blue", code: "4791111000097", stock: 140 },
    { id: "ct", name: "Ceylon black tea 200g", cat: "Beverages", meta: "200 g · CT-200", price: 76000, icon: "leaf", tone: "green", code: "4791111000103", stock: 44 },
    { id: "co", name: "Coconut oil 1L", cat: "Grocery", meta: "1 L · CO-1L", price: 98000, icon: "droplet", tone: "yellow", code: "4791111000110", stock: 0, badge: ["error", "Out of stock", "alert"] },
    { id: "ca", name: "Carrots", cat: "Vegetables", meta: "Weighed · PLU 01234", price: 32000, icon: "carrot", tone: "orange", code: "2012340012507", stock: 18, weighed: true, unit: "kg", badge: ["", "kg", "tag"] }
  ];
  const CATS = ["All", "Pharmacy", "Grocery", "Dairy", "Beverages", "Personal care", "Vegetables", "Offers"];
  const CUSTOMERS = [
    { id: "walk", name: "Walk-in customer", initials: "WC", note: "No customer attached" },
    { id: "ps", name: "Perera Stores", initials: "PS", note: "Credit available Rs 10,000", credit: true, phone: "077****321" },
    { id: "nk", name: "Nimal Karunaratne", initials: "NK", note: "Loyalty · 1,240 points", phone: "071****908" },
    { id: "fa", name: "Fathima Azeez", initials: "FA", note: "Last visit 12 Nov", phone: "076****114" }
  ];
  const USERS = [
    { id: "sk", name: "Sachini Kumari", short: "Sachini", role: "Cashier", initials: "SK", pin: "1111" },
    { id: "np", name: "Nimal Perera", short: "Nimal", role: "Cashier", initials: "NP", pin: "2222" },
    { id: "rf", name: "Rizwan Farook", short: "Rizwan", role: "Pharmacist", initials: "RF", pin: "3333" },
    { id: "mj", name: "Malini Jayasuriya", short: "Malini", role: "Manager", initials: "MJ", pin: "1234" },
    { id: "ks", name: "Kasun Silva", short: "Kasun", role: "Stock keeper", initials: "KS", pin: "4444" },
    { id: "ad", name: "Anushka De Silva", short: "Anushka", role: "Cashier", initials: "AD", pin: "5555" }
  ];
  const DENOMS = [500000, 100000, 50000, 10000, 5000, 2000]; // Rs 5,000 … Rs 20 notes, in cents
  const NOTE_COLORS = { 500000: "#E8B54A", 100000: "#5BB98C", 50000: "#A08CFF", 10000: "#FF9F5B", 5000: "#5B8CFF", 2000: "#D9A0C8" };
  const MAX_PIN_TRIES = 5;
  const DISCOUNT_LIMIT = 10; // cashier limit in %, BR-01
  const MANAGER_PIN = "1234";
  const byId = id => PRODUCTS.find(p => p.id === id);

  // ---------- i18n (draft Sinhala/Tamil labels, to be reviewed) ----------
  const T = {
    en: { sell: "Sell", overview: "Overview", orders: "Orders", returns: "Returns", customers: "Customers", products: "Products", stock: "Stock", receiving: "Receiving", expiry: "Expiry", cash: "Cash & shifts", reports: "Reports", tax: "Tax", suppliers: "Suppliers", promotions: "Promotions", staff: "Staff", settings: "Settings", logout: "Logout",
      main: "Main", inventory: "Inventory", finance: "Finance", management: "Management", search: "Scan barcode or search name, generic or SKU…", charge: "Charge", hold: "Hold", discount: "Discount", current: "Current sale", total: "Total", sale: "Sale", ret: "Return", instock: "In stock only", payment: "Payment", addCustomer: "Add customer", whoWorking: "Who's working?", enterPin: "Enter your PIN", signIn: "Sign in", openShift: "Open shift", countFloat: "Count the opening float", openingFloat: "Opening float", signOut: "Sign out" },
    si: { sell: "විකිණීම", overview: "දළ විශ්ලේෂණය", orders: "ඇණවුම්", returns: "ආපසු ලැබීම්", customers: "පාරිභෝගිකයින්", products: "නිෂ්පාදන", stock: "තොග", receiving: "භාණ්ඩ ලැබීම", expiry: "කල් ඉකුත්වීම", cash: "මුදල් සහ මුර", reports: "වාර්තා", tax: "බදු", suppliers: "සැපයුම්කරුවන්", promotions: "ප්‍රවර්ධන", staff: "කාර්ය මණ්ඩලය", settings: "සැකසුම්", logout: "ඉවත් වන්න",
      main: "ප්‍රධාන", inventory: "තොග කළමනාකරණය", finance: "මූල්‍ය", management: "කළමනාකරණය", search: "බාර්කෝඩය ස්කෑන් කරන්න හෝ නමින් සොයන්න…", charge: "අය කරන්න", hold: "රඳවන්න", discount: "වට්ටම", current: "වත්මන් විකිණීම", total: "එකතුව", sale: "විකිණීම", ret: "ආපසු", instock: "තොගයේ ඇති ඒවා පමණක්", payment: "ගෙවීම", addCustomer: "පාරිභෝගිකයා එක් කරන්න", whoWorking: "කවුද වැඩ කරන්නේ?", enterPin: "ඔබේ PIN අංකය ඇතුළත් කරන්න", signIn: "පුරන්න", openShift: "මුරය ආරම්භ කරන්න", countFloat: "ආරම්භක මුදල ගණන් කරන්න", openingFloat: "ආරම්භක මුදල", signOut: "ඉවත් වන්න" },
    ta: { sell: "விற்பனை", overview: "கண்ணோட்டம்", orders: "ஆர்டர்கள்", returns: "திருப்பங்கள்", customers: "வாடிக்கையாளர்கள்", products: "பொருட்கள்", stock: "இருப்பு", receiving: "பொருள் பெறுதல்", expiry: "காலாவதி", cash: "பணம் & ஷிஃப்ட்", reports: "அறிக்கைகள்", tax: "வரி", suppliers: "சப்ளையர்கள்", promotions: "சலுகைகள்", staff: "ஊழியர்கள்", settings: "அமைப்புகள்", logout: "வெளியேறு",
      main: "முதன்மை", inventory: "சரக்கு", finance: "நிதி", management: "நிர்வாகம்", search: "பார்கோடை ஸ்கேன் செய்யவும் அல்லது பெயரால் தேடவும்…", charge: "கட்டணம்", hold: "நிறுத்து", discount: "தள்ளுபடி", current: "தற்போதைய விற்பனை", total: "மொத்தம்", sale: "விற்பனை", ret: "திருப்பம்", instock: "இருப்பில் உள்ளவை மட்டும்", payment: "கட்டணம் செலுத்துதல்", addCustomer: "வாடிக்கையாளரைச் சேர்", whoWorking: "யார் பணியில் இருக்கிறார்கள்?", enterPin: "உங்கள் PIN ஐ உள்ளிடவும்", signIn: "உள்நுழை", openShift: "ஷிஃப்ட்டைத் தொடங்கு", countFloat: "தொடக்கப் பணத்தை எண்ணவும்", openingFloat: "தொடக்கப் பணம்", signOut: "வெளியேறு" }
  };
  const t = k => (T[S.lang] && T[S.lang][k]) || T.en[k] || k;

  // ---------- State ----------
  let uid = 1;
  const line = (pid, qty, opts = {}) => {
    const p = byId(pid);
    const b = opts.batch && p.batches ? p.batches.find(x => x.id === opts.batch) : null;
    return { id: uid++, pid, qty, unit: b ? b.price : p.price, batch: b ? b.id : null, exp: b ? b.exp : null, disc: opts.disc != null ? opts.disc : (p.offer || 0), approver: null };
  };
  const S = {
    view: "sell", cat: "All", inStock: false, query: "", list: false, scanError: null,
    cart: [line("pc", 2, { batch: "B2" }), line("br", 1), line("mp", 1), line("ca", 1.25)], sel: 3,
    customer: CUSTOMERS[1], mode: "sale", held: [], seq: 155, offline: false, waiting: 12, printerError: false,
    lang: "en", theme: store("retailos-proto-theme") || null, collapsed: false, tablet: false, touch: false, sheetOpen: false,
    loading: true, modal: null, pay: null, last: null, undo: null, protoOpen: false, countdown: 0,
    user: USERS[0],
    shifts: { sk: { float: 500000, start: Date.now() - (3 * 60 + 12) * 60000 } }, // open cash session per cashier (BR-08)
    su: { sel: 0, pin: "", err: false, tries: {}, locked: {} },                     // sign-in screen state
    os: { counts: {}, coins: "" }                                                   // open-shift count
  };

  // ---------- Money ----------
  const lineGross = l => Math.round(l.qty * l.unit);
  const lineNet = l => Math.round(l.qty * l.unit * (100 - l.disc) / 100);
  function totals(cart = S.cart) {
    const gross = cart.reduce((a, l) => a + lineGross(l), 0);
    const net = cart.reduce((a, l) => a + lineNet(l), 0);
    return { gross, disc: gross - net, net, vat: Math.round(net * 18 / 118), count: cart.length };
  }

  // ---------- Helpers ----------
  const app = document.getElementById("app");
  const modalRoot = document.getElementById("modal-root");
  const toastRoot = document.getElementById("toast-root");
  const coarse = () => window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
  const sheetMode = () => S.tablet || window.innerWidth <= 1180 || (coarse() && window.innerWidth <= 1366);
  function toast(msg, opts = {}) {
    const el = document.createElement("div");
    el.className = "toast";
    el.innerHTML = `<span class="ok ${opts.error ? "err" : ""}">${ic(opts.error ? "x" : "check", 14)}</span><span>${esc(msg)}</span>${opts.undo ? `<button type="button" data-act="undo">Undo · Ctrl Z</button>` : ""}`;
    toastRoot.appendChild(el);
    setTimeout(() => el.remove(), opts.ms || 3200);
  }
  function snapshot() { S.undo = JSON.parse(JSON.stringify({ cart: S.cart, sel: S.sel })); }
  function badge(tone, label, icon) { return `<span class="badge ${tone ? "b-" + tone : ""}">${icon ? ic(icon, 14) : ""}${esc(label)}</span>`; }
  function visibleProducts() {
    const q = S.query.trim().toLowerCase();
    return PRODUCTS.filter(p => (S.cat === "All" || p.cat === S.cat || (S.cat === "Offers" && p.offer))
      && (!S.inStock || p.stock > 0)
      && (!q || p.name.toLowerCase().includes(q) || p.meta.toLowerCase().includes(q) || p.code.startsWith(q) || (p.rx && "rx".includes(q))));
  }
  function findByCode(code) {
    const c = code.replace(/[^0-9A-Za-z]/g, "");
    if (/^2\d{12}$/.test(c)) { // weight-embedded barcode: 2 + PLU(5) + weight in grams(6) + check digit
      const p = PRODUCTS.find(x => x.weighed && x.code.slice(1, 6) === c.slice(1, 6));
      if (p) return { p, qty: parseInt(c.slice(6, 12), 10) / 1000 };
    }
    const p = PRODUCTS.find(x => x.code === c);
    if (p) return { p };
    if (/^0108901234567890/.test(c)) return { p: byId("pc"), batch: c.endsWith("B1") ? "B1" : "B2" }; // GS1 DataMatrix demo
    return null;
  }

  // ---------- Cart actions ----------
  function addProduct(p, opts = {}) {
    if (S.mode === "return") { toast("Switch to Sale to add items", { error: true }); return; }
    if (p.stock <= 0) { toast(`${p.name} is out of stock`, { error: true }); return; }
    if (p.batches && !opts.batch) {
      const prices = new Set(p.batches.map(b => b.price));
      if (prices.size > 1) { openModal({ type: "batch", pid: p.id, choice: 0 }); return; }
      opts.batch = p.batches[0].id;
    }
    if (p.weighed && opts.qty == null) { openModal({ type: "weight", pid: p.id, value: "" }); return; }
    snapshot();
    const existing = !p.weighed && S.cart.findIndex(l => l.pid === p.id && l.batch === (opts.batch || null));
    if (existing !== false && existing >= 0) { S.cart[existing].qty += 1; S.sel = existing; }
    else { S.cart.push(line(p.id, opts.qty != null ? opts.qty : 1, { batch: opts.batch })); S.sel = S.cart.length - 1; }
    S.flash = S.cart[S.sel].id;
    S.scanError = null;
    render();
    toast(`Added ${p.name}${p.weighed ? " " + S.cart[S.sel].qty.toFixed(3) + " kg" : ""}`, { undo: true });
  }
  function changeQty(i, d) {
    const l = S.cart[i]; if (!l) return;
    const p = byId(l.pid);
    const step = p.weighed ? 0.1 : 1;
    const nq = Math.round((l.qty + d * step) * 1000) / 1000;
    if (nq <= 0) { removeLine(i); return; }
    l.qty = nq; S.sel = i; render();
  }
  function removeLine(i) {
    const l = S.cart[i]; if (!l) return;
    snapshot(); S.cart.splice(i, 1); S.sel = Math.max(0, Math.min(S.sel, S.cart.length - 1)); render();
    toast(`Removed ${byId(l.pid).name}`, { undo: true });
  }
  function undo() { if (!S.undo) return; S.cart = S.undo.cart; S.sel = S.undo.sel; S.undo = null; render(); toast("Undone"); }
  function newSale() { S.cart = []; S.sel = 0; S.customer = CUSTOMERS[0]; S.view = "sell"; S.last = null; S.mode = "sale"; S.countdown = 0; render(); focusSearch(); }
  function hold() {
    if (!S.cart.length) { toast("Nothing to hold", { error: true }); return; }
    S.held.push({ id: uid++, cart: S.cart, customer: S.customer, time: new Date().toTimeString().slice(0, 5), total: totals().net });
    S.cart = []; S.sel = 0; S.customer = CUSTOMERS[0]; render(); toast(`Bill held · ${S.held.length} on hold · F7 to recall`);
  }

  // ---------- Modals ----------
  function openModal(m) { S.modal = m; renderModal(); }
  function closeModal() { S.modal = null; renderModal(); if (S.view === "sell") focusSearch(); }
  function openPayment() {
    if (S.mode === "return") { toast("Returns are refunded from the return screen", { error: true }); return; }
    if (!S.cart.length) { toast("Add an item first", { error: true }); focusSearch(); return; }
    const tot = totals().net;
    S.pay = { method: "cash", amount: String(Math.ceil(tot / 100000) * 1000), approval: "", taxInvoice: false };
    openModal({ type: "payment" });
  }
  function payAmount() { return Math.round((parseFloat(S.pay.amount || "0") || 0) * 100); }
  function canComplete() {
    const tot = totals().net;
    if (S.pay.method === "cash") return payAmount() >= tot;
    if (S.pay.method === "card" || S.pay.method === "qr") return S.pay.approval.trim().length >= 4;
    if (S.pay.method === "credit") return !!S.customer.credit;
    return false;
  }
  function completeSale() {
    if (!canComplete()) { toast(S.pay.method === "cash" ? "Amount received is less than the total" : S.pay.method === "credit" ? "Attach a credit customer first (F3)" : "Enter the approval code from the terminal slip", { error: true }); return; }
    const tt = totals();
    S.last = { no: `CMB01-R02-${String(S.seq).padStart(6, "0")}`, cart: S.cart, t: tt, method: S.pay.method, paid: S.pay.method === "cash" ? payAmount() : tt.net, customer: S.customer, time: new Date() };
    S.seq++; if (S.offline) S.waiting++;
    S.modal = null; S.view = "complete"; S.countdown = 8; renderModal(); render();
  }
  function applyDiscount(pct, approver) {
    const l = S.cart[S.sel]; if (!l) return;
    l.disc = pct; l.approver = approver || null; closeModal(); render(); toast(`Discount ${pct}% applied${approver ? " · approved by " + approver : ""}`);
  }

  // ---------- Render: shell ----------
  const NAV = [
    ["main", [["overview", "dashboard", "dashboard"], ["sell", "cart", "sell"], ["orders", "receipt"], ["returns", "undo"], ["customers", "users"]]],
    ["inventory", [["products", "package"], ["stock", "warehouse"], ["receiving", "truck"], ["expiry", "calendar", null, "23"]]],
    ["finance", [["cash", "wallet"], ["reports", "chart"], ["tax", "landmark"]]],
    ["management", [["suppliers", "store"], ["promotions", "percent"], ["staff", "userCog"]]]
  ];
  function sidebar() {
    const cur = S.view === "complete" ? "sell" : S.view;
    let h = `<aside class="sidebar" aria-label="Main navigation"><div class="brand"><span class="mark">R</span><span class="brand-name">RetailOS</span><button class="icon-btn" data-act="collapse" title="Collapse sidebar">${ic("panel")}</button></div><nav>`;
    for (const [g, items] of NAV) {
      h += `<div class="nav-label">${t(g)}</div>`;
      for (const [key, icon, view, count] of items) {
        const v = view || key;
        h += `<button class="nav-item ${cur === v ? "active" : ""}" data-act="nav" data-view="${v}" title="${esc(t(key))}" ${cur === v ? 'aria-current="page"' : ""}>${ic(icon)}<span class="lbl">${esc(t(key))}</span>${count ? `<span class="count">${count}</span>` : ""}</button>`;
      }
    }
    h += `</nav><div class="side-spacer"></div>
      <button class="nav-item" data-act="nav" data-view="settings" title="${esc(t("settings"))}">${ic("settings")}<span class="lbl">${esc(t("settings"))}</span></button>
      <button class="nav-item danger" data-act="logout" title="${esc(t("logout"))}">${ic("logout")}<span class="lbl">${esc(t("logout"))}</span></button>
      <button class="user-card" data-act="logout" title="Switch user / sign out"><span class="avatar">${S.user.initials}</span><span class="who"><b>${esc(S.user.name)}</b><span>${esc(S.user.role)} · CMB01</span></span>${ic("chevDown", 16)}</button></aside>`;
    return h;
  }
  function langSeg() {
    return `<div class="seg hide-t" role="group" aria-label="Language">${[["en", "EN"], ["si", "සිං"], ["ta", "தமி"]].map(([k, l]) => `<button data-act="lang" data-lang="${k}" aria-pressed="${S.lang === k}">${l}</button>`).join("")}</div>`;
  }
  function topbar(title, sub, extra) {
    const dark = document.documentElement.dataset.theme === "dark" || (!document.documentElement.dataset.theme && matchMedia("(prefers-color-scheme: dark)").matches);
    return `<header class="topbar"><div><h1>${esc(title)}</h1>${sub ? `<div class="sub">${esc(sub)}</div>` : ""}</div>${extra || ""}<div class="spacer"></div>
      ${S.view !== "dashboard" ? `<button class="badge ${S.offline ? "b-warning" : "b-success"}" data-act="toggle-offline" title="Click to simulate ${S.offline ? "reconnecting" : "going offline"}">${ic(S.offline ? "wifiOff" : "cloudCheck", 14)}${S.offline ? `Offline · ${S.waiting} waiting` : "Synced 10:41"}</button>
      <button class="badge hide-t ${S.printerError ? "b-error" : "b-success"}" data-act="toggle-printer" title="Click to simulate a printer problem">${ic("printer", 14)}${S.printerError ? "Printer: no paper" : "Printer ready"}</button>
      <span class="badge hide-t ${S.shifts[S.user.id] ? "" : "b-warning"}">${ic("clock", 14)}${shiftLabel()}</span>` : ""}
      ${langSeg()}
      <button class="icon-btn" data-act="theme" title="Toggle dark mode">${ic(dark ? "sun" : "moon")}</button>
      <button class="icon-btn" data-act="help" title="Keyboard shortcuts (F1 or ?)">${ic("keyboard")}</button>
      <button class="icon-btn outline hide-t" title="Notifications">${ic("bell")}</button></header>`;
  }

  // ---------- Render: Sell ----------
  function productCard(p) {
    const out = p.stock <= 0;
    const bd = p.badge ? badge(p.badge[0], p.badge[1], p.badge[2]) : "";
    return `<div class="pcard ${out ? "out" : ""}" tabindex="0" role="button" data-act="card" data-pid="${p.id}" data-fid="card-${p.id}" aria-label="${esc(p.name)}, ${fmt(p.price)}${out ? ", out of stock" : ""}">
      <div class="pc-top"><span class="cap">${esc(p.cat)}</span><button class="qv" tabindex="-1" data-act="quickview" data-pid="${p.id}" title="Quick view (Space)">${ic("maximize", 16)}</button></div>
      <div class="media tile-${p.tone}">${ic(p.icon, 52)}${bd}</div>
      <div class="pc-name">${esc(p.name)}</div><div class="pc-meta">${esc(p.meta)}</div>
      <div class="pc-bottom"><span class="price">${fmt(p.price)}${p.weighed ? " / kg" : ""}</span><span class="add" aria-hidden="true">${ic("plus", 18)}</span></div></div>`;
  }
  function productArea() {
    const list = visibleProducts();
    let grid;
    if (S.loading) grid = Array.from({ length: 8 }, () => `<div class="pcard" aria-hidden="true"><div class="skel" style="height:14px;width:40%"></div><div class="skel" style="height:112px;border-radius:12px"></div><div class="skel" style="height:16px;width:80%"></div><div class="skel" style="height:12px;width:55%"></div><div class="skel" style="height:24px;width:45%"></div></div>`).join("");
    else if (!list.length) grid = `<div class="empty" style="grid-column:1/-1"><span class="circle">${ic("search", 28)}</span><h3>No products match “${esc(S.query)}”</h3><span>Check the spelling, try the generic name, or scan the barcode.</span></div>`;
    else grid = list.map(productCard).join("");
    return `<section class="products" aria-label="Products">
      ${S.offline ? `<div class="banner">${ic("wifiOff")}You're offline. Sales are saved on this register and will sync automatically · ${S.waiting} waiting<button class="btn secondary" data-act="toggle-offline">Reconnect</button></div>` : ""}
      <div class="search-row">
        <label class="search ${S.scanError ? "error" : ""}">${ic("search")}<span class="sr">Search</span><input id="search" data-fid="search" autocomplete="off" placeholder="${esc(t("search"))}" value="${esc(S.query)}" aria-describedby="scan-help">${ic("scan", 20, "scan")}<kbd>Ctrl K</kbd></label>
        <button class="toggle-btn" data-act="instock" aria-pressed="${S.inStock}">${esc(t("instock"))}${ic(S.inStock ? "check" : "chevDown", 16)}</button>
        <div class="seg view-seg" role="group" aria-label="View"><button data-act="view-grid" aria-pressed="${!S.list}" title="Grid view">${ic("grid")}</button><button data-act="view-list" aria-pressed="${S.list}" title="List view">${ic("list")}</button></div>
      </div>
      ${S.scanError ? `<div class="scan-error" role="alert">${ic("alert", 18)}No product found for ${esc(S.scanError)}<button class="btn secondary" data-act="clear-scan">Search by name</button><button class="btn ghost" data-act="add-new">Add new product (manager)</button></div>` : `<span id="scan-help" class="sr">Type or scan; press Enter to add. Arrow keys move between products.</span>`}
      <div class="chips" role="group" aria-label="Categories">${CATS.map(c => `<button class="chip" data-act="cat" data-cat="${esc(c)}" aria-pressed="${S.cat === c}">${esc(c === "All" ? "All · 1,248" : c)}</button>`).join("")}</div>
      <div class="grid ${S.list ? "list" : ""}" id="grid">${grid}</div>
    </section>`;
  }
  function cartLine(l, i) {
    const p = byId(l.pid);
    const meta = p.weighed ? `${l.qty.toFixed(3)} kg × ${fmt(l.unit).replace("Rs ", "Rs ")}` : l.batch ? `Batch ${l.batch} · exp ${l.exp}` : p.meta.split(" · ")[0];
    const saving = lineGross(l) - lineNet(l);
    return `<div class="line ${S.sel === i ? "sel" : ""} ${S.flash === l.id ? "flash" : ""}" data-act="selline" data-i="${i}" role="listitem" aria-selected="${S.sel === i}">
      <span class="thumb tile-${p.tone}">${ic(p.icon, 24)}</span>
      <div class="info"><div class="nm"><span>${esc(p.name)}</span><button data-act="editline" data-i="${i}" title="Edit quantity (F4)" aria-label="Edit ${esc(p.name)}">${ic("pencil", 14)}</button></div>
        <div class="meta">${esc(meta)}</div>
        ${saving ? `<div class="save">−${fmt(saving)} ${l.approver ? "discount · " + esc(l.approver) : p.offer && l.disc === p.offer ? "offer" : "discount"}</div>` : ""}
        ${p.rx ? `<div class="rx">Prescription required · pharmacist PIN at checkout</div>` : ""}</div>
      <div class="right"><span class="lp">${fmt(lineNet(l))}</span>
        <div class="stepper"><button data-act="dec" data-i="${i}" aria-label="Decrease">${ic("minus", 16)}</button><span>${fmtQty(l.qty, p.weighed)}</span><button data-act="inc" data-i="${i}" aria-label="Increase">${ic("plus", 16)}</button></div></div>
      <button class="del" data-act="remove" data-i="${i}" title="Remove (Del)" aria-label="Remove ${esc(p.name)}">${ic("trash", 16)}</button></div>`;
  }
  function orderPanel() {
    const tt = totals();
    const c = S.customer;
    const thumbs = S.cart.slice(0, 3).map(l => { const p = byId(l.pid); return `<span class="thumb tile-${p.tone}">${ic(p.icon, 18)}</span>`; }).join("");
    let items;
    if (S.mode === "return") items = `<div class="empty"><span class="circle">${ic("receipt", 28)}</span><h3>Scan the receipt to start a return</h3><span>Returns are linked to the original sale. Items go back to their original batch.</span><button class="btn secondary s" data-act="mode" data-mode="sale">Back to sale (F8)</button></div>`;
    else if (!S.cart.length) items = `<div class="empty"><span class="circle">${ic("scan", 28)}</span><h3>Scan an item to start</h3><span>or tap a product, or press <kbd>F2</kbd> to search.<br>Try scanning <b>4791111000011</b></span></div>`;
    else items = S.cart.map(cartLine).join("");
    return `<aside class="order ${S.sheetOpen ? "open" : ""}" aria-label="Current sale">
      <div class="sheet-bar" data-act="sheet"><span class="handle"></span><span class="thumbs">${thumbs}</span><span class="count">${tt.count} item${tt.count === 1 ? "" : "s"}</span><span class="tot">${fmt(tt.net)}</span><button class="btn primary" data-act="pay" ${tt.count ? "" : "disabled"}>${esc(t("charge"))}</button></div>
      <div class="order-head">
        <div class="order-title"><div style="flex:1"><h2>${esc(t("current"))}</h2><div class="sub">#CMB01-R02-${String(S.seq).padStart(6, "0")}</div></div>
          <div class="seg" role="group" aria-label="Sale or return"><button data-act="mode" data-mode="sale" aria-pressed="${S.mode === "sale"}">${esc(t("sale"))}</button><button data-act="mode" data-mode="return" aria-pressed="${S.mode === "return"}">${esc(t("ret"))}</button></div>
          <button class="icon-btn" title="More">${ic("more")}</button></div>
        <button class="customer" data-act="customer"><span class="avatar">${c.initials}</span><span class="who"><b>${esc(c.name)}</b><span>${esc(c.note)}</span></span><span class="link">${c.id === "walk" ? esc(t("addCustomer")) : "Change"}<kbd>F3</kbd></span></button>
      </div>
      <div class="items" role="list">${items}${S.cart.length && S.mode === "sale" ? `<button class="btn ghost s" data-act="note">${ic("note", 18)}Add note</button>` : ""}</div>
      <div class="summary-wrap"><div class="summary">
        <div class="r"><span>Subtotal (${tt.count} items)</span><b>${fmt(tt.gross)}</b></div>
        <div class="r disc"><span>Discount</span><b>${tt.disc ? "−" : ""}${fmt(tt.disc)}</b></div>
        <div class="r"><span>VAT (incl. 18%)</span><b>${fmt(tt.vat)}</b></div><hr>
        <div class="total"><span>${esc(t("total"))}</span><span>${fmt(tt.net)}</span></div></div></div>
      <div class="payrow"><button class="select" data-act="pay">${ic("wallet", 18)}Cash${ic("chevDown", 16)}</button><label class="voucher">${ic("tag", 18)}<input placeholder="Voucher" aria-label="Voucher code" data-fid="voucher"></label><button class="btn secondary s" data-act="voucher" style="height:44px">Apply</button></div>
      <div class="order-foot"><button class="btn primary l block" data-act="pay" ${tt.count && S.mode === "sale" ? "" : "disabled"}>${esc(t("charge"))} ${fmt(tt.net)} ${ic("arrowRight")}<kbd>F10</kbd></button>
        <div class="two"><button class="btn secondary" data-act="hold">${esc(t("hold"))} <kbd>F6</kbd></button><button class="btn secondary" data-act="discount">${esc(t("discount"))} <kbd>F5</kbd></button></div></div>
    </aside>`;
  }

  // ---------- Render: Sale complete ----------
  function receiptText(s) {
    const W = 40, L2 = (l, r) => l + r.padStart(Math.max(1, W - l.length)), C = x => " ".repeat(Math.max(0, Math.floor((W - x.length) / 2))) + x, D = "-".repeat(W);
    const n = c => (c / 100).toLocaleString("en-US", { minimumFractionDigits: 2 });
    const out = [C("CITY PHARMACY & MART"), C("No. 12, Galle Road, Colombo 03"), C("VAT Reg: 123456789-7000"), D, "Receipt: " + s.no, "Date: " + s.time.toLocaleDateString("en-GB") + " " + s.time.toTimeString().slice(0, 5) + "  Cashier: Sachini", D];
    for (const l of s.cart) {
      const p = byId(l.pid);
      out.push(p.name + (l.batch ? "  " + l.batch + " exp " + l.exp : ""));
      out.push(L2(p.weighed ? `  ${l.qty.toFixed(3)} kg x ${n(l.unit)}` : `  ${l.qty} x ${n(l.unit)}`, n(lineGross(l))));
      if (l.disc) out.push(L2(`  ${l.approver ? "Discount" : "Offer"} -${l.disc}%`, "-" + n(lineGross(l) - lineNet(l))));
    }
    out.push(D, L2("TOTAL", "Rs " + n(s.t.net)), L2("  incl. VAT 18%", n(s.t.vat)), L2(s.method === "cash" ? "Cash" : s.method === "card" ? "Card" : s.method === "qr" ? "LankaQR" : "Credit", n(s.paid)));
    if (s.method === "cash") out.push(L2("CHANGE", n(s.paid - s.t.net)));
    out.push(D, L2("Items: " + s.cart.length, s.t.disc ? "You saved Rs " + n(s.t.disc) : ""), C("Returns within 14 days with receipt"), "", C("|| ||| | |||| || ||| |||| | ||"), C(s.no), "", C("Thank you!"));
    return out.join("\n");
  }
  function completeView() {
    const s = S.last; const change = s.method === "cash" ? s.paid - s.t.net : 0;
    return `<div class="body"><section class="complete" aria-live="polite">
      <div class="success-mark"><div>${ic("check", 44)}</div></div>
      <h1>Sale complete</h1><div class="sub">Receipt #${s.no} · ${s.method === "cash" ? "Cash" : s.method === "card" ? "Card" : s.method === "qr" ? "LankaQR" : "Credit"} · ${esc(s.customer.name)}</div>
      ${s.method === "cash" ? `<div class="change-card"><span>Change due</span><b>${fmt(change)}</b></div>` : `<div class="change-card"><span>Paid</span><b>${fmt(s.t.net)}</b></div>`}
      ${S.printerError ? `<div class="alert-card" role="alert">${ic("printer")}Printer is out of paper. Load paper, then press Reprint.<button class="btn secondary s" data-act="reprint">Reprint</button><button class="btn ghost s" data-act="new">Continue without receipt</button></div>` : ""}
      <div class="actions"><button class="btn primary l" data-act="new">New sale ${ic("arrowRight")}<kbd>Enter</kbd></button><button class="btn secondary l" data-act="reprint">${ic("printer")}Reprint <kbd>Ctrl P</kbd></button><button class="btn secondary l" data-act="email">${ic("mail")}Email receipt</button><button class="btn ghost l">${ic("gift")}Gift receipt</button></div>
      <div>${S.offline ? badge("warning", "Saved offline · will sync automatically", "wifiOff") : badge("success", "Synced " + new Date().toTimeString().slice(0, 5), "cloudCheck")}</div>
      <div class="sub" id="countdown">${S.countdown > 0 ? `Returning to Sell in ${S.countdown} s… press any key to stay` : "Press Enter for the next customer"}</div>
    </section>
    <aside class="receipt-panel" aria-label="Receipt preview"><div class="head"><span>Receipt preview</span>${badge("", "80 mm", null)}</div><div class="paper">${esc(receiptText(s))}</div></aside></div>`;
  }

  // ---------- Render: Dashboard ----------
  function dashboard() {
    const W = 700, H = 200, today = [6, 12, 20, 30, 38, 52, 62, 48, 40, 44, 58, 66, 54, 34, 18], last = [8, 10, 18, 26, 30, 44, 50, 46, 38, 40, 48, 52, 46, 30, 16];
    const pts = a => a.map((v, i) => [Math.round(i * W / (a.length - 1)), Math.round(H - v / 72 * H)]);
    const pt = pts(today), pl = pts(last), d = p => "M" + p.map(q => q.join(" ")).join(" L");
    const grid = [0, 1, 2, 3].map(i => `<path d="M0 ${i * H / 4} H${W}" stroke="var(--divider)"/>`).join("");
    const chart = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Sales by hour, today versus last week. Peak 1 pm, Rs 62,400."><defs><linearGradient id="g" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#3772FF" stop-opacity=".28"/><stop offset="1" stop-color="#3772FF" stop-opacity="0"/></linearGradient></defs>${grid}<path d="${d(pt)} L${W} ${H} L0 ${H} Z" fill="url(#g)"/><path d="${d(pl)}" fill="none" stroke="var(--text-3)" stroke-width="2" stroke-dasharray="6 6"/><path d="${d(pt)}" fill="none" stroke="#3772FF" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/><circle cx="${pt[5][0]}" cy="${pt[5][1]}" r="6" fill="var(--surface)" stroke="#3772FF" stroke-width="3"/><g transform="translate(${pt[5][0] - 62} ${pt[5][1] - 58})"><rect width="124" height="44" rx="8" fill="var(--inverse)"/><text x="10" y="19" font-size="13" font-weight="600" fill="var(--inverse-text)" font-family="Inter">1 pm · Rs 62,400</text><text x="10" y="35" font-size="12" fill="var(--inverse-text)" font-family="Inter" opacity=".8">81 sales</text></g></svg>`;
    const segs = [["Cash", .46, "#3772FF"], ["Card", .28, "#22C55E"], ["LankaQR", .16, "#FF7F11"], ["Credit", .10, "#6D4AFF"]];
    let a0 = -Math.PI / 2, arcs = "";
    for (const [, f, col] of segs) { const a1 = a0 + f * 2 * Math.PI - .04, r = 54, x0 = 70 + r * Math.cos(a0), y0 = 70 + r * Math.sin(a0), x1 = 70 + r * Math.cos(a1), y1 = 70 + r * Math.sin(a1); arcs += `<path d="M${x0.toFixed(1)} ${y0.toFixed(1)} A${r} ${r} 0 ${f > .5 ? 1 : 0} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}" stroke="${col}" stroke-width="20" fill="none"/>`; a0 += f * 2 * Math.PI; }
    const kpi = (label, val, icon, tile, trend) => `<div class="card kpi"><div class="head"><span class="icon-tile ${tile}">${ic(icon)}</span>${label}</div><div class="val">${val}</div>${trend}</div>`;
    const attn = (title, desc, icon, tile, tone, n, view) => `<button class="attn" data-act="nav" data-view="${view}"><span class="tile ${tile}">${ic(icon, 18)}</span><span class="grow"><b>${title}</b><span>${desc}</span></span>${badge(tone, n, null)}${ic("chevRight", 16)}</button>`;
    const spark = v => { const mx = Math.max(...v); return `<svg width="72" height="24" viewBox="0 0 72 24" aria-hidden="true"><path d="M${v.map((x, i) => `${Math.round(i * 72 / (v.length - 1))} ${Math.round(22 - x / mx * 20)}`).join(" L")}" fill="none" stroke="#3772FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`; };
    return `<div class="dash">
      <div class="kpis">
        ${kpi("Today's sales", "Rs 486,200", "cart", "tile-blue", badge("success", "▲ 12.5% vs yesterday", "trendUp"))}
        ${kpi("Transactions", "612", "receipt", "tile-green", badge("success", "▲ 24 vs yesterday", "trendUp"))}
        ${kpi("Customers", "188", "users", "tile-purple", badge("info", "12 new today", "userPlus"))}
        ${kpi("Credit due", "Rs 320,500", "wallet", "tile-orange", badge("warning", "▼ 4.2% vs last week", "trendDown"))}
      </div>
      <div class="row2">
        <div class="card"><div class="card-head"><h2>Sales by hour</h2><span class="legend"><i style="background:#3772FF"></i>Today</span><span class="legend"><i style="background:var(--text-3)"></i>Last week</span><span class="legend">Updated 10:45</span></div>
          <div class="chart">${chart}</div><div class="axis">${["8am", "10am", "12pm", "2pm", "4pm", "6pm", "8pm", "10pm"].map(x => `<span>${x}</span>`).join("")}</div></div>
        <div class="card"><div class="card-head"><h2>Needs attention</h2><button class="link">View all</button></div>
          ${attn("Sale exceptions", "Negative stock, price mismatch", "alert", "tile-orange", "warning", "7", "orders")}
          ${attn("Shift differences", "2 shifts waiting for approval", "wallet", "tile-orange", "warning", "2", "cash")}
          ${attn("Expiring in 30 days", "Batches across 3 branches", "calendar", "tile-orange", "warning", "23", "expiry")}
          ${attn("Low stock items", "Below reorder level", "package", "tile-blue", "", "41", "stock")}
          ${attn("Registers offline > 24 h", "KDY01 · Register 1", "wifiOff", "tile-pink", "error", "1", "settings")}</div>
      </div>
      <div class="row3">
        <div class="card"><h2>Top products today</h2>${[["Paracetamol 500mg", "184 strips", "pill", "teal", 100], ["Basmati rice 5kg", "96 bags", "wheat", "yellow", 70], ["Milk powder 400g", "88 packs", "milk", "blue", 62], ["Eggs 10-pack", "71 packs", "egg", "yellow", 50]].map(([n, u, i, tn, p]) => `<div class="tp"><span class="icon-tile tile-${tn}" style="width:36px;height:36px;border-radius:10px">${ic(i, 18)}</span><div class="grow"><div><b>${n}</b><span>${u}</span></div><div class="bar"><i style="width:${p}%"></i></div></div></div>`).join("")}</div>
        <div class="card"><h2>Payment mix</h2><div class="donut-wrap"><svg width="140" height="140" viewBox="0 0 140 140" role="img" aria-label="Cash 46%, Card 28%, LankaQR 16%, Credit 10%">${arcs}</svg><div class="lg-list">${segs.map(([l, f, c]) => `<div><i style="background:${c}"></i><span>${l}</span><b>${Math.round(f * 100)}%</b></div>`).join("")}</div></div></div>
        <div class="card"><h2>Branches today</h2>${[["CMB01 · Colombo 03", "Rs 211,400", "3/3 online", true, [4, 6, 5, 8, 9, 12, 10]], ["KDY01 · Kandy", "Rs 174,900", "1/2 online", false, [3, 5, 6, 5, 7, 8, 9]], ["GAL01 · Galle", "Rs 99,900", "2/2 online", true, [2, 3, 5, 4, 6, 5, 7]]].map(([n, s, r, ok, sp]) => `<div class="br"><div class="grow"><b>${n}</b><span><i class="st-dot" style="background:${ok ? "var(--success)" : "var(--warning)"}"></i>${r}</span></div>${spark(sp)}<b>${s}</b></div>`).join("")}</div>
      </div></div>`;
  }

  // ---------- Sign-in (R-02) & Open shift (R-03) ----------
  function shiftLabel() {
    const sh = S.shifts[S.user.id]; if (!sh) return "No open shift";
    const m = Math.max(0, Math.floor((Date.now() - sh.start) / 60000));
    return `Shift ${Math.floor(m / 60)}h ${m % 60}m`;
  }
  function greeting() { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"; }
  function lockLeft(u) { const until = S.su.locked[u.id]; return until && until > Date.now() ? Math.ceil((until - Date.now()) / 60000) : 0; }
  function signinView() {
    const u = USERS[S.su.sel]; const left = lockLeft(u); const tries = S.su.tries[u.id] || 0;
    const now = new Date();
    const dark = document.documentElement.dataset.theme === "dark";
    return `<div class="signin">
      <header class="signin-top"><span class="mark">R</span><b>RetailOS</b><span class="sub">City Pharmacy &amp; Mart · Colombo 03 · Register R02</span><div class="spacer"></div>
        ${S.offline ? badge("warning", "Offline · PINs still work", "wifiOff") : badge("success", "Synced 10:41", "cloudCheck")}${langSeg()}
        <button class="icon-btn" data-act="theme" title="Toggle dark mode">${ic(dark ? "sun" : "moon")}</button></header>
      <main class="signin-body">
        <section aria-labelledby="who">
          <div class="greet">${greeting()} · ${now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })} · ${now.toTimeString().slice(0, 5)}</div>
          <h1 id="who">${esc(t("whoWorking"))}</h1>
          <div class="users" role="listbox" aria-label="Staff on this branch">${USERS.map((x, i) => `<button class="user-tile" role="option" aria-selected="${i === S.su.sel}" data-act="su-pick" data-i="${i}" data-fid="user-${x.id}">
            ${S.shifts[x.id] ? badge("success", "Shift open", null) : lockLeft(x) ? badge("error", "Locked", "lock") : ""}<span class="avatar">${x.initials}</span><b>${esc(x.name)}</b><span>${esc(x.role)}</span></button>`).join("")}</div>
        </section>
        <section class="pin-card ${S.su.err ? "shake" : ""}" aria-label="PIN entry">
          <div class="pin-head"><span class="avatar">${u.initials}</span><div><b>${esc(t("enterPin"))}</b><span>${esc(u.name)} · ${esc(u.role)}</span></div></div>
          <div class="pin-dots big" aria-label="${S.su.pin.length} of 4 digits entered">${[0, 1, 2, 3].map(i => `<i class="${S.su.pin.length > i ? "on" : ""}"></i>`).join("")}</div>
          ${left ? `<div class="banner error">${ic("lock")}Locked after ${MAX_PIN_TRIES} wrong PINs. Try again in ${left} min or ask a manager.</div>`
            : S.su.err ? `<div class="scan-error" role="alert">${ic("alert", 18)}Wrong PIN · ${MAX_PIN_TRIES - tries} ${MAX_PIN_TRIES - tries === 1 ? "try" : "tries"} left</div>`
            : `<div class="note">${ic("lock", 16)}Demo PIN for ${esc(u.short)}: ${u.pin}</div>`}
          <div class="keypad big">${["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "⌫"].map(k => `<button data-act="su-key" data-k="${k}" ${left ? "disabled" : ""} aria-label="${k === "⌫" ? "Backspace" : k === "C" ? "Clear" : k}">${k === "⌫" ? ic("backspace", 24) : k}</button>`).join("")}</div>
          <button class="btn primary l block" data-act="su-submit" ${S.su.pin.length === 4 && !left ? "" : "disabled"}>${esc(t("signIn"))} <kbd>Enter</kbd></button>
        </section>
      </main>
      <footer class="signin-foot">Device WIN-CMB01-02 · v1.6.0 · ← → choose staff · type PIN · ${MAX_PIN_TRIES} wrong PINs lock that user for 5 minutes · PINs are checked on this device, so sign-in works offline</footer>
    </div>`;
  }
  function suKey(k) {
    const u = USERS[S.su.sel]; if (lockLeft(u)) return;
    S.su.err = false;
    if (k === "⌫") S.su.pin = S.su.pin.slice(0, -1); else if (k === "C") S.su.pin = ""; else if (S.su.pin.length < 4) S.su.pin += k;
    render();
    if (S.su.pin.length === 4) setTimeout(suSubmit, 150);
  }
  function suSubmit() {
    const u = USERS[S.su.sel]; if (lockLeft(u) || S.su.pin.length < 4 || S.view !== "signin") return;
    if (S.su.pin === u.pin) {
      S.su.tries[u.id] = 0; S.su.pin = ""; S.su.err = false; S.user = u;
      S.view = S.shifts[u.id] ? "sell" : "openshift";
      render(); toast(`Welcome, ${u.short}${S.shifts[u.id] ? " · your shift is open" : ""}`);
      if (S.view === "sell") focusSearch();
      return;
    }
    S.su.tries[u.id] = (S.su.tries[u.id] || 0) + 1; S.su.pin = ""; S.su.err = true;
    if (S.su.tries[u.id] >= MAX_PIN_TRIES) { S.su.locked[u.id] = Date.now() + 5 * 60000; S.su.tries[u.id] = 0; S.su.err = false; }
    render();
  }
  function signOut() { S.view = "signin"; S.su.sel = Math.max(0, USERS.indexOf(S.user)); S.su.pin = ""; S.su.err = false; S.modal = null; renderModal(); render(); }

  const floatTotal = () => DENOMS.reduce((a, d) => a + d * (S.os.counts[d] || 0), 0) + Math.round((parseFloat(S.os.coins) || 0) * 100);
  function openShiftView() {
    const total = floatTotal(); const usual = 500000; const coins = Math.round((parseFloat(S.os.coins) || 0) * 100);
    const diff = total - usual;
    return `<div class="shift">
      <section class="card" aria-labelledby="cf"><div class="card-head"><h2 id="cf">${esc(t("countFloat"))}</h2><span class="legend">Notes and coins placed in the drawer</span></div>
        ${DENOMS.map(d => { const n = S.os.counts[d] || 0; return `<div class="den-row"><span class="note-chip"><i style="background:${NOTE_COLORS[d]}"></i><b>Rs ${(d / 100).toLocaleString("en-US")}</b></span>
          <div class="stepper"><button data-act="os-dec" data-d="${d}" aria-label="One less Rs ${d / 100} note">${ic("minus", 16)}</button><input inputmode="numeric" data-den="${d}" data-fid="den-${d}" value="${n}" aria-label="Number of Rs ${d / 100} notes"><button data-act="os-inc" data-d="${d}" aria-label="One more Rs ${d / 100} note">${ic("plus", 16)}</button></div>
          <span class="amt ${n ? "on" : ""}">${fmt(d * n)}</span></div>`; }).join("")}
        <div class="den-row"><span class="note-chip"><i style="background:var(--text-3);border-radius:50%;width:18px"></i><b>Coins</b></span><label class="voucher" style="max-width:200px">Rs<input data-coins data-fid="coins" inputmode="decimal" value="${esc(S.os.coins)}" placeholder="0.00" aria-label="Total value of coins"></label><span class="amt ${coins ? "on" : ""}">${fmt(coins)}</span></div>
      </section>
      <aside class="card shift-sum" aria-label="Shift summary">
        <span class="sub">${esc(t("openingFloat"))}</span>
        <div class="float ${total ? "" : "zero"}">${fmt(total)}</div>
        <dl class="kv"><dt>Cashier</dt><dd>${esc(S.user.name)}</dd><dt>Register</dt><dd>CMB01 · R02</dd><dt>Business date</dt><dd>${new Date().toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</dd><dt>Usual float</dt><dd>${fmt(usual)}</dd></dl>
        ${total && diff ? `<div class="banner">${ic("alert")}${diff > 0 ? "More" : "Less"} than the usual float by ${fmt(Math.abs(diff))}. Check the count, or continue if this is intended.</div>` : ""}
        <button class="btn secondary block" data-act="os-last">Use usual float · Rs 5,000 (3 × 1,000 · 2 × 500 · 10 × 100)</button>
        <button class="btn primary l block" data-act="os-open" ${total > 0 ? "" : "disabled"}>${ic("check")}${esc(t("openShift"))} <kbd>Enter</kbd></button>
        <button class="btn ghost block" data-act="logout">${ic("logout")}${esc(t("signOut"))}</button>
        <div class="note">${ic("lock", 16)}The count is saved to the audit log. Selling starts after the shift is open (BR-08).</div>
      </aside></div>`;
  }
  function openShiftNow() {
    const total = floatTotal(); if (total <= 0) { toast("Count the opening float first", { error: true }); return; }
    S.shifts[S.user.id] = { float: total, start: Date.now() };
    S.os = { counts: {}, coins: "" };
    S.view = "sell"; S.cart = []; S.sel = 0; S.customer = CUSTOMERS[0];
    render(); toast(`Shift opened with ${fmt(total)} · CMB01 · R02`); focusSearch();
  }

  // ---------- Render: main ----------
  function render() {
    const fid = document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.fid : null;
    const ae = document.activeElement;
    const caret = ae && ae.tagName === "INPUT" && ae.type !== "checkbox" ? ae.selectionStart : null;
    if (S.view === "signin") {
      document.body.classList.remove("sheet-mode");
      app.innerHTML = signinView() + protoControls();
      if (fid) { const el = app.querySelector(`[data-fid="${fid}"]`); if (el) el.focus({ preventScroll: true }); }
      return;
    }
    const sheet = sheetMode() && (S.view === "sell" || S.view === "complete");
    document.body.classList.toggle("sheet-mode", sheet);
    document.body.classList.toggle("touch", S.touch);
    let main;
    if (S.view === "sell") main = topbar(t("sell"), null, `<span class="badge hide-t">${ic("store", 14)}CMB01 · Register 2</span>`) + `<div class="body">${productArea()}${orderPanel()}</div>${sheet ? `<button class="fab" data-act="camera" title="Scan with camera">${ic("camera", 24)}</button>` : ""}`;
    else if (S.view === "complete") main = topbar("Sale complete", null) + completeView();
    else if (S.view === "openshift") main = topbar(t("openShift"), `${greeting()}, ${S.user.short} · count the cash before you start selling`) + openShiftView();
    else if (S.view === "dashboard") main = topbar(t("overview"), "Thursday, 19 Nov 2026", `<span class="badge hide-t">${ic("store", 14)}All branches</span>`) + dashboard();
    else main = topbar(t(S.view) || "Settings", null) + `<div class="placeholder"><div class="empty"><span class="circle">${ic("package", 28)}</span><h3>${esc(t(S.view))} is not part of this prototype</h3><span>The prototype covers Sell, payment, sale complete and the Overview dashboard.</span><button class="btn primary s" data-act="nav" data-view="sell">Go to Sell</button></div></div>`;
    app.innerHTML = `<div class="app ${S.collapsed ? "collapsed" : ""} ${S.tablet ? "tablet" : ""} ${!S.tablet && window.innerWidth > 1180 ? "desk" : ""}">${sidebar()}<main class="main">${main}</main></div>${protoControls()}`;
    S.flash = null;
    if (fid) { const el = app.querySelector(`[data-fid="${fid}"]`); if (el) { el.focus({ preventScroll: true }); if (caret != null && el.setSelectionRange) el.setSelectionRange(caret, caret); } }
    const selLine = app.querySelector(".line.sel"); if (selLine && selLine.scrollIntoView) selLine.scrollIntoView({ block: "nearest" });
  }
  function protoControls() {
    return `<div class="proto">${S.protoOpen ? `<div class="proto-panel" role="dialog" aria-label="Prototype controls"><b>Simulate</b>
      <label>Dark mode<input type="checkbox" data-act="theme" ${document.documentElement.dataset.theme === "dark" ? "checked" : ""}></label>
      <label>Offline<input type="checkbox" data-act="toggle-offline" ${S.offline ? "checked" : ""}></label>
      <label>Printer out of paper<input type="checkbox" data-act="toggle-printer" ${S.printerError ? "checked" : ""}></label>
      <label>Tablet layout (bottom sheet)<input type="checkbox" data-act="toggle-tablet" ${S.tablet ? "checked" : ""}></label>
      <label>Touch mode (bigger targets)<input type="checkbox" data-act="toggle-touch" ${S.touch ? "checked" : ""}></label>
      <button class="btn secondary" data-act="replay-loading">Replay loading skeleton</button>
      <button class="btn secondary" data-act="reset">Reset demo</button>
      <button class="btn secondary" data-act="logout">Go to sign-in screen</button>
      <small>Staff PINs: Sachini 1111 (shift open) · Nimal 2222 · Rizwan 3333 · Malini 1234 (manager) · Kasun 4444 · Anushka 5555. Try barcodes 4791111000011, 2012340012507 (1.250 kg carrots), 9999999999999 (unknown).</small></div>` : ""}
      <button class="proto-btn" data-act="proto">${ic("sliders", 16)}Prototype</button></div>`;
  }

  // ---------- Render: modals ----------
  function renderModal() {
    const m = S.modal;
    if (!m) { modalRoot.innerHTML = ""; return; }
    let h = "";
    const head = (title, sub) => `<div class="modal-head"><div class="grow"><h2 id="mt">${esc(title)}</h2>${sub ? `<div class="sub">${esc(sub)}</div>` : ""}</div><kbd>Esc</kbd><button class="icon-btn outline" data-act="close" aria-label="Close">${ic("x")}</button></div>`;
    if (m.type === "batch") {
      const p = byId(m.pid);
      h = `<div class="modal" role="dialog" aria-modal="true" aria-labelledby="mt">${head("Choose batch", p.name + " · prices differ between batches")}<div class="opt-list" role="listbox">${p.batches.map((b, i) => `<button class="opt" role="option" data-act="pick-batch" data-i="${i}" aria-selected="${m.choice === i}"><span class="grow"><b>${b.id}</b> · exp ${b.exp} · ${b.stock} in stock<small>${i === 0 ? "Sells first (earliest expiry)" : "Later expiry"}</small></span><b>${fmt(b.price)}</b>${i === 0 ? badge("success", "FEFO", null) : ""}</button>`).join("")}<button class="opt" disabled><span class="grow">B0 · exp 10/2026 · expired<small>Blocked: cannot be sold</small></span>${badge("error", "Blocked", "lock")}</button></div>
        <div class="note">${ic("scan", 16)}Tip: scanning the 2D code on the pack picks the batch automatically.</div>
        <div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn secondary" data-act="close">Cancel</button><button class="btn primary" data-act="confirm-batch">Use ${p.batches[m.choice].id} <kbd>Enter</kbd></button></div></div>`;
    } else if (m.type === "weight" || m.type === "qty") {
      const l = m.type === "qty" ? S.cart[S.sel] : null; const p = byId(m.type === "qty" ? l.pid : m.pid);
      const w = p.weighed;
      h = `<div class="modal" role="dialog" aria-modal="true" aria-labelledby="mt" style="width:min(420px,100%)">${head(w ? (m.type === "qty" ? "Change weight" : "Weigh item") : "Change quantity", p.name + (w ? " · " + fmt(p.price) + " per kg" : ""))}
        <div class="big-amount">${esc(m.value || (w ? "0.000" : "0"))}${w ? "&nbsp;kg" : ""}<span class="caret"></span></div>
        ${w ? `<div class="note">${ic("scan", 16)}Reading from scale… or type the weight. Line total ${fmt(Math.round((parseFloat(m.value) || 0) * p.price))}</div>` : ""}
        <div class="keypad">${["1", "2", "3", "4", "5", "6", "7", "8", "9", w ? "." : "00", "0", "⌫"].map(k => `<button data-act="mkey" data-k="${k}" aria-label="${k === "⌫" ? "Backspace" : k}">${k === "⌫" ? ic("backspace", 24) : k}</button>`).join("")}</div>
        <button class="btn primary l block" data-act="confirm-qty">${m.type === "qty" ? "Update" : "Add to sale"} <kbd>Enter</kbd></button></div>`;
    } else if (m.type === "discount") {
      const l = S.cart[S.sel]; const p = byId(l.pid);
      const needs = m.pct > DISCOUNT_LIMIT;
      h = `<div class="modal" role="dialog" aria-modal="true" aria-labelledby="mt" style="width:min(460px,100%)">${head("Line discount", p.name + " · your limit is " + DISCOUNT_LIMIT + "%")}
        <div class="quick">${[5, 10, 15, 25].map(v => `<button class="chip" data-act="disc-pick" data-v="${v}" aria-pressed="${m.pct === v}">${v}%</button>`).join("")}</div>
        <div class="change ${needs ? "short" : ""}"><span>New line total</span><b style="font-size:28px">${fmt(Math.round(lineGross(l) * (100 - m.pct) / 100))}</b></div>
        ${needs ? `<div class="banner">${ic("lock")}Manager approval needed for ${m.pct}% (limit ${DISCOUNT_LIMIT}%)</div><div class="field">Manager PIN (demo: 1234)<div class="pin-dots">${[0, 1, 2, 3].map(i => `<i class="${(m.pin || "").length > i ? "on" : ""}"></i>`).join("")}</div></div>
          <div class="keypad">${["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"].map(k => k ? `<button data-act="pinkey" data-k="${k}" aria-label="${k === "⌫" ? "Backspace" : k}">${k === "⌫" ? ic("backspace", 24) : k}</button>` : "<span></span>").join("")}</div>${m.pinError ? `<div class="scan-error">${ic("alert", 16)}Wrong PIN. ${5 - m.tries} tries left before a 5-minute lock.</div>` : ""}` : ""}
        <div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn secondary" data-act="close">Cancel</button><button class="btn primary" data-act="confirm-disc">${needs ? "Approve & apply" : "Apply"} <kbd>Enter</kbd></button></div></div>`;
    } else if (m.type === "customer") {
      h = `<div class="modal" role="dialog" aria-modal="true" aria-labelledby="mt">${head("Select customer", "Search by name or phone")}<div class="opt-list">${CUSTOMERS.map((c, i) => `<button class="opt" data-act="pick-customer" data-i="${i}" aria-selected="${S.customer.id === c.id}"><span class="avatar">${c.initials}</span><span class="grow"><b>${esc(c.name)}</b><small>${esc(c.note)}${c.phone ? " · " + c.phone : ""}</small></span>${c.credit ? badge("info", "Credit", "wallet") : ""}</button>`).join("")}</div><button class="btn secondary" data-act="toast" data-msg="Quick add customer is not in this prototype">${ic("userPlus")}Quick add customer</button></div>`;
    } else if (m.type === "held") {
      h = `<div class="modal" role="dialog" aria-modal="true" aria-labelledby="mt">${head("Held bills", S.held.length + " on hold")}${S.held.length ? `<div class="opt-list">${S.held.map((b, i) => `<div class="opt"><span class="grow"><b>${b.time} · ${b.cart.length} items</b><small>${esc(b.customer.name)}</small></span><b>${fmt(b.total)}</b><button class="btn primary s" data-act="resume" data-i="${i}">Resume</button><button class="btn ghost s" data-act="discard" data-i="${i}" style="color:var(--error-text)">Discard</button></div>`).join("")}</div>` : `<div class="empty"><span class="circle">${ic("clock", 28)}</span><h3>No held bills</h3><span>Press F6 on checkout to hold one.</span></div>`}</div>`;
    } else if (m.type === "payment") {
      const tt = totals(); const P = S.pay; const amt = payAmount(); const change = amt - tt.net;
      const methods = [["cash", "Cash", "cash", "F1"], ["card", "Card", "card", "F2"], ["qr", "LankaQR", "qr", "F3"], ["credit", "Credit", "wallet", "F4"], ["split", "Split", "list", ""]];
      h = `<div class="modal wide" role="dialog" aria-modal="true" aria-labelledby="mt">${head(t("payment"), "Receipt #CMB01-R02-" + String(S.seq).padStart(6, "0") + " · " + new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }))}
        <div class="pay-grid"><div style="display:flex;flex-direction:column;gap:14px">
          <div class="customer" style="cursor:default"><span class="avatar">${S.customer.initials}</span><span class="who"><b>${esc(S.customer.name)}</b><span>${esc(S.customer.note)}</span></span></div>
          <div class="receipt-card"><span class="sub" style="font-size:12px;font-weight:600;letter-spacing:.06em">TRANSACTION DETAILS</span>${S.cart.map(l => { const p = byId(l.pid); return `<div class="it"><span><b>${esc(p.name)}</b><small>${p.weighed ? l.qty.toFixed(3) + " kg" : l.qty} × ${(l.unit / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}</small></span><b>${(lineNet(l) / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}</b></div>`; }).join("")}
            <hr style="border:0;border-top:1px solid var(--border);width:100%;margin:0"><div class="it"><span>Items (${tt.count})</span><b>${fmt(tt.gross)}</b></div><div class="it"><span>Discount</span><b style="color:var(--success-text)">−${fmt(tt.disc)}</b></div><div class="it"><span>VAT (incl. 18%)</span><b>${fmt(tt.vat)}</b></div><div class="it" style="font-size:18px"><b>Total</b><b>${fmt(tt.net)}</b></div></div>
          <label class="check-row"><input type="checkbox" data-act="taxinv" ${P.taxInvoice ? "checked" : ""}>Issue VAT tax invoice</label>
          ${P.taxInvoice ? `<label class="field">Buyer VAT no.<input data-fid="vatno" placeholder="e.g. 123456789-7000"></label>` : ""}
          <div class="note">${ic("card", 16)}Card numbers are never entered in RetailOS</div></div>
        <div style="display:flex;flex-direction:column;gap:14px">
          <div class="methods" role="group" aria-label="Payment method">${methods.map(([k, l, i, key]) => `<button class="method" data-act="method" data-m="${k}" aria-pressed="${P.method === k}">${ic(i, 22)}<span>${l}${key ? `<kbd>${key}</kbd>` : ""}</span></button>`).join("")}</div>
          ${P.method === "cash" ? `<div class="field">Amount received<div class="big-amount">${fmt(amt)}<span class="caret"></span></div></div>
            <div class="quick">${[["Exact", tt.net], ["", 500000], ["", 1000000], ["", 2000000]].map(([l, v]) => { const val = l ? v : Math.max(v, Math.ceil(tt.net / v) * v); return `<button class="chip" data-act="quick" data-v="${val}" aria-pressed="${amt === val}">${l ? "Exact " : ""}${fmt(val).replace(".00", "")}</button>`; }).join("")}</div>
            <div class="keypad">${["1", "2", "3", "4", "5", "6", "7", "8", "9", "00", "0", "⌫"].map(k => `<button data-act="pkey" data-k="${k}" aria-label="${k === "⌫" ? "Backspace" : k}">${k === "⌫" ? ic("backspace", 24) : k}</button>`).join("")}</div>
            <div class="change ${change < 0 ? "short" : ""}"><span>${change < 0 ? "Still due" : "Change due"}</span><b>${fmt(Math.abs(change))}</b></div>`
            : P.method === "card" || P.method === "qr" ? `<div class="banner" style="background:var(--primary-tint);color:var(--primary-text)">${ic(P.method === "card" ? "card" : "qr")}${P.method === "card" ? "Ask the customer to tap or insert the card on the terminal for" : "Show the LankaQR code for"} ${fmt(tt.net)}</div><label class="field">Approval code from the terminal slip<input data-fid="approval" id="approval" inputmode="numeric" placeholder="e.g. 482913" value="${esc(P.approval)}"></label>`
            : P.method === "credit" ? (S.customer.credit ? `<div class="change"><span>Charge to ${esc(S.customer.name)}</span><b>${fmt(tt.net)}</b></div><div class="note">${ic("wallet", 16)}Credit limit Rs 100,000 · after this sale Rs ${(10000 - tt.net / 100).toLocaleString("en-US", { maximumFractionDigits: 0 })} available</div>` : `<div class="banner">${ic("alert")}Attach a credit customer first<button class="btn secondary" data-act="customer">Select customer (F3)</button></div>`)
            : `<div class="banner" style="background:var(--subtle);color:var(--text-2)">${ic("list")}Split payment: take part in cash, the rest by card (not in this prototype).</div>`}
          <button class="btn primary l block" data-act="complete" ${canComplete() ? "" : "disabled"}>${ic("check")}Complete payment <kbd>Enter</kbd></button></div></div></div>`;
    } else if (m.type === "quickview") {
      const p = byId(m.pid);
      modalRoot.innerHTML = `<div class="overlay" data-act="close" style="background:var(--scrim)"></div><aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="mt">${head(p.name, p.cat + " · " + p.meta)}
        <div class="hero tile-${p.tone}">${ic(p.icon, 96)}</div>
        <dl class="kv"><dt>Price</dt><dd>${fmt(p.price)}${p.weighed ? " / kg" : ""}</dd><dt>Stock (CMB01)</dt><dd>${p.stock <= 0 ? "Out of stock" : p.stock + (p.weighed ? " kg" : " units")}</dd><dt>Barcode</dt><dd style="font-family:var(--mono)">${p.code}</dd>${p.batches ? p.batches.map(b => `<dt>Batch ${b.id}</dt><dd>exp ${b.exp} · ${fmt(b.price)} · ${b.stock}</dd>`).join("") : ""}${p.rx ? `<dt>Prescription</dt><dd>Required</dd>` : ""}</dl>
        <div style="margin-top:auto;display:flex;gap:8px"><button class="btn secondary" data-act="close" style="flex:1">Price check</button><button class="btn primary" data-act="qv-add" data-pid="${p.id}" style="flex:1" ${p.stock <= 0 ? "disabled" : ""}>Add to sale <kbd>Enter</kbd></button></div></aside>`;
      setTimeout(() => { const b = modalRoot.querySelector('[data-act="qv-add"]'); if (b) b.focus(); });
      return;
    } else if (m.type === "help") {
      const sc = [["F2 or Ctrl K", "Search / scan"], ["Enter", "Add focused product"], ["Arrow keys", "Move between products"], ["Space", "Quick view"], ["↑ ↓ (cart)", "Select cart line"], ["+ / −", "Change quantity"], ["Del", "Remove line"], ["F3", "Customer"], ["F4", "Edit quantity / weight"], ["F5", "Discount"], ["F6 / F7", "Hold / recall bill"], ["F8", "Sale ↔ Return"], ["F10", "Pay"], ["Ctrl Z", "Undo"], ["Esc", "Close dialog"], ["3*", "Then scan: quantity 3"]];
      h = `<div class="modal" role="dialog" aria-modal="true" aria-labelledby="mt" style="width:min(640px,100%)">${head("Keyboard shortcuts", "Everything also works with mouse and touch")}<div class="shortcuts">${sc.map(([k, v]) => `<div><span>${v}</span><kbd>${k}</kbd></div>`).join("")}</div><div class="note">${ic("scan", 16)}Demo barcodes: 4791111000011 (milk powder), 2012340012507 (carrots 1.250 kg), 0108901234567890B1 (paracetamol batch B1), 9999999999999 (unknown)</div></div>`;
    }
    modalRoot.innerHTML = `<div class="overlay" data-act="overlay">${h}</div>`;
    setTimeout(() => { const f = modalRoot.querySelector("input[data-fid]") || modalRoot.querySelector(".btn.primary:not([disabled])") || modalRoot.querySelector(".opt"); if (f) f.focus(); });
  }

  // ---------- Events: clicks ----------
  document.addEventListener("click", e => {
    const el = e.target.closest("[data-act]"); if (!el) return;
    const a = el.dataset.act, i = el.dataset.i != null ? parseInt(el.dataset.i, 10) : null;
    if (a === "overlay" && e.target !== el) return; // clicks inside the modal
    switch (a) {
      case "nav": { const v = el.dataset.view; S.view = v === "sell" && !S.shifts[S.user.id] ? "openshift" : v; S.modal = null; renderModal(); render(); break; }
      case "collapse": S.collapsed = !S.collapsed; render(); break;
      case "logout": signOut(); break;
      case "su-pick": S.su.sel = i; S.su.pin = ""; S.su.err = false; render(); break;
      case "su-key": suKey(el.dataset.k); break;
      case "su-submit": suSubmit(); break;
      case "os-inc": case "os-dec": { const d = el.dataset.d; S.os.counts[d] = Math.max(0, (S.os.counts[d] || 0) + (a === "os-inc" ? 1 : -1)); render(); break; }
      case "os-last": S.os = { counts: { 100000: 3, 50000: 2, 10000: 10 }, coins: "" }; render(); break;
      case "os-open": openShiftNow(); break;
      case "lang": S.lang = el.dataset.lang; document.documentElement.lang = S.lang; render(); break;
      case "theme": { const dark = !(document.documentElement.dataset.theme === "dark"); document.documentElement.dataset.theme = dark ? "dark" : "light"; store("retailos-proto-theme", dark ? "dark" : "light"); render(); break; }
      case "help": openModal({ type: "help" }); break;
      case "proto": S.protoOpen = !S.protoOpen; render(); break;
      case "toggle-offline": S.offline = !S.offline; render(); if (!S.offline) { toast(`${S.waiting} sales synced`); S.waiting = 0; render(); } break;
      case "toggle-printer": S.printerError = !S.printerError; render(); break;
      case "toggle-tablet": S.tablet = !S.tablet; S.sheetOpen = false; render(); break;
      case "toggle-touch": S.touch = !S.touch; render(); break;
      case "replay-loading": S.loading = true; S.view = "sell"; render(); setTimeout(() => { S.loading = false; render(); }, 1200); break;
      case "reset": try { localStorage.removeItem("retailos-proto-theme"); } catch (x) {} location.reload(); break;
      case "cat": S.cat = el.dataset.cat; render(); break;
      case "instock": S.inStock = !S.inStock; render(); break;
      case "view-grid": S.list = false; render(); break;
      case "view-list": S.list = true; render(); break;
      case "card": if (e.target.closest(".qv")) break; addProduct(byId(el.dataset.pid)); break;
      case "quickview": e.stopPropagation(); openModal({ type: "quickview", pid: el.dataset.pid }); break;
      case "qv-add": { const p = byId(el.dataset.pid); closeModal(); addProduct(p); break; }
      case "clear-scan": S.scanError = null; S.query = ""; render(); focusSearch(); break;
      case "add-new": toast("Adding products needs a manager (not in this prototype)"); break;
      case "selline": if (e.target.closest("button")) break; S.sel = i; render(); break;
      case "inc": changeQty(i, 1); break;
      case "dec": changeQty(i, -1); break;
      case "remove": removeLine(i); break;
      case "editline": S.sel = i; openQty(); break;
      case "customer": openModal({ type: "customer", back: S.modal && S.modal.type === "payment" ? "payment" : null }); break;
      case "pick-customer": { const back = S.modal && S.modal.back; S.customer = CUSTOMERS[i]; if (back === "payment") { S.modal = { type: "payment" }; renderModal(); render(); } else { closeModal(); render(); } break; }
      case "mode": S.mode = el.dataset.mode; render(); break;
      case "hold": hold(); break;
      case "discount": openDiscount(); break;
      case "note": toast("Notes are not in this prototype"); break;
      case "voucher": toast("Voucher not recognised", { error: true }); break;
      case "pay": if (sheetMode() && !S.sheetOpen && el.closest(".sheet-bar")) { e.stopPropagation(); } openPayment(); break;
      case "sheet": if (e.target.closest("button")) break; S.sheetOpen = !S.sheetOpen; render(); break;
      case "camera": toast("Camera scanning opens here on tablets without a scanner"); break;
      case "undo": undo(); break;
      case "close": closeModal(); break;
      case "overlay": closeModal(); break;
      case "pick-batch": S.modal.choice = i; renderModal(); break;
      case "confirm-batch": { const m = S.modal, p = byId(m.pid); S.modal = null; renderModal(); addProduct(p, { batch: p.batches[m.choice].id }); break; }
      case "mkey": modalKey(el.dataset.k); break;
      case "confirm-qty": confirmQty(); break;
      case "disc-pick": S.modal.pct = parseInt(el.dataset.v, 10); S.modal.pin = ""; S.modal.pinError = false; renderModal(); break;
      case "pinkey": pinKey(el.dataset.k); break;
      case "confirm-disc": confirmDiscount(); break;
      case "resume": { const b = S.held.splice(i, 1)[0]; if (S.cart.length) hold(); S.cart = b.cart; S.customer = b.customer; S.sel = 0; closeModal(); render(); toast("Bill resumed"); break; }
      case "discard": S.held.splice(i, 1); renderModal(); render(); break;
      case "method": S.pay.method = el.dataset.m; renderModal(); setTimeout(() => { const a2 = document.getElementById("approval"); if (a2) a2.focus(); }); break;
      case "quick": S.pay.amount = String(parseInt(el.dataset.v, 10) / 100); renderModal(); break;
      case "pkey": payKey(el.dataset.k); break;
      case "taxinv": S.pay.taxInvoice = el.checked; renderModal(); break;
      case "complete": completeSale(); break;
      case "new": newSale(); break;
      case "reprint": if (S.printerError) { toast("Printer still has no paper", { error: true }); } else toast("Receipt reprinted"); break;
      case "email": toast("Receipt e-mailed to the customer"); break;
      case "toast": toast(el.dataset.msg); break;
    }
  });
  document.addEventListener("input", e => {
    if (e.target.id === "search") { S.query = e.target.value; S.scanError = null; render(); }
    if (e.target.dataset && e.target.dataset.den) { S.os.counts[e.target.dataset.den] = Math.max(0, parseInt(e.target.value.replace(/\D/g, ""), 10) || 0); render(); }
    if (e.target.hasAttribute && e.target.hasAttribute("data-coins")) { S.os.coins = e.target.value.replace(/[^0-9.]/g, ""); render(); }
    if (e.target.id === "approval" && S.pay) { S.pay.approval = e.target.value; const b = modalRoot.querySelector('[data-act="complete"]'); if (b) b.disabled = !canComplete(); }
  });

  function openQty() { const l = S.cart[S.sel]; if (!l) return; openModal({ type: "qty", value: byId(l.pid).weighed ? l.qty.toFixed(3) : String(l.qty) }); }
  function openDiscount() { const l = S.cart[S.sel]; if (!l) { toast("Select a line first", { error: true }); return; } openModal({ type: "discount", pct: l.disc && l.disc !== byId(l.pid).offer ? l.disc : 5, pin: "", tries: 0 }); }
  function modalKey(k) {
    const m = S.modal; let v = m.value || "";
    if (k === "⌫") v = v.slice(0, -1); else if (k === "." && v.includes(".")) return; else if (v.replace(".", "").length < 7) v = (v === "0" ? "" : v) + k;
    m.value = v; renderModal();
  }
  function confirmQty() {
    const m = S.modal; const q = parseFloat(m.value);
    if (!q || q <= 0) { toast("Enter a quantity", { error: true }); return; }
    if (m.type === "weight") { const p = byId(m.pid); S.modal = null; renderModal(); addProduct(p, { qty: Math.round(q * 1000) / 1000 }); }
    else { const l = S.cart[S.sel]; l.qty = byId(l.pid).weighed ? Math.round(q * 1000) / 1000 : Math.max(1, Math.round(q)); closeModal(); render(); }
  }
  function pinKey(k) { const m = S.modal; m.pinError = false; m.pin = k === "⌫" ? (m.pin || "").slice(0, -1) : ((m.pin || "") + k).slice(0, 4); renderModal(); if (m.pin.length === 4) confirmDiscount(); }
  function confirmDiscount() {
    const m = S.modal;
    if (m.pct <= DISCOUNT_LIMIT) { applyDiscount(m.pct); return; }
    if ((m.pin || "").length < 4) { toast("Manager PIN needed", { error: true }); return; }
    if (m.pin !== MANAGER_PIN) { m.tries = (m.tries || 0) + 1; m.pin = ""; m.pinError = true; renderModal(); return; }
    applyDiscount(m.pct, "Malini J. (Manager)");
  }
  function payKey(k) {
    let v = S.pay.amount || "";
    if (k === "⌫") v = v.slice(0, -1); else if (v.length < 9) v = (v === "0" ? "" : v) + k;
    S.pay.amount = v; renderModal();
  }
  function focusSearch() { setTimeout(() => { const s = document.getElementById("search"); if (s) s.focus(); }); }

  // ---------- Events: keyboard ----------
  let qtyPrefix = null;
  document.addEventListener("keydown", e => {
    const k = e.key, inInput = e.target.matches && e.target.matches("input, textarea");
    if (/^F([1-9]|1[0-2])$/.test(k)) e.preventDefault(); // F-keys belong to the POS, not the browser
    // Any key cancels the auto-return countdown on the complete screen
    if (S.view === "complete" && S.countdown > 0) { S.countdown = 0; const c = document.getElementById("countdown"); if (c) c.textContent = "Press Enter for the next customer"; }

    if (S.view === "signin" && !S.modal) {
      if (/^[0-9]$/.test(k)) { e.preventDefault(); suKey(k); return; }
      if (k === "Backspace") { e.preventDefault(); suKey("⌫"); return; }
      if (k === "Escape") { suKey("C"); return; }
      if (k === "ArrowRight" || k === "ArrowLeft") { e.preventDefault(); S.su.sel = (S.su.sel + (k === "ArrowRight" ? 1 : -1) + USERS.length) % USERS.length; S.su.pin = ""; S.su.err = false; render(); return; }
      if (k === "Enter" && !(e.target.closest && e.target.closest('[data-act="su-pick"]'))) { e.preventDefault(); suSubmit(); }
      return;
    }
    if (S.view === "openshift" && !S.modal) { if (k === "Enter") { e.preventDefault(); openShiftNow(); } return; }

    if (S.modal) {
      const m = S.modal;
      if (k === "Escape") { e.preventDefault(); closeModal(); return; }
      if (m.type === "payment") {
        const map = { F1: "cash", F2: "card", F3: "qr", F4: "credit" };
        if (map[k]) { S.pay.method = map[k]; renderModal(); return; }
        if (k === "Enter") { e.preventDefault(); completeSale(); return; }
        if (!inInput && S.pay.method === "cash") { if (/^[0-9]$/.test(k)) { payKey(k); return; } if (k === "Backspace") { payKey("⌫"); return; } }
        return;
      }
      if (m.type === "batch") { if (k === "ArrowDown" || k === "ArrowUp") { e.preventDefault(); m.choice = (m.choice + (k === "ArrowDown" ? 1 : -1) + 2) % 2; renderModal(); return; } if (k === "Enter") { e.preventDefault(); const p = byId(m.pid); S.modal = null; renderModal(); addProduct(p, { batch: p.batches[m.choice].id }); } return; }
      if (m.type === "weight" || m.type === "qty") { if (/^[0-9.]$/.test(k)) { modalKey(k); return; } if (k === "Backspace") { modalKey("⌫"); return; } if (k === "Enter") { e.preventDefault(); confirmQty(); } return; }
      if (m.type === "discount") { if (/^[0-9]$/.test(k) && m.pct > DISCOUNT_LIMIT) { pinKey(k); return; } if (k === "Backspace") { pinKey("⌫"); return; } if (k === "Enter") { e.preventDefault(); confirmDiscount(); } return; }
      if (m.type === "quickview" && k === "Enter") { const p = byId(m.pid); if (p.stock > 0) { e.preventDefault(); closeModal(); addProduct(p); } return; }
      return;
    }

    if ((k === "?" && !inInput) || k === "F1") { e.preventDefault(); openModal({ type: "help" }); return; }
    if ((e.ctrlKey || e.metaKey) && k.toLowerCase() === "z" && !inInput) { e.preventDefault(); undo(); return; }
    if ((e.ctrlKey || e.metaKey) && k.toLowerCase() === "k") { e.preventDefault(); if (S.view !== "sell") { S.view = "sell"; render(); } focusSearch(); return; }

    if (S.view === "complete") {
      if (k === "Enter") { e.preventDefault(); newSale(); }
      if ((e.ctrlKey || e.metaKey) && k.toLowerCase() === "p") { e.preventDefault(); toast(S.printerError ? "Printer still has no paper" : "Receipt reprinted", { error: S.printerError }); }
      return;
    }
    if (S.view !== "sell") return;

    switch (k) {
      case "F2": focusSearch(); return;
      case "F3": openModal({ type: "customer" }); return;
      case "F4": openQty(); return;
      case "F5": openDiscount(); return;
      case "F6": hold(); return;
      case "F7": openModal({ type: "held" }); return;
      case "F8": S.mode = S.mode === "sale" ? "return" : "sale"; render(); return;
      case "F10": openPayment(); return;
    }

    if (e.target.id === "search") {
      if (k === "Enter") {
        e.preventDefault();
        let q = S.query.trim(); if (!q) return;
        const m = q.match(/^(\d{1,3})\*(.*)$/); // "3*4791111000011" quantity prefix
        let mult = 1; if (m) { mult = parseInt(m[1], 10); q = m[2]; }
        const hit = findByCode(q);
        if (hit) { S.query = ""; for (let n = 0; n < mult; n++) addProduct(hit.p, { batch: hit.batch, qty: hit.qty }); return; }
        if (/^\d{8,}$/.test(q)) { S.scanError = q; S.query = ""; render(); focusSearch(); return; }
        const list = visibleProducts();
        if (list.length === 1) { S.query = ""; addProduct(list[0]); }
        else if (list.length) { const c = app.querySelector(".pcard[data-pid]"); if (c) c.focus(); }
        return;
      }
      if (k === "ArrowDown") { e.preventDefault(); const c = app.querySelector(".pcard[data-pid]"); if (c) c.focus(); return; }
      if (k === "Escape") { S.query = ""; S.scanError = null; render(); return; }
      return;
    }
    if (inInput) return;

    const card = e.target.closest && e.target.closest(".pcard[data-pid]");
    if (card) {
      const cards = [...app.querySelectorAll(".pcard[data-pid]")]; const idx = cards.indexOf(card);
      const cols = S.list ? 1 : cards.filter(c => c.offsetTop === cards[0].offsetTop).length || 1;
      const go = n => { const c = cards[Math.max(0, Math.min(cards.length - 1, n))]; if (c) c.focus(); };
      if (k === "ArrowRight") { e.preventDefault(); go(idx + 1); return; }
      if (k === "ArrowLeft") { e.preventDefault(); go(idx - 1); return; }
      if (k === "ArrowDown") { e.preventDefault(); go(idx + cols); return; }
      if (k === "ArrowUp") { e.preventDefault(); if (idx < cols) focusSearch(); else go(idx - cols); return; }
      if (k === "Enter") { e.preventDefault(); addProduct(byId(card.dataset.pid)); setTimeout(() => { const c = app.querySelector(`[data-fid="card-${card.dataset.pid}"]`); if (c) c.focus(); }); return; }
      if (k === " ") { e.preventDefault(); openModal({ type: "quickview", pid: card.dataset.pid }); return; }
    }
    if (k === "ArrowDown" || k === "ArrowUp") { if (!S.cart.length) return; e.preventDefault(); S.sel = Math.max(0, Math.min(S.cart.length - 1, S.sel + (k === "ArrowDown" ? 1 : -1))); render(); return; }
    if (k === "+" || k === "=") { e.preventDefault(); changeQty(S.sel, 1); return; }
    if (k === "-" || k === "_") { e.preventDefault(); changeQty(S.sel, -1); return; }
    if (k === "Delete") { e.preventDefault(); removeLine(S.sel); return; }
    // Barcode-scanner wedge: printable keys anywhere go to the search field
    if (k.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey && /[0-9A-Za-z*]/.test(k)) {
      e.preventDefault(); S.query = (S.query || "") + k; render(); focusSearch();
    }
  });

  // ---------- Timers & boot ----------
  setInterval(() => {
    if (S.view === "complete" && S.countdown > 0 && !S.modal) {
      S.countdown--; const c = document.getElementById("countdown");
      if (S.countdown === 0) newSale(); else if (c) c.textContent = `Returning to Sell in ${S.countdown} s… press any key to stay`;
    }
  }, 1000);
  let rz; window.addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(render, 120); });
  if (S.theme) document.documentElement.dataset.theme = S.theme;
  const hash = location.hash.replace("#", "");
  if (["sell", "dashboard", "signin", "openshift"].includes(hash)) S.view = hash;
  if (hash === "openshift") { S.user = USERS[1]; }            // Nimal has no open shift yet
  if (hash === "signin") { S.su.sel = 1; }
  render();
  setTimeout(() => { S.loading = false; render(); focusSearch(); }, 700);
})();
