/*let windowScale;

document.addEventListener('DOMContentLoaded', function() {
    const main = document.querySelector('#main'),
        windowEl = window,
        mainHeight = main.getBoundingClientRect().height,
        mainWidth = main.getBoundingClientRect().width,
        mainAspect = 16/9;
    let resizeTimer;

    // Calls rescale when window resizes
    window.addEventListener('resize', function(e) {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(scaleWindow, 100);
    });

    function scaleWindow() {
        let scale, windowAspect;

        windowAspect = window.innerWidth / window.innerHeight;

        if (windowAspect >= mainAspect) {
            scale = window.innerHeight / mainHeight;
        } else {
            scale = window.innerWidth / mainWidth;
        }

        main.style.transform = `translate(-50%, -50%) scale(${scale})`;
        windowScale = scale;
    }

    scaleWindow(); // init
    document.querySelector("#art_wrapper").addEventListener("click",fullscreen);
});

function fullscreen() {
    const main = document.body;
    main.requestFullscreen({navigationUI: "hide"}).then();
}*/