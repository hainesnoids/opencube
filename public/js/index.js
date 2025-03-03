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

function start() {
    Visualizer.prototype._prepareAPI();
    Visualizer.prototype._start();
}

async function pregressBar() {
    const progress = document.getElementById('progress');
    var buffer = audioBufferSouceNode.buffer;
    proglength = buffer.duration;
    var i = 0
    function updateProgress() {
        i = i + 0.2
        progress.style.width = (i / proglength) * 100 + '%'; // Convert to percentage
        if (i >= Math.floor(proglength)) {
            clearInterval(intervalId);
            Visualizer.prototype._audioEnd();
        }
        progtimestamp = buffer.duration;
        const timeLeft = progtimestamp - i;
        document.getElementById('clock').innerText = `${Math.floor(i / 60)}:${(Math.floor(i) % 60).toString().padStart(2,'0')}`
        document.getElementById('clock_neg').innerText = `-${Math.floor(timeLeft / 60)}:${(Math.floor(timeLeft) % 60).toString().padStart(2, '0')}`;
    }
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
    idx = 1;
    Visualizer.status = 1;
    Visualizer.prototype._start;
}

async function nextSong() {
    idx++ // increase song index by 1
    if (idx >= shuffled.length) {
        idx = 1;
        location = ''
    }
    Visualizer.file = shuffled[idx].url;
    Visualizer.status = 1;
    setMetadata(shuffled[idx]);
    start()
}

async function setMetadata(data) {
    document.getElementById('title').innerText = data.name;
    document.getElementById('artist').innerText = data.artist;
    document.getElementById('album').innerText = data.album;
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
        if (!audioBufferSouceNode.start) {
            audioBufferSouceNode.start = audioBufferSouceNode.noteOn //in old browsers use noteOn method
            audioBufferSouceNode.stop = audioBufferSouceNode.noteOff //in old browsers use noteOn method
        };
        //stop the previous sound if any
        if (this.animationId !== null) {
            cancelAnimationFrame(this.animationId);
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
                    cancelAnimationFrame(that.animationId); //since the sound is top and animation finished, stop the requestAnimation to prevent potential memory leak,THIS IS VERY IMPORTANT!
                    return;
                };
            };
            var step = Math.round(array.length / meterNum); //sample limited data from the total array
            ctx.clearRect(0, 0, cwidth, cheight);
            for (var i = 0; i < meterNum; i++) {
                var value = array[i * step];
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
}

start()