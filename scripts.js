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

        // --- Build modal DOM using createElement (no innerHTML with HTML tags) ---
        var overlay = document.createElement('div');
        overlay.id  = 'idle-overlay';

        var modal = document.createElement('div');
        modal.id  = 'idle-modal';

        var iconDiv = document.createElement('div');
        iconDiv.className = 'idle-icon';
        var iconSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        iconSvg.setAttribute('height', '48px');
        iconSvg.setAttribute('width', '48px');
        iconSvg.setAttribute('viewBox', '0 -960 960 960');
        iconSvg.setAttribute('fill', 'currentColor');
        var iconPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        iconPath.setAttribute('d', 'M880-759q0-51-35-86t-86-35v-60q75 0 128 53t53 128h-60ZM240-40q-83 0-141.5-58.5T40-240h60q0 58 41 99t99 41v60Zm162 0q-30 0-56-13.5T303-92L48-465l24-23q19-19 45-22t47 12l116 81v-383q0-17 11.5-28.5T320-840q17 0 28.5 11.5T360-800v537L212-367l157 229q5 8 14 13t19 5h278q33 0 56.5-23.5T760-200v-560q0-17 11.5-28.5T800-800q17 0 28.5 11.5T840-760v560q0 66-47 113T680-40H402Zm38-440v-400q0-17 11.5-28.5T480-920q17 0 28.5 11.5T520-880v400h-80Zm160 0v-360q0-17 11.5-28.5T640-880q17 0 28.5 11.5T680-840v360h-80ZM486-300Z');
        iconSvg.appendChild(iconPath);
        iconDiv.appendChild(iconSvg);

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
		var loading = document.getElementById('loadingScreen');
		var landing = document.getElementById('landing');
		var myVideo = document.getElementById('myVideo');
		var textEl  = document.getElementById('loadingText');
		var percentEl = document.getElementById('loadingPercent');

		var hasVisited = sessionStorage.getItem('hasVisited');

		if (hasVisited) {
			// Clear out the overlays immediately for returning users
			if (loading) loading.classList.add('hidden');
			if (myVideo) myVideo.classList.add('visible');
			if (landing) landing.classList.add('state-open');
			
			if (myVideo) {
				myVideo.muted = true;
				myVideo.play().catch(function () {});
			}
			// REMOVED: the early 'return;' statement here was preventing 
			// fallback behaviors and structural bindings from re-initializing in Safari
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

        myVideo.addEventListener('loadeddata', function () {
            if (!videoReady) {
                videoReady = true;
                finishLoading();
            }
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
                toggleBtn.classList.toggle('panel-is-open', open);
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

        // Layer row clicks on mobile no longer auto-close the panel
        // (openSiteCard in map.js now ensures panel is open when content loads)
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

        // Define drawer functions FIRST — used by index links below
        var openMobileDrawer = function () {
            if (mobOverlay) { mobOverlay.classList.add('visible'); }
            if (mobDrawer)  { mobDrawer.classList.add('open'); }
        };
        var closeMobileDrawer = function () {
            if (mobOverlay) { mobOverlay.classList.remove('visible'); }
            if (mobDrawer)  { mobDrawer.classList.remove('open'); }
        };

        // Wire FAB and drawer BEFORE any early-return guards
        var entriesFab = document.getElementById('obsEntriesFab');
        if (entriesFab) { entriesFab.addEventListener('click', openMobileDrawer); }
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

        if (!obsScroll) { return; }

        // Include BOTH sidebar links AND mob-drawer links
        var indexLinks = document.querySelectorAll('.index-link');
        var il;
        for (il = 0; il < indexLinks.length; il++) {
            indexLinks[il].addEventListener('click', function (e) {
                e.preventDefault();
                var targetId = this.dataset.target || (this.getAttribute('href') || '').replace('#', '');
                var target = document.getElementById(targetId);
                if (!target) { return; }
                closeMobileDrawer();
                // On mobile, body scrolls. On desktop, obsScroll is the container.
                if (window.innerWidth <= 600) {
                    var rect = target.getBoundingClientRect();
                    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                    window.scrollTo({ top: rect.top + scrollTop - 64, behavior: 'smooth' });
                } else {
                    var offset = target.offsetTop - obsScroll.offsetTop;
                    obsScroll.scrollTo({ top: offset, behavior: 'smooth' });
                }
            });
        }

        var getActiveEntry = function () {
            var active    = entries[0];
            var scrollTop = obsScroll.getBoundingClientRect().top;
            var oe;
            for (oe = 0; oe < entries.length; oe++) {
                if (entries[oe].getBoundingClientRect().top - scrollTop < 120) { active = entries[oe]; }
            }
            return active;
        };

        var updateIndex = function () {
            var active   = getActiveEntry();
            if (!active) { return; }
            var activeId = active.id;
            var ui;
            for (ui = 0; ui < indexLinks.length; ui++) {
                var link = indexLinks[ui];
                var linkTarget = link.dataset.target || (link.getAttribute('href') || '').replace('#', '');
                link.classList.toggle('active', linkTarget === activeId);
            }
        };

        obsScroll.addEventListener('scroll', updateIndex, { passive: true });
        window.addEventListener('scroll', updateIndex, { passive: true });
        updateIndex();

        // On iOS Safari, IntersectionObserver with a custom root (a scrolling div)
        // is unreliable — the composited native scroll layer can prevent observations
        // from firing, leaving all entries permanently at opacity:0 and making the
        // page appear empty/unscrollable. Use root:null (viewport) instead, and
        // keep entries visible by default so content is never gated on the observer.
        var fe;
        for (fe = 0; fe < entries.length; fe++) {
            entries[fe].style.opacity    = '1';
            entries[fe].style.transform  = 'none';
        }

        if ('IntersectionObserver' in window) {
            var entryObserver = new IntersectionObserver(function (obs) {
                var oi;
                for (oi = 0; oi < obs.length; oi++) {
                    if (obs[oi].isIntersecting) {
                        obs[oi].target.classList.add('entry--visible');
                        entryObserver.unobserve(obs[oi].target);
                    }
                }
            }, { root: null, threshold: 0.05, rootMargin: '0px 0px -40px 0px' });
            var eo;
            for (eo = 0; eo < entries.length; eo++) { entryObserver.observe(entries[eo]); }
        }

        // — OBS AUDIO PLAYER (same pattern as systems bird audio) —
        var obsAudioCurrent = null;
        var obsAudioBtn     = null;

        function obsStopAudio() {
            if (obsAudioCurrent) { obsAudioCurrent.pause(); obsAudioCurrent = null; }
            if (obsAudioBtn) { obsAudioBtn.classList.remove('playing'); obsAudioBtn = null; }
        }

        var obsBtn = document.getElementById('obs4-btn');
        if (obsBtn) {
            obsBtn.addEventListener('click', function () {
                if (obsBtn.classList.contains('playing')) { obsStopAudio(); return; }
                obsStopAudio();
                var audio = new Audio(obsBtn.dataset.src);
                obsAudioCurrent = audio;
                obsAudioBtn     = obsBtn;
                obsBtn.classList.add('playing');
                audio.play().catch(function (err) { console.error('obs audio error:', err); obsStopAudio(); });
                audio.addEventListener('ended', obsStopAudio);
            });
        }
    }


    

    /* ── OBS ENHANCEMENTS ── */

    // 1. Set --entry-accent CSS var per entry from its tag color
    var allEntries = document.querySelectorAll('.entry');
    allEntries.forEach(function(entry) {
        var tag = entry.querySelector('.entry-tag');
        if (tag) {
            var color = tag.style.getPropertyValue('--tag-color') || 'rgba(255,255,255,.15)';
            entry.style.setProperty('--entry-accent', color);
        }
    });

    // 2. Reading progress bar in sidebar
    var obsIndexEl = document.querySelector('.obs-index');
    if (obsIndexEl) {
        var progressBar = document.createElement('div');
        progressBar.className = 'obs-index-progress';
        obsIndexEl.style.position = 'relative';
        obsIndexEl.appendChild(progressBar);

        var obsScrollEl = document.getElementById('obsScroll');
        var updateProgress = function () {
            var s, h, pct;
            if (window.innerWidth <= 600) {
                s = window.pageYOffset || document.documentElement.scrollTop;
                h = document.body.scrollHeight - window.innerHeight;
            } else {
                s = obsScrollEl ? obsScrollEl.scrollTop : 0;
                h = obsScrollEl ? obsScrollEl.scrollHeight - obsScrollEl.clientHeight : 0;
            }
            pct = h > 0 ? (s / h * 100) : 0;
            progressBar.style.height = pct + '%';
        };
        if (obsScrollEl) { obsScrollEl.addEventListener('scroll', updateProgress, { passive: true }); }
        window.addEventListener('scroll', updateProgress, { passive: true });
    }

    // 3. Tag filtering
    var activeTag = null;
    var filterChip = document.createElement('div');
    filterChip.className = 'obs-filter-active';
    filterChip.innerHTML = '<span class="fc-label"></span><span class="fc-clear">✕ clear</span>';
    var obsIndexNav = document.getElementById('indexNav');
    if (obsIndexNav) { obsIndexNav.parentNode.insertBefore(filterChip, obsIndexNav.nextSibling); }

    filterChip.addEventListener('click', function() { clearFilter(); });

    function clearFilter() {
        activeTag = null;
        filterChip.classList.remove('visible');
        document.querySelectorAll('.etag').forEach(function(t) { t.classList.remove('active-filter'); });
        document.querySelectorAll('.entry').forEach(function(e) { e.classList.remove('tag-dimmed'); });
    }

    document.querySelectorAll('.etag').forEach(function(tag) {
        tag.addEventListener('click', function() {
            var clicked = tag.textContent.trim().toLowerCase();
            if (activeTag === clicked) { clearFilter(); return; }
            activeTag = clicked;

            document.querySelectorAll('.etag').forEach(function(t) {
                t.classList.toggle('active-filter', t.textContent.trim().toLowerCase() === clicked);
            });

            document.querySelectorAll('.entry').forEach(function(entry) {
                var tags = Array.from(entry.querySelectorAll('.etag')).map(function(t) {
                    return t.textContent.trim().toLowerCase();
                });
                entry.classList.toggle('tag-dimmed', tags.indexOf(clicked) === -1);
            });

            filterChip.querySelector('.fc-label').textContent = clicked;
            filterChip.classList.add('visible');
        });
    });

        document.addEventListener('dragstart', function(e) {
        e.preventDefault();
    });

    var isKiosk = new URLSearchParams(window.location.search).get('kiosk') === '1';

    if (isKiosk) {
        document.addEventListener('contextmenu', function(e) { e.preventDefault(); });
        document.body.classList.add('kiosk-mode');
    }

})();

/* ─────────────────────────────────────────────────────────────
   WAFFLE NAV — mobile sub-page navigation
───────────────────────────────────────────────────────────── */
(function() {
    var btn = document.getElementById('waffleBtn');
    var menu = document.getElementById('waffleMenu');
    if (!btn || !menu) return;

    function openMenu() {
        btn.classList.add('open');
        menu.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
    }
    function closeMenu() {
        btn.classList.remove('open');
        menu.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
    }
    function toggleMenu() {
        if (menu.classList.contains('open')) { closeMenu(); } else { openMenu(); }
    }

    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleMenu();
    });

    // Close on outside tap
    document.addEventListener('click', function(e) {
        if (!btn.contains(e.target) && !menu.contains(e.target)) {
            closeMenu();
        }
    });

    // Close on menu item tap (navigation handles itself via onclick)
    menu.querySelectorAll('.ff-waffle-menu-item').forEach(function(item) {
        item.addEventListener('click', function() { closeMenu(); });
    });
})();