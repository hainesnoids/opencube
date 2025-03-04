var song_idx = -1;

function shuffle() {
    fetch('/api/shuffle');
    clearInterval(updateProgressBar)
    setTimeout(function(){location.reload()},500)
};

function pregressBar() {
    fetch('clientData.json')
        .then(response => response.json())
        .then(data => {
            timeLeft = data.songLength - data.songProgress
            if (song_idx == -1) { // initialize data
                song_idx = data.song
                renderSongs()
            }
            if (data.song == song_idx) {
                song_idx = data.song
                document.getElementById("progress").style.width = `${(data.songProgress / data.songLength) * 100}%`
                document.getElementById("clock").innerText = `${Math.floor(data.songProgress / 60)}:${(Math.floor(data.songProgress) % 60).toString().padStart(2,'0')}`
                document.getElementById("clock_neg").innerText = `-${Math.floor(timeLeft / 60)}:${(Math.floor(timeLeft) % 60).toString().padStart(2, '0')}`
            } else {
                song_idx = data.song
                renderSongs()
            }
        })
};

const updateProgressBar = setInterval(pregressBar,1000);

function renderSongs() {
    document.getElementById('playlist').innerHTML = ""
    for (let idx = 0; idx < shuffled.length; idx++) {
        const itm = shuffled[idx];
        if (idx == song_idx) {
            document.getElementById('playlist').innerHTML += `
            <div class="song_item current_song">
                <div class="data">
                    <img src="/images/albums/${itm.album}.jpg">
                    <div class="song_metadata">
                        <h1>${itm.name}</h1>
                        <h2>${itm.artist} • ${itm.album}</h2>
                        <div class="progress-wrapper">
                            <div id="time">
                                <span id="clock"></span>
                                <span id="clock_neg"></span>
                            </div>
                            <div class="progress-bar" id="progress-bar">
                            <div class="progress" id="progress"></div>
                        </div>
                    </div>
                </div>
            </div>`;
        } else {
            document.getElementById('playlist').innerHTML += `
            <div class="song_item">
                <div class="data">
                    <img src="/images/albums/${itm.album}.jpg">
                    <div class="song_metadata">
                        <h1>${itm.name}</h1>
                        <h2>${itm.artist} • ${itm.album}</h2>
                    </div>
                </div>
            </div>`;
        };
    };
};

setTimeout(renderSongs,500);