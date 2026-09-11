import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search, ShoppingBag, Menu, X, Phone, MapPin, Clock, User,
  Plus, Minus, Trash2, ChevronDown, Heart, Check,
  Lock, Package, Settings, LayoutGrid, ArrowLeft, MessageCircle, Gift,
} from "lucide-react";

/* ---------------------------------------------------------------
   DREAMY FINDS BY CEILIA — accessories & gifts online shop
   Data model lives in window.storage:
     - "df_products" (shared)   -> array of product objects
     - "df_settings" (shared)   -> { whatsapp, phone, deliveryFees, hours, address }
     - "df_cart"     (personal) -> array of {id, qty}
   --------------------------------------------------------------- */

const CATEGORIES = [
  { en: "Jewelry", ar: "مجوهرات" },
  { en: "Bags & Purses", ar: "حقائب" },
  { en: "Hair Accessories", ar: "إكسسوارات شعر" },
  { en: "Phone Accessories", ar: "إكسسوارات موبايل" },
  { en: "Home Decor", ar: "ديكور منزلي" },
  { en: "Candles & Fragrance", ar: "شموع وعطور" },
  { en: "Beauty & Self Care", ar: "جمال وعناية" },
  { en: "Kids & Baby Gifts", ar: "هدايا أطفال" },
  { en: "Stationery & Planners", ar: "قرطاسية ومفكرات" },
  { en: "Keychains & Charms", ar: "ميداليات مفاتيح" },
  { en: "Gift Sets & Hampers", ar: "سلال هدايا" },
  { en: "Seasonal & Holiday", ar: "مواسم وأعياد" },
  { en: "Personalized Gifts", ar: "هدايا مخصصة" },
  { en: "Wedding & Event Favors", ar: "هدايا مناسبات" },
  { en: "Other", ar: "أخرى" },
];

const AREAS = [
  { name: "Beirut", ar: "بيروت", fee: 3 },
  { name: "Mount Lebanon", ar: "جبل لبنان", fee: 4 },
  { name: "North Lebanon", ar: "لبنان الشمالي", fee: 6 },
  { name: "South Lebanon", ar: "لبنان الجنوبي", fee: 6 },
  { name: "Bekaa", ar: "البقاع", fee: 6 },
  { name: "Nabatieh", ar: "النبطية", fee: 7 },
];

const DEFAULT_SETTINGS = {
  whatsapp: "96178718933",
  phone: "78-718933",
  hours: "Every day, 9:00 AM – 8:00 PM",
  address: "Lebanon",
};

function img(seed) {
  return `https://picsum.photos/seed/${seed}/600/600`;
}

const SEED_PRODUCTS = [
  { id: "p1", sku: "JW-001", brand: "Dreamy Finds", category: "Jewelry", nameEn: "Pearl Drop Earrings", nameAr: "أقراط لؤلؤ", price: 14, sale: 11, stock: 20, featured: true, bestSeller: true, isNew: false, desc: "Dainty freshwater pearl drop earrings, gold-plated hooks.", specs: "Gold-plated · Freshwater pearl · Hypoallergenic" },
  { id: "p2", sku: "JW-014", brand: "Dreamy Finds", category: "Jewelry", nameEn: "Layered Chain Necklace", nameAr: "قلادة طبقات", price: 18, sale: null, stock: 15, featured: true, bestSeller: false, isNew: true, desc: "Delicate layered chain necklace with a tiny heart charm.", specs: "18K gold-plated · Adjustable length" },
  { id: "p3", sku: "BG-022", brand: "Dreamy Finds", category: "Bags & Purses", nameEn: "Quilted Mini Crossbody", nameAr: "حقيبة كروس صغيرة", price: 32, sale: 27, stock: 10, featured: true, bestSeller: true, isNew: false, desc: "Quilted faux-leather mini crossbody with gold chain strap.", specs: "Faux leather · Adjustable chain strap · 3 colors" },
  { id: "p4", sku: "BG-031", brand: "Dreamy Finds", category: "Bags & Purses", nameEn: "Velvet Makeup Pouch", nameAr: "شنطة مكياج مخملية", price: 9, sale: null, stock: 30, featured: false, bestSeller: false, isNew: false, desc: "Soft velvet makeup pouch with satin lining and zip closure.", specs: "Velvet exterior · Satin lining · 20x12cm" },
  { id: "p5", sku: "HR-005", brand: "Dreamy Finds", category: "Hair Accessories", nameEn: "Silk Scrunchie Set (5pc)", nameAr: "طقم ربطات شعر حرير", price: 8, sale: 6, stock: 40, featured: false, bestSeller: true, isNew: false, desc: "Set of 5 silky scrunchies in soft pastel tones.", specs: "5 pieces · Silky satin · Gentle on hair" },
  { id: "p6", sku: "HR-018", brand: "Dreamy Finds", category: "Hair Accessories", nameEn: "Pearl Hair Clips (3pc)", nameAr: "مشابك شعر لؤلؤ", price: 7, sale: null, stock: 35, featured: false, bestSeller: false, isNew: true, desc: "Set of 3 pearl-embellished hair clips.", specs: "3 pieces · Metal clip base · Faux pearls" },
  { id: "p7", sku: "PH-009", brand: "Dreamy Finds", category: "Phone Accessories", nameEn: "Phone Charm Strap", nameAr: "سلسلة موبايل", price: 6, sale: null, stock: 45, featured: true, bestSeller: false, isNew: true, desc: "Beaded phone charm strap, fits most phone cases with a loop.", specs: "Beaded strap · Universal fit · 5 colors" },
  { id: "p8", sku: "PH-013", brand: "Dreamy Finds", category: "Phone Accessories", nameEn: "Glitter Phone Case", nameAr: "غلاف موبايل غليتر", price: 12, sale: 9, stock: 25, featured: false, bestSeller: true, isNew: false, desc: "Shockproof glitter phone case with soft edges.", specs: "Shockproof TPU · Glitter finish · Multiple models" },
  { id: "p9", sku: "HD-041", brand: "Dreamy Finds", category: "Home Decor", nameEn: "Dried Flower Frame", nameAr: "برواز زهور مجففة", price: 16, sale: null, stock: 12, featured: true, bestSeller: false, isNew: false, desc: "Real dried flowers pressed in a minimalist wooden frame.", specs: "Real dried flowers · Wood frame · 20x25cm" },
  { id: "p10", sku: "HD-052", brand: "Dreamy Finds", category: "Home Decor", nameEn: "Ceramic Trinket Dish", nameAr: "طبق سيراميك صغير", price: 10, sale: null, stock: 18, featured: false, bestSeller: false, isNew: false, desc: "Hand-painted ceramic dish for rings and small treasures.", specs: "Ceramic · Hand-painted · 10cm diameter" },
  { id: "p11", sku: "CN-101", brand: "Dreamy Finds", category: "Candles & Fragrance", nameEn: "Vanilla Bloom Candle", nameAr: "شمعة فانيلا", price: 13, sale: 10, stock: 22, featured: true, bestSeller: true, isNew: false, desc: "Soy wax candle in vanilla bloom scent, 40-hour burn time.", specs: "Soy wax · 40hr burn · 200g" },
  { id: "p12", sku: "CN-108", brand: "Dreamy Finds", category: "Candles & Fragrance", nameEn: "Room Mist Spray", nameAr: "معطر جو", price: 11, sale: null, stock: 28, featured: false, bestSeller: false, isNew: true, desc: "Delicate floral room mist, 100ml spray bottle.", specs: "100ml · Floral scent · Alcohol-free" },
  { id: "p13", sku: "BT-201", brand: "Dreamy Finds", category: "Beauty & Self Care", nameEn: "Rose Quartz Roller", nameAr: "رولر كوارتز وردي", price: 9, sale: null, stock: 33, featured: false, bestSeller: true, isNew: false, desc: "Rose quartz facial roller for a soothing skincare ritual.", specs: "Genuine rose quartz · Ergonomic handle" },
  { id: "p14", sku: "KD-301", brand: "Dreamy Finds", category: "Kids & Baby Gifts", nameEn: "Baby's First Gift Box", nameAr: "علبة هدية مولود", price: 24, sale: 20, stock: 9, featured: true, bestSeller: false, isNew: false, desc: "Curated gift box with baby socks, bib, and plush toy.", specs: "3-piece set · Cotton fabric · Gift-ready box" },
  { id: "p15", sku: "ST-401", brand: "Dreamy Finds", category: "Stationery & Planners", nameEn: "Daily Planner Notebook", nameAr: "مفكرة يومية", price: 12, sale: null, stock: 26, featured: false, bestSeller: false, isNew: true, desc: "Undated daily planner with gold foil cover detail.", specs: "A5 size · 180 pages · Hardcover" },
  { id: "p16", sku: "KC-501", brand: "Dreamy Finds", category: "Keychains & Charms", nameEn: "Initial Letter Keychain", nameAr: "ميدالية مفاتيح حرف", price: 5, sale: null, stock: 50, featured: false, bestSeller: true, isNew: false, desc: "Personalized initial letter keychain in gold tone.", specs: "Gold tone · Choose your initial" },
  { id: "p17", sku: "GS-601", brand: "Dreamy Finds", category: "Gift Sets & Hampers", nameEn: "Self-Care Gift Hamper", nameAr: "سلة هدايا عناية ذاتية", price: 35, sale: 29, stock: 8, featured: true, bestSeller: true, isNew: false, desc: "Curated hamper with candle, bath salts, roller, and note card.", specs: "4-piece set · Gift-wrapped · Ready to send" },
  { id: "p18", sku: "WD-701", brand: "Dreamy Finds", category: "Wedding & Event Favors", nameEn: "Mini Favor Boxes (10pc)", nameAr: "علب هدايا صغيرة", price: 10, sale: null, stock: 40, featured: false, bestSeller: false, isNew: false, desc: "Set of 10 mini favor boxes for weddings and events.", specs: "10 pieces · Kraft paper · Ribbon included" },
];

