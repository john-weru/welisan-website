(function(){
    const $ = (sel, root=document) => root.querySelector(sel);
    const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

    // Footer year
    $("#year").textContent = new Date().getFullYear();

    // Mobile nav
    const menuBtn = $("#menuBtn");
    const mobilePanel = $("#mobilePanel");
    const toggleMobile = () => {
    const open = !mobilePanel.classList.contains("open");
    mobilePanel.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    };
    if(menuBtn){
    menuBtn.addEventListener("click", toggleMobile);
    }
    $$(".mLink").forEach(a => a.addEventListener("click", () => {
    mobilePanel.classList.remove("open");
    menuBtn.setAttribute("aria-expanded", "false");
    }));

    // Smooth scroll to services
    $("#scrollServices").addEventListener("click", () => {
    const el = $("#services");
    if(el) el.scrollIntoView({behavior:"smooth", block:"start"});
    });

    // Back to top
    const toTop = $("#toTop");
    const onScroll = () => {
    const show = window.scrollY > 700;
    toTop.classList.toggle("show", show);
    };
    window.addEventListener("scroll", onScroll, {passive:true});
    toTop.addEventListener("click", () => window.scrollTo({top:0, behavior:"smooth"}));

    // Reveal animations
    const revealEls = $$(".reveal");
    const io = ("IntersectionObserver" in window) ? new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if(e.isIntersecting){
        e.target.classList.add("on");
        io.unobserve(e.target);
        }
    });
    }, {threshold: 0.12}) : null;

    revealEls.forEach(el => {
    if(!io){ el.classList.add("on"); return; }
    io.observe(el);
    });

    // Count-up stats
    const countEls = $$("[data-count]");
    const animateCount = (el) => {
    const target = parseInt(el.getAttribute("data-count"), 10);
    if(!Number.isFinite(target)) return;
    const isReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = isReduced ? 1 : 900;
    const start = performance.now();
    const from = 0;
    const tick = (t) => {
        const p = Math.min(1, (t - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = Math.round(from + (target - from) * eased);
        el.textContent = String(val);
        if(p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    };

    if("IntersectionObserver" in window && countEls.length){
    const cio = new IntersectionObserver((entries) => {
        entries.forEach(e => {
        if(e.isIntersecting){
            const el = e.target;
            animateCount(el);
            cio.unobserve(el);
        }
        });
    }, {threshold: 0.5});
    countEls.forEach(el => cio.observe(el));
    } else {
    countEls.forEach(animateCount);
    }

    // Toast
    const toast = $("#toast");
    const toastMsg = $("#toastMsg");
    const toastClose = $("#toastClose");
    let toastTimer = null;

    function showToast(msg){
    toastMsg.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 4200);
    }
    toastClose.addEventListener("click", ()=> toast.classList.remove("show"));

    // Modal
    const modalOverlay = $("#modalOverlay");
    const modalClose = $("#modalClose");
    const openQuoteButtons = [$("#openQuote"), $("#openQuote2"), $("#openQuote3")].filter(Boolean);
    const qService = $("#q_service");
    const qDetails = $("#q_details");
    let lastFocus = null;

    function openModal(service, details){
    lastFocus = document.activeElement;
    modalOverlay.classList.add("show");
    modalOverlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    if(service){
        qService.value = service;
    }
    if(details){
        qDetails.value = "I'm interested in " + service + ". Please share pricing and next steps.";
    } else if(service && !qDetails.value){
        qDetails.value = "I'm interested in " + service + ". Please share pricing and next steps.";
    }
    setTimeout(() => {
        const first = $("#quoteForm input[name='q_name']");
        first && first.focus();
    }, 20);
    }

    function closeModal(){
    modalOverlay.classList.remove("show");
    modalOverlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if(lastFocus && lastFocus.focus) lastFocus.focus();
    }

    openQuoteButtons.forEach(btn => btn.addEventListener("click", ()=> openModal("","")));
    $("#modalClose").addEventListener("click", closeModal);
    modalOverlay.addEventListener("click", (e) => {
    if(e.target === modalOverlay) closeModal();
    });
    window.addEventListener("keydown", (e) => {
    if(e.key === "Escape" && modalOverlay.classList.contains("show")) closeModal();
    });

    // Open quote with service prefill from buttons
    $$("[data-open-quote]").forEach(btn => {
    btn.addEventListener("click", () => {
        const service = btn.getAttribute("data-open-quote") || "";
        openModal(service, service);
    });
    });

    // Mini cards click -> open modal and prefill service
    $$(".miniCard").forEach(card => {
    const handler = () => openModal(card.getAttribute("data-service") || "General Inquiry", card.getAttribute("data-service") || "General Inquiry");
    card.addEventListener("click", handler);
    card.addEventListener("keydown", (e)=> { if(e.key === "Enter" || e.key === " "){ e.preventDefault(); handler(); }});
    });

    // Work tiles click -> open modal with prefill
    $$(".work").forEach(tile => {
    const handler = () => openModal(tile.getAttribute("data-service") || "General Inquiry", tile.getAttribute("data-prefill") || "");
    tile.addEventListener("click", handler);
    tile.addEventListener("keydown", (e)=> { if(e.key === "Enter" || e.key === " "){ e.preventDefault(); handler(); }});
    });

    // Copy summary
    $("#copySummary").addEventListener("click", async () => {
    const f = new FormData($("#quoteForm"));
    const lines = [
        `Service: ${f.get("q_service") || "-"}`,
        `Name: ${f.get("q_name") || "-"}`,
        `Phone: ${f.get("q_phone") || "-"}`,
        `Location: ${f.get("q_location") || "-"}`,
        `Details: ${f.get("q_details") || "-"}`
    ];
    const text = lines.join("\n");
    try{
        await navigator.clipboard.writeText(text);
        showToast("Copied quote details to clipboard.");
    }catch(err){
        showToast("Copy not available. You can select and copy manually.");
    }
    });

    // Active link highlighting
    const sections = ["services","why","work","faq","contact"].map(id => $("#"+id)).filter(Boolean);
    const navLinks = $$(".navlinks a");
    if("IntersectionObserver" in window && sections.length && navLinks.length){
    const map = new Map(navLinks.map(a => [a.getAttribute("href").slice(1), a]));
    const sio = new IntersectionObserver((entries) => {
        entries.forEach(e => {
        if(e.isIntersecting){
            navLinks.forEach(a => a.removeAttribute("aria-current"));
            const id = e.target.id;
            const link = map.get(id);
            if(link) link.setAttribute("aria-current", "page");
        }
        });
    }, { rootMargin: "-40% 0px -55% 0px", threshold: 0.01 });
    sections.forEach(s => sio.observe(s));
    }

    // Forms (demo validation)
    const contactForm = $("#contactForm");
    const quoteForm = $("#quoteForm");

    function validate(form){
    const requiredFields = $$("[required]", form);
    let ok = true;
    requiredFields.forEach(field => {
        const val = (field.value || "").trim();
        const isSelect = field.tagName === "SELECT";
        if(!val || (isSelect && val === "")){
        ok = false;
        field.style.borderColor = "rgba(239,68,68,.55)";
        }else{
        field.style.borderColor = "rgba(255,255,255,.12)";
        }
    });
    return ok;
    }

    contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if(!validate(contactForm)){
        showToast("Please fill in the required fields.");
        return;
    }
    const f = new FormData(contactForm);
    const service = f.get("service");
    showToast(`Thanks! Your ${service || ""} request was captured (demo). We'll respond soon.`);
    contactForm.reset();
    });

    quoteForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if(!validate(quoteForm)){
        showToast("Please complete the quote form.");
        return;
    }
    const f = new FormData(quoteForm);
    showToast(`Quote request submitted for: ${f.get("q_service") || "service"} (demo).`);
    quoteForm.reset();
    closeModal();
    });

    // Prefill contact form if modal service chosen later
    // (Optional UX) Keep service consistency when modal opens
    modalOverlay.addEventListener("transitionend", () => {}, {passive:true});

    // Close mobile menu on resize up
    window.addEventListener("resize", () => {
    const w = window.innerWidth;
    if(w > 740){
        mobilePanel.classList.remove("open");
        menuBtn.setAttribute("aria-expanded", "false");
    }
    }, {passive:true});

    // Testimonials
    const testimonials = [
    { text: "“The CCTV installation was neat and professional. Remote viewing was set up perfectly and explained clearly.”", name: "Operations Manager", role: "Retail Store" },
    { text: "“Our website looks premium on mobile and loads fast. The process was smooth and communication was clear.”", name: "Business Owner", role: "Local Services" },
    { text: "“Tracker installation was quick and discreet. Alerts and reports work well—great for managing our vehicles.”", name: "Fleet Supervisor", role: "Logistics" }
    ];
    let qIndex = 0;
    const qText = $("#quoteText");
    const qName = $("#quoteName");
    const qRole = $("#quoteRole");

    function renderQuote(){
    const q = testimonials[qIndex];
    qText.textContent = q.text;
    qName.textContent = q.name;
    qRole.textContent = q.role;
    }
    $("#prevQuote").addEventListener("click", () => {
    qIndex = (qIndex - 1 + testimonials.length) % testimonials.length;
    renderQuote();
    });
    $("#nextQuote").addEventListener("click", () => {
    qIndex = (qIndex + 1) % testimonials.length;
    renderQuote();
    });

    // Autoplay (respects reduced motion)
    const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if(!reduced){
    setInterval(() => {
        qIndex = (qIndex + 1) % testimonials.length;
        renderQuote();
    }, 9000);
    }

})();