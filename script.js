/* Upgraded JS: working slider (images + video), nav toggle, forms wired to Firebase helpers,
   stats counter, scroll reveals, full i18n that applies globally. */

/* ---------- NAV TOGGLE ---------- */
const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('.site-nav');
if (navToggle) {
  navToggle.addEventListener('click', () => {
    const open = siteNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
  });
  // close when clicking a link
  document.querySelectorAll('.site-nav a').forEach(a => a.addEventListener('click', () => siteNav.classList.remove('open')));
}

/* ---------- HERO SLIDER ---------- */
const slides = Array.from(document.querySelectorAll('.slide'));
const nextBtn = document.querySelector('.slider-arrow.next');
const prevBtn = document.querySelector('.slider-arrow.prev');
const dotsWrap = document.querySelector('.slider-dots');
let current = 0;
let autoplay = true;
let intervalMs = 5000;
let autoplayId = null;

function initDots(){
  slides.forEach((s,i) => {
    const b = document.createElement('button');
    b.className = (i===0)?'active':'';
    b.setAttribute('aria-label', `Slide ${i+1}`);
    b.dataset.index = i;
    b.addEventListener('click', ()=> goTo(i));
    dotsWrap.appendChild(b);
  });
}
function goTo(i){
  slides[current].classList.remove('active');
  dotsWrap.children[current].classList.remove('active');
  current = (i + slides.length) % slides.length;
  slides[current].classList.add('active');
  dotsWrap.children[current].classList.add('active');
  manageMedia();
  resetAuto();
}
function nextSlide(){ goTo(current + 1); }
function prevSlide(){ goTo(current - 1); }
if (nextBtn) nextBtn.addEventListener('click', nextSlide);
if (prevBtn) prevBtn.addEventListener('click', prevSlide);

initDots();
function startAuto(){ autoplayId = setInterval(()=> nextSlide(), intervalMs); }
function resetAuto(){ if (autoplayId) clearInterval(autoplayId); if (autoplay) startAuto(); }
startAuto();

// pause on hover
const heroEl = document.getElementById('heroSlider');
if (heroEl) {
  heroEl.addEventListener('mouseenter', ()=> { autoplay = false; clearInterval(autoplayId); });
  heroEl.addEventListener('mouseleave', ()=> { autoplay = true; resetAuto(); });
}

// Ensure video plays only when its slide is active
function manageMedia(){
  slides.forEach(sl => {
    const vid = sl.querySelector('video');
    if (vid) {
      if (sl.classList.contains('active')) {
        vid.play().catch(()=>{ /* autoplay blocked or not allowed — muted is set */ });
      } else {
        vid.pause(); try { vid.currentTime = 0; } catch(e) {}
      }
    }
  });
}
manageMedia();
// observe slide class changes to trigger media - simple MutationObserver
const observer = new MutationObserver(manageMedia);
observer.observe(document.querySelector('.hero-slider'), { attributes: true, subtree: true, attributeFilter: ['class'] });

/* ---------- SCROLL REVEALS ---------- */
const reveals = document.querySelectorAll('.reveal-on-scroll');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in-view'); revealObserver.unobserve(e.target); }
  });
}, { threshold: 0.18 });
reveals.forEach(r => revealObserver.observe(r));

/* ---------- STATS COUNTER ---------- */
function animateCount(el, to) {
  let start = 0;
  const duration = 1500;
  const stepTime = Math.max(20, Math.floor(duration / to));
  const step = () => {
    start += Math.ceil(to / (duration / 30));
    if (start >= to) { el.textContent = to; }
    else { el.textContent = start; requestAnimationFrame(step); }
  };
  requestAnimationFrame(step);
}
const statEls = document.querySelectorAll('.stat-number');
const statObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const el = e.target;
      const to = parseInt(el.dataset.count, 10) || 0;
      animateCount(el, to);
      statObserver.unobserve(el);
    }
  });
}, { threshold: 0.25 });
statEls.forEach(el => statObserver.observe(el));

/* ---------- YEAR ---------- */
document.getElementById('year').textContent = new Date().getFullYear();