const T = {
  en: {
    tagline: "Little Treasures, Big Smiles.",
    sub: "Accessories & Gifts, Delivered Across Lebanon",
    shopNow: "Shop Now",
    orderWhatsapp: "Order on WhatsApp",
    products: "Shop",
    search: "Search gifts, accessories, SKU...",
    cart: "Bag",
    login: "Login / Register",
    categories: "Shop by Category",
    featured: "Featured Finds",
    bestsellers: "Best Sellers",
    offers: "Special Offers",
    brands: "Collections",
    why: "Why Dreamy Finds",
    addToCart: "Add to Bag",
    buyNow: "Buy Now",
    orderVia: "Order via WhatsApp",
    inStock: "In Stock",
    outStock: "Out of Stock",
    subtotal: "Subtotal",
    delivery: "Delivery",
    total: "Total",
    continueShopping: "Continue Shopping",
    proceedCheckout: "Proceed to Checkout",
    emptyCart: "Your bag is empty",
    checkout: "Checkout",
    name: "Your Name",
    phone: "Phone Number",
    wa: "WhatsApp Number",
    area: "Governorate / Area",
    address: "Full Delivery Address",
    notes: "Order Notes (optional)",
    confirmWa: "Confirm Order via WhatsApp",
    allCategories: "All Categories",
    filters: "Filters",
    brand: "Collection",
    priceRange: "Price",
    availability: "Availability",
    saleOnly: "On Sale",
    admin: "Admin",
    q1: "Handpicked Finds",
    q1d: "Every piece chosen for its charm — nothing mass-market.",
    q2: "Sweet Prices",
    q2d: "Little luxuries that don't break the bank.",
    q3: "Lebanon-Wide Delivery",
    q3d: "We deliver to every governorate, area by area.",
    q4: "WhatsApp Ordering",
    q4d: "Order your full bag in one message, no calls needed.",
    q5: "Gift-Ready Packaging",
    q5d: "Thoughtfully wrapped, ready to hand over with a smile.",
    about: "About Dreamy Finds By Celia",
    aboutText: "Dreamy Finds By Celia is a Lebanon-based online shop for accessories, home touches, and gifts you'll want to keep — or give away.",
    contact: "Contact",
    terms: "Terms & Conditions",
    privacy: "Privacy Policy",
    qty: "Qty",
    remove: "Remove",
    clearBasket: "Clear Bag",
    specifications: "Details",
    description: "Description",
  },
  ar: {
    tagline: "كنوز صغيرة، ابتسامات كبيرة.",
    sub: "إكسسوارات وهدايا، توصيل لكل لبنان",
    shopNow: "تسوقي الآن",
    orderWhatsapp: "اطلبي عبر واتساب",
    products: "المتجر",
    search: "بحث عن هدايا، إكسسوارات...",
    cart: "الحقيبة",
    login: "دخول / تسجيل",
    categories: "تسوقي حسب الفئة",
    featured: "مختارات مميزة",
    bestsellers: "الأكثر مبيعاً",
    offers: "عروض خاصة",
    brands: "مجموعات",
    why: "لماذا Dreamy Finds",
    addToCart: "أضف إلى الحقيبة",
    buyNow: "اشترِ الآن",
    orderVia: "اطلبي عبر واتساب",
    inStock: "متوفر",
    outStock: "غير متوفر",
    subtotal: "المجموع الفرعي",
    delivery: "التوصيل",
    total: "المجموع",
    continueShopping: "متابعة التسوق",
    proceedCheckout: "المتابعة للدفع",
    emptyCart: "حقيبتك فارغة",
    checkout: "إتمام الطلب",
    name: "الاسم",
    phone: "رقم الهاتف",
    wa: "رقم الواتساب",
    area: "المحافظة / المنطقة",
    address: "عنوان التوصيل الكامل",
    notes: "ملاحظات (اختياري)",
    confirmWa: "تأكيد الطلب عبر واتساب",
    allCategories: "كل الفئات",
    filters: "تصفية",
    brand: "مجموعة",
    priceRange: "السعر",
    availability: "التوفر",
    saleOnly: "عروض فقط",
    admin: "الإدارة",
    q1: "مختارات بعناية",
    q1d: "كل قطعة مختارة لجمالها، بدون تسويق جماعي.",
    q2: "أسعار لطيفة",
    q2d: "رفاهيات صغيرة بأسعار معقولة.",
    q3: "توصيل لكل لبنان",
    q3d: "نوصل إلى كل المحافظات.",
    q4: "الطلب عبر واتساب",
    q4d: "اطلبي كل حقيبتك برسالة واحدة، بدون اتصال.",
    q5: "تغليف جاهز كهدية",
    q5d: "مغلف بعناية، جاهز لتقديمه بابتسامة.",
    about: "عن Dreamy Finds By Celia",
    aboutText: "Dreamy Finds By Celia متجر لبناني إلكتروني للإكسسوارات ولمسات المنزل والهدايا التي تستحق الاحتفاظ بها أو إهداءها.",
    contact: "تواصل معنا",
    terms: "الشروط والأحكام",
    privacy: "سياسة الخصوصية",
    qty: "الكمية",
    remove: "إزالة",
    clearBasket: "تفريغ الحقيبة",
    specifications: "التفاصيل",
    description: "الوصف",
  },
};

