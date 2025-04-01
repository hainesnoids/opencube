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
                song_idx = data.song;
                renderSongs();
            }
            if (data.song == song_idx) {
                song_idx = data.song
                document.getElementById("progress").style.width = `${(data.songProgress / data.songLength) * 100}%`
                document.getElementById("clock").innerText = `${Math.floor(data.songProgress / 60)}:${(Math.floor(data.songProgress) % 60).toString().padStart(2,'0')}`
                document.getElementById("clock_neg").innerText = `-${Math.floor(timeLeft / 60)}:${(Math.floor(timeLeft) % 60).toString().padStart(2, '0')}`
            } else {
                song_idx = data.song
                updateSongs(false)
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
    document.getElementById('playlist').innerHTML = "";
    document.getElementById('status-label').innerText = `Loading 0/${shuffled.length}`;
    for (let idx = 0; idx < shuffled.length; idx++) {
        const itm = shuffled[idx];
        const color = await getAverageColor(`/images/albums/${itm.album}.jpg`);
        songItem = document.createElement('div');
        songItem.classList = 'song_item';
        songItem.setAttribute('data-id', idx);
        songItem.style.background = `linear-gradient(90deg, ${color.hex}b0 0%, ${color.hex}30 100%)`;
        songItem.addEventListener("mouseover",(event) => {hoverEffect(event)});

        songData = document.createElement('div');
        songData.classList = 'data';
        songData.setAttribute('data-id', idx);
        songData.innerHTML = `
            <div class="art_wrapper">
                <img class="song_art" src="/images/albums/${itm.album}.jpg">
            </div>
            <div class="song_metadata">
                <h1>${itm.name}</h1>
                <h2>${itm.artist} <span class="dot"></span> ${itm.album}</h2>
            </div>
        `;
        songItem.appendChild(songData);
        document.getElementById('playlist').appendChild(songItem);
        document.getElementById('status-label').innerText = `Loading ${idx + 1}/${shuffled.length}`;
    };
    updateSongs();
    document.getElementById('status-label').innerText = ``;
};

async function updateSongs(firstRun) {
    if (firstRun == false) {
        document.querySelectorAll(`.progress-wrapper`).forEach(itm => {
            itm.remove();
        });
        document.querySelectorAll(`.song_item`).forEach((itm) => {
            itm.classList.remove('current_song');
        })
        prevSong = document.querySelector(`.song_item[data-id="${song_idx - 1}"]`);
        console.log(prevSong);
        prevSong.classList.remove('current_song');
    }

    // add new progress bar
    currentSong = document.querySelector(`.song_item[data-id="${song_idx}"]`);
    currentSong.innerHTML += `
    <div class="progress-wrapper" data-id="${song_idx}">
        <div class="progress-bar" id="progress-bar">
        <div class="progress" id="progress"></div>
        <div id="time">
            <span id="clock"></span>
            <span id="clock_neg"></span>
        </div>
    </div>
    `;
    currentSong.classList.add('current_song');

    setTimeout(() => {
    var headOffset;
    var headStyles = window.getComputedStyle(document.getElementsByClassName('button_wrapper')[0])
    if (headStyles.getPropertyValue('display') == 'none' || headStyles.getPropertyValue('visibility') == 'hidden') { // check if header is hidden by CSS
        headOffset = 0;
    } else {
        headOffset = 40;
    };
    document.documentElement.scrollTo({
        top: currentSong.offsetTop - headOffset + 0, // account for header
        behavior: "smooth",
    });
    }, 0);
}

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

function hoverEffect(event) {
    const itm = event.target;

    if (itm.localName == 'img') {
        const onMouseMove = (mouseEvent) => {
            const rect = itm.getBoundingClientRect();

            const curX = mouseEvent.clientX;
            const curY = mouseEvent.clientY;

            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const x = (curX - centerX) / 1;
            const y = (curY - centerY) / 1;

            // const scale = Math.max(1.2 - distance / 720, 1); // Scale down to a minimum of 0.5
            itm.style.transform = `rotateX(${y}deg) rotateY(${-x}deg)`;
            itm.parentNode.style.zIndex = "999";
            itm.parentNode.style.transform = 'scale(150%)'
        }
        const onMouseLeave = () => {
            itm.style.transform = ''; // Reset the transform
            itm.parentNode.style.zIndex = 'unset';
            itm.parentNode.style.transform = 'scale(100%)'
            itm.removeEventListener('mousemove', onMouseMove);
            itm.removeEventListener('mouseleave', onMouseLeave);
        };

        itm.addEventListener('mousemove', onMouseMove);
        itm.addEventListener('mouseleave', onMouseLeave);
    }
}