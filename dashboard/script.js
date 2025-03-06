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

async function getAverageColor(img) {
    const fac = new FastAverageColor();
    const color = await fac.getColorAsync(img);
    return color
}

async function renderSongs() {
    document.getElementById('playlist').innerHTML = ""
    for (let idx = 0; idx < shuffled.length; idx++) {
        const itm = shuffled[idx];
        const color = await getAverageColor(`/images/albums/${itm.album}.jpg`);
        if (idx == song_idx) {
            document.getElementById('playlist').innerHTML += `
            <div class="song_item current_song" style="background: linear-gradient(90deg, ${color.hex}b0 0%, ${color.hex}30 100%);">
                <div class="data">
                    <img src="/images/albums/${itm.album}.jpg">
                    <div class="song_metadata">
                        <h1>${itm.name}</h1>
                        <h2>${itm.artist} <span class="dot"></span> ${itm.album}</h2>
                    </div>
                </div>
                <div class="progress-wrapper">
                    <div class="progress-bar" id="progress-bar">
                    <div class="progress" id="progress"></div>
                    <div id="time">
                        <span id="clock"></span>
                        <span id="clock_neg"></span>
                    </div>
                </div>
            </div>`;
        } else if (idx == song_idx - 1) {
            document.getElementById('playlist').innerHTML += `
            <div class="song_item prev_song" style="background: linear-gradient(90deg, ${color.hex}b0 0%, ${color.hex}30 100%);">
                <div class="data">
                    <img src="/images/albums/${itm.album}.jpg">
                    <div class="song_metadata">
                        <h1>${itm.name}</h1>
                        <h2>${itm.artist} <span class="dot"></span> ${itm.album}</h2>
                    </div>
                </div>
            </div>`;
        } else {
            document.getElementById('playlist').innerHTML += `
            <div class="song_item" style="background: linear-gradient(90deg, ${color.hex}b0 0%, ${color.hex}30 100%);">
                <div class="data">
                    <img src="/images/albums/${itm.album}.jpg">
                    <div class="song_metadata">
                        <h1>${itm.name}</h1>
                        <h2>${itm.artist} <span class="dot"></span> ${itm.album}</h2>
                    </div>
                </div>
            </div>`;
        };
    };
};

/* document.onmousemove = coolEffect;
function coolEffect(event) {
    const songListItems = document.querySelectorAll('.song_item');
    const posY = event.clientY + window.scrollY;

    songListItems.forEach(listItem => {
        const rect = listItem.getBoundingClientRect();
        const listItemY = (rect.top + (rect.height / 2)) + window.scrollY; // Get the Y position of the child div
        const distance = Math.abs(posY - listItemY); // Calculate the vertical distance

        // Scale factor based on distance (you can adjust the scaling factor)
        const scale = Math.max(1.2 - distance / 720, 1); // Scale down to a minimum of 0.5
        listItem.style.transform = `scale(${scale * 100}%)`;
    });
}; */