/* ---------- FORMS (uses window.saveContact & saveNewsletter from firebase wrapper) ---------- */
async function handleFormSubmit(form, noteId, isNewsletter=false) {
  const note = document.getElementById(noteId);
  const data = Object.fromEntries(new FormData(form).entries());

  if (isNewsletter) {
    const email = data.email || '';
    if (!email) { note.textContent = 'Enter a valid email.'; return; }
    note.textContent = 'Subscribing...';
    const res = await window.saveNewsletter ? window.saveNewsletter(email) : { ok: false, error: 'no-fb' };
    note.textContent = res.ok ? 'Thanks — subscribed!' : 'Subscription failed.';
    form.reset();
    setTimeout(()=> note.textContent = '', 3500);
    return;
  }

  if (!data.name || !data.email || !data.message) { note.textContent = 'Please fill required fields.'; return; }
  note.textContent = 'Sending...';
  const res = await window.saveContact ? window.saveContact(data) : { ok: false, error: 'no-fb' };
  if (res.ok) { note.textContent = 'Thank you — message received.'; form.reset(); } 
  else { note.textContent = 'Error sending — try again later.'; }
  setTimeout(()=> note.textContent = '', 4500);
}

const contactForm = document.getElementById('contactForm');
if (contactForm) contactForm.addEventListener('submit', (e)=> { e.preventDefault(); handleFormSubmit(contactForm, 'contactNote', false); });

const footerForm = document.getElementById('footerContact');
if (footerForm) footerForm.addEventListener('submit', (e)=> { e.preventDefault(); handleFormSubmit(footerForm, 'footerNote', false); });

const newsletterForm = document.getElementById('newsletterForm');
if (newsletterForm) newsletterForm.addEventListener('submit', (e)=> { e.preventDefault(); handleFormSubmit(newsletterForm, 'newsletterNote', true); });

