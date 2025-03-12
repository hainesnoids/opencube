var song_idx = -1;
let playlist = [];

async function renderSongs() {
    const plist = await fetch('/playlist')
        .then(response => response.json())
        .then(data => {
            playlist = data;
            return data;
        })
        .catch(err => {
            console.error('Error fetching playlist:', err);
            return [];
        });
    console.log('Rendered playlist:', plist);

    document.getElementById('playlist').innerHTML = "";
    for (let idx = 0; idx < plist.length; idx++) {
        const song = plist[idx];
        const songItem = document.createElement('div');
        songItem.setAttribute('class', "song_item");
        songItem.setAttribute('id', song.url.replace(/[^a-zA-Z0-9]/g, '_')); // Unique ID from URL
        songItem.innerHTML = `
            <div class="data">
                <img src="/images/albums/${song.album}.jpg" onerror="this.src='/images/Default.jpg'">
                <div class="song_metadata">
                    <h1>${song.name}</h1>
                    <h2>${song.artist}</h2>
                </div>
                <button onclick="removeSong('${song.url.replace(/'/g, "\\'")}')">Remove</button>
            </div>`;
        document.getElementById('playlist').appendChild(songItem);
    }
}

async function addSong() {
    const fileInput = document.getElementById('songFileInput');
    if (!fileInput.files.length) {
        alert('Please select a song file to upload.');
        return;
    }

    const formData = new FormData();
    formData.append('song', fileInput.files[0]);

    try {
        const response = await fetch('/api/upload-song', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();
        if (result.message === 'Song uploaded and processed') {
            playlist.push(result.song);
            renderSongs();
        } else {
            alert('Error uploading song: ' + result.message);
        }
    } catch (err) {
        console.error('Error uploading song:', err);
        alert('Error uploading song');
    }

    fileInput.value = ''; // Clear input
}

function removeSong(songUrl) {
    console.log('Removing song with URL:', songUrl); // Debug log
    playlist = playlist.filter(song => song.url !== songUrl);
    savePlaylist();
    renderSongs();
}

async function savePlaylist() {
    try {
        const response = await fetch('/api/save/playlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(playlist)
        });
        const result = await response.json();
        console.log(result.message);
    } catch (err) {
        console.error('Error saving playlist:', err);
    }
}

renderSongs();