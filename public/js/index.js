/*
             * An audio spectrum visualizer built with HTML5 Audio API
             * Author:Wayou
             * License: MIT
             * Feb 15, 2014
*/

var idx = 0

window.onload = function() {
    new Visualizer().ini();
};

async function getAverageColor(img) {
    const fac = new FastAverageColor();
    const color = await fac.getColorAsync(img);
    return color
}

function pollRefresh() {
    fetch('/api/doirefresh')
        .then(response => response.json())
        .then(data => {
            if (data.message == true) {
                location.reload();
            }
        })
}
setInterval(pollRefresh, 5000);

var scrollInterval;
var scrollIntervalArtist;

function start() {
    if (config.theme == "nemo24") {
        document.getElementById('canvas').width = 144;
        document.getElementById('canvas').height = 256;
    }
    if (config.theme == "wpvi") {
        document.getElementById('canvas').width = 320;
        document.getElementById('canvas').height = 256;
        //document.getElementById('art_wrapper').appendChild(document.getElementById('canvas'));
        config.visualizer.color[0].color = '#ffffff';
        config.visualizer.color[1].color = '#ffffff';
        config.visualizer.color[2].color = '#9bfaff';
    }
    if (config.theme == "botswana") {
        config.visualizer.color[0].color = '#000000';
        config.visualizer.color[1].color = '#000000';
        config.visualizer.color[2].color = '#000000';
    }
    Visualizer.prototype._prepareAPI();
    Visualizer.prototype._start();
}

async function pregressBar() {
    const progress = document.getElementById('progress');

    const speed = 1;
    var offset = 0;
    var artistOffset = 0;

    const textObject = document.getElementById('title');
    const parentWidth = document.getElementById('details_wrapper').getBoundingClientRect().width;
    const textWidth = textObject.getBoundingClientRect().width;

    const artistObject = document.getElementById('artist');
    const artistWidth = artistObject.getBoundingClientRect().width;

    //set lyric timestamps
    var lrcWrapWrap = document.querySelector("#lyrics-wrapper-wrapper").getBoundingClientRect();
    var lrcWrap = document.querySelector("#lyrics-wrapper");
    (async () => {
        for (let idx = 0; idx < songLyrics.length; idx++) {
            const itm = songLyrics[idx];
            const elm = document.querySelector(`#lyrics-wrapper h1[data-lyric-id="${idx}"]`);
            setTimeout(() => {
                elm.classList.add("active");
                const rect = elm.getBoundingClientRect();
                const rectWrap = lrcWrap.getBoundingClientRect();
                lrcWrap.style.top = ((rect.top - rectWrap.top) * -1) + (lrcWrapWrap.height / 2) - (rect.height / 2) + "px";
                //elm.scrollIntoView({ behavior: "smooth", block: "center" });
                //setTimeout(() => {elm.scrollIntoView({ behavior: "smooth", block: "center" });},500)
            }, itm.timestamp);
            setTimeout(() => {
                elm.classList.remove("active");
            }, songLyrics[idx+1].timestamp === null ? 999999999 : songLyrics[idx+1].timestamp);
        };
    })();

    var buffer = audioBufferSouceNode.buffer;
    proglength = buffer.duration;
    var i = 0;
    function updateProgress() {
        i = i + 0.2
        progress.style.width = (i / proglength) * 100 + '%'; // Convert to percentage
        if (i >= Math.floor(proglength)) {
            clearInterval(intervalId);
            clearInterval(scrollInterval);
            clearInterval(scrollIntervalArtist);
            Visualizer.prototype._audioEnd();
        }
        progtimestamp = buffer.duration;
        const timeLeft = progtimestamp - i;
        fetch('/api/save/songdata', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({proglength,i,idx})
        })
        document.getElementById('clock').innerText = `${Math.floor(i / 60)}:${(Math.floor(i) % 60).toString().padStart(2,'0')}`
        document.getElementById('clock_neg').innerText = `-${Math.floor(timeLeft / 60)}:${(Math.floor(timeLeft) % 60).toString().padStart(2, '0')}`;
    }

    function textScroll() {
        if (textWidth > parentWidth) {
            textObject.style.transform = `translateX(${offset}px)`;
            offset = offset - speed;
            if ((offset * -1) - textWidth > 0) {
                textObject.style.transform = `translateX(${parentWidth}px)`;
                offset = parentWidth;
            };
        } else {
            return 1;
        };
    }

    function textScrollArtist() {
        if (artistWidth > parentWidth) {
            artistObject.style.transform = `translateX(${artistOffset}px)`;
            artistOffset = artistOffset - (speed * 0.5);
            if ((artistOffset * -1) - artistWidth > 0) {
                artistObject.style.transform = `translateX(${parentWidth}px)`;
                artistOffset = parentWidth;
            };
        } else {
            return 1;
        };
    }

    const scrollInterval = setInterval(textScroll, 10);
    const scrollIntervalArtist = setInterval(textScrollArtist, 10);
    const intervalId = setInterval(updateProgress, 200);
}

