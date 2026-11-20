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
    keyboard:'<rect width="20" height="16" x="2" y="4" rx="2"/><path d="M6 8h.01"/><path d="M10 8h.01"/><path d="M14 8h.01"/><path d="M18 8h.01"/><path d="M8 12h.01"/><path d="M12 12h.01"/><path d="M16 12h.01"/><path d="M7 16h10"/>',
    activity:'<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>', wifi:'<path d="M12 20h.01"/><path d="M2 8.82a15 15 0 0 1 20 0"/><path d="M5 12.86a10 10 0 0 1 14 0"/><path d="M8.5 16.43a5 5 0 0 1 7 0"/>',
    refresh:'<path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/>',
    upload:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',
    disk:'<path d="M22 12H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/><path d="M6 16h.01"/><path d="M10 16h.01"/>',
    monitor:'<rect width="20" height="14" x="2" y="3" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/>', school:'<path d="M22 10 12 5 2 10l10 5 10-5Z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>'
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
    { id: "sh", name: "Shampoo 340ml", cat: "Personal care", meta: "340 ml · SH-340", price: 109000, icon: "sparkles", tone: "pink", code: "4791111000066", stock: 3 },
    { id: "cc", name: "Cream crackers 500g", cat: "Grocery", meta: "500 g · CC-500", price: 52000, icon: "cookie", tone: "orange", code: "4791111000073", stock: 52 },
    { id: "eg", name: "Eggs 10-pack", cat: "Grocery", meta: "10 eggs · EG-10", price: 65000, icon: "egg", tone: "yellow", code: "4791111000080", stock: 30 },
    { id: "bw", name: "Bottled water 1.5L", cat: "Beverages", meta: "1.5 L · BW-15", price: 14000, icon: "droplet", tone: "blue", code: "4791111000097", stock: 140 },
    { id: "ct", name: "Ceylon black tea 200g", cat: "Beverages", meta: "200 g · CT-200", price: 76000, icon: "leaf", tone: "green", code: "4791111000103", stock: 44 },
    { id: "co", name: "Coconut oil 1L", cat: "Grocery", meta: "1 L · CO-1L", price: 98000, icon: "droplet", tone: "yellow", code: "4791111000110", stock: 0 },
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
  const REFUND_LIMIT = 200000;   // cashier refund limit Rs 2,000; above needs a manager (BR-06)
  const RETURN_DAYS = 14;        // return window (BR-06)
  const CS_THRESHOLD = 50000;    // shift difference above Rs 500 needs a reason (BR-08)
  const daysAgo = (d, h = 10, m = 0) => { const x = new Date(); x.setDate(x.getDate() - d); x.setHours(h, m, 0, 0); return x; };
  // Earlier sales on this branch, used by Returns (R-13). Lines keep the price/discount/batch snapshot (INV-10).
  const SEED_SALES = [
    { no: "CMB01-R02-000154", date: daysAgo(0, 10, 58), customer: 1, method: "cash", cashier: "Sachini K.", taxInvoice: "CMB01-R02-TI-000031",
      lines: [{ pid: "pc", qty: 2, unit: 3200, batch: "B2", exp: "09/2027", disc: 0, returned: 0 }, { pid: "br", qty: 1, unit: 325000, disc: 0, returned: 0 },
              { pid: "mp", qty: 2, unit: 115000, disc: 10, returned: 1 }, { pid: "sh", qty: 1, unit: 109000, disc: 0, returned: 0 }] },
    { no: "CMB01-R02-000150", date: daysAgo(0, 9, 40), customer: 0, method: "card", cashier: "Sachini K.",
      lines: [{ pid: "ct", qty: 1, unit: 76000, disc: 0, returned: 0 }, { pid: "bw", qty: 6, unit: 14000, disc: 0, returned: 0 }] },
    { no: "CMB01-R02-000139", date: daysAgo(2, 17, 5), customer: 2, method: "qr", cashier: "Nimal P.",
      lines: [{ pid: "am", qty: 1, unit: 45000, disc: 0, returned: 0 }, { pid: "tp", qty: 2, unit: 38000, disc: 0, returned: 0 }] },
    { no: "CMB01-R01-000098", date: daysAgo(23, 11, 30), customer: 3, method: "cash", cashier: "Anushka D.",
      lines: [{ pid: "eg", qty: 2, unit: 65000, disc: 0, returned: 0 }, { pid: "cc", qty: 1, unit: 52000, disc: 0, returned: 0 }] }
  ];
  // More of today's trading on both registers (Sales history, R-14)
  const mkSale = (no, d, cashier, method, items, x = {}) => ({ no, date: d, customer: x.customer || 0, method, cashier, sync: x.sync, syncError: x.syncError, taxInvoice: x.taxInvoice || null,
    lines: items.map(([pid, qty, batch]) => { const p = PRODUCTS.find(y => y.id === pid); const b = batch && p.batches ? p.batches.find(y => y.id === batch) : null;
      return { pid, qty, unit: b ? b.price : p.price, batch: b ? b.id : null, exp: b ? b.exp : null, disc: p.offer || 0, returned: 0 }; }) });
  SEED_SALES.push(
    mkSale("CMB01-R02-000153", daysAgo(0, 10, 41), "Sachini K.", "cash", [["eg", 1], ["br", 1]]),
    mkSale("CMB01-R02-000152", daysAgo(0, 10, 20), "Sachini K.", "card", [["mp", 1], ["tp", 1]]),
    mkSale("CMB01-R02-000151", daysAgo(0, 9, 58), "Sachini K.", "qr", [["ct", 2]], { customer: 2 }),
    mkSale("CMB01-R02-000149", daysAgo(0, 9, 12), "Sachini K.", "cash", [["pc", 3, "B2"], ["bw", 1]]),
    mkSale("CMB01-R02-000148", daysAgo(0, 8, 50), "Sachini K.", "credit", [["br", 2], ["cc", 2]], { customer: 1, taxInvoice: "CMB01-R02-TI-000030" }),
    mkSale("CMB01-R02-000147", daysAgo(0, 8, 31), "Sachini K.", "cash", [["sh", 1]], { sync: "error", syncError: "SALE-005 · Rejected by the server: price list version not found. Support has been notified; retrying is safe." }),
    mkSale("CMB01-R02-000146", daysAgo(0, 8, 12), "Sachini K.", "cash", [["eg", 2], ["bw", 4]]),
    mkSale("CMB01-R01-000231", daysAgo(0, 10, 52), "Anushka D.", "cash", [["cc", 3]]),
    mkSale("CMB01-R01-000230", daysAgo(0, 10, 40), "Anushka D.", "card", [["am", 1]], { customer: 3 }),
    mkSale("CMB01-R01-000229", daysAgo(0, 10, 5), "Anushka D.", "cash", [["tp", 2], ["sh", 1]]),
    mkSale("CMB01-R01-000228", daysAgo(0, 9, 30), "Anushka D.", "qr", [["ct", 1], ["mp", 1]]),
    mkSale("CMB01-R02-000138", daysAgo(1, 17, 40), "Nimal P.", "cash", [["br", 1], ["eg", 1]]),
    mkSale("CMB01-R01-000214", daysAgo(1, 15, 12), "Anushka D.", "card", [["mp", 2]], { customer: 1 })
  );
  // ---------- Receiving data (R-17) ----------
  const SUPPLIERS = ["Hemas Pharmaceuticals", "Cargills Distribution", "Lanka Milk Foods", "Ceylon Biscuits Ltd", "Fresh Farms Nuwara Eliya"];
  const LOW_STOCK = 5;
  const tracked = p => p.cat === "Pharmacy" || p.cat === "Dairy" || p.id === "eg";   // batch + expiry required (INV-14)
  const unitsFor = p => p.weighed ? [{ k: "kg", l: "kg", f: 1 }, { k: "sack", l: "Sack (25 kg)", f: 25 }]
    : p.cat === "Pharmacy" ? [{ k: "strip", l: "Strip", f: 1 }, { k: "box", l: "Box (10 strips)", f: 10 }]
    : [{ k: "pc", l: "Piece", f: 1 }, { k: "case", l: "Case (12)", f: 12 }];
  const baseCost = p => Math.round(p.price * 0.72 / 100) * 100;                     // demo supplier cost per base unit
  const gtinOf = p => "0" + p.code;
  const pad2 = n => String(n).padStart(2, "0");
  const isoDate = d => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  const yymmdd = d => `${String(d.getFullYear()).slice(2)}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}`;
  const inDays = n => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + n); return d; };
  function parseGS1(raw) {                                                             // AIs (01) GTIN, (17) expiry, (10) batch, (21) serial
    const s0 = raw.trim(); const out = {};
    if (s0.includes("(")) { for (const m of s0.matchAll(/\((\d{2})\)([^(]+)/g)) out[m[1]] = m[2].trim(); return out["01"] ? out : null; }
    const s = s0.replace(/[^0-9A-Za-z\x1d]/g, "");
    if (!/^01\d{14}/.test(s)) return null;
    let i = 0;
    while (i < s.length) {
      const ai = s.slice(i, i + 2); i += 2;
      if (ai === "01") { out["01"] = s.slice(i, i + 14); i += 14; }
      else if (ai === "17" || ai === "11" || ai === "15") { out[ai] = s.slice(i, i + 6); i += 6; }
      else if (ai === "10" || ai === "21") { let j = s.indexOf("\x1d", i); if (j < 0) j = s.length; out[ai] = s.slice(i, j); i = j + 1; }
      else break;
    }
    return out;
  }
  const gs1Date = v => { const y = 2000 + parseInt(v.slice(0, 2), 10), m = parseInt(v.slice(2, 4), 10), d = parseInt(v.slice(4, 6), 10); return d === 0 ? new Date(y, m, 0) : new Date(y, m - 1, d); };
  const DEMO_SCANS = [
    ["Paracetamol · new batch", `(01)04791111000035(17)${yymmdd(inDays(600))}(10)PC2611`],
    ["Amoxicillin · short expiry", `(01)04791111000042(17)${yymmdd(inDays(120))}(10)AM2603`],
    ["Paracetamol · expired", `(01)04791111000035(17)${yymmdd(inDays(-10))}(10)PC2501`],
    ["Milk powder · plain EAN", "4791111000011"],
    ["Unknown GTIN", `(01)09999999999999(17)${yymmdd(inDays(400))}(10)X1`]
  ];
  function expInfo(iso) {
    if (!iso) return null;
    const d = new Date(iso + "T00:00:00"); const days = Math.round((d - inDays(0)) / 86400000);
    return { days, tone: days < 0 ? "error" : days < 180 ? "warning" : "", label: days < 0 ? `Expired ${-days} days ago` : days < 180 ? `Short expiry · ${days} days` : `${Math.round(days / 30)} months left` };
  }
  const fmtExpIso = iso => { const d = new Date(iso + "T00:00:00"); return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }); };
  function stockBadge(p) {
    if (p.stock <= 0) return ["error", "Out of stock", "alert"];
    if (p.stock <= LOW_STOCK) return ["warning", `Low · ${p.stock}`, "alert"];
    return null;
  }

  const newShift = float => ({ float, start: Date.now(), cashSales: 0, cardSales: 0, qrSales: 0, creditSales: 0, refunds: 0, cashIn: 0, cashOut: 0, count: 0, moves: [] });
  const DISCOUNT_LIMIT = 10; // cashier limit in %, BR-01
  const MANAGER_PIN = "1234";
  const byId = id => PRODUCTS.find(p => p.id === id);

  // ---------- i18n (draft Sinhala/Tamil labels, to be reviewed) ----------
  const T = {
    en: { sell: "Sell", overview: "Overview", orders: "Orders", returns: "Returns", customers: "Customers", products: "Products", stock: "Stock", receiving: "Receiving", expiry: "Expiry", cash: "Cash & shifts", reports: "Reports", tax: "Tax", suppliers: "Suppliers", exceptions: "Exceptions", promotions: "Promotions", staff: "Staff", settings: "Settings", logout: "Logout",
      main: "Main", inventory: "Inventory", finance: "Finance", management: "Management", search: "Scan barcode or search name, generic or SKU…", charge: "Charge", hold: "Hold", discount: "Discount", current: "Current sale", total: "Total", sale: "Sale", ret: "Return", instock: "In stock only", payment: "Payment", addCustomer: "Add customer", whoWorking: "Who's working?", enterPin: "Enter your PIN", signIn: "Sign in", openShift: "Open shift", countFloat: "Count the opening float", openingFloat: "Opening float", signOut: "Sign out", pricecheck: "Price check" },
    si: { sell: "විකිණීම", overview: "දළ විශ්ලේෂණය", orders: "ඇණවුම්", returns: "ආපසු ලැබීම්", customers: "පාරිභෝගිකයින්", products: "නිෂ්පාදන", stock: "තොග", receiving: "භාණ්ඩ ලැබීම", expiry: "කල් ඉකුත්වීම", cash: "මුදල් සහ මුර", reports: "වාර්තා", tax: "බදු", suppliers: "සැපයුම්කරුවන්", promotions: "ප්‍රවර්ධන", staff: "කාර්ය මණ්ඩලය", settings: "සැකසුම්", logout: "ඉවත් වන්න",
      main: "ප්‍රධාන", inventory: "තොග කළමනාකරණය", finance: "මූල්‍ය", management: "කළමනාකරණය", search: "බාර්කෝඩය ස්කෑන් කරන්න හෝ නමින් සොයන්න…", charge: "අය කරන්න", hold: "රඳවන්න", discount: "වට්ටම", current: "වත්මන් විකිණීම", total: "එකතුව", sale: "විකිණීම", ret: "ආපසු", instock: "තොගයේ ඇති ඒවා පමණක්", payment: "ගෙවීම", addCustomer: "පාරිභෝගිකයා එක් කරන්න", whoWorking: "කවුද වැඩ කරන්නේ?", enterPin: "ඔබේ PIN අංකය ඇතුළත් කරන්න", signIn: "පුරන්න", openShift: "මුරය ආරම්භ කරන්න", countFloat: "ආරම්භක මුදල ගණන් කරන්න", openingFloat: "ආරම්භක මුදල", signOut: "ඉවත් වන්න", pricecheck: "මිල පරීක්ෂාව" },
    ta: { sell: "விற்பனை", overview: "கண்ணோட்டம்", orders: "ஆர்டர்கள்", returns: "திருப்பங்கள்", customers: "வாடிக்கையாளர்கள்", products: "பொருட்கள்", stock: "இருப்பு", receiving: "பொருள் பெறுதல்", expiry: "காலாவதி", cash: "பணம் & ஷிஃப்ட்", reports: "அறிக்கைகள்", tax: "வரி", suppliers: "சப்ளையர்கள்", promotions: "சலுகைகள்", staff: "ஊழியர்கள்", settings: "அமைப்புகள்", logout: "வெளியேறு",
      main: "முதன்மை", inventory: "சரக்கு", finance: "நிதி", management: "நிர்வாகம்", search: "பார்கோடை ஸ்கேன் செய்யவும் அல்லது பெயரால் தேடவும்…", charge: "கட்டணம்", hold: "நிறுத்து", discount: "தள்ளுபடி", current: "தற்போதைய விற்பனை", total: "மொத்தம்", sale: "விற்பனை", ret: "திருப்பம்", instock: "இருப்பில் உள்ளவை மட்டும்", payment: "கட்டணம் செலுத்துதல்", addCustomer: "வாடிக்கையாளரைச் சேர்", whoWorking: "யார் பணியில் இருக்கிறார்கள்?", enterPin: "உங்கள் PIN ஐ உள்ளிடவும்", signIn: "உள்நுழை", openShift: "ஷிஃப்ட்டைத் தொடங்கு", countFloat: "தொடக்கப் பணத்தை எண்ணவும்", openingFloat: "தொடக்கப் பணம்", signOut: "வெளியேறு", pricecheck: "விலை சரிபார்ப்பு" }
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
    // Open cash session per cashier (BR-08). Sachini's shift already has a morning of trading.
    shifts: { sk: { float: 500000, start: Date.now() - (3 * 60 + 12) * 60000, cashSales: 3124500, cardSales: 1856000, qrSales: 420000, creditSales: 950000, refunds: 45000, cashIn: 0, cashOut: 150000, count: 86 } },
    su: { sel: 0, pin: "", err: false, tries: {}, locked: {} },   // sign-in screen state
    os: { counts: {}, coins: "" },                                 // open-shift count
    cs: { step: 1, counts: {}, coins: "", reason: "", note: "" },  // close-shift state
    history: null,                                                 // sales on this branch (filled below)
    ret: { query: "", sale: null, qty: {}, reason: "", pin: "", error: "", done: null }, retSeq: 12
  };
  S.history = SEED_SALES.map(s => ({ sync: "synced", ...s, sync: s.sync || "synced", customer: CUSTOMERS[s.customer], lines: s.lines.map(l => ({ ...l })) })).sort((a, b) => b.date - a.date);
  S.shifts.sk.moves = [{ kind: "out", amount: 150000, reason: "Petty cash: transport", note: "Three-wheeler for delivery", time: daysAgo(0, 9, 20), by: "Sachini K." }];
  S.hist = { scope: "register", period: "today", status: "all", q: "", sel: null };
  const emptyGrn = () => ({ supplier: "Hemas Pharmaceuticals", invoice: "", invTotal: "", lines: [], query: "", error: "", posted: null, flash: null });
  S.grn = emptyGrn(); S.grnSeq = 2292;
  S.pc = { query: "", pid: null, error: "", recent: [] };
  // Register status (R-19) and device settings (R-20)
  S.diag = { lastPush: daysAgo(0, 10, 41), lastPull: daysAgo(0, 10, 41), testing: null, scan: "", logsSent: false };
  S.dev = { printer: { conn: "usb", ip: "192.168.1.50", port: "9100", width: "80", raster: true, kick: true, copies: "1" },
    receipt: { h1: "CITY PHARMACY & MART", h2: "No. 12, Galle Road, Colombo 03", footer: "Thank you! Come again", policy: "Returns within 14 days with receipt", lang: "en", logo: true, tax: true, barcode: true },
    scanner: { suffix: "enter", beep: true, prefix: "" },
    display: { theme: "auto", touch: false, lang: "en" }, training: false };
  S.devDraft = JSON.parse(JSON.stringify(S.dev)); S.devTab = "printer";

  // ---------- Catalog admin data (A-20 / A-21) ----------
  const CATS_ADMIN = ["Pharmacy", "Grocery", "Dairy", "Beverages", "Personal care", "Vegetables", "Household"];
  const BRANDS = ["Lanka Pharma", "MediCare Labs", "Pure Dairy", "Golden Grain", "Sparkle Care", "Island Biscuits", "Farm Fresh", "Aqua Pure", "Highland Tea Co.", "Coco Gold", "No brand"];
  const TAX = { std: "VAT standard 18%", exempt: "VAT exempt" };
  const TONES = { Pharmacy: ["pill", "teal"], Grocery: ["wheat", "yellow"], Dairy: ["milk", "blue"], Beverages: ["droplet", "blue"], "Personal care": ["sparkles", "pink"], Vegetables: ["carrot", "orange"], Household: ["package", "purple"] };
  const ADMIN = {
    mp: { brand: "Pure Dairy", si: "කිරි පිටි 400g", ta: "பால் மா 400g", tax: "std", reorder: 10, upd: 2, variants: [["400 g", "MP-400", "4791111000011", 115000], ["1 kg", "MP-1K", "4791111000127", 275000]] },
    br: { brand: "Golden Grain", si: "බාස්මතී සහල් 5kg", ta: "பாஸ்மதி அரிசி 5kg", tax: "exempt", reorder: 8, upd: 6 },
    pc: { brand: "Lanka Pharma", si: "පැරසිටමෝල් 500mg", ta: "பாராசிட்டமால் 500mg", tax: "exempt", reorder: 50, upd: 1, drug: { generic: "Paracetamol", strength: "500 mg", form: "Tablet", schedule: "OTC" } },
    am: { brand: "MediCare Labs", si: "", ta: "", tax: "exempt", reorder: 20, upd: 12, drug: { generic: "Amoxicillin", strength: "500 mg", form: "Capsule", schedule: "Rx" } },
    tp: { brand: "Sparkle Care", tax: "std", reorder: 10, upd: 20 }, sh: { brand: "Sparkle Care", tax: "std", reorder: 6, upd: 3 },
    cc: { brand: "Island Biscuits", tax: "std", reorder: 12, upd: 9 },
    eg: { brand: "Farm Fresh", si: "බිත්තර 10", ta: "முட்டை 10", tax: "exempt", reorder: 10, upd: 1 },
    bw: { brand: "Aqua Pure", si: "බෝතල් කළ ජලය 1.5L", ta: "போத்தல் நீர் 1.5L", tax: "std", reorder: 24, upd: 15, variants: [["500 ml", "BW-05", "4791111000134", 7000], ["1.5 L", "BW-15", "4791111000097", 14000]] },
    ct: { brand: "Highland Tea Co.", si: "ලංකා කළු තේ 200g", ta: "இலங்கை கருப்பு தேநீர் 200g", tax: "std", reorder: 10, upd: 4 },
    co: { brand: "Coco Gold", si: "පොල් තෙල් 1L", ta: "தேங்காய் எண்ணெய் 1L", tax: "std", reorder: 6, upd: 2 },
    ca: { brand: "No brand", si: "කැරට්", ta: "கேரட்", tax: "exempt", reorder: 5, upd: 0 }
  };
  for (const p of PRODUCTS) {
    const a = ADMIN[p.id] || {};
    const sku = (p.meta.split(" · ")[1] || p.id.toUpperCase());
    Object.assign(p, {
      brand: a.brand || "No brand", nameSi: a.si || "", nameTa: a.ta || "", tax: a.tax || "std", reorder: a.reorder || 5, active: true,
      wholesale: Math.round(p.price * 0.93 / 100) * 100, cost: baseCost(p), sku, newPrice: "", newFrom: "",
      variants: (a.variants || [[p.meta.split(" · ")[0], sku, p.code, p.price]]).map(([label, s, bc, pr]) => ({ label, sku: s, barcode: bc, price: pr })),
      drug: a.drug ? { ...a.drug } : null, updated: daysAgo(a.upd || 0, 9, 10),
      log: [{ when: daysAgo(a.upd || 0, 9, 10), who: "Malini J.", what: "Price checked against the supplier list" }, { when: daysAgo(140, 11, 0), who: "Kasun S.", what: "Product created from the Excel import" }]
    });
  }
  S.prod = { q: "", cat: "All", status: "active", low: false, missing: false, picked: [] };
  S.pe = null; // product editor state

  // ---------- Batches for stock & expiry (A-40 / A-45) ----------
  const SEED_LOTS = { mp: [["MP7612", 40, 6], ["MP7701", 300, 18]], am: [["AM2509", -6, 4], ["AM2511", 25, 12], ["AM2604", 400, 44]], eg: [["EG1119", 9, 18], ["EG1124", 14, 12]], ct: [["CT2608", 52, 14], ["CT2703", 290, 30]], cc: [["CC2612", 75, 20], ["CC2703", 180, 32]] };
  for (const p of PRODUCTS) {
    if (p.batches) p.seedLots = p.batches.map(b => { const [m, y] = b.exp.split("/"); return { id: b.id, exp: `${y}-${m}-28`, qty: b.stock, price: b.price }; });
    else p.seedLots = (SEED_LOTS[p.id] || []).map(([id, d, q]) => ({ id, exp: isoDate(inDays(d)), qty: q }));
  }
  const lotsOf = p => [...(p.lots || []), ...(p.seedLots || [])];
  const nearestExp = p => lotsOf(p).filter(l => l.qty > 0 && l.exp).sort((a, b) => a.exp.localeCompare(b.exp))[0] || null;
  const expiringCount = () => PRODUCTS.reduce((a, p) => a + lotsOf(p).filter(l => l.qty > 0 && l.exp && expInfo(l.exp).days <= 30).length, 0);
  const ADJ_REASONS = { out: ["Damaged", "Expired write-off", "Theft or loss", "Count correction", "Returned to supplier", "Own use"], in: ["Found in store", "Count correction", "Customer return without receipt"] };
  const ADJ_LIMIT = 500000; // adjustments above Rs 5,000 at cost need a manager
  S.moves = [];             // stock movements made in this session (INV-04: every change is a movement)
  S.stk = { q: "", cat: "All", filter: "all", branch: "CMB01", open: { am: true } };
  S.exp = { cat: "All" };

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
    return PRODUCTS.filter(p => p.active !== false && (S.cat === "All" || p.cat === S.cat || (S.cat === "Offers" && p.offer))
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
    S.history.unshift({ no: S.last.no, date: S.last.time, customer: S.customer, method: S.pay.method, cashier: S.user.short + " " + S.user.name.split(" ")[1][0] + ".", sync: S.offline ? "waiting" : "synced",
      taxInvoice: S.pay.taxInvoice ? S.last.no.replace(/-(\d+)$/, "-TI-$1") : null, lines: S.cart.map(l => ({ pid: l.pid, qty: l.qty, unit: l.unit, batch: l.batch, exp: l.exp, disc: l.disc, returned: 0 })) });
    const sh = S.shifts[S.user.id];
    if (S.dev.training) { S.history[0].training = true; S.history[0].sync = "synced"; }
    else if (sh) { sh.count++; const key = { cash: "cashSales", card: "cardSales", qr: "qrSales", credit: "creditSales" }[S.pay.method]; if (key) sh[key] += tt.net; }
    S.modal = null; S.view = "complete"; S.countdown = 8; renderModal(); render();
  }
  function applyDiscount(pct, approver) {
    const l = S.cart[S.sel]; if (!l) return;
    l.disc = pct; l.approver = approver || null; closeModal(); render(); toast(`Discount ${pct}% applied${approver ? " · approved by " + approver : ""}`);
  }

  // ---------- Render: shell ----------
  const NAV = [
    ["main", [["overview", "dashboard", "dashboard"], ["sell", "cart", "sell"], ["pricecheck", "tag"], ["orders", "receipt"], ["returns", "undo"], ["customers", "users"]]],
    ["inventory", [["products", "package"], ["stock", "warehouse"], ["receiving", "truck"], ["expiry", "calendar", null, "23"]]],
    ["finance", [["cash", "wallet"], ["exceptions", "alert"], ["reports", "chart"], ["tax", "landmark"]]],
    ["management", [["suppliers", "store"], ["promotions", "percent"], ["staff", "userCog"]]]
  ];
  function sidebar() {
    const cur = S.view === "complete" ? "sell" : S.view === "product" || S.view === "import" ? "products" : S.view === "counts" ? "stock" : S.view === "customer" ? "customers" : S.view === "shifts" ? "cash" : S.view === "vat" ? "tax" : S.view;
    let h = `<aside class="sidebar" aria-label="Main navigation"><div class="brand"><span class="mark">R</span><span class="brand-name">RetailOS</span><button class="icon-btn" data-act="collapse" title="Collapse sidebar">${ic("panel")}</button></div><nav>`;
    for (const [g, items] of NAV) {
      h += `<div class="nav-label">${t(g)}</div>`;
      for (const [key, icon, view, count0] of items) {
        const v = view || key, count = key === "expiry" ? (expiringCount() || "") : key === "exceptions" ? (excOpen() || "") : key === "cash" && S.user.role === "Manager" ? (srPending() || "") : count0;
        h += `<button class="nav-item ${cur === v ? "active" : ""}" data-act="nav" data-view="${v}" title="${esc(t(key))}" ${cur === v ? 'aria-current="page"' : ""}>${ic(icon)}<span class="lbl">${esc(t(key))}</span>${count ? `<span class="count">${count}</span>` : ""}</button>`;
      }
    }
    h += `</nav><div class="side-spacer"></div>
      <button class="nav-item ${cur === "status" ? "active" : ""}" data-act="nav" data-view="status" title="Status & diagnostics">${ic("activity")}<span class="lbl">Status</span>${S.history.some(s => s.sync === "error") ? `<span class="count" style="background:var(--error);color:#fff">!</span>` : ""}</button>
      <button class="nav-item ${cur === "settings" ? "active" : ""}" data-act="nav" data-view="settings" title="${esc(t("settings"))}">${ic("settings")}<span class="lbl">${esc(t("settings"))}</span>${S.dev.training ? `<span class="count">TRAINING</span>` : ""}</button>
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
    const sb = stockBadge(p), b0 = sb || p.badge;
    const bd = b0 ? badge(b0[0], b0[1], b0[2]) : "";
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
        <div class="two"><button class="btn secondary" data-act="hold">${esc(t("hold"))} <kbd>F6</kbd></button><button class="btn secondary" data-act="discount">${esc(t("discount"))} <kbd>F5</kbd></button><button class="btn secondary" data-act="cash-move" title="Cash in / out">${ic("wallet", 18)}<kbd>F9</kbd></button></div></div>
    </aside>`;
  }

  // ---------- Render: Sale complete ----------
  function receiptText(s) {
    const W = S.dev.printer.width === "58" ? 32 : 40, L2 = (l, r) => l + r.padStart(Math.max(1, W - l.length)), C = x => " ".repeat(Math.max(0, Math.floor((W - x.length) / 2))) + x, D = "-".repeat(W);
    const n = c => (c / 100).toLocaleString("en-US", { minimumFractionDigits: 2 });
    const out = [C(S.dev.receipt.h1), C(S.dev.receipt.h2), C("VAT Reg: 123456789-7000"), ...(S.dev.training ? [C("*** TRAINING · NOT A RECEIPT ***")] : []), D, "Receipt: " + s.no, "Date: " + s.time.toLocaleDateString("en-GB") + " " + s.time.toTimeString().slice(0, 5) + "  Cashier: Sachini", D];
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
          ${attn("Sale exceptions", "Negative stock, price mismatch", "alert", "tile-orange", "warning", String(excOpen()), "exceptions")}
          ${attn("Shift differences", `${srPending()} shift${srPending() === 1 ? "" : "s"} waiting for approval`, "wallet", "tile-orange", "warning", String(srPending()), "shifts")}
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
  function signOut() { if (S.cs.step === 3) resetCs(); S.view = "signin"; S.su.sel = Math.max(0, USERS.indexOf(S.user)); S.su.pin = ""; S.su.err = false; S.modal = null; renderModal(); render(); }

  const countTotal = st => DENOMS.reduce((a, d) => a + d * (st.counts[d] || 0), 0) + Math.round((parseFloat(st.coins) || 0) * 100);
  const floatTotal = () => countTotal(S.os);
  // Shared cash counter used by Open shift (scope "os") and Close shift (scope "cs")
  function denomRows(st, scope) {
    const coins = Math.round((parseFloat(st.coins) || 0) * 100);
    return DENOMS.map(d => { const n = st.counts[d] || 0; return `<div class="den-row"><span class="note-chip"><i style="background:${NOTE_COLORS[d]}"></i><b>Rs ${(d / 100).toLocaleString("en-US")}</b></span>
      <div class="stepper"><button data-act="den-dec" data-scope="${scope}" data-d="${d}" aria-label="One less Rs ${d / 100} note">${ic("minus", 16)}</button><input inputmode="numeric" data-den="${d}" data-scope="${scope}" data-fid="${scope}-den-${d}" value="${n}" aria-label="Number of Rs ${d / 100} notes"><button data-act="den-inc" data-scope="${scope}" data-d="${d}" aria-label="One more Rs ${d / 100} note">${ic("plus", 16)}</button></div>
      <span class="amt ${n ? "on" : ""}">${fmt(d * n)}</span></div>`; }).join("") +
      `<div class="den-row"><span class="note-chip"><i style="background:var(--text-3);border-radius:50%;width:18px"></i><b>Coins</b></span><label class="voucher" style="max-width:200px">Rs<input data-coins data-scope="${scope}" data-fid="${scope}-coins" inputmode="decimal" value="${esc(st.coins)}" placeholder="0.00" aria-label="Total value of coins"></label><span class="amt ${coins ? "on" : ""}">${fmt(coins)}</span></div>`;
  }
  function openShiftView() {
    const total = floatTotal(); const usual = 500000;
    const diff = total - usual;
    return `<div class="shift">
      <section class="card" aria-labelledby="cf"><div class="card-head"><h2 id="cf">${esc(t("countFloat"))}</h2><span class="legend">Notes and coins placed in the drawer</span></div>
        ${denomRows(S.os, "os")}
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
    S.shifts[S.user.id] = newShift(total);
    S.os = { counts: {}, coins: "" };
    S.view = "sell"; S.cart = []; S.sel = 0; S.customer = CUSTOMERS[0];
    render(); toast(`Shift opened with ${fmt(total)} · CMB01 · R02`); focusSearch();
  }

  // ---------- Returns (R-13) ----------
  const unitNet = l => Math.round(l.unit * (100 - l.disc) / 100);
  const saleTotal = s => s.lines.reduce((a, l) => a + Math.round(l.qty * l.unit * (100 - l.disc) / 100), 0);
  const ageDays = s => Math.floor((Date.now() - s.date.getTime()) / 86400000);
  const fmtDate = d => d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) + ", " + d.toTimeString().slice(0, 5);
  const METHOD = { cash: ["Cash", "cash"], card: ["Card", "card"], qr: ["LankaQR", "qr"], credit: ["Credit", "wallet"] };
  const remaining = l => Math.round((l.qty - l.returned) * 1000) / 1000;
  function findSale(q) {
    const c = q.trim().toUpperCase().replace(/\s+/g, "");
    if (!c) return null;
    return S.history.find(s => s.no === c) || (c.length >= 3 ? S.history.find(s => s.no.endsWith(c.padStart(6, "0")) || s.no.endsWith(c)) : null);
  }
  function retTotals() {
    const s = S.ret.sale; let items = 0, amount = 0;
    if (s) s.lines.forEach((l, i) => { const q = S.ret.qty[i] || 0; if (q) { items += byId(l.pid).weighed ? 1 : q; amount += Math.round(unitNet(l) * q); } });
    return { items, amount };
  }
  const needManager = () => { const s = S.ret.sale; return !!s && S.user.role !== "Manager" && (retTotals().amount > REFUND_LIMIT || ageDays(s) > RETURN_DAYS); };
  function loadSale(q) {
    const s = findSale(q);
    if (!s) { S.ret.error = `No sale found for “${q}”. Check the number on the receipt, or scan its barcode.`; render(); return; }
    S.ret = { query: "", sale: s, qty: {}, reason: "", pin: "", error: "", done: null };
    render();
    // Move focus off the receipt field so number keys go to quantities / manager PIN
    setTimeout(() => { const b = app.querySelector('[data-act="ret-inc"], [data-act="ret-toggle"]'); if (b) b.focus(); else if (document.activeElement) document.activeElement.blur(); });
  }
  function returnsView() {
    const r = S.ret, s = r.sale;
    if (r.done) return returnDoneView();
    const recent = S.history.slice(0, 6);
    const left = `<section class="products" aria-label="Find the original sale">
      <div class="search-row"><label class="search ${r.error ? "error" : ""}">${ic("receipt")}<span class="sr">Receipt number</span><input id="rsearch" data-fid="rsearch" autocomplete="off" placeholder="Scan the receipt barcode or type the receipt number (e.g. 154)" value="${esc(r.query)}">${ic("scan", 20, "scan")}<kbd>Enter</kbd></label></div>
      ${r.error ? `<div class="scan-error" role="alert">${ic("alert", 18)}${esc(r.error)}</div>` : ""}
      ${s ? saleDetail(s) : `<div class="card"><div class="card-head"><h2>Recent receipts</h2><span class="legend">This branch · newest first</span></div><div class="opt-list">${recent.map(x => `<button class="opt" data-act="ret-load" data-no="${x.no}"><span class="thumb tile-blue" style="width:40px;height:40px">${ic("receipt", 20)}</span><span class="grow"><b>${x.no}</b><small>${fmtDate(x.date)} · ${esc(x.customer.name)} · ${x.lines.length} items · ${METHOD[x.method][0]}</small></span>${ageDays(x) > RETURN_DAYS ? badge("warning", `${ageDays(x)} days old`, "clock") : ""}${x.lines.some(l => l.returned) ? badge("", "Part returned", "undo") : ""}<b>${fmt(saleTotal(x))}</b></button>`).join("")}</div></div>
        <div class="note">${ic("help", 16)}No receipt? A manager can approve a return by scanning the product instead (not in this prototype).</div>`}
    </section>`;
    const right = s ? returnPanel(s) : `<aside class="order"><div class="empty" style="flex:1"><span class="circle">${ic("undo", 28)}</span><h3>Find the original sale</h3><span>Returns are always linked to the original receipt. The refund uses the price the customer paid, and the stock goes back to the same batch.</span></div></aside>`;
    return `<div class="body">${left}${right}</div>`;
  }
  function saleDetail(s) {
    const old = ageDays(s) > RETURN_DAYS;
    return `<div class="card">
      <div class="card-head"><h2>${s.no}</h2>${s.taxInvoice ? badge("info", "Tax invoice " + s.taxInvoice.split("-").pop(), "receipt") : ""}<button class="btn ghost s" data-act="ret-clear">${ic("x", 16)}Change receipt</button></div>
      <dl class="kv sale-meta"><dt>Date</dt><dt>Customer</dt><dt>Paid by</dt><dt>Cashier</dt><dd>${fmtDate(s.date)}</dd><dd>${esc(s.customer.name)}</dd><dd>${METHOD[s.method][0]}</dd><dd>${esc(s.cashier)}</dd></dl>
      ${old ? `<div class="banner">${ic("clock")}This sale is ${ageDays(s)} days old. The return window is ${RETURN_DAYS} days, so a manager PIN is needed.</div>` : ""}
      <div class="rtable" role="table" aria-label="Items on the receipt">
        <div class="rrow head" role="row"><span>Item</span><span class="c">Sold</span><span class="c">Returned</span><span class="c">Return now</span><span class="r">Refund</span></div>
        ${s.lines.map((l, i) => { const p = byId(l.pid), left = remaining(l), q = S.ret.qty[i] || 0, w = p.weighed;
          return `<div class="rrow ${q ? "on" : ""}" role="row"><span class="item"><span class="thumb tile-${p.tone}">${ic(p.icon, 20)}</span><span style="min-width:0"><b>${esc(p.name)}</b><small>${l.batch ? `Batch ${l.batch} · exp ${l.exp} · ` : ""}${fmt(unitNet(l))}${w ? " per line" : " each"}${l.disc ? ` (−${l.disc}%)` : ""}</small></span></span>
            <span class="c">${w ? l.qty.toFixed(3) : l.qty}</span><span class="c ${l.returned ? "" : "muted"}">${l.returned ? (w ? l.returned.toFixed(3) : l.returned) : "—"}</span>
            <span class="c">${left <= 0 ? `<span class="badge">All returned</span>` : w
              ? `<button class="chip" data-act="ret-toggle" data-i="${i}" aria-pressed="${q > 0}">${q ? "Returning" : "Return all"}</button>`
              : `<div class="stepper"><button data-act="ret-dec" data-i="${i}" aria-label="Return one less">${ic("minus", 16)}</button><span>${q}</span><button data-act="ret-inc" data-i="${i}" aria-label="Return one more" ${q >= left ? "disabled" : ""}>${ic("plus", 16)}</button></div>`}</span>
            <span class="r">${q ? fmt(Math.round(unitNet(l) * q)) : "—"}</span></div>`; }).join("")}
      </div>
      <div style="display:flex;gap:8px"><button class="btn secondary s" data-act="ret-all">${ic("undo", 16)}Return everything left</button>${Object.values(S.ret.qty).some(Boolean) ? `<button class="btn ghost s" data-act="ret-none">Clear</button>` : ""}</div>
    </div>`;
  }
  function returnPanel(s) {
    const r = S.ret, tt = retTotals(), mgr = needManager(), m = METHOD[s.method];
    const ready = tt.items > 0 && r.reason && (!mgr || r.pin.length === 4);
    return `<aside class="order" aria-label="Refund">
      <div class="order-head"><div class="order-title"><div style="flex:1"><h2>Refund</h2><div class="sub">Return against ${s.no}</div></div>
        <div class="seg" role="group" aria-label="Sale or return"><button data-act="mode" data-mode="sale" aria-pressed="false">${esc(t("sale"))}</button><button aria-pressed="true">${esc(t("ret"))}</button></div></div></div>
      <div class="panel-body">
        <div class="field">Reason<div class="chips wrap">${["Damaged", "Expired", "Wrong item", "Changed mind", "Other"].map(x => `<button class="chip" data-act="ret-reason" data-v="${x}" aria-pressed="${r.reason === x}">${x}</button>`).join("")}</div></div>
        <div class="field">Refund method<div class="opt-list">
          <button class="opt" aria-selected="true">${ic(m[1])}<span class="grow"><b>Original payment · ${m[0]}</b><small>${s.method === "cash" ? "Pay back from the cash drawer" : s.method === "credit" ? "Reduce the customer's credit balance" : "Refund to the same card / account on the terminal"}</small></span></button>
          <button class="opt" disabled>${ic("gift")}<span class="grow"><b>Store credit</b><small>Coming in release 3</small></span></button></div></div>
        ${tt.items && mgr ? `<div class="mgr"><div class="head">${ic("lock", 18)}Manager approval needed · ${ageDays(s) > RETURN_DAYS ? "outside the return window" : "refund above " + fmt(REFUND_LIMIT)}</div>
          <div class="pin-dots">${[0, 1, 2, 3].map(i => `<i class="${r.pin.length > i ? "on" : ""}"></i>`).join("")}</div>
          <div class="keypad">${["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "⌫"].map(k => `<button data-act="ret-pin" data-k="${k}" aria-label="${k === "⌫" ? "Backspace" : k === "C" ? "Clear" : k}">${k === "⌫" ? ic("backspace", 22) : k}</button>`).join("")}</div>
          ${r.pinError ? `<div class="scan-error" role="alert">${ic("alert", 16)}Wrong manager PIN</div>` : `<div class="note">Demo manager PIN: 1234 (Malini)</div>`}</div>` : ""}
        <div class="note">${ic("package", 16)}Items go back to their original batch${s.taxInvoice ? ` · a credit note is issued against ${s.taxInvoice}` : ""}</div>
      </div>
      <div class="summary-wrap"><div class="summary"><div class="r"><span>Items returned</span><b>${tt.items}</b></div><div class="r"><span>Refund to</span><b>${m[0]}</b></div><hr><div class="total"><span>Refund</span><span>${fmt(tt.amount)}</span></div></div></div>
      <div class="order-foot"><button class="btn primary l block" data-act="ret-approve" ${ready ? "" : "disabled"}>${ic("check")}${mgr ? "Approve & refund" : "Refund"} ${fmt(tt.amount)} <kbd>Enter</kbd></button>
        ${tt.items && !r.reason ? `<div class="note" style="justify-content:center">Choose a reason to continue</div>` : !tt.items ? `<div class="note" style="justify-content:center">Choose what the customer is returning</div>` : ""}</div>
    </aside>`;
  }
  function approveReturn() {
    const r = S.ret, s = r.sale; if (!s) return;
    const tt = retTotals(), mgr = needManager();
    if (!tt.items) { toast("Choose what the customer is returning", { error: true }); return; }
    if (!r.reason) { toast("Choose a reason", { error: true }); return; }
    if (mgr && r.pin !== MANAGER_PIN) { r.pin = ""; r.pinError = true; render(); return; }
    const lines = [];
    s.lines.forEach((l, i) => { const q = r.qty[i] || 0; if (q) { l.returned = Math.round((l.returned + q) * 1000) / 1000; lines.push({ ...l, q }); } });
    const sh = S.shifts[S.user.id]; if (sh && s.method === "cash") sh.refunds += tt.amount;
    S.retSeq++;
    r.done = { no: `CMB01-R02-RT-${String(S.retSeq).padStart(6, "0")}`, creditNote: s.taxInvoice ? `CMB01-R02-CN-${String(S.retSeq).padStart(6, "0")}` : null, amount: tt.amount, items: tt.items, sale: s, lines, reason: r.reason, approver: mgr ? "Malini J. (Manager)" : null, time: new Date() };
    if (r.done.creditNote) S.tax.docs.push({ no: r.done.creditNote, type: "CN", date: new Date(), fromReturn: true, buyer: s.buyer || { name: s.customer.name, vat: s.customer.vat || "", address: s.customer.address || "" }, ref: s.taxInvoice, reason: "Goods returned · " + r.reason, by: meShort(),
      lines: s.lines.map((l, i) => r.qty[i] ? { pid: l.pid, name: byId(l.pid).name, qty: r.qty[i], unit: l.unit, disc: l.disc, tax: byId(l.pid).tax, src: i } : null).filter(Boolean) });
    if (S.offline) S.waiting++;
    render(); toast(`Refund ${fmt(tt.amount)} recorded`);
  }
  function returnSlip(d) {
    const W = 40, L2 = (l, r) => l + r.padStart(Math.max(1, W - l.length)), C = x => " ".repeat(Math.max(0, Math.floor((W - x.length) / 2))) + x, D = "-".repeat(W);
    const n = c => (c / 100).toLocaleString("en-US", { minimumFractionDigits: 2 });
    const out = [C("CITY PHARMACY & MART"), C(d.creditNote ? "CREDIT NOTE / RETURN" : "RETURN SLIP"), D, "Return:   " + d.no, ...(d.creditNote ? ["Credit note: " + d.creditNote, "For invoice: " + d.sale.taxInvoice] : []), "Original: " + d.sale.no, "Date: " + d.time.toLocaleDateString("en-GB") + " " + d.time.toTimeString().slice(0, 5), "Reason: " + d.reason, D];
    for (const l of d.lines) { const p = byId(l.pid); out.push(p.name + (l.batch ? "  " + l.batch : "")); out.push(L2(byId(l.pid).weighed ? `  ${l.q.toFixed(3)} kg` : `  ${l.q} x ${n(unitNet(l))}`, "-" + n(Math.round(unitNet(l) * l.q)))); }
    out.push(D, L2("REFUND", "Rs " + n(d.amount)), L2("Paid back by", METHOD[d.sale.method][0]), L2("  incl. VAT 18%", n(Math.round(d.amount * 18 / 118))));
    if (d.approver) out.push("Approved by: " + d.approver);
    out.push(D, "Customer signature:", "", "______________________________", "", C("Thank you"));
    return out.join("\n");
  }
  function returnDoneView() {
    const d = S.ret.done, cash = d.sale.method === "cash";
    return `<div class="body"><section class="complete" aria-live="polite">
      <div class="success-mark"><div>${ic("undo", 40)}</div></div>
      <h1>Refund complete</h1><div class="sub">${d.no} · ${d.items} item${d.items === 1 ? "" : "s"} · ${esc(d.reason)}${d.approver ? " · approved by " + esc(d.approver) : ""}</div>
      <div class="change-card"><span>${cash ? "Give back in cash" : "Refunded to " + METHOD[d.sale.method][0]}</span><b>${fmt(d.amount)}</b></div>
      ${d.creditNote ? badge("info", "Credit note " + d.creditNote + " issued", "receipt") : ""}
      <div class="actions"><button class="btn primary l" data-act="ret-new">New return <kbd>Enter</kbd></button><button class="btn secondary l" data-act="nav" data-view="sell">${ic("cart")}Back to Sell</button><button class="btn ghost l" data-act="reprint">${ic("printer")}Reprint slip</button></div>
      <div>${S.offline ? badge("warning", "Saved offline · will sync automatically", "wifiOff") : badge("success", "Synced " + new Date().toTimeString().slice(0, 5), "cloudCheck")}</div>
    </section><aside class="receipt-panel" aria-label="Return slip preview"><div class="head"><span>Return slip</span>${badge("", "80 mm", null)}</div><div class="paper">${esc(returnSlip(d))}</div></aside></div>`;
  }
  function goReturns() { S.view = "returns"; S.modal = null; renderModal(); render(); setTimeout(() => { const x = document.getElementById("rsearch"); if (x && !S.ret.sale) x.focus(); }); }

  // ---------- Close shift (R-16) ----------
  const expectedCash = sh => sh.float + sh.cashSales - sh.refunds + sh.cashIn - sh.cashOut;
  function stepbar(step) {
    return `<div class="stepbar" aria-label="Steps">${["Count cash", "Review", "Z-report"].map((x, i) => `<span class="${i + 1 === step ? "on" : i + 1 < step ? "done" : ""}"><i>${i + 1 < step ? "✓" : i + 1}</i>${x}</span>`).join("")}</div>`;
  }
  function closeShiftView() {
    const cs = S.cs;
    if (cs.step === 3 && cs.z) return zView();
    const sh = S.shifts[S.user.id];
    if (!sh) return `<div class="placeholder"><div class="empty"><span class="circle">${ic("wallet", 28)}</span><h3>No open shift for ${esc(S.user.short)}</h3><span>Open a shift to start selling.</span><button class="btn primary s" data-act="nav" data-view="openshift">${esc(t("openShift"))}</button></div></div>`;
    const counted = countTotal(cs), exp = expectedCash(sh), diff = counted - exp;
    const blockers = [];
    if (S.cart.length) blockers.push(`<div class="banner">${ic("cart")}There is an unfinished sale with ${S.cart.length} item${S.cart.length === 1 ? "" : "s"}. Finish it or hold it before closing.<button class="btn secondary" data-act="nav" data-view="sell">Go to Sell</button><button class="btn secondary" data-act="hold">Hold it (F6)</button></div>`);
    if (S.held.length) blockers.push(`<div class="banner">${ic("clock")}${S.held.length} held bill${S.held.length === 1 ? "" : "s"} on this register. Resume or discard ${S.held.length === 1 ? "it" : "them"} first.<button class="btn secondary" data-act="open-held">Held bills (F7)</button></div>`);
    const head = `<div class="blockers">${stepbar(cs.step)}${blockers.join("")}</div>`;
    if (cs.step === 1) {
      return `<div class="shift">${head}
        <section class="card" aria-labelledby="cc"><div class="card-head"><h2 id="cc">Count the cash in the drawer</h2><span class="legend">Blind count: the expected amount is hidden until you confirm</span></div>${denomRows(cs, "cs")}
          <div class="note">${ic("card", 16)}Card and LankaQR totals come from the terminal settlement, so only cash is counted here.</div></section>
        <aside class="card shift-sum"><span class="sub">Counted cash</span><div class="float ${counted ? "" : "zero"}">${fmt(counted)}</div>
          <div class="blind">${ic("lock", 22)}Expected amount and difference appear after you confirm the count.</div>
          <dl class="kv"><dt>Cashier</dt><dd>${esc(S.user.name)}</dd><dt>Shift started</dt><dd>${new Date(sh.start).toTimeString().slice(0, 5)} · ${shiftLabel().replace("Shift ", "")}</dd><dt>Sales</dt><dd>${sh.count}</dd></dl>
          <button class="btn primary l block" data-act="cs-confirm" ${counted > 0 && !blockers.length ? "" : "disabled"}>Confirm count ${ic("arrowRight")}<kbd>Enter</kbd></button>
          <button class="btn secondary block" data-act="cash-move">${ic("wallet", 18)}Cash in / out first <kbd>F9</kbd></button>
          <button class="btn ghost block" data-act="nav" data-view="sell">Cancel · back to Sell</button></aside></div>`;
    }
    const big = Math.abs(diff) > CS_THRESHOLD;
    const cls = diff === 0 ? "zero" : diff < 0 ? "short" : "over";
    return `<div class="shift">${head}
      <section style="display:flex;flex-direction:column;gap:20px;min-width:0">
        <div class="card"><h2>Cash in the drawer</h2><div class="ledger">
          <div><span>Opening float</span><b>${fmt(sh.float)}</b></div><div><span>Cash sales</span><b>${fmt(sh.cashSales)}</b></div>
          <div class="neg"><span>Cash refunds</span><b>−${fmt(sh.refunds)}</b></div><div><span>Cash in</span><b>${fmt(sh.cashIn)}</b></div>
          <div class="neg"><span>Cash out (petty cash, safe drops)</span><b>−${fmt(sh.cashOut)}</b></div>
          <div class="sum"><span>Expected cash</span><b>${fmt(exp)}</b></div><div class="sum"><span>Counted cash</span><b>${fmt(counted)}</b></div></div></div>
        <div class="card"><h2>All payments this shift</h2><div class="ledger">
          <div><span>Cash</span><b>${fmt(sh.cashSales)}</b></div><div><span>Card</span><b>${fmt(sh.cardSales)}</b></div><div><span>LankaQR</span><b>${fmt(sh.qrSales)}</b></div><div><span>Customer credit</span><b>${fmt(sh.creditSales)}</b></div>
          <div class="sum"><span>Total sales · ${sh.count} transactions</span><b>${fmt(sh.cashSales + sh.cardSales + sh.qrSales + sh.creditSales)}</b></div></div></div>
      </section>
      <aside class="card shift-sum"><span class="sub">Difference</span><div class="diff ${cls}">${diff === 0 ? "Exact" : (diff < 0 ? "−" : "+") + fmt(Math.abs(diff))}</div>
        <div class="sub">${diff === 0 ? "The drawer matches the expected cash." : diff < 0 ? "The drawer is short." : "The drawer has more cash than expected."}</div>
        ${big ? `<div class="banner ${diff < 0 ? "error" : ""}">${ic("alert")}Over ${fmt(CS_THRESHOLD)}. Give a reason; the manager reviews this shift.</div>
          <div class="field">Reason<div class="chips wrap">${["Counting error", "Wrong change given", "Petty cash not recorded", "Other"].map(x => `<button class="chip" data-act="cs-reason" data-v="${x}" aria-pressed="${cs.reason === x}">${x}</button>`).join("")}</div></div>
          <label class="field">Note (optional)<textarea id="csnote" data-fid="csnote" placeholder="What happened?">${esc(cs.note)}</textarea></label>` : ""}
        <button class="btn primary l block" data-act="cs-close" ${big && !cs.reason ? "disabled" : ""}>${ic("printer")}Close shift &amp; print Z-report <kbd>Enter</kbd></button>
        <button class="btn secondary block" data-act="cs-back">Recount</button></aside></div>`;
  }
  function closeShiftNow() {
    const sh = S.shifts[S.user.id], cs = S.cs; if (!sh) return;
    const counted = countTotal(cs), exp = expectedCash(sh), diff = counted - exp;
    if (Math.abs(diff) > CS_THRESHOLD && !cs.reason) { toast("Choose a reason for the difference", { error: true }); return; }
    cs.z = { sh: { ...sh }, counted, exp, diff, reason: cs.reason, note: cs.note, user: S.user, closed: new Date(), no: "Z-CMB01-R02-" + String(318 + Object.keys(S.shifts).length).padStart(4, "0") };
    delete S.shifts[S.user.id];
    S.sr.list.unshift({ id: "SH-" + String(322 + S.sr.list.length).padStart(4, "0"), branch: "CMB01", reg: "R02", cashier: S.user.name, opened: new Date(sh.start), closed: cs.z.closed, float: sh.float, cashSales: sh.cashSales, refunds: sh.refunds, cashIn: sh.cashIn, cashOut: sh.cashOut, card: sh.cardSales, qr: sh.qrSales, credit: sh.creditSales, count: sh.count, counted, reason: cs.reason, cnote: cs.note, status: Math.abs(diff) > CS_THRESHOLD ? "review" : "approved", by: Math.abs(diff) > CS_THRESHOLD ? null : "Auto", mnote: Math.abs(diff) > CS_THRESHOLD ? "" : "Within Rs 500 · approved automatically (BR-08)", at: Math.abs(diff) > CS_THRESHOLD ? null : new Date(), moves: (sh.moves || []).map(m => [m.kind === "in" ? "in" : "out", m.amount, m.reason, hm(m.time)]) });
    cs.step = 3; render(); toast(`Shift closed · Z-report printed${Math.abs(diff) > CS_THRESHOLD ? " · sent for manager review" : ""}`);
  }
  function zText(z) {
    const W = 40, L2 = (l, r) => l + r.padStart(Math.max(1, W - l.length)), C = x => " ".repeat(Math.max(0, Math.floor((W - x.length) / 2))) + x, D = "-".repeat(W);
    const n = c => (c < 0 ? "-" : "") + (Math.abs(c) / 100).toLocaleString("en-US", { minimumFractionDigits: 2 });
    const sh = z.sh, total = sh.cashSales + sh.cardSales + sh.qrSales + sh.creditSales;
    return [C("CITY PHARMACY & MART"), C("Z-REPORT · SHIFT CLOSE"), D, "Report:   " + z.no, "Register: " + (z.reg || "CMB01 · R02"), "Cashier:  " + z.user.name,
      "Opened:   " + new Date(sh.start).toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" }), "Closed:   " + z.closed.toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" }), D,
      L2("Transactions", String(sh.count)), L2("Cash sales", n(sh.cashSales)), L2("Card", n(sh.cardSales)), L2("LankaQR", n(sh.qrSales)), L2("Customer credit", n(sh.creditSales)), L2("TOTAL SALES", "Rs " + n(total)),
      L2("  incl. VAT 18%", n(Math.round(total * 18 / 118))), D, L2("Opening float", n(sh.float)), L2("Cash refunds", n(-sh.refunds)), L2("Cash in", n(sh.cashIn)), L2("Cash out", n(-sh.cashOut)),
      L2("EXPECTED CASH", n(z.exp)), L2("COUNTED CASH", n(z.counted)), L2("DIFFERENCE", (z.diff > 0 ? "+" : "") + n(z.diff)), ...(z.reason ? ["Reason: " + z.reason] : []), D, "Cashier signature:", "", "______________________________", "", C("End of report")].join("\n");
  }
  function zView() {
    const z = S.cs.z, cls = z.diff === 0 ? "zero" : z.diff < 0 ? "short" : "over";
    return `<div class="body"><section class="complete">
      ${stepbar(4)}
      <div class="success-mark"><div>${ic("check", 44)}</div></div>
      <h1>Shift closed</h1><div class="sub">${z.no} · ${esc(z.user.name)} · ${z.sh.count} sales</div>
      <div class="change-card"><span>Difference</span><b class="diff ${cls}" style="font-size:40px">${z.diff === 0 ? "Exact" : (z.diff < 0 ? "−" : "+") + fmt(Math.abs(z.diff))}</b></div>
      ${Math.abs(z.diff) > CS_THRESHOLD ? badge("warning", "Sent to the manager for review", "alert") : badge("success", "No review needed", "check")}
      <div class="actions"><button class="btn primary l" data-act="logout">${ic("logout")}${esc(t("signOut"))} <kbd>Enter</kbd></button><button class="btn secondary l" data-act="reprint">${ic("printer")}Print again</button></div>
    </section><aside class="receipt-panel" aria-label="Z-report preview"><div class="head"><span>Z-report</span>${badge("", "80 mm", null)}</div><div class="paper">${esc(zText(z))}</div></aside></div>`;
  }

  // ---------- Sales history (R-14) ----------
  const dayDiff = d => { const a = new Date(); a.setHours(0, 0, 0, 0); const b = new Date(d); b.setHours(0, 0, 0, 0); return Math.round((a - b) / 86400000); };
  const retState = s => { const sold = s.lines.reduce((a, l) => a + l.qty, 0), ret = s.lines.reduce((a, l) => a + l.returned, 0); return ret <= 0 ? null : ret >= sold ? "Returned" : "Part returned"; };
  function histList() {
    const h = S.hist, q = h.q.trim().toLowerCase();
    return S.history.filter(s => {
      if (h.scope === "register" && !s.no.includes("-R02-")) return false;
      const dd = dayDiff(s.date);
      if (h.period === "today" && dd !== 0) return false;
      if (h.period === "yesterday" && dd !== 1) return false;
      if (h.period === "week" && dd > 6) return false;
      if (h.status === "waiting" && s.sync !== "waiting" && s.sync !== "error") return false;
      if (h.status === "returns" && !retState(s)) return false;
      if (q && !(s.no.toLowerCase().includes(q) || s.customer.name.toLowerCase().includes(q) || s.cashier.toLowerCase().includes(q))) return false;
      return true;
    });
  }
  const syncBadge = s => s.sync === "error" ? badge("error", "Not synced", "alert") : s.sync === "waiting" ? badge("warning", "Waiting", "wifiOff") : badge("success", "Synced", "cloudCheck");
  function historyView() {
    const h = S.hist, list = histList(), total = list.reduce((a, s) => a + saleTotal(s), 0);
    const sel = list.find(s => s.no === h.sel) || null;
    const chip = (act, v, cur, label) => `<button class="chip" data-act="${act}" data-v="${v}" aria-pressed="${cur === v}">${label}</button>`;
    const errors = S.history.filter(s => s.sync === "error" || s.sync === "waiting").length;
    const left = `<section class="products" aria-label="Sales">
      <div class="search-row"><label class="search">${ic("search")}<span class="sr">Search sales</span><input id="hsearch" data-fid="hsearch" autocomplete="off" placeholder="Search receipt number, customer or cashier…" value="${esc(h.q)}"><kbd>/</kbd></label></div>
      <div class="filters">
        <div class="seg" role="group" aria-label="Register">${[["register", "This register (R02)"], ["branch", "Whole branch"]].map(([v, l]) => `<button data-act="h-scope" data-v="${v}" aria-pressed="${h.scope === v}">${l}</button>`).join("")}</div>
        <div class="chips">${chip("h-period", "today", h.period, "Today")}${chip("h-period", "yesterday", h.period, "Yesterday")}${chip("h-period", "week", h.period, "Last 7 days")}</div>
        <div class="chips">${chip("h-status", "all", h.status, "All")}${chip("h-status", "waiting", h.status, `Not synced${errors ? " · " + errors : ""}`)}${chip("h-status", "returns", h.status, "With returns")}</div>
      </div>
      <div class="stats"><div class="stat"><span>Sales</span><b>${list.length}</b></div><div class="stat"><span>Total</span><b>${fmt(total)}</b></div><div class="stat"><span>Average basket</span><b>${fmt(list.length ? Math.round(total / list.length) : 0)}</b></div></div>
      ${list.length ? `<div class="htable" role="listbox" aria-label="Sales list">
        <div class="hrow head" aria-hidden="true"><span>Time</span><span>Receipt</span><span class="c">Items</span><span class="m">Paid by</span><span class="amt">Total</span><span class="st">Status</span></div>
        ${list.map(s => { const rs = retState(s); return `<button class="hrow" role="option" aria-selected="${s.no === h.sel}" data-act="h-sel" data-no="${s.no}">
          <span class="t">${dayDiff(s.date) ? s.date.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : s.date.toTimeString().slice(0, 5)}</span>
          <span class="no"><b>${s.no}</b><small>${esc(s.customer.name)} · ${esc(s.cashier)}</small></span><span class="c">${s.lines.length}</span>
          <span class="m">${ic(METHOD[s.method][1], 16)}${METHOD[s.method][0]}</span><span class="amt">${fmt(saleTotal(s))}</span>
          <span class="st">${s.training ? badge("warning", "Training", "school") : ""}${rs ? badge("", rs, "undo") : ""}${s.training ? "" : syncBadge(s)}</span></button>`; }).join("")}</div>`
        : `<div class="empty card"><span class="circle">${ic("receipt", 28)}</span><h3>No sales match</h3><span>Try another day, the whole branch, or clear the search.</span></div>`}
    </section>`;
    return `<div class="body">${left}${saleDetailPanel(sel)}</div>`;
  }
  function saleDetailPanel(s) {
    if (!s) return `<aside class="order"><div class="empty" style="flex:1"><span class="circle">${ic("receipt", 28)}</span><h3>Select a sale</h3><span>Click a row, or use ↑ ↓. You can reprint the receipt, e-mail it, or start a return.</span></div></aside>`;
    const gross = s.lines.reduce((a, l) => a + Math.round(l.qty * l.unit), 0), net = saleTotal(s), rs = retState(s);
    return `<aside class="order" aria-label="Sale details">
      <div class="order-head"><div class="order-title"><div style="flex:1"><h2>${s.no}</h2><div class="sub">${s.date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })} · ${s.date.toTimeString().slice(0, 5)} · Register ${s.no.split("-")[1]}</div></div>${syncBadge(s)}</div>
        <dl class="kv"><dt>Cashier</dt><dd>${esc(s.cashier)}</dd><dt>Customer</dt><dd>${esc(s.customer.name)}</dd><dt>Paid by</dt><dd>${METHOD[s.method][0]}</dd>${s.taxInvoice ? `<dt>Tax invoice</dt><dd>${s.taxInvoice}</dd>` : ""}${rs ? `<dt>Returns</dt><dd>${rs}</dd>` : ""}</dl>
        ${s.sync === "error" ? `<div class="banner error" style="flex-wrap:wrap">${ic("alert")}<span style="flex:1;min-width:200px">${esc(s.syncError)}</span><button class="btn secondary" data-act="h-retry">Retry sync</button></div>` : s.sync === "waiting" ? `<div class="banner">${ic("wifiOff")}Saved on this register. It will sync when the connection is back.</div>` : ""}
      </div>
      <div class="panel-body"><div class="dlines">${s.lines.map(l => { const p = byId(l.pid), w = p.weighed; return `<div class="dline"><span class="thumb tile-${p.tone}">${ic(p.icon, 18)}</span><span class="grow"><b>${esc(p.name)}</b><small>${w ? l.qty.toFixed(3) + " kg" : l.qty} × ${fmt(l.unit)}${l.disc ? ` · −${l.disc}%` : ""}${l.batch ? ` · ${l.batch}` : ""}${l.returned ? ` · <span style="color:var(--warning-text)">${w ? "returned" : l.returned + " returned"}</span>` : ""}</small></span><b>${fmt(Math.round(l.qty * l.unit * (100 - l.disc) / 100))}</b></div>`; }).join("")}</div></div>
      <div class="summary-wrap"><div class="summary"><div class="r"><span>Subtotal</span><b>${fmt(gross)}</b></div><div class="r disc"><span>Discount</span><b>${gross - net ? "−" : ""}${fmt(gross - net)}</b></div><div class="r"><span>VAT (incl. 18%)</span><b>${fmt(Math.round(net * 18 / 118))}</b></div><hr><div class="total"><span>Total</span><span>${fmt(net)}</span></div></div></div>
      <div class="order-foot"><button class="btn primary l block" data-act="reprint">${ic("printer")}Reprint receipt <kbd>Ctrl P</kbd></button>
        <div class="two"><button class="btn secondary" data-act="h-return" ${rs === "Returned" ? "disabled" : ""}>${ic("undo", 18)}Start return <kbd>R</kbd></button><button class="btn secondary" data-act="email">${ic("mail", 18)}E-mail</button></div></div>
    </aside>`;
  }
  function histMove(d) {
    const list = histList(); if (!list.length) return;
    const i = list.findIndex(s => s.no === S.hist.sel);
    S.hist.sel = list[Math.max(0, Math.min(list.length - 1, i < 0 ? 0 : i + d))].no; render();
    const row = app.querySelector('.hrow[aria-selected="true"]'); if (row && row.scrollIntoView) row.scrollIntoView({ block: "nearest" });
  }
  function startReturnFrom(no) { const s = S.history.find(x => x.no === no); if (!s) return; S.ret = { ...emptyRet(), sale: s }; S.view = "returns"; render(); setTimeout(() => { const b = app.querySelector('[data-act="ret-inc"], [data-act="ret-toggle"]'); if (b) b.focus(); }); }

  // ---------- Cash in / out (R-15) ----------
  const CASH_OUT_LIMIT = 200000; // cash out above Rs 2,000 or any safe drop needs a manager
  const CM_REASONS = { in: ["Float top-up", "Change from the bank", "Other"], out: ["Petty cash: transport", "Petty cash: cleaning", "Supplier paid on delivery", "Staff advance", "Other"], safe: ["Safe drop"] };
  const CM_LABEL = { in: "Cash in", out: "Cash out", safe: "Safe drop" };
  function openCashMove() {
    if (!S.shifts[S.user.id]) { toast("Open a shift first", { error: true }); return; }
    openModal({ type: "cash", kind: "out", amount: "", reason: "", note: "", stage: "amount", pin: "", pinErr: false });
  }
  const cmAmount = m => Math.round((parseFloat(m.amount || "0") || 0) * 100);
  const cmNeedsMgr = m => S.user.role !== "Manager" && (m.kind === "safe" || (m.kind === "out" && cmAmount(m) > CASH_OUT_LIMIT));
  function cashModal(m, head) {
    const sh = S.shifts[S.user.id], drawer = expectedCash(sh), amt = cmAmount(m), mgr = cmNeedsMgr(m);
    const over = m.kind !== "in" && amt > drawer;
    const ok = amt > 0 && m.reason && !over;
    const moves = (sh.moves || []).slice(0, 3);
    return `<div class="modal" role="dialog" aria-modal="true" aria-labelledby="mt" style="width:min(560px,100%)">${head("Cash in / out", "Opens the drawer and is saved to the audit log")}
      <div class="cm-kinds" role="group" aria-label="Type">${[["in", "Cash in", "plus"], ["out", "Cash out", "minus"], ["safe", "Safe drop", "lock"]].map(([k, l, i]) => `<button class="method" data-act="cm-kind" data-k="${k}" aria-pressed="${m.kind === k}">${ic(i, 20)}<span>${l}</span></button>`).join("")}</div>
      <div class="drawer-now"><span>Cash in the drawer now (expected)</span><b>${fmt(drawer)}</b></div>
      ${m.stage === "pin" ? `<div class="mgr"><div class="head">${ic("lock", 18)}Manager approval · ${CM_LABEL[m.kind]} ${fmt(amt)}</div>
          <div class="pin-dots">${[0, 1, 2, 3].map(i => `<i class="${m.pin.length > i ? "on" : ""}"></i>`).join("")}</div>
          <div class="keypad">${["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "⌫"].map(k => `<button data-act="cm-pin" data-k="${k}" aria-label="${k === "⌫" ? "Backspace" : k === "C" ? "Clear" : k}">${k === "⌫" ? ic("backspace", 22) : k}</button>`).join("")}</div>
          ${m.pinErr ? `<div class="scan-error" role="alert">${ic("alert", 16)}Wrong manager PIN</div>` : `<div class="note">Demo manager PIN: 1234 (Malini)</div>`}</div>
          <div style="display:flex;gap:8px"><button class="btn secondary" data-act="cm-back" style="flex:1">Back</button><button class="btn primary" data-act="cm-submit" style="flex:2" ${m.pin.length === 4 ? "" : "disabled"}>Approve &amp; open drawer <kbd>Enter</kbd></button></div>`
      : `<div class="big-amount">${fmt(amt)}<span class="caret"></span></div>
        ${over ? `<div class="scan-error" role="alert">${ic("alert", 16)}More than the cash in the drawer (${fmt(drawer)})</div>` : ""}
        <div class="field">Reason<div class="chips wrap">${CM_REASONS[m.kind].map(r => `<button class="chip" data-act="cm-reason" data-v="${esc(r)}" aria-pressed="${m.reason === r}">${esc(r)}</button>`).join("")}</div></div>
        <label class="field">Note ${m.reason === "Other" ? "(required)" : "(optional)"}<input id="cmnote" data-fid="cmnote" value="${esc(m.note)}" placeholder="${m.kind === "out" ? "e.g. Three-wheeler for delivery" : m.kind === "safe" ? "e.g. Bag no. 0042" : "e.g. Rs 100 notes from the bank"}"></label>
        <div class="keypad">${["1", "2", "3", "4", "5", "6", "7", "8", "9", "00", "0", "⌫"].map(k => `<button data-act="cm-key" data-k="${k}" aria-label="${k === "⌫" ? "Backspace" : k}">${k === "⌫" ? ic("backspace", 24) : k}</button>`).join("")}</div>
        ${mgr && amt ? `<div class="note">${ic("lock", 16)}${m.kind === "safe" ? "Safe drops need" : "Cash out above " + fmt(CASH_OUT_LIMIT) + " needs"} a manager PIN</div>` : ""}
        <button class="btn primary l block" data-act="cm-submit" ${ok && (m.reason !== "Other" || m.note.trim()) ? "" : "disabled"}>${ic(mgr ? "lock" : "check")}${mgr ? "Continue to approval" : "Open drawer & record"} <kbd>Enter</kbd></button>`}
      ${moves.length ? `<div class="field">Earlier this shift<div class="moves">${moves.map(x => `<div>${ic(x.kind === "in" ? "plus" : x.kind === "safe" ? "lock" : "minus", 16)}${x.time.toTimeString().slice(0, 5)} · ${esc(x.reason)}${x.approver ? " · " + esc(x.approver) : ""}<b>${x.kind === "in" ? "+" : "−"}${fmt(x.amount)}</b></div>`).join("")}</div></div>` : ""}
    </div>`;
  }
  function cmKey(k) { const m = S.modal; let v = m.amount || ""; if (k === "⌫") v = v.slice(0, -1); else if (v.length < 8) v = (v === "0" ? "" : v) + k; m.amount = v; renderModal(); }
  function cmPin(k) { const m = S.modal; m.pinErr = false; if (k === "⌫") m.pin = m.pin.slice(0, -1); else if (k === "C") m.pin = ""; else if (m.pin.length < 4) m.pin += k; renderModal(); }
  function cmSubmit() {
    const m = S.modal, sh = S.shifts[S.user.id], amt = cmAmount(m);
    if (!amt || !m.reason) { toast(!amt ? "Enter the amount" : "Choose a reason", { error: true }); return; }
    if (m.reason === "Other" && !m.note.trim()) { toast("Add a note for “Other”", { error: true }); return; }
    if (m.kind !== "in" && amt > expectedCash(sh)) { toast("More than the cash in the drawer", { error: true }); return; }
    if (cmNeedsMgr(m) && m.stage !== "pin") { m.stage = "pin"; renderModal(); return; }
    if (cmNeedsMgr(m) && m.pin !== MANAGER_PIN) { m.pin = ""; m.pinErr = true; renderModal(); return; }
    if (m.kind === "in") sh.cashIn += amt; else sh.cashOut += amt;
    sh.moves = sh.moves || []; sh.moves.unshift({ kind: m.kind, amount: amt, reason: m.reason, note: m.note, time: new Date(), by: S.user.short, approver: cmNeedsMgr(m) ? "Malini J." : null });
    closeModal(); render(); toast(`Drawer opened · ${CM_LABEL[m.kind]} ${fmt(amt)} recorded`);
  }

  // ---------- Goods receiving (R-17) ----------
  const glUnit = l => unitsFor(byId(l.pid)).find(u => u.k === l.unit);
  const glCost = l => Math.round(l.qty * l.cost);
  function grnIssues() {
    const g = S.grn, out = [];
    if (!g.supplier) out.push("Choose the supplier");
    if (!g.invoice.trim()) out.push("Enter the supplier invoice number");
    if (!g.lines.length) out.push("Scan at least one item");
    g.lines.forEach(l => {
      const p = byId(l.pid), e = expInfo(l.exp);
      if (tracked(p) && (!l.batch.trim() || !l.exp)) out.push(`${p.name}: batch and expiry are required`);
      if (e && e.days < 0) out.push(`${p.name} ${l.batch}: expired — cannot be received`);
      if (!(l.qty > 0)) out.push(`${p.name}: quantity must be more than 0`);
      if (!(l.cost > 0)) out.push(`${p.name}: enter the unit cost`);
    });
    return out;
  }
  function grnScan(raw) {
    const g = S.grn, q = raw.trim(); if (!q) return;
    const gs = parseGS1(q);
    let p = null, batch = "", exp = "";
    if (gs) {
      p = PRODUCTS.find(x => gtinOf(x) === gs["01"]);
      if (!p) { g.error = `Unknown GTIN ${gs["01"]}. Link it to an existing product or create a new one (manager).`; g.query = ""; render(); focusId("gsearch"); return; }
      batch = gs["10"] || ""; if (gs["17"]) exp = isoDate(gs1Date(gs["17"]));
    } else {
      p = PRODUCTS.find(x => x.code === q);
      if (!p) { const l = PRODUCTS.filter(x => x.name.toLowerCase().includes(q.toLowerCase())); if (l.length === 1) p = l[0]; }
      if (!p) { g.error = `No product found for “${q}”. Scan the barcode on the pack, or type more of the name.`; g.query = ""; render(); focusId("gsearch"); return; }
    }
    const ex = batch ? g.lines.find(l => l.pid === p.id && l.batch === batch) : null;
    let line;
    if (ex) { ex.qty += 1; line = ex; }
    else { const us = unitsFor(p), u = us[us.length - 1]; line = { id: uid++, pid: p.id, batch, exp, qty: 1, unit: u.k, cost: baseCost(p) * u.f }; g.lines.push(line); }
    g.error = ""; g.query = ""; g.flash = line.id; render(); focusId("gsearch");
    toast(gs ? `Scanned ${p.name} · batch ${batch || "—"} · expiry ${exp ? fmtExpIso(exp) : "—"}` : `Added ${p.name}${tracked(p) ? " · enter batch and expiry" : ""}`);
  }
  function grnPost() {
    const g = S.grn;
    if (S.offline) { toast("Receiving needs a connection in this version", { error: true }); return; }
    const issues = grnIssues(); if (issues.length) { toast(issues[0], { error: true }); return; }
    const updates = [];
    for (const l of g.lines) {
      const p = byId(l.pid), base = Math.round(l.qty * glUnit(l).f * 1000) / 1000;
      p.stock = Math.round((p.stock + base) * 1000) / 1000;
      p.lots = p.lots || [];
      if (l.batch) {
        p.lots.unshift({ id: l.batch, exp: l.exp, qty: base, fresh: true });
        if (p.batches && !p.batches.find(b => b.id === l.batch)) { const d = new Date(l.exp + "T00:00:00"); p.batches.push({ id: l.batch, exp: `${pad2(d.getMonth() + 1)}/${d.getFullYear()}`, price: p.price, stock: base }); }
      }
      updates.push({ p, base, batch: l.batch, exp: l.exp });
    }
    const total = g.lines.reduce((a, l) => a + glCost(l), 0);
    g.posted = { no: `GRN-${S.grnSeq++}`, supplier: g.supplier, invoice: g.invoice, total, updates, time: new Date(), by: S.user.name };
    const sx = SUP.find(x => x.name === g.supplier);
    if (sx) { sx.grns.unshift({ no: g.posted.no, date: new Date(), invoice: g.invoice, total, paid: sx.terms === "cod" }); for (const u of updates) if (!sx.pids.includes(u.p.id)) sx.pids.push(u.p.id); }
    render(); toast(`${g.posted.no} posted · stock updated`);
  }
  function receivingView() {
    const g = S.grn;
    if (g.posted) {
      const d = g.posted;
      return `<div class="body"><section class="complete">
        <div class="success-mark"><div>${ic("truck", 40)}</div></div>
        <h1>Goods received</h1><div class="sub">${d.no} · ${esc(d.supplier)} · invoice ${esc(d.invoice)} · ${fmt(d.total)}</div>
        <div class="card" style="width:min(560px,100%);text-align:left"><h2>Stock updated</h2><div class="dlines">${d.updates.map(u => `<div class="dline"><span class="thumb tile-${u.p.tone}">${ic(u.p.icon, 18)}</span><span class="grow"><b>${esc(u.p.name)}</b><small>${u.batch ? `Batch ${esc(u.batch)} · exp ${fmtExpIso(u.exp)}` : "No batch"}</small></span><b style="color:var(--success-text)">+${u.p.weighed ? u.base.toFixed(3) + " kg" : u.base}</b><span class="sub" style="font-size:13px;min-width:90px;text-align:right">now ${u.p.weighed ? u.p.stock.toFixed(1) + " kg" : u.p.stock}</span></div>`).join("")}</div></div>
        <div class="actions"><button class="btn primary l" data-act="grn-new">New receipt <kbd>Enter</kbd></button><button class="btn secondary l" data-act="toast" data-msg="GRN printed">${ic("printer")}Print GRN</button><button class="btn ghost l" data-act="nav" data-view="pricecheck">${ic("tag")}Price check</button></div>
      </section></div>`;
    }
    const issues = grnIssues(), total = g.lines.reduce((a, l) => a + glCost(l), 0), inv = Math.round((parseFloat(g.invTotal) || 0) * 100);
    const units = g.lines.reduce((a, l) => a + l.qty * (glUnit(l) ? glUnit(l).f : 1), 0);
    const left = `<section class="products" aria-label="Goods receipt">
      ${S.offline ? `<div class="banner">${ic("wifiOff")}Receiving needs a connection in this version. Offline drafts come in release 2.</div>` : ""}
      <div class="card"><div class="grn-head">
        <label class="field">Supplier<select data-g="supplier" data-fid="g-supplier">${SUPPLIERS.map(s => `<option ${g.supplier === s ? "selected" : ""}>${esc(s)}</option>`).join("")}</select></label>
        <label class="field">Supplier invoice no.<input data-g="invoice" data-fid="g-invoice" value="${esc(g.invoice)}" placeholder="e.g. HP-58213"></label>
        <label class="field">Received on<input value="${new Date().toLocaleDateString("en-GB")}" readonly></label>
        <label class="field">Invoice total (Rs)<input data-g="invTotal" data-fid="g-invtotal" inputmode="decimal" value="${esc(g.invTotal)}" placeholder="From the supplier invoice"></label>
      </div></div>
      <div class="search-row"><label class="search ${g.error ? "error" : ""}">${ic("scan", 20, "scan")}<span class="sr">Scan</span><input id="gsearch" data-fid="gsearch" autocomplete="off" placeholder="Scan the 2D code (GS1) or barcode on the pack, or type a product name" value="${esc(g.query)}"><kbd>Enter</kbd></label></div>
      ${g.error ? `<div class="scan-error" role="alert">${ic("alert", 18)}${esc(g.error)}</div>` : ""}
      <div class="demo-scans">Demo scans:${DEMO_SCANS.map(([l, c]) => `<button class="chip" data-act="grn-demo" data-code="${esc(c)}" title="${esc(c)}">${esc(l)}</button>`).join("")}</div>
      <div class="glines">${g.lines.length ? g.lines.map(glCard).join("") : `<div class="empty card"><span class="circle">${ic("truck", 28)}</span><h3>Scan the first item of the delivery</h3><span>A GS1 2D code fills in the batch and expiry for you. A plain barcode adds the product; then type the batch and expiry from the pack.</span></div>`}</div>
    </section>`;
    const diff = inv ? inv - total : 0;
    const right = `<aside class="order" aria-label="Receipt summary">
      <div class="order-head"><div class="order-title"><div style="flex:1"><h2>GRN-${S.grnSeq}</h2><div class="sub">${esc(g.supplier)} · Draft</div></div>${badge("", "Draft", "note")}</div></div>
      <div class="panel-body">
        <div class="summary"><div class="r"><span>Lines</span><b>${g.lines.length}</b></div><div class="r"><span>Units (base)</span><b>${Math.round(units * 1000) / 1000}</b></div><hr><div class="total"><span>Cost total</span><span>${fmt(total)}</span></div></div>
        ${inv ? `<div class="banner ${diff ? "" : "ok"}" style="${diff ? "" : "background:var(--success-tint);color:var(--success-text)"}">${ic(diff ? "alert" : "check")}${diff ? `Differs from the invoice total by ${fmt(Math.abs(diff))}. Check quantities and costs.` : "Matches the invoice total"}</div>` : ""}
        <div class="field">${issues.length ? "To post this receipt" : "Ready"}<div class="issues">${issues.length ? issues.slice(0, 6).map(x => `<div>${ic("alert", 16)}${esc(x)}</div>`).join("") : `<div class="ok">${ic("check", 16)}All lines are complete</div>`}</div></div>
        <div class="note">${ic("package", 16)}Posting adds stock to each batch and creates a stock movement for every line (INV-04).</div>
      </div>
      <div class="order-foot"><button class="btn primary l block" data-act="grn-post" ${issues.length || S.offline ? "disabled" : ""}>${ic("check")}Post receipt <kbd>F10</kbd></button>
        <div class="two"><button class="btn secondary" data-act="toast" data-msg="Draft saved">Save draft</button><button class="btn ghost" data-act="grn-clear">Clear</button></div></div>
    </aside>`;
    return `<div class="body">${left}${right}</div>`;
  }
  function glCard(l) {
    const p = byId(l.pid), e = expInfo(l.exp), us = unitsFor(p), u = glUnit(l), need = tracked(p);
    return `<div class="gl ${S.grn.flash === l.id ? "flash" : ""} ${e && e.days < 0 ? "bad" : ""}">
      <div class="gl-top"><span class="thumb tile-${p.tone}">${ic(p.icon, 20)}</span><span class="grow"><b>${esc(p.name)}</b><small>${esc(p.meta)} · GTIN ${gtinOf(p)}${need ? " · batch-tracked" : ""}</small></span>
        ${e ? (e.tone ? `<span class="warn ${e.tone === "error" ? "e" : "w"}">${ic("alert", 16)}${e.label}</span>` : `<span class="badge b-success">${ic("check", 14)}${e.label}</span>`) : ""}
        <button class="icon-btn" data-act="grn-del" data-id="${l.id}" title="Remove line" aria-label="Remove ${esc(p.name)}">${ic("trash", 18)}</button></div>
      <div class="gl-fields">
        <label class="field">Batch${need ? " *" : ""}<input data-gl="batch" data-id="${l.id}" data-fid="gl-${l.id}-batch" value="${esc(l.batch)}" placeholder="${need ? "Required" : "Optional"}"></label>
        <label class="field">Expiry${need ? " *" : ""}<input type="date" data-gl="exp" data-id="${l.id}" data-fid="gl-${l.id}-exp" value="${l.exp}"></label>
        <div class="field">Quantity<div class="qty"><button data-act="gl-dec" data-id="${l.id}" aria-label="Less">${ic("minus", 16)}</button><input data-gl="qty" data-id="${l.id}" data-fid="gl-${l.id}-qty" inputmode="decimal" value="${l.qty}"><button data-act="gl-inc" data-id="${l.id}" aria-label="More">${ic("plus", 16)}</button></div></div>
        <label class="field">Unit<select data-gl="unit" data-id="${l.id}" data-fid="gl-${l.id}-unit">${us.map(x => `<option value="${x.k}" ${x.k === l.unit ? "selected" : ""}>${esc(x.l)}</option>`).join("")}</select></label>
        <label class="field">Cost / ${esc(u.l.split(" ")[0].toLowerCase())} (Rs)<input data-gl="cost" data-id="${l.id}" data-fid="gl-${l.id}-cost" inputmode="decimal" value="${(l.cost / 100).toFixed(2)}"></label>
        <div class="lc">${fmt(glCost(l))}<small>= ${Math.round(l.qty * u.f * 1000) / 1000} ${p.weighed ? "kg" : p.cat === "Pharmacy" ? "strips" : "pieces"}</small></div>
      </div></div>`;
  }

  // ---------- Price & stock check (R-18) ----------
  function pcLookup(raw) {
    const q = raw.trim(); if (!q) return;
    const gs = parseGS1(q); let p = null;
    if (gs) p = PRODUCTS.find(x => gtinOf(x) === gs["01"]);
    if (!p) { const hit = findByCode(q); if (hit) p = hit.p; }
    if (!p) { const l = PRODUCTS.filter(x => x.name.toLowerCase().includes(q.toLowerCase())); if (l.length === 1) p = l[0]; else if (l.length > 1) { S.pc.error = `${l.length} products match “${q}”: ${l.slice(0, 4).map(x => x.name).join(", ")}${l.length > 4 ? "…" : ""}. Type more of the name or scan the barcode.`; S.pc.query = ""; render(); focusId("pcsearch"); return; } }
    if (!p) { S.pc.error = `No product found for “${q}”.`; S.pc.query = ""; S.pc.pid = null; render(); focusId("pcsearch"); return; }
    S.pc = { query: "", pid: p.id, error: "", recent: [p.id, ...S.pc.recent.filter(x => x !== p.id)].slice(0, 6) };
    render(); focusId("pcsearch");
  }
  function priceCheckView() {
    const pc = S.pc, p = pc.pid ? byId(pc.pid) : null;
    const lots = p ? lotsOf(p).filter(l => l.qty > 0) : [];
    let card = "";
    if (p) {
      const sb = stockBadge(p), offerPrice = p.offer ? Math.round(p.price * (100 - p.offer) / 100) : null;
      const others = [["KDY01 · Kandy", Math.max(0, Math.round(p.stock * 0.6))], ["GAL01 · Galle", Math.max(0, Math.round(p.stock * 0.3) - 1)]];
      card = `<div class="pc-card">
        <div class="hero tile-${p.tone}">${ic(p.icon, 120)}${p.badge ? badge(p.badge[0], p.badge[1], p.badge[2]) : ""}</div>
        <div class="pc-info">
          <span class="cap">${esc(p.cat)}</span><h2>${esc(p.name)}</h2><div class="meta">${esc(p.meta)} · barcode ${p.code}${p.rx ? " · prescription required" : ""}</div>
          <div class="pc-price">${offerPrice ? `<b>${fmt(offerPrice)}</b><s>${fmt(p.price)}</s>${badge("warning", `Offer −${p.offer}%`, "tag")}` : `<b>${fmt(p.price)}</b>`}${p.weighed ? `<span>per kg · Rs ${(p.price / 1000 / 100).toFixed(2)} per 10 g</span>` : ""}</div>
          <div class="pc-row">${sb ? badge(sb[0], sb[1], sb[2]) : badge("success", `In stock · ${p.weighed ? p.stock.toFixed(1) + " kg" : p.stock}`, "check")}${badge("info", "VAT 18% included", null)}</div>
          <div class="pc-row" style="margin-top:auto"><button class="btn primary l" data-act="pc-add" ${p.stock > 0 ? "" : "disabled"}>${ic("cart")}Add to sale <kbd>Enter</kbd></button><button class="btn secondary l" data-act="toast" data-msg="Shelf labels print from the grocery module (release 2)">${ic("printer")}Shelf label</button><button class="btn ghost l" data-act="pc-clear">Check another <kbd>Esc</kbd></button></div>
        </div></div>
      <div class="pc-grid">
        <div class="card"><h2>Batches at this branch</h2>${lots.length ? `<div class="dlines">${lots.map(b => { const e = expInfo(b.exp); return `<div class="dline"><span class="grow"><b>${esc(b.id)}${b.fresh ? " " + badge("info", "Just received", null) : ""}</b><small>Expires ${fmtExpIso(b.exp)}${b.price ? " · " + fmt(b.price) : ""}</small></span>${e && e.tone ? badge(e.tone, e.label, "alert") : ""}<b>${p.weighed ? b.qty + " kg" : b.qty}</b></div>`; }).join("")}</div>` : `<div class="sub">${tracked(p) ? "No batch details yet." : "Not batch-tracked."}</div>`}</div>
        <div class="card"><h2>Other branches</h2><div class="dlines">${others.map(([n, q]) => `<div class="dline"><span class="grow"><b>${n}</b><small>${S.offline ? "Last known · offline" : "Updated a minute ago"}</small></span>${q > 0 ? badge("success", String(q), null) : badge("error", "0", null)}</div>`).join("")}</div></div>
      </div>`;
    } else {
      card = `<div class="empty card" style="padding:56px 16px"><span class="circle">${ic("scan", 32)}</span><h3>Scan any item to see its price and stock</h3><span>Works without starting a sale. You can also type a name, or scan a scale label or a GS1 2D code.</span></div>`;
    }
    return `<div class="pc-wrap">
      <label class="search pc-search ${pc.error ? "error" : ""}">${ic("scan", 26, "scan")}<span class="sr">Scan or search</span><input id="pcsearch" data-fid="pcsearch" autocomplete="off" placeholder="Scan a barcode or type a product name…" value="${esc(pc.query)}"><kbd>Enter</kbd></label>
      ${pc.error ? `<div class="scan-error" role="alert">${ic("alert", 18)}${esc(pc.error)}</div>` : ""}
      ${pc.recent.length ? `<div class="recent">Recent:${pc.recent.map(id => `<button class="chip" data-act="pc-pick" data-pid="${id}" aria-pressed="${id === pc.pid}">${esc(byId(id).name)}</button>`).join("")}</div>` : ""}
      ${card}
    </div>`;
  }

  // ---------- Status & diagnostics (R-19) ----------
  const hm = d => d.toTimeString().slice(0, 5);
  function classifyScan(raw) {
    const q = raw.trim(); if (!q) return "";
    const gs = parseGS1(q);
    if (gs) { const p = PRODUCTS.find(x => gtinOf(x) === gs["01"]); return `GS1 2D code · GTIN ${gs["01"]}${gs["10"] ? " · batch " + gs["10"] : ""}${gs["17"] ? " · expiry " + fmtExpIso(isoDate(gs1Date(gs["17"]))) : ""} · ${p ? p.name : "unknown product"}`; }
    if (/^2\d{12}$/.test(q)) { const hit = findByCode(q); return `Scale label · PLU ${q.slice(1, 6)} · ${(parseInt(q.slice(6, 12), 10) / 1000).toFixed(3)} kg${hit ? " · " + hit.p.name : ""}`; }
    if (/^\d{8,14}$/.test(q)) { const p = PRODUCTS.find(x => x.code === q); return `Barcode (${q.length === 13 ? "EAN-13" : q.length === 8 ? "EAN-8" : "GTIN"}) · ${p ? p.name : "not in the catalog"}`; }
    return `Text “${q}” · the scanner is sending keystrokes correctly`;
  }
  function statusView() {
    const d = S.diag, off = S.offline, blocked = S.history.filter(s => s.sync === "error"), waitingSales = S.history.filter(s => s.sync === "waiting");
    const queue = off ? Math.max(S.waiting, waitingSales.length) : waitingSales.length;
    const test = (what, label) => `<button class="btn secondary" data-act="st-test" data-what="${what}" ${d.testing ? "disabled" : ""}>${d.testing === what ? "Testing…" : label}</button>`;
    const card = (cls, icon, tile, label, val, sub, btn = "") => `<div class="scard ${cls}"><div class="top"><span class="icon-tile ${tile}">${ic(icon, 18)}</span>${label}</div><div class="val">${val}</div><div class="sub">${sub}</div>${btn}</div>`;
    const P = S.dev.printer, conn = { usb: "USB", net: "Network " + P.ip, bt: "Bluetooth" }[P.conn];
    return `<div class="status-wrap">
      <div class="actions-bar">
        <button class="btn primary" data-act="st-sync">${ic("refresh", 18)}Sync now</button>
        <button class="btn secondary" data-act="st-logs" ${d.logsSent ? "disabled" : ""}>${ic("upload", 18)}${d.logsSent ? "Logs sent · ticket RS-20431" : "Upload logs to support"}</button>
        <button class="btn danger-outline" data-act="st-resync">${ic("refresh", 18)}Full resync (manager)</button>
        <span class="spacer"></span><span class="sub" style="font-size:13px;color:var(--text-2)">Read this screen to DevCity support over the phone if something looks wrong.</span>
      </div>
      <div class="status-grid">
        ${off ? card("warn", "wifiOff", "tile-orange", "Connection", "Offline", "Since 10:12 · selling continues and sales are saved here", test("net", "Test connection"))
              : card("", "wifi", "tile-green", "Connection", "Online · 38 ms", "RetailOS cloud · secure connection", test("net", "Test connection"))}
        ${card(blocked.length ? "err" : queue ? "warn" : "", "cloudCheck", blocked.length ? "tile-pink" : queue ? "tile-orange" : "tile-green", "Sync queue", `${queue} waiting · ${blocked.length} blocked`, `Last send ${hm(d.lastPush)} · last update ${hm(d.lastPull)}`)}
        ${card(S.printerError ? "err" : "", "printer", S.printerError ? "tile-pink" : "tile-green", "Receipt printer", S.printerError ? "Out of paper" : "Ready", `${P.width} mm thermal · ${conn}`, `<button class="btn secondary" data-act="st-print">Test print</button>`)}
        ${card("", "wallet", "tile-blue", "Cash drawer", "Connected", P.kick ? "Opens through the printer on cash sales" : "Opens only from the menu", `<button class="btn secondary" data-act="st-drawer">Open drawer</button>`)}
        <div class="scard"><div class="top"><span class="icon-tile tile-blue">${ic("scan", 18)}</span>Barcode scanner</div><div class="val">Keyboard (HID)</div>
          <label class="voucher" style="height:40px">${ic("scan", 16)}<input id="scantest" data-fid="scantest" placeholder="Scan anything to test" autocomplete="off"></label>
          <div class="sub" style="min-height:36px">${d.scan ? esc(d.scan) : "Suffix: " + ({ enter: "Enter", tab: "Tab", none: "none" }[S.dev.scanner.suffix])}</div></div>
        ${card("", "disk", "tile-blue", "Storage", "42.6 GB free", "Local database 186 MB · 9,412 products cached")}
        ${card("", "clock", "tile-green", "Clock", "In sync", "Device and server differ by 0 s · Asia/Colombo")}
        ${card("", "monitor", "tile-blue", "App", "Version 1.6.0", "Device WIN-CMB01-02 · Register R02 · up to date")}
      </div>
      <div class="card"><div class="card-head"><h2>Waiting to send</h2>${queue || blocked.length ? "" : badge("success", "Nothing waiting", "check")}</div>
        ${blocked.map(s => `<div class="dline"><span class="thumb tile-pink" style="width:36px;height:36px">${ic("alert", 18)}</span><span class="grow"><b>${s.no} · blocked</b><small style="font-family:var(--mono)">${esc(s.syncError || "")}</small></span><button class="btn secondary s" data-act="st-requeue" data-no="${s.no}">Requeue</button></div>`).join("")}
        ${queue ? `<div class="dline"><span class="thumb tile-orange" style="width:36px;height:36px">${ic("wifiOff", 18)}</span><span class="grow"><b>${queue} sale${queue === 1 ? "" : "s"} waiting</b><small>Saved safely on this register. ${off ? "They send automatically when the connection is back." : "Press Sync now to send them."}</small></span></div>` : ""}
      </div>
      <details class="card"><summary>${ic("chevRight", 18)}Recent errors <span class="badge">${3 + blocked.length}</span></summary>
        <div class="log">${off ? `<span class="w">${hm(new Date())}:02  SYNC-001  Network unreachable · retry 3 · next try in 8 s</span>\n` : ""}<span class="e">08:31:22  SALE-005  Receipt CMB01-R02-000147 rejected: price list version not found</span>
07:58:10  DEV-006   Scanner reconnected (USB)
Yesterday 17:02  PRN-002  Printer out of paper · resolved by reprint
Yesterday 09:15  SYNC-003 Catalog cursor too old · catalog snapshot downloaded</div></details>
    </div>`;
  }
  function resyncStart() {
    const m = S.modal; if (!m || m.type !== "resync" || m.stage !== "pin") return;
    if (S.offline) { toast("A full resync needs a connection", { error: true }); return; }
    if (m.pin !== MANAGER_PIN) { m.pin = ""; m.pinErr = true; renderModal(); return; }
    runResync();
  }
  function runResync() {
    const m = S.modal; m.stage = "run"; m.progress = 0; renderModal();
    const tick = setInterval(() => {
      if (!S.modal || S.modal.type !== "resync") { clearInterval(tick); return; }
      m.progress += 7; if (m.progress >= 100) { clearInterval(tick); m.progress = 100; S.history.forEach(s => { if (s.sync === "waiting") s.sync = "synced"; }); S.waiting = 0; S.diag.lastPush = S.diag.lastPull = new Date(); closeModal(); render(); toast("Full resync complete · catalog, prices and staff are up to date"); return; }
      renderModal();
    }, 180);
  }

  // ---------- Device settings (R-20) ----------
  const getPath = (o, p) => p.split(".").reduce((a, k) => a && a[k], o);
  const setPath = (o, p, v) => { const ks = p.split("."), last = ks.pop(); ks.reduce((a, k) => a[k], o)[last] = v; };
  const devDirty = () => JSON.stringify(S.dev) !== JSON.stringify(S.devDraft);
  function receiptPreview(D, training) {
    const W = D.printer.width === "58" ? 32 : 40, L2 = (l, r) => l + r.padStart(Math.max(1, W - l.length)), C = x => " ".repeat(Math.max(0, Math.floor((W - x.length) / 2))) + x.slice(0, W), Dl = "-".repeat(W);
    const R = D.receipt, out = [];
    if (R.logo) out.push(C("[ LOGO ]"));
    out.push(C(R.h1), C(R.h2), C("VAT Reg: 123456789-7000"));
    if (training) out.push(C("*** TRAINING · NOT A RECEIPT ***"));
    out.push(Dl, "Receipt: CMB01-R02-000155", "Date: " + new Date().toLocaleDateString("en-GB") + " " + hm(new Date()), Dl, "Paracetamol 500mg", L2("  2 x 32.00", "64.00"), "Basmati rice 5kg", L2("  1 x 3,250.00", "3,250.00"), Dl, L2("TOTAL", "Rs 3,314.00"));
    if (R.tax) out.push(L2("  incl. VAT 18%", "505.53"));
    out.push(L2("Cash", "5,000.00"), L2("CHANGE", "1,686.00"), Dl);
    if (R.policy) out.push(C(R.policy));
    if (R.barcode) out.push("", C("|| ||| | |||| || ||| ||"), C("CMB01-R02-000155"));
    out.push("", C(R.footer || ""));
    if (R.lang !== "en") out.push(C(R.lang === "si" ? "ස්තූතියි!" : "நன்றி!"));
    return out.join("\n");
  }
  function settingsView() {
    const D = S.devDraft, tab = S.devTab;
    const seg = (path, opts) => `<div class="seg">${opts.map(([v, l]) => `<button data-act="set-val" data-path="${path}" data-v="${v}" aria-pressed="${getPath(D, path) === v}">${l}</button>`).join("")}</div>`;
    const tog = (path, label) => `<input type="checkbox" class="toggle" data-set="${path}" data-fid="set-${path}" ${getPath(D, path) ? "checked" : ""} aria-label="${esc(label)}">`;
    const row = (title, help, ctrl) => `<div class="srow"><div><b>${title}</b>${help ? `<small>${help}</small>` : ""}</div><div class="ctrl">${ctrl}</div></div>`;
    const inp = (path, ph, w = 220) => `<input data-set="${path}" data-fid="set-${path}" value="${esc(getPath(D, path))}" placeholder="${esc(ph)}" style="width:${w}px">`;
    let body = "";
    if (tab === "printer") body = `<div class="card"><h2>Receipt printer</h2>
        ${row("Connection", "How this register reaches the printer", seg("printer.conn", [["usb", "USB"], ["net", "Network"], ["bt", "Bluetooth"]]))}
        ${D.printer.conn === "net" ? row("Printer address", "IP address and port (ESC/POS raw, usually 9100)", inp("printer.ip", "192.168.1.50", 160) + inp("printer.port", "9100", 80)) : ""}
        ${row("Paper width", "80 mm fits 40 characters per line, 58 mm fits 32", seg("printer.width", [["80", "80 mm"], ["58", "58 mm"]]))}
        ${row("Print Sinhala and Tamil as an image", "Most thermal printers have no Sinhala or Tamil font", tog("printer.raster", "Print Sinhala and Tamil as an image"))}
        ${row("Open the cash drawer on cash sales", "The drawer is connected to the printer", tog("printer.kick", "Open drawer on cash sales"))}
        ${row("Copies per receipt", "Some shops print a copy for the counter file", `<select data-set="printer.copies" data-fid="set-printer.copies">${["1", "2"].map(v => `<option ${D.printer.copies === v ? "selected" : ""}>${v}</option>`).join("")}</select>`)}
        ${row("Test the hardware", "Prints a test page / opens the drawer", `<button class="btn secondary s" data-act="st-print">${ic("printer", 16)}Test print</button><button class="btn secondary s" data-act="st-drawer">Open drawer</button>`)}</div>`;
    if (tab === "receipt") body = `<div class="card"><h2>Receipt layout</h2>
        <div class="srow stack"><div><b>Header</b><small>Shop name and address at the top of every receipt</small></div>${inp("receipt.h1", "Shop name", 0).replace("width:0px", "width:100%")}${inp("receipt.h2", "Address", 0).replace("width:0px", "width:100%")}</div>
        <div class="srow stack"><div><b>Return policy</b></div>${inp("receipt.policy", "e.g. Returns within 14 days with receipt", 0).replace("width:0px", "width:100%")}</div>
        <div class="srow stack"><div><b>Footer message</b></div>${inp("receipt.footer", "e.g. Thank you! Come again", 0).replace("width:0px", "width:100%")}</div>
        ${row("Receipt language", "Sinhala and Tamil lines print as an image", seg("receipt.lang", [["en", "EN"], ["si", "සිං"], ["ta", "தமி"]]))}
        ${row("Logo", "Prints the shop logo at the top", tog("receipt.logo", "Print logo"))}
        ${row("VAT summary", "Shows the VAT included in the total", tog("receipt.tax", "VAT summary"))}
        ${row("Receipt barcode", "Lets cashiers scan the receipt for returns", tog("receipt.barcode", "Receipt barcode"))}</div>`;
    if (tab === "scanner") body = `<div class="card"><h2>Barcode scanner</h2>
        ${row("Key after each scan", "Most scanners send Enter after the code", `<select data-set="scanner.suffix" data-fid="set-scanner.suffix">${[["enter", "Enter"], ["tab", "Tab"], ["none", "None"]].map(([v, l]) => `<option value="${v}" ${D.scanner.suffix === v ? "selected" : ""}>${l}</option>`).join("")}</select>`)}
        ${row("Prefix to ignore", "Some scanners add a prefix character", inp("scanner.prefix", "none", 100))}
        ${row("Beep on scan", "Sound when an item is added or a scan fails", tog("scanner.beep", "Beep on scan"))}
        <div class="srow stack"><div><b>Test the scanner</b><small>Scan any barcode, scale label or GS1 2D code</small></div><label class="voucher" style="height:44px">${ic("scan", 16)}<input id="scantest" data-fid="scantest" placeholder="Scan here" autocomplete="off"></label><div class="sub" style="font-size:13px;color:var(--text-2)">${S.diag.scan ? esc(S.diag.scan) : "Waiting for a scan…"}</div></div></div>`;
    if (tab === "display") body = `<div class="card"><h2>Display &amp; language</h2>
        ${row("Theme", "Light is easiest to read in bright shops", seg("display.theme", [["auto", "Auto"], ["light", "Light"], ["dark", "Dark"]]))}
        ${row("Language", "Staff can still switch from the top bar", seg("display.lang", [["en", "EN"], ["si", "සිං"], ["ta", "தமி"]]))}
        ${row("Touch mode", "Bigger buttons and steppers for touch screens", tog("display.touch", "Touch mode"))}</div>`;
    if (tab === "training") body = `<div class="card"><h2>Training mode</h2>
        ${row("Training mode on this register", "For teaching new staff. Sales are marked TRAINING, receipts say “not a receipt”, and nothing counts in shift totals, stock or reports.", tog("training", "Training mode"))}
        <div class="srow"><div class="note">${ic("lock", 16)}Switching training mode is saved in the audit log. Turn it off before real trading.</div></div></div>`;
    const tabs = [["printer", "Printer", "printer"], ["receipt", "Receipt", "receipt"], ["scanner", "Scanner", "scan"], ["display", "Display & language", "monitor"], ["training", "Training mode", "school"]];
    return `<div style="flex:1;display:flex;flex-direction:column;min-height:0"><div class="settings">
      <nav class="stabs" aria-label="Settings sections">${tabs.map(([k, l, i]) => `<button class="nav-item ${tab === k ? "active" : ""}" data-act="set-tab" data-tab="${k}">${ic(i)}<span class="lbl">${l}</span>${k === "training" && D.training ? `<span class="count">ON</span>` : ""}</button>`).join("")}</nav>
      <div class="sform">${body}</div>
      <aside class="spreview" aria-label="Receipt preview"><div class="head"><span>Receipt preview</span>${badge("", D.printer.width + " mm", null)}</div><div class="paper ${D.training ? "training" : ""}">${esc(receiptPreview(D, D.training))}</div></aside>
    </div>
    <div class="save-bar"><span class="sub">${devDirty() ? "You have unsaved changes on this register" : "Saved on this register · " + S.user.name}</span><button class="btn secondary" data-act="set-discard" ${devDirty() ? "" : "disabled"}>Discard</button><button class="btn primary" data-act="set-save" ${devDirty() ? "" : "disabled"}>${ic("check")}Save <kbd>Ctrl S</kbd></button></div></div>`;
  }
  function saveSettings() {
    if (!devDirty()) return;
    S.dev = JSON.parse(JSON.stringify(S.devDraft));
    const th = S.dev.display.theme;
    if (th === "auto") { delete document.documentElement.dataset.theme; store("retailos-proto-theme", ""); } else { document.documentElement.dataset.theme = th; store("retailos-proto-theme", th); }
    S.touch = S.dev.display.touch; if (S.dev.display.lang) S.lang = S.dev.display.lang;
    render(); toast(`Settings saved${S.dev.training ? " · training mode is ON" : ""}`);
  }

  // ---------- Products list (A-20) ----------
  function prodList() {
    const f = S.prod, q = f.q.trim().toLowerCase();
    return PRODUCTS.filter(p => (f.cat === "All" || p.cat === f.cat) && (f.status === "all" || (f.status === "active") === p.active)
      && (!f.low || p.stock <= p.reorder) && (!f.missing || !p.nameSi || !p.nameTa)
      && (!q || [p.name, p.nameSi, p.nameTa, p.sku, p.brand, ...p.variants.map(v => v.barcode + " " + v.sku)].join(" ").toLowerCase().includes(q)));
  }
  const stockCell = p => p.stock <= 0 ? badge("error", "Out of stock", "alert") : p.stock <= p.reorder ? badge("warning", `Low · ${p.weighed ? p.stock.toFixed(1) : p.stock}`, "alert") : `<span>${p.weighed ? p.stock.toFixed(1) + " kg" : p.stock} in stock</span>`;
  function productsView() {
    const f = S.prod, list = prodList(), picked = f.picked.filter(id => list.some(p => p.id === id));
    const allOn = list.length && picked.length === list.length;
    const missingCount = PRODUCTS.filter(p => p.active && (!p.nameSi || !p.nameTa)).length, lowCount = PRODUCTS.filter(p => p.active && p.stock <= p.reorder).length;
    return `<div class="page">
      <div class="page-actions">
        <label class="search">${ic("search")}<span class="sr">Search products</span><input id="psearch" data-fid="psearch" autocomplete="off" placeholder="Name, SKU, barcode, brand…" value="${esc(f.q)}"><kbd>/</kbd></label>
        <select data-pf="cat" data-fid="pf-cat" aria-label="Category"><option value="All">All categories</option>${CATS_ADMIN.map(c => `<option ${f.cat === c ? "selected" : ""}>${c}</option>`).join("")}</select>
        <select data-pf="status" data-fid="pf-status" aria-label="Status">${[["active", "Active"], ["archived", "Archived"], ["all", "All statuses"]].map(([v, l]) => `<option value="${v}" ${f.status === v ? "selected" : ""}>${l}</option>`).join("")}</select>
        <button class="toggle-btn" data-act="pf-low" aria-pressed="${f.low}">${ic("alert", 16)}Low stock · ${lowCount}</button>
        <button class="toggle-btn" data-act="pf-missing" aria-pressed="${f.missing}">සිං/தமி missing · ${missingCount}</button>
        <span class="spacer"></span>
        <button class="btn secondary" data-act="nav" data-view="import">${ic("upload", 18)}Import</button>
        <button class="btn secondary" data-act="toast" data-msg="products.xlsx exported (${list.length} rows)">Export</button>
        <button class="btn primary" data-act="p-new">${ic("plus", 18)}Add product <kbd>N</kbd></button>
      </div>
      ${picked.length ? `<div class="bulk" role="region" aria-label="Bulk actions">${picked.length} selected
        <select data-act-change="p-bulk-cat" aria-label="Move to category"><option value="">Move to category…</option>${CATS_ADMIN.map(c => `<option>${c}</option>`).join("")}</select>
        <button class="btn secondary" data-act="toast" data-msg="${picked.length} shelf labels sent to the label printer">${ic("printer", 16)}Print labels</button>
        <button class="btn secondary" data-act="p-bulk-archive">${f.status === "archived" ? "Restore" : "Archive"}</button>
        <span class="spacer"></span><button class="btn ghost" data-act="p-unpick">Clear selection</button></div>` : ""}
      <div class="ptable" role="table" aria-label="Products">
        <div class="prow head" role="row"><span><input type="checkbox" data-act="p-pickall" aria-label="Select all" ${allOn ? "checked" : ""}></span><span>Product</span><span>Category</span><span class="c-brand">Brand</span><span class="r">Price</span><span>Stock</span><span class="c-status">Status</span><span class="c-upd">Updated</span></div>
        ${list.length ? list.map(p => `<div class="prow ${picked.includes(p.id) ? "picked" : ""} ${p.active ? "" : "archived"}" role="row" tabindex="0" data-act="p-open" data-id="${p.id}" data-fid="prow-${p.id}">
          <span><input type="checkbox" data-act="p-pick" data-id="${p.id}" aria-label="Select ${esc(p.name)}" ${picked.includes(p.id) ? "checked" : ""}></span>
          <span class="pname"><span class="thumb tile-${p.tone}">${ic(p.icon, 20)}</span><span style="min-width:0"><b>${esc(p.name)}</b><small>${esc(p.sku)} · ${p.variants.length} variant${p.variants.length === 1 ? "" : "s"}${!p.nameSi || !p.nameTa ? ` · <span style="color:var(--warning-text)">translation missing</span>` : ""}</small></span></span>
          <span>${esc(p.cat)}</span><span class="c-brand muted">${esc(p.brand)}</span><span class="r">${fmt(p.price)}${p.weighed ? "/kg" : ""}</span><span>${stockCell(p)}</span>
          <span class="c-status">${p.active ? badge("success", "Active", null) : badge("", "Archived", null)}</span><span class="c-upd muted">${dayDiff(p.updated) === 0 ? "Today" : p.updated.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span></div>`).join("")
          : `<div class="empty"><span class="circle">${ic("package", 28)}</span><h3>No products match</h3><span>Clear the filters or add a new product.</span></div>`}
      </div>
      <div class="table-foot"><span>Showing ${list.length} of ${PRODUCTS.length} products in this demo · the real catalog has 1,248</span><span>Click a row or press Enter to edit · Space selects</span></div>
    </div>`;
  }

  // ---------- Product editor (A-21) ----------
  function draftFrom(p) {
    return { id: p ? p.id : null, name: p ? p.name : "", nameSi: p ? p.nameSi : "", nameTa: p ? p.nameTa : "", cat: p ? p.cat : "Grocery", brand: p ? p.brand : "No brand",
      type: p && p.weighed ? "weighed" : "stocked", tax: p ? p.tax : "std", active: p ? p.active : true,
      wholesale: p ? (p.wholesale / 100).toFixed(2) : "", cost: p ? (p.cost / 100).toFixed(2) : "", offer: p && p.offer ? String(p.offer) : "",
      newPrice: p ? p.newPrice : "", newFrom: p ? p.newFrom : "", reorder: p ? String(p.reorder) : "5",
      variants: p ? p.variants.map(v => ({ label: v.label, sku: v.sku, barcode: v.barcode, price: (v.price / 100).toFixed(2) })) : [{ label: "", sku: "", barcode: "", price: "" }],
      drug: p && p.drug ? { ...p.drug } : { generic: "", strength: "", form: "Tablet", schedule: "OTC" } };
  }
  const peDirty = () => S.pe && JSON.stringify(S.pe.draft) !== JSON.stringify(draftFrom(S.pe.draft.id ? byId(S.pe.draft.id) : null));
  function peErrors(d) {
    const e = {};
    if (!d.name.trim()) e.name = "The product name is required";
    const codes = d.variants.map(v => v.barcode.trim());
    d.variants.forEach((v, i) => {
      const c = v.barcode.trim();
      if (!v.label.trim()) e["vl" + i] = "Required";
      if (!(parseFloat(v.price) > 0)) e["vp" + i] = "Above 0";
      if (c) {
        if (!/^\d{8,14}$/.test(c)) e["bc" + i] = "Use 8 to 14 digits";
        else if (codes.indexOf(c) !== i) e["bc" + i] = "Used twice in this product";
        else { const o = PRODUCTS.find(p => p.id !== d.id && p.variants.some(x => x.barcode === c)); if (o) e["bc" + i] = `Already used by ${o.name}`; }
      }
    });
    if (d.cat === "Pharmacy" && !d.drug.generic.trim()) e.generic = "The generic name is required for pharmacy items";
    if (d.newPrice && !d.newFrom) e.newFrom = "Choose the date the new price starts";
    if (d.newFrom && !(parseFloat(d.newPrice) > 0)) e.newPrice = "Enter the new price";
    return e;
  }
  function openProduct(id) { const p = id ? byId(id) : null; S.pe = { tab: "general", draft: draftFrom(p), showErr: false }; S.view = "product"; render(); if (!p) focusId("pe-name"); }
  function peSave() {
    const pe = S.pe, d = pe.draft, e = peErrors(d);
    if (Object.keys(e).length) { pe.showErr = true; const first = Object.keys(e)[0]; pe.tab = first === "name" ? "general" : first === "generic" ? "pharmacy" : /^(bc|vl|vp)/.test(first) ? "variants" : "prices"; render(); toast(e[first], { error: true }); return; }
    let p = d.id ? byId(d.id) : null; const isNew = !p;
    if (!p) { const [icon, tone] = TONES[d.cat] || ["package", "purple"]; p = { id: "n" + (uid++), stock: 0, icon, tone, log: [] }; PRODUCTS.push(p); }
    const before = isNew ? null : { name: p.name, price: p.price, cat: p.cat, offer: p.offer || 0, active: p.active };
    const v0 = d.variants[0];
    Object.assign(p, { name: d.name.trim(), nameSi: d.nameSi.trim(), nameTa: d.nameTa.trim(), cat: d.cat, brand: d.brand, weighed: d.type === "weighed", tax: d.tax, active: d.active,
      price: Math.round(parseFloat(v0.price) * 100), wholesale: Math.round((parseFloat(d.wholesale) || 0) * 100), cost: Math.round((parseFloat(d.cost) || 0) * 100), offer: parseInt(d.offer, 10) || 0,
      newPrice: d.newPrice, newFrom: d.newFrom, reorder: parseInt(d.reorder, 10) || 0,
      variants: d.variants.map(v => ({ label: v.label.trim(), sku: v.sku.trim(), barcode: v.barcode.trim(), price: Math.round(parseFloat(v.price) * 100) })),
      code: v0.barcode.trim() || p.code || ("20" + String(Date.now()).slice(-11)), sku: v0.sku.trim() || p.sku || "", meta: `${v0.label.trim()}${v0.sku.trim() ? " · " + v0.sku.trim() : ""}`,
      drug: d.cat === "Pharmacy" ? { ...d.drug } : null, rx: d.cat === "Pharmacy" && d.drug.schedule === "Rx", updated: new Date() });
    if (p.offer) p.badge = ["warning", `Offer −${p.offer}%`, "tag"];
    else if (p.badge && p.badge[1].startsWith("Offer")) p.badge = null;
    if (p.rx && !p.badge) p.badge = ["info", "Rx", "note"];
    const what = isNew ? "Product created" : [before.name !== p.name ? `Renamed from “${before.name}”` : "", before.price !== p.price ? `Price ${fmt(before.price)} → ${fmt(p.price)}` : "", before.cat !== p.cat ? `Moved to ${p.cat}` : "", before.offer !== p.offer ? (p.offer ? `Offer −${p.offer}%` : "Offer removed") : "", before.active !== p.active ? (p.active ? "Restored" : "Archived") : ""].filter(Boolean).join(" · ") || "Details updated";
    p.log.unshift({ when: new Date(), who: `${S.user.short} ${S.user.name.split(" ")[1][0]}.`, what });
    S.pe = { tab: pe.tab, draft: draftFrom(p), showErr: false };
    render(); toast(isNew ? `${p.name} created · it's on the Sell screen now` : `${p.name} saved · registers update within a minute`);
  }
  function previewProduct(d) {
    const [icon, tone] = d.id ? [byId(d.id).icon, byId(d.id).tone] : (TONES[d.cat] || ["package", "purple"]);
    const offer = parseInt(d.offer, 10) || 0, v0 = d.variants[0];
    return { id: "__preview", name: d.name || "Product name", cat: d.cat, meta: `${v0.label || "Size"}${v0.sku ? " · " + v0.sku : ""}`, price: Math.round((parseFloat(v0.price) || 0) * 100), icon, tone,
      stock: d.id ? byId(d.id).stock : 0, weighed: d.type === "weighed", badge: offer ? ["warning", `Offer −${offer}%`, "tag"] : d.cat === "Pharmacy" && d.drug.schedule === "Rx" ? ["info", "Rx", "note"] : null };
  }
  function productEditor() {
    const pe = S.pe, d = pe.draft, e = peErrors(d), p = d.id ? byId(d.id) : null, pharm = d.cat === "Pharmacy";
    const err = k => (pe.showErr || /^bc/.test(k)) && e[k] ? `<span class="err">${esc(e[k])}</span>` : "";
    const bad = k => (pe.showErr || /^bc/.test(k)) && e[k] ? "bad" : "";
    const fld = (label, path, ph, extra = "") => `<label class="field">${label}<input data-pd="${path}" data-fid="pe-${path}" ${path === "name" ? 'id="pe-name"' : ""} class="${bad(path === "drug.generic" ? "generic" : path)}" value="${esc(getPath(d, path))}" placeholder="${esc(ph)}" ${extra}>${err(path === "drug.generic" ? "generic" : path)}</label>`;
    const sel = (label, path, opts) => `<label class="field">${label}<select data-pd="${path}" data-fid="pe-${path}">${opts.map(([v, l]) => `<option value="${esc(v)}" ${getPath(d, path) === v ? "selected" : ""}>${esc(l)}</option>`).join("")}</select></label>`;
    const seg = (path, opts) => `<div class="seg">${opts.map(([v, l]) => `<button data-act="pe-val" data-path="${path}" data-v="${v}" aria-pressed="${getPath(d, path) === v}">${l}</button>`).join("")}</div>`;
    const tabErr = { general: ["name"], variants: Object.keys(e).filter(k => /^(bc|vl|vp)/.test(k)), prices: ["newFrom", "newPrice"], pharmacy: ["generic"] };
    const tabs = [["general", "General"], ["variants", "Variants & barcodes"], ["prices", "Prices"], ["stock", "Stock & batches"], ...(pharm ? [["pharmacy", "Pharmacy"]] : []), ["history", "History"]];
    if (!tabs.some(t => t[0] === pe.tab)) pe.tab = "general";
    const retail = parseFloat(d.variants[0].price) || 0, cost = parseFloat(d.cost) || 0, margin = retail ? Math.round((retail - cost) / retail * 1000) / 10 : 0;
    let body = "";
    if (pe.tab === "general") body = `
      <div class="card"><h2>Names</h2><div class="form-grid">
        <div class="full">${fld("Name in English *", "name", "e.g. Milk powder 400g")}</div>
        ${fld(`<span class="lang">සිංහල ${!d.nameSi ? badge("warning", "Missing", null) : ""}</span>`, "nameSi", "Sinhala name (optional)")}
        ${fld(`<span class="lang">தமிழ் ${!d.nameTa ? badge("warning", "Missing", null) : ""}</span>`, "nameTa", "Tamil name (optional)")}
        <div class="full note">${ic("help", 16)}Cashiers see the name in their own language. Search finds all three.</div></div></div>
      <div class="card"><h2>Classification</h2><div class="form-grid">
        ${sel("Category", "cat", CATS_ADMIN.map(c => [c, c]))}${sel("Brand", "brand", BRANDS.map(b => [b, b]))}
        <div class="field">Item type${seg("type", [["stocked", "Stocked item"], ["weighed", "Weighed (kg)"], ["service", "Service"]])}</div>
        ${sel("Tax", "tax", Object.entries(TAX))}
        <div class="field full"><span>Status</span><label class="check-row" style="font-weight:500"><input type="checkbox" class="toggle" data-pd="active" data-fid="pe-active" ${d.active ? "checked" : ""}>${d.active ? "Active · can be sold" : "Archived · hidden from the register"}</label></div>
        <div class="full note">${ic("package", 16)}${d.cat === "Pharmacy" || d.cat === "Dairy" ? "Batch and expiry are required when receiving this item." : "Batch tracking is optional for this category."}</div></div></div>`;
    if (pe.tab === "variants") body = `
      <div class="card"><div class="card-head"><h2>Variants &amp; barcodes</h2><button class="btn secondary s" data-act="pe-addv">${ic("plus", 16)}Add variant</button></div>
        <div class="vt"><div class="vrow head"><span>Variant</span><span>SKU</span><span>Barcode</span><span>Price (Rs)</span><span></span></div>
        ${d.variants.map((v, i) => `<div class="vrow"><div><input data-pd="variants.${i}.label" data-fid="pe-v${i}l" class="${bad("vl" + i)}" value="${esc(v.label)}" placeholder="e.g. 400 g">${err("vl" + i)}</div>
          <input data-pd="variants.${i}.sku" data-fid="pe-v${i}s" value="${esc(v.sku)}" placeholder="SKU">
          <div><input data-pd="variants.${i}.barcode" data-fid="pe-v${i}b" class="${bad("bc" + i)}" value="${esc(v.barcode)}" placeholder="EAN-13" inputmode="numeric">${err("bc" + i)}</div>
          <div><input data-pd="variants.${i}.price" data-fid="pe-v${i}p" class="${bad("vp" + i)}" value="${esc(v.price)}" inputmode="decimal" placeholder="0.00">${err("vp" + i)}</div>
          <button class="icon-btn" data-act="pe-delv" data-i="${i}" ${d.variants.length === 1 ? "disabled" : ""} aria-label="Remove variant">${ic("trash", 18)}</button></div>`).join("")}</div>
        <div class="note">${ic("scan", 16)}Each variant is its own SKU with its own barcode. A barcode can belong to only one product (checked as you type).</div></div>
      <div class="card"><h2>Pack units</h2><div class="dlines">${unitsFor({ weighed: d.type === "weighed", cat: d.cat }).map(u => `<div class="dline"><span class="grow"><b>${esc(u.l)}</b><small>${u.f === 1 ? "Base unit · stock is counted in this unit" : `= ${u.f} × base unit · used when receiving`}</small></span></div>`).join("")}</div></div>`;
    if (pe.tab === "prices") body = `
      <div class="card"><h2>Prices</h2><div class="form-grid">
        <label class="field">Retail price (Rs) *<input data-pd="variants.0.price" data-fid="pe-retail" inputmode="decimal" value="${esc(d.variants[0].price)}" class="${bad("vp0")}">${err("vp0")}<span class="hint">Main variant · ${esc(d.variants[0].label || "—")}</span></label>
        ${fld("Wholesale price (Rs)", "wholesale", "0.00", 'inputmode="decimal"')}
        ${fld("Average cost (Rs)", "cost", "0.00", 'inputmode="decimal"')}
        <div class="field">Gross margin<div class="${margin < 10 ? "diff short" : "diff zero"}" style="font-size:28px;line-height:44px">${margin}%</div></div>
        ${fld("Offer (% off)", "offer", "e.g. 10", 'inputmode="numeric"')}
        <div class="field"><span>&nbsp;</span><span class="hint">An offer shows on the product card and is applied automatically at the till.</span></div></div></div>
      <div class="card"><h2>Scheduled price change</h2><div class="form-grid">
        ${fld("New retail price (Rs)", "newPrice", "e.g. 1,200.00", 'inputmode="decimal"')}
        <label class="field">Starts on<input type="date" data-pd="newFrom" data-fid="pe-newFrom" class="${bad("newFrom")}" value="${esc(d.newFrom)}">${err("newFrom")}</label>
        <div class="full note">${ic("clock", 16)}${d.newFrom && d.newPrice ? `Registers switch to ${fmt(Math.round(parseFloat(d.newPrice) * 100))} at 00:00 on ${fmtExpIso(d.newFrom)} — even if they are offline.` : "Registers receive the change in advance and switch at midnight, even offline."}</div></div></div>`;
    if (pe.tab === "stock") {
      const lots = p ? lotsOf(p).filter(l => l.qty > 0) : [];
      body = `<div class="card"><h2>Stock at CMB01</h2><div class="kpis2">
          <div class="stat"><span>On hand</span><b>${p ? (p.weighed ? p.stock.toFixed(1) + " kg" : p.stock) : 0}</b></div>
          <div class="stat"><span>Value at cost</span><b>${fmt(p ? Math.round(p.stock * p.cost) : 0)}</b></div>
          <label class="stat" style="display:block"><span>Reorder level</span><input data-pd="reorder" data-fid="pe-reorder" inputmode="numeric" value="${esc(d.reorder)}" style="height:32px;width:100%;border:1px solid var(--border);border-radius:8px;padding:0 8px;margin-top:4px;background:var(--surface);color:var(--text);font:inherit;font-weight:700"></label></div>
        ${p && p.stock <= (parseInt(d.reorder, 10) || 0) ? `<div class="banner">${ic("alert")}At or below the reorder level · included in the low-stock alert</div>` : ""}</div>
        <div class="card"><div class="card-head"><h2>Batches</h2><button class="btn secondary s" data-act="nav" data-view="receiving">${ic("truck", 16)}Receive goods</button></div>
          ${lots.length ? `<div class="dlines">${lots.map(b => { const x = expInfo(b.exp); return `<div class="dline"><span class="grow"><b>${esc(b.id)}</b><small>Expires ${fmtExpIso(b.exp)}</small></span>${x && x.tone ? badge(x.tone, x.label, "alert") : ""}<b>${b.qty}</b></div>`; }).join("")}</div>` : `<div class="sub">No batches recorded yet. Batches are created when goods are received.</div>`}</div>`;
    }
    if (pe.tab === "pharmacy") body = `
      <div class="card"><h2>Drug information</h2><div class="form-grid">
        ${fld("Generic name *", "drug.generic", "e.g. Paracetamol")}${fld("Strength", "drug.strength", "e.g. 500 mg")}
        ${sel("Form", "drug.form", ["Tablet", "Capsule", "Syrup", "Injection", "Cream", "Drops", "Inhaler"].map(x => [x, x]))}
        <div class="field">Schedule${seg("drug.schedule", [["OTC", "Over the counter"], ["Rx", "Prescription (Rx)"]])}</div>
        <div class="full note">${ic("note", 16)}${d.drug.schedule === "Rx" ? "The register asks for prescription details and a pharmacist PIN before completing the sale." : "Can be sold without a prescription."} Generic-name search lets the pharmacist offer cheaper brands.</div></div></div>`;
    if (pe.tab === "history") body = `<div class="card"><h2>Change history</h2>${p ? `<div class="timeline">${p.log.map(x => `<div><span><b>${esc(x.what)}</b><small>${x.when.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}, ${hm(x.when)} · ${esc(x.who)}</small></span></div>`).join("")}</div>` : `<div class="sub">History starts when the product is saved.</div>`}<div class="note">${ic("lock", 16)}Every change is kept in the audit log.</div></div>`;
    const prev = previewProduct(d);
    const side = `<aside style="display:flex;flex-direction:column;gap:16px">
      <div class="card"><h2>On the register</h2><div style="max-width:220px;pointer-events:none">${productCard(prev).replace('data-act="card"', "").replace('tabindex="0"', "")}</div><div class="sub" style="font-size:13px">Updates as you type.</div></div>
      <div class="card"><h2>Image</h2><div class="img-drop"><span class="thumb tile-${prev.tone}">${ic(prev.icon, 48)}</span>Drop a photo here or click to upload<br><span class="hint">JPG or PNG, square, at least 600 px</span></div></div>
    </aside>`;
    return `<div class="editor">
      <div class="etabs" role="tablist">${tabs.map(([k, l]) => `<button role="tab" data-act="pe-tab" data-tab="${k}" aria-selected="${pe.tab === k}">${l}${(tabErr[k] || []).some(x => e[x] && (pe.showErr || /^bc/.test(x))) ? '<span class="dot" aria-label="has errors"></span>' : ""}</button>`).join("")}</div>
      <div class="ebody"><div style="display:flex;flex-direction:column;gap:16px;min-width:0">${body}</div>${side}</div>
      <div class="save-bar"><span class="sub">${peDirty() ? "You have unsaved changes" : p ? `Saved · last change ${p.updated.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}` : "New product · not saved yet"}</span>
        <button class="btn ghost" data-act="p-back">Cancel</button>
        ${p ? `<button class="btn secondary" data-act="pe-archive">${p.active ? "Archive" : "Restore"}</button>` : ""}
        <button class="btn primary" data-act="pe-save" ${peDirty() || !p ? "" : "disabled"}>${ic("check")}${p ? "Save" : "Create product"} <kbd>Ctrl S</kbd></button></div>
    </div>`;
  }
  function leaveEditor(to) {
    if (peDirty()) { openModal({ type: "leave", to }); return; }
    S.pe = null; S.view = to; render();
  }

  // ---------- Stock on hand (A-40) ----------
  const BRANCHES = [["CMB01", "CMB01 · Colombo 03", 1], ["KDY01", "KDY01 · Kandy", 0.6], ["GAL01", "GAL01 · Galle", 0.3]];
  const qtyAt = (p, br) => br === "all" ? BRANCHES.reduce((a, b) => a + Math.max(0, Math.round(p.stock * b[2])), 0) : Math.max(0, br === "CMB01" ? p.stock : Math.round(p.stock * BRANCHES.find(b => b[0] === br)[2]));
  const fq = (p, q) => p.weighed ? (Math.round(q * 10) / 10) + " kg" : String(q);
  function stockList() {
    const s = S.stk, q = s.q.trim().toLowerCase();
    return PRODUCTS.filter(p => p.active !== false && (s.cat === "All" || p.cat === s.cat) && (!q || (p.name + " " + p.sku + " " + lotsOf(p).map(l => l.id).join(" ")).toLowerCase().includes(q))
      && (s.filter === "all" || (s.filter === "low" && p.stock > 0 && p.stock <= p.reorder) || (s.filter === "out" && p.stock <= 0) || (s.filter === "exp" && nearestExp(p) && expInfo(nearestExp(p).exp).days <= 90)));
  }
  function stockView() {
    const s = S.stk, list = stockList(), local = s.branch === "CMB01";
    const value = PRODUCTS.filter(p => p.active !== false).reduce((a, p) => a + Math.round(qtyAt(p, s.branch) * p.cost), 0);
    const retail = PRODUCTS.filter(p => p.active !== false).reduce((a, p) => a + Math.round(qtyAt(p, s.branch) * p.price), 0);
    const low = PRODUCTS.filter(p => p.active !== false && p.stock > 0 && p.stock <= p.reorder).length, out = PRODUCTS.filter(p => p.active !== false && p.stock <= 0).length;
    const chip = (v, l) => `<button class="chip" data-act="stk-filter" data-v="${v}" aria-pressed="${s.filter === v}">${l}</button>`;
    return `<div class="page">
      <div class="page-actions">
        <label class="search">${ic("search")}<span class="sr">Search stock</span><input id="stsearch" data-fid="stsearch" autocomplete="off" placeholder="Product, SKU or batch number…" value="${esc(s.q)}"><kbd>/</kbd></label>
        <select data-sk="branch" data-fid="sk-branch" aria-label="Branch">${[...BRANCHES.map(b => [b[0], b[1]]), ["all", "All branches"]].map(([v, l]) => `<option value="${v}" ${s.branch === v ? "selected" : ""}>${l}</option>`).join("")}</select>
        <select data-sk="cat" data-fid="sk-cat" aria-label="Category"><option value="All">All categories</option>${CATS_ADMIN.map(c => `<option ${s.cat === c ? "selected" : ""}>${c}</option>`).join("")}</select>
        <div class="chips">${chip("all", "All")}${chip("low", `Low · ${low}`)}${chip("out", `Out · ${out}`)}${chip("exp", "Expiring ≤ 90 days")}</div>
        <span class="spacer"></span>
        <button class="btn secondary" data-act="nav" data-view="counts">${ic("list", 18)}Stock count</button>
        <button class="btn secondary" data-act="toast" data-msg="stock-${s.branch}.xlsx exported">Export</button>
      </div>
      <div class="stats4"><div class="stat"><span>Stock value at cost</span><b>${fmt(value)}</b></div><div class="stat"><span>Retail value</span><b>${fmt(retail)}</b></div><div class="stat"><span>Low stock</span><b style="color:var(--warning-text)">${low}</b></div><div class="stat"><span>Out of stock</span><b style="color:var(--error-text)">${out}</b></div></div>
      ${local ? "" : `<div class="banner" style="background:var(--primary-tint);color:var(--primary-text)">${ic("store")}Viewing ${esc(BRANCHES.find(b => b[0] === s.branch) ? BRANCHES.find(b => b[0] === s.branch)[1] : "all branches")} · read-only here. Batches and adjustments are managed at each branch.</div>`}
      <div class="sttable" role="table" aria-label="Stock on hand">
        <div class="strow head" role="row"><span></span><span>Product</span><span class="r">On hand</span><span class="r c-reo">Reorder</span><span class="r c-val">Value at cost</span><span class="c-exp">Nearest expiry</span><span>Status</span><span></span></div>
        ${list.length ? list.map(p => {
          const q = qtyAt(p, s.branch), ne = nearestExp(p), ei = ne ? expInfo(ne.exp) : null, open = local && s.open[p.id], lots = lotsOf(p).filter(l => l.qty > 0 || l.blocked);
          const status = q <= 0 ? badge("error", "Out of stock", "alert") : q <= p.reorder ? badge("warning", "Low", "alert") : badge("success", "OK", null);
          return `<div class="strow prod" role="row" data-act="stk-toggle" data-id="${p.id}">
              <span class="chev ${open ? "open" : ""}">${local && lots.length ? ic("chevRight", 16) : ""}</span>
              <span class="pname"><span class="thumb tile-${p.tone}">${ic(p.icon, 20)}</span><span style="min-width:0"><b>${esc(p.name)}</b><small>${esc(p.sku)}${lots.length ? ` · ${lots.length} batch${lots.length === 1 ? "" : "es"}` : ""}</small></span></span>
              <span class="r ${q <= 0 ? "neg" : ""}">${fq(p, q)}</span><span class="r c-reo muted">${p.reorder}</span><span class="r c-val">${fmt(Math.round(q * p.cost))}</span>
              <span class="c-exp">${ei ? (ei.tone ? badge(ei.tone, ei.days < 0 ? "Expired" : ei.days + " days", "clock") : `<span class="muted">${fmtExpIso(ne.exp)}</span>`) : `<span class="muted">—</span>`}</span>
              <span>${status}</span>
              <span>${local ? `<button class="btn secondary" data-act="adj-open" data-id="${p.id}">Adjust</button>` : ""}</span></div>
            ${open ? lots.map(l => { const x = expInfo(l.exp); return `<div class="strow lot" role="row"><span></span><span class="lotname">${ic("package", 14)}<b>${esc(l.id)}</b>${l.fresh ? badge("info", "Just received", null) : ""}${l.blocked ? badge("error", "Blocked", "lock") : ""}${l.markdown ? badge("warning", `Clearance −${l.markdown}%`, "tag") : ""}</span><span class="r">${fq(p, l.qty)}</span><span class="c-reo"></span><span class="r c-val">${fmt(Math.round(l.qty * p.cost))}</span><span class="c-exp">${l.exp ? fmtExpIso(l.exp) : "—"}</span><span>${x && x.tone ? badge(x.tone, x.days < 0 ? `Expired ${-x.days} d ago` : `${x.days} days left`, "clock") : ""}</span><span>${l.qty > 0 ? `<button class="btn ghost" data-act="adj-open" data-id="${p.id}" data-lot="${esc(l.id)}">Adjust</button>` : ""}</span></div>`; }).join("") : ""}`;
        }).join("") : `<div class="empty"><span class="circle">${ic("warehouse", 28)}</span><h3>No stock matches</h3><span>Clear the filters or search for a batch number.</span></div>`}
      </div>
      ${S.moves.length ? `<div class="card"><h2>Movements this session</h2><div class="dlines">${S.moves.slice(0, 6).map(m => `<div class="dline"><span class="grow"><b>${esc(m.product)}${m.lot ? " · " + esc(m.lot) : ""}</b><small>${hm(m.when)} · ${esc(m.reason)} · ${esc(m.who)}${m.approver ? " · approved by " + esc(m.approver) : ""}${m.note ? " · " + esc(m.note) : ""}</small></span><b style="color:${m.qty < 0 ? "var(--error-text)" : "var(--success-text)"}">${m.qty > 0 ? "+" : "−"}${Math.abs(m.qty)}</b></div>`).join("")}</div><div class="note">${ic("lock", 16)}Each adjustment is a stock movement with a reason, kept in the audit log.</div></div>` : ""}
      <div class="table-foot"><span>${list.length} products · click a row to see batches</span><span>Value uses the average cost price</span></div>
    </div>`;
  }
  function openAdjust(pid, lotId, preset = {}) {
    const p = byId(pid);
    openModal({ type: "adjust", pid, lot: lotId || (lotsOf(p).find(l => l.qty > 0) || {}).id || "", dir: preset.dir || "out", qty: preset.qty != null ? String(preset.qty) : "", reason: preset.reason || "", note: "", stage: "form", pin: "", pinErr: false });
  }
  const adjQty = m => Math.max(0, parseFloat(m.qty) || 0);
  const adjNeedsMgr = m => S.user.role !== "Manager" && adjQty(m) * byId(m.pid).cost > ADJ_LIMIT;
  function adjustModal(m, head) {
    const p = byId(m.pid), lots = lotsOf(p).filter(l => l.qty > 0 || l.id === m.lot), lot = lots.find(l => l.id === m.lot), q = adjQty(m);
    const max = m.dir === "out" ? (lot ? lot.qty : p.stock) : Infinity, over = q > max;
    const ok = q > 0 && !over && m.reason;
    return `<div class="modal" role="dialog" aria-modal="true" aria-labelledby="mt" style="width:min(520px,100%)">${head("Adjust stock", `${p.name} · on hand ${fq(p, p.stock)} at CMB01`)}
      ${m.stage === "pin" ? `<div class="mgr"><div class="head">${ic("lock", 18)}Manager approval · ${m.dir === "out" ? "−" : "+"}${q} (${fmt(Math.round(q * p.cost))} at cost)</div><div class="pin-dots">${[0, 1, 2, 3].map(i => `<i class="${m.pin.length > i ? "on" : ""}"></i>`).join("")}</div>
          <div class="keypad">${["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "⌫"].map(k => `<button data-act="adj-pin" data-k="${k}" aria-label="${k === "⌫" ? "Backspace" : k === "C" ? "Clear" : k}">${k === "⌫" ? ic("backspace", 22) : k}</button>`).join("")}</div>
          ${m.pinErr ? `<div class="scan-error" role="alert">${ic("alert", 16)}Wrong manager PIN</div>` : `<div class="note">Demo manager PIN: 1234</div>`}</div>
          <div style="display:flex;gap:8px"><button class="btn secondary" data-act="adj-back" style="flex:1">Back</button><button class="btn primary" data-act="adj-submit" style="flex:2" ${m.pin.length === 4 ? "" : "disabled"}>Approve adjustment <kbd>Enter</kbd></button></div>`
      : `<div class="cm-kinds" style="grid-template-columns:1fr 1fr">${[["out", "Remove stock", "minus"], ["in", "Add stock", "plus"]].map(([k, l, i]) => `<button class="method" data-act="adj-dir" data-k="${k}" aria-pressed="${m.dir === k}">${ic(i, 20)}<span>${l}</span></button>`).join("")}</div>
        ${lots.length ? `<label class="field">Batch<select data-adj="lot" data-fid="adj-lot">${lots.map(l => `<option value="${esc(l.id)}" ${l.id === m.lot ? "selected" : ""}>${esc(l.id)} · ${fq(p, l.qty)} · exp ${l.exp ? fmtExpIso(l.exp) : "—"}</option>`).join("")}</select></label>` : ""}
        <label class="field">Quantity (${p.weighed ? "kg" : p.cat === "Pharmacy" ? "strips" : "pieces"})<input data-adj="qty" data-fid="adj-qty" id="adjqty" inputmode="decimal" value="${esc(m.qty)}" placeholder="0" class="${over ? "bad" : ""}">${over ? `<span class="err">Only ${fq(p, max)} in ${lot ? "this batch" : "stock"}</span>` : q ? `<span class="hint">${m.dir === "out" ? "−" : "+"}${fmt(Math.round(q * p.cost))} at cost · on hand becomes ${fq(p, Math.round((p.stock + (m.dir === "out" ? -q : q)) * 1000) / 1000)}</span>` : ""}</label>
        <div class="field">Reason<div class="chips wrap">${ADJ_REASONS[m.dir].map(r => `<button class="chip" data-act="adj-reason" data-v="${esc(r)}" aria-pressed="${m.reason === r}">${esc(r)}</button>`).join("")}</div></div>
        <label class="field">Note (optional)<input data-adj="note" data-fid="adj-note" value="${esc(m.note)}" placeholder="e.g. Box crushed during delivery"></label>
        ${adjNeedsMgr(m) ? `<div class="note">${ic("lock", 16)}Adjustments above ${fmt(ADJ_LIMIT)} at cost need a manager PIN</div>` : ""}
        <button class="btn primary l block" data-act="adj-submit" ${ok ? "" : "disabled"}>${ic(adjNeedsMgr(m) ? "lock" : "check")}${adjNeedsMgr(m) ? "Continue to approval" : "Save adjustment"} <kbd>Enter</kbd></button>`}
    </div>`;
  }
  function adjSubmit() {
    const m = S.modal, p = byId(m.pid), lot = lotsOf(p).find(l => l.id === m.lot), q = adjQty(m);
    const max = m.dir === "out" ? (lot ? lot.qty : p.stock) : Infinity;
    if (!q || !m.reason || q > max) { toast(!q ? "Enter a quantity" : !m.reason ? "Choose a reason" : "More than is in stock", { error: true }); return; }
    if (adjNeedsMgr(m) && m.stage !== "pin") { m.stage = "pin"; renderModal(); return; }
    if (adjNeedsMgr(m) && m.pin !== MANAGER_PIN) { m.pin = ""; m.pinErr = true; renderModal(); return; }
    const signed = m.dir === "out" ? -q : q;
    p.stock = Math.max(0, Math.round((p.stock + signed) * 1000) / 1000);
    if (lot) lot.qty = Math.max(0, Math.round((lot.qty + signed) * 1000) / 1000);
    const who = `${S.user.short} ${S.user.name.split(" ")[1][0]}.`, approver = adjNeedsMgr(m) ? "Malini J." : null;
    S.moves.unshift({ when: new Date(), product: p.name, lot: m.lot, qty: signed, reason: m.reason, note: m.note, who, approver });
    p.log.unshift({ when: new Date(), who, what: `Stock ${signed > 0 ? "+" : "−"}${Math.abs(signed)}${m.lot ? " (" + m.lot + ")" : ""} · ${m.reason}` });
    closeModal(); render(); toast(`${p.name}: ${signed > 0 ? "+" : "−"}${Math.abs(signed)} · ${m.reason}`);
  }

  // ---------- Expiry board (A-45) ----------
  function expiryView() {
    const f = S.exp, cols = [["Expired", -9999, -1, "var(--error)"], ["0 – 30 days", 0, 30, "var(--warning)"], ["31 – 60 days", 31, 60, "#E8B54A"], ["61 – 90 days", 61, 90, "var(--primary)"]];
    const items = [];
    for (const p of PRODUCTS) { if (p.active === false || (f.cat !== "All" && p.cat !== f.cat)) continue; for (const l of lotsOf(p)) { if (!(l.qty > 0) || !l.exp) continue; const x = expInfo(l.exp); if (x.days <= 90) items.push({ p, l, d: x.days }); } }
    items.sort((a, b) => a.d - b.d);
    const atRisk = items.reduce((a, it) => a + Math.round(it.l.qty * it.p.cost), 0);
    return `<div class="page">
      <div class="page-actions">
        <select data-ex="cat" data-fid="ex-cat" aria-label="Category"><option value="All">All categories</option>${CATS_ADMIN.map(c => `<option ${f.cat === c ? "selected" : ""}>${c}</option>`).join("")}</select>
        <select aria-label="Branch" disabled><option>CMB01 · Colombo 03</option></select>
        <span class="spacer"></span><span class="sub" style="font-size:14px;color:var(--text-2)">Stock value at risk in the next 90 days: <b style="color:var(--text)">${fmt(atRisk)}</b></span>
        <button class="btn secondary" data-act="toast" data-msg="Expiry report exported">Export</button>
      </div>
      <div class="kanban">${cols.map(([title, lo, hi, color]) => {
        const its = items.filter(it => it.d >= lo && it.d <= hi), val = its.reduce((a, it) => a + Math.round(it.l.qty * it.p.cost), 0);
        return `<section class="kcol" aria-label="${title}"><div class="kcol-head"><i style="background:${color}"></i><h3>${title}</h3>${badge(lo < 0 ? "error" : lo === 0 ? "warning" : "", String(its.length), null)}</div><div class="sub">${fmt(val)} at cost</div>
          ${its.length ? its.map(({ p, l, d }) => `<div class="kcard ${l.blocked ? "blocked" : ""}">
            <div class="top"><span class="thumb tile-${p.tone}">${ic(p.icon, 18)}</span><span style="min-width:0"><b>${esc(p.name)}</b><small>${esc(l.id)} · exp ${fmtExpIso(l.exp)}</small></span></div>
            <div class="facts"><span>Qty <b>${fq(p, l.qty)}</b></span><span>Value <b>${fmt(Math.round(l.qty * p.cost))}</b></span><span><b style="color:${d < 0 ? "var(--error-text)" : d <= 30 ? "var(--warning-text)" : "var(--text)"}">${d < 0 ? `${-d} d ago` : `${d} days`}</b></span></div>
            ${l.blocked ? badge("error", "Blocked · not sellable", "lock") : ""}${l.markdown ? badge("warning", `Clearance −${l.markdown}% on this batch`, "tag") : ""}
            <div class="acts">${d < 0 ? `<button class="btn danger" data-act="ex-writeoff" data-id="${p.id}" data-lot="${esc(l.id)}">Write off</button><button class="btn secondary" data-act="ex-return" data-id="${p.id}" data-lot="${esc(l.id)}">Return to supplier</button>`
              : `${l.markdown ? "" : `<button class="btn secondary" data-act="ex-markdown" data-id="${p.id}" data-lot="${esc(l.id)}">Clearance −20%</button>`}<button class="btn secondary" data-act="ex-block" data-id="${p.id}" data-lot="${esc(l.id)}">${l.blocked ? "Unblock" : "Block"}</button><button class="btn ghost" data-act="ex-front" data-id="${p.id}" data-lot="${esc(l.id)}">Move to front</button>`}</div></div>`).join("")
          : `<div class="kempty">${ic("check", 16)} Nothing here</div>`}</section>`; }).join("")}</div>
      <div class="note">${ic("help", 16)}Expired batches are blocked at the till automatically (BR-09). Writing off creates an "Expired write-off" stock movement; clearance prices apply only when that batch is scanned.</div>
    </div>`;
  }
  const findLot = (pid, id) => lotsOf(byId(pid)).find(l => l.id === id);

  // ---------- Shared: step bar with custom labels ----------
  const stepsBar = (labels, step) => `<div class="stepbar" aria-label="Steps">${labels.map((x, i) => `<span class="${i + 1 === step ? "on" : i + 1 < step ? "done" : ""}" ${i + 1 === step ? 'aria-current="step"' : ""}><i>${i + 1 < step ? "✓" : i + 1}</i>${x}</span>`).join("")}</div>`;
  const meShort = () => `${S.user.short} ${S.user.name.split(" ")[1][0]}.`;
  const signed = (c, plus = "+") => (c < 0 ? "−" : c > 0 ? plus : "") + fmt(Math.abs(c));

  // ---------- Stock counts (A-44) ----------
  const CNT_TYPES = {
    cycle: ["Cycle count", "A short list of high-value fast movers picked by the system. Count a few every day.", "refresh"],
    category: ["Category count", "Every product in one category, e.g. Pharmacy once a month.", "grid"],
    full: ["Full count", "Every product in the branch. Usually once a year, before opening.", "warehouse"]
  };
  const CNT_STEPS = ["Count", "Review differences", "Posted"];
  S.cnt = { seq: 42, cur: null, form: { type: "cycle", cat: "Pharmacy", blind: true }, filter: "all",
    list: [
      { no: "CNT-0041", type: "cycle", scope: "8 fast movers", by: "Kasun S.", when: daysAgo(3, 8, 15), items: 8, value: -96000 },
      { no: "CNT-0040", type: "category", scope: "Pharmacy", by: "Kasun S.", when: daysAgo(9, 7, 40), items: 186, value: -215000 },
      { no: "CNT-0039", type: "full", scope: "All categories", by: "Malini J.", when: daysAgo(46, 6, 30), items: 1248, value: -1842000 }
    ] };
  const cntVal = it => it.cnt === "" || it.cnt == null ? null : Math.max(0, Math.round((parseFloat(it.cnt) || 0) * 1000) / 1000);
  const cntDiff = it => { const v = cntVal(it); return v == null ? null : Math.round((v - it.exp) * 1000) / 1000; };
  function cntScope(f) {
    let ps = PRODUCTS.filter(p => p.active !== false);
    if (f.type === "category") ps = ps.filter(p => p.cat === f.cat);
    if (f.type === "cycle") ps = ps.filter(p => p.stock > 0).sort((a, b) => b.cost * b.stock - a.cost * a.stock).slice(0, 8);
    return ps;
  }
  function cntStats(c) {
    const s = { counted: 0, total: c.items.length, match: 0, short: 0, over: 0, shortV: 0, overV: 0 };
    for (const it of c.items) {
      const d = cntDiff(it); if (d == null) continue; s.counted++;
      const v = Math.round(d * byId(it.pid).cost);
      if (!d) s.match++; else if (d < 0) { s.short++; s.shortV += v; } else { s.over++; s.overV += v; }
    }
    s.net = s.shortV + s.overV; s.abs = s.overV - s.shortV;
    return s;
  }
  const cntNeedsMgr = c => S.user.role !== "Manager" && cntStats(c).abs > ADJ_LIMIT;
  const cntUnit = p => p.weighed ? "kg" : p.cat === "Pharmacy" ? "strips" : "pcs";
  function startCount() {
    const f = S.cnt.form, ps = cntScope(f);
    if (!ps.length) { toast("No active products in this category", { error: true }); return; }
    S.cnt.cur = { no: `CNT-${String(S.cnt.seq).padStart(4, "0")}`, type: f.type, blind: f.blind, step: "count", q: "", err: "", flash: null, confirmDiscard: false,
      scope: f.type === "full" ? "All categories" : f.type === "category" ? f.cat : `${ps.length} fast movers`, started: new Date(), by: meShort(),
      items: ps.map(p => ({ pid: p.id, exp: p.stock, cnt: "" })) };
    S.cnt.filter = "all"; render(); focusId("cntscan");
  }
  function cntScan(raw) {
    const c = S.cnt.cur, q = raw.trim(); c.err = ""; c.confirmDiscard = false;
    if (!q) return;
    const hit = findByCode(q), lc = q.toLowerCase();
    let ps = hit ? [hit.p] : PRODUCTS.filter(p => p.sku.toLowerCase() === lc || p.variants.some(v => v.barcode === q));
    const exact = ps.length > 0;
    if (!exact) ps = PRODUCTS.filter(p => p.name.toLowerCase().includes(lc));
    const mine = ps.filter(p => c.items.some(it => it.pid === p.id));
    if (!ps.length) c.err = `Nothing matches "${q}". Check the barcode, or type part of the name.`;
    else if (!mine.length) c.err = `${ps[0].name} is not part of this count (${c.scope}). Count it in another count.`;
    else if (mine.length > 1) c.err = `${mine.length} products match "${q}": ${mine.slice(0, 3).map(p => p.name).join(", ")}. Type more of the name, or scan the barcode.`;
    if (c.err) { c.q = q; render(); focusId("cntscan"); return; }
    const p = mine[0], it = c.items.find(x => x.pid === p.id);
    c.q = ""; c.flash = p.id; S.cnt.filter = "all";
    if (exact && (!p.weighed || hit && hit.qty)) {
      it.cnt = String(Math.round(((cntVal(it) || 0) + (hit && hit.qty ? hit.qty : 1)) * 1000) / 1000);
      render(); focusId("cntscan");
    } else { render(); selectId("cq-" + p.id); }
  }
  function selectId(id) { setTimeout(() => { const x = document.getElementById(id); if (x) { x.focus(); x.select(); x.scrollIntoView({ block: "nearest" }); } }); }
  function cntStep(pid, d) {
    const c = S.cnt.cur, it = c.items.find(x => x.pid === pid), p = byId(pid), step = p.weighed ? 0.1 : 1;
    it.cnt = String(Math.max(0, Math.round(((cntVal(it) || 0) + d * step) * 1000) / 1000)); c.flash = null; c.confirmDiscard = false; render();
  }
  function cntDemo() {
    const c = S.cnt.cur;
    c.items.forEach((it, i) => {
      const p = byId(it.pid), w = p.weighed;
      if (i === c.items.length - 1 && c.items.length > 3) { it.cnt = ""; return; }   // one product left uncounted
      const d = i === 0 ? (w ? -0.35 : -2) : i === 2 ? -1 : i === 4 ? 1 : 0;
      it.cnt = String(Math.max(0, Math.round((it.exp + d) * 1000) / 1000));
    });
    c.flash = null; render(); toast("Demo counts filled in · one product left uncounted");
  }
  function cntPost(approved) {
    const c = S.cnt.cur;
    if (cntNeedsMgr(c) && !approved) { openModal({ type: "cntpin", pin: "", pinErr: false }); return; }
    const st = cntStats(c), by = meShort(), approver = cntNeedsMgr(c) ? "Malini J." : null;
    let changed = 0;
    for (const it of c.items) {
      const d = cntDiff(it); if (!d) continue;
      const p = byId(it.pid); changed++;
      p.stock = Math.max(0, Math.round((p.stock + d) * 1000) / 1000);      // sales made during the count stay counted
      const lots = lotsOf(p).filter(l => l.qty > 0 && l.exp).sort((a, b) => a.exp.localeCompare(b.exp));
      if (lots.length && d < 0) { let left = -d; for (const l of lots) { const t = Math.min(l.qty, left); l.qty = Math.round((l.qty - t) * 1000) / 1000; left -= t; if (left <= 0) break; } }
      else if (lots.length) lots[lots.length - 1].qty += d;
      S.moves.unshift({ when: new Date(), product: p.name, lot: "", qty: d, reason: `Count correction · ${c.no}`, note: "", who: by, approver });
      p.log.unshift({ when: new Date(), who: by, what: `Stock ${d > 0 ? "+" : "−"}${Math.abs(d)} · count ${c.no}` });
    }
    c.step = "posted"; c.posted = { when: new Date(), changed, st, approver };
    S.cnt.list.unshift({ no: c.no, type: c.type, scope: c.scope, by, when: new Date(), items: st.counted, value: st.net });
    S.cnt.seq++; S.modal = null; renderModal(); render();
  }
  function cntApprove() { const m = S.modal; if (m.pin !== MANAGER_PIN) { m.pin = ""; m.pinErr = true; renderModal(); return; } cntPost(true); }
  function cntPinModal(m, head) {
    const st = cntStats(S.cnt.cur);
    return `<div class="modal" role="dialog" aria-modal="true" aria-labelledby="mt" style="width:min(440px,100%)">${head("Manager approval", `${S.cnt.cur.no} · differences of ${fmt(st.abs)} at cost`)}
      <div class="mgr"><div class="head">${ic("lock", 18)}Counts that change more than ${fmt(ADJ_LIMIT)} of stock need a manager</div>
        <div class="pin-dots">${[0, 1, 2, 3].map(i => `<i class="${m.pin.length > i ? "on" : ""}"></i>`).join("")}</div>
        <div class="keypad">${["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "⌫"].map(k => `<button data-act="cnt-pin" data-k="${k}" aria-label="${k === "⌫" ? "Backspace" : k === "C" ? "Clear" : k}">${k === "⌫" ? ic("backspace", 22) : k}</button>`).join("")}</div>
        ${m.pinErr ? `<div class="scan-error" role="alert">${ic("alert", 16)}Wrong manager PIN</div>` : `<div class="note">Demo manager PIN: 1234</div>`}</div>
      <button class="btn primary l block" data-act="cnt-approve" ${m.pin.length === 4 ? "" : "disabled"}>${ic("check")}Approve and post <kbd>Enter</kbd></button></div>`;
  }
  function countsView() {
    const c = S.cnt.cur;
    if (S.user.role === "Cashier") return `<div class="placeholder"><div class="empty"><span class="circle">${ic("lock", 28)}</span><h3>Stock counts are for stock keepers and managers</h3><span>${esc(S.user.short)} is signed in as cashier. Ask Kasun or a manager to run the count.</span><button class="btn primary s" data-act="logout">Switch user</button></div></div>`;
    if (!c) return countsHome();
    if (c.step === "posted") return countPosted(c);
    if (c.step === "review") return countReview(c);
    return countSheet(c);
  }
  function countsHome() {
    const f = S.cnt.form, n = cntScope(f).length, ago = S.cnt.list.filter(x => dayDiff(x.when) <= 90).reduce((a, x) => a + x.value, 0);
    return `<div class="page"><div class="cnt-home">
      <section class="card" aria-labelledby="cnt-new"><h2 id="cnt-new">Start a count</h2>
        <div class="cnt-types" role="radiogroup" aria-label="Type of count">${Object.entries(CNT_TYPES).map(([k, [l, d, i]]) => `<button class="cnt-type" role="radio" data-act="cnt-type" data-k="${k}" aria-checked="${f.type === k}"><span class="thumb tile-${k === "full" ? "purple" : k === "category" ? "teal" : "blue"}">${ic(i, 20)}</span><span class="grow"><b>${l}</b><small>${d}</small></span><i class="radio"></i></button>`).join("")}</div>
        ${f.type === "category" ? `<label class="field">Category<select data-cf="cat" data-fid="cf-cat">${CATS_ADMIN.map(c => `<option ${f.cat === c ? "selected" : ""}>${c}</option>`).join("")}</select></label>` : ""}
        <label class="check-row"><input type="checkbox" data-act="cnt-blind" ${f.blind ? "checked" : ""}><span><b>Blind count</b><small>Hide the expected quantity on the count sheet, so people count what is really on the shelf.</small></span></label>
        <div class="note">${ic("help", 16)}Selling can go on while you count. Sales made after you start are allowed for when you post.</div>
        <button class="btn primary l block" data-act="cnt-start" ${n ? "" : "disabled"}>${ic("list")}Start count · ${n} product${n === 1 ? "" : "s"}</button>
      </section>
      <section class="card" aria-labelledby="cnt-recent"><div class="card-head"><h2 id="cnt-recent">Recent counts</h2><span class="sub">CMB01 · Colombo 03</span></div>
        <div class="dlines">${S.cnt.list.map(x => `<div class="dline"><span class="thumb tile-${x.type === "full" ? "purple" : x.type === "category" ? "teal" : "blue"}">${ic(CNT_TYPES[x.type][2], 18)}</span><span class="grow"><b>${x.no} · ${CNT_TYPES[x.type][0]}</b><small>${esc(x.scope)} · ${x.items.toLocaleString("en-US")} products · ${esc(x.by)} · ${dayDiff(x.when) === 0 ? "today " + hm(x.when) : x.when.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</small></span><span class="cnt-val"><b style="color:${x.value < 0 ? "var(--error-text)" : x.value > 0 ? "var(--success-text)" : "var(--text)"}">${signed(x.value)}</b>${badge("success", "Posted", null)}</span></div>`).join("")}</div>
        <div class="note">${ic("chart", 16)}Net count differences in the last 90 days: <b style="color:var(--text)">${signed(ago)}</b> at cost</div>
      </section>
    </div></div>`;
  }
  function countSheet(c) {
    const st = cntStats(c), pct = Math.round(st.counted / st.total * 100), F = S.cnt.filter;
    const rows = c.items.filter(it => F === "all" || (F === "todo") === (cntVal(it) == null));
    const chip = (v, l) => `<button class="chip" data-act="cnt-filter" data-v="${v}" aria-pressed="${F === v}">${l}</button>`;
    return `<div class="page">
      <div class="cnt-top">${stepsBar(CNT_STEPS, 1)}<span class="spacer"></span><button class="btn ${c.confirmDiscard ? "danger" : "ghost"}" data-act="cnt-cancel">${c.confirmDiscard ? "Click again to discard" : "Discard count"}</button></div>
      <div class="card cnt-bar"><span class="grow"><b>${c.no} · ${CNT_TYPES[c.type][0]}</b><small>${esc(c.scope)} · started ${hm(c.started)} by ${esc(c.by)}${c.blind ? ` · ${ic("lock", 12)} blind count` : ""}</small></span>
        <div class="cnt-prog" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="Counted"><div class="lbl"><span>${st.counted} of ${st.total} counted</span><b>${pct}%</b></div><div class="bar"><i style="width:${pct}%"></i></div></div></div>
      <div class="page-actions">
        <label class="search ${c.err ? "error" : ""}">${ic("scan", 20, "scan")}<span class="sr">Scan or search</span><input id="cntscan" data-fid="cntscan" autocomplete="off" placeholder="Scan a barcode (+1 per scan) or type a name" value="${esc(c.q)}"><kbd>Enter</kbd></label>
        <div class="chips">${chip("all", `All · ${st.total}`)}${chip("todo", `Not counted · ${st.total - st.counted}`)}${chip("done", `Counted · ${st.counted}`)}</div>
        <button class="btn ghost" data-act="cnt-demo">Demo: fill counts</button>
        <span class="spacer"></span>
        <button class="btn primary" data-act="cnt-review" ${st.counted ? "" : "disabled"}>Review differences <kbd>F10</kbd></button>
      </div>
      ${c.err ? `<div class="scan-error" role="alert">${ic("alert", 18)}${esc(c.err)}</div>` : ""}
      <div class="ctable" role="table" aria-label="Count sheet">
        <div class="crow head" role="row"><span>Product</span><span class="c-code">Barcode</span><span class="r">Expected</span><span class="c">Counted</span><span>Status</span></div>
        ${rows.length ? rows.map(it => {
          const p = byId(it.pid), v = cntVal(it), d = cntDiff(it);
          const status = v == null ? `<span class="muted">Not counted</span>` : c.blind ? badge("info", "Counted", "check") : !d ? badge("success", "Matches", "check") : badge(d < 0 ? "error" : "warning", `${d > 0 ? "+" : "−"}${fq(p, Math.abs(d))}`, null);
          return `<div class="crow ${c.flash === p.id ? "flash" : ""} ${v != null ? "done" : ""}" role="row">
            <span class="pname"><span class="thumb tile-${p.tone}">${ic(p.icon, 20)}</span><span style="min-width:0"><b>${esc(p.name)}</b><small>${esc(p.sku)} · ${esc(p.cat)}</small></span></span>
            <span class="c-code mono">${p.code}</span>
            <span class="r">${c.blind ? `<span class="muted hidden-q">${ic("lock", 14)}Hidden</span>` : fq(p, it.exp)}</span>
            <span class="c"><span class="qty"><button data-act="cnt-dec" data-id="${p.id}" aria-label="One less ${esc(p.name)}" tabindex="-1">${ic("minus", 16)}</button><input data-cq="${p.id}" data-fid="cq-${p.id}" id="cq-${p.id}" inputmode="decimal" autocomplete="off" value="${esc(it.cnt)}" placeholder="—" aria-label="Counted ${esc(p.name)} in ${cntUnit(p)}"><button data-act="cnt-inc" data-id="${p.id}" aria-label="One more ${esc(p.name)}" tabindex="-1">${ic("plus", 16)}</button></span><small>${cntUnit(p)}</small></span>
            <span>${status}</span></div>`; }).join("")
          : `<div class="empty"><span class="circle">${ic("check", 28)}</span><h3>${F === "todo" ? "Everything is counted" : "Nothing counted yet"}</h3><span>${F === "todo" ? "Review the differences and post the count." : "Scan the first product on the shelf."}</span></div>`}
      </div>
      <div class="table-foot"><span>Enter or Tab moves to the next product · counts are saved on this device as you go</span><span>Works on a tablet: tap + / − or type the number</span></div>
    </div>`;
  }
  function countReview(c) {
    const st = cntStats(c), mgr = cntNeedsMgr(c);
    const diff = c.items.filter(it => cntDiff(it)), un = c.items.filter(it => cntVal(it) == null);
    return `<div class="page">
      <div class="cnt-top">${stepsBar(CNT_STEPS, 2)}<span class="spacer"></span><span class="sub">${c.no} · ${CNT_TYPES[c.type][0]} · ${esc(c.scope)}</span></div>
      <div class="stats4">
        <div class="stat"><span>Counted</span><b>${st.counted} of ${st.total}</b></div>
        <div class="stat"><span>Match</span><b style="color:var(--success-text)">${st.match}</b></div>
        <div class="stat"><span>Short · ${st.short} product${st.short === 1 ? "" : "s"}</span><b style="color:var(--error-text)">${signed(st.shortV)}</b></div>
        <div class="stat"><span>Over · ${st.over} product${st.over === 1 ? "" : "s"}</span><b style="color:var(--success-text)">${signed(st.overV)}</b></div>
      </div>
      <div class="ctable rv" role="table" aria-label="Differences">
        <div class="crow head" role="row"><span>Product</span><span class="r">Expected</span><span class="r">Counted</span><span class="r">Difference</span><span class="r c-code">Value at cost</span><span></span></div>
        ${diff.length ? diff.map(it => { const p = byId(it.pid), d = cntDiff(it), v = Math.round(d * p.cost); return `<div class="crow" role="row">
            <span class="pname"><span class="thumb tile-${p.tone}">${ic(p.icon, 20)}</span><span style="min-width:0"><b>${esc(p.name)}</b><small>${esc(p.sku)}</small></span></span>
            <span class="r muted">${fq(p, it.exp)}</span><span class="r">${fq(p, cntVal(it))}</span>
            <span class="r"><b style="color:${d < 0 ? "var(--error-text)" : "var(--success-text)"}">${d > 0 ? "+" : "−"}${fq(p, Math.abs(d))}</b></span>
            <span class="r c-code">${signed(v)}</span>
            <span class="r"><button class="btn ghost" data-act="cnt-recount" data-id="${p.id}">Recount</button></span></div>`; }).join("")
          : `<div class="empty"><span class="circle">${ic("check", 28)}</span><h3>Every counted product matches</h3><span>Posting records the count with no stock changes.</span></div>`}
      </div>
      ${un.length ? `<div class="banner">${ic("alert")}<span><b>${un.length} product${un.length === 1 ? " was" : "s were"} not counted:</b> ${un.slice(0, 4).map(it => esc(byId(it.pid).name)).join(", ")}${un.length > 4 ? "…" : ""}. ${un.length === 1 ? "Its" : "Their"} stock stays as it is.</span><button class="btn secondary" data-act="cnt-todo">Count ${un.length === 1 ? "it" : "them"}</button></div>` : ""}
      <div class="card cnt-foot">
        <span class="grow"><b>Net difference ${signed(st.net)} at cost</b><small>Posting sets stock to what you counted and records one "Count correction" movement per product (INV-04).</small></span>
        ${mgr ? `<span class="note">${ic("lock", 16)}More than ${fmt(ADJ_LIMIT)} · needs a manager PIN</span>` : ""}
        <button class="btn secondary l" data-act="cnt-back">Back to count sheet</button>
        <button class="btn primary l" data-act="cnt-post">${ic(mgr ? "lock" : "check")}Post count <kbd>F10</kbd></button>
      </div>
    </div>`;
  }
  function countPosted(c) {
    const P = c.posted, st = P.st;
    const row = (l, v, col) => `<div class="dline"><span class="grow">${l}</span><b style="${col ? "color:" + col : ""}">${v}</b></div>`;
    return `<div class="body"><section class="complete">
      <div class="success-mark"><div>${ic("check", 40)}</div></div>
      <h1>Count posted</h1><div class="sub">${c.no} · ${CNT_TYPES[c.type][0]} · ${esc(c.scope)}${P.approver ? ` · approved by ${P.approver}` : ""}</div>
      <div class="card" style="width:min(560px,100%);text-align:left"><div class="dlines">
        ${row("Products counted", `${st.counted} of ${st.total}`)}${row("Matched", st.match, "var(--success-text)")}${row(`Short · ${st.short}`, signed(st.shortV), "var(--error-text)")}${row(`Over · ${st.over}`, signed(st.overV), "var(--success-text)")}${row("Stock adjusted", `${P.changed} product${P.changed === 1 ? "" : "s"}`)}
      </div><div class="note">${ic("lock", 16)}Each change is a "Count correction" stock movement in the audit log.</div></div>
      <div class="actions"><button class="btn primary l" data-act="cnt-done">Back to counts <kbd>Enter</kbd></button><button class="btn secondary l" data-act="toast" data-msg="Variance report for ${c.no} sent to the printer">${ic("printer")}Print variance report</button><button class="btn ghost l" data-act="nav" data-view="stock">${ic("warehouse")}Stock on hand</button></div>
    </section></div>`;
  }

  // ---------- Import wizard (A-23) ----------
  const IMP_STEPS = ["Template", "Upload", "Match columns", "Preview", "Import", "Result"];
  const IMP_COLS = ["Item Name", "SKU", "Barcode", "Category", "Selling Price", "Cost Price", "VAT", "Sinhala Name", "Shelf"];
  const IMP_FIELDS = [["name", "Product name", true], ["sku", "SKU", true], ["barcode", "Barcode", false], ["cat", "Category", true], ["price", "Selling price (Rs)", true], ["cost", "Cost price (Rs)", false], ["tax", "VAT (Standard / Exempt)", false], ["nameSi", "Name in Sinhala", false], ["nameTa", "Name in Tamil", false], ["reorder", "Reorder level", false]];
  const IMP_AUTO = { "Item Name": "name", SKU: "sku", Barcode: "barcode", Category: "cat", "Selling Price": "price", "Cost Price": "cost", VAT: "tax", "Sinhala Name": "nameSi", Shelf: "" };
  const IMP_ROWS = [
    ["Milk powder 400g", "MP-400", "4791111000011", "Dairy", "1190.00", "860.00", "Standard", "කිරි පිටි 400g", "A3"],
    ["Basmati rice 5kg", "BR-5K", "4791111000028", "Grocery", "3250.00", "2340.00", "Exempt", "බාස්මතී සහල් 5kg", "B1"],
    ["Paracetamol 500mg", "PC-500", "4791111000035", "Pharmacy", "32.00", "23.00", "Exempt", "පැරසිටමෝල් 500mg", "P2"],
    ["Panadol Extra 500mg", "PE-500", "4792222000017", "Pharmacy", "48.00", "35.00", "Exempt", "", "P2"],
    ["Ceylon black tea 200g", "CT-200", "4791111000103", "Beverages", "790.00", "560.00", "Standard", "ලංකා කළු තේ 200g", "C4"],
    ["Fresh milk 1L", "FM-1L", "4792222000024", "Dairy", "520.00", "410.00", "Exempt", "දියර කිරි 1L", "F1"],
    ["Bottled water 1.5L", "BW-15", "4791111000097", "Beverages", "150.00", "100.00", "Standard", "", "C1"],
    ["Yoghurt 80g", "YG-80", "4792222000031", "Dairy", "90.00", "68.00", "Exempt", "යෝගට් 80g", "F1"],
    ["Ginger tea 20 bags", "GT-20", "4792222000048", "Beverages", "12,50o", "310.00", "Standard", "", "C4"],
    ["Toothpaste 120g", "TP-120", "4791111000059", "Personal care", "380.00", "274.00", "Standard", "", "D2"],
    ["Shampoo 340ml", "SH-340", "4791111000066", "Personal care", "1150.00", "785.00", "Standard", "", "D2"],
    ["Red raw rice 5kg", "RR-5K", "4792222000055", "Grocery", "1450.00", "1100.00", "Exempt", "රතු කැකුළු සහල් 5kg", "B1"],
    ["Cream crackers 500g", "CC-500", "4791111000073", "Grocery", "540.00", "374.00", "Standard", "", "B3"],
    ["Herbal soap 100g", "HS-100", "4791111000059", "Personal care", "165.00", "120.00", "Standard", "", "D3"],
    ["Eggs 10-pack", "EG-10", "4791111000080", "Grocery", "650.00", "468.00", "Exempt", "බිත්තර 10", "F2"],
    ["Vitamin C 1000mg", "VC-1000", "4792222000062", "Pharmacy", "85.00", "60.00", "Exempt", "", "P3"],
    ["Frozen peas 500g", "FP-500", "4792222000079", "Frozen", "690.00", "500.00", "Standard", "", "Z1"],
    ["Dishwash liquid 500ml", "DW-500", "4792222000086", "Household", "395.00", "280.00", "Standard", "", "H1"]
  ];
  const IMP_TEMPLATES = [["products", "Products", "Create new products and update names, categories and prices", "package"], ["prices", "Price list", "Change selling prices only, matched by SKU or barcode", "tag"], ["stock", "Opening stock", "Starting quantities and batches for a new branch", "warehouse"]];
  const emptyImp = () => ({ step: 1, kind: "products", file: null, map: { ...IMP_AUTO }, touched: {}, skip: false, filter: "all", progress: 0, job: null, result: null, fileErr: "" });
  S.imp = emptyImp(); S.impSeq = 318;
  const impCol = f => IMP_COLS.findIndex(c => S.imp.map[c] === f);
  const impColName = f => { const i = impCol(f); return i < 0 ? (IMP_FIELDS.find(x => x[0] === f) || [, f])[1] : IMP_COLS[i]; };
  function impMapIssues() {
    const used = Object.values(S.imp.map).filter(Boolean);
    return { miss: IMP_FIELDS.filter(f => f[2] && !used.includes(f[0])).map(f => f[1]), dup: IMP_FIELDS.filter(f => used.filter(u => u === f[0]).length > 1).map(f => f[1]) };
  }
  const money = s => { const x = String(s).replace(/,/g, "").trim(); return /^\d+(\.\d{1,2})?$/.test(x) ? Math.round(parseFloat(x) * 100) : null; };
  function impAnalyze() {
    return IMP_ROWS.map((r, n) => {
      const get = f => { const i = impCol(f); return i < 0 ? "" : String(r[i]).trim(); };
      const row = n + 2, name = get("name"), sku = get("sku"), bc = get("barcode"), cat = get("cat"), si = get("nameSi"), errs = [];
      const priceS = get("price"), price = money(priceS), costS = get("cost"), cost = costS ? money(costS) : null;
      if (!name) errs.push([impColName("name"), "Product name is empty"]);
      if (!sku) errs.push([impColName("sku"), "SKU is empty"]);
      if (price == null) errs.push([impColName("price"), priceS ? `"${priceS}" is not a price. Use digits, e.g. 1250.00` : "Price is empty"]);
      if (costS && cost == null) errs.push([impColName("cost"), `"${costS}" is not a price`]);
      if (cat && !CATS_ADMIN.includes(cat)) errs.push([impColName("cat"), `Unknown category "${cat}". Use an existing category or add it first`]);
      const ex = sku ? PRODUCTS.find(p => p.sku.toLowerCase() === sku.toLowerCase()) : null;
      if (bc) { const owner = PRODUCTS.find(p => p !== ex && p.variants.some(v => v.barcode === bc)); if (owner) errs.push([impColName("barcode"), `Barcode ${bc} already belongs to ${owner.name} (${owner.sku})`]); }
      const base = { row, name, sku, bc, cat, price, cost, si, tax: get("tax") };
      if (errs.length) return { ...base, status: "error", errs };
      if (!ex) return { ...base, status: "new", ch: [`New in ${cat} at ${fmt(price)}`] };
      const ch = [];
      if (price !== ex.price) ch.push(`Price ${fmt(ex.price)} → ${fmt(price)}`);
      if (name !== ex.name) ch.push(`Name → ${name}`);
      if (cat && cat !== ex.cat) ch.push(`Category ${ex.cat} → ${cat}`);
      if (si && si !== ex.nameSi) ch.push("Sinhala name added");
      return { ...base, p: ex, status: ch.length ? "update" : "same", ch };
    });
  }
  const IMP_BADGE = { new: ["info", "New", "plus"], update: ["warning", "Update", "pencil"], same: ["", "No change", null], error: ["error", "Error", "alert"] };
  function impApply(rows) {
    const no = `IMP-${S.impSeq}`, by = meShort(); let created = 0, updated = 0;
    for (const r of rows) {
      if (r.status === "update") {
        const p = r.p, old = p.price;
        p.price = r.price; p.name = r.name; if (r.cat) p.cat = r.cat; if (r.si) p.nameSi = r.si;
        const v = p.variants.find(x => x.sku === p.sku); if (v) v.price = r.price;
        p.updated = new Date(); p.log.unshift({ when: new Date(), who: by, what: old !== r.price ? `Price ${fmt(old)} → ${fmt(r.price)} (import ${no})` : `Updated by import ${no}` });
        updated++;
      } else if (r.status === "new") {
        const [icon, tone] = TONES[r.cat] || ["package", "purple"];
        PRODUCTS.push({ id: "im-" + r.sku.toLowerCase(), name: r.name, cat: r.cat, meta: `New · ${r.sku}`, price: r.price, icon, tone, code: r.bc || "", stock: 0,
          brand: "No brand", nameSi: r.si, nameTa: "", tax: /exempt/i.test(r.tax) ? "exempt" : "std", reorder: 5, active: true,
          wholesale: Math.round(r.price * 0.93 / 100) * 100, cost: r.cost != null ? r.cost : Math.round(r.price * 0.72 / 100) * 100, sku: r.sku, newPrice: "", newFrom: "",
          variants: [{ label: "Each", sku: r.sku, barcode: r.bc || "", price: r.price }], drug: null, updated: new Date(), seedLots: [],
          log: [{ when: new Date(), who: by, what: `Product created from import ${no}` }] });
        created++;
      }
    }
    S.impSeq++;
    return { no, created, updated, skipped: rows.filter(r => r.status === "error").length, same: rows.filter(r => r.status === "same").length, when: new Date() };
  }
  function impCommit() {
    const im = S.imp, rows = impAnalyze(), todo = rows.filter(r => r.status === "new" || r.status === "update").length;
    if (rows.some(r => r.status === "error") && !im.skip) { toast("Tick “skip the rows with errors” or fix the file first", { error: true }); return; }
    im.step = 5; im.progress = 0; im.job = `JOB-${(Date.now() % 46656).toString(36).toUpperCase().padStart(3, "0")}`; im.total = todo; render();
    clearInterval(im.timer);
    im.timer = setInterval(() => {
      im.progress = Math.min(todo, im.progress + 1);
      if (im.progress >= todo) { clearInterval(im.timer); im.result = impApply(impAnalyze()); im.step = 6; if (S.view !== "import") toast(`Import finished: ${im.result.created} created, ${im.result.updated} updated`); }
      if (S.view === "import") render();
    }, 260);
  }
  function impGo(step) {
    const im = S.imp;
    if (step === 3 && !im.file) { toast("Choose a file first", { error: true }); return; }
    if (step === 4) { const x = impMapIssues(); if (x.miss.length || x.dup.length) { toast("Match the required columns first", { error: true }); return; } }
    im.step = step; render();
  }
  function impSetFile(name, size) {
    const im = S.imp;
    if (size > 20 * 1024 * 1024) { im.fileErr = `${name} is ${(size / 1048576).toFixed(1)} MB. The limit is 20 MB; split the file into two.`; im.file = null; render(); return; }
    if (!/\.(xlsx|csv)$/i.test(name)) { im.fileErr = `${name} is not an Excel (.xlsx) or CSV file.`; im.file = null; render(); return; }
    im.fileErr = ""; im.file = { name, size, rows: IMP_ROWS.length, cols: IMP_COLS.length }; im.map = { ...IMP_AUTO }; im.touched = {}; render();
  }
  const kb = n => n < 1048576 ? Math.max(1, Math.round(n / 1024)) + " KB" : (n / 1048576).toFixed(1) + " MB";
  function importView() {
    const im = S.imp;
    if (S.user.role !== "Manager") return `<div class="placeholder"><div class="empty"><span class="circle">${ic("lock", 28)}</span><h3>Only managers can import products</h3><span>${esc(S.user.short)} is signed in as ${esc(S.user.role.toLowerCase())}. A manager can import, or give you access in Staff.</span><button class="btn primary s" data-act="logout">Switch user</button></div></div>`;
    const back = im.step > 1 && im.step < 5 ? `<button class="btn secondary l" data-act="imp-go" data-step="${im.step - 1}">Back</button>` : "";
    let body = "", next = "";
    if (im.step === 1) {
      body = `<section class="card imp-card"><h2>Which data are you importing?</h2>
        <div class="cnt-types">${IMP_TEMPLATES.map(([k, l, d, i]) => `<div class="cnt-type" role="radio" tabindex="0" data-act="imp-kind" data-k="${k}" aria-checked="${im.kind === k}"><span class="thumb tile-blue">${ic(i, 20)}</span><span class="grow"><b>${l}</b><small>${d}</small></span><button class="btn ghost s" data-act="toast" data-msg="${k}-template.xlsx downloaded">${ic("upload", 16)}Template</button><i class="radio"></i></div>`).join("")}</div>
        <div class="imp-rules"><b>Rules for the file</b><ul>
          <li>The first row holds the column names. Your own column names are fine; you match them in step 3.</li>
          <li>Rows are matched by <b>SKU</b>: an existing SKU is updated, a new SKU creates a product.</li>
          <li>Empty cells keep the current value. Nothing is ever deleted by an import.</li>
          <li>Prices in rupees with up to two decimals, e.g. <code>1190.00</code>. Excel (.xlsx) or CSV in UTF-8, up to 20 MB.</li></ul></div></section>`;
      next = `<button class="btn primary l" data-act="imp-go" data-step="2" ${im.kind === "products" ? "" : "disabled"}>Next: upload ${ic("arrowRight")}</button>`;
      if (im.kind !== "products") body += `<div class="note">${ic("help", 16)}Price list and opening stock imports use the same six steps. This demo walks through Products.</div>`;
    } else if (im.step === 2) {
      body = `<section class="card imp-card"><h2>Upload the file</h2>
        ${im.file ? `<div class="file-card"><span class="thumb tile-green">${ic("list", 22)}</span><span class="grow"><b>${esc(im.file.name)}</b><small>${kb(im.file.size)} · sheet “Products” · ${im.file.rows} rows · ${im.file.cols} columns</small></span>${badge("success", "Read OK", "check")}<button class="icon-btn" data-act="imp-clear" aria-label="Remove file">${ic("x")}</button></div>`
          : `<label class="dropzone ${im.drag ? "over" : ""}" for="impfile" tabindex="0" data-fid="impdrop">${ic("upload", 32)}<b>Drop your file here, or click to choose</b><small>Excel (.xlsx) or CSV · up to 20 MB</small><input type="file" id="impfile" accept=".xlsx,.csv" class="sr"></label>
             <button class="btn ghost" data-act="imp-demo">Use the demo file: products-nov-2026.xlsx (18 rows)</button>`}
        ${im.fileErr ? `<div class="scan-error" role="alert">${ic("alert", 18)}${esc(im.fileErr)}</div>` : ""}
        <div class="note">${ic("help", 16)}In this prototype any file you choose is read as the demo data.</div></section>`;
      next = `<button class="btn primary l" data-act="imp-go" data-step="3" ${im.file ? "" : "disabled"}>Next: match columns ${ic("arrowRight")}</button>`;
    } else if (im.step === 3) {
      const x = impMapIssues();
      body = `<section class="card imp-card"><div class="card-head"><h2>Match your columns to RetailOS fields</h2><span class="sub">${esc(im.file.name)}</span></div>
        <div class="maptable" role="table" aria-label="Column matching">
          <div class="mrow head" role="row"><span>Column in your file</span><span>Sample values</span><span>RetailOS field</span><span></span></div>
          ${IMP_COLS.map((c, i) => { const f = im.map[c]; return `<div class="mrow" role="row"><b>${esc(c)}</b><span class="samples">${IMP_ROWS.slice(0, 3).map(r => `<span>${esc(r[i]) || "—"}</span>`).join("")}</span>
            <select data-im="${esc(c)}" data-fid="im-${i}" aria-label="Field for ${esc(c)}"><option value="">Don't import</option>${IMP_FIELDS.map(([k, l, req]) => `<option value="${k}" ${f === k ? "selected" : ""}>${l}${req ? " *" : ""}</option>`).join("")}</select>
            <span>${!f ? badge("", "Skipped", null) : im.touched[c] ? badge("info", "Your choice", "pencil") : badge("success", "Auto-matched", "check")}</span></div>`; }).join("")}
        </div>
        ${x.miss.length ? `<div class="banner error">${ic("alert")}Required fields with no column: ${x.miss.join(", ")}</div>` : ""}
        ${x.dup.length ? `<div class="banner error">${ic("alert")}More than one column goes to: ${x.dup.join(", ")}</div>` : ""}
        ${!x.miss.length && !x.dup.length ? `<div class="note">${ic("check", 16)}All required fields (*) are matched. RetailOS remembers this matching for your next file.</div>` : ""}</section>`;
      next = `<button class="btn primary l" data-act="imp-go" data-step="4" ${x.miss.length || x.dup.length ? "disabled" : ""}>Next: preview ${ic("arrowRight")}</button>`;
    } else if (im.step === 4) {
      const rows = impAnalyze(), n = k => rows.filter(r => r.status === k).length, errs = rows.filter(r => r.status === "error"), todo = n("new") + n("update");
      const chip = (v, l) => `<button class="chip" data-act="imp-filter" data-v="${v}" aria-pressed="${im.filter === v}">${l}</button>`;
      const shown = rows.filter(r => im.filter === "all" || r.status === im.filter);
      body = `<div class="banner" style="background:var(--primary-tint);color:var(--primary-text)">${ic("help")}Dry run: nothing has changed yet. Check the preview, then import.</div>
        <div class="stats4"><div class="stat"><span>New products</span><b style="color:var(--primary-text)">${n("new")}</b></div><div class="stat"><span>Updates</span><b style="color:var(--warning-text)">${n("update")}</b></div><div class="stat"><span>No change</span><b>${n("same")}</b></div><div class="stat"><span>Rows with errors</span><b style="color:var(--error-text)">${n("error")}</b></div></div>
        ${errs.length ? `<section class="card"><div class="card-head"><h2>${errs.length} row${errs.length === 1 ? "" : "s"} need${errs.length === 1 ? "s" : ""} fixing</h2><button class="btn secondary" data-act="toast" data-msg="import-errors.csv downloaded (${errs.length} rows)">Download error rows (CSV)</button></div>
          <div class="errtable" role="table" aria-label="Errors"><div class="erow head" role="row"><span>Row</span><span>Column</span><span>Problem</span></div>${errs.flatMap(r => r.errs.map(([c, m]) => `<div class="erow" role="row"><span class="mono">${r.row}</span><span>${esc(c)}</span><span>${esc(m)}<small>${esc(r.name)} · ${esc(r.sku)}</small></span></div>`)).join("")}</div></section>` : ""}
        <section class="card"><div class="card-head"><h2>All rows</h2><div class="chips">${chip("all", `All · ${rows.length}`)}${chip("new", `New · ${n("new")}`)}${chip("update", `Updates · ${n("update")}`)}${chip("same", `No change · ${n("same")}`)}${chip("error", `Errors · ${n("error")}`)}</div></div>
          <div class="prevtable" role="table" aria-label="Preview"><div class="vrow head" role="row"><span>Row</span><span>Product</span><span>SKU</span><span>Result</span><span>What changes</span></div>
          ${shown.map(r => `<div class="vrow ${r.status}" role="row"><span class="mono">${r.row}</span><b>${esc(r.name)}</b><span class="mono">${esc(r.sku)}</span><span>${badge(...IMP_BADGE[r.status])}</span><span class="muted">${r.status === "error" ? esc(r.errs.map(e => e[1]).join(" · ")) : r.ch.length ? esc(r.ch.join(" · ")) : "Same as now"}</span></div>`).join("")}</div></section>
        ${errs.length ? `<label class="check-row"><input type="checkbox" data-act="imp-skip" ${im.skip ? "checked" : ""}><span><b>Skip the ${errs.length} rows with errors and import the rest</b><small>You can fix those rows and import them later. Or fix the file now and upload it again.</small></span></label>` : ""}`;
      next = `<button class="btn primary l" data-act="imp-commit" ${todo && (!errs.length || im.skip) ? "" : "disabled"}>${ic("check")}Import ${todo} product${todo === 1 ? "" : "s"}</button>`;
    } else if (im.step === 5) {
      const pct = im.total ? Math.round(im.progress / im.total * 100) : 100;
      body = `<section class="card imp-card imp-run"><span class="spinner" aria-hidden="true"></span><h2>Importing…</h2><div class="sub">${im.job} · ${esc(im.file.name)}</div>
        <div class="cnt-prog" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="Import progress"><div class="lbl"><span>${im.progress} of ${im.total} rows</span><b>${pct}%</b></div><div class="bar"><i style="width:${pct}%"></i></div></div>
        <div class="note">${ic("help", 16)}You can leave this page. The import keeps running and you get a notification when it is done.</div></section>`;
    } else {
      const R = im.result;
      body = `<section class="complete">
        <div class="success-mark"><div>${ic("check", 40)}</div></div>
        <h1>Import finished</h1><div class="sub">${R.no} · ${esc(im.file.name)} · by ${esc(meShort())} at ${hm(R.when)}</div>
        <div class="card" style="width:min(560px,100%);text-align:left"><div class="dlines">
          <div class="dline"><span class="grow">Products created</span><b style="color:var(--primary-text)">${R.created}</b></div>
          <div class="dline"><span class="grow">Products updated</span><b style="color:var(--warning-text)">${R.updated}</b></div>
          <div class="dline"><span class="grow">No change</span><b>${R.same}</b></div>
          <div class="dline"><span class="grow">Rows skipped (errors)</span><b style="color:${R.skipped ? "var(--error-text)" : "var(--text)"}">${R.skipped}</b>${R.skipped ? `<button class="btn ghost s" data-act="toast" data-msg="import-errors.csv downloaded">Download</button>` : ""}</div>
        </div><div class="note">${ic("refresh", 16)}Registers get the changes at their next sync, within a minute. New products start with zero stock: receive them in Goods receiving.</div></div>
        <div class="actions"><button class="btn primary l" data-act="imp-products">${ic("package")}View products</button><button class="btn secondary l" data-act="imp-new">Import another file</button></div></section>`;
    }
    const foot = im.step < 5 ? `<div class="imp-foot"><span class="spacer"></span>${back}${next}</div>` : "";
    return `<div class="page imp">${stepsBar(IMP_STEPS, im.step)}${body}${foot}</div>`;
  }

  // ---------- Sale exceptions queue (A-53) ----------
  const EXC_TYPES = {
    NEGATIVE_STOCK: ["Negative stock", "package", "error"],
    PRICE_MISMATCH: ["Price mismatch", "tag", "warning"],
    EXPIRED_BATCH_SOLD: ["Expired batch sold", "calendar", "error"],
    CLOCK_SKEW: ["Clock skew", "clock", "warning"],
    RECEIPT_COLLISION: ["Receipt number clash", "receipt", "info"]
  };
  const minsAgo = m => new Date(Date.now() - m * 60000);
  const ageOf = d => { const m = Math.max(1, Math.round((Date.now() - d) / 60000)); return m < 60 ? `${m} min` : m < 1440 ? `${Math.floor(m / 60)} h${m % 60 ? " " + (m % 60) + " min" : ""}` : `${Math.floor(m / 1440)} day${m >= 2880 ? "s" : ""}`; };
  S.exc = { type: "all", branch: "all", status: "open", sel: "EX-1046", note: "", action: null, err: false, list: [
    { id: "EX-1046", code: "NEGATIVE_STOCK", branch: "CMB01", reg: "R02", sale: "CMB01-R02-000148", cashier: "Nimal P.", when: minsAgo(40), pid: "sh",
      title: "Shampoo 340ml went below zero", problem: "The register sold 5 while the server had 3 on hand, so stock went to −2. The sale itself is valid and is kept.",
      evidence: [["On hand before the sale", "3"], ["Sold", "5"], ["On hand after", "−2"], ["Pending goods receipt", "GRN-2291 · Cargills Distribution · 12 pcs, saved but not posted"]],
      lines: [["sh", 5, 109000]],
      actions: [["grn", "Post the pending goods receipt GRN-2291", "Adds the 12 pcs that arrived yesterday. Recommended."], ["adjust", "Adjust stock +2 · Found in store", "Creates a stock movement with a reason"], ["note", "Accept as it is", "Stock is corrected at the next count"]] },
    { id: "EX-1045", code: "PRICE_MISMATCH", branch: "CMB01", reg: "R03", sale: "CMB01-R03-000077", cashier: "Anushka D.", when: minsAgo(75), pid: "mp",
      title: "Milk powder 400g sold at the old price", problem: "Register 3 was offline when the new price started at 09:00, so it sold 2 at Rs 1,150 instead of Rs 1,190.",
      evidence: [["Price on the register", "Rs 1,150.00"], ["Price on the server", "Rs 1,190.00 from 09:00"], ["Quantity", "2"], ["Difference", "Rs 80.00 less collected"], ["Register offline", "08:52 – 09:41"]],
      lines: [["mp", 2, 115000], ["br", 1, 325000]],
      actions: [["accept", "Accept the price difference", "Recorded as a price variance of Rs 80.00. The sale is not changed."], ["resync", "Accept and force a price re-sync on Register 3", "The register pulls the latest prices at its next sync"]] },
    { id: "EX-1044", code: "EXPIRED_BATCH_SOLD", branch: "CMB01", reg: "R01", sale: "CMB01-R01-000213", cashier: "Rizwan F.", when: minsAgo(185), pid: "am", lot: "AM2509",
      title: "Expired Amoxicillin batch AM2509 was sold", problem: "Batch AM2509 expired on " + fmtExpIso(isoDate(inDays(-6))) + ". Register 1 still had the old batch list because it was offline for 2 hours.",
      evidence: [["Batch", "AM2509 · expired " + fmtExpIso(isoDate(inDays(-6)))], ["Sold", "1 strip"], ["Customer", "Kamal Perera · 077 123 4567"], ["Pharmacist on duty", "Rizwan Farook"]],
      lines: [["am", 1, 45000], ["pc", 2, 3200]],
      actions: [["block", "Block batch AM2509 everywhere and call the customer", "The pharmacist calls to replace the strip. Recommended."], ["note", "Note only", "Use when the customer has already been contacted"]] },
    { id: "EX-1043", code: "CLOCK_SKEW", branch: "KDY01", reg: "R01", sale: "6 sales", cashier: "—", when: minsAgo(300),
      title: "Register KDY01-R01 clock is 11 minutes slow", problem: "Six sales from this register are tagged. Their recorded times are kept and the server time is stored next to them.",
      evidence: [["Register time", "10:31"], ["Server time", "10:42"], ["Difference", "11 min slow (limit 5 min)"], ["Sales tagged", "KDY01-R01-000301 to 000306"]],
      lines: null,
      actions: [["accept", "Accept the recorded times", "Reports use the server time for these six sales"], ["notify", "Accept and ask the branch to fix the clock", "Sends a task to the KDY01 manager"]] },
    { id: "EX-1042", code: "RECEIPT_COLLISION", branch: "GAL01", reg: "R02", sale: "GAL01-R02-000131", cashier: "—", when: minsAgo(1580),
      title: "Two sales share receipt number GAL01-R02-000131", problem: "The register was restored from a backup and reused a receipt number. Both sales are real and both are kept.",
      evidence: [["First sale", "09:14 · Rs 2,340.00 · cash"], ["Second sale", "11:02 · Rs 860.00 · card"], ["Cause", "Device restored on 18 Nov"], ["Next free number", "000158"]],
      lines: null,
      actions: [["resync", "Keep both and reset the register's receipt counter", "The next receipt starts at 000158. Recommended after a restore."], ["suffix", "Keep both · show the second as 000131-B in reports", "Printed receipts are not changed (INV-02)"]] },
    { id: "EX-1041", code: "PRICE_MISMATCH", branch: "KDY01", reg: "R02", sale: "KDY01-R02-000512", cashier: "Chamari W.", when: minsAgo(1500), title: "Ceylon black tea 200g sold below the list price", problem: "", evidence: [], lines: null, actions: [],
      status: "resolved", res: { action: "Accept the price difference", note: "Weekend promotion ended a day early on this register. Accepted.", by: "Malini J.", when: minsAgo(1380) } },
    { id: "EX-1040", code: "NEGATIVE_STOCK", branch: "CMB01", reg: "R02", sale: "CMB01-R02-000102", cashier: "Sachini K.", when: minsAgo(2900), title: "Eggs 10-pack went below zero", problem: "", evidence: [], lines: null, actions: [],
      status: "resolved", res: { action: "Post the pending goods receipt GRN-2283", note: "Farm Fresh delivery was not posted on Monday.", by: "Malini J.", when: minsAgo(2800) } }
  ] };
  S.exc.list.forEach(e => { e.status = e.status || "open"; });
  const excOpen = () => S.exc.list.filter(e => e.status === "open").length;
  function excList() {
    const f = S.exc;
    return f.list.filter(e => e.status === f.status && (f.type === "all" || e.code === f.type) && (f.branch === "all" || e.branch === f.branch)).sort((a, b) => f.status === "open" ? a.when - b.when : b.res.when - a.res.when);
  }
  function excSelect(id) { const f = S.exc; if (f.sel === id) return; f.sel = id; f.note = ""; f.action = null; f.err = false; }
  function excMove(d) {
    const list = excList(); if (!list.length) return;
    const i = list.findIndex(e => e.id === S.exc.sel);
    excSelect(list[Math.max(0, Math.min(list.length - 1, i < 0 ? 0 : i + d))].id); render();
    const row = app.querySelector('.xrow[aria-selected="true"]'); if (row) row.scrollIntoView({ block: "nearest" });
  }
  function excResolve() {
    const f = S.exc, e = f.list.find(x => x.id === f.sel);
    if (!e || e.status !== "open") return;
    if (!f.action || f.note.trim().length < 5) { f.err = true; render(); toast(!f.action ? "Choose an action" : "Write a short note (at least 5 characters)", { error: true }); return; }
    const a = e.actions.find(x => x[0] === f.action), by = meShort(), p = e.pid ? byId(e.pid) : null;
    if (f.action === "grn" && p) { p.stock = Math.round((p.stock + 12) * 1000) / 1000; S.moves.unshift({ when: new Date(), product: p.name, lot: "", qty: 12, reason: "Goods receipt GRN-2291 posted", note: e.id, who: by, approver: null }); }
    if (f.action === "adjust" && p) { p.stock = Math.round((p.stock + 2) * 1000) / 1000; S.moves.unshift({ when: new Date(), product: p.name, lot: "", qty: 2, reason: "Found in store", note: e.id, who: by, approver: null }); }
    if (f.action === "block" && p) { const l = lotsOf(p).find(x => x.id === e.lot); if (l) l.blocked = true; }
    if (p) p.log.unshift({ when: new Date(), who: by, what: `Exception ${e.id} resolved: ${a[1]}` });
    e.status = "resolved"; e.res = { action: a[1], note: f.note.trim(), by, when: new Date() };
    const next = excList()[0];
    f.sel = next ? next.id : null; f.note = ""; f.action = null; f.err = false;
    render(); toast(`${e.id} resolved · ${a[1]}`);
  }
  function exceptionsView() {
    if (S.user.role !== "Manager") return `<div class="placeholder"><div class="empty"><span class="circle">${ic("lock", 28)}</span><h3>Sale exceptions are for managers</h3><span>${esc(S.user.short)} is signed in as ${esc(S.user.role.toLowerCase())}. A manager reviews and resolves exceptions.</span><button class="btn primary s" data-act="logout">Switch user</button></div></div>`;
    const f = S.exc, list = excList(), all = f.list.filter(e => e.status === f.status && (f.branch === "all" || e.branch === f.branch));
    if (!list.some(e => e.id === f.sel)) { f.sel = list[0] ? list[0].id : null; f.note = ""; f.action = null; f.err = false; }
    const chip = (v, l) => `<button class="chip" data-act="exc-type" data-v="${v}" aria-pressed="${f.type === v}">${l}</button>`;
    const left = `<section class="products" aria-label="Exceptions">
      <div class="filters">
        <div class="seg" role="group" aria-label="Status">${[["open", `Open · ${excOpen()}`], ["resolved", "Resolved"]].map(([v, l]) => `<button data-act="exc-status" data-v="${v}" aria-pressed="${f.status === v}">${l}</button>`).join("")}</div>
        <select class="sel" data-xf="branch" data-fid="xf-branch" aria-label="Branch"><option value="all">All branches</option>${BRANCHES.map(b => `<option value="${b[0]}" ${f.branch === b[0] ? "selected" : ""}>${b[1]}</option>`).join("")}</select>
      </div>
      <div class="chips wrap">${chip("all", `All types · ${all.length}`)}${Object.entries(EXC_TYPES).map(([k, [l]]) => { const n = all.filter(e => e.code === k).length; return n || f.type === k ? chip(k, `${l} · ${n}`) : ""; }).join("")}</div>
      ${list.length ? `<div class="htable" role="listbox" aria-label="Exception list">
        <div class="xrow head" aria-hidden="true"><span>Type</span><span>Exception</span><span>Where</span><span class="amt">${f.status === "open" ? "Waiting" : "Resolved"}</span></div>
        ${list.map(e => { const [l, i, tone] = EXC_TYPES[e.code]; return `<button class="xrow" role="option" aria-selected="${e.id === f.sel}" data-act="exc-sel" data-id="${e.id}">
          <span>${badge(tone, l, i)}</span><span class="no"><b>${esc(e.title)}</b><small>${e.id} · ${esc(e.sale)}</small></span><span class="where">${e.branch} · ${e.reg}</span>
          <span class="amt ${f.status === "open" && Date.now() - e.when > 86400000 ? "late" : ""}">${f.status === "open" ? ageOf(e.when) : esc(e.res.by)}</span></button>`; }).join("")}</div>`
        : `<div class="empty card"><span class="circle">${ic("check", 28)}</span><h3>${f.status === "open" ? "No open exceptions" : "Nothing resolved yet"}</h3><span>${f.status === "open" ? "Every sale from the registers matched the server. Nice." : "Resolved exceptions appear here with the note and who resolved them."}</span></div>`}
      <div class="note">${ic("lock", 16)}Resolving never edits the sale (INV-02). Actions create stock movements, tasks or notes, and each one is in the audit log.</div>
    </section>`;
    return `<div class="body">${left}${excPanel(f.list.find(e => e.id === f.sel))}</div>`;
  }
  function excPanel(e) {
    if (!e) return `<aside class="order exc-panel"><div class="empty" style="flex:1"><span class="circle">${ic("alert", 28)}</span><h3>Select an exception</h3><span>Click a row, or use ↑ ↓.</span></div></aside>`;
    const f = S.exc, [l, i, tone] = EXC_TYPES[e.code];
    const head = `<div class="order-head"><div class="order-title"><div style="flex:1;min-width:0"><h2>${esc(e.title)}</h2><div class="sub">${e.id} · ${e.branch} · Register ${e.reg} · ${e.when.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} ${hm(e.when)}</div></div>${badge(tone, l, i)}</div>
      <dl class="kv"><dt>Sale</dt><dd>${esc(e.sale)}</dd><dt>Cashier</dt><dd>${esc(e.cashier)}</dd><dt>Waiting</dt><dd>${ageOf(e.when)}</dd></dl></div>`;
    if (e.status === "resolved") return `<aside class="order exc-panel" aria-label="Exception details">${head}<div class="panel-body">
        <div class="banner" style="background:var(--success-tint);color:var(--success-text)">${ic("check")}Resolved by ${esc(e.res.by)} · ${e.res.when.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} ${hm(e.res.when)}</div>
        <dl class="kv exc-kv"><dt>Action</dt><dd>${esc(e.res.action)}</dd><dt>Note</dt><dd>${esc(e.res.note)}</dd></dl>
        ${e.problem ? `<div class="field">What happened<p class="exc-problem">${esc(e.problem)}</p></div>` : ""}</div></aside>`;
    return `<aside class="order exc-panel" aria-label="Exception details">${head}
      <div class="panel-body">
        <p class="exc-problem ${tone}">${esc(e.problem)}</p>
        <div class="field">Evidence<dl class="kv exc-kv">${e.evidence.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("")}</dl></div>
        ${e.lines ? `<div class="field">Sale lines<div class="dlines">${e.lines.map(([pid, q, u]) => { const p = byId(pid); return `<div class="dline ${pid === e.pid ? "hl" : ""}"><span class="thumb tile-${p.tone}">${ic(p.icon, 18)}</span><span class="grow"><b>${esc(p.name)}</b><small>${q} × ${fmt(u)}</small></span><b>${fmt(q * u)}</b></div>`; }).join("")}</div></div>` : ""}
        <div class="field">Suggested actions<div class="opt-list" role="radiogroup" aria-label="Actions">${e.actions.map(([k, t1, t2], n) => `<button class="opt" role="radio" data-act="exc-action" data-k="${k}" aria-checked="${f.action === k}" aria-selected="${f.action === k}"><span class="grow"><b>${esc(t1)}</b><small>${esc(t2)}</small></span><kbd>${n + 1}</kbd></button>`).join("")}</div>
          ${f.err && !f.action ? `<span class="err">Choose what to do</span>` : ""}</div>
        <label class="field">Note for the audit log<textarea data-fid="exc-note" id="excnote" placeholder="What did you check, and why is this the right fix?">${esc(f.note)}</textarea>${f.err && f.note.trim().length < 5 ? `<span class="err">A short note is required</span>` : ""}</label>
      </div>
      <div class="order-foot"><button class="btn primary l block" data-act="exc-resolve" ${f.action && f.note.trim().length >= 5 ? "" : "aria-disabled=\"true\""}>${ic("check")}Resolve <kbd>Ctrl Enter</kbd></button>
        <div class="two"><button class="btn secondary" data-act="toast" data-msg="Opened ${esc(e.sale)} in Sales history (A-51)">${ic("receipt", 18)}Open sale</button><button class="btn secondary" data-act="toast" data-msg="${e.id} assigned to Kasun S.">${ic("userPlus", 18)}Assign</button></div></div>
    </aside>`;
  }

  // ---------- Suppliers (A-48) ----------
  const TERMS = [["cod", "Cash on delivery", 0], ["7", "7 days", 7], ["14", "14 days", 14], ["30", "30 days", 30], ["45", "45 days", 45]];
  const grnRow = (no, d, inv, total, paid) => ({ no, date: daysAgo(d, 11, 0), invoice: inv, total, paid });
  const SUP = [
    { id: "hemas", name: "Hemas Pharmaceuticals", contact: "Dilani Fernando", phone: "011 247 8800", email: "orders@hemaspharma.lk", vat: "114256789-7000", terms: "30", address: "75 Braybrooke Place, Colombo 02", note: "Rep visits on Tuesdays. Returns of expired stock accepted up to 30 days after expiry.", active: true, pids: ["pc", "am"],
      grns: [grnRow("GRN-2289", 4, "HP-58190", 18450000, false), grnRow("GRN-2276", 19, "HP-57702", 9620000, true), grnRow("GRN-2251", 41, "HP-56311", 12380000, false)] },
    { id: "cargills", name: "Cargills Distribution", contact: "Ruwan Jayawardena", phone: "011 242 7777", email: "distribution@cargills.lk", vat: "114002345-7000", terms: "14", address: "40 York Street, Colombo 01", note: "", active: true, pids: ["br", "co", "bw"],
      grns: [grnRow("GRN-2290", 2, "CD-99412", 6420000, false), grnRow("GRN-2270", 22, "CD-98720", 5510000, false), grnRow("GRN-2262", 30, "CD-98113", 4800000, true)] },
    { id: "lmf", name: "Lanka Milk Foods", contact: "Shirani Peiris", phone: "011 253 3366", email: "sales@lmf.lk", vat: "114778899-7000", terms: "30", address: "Welisara, Ragama", note: "", active: true, pids: ["mp"],
      grns: [grnRow("GRN-2285", 6, "LMF-22018", 3312000, false), grnRow("GRN-2259", 35, "LMF-21877", 2980000, true)] },
    { id: "cbl", name: "Ceylon Biscuits Ltd", contact: "Asela Gunawardena", phone: "011 486 0400", email: "trade@cbl.lk", vat: "114334455-7000", terms: "45", address: "Makumbura, Pannipitiya", note: "", active: true, pids: ["cc", "ct"],
      grns: [grnRow("GRN-2280", 9, "CBL-7741", 1872000, false)] },
    { id: "ffne", name: "Fresh Farms Nuwara Eliya", contact: "M. Rajendran", phone: "052 222 3344", email: "", vat: "", terms: "cod", address: "Kandapola, Nuwara Eliya", note: "Not VAT registered. Paid in cash when the lorry arrives.", active: true, pids: ["ca", "eg"],
      grns: [grnRow("GRN-2288", 5, "FF-118", 640000, true), grnRow("GRN-2284", 8, "FF-112", 512000, true)] }
  ];
  const supTerm = s => TERMS.find(x => x[0] === s.terms) || TERMS[0];
  const grnDue = (s, r) => { const d = new Date(r.date); d.setDate(d.getDate() + supTerm(s)[2]); return d; };
  const grnState = (s, r) => r.paid ? "paid" : grnDue(s, r) < new Date() ? "overdue" : "due";
  const supOwed = s => s.grns.filter(r => !r.paid).reduce((a, r) => a + r.total, 0);
  const supOverdue = s => s.grns.filter(r => grnState(s, r) === "overdue").reduce((a, r) => a + r.total, 0);
  const supDraft = s => ({ id: s ? s.id : null, name: s ? s.name : "", contact: s ? s.contact : "", phone: s ? s.phone : "", email: s ? s.email : "", vat: s ? s.vat : "", terms: s ? s.terms : "30", address: s ? s.address : "", note: s ? s.note : "", active: s ? s.active : true });
  S.sup = { q: "", filter: "all", sel: "hemas", tab: "details", draft: supDraft(SUP[0]), showErr: false };
  const supDirty = () => { const s = S.sup, cur = SUP.find(x => x.id === s.draft.id); return JSON.stringify(s.draft) !== JSON.stringify(supDraft(cur)); };
  function supErrors(d) {
    const e = {};
    if (!d.name.trim()) e.name = "Name is required";
    else if (SUP.some(x => x.id !== d.id && x.name.toLowerCase() === d.name.trim().toLowerCase())) e.name = "A supplier with this name already exists";
    if (d.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) e.email = "Check the e-mail address";
    if (d.phone && d.phone.replace(/\D/g, "").length !== 10) e.phone = "Sri Lankan numbers have 10 digits, e.g. 011 247 8800";
    if (d.vat && !/^\d{9}-7000$/.test(d.vat.trim())) e.vat = "VAT number looks like 114256789-7000";
    return e;
  }
  function supList() {
    const s = S.sup, q = s.q.trim().toLowerCase();
    return SUP.filter(x => (s.filter === "all" || (s.filter === "owed" && supOwed(x)) || (s.filter === "overdue" && supOverdue(x)))
      && (!q || [x.name, x.contact, x.phone, x.vat, x.email].join(" ").toLowerCase().includes(q)));
  }
  function supOpen(id) {
    const s = S.sup;
    if (s.sel === id && s.draft.id === id) return;
    if (supDirty()) { toast("Save or discard the changes to " + (s.draft.name || "the new supplier") + " first", { error: true }); return; }
    const x = SUP.find(y => y.id === id); s.sel = id; s.draft = supDraft(x); s.showErr = false; if (s.tab !== "details" && !x) s.tab = "details"; render();
  }
  function supNew() {
    const s = S.sup;
    if (supDirty()) { toast("Save or discard your changes first", { error: true }); return; }
    s.sel = null; s.draft = supDraft(null); s.tab = "details"; s.showErr = false; render(); focusId("sup-name");
  }
  function supSave() {
    const s = S.sup, d = s.draft, er = supErrors(d);
    if (Object.keys(er).length) { s.showErr = true; render(); toast(Object.values(er)[0], { error: true }); return; }
    d.name = d.name.trim(); d.vat = d.vat.trim();
    let x = SUP.find(y => y.id === d.id);
    if (!x) { x = { id: "s" + Date.now().toString(36), grns: [], pids: [] }; d.id = x.id; SUP.push(x); SUPPLIERS.push(d.name); }
    else if (x.name !== d.name) { const i = SUPPLIERS.indexOf(x.name); if (i >= 0) SUPPLIERS[i] = d.name; }
    Object.assign(x, { ...d }); s.sel = x.id; s.showErr = false; render(); toast(`${x.name} saved`);
  }
  function supMove(d) {
    const list = supList(); if (!list.length) return;
    const i = list.findIndex(x => x.id === S.sup.sel);
    supOpen(list[Math.max(0, Math.min(list.length - 1, i < 0 ? 0 : i + d))].id);
    const row = app.querySelector('.srow[aria-selected="true"]'); if (row) row.scrollIntoView({ block: "nearest" });
  }
  function suppliersView() {
    const s = S.sup, list = supList();
    const owed = SUP.reduce((a, x) => a + supOwed(x), 0), over = SUP.reduce((a, x) => a + supOverdue(x), 0);
    const chip = (v, l) => `<button class="chip" data-act="sup-filter" data-v="${v}" aria-pressed="${s.filter === v}">${l}</button>`;
    const left = `<section class="products" aria-label="Suppliers">
      <div class="search-row"><label class="search">${ic("search")}<span class="sr">Search suppliers</span><input id="supsearch" data-fid="supsearch" autocomplete="off" placeholder="Name, contact, phone or VAT number…" value="${esc(s.q)}"><kbd>/</kbd></label>
        <button class="btn primary" data-act="sup-new">${ic("plus", 18)}Add supplier <kbd>N</kbd></button></div>
      <div class="stats"><div class="stat"><span>Suppliers</span><b>${SUP.filter(x => x.active).length}</b></div><div class="stat"><span>We owe</span><b>${fmt(owed)}</b></div><div class="stat"><span>Overdue</span><b style="color:${over ? "var(--error-text)" : "var(--text)"}">${fmt(over)}</b></div></div>
      <div class="chips">${chip("all", `All · ${SUP.length}`)}${chip("owed", `We owe · ${SUP.filter(supOwed).length}`)}${chip("overdue", `Overdue · ${SUP.filter(supOverdue).length}`)}</div>
      ${list.length ? `<div class="htable" role="listbox" aria-label="Supplier list">
        <div class="srow head" aria-hidden="true"><span>Supplier</span><span>Terms</span><span>Last delivery</span><span class="amt">We owe</span></div>
        ${list.map(x => { const last = x.grns.slice().sort((a, b) => b.date - a.date)[0], od = supOverdue(x); return `<button class="srow ${x.active ? "" : "archived"}" role="option" aria-selected="${x.id === s.sel}" data-act="sup-sel" data-id="${x.id}">
          <span class="no"><b>${esc(x.name)}</b><small>${esc(x.contact || "No contact")} · ${esc(x.phone || "no phone")}</small></span><span>${supTerm(x)[1]}</span>
          <span class="muted">${last ? (dayDiff(last.date) === 0 ? "Today" : dayDiff(last.date) + " days ago") : "—"}</span>
          <span class="amt">${supOwed(x) ? fmt(supOwed(x)) : `<span class="muted">—</span>`}${od ? `<small class="late">${fmt(od)} overdue</small>` : ""}</span></button>`; }).join("")}</div>`
        : `<div class="empty card"><span class="circle">${ic("store", 28)}</span><h3>No suppliers match</h3><span>Clear the search, or add a new supplier.</span></div>`}
    </section>`;
    return `<div class="body">${left}${supPanel()}</div>`;
  }
  function supPanel() {
    const s = S.sup, d = s.draft, x = SUP.find(y => y.id === d.id), er = s.showErr ? supErrors(d) : {}, dirty = supDirty();
    const fld = (k, label, ph, extra = "") => `<label class="field">${label}<input data-sup="${k}" data-fid="sup-${k}" id="sup-${k}" value="${esc(d[k])}" placeholder="${ph}" class="${er[k] ? "bad" : ""}" ${extra}>${er[k] ? `<span class="err">${esc(er[k])}</span>` : ""}</label>`;
    const tabs = x ? [["details", "Details"], ["purchases", `Purchases · ${x.grns.length}`], ["products", `Products · ${x.pids.length}`]] : [["details", "Details"]];
    let body = "";
    if (s.tab === "details" || !x) {
      body = `<div class="form-2">${fld("name", "Supplier name *", "e.g. Hemas Pharmaceuticals")}${fld("contact", "Contact person", "Name of the sales rep")}${fld("phone", "Phone", "011 247 8800", 'inputmode="tel"')}${fld("email", "E-mail for orders", "orders@supplier.lk", 'inputmode="email"')}${fld("vat", "VAT number", "114256789-7000")}
        <label class="field">Payment terms<select data-sup="terms" data-fid="sup-terms">${TERMS.map(([k, l]) => `<option value="${k}" ${d.terms === k ? "selected" : ""}>${l}</option>`).join("")}</select></label></div>
        ${fld("address", "Address", "Street, city")}
        <label class="field">Notes<textarea data-sup="note" data-fid="sup-note" placeholder="Visit days, return rules, bank details for transfers…">${esc(d.note)}</textarea></label>
        ${!d.vat ? `<div class="note">${ic("help", 16)}Without a VAT number, input VAT on this supplier's invoices cannot be claimed.</div>` : ""}
        ${x ? `<label class="check-row"><input type="checkbox" data-act="sup-active" ${d.active ? "checked" : ""}><span><b>Active</b><small>Inactive suppliers are hidden from Goods receiving but keep their history.</small></span></label>` : ""}`;
    } else if (s.tab === "purchases") {
      const rows = x.grns.slice().sort((a, b) => b.date - a.date);
      body = rows.length ? `<div class="dlines">${rows.map(r => { const st = grnState(x, r); return `<div class="dline"><span class="grow"><b>${r.no} · ${fmt(r.total)}</b><small>Invoice ${esc(r.invoice || "—")} · ${r.date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} · due ${grnDue(x, r).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</small></span>
          ${st === "paid" ? badge("success", "Paid", "check") : st === "overdue" ? badge("error", "Overdue", "alert") : badge("warning", "Due", "clock")}${st !== "paid" ? `<button class="btn secondary s" data-act="sup-pay" data-no="${r.no}">Record payment</button>` : ""}</div>`; }).join("")}</div>
          <div class="note">${ic("wallet", 16)}We owe ${fmt(supOwed(x))}${supOverdue(x) ? ` · ${fmt(supOverdue(x))} is overdue` : ""}. Payment terms: ${supTerm(x)[1].toLowerCase()}.</div>`
        : `<div class="empty"><span class="circle">${ic("truck", 28)}</span><h3>No deliveries yet</h3><span>Goods receipts from this supplier appear here.</span></div>`;
    } else {
      body = x.pids.length ? `<div class="dlines">${x.pids.map(pid => { const p = byId(pid); return p ? `<div class="dline"><span class="thumb tile-${p.tone}">${ic(p.icon, 18)}</span><span class="grow"><b>${esc(p.name)}</b><small>${esc(p.sku)} · ${fq(p, p.stock)} in stock</small></span><span class="r"><b>${fmt(p.cost)}</b><small>last cost</small></span></div>` : ""; }).join("")}</div>`
        : `<div class="empty"><span class="circle">${ic("package", 28)}</span><h3>No products linked</h3><span>Products are linked when you receive them from this supplier.</span></div>`;
    }
    return `<aside class="order sup-panel" aria-label="Supplier details">
      <div class="order-head"><div class="order-title"><div style="flex:1;min-width:0"><h2>${esc(x ? x.name : d.name || "New supplier")}</h2><div class="sub">${x ? `${esc(x.contact || "No contact")} · ${supTerm(x)[1]}` : "Fill in the details and save"}</div></div>${x ? (x.active ? badge("success", "Active", null) : badge("", "Inactive", null)) : badge("info", "New", "plus")}${dirty ? badge("warning", "Unsaved", "pencil") : ""}</div>
        <div class="seg tabs" role="tablist">${tabs.map(([k, l]) => `<button role="tab" data-act="sup-tab" data-v="${k}" aria-pressed="${s.tab === k || (!x && k === "details")}" aria-selected="${s.tab === k}">${l}</button>`).join("")}</div></div>
      <div class="panel-body">${body}</div>
      <div class="order-foot">${s.tab === "details" || !x ? `<button class="btn primary l block" data-act="sup-save" ${dirty ? "" : "disabled"}>${ic("check")}${x ? "Save changes" : "Add supplier"} <kbd>Ctrl S</kbd></button>
        <div class="two"><button class="btn secondary" data-act="sup-discard" ${dirty ? "" : "disabled"}>Discard changes</button>${x ? `<button class="btn secondary" data-act="sup-grn">${ic("truck", 18)}Receive goods</button>` : ""}</div>`
        : `<button class="btn primary l block" data-act="sup-grn">${ic("truck")}Receive goods from ${esc(x.name.split(" ")[0])}</button>`}</div>
    </aside>`;
  }

  // ---------- Customers (A-60 / A-61) ----------
  const maskPhone = p => p && p.length >= 10 ? p.slice(0, 3) + "****" + p.slice(-3) : (p || "");
  const fmtPhone = p => p && p.length === 10 ? `${p.slice(0, 3)} ${p.slice(3, 6)} ${p.slice(6)}` : (p || "");
  const initialsOf = n => n.trim().split(/\s+/).slice(0, 2).map(w => w[0] || "").join("").toUpperCase() || "?";
  CUSTOMERS.push(
    { id: "ln", name: "Lanka Nursing Home", initials: "LN", credit: true },
    { id: "kp", name: "Kamal Perera", initials: "KP" },
    { id: "fz", name: "Fathima Aziz", initials: "FA" }
  );
  const CUST_ADMIN = {
    ps: { full: "0773456321", email: "accounts@pererastores.lk", address: "142 Main Street, Dehiwala", type: "Business", limit: 6000000, points: 0, since: 410, lifetime: 48650000, consent: { sms: true, email: true, at: 410 }, notes: "Small grocery reseller. Owner: Mr Sunil Perera. Pays by bank transfer at month end." },
    nk: { full: "0712345908", email: "nimal.k@gmail.com", address: "Nugegoda", type: "Retail", limit: 0, points: 1240, since: 220, lifetime: 18420000, consent: { sms: true, email: false, at: 220 }, notes: "" },
    fa: { full: "0761234114", email: "", address: "Wellawatte", type: "Retail", limit: 0, points: 380, since: 95, lifetime: 4210000, consent: { sms: false, email: false, at: 95 }, notes: "" },
    ln: { full: "0112558899", email: "stores@lankanursing.lk", address: "21 Hospital Road, Kalubowila", type: "Business", limit: 15000000, points: 0, since: 300, lifetime: 91200000, consent: { sms: false, email: true, at: 300 }, notes: "Purchase orders signed by the matron. Statement on the 1st of each month." },
    kp: { full: "0771234567", email: "", address: "Colombo 05", type: "Retail", limit: 0, points: 90, since: 30, lifetime: 820000, consent: { sms: true, email: false, at: 30 }, notes: "" },
    fz: { full: "0761234114", email: "fathima.aziz@yahoo.com", address: "", type: "Retail", limit: 0, points: 120, since: 12, lifetime: 310000, consent: { sms: true, email: true, at: 12 }, notes: "Created at Register 1 on a busy day." }
  };
  for (const c of CUSTOMERS) {
    const a = CUST_ADMIN[c.id]; if (!a) continue;
    Object.assign(c, { full: a.full, phone: maskPhone(a.full), email: a.email, address: a.address, type: a.type, limit: a.limit, points: a.points, since: daysAgo(a.since, 10, 0), lifetime: a.lifetime,
      consent: { sms: a.consent.sms, email: a.consent.email, at: daysAgo(a.consent.at, 10, 0), by: "Customer at the till" }, notes: a.notes, credit: a.limit > 0, log: [] });
  }
  const CUST_LEDGER = {
    ps: [[34, "sale", "CMB01-R01-000044", 2140000], [20, "pay", "Bank transfer · PAY-0039", -1500000], [12, "sale", "CMB01-R02-000101", 2430000], [6, "sale", "CMB01-R02-000122", 1176000]],
    ln: [[40, "sale", "CMB01-R01-000012", 3240000], [25, "pay", "Cheque 004512 · PAY-0037", -3240000], [9, "sale", "CMB01-R01-000176", 1810000]]
  };
  const PAY_TERMS_DAYS = 30;
  S.custPays = {}; S.paySeq = 42;
  S.cu = { q: "", filter: "all", open: null, tab: "profile", draft: null, showErr: false };
  const custOf = id => CUSTOMERS.find(c => c.id === id);
  const custAdmin = () => CUSTOMERS.filter(c => c.id !== "walk");
  const custSales = c => S.history.filter(s => s.customer && s.customer.id === c.id && !s.training);
  function custLedger(c) {
    const rows = (CUST_LEDGER[c.id] || []).map(([d, type, ref, amt]) => ({ date: daysAgo(d, 11, 0), type, ref, amt }));
    for (const s of custSales(c)) if (s.method === "credit") rows.push({ date: s.date, type: "sale", ref: s.no, amt: saleTotal(s) });
    for (const p of S.custPays[c.id] || []) rows.push(p);
    rows.sort((a, b) => a.date - b.date);
    let bal = 0; for (const r of rows) { bal += r.amt; r.bal = bal; }
    // First in, first out: payments clear the oldest sales first
    let paid = -rows.filter(r => r.amt < 0).reduce((a, r) => a + r.amt, 0);
    const open = [];
    for (const r of rows.filter(x => x.type === "sale")) { const use = Math.min(paid, r.amt); paid -= use; if (r.amt - use > 0) open.push({ ...r, left: r.amt - use, age: dayDiff(r.date) }); }
    return { rows, bal, open, overdue: open.filter(o => o.age > PAY_TERMS_DAYS).reduce((a, o) => a + o.left, 0) };
  }
  function custRefresh(c) {
    if (!c.type) return;
    const L = custLedger(c);
    c.note = c.credit ? `Credit available ${fmt(Math.max(0, c.limit - L.bal)).replace(".00", "")}` : c.points ? `Loyalty · ${c.points.toLocaleString("en-US")} points` : `Customer since ${c.since.toLocaleDateString("en-GB", { month: "short", year: "numeric" })}`;
  }
  CUSTOMERS.forEach(custRefresh);
  const lastVisit = c => { const s = custSales(c)[0]; return s ? s.date : null; };
  function custDupes() {
    const by = {}, out = [];
    for (const c of custAdmin()) if (c.full) (by[c.full] = by[c.full] || []).push(c);
    for (const k in by) if (by[k].length > 1) out.push(by[k]);
    return out;
  }
  function custList() {
    const f = S.cu, q = f.q.trim().toLowerCase(), qd = q.replace(/\D/g, "");
    return custAdmin().filter(c => (f.filter === "all" || (f.filter === "credit" && c.credit) || (f.filter === "owes" && custLedger(c).bal > 0) || (f.filter === "loyalty" && c.points > 0))
      && (!q || (c.name + " " + (c.email || "")).toLowerCase().includes(q) || (qd.length >= 3 && (c.full || "").includes(qd))));
  }
  function customersView() {
    const f = S.cu, list = custList(), all = custAdmin(), dup = custDupes();
    const owed = all.reduce((a, c) => a + Math.max(0, custLedger(c).bal), 0), over = all.reduce((a, c) => a + custLedger(c).overdue, 0);
    const chip = (v, l) => `<button class="chip" data-act="cu-filter" data-v="${v}" aria-pressed="${f.filter === v}">${l}</button>`;
    return `<div class="page">
      <div class="page-actions">
        <label class="search">${ic("search")}<span class="sr">Search customers</span><input id="cusearch" data-fid="cusearch" autocomplete="off" placeholder="Name, phone or e-mail…" value="${esc(f.q)}"><kbd>/</kbd></label>
        <div class="chips">${chip("all", `All · ${all.length}`)}${chip("credit", `Credit · ${all.filter(c => c.credit).length}`)}${chip("owes", `Owes us · ${all.filter(c => custLedger(c).bal > 0).length}`)}${chip("loyalty", `Loyalty · ${all.filter(c => c.points > 0).length}`)}</div>
        <span class="spacer"></span>
        <button class="btn secondary" data-act="toast" data-msg="customers.xlsx exported (phone numbers masked)">Export</button>
        <button class="btn primary" data-act="cu-new">${ic("userPlus", 18)}Add customer <kbd>N</kbd></button>
      </div>
      <div class="stats4"><div class="stat"><span>Customers</span><b>${all.length}</b></div><div class="stat"><span>Credit customers</span><b>${all.filter(c => c.credit).length}</b></div><div class="stat"><span>Owed to us</span><b>${fmt(owed)}</b></div><div class="stat"><span>Overdue (over ${PAY_TERMS_DAYS} days)</span><b style="color:${over ? "var(--error-text)" : "var(--text)"}">${fmt(over)}</b></div></div>
      ${dup.map(g => `<div class="banner">${ic("users")}<span><b>Possible duplicate:</b> ${g.map(c => esc(c.name)).join(" and ")} have the same phone number ${maskPhone(g[0].full)}.</span><button class="btn secondary" data-act="cu-merge" data-ids="${g.map(c => c.id).join(",")}">Review and merge</button></div>`).join("")}
      <div class="ctable" role="table" aria-label="Customers">
        <div class="lrow head" role="row"><span>Customer</span><span>Type</span><span>Last visit</span><span class="r">Points</span><span class="r">Balance</span></div>
        ${list.length ? list.map(c => { const L = custLedger(c), lv = lastVisit(c); return `<div class="lrow" role="row" tabindex="0" data-act="cu-open" data-id="${c.id}">
          <span class="pname"><span class="avatar s">${esc(c.initials)}</span><span style="min-width:0"><b>${esc(c.name)}</b><small>${esc(c.phone || "No phone")}${c.email ? " · " + esc(c.email) : ""}</small></span></span>
          <span>${c.type === "Business" ? badge("info", "Business", "store") : `<span class="muted">Retail</span>`}${c.credit ? " " + badge("", "Credit", "wallet") : ""}</span>
          <span class="muted">${lv ? (dayDiff(lv) === 0 ? "Today" : dayDiff(lv) === 1 ? "Yesterday" : dayDiff(lv) + " days ago") : "—"}</span>
          <span class="r">${c.points ? c.points.toLocaleString("en-US") : `<span class="muted">—</span>`}</span>
          <span class="r">${L.bal > 0 ? fmt(L.bal) : `<span class="muted">—</span>`}${L.overdue ? `<small class="late">${fmt(L.overdue)} overdue</small>` : ""}</span></div>`; }).join("")
          : `<div class="empty"><span class="circle">${ic("users", 28)}</span><h3>No customers match</h3><span>Search by name, part of the phone number, or e-mail.</span></div>`}
      </div>
      <div class="table-foot"><span>Phone numbers are masked in lists (PDPA). Open a customer to see the full details.</span><span>Click a row or press Enter</span></div>
    </div>`;
  }
  const custDraft = c => ({ id: c ? c.id : null, name: c ? c.name : "", full: c ? (c.full || "") : "", email: c ? (c.email || "") : "", address: c ? (c.address || "") : "", type: c ? (c.type || "Retail") : "Retail", limit: c ? String((c.limit || 0) / 100) : "0", notes: c ? (c.notes || "") : "" });
  const custDirty = () => { const f = S.cu; return !!f.draft && JSON.stringify(f.draft) !== JSON.stringify(custDraft(custOf(f.draft.id))); };
  function custErrors(d) {
    const e = {}, digits = d.full.replace(/\D/g, "");
    if (!d.name.trim()) e.name = "Name is required";
    if (!digits) e.full = "A phone number is required so the customer can be found at the till";
    else if (digits.length !== 10 || digits[0] !== "0") e.full = "Use a 10-digit number, e.g. 077 345 6321";
    else { const o = custAdmin().find(c => c.id !== d.id && c.full === digits); if (o) e.full = `${o.name} already has this number`; }
    if (d.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) e.email = "Check the e-mail address";
    const lim = parseFloat(d.limit || "0");
    if (isNaN(lim) || lim < 0) e.limit = "Enter 0 or more";
    else if (d.id && Math.round(lim * 100) < custLedger(custOf(d.id)).bal) e.limit = `Below the current balance of ${fmt(custLedger(custOf(d.id)).bal)}`;
    return e;
  }
  function openCustomer(id) {
    const f = S.cu, c = id ? custOf(id) : null;
    f.open = id; f.draft = custDraft(c); f.tab = "profile"; f.showErr = false; S.view = "customer"; render();
    if (!c) focusId("cu-name");
  }
  function custSave() {
    const f = S.cu, d = f.draft, er = custErrors(d);
    if (Object.keys(er).length) { f.showErr = true; render(); toast(Object.values(er)[0], { error: true }); return; }
    let c = custOf(d.id), isNew = !c;
    if (!c) { c = { id: "c" + Date.now().toString(36), points: 0, since: new Date(), lifetime: 0, consent: { sms: false, email: false, at: new Date(), by: meShort() }, log: [] }; CUSTOMERS.push(c); d.id = c.id; }
    const digits = d.full.replace(/\D/g, ""), lim = Math.round(parseFloat(d.limit || "0") * 100);
    if (!isNew && lim !== c.limit) c.log.unshift({ when: new Date(), who: meShort(), what: `Credit limit ${fmt(c.limit)} → ${fmt(lim)}` });
    Object.assign(c, { name: d.name.trim(), initials: initialsOf(d.name), full: digits, phone: maskPhone(digits), email: d.email.trim(), address: d.address.trim(), type: d.type, limit: lim, credit: lim > 0, notes: d.notes });
    if (isNew) c.log.unshift({ when: new Date(), who: meShort(), what: "Customer created" });
    custRefresh(c); f.open = c.id; f.draft = custDraft(c); f.showErr = false; render(); toast(`${c.name} ${isNew ? "added" : "saved"}`);
  }
  function custView() {
    const f = S.cu, c = custOf(f.open), d = f.draft, er = f.showErr ? custErrors(d) : {}, dirty = custDirty();
    const L = c ? custLedger(c) : { rows: [], bal: 0, open: [], overdue: 0 }, sales = c ? custSales(c) : [];
    const tabs = c ? [["profile", "Profile"], ["purchases", `Purchases · ${sales.length}`], ...(c.credit || L.rows.length ? [["ledger", "Credit ledger"]] : []), ["consent", "Consent & privacy"], ["history", "History"]] : [["profile", "Profile"]];
    if (!tabs.some(x => x[0] === f.tab)) f.tab = "profile";
    const fld = (k, label, ph, extra = "") => `<label class="field">${label}<input data-cu="${k}" data-fid="cu-${k}" id="cu-${k}" value="${esc(d[k])}" placeholder="${ph}" class="${er[k] ? "bad" : ""}" ${extra}>${er[k] ? `<span class="err">${esc(er[k])}</span>` : ""}</label>`;
    let body = "";
    if (f.tab === "profile") {
      body = `<section class="card"><div class="form-2">${fld("name", "Name *", "e.g. Perera Stores")}${fld("full", "Mobile or phone *", "077 345 6321", 'inputmode="tel"')}${fld("email", "E-mail", "For statements and e-receipts", 'inputmode="email"')}
          <label class="field">Type<select data-cu="type" data-fid="cu-type">${["Retail", "Business"].map(x => `<option ${d.type === x ? "selected" : ""}>${x}</option>`).join("")}</select></label>
          ${fld("address", "Address", "Street, town")}${fld("limit", "Credit limit (Rs)", "0 = no credit", 'inputmode="decimal"')}</div>
        <label class="field">Notes<textarea data-cu="notes" data-fid="cu-notes" placeholder="Who may sign for credit, delivery details…">${esc(d.notes)}</textarea></label>
        <div class="note">${ic("lock", 16)}Only managers can change the credit limit. Every change is in the History tab.</div>
        <div class="card-actions"><button class="btn secondary" data-act="cu-discard" ${dirty ? "" : "disabled"}>Discard</button><button class="btn primary" data-act="cu-save" ${dirty ? "" : "disabled"}>${ic("check", 18)}${c ? "Save changes" : "Add customer"} <kbd>Ctrl S</kbd></button></div></section>`;
    } else if (f.tab === "purchases") {
      body = `<section class="card">${sales.length ? `<div class="dlines">${sales.map(s => `<div class="dline"><span class="thumb tile-blue">${ic(METHOD[s.method][1], 18)}</span><span class="grow"><b>${s.no}</b><small>${s.date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} ${hm(s.date)} · ${s.lines.length} item${s.lines.length === 1 ? "" : "s"} · ${METHOD[s.method][0]} · ${esc(s.cashier)}</small></span><b>${fmt(saleTotal(s))}</b></div>`).join("")}</div>`
        : `<div class="empty"><span class="circle">${ic("receipt", 28)}</span><h3>No purchases in the last 30 days</h3><span>Older sales are in the reports.</span></div>`}
        <div class="note">${ic("chart", 16)}Lifetime spend ${fmt(c.lifetime + sales.reduce((a, s) => a + saleTotal(s), 0))} since ${c.since.toLocaleDateString("en-GB", { month: "short", year: "numeric" })}</div></section>`;
    } else if (f.tab === "ledger") {
      body = `<section class="card"><div class="card-head"><h2>Credit ledger</h2><button class="btn secondary" data-act="toast" data-msg="Statement for ${esc(c.name)} sent to the printer${c.email ? " and e-mailed to " + esc(c.email) : ""}">${ic("printer", 18)}Print statement</button><button class="btn primary" data-act="cu-settle" ${L.bal > 0 ? "" : "disabled"}>${ic("wallet", 18)}Record settlement</button></div>
        ${L.open.length ? `<div class="aging">${[["Current", 0, 30], ["31–60 days", 31, 60], ["Over 60 days", 61, 9999]].map(([l, a, b]) => { const v = L.open.filter(o => o.age >= a && o.age <= b).reduce((x, o) => x + o.left, 0); return `<div class="${v && a > 0 ? "late-b" : ""}"><span>${l}</span><b>${fmt(v)}</b></div>`; }).join("")}</div>` : ""}
        <div class="ledger" role="table" aria-label="Ledger"><div class="grow-row head" role="row"><span>Date</span><span>Details</span><span class="r">Charge</span><span class="r">Payment</span><span class="r">Balance</span></div>
          ${L.rows.slice().reverse().map(r => { const o = L.open.find(x => x.ref === r.ref && r.type === "sale"); return `<div class="grow-row" role="row"><span class="muted">${r.date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span><span><b>${r.type === "sale" ? "Credit sale " : ""}${esc(r.ref)}</b>${o ? `<small class="${o.age > PAY_TERMS_DAYS ? "late" : "muted"}">${fmt(o.left)} unpaid · ${o.age} days${o.age > PAY_TERMS_DAYS ? " · overdue" : ""}</small>` : r.type === "sale" ? `<small class="muted">Paid</small>` : ""}</span>
            <span class="r">${r.amt > 0 ? fmt(r.amt) : ""}</span><span class="r" style="color:var(--success-text)">${r.amt < 0 ? fmt(-r.amt) : ""}</span><span class="r"><b>${fmt(r.bal)}</b></span></div>`; }).join("")}</div>
        <div class="note">${ic("help", 16)}Payments clear the oldest credit sales first. Terms: ${PAY_TERMS_DAYS} days.</div></section>`;
    } else if (f.tab === "consent") {
      const tg = (k, l, s) => `<label class="check-row"><input type="checkbox" data-act="cu-consent" data-k="${k}" ${c.consent[k] ? "checked" : ""}><span><b>${l}</b><small>${s}</small></span></label>`;
      body = `<section class="card"><h2>Marketing consent</h2>${tg("sms", "SMS offers and reminders", "Promotions and loyalty updates by SMS. Receipts and credit reminders are always allowed.")}${tg("email", "E-mail offers", "Newsletters and promotions by e-mail.")}
        <div class="note">${ic("clock", 16)}Last changed ${c.consent.at.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} · ${esc(c.consent.by)}</div></section>
        <section class="card"><h2>Personal data (PDPA)</h2><p class="sub" style="margin:0">The customer can ask for a copy of their data, or ask us to delete it. Sales stay in the books for tax, but the name, phone and e-mail are removed.</p>
          <div class="card-actions" style="justify-content:flex-start"><button class="btn secondary" data-act="toast" data-msg="Data export for ${esc(c.name)} prepared · ready to hand over within 30 days">Export their data</button>
          <button class="btn danger-outline" data-act="cu-forget" ${L.bal > 0 ? "disabled" : ""}>Delete personal data</button></div>
          ${L.bal > 0 ? `<div class="note">${ic("lock", 16)}Not possible while ${fmt(L.bal)} is owed. Settle the balance first.</div>` : ""}</section>`;
    } else {
      const items = [...c.log, { when: c.since, who: "System", what: "Customer created" }];
      body = `<section class="card"><div class="dlines">${items.map(x => `<div class="dline"><span class="grow"><b>${esc(x.what)}</b><small>${x.when.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} ${hm(x.when)} · ${esc(x.who)}</small></span></div>`).join("")}</div></section>`;
    }
    const stats = c ? `<div class="stats4">
        <div class="stat"><span>Balance owed</span><b style="color:${L.overdue ? "var(--error-text)" : "var(--text)"}">${fmt(Math.max(0, L.bal))}</b>${L.overdue ? `<small class="late">${fmt(L.overdue)} overdue</small>` : ""}</div>
        <div class="stat"><span>Credit available</span><b>${c.credit ? fmt(Math.max(0, c.limit - L.bal)) : "No credit"}</b>${c.credit ? `<small class="muted">of ${fmt(c.limit)}</small>` : ""}</div>
        <div class="stat"><span>Loyalty points</span><b>${c.points.toLocaleString("en-US")}</b></div>
        <div class="stat"><span>Last visit</span><b>${lastVisit(c) ? (dayDiff(lastVisit(c)) === 0 ? "Today" : dayDiff(lastVisit(c)) + " days ago") : "—"}</b></div></div>` : "";
    return `<div class="page cust">
      <div class="cust-head"><button class="btn ghost" data-act="cu-back">${ic("arrowRight", 18)}All customers</button>
        <span class="avatar l">${esc(c ? c.initials : initialsOf(d.name || "New"))}</span><div class="grow"><h2>${esc(c ? c.name : d.name || "New customer")}</h2><span class="sub">${c ? `${esc(fmtPhone(c.full))} · customer since ${c.since.toLocaleDateString("en-GB", { month: "short", year: "numeric" })}` : "Fill in the profile and save"}</span></div>
        ${c ? (c.type === "Business" ? badge("info", "Business", "store") : badge("", "Retail", null)) : badge("info", "New", "plus")}${dirty ? badge("warning", "Unsaved", "pencil") : ""}</div>
      ${stats}
      <div class="seg tabs" role="tablist">${tabs.map(([k, l]) => `<button role="tab" data-act="cu-tab" data-v="${k}" aria-pressed="${f.tab === k}" aria-selected="${f.tab === k}">${l}</button>`).join("")}</div>
      ${body}
    </div>`;
  }
  function settleModal(m, head) {
    const c = custOf(m.cid), L = custLedger(c), amt = Math.round((parseFloat(m.amount) || 0) * 100), needRef = m.method === "transfer" || m.method === "cheque";
    const over = amt > L.bal, ok = amt > 0 && !over && (!needRef || m.ref.trim());
    let left = amt; const covers = L.open.map(o => { const use = Math.min(left, o.left); left -= use; return use ? `${o.ref}${use < o.left ? ` (part, ${fmt(use)})` : ""}` : null; }).filter(Boolean);
    return `<div class="modal" role="dialog" aria-modal="true" aria-labelledby="mt" style="width:min(520px,100%)">${head("Record settlement", `${c.name} · owes ${fmt(L.bal)}`)}
      <div class="cm-kinds" style="grid-template-columns:repeat(4,1fr)">${[["cash", "Cash", "cash"], ["transfer", "Bank transfer", "landmark"], ["cheque", "Cheque", "note"], ["card", "Card", "card"]].map(([k, l, i]) => `<button class="method" data-act="set-method" data-k="${k}" aria-pressed="${m.method === k}">${ic(i, 20)}<span>${l}</span></button>`).join("")}</div>
      <label class="field">Amount (Rs)<input data-set="amount" data-fid="set-amount" id="setamt" inputmode="decimal" value="${esc(m.amount)}" class="${over ? "bad" : ""}">${over ? `<span class="err">More than the balance of ${fmt(L.bal)}</span>` : covers.length ? `<span class="hint">Clears ${covers.join(", ")}</span>` : ""}</label>
      <div class="chips wrap">${[["Full balance", L.bal], ...(L.overdue ? [["Overdue only", L.overdue]] : [])].map(([l, v]) => `<button class="chip" data-act="set-quick" data-v="${(v / 100).toFixed(2)}">${l} · ${fmt(v)}</button>`).join("")}</div>
      ${needRef ? `<label class="field">${m.method === "cheque" ? "Cheque number and bank" : "Transfer reference"} *<input data-set="ref" data-fid="set-ref" value="${esc(m.ref)}" placeholder="${m.method === "cheque" ? "e.g. 004613 · Commercial Bank" : "e.g. CEFT 88213409"}"></label>` : ""}
      <div class="note">${ic("printer", 16)}A settlement receipt is printed${c.email ? " and e-mailed" : ""}. ${m.method === "cash" ? "Cash goes into the drawer of the open shift." : ""}</div>
      <button class="btn primary l block" data-act="set-save" ${ok ? "" : "disabled"}>${ic("check")}Record ${amt ? fmt(amt) : "payment"} <kbd>Enter</kbd></button></div>`;
  }
  function settleSave() {
    const m = S.modal, c = custOf(m.cid), L = custLedger(c), amt = Math.round((parseFloat(m.amount) || 0) * 100);
    if (!(amt > 0) || amt > L.bal) { toast(amt > L.bal ? "More than the balance" : "Enter an amount", { error: true }); return; }
    if ((m.method === "transfer" || m.method === "cheque") && !m.ref.trim()) { toast("Add the reference", { error: true }); return; }
    const no = `PAY-${String(S.paySeq++).padStart(4, "0")}`, label = { cash: "Cash", transfer: "Bank transfer", cheque: "Cheque", card: "Card" }[m.method];
    (S.custPays[c.id] = S.custPays[c.id] || []).push({ date: new Date(), type: "pay", ref: `${label}${m.ref.trim() ? " " + m.ref.trim() : ""} · ${no}`, amt: -amt });
    c.log.unshift({ when: new Date(), who: meShort(), what: `Settlement ${fmt(amt)} · ${label} · ${no}` });
    custRefresh(c); closeModal(); render(); toast(`${no} · ${fmt(amt)} recorded · receipt printed`);
  }
  function mergeModal(m, head) {
    const cs = m.ids.map(custOf), keep = custOf(m.keep);
    return `<div class="modal" role="dialog" aria-modal="true" aria-labelledby="mt" style="width:min(560px,100%)">${head("Merge duplicate customers", "Choose the record to keep")}
      <div class="opt-list" role="radiogroup">${cs.map(c => `<button class="opt" role="radio" data-act="merge-keep" data-id="${c.id}" aria-selected="${m.keep === c.id}" aria-checked="${m.keep === c.id}"><span class="avatar s">${esc(c.initials)}</span><span class="grow"><b>${esc(c.name)}</b><small>Since ${c.since.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} · ${custSales(c).length} recent sale${custSales(c).length === 1 ? "" : "s"} · ${c.points} points${c.email ? " · " + esc(c.email) : ""}</small></span>${m.keep === c.id ? badge("success", "Keep", "check") : ""}</button>`).join("")}</div>
      <div class="banner">${ic("alert")}<span>Sales, points (${cs.reduce((a, c) => a + c.points, 0)} in total) and the credit ledger move to <b>${esc(keep.name)}</b>. Empty details are filled from the other record. This cannot be undone; the audit log keeps both IDs.</span></div>
      <div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn secondary" data-act="close">Cancel</button><button class="btn primary" data-act="merge-do">${ic("users", 18)}Merge into ${esc(keep.name)} <kbd>Enter</kbd></button></div></div>`;
  }
  function mergeDo() {
    const m = S.modal, keep = custOf(m.keep), others = m.ids.filter(id => id !== m.keep).map(custOf);
    for (const o of others) {
      keep.points += o.points; keep.lifetime += o.lifetime;
      for (const k of ["email", "address", "notes"]) if (!keep[k] && o[k]) keep[k] = o[k];
      if (o.since < keep.since) keep.since = o.since;
      for (const s of S.history) if (s.customer && s.customer.id === o.id) s.customer = keep;
      if (S.custPays[o.id]) (S.custPays[keep.id] = S.custPays[keep.id] || []).push(...S.custPays[o.id]);
      if (S.customer && S.customer.id === o.id) S.customer = keep;
      CUSTOMERS.splice(CUSTOMERS.indexOf(o), 1);
      keep.log.unshift({ when: new Date(), who: meShort(), what: `Merged with ${o.name} (${o.id})` });
    }
    custRefresh(keep); closeModal(); render(); toast(`Merged into ${keep.name} · ${keep.points} points`);
  }

  // ---------- Shifts & cash review (A-55) ----------
  const shExp = r => r.float + r.cashSales - r.refunds + r.cashIn - r.cashOut;
  const shAt = (d, h, m) => daysAgo(d, h, m);
  S.sr = { filter: "review", sel: "SH-0321", note: "", err: false, list: [
    { id: "SH-0321", branch: "CMB01", reg: "R01", cashier: "Anushka De Silva", opened: shAt(0, 7, 30), closed: shAt(0, 13, 2), float: 500000, cashSales: 1864000, refunds: 0, cashIn: 0, cashOut: 0, card: 1120000, qr: 286000, credit: 0, count: 64, counted: 2239000, reason: "Gave wrong change", cnote: "Rush at 12:30, I think I gave change for Rs 5,000 instead of Rs 1,000 once.", status: "review",
      moves: [] },
    { id: "SH-0319", branch: "CMB01", reg: "R03", cashier: "Nimal Perera", opened: shAt(1, 14, 0), closed: shAt(1, 21, 5), float: 500000, cashSales: 3120000, refunds: 45000, cashIn: 200000, cashOut: 150000, card: 1430000, qr: 512000, credit: 380000, count: 112, counted: 3695000, reason: "Customer did not wait for change", cnote: "Two customers left without their change.", status: "review",
      moves: [["in", 200000, "Float top-up", "18:10"], ["out", 150000, "Petty cash: cleaning", "19:40"]] },
    { id: "SH-0318", branch: "KDY01", reg: "R01", cashier: "Chamari Wijesinghe", opened: shAt(1, 8, 0), closed: shAt(1, 17, 30), float: 400000, cashSales: 2260000, refunds: 0, cashIn: 0, cashOut: 0, card: 980000, qr: 210000, credit: 0, count: 91, counted: 2660000, reason: "", cnote: "", status: "approved", by: "Auto", mnote: "Exact count · no review needed", at: shAt(1, 17, 30), moves: [] },
    { id: "SH-0317", branch: "GAL01", reg: "R02", cashier: "Roshan Fernando", opened: shAt(1, 8, 30), closed: shAt(1, 18, 0), float: 400000, cashSales: 1540000, refunds: 30000, cashIn: 0, cashOut: 0, card: 640000, qr: 120000, credit: 0, count: 70, counted: 1890000, reason: "", cnote: "", status: "approved", by: "Auto", mnote: "Within Rs 500 · approved automatically (BR-08)", at: shAt(1, 18, 0), moves: [] },
    { id: "SH-0316", branch: "CMB01", reg: "R02", cashier: "Sachini Kumari", opened: shAt(1, 7, 45), closed: shAt(1, 14, 0), float: 500000, cashSales: 2410000, refunds: 0, cashIn: 0, cashOut: 50000, card: 1310000, qr: 330000, credit: 760000, count: 88, counted: 2795000, reason: "Counting mistake", cnote: "Recounted coins, still short.", status: "approved", by: "Malini J.", mnote: "Checked the CCTV for 12:10. Small coin mistake, accepted.", at: shAt(1, 15, 20),
      moves: [["out", 50000, "Petty cash: transport", "11:05"]] }
  ] };
  function liveShifts() {
    return Object.entries(S.shifts).map(([uid, sh]) => { const u = USERS.find(x => x.id === uid); return { id: "LIVE-" + uid, live: true, branch: "CMB01", reg: "R02", cashier: u ? u.name : uid, opened: new Date(sh.start), closed: null, float: sh.float, cashSales: sh.cashSales, refunds: sh.refunds, cashIn: sh.cashIn, cashOut: sh.cashOut, card: sh.cardSales, qr: sh.qrSales, credit: sh.creditSales, count: sh.count, counted: null, status: "open", moves: (sh.moves || []).map(m => [m.kind === "in" ? "in" : "out", m.amount, m.reason, hm(m.time)]) }; });
  }
  const srAll = () => [...liveShifts(), ...S.sr.list];
  const srPending = () => S.sr.list.filter(r => r.status === "review").length;
  function srList() { const f = S.sr.filter; return srAll().filter(r => f === "all" || r.status === f || (f === "review" && r.status === "recount")); }
  function srMove(d) {
    const list = srList(); if (!list.length) return;
    const i = list.findIndex(r => r.id === S.sr.sel);
    S.sr.sel = list[Math.max(0, Math.min(list.length - 1, i < 0 ? 0 : i + d))].id; S.sr.note = ""; S.sr.err = false; render();
    const row = app.querySelector('.shrow[aria-selected="true"]'); if (row) row.scrollIntoView({ block: "nearest" });
  }
  function srDecide(kind) {
    const f = S.sr, r = f.list.find(x => x.id === f.sel); if (!r || r.status !== "review") return;
    if (kind === "recount" && f.note.trim().length < 5) { f.err = true; render(); toast("Tell the cashier what to check (a short note)", { error: true }); focusId("srnote"); return; }
    r.status = kind === "approve" ? "approved" : "recount"; r.by = meShort(); r.at = new Date(); r.mnote = f.note.trim() || (kind === "approve" ? "Approved" : "");
    const next = S.sr.list.find(x => x.status === "review");
    f.sel = next ? next.id : r.id; f.note = ""; f.err = false; render();
    toast(kind === "approve" ? `${r.id} approved · difference ${signed(r.counted - shExp(r))} booked to cash over/short` : `Recount requested from ${r.cashier.split(" ")[0]}`);
  }
  function srZ(r) {
    return { sh: { float: r.float, cashSales: r.cashSales, cardSales: r.card, qrSales: r.qr, creditSales: r.credit, refunds: r.refunds, cashIn: r.cashIn, cashOut: r.cashOut, count: r.count, start: r.opened },
      counted: r.counted, exp: shExp(r), diff: r.counted - shExp(r), reason: r.reason, user: { name: r.cashier }, closed: r.closed, no: `Z-${r.branch}-${r.reg}-${r.id.slice(3)}`, reg: `${r.branch} · ${r.reg}` };
  }
  function shiftsView() {
    if (S.user.role !== "Manager") return closeShiftView();
    const f = S.sr, list = srList(), all = srAll();
    if (!list.some(r => r.id === f.sel)) { f.sel = list[0] ? list[0].id : null; f.note = ""; }
    const chip = (v, l) => `<button class="chip" data-act="sr-filter" data-v="${v}" aria-pressed="${f.filter === v}">${l}</button>`;
    const pendingDiff = S.sr.list.filter(r => r.status === "review").reduce((a, r) => a + (r.counted - shExp(r)), 0);
    const left = `<section class="products" aria-label="Shifts">
      <div class="stats"><div class="stat"><span>Waiting for approval</span><b style="color:${srPending() ? "var(--warning-text)" : "var(--text)"}">${srPending()}</b></div><div class="stat"><span>Net difference waiting</span><b>${signed(pendingDiff)}</b></div><div class="stat"><span>Open now</span><b>${liveShifts().length}</b></div></div>
      <div class="chips">${chip("review", `Needs approval · ${all.filter(r => r.status === "review" || r.status === "recount").length}`)}${chip("open", `Open now · ${all.filter(r => r.status === "open").length}`)}${chip("approved", "Approved")}${chip("all", `All · ${all.length}`)}</div>
      ${list.length ? `<div class="htable" role="listbox" aria-label="Shift list">
        <div class="shrow head" aria-hidden="true"><span>Register</span><span>Cashier</span><span class="amt">Expected</span><span class="amt">Difference</span><span>Status</span></div>
        ${list.map(r => { const d = r.counted == null ? null : r.counted - shExp(r); return `<button class="shrow" role="option" aria-selected="${r.id === f.sel}" data-act="sr-sel" data-id="${r.id}">
          <span><b>${r.branch} · ${r.reg}</b><small>${r.live ? "Open shift" : r.id}</small></span><span class="nm"><b>${esc(r.cashier)}</b><small>${r.closed ? "Closed " + (dayDiff(r.closed) === 0 ? "today " : "yesterday ") + hm(r.closed) : "Since " + hm(r.opened)}</small></span>
          <span class="amt">${fmt(shExp(r))}</span><span class="amt ${d == null ? "" : d < 0 ? "neg" : d > 0 ? "pos" : ""}">${d == null ? `<span class="muted">counting later</span>` : d === 0 ? "Exact" : signed(d)}</span>
          <span>${srBadge(r)}</span></button>`; }).join("")}</div>`
        : `<div class="empty card"><span class="circle">${ic("check", 28)}</span><h3>${f.filter === "review" ? "Nothing waiting" : "No shifts"}</h3><span>${f.filter === "review" ? "Every closed shift is approved." : "Try another filter."}</span></div>`}
      <div class="note">${ic("help", 16)}Differences up to ${fmt(CS_THRESHOLD)} are approved automatically (BR-08). Bigger ones wait here with the cashier's reason.</div>
    </section>`;
    return `<div class="body">${left}${srPanel(all.find(r => r.id === f.sel))}</div>`;
  }
  const srBadge = r => r.status === "open" ? badge("info", "Open", "clock") : r.status === "review" ? badge("warning", "Needs approval", "alert") : r.status === "recount" ? badge("error", "Recount asked", "undo") : badge("success", r.by === "Auto" ? "Auto-approved" : "Approved", "check");
  function srPanel(r) {
    if (!r) return `<aside class="order sr-panel"><div class="empty" style="flex:1"><span class="circle">${ic("wallet", 28)}</span><h3>Select a shift</h3><span>Click a row, or use ↑ ↓.</span></div></aside>`;
    const f = S.sr, exp = shExp(r), d = r.counted == null ? null : r.counted - exp;
    const kvr = (l, v, cls = "") => `<dt>${l}</dt><dd class="${cls}">${v}</dd>`;
    return `<aside class="order sr-panel" aria-label="Shift details">
      <div class="order-head"><div class="order-title"><div style="flex:1;min-width:0"><h2>${esc(r.cashier)}</h2><div class="sub">${r.branch} · Register ${r.reg} · ${r.opened.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} ${hm(r.opened)}–${r.closed ? hm(r.closed) : "now"} · ${r.count} sales</div></div>${srBadge(r)}</div>
        ${d != null ? `<div class="sr-diff ${d < 0 ? "neg" : d > 0 ? "pos" : ""}"><span>Difference</span><b>${d === 0 ? "Exact" : signed(d)}</b><small>Counted ${fmt(r.counted)} · expected ${fmt(exp)}</small></div>` : `<div class="sr-diff"><span>Expected in the drawer now</span><b>${fmt(exp)}</b><small>The cashier counts when closing the shift</small></div>`}</div>
      <div class="panel-body">
        <div class="field">Cash<dl class="kv exc-kv">${kvr("Opening float", fmt(r.float))}${kvr("Cash sales", fmt(r.cashSales))}${kvr("Cash refunds", r.refunds ? "−" + fmt(r.refunds) : fmt(0))}${kvr("Cash in", fmt(r.cashIn))}${kvr("Cash out", r.cashOut ? "−" + fmt(r.cashOut) : fmt(0))}${kvr("<b>Expected</b>", `<b>${fmt(exp)}</b>`)}${r.counted != null ? kvr("<b>Counted</b>", `<b>${fmt(r.counted)}</b>`) : ""}</dl></div>
        <div class="field">Other payments (checked against the terminal settlement)<dl class="kv exc-kv">${kvr("Card", fmt(r.card))}${kvr("LankaQR", fmt(r.qr))}${kvr("Customer credit", fmt(r.credit))}</dl></div>
        ${r.moves.length ? `<div class="field">Cash movements<div class="dlines">${r.moves.map(([k, a, why, tm]) => `<div class="dline"><span class="grow"><b>${esc(why)}</b><small>${tm}</small></span><b style="color:${k === "in" ? "var(--success-text)" : "var(--error-text)"}">${k === "in" ? "+" : "−"}${fmt(a)}</b></div>`).join("")}</div></div>` : ""}
        ${r.reason ? `<div class="field">Cashier's reason<p class="exc-problem warning"><b>${esc(r.reason)}</b>${r.cnote ? ` · ${esc(r.cnote)}` : ""}</p></div>` : ""}
        ${r.status === "approved" || r.status === "recount" ? `<div class="banner" style="${r.status === "approved" ? "background:var(--success-tint);color:var(--success-text)" : ""}">${ic(r.status === "approved" ? "check" : "undo")}<span>${r.status === "approved" ? "Approved" : "Recount asked"} by ${esc(r.by)}${r.at ? " · " + r.at.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) + " " + hm(r.at) : ""}${r.mnote ? ` · “${esc(r.mnote)}”` : ""}</span></div>` : ""}
        ${r.status === "review" ? `<label class="field">Manager note<textarea id="srnote" data-fid="srnote" placeholder="What did you check? Required when asking for a recount.">${esc(f.note)}</textarea>${f.err ? `<span class="err">A short note is required</span>` : ""}</label>` : ""}
      </div>
      <div class="order-foot">${r.status === "review" ? `<button class="btn primary l block" data-act="sr-approve">${ic("check")}Approve difference <kbd>Ctrl Enter</kbd></button>
        <div class="two"><button class="btn secondary" data-act="sr-recount">${ic("undo", 18)}Ask for a recount</button><button class="btn secondary" data-act="sr-z" data-id="${r.id}">${ic("printer", 18)}Z-report</button></div>`
        : r.status === "open" ? `<button class="btn secondary l block" data-act="toast" data-msg="X-report (mid-shift) printed for ${esc(r.cashier)}">${ic("printer")}Print X-report</button>`
        : `<button class="btn secondary l block" data-act="sr-z" data-id="${r.id}">${ic("printer")}Reprint Z-report</button>`}</div>
    </aside>`;
  }

  // ---------- Tax documents (A-65) ----------
  const SELLER = { name: "City Pharmacy & Mart (Pvt) Ltd", vat: "114128890-7000", address: "No. 12, Galle Road, Colombo 03", phone: "011 250 4411" };
  const VAT_RE = /^\d{9}-7000$/;
  Object.assign(custOf("ps"), { vat: "114567321-7000" });
  Object.assign(custOf("ln"), { vat: "409876543-7000" });
  const TD_BUYERS = { hch: { name: "Hill Country Hotel (Pvt) Ltd", vat: "114223344-7000", address: "Lake Road, Kandy" }, spl: { name: "Southern Pharmacy (Pvt) Ltd", vat: "114998877-7000", address: "Matara Road, Galle" } };
  const bOf = id => { const c = custOf(id); return c ? { name: c.name, vat: c.vat || "", address: c.address || "" } : { ...TD_BUYERS[id] }; };
  const tdLine = ([pid, qty, unit, disc = 0]) => { const p = byId(pid); return { pid, name: p.name, qty, unit, disc, tax: p.tax }; };
  S.tax = { q: "", type: "all", period: "cur", branch: "all", sel: null, cnSeq: { CMB01: 8, KDY01: 5, GAL01: 2 }, dnSeq: { CMB01: 1, KDY01: 3, GAL01: 1 }, tiSeq: { "CMB01-R01": 15, "CMB01-R02": 32 },
    docs: [
      { no: "CMB01-R01-TI-000014", type: "TI", date: daysAgo(9, 15, 40), buyer: bOf("ln"), ref: "CMB01-R01-000176", lines: [["pc", 100, 3200], ["am", 20, 45000], ["tp", 10, 38000], ["bw", 15, 14000]].map(tdLine) },
      { no: "GAL01-R02-TI-000019", type: "TI", date: daysAgo(5, 11, 5), buyer: bOf("spl"), ref: "GAL01-R02-000311", lines: [["pc", 300, 3200], ["tp", 24, 38000]].map(tdLine) },
      { no: "KDY01-R01-TI-000044", type: "TI", date: daysAgo(8, 10, 20), buyer: bOf("hch"), ref: "KDY01-R01-000402", lines: [["ct", 24, 76000], ["bw", 48, 14000], ["cc", 12, 52000]].map(tdLine) },
      { no: "CMB01-R02-TI-000027", type: "TI", date: daysAgo(16, 9, 30), buyer: bOf("ps"), ref: "CMB01-R02-000071", lines: [["br", 4, 325000], ["co", 3, 98000], ["sh", 2, 109000]].map(tdLine) },
      { no: "CMB01-CN-000007", type: "CN", date: daysAgo(14, 12, 0), buyer: bOf("ps"), ref: "CMB01-R02-TI-000027", reason: "Damaged on delivery", by: "Malini J.", lines: [["sh", 2, 109000]].map(tdLine) },
      { no: "CMB01-R01-TI-000011", type: "TI", date: daysAgo(40, 14, 10), buyer: bOf("ln"), ref: "CMB01-R01-000012", lines: [["am", 50, 45000], ["pc", 250, 3200], ["tp", 5, 38000]].map(tdLine) },
      { no: "KDY01-R01-TI-000039", type: "TI", date: daysAgo(35, 16, 0), buyer: bOf("hch"), ref: "KDY01-R01-000355", lines: [["ct", 20, 76000], ["mp", 6, 115000]].map(tdLine) },
      { no: "KDY01-CN-000004", type: "CN", date: daysAgo(31, 10, 0), buyer: bOf("hch"), ref: "KDY01-R01-TI-000039", reason: "Goods returned", by: "Chamari W.", lines: [["ct", 4, 76000]].map(tdLine) },
      { no: "KDY01-DN-000002", type: "DN", date: daysAgo(30, 11, 30), buyer: bOf("hch"), ref: "KDY01-R01-TI-000039", reason: "Delivery charge not invoiced", by: "Chamari W.", lines: [{ pid: null, name: "Delivery to Lake Road, Kandy", qty: 1, unit: 150000, disc: 0, tax: "std" }] }
    ] };
  const branchOf = no => no.slice(0, 5);
  function docTotals(d) {
    let net = 0, vat = 0, exempt = 0;
    for (const l of d.lines) { const g = Math.round(l.qty * l.unit * (100 - (l.disc || 0)) / 100); if (l.tax === "exempt") { exempt += g; net += g; } else { const n = Math.round(g * 100 / 118); net += n; vat += g - n; } }
    return { net, vat, exempt, std: net - exempt, total: net + vat };
  }
  function saleDocs() {
    return S.history.filter(s => s.taxInvoice && !s.training).map(s => ({ no: s.taxInvoice, type: "TI", date: s.tiDate || s.date, buyer: s.buyer || { name: s.customer.name, vat: s.customer.vat || "", address: s.customer.address || "" }, ref: s.no, sale: s,
      lines: s.lines.map(l => { const p = byId(l.pid); return { pid: l.pid, name: p.name, qty: l.qty, unit: l.unit, disc: l.disc, tax: p.tax }; }) }));
  }
  const allDocs = () => [...saleDocs(), ...S.tax.docs].sort((a, b) => b.date - a.date);
  const monthKey = d => d.getFullYear() * 12 + d.getMonth();
  const periodKey = p => { const n = new Date(); return monthKey(n) - (p === "prev" ? 1 : 0); };
  const periodLabel = p => { const n = new Date(); n.setDate(1); if (p === "prev") n.setMonth(n.getMonth() - 1); return n.toLocaleDateString("en-GB", { month: "long", year: "numeric" }); };
  const creditedQty = (ti, i) => S.tax.docs.concat(saleDocs()).filter(d => d.type === "CN" && d.ref === ti.no).reduce((a, d) => a + d.lines.filter(l => l.src === i || (l.src == null && l.pid && l.pid === ti.lines[i].pid)).reduce((x, l) => x + l.qty, 0), 0);
  function tiStatus(d) {
    if (d.type !== "TI") return null;
    const tot = d.lines.reduce((a, l) => a + l.qty, 0), cr = d.lines.reduce((a, l, i) => a + Math.min(l.qty, creditedQty(d, i)), 0);
    return cr <= 0 ? "issued" : cr >= tot ? "credited" : "part";
  }
  const TD_TYPE = { TI: ["Tax invoice", "receipt", "info"], CN: ["Credit note", "undo", "warning"], DN: ["Debit note", "plus", ""] };
  function taxList() {
    const f = S.tax, q = f.q.trim().toLowerCase(), pk = periodKey(f.period);
    return allDocs().filter(d => (f.period === "all" || monthKey(d.date) === pk) && (f.type === "all" || d.type === f.type) && (f.branch === "all" || branchOf(d.no) === f.branch)
      && (!q || [d.no, d.ref, d.buyer.name, d.buyer.vat].join(" ").toLowerCase().includes(q)));
  }
  const taxTabs = cur => `<div class="seg tabs big" role="tablist">${[["tax", "Tax documents"], ["vat", "VAT report"]].map(([v, l]) => `<button role="tab" data-act="nav" data-view="${v}" aria-pressed="${cur === v}" aria-selected="${cur === v}">${l}</button>`).join("")}</div>`;
  function taxGuard() { return S.user.role === "Manager" ? null : `<div class="placeholder"><div class="empty"><span class="circle">${ic("lock", 28)}</span><h3>Tax documents are for managers and the accountant</h3><span>${esc(S.user.short)} is signed in as ${esc(S.user.role.toLowerCase())}. Cashiers issue tax invoices at the till with the sale.</span><button class="btn primary s" data-act="logout">Switch user</button></div></div>`; }
  function taxView() {
    const g0 = taxGuard(); if (g0) return g0;
    const f = S.tax, list = taxList();
    if (!list.some(d => d.no === f.sel)) f.sel = list[0] ? list[0].no : null;
    const chip = (v, l) => `<button class="chip" data-act="td-type" data-v="${v}" aria-pressed="${f.type === v}">${l}</button>`;
    const sum = list.reduce((a, d) => { const t = docTotals(d), s = d.type === "CN" ? -1 : 1; a.net += s * t.net; a.vat += s * t.vat; return a; }, { net: 0, vat: 0 });
    const left = `<section class="products" aria-label="Tax documents">
      ${taxTabs("tax")}
      <div class="search-row"><label class="search">${ic("search")}<span class="sr">Search documents</span><input id="tdsearch" data-fid="tdsearch" autocomplete="off" placeholder="Document no., receipt, buyer or VAT number…" value="${esc(f.q)}"><kbd>/</kbd></label>
        <button class="btn primary" data-act="ti-new">${ic("plus", 18)}Tax invoice for a receipt</button></div>
      <div class="filters">
        <select data-tf="period" data-fid="tf-period" aria-label="Period">${[["cur", periodLabel("cur")], ["prev", periodLabel("prev")], ["all", "All periods"]].map(([v, l]) => `<option value="${v}" ${f.period === v ? "selected" : ""}>${l}</option>`).join("")}</select>
        <select data-tf="branch" data-fid="tf-branch" aria-label="Branch"><option value="all">All branches</option>${BRANCHES.map(b => `<option value="${b[0]}" ${f.branch === b[0] ? "selected" : ""}>${b[1]}</option>`).join("")}</select>
        <div class="chips">${chip("all", "All")}${chip("TI", "Tax invoices")}${chip("CN", "Credit notes")}${chip("DN", "Debit notes")}</div>
      </div>
      ${list.length ? `<div class="htable" role="listbox" aria-label="Documents">
        <div class="trow head" aria-hidden="true"><span>Document</span><span>Buyer</span><span class="amt">Total</span><span>Status</span></div>
        ${list.map(d => { const t = docTotals(d), s = d.type === "CN" ? "−" : "", st = tiStatus(d), [tl, ti, tt] = TD_TYPE[d.type]; return `<button class="trow" role="option" aria-selected="${d.no === f.sel}" data-act="td-sel" data-no="${d.no}">
          <span class="no"><b>${d.no}</b><small>${badge(tt, tl, ti)} ${d.date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</small></span>
          <span class="no"><b>${esc(d.buyer.name)}</b><small>${d.buyer.vat ? "VAT " + esc(d.buyer.vat) : `<span class="late">No buyer VAT number</span>`}</small></span>
          <span class="amt">${s}${fmt(t.total)}<small>VAT ${s}${fmt(t.vat)}</small></span>
          <span>${st === "credited" ? badge("", "Credited", "undo") : st === "part" ? badge("warning", "Part credited", "undo") : badge("success", "Issued", "check")}</span></button>`; }).join("")}</div>
        <div class="table-foot"><span>${list.length} document${list.length === 1 ? "" : "s"} · net ${fmt(sum.net)} excl. VAT · VAT ${fmt(sum.vat)}</span><span>Credit notes count as negative</span></div>`
        : `<div class="empty card"><span class="circle">${ic("receipt", 28)}</span><h3>No documents match</h3><span>Try another period or branch, or clear the search.</span></div>`}
      <div class="banner" style="background:var(--primary-tint);color:var(--primary-text)">${ic("landmark")}<span>Documents are never changed after they are issued. Corrections are new credit or debit notes. Sending to IRD RAMIS (e-invoicing) arrives in release 3; each document will then show its fiscal status here.</span></div>
    </section>`;
    return `<div class="body">${left}${tdPanel(allDocs().find(d => d.no === f.sel))}</div>`;
  }
  function tdPaper(d) {
    const t = docTotals(d), [tl] = TD_TYPE[d.type], neg = d.type === "CN";
    return `<div class="taxdoc">
      <div class="td-top"><div><b>${esc(SELLER.name)}</b><span>${esc(SELLER.address)}</span><span>Tel ${SELLER.phone}</span><span>VAT reg. no. ${SELLER.vat}</span></div><div class="td-title">${tl.toUpperCase()}<small>${d.type === "TI" ? "Original" : "Against " + esc(d.ref)}</small></div></div>
      <div class="td-meta"><div><span>Number</span><b>${d.no}</b></div><div><span>Date</span><b>${d.date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</b></div><div><span>${d.type === "TI" ? "Receipt" : "Invoice"}</span><b>${esc(d.ref)}</b></div></div>
      <div class="td-buyer"><span>Buyer</span><b>${esc(d.buyer.name)}</b>${d.buyer.address ? `<span>${esc(d.buyer.address)}</span>` : ""}<span>VAT reg. no. ${d.buyer.vat ? esc(d.buyer.vat) : "—"}</span></div>
      <table class="td-lines"><thead><tr><th>Description</th><th>Qty</th><th>Unit excl. VAT</th><th>Amount</th></tr></thead><tbody>
        ${d.lines.map(l => { const g = Math.round(l.qty * l.unit * (100 - (l.disc || 0)) / 100), ex = l.tax === "exempt", n = ex ? g : Math.round(g * 100 / 118); return `<tr><td>${esc(l.name)}${ex ? " <i>(exempt)</i>" : ""}${l.disc ? ` <i>−${l.disc}%</i>` : ""}</td><td>${l.qty}</td><td>${(Math.round((ex ? l.unit : l.unit * 100 / 118))/100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td><td>${(n / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}</td></tr>`; }).join("")}
      </tbody></table>
      <div class="td-sum"><div><span>Value of standard-rated supplies</span><b>${fmt(t.std)}</b></div><div><span>VAT 18%</span><b>${fmt(t.vat)}</b></div>${t.exempt ? `<div><span>Value of exempt supplies</span><b>${fmt(t.exempt)}</b></div>` : ""}<div class="tot"><span>${neg ? "Total credited" : "Total"}</span><b>${neg ? "−" : ""}${fmt(t.total)}</b></div></div>
      ${d.reason ? `<div class="td-reason">Reason: ${esc(d.reason)}${d.by ? ` · issued by ${esc(d.by)}` : ""}</div>` : ""}
      <div class="td-foot">Issued with RetailOS · ${d.type === "TI" ? "Keep this invoice for your VAT records" : "This note adjusts the invoice above"}</div>
    </div>`;
  }
  function tdPanel(d) {
    if (!d) return `<aside class="order td-panel"><div class="empty" style="flex:1"><span class="circle">${ic("receipt", 28)}</span><h3>Select a document</h3><span>Click a row, or use ↑ ↓.</span></div></aside>`;
    const st = tiStatus(d), t = docTotals(d), locked = S.vatLocks[monthKey(d.date)];
    return `<aside class="order td-panel" aria-label="Document preview">
      <div class="order-head"><div class="order-title"><div style="flex:1;min-width:0"><h2>${d.no}</h2><div class="sub">${TD_TYPE[d.type][0]} · ${esc(d.buyer.name)} · ${fmt(t.total)}</div></div>${badge("", "RAMIS · R3", "landmark")}</div>
        ${locked ? `<div class="note">${ic("lock", 16)}This month is locked for VAT. New notes are dated today and count in the current month.</div>` : ""}</div>
      <div class="panel-body"><div class="td-scroll">${tdPaper(d)}</div></div>
      <div class="order-foot"><div class="two"><button class="btn secondary" data-act="toast" data-msg="${d.no}.pdf downloaded">${ic("upload", 18)}PDF</button><button class="btn secondary" data-act="toast" data-msg="${d.no} e-mailed${d.buyer.vat ? " to the buyer" : ""}">${ic("mail", 18)}E-mail</button></div>
        ${d.type === "TI" ? `<div class="two"><button class="btn primary" data-act="cn-open" data-no="${d.no}" ${st === "credited" ? "disabled" : ""}>${ic("undo", 18)}Credit note</button><button class="btn secondary" data-act="dn-open" data-no="${d.no}">${ic("plus", 18)}Debit note</button></div>`
          : `<button class="btn secondary block" data-act="td-sel" data-no="${d.ref}">${ic("receipt", 18)}Open ${esc(d.ref)}</button>`}</div>
    </aside>`;
  }
  S.vatLocks = {};
  function cnModal(m, head) {
    const ti = allDocs().find(d => d.no === m.no), lines = ti.lines.map((l, i) => ({ l, i, left: Math.max(0, l.qty - creditedQty(ti, i)) }));
    const pick = { ...ti, type: "CN", lines: lines.filter(x => m.qty[x.i]).map(x => ({ ...x.l, qty: m.qty[x.i] })) }, t = docTotals(pick);
    return `<div class="modal" role="dialog" aria-modal="true" aria-labelledby="mt" style="width:min(600px,100%)">${head("Issue credit note", `Against ${ti.no} · ${ti.buyer.name}`)}
      <div class="cn-lines">${lines.map(({ l, i, left }) => `<div class="cn-line ${left ? "" : "done"}"><span class="grow"><b>${esc(l.name)}</b><small>${left ? `Up to ${left} of ${l.qty} · ${fmt(l.unit)} each incl. VAT` : "Already fully credited"}</small></span>
        ${left ? `<span class="qty"><button data-act="cn-q" data-i="${i}" data-d="-1" aria-label="Less">${ic("minus", 16)}</button><b>${m.qty[i] || 0}</b><button data-act="cn-q" data-i="${i}" data-d="1" aria-label="More">${ic("plus", 16)}</button></span><button class="btn ghost s" data-act="cn-all" data-i="${i}" data-v="${left}">All</button>` : ""}</div>`).join("")}</div>
      <div class="field">Reason<div class="chips wrap">${["Goods returned", "Damaged on delivery", "Price charged too high", "Discount agreed after sale"].map(r => `<button class="chip" data-act="cn-reason" data-v="${r}" aria-pressed="${m.reason === r}">${r}</button>`).join("")}</div></div>
      <div class="summary"><div class="r"><span>Value excl. VAT</span><b>${signed(-t.net)}</b></div><div class="r"><span>VAT 18%</span><b>${signed(-t.vat)}</b></div><hr><div class="total"><span>Credit</span><span>${signed(-t.total)}</span></div></div>
      <div class="note">${ic("help", 16)}Stock is not moved here. If goods came back, receive them through Returns so the batch is updated.</div>
      <button class="btn primary l block" data-act="cn-issue" ${t.total && m.reason ? "" : "disabled"}>${ic("check")}Issue ${`${branchOf(ti.no)}-CN-${String(S.tax.cnSeq[branchOf(ti.no)]).padStart(6, "0")}`} <kbd>Enter</kbd></button></div>`;
  }
  function cnIssue() {
    const m = S.modal, ti = allDocs().find(d => d.no === m.no), br = branchOf(ti.no);
    const lines = ti.lines.map((l, i) => m.qty[i] ? { ...l, qty: m.qty[i], src: i } : null).filter(Boolean);
    if (!lines.length || !m.reason) { toast(!lines.length ? "Choose what to credit" : "Choose a reason", { error: true }); return; }
    const no = `${br}-CN-${String(S.tax.cnSeq[br]++).padStart(6, "0")}`;
    S.tax.docs.push({ no, type: "CN", date: new Date(), buyer: { ...ti.buyer }, ref: ti.no, reason: m.reason, by: meShort(), lines });
    S.tax.sel = no; S.tax.type = "all"; S.tax.period = "cur"; closeModal(); render(); toast(`${no} issued · ${fmt(docTotals({ lines }).total)} credited`);
  }
  function dnModal(m, head) {
    const ti = allDocs().find(d => d.no === m.no), amt = Math.round((parseFloat(m.amount) || 0) * 100), t = docTotals({ lines: [{ qty: 1, unit: amt, tax: m.tax }] });
    return `<div class="modal" role="dialog" aria-modal="true" aria-labelledby="mt" style="width:min(520px,100%)">${head("Issue debit note", `Against ${ti.no} · ${ti.buyer.name}`)}
      <label class="field">What is being charged<input data-dn="desc" data-fid="dn-desc" id="dndesc" value="${esc(m.desc)}" placeholder="e.g. Delivery charge not invoiced"></label>
      <div class="form-2"><label class="field">Amount incl. VAT (Rs)<input data-dn="amount" data-fid="dn-amount" id="dnamt" inputmode="decimal" value="${esc(m.amount)}" placeholder="0.00"></label>
        <label class="field">VAT<select data-dn="tax" data-fid="dn-tax"><option value="std" ${m.tax === "std" ? "selected" : ""}>Standard 18%</option><option value="exempt" ${m.tax === "exempt" ? "selected" : ""}>Exempt</option></select></label></div>
      <div class="summary"><div class="r"><span>Value excl. VAT</span><b>${fmt(t.net)}</b></div><div class="r"><span>VAT</span><b>${fmt(t.vat)}</b></div><hr><div class="total"><span>Extra charge</span><span>${fmt(t.total)}</span></div></div>
      <button class="btn primary l block" data-act="dn-issue" ${amt > 0 && m.desc.trim() ? "" : "disabled"}>${ic("check")}Issue debit note <kbd>Enter</kbd></button></div>`;
  }
  function dnIssue() {
    const m = S.modal, ti = allDocs().find(d => d.no === m.no), br = branchOf(ti.no), amt = Math.round((parseFloat(m.amount) || 0) * 100);
    if (!(amt > 0) || !m.desc.trim()) { toast(!m.desc.trim() ? "Say what is being charged" : "Enter the amount", { error: true }); return; }
    const no = `${br}-DN-${String(S.tax.dnSeq[br]++).padStart(6, "0")}`;
    S.tax.docs.push({ no, type: "DN", date: new Date(), buyer: { ...ti.buyer }, ref: ti.no, reason: m.desc.trim(), by: meShort(), lines: [{ pid: null, name: m.desc.trim(), qty: 1, unit: amt, disc: 0, tax: m.tax }] });
    S.tax.sel = no; S.tax.type = "all"; S.tax.period = "cur"; closeModal(); render(); toast(`${no} issued · ${fmt(amt)}`);
  }
  function tiNewModal(m, head) {
    const q = m.q.trim().toLowerCase();
    const cands = S.history.filter(s => !s.taxInvoice && !s.training && s.no.startsWith("CMB01") && (!q || (s.no + " " + s.customer.name).toLowerCase().includes(q))).slice(0, 6);
    const s = S.history.find(x => x.no === m.sale), vatOk = !m.vat || VAT_RE.test(m.vat.trim());
    return `<div class="modal" role="dialog" aria-modal="true" aria-labelledby="mt" style="width:min(600px,100%)">${head("Tax invoice for a receipt", "For a VAT-registered buyer who asks after paying")}
      <label class="search">${ic("search")}<span class="sr">Find receipt</span><input data-tn="q" data-fid="tn-q" id="tnq" autocomplete="off" placeholder="Receipt number or customer" value="${esc(m.q)}"></label>
      <div class="opt-list tn-list">${cands.length ? cands.map(x => `<button class="opt" data-act="tn-pick" data-no="${x.no}" aria-selected="${m.sale === x.no}"><span class="grow"><b>${x.no}</b><small>${x.date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} ${hm(x.date)} · ${esc(x.customer.name)} · ${x.lines.length} items</small></span><b>${fmt(saleTotal(x))}</b></button>`).join("") : `<div class="note">${ic("help", 16)}No receipts without a tax invoice match.</div>`}</div>
      ${s ? `<div class="form-2"><label class="field">Buyer name *<input data-tn="name" data-fid="tn-name" value="${esc(m.name)}" placeholder="Registered business name"></label>
          <label class="field">Buyer VAT number *<input data-tn="vat" data-fid="tn-vat" value="${esc(m.vat)}" placeholder="114567321-7000" class="${vatOk ? "" : "bad"}">${vatOk ? "" : `<span class="err">Use the format 114567321-7000</span>`}</label></div>
        <label class="field">Buyer address<input data-tn="address" data-fid="tn-address" value="${esc(m.address)}" placeholder="Street, town"></label>` : ""}
      <button class="btn primary l block" data-act="tn-issue" ${s && m.name.trim() && m.vat.trim() && vatOk ? "" : "disabled"}>${ic("receipt")}Issue tax invoice <kbd>Enter</kbd></button></div>`;
  }
  function tiIssue() {
    const m = S.modal, s = S.history.find(x => x.no === m.sale);
    if (!s || !m.name.trim() || !VAT_RE.test(m.vat.trim())) { toast(!s ? "Choose the receipt" : "Enter the buyer name and a valid VAT number", { error: true }); return; }
    const series = s.no.split("-").slice(0, 2).join("-"); S.tax.tiSeq[series] = S.tax.tiSeq[series] || 1;
    s.taxInvoice = `${series}-TI-${String(S.tax.tiSeq[series]++).padStart(6, "0")}`; s.tiDate = new Date();
    s.buyer = { name: m.name.trim(), vat: m.vat.trim(), address: m.address.trim() };
    if (s.customer && s.customer.id !== "walk" && !s.customer.vat) s.customer.vat = s.buyer.vat;
    S.tax.sel = s.taxInvoice; S.tax.type = "all"; S.tax.period = "cur"; closeModal(); render(); toast(`${s.taxInvoice} issued for receipt ${s.no}`);
  }

  // ---------- VAT report (A-67) ----------
  // Month-to-date and last-month totals from earlier days (gross incl. VAT, cents): [standard sales, exempt sales, standard returns, exempt returns]
  const VAT_AGG = { cur: { CMB01: [311000000, 171000000, 3840000, 620000], KDY01: [164000000, 82000000, 1210000, 0], GAL01: [90500000, 41000000, 450000, 180000] },
    prev: { CMB01: [438000000, 224000000, 5120000, 940000], KDY01: [221000000, 110000000, 2200000, 300000], GAL01: [128000000, 56000000, 900000, 0] } };
  S.vat = { period: "prev", branch: "all" };
  const split = g => { const n = Math.round(g * 100 / 118); return [n, g - n]; };
  function vatFor(period, branch) {
    const pk = periodKey(period), brs = branch === "all" ? BRANCHES.map(b => b[0]) : [branch];
    const out = { std: { sales: 0, vat: 0, adj: 0, adjVat: 0 }, ex: { sales: 0, adj: 0 }, dn: { net: 0, vat: 0 }, byBranch: {} };
    for (const br of brs) {
      const a = VAT_AGG[period][br] || [0, 0, 0, 0], B = { gross: a[0] + a[1], vat: 0, docs: 0 };
      let [n, v] = split(a[0]); out.std.sales += n; out.std.vat += v; B.vat += v;
      out.ex.sales += a[1];
      [n, v] = split(a[2]); out.std.adj += n; out.std.adjVat += v; B.vat -= v;
      out.ex.adj += a[3]; B.gross -= a[2] + a[3];
      out.byBranch[br] = B;
    }
    for (const s of S.history) {                       // sales made in the prototype (CMB01 registers)
      if (s.training || monthKey(s.date) !== pk || !brs.includes(branchOf(s.no))) continue;
      const B = out.byBranch[branchOf(s.no)];
      for (const l of s.lines) {
        const p = byId(l.pid), g = Math.round(l.qty * l.unit * (100 - l.disc) / 100), r = Math.round((l.returned || 0) * l.unit * (100 - l.disc) / 100);
        B.gross += g - r;
        if (p.tax === "exempt") { out.ex.sales += g; out.ex.adj += r; }
        else { const [n1, v1] = split(g), [n2, v2] = split(r); out.std.sales += n1; out.std.vat += v1; out.std.adj += n2; out.std.adjVat += v2; B.vat += v1 - v2; }
      }
    }
    for (const d of allDocs()) {                       // back-office credit and debit notes
      if (d.type === "TI" || d.fromReturn || monthKey(d.date) !== pk || !brs.includes(branchOf(d.no))) continue;
      const t = docTotals(d), sg = d.type === "CN" ? 1 : -1, B = out.byBranch[branchOf(d.no)];
      if (d.type === "CN") { out.std.adj += t.std; out.std.adjVat += t.vat; out.ex.adj += t.exempt; B.vat -= t.vat; B.gross -= t.total; }
      else { out.dn.net += t.net; out.dn.vat += t.vat; out.std.sales += t.std; out.std.vat += t.vat; out.ex.sales += t.exempt; B.vat += t.vat; B.gross += t.total; }
    }
    for (const d of allDocs()) if (d.type === "TI" && monthKey(d.date) === pk && brs.includes(branchOf(d.no))) out.byBranch[branchOf(d.no)].docs++;
    out.netVat = out.std.vat - out.std.adjVat;
    return out;
  }
  function vatView() {
    const g0 = taxGuard(); if (g0) return g0;
    const f = S.vat, R = vatFor(f.period, f.branch), pk = periodKey(f.period), lock = S.vatLocks[pk];
    const maxG = Math.max(1, ...Object.values(R.byBranch).map(b => b.gross));
    const row = (l, s, v, a, av, cls = "") => `<div class="vrow2 ${cls}" role="row"><span>${l}</span><span class="r">${fmt(s)}</span><span class="r">${v == null ? "—" : fmt(v)}</span><span class="r neg">${a ? "−" + fmt(a) : fmt(0)}</span><span class="r neg">${av == null ? "—" : av ? "−" + fmt(av) : fmt(0)}</span><span class="r"><b>${fmt(s - a)}</b></span><span class="r"><b>${v == null ? "—" : fmt(v - av)}</b></span></div>`;
    return `<div class="page vat">
      <div class="vat-top">${taxTabs("vat")}<span class="spacer"></span>
        <select data-vf="period" data-fid="vf-period" aria-label="Period">${[["cur", periodLabel("cur") + " (to date)"], ["prev", periodLabel("prev")]].map(([v, l]) => `<option value="${v}" ${f.period === v ? "selected" : ""}>${l}</option>`).join("")}</select>
        <select data-vf="branch" data-fid="vf-branch" aria-label="Branch"><option value="all">All branches</option>${BRANCHES.map(b => `<option value="${b[0]}" ${f.branch === b[0] ? "selected" : ""}>${b[1]}</option>`).join("")}</select>
        <button class="btn secondary" data-act="toast" data-msg="vat-${f.period === "cur" ? "month-to-date" : "return"}-${f.branch}.xlsx exported for the accountant">${ic("upload", 18)}Export</button></div>
      ${lock ? `<div class="banner" style="background:var(--success-tint);color:var(--success-text)">${ic("lock")}<span>${periodLabel(f.period)} is locked · ${esc(lock.by)} on ${lock.at.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} ${hm(lock.at)}. Figures will not change; corrections go into the next period.</span></div>` : ""}
      <div class="stats4">
        <div class="stat"><span>Standard-rated sales excl. VAT</span><b>${fmt(R.std.sales - R.std.adj)}</b></div>
        <div class="stat"><span>Exempt sales</span><b>${fmt(R.ex.sales - R.ex.adj)}</b></div>
        <div class="stat"><span>VAT on returns and credit notes</span><b style="color:var(--error-text)">−${fmt(R.std.adjVat)}</b></div>
        <div class="stat hl"><span>Output VAT payable</span><b>${fmt(R.netVat)}</b></div>
      </div>
      <section class="card"><div class="card-head"><h2>Output VAT by rate · ${periodLabel(f.period)}${f.period === "cur" ? " to date" : ""}</h2><span class="sub">${f.branch === "all" ? "All branches" : esc(BRANCHES.find(b => b[0] === f.branch)[1])}</span></div>
        <div class="vtable" role="table" aria-label="VAT by rate">
          <div class="vrow2 head" role="row"><span>Rate</span><span class="r">Sales excl. VAT</span><span class="r">VAT</span><span class="r">Returns & credit notes</span><span class="r">VAT on them</span><span class="r">Net value</span><span class="r">Net VAT</span></div>
          ${row("Standard 18%", R.std.sales, R.std.vat, R.std.adj, R.std.adjVat)}
          ${row("VAT exempt", R.ex.sales, null, R.ex.adj, null)}
          ${row("Total", R.std.sales + R.ex.sales, R.std.vat, R.std.adj + R.ex.adj, R.std.adjVat, "tot")}
        </div>
        <div class="note">${ic("help", 16)}Includes every sale, not only tax invoices. Debit notes are inside sales (${fmt(R.dn.net)} excl. VAT, VAT ${fmt(R.dn.vat)}). Input VAT from supplier invoices comes with the purchases report in release 2.</div>
      </section>
      <section class="card"><h2>By branch</h2><div class="dlines">${Object.entries(R.byBranch).map(([br, b]) => `<div class="dline vbr"><span class="grow"><b>${esc(BRANCHES.find(x => x[0] === br)[1])}</b><small>${b.docs} tax invoice${b.docs === 1 ? "" : "s"} · sales ${fmt(b.gross)} incl. VAT</small><span class="vbar"><i style="width:${Math.round(b.gross / maxG * 100)}%"></i></span></span><span class="r"><b>${fmt(b.vat)}</b><small>net VAT</small></span></div>`).join("")}</div></section>
      <section class="card vat-lock"><span class="grow"><b>Lock ${periodLabel(f.period)}</b><small>${f.period === "cur" ? "A month can be locked after it ends, once the return is filed." : lock ? "Locked. Only the owner can unlock it, and the unlock is audited." : "After filing the VAT return, lock the month so its figures cannot change."}</small></span>
        <button class="btn ${lock ? "secondary" : "primary"}" data-act="vat-lock" ${f.period === "cur" || lock ? "disabled" : ""}>${ic("lock", 18)}${lock ? "Locked" : "Lock period"}</button></section>
    </div>`;
  }

  // ---------- Render: main ----------
  function render() {
    const fid = document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.fid : null;
    const ae = document.activeElement;
    const caret = ae && ((ae.tagName === "INPUT" && ae.type !== "checkbox") || ae.tagName === "TEXTAREA") ? ae.selectionStart : null;
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
    else if (S.view === "returns") main = topbar(t("returns"), S.ret.done ? "Refund recorded" : S.ret.sale ? "Choose the items the customer is bringing back" : "Find the original sale") + returnsView();
    else if (S.view === "stock") main = topbar(t("stock"), "Stock on hand by product and batch") + stockView();
    else if (S.view === "expiry") main = topbar(t("expiry"), "Batches expiring in the next 90 days · act before they are lost") + expiryView();
    else if (S.view === "tax") main = topbar(t("tax"), "Tax invoices, credit and debit notes · VAT reg. no. " + SELLER.vat) + taxView();
    else if (S.view === "vat") main = topbar(t("tax"), "VAT report · output tax by rate for the VAT return") + vatView();
    else if (S.view === "customers") main = topbar(t("customers"), "Credit accounts, loyalty and contact details") + customersView();
    else if (S.view === "customer") main = topbar(t("customers"), S.cu.open ? `Customers › ${esc(custOf(S.cu.open).name)}` : "Customers › New") + custView();
    else if (S.view === "shifts") main = topbar(t("cash"), "Shifts on every register · approve differences and reprint Z-reports") + shiftsView();
    else if (S.view === "exceptions") main = topbar("Sale exceptions", "Sales the server recorded but flagged for a manager · all branches") + exceptionsView();
    else if (S.view === "suppliers") main = topbar(t("suppliers"), "Who we buy from, what we owe and what they supply") + suppliersView();
    else if (S.view === "counts") main = topbar("Stock counts", S.cnt.cur ? `${S.cnt.cur.no} · ${CNT_TYPES[S.cnt.cur.type][0]} · CMB01` : "Count what is on the shelf and correct the stock") + countsView();
    else if (S.view === "import") main = topbar("Import products", "Catalog › Products › Import · nothing changes until you import") + importView();
    else if (S.view === "products") main = topbar(t("products"), "Catalog · 1,248 products in the real catalog") + productsView();
    else if (S.view === "product") main = topbar(S.pe.draft.id ? (byId(S.pe.draft.id).name) : "New product", `Catalog › Products › ${S.pe.draft.id ? esc(byId(S.pe.draft.id).sku) : "new"}`) + productEditor();
    else if (S.view === "status") main = topbar("Status & diagnostics", "Register CMB01 · R02 · device WIN-CMB01-02") + statusView();
    else if (S.view === "settings") main = topbar("Register settings", "These settings apply to this register only") + settingsView();
    else if (S.view === "receiving") main = topbar("Receive goods", S.grn.posted ? "Receipt posted" : `${esc(S.user.name)} · CMB01 · scan each item of the delivery`) + receivingView();
    else if (S.view === "pricecheck") main = topbar(t("pricecheck"), "Price, stock and batches without starting a sale") + priceCheckView();
    else if (S.view === "orders") main = topbar("Sales history", "Receipts on this branch · reprint, e-mail or start a return") + historyView();
    else if (S.view === "cash") main = topbar("Close shift", `${S.user.name} · CMB01 · Register 2`) + closeShiftView();
    else if (S.view === "openshift") main = topbar(t("openShift"), `${greeting()}, ${S.user.short} · count the cash before you start selling`) + openShiftView();
    else if (S.view === "dashboard") main = topbar(t("overview"), "Thursday, 19 Nov 2026", `<span class="badge hide-t">${ic("store", 14)}All branches</span>`) + dashboard();
    else main = topbar(t(S.view) || "Settings", null) + `<div class="placeholder"><div class="empty"><span class="circle">${ic("package", 28)}</span><h3>${esc(t(S.view))} is not part of this prototype</h3><span>The prototype covers Sell, payment, sale complete and the Overview dashboard.</span><button class="btn primary s" data-act="nav" data-view="sell">Go to Sell</button></div></div>`;
    const trainBar = S.dev.training ? `<div class="training-bar" role="status">${ic("school", 16)}TRAINING MODE · sales are not real and are not counted · turn off in Settings</div>` : "";
    app.innerHTML = `<div class="app ${S.collapsed ? "collapsed" : ""} ${S.tablet ? "tablet" : ""} ${!S.tablet && window.innerWidth > 1180 ? "desk" : ""}">${sidebar()}<main class="main">${trainBar}${main}</main></div>${protoControls()}`;
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
    } else if (m.type === "cash") {
      h = cashModal(m, head);
    } else if (m.type === "cn") {
      h = cnModal(m, head);
    } else if (m.type === "dn") {
      h = dnModal(m, head);
    } else if (m.type === "tinew") {
      h = tiNewModal(m, head);
    } else if (m.type === "settle") {
      h = settleModal(m, head);
    } else if (m.type === "merge") {
      h = mergeModal(m, head);
    } else if (m.type === "zprint") {
      const r = srAll().find(x => x.id === m.id);
      h = `<div class="modal" role="dialog" aria-modal="true" aria-labelledby="mt" style="width:min(460px,100%)">${head("Z-report", `${r.branch} · ${r.reg} · ${r.cashier}`)}<div class="zwrap"><div class="paper">${esc(zText(srZ(r)))}</div></div><div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn secondary" data-act="close">Close</button><button class="btn primary" data-act="toast" data-msg="Z-report reprinted · marked COPY">${ic("printer", 18)}Print copy</button></div></div>`;
    } else if (m.type === "cntpin") {
      h = cntPinModal(m, head);
    } else if (m.type === "adjust") {
      h = adjustModal(m, head);
    } else if (m.type === "leave") {
      h = `<div class="modal" role="dialog" aria-modal="true" aria-labelledby="mt" style="width:min(440px,100%)">${head("Discard unsaved changes?", "Your edits to this product have not been saved.")}
        <div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn secondary" data-act="close">Keep editing</button><button class="btn danger" data-act="leave-ok">Discard changes</button></div></div>`;
    } else if (m.type === "resync") {
      const steps = ["Send sales waiting on this register", "Download the catalog snapshot (9,412 products)", "Apply prices, batches and tax rates", "Update staff, PINs and settings", "Check the local database"];
      const at = Math.min(steps.length - 1, Math.floor(m.progress / (100 / steps.length)));
      h = `<div class="modal" role="dialog" aria-modal="true" aria-labelledby="mt" style="width:min(480px,100%)">${head("Full resync", "Rebuilds this register's local data from the server")}
        ${m.stage === "pin" ? `${S.offline ? `<div class="banner error">${ic("wifiOff")}A full resync needs a connection. Sales already on this register are kept either way.</div>` : `<div class="note">${ic("alert", 16)}Selling pauses for about a minute. Sales on this register are sent first, so nothing is lost.</div>`}
          <div class="mgr"><div class="head">${ic("lock", 18)}Manager approval</div><div class="pin-dots">${[0, 1, 2, 3].map(i => `<i class="${m.pin.length > i ? "on" : ""}"></i>`).join("")}</div>
          <div class="keypad">${["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "⌫"].map(k => `<button data-act="rs-pin" data-k="${k}" aria-label="${k === "⌫" ? "Backspace" : k === "C" ? "Clear" : k}">${k === "⌫" ? ic("backspace", 22) : k}</button>`).join("")}</div>
          ${m.pinErr ? `<div class="scan-error" role="alert">${ic("alert", 16)}Wrong manager PIN</div>` : `<div class="note">Demo manager PIN: 1234</div>`}</div>
          <button class="btn danger block l" data-act="rs-start" ${m.pin.length === 4 && !S.offline ? "" : "disabled"}>${ic("refresh")}Start full resync <kbd>Enter</kbd></button>`
        : `<div class="progress" role="progressbar" aria-valuenow="${m.progress}" aria-valuemin="0" aria-valuemax="100"><i style="width:${m.progress}%"></i></div>
          <div class="steps-list">${steps.map((s, i) => `<div class="${i < at ? "done" : i === at ? "now" : ""}">${ic(i < at ? "check" : i === at ? "refresh" : "clock", 16)}${s}</div>`).join("")}</div>
          <div class="note">${m.progress}% · don't switch off the register</div>`}</div>`;
    } else if (m.type === "help") {
      const sc = [["F2 or Ctrl K", "Search / scan"], ["Enter", "Add focused product"], ["Arrow keys", "Move between products"], ["Space", "Quick view"], ["↑ ↓ (cart)", "Select cart line"], ["+ / −", "Change quantity"], ["Del", "Remove line"], ["F3", "Customer"], ["F4", "Edit quantity / weight"], ["F5", "Discount"], ["F6 / F7", "Hold / recall bill"], ["F8", "Returns"], ["F9", "Cash in / out"], ["F10", "Pay"], ["Ctrl Z", "Undo"], ["Esc", "Close dialog"], ["3*", "Then scan: quantity 3"]];
      h = `<div class="modal" role="dialog" aria-modal="true" aria-labelledby="mt" style="width:min(640px,100%)">${head("Keyboard shortcuts", "Everything also works with mouse and touch")}<div class="shortcuts">${sc.map(([k, v]) => `<div><span>${v}</span><kbd>${k}</kbd></div>`).join("")}</div><div class="note">${ic("scan", 16)}Demo barcodes: 4791111000011 (milk powder), 2012340012507 (carrots 1.250 kg), 0108901234567890B1 (paracetamol batch B1), 9999999999999 (unknown)</div></div>`;
    }
    modalRoot.innerHTML = `<div class="overlay" data-act="overlay">${h}</div>`;
    setTimeout(() => {
      if (m.type === "cash") { // keep focus on the dialog so number keys go to the amount / PIN, unless the note is being typed
        const ae = document.activeElement; if (ae && ae.id === "cmnote") return;
        const d = modalRoot.querySelector(".modal"); if (d) { d.tabIndex = -1; d.focus({ preventScroll: true }); } return;
      }
      const f = modalRoot.querySelector("input[data-fid]") || modalRoot.querySelector(".btn.primary:not([disabled])") || modalRoot.querySelector(".opt"); if (f) f.focus();
    });
  }

  // ---------- Events: clicks ----------
  document.addEventListener("click", e => {
    const el = e.target.closest("[data-act]"); if (!el) return;
    const a = el.dataset.act, i = el.dataset.i != null ? parseInt(el.dataset.i, 10) : null;
    if (a === "overlay" && e.target !== el) return; // clicks inside the modal
    switch (a) {
      case "nav": { const v = el.dataset.view;
        if (S.view === "product" && peDirty()) { openModal({ type: "leave", to: v }); break; }
        if (S.view === "product") S.pe = null;
        if (v === "cash" && S.cs.step === 3) resetCs();
        if (v === "returns" && S.ret.done) S.ret = emptyRet();
        S.view = v === "sell" && !S.shifts[S.user.id] ? "openshift" : v === "cash" && S.user.role === "Manager" ? "shifts" : v; S.modal = null; renderModal(); render();
        if (v === "returns" && !S.ret.sale) focusId("rsearch"); break; }
      case "grn-demo": grnScan(el.dataset.code); break;
      case "grn-del": { const id = +el.dataset.id; S.grn.lines = S.grn.lines.filter(l => l.id !== id); render(); break; }
      case "gl-inc": case "gl-dec": { const l = S.grn.lines.find(x => x.id === +el.dataset.id); if (l) { l.qty = Math.max(0, Math.round((l.qty + (a === "gl-inc" ? 1 : -1)) * 1000) / 1000); render(); } break; }
      case "grn-post": grnPost(); break;
      case "grn-clear": S.grn = emptyGrn(); render(); focusId("gsearch"); break;
      case "grn-new": S.grn = emptyGrn(); render(); focusId("gsearch"); break;
      case "pc-pick": S.pc.pid = el.dataset.pid; S.pc.error = ""; render(); break;
      case "pc-clear": S.pc.pid = null; S.pc.error = ""; S.pc.query = ""; render(); focusId("pcsearch"); break;
      case "pc-add": { const p = byId(S.pc.pid); if (!p) break; if (!S.shifts[S.user.id]) { S.view = "openshift"; render(); toast("Open a shift first", { error: true }); break; } S.view = "sell"; render(); addProduct(p); break; }
      case "td-type": S.tax.type = el.dataset.v; render(); break;
      case "td-sel": { const no = el.dataset.no; if (!taxList().some(d => d.no === no)) { S.tax.type = "all"; S.tax.period = "all"; S.tax.q = ""; S.tax.branch = "all"; } S.tax.sel = no; render(); const row = app.querySelector('.trow[aria-selected="true"]'); if (row) row.scrollIntoView({ block: "nearest" }); break; }
      case "ti-new": openModal({ type: "tinew", q: "", sale: null, name: "", vat: "", address: "" }); focusId("tnq"); break;
      case "tn-pick": { const m = S.modal, sl = S.history.find(x => x.no === el.dataset.no); m.sale = sl.no; if (sl.customer && sl.customer.id !== "walk") { m.name = m.name || sl.customer.name; m.vat = m.vat || sl.customer.vat || ""; m.address = m.address || sl.customer.address || ""; } renderModal(); focusId(m.name ? "tn-vat-x" : "tn-name-x"); setTimeout(() => { const x = document.querySelector(m.name && !m.vat ? '[data-tn="vat"]' : '[data-tn="name"]'); if (x) x.focus(); }); break; }
      case "tn-issue": tiIssue(); break;
      case "cn-open": openModal({ type: "cn", no: el.dataset.no, qty: {}, reason: "" }); break;
      case "cn-q": { const m = S.modal, ti = allDocs().find(d => d.no === m.no), left = ti.lines[i].qty - creditedQty(ti, i); m.qty[i] = Math.max(0, Math.min(left, (m.qty[i] || 0) + +el.dataset.d)); renderModal(); break; }
      case "cn-all": S.modal.qty[i] = +el.dataset.v; renderModal(); break;
      case "cn-reason": S.modal.reason = el.dataset.v; renderModal(); break;
      case "cn-issue": cnIssue(); break;
      case "dn-open": openModal({ type: "dn", no: el.dataset.no, desc: "", amount: "", tax: "std" }); focusId("dndesc"); break;
      case "dn-issue": dnIssue(); break;
      case "vat-lock": { const pk = periodKey(S.vat.period); S.vatLocks[pk] = { by: meShort(), at: new Date() }; render(); toast(`${periodLabel(S.vat.period)} locked for VAT`); break; }
      case "cu-filter": S.cu.filter = el.dataset.v; render(); break;
      case "cu-open": openCustomer(el.dataset.id); break;
      case "cu-new": openCustomer(null); break;
      case "cu-back": if (custDirty()) { toast("Save or discard your changes first", { error: true }); break; } S.view = "customers"; S.cu.open = null; render(); break;
      case "cu-tab": if (custDirty() && el.dataset.v !== "profile") { toast("Save or discard your changes first", { error: true }); break; } S.cu.tab = el.dataset.v; render(); break;
      case "cu-save": custSave(); break;
      case "cu-discard": if (!S.cu.open) { S.view = "customers"; render(); break; } S.cu.draft = custDraft(custOf(S.cu.open)); S.cu.showErr = false; render(); toast("Changes discarded"); break;
      case "cu-settle": { const c = custOf(S.cu.open); openModal({ type: "settle", cid: c.id, method: "cash", amount: (custLedger(c).bal / 100).toFixed(2), ref: "" }); focusId("setamt"); break; }
      case "set-method": S.modal.method = el.dataset.k; renderModal(); if (S.modal.method === "transfer" || S.modal.method === "cheque") focusId("set-ref"); break;
      case "set-quick": S.modal.amount = el.dataset.v; renderModal(); break;
      case "set-save": settleSave(); break;
      case "cu-consent": { const c = custOf(S.cu.open), k = el.dataset.k; c.consent[k] = el.checked; c.consent.at = new Date(); c.consent.by = meShort() + " (customer asked in person)"; c.log.unshift({ when: new Date(), who: meShort(), what: `${k === "sms" ? "SMS" : "E-mail"} marketing ${el.checked ? "allowed" : "turned off"}` }); render(); toast(`${k === "sms" ? "SMS" : "E-mail"} offers ${el.checked ? "on" : "off"} · recorded with time and user`); break; }
      case "cu-forget": { const c = custOf(S.cu.open); c.log.unshift({ when: new Date(), who: meShort(), what: "Deletion of personal data requested (PDPA)" }); render(); toast(`Deletion request logged for ${c.name} · personal data is removed within 30 days`); break; }
      case "cu-merge": { const ids = el.dataset.ids.split(","), cs = ids.map(custOf).sort((a, b) => a.since - b.since); openModal({ type: "merge", ids, keep: cs[0].id }); break; }
      case "merge-keep": S.modal.keep = el.dataset.id; renderModal(); break;
      case "merge-do": mergeDo(); break;
      case "sr-filter": S.sr.filter = el.dataset.v; render(); break;
      case "sr-sel": if (S.sr.sel !== el.dataset.id) { S.sr.sel = el.dataset.id; S.sr.note = ""; S.sr.err = false; } render(); break;
      case "sr-approve": srDecide("approve"); break;
      case "sr-recount": srDecide("recount"); break;
      case "sr-z": openModal({ type: "zprint", id: el.dataset.id }); break;
      case "exc-sel": excSelect(el.dataset.id); render(); break;
      case "exc-status": S.exc.status = el.dataset.v; S.exc.sel = null; render(); break;
      case "exc-type": S.exc.type = el.dataset.v; render(); break;
      case "exc-action": S.exc.action = el.dataset.k; render(); if (S.exc.note.trim().length < 5) focusId("excnote"); break;
      case "exc-resolve": excResolve(); break;
      case "sup-sel": supOpen(el.dataset.id); break;
      case "sup-filter": S.sup.filter = el.dataset.v; render(); break;
      case "sup-tab": if (supDirty() && el.dataset.v !== "details") { toast("Save or discard your changes first", { error: true }); break; } S.sup.tab = el.dataset.v; render(); break;
      case "sup-new": supNew(); break;
      case "sup-save": supSave(); break;
      case "sup-discard": { const x = SUP.find(y => y.id === S.sup.draft.id); S.sup.draft = supDraft(x || null); S.sup.showErr = false; if (!x) { S.sup.sel = SUP[0].id; S.sup.draft = supDraft(SUP[0]); } render(); toast("Changes discarded"); break; }
      case "sup-active": S.sup.draft.active = el.checked; render(); break;
      case "sup-pay": { const x = SUP.find(y => y.id === S.sup.sel), r = x.grns.find(z => z.no === el.dataset.no); r.paid = true; render(); toast(`Payment of ${fmt(r.total)} recorded for ${r.no}`); break; }
      case "sup-grn": { if (supDirty()) { toast("Save or discard your changes first", { error: true }); break; } const x = SUP.find(y => y.id === S.sup.sel); if (S.grn.posted) S.grn = emptyGrn(); S.grn.supplier = x.name; S.view = "receiving"; render(); focusId("gsearch"); break; }
      case "cnt-type": S.cnt.form.type = el.dataset.k; render(); break;
      case "cnt-blind": S.cnt.form.blind = el.checked; render(); break;
      case "cnt-start": startCount(); break;
      case "cnt-filter": S.cnt.filter = el.dataset.v; render(); break;
      case "cnt-demo": cntDemo(); break;
      case "cnt-inc": cntStep(el.dataset.id, 1); break;
      case "cnt-dec": cntStep(el.dataset.id, -1); break;
      case "cnt-cancel": { const c = S.cnt.cur; if (c.items.some(it => cntVal(it) != null) && !c.confirmDiscard) { c.confirmDiscard = true; render(); break; } S.cnt.cur = null; render(); toast(`${c.no} discarded · no stock was changed`); break; }
      case "cnt-review": { const c = S.cnt.cur; if (!c.items.some(it => cntVal(it) != null)) { toast("Count at least one product first", { error: true }); break; } c.step = "review"; c.err = ""; c.confirmDiscard = false; render(); break; }
      case "cnt-back": S.cnt.cur.step = "count"; render(); focusId("cntscan"); break;
      case "cnt-todo": S.cnt.cur.step = "count"; S.cnt.filter = "todo"; render(); focusId("cntscan"); break;
      case "cnt-recount": { const c = S.cnt.cur, it = c.items.find(x => x.pid === el.dataset.id); it.cnt = ""; c.step = "count"; S.cnt.filter = "all"; c.flash = it.pid; render(); selectId("cq-" + it.pid); break; }
      case "cnt-post": cntPost(false); break;
      case "cnt-pin": { const m = S.modal, k = el.dataset.k; m.pinErr = false; if (k === "⌫") m.pin = m.pin.slice(0, -1); else if (k === "C") m.pin = ""; else if (m.pin.length < 4) m.pin += k; renderModal(); break; }
      case "cnt-approve": cntApprove(); break;
      case "cnt-done": S.cnt.cur = null; render(); break;
      case "imp-go": impGo(+el.dataset.step); break;
      case "imp-kind": if (e.target.closest('[data-act="toast"]')) break; S.imp.kind = el.dataset.k; render(); break;
      case "imp-demo": impSetFile("products-nov-2026.xlsx", 23552); break;
      case "imp-clear": S.imp.file = null; S.imp.fileErr = ""; render(); break;
      case "imp-filter": S.imp.filter = el.dataset.v; render(); break;
      case "imp-skip": S.imp.skip = el.checked; render(); break;
      case "imp-commit": impCommit(); break;
      case "imp-products": S.imp = emptyImp(); S.prod.q = ""; S.prod.cat = "All"; S.prod.status = "active"; S.view = "products"; render(); break;
      case "imp-new": S.imp = emptyImp(); render(); break;
      case "stk-filter": S.stk.filter = el.dataset.v; render(); break;
      case "stk-toggle": if (S.stk.branch === "CMB01") { S.stk.open[el.dataset.id] = !S.stk.open[el.dataset.id]; render(); } break;
      case "adj-open": openAdjust(el.dataset.id, el.dataset.lot); break;
      case "adj-dir": { const m = S.modal; m.dir = el.dataset.k; m.reason = ""; renderModal(); break; }
      case "adj-reason": S.modal.reason = el.dataset.v; renderModal(); break;
      case "adj-pin": { const m = S.modal, k = el.dataset.k; m.pinErr = false; if (k === "⌫") m.pin = m.pin.slice(0, -1); else if (k === "C") m.pin = ""; else if (m.pin.length < 4) m.pin += k; renderModal(); break; }
      case "adj-back": S.modal.stage = "form"; S.modal.pin = ""; renderModal(); break;
      case "adj-submit": adjSubmit(); break;
      case "ex-writeoff": { const l = findLot(el.dataset.id, el.dataset.lot); openAdjust(el.dataset.id, el.dataset.lot, { dir: "out", qty: l.qty, reason: "Expired write-off" }); break; }
      case "ex-return": { const l = findLot(el.dataset.id, el.dataset.lot); openAdjust(el.dataset.id, el.dataset.lot, { dir: "out", qty: l.qty, reason: "Returned to supplier" }); break; }
      case "ex-markdown": { const l = findLot(el.dataset.id, el.dataset.lot); l.markdown = 20; byId(el.dataset.id).log.unshift({ when: new Date(), who: `${S.user.short} ${S.user.name.split(" ")[1][0]}.`, what: `Clearance −20% on batch ${l.id}` }); render(); toast(`Clearance −20% set for batch ${l.id} · applies when this batch is scanned`); break; }
      case "ex-block": { const l = findLot(el.dataset.id, el.dataset.lot); l.blocked = !l.blocked; render(); toast(l.blocked ? `Batch ${l.id} blocked · registers stop selling it within a minute` : `Batch ${l.id} unblocked`); break; }
      case "ex-front": toast(`Task added for the stock keeper: move batch ${el.dataset.lot} to the front of the shelf`); break;
      case "p-new": openProduct(null); break;
      case "p-open": openProduct(el.dataset.id); break;
      case "p-pick": { e.stopPropagation(); const id = el.dataset.id, f = S.prod; f.picked = f.picked.includes(id) ? f.picked.filter(x => x !== id) : [...f.picked, id]; render(); break; }
      case "p-pickall": { const ids = prodList().map(p => p.id); S.prod.picked = S.prod.picked.length >= ids.length ? [] : ids; render(); break; }
      case "p-unpick": S.prod.picked = []; render(); break;
      case "p-bulk-archive": { const arch = S.prod.status !== "archived"; let n = 0; for (const id of S.prod.picked) { const p = byId(id); if (p && p.active === arch) { p.active = !arch; p.updated = new Date(); p.log.unshift({ when: new Date(), who: `${S.user.short} ${S.user.name.split(" ")[1][0]}.`, what: arch ? "Archived (bulk)" : "Restored (bulk)" }); n++; } } S.prod.picked = []; render(); toast(`${n} product${n === 1 ? "" : "s"} ${arch ? "archived · hidden from the register" : "restored"}`); break; }
      case "pf-low": S.prod.low = !S.prod.low; render(); break;
      case "pf-missing": S.prod.missing = !S.prod.missing; render(); break;
      case "pe-tab": S.pe.tab = el.dataset.tab; render(); break;
      case "pe-val": setPath(S.pe.draft, el.dataset.path, el.dataset.v); render(); break;
      case "pe-addv": S.pe.draft.variants.push({ label: "", sku: "", barcode: "", price: S.pe.draft.variants[0].price }); render(); focusId(""); setTimeout(() => { const x = app.querySelector(`[data-fid="pe-v${S.pe.draft.variants.length - 1}l"]`); if (x) x.focus(); }); break;
      case "pe-delv": if (S.pe.draft.variants.length > 1) { S.pe.draft.variants.splice(i, 1); render(); } break;
      case "pe-save": peSave(); break;
      case "pe-archive": S.pe.draft.active = !S.pe.draft.active; peSave(); break;
      case "p-back": leaveEditor("products"); break;
      case "leave-ok": { const to = S.modal.to; S.modal = null; renderModal(); S.pe = null; S.view = to; render(); break; }
      case "st-test": { const what = el.dataset.what; S.diag.testing = what; render(); setTimeout(() => { S.diag.testing = null; render(); toast(S.offline ? "Connection test failed · no internet. Selling continues offline." : "Connection OK · 38 ms · server time matches", { error: S.offline }); }, 900); break; }
      case "st-sync": if (S.offline) { toast("No connection · sales stay safe on this register", { error: true }); break; } S.history.forEach(s => { if (s.sync === "waiting") s.sync = "synced"; }); S.waiting = 0; S.diag.lastPush = S.diag.lastPull = new Date(); render(); toast(`Sync complete${S.history.some(s => s.sync === "error") ? " · 1 blocked item needs attention" : " · nothing waiting"}`); break;
      case "st-requeue": { const s = S.history.find(x => x.no === el.dataset.no); if (s) { s.sync = S.offline ? "waiting" : "synced"; s.syncError = null; render(); toast(S.offline ? "Requeued · will send when online" : `${s.no} sent`); } break; }
      case "st-logs": S.diag.logsSent = true; render(); toast("Logs sent to DevCity support · ticket RS-20431"); break;
      case "st-print": toast(S.printerError ? "Printer is out of paper · load paper and try again" : "Test page printed", { error: S.printerError }); break;
      case "st-drawer": toast("Drawer opened · recorded in the audit log"); break;
      case "st-resync": openModal({ type: "resync", stage: "pin", pin: "", pinErr: false, progress: 0 }); break;
      case "rs-pin": { const m = S.modal; m.pinErr = false; const k = el.dataset.k; if (k === "⌫") m.pin = m.pin.slice(0, -1); else if (k === "C") m.pin = ""; else if (m.pin.length < 4) m.pin += k; renderModal(); break; }
      case "rs-start": resyncStart(); break;
      case "set-tab": S.devTab = el.dataset.tab; render(); break;
      case "set-val": setPath(S.devDraft, el.dataset.path, el.dataset.v); render(); break;
      case "set-save": saveSettings(); break;
      case "set-discard": S.devDraft = JSON.parse(JSON.stringify(S.dev)); render(); toast("Changes discarded"); break;
      case "h-scope": S.hist.scope = el.dataset.v; render(); break;
      case "h-period": S.hist.period = el.dataset.v; render(); break;
      case "h-status": S.hist.status = el.dataset.v; render(); break;
      case "h-sel": S.hist.sel = el.dataset.no; render(); break;
      case "h-retry": { const s = S.history.find(x => x.no === S.hist.sel); if (s) { s.sync = S.offline ? "waiting" : "synced"; s.syncError = null; render(); toast(S.offline ? "Still offline · will retry automatically" : `${s.no} synced`); } break; }
      case "h-return": startReturnFrom(S.hist.sel); break;
      case "cash-move": openCashMove(); break;
      case "cm-kind": { const m = S.modal; m.kind = el.dataset.k; m.reason = m.kind === "safe" ? "Safe drop" : ""; m.stage = "amount"; m.pin = ""; renderModal(); break; }
      case "cm-key": cmKey(el.dataset.k); break;
      case "cm-pin": cmPin(el.dataset.k); break;
      case "cm-reason": S.modal.reason = el.dataset.v; renderModal(); break;
      case "cm-back": S.modal.stage = "amount"; S.modal.pin = ""; renderModal(); break;
      case "cm-submit": cmSubmit(); break;
      case "ret-load": loadSale(el.dataset.no); break;
      case "ret-clear": case "ret-new": S.ret = emptyRet(); render(); focusId("rsearch"); break;
      case "ret-inc": case "ret-dec": { const l = S.ret.sale.lines[i], cur = S.ret.qty[i] || 0; S.ret.qty[i] = Math.max(0, Math.min(remaining(l), cur + (a === "ret-inc" ? 1 : -1))); render(); break; }
      case "ret-toggle": { const l = S.ret.sale.lines[i]; S.ret.qty[i] = S.ret.qty[i] ? 0 : remaining(l); render(); break; }
      case "ret-all": S.ret.sale.lines.forEach((l, j) => { S.ret.qty[j] = Math.max(0, remaining(l)); }); render(); break;
      case "ret-none": S.ret.qty = {}; render(); break;
      case "ret-reason": S.ret.reason = el.dataset.v; render(); break;
      case "ret-pin": retPin(el.dataset.k); break;
      case "ret-approve": approveReturn(); break;
      case "cs-confirm": if (countTotal(S.cs) > 0) { S.cs.step = 2; render(); } break;
      case "cs-back": S.cs.step = 1; render(); break;
      case "cs-reason": S.cs.reason = el.dataset.v; render(); break;
      case "cs-close": closeShiftNow(); break;
      case "open-held": openModal({ type: "held" }); break;
      case "collapse": S.collapsed = !S.collapsed; render(); break;
      case "logout": signOut(); break;
      case "su-pick": S.su.sel = i; S.su.pin = ""; S.su.err = false; render(); break;
      case "su-key": suKey(el.dataset.k); break;
      case "su-submit": suSubmit(); break;
      case "den-inc": case "den-dec": { const st = S[el.dataset.scope], d = el.dataset.d; st.counts[d] = Math.max(0, (st.counts[d] || 0) + (a === "den-inc" ? 1 : -1)); render(); break; }
      case "os-last": S.os = { counts: { 100000: 3, 50000: 2, 10000: 10 }, coins: "" }; render(); break;
      case "os-open": openShiftNow(); break;
      case "lang": S.lang = el.dataset.lang; document.documentElement.lang = S.lang; render(); break;
      case "theme": { const dark = !(document.documentElement.dataset.theme === "dark"); document.documentElement.dataset.theme = dark ? "dark" : "light"; store("retailos-proto-theme", dark ? "dark" : "light"); render(); break; }
      case "help": openModal({ type: "help" }); break;
      case "proto": S.protoOpen = !S.protoOpen; render(); break;
      case "toggle-offline": S.offline = !S.offline; render(); if (!S.offline) { S.history.forEach(s => { if (s.sync === "waiting") s.sync = "synced"; }); toast(`${S.waiting} sales synced`); S.waiting = 0; render(); } break;
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
      case "mode": if (el.dataset.mode === "return") goReturns(); else { S.mode = "sale"; S.view = S.shifts[S.user.id] ? "sell" : "openshift"; render(); } break;
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
    if (e.target.dataset && e.target.dataset.den) { S[e.target.dataset.scope].counts[e.target.dataset.den] = Math.max(0, parseInt(e.target.value.replace(/\D/g, ""), 10) || 0); render(); }
    if (e.target.hasAttribute && e.target.hasAttribute("data-coins")) { S[e.target.dataset.scope].coins = e.target.value.replace(/[^0-9.]/g, ""); render(); }
    if (e.target.id === "rsearch") { S.ret.query = e.target.value; S.ret.error = ""; }
    if (e.target.id === "hsearch") { S.hist.q = e.target.value; render(); }
    if (e.target.dataset && e.target.dataset.set) { setPath(S.devDraft, e.target.dataset.set, e.target.type === "checkbox" ? e.target.checked : e.target.value); render(); }
    if (e.target.dataset && e.target.dataset.pd && S.pe) { setPath(S.pe.draft, e.target.dataset.pd, e.target.type === "checkbox" ? e.target.checked : e.target.value); render(); }
    if (e.target.dataset && e.target.dataset.pf) { S.prod[e.target.dataset.pf] = e.target.value; S.prod.picked = []; render(); }
    if (e.target.id === "psearch") { S.prod.q = e.target.value; render(); }
    if (e.target.id === "stsearch") { S.stk.q = e.target.value; render(); }
    if (e.target.id === "cntscan" && S.cnt.cur) { S.cnt.cur.q = e.target.value; }
    if (e.target.id === "excnote") { S.exc.note = e.target.value; render(); }
    if (e.target.id === "srnote") { S.sr.note = e.target.value; if (S.sr.err && S.sr.note.trim().length >= 5) { S.sr.err = false; render(); } }
    if (e.target.id === "cusearch") { S.cu.q = e.target.value; render(); }
    if (e.target.id === "tdsearch") { S.tax.q = e.target.value; render(); }
    if (e.target.dataset && e.target.dataset.tf) { S.tax[e.target.dataset.tf] = e.target.value; render(); }
    if (e.target.dataset && e.target.dataset.vf) { S.vat[e.target.dataset.vf] = e.target.value; render(); }
    if (e.target.dataset && (e.target.dataset.tn || e.target.dataset.dn) && S.modal) { const k = e.target.dataset.tn || e.target.dataset.dn, attr = e.target.dataset.tn ? "tn" : "dn"; S.modal[k] = k === "amount" ? e.target.value.replace(/[^0-9.]/g, "") : e.target.value; const pos = e.target.selectionStart, isSel = e.target.tagName === "SELECT"; renderModal(); if (!isSel) setTimeout(() => { const x = document.querySelector(`[data-${attr}="${k}"]`); if (x) { x.focus(); try { x.setSelectionRange(pos, pos); } catch (er) {} } }); }
    if (e.target.dataset && e.target.dataset.cu && S.cu.draft) { S.cu.draft[e.target.dataset.cu] = e.target.value; render(); }
    if (e.target.dataset && e.target.dataset.set && S.modal && S.modal.type === "settle") { const k = e.target.dataset.set; S.modal[k] = k === "amount" ? e.target.value.replace(/[^0-9.]/g, "") : e.target.value; const id = e.target.id || ("set-" + k); renderModal(); setTimeout(() => { const x = document.querySelector(`[data-set="${k}"]`); if (x) { x.focus(); x.setSelectionRange(x.value.length, x.value.length); } }); }
    if (e.target.dataset && e.target.dataset.xf) { S.exc[e.target.dataset.xf] = e.target.value; render(); }
    if (e.target.id === "supsearch") { S.sup.q = e.target.value; render(); }
    if (e.target.dataset && e.target.dataset.sup) { S.sup.draft[e.target.dataset.sup] = e.target.value; render(); }
    if (e.target.dataset && e.target.dataset.cq && S.cnt.cur) { const it = S.cnt.cur.items.find(x => x.pid === e.target.dataset.cq); it.cnt = e.target.value.replace(/[^0-9.]/g, ""); S.cnt.cur.flash = null; S.cnt.cur.confirmDiscard = false; render(); }
    if (e.target.dataset && e.target.dataset.cf) { S.cnt.form[e.target.dataset.cf] = e.target.value; render(); }
    if (e.target.dataset && e.target.dataset.im) { S.imp.map[e.target.dataset.im] = e.target.value; S.imp.touched[e.target.dataset.im] = true; render(); }
    if (e.target.dataset && e.target.dataset.sk) { S.stk[e.target.dataset.sk] = e.target.value; render(); }
    if (e.target.dataset && e.target.dataset.ex) { S.exp[e.target.dataset.ex] = e.target.value; render(); }
    if (e.target.dataset && e.target.dataset.adj && S.modal && S.modal.type === "adjust") {
      const f = e.target.dataset.adj; S.modal[f] = e.target.value;
      if (f === "qty") { renderModal(); setTimeout(() => { const x = document.getElementById("adjqty"); if (x) { x.focus(); x.setSelectionRange(x.value.length, x.value.length); } }); }
      else if (f === "lot") renderModal();
    }
    if (e.target.dataset && e.target.dataset.actChange === "p-bulk-cat" && e.target.value) {
      const cat = e.target.value, n = S.prod.picked.length;
      for (const id of S.prod.picked) { const p = byId(id); if (p) { p.cat = cat; p.updated = new Date(); p.log.unshift({ when: new Date(), who: `${S.user.short} ${S.user.name.split(" ")[1][0]}.`, what: `Moved to ${cat} (bulk)` }); } }
      S.prod.picked = []; render(); toast(`${n} product${n === 1 ? "" : "s"} moved to ${cat}`);
    }
    if (e.target.id === "gsearch") { S.grn.query = e.target.value; S.grn.error = ""; }
    if (e.target.id === "pcsearch") { S.pc.query = e.target.value; S.pc.error = ""; }
    if (e.target.dataset && e.target.dataset.g) { S.grn[e.target.dataset.g] = e.target.value; render(); }
    if (e.target.dataset && e.target.dataset.gl) {
      const l = S.grn.lines.find(x => x.id === +e.target.dataset.id), f = e.target.dataset.gl, v = e.target.value;
      if (l) {
        if (f === "batch") l.batch = v.toUpperCase().replace(/\s/g, "");
        if (f === "exp") l.exp = v;
        if (f === "qty") l.qty = Math.max(0, parseFloat(v) || 0);
        if (f === "cost") l.cost = Math.round((parseFloat(v) || 0) * 100);
        if (f === "unit") { const us = unitsFor(byId(l.pid)), o = us.find(u => u.k === l.unit), n = us.find(u => u.k === v); l.cost = Math.round(l.cost / o.f * n.f); l.unit = v; }
        S.grn.flash = null;
        if (f === "cost" || f === "qty") { // keep the caret where the user is typing; update totals without redrawing this field
          const card = e.target.closest(".gl"); const lc = card && card.querySelector(".lc");
          if (lc) lc.innerHTML = `${fmt(glCost(l))}<small>= ${Math.round(l.qty * glUnit(l).f * 1000) / 1000} ${byId(l.pid).weighed ? "kg" : byId(l.pid).cat === "Pharmacy" ? "strips" : "pieces"}</small>`;
          clearTimeout(window.__grnT); window.__grnT = setTimeout(render, 600);
        } else render();
      }
    }
    if (e.target.id === "cmnote" && S.modal) { S.modal.note = e.target.value; const m = S.modal, b = modalRoot.querySelector('[data-act="cm-submit"]'); if (b && m.stage === "amount") b.disabled = !(cmAmount(m) > 0 && m.reason && !(m.kind !== "in" && cmAmount(m) > expectedCash(S.shifts[S.user.id])) && (m.reason !== "Other" || m.note.trim())); }
    if (e.target.id === "csnote") { S.cs.note = e.target.value; }
    if (e.target.id === "approval" && S.pay) { S.pay.approval = e.target.value; const b = modalRoot.querySelector('[data-act="complete"]'); if (b) b.disabled = !canComplete(); }
  });

  const emptyRet = () => ({ query: "", sale: null, qty: {}, reason: "", pin: "", error: "", done: null });
  function resetCs() { S.cs = { step: 1, counts: {}, coins: "", reason: "", note: "" }; }
  function focusId(id) { setTimeout(() => { const x = document.getElementById(id); if (x) x.focus(); }); }
  function retPin(k) { const r = S.ret; r.pinError = false; if (k === "⌫") r.pin = r.pin.slice(0, -1); else if (k === "C") r.pin = ""; else if (r.pin.length < 4) r.pin += k; render(); }
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
      if (m.type === "batch") { if (k === "ArrowDown" || k === "ArrowUp") { e.preventDefault(); const n = byId(m.pid).batches.length; m.choice = (m.choice + (k === "ArrowDown" ? 1 : -1) + n) % n; renderModal(); return; } if (k === "Enter") { e.preventDefault(); const p = byId(m.pid); S.modal = null; renderModal(); addProduct(p, { batch: p.batches[m.choice].id }); } return; }
      if (m.type === "weight" || m.type === "qty") { if (/^[0-9.]$/.test(k)) { modalKey(k); return; } if (k === "Backspace") { modalKey("⌫"); return; } if (k === "Enter") { e.preventDefault(); confirmQty(); } return; }
      if (m.type === "discount") { if (/^[0-9]$/.test(k) && m.pct > DISCOUNT_LIMIT) { pinKey(k); return; } if (k === "Backspace") { pinKey("⌫"); return; } if (k === "Enter") { e.preventDefault(); confirmDiscount(); } return; }
      if (m.type === "cn") { if (k === "Enter") { e.preventDefault(); cnIssue(); } return; }
      if (m.type === "dn") { if (k === "Enter" && e.target.tagName !== "SELECT") { e.preventDefault(); dnIssue(); } return; }
      if (m.type === "tinew") { if (k === "Enter") { e.preventDefault(); if (m.sale) tiIssue(); else { const b = modalRoot.querySelector('[data-act="tn-pick"]'); if (b) b.click(); } } return; }
      if (m.type === "settle") { if (k === "Enter") { e.preventDefault(); settleSave(); } return; }
      if (m.type === "merge") { if (k === "Enter") { e.preventDefault(); mergeDo(); } return; }
      if (m.type === "zprint") return;
      if (m.type === "cntpin") {
        if (k === "Enter") { e.preventDefault(); cntApprove(); return; }
        if (/^[0-9]$/.test(k)) { m.pinErr = false; if (m.pin.length < 4) m.pin += k; renderModal(); return; }
        if (k === "Backspace") { e.preventDefault(); m.pin = m.pin.slice(0, -1); renderModal(); return; }
        return;
      }
      if (m.type === "adjust") {
        if (k === "Enter") { e.preventDefault(); adjSubmit(); return; }
        if (m.stage === "pin" && /^[0-9]$/.test(k)) { m.pinErr = false; if (m.pin.length < 4) m.pin += k; renderModal(); return; }
        if (m.stage === "pin" && k === "Backspace") { e.preventDefault(); m.pin = m.pin.slice(0, -1); renderModal(); return; }
        return;
      }
      if (m.type === "resync") {
        if (m.stage !== "pin") return;
        if (/^[0-9]$/.test(k)) { m.pinErr = false; if (m.pin.length < 4) m.pin += k; renderModal(); return; }
        if (k === "Backspace") { e.preventDefault(); m.pin = m.pin.slice(0, -1); renderModal(); return; }
        if (k === "Enter") { e.preventDefault(); resyncStart(); }
        return;
      }
      if (m.type === "cash") {
        if (k === "Enter") { e.preventDefault(); cmSubmit(); return; }
        if (inInput) return;
        if (/^[0-9]$/.test(k)) { if (m.stage === "pin") cmPin(k); else cmKey(k); return; }
        if (k === "Backspace") { e.preventDefault(); if (m.stage === "pin") cmPin("⌫"); else cmKey("⌫"); return; }
        return;
      }
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
    if (S.view === "returns") {
      const r = S.ret;
      if (r.done) { if (k === "Enter") { e.preventDefault(); S.ret = emptyRet(); render(); focusId("rsearch"); } return; }
      if (k === "F8") { e.preventDefault(); S.view = S.shifts[S.user.id] ? "sell" : "openshift"; render(); return; }
      if (e.target.id === "rsearch") {
        if (k === "Enter") { e.preventDefault(); if (r.query.trim()) loadSale(r.query); }
        if (k === "Escape") { r.query = ""; r.error = ""; render(); focusId("rsearch"); }
        return;
      }
      if (inInput) return;
      if (r.sale && needManager() && /^[0-9]$/.test(k)) { retPin(k); return; }
      if (r.sale && needManager() && k === "Backspace") { e.preventDefault(); retPin("⌫"); return; }
      if (k === "Enter" && r.sale) { e.preventDefault(); approveReturn(); return; }
      if (k === "Escape" && r.sale) { S.ret = emptyRet(); render(); focusId("rsearch"); return; }
      if (!r.sale && k.length === 1 && /[0-9A-Za-z-]/.test(k) && !e.ctrlKey && !e.metaKey) { e.preventDefault(); r.query += k; render(); focusId("rsearch"); }
      return;
    }
    if (e.target.id === "scantest") {
      if (k === "Enter" || k === "Tab") { e.preventDefault(); S.diag.scan = classifyScan(e.target.value); render(); focusId("scantest"); }
      return;
    }
    if (S.view === "settings") {
      if ((e.ctrlKey || e.metaKey) && k.toLowerCase() === "s") { e.preventDefault(); saveSettings(); }
      return;
    }
    if (S.view === "tax") {
      if (e.target.id === "tdsearch") { if (k === "Escape") { S.tax.q = ""; render(); focusId("tdsearch"); } return; }
      if (inInput || e.target.tagName === "SELECT") return;
      if (k === "/") { e.preventDefault(); focusId("tdsearch"); return; }
      if (k === "ArrowDown" || k === "ArrowUp") { e.preventDefault(); const list = taxList(); if (!list.length) return; const j = list.findIndex(d => d.no === S.tax.sel); S.tax.sel = list[Math.max(0, Math.min(list.length - 1, j < 0 ? 0 : j + (k === "ArrowDown" ? 1 : -1)))].no; render(); const row = app.querySelector('.trow[aria-selected="true"]'); if (row) row.scrollIntoView({ block: "nearest" }); return; }
      return;
    }
    if (S.view === "customers") {
      if (e.target.id === "cusearch") { if (k === "Escape") { S.cu.q = ""; render(); focusId("cusearch"); } return; }
      if (inInput || e.target.tagName === "SELECT") return;
      if (k === "Enter" && e.target.dataset && e.target.dataset.act === "cu-open") { e.preventDefault(); openCustomer(e.target.dataset.id); return; }
      if (k === "ArrowDown" || k === "ArrowUp") { const rows = [...app.querySelectorAll(".lrow[data-act]")]; if (!rows.length) return; e.preventDefault(); const i = rows.indexOf(document.activeElement); (rows[Math.max(0, Math.min(rows.length - 1, i < 0 ? 0 : i + (k === "ArrowDown" ? 1 : -1)))]).focus(); return; }
      if (k === "/") { e.preventDefault(); focusId("cusearch"); return; }
      if (k === "n" || k === "N") { e.preventDefault(); openCustomer(null); return; }
      return;
    }
    if (S.view === "customer") {
      if ((e.ctrlKey || e.metaKey) && k.toLowerCase() === "s") { e.preventDefault(); if (S.cu.tab === "profile") custSave(); return; }
      return;
    }
    if (S.view === "shifts") {
      if ((e.ctrlKey || e.metaKey) && k === "Enter") { e.preventDefault(); srDecide("approve"); return; }
      if (inInput || e.target.tagName === "SELECT") return;
      if (k === "ArrowDown" || k === "ArrowUp") { e.preventDefault(); srMove(k === "ArrowDown" ? 1 : -1); return; }
      return;
    }
    if (S.view === "exceptions") {
      if ((e.ctrlKey || e.metaKey) && k === "Enter") { e.preventDefault(); excResolve(); return; }
      if (inInput || e.target.tagName === "SELECT") return;
      if (k === "ArrowDown" || k === "ArrowUp") { e.preventDefault(); excMove(k === "ArrowDown" ? 1 : -1); return; }
      if (/^[1-9]$/.test(k)) { const ex = S.exc.list.find(x => x.id === S.exc.sel); if (ex && ex.status === "open" && ex.actions[+k - 1]) { S.exc.action = ex.actions[+k - 1][0]; render(); } return; }
      return;
    }
    if (S.view === "suppliers") {
      if ((e.ctrlKey || e.metaKey) && k.toLowerCase() === "s") { e.preventDefault(); supSave(); return; }
      if (e.target.id === "supsearch") { if (k === "Escape") { S.sup.q = ""; render(); focusId("supsearch"); } else if (k === "ArrowDown") { e.preventDefault(); e.target.blur(); supMove(1); } return; }
      if (inInput || e.target.tagName === "SELECT") return;
      if (k === "/") { e.preventDefault(); focusId("supsearch"); return; }
      if (k === "n" || k === "N") { e.preventDefault(); supNew(); return; }
      if (k === "ArrowDown" || k === "ArrowUp") { e.preventDefault(); supMove(k === "ArrowDown" ? 1 : -1); return; }
      return;
    }
    if (S.view === "counts") {
      const c = S.cnt.cur;
      if (!c) return;
      if (c.step === "posted") { if (k === "Enter" && !inInput) { e.preventDefault(); S.cnt.cur = null; render(); } return; }
      if (k === "F10") { e.preventDefault(); if (c.step === "review") cntPost(false); else if (c.items.some(it => cntVal(it) != null)) { c.step = "review"; render(); } return; }
      if (e.target.id === "cntscan") {
        if (k === "Enter") { e.preventDefault(); cntScan(e.target.value); }
        else if (k === "Escape") { c.q = ""; c.err = ""; render(); focusId("cntscan"); }
        return;
      }
      if (e.target.dataset && e.target.dataset.cq && (k === "Enter" || k === "ArrowDown" || k === "ArrowUp")) {
        e.preventDefault(); const ins = [...app.querySelectorAll("[data-cq]")], i = ins.indexOf(e.target), nx = ins[i + (k === "ArrowUp" ? -1 : 1)];
        if (nx) { nx.focus(); nx.select(); } else if (k === "Enter") focusId("cntscan");
        return;
      }
      if (!inInput && k === "/") { e.preventDefault(); focusId("cntscan"); }
      return;
    }
    if (S.view === "import") { if ((k === "Enter" || k === " ") && e.target.dataset && e.target.dataset.act === "imp-kind") { e.preventDefault(); e.target.click(); } return; }
    if (S.view === "stock" || S.view === "expiry") {
      if (e.target.id === "stsearch") { if (k === "Escape") { S.stk.q = ""; render(); focusId("stsearch"); } return; }
      if (!inInput && k === "/" && S.view === "stock") { e.preventDefault(); focusId("stsearch"); }
      return;
    }
    if (S.view === "product") {
      if ((e.ctrlKey || e.metaKey) && k.toLowerCase() === "s") { e.preventDefault(); peSave(); return; }
      if (k === "Escape" && !inInput) { leaveEditor("products"); }
      return;
    }
    if (S.view === "products") {
      if (e.target.id === "psearch") { if (k === "ArrowDown" || k === "Enter") { e.preventDefault(); const r = app.querySelector(".prow[data-id]"); if (r) r.focus(); } if (k === "Escape") { S.prod.q = ""; render(); focusId("psearch"); } return; }
      if (inInput || e.target.tagName === "SELECT") return;
      const row = e.target.closest && e.target.closest(".prow[data-id]");
      if (row) {
        const rows = [...app.querySelectorAll(".prow[data-id]")], ix = rows.indexOf(row);
        if (k === "ArrowDown" || k === "ArrowUp") { e.preventDefault(); const n = rows[ix + (k === "ArrowDown" ? 1 : -1)]; if (n) n.focus(); else if (k === "ArrowUp") focusId("psearch"); return; }
        if (k === "Enter") { e.preventDefault(); openProduct(row.dataset.id); return; }
        if (k === " ") { e.preventDefault(); const id = row.dataset.id, f = S.prod; f.picked = f.picked.includes(id) ? f.picked.filter(x => x !== id) : [...f.picked, id]; render(); return; }
      }
      if (k === "/") { e.preventDefault(); focusId("psearch"); return; }
      if (k === "n" || k === "N") { e.preventDefault(); openProduct(null); return; }
      return;
    }
    if (S.view === "status") return;
    if (S.view === "receiving") {
      const g = S.grn;
      if (g.posted) { if (k === "Enter") { e.preventDefault(); S.grn = emptyGrn(); render(); focusId("gsearch"); } return; }
      if (k === "F10") { e.preventDefault(); grnPost(); return; }
      if (e.target.id === "gsearch") { if (k === "Enter") { e.preventDefault(); grnScan(g.query); } if (k === "Escape") { g.query = ""; g.error = ""; render(); focusId("gsearch"); } return; }
      if (inInput || e.target.tagName === "SELECT") return;
      if (k.length === 1 && /[0-9A-Za-z(]/.test(k) && !e.ctrlKey && !e.metaKey) { e.preventDefault(); g.query += k; render(); focusId("gsearch"); }
      return;
    }
    if (S.view === "pricecheck") {
      const pc = S.pc;
      if (e.target.id === "pcsearch") {
        if (k === "Enter") { e.preventDefault(); if (pc.query.trim()) pcLookup(pc.query); else if (pc.pid) { const b = app.querySelector('[data-act="pc-add"]'); if (b && !b.disabled) b.click(); } }
        if (k === "Escape") { S.pc = { ...pc, query: "", pid: null, error: "" }; render(); focusId("pcsearch"); }
        return;
      }
      if (inInput) return;
      if (k === "Enter" && pc.pid) { e.preventDefault(); const b = app.querySelector('[data-act="pc-add"]'); if (b && !b.disabled) b.click(); return; }
      if (k === "Escape") { S.pc = { ...pc, query: "", pid: null, error: "" }; render(); focusId("pcsearch"); return; }
      if (k.length === 1 && /[0-9A-Za-z(]/.test(k) && !e.ctrlKey && !e.metaKey) { e.preventDefault(); pc.query += k; render(); focusId("pcsearch"); }
      return;
    }
    if (S.view === "orders") {
      if (e.target.id === "hsearch") {
        if (k === "Enter" || k === "ArrowDown") { e.preventDefault(); const l = histList(); if (l.length) { S.hist.sel = l[0].no; e.target.blur(); render(); } }
        if (k === "Escape") { S.hist.q = ""; render(); focusId("hsearch"); }
        return;
      }
      if (inInput) return;
      if (k === "ArrowDown" || k === "ArrowUp") { e.preventDefault(); histMove(k === "ArrowDown" ? 1 : -1); return; }
      if ((k === "r" || k === "R") && S.hist.sel) { e.preventDefault(); startReturnFrom(S.hist.sel); return; }
      if ((e.ctrlKey || e.metaKey) && k.toLowerCase() === "p" && S.hist.sel) { e.preventDefault(); toast(S.printerError ? "Printer has no paper" : "Receipt reprinted", { error: S.printerError }); return; }
      if (k === "/") { e.preventDefault(); focusId("hsearch"); return; }
      if (k === "Escape") { S.hist.sel = null; render(); return; }
      if (k.length === 1 && /[0-9A-Za-z-]/.test(k) && !e.ctrlKey && !e.metaKey) { e.preventDefault(); S.hist.q += k; render(); focusId("hsearch"); }
      return;
    }
    if (S.view === "cash") {
      if (k === "F9") { openCashMove(); return; }
      if (k !== "Enter" || (e.target.tagName === "TEXTAREA")) return;
      e.preventDefault();
      if (S.cs.step === 1 && countTotal(S.cs) > 0 && !S.cart.length && !S.held.length) { S.cs.step = 2; render(); }
      else if (S.cs.step === 2) closeShiftNow();
      else if (S.cs.step === 3) signOut();
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
      case "F8": goReturns(); return;
      case "F9": openCashMove(); return;
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
  if (["sell", "dashboard", "signin", "openshift", "returns", "cash", "orders", "receiving", "pricecheck", "status", "settings", "products", "stock", "expiry", "counts", "import", "exceptions", "suppliers", "customers", "shifts", "tax", "vat"].includes(hash)) S.view = hash;
  if (hash === "stock" || hash === "expiry" || hash === "counts") S.user = USERS[4]; // Kasun, stock keeper
  if (hash === "import" || hash === "exceptions" || hash === "suppliers" || hash === "customers" || hash === "shifts" || hash === "tax" || hash === "vat") S.user = USERS[3]; // Malini, manager
  // File picker and drag-and-drop for the import wizard (A-23)
  document.addEventListener("change", e => { if (e.target.id === "impfile" && e.target.files && e.target.files[0]) { const fl = e.target.files[0]; impSetFile(fl.name, fl.size); } });
  document.addEventListener("dragover", e => { const z = e.target.closest && e.target.closest(".dropzone"); if (z) { e.preventDefault(); z.classList.add("over"); } });
  document.addEventListener("dragleave", e => { const z = e.target.closest && e.target.closest(".dropzone"); if (z) z.classList.remove("over"); });
  document.addEventListener("drop", e => { const z = e.target.closest && e.target.closest(".dropzone"); if (!z) return; e.preventDefault(); const fl = e.dataTransfer.files[0]; if (fl) impSetFile(fl.name, fl.size); });
  if (hash === "products") S.user = USERS[3]; // Malini, manager
  if (hash === "receiving") S.user = USERS[4]; // Kasun, stock keeper
  if (hash === "openshift") { S.user = USERS[1]; }            // Nimal has no open shift yet
  if (hash === "signin") { S.su.sel = 1; }
  render();
  setTimeout(() => { S.loading = false; render(); focusSearch(); }, 700);
})();
