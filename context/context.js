(function () {
    'use strict';
    console.log("context loaded.");

    // ── ELEMENTS ──────────────────────────────────────────────────────────────
    const nav       = document.getElementById('ctxNav');
    const progress  = document.getElementById('ctxProgress');
    const navLinks  = document.querySelectorAll('.ctx-nav-link');
    const sections  = document.querySelectorAll('.ctx-section');
    const reveals   = document.querySelectorAll('[data-reveal]');

    // ── SCROLL PROGRESS BAR ───────────────────────────────────────────────────
    function updateProgress() {
        const scrollTop    = window.scrollY;
        const docHeight    = document.documentElement.scrollHeight - window.innerHeight;
        const pct          = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        progress.style.width = pct + '%';
    }

    // ── NAV: scrolled state ───────────────────────────────────────────────────
    function updateNav() {
        if (window.scrollY > 60) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    }

    // ── ACTIVE SECTION HIGHLIGHT ──────────────────────────────────────────────
    function updateActiveSection() {
        const mid = window.scrollY + window.innerHeight * 0.4;

        let currentId = '';
        sections.forEach(function (sec) {
            if (sec.offsetTop <= mid) {
                currentId = sec.id;
            }
        });

        navLinks.forEach(function (link) {
            if (link.dataset.section === currentId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // ── INTERSECTION OBSERVER — reveal on scroll ──────────────────────────────
    const io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // once revealed, stop watching
                io.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach(function (el) { io.observe(el); });

    // ── SMOOTH SCROLL for nav links ───────────────────────────────────────────
    navLinks.forEach(function (link) {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if (!target) return;
            const offset = 64; // nav height
            const top    = target.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top: top, behavior: 'smooth' });
        });
    });

    // ── SCROLL HANDLER ────────────────────────────────────────────────────────
    window.addEventListener('scroll', function () {
        updateProgress();
        updateNav();
        updateActiveSection();
    }, { passive: true });

    // ── INIT ──────────────────────────────────────────────────────────────────
    updateProgress();
    updateNav();
    updateActiveSection();

})();