/*function shufflePlaylist() { // now done in app.js
    shuffled = shuffle(songs);
    shuffled.unshift({
        "name": "test",
        "artist": "test",
        "album": "Sample Heaven",
        "url": "/songs/test.wav"
    },)
}*/

async function songQueue() {
    songCount = shuffled.length;
    Visualizer.file = shuffled[0].url;
    Visualizer.fileName = "automatic playback enabled"
    setMetadata(shuffled[idx]);
    getLyrics();
    advanceSlideshow();
    idx = 0;
    Visualizer.status = 1;
    Visualizer.prototype._start;
}

var songLyrics = []

async function getLyrics() {
    songLyrics = [];
    var itm = shuffled[idx];
    var fileName = itm.url.slice(0, itm.url.lastIndexOf('.'));
    try {
        const lrcFile = await fetch(fileName + ".lrc")
        .then((res) => {return res.text()});
        const lrcSplit = lrcFile.split("\n");
        for (let idx = 0; idx < lrcSplit.length; idx++) {
            const itm = lrcSplit[idx];
            const rgx = /\[([0-9]+):([0-9]+)\.([0-9]+)\]/i;
            const timeMatch = itm.match(rgx);
            if (timeMatch != null) {
                // get time and content
                const minutes = parseInt(timeMatch[1], 10);
                const seconds = parseFloat(timeMatch[2]);
                const milliseconds = parseInt(timeMatch[3], 10);
                const lrcTime = (minutes * 60 + seconds) * 1000 + (milliseconds * 10);
                const lrcString = itm.slice(10);
                songLyrics.push({
                    "timestamp": lrcTime,
                    "value": lrcString
                })
            }
        }
        const lyricsWrapper = document.getElementById("lyrics-wrapper").style.display = "block";
        renderLyrics();
    } catch (err) {
        console.warn("no lyrics found." + err);
        const lyricsWrapper = document.getElementById("lyrics-wrapper").style.display = "none";
    }
}

async function renderLyrics() {
    const lyricsWrapper = document.getElementById("lyrics-wrapper");
    lyricsWrapper.innerHTML = "";
    for (let idx = 0; idx < songLyrics.length; idx++) {
        const itm = songLyrics[idx];
        const lrc = document.createElement("h1");
        lrc.innerText = itm.value;
        lrc.setAttribute("data-lyric-id", idx)
        lyricsWrapper.appendChild(lrc);
    }
}

async function nextSong() {
    idx++ // increase song index by 1
    if (idx >= shuffled.length) {
        idx = 1;
        location = ''
    };
    advanceSlideshow();
    fetch('/api/advancePlaylist'); // advance dashboard playlist item
    Visualizer.file = shuffled[idx].url;
    Visualizer.status = 1;
    getLyrics();
    setMetadata(shuffled[idx]);
    start();
}