/* ---------- I18N (global dictionary, applies to any page that uses same data-i18n keys) ---------- */
const translations = {
  en: {
    "nav.home":"Home","nav.about":"About","nav.values":"Values","nav.facts":"Facts","nav.featured":"Featured","nav.products":"Products","nav.contact":"Contact","nav.cta":"Contact",
    "hero.title":"Abundant Fruits Co. Ltd.","hero.tagline":"From our fields to global markets — fresh, sustainable produce.","btn.explore":"Discover our products","btn.about":"About us",
    "about.kicker":"Welcome to Abundant Fruits","about.title":"ABOUT US","about.p1":"Abundant Fruits Co. Ltd. partners with smallholder farmers to bring high-quality, traceable fruits and specialty crops to international buyers.","about.p2":"We combine modern post-harvest handling with ethical sourcing to protect both product quality and local communities.",
    "values.title":"OUR VALUES — BEST","values.sub":"Betterment • Efficiency • Sustainability • Trust","values.better":"Betterment","values.better.text":"Continuous improvement across farm practices and post-harvest care to ensure quality.","values.efficiency":"Efficiency","values.efficiency.text":"Optimized operations and logistics keep produce fresh and costs predictable.","values.sustainability":"Sustainability","values.sustainability.text":"Responsible sourcing that cares for soil, water and farmer livelihoods.","values.trust":"Trust","values.trust.text":"Transparent agreements, traceability and certifications you can rely on.",
    "stat.farms":"Farms","stat.hectares":"Hectares","stat.awards":"Certified Awards",
    "fruit.banana":"Banana","fruit.tomato":"Tomato","fruit.pineapple":"Pineapple","fruit.mango":"Mango","fruit.avocado":"Avocado",
    "products.title":"Product Lines","cat.fresh":"Fresh Fruits","cat.fresh.text":"Seasonal varieties sourced from partner farms, packed and shipped with strict QC.","cat.processed":"Processed Fruits","cat.processed.text":"Frozen, dried, and purees — consistent specs for retail and industrial buyers.","cat.nuts":"Nuts","cat.nuts.text":"Cashews, peanuts, and specialty nuts graded for size, moisture, and flavor.","cat.spices":"Spices & Condiments","cat.spices.text":"Ginger, turmeric, pepper, and curated spice mixes with verified origins.",
    "read.more":"Read more","newsletter.title":"Subscribe to our newsletter","newsletter.text":"Fresh updates on harvests, pricing, and certifications.","newsletter.placeholder":"Enter your email","newsletter.subscribe":"Subscribe",
    "contact.title":"Contact Us","contact.name":"Name","contact.email":"Email","contact.company":"Company Name","contact.message":"Message","contact.send":"Send Message",
    "footer.sitemap":"Site Map","footer.visit":"Visit","footer.hours":"Mon–Fri: 8:30–17:30","footer.quick":"Quick Message"
  },
  vi: {
    "nav.home":"Trang chủ","nav.about":"Về chúng tôi","nav.values":"Giá trị","nav.facts":"Số liệu","nav.featured":"Nổi bật","nav.products":"Sản phẩm","nav.contact":"Liên hệ","nav.cta":"Liên hệ",
    "hero.title":"Abundant Fruits Co. Ltd.","hero.tagline":"Từ nông trại đến thị trường toàn cầu — sản phẩm tươi, bền vững.","btn.explore":"Khám phá sản phẩm","btn.about":"Về chúng tôi",
    "about.kicker":"Chào mừng đến với Abundant Fruits","about.title":"VỀ CHÚNG TÔI","about.p1":"Abundant Fruits hợp tác với các nông hộ để cung cấp trái cây chất lượng cao, truy xuất nguồn gốc cho khách hàng quốc tế.","about.p2":"Chúng tôi kết hợp quy trình hậu thu hoạch hiện đại với nguồn cung hữu trách để bảo vệ chất lượng sản phẩm và cộng đồng địa phương.",
    "values.title":"GIÁ TRỊ — BEST","values.sub":"Cải tiến • Hiệu quả • Bền vững • Tin cậy","values.better":"Cải tiến","values.better.text":"Cải thiện liên tục các thực hành nông nghiệp và xử lý sau thu hoạch để đảm bảo chất lượng.","values.efficiency":"Hiệu quả","values.efficiency.text":"Tối ưu vận hành và logistics để giữ độ tươi và chi phí ổn định.","values.sustainability":"Bền vững","values.sustainability.text":"Nguồn cung có trách nhiệm chăm sóc đất, nước và sinh kế nông dân.","values.trust":"Tin cậy","values.trust.text":"Thoả thuận minh bạch, truy xuất nguồn gốc và chứng nhận đáng tin cậy.",
    "stat.farms":"Nông trại","stat.hectares":"Hecta","stat.awards":"Chứng nhận",
    "fruit.banana":"Chuối","fruit.tomato":"Cà chua","fruit.pineapple":"Dứa","fruit.mango":"Xoài","fruit.avocado":"Bơ",
    "products.title":"Dòng sản phẩm","cat.fresh":"Trái tươi","cat.fresh.text":"Các loại theo mùa từ nông hộ đối tác, đóng gói và vận chuyển theo quy chuẩn QC.","cat.processed":"Trái chế biến","cat.processed.text":"Đông lạnh, sấy, và tinh chế — tiêu chuẩn ổn định cho bán lẻ/ công nghiệp.","cat.nuts":"Hạt","cat.nuts.text":"Hạt điều, lạc, và các loại hạt đặc sản phân loại theo kích thước và độ ẩm.","cat.spices":"Gia vị & Gia vị chế biến","cat.spices.text":"Gừng, nghệ, tiêu và các hỗn hợp gia vị có nguồn gốc xác minh.",
    "read.more":"Xem thêm","newsletter.title":"Đăng ký nhận tin","newsletter.text":"Cập nhật thu hoạch, giá cả và chứng nhận.","newsletter.placeholder":"Nhập email của bạn","newsletter.subscribe":"Đăng ký",
    "contact.title":"Liên hệ","contact.name":"Họ & Tên","contact.email":"Email","contact.company":"Tên công ty","contact.message":"Tin nhắn","contact.send":"Gửi",
    "footer.sitemap":"Sơ đồ trang","footer.visit":"Địa chỉ","footer.hours":"Thứ Hai–Thứ Sáu: 8:30–17:30","footer.quick":"Tin nhắn nhanh"
  },
  es: {
    "nav.home":"Inicio","nav.about":"Sobre","nav.values":"Valores","nav.facts":"Datos","nav.featured":"Destacados","nav.products":"Productos","nav.contact":"Contacto","nav.cta":"Contacto",
    "hero.title":"Abundant Fruits Co. Ltd.","hero.tagline":"Desde nuestros campos a mercados globales — productos frescos y sostenibles.","btn.explore":"Descubre nuestros productos","btn.about":"Sobre nosotros",
    "about.kicker":"Bienvenido a Abundant Fruits","about.title":"SOBRE NOSOTROS","about.p1":"Abundant Fruits se asocia con pequeños agricultores para llevar frutas y cultivos especiales de alta calidad a compradores internacionales.","about.p2":"Combinamos manejo poscosecha moderno con abastecimiento ético para proteger la calidad del producto y las comunidades locales.",
    "values.title":"NUESTROS VALORES — BEST","values.sub":"Mejora • Eficiencia • Sostenibilidad • Confianza","values.better":"Mejora","values.better.text":"Mejora continua en prácticas agrícolas y poscosecha para asegurar calidad.","values.efficiency":"Eficiencia","values.efficiency.text":"Operaciones y logística optimizadas para mantener frescura y costos predecibles.","values.sustainability":"Sostenibilidad","values.sustainability.text":"Abastecimiento responsable que cuida la tierra, el agua y los medios de vida.","values.trust":"Confianza","values.trust.text":"Acuerdos transparentes y certificaciones confiables.",
    "stat.farms":"Granjas","stat.hectares":"Hectáreas","stat.awards":"Certificaciones",
    "fruit.banana":"Banano","fruit.tomato":"Tomate","fruit.pineapple":"Piña","fruit.mango":"Mango","fruit.avocado":"Aguacate",
    "products.title":"Líneas de producto","cat.fresh":"Frutas frescas","cat.fresh.text":"Variedades de temporada de granjas asociadas, empacadas y enviadas con control de calidad.","cat.processed":"Frutas procesadas","cat.processed.text":"Congelado, deshidratado y purés — especificaciones consistentes para venta y industria.","cat.nuts":"Frutos secos","cat.nuts.text":"Anacardos, cacahuetes y frutos secos especiales clasificados por tamaño y humedad.","cat.spices":"Especias & Condimentos","cat.spices.text":"Jengibre, cúrcuma, pimienta y mezclas con orígenes verificados.",
    "read.more":"Leer más","newsletter.title":"Suscríbete","newsletter.text":"Actualizaciones sobre cosechas, precios y certificaciones.","newsletter.placeholder":"Introduce tu correo","newsletter.subscribe":"Suscribirse",
    "contact.title":"Contáctanos","contact.name":"Nombre","contact.email":"Correo","contact.company":"Empresa","contact.message":"Mensaje","contact.send":"Enviar",
    "footer.sitemap":"Mapa del sitio","footer.visit":"Visítanos","footer.hours":"Lun–Vie: 8:30–17:30","footer.quick":"Mensaje rápido"
  },
  fr: {
    "nav.home":"Accueil","nav.about":"À propos","nav.values":"Valeurs","nav.facts":"Chiffres","nav.featured":"En vedette","nav.products":"Produits","nav.contact":"Contact","nav.cta":"Contact",
    "hero.title":"Abundant Fruits Co. Ltd.","hero.tagline":"De nos champs aux marchés mondiaux — produits frais et durables.","btn.explore":"Découvrir nos produits","btn.about":"À propos",
    "about.kicker":"Bienvenue chez Abundant Fruits","about.title":"À PROPOS DE NOUS","about.p1":"Abundant Fruits s'associe à des petits exploitants pour fournir des fruits et cultures spéciales de haute qualité aux acheteurs internationaux.","about.p2":"Nous combinons une gestion post-récolte moderne avec un approvisionnement éthique pour protéger qualité et communautés locales.",
    "values.title":"NOS VALEURS — BEST","values.sub":"Amélioration • Efficacité • Durabilité • Confiance","values.better":"Amélioration","values.better.text":"Améliorations continues des pratiques agricoles et post-récolte pour garantir la qualité.","values.efficiency":"Efficacité","values.efficiency.text":"Opérations et logistique optimisées pour maintenir la fraîcheur et des coûts prévisibles.","values.sustainability":"Durabilité","values.sustainability.text":"Approvisionnement responsable qui protège sol, eau et moyens de subsistance.","values.trust":"Confiance","values.trust.text":"Accords transparents, traçabilité et certifications fiables.",
    "stat.farms":"Fermes","stat.hectares":"Hectares","stat.awards":"Certifications",
    "fruit.banana":"Banane","fruit.tomato":"Tomate","fruit.pineapple":"Ananas","fruit.mango":"Mangue","fruit.avocado":"Avocat",
    "products.title":"Gammes de produits","cat.fresh":"Fruits frais","cat.fresh.text":"Variétés saisonnières provenant de fermes partenaires, emballées et expédiées avec contrôle qualité.","cat.processed":"Fruits transformés","cat.processed.text":"Congelé, séché et purées — spécifications cohérentes pour vente et industrie.","cat.nuts":"Noix","cat.nuts.text":"Noix de cajou, cacahuètes et noix spécialisées triées par taille et humidité.","cat.spices":"Épices & Condiments","cat.spices.text":"Gingembre, curcuma, poivre et mélanges avec origines vérifiées.",
    "read.more":"En savoir plus","newsletter.title":"Abonnez-vous","newsletter.text":"Mises à jour sur récoltes, prix et certifications.","newsletter.placeholder":"Entrez votre email","newsletter.subscribe":"S'abonner",
    "contact.title":"Contactez-nous","contact.name":"Nom","contact.email":"Email","contact.company":"Entreprise","contact.message":"Message","contact.send":"Envoyer",
    "footer.sitemap":"Plan du site","footer.visit":"Nous rendre visite","footer.hours":"Lun–Ven: 8:30–17:30","footer.quick":"Message rapide"
  },
  zh: {
    "nav.home":"首页","nav.about":"关于","nav.values":"价值观","nav.facts":"数据","nav.featured":"精选","nav.products":"产品","nav.contact":"联系","nav.cta":"联系",
    "hero.title":"Abundant Fruits 有限公司","hero.tagline":"从我们的农田到全球市场 — 新鲜、可持续的农产品。","btn.explore":"探索我们的产品","btn.about":"关于我们",
    "about.kicker":"欢迎来到 Abundant Fruits","about.title":"关于我们","about.p1":"Abundant Fruits 与小农户合作，为国际买家提供高质量、可追溯的水果和特色作物。","about.p2":"我们将现代采后处理与道德采购相结合，以保护产品质量和当地社区。",
    "values.title":"我们的价值 — BEST","values.sub":"改进 • 效率 • 可持续 • 信任","values.better":"改进","values.better.text":"在农业实践和采后处理方面持续改进以确保质量。","values.efficiency":"效率","values.efficiency.text":"优化的运营和物流保持新鲜度并使成本可预见。","values.sustainability":"可持续","values.sustainability.text":"负责任的采购保护土壤、水资源和农民生计。","values.trust":"信任","values.trust.text":"透明的合同，可追溯性和可信的认证。",
    "stat.farms":"农场","stat.hectares":"公顷","stat.awards":"认证",
    "fruit.banana":"香蕉","fruit.tomato":"番茄","fruit.pineapple":"菠萝","fruit.mango":"芒果","fruit.avocado":"牛油果",
    "products.title":"产品线","cat.fresh":"新鲜水果","cat.fresh.text":"来自合作农场的季节性品种，按质检标准包装和运输。","cat.processed":"加工水果","cat.processed.text":"冷冻、干燥和果泥——为零售和工业提供一致的规格。","cat.nuts":"坚果","cat.nuts.text":"腰果、花生和特种坚果按大小和水分分级。","cat.spices":"香料与调味品","cat.spices.text":"生姜、姜黄、胡椒和来源可验证的调味混合物。",
    "read.more":"查看更多","newsletter.title":"订阅我们的邮件","newsletter.text":"获取收成、价格和认证的最新信息。","newsletter.placeholder":"输入您的邮箱","newsletter.subscribe":"订阅",
    "contact.title":"联系我们","contact.name":"姓名","contact.email":"电子邮件","contact.company":"公司名称","contact.message":"留言","contact.send":"发送",
    "footer.sitemap":"网站地图","footer.visit":"拜访","footer.hours":"周一–周五：8:30–17:30","footer.quick":"快速留言"
  }
};

