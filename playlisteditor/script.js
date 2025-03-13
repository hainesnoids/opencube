var song_idx = -1;
var plist;

async function fetchSongs() {
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
                url: song.url
            });
            return acc;
        }, {});
        const sorted = Object.entries(groupedByAlbum).map(([album, songs]) => ({ album, songs }));
        return sorted;
    });
};

function renderSongs() {
    console.log(plist);

    document.getElementById('playlist').innerHTML = ""
    for (let idx = 0; idx < plist.length; idx++) {
        const itm = plist[idx];

        const albumContainer = document.createElement('div');
        albumContainer.setAttribute('class', "album_item");
        albumContainer.setAttribute ('id', itm.album);
        albumContainer.setAttribute ('data-id', idx);
        if (itm.songs[0].artist == undefined) {
            artist = "Set the first song's artist to change thos"
        } else {
            artist = itm.songs[0].artist
        }
        albumContainer.innerHTML = `
            <div class="album_details">
                <button class="cover_art_btn" data-id="${idx}" onclick='uploadCoverArt(${idx})'>
                    <img src="/images/albums/${itm.album}.jpg">
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
    plist.push({"album": "Album Name","songs": [{"name": "Untitled Song","artist": "Album Artist","url": "/songs/test.wav"}]});
    renderSongs();
};

async function addSong(id) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'audio/*';
    input.onchange = async (event) => {
        const file = event.target.files[0];
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
    };

    input.click();
}

async function uploadCoverArt(id) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg'; // currently only supports jpeg due to the entire system only supporting .jpg, blame me 2 weeks ago
    input.onchange = async (event) => {
        const file = event.target.files[0];
        

        if (file) {
            const formData = new FormData();
            formData.append('songFile', file, `${plist[id].album}.jpg`);
            try {
                const response = await fetch('/api/uploadcoverart', {
                    method: 'POST',
                    body: formData
                });
                if (response.ok) {
                    const result = await response.json();
                    console.log('File uploaded successfully:', result);
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
    if (songIdx == -1) {
        plist.splice(albumIdx, 1);
    } else {
        plist[albumIdx].songs.splice(songIdx, 1);
    }
    renderSongs();
}

function songData(albumIdx, songIdx, type) {
    if (type == 'title') {
        const input = document.querySelector(`.title_input[data-id="${albumIdx}"][data-song-id="${songIdx}"]`);
        plist[albumIdx].songs[songIdx].name = input.value;
    } else if (type == 'artist') {
        const input = document.querySelector(`.artist_input[data-id="${albumIdx}"][data-song-id="${songIdx}"]`);
        plist[albumIdx].songs[songIdx].artist = input.value;
    } else if (type == 'album') {
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

fetchSongs();
setTimeout(renderSongs, 500);