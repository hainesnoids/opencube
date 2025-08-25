let plist,
    dialog;

async function fetchSongs() {
    dialog = document.querySelector('#textAlert');
    plist = await fetch('/playlist')
    .then(response => response.json())
    .then(data => {
        const groupedByAlbum = data.reduce((acc, song) => {
            if (!acc[song.album]) {
                acc[song.album] = [];
            }
            acc[song.album].push({
                name: song.name,
                artist: song.artist,
                coverArt: song.coverArt,
                albumArt: song.albumArt,
                url: song.url
            });
            return acc;
        }, {});
        const sorted = Object.entries(groupedByAlbum).map(([album, songs]) => ({ album, songs }));
        let updateBounce = false;
        for (let idx = 0; idx < sorted.length; idx++) {
            let itm = sorted[idx];
            // insert album art
            if (itm.songs[0].albumArt) {
                // there is album art, continue on
                itm.coverArt = itm.songs[0].albumArt;
            } else {
                // playlist file is outdated, add the property to the album
                if (!updateBounce) {
                    ocAlert("Performing necessary updates to your music library, please wait...");
                    updateBounce = true;
                }
                itm.coverArt = `/images/albums/${itm.album.replaceAll("\?","%3F")}.jpg`;
                for (let jdx = 0; jdx < itm.songs.length; jdx++) {
                    const jtm = itm.songs[jdx];
                    jtm.coverArt = `/images/albums/${itm.album.replaceAll("\?","%3F")}.jpg`;
                    jtm.albumArt = `/images/albums/${itm.album.replaceAll("\?","%3F")}.jpg`;
                }
            }
        }
        setTimeout(() => {dialog.close();},1000) // close dialog if opened (with cooldown because I said so)
        return sorted;
    });
}

function renderSongs() {
    console.log(plist);

    document.getElementById('playlist').innerHTML = ""
    for (let idx = 0; idx < plist.length; idx++) {
        const itm = plist[idx];

        const albumContainer = document.createElement('div');
        albumContainer.setAttribute('class', "album_item");
        albumContainer.setAttribute ('id', itm.album);
        albumContainer.setAttribute ('data-id', idx);
        if (itm.songs[0].artist === undefined) {
            artist = "Set the first song's artist to change this"
        } else {
            artist = itm.songs[0].artist
        }
        albumContainer.innerHTML = `
            <div class="album_details">
                <button class="cover_art_btn${itm.coverArt === "" ? " noArt" : ""}" data-id="${idx}" onclick='uploadCoverArt(${idx})'>
                    ${itm.coverArt === "" ? '<span class="material-symbols-outlined">add</span>' : `<img src="${itm.coverArt}" alt=""/>`}
                </button>
                <div class="album_metadata">
                    <input type="text" class="album_input" data-id="${idx}" data-song-id="1" onchange="songData(${idx}, 1, 'album')" value="${itm.album}">
                    <h2>${artist}</h2>
                </div>
                <button class="remove-button" data-id="${idx}" data-song-id="-1" onclick='removeSong(${idx}, -1)'><span class="material-symbols-outlined">remove</span></button>
            </div>`

        const songList = document.createElement('div');
        songList.setAttribute('class', "album_song_list");
        songList.setAttribute('id', itm.name);
        albumContainer.appendChild(songList);

        for (let imx = 0; imx < itm.songs.length; imx++) {
            const idm = itm.songs[imx];
            const songItem = document.createElement('div');
            songItem.setAttribute('class', "song_item");
            songItem.setAttribute('id', idm.name);
            songItem.setAttribute('data-id', idx);
            songItem.setAttribute('data-song-id', imx);
            songItem.innerHTML = `
            <div class="data">
                <button class="cover_art_btn songArt" data-id="${idx}" onclick='uploadCoverArt(${idx},${imx})'>
                    <img src="${idm.coverArt}" alt=""/>
                </button>
                <div class="song_metadata">
                    <input type="text" class="title_input" data-id="${idx}" data-song-id="${imx}" onchange="songData(${idx}, ${imx}, 'title')" value="${idm.name}">
                    <input type="text" class="artist_input" data-id="${idx}" data-song-id="${imx}" onchange="songData(${idx}, ${imx}, 'artist')" value="${idm.artist}">
                </div>
                <button class="remove-button" data-id="${idx} data-song-id="${imx}" onclick='removeSong(${idx}, ${imx})'><span class="material-symbols-outlined">remove</span></button>
            </div>`;
            songList.appendChild(songItem);

            /* const removeButton = document.createElement('button');
            removeButton.setAttribute('class', "remove-button");
            removeButton.setAttribute('data-id', idx);
            removeButton.setAttribute('data-song-id', imx);
            removeButton.setAttribute('onclick', `removeSong(${idx}, ${imx})`);
            removeButton.innerHTML = '<span class="material-symbols-outlined">remove</span>';
            songItem.appendChild(removeButton); */
        };
        const addButton = document.createElement('button');
        addButton.setAttribute('class', "add_song_btn");
        addButton.setAttribute('data-id', idx);
        addButton.setAttribute('onclick', `addSong(${idx})`);
        addButton.setAttribute('name', 'song');
        addButton.innerHTML = '<span class="material-symbols-outlined">add</span>';
        albumContainer.appendChild(addButton);

        document.getElementById('playlist').appendChild(albumContainer);
    };
};