// apply a language globally to any elements using data-i18n or data-i18n-placeholder
function applyLanguage(lang) {
  const dict = translations[lang] || translations.en;
  // text nodes
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) el.textContent = dict[key];
  });
  // placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (dict[key]) el.setAttribute('placeholder', dict[key]);
  });
  // also update nav active states if any
  const sel = document.getElementById('langSelect');
  if (sel) sel.value = lang;
  localStorage.setItem('site_lang', lang);
}

// init language on load
const savedLang = localStorage.getItem('site_lang') || (navigator.language || 'en').slice(0,2);
applyLanguage(savedLang);
const langSelect = document.getElementById('langSelect');
if (langSelect) {
  langSelect.value = savedLang;
  langSelect.addEventListener('change', e => applyLanguage(e.target.value));
}

/* ---------- keyboard accessibility for slider ---------- */
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') nextSlide();
  if (e.key === 'ArrowLeft') prevSlide();
});

/* ---------- ensure lazy play of video when active on load ---------- */
document.addEventListener('DOMContentLoaded', () => {
  manageMedia();
});



/* ===== Abundant Upgrades - Corrected JS ===== */

/* Preloader */
(function __abundant_preloader(){ 
  const hide = () => {
    const p = document.getElementById('preloader');
    if (p) {
      p.classList.add('hidden'); // triggers CSS fade-out
      // After fade-out, remove it completely
      setTimeout(() => {
        if (p && p.parentNode) p.parentNode.removeChild(p);
      }, 700);
    }
    // Update footer year if present
    const y = document.getElementById('year');
    if (y) y.textContent = new Date().getFullYear();
  };

  // Make sure it only runs once
  window.addEventListener('load', hide, { once: true });

  // Safety: hide anyway after 5s even if window.load is blocked
  setTimeout(hide, 5000);
})();

