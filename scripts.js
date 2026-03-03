(function(){
    'use strict';
    console.log("checking migratory patterns...");

    const myVideo = document.querySelector('#myVideo');
    const loading = document.querySelector('#loadingScreen');
    const loadingPercent = document.querySelector('#loadingPercent');
    const loadingText = document.querySelector('#loadingText');

    let percent = 0;
    let videoReady = false;

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

    const beginBtn = document.querySelector('#beginBtn');
    const landing = document.querySelector('#landing');

    beginBtn.addEventListener('click', function(){
        landing.classList.add('state-open');
    });

})();