async function setMetadata(data) {
    if (data.name.includes("[Explicit]")) {
        document.getElementById('title').innerHTML = data.name.replace('[Explicit]','') + '<span class="material-symbols-outlined" style="font-size: 32pt">explicit</span>';
    } else {
        document.getElementById('title').innerText = data.name;
    }
    document.getElementById('artist').innerText = data.artist;
    if (config.theme == "nemo24") {
        document.getElementById('album').innerText = "Now Playing";
        const color = await new FastAverageColor().getColorAsync(`/images/albums/${data.album}.jpg`);
        document.getElementById('visualizer_wrapper').style.background = `linear-gradient(90deg, ${color.hex} 0%, #000000 300%)`;
    } else if (config.theme == "wpvi") {
        document.getElementById('album').innerText = "NOW PLAYING";
    } else {
        document.getElementById('album').innerText = data.album;
    }
    if (config.background.type == "albumblur") {
        document.getElementById('albumblur').style.backgroundImage = `url("/images/albums/${data.album}.jpg")`;
    }
    if (data.album != document.getElementById('cover_art').src) {
        async function doTheSameButForTheShadow() {
            document.getElementById('cover_art_shadow').style.animation = "rotateArtShadow 1s cubic-bezier(.37,1.28,.64,1)";
            setTimeout(function(){document.getElementById('cover_art_shadow').src = `/images/albums/${data.album}.jpg`},210);
            setTimeout(function(){document.getElementById('cover_art_shadow').style.animation = ""},1000)
        };
        doTheSameButForTheShadow();
        document.getElementById('cover_art').style.animation = "rotateArt 1s cubic-bezier(.37,1.28,.64,1)";
        setTimeout(function(){document.getElementById('cover_art').src = `/images/albums/${data.album}.jpg`},210);
        setTimeout(function(){document.getElementById('cover_art').style.animation = ""},1000)
    } else {
        console.log(data.album)
        console.log(document.getElementById('cover_art').src)
        document.getElementById('cover_art').src = `/images/albums/${data.album}.jpg`;
    }
}

function calculateLoudness(pressure) {
    const term1 = Math.pow(10, (pressure - 40) / 10);
    const loudness = /*40 + */10 * Math.log10(term1 + 0.0007);
    return loudness;
}

