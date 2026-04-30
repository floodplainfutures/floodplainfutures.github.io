/* ═══════════════════════════════════════════════════════════════
   FLOODPLAIN FUTURES — scripts.js
   Single JS file for all pages, gated by body class detection.
   Sections:
     1. HOME PAGE
     2. CONTEXT PAGE
     3. MAP PAGE
     4. SYSTEMS PAGE
     5. OBSERVATIONS PAGE
═══════════════════════════════════════════════════════════════ */

(function () {
    console.log('systems.js loaded');
    'use strict';


    const body = document.body;


    /* ───────────────────────────────────────────────────────────
       1. HOME PAGE
    ─────────────────────────────────────────────────────────── */
    if (body.classList.contains('home-page')) {
        console.log("checking migratory patterns...");

        const myVideo        = document.querySelector('#myVideo');
        const loading        = document.querySelector('#loadingScreen');
        const loadingPercent = document.querySelector('#loadingPercent');
        const loadingText    = document.querySelector('#loadingText');
        const beginBtn       = document.querySelector('#beginBtn');
        const landing        = document.querySelector('#landing');

        const hasVisited = sessionStorage.getItem('hasVisited');

        if (hasVisited) {
            loading.classList.add('hidden');
            myVideo.classList.add('visible');
            landing.classList.add('state-open');
            myVideo.play().catch(function () {});
            return;
        }

        let percent    = 0;
        let videoReady = false;

        function animatePercent() {
            if (percent < 99) {
                percent += Math.random() * 1.5;
                percent  = Math.min(99, percent);
                loadingPercent.innerHTML = Math.floor(percent) + '%';
                requestAnimationFrame(animatePercent);
            } else {
                loadingText.innerHTML = 'almost there';
                setTimeout(finishLoading, 2000);
            }
        }

        function finishLoading() {
            let fp = percent;
            function fin() {
                if (fp < 100) {
                    fp += 1;
                    loadingPercent.innerHTML = Math.floor(fp) + '%';
                    requestAnimationFrame(fin);
                } else {
                    loading.classList.add('hidden');
                    myVideo.classList.add('visible');
                }
            }
            fin();
        }

        animatePercent();

        myVideo.addEventListener('canplaythrough', function () {
            if (!videoReady) { videoReady = true; finishLoading(); }
        });

        window.addEventListener('load', function () {
            myVideo.play().catch(function () {});
        });

        beginBtn.addEventListener('click', function () {
            landing.classList.add('state-open');
            sessionStorage.setItem('hasVisited', 'true');
        });
    }


    /* ───────────────────────────────────────────────────────────
       2. CONTEXT PAGE
       (merged from context.js)
    ─────────────────────────────────────────────────────────── */
    if (body.classList.contains('context-page')) {

        const nav      = document.getElementById('ctxNav');
        const progress = document.getElementById('ctxProgress');
        const navLinks = document.querySelectorAll('.ctx-nav-link');
        const sections = document.querySelectorAll('.ctx-section');
        const reveals  = document.querySelectorAll('[data-reveal]');

        // Progress bar width
        function updateProgress() {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const pct       = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            if (progress) progress.style.width = pct + '%';
        }

        // Add .scrolled to ctx-nav after user scrolls past the hero
        function updateNav() {
            if (!nav) return;
            nav.classList.toggle('scrolled', window.scrollY > 60);
        }

        // Highlight the section nav link that matches the current scroll position
        function updateActiveSection() {
            const mid = window.scrollY + window.innerHeight * 0.4;
            let currentId = '';
            sections.forEach(function (sec) {
                if (sec.offsetTop <= mid) currentId = sec.id;
            });
            navLinks.forEach(function (link) {
                link.classList.toggle('active', link.dataset.section === currentId);
            });
        }

        // Scroll-reveal for [data-reveal] elements
        const io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
        reveals.forEach(function (el) { io.observe(el); });

        // Smooth-scroll section nav links, offset for both fixed bars (48 + 38 = 86px)
        navLinks.forEach(function (link) {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (!target) return;
                const top = target.getBoundingClientRect().top + window.scrollY - 86;
                window.scrollTo({ top: top, behavior: 'smooth' });
            });
        });

        window.addEventListener('scroll', function () {
            updateProgress();
            updateNav();
            updateActiveSection();
        }, { passive: true });

        // Run once on load
        updateProgress();
        updateNav();
        updateActiveSection();
    }


    /* ───────────────────────────────────────────────────────────
       3. MAP PAGE
    ─────────────────────────────────────────────────────────── */
    if (body.classList.contains('map-page')) {

        // Seasonal conditions
        const m       = new Date().getMonth();
        const seasons = ['Winter','Winter','Spring','Spring','Spring','Summer','Summer','Summer','Fall','Fall','Fall','Winter'];
        const floods  = ['Active flood season','Active flood season','Draw-down in progress','Draw-down in progress','Low — fields drying','Dry','Dry','Dry','Refilling begins','Refilling begins','Refilling begins','Active flood season'];
        const spp     = ['Pintail, crane, dunlin','Pintail, crane, dunlin','Shorebirds, blackbird','Shorebirds, blackbird','Ibis, stilt, meadowlark','Ibis, bittern','Ibis, bittern','Ibis, bittern','Early ducks, shorebirds','Early ducks, shorebirds','Early ducks, shorebirds','Pintail, crane, dunlin'];
        var el;
        el = document.querySelector('#cSeason');  if (el) el.textContent = seasons[m];
        el = document.querySelector('#cFlood');   if (el) el.textContent = floods[m];
        el = document.querySelector('#cSpecies'); if (el) el.textContent = spp[m];

        // Leaflet initialised inline in map.html (needs Leaflet loaded first)
        // Panel toggle
        const panel      = document.getElementById('mapPanel');
        const toggleBtn  = document.getElementById('panelToggle');
        const dragHandle = document.getElementById('dragHandle');

        if (panel && toggleBtn) {
            toggleBtn.addEventListener('click', function () {
                const open = panel.classList.toggle('panel-open');
                toggleBtn.classList.toggle('active', open);
                if (open) {
                    toggleBtn.innerHTML = '';
                    const dot = document.createElement('span');
                    dot.className = 'ptb-dot';
                    toggleBtn.appendChild(dot);
                    toggleBtn.append(' close');
                } else {
                    toggleBtn.innerHTML = '<span class="ptb-dot"></span>info';
                }
            });
        }

        // Drag-to-dismiss on mobile
        if (dragHandle && panel) {
            let startY = 0, startOpen = false;
            function isMobile() { return window.innerWidth <= 600; }

            dragHandle.addEventListener('touchstart', function (e) {
                if (!isMobile()) return;
                startY    = e.touches[0].clientY;
                startOpen = panel.classList.contains('panel-open');
                panel.style.transition = 'none';
            }, { passive: true });

            panel.addEventListener('touchmove', function (e) {
                if (!isMobile() || !startOpen) return;
                const dy = e.touches[0].clientY - startY;
                if (dy > 0) panel.style.transform = 'translateY(' + dy + 'px)';
            }, { passive: true });

            panel.addEventListener('touchend', function (e) {
                if (!isMobile()) return;
                panel.style.transition = '';
                const dy = e.changedTouches[0].clientY - startY;
                if (dy > 80) {
                    panel.classList.remove('panel-open');
                    if (toggleBtn) { toggleBtn.classList.remove('active'); toggleBtn.innerHTML = '<span class="ptb-dot"></span>info'; }
                }
                panel.style.transform = '';
            }, { passive: true });
        }

        // Close drawer on layer row tap (mobile)
        document.querySelectorAll('.layer-row').forEach(function (row) {
            row.addEventListener('click', function () {
                if (window.innerWidth <= 600) {
                    setTimeout(function () {
                        if (panel) panel.classList.remove('panel-open');
                        if (toggleBtn) { toggleBtn.classList.remove('active'); toggleBtn.innerHTML = '<span class="ptb-dot"></span>info'; }
                    }, 280);
                }
            });
        });
    }


    /* ───────────────────────────────────────────────────────────
       4. SYSTEMS PAGE
       (systems.js content is preserved separately because of its
       size and complexity — this block handles shared header items)
    ─────────────────────────────────────────────────────────── */
    if (body.classList.contains('systems-page')) {

        // Progress bar
        const progress = document.getElementById('sysProgress');
        function updateSysProgress() {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            if (progress) progress.style.width = pct + '%';
        }
        window.addEventListener('scroll', updateSysProgress, { passive: true });
        updateSysProgress();
    }


    /* ───────────────────────────────────────────────────────────
       5. OBSERVATIONS PAGE
    ─────────────────────────────────────────────────────────── */
    if (body.classList.contains('observations-page')) {

        const scroll     = document.getElementById('obsScroll');
        const entries    = document.querySelectorAll('.entry');
        const overlay    = document.getElementById('mobOverlay');
        const drawer     = document.getElementById('mobDrawer');

        if (!scroll) return;

        // INDEX click → scroll to entry
        document.querySelectorAll('.index-link').forEach(function (link) {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.getElementById(link.dataset.target);
                if (!target) return;
                closeMobileDrawer();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });

        // SCROLL → highlight active entry
        function getActiveEntry() {
            let active = entries[0];
            const scrollTop = scroll.getBoundingClientRect().top;
            entries.forEach(function (entry) {
                if (entry.getBoundingClientRect().top - scrollTop < 120) active = entry;
            });
            return active;
        }
        function updateIndex() {
            const active = getActiveEntry();
            if (!active) return;
            const id = active.id;
            document.querySelectorAll('.index-link').forEach(function (link) {
                link.classList.toggle('active', link.dataset.target === id);
            });
        }
        scroll.addEventListener('scroll', updateIndex, { passive: true });
        updateIndex();

        // MOBILE DRAWER
        function openMobileDrawer() {
            if (overlay) overlay.classList.add('visible');
            if (drawer)  drawer.classList.add('open');
            document.body.style.overflow = 'hidden';
        }
        function closeMobileDrawer() {
            if (overlay) overlay.classList.remove('visible');
            if (drawer)  drawer.classList.remove('open');
            document.body.style.overflow = '';
        }

        // inject ≡ button
        const header  = document.querySelector('.obs-header');
        const backLink = header ? header.querySelector('.oh-back') : null;
        if (header && backLink) {
            const indexBtn = document.createElement('button');
            indexBtn.className   = 'oh-index-btn';
            indexBtn.textContent = '≡ entries';
            header.insertBefore(indexBtn, backLink);
            indexBtn.addEventListener('click', openMobileDrawer);
        }

        if (overlay) overlay.addEventListener('click', closeMobileDrawer);

        // drag-to-dismiss drawer
        if (drawer) {
            let dragStart = 0;
            drawer.addEventListener('touchstart', function (e) {
                dragStart = e.touches[0].clientY;
                drawer.style.transition = 'none';
            }, { passive: true });
            drawer.addEventListener('touchmove', function (e) {
                const dy = e.touches[0].clientY - dragStart;
                if (dy > 0) drawer.style.transform = 'translateY(' + dy + 'px)';
            }, { passive: true });
            drawer.addEventListener('touchend', function (e) {
                drawer.style.transition = '';
                const dy = e.changedTouches[0].clientY - dragStart;
                if (dy > 80) { closeMobileDrawer(); drawer.style.transform = ''; }
                else drawer.style.transform = '';
            }, { passive: true });
        }

        // ENTRY FADE-IN
        entries.forEach(function (entry, i) {
            entry.style.opacity   = '0';
            entry.style.transform = 'translateY(16px)';
            entry.style.transition = 'opacity .5s ease, transform .5s ease';
            entry.style.transitionDelay = (i * 0.08) + 's';
        });

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver(function (obs) {
                obs.forEach(function (o) {
                    if (o.isIntersecting) {
                        o.target.style.opacity   = '1';
                        o.target.style.transform = 'translateY(0)';
                        observer.unobserve(o.target);
                    }
                });
            }, { root: scroll, threshold: 0.08 });
            entries.forEach(function (entry) { observer.observe(entry); });
        } else {
            entries.forEach(function (entry) {
                entry.style.opacity   = '1';
                entry.style.transform = 'none';
            });
        }
    }

})();