export default function App() {
  const [lang, setLang] = useState("en");
  const [products, setProducts] = useState(null);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [cart, setCart] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeBrand, setActiveBrand] = useState(null);
  const [saleOnly, setSaleOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState(50);

  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [toast, setToast] = useState(null);
  const [view, setView] = useState("store"); // store | admin

  const t = T[lang];
  const isAr = lang === "ar";

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        let p;
        try { p = await window.storage.get("df_products", true); } catch { p = null; }
        if (!p) {
          await window.storage.set("df_products", JSON.stringify(SEED_PRODUCTS), true);
          if (!cancelled) setProducts(SEED_PRODUCTS);
        } else if (!cancelled) {
          setProducts(JSON.parse(p.value));
        }

        let s;
        try { s = await window.storage.get("df_settings", true); } catch { s = null; }
        if (!s) {
          await window.storage.set("df_settings", JSON.stringify(DEFAULT_SETTINGS), true);
          if (!cancelled) setSettings(DEFAULT_SETTINGS);
        } else if (!cancelled) {
          setSettings(JSON.parse(s.value));
        }

        let c;
        try { c = await window.storage.get("df_cart", false); } catch { c = null; }
        if (c && !cancelled) setCart(JSON.parse(c.value));
      } catch (e) {
        console.error("Storage load failed", e);
        if (!cancelled) { setLoadError(true); setProducts(SEED_PRODUCTS); }
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const saveProducts = useCallback(async (next) => {
    setProducts(next);
    try { await window.storage.set("df_products", JSON.stringify(next), true); } catch (e) { console.error(e); }
  }, []);
  const saveSettings = useCallback(async (next) => {
    setSettings(next);
    try { await window.storage.set("df_settings", JSON.stringify(next), true); } catch (e) { console.error(e); }
  }, []);
  const saveCart = useCallback(async (next) => {
    setCart(next);
    try { await window.storage.set("df_cart", JSON.stringify(next), false); } catch (e) { console.error(e); }
  }, []);

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(null), 1800); }

  const cartItems = useMemo(() => {
    if (!products) return [];
    return cart.map((c) => {
      const p = products.find((pr) => pr.id === c.id);
      return p ? { ...p, qty: c.qty } : null;
    }).filter(Boolean);
  }, [cart, products]);

  const cartCount = cart.reduce((n, c) => n + c.qty, 0);
  const [deliveryArea, setDeliveryArea] = useState(AREAS[0].name);
  const deliveryFee = AREAS.find((a) => a.name === deliveryArea)?.fee ?? 4;
  const subtotal = cartItems.reduce((s, it) => s + (it.sale ?? it.price) * it.qty, 0);
  const total = subtotal + (cartItems.length ? deliveryFee : 0);

  function addToCart(product, qty = 1) {
    const existing = cart.find((c) => c.id === product.id);
    const next = existing
      ? cart.map((c) => (c.id === product.id ? { ...c, qty: c.qty + qty } : c))
      : [...cart, { id: product.id, qty }];
    saveCart(next);
    showToast(isAr ? "أضيف إلى الحقيبة" : "Added to your bag");
  }
  function setQty(id, qty) { if (qty <= 0) return removeFromCart(id); saveCart(cart.map((c) => (c.id === id ? { ...c, qty } : c))); }
  function removeFromCart(id) { saveCart(cart.filter((c) => c.id !== id)); }
  function clearCart() { saveCart([]); }

  const brands = useMemo(() => (products ? [...new Set(products.map((p) => p.category))].sort() : []), [products]);

  const filtered = useMemo(() => {
    if (!products) return [];
    return products.filter((p) => {
      if (activeCategory && p.category !== activeCategory) return false;
      if (saleOnly && !p.sale) return false;
      if ((p.sale ?? p.price) > maxPrice) return false;
      if (query) {
        const q = query.toLowerCase();
        const hay = `${p.nameEn} ${p.nameAr} ${p.sku} ${p.brand} ${p.category}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [products, activeCategory, saleOnly, maxPrice, query]);

  const featuredProducts = (products || []).filter((p) => p.featured);
  const bestSellers = (products || []).filter((p) => p.bestSeller);
  const saleProducts = (products || []).filter((p) => p.sale);

  function buildOrderMessage(customer) {
    const lines = ["Hello Dreamy Finds By Celia,", "", "I would like to order:", ""];
    cartItems.forEach((it, i) => {
      const price = it.sale ?? it.price;
      lines.push(`${i + 1}. ${it.nameEn}`);
      lines.push(`SKU: ${it.sku}`);
      lines.push(`Qty: ${it.qty}`);
      lines.push(`Price: $${price}`);
      lines.push(`Total: $${(price * it.qty).toFixed(2)}`);
      lines.push("");
    });
    lines.push(`Subtotal: $${subtotal.toFixed(2)}`);
    lines.push(`Delivery: $${deliveryFee.toFixed(2)}`);
    lines.push(`Total: $${total.toFixed(2)}`);
    lines.push("");
    lines.push(`Customer Name: ${customer.name || ""}`);
    lines.push(`Phone: ${customer.phone || ""}`);
    lines.push(`Delivery Area: ${customer.area || ""}`);
    lines.push(`Address: ${customer.address || ""}`);
    if (customer.notes) lines.push(`Notes: ${customer.notes}`);
    lines.push("");
    lines.push("Please confirm availability and delivery.");
    return lines.join("\n");
  }

  function sendSingleProductToWhatsapp(product) {
    const msg = [
      "Hello Dreamy Finds By Celia,", "", "I would like to order:", "",
      `Product: ${product.nameEn}`, `SKU: ${product.sku}`, `Quantity: 1`, `Price: $${product.sale ?? product.price}`,
      "", "Please confirm availability and delivery.",
    ].join("\n");
    window.open(`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(msg)}`, "_blank");
  }
  function sendCartToWhatsapp(customer) {
    window.open(`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(buildOrderMessage(customer))}`, "_blank");
  }

  if (!loaded) {
    return (
      <div className="min-h-[500px] flex items-center justify-center bg-[#FBEFEA] text-[#8A5A63]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#C9A86A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="font-semibold tracking-wide">Loading Dreamy Finds By Celia...</p>
        </div>
      </div>
    );
  }

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="min-h-screen bg-[#FFF8F4] text-[#3A2E30]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Poppins:wght@400;500;600&display=swap');
        .heading-font { font-family: 'Playfair Display', Georgia, serif; }
        .body-font { font-family: 'Poppins', system-ui, sans-serif; }
        .scrollbar-thin::-webkit-scrollbar { width: 6px; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #E8C7CC; border-radius: 4px; }
      `}</style>

      {loadError && (
        <div className="bg-red-500 text-white text-center text-sm py-1.5 px-4 body-font">
          Storage unavailable — running in demo mode, changes won't be saved.
        </div>
      )}

      {view === "admin" ? (
        <AdminPanel t={t} isAr={isAr} products={products} settings={settings} onSaveProducts={saveProducts} onSaveSettings={saveSettings} onExit={() => setView("store")} categories={CATEGORIES} />
      ) : (
        <>
          <TopBar t={t} settings={settings} lang={lang} setLang={setLang} />
          <Header
            t={t} isAr={isAr} query={query} setQuery={setQuery} cartCount={cartCount}
            onCartClick={() => setCartOpen(true)} menuOpen={menuOpen} setMenuOpen={setMenuOpen}
            categories={CATEGORIES} activeCategory={activeCategory} setActiveCategory={setActiveCategory}
            onAdminClick={() => setView("admin")}
          />
          <Hero t={t} isAr={isAr} onShop={() => document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" })} onWhatsapp={() => window.open(`https://wa.me/${settings.whatsapp}`, "_blank")} />
          <CategorySection t={t} isAr={isAr} categories={CATEGORIES} onPick={(c) => { setActiveCategory(c); document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" }); }} />

          {featuredProducts.length > 0 && <ProductRow title={t.featured} items={featuredProducts} isAr={isAr} t={t} onOpen={setSelectedProduct} onAdd={addToCart} />}
          {bestSellers.length > 0 && <ProductRow title={t.bestsellers} items={bestSellers} isAr={isAr} t={t} onOpen={setSelectedProduct} onAdd={addToCart} />}
          {saleProducts.length > 0 && <ProductRow title={t.offers} items={saleProducts} isAr={isAr} t={t} onOpen={setSelectedProduct} onAdd={addToCart} accent />}

          <section id="catalog" className="max-w-7xl mx-auto px-4 md:px-6 py-10">
            <div className="flex flex-col md:flex-row gap-6">
              <FiltersPanel t={t} isAr={isAr} categories={CATEGORIES} activeCategory={activeCategory} setActiveCategory={setActiveCategory} saleOnly={saleOnly} setSaleOnly={setSaleOnly} maxPrice={maxPrice} setMaxPrice={setMaxPrice} />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-semibold heading-font">{activeCategory || t.products}</h2>
                  <span className="text-sm text-[#8A5A63] body-font">{filtered.length} {isAr ? "منتج" : "items"}</span>
                </div>
                {filtered.length === 0 ? (
                  <div className="text-center py-20 text-[#8A5A63] body-font">{isAr ? "لا توجد منتجات مطابقة" : "No products match your filters."}</div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((p) => <ProductCard key={p.id} p={p} isAr={isAr} t={t} onOpen={() => setSelectedProduct(p)} onAdd={() => addToCart(p)} />)}
                  </div>
                )}
              </div>
            </div>
          </section>

          <WhySection t={t} />
          <Footer t={t} isAr={isAr} settings={settings} categories={CATEGORIES} onAdminClick={() => setView("admin")} />
        </>
      )}

      <button
        onClick={() => window.open(`https://wa.me/${settings.whatsapp}`, "_blank")}
        className="fixed bottom-5 right-5 z-40 bg-[#25D366] hover:bg-[#1ebe5b] text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-transform hover:scale-105"
        aria-label="WhatsApp"
      >
        <MessageCircle size={26} fill="white" strokeWidth={0} />
      </button>

      {selectedProduct && (
        <ProductModal product={selectedProduct} t={t} isAr={isAr} onClose={() => setSelectedProduct(null)} onAdd={(qty) => { addToCart(selectedProduct, qty); setSelectedProduct(null); }} onWhatsapp={() => sendSingleProductToWhatsapp(selectedProduct)} />
      )}

      {cartOpen && (
        <CartPanel t={t} isAr={isAr} items={cartItems} setQty={setQty} removeFromCart={removeFromCart} clearCart={clearCart} subtotal={subtotal} deliveryFee={cartItems.length ? deliveryFee : 0} total={total} onClose={() => setCartOpen(false)} onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }} onWhatsapp={() => sendCartToWhatsapp({})} />
      )}

      {checkoutOpen && (
        <CheckoutModal t={t} isAr={isAr} areas={AREAS} deliveryArea={deliveryArea} setDeliveryArea={setDeliveryArea} subtotal={subtotal} deliveryFee={deliveryFee} total={total} onClose={() => setCheckoutOpen(false)} onConfirm={(customer) => { sendCartToWhatsapp({ ...customer, area: customer.area }); setCheckoutOpen(false); }} />
      )}

      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#3A2E30] text-white px-5 py-2.5 rounded-full shadow-lg flex items-center gap-2 body-font text-sm">
          <Check size={16} className="text-[#E9B8A8]" /> {toast}
        </div>
      )}
    </div>
  );
}