var Visualizer = function() {
    this.file = null, //the current file
    this.fileName = null, //the current file name
    this.audioContext = null,
    this.source = null, //the audio source
    this.info = document.getElementById('info').innerHTML, //this used to upgrade the UI information
    this.infoUpdateId = null, //to sotore the setTimeout ID and clear the interval
    this.animationId = null,
    this.status = 0, //flag for sound is playing 1 or stopped 0
    this.forceStop = false,
    this.allCapsReachBottom = false
};
songQueue();
Visualizer.prototype = {
    ini: function() {
        this._prepareAPI();
        this._addEventListner();
    },
    _prepareAPI: function() {
        //fix browser vender for AudioContext and requestAnimationFrame
        window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;
        window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame;
        window.cancelAnimationFrame = window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || window.msCancelAnimationFrame;
        try {
            this.audioContext = new AudioContext();
        } catch (e) {
            this._updateInfo('!Your browser does not support AudioContext', false);
            console.log(e);
        }
    },
    _addEventListner: function() {
        var that = this,
            audioInput = document.getElementById('uploadedFile'),
            dropContainer = document.getElementsByTagName("canvas")[0];
        //listen the file upload
        audioInput.onchange = function() {
            if (that.audioContext===null) {return;};

            //the if statement fixes the file selction cancle, because the onchange will trigger even the file selection been canceled
            if (audioInput.files.length !== 0) {
                //only process the first file
                that.file = audioInput.files[0];
                that.fileName = that.file.name;
                if (that.status === 1) {
                    //the sound is still playing but we upload another file, so set the forceStop flag to true
                    that.forceStop = true;
                };
                document.getElementById('fileWrapper').style.opacity = 1;
                that._updateInfo('Uploading', true);
                //once the file is ready,start the visualizer
                that._start();
            };
        };
        //listen the drag & drop
        dropContainer.addEventListener("dragenter", function() {
            document.getElementById('fileWrapper').style.opacity = 1;
            that._updateInfo('Drop it on the page', true);
        }, false);
        dropContainer.addEventListener("dragover", function(e) {
            e.stopPropagation();
            e.preventDefault();
            //set the drop mode
            e.dataTransfer.dropEffect = 'copy';
        }, false);
        dropContainer.addEventListener("dragleave", function() {
            document.getElementById('fileWrapper').style.opacity = 0.2;
            that._updateInfo(that.info, false);
        }, false);
        dropContainer.addEventListener("drop", function(e) {
            e.stopPropagation();
            e.preventDefault();
            if (that.audioContext===null) {return;};
            document.getElementById('fileWrapper').style.opacity = 1;
            that._updateInfo('Uploading', true);
            //get the dropped file
            that.file = e.dataTransfer.files[0];
            if (that.status === 1) {
                document.getElementById('fileWrapper').style.opacity = 1;
                that.forceStop = true;
            };
            that.fileName = that.file.name;
            //once the file is ready,start the visualizer
            that._start();
        }, false);
    },
    _start: function() {
        var that = this;
        const url = Visualizer.file;
        var audioContext = that.audioContext;

        if (audioContext === null) {
            return;
        }

        that._updateInfo('Fetching audio data', true);

        console.log(url)

        // Fetch the audio data from the URL
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.arrayBuffer(); // Convert the response to an ArrayBuffer
            })
            .then(arrayBuffer => {
                that._updateInfo('Decoding', true);
                audioContext.decodeAudioData(arrayBuffer, function(buffer) {
                    that._updateInfo('Decoding Sucessful, Starting Visualizer', true);
                    that._visualize(audioContext, buffer);
                }, function(e) {
                    that._updateInfo('!Fail to decode the audio data', false);
                    console.log(e);
                });
            })
            .catch(e => {
                that._updateInfo('!Fail to fetch the audio data', false);
                console.log(e);
            });
},
    _visualize: function(audioContext, buffer) {
            audioBufferSouceNode = audioContext.createBufferSource(),
            analyser = audioContext.createAnalyser(),
            that = this;
        //connect the source to the analyser
        audioBufferSouceNode.connect(analyser);
        //connect the analyser to the destination(the speaker), or we won't hear the sound
        analyser.connect(audioContext.destination);
        //then assign the buffer to the buffer source node
        audioBufferSouceNode.buffer = buffer;
        pregressBar();
        //play the source
        /*if (!audioBufferSouceNode.start) {
            audioBufferSouceNode.start = audioBufferSouceNode.noteOn //in old browsers use noteOn method
            audioBufferSouceNode.stop = audioBufferSouceNode.noteOff //in old browsers use noteOn method
        };*/
        //stop the previous sound if any
        if (this.animationId !== null) {
            try {
                cancelAnimationFrame(this.animationId);
            } catch(err) {
                console.log("No sound to stop.")
            }
        }
        /*if (this.source !== null) {
            this.source.stop(0);
        }*/
        audioBufferSouceNode.start(0);
        this.status = 1;
        this.source = audioBufferSouceNode;

        var buffer = audioBufferSouceNode.buffer;
        var length = buffer.length;

        setTimeout(function(){return},length)

        this._updateInfo('Playing ' + this.fileName, false);
        this.info = 'Playing ' + this.fileName;
        document.getElementById('fileWrapper').style.opacity = 0.2;
        this._drawSpectrum(analyser);
    },
    _drawSpectrum: function(analyser) {
        var that = this,
            canvas = document.getElementById('canvas'),
            cwidth = canvas.width,
            cheight = canvas.height,
            meterWidth = config.visualizer.meterWidth, //width of the meters in the spectrum
            gap = config.visualizer.meterGap, //gap between meters
            nextMeter = meterWidth + gap,
            capHeight = config.visualizer.capHeight,
            capStyle = newConfig.capStyle,
            meterNum = cwidth / (meterWidth + gap), //count of the meters
            capYPositionArray = []; ////store the vertical position of hte caps for the preivous frame
        ctx = canvas.getContext('2d'),
        gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(config.visualizer.color[0].position, config.visualizer.color[0].color);
        gradient.addColorStop(config.visualizer.color[1].position, config.visualizer.color[1].color);
        gradient.addColorStop(config.visualizer.color[2].position, config.visualizer.color[2].color);
        var drawMeter = function() {
            var array = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(array);
            if (that.status === 0) {
                //fix when some sounds end the value still not back to zero
                for (var i = array.length - 1; i >= 0; i--) {
                    array[i] = 0;
                };
                allCapsReachBottom = true;
                for (var i = capYPositionArray.length - 1; i >= 0; i--) {
                    allCapsReachBottom = allCapsReachBottom && (capYPositionArray[i] === 0);
                };
                if (allCapsReachBottom) {
                    //cancelAnimationFrame(that.animationId); //since the sound is top and animation finished, stop the requestAnimation to prevent potential memory leak,THIS IS VERY IMPORTANT!
                    return;
                };
            };
            /*// get last value in the array that is zero
            let lastEmptyCap = -1;
            for (let i = array.length - 1; i >= 0; i--) {
                if (array[i] !== 0) {
                    lastEmptyCap = i;
                    break;
                }
            }*/
            var step = Math.round(array.length / meterNum); //sample limited data from the total array
            ctx.clearRect(0, 0, cwidth, cheight);
            for (var i = 0; i < meterNum; i++) {
                var value = calculateLoudness(array[i * step]);
                if (capYPositionArray.length < Math.round(meterNum)) {
                    capYPositionArray.push(value);
                };
                ctx.fillStyle = capStyle;
                //draw the cap, with transition effect
                if (value < capYPositionArray[i]) {
                    ctx.fillRect(i * nextMeter, cheight - (--capYPositionArray[i]), meterWidth, capHeight);
                } else {
                    ctx.fillRect(i * nextMeter, cheight - value, meterWidth, capHeight);
                    capYPositionArray[i] = value;
                };
                ctx.fillStyle = gradient; //set the filllStyle to gradient for a better look
                ctx.fillRect(i * nextMeter, cheight - value + capHeight, meterWidth, cheight); //the meter
                /*
                ctx.beginPath();
                ctx.arc(i * nextMeter + meterWidth / 2, cheight - value + capHeight + meterWidth / 2, meterWidth / 2, 0, Math.PI * 2);
                ctx.fill();

                ctx.beginPath();
                ctx.arc(i * nextMeter + meterWidth / 2, cheight - value - meterWidth / 2 + (meterWidth / 2), meterWidth / 2, 0, Math.PI * 2);
                ctx.fill();
                */
            }
            that.animationId = requestAnimationFrame(drawMeter);
        }
        this.animationId = requestAnimationFrame(drawMeter);
    },
    _audioEnd: function(instance) {
        /*if (this.forceStop) {
            this.forceStop = false;
            this.status = 1;
            return;
        };*/
        this.status = 0;
        document.getElementById('title').style.transform = `translateX(0px)`;
        document.getElementById('artist').style.transform = `translateX(0px)`;
        offset = 0;
        nextSong();
        /*var text = 'HTML5 Audio Viusalizer';
        document.getElementById('fileWrapper').style.opacity = 1;
        document.getElementById('info').innerHTML = text;
        instance.info = text;
        document.getElementById('uploadedFile').value = '';*/
    },
    _updateInfo: function(text, processing) {
        var infoBar = document.getElementById('info'),
            dots = '...',
            i = 0,
            that = this;
        infoBar.innerHTML = text + dots.substring(0, i++);
        if (this.infoUpdateId !== null) {
            clearTimeout(this.infoUpdateId);
        };
        if (processing) {
            //animate dots at the end of the info text
            var animateDot = function() {
                if (i > 3) {
                    i = 0
                };
                infoBar.innerHTML = text + dots.substring(0, i++);
                that.infoUpdateId = setTimeout(animateDot, 250);
            }
            this.infoUpdateId = setTimeout(animateDot, 250);
        };
    }
};

start()
