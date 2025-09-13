let openCube = {
    "strings": {
        "title": undefined,
        "artist": undefined,
        "album": undefined
    },
    "events": {
        "settingMetadata": new Event("settingMetadata"),
        "playbackStarting": new Event("playbackStarting"),
        "playbackEnded": new Event("playbackEnded"),
        "progressUpdate": new Event("progressUpdate"),
        "propertyChanged": new Event("propertyChanged")
    },
    "setCanvasSize": function (width, height, barWidth, barSpacing) {
        let canvas = document.querySelector('#canvas');
        canvas.setAttribute('width', width);
        canvas.setAttribute('height', height);
        config.visualizer.meterWidth = barWidth;
        config.visualizer.meterGap = barSpacing;
    },
    "scrollText": false,
    "setCaps": function (color, height) {
        config.visualizer.caps = true;
        config.visualizer.capColor = color;
        config.visualizer.capHeight = height;
    },
    "reloadData": function () {
        setMetadata(shuffled[idx]).then();
    }
}

document.openCube = openCube;