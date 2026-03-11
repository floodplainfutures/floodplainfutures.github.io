'use strict';

(function () {

    const scroll     = document.getElementById('obsScroll');
    const entries    = document.querySelectorAll('.entry');
    const indexLinks = document.querySelectorAll('#indexNav .index-link');

    // ── INDEX CLICK → scroll to entry ────────────────────
    document.querySelectorAll('.index-link').forEach(function (link) {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = link.dataset.target;
            const target   = document.getElementById(targetId);
            if (!target) return;

            // close mobile drawer if open
            closeMobileDrawer();

            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    // ── SCROLL → highlight active index entry ────────────
    function getActiveEntry() {
        let active = entries[0];
        entries.forEach(function (entry) {
            const rect = entry.getBoundingClientRect();
            const scrollTop = scroll.getBoundingClientRect().top;
            if (rect.top - scrollTop < 120) {
                active = entry;
            }
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

    // ── MOBILE DRAWER ─────────────────────────────────────
    const overlay   = document.getElementById('mobOverlay');
    const drawer    = document.getElementById('mobDrawer');
    let   indexBtn  = null;

    // inject the header button dynamically
    const header = document.querySelector('.obs-header');
    if (header) {
        indexBtn = document.createElement('button');
        indexBtn.className = 'oh-index-btn';
        indexBtn.textContent = '≡ entries';

        // insert before the back link
        const backLink = header.querySelector('.oh-back');
        header.insertBefore(indexBtn, backLink);

        indexBtn.addEventListener('click', function () {
            openMobileDrawer();
        });
    }

    function openMobileDrawer() {
        overlay.classList.add('visible');
        drawer.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeMobileDrawer() {
        overlay.classList.remove('visible');
        drawer.classList.remove('open');
        document.body.style.overflow = '';
    }

    overlay.addEventListener('click', closeMobileDrawer);

    // drag to dismiss drawer
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
        if (dy > 80) {
            closeMobileDrawer();
            drawer.style.transform = '';
        } else {
            drawer.style.transform = '';
        }
    }, { passive: true });

    // ── ENTRY FADE-IN ON SCROLL ───────────────────────────
    // Stagger entries in on load
    entries.forEach(function (entry, i) {
        entry.style.opacity  = '0';
        entry.style.transform = 'translateY(16px)';
        entry.style.transition = 'opacity .5s ease, transform .5s ease';
        entry.style.transitionDelay = (i * 0.08) + 's';
    });

    // use IntersectionObserver if available, else just show all
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(function (entries_obs) {
            entries_obs.forEach(function (obs) {
                if (obs.isIntersecting) {
                    obs.target.style.opacity  = '1';
                    obs.target.style.transform = 'translateY(0)';
                    observer.unobserve(obs.target);
                }
            });
        }, { root: scroll, threshold: 0.08 });

        entries.forEach(function (entry) { observer.observe(entry); });
    } else {
        entries.forEach(function (entry) {
            entry.style.opacity  = '1';
            entry.style.transform = 'none';
        });
    }

})();