function addEmptyAlbum() {
    plist.push({"album": "Album Name", "coverArt": "","songs": [{"name": "Untitled Song","artist": "Album Artist","coverArt": "","albumArt": "","url": "/songs/test.wav"}]});
    renderSongs();
}

async function addSong(id) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'audio/*';
    input.multiple = true;
    input.onchange = async (event) => {
        for (let idx = 0; idx < event.target.files.length; idx++) {
            const file = event.target.files[idx];
            if (file) {
                const formData = new FormData();
                formData.append('songFile', file);
                try {
                    const response = await fetch('/api/uploadsong', {
                        method: 'POST',
                        body: formData
                    });
                    if (response.ok) {
                        const result = await response.json();
                        console.log('File uploaded successfully:', result);
                        plist[id].songs.push({
                            name: file.name,
                            artist: "Unknown Artist",
                            url: `/songs/${file.name}`
                        });
                        renderSongs();
                    } else {
                        console.error('File upload failed:', response.statusText);
                    }
                } catch (error) {
                    console.error('Error uploading file:', error);
                }
            }
        }
    };

    input.click();
}

async function uploadCoverArt(id,songId = -1) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*'; // supports any image now
    input.onchange = async (event) => {
        const file = event.target.files[0];

        if (file) {
            const formData = new FormData();
            formData.append('songFile', file, file.name);
            try {
                const response = await fetch('/api/uploadcoverart', {
                    method: 'POST',
                    body: formData
                });
                if (response.ok) {
                    const result = await response.json();
                    console.log('File uploaded successfully:', result);
                    // set album art parameters
                    const artPath = result["path"];
                    if (songId === -1) {
                        plist[id].coverArt = artPath;
                        for (let jdx = 0; jdx < plist[id].songs.length; jdx++) {
                            plist[id].songs[jdx].coverArt = artPath;
                            plist[id].songs[jdx].albumArt = artPath;
                        }
                    } else {
                        plist[id].songs[songId].coverArt = artPath;
                    }
                    setTimeout(renderSongs,500);
                } else {
                    console.error('File upload failed:', response.statusText);
                }
            } catch (error) {
                console.error('Error uploading file:', error);
            }
        }
    };

    input.click();
}

function removeSong(albumIdx, songIdx) {
    if (songIdx === -1) {
        plist.splice(albumIdx, 1);
    } else {
        plist[albumIdx].songs.splice(songIdx, 1);
    }
    renderSongs();
}

function songData(albumIdx, songIdx, type) {
    if (type === 'title') {
        const input = document.querySelector(`.title_input[data-id="${albumIdx}"][data-song-id="${songIdx}"]`);
        plist[albumIdx].songs[songIdx].name = input.value;
    } else if (type === 'artist') {
        const input = document.querySelector(`.artist_input[data-id="${albumIdx}"][data-song-id="${songIdx}"]`);
        plist[albumIdx].songs[songIdx].artist = input.value;
    } else if (type === 'album') {
        const input = document.querySelector(`.album_input[data-id="${albumIdx}"]`);
        plist[albumIdx].album = input.value;
    } else {
        console.log("lol")
    }
    // because we are pulling from text fields, re-rendering the song list now would just unfocus the user
}

async function savePlaylist() {
    // reformat plist to match the server's expected format
    const data = plist.reduce((acc, album) => {
        const songs = album.songs.map(song => ({
            name: song.name,
            artist: song.artist,
            album: album.album,
            coverArt: song.coverArt,
            albumArt: song.albumArt,
            url: song.url
        }));
        return acc.concat(songs);
    }, []);
    // results can now be written to playlist.json

    console.log(JSON.stringify(data))
    fetch('/api/save/playlist', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })

    console.log(data);
}

async function ocAlert(msg) {
    dialog = document.querySelector('#textAlert');
    const message = dialog.querySelector('span');
    message.innerHTML = msg;
    dialog.addEventListener('cancel', (event) => {
        event.preventDefault();
    });
    dialog.showModal();
}

document.addEventListener('DOMContentLoaded', async () => {
    await fetchSongs();
    await renderSongs();
});

let songArtVisible = false;
function toggleSongArt() {
    document.body.style.setProperty('--art-visible', songArtVisible === false ? 'flex' : 'none');
    songArtVisible = songArtVisible === false
}

document.addEventListener('keyup',(e) => {
    if (e.key === "Shift") {
        toggleSongArt();
    }
})