/* ---------------- Sub components ---------------- */

function TopBar({ t, settings, lang, setLang }) {
  return (
    <div className="bg-[#C97B84] text-white text-xs body-font">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-1.5 flex items-center justify-between gap-4 overflow-x-auto whitespace-nowrap">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1"><Phone size={12} />{settings.phone}</span>
          <span className="hidden sm:flex items-center gap-1"><MapPin size={12} />{settings.address}</span>
          <span className="hidden md:flex items-center gap-1"><Clock size={12} />{settings.hours}</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setLang("en")} className={`${lang === "en" ? "font-bold underline" : "text-white/70"}`}>EN</button>
          <span className="text-white/50">/</span>
          <button onClick={() => setLang("ar")} className={`${lang === "ar" ? "font-bold underline" : "text-white/70"}`}>AR</button>
        </div>
      </div>
    </div>
  );
}

function Header({ t, isAr, query, setQuery, cartCount, onCartClick, menuOpen, setMenuOpen, categories, activeCategory, setActiveCategory, onAdminClick }) {
  return (
    <header className="bg-[#FFF8F4] border-b border-[#EBD2C8] sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center gap-4">
        <button className="lg:hidden" onClick={() => setMenuOpen((v) => !v)}>{menuOpen ? <X size={24} /> : <Menu size={24} />}</button>
        <div className="flex items-center gap-2 shrink-0">
          <div className="bg-[#C97B84] w-10 h-10 rounded-full flex items-center justify-center text-white"><Gift size={18} /></div>
          <div className="leading-none">
            <div className="font-bold text-lg heading-font">Dreamy Finds</div>
            <div className="text-[10px] text-[#8A5A63] body-font tracking-wide">BY CEILIA</div>
          </div>
        </div>

        <div className="flex-1 hidden sm:flex items-center bg-white rounded-full px-3 py-2 border border-[#EBD2C8] focus-within:border-[#C97B84]">
          <Search size={18} className="text-[#C9A0A6] shrink-0" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.search} className="bg-transparent outline-none px-2 text-sm w-full body-font" />
        </div>

        <button className="hidden md:flex items-center gap-1.5 text-sm font-medium body-font text-[#3A2E30]" onClick={onAdminClick}><User size={18} /> {t.login}</button>
        <button className="hidden lg:flex items-center gap-1.5 text-sm font-medium body-font text-[#C9A0A6] hover:text-[#3A2E30]" onClick={onAdminClick} title="Admin"><Settings size={16} /></button>

        <button onClick={onCartClick} className="relative flex items-center gap-1.5 bg-[#C97B84] text-white px-3.5 py-2 rounded-full font-semibold text-sm body-font">
          <ShoppingBag size={18} />
          <span className="hidden sm:inline">{t.cart}</span>
          <span className="absolute -top-2 -right-2 bg-[#3A2E30] text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{cartCount}</span>
        </button>
      </div>

      <div className="sm:hidden px-4 pb-3">
        <div className="flex items-center bg-white rounded-full px-3 py-2 border border-[#EBD2C8]">
          <Search size={18} className="text-[#C9A0A6] shrink-0" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.search} className="bg-transparent outline-none px-2 text-sm w-full body-font" />
        </div>
      </div>

      <nav className={`${menuOpen ? "block" : "hidden"} lg:block bg-[#C97B84] text-white`}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-2 flex flex-wrap gap-x-5 gap-y-1.5 text-sm body-font overflow-x-auto">
          <button onClick={() => { setActiveCategory(null); setMenuOpen(false); }} className={`whitespace-nowrap py-1 ${!activeCategory ? "font-semibold underline" : "text-white/80 hover:text-white"}`}>{t.allCategories}</button>
          {categories.map((c) => (
            <button key={c.en} onClick={() => { setActiveCategory(c.en); setMenuOpen(false); document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" }); }} className={`whitespace-nowrap py-1 ${activeCategory === c.en ? "font-semibold underline" : "text-white/80 hover:text-white"}`}>
              {isAr ? c.ar : c.en}
            </button>
          ))}
        </div>
      </nav>
    </header>
  );
}

