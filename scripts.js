/* ═══════════════════════════════════════════════════════════════
   FLOODPLAIN FUTURES — scripts.js
   Single JS file for all pages, gated by body class detection.
   Sections:
     0. IDLE TIMEOUT (all pages)
     1. HOME PAGE
     2. CONTEXT PAGE
     3. MAP PAGE
     4. SYSTEMS PAGE
     5. OBSERVATIONS PAGE
═══════════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    var body = document.body;

    /* ───────────────────────────────────────────────────────────
       CONSTRUCTION BANNER TOGGLE (Shows on Every Fresh Load)
    ─────────────────────────────────────────────────────────── */
    document.addEventListener('DOMContentLoaded', function() {
        var wipBanner = document.getElementById('wip-banner');
        var closeWipBtn = document.getElementById('close-wip');

        if (wipBanner && closeWipBtn) {
            wipBanner.classList.remove('hidden');

            // Close button hides the banner
            closeWipBtn.addEventListener('click', function() {
                wipBanner.classList.add('hidden');
            });

            // Shift+W toggles it back on/off — useful for kiosk mode
            document.addEventListener('keydown', function(e) {
                if (e.shiftKey && e.key === 'W') {
                    wipBanner.classList.toggle('hidden');
                }
            });
        }
    });


    /* ───────────────────────────────────────────────────────────
       0. IDLE TIMEOUT — all pages
       After 60 s of inactivity → "still there?" modal.
       After 10 s more (countdown) → redirect to index.html
       with sessionStorage cleared so the begin screen shows.
    ─────────────────────────────────────────────────────────── */
    (function initIdleTimeout() {
        if (body.classList.contains('home-page')) { return; }
        var IDLE_MS        = 60 * 1000;  // 60 s until modal appears
        var COUNTDOWN_S    = 10;         // 10 s countdown before redirect
        var idleTimer      = null;
        var countdownTimer = null;
        var countRemaining = COUNTDOWN_S;

        // --- Ensure Material Symbols font is loaded on every page ---
        if (!document.querySelector('link[href*="Material+Symbols"]')) {
            var fontLink  = document.createElement('link');
            fontLink.rel  = 'stylesheet';
            fontLink.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined';
            document.head.appendChild(fontLink);
        }

        // --- Build modal DOM using createElement (no innerHTML with HTML tags) ---
        var overlay = document.createElement('div');
        overlay.id  = 'idle-overlay';

        var modal = document.createElement('div');
        modal.id  = 'idle-modal';

        var iconDiv  = document.createElement('div');
        iconDiv.className = 'idle-icon';
        var iconSpan = document.createElement('span');
        iconSpan.className   = 'material-symbols-outlined';
        iconSpan.textContent = 'waving_hand';
        iconDiv.appendChild(iconSpan);

        var heading = document.createElement('p');
        heading.className   = 'idle-heading';
        heading.textContent = 'still there?';

        var countSpan = document.createElement('span');
        countSpan.id          = 'idle-count';
        countSpan.textContent = String(COUNTDOWN_S);

        var sub = document.createElement('p');
        sub.className = 'idle-sub';
        sub.appendChild(document.createTextNode('returning to home in '));
        sub.appendChild(countSpan);
        sub.appendChild(document.createTextNode('s'));

        var stayBtn = document.createElement('button');
        stayBtn.id          = 'idle-stay';
        stayBtn.textContent = "yes, i'm here";

        modal.appendChild(iconDiv);
        modal.appendChild(heading);
        modal.appendChild(sub);
        modal.appendChild(stayBtn);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        var countEl = document.querySelector('#idle-count');

        // --- Show modal + start countdown ---
        function showModal() {
            countRemaining      = COUNTDOWN_S;
            countEl.textContent = String(countRemaining);
            overlay.classList.add('idle-visible');

            countdownTimer = setInterval(function () {
                countRemaining     -= 1;
                countEl.textContent = String(countRemaining);
                if (countRemaining <= 0) {
                    clearInterval(countdownTimer);
                    goHome();
                }
            }, 1000);
        }

        // --- Dismiss modal + restart idle timer ---
        function dismissModal() {
            overlay.classList.remove('idle-visible');
            clearInterval(countdownTimer);
            resetIdleTimer();
        }

        // --- Redirect home, clear session so begin screen shows ---
        function goHome() {
            sessionStorage.removeItem('hasVisited');
            window.location.href = 'index.html';
        }

        // --- Reset the idle timer ---
        function resetIdleTimer() {
            clearTimeout(idleTimer);
            idleTimer = setTimeout(showModal, IDLE_MS);
        }

        // --- Activity events ---
        var activityEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'wheel', 'click'];
        var i;
        for (i = 0; i < activityEvents.length; i++) {
            document.addEventListener(activityEvents[i], function () {
                if (!overlay.classList.contains('idle-visible')) {
                    resetIdleTimer();
                }
            }, { passive: true });
        }

        stayBtn.addEventListener('click', dismissModal);

        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) { dismissModal(); }
        });

        resetIdleTimer();
    })();


    /* ───────────────────────────────────────────────────────────
       1. HOME PAGE
    ─────────────────────────────────────────────────────────── */
    if (body.classList.contains('home-page')) {

        var myVideo        = document.querySelector('#myVideo');
        var loading        = document.querySelector('#loadingScreen');
        var loadingPercent = document.querySelector('#loadingPercent');
        var loadingText    = document.querySelector('#loadingText');
        var beginBtn       = document.querySelector('#beginBtn');
        var landing        = document.querySelector('#landing');

        var hasVisited = sessionStorage.getItem('hasVisited');

        function safeVideoInit() {
            if (!myVideo) return;
            myVideo.muted = true;
            myVideo.setAttribute('muted', '');
            var p = myVideo.play();
            if (p !== undefined) {
                p.catch(function () {
                    // Gesture fallback handled by inline script in index.html
                });
            }
        }

        // Fire at DOMContentLoaded (not window load) for Safari compatibility
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', safeVideoInit);
        } else {
            safeVideoInit();
        }



        if (hasVisited) {
            loading.classList.add('hidden');
            myVideo.classList.add('visible');
            landing.classList.add('state-open');
            myVideo.play().catch(function () {});
            return;
        }

        var percent    = 0;
        var videoReady = false;

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
            var fp = percent;
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
    ─────────────────────────────────────────────────────────── */
    if (body.classList.contains('context-page')) {

        var nav      = document.getElementById('ctxNav');
        var progress = document.getElementById('ctxProgress');
        var navLinks = document.querySelectorAll('.ctx-nav-link');
        var sections = document.querySelectorAll('.ctx-section');
        var reveals  = document.querySelectorAll('[data-reveal]');

        function updateProgress() {
            var scrollTop = window.scrollY;
            var docHeight = document.documentElement.scrollHeight - window.innerHeight;
            var pct       = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            if (progress) { progress.style.width = pct + '%'; }
        }

        function updateNav() {
            if (!nav) { return; }
            nav.classList.toggle('scrolled', window.scrollY > 60);
        }

        function updateActiveSection() {
            var mid       = window.scrollY + window.innerHeight * 0.4;
            var currentId = '';
            var j;
            for (j = 0; j < sections.length; j++) {
                if (sections[j].offsetTop <= mid) { currentId = sections[j].id; }
            }
            for (j = 0; j < navLinks.length; j++) {
                navLinks[j].classList.toggle('active', navLinks[j].dataset.section === currentId);
            }
        }

        var io = new IntersectionObserver(function (entries) {
            var k;
            for (k = 0; k < entries.length; k++) {
                if (entries[k].isIntersecting) {
                    entries[k].target.classList.add('visible');
                    io.unobserve(entries[k].target);
                }
            }
        }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

        var r;
        for (r = 0; r < reveals.length; r++) { io.observe(reveals[r]); }

        var nl;
        for (nl = 0; nl < navLinks.length; nl++) {
            navLinks[nl].addEventListener('click', function (e) {
                e.preventDefault();
                var target = document.querySelector(this.getAttribute('href'));
                if (!target) { return; }
                var top = target.getBoundingClientRect().top + window.scrollY - 86;
                window.scrollTo({ top: top, behavior: 'smooth' });
            });
        }

        window.addEventListener('scroll', function () {
            updateProgress();
            updateNav();
            updateActiveSection();
        }, { passive: true });

        updateProgress();
        updateNav();
        updateActiveSection();
    }


    /* ───────────────────────────────────────────────────────────
       3. MAP PAGE
    ─────────────────────────────────────────────────────────── */
    if (body.classList.contains('map-page')) {

        var m       = new Date().getMonth();
        var seasons = ['Winter','Winter','Spring','Spring','Spring','Summer','Summer','Summer','Fall','Fall','Fall','Winter'];
        var floods  = ['Active flood season','Active flood season','Draw-down in progress','Draw-down in progress','Low — fields drying','Dry','Dry','Dry','Refilling begins','Refilling begins','Refilling begins','Active flood season'];
        var spp     = ['Pintail, crane, dunlin','Pintail, crane, dunlin','Shorebirds, blackbird','Shorebirds, blackbird','Ibis, stilt, meadowlark','Ibis, bittern','Ibis, bittern','Ibis, bittern','Early ducks, shorebirds','Early ducks, shorebirds','Early ducks, shorebirds','Pintail, crane, dunlin'];
        var el;
        el = document.querySelector('#cSeason');  if (el) { el.textContent = seasons[m]; }
        el = document.querySelector('#cFlood');   if (el) { el.textContent = floods[m]; }
        el = document.querySelector('#cSpecies'); if (el) { el.textContent = spp[m]; }

        var panel      = document.getElementById('mapPanel');
        var toggleBtn  = document.getElementById('panelToggle');
        var dragHandle = document.getElementById('dragHandle');

        if (panel && toggleBtn) {
            toggleBtn.addEventListener('click', function () {
                var open = panel.classList.toggle('panel-open');
                toggleBtn.classList.toggle('active', open);
                if (open) {
                    toggleBtn.innerHTML = '';
                    var dot = document.createElement('span');
                    dot.className = 'ptb-dot';
                    toggleBtn.appendChild(dot);
                    toggleBtn.append(' close');
                } else {
                    toggleBtn.innerHTML = '<span class="ptb-dot"></span>info';
                }
            });
        }

        if (dragHandle && panel) {
            var startY    = 0;
            var startOpen = false;
            function isMobile() { return window.innerWidth <= 600; }

            dragHandle.addEventListener('touchstart', function (e) {
                if (!isMobile()) { return; }
                startY    = e.touches[0].clientY;
                startOpen = panel.classList.contains('panel-open');
                panel.style.transition = 'none';
            }, { passive: true });

            panel.addEventListener('touchmove', function (e) {
                if (!isMobile() || !startOpen) { return; }
                var dy = e.touches[0].clientY - startY;
                if (dy > 0) { panel.style.transform = 'translateY(' + dy + 'px)'; }
            }, { passive: true });

            panel.addEventListener('touchend', function (e) {
                if (!isMobile()) { return; }
                panel.style.transition = '';
                var dy = e.changedTouches[0].clientY - startY;
                if (dy > 80) {
                    panel.classList.remove('panel-open');
                    if (toggleBtn) {
                        toggleBtn.classList.remove('active');
                        toggleBtn.innerHTML = '<span class="ptb-dot"></span>info';
                    }
                }
                panel.style.transform = '';
            }, { passive: true });
        }

        var layerRows = document.querySelectorAll('.layer-row');
        var lr;
        for (lr = 0; lr < layerRows.length; lr++) {
            layerRows[lr].addEventListener('click', function () {
                if (window.innerWidth <= 600) {
                    setTimeout(function () {
                        if (panel) { panel.classList.remove('panel-open'); }
                        if (toggleBtn) {
                            toggleBtn.classList.remove('active');
                            toggleBtn.innerHTML = '<span class="ptb-dot"></span>info';
                        }
                    }, 280);
                }
            });
        }
    }


    /* ───────────────────────────────────────────────────────────
       4. SYSTEMS PAGE
    ─────────────────────────────────────────────────────────── */
    if (body.classList.contains('systems-page')) {

        var sysProgress = document.getElementById('sysProgress');
        function updateSysProgress() {
            var scrollTop = window.scrollY;
            var docHeight = document.documentElement.scrollHeight - window.innerHeight;
            var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            if (sysProgress) { sysProgress.style.width = pct + '%'; }
        }
        window.addEventListener('scroll', updateSysProgress, { passive: true });
        updateSysProgress();
    }


    /* ───────────────────────────────────────────────────────────
       5. OBSERVATIONS PAGE
    ─────────────────────────────────────────────────────────── */
    if (body.classList.contains('observations-page')) {

        var obsScroll  = document.getElementById('obsScroll');
        var entries    = document.querySelectorAll('.entry');
        var mobOverlay = document.getElementById('mobOverlay');
        var mobDrawer  = document.getElementById('mobDrawer');

        if (!obsScroll) { return; }

        var indexLinks = document.querySelectorAll('.index-link');
        var il;
        for (il = 0; il < indexLinks.length; il++) {
            indexLinks[il].addEventListener('click', function (e) {
                e.preventDefault();
                var target = document.getElementById(this.dataset.target);
                if (!target) { return; }
                closeMobileDrawer();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        }

        function getActiveEntry() {
            var active    = entries[0];
            var scrollTop = obsScroll.getBoundingClientRect().top;
            var oe;
            for (oe = 0; oe < entries.length; oe++) {
                if (entries[oe].getBoundingClientRect().top - scrollTop < 120) { active = entries[oe]; }
            }
            return active;
        }

        function updateIndex() {
            var active   = getActiveEntry();
            if (!active) { return; }
            var activeId = active.id;
            var ui;
            for (ui = 0; ui < indexLinks.length; ui++) {
                indexLinks[ui].classList.toggle('active', indexLinks[ui].dataset.target === activeId);
            }
        }

        obsScroll.addEventListener('scroll', updateIndex, { passive: true });
        updateIndex();

        function openMobileDrawer() {
            if (mobOverlay) { mobOverlay.classList.add('visible'); }
            if (mobDrawer)  { mobDrawer.classList.add('open'); }
            document.body.style.overflow = 'hidden';
        }
        function closeMobileDrawer() {
            if (mobOverlay) { mobOverlay.classList.remove('visible'); }
            if (mobDrawer)  { mobDrawer.classList.remove('open'); }
            document.body.style.overflow = '';
        }

        var obsHeader = document.querySelector('.obs-header');
        var backLink  = obsHeader ? obsHeader.querySelector('.oh-back') : null;
        if (obsHeader && backLink) {
            var indexBtn     = document.createElement('button');
            indexBtn.className   = 'oh-index-btn';
            indexBtn.textContent = '≡ entries';
            obsHeader.insertBefore(indexBtn, backLink);
            indexBtn.addEventListener('click', openMobileDrawer);
        }

        if (mobOverlay) { mobOverlay.addEventListener('click', closeMobileDrawer); }

        if (mobDrawer) {
            var dragStart = 0;
            mobDrawer.addEventListener('touchstart', function (e) {
                dragStart = e.touches[0].clientY;
                mobDrawer.style.transition = 'none';
            }, { passive: true });
            mobDrawer.addEventListener('touchmove', function (e) {
                var dy = e.touches[0].clientY - dragStart;
                if (dy > 0) { mobDrawer.style.transform = 'translateY(' + dy + 'px)'; }
            }, { passive: true });
            mobDrawer.addEventListener('touchend', function (e) {
                mobDrawer.style.transition = '';
                var dy = e.changedTouches[0].clientY - dragStart;
                if (dy > 80) { closeMobileDrawer(); mobDrawer.style.transform = ''; }
                else { mobDrawer.style.transform = ''; }
            }, { passive: true });
        }

        var fe;
        for (fe = 0; fe < entries.length; fe++) {
            entries[fe].style.opacity         = '0';
            entries[fe].style.transform       = 'translateY(16px)';
            entries[fe].style.transition      = 'opacity .5s ease, transform .5s ease';
            entries[fe].style.transitionDelay = (fe * 0.08) + 's';
        }

        if ('IntersectionObserver' in window) {
            var entryObserver = new IntersectionObserver(function (obs) {
                var oi;
                for (oi = 0; oi < obs.length; oi++) {
                    if (obs[oi].isIntersecting) {
                        obs[oi].target.style.opacity   = '1';
                        obs[oi].target.style.transform = 'translateY(0)';
                        entryObserver.unobserve(obs[oi].target);
                    }
                }
            }, { root: obsScroll, threshold: 0.08 });
            var eo;
            for (eo = 0; eo < entries.length; eo++) { entryObserver.observe(entries[eo]); }
        } else {
            var ef;
            for (ef = 0; ef < entries.length; ef++) {
                entries[ef].style.opacity   = '1';
                entries[ef].style.transform = 'none';
            }
        }
    }


    
    document.addEventListener('dragstart', function(e) {
        e.preventDefault();
    });

    var isKiosk = new URLSearchParams(window.location.search).get('kiosk') === '1';

    if (isKiosk) {
        document.addEventListener('contextmenu', function(e) { e.preventDefault(); });
        document.body.classList.add('kiosk-mode');
    }

})();