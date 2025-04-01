const slideshowItems = 254;
var slideshowIdx = Math.floor(Math.random() * slideshowItems);
function advanceSlideshow() {
    if (config.background.type == "slideshow") {
        slideshowIdx++;
        if (slideshowIdx > slideshowItems) {
            slideshowIdx = 1;
        }
        document.getElementById('main').style.background = `url(/images/slideshow/generic_generic_${slideshowIdx}.jpeg)`;
    };
};