/* Hero cross-fade slideshow */
(function __abundant_heroSlider(){ 
  const slides = Array.from(document.querySelectorAll('.hero-slide')); 
  if(!slides.length) return; 
  let idx=0; 
  const tick=()=>{ 
    slides.forEach(s=>s.classList.remove('is-active')); 
    slides[idx].classList.add('is-active'); 
    idx=(idx+1)%slides.length; 
  }; 
  setTimeout(tick,400); 
  setInterval(tick,4500); 
})();

/* Animated counters */
(function __abundant_counters(){ 
  const nodes = document.querySelectorAll('[data-target]'); 
  if(!nodes.length) return; 
  const ease=(t)=>1-Math.pow(1-t,3); 
  nodes.forEach(n=>{ 
    const target=Number(n.getAttribute('data-target')||n.textContent||0); 
    const animate=(duration=1400)=>{ 
      const start=performance.now(); 
      const step=(now)=>{ 
        const p=Math.min(1,(now-start)/duration); 
        n.textContent = Math.floor(target * ease(p)).toLocaleString(); 
        if(p<1) requestAnimationFrame(step); 
      }; 
      requestAnimationFrame(step); 
    }; 
    if('IntersectionObserver' in window){ 
      const io=new IntersectionObserver((es,obs)=>{ 
        es.forEach(e=>{ 
          if(e.isIntersecting){ 
            animate(); 
            obs.unobserve(e.target); 
          } 
        }); 
      },{threshold:0.3}); 
      io.observe(n); 
    } else animate(); 
  }); 
})();

/* Parallax background opacity */
(function __abundant_parallax(){ 
  const secs = document.querySelectorAll('.parallax'); 
  if(!secs.length) return; 
  const onScroll=()=>{ 
    const vh=window.innerHeight; 
    secs.forEach(sec=>{ 
      const rect=sec.getBoundingClientRect(); 
      const mid=rect.top + rect.height/2; 
      const dist=Math.abs(vh/2 - mid); 
      const dampen=Math.max(0.65, 1 - (dist / (vh * 1.2))); 
      sec.style.opacity = String(dampen); 
    }); 
  }; 
  document.addEventListener('scroll', onScroll, {passive:true}); 
  onScroll(); 
})();

/* Demo Add-to-cart */
document.addEventListener('click', (e)=>{ 
  const btn = e.target.closest('.add-to-cart, .btn.add-to-cart, button[data-add]'); 
  if(!btn) return; 
  const card = btn.closest('.product, .product-card'); 
  const name = card?.querySelector('h3, h2, .title')?.textContent?.trim() || 'Item'; 
  alert(name + ' added to cart (demo)'); 
});
