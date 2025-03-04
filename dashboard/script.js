function shuffle() {
    fetch('/api/shuffle');
    setTimeout(function(){location.reload()},500)
}
shuffled
for (let idx = 0; idx < shuffled.length; idx++) {
    const itm = shuffled[idx];
    document.getElementById('playlist').innerHTML += `
    <div class="song_item">
        <img src="/images/albums/${itm.album}.jpg">
        <div class="song_metadata">
            <h1>${itm.name}</h1>
            <h2>${itm.artist} • ${itm.album}</h2>
        </div>
    </div>`
}