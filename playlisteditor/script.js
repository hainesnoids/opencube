var song_idx = -1;

async function renderSongs() {
    const plist = await fetch('/playlist')
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
    console.log(plist);

    document.getElementById('playlist').innerHTML = ""
    for (let idx = 0; idx < plist.length; idx++) {
        const itm = plist[idx];

        const albumContainer = document.createElement('div');
        albumContainer.setAttribute('class', "album_item");
        albumContainer.setAttribute ('id', itm.album);
        albumContainer.innerHTML = `
            <div class="album_details">
                <img src="/images/albums/${itm.album}.jpg">
                <div class="album_metadata">
                    <h1>${itm.album}</h1>
                    <h2>${itm.songs[0].artist}</h2>
                </div>
            </div>`

        const songList = document.createElement('div');
        songList.setAttribute('class', "album_song_list");
        songList.setAttribute('id', itm.name);
        albumContainer.appendChild(songList);

        for (let imx = 0; imx < itm.songs.length; imx++) {
            const idm = itm.songs[imx];
            const songItem = document.createElement('div');
            songItem.setAttribute('class', "song_item");
            songItem.setAttribute = ('id', idm.name);
            songItem.innerHTML = `
            <div class="data">
                <div class="song_metadata">
                    <h1>${idm.name}</h1>
                    <h2>${idm.artist}</h2>
                </div>
            </div>`;
            songList.appendChild(songItem);
        };

        document.getElementById('playlist').appendChild(albumContainer);
    };
};

renderSongs()