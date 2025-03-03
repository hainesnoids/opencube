const express = require('express');
const path = require('path');
const fs = require('fs').promises
const app = express();
const PORT = 80;

app.use(express.static(path.join(__dirname, 'public')));
app.listen(PORT, () => {});

app.use('/dashboard', express.static(path.join(__dirname, 'dashboard')));

console.log(`OpenCube is now running at http://localhost:${PORT}`)
console.log(`Access the dashboard at http://localhost:${PORT}/dashboard`)

// shuffle playlist
async function shufflePlaylist() {
    var data = await fs.readFile(path.join(__dirname, 'playlist.json'))
    var array = JSON.parse(data);
    var i = 0,
	    j = 0,
	    temp = null
	for (i = array.length - 1; i > 0; i -= 1) {
		j = Math.floor(Math.random() * (i + 1));
		temp = array[i];
		array[i] = array[j];
		array[j] = temp;
	}
    const content = `const shuffled = ${JSON.stringify(array, null, 2)};`;

    const filePath = path.join(__dirname, 'public', 'js', 'playlist.js');

    fs.writeFile(filePath, content, (err) => {
    if (err) {
        console.error('Error writing to file', err);
    } else {
        console.log('Playlist written to playlist.js');
    }})
}
shufflePlaylist()

// dashboard shit
app.get('/api/shuffle', (req, res) => {
    shufflePlaylist()
    res.json({ message: "Done" });
});