function Hero({ t, isAr, onShop, onWhatsapp }) {
  return (
    <section className="relative bg-[#F6DCD9] overflow-hidden">
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `url(${img("hero-gifts")})`, backgroundSize: "cover", backgroundPosition: "center" }} />
      <div className="absolute inset-0 bg-gradient-to-r from-[#F6DCD9] via-[#F6DCD9]/85 to-transparent" />
      <div className="relative max-w-7xl mx-auto px-4 md:px-6 py-20 md:py-28">
        <div className="max-w-xl">
          <span className="inline-block bg-white text-[#C97B84] text-xs font-bold px-3 py-1 mb-4 body-font rounded-full">{isAr ? "لبنان" : "LEBANON"}</span>
          <h1 className="text-4xl md:text-6xl font-semibold leading-[1.1] mb-4 heading-font text-[#3A2E30]">{t.tagline}</h1>
          <p className="text-[#6B4A50] text-lg mb-8 body-font">{t.sub}</p>
          <div className="flex flex-wrap gap-3">
            <button onClick={onShop} className="bg-[#3A2E30] text-white font-semibold px-6 py-3 rounded-full hover:bg-[#2A2022] transition-colors body-font">{t.shopNow}</button>
            <button onClick={onWhatsapp} className="border-2 border-[#3A2E30] text-[#3A2E30] font-semibold px-6 py-3 rounded-full hover:bg-[#3A2E30] hover:text-white transition-colors flex items-center gap-2 body-font"><MessageCircle size={18} /> {t.orderWhatsapp}</button>
          </div>
        </div>
      </div>
    </section>
  );
}

