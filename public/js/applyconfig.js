// This script applies the config that was set in config.js. DO NOT EDIT THIS, OR ELSE IT WILL BREAK.

var newConfig = {
    capStyle: "",
}

newConfig.capStyle = config.visualizer.caps == true ? config.visualizer.capColor : "#00000000";

if (config.background.type == "video") {
    document.getElementById('wrapper').innerHTML +=`
        <video autoplay muted loop id="bg-video">
            <source src="${config.background.url}">
        </video>
    `
} else {
    document.getElementById('main').style.background = `url(${config.background.url})`;
}

document.documentElement.style.setProperty("--accent-color", config.accentColor);

if (config.progressBar.glow == true) {
    document.getElementById('progress').style.boxShadow = "0px 0px 10px 0px var(--accent-color)"
} else {
    document.getElementById('progress').style.boxShadow = "none"
}

document.getElementById('cover_art').style.borderRadius = `${config.details.albumArtCornerRadius}px`

document.getElementById('title').style.color = config.details.trackColor == '' ? config.accentColor : config.details.trackColor;
document.getElementById('artist').style.color = config.details.artistColor == '' ? config.accentColor : config.details.artistColor;
document.getElementById('album').style.color = config.details.albumColor == '' ? config.accentColor : config.details.albumColor;

document.getElementById('cover_art').style.transform = `rotateY(${config.details.albumArtRotation}deg)`
document.getElementById('details_wrapper').style.transform = `rotateY(${config.details.detailsRotation}deg)`
document.documentElement.style.setProperty("--def-start", (config.details.albumArtRotation - 180) + 'deg');
document.documentElement.style.setProperty("--def-end", (config.details.albumArtRotation) + 'deg');

document.body.style.setProperty('font-family', config.font.family);
document.body.style.setProperty('font-style', config.font.italic == true ? 'italic' : 'normal');