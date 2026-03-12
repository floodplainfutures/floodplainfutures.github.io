(function(){
    'use strict';
    console.log("checking migratory patterns...");

    const myVideo        = document.querySelector('#myVideo');
    const loading        = document.querySelector('#loadingScreen');
    const loadingPercent = document.querySelector('#loadingPercent');
    const loadingText    = document.querySelector('#loadingText');
    const beginBtn       = document.querySelector('#beginBtn');
    const landing        = document.querySelector('#landing');

    const hasVisited = sessionStorage.getItem('hasVisited');

    // ── RETURNING VISITOR (same tab session) ─────────────────────────────────
    // Skip loading screen entirely, skip begin button, go straight to open state
    if (hasVisited) {
        loading.classList.add('hidden');
        landing.classList.add('state-open');

        // play video immediately
        myVideo.play().catch(function(){
            console.log("autoplay blocked — awaiting interaction");
        });

        return; // nothing else to do
    }

    // ── FIRST VISIT this session ──────────────────────────────────────────────
    let percent    = 0;
    let videoReady = false;

    function animatePercent() {
        if (percent < 99) {
            percent += Math.random() * 1.5;
            percent  = Math.min(99, percent);
            loadingPercent.innerHTML = Math.floor(percent) + "%";
            requestAnimationFrame(animatePercent);
        } else {
            loadingText.innerHTML = "almost there";
            setTimeout(finishLoading, 2000);
        }
    }

    function finishLoading() {
        let finishPercent = percent;

        function finishAnimation() {
            if (finishPercent < 100) {
                finishPercent += 1;
                loadingPercent.innerHTML = Math.floor(finishPercent) + "%";
                requestAnimationFrame(finishAnimation);
            } else {
                loading.classList.add('hidden');
                myVideo.classList.add('visible');
            }
        }

        finishAnimation();
    }

    animatePercent();

    myVideo.addEventListener('canplaythrough', function(){
        if (!videoReady) {
            videoReady = true;
            finishLoading();
        }
    });

    window.addEventListener('load', function(){
        myVideo.play().catch(function(){
            console.log("autoplay blocked — awaiting interaction");
        });
    });

    // ── BEGIN BUTTON ──────────────────────────────────────────────────────────
    beginBtn.addEventListener('click', function(){
        landing.classList.add('state-open');
        // mark this session as visited so returning to this page skips intro
        sessionStorage.setItem('hasVisited', 'true');
    });

})();