function CategorySection({ t, isAr, categories, onPick }) {
  return (
    <section className="max-w-7xl mx-auto px-4 md:px-6 py-10">
      <h2 className="text-2xl font-semibold mb-5 heading-font">{t.categories}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {categories.map((c) => (
          <button key={c.en} onClick={() => onPick(c.en)} className="group relative aspect-square overflow-hidden rounded-2xl text-left">
            <img src={img(c.en)} alt={c.en} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            <div className="absolute inset-0 bg-[#3A2E30]/45 group-hover:bg-[#3A2E30]/55 transition-colors" />
            <span className="absolute bottom-2 left-2 right-2 text-white text-xs md:text-sm font-semibold body-font leading-tight">{isAr ? c.ar : c.en}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function ProductRow({ title, items, isAr, t, onOpen, onAdd, accent }) {
  return (
    <section className={`${accent ? "bg-[#FBEFEA]" : ""} py-10`}>
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between mb-5"><h2 className="text-2xl font-semibold heading-font">{title}</h2></div>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
          {items.map((p) => (
            <div key={p.id} className="shrink-0 w-48 sm:w-56"><ProductCard p={p} isAr={isAr} t={t} onOpen={() => onOpen(p)} onAdd={() => onAdd(p)} compact /></div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductCard({ p, isAr, t, onOpen, onAdd, compact }) {
  const price = p.sale ?? p.price;
  const name = isAr ? p.nameAr : p.nameEn;
  return (
    <div className="bg-white border border-[#F1DDD8] rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
      <button onClick={onOpen} className="block w-full text-left">
        <div className="relative aspect-square bg-[#FBEFEA]">
          <img src={img(p.sku)} alt={name} className="w-full h-full object-cover" />
          {p.sale && <span className="absolute top-2 left-2 bg-[#C97B84] text-white text-[11px] font-bold px-2 py-0.5 rounded-full body-font">SALE</span>}
          {p.isNew && <span className="absolute top-2 right-2 bg-[#C9A86A] text-white text-[11px] font-bold px-2 py-0.5 rounded-full body-font">{isAr ? "جديد" : "NEW"}</span>}
          {p.stock === 0 && <div className="absolute inset-0 bg-white/70 flex items-center justify-center text-sm font-semibold body-font">{t.outStock}</div>}
        </div>
        <div className="p-3">
          <div className="text-[11px] text-[#B98A90] body-font">{p.category}</div>
          <div className={`font-semibold ${compact ? "text-sm" : "text-base"} leading-snug mt-0.5 line-clamp-2 heading-font`}>{name}</div>
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="font-bold text-lg">${price}</span>
            {p.sale && <span className="text-xs text-[#C9A0A6] line-through body-font">${p.price}</span>}
          </div>
          <div className={`text-[11px] mt-0.5 body-font ${p.stock > 0 ? "text-green-600" : "text-red-500"}`}>{p.stock > 0 ? t.inStock : t.outStock}</div>
        </div>
      </button>
      <div className="px-3 pb-3">
        <button disabled={p.stock === 0} onClick={(e) => { e.stopPropagation(); onAdd(); }} className="w-full bg-[#3A2E30] text-white text-xs font-semibold py-2 rounded-full hover:bg-[#2A2022] disabled:bg-neutral-300 body-font">{t.addToCart}</button>
      </div>
    </div>
  );
}

function FiltersPanel({ t, isAr, categories, activeCategory, setActiveCategory, saleOnly, setSaleOnly, maxPrice, setMaxPrice }) {
  const [open, setOpen] = useState(true);
  return (
    <aside className="w-full md:w-60 shrink-0">
      <button onClick={() => setOpen((v) => !v)} className="md:hidden flex items-center justify-between w-full font-semibold mb-2 body-font">{t.filters} <ChevronDown size={18} className={`${open ? "rotate-180" : ""} transition-transform`} /></button>
      <div className={`${open ? "block" : "hidden"} md:block space-y-6 body-font`}>
        <div>
          <h4 className="font-semibold text-sm mb-2 uppercase tracking-wide text-[#B98A90]">{isAr ? "الفئة" : "Category"}</h4>
          <div className="space-y-1 max-h-56 overflow-y-auto scrollbar-thin pr-1">
            <button onClick={() => setActiveCategory(null)} className={`block w-full text-left text-sm py-1 ${!activeCategory ? "text-[#3A2E30] font-semibold" : "text-[#8A5A63]"}`}>{t.allCategories}</button>
            {categories.map((c) => (
              <button key={c.en} onClick={() => setActiveCategory(c.en)} className={`block w-full text-left text-sm py-1 ${activeCategory === c.en ? "text-[#3A2E30] font-semibold" : "text-[#8A5A63]"}`}>{isAr ? c.ar : c.en}</button>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-sm mb-2 uppercase tracking-wide text-[#B98A90]">{t.priceRange}: ${maxPrice}</h4>
          <input type="range" min="5" max="50" step="1" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full accent-[#C97B84]" />
        </div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={saleOnly} onChange={(e) => setSaleOnly(e.target.checked)} className="accent-[#C97B84] w-4 h-4" />{t.saleOnly}</label>
      </div>
    </aside>
  );
}

function ProductModal({ product, t, isAr, onClose, onAdd, onWhatsapp }) {
  const [qty, setQtyState] = useState(1);
  const name = isAr ? product.nameAr : product.nameEn;
  const price = product.sale ?? product.price;
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="bg-white w-full sm:max-w-2xl sm:rounded-2xl max-h-[92vh] overflow-y-auto scrollbar-thin" onClick={(e) => e.stopPropagation()} dir={isAr ? "rtl" : "ltr"}>
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
          <span className="font-semibold body-font text-sm text-[#B98A90]">{product.sku}</span>
          <button onClick={onClose}><X size={22} /></button>
        </div>
        <div className="grid sm:grid-cols-2 gap-6 p-4 sm:p-6">
          <img src={img(product.sku)} alt={name} className="w-full aspect-square object-cover rounded-2xl bg-[#FBEFEA]" />
          <div className="body-font">
            <div className="text-xs text-[#B98A90]">{product.category}</div>
            <h2 className="text-2xl font-semibold mt-1 mb-2 heading-font">{name}</h2>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-2xl font-bold">${price}</span>
              {product.sale && <span className="text-[#C9A0A6] line-through">${product.price}</span>}
            </div>
            <div className={`text-sm mb-4 ${product.stock > 0 ? "text-green-600" : "text-red-500"}`}>{product.stock > 0 ? `${t.inStock} (${product.stock})` : t.outStock}</div>
            <p className="text-sm text-[#6B4A50] mb-3">{product.desc}</p>
            <div className="text-xs text-[#8A5A63] border-t pt-3 mb-4"><div className="font-semibold mb-1">{t.specifications}</div>{product.specs}</div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm font-medium">{t.qty}</span>
              <div className="flex items-center border rounded-full">
                <button onClick={() => setQtyState((q) => Math.max(1, q - 1))} className="px-3 py-1.5"><Minus size={14} /></button>
                <span className="px-3 text-sm">{qty}</span>
                <button onClick={() => setQtyState((q) => q + 1)} className="px-3 py-1.5"><Plus size={14} /></button>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <button disabled={product.stock === 0} onClick={() => onAdd(qty)} className="bg-[#3A2E30] text-white font-semibold py-3 rounded-full disabled:bg-neutral-300">{t.addToCart}</button>
              <button disabled={product.stock === 0} onClick={() => onAdd(qty)} className="border-2 border-[#3A2E30] font-semibold py-3 rounded-full disabled:opacity-40">{t.buyNow}</button>
              <button onClick={onWhatsapp} className="bg-[#25D366] text-white font-semibold py-3 rounded-full flex items-center justify-center gap-2"><MessageCircle size={18} /> {t.orderVia}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CartPanel({ t, isAr, items, setQty, removeFromCart, clearCart, subtotal, deliveryFee, total, onClose, onCheckout, onWhatsapp }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex justify-end" onClick={onClose}>
      <div className="bg-white w-full max-w-md h-full flex flex-col body-font" dir={isAr ? "rtl" : "ltr"} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-bold text-lg flex items-center gap-2 heading-font"><ShoppingBag size={20} /> {t.cart} ({items.reduce((n, i) => n + i.qty, 0)})</h3>
          <button onClick={onClose}><X size={22} /></button>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
          {items.length === 0 ? (
            <div className="text-center text-[#C9A0A6] py-16">{t.emptyCart}</div>
          ) : (
            items.map((it) => {
              const name = isAr ? it.nameAr : it.nameEn;
              const price = it.sale ?? it.price;
              return (
                <div key={it.id} className="flex gap-3 border-b pb-4">
                  <img src={img(it.sku)} alt={name} className="w-16 h-16 object-cover rounded-xl bg-[#FBEFEA] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold line-clamp-1">{name}</div>
                    <div className="text-xs text-[#C9A0A6]">{it.sku}</div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border rounded-full">
                        <button onClick={() => setQty(it.id, it.qty - 1)} className="px-2 py-1"><Minus size={12} /></button>
                        <span className="px-2 text-sm">{it.qty}</span>
                        <button onClick={() => setQty(it.id, it.qty + 1)} className="px-2 py-1"><Plus size={12} /></button>
                      </div>
                      <span className="font-semibold text-sm">${(price * it.qty).toFixed(2)}</span>
                    </div>
                  </div>
                  <button onClick={() => removeFromCart(it.id)} className="text-[#C9A0A6] hover:text-red-500 self-start"><Trash2 size={16} /></button>
                </div>
              );
            })
          )}
          {items.length > 0 && <button onClick={clearCart} className="text-xs text-red-500 font-medium">{t.clearBasket}</button>}
        </div>
        {items.length > 0 && (
          <div className="border-t p-4 space-y-2">
            <div className="flex justify-between text-sm"><span>{t.subtotal}</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-sm"><span>{t.delivery}</span><span>${deliveryFee.toFixed(2)}</span></div>
            <div className="flex justify-between font-bold text-lg pt-1 border-t"><span>{t.total}</span><span>${total.toFixed(2)}</span></div>
            <div className="grid gap-2 pt-2">
              <button onClick={onCheckout} className="bg-[#3A2E30] text-white font-semibold py-3 rounded-full">{t.proceedCheckout}</button>
              <button onClick={onWhatsapp} className="bg-[#25D366] text-white font-semibold py-3 rounded-full flex items-center justify-center gap-2"><MessageCircle size={18} /> {t.orderVia}</button>
              <button onClick={onClose} className="text-sm font-medium text-[#8A5A63] py-1">{t.continueShopping}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CheckoutModal({ t, isAr, areas, deliveryArea, setDeliveryArea, subtotal, deliveryFee, total, onClose, onConfirm }) {
  const [form, setForm] = useState({ name: "", phone: "", whatsapp: "", address: "", notes: "" });
  function update(k, v) { setForm((f) => ({ ...f, [k]: v })); }
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white w-full max-w-md rounded-2xl max-h-[92vh] overflow-y-auto scrollbar-thin body-font" dir={isAr ? "rtl" : "ltr"} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
          <h3 className="font-bold text-lg heading-font">{t.checkout}</h3>
          <button onClick={onClose}><X size={22} /></button>
        </div>
        <div className="p-4 space-y-3">
          <Field label={t.name} value={form.name} onChange={(v) => update("name", v)} />
          <Field label={t.phone} value={form.phone} onChange={(v) => update("phone", v)} />
          <Field label={t.wa} value={form.whatsapp} onChange={(v) => update("whatsapp", v)} />
          <div>
            <label className="text-xs font-semibold text-[#B98A90] mb-1 block">{t.area}</label>
            <select value={deliveryArea} onChange={(e) => setDeliveryArea(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
              {areas.map((a) => <option key={a.name} value={a.name}>{isAr ? a.ar : a.name} (${a.fee})</option>)}
            </select>
          </div>
          <Field label={t.address} value={form.address} onChange={(v) => update("address", v)} textarea />
          <Field label={t.notes} value={form.notes} onChange={(v) => update("notes", v)} textarea optional />
          <div className="border-t pt-3 space-y-1">
            <div className="flex justify-between text-sm"><span>{t.subtotal}</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-sm"><span>{t.delivery}</span><span>${deliveryFee.toFixed(2)}</span></div>
            <div className="flex justify-between font-bold"><span>{t.total}</span><span>${total.toFixed(2)}</span></div>
          </div>
          <button
            onClick={() => onConfirm({ ...form, area: isAr ? areas.find((a) => a.name === deliveryArea)?.ar : deliveryArea })}
            disabled={!form.name || !form.phone || !form.address}
            className="w-full bg-[#25D366] text-white font-semibold py-3 rounded-full flex items-center justify-center gap-2 disabled:bg-neutral-300"
          >
            <MessageCircle size={18} /> {t.confirmWa}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, textarea, optional }) {
  return (
    <div>
      <label className="text-xs font-semibold text-[#B98A90] mb-1 block">{label}{!optional && " *"}</label>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={2} className="w-full border rounded-lg px-3 py-2 text-sm resize-none" />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
      )}
    </div>
  );
}

function WhySection({ t }) {
  const items = [
    { icon: <Heart />, title: t.q1, desc: t.q1d },
    { icon: <Package />, title: t.q2, desc: t.q2d },
    { icon: <MapPin />, title: t.q3, desc: t.q3d },
    { icon: <MessageCircle />, title: t.q4, desc: t.q4d },
    { icon: <Gift />, title: t.q5, desc: t.q5d },
  ];
  return (
    <section className="bg-[#3A2E30] text-white py-14">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <h2 className="text-2xl font-semibold mb-8 heading-font">{t.why}</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-5 gap-6">
          {items.map((it, i) => (
            <div key={i}>
              <div className="text-[#E9B8A8] mb-3">{it.icon}</div>
              <div className="font-semibold mb-1 body-font">{it.title}</div>
              <div className="text-sm text-white/70 body-font">{it.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer({ t, isAr, settings, categories, onAdminClick }) {
  return (
    <footer className="bg-[#2A2022] text-white/70 body-font">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 grid sm:grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <div className="text-white font-semibold text-lg mb-2 heading-font">Dreamy Finds By Celia</div>
          <p className="text-sm leading-relaxed">{t.aboutText}</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">{t.products}</h4>
          <ul className="space-y-1.5 text-sm max-h-40 overflow-y-auto scrollbar-thin">{categories.slice(0, 8).map((c) => <li key={c.en}>{isAr ? c.ar : c.en}</li>)}</ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">{t.contact}</h4>
          <ul className="space-y-1.5 text-sm">
            <li className="flex items-center gap-2"><Phone size={14} /> {settings.phone}</li>
            <li className="flex items-center gap-2"><MessageCircle size={14} /> {settings.whatsapp}</li>
            <li className="flex items-center gap-2"><MapPin size={14} /> {settings.address}</li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">{isAr ? "روابط" : "Links"}</h4>
          <ul className="space-y-1.5 text-sm">
            <li><button className="hover:text-white">{t.terms}</button></li>
            <li><button className="hover:text-white">{t.privacy}</button></li>
            <li><button onClick={onAdminClick} className="hover:text-white flex items-center gap-1"><Lock size={12} /> {t.admin}</button></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs">© {new Date().getFullYear()} Dreamy Finds By Celia. {isAr ? "جميع الحقوق محفوظة" : "All rights reserved."}</div>
    </footer>
  );
}

/* ---------------- Admin panel ---------------- */

const ADMIN_PASSWORD = "admin123";

function AdminPanel({ t, isAr, products, settings, onSaveProducts, onSaveSettings, onExit, categories }) {
  const [authed, setAuthed] = useState(false);
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState("");
  const [tab, setTab] = useState("products");
  const [editing, setEditing] = useState(null);
  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => setLocalSettings(settings), [settings]);

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#2A2022] p-4">
        <div className="bg-white rounded-2xl p-8 w-full max-w-sm body-font">
          <div className="flex items-center gap-2 mb-6"><Lock className="text-[#C97B84]" /><h2 className="text-xl font-bold heading-font">Admin Login</h2></div>
          <input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} placeholder="Password" className="w-full border rounded-lg px-3 py-2 mb-2 text-sm" onKeyDown={(e) => e.key === "Enter" && (pwd === ADMIN_PASSWORD ? setAuthed(true) : setError("Incorrect password"))} />
          {error && <div className="text-red-500 text-xs mb-2">{error}</div>}
          <p className="text-xs text-neutral-400 mb-4">Demo password: <code className="bg-neutral-100 px-1">admin123</code></p>
          <div className="flex gap-2">
            <button onClick={onExit} className="flex-1 border rounded-full py-2 text-sm font-medium">Back to Store</button>
            <button onClick={() => (pwd === ADMIN_PASSWORD ? setAuthed(true) : setError("Incorrect password"))} className="flex-1 bg-[#3A2E30] text-white rounded-full py-2 text-sm font-medium">Login</button>
          </div>
        </div>
      </div>
    );
  }

  function deleteProduct(id) { onSaveProducts(products.filter((p) => p.id !== id)); }
  function upsertProduct(p) {
    const exists = products.some((x) => x.id === p.id);
    const next = exists ? products.map((x) => (x.id === p.id ? p : x)) : [...products, p];
    onSaveProducts(next);
    setEditing(null);
  }

  return (
    <div className="min-h-screen bg-[#FFF8F4] body-font">
      <div className="bg-[#3A2E30] text-white px-4 md:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold heading-font"><LayoutGrid size={18} className="text-[#E9B8A8]" /> Dreamy Finds — Admin</div>
        <button onClick={onExit} className="flex items-center gap-1 text-sm bg-white/10 px-3 py-1.5 rounded-full"><ArrowLeft size={14} /> Back to Store</button>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        <div className="flex gap-2 mb-6">
          {["products", "settings"].map((tb) => (
            <button key={tb} onClick={() => setTab(tb)} className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${tab === tb ? "bg-[#3A2E30] text-white" : "bg-white border"}`}>{tb}</button>
          ))}
        </div>

        {tab === "products" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Products ({products.length})</h2>
              <button onClick={() => setEditing("new")} className="bg-[#C9A86A] text-white font-semibold px-4 py-2 rounded-full text-sm flex items-center gap-1"><Plus size={16} /> Add Product</button>
            </div>
            <div className="bg-white rounded-2xl overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#FBEFEA] text-left">
                  <tr><th className="p-3">Image</th><th className="p-3">Name</th><th className="p-3">SKU</th><th className="p-3">Category</th><th className="p-3">Price</th><th className="p-3">Stock</th><th className="p-3"></th></tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="border-t">
                      <td className="p-3"><img src={img(p.sku)} className="w-10 h-10 object-cover rounded-lg" alt="" /></td>
                      <td className="p-3 font-medium">{p.nameEn}</td>
                      <td className="p-3 text-[#8A5A63]">{p.sku}</td>
                      <td className="p-3 text-[#8A5A63]">{p.category}</td>
                      <td className="p-3">${p.sale ?? p.price}</td>
                      <td className="p-3">{p.stock}</td>
                      <td className="p-3 flex gap-2">
                        <button onClick={() => setEditing(p)} className="text-xs bg-[#FBEFEA] px-2 py-1 rounded-full">Edit</button>
                        <button onClick={() => deleteProduct(p.id)} className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-full">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "settings" && (
          <div className="bg-white rounded-2xl p-6 max-w-lg space-y-3">
            <h2 className="text-lg font-bold mb-2">Store Settings</h2>
            <Field label="WhatsApp Number (no +, e.g. 96178718933)" value={localSettings.whatsapp} onChange={(v) => setLocalSettings((s) => ({ ...s, whatsapp: v }))} />
            <Field label="Phone" value={localSettings.phone} onChange={(v) => setLocalSettings((s) => ({ ...s, phone: v }))} />
            <Field label="Opening Hours" value={localSettings.hours} onChange={(v) => setLocalSettings((s) => ({ ...s, hours: v }))} />
            <Field label="Address" value={localSettings.address} onChange={(v) => setLocalSettings((s) => ({ ...s, address: v }))} />
            <button onClick={() => onSaveSettings(localSettings)} className="bg-[#3A2E30] text-white px-4 py-2 rounded-full text-sm font-medium">Save Settings</button>
          </div>
        )}
      </div>

      {editing && <ProductEditor product={editing === "new" ? null : editing} categories={categories} onCancel={() => setEditing(null)} onSave={upsertProduct} />}
    </div>
  );
}

function ProductEditor({ product, categories, onCancel, onSave }) {
  const [form, setForm] = useState(
    product || { id: "p" + Date.now(), sku: "", brand: "Dreamy Finds", category: categories[0].en, nameEn: "", nameAr: "", price: 0, sale: null, stock: 0, featured: false, bestSeller: false, isNew: false, desc: "", specs: "" }
  );
  function u(k, v) { setForm((f) => ({ ...f, [k]: v })); }
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 body-font" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-bold text-lg mb-4">{product ? "Edit Product" : "Add Product"}</h3>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Name (EN)" value={form.nameEn} onChange={(v) => u("nameEn", v)} />
          <Field label="Name (AR)" value={form.nameAr} onChange={(v) => u("nameAr", v)} />
          <Field label="SKU" value={form.sku} onChange={(v) => u("sku", v)} />
          <Field label="Brand" value={form.brand} onChange={(v) => u("brand", v)} />
          <div>
            <label className="text-xs font-semibold text-[#B98A90] mb-1 block">Category</label>
            <select value={form.category} onChange={(e) => u("category", e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
              {categories.map((c) => <option key={c.en} value={c.en}>{c.en}</option>)}
            </select>
          </div>
          <Field label="Stock" value={String(form.stock)} onChange={(v) => u("stock", Number(v) || 0)} />
          <Field label="Price ($)" value={String(form.price)} onChange={(v) => u("price", Number(v) || 0)} />
          <Field label="Sale Price ($, optional)" value={form.sale ?? ""} onChange={(v) => u("sale", v === "" ? null : Number(v))} optional />
        </div>
        <div className="mt-3"><Field label="Description" value={form.desc} onChange={(v) => u("desc", v)} textarea /></div>
        <div className="mt-3"><Field label="Details" value={form.specs} onChange={(v) => u("specs", v)} textarea optional /></div>
        <div className="flex gap-4 mt-3 text-sm">
          <label className="flex items-center gap-1.5"><input type="checkbox" checked={form.featured} onChange={(e) => u("featured", e.target.checked)} /> Featured</label>
          <label className="flex items-center gap-1.5"><input type="checkbox" checked={form.bestSeller} onChange={(e) => u("bestSeller", e.target.checked)} /> Best Seller</label>
          <label className="flex items-center gap-1.5"><input type="checkbox" checked={form.isNew} onChange={(e) => u("isNew", e.target.checked)} /> New</label>
        </div>
        <div className="flex gap-2 mt-6">
          <button onClick={onCancel} className="flex-1 border rounded-full py-2 text-sm font-medium">Cancel</button>
          <button onClick={() => onSave(form)} disabled={!form.nameEn || !form.sku} className="flex-1 bg-[#3A2E30] text-white rounded-full py-2 text-sm font-medium disabled:bg-neutral-300">Save</button>
        </div>
      </div>
    </div>
  );
}
