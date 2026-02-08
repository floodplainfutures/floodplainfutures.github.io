(function(){
    'use strict';
    console.log("checking migratory patterns...");

    const myVideo = document.querySelector('#myVideo');
    const loading = document.querySelector('#loadingScreen');
    const loadingPercent = document.querySelector('#loadingPercent');
    const loadingText = document.querySelector('#loadingText');
    const beginBtn = document.querySelector('#beginBtn');
    const landing = document.querySelector('#landing');

    let percent = 0;
    let videoReady = false;

    // Check if user has already loaded the site in this session
    const hasVisited = sessionStorage.getItem('hasVisited');
    const menuWasOpen = sessionStorage.getItem('menuOpen');
    
    if (hasVisited) {
        // Skip loading screen, show video immediately
        loading.classList.add('hidden');
        myVideo.classList.add('visible');
        try {
            myVideo.play();
        } catch(e) {
            console.log("autoplay blocked – awaiting interaction");
        }
        
        // If menu was previously opened, restore that state
        if (menuWasOpen === 'true') {
            landing.classList.add('state-open');
        }
        
        // Still set up the begin button
        beginBtn.addEventListener('click', function(){
            landing.classList.add('state-open');
            sessionStorage.setItem('menuOpen', 'true');
        });
        
        return;
    }

    // Mark as visited for this session
    sessionStorage.setItem('hasVisited', 'true');

    function animatePercent() {
        if (percent < 99) {
            percent += Math.random() * 1.5;
            percent = Math.min(99, percent);

            loadingPercent.innerHTML = Math.floor(percent) + "%";
            requestAnimationFrame(animatePercent);
        } else {
            loadingText.innerHTML = "almost there";

            setTimeout(function(){
                finishLoading();
            }, 2000);
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
        videoReady = true;
        finishLoading();
    });

    window.addEventListener('load', function(){
        try {
            myVideo.play();
        } catch(e) {
            console.log("autoplay blocked — awaiting interaction");
        }
    });

    beginBtn.addEventListener('click', function(){
        landing.classList.add('state-open');
        sessionStorage.setItem('menuOpen', 'true');
    });

})();