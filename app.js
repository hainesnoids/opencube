const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs').promises
const bodyParser = require('body-parser');
const app = express();
const PORT = 80;

app.use(express.static(path.join(__dirname, 'public')));
app.listen(PORT, () => {});

app.use('/dashboard', express.static(path.join(__dirname, 'dashboard')));
app.use('/playlisteditor', express.static(path.join(__dirname, 'playlisteditor')));
app.use('/playlist', express.static(path.join(__dirname, 'playlist.json')));
app.use('/api/save', bodyParser.json());

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
    const content2 = JSON.stringify(array, null, 2);;

    const filePath = path.join(__dirname, 'public', 'js', 'playlist.js');
    const filePath2 = path.join(__dirname, 'public', 'js', 'playlist.json');

    fs.writeFile(filePath, content, (err) => {
    if (err) {
        console.error('Error writing to file', err);
    } else {
        console.log('Playlist written to playlist.js');
    }})

    fs.writeFile(filePath2, content2, (err) => {
        if (err) {
            console.error('Error writing to file', err);
        } else {
            console.log('Playlist written to playlist.js');
        }})
}
shufflePlaylist()

var doirefresh = false

app.get('/api/shuffle', (req, res) => {
    shufflePlaylist()
    doirefresh = true
    res.json({ message: "Done" });
});
app.get('/api/refresh', (req, res) => { // refresh the player
    doirefresh = true
    res.json({ message: "Done" });
});
app.get('/api/song', (req, res) => {
    res.json({ message: "Done" });
});
app.get('/api/advanceplaylist', (req, res) => { // currently does nothing
    res.json({ message: "Done" });
});
app.get('/api/doirefresh', (req, res) => {
    res.json({ message: doirefresh });
    doirefresh = false
});
app.post('/api/save/songlength', (req, res) => {
    var data = req.body;
    const filePath = path.join(__dirname, 'dashboard', 'clientData.json');
    const content = JSON.stringify({ "songLength": data.proglength });
    fs.writeFile(filePath, content)
    res.json({ message: "Done" });
});
app.post('/api/save/songdata', (req, res) => {
    var data = req.body;
    const filePath = path.join(__dirname, 'dashboard', 'clientData.json');
    const content = JSON.stringify({ "songLength": data.proglength, "songProgress": data.i, "song": data.idx });
    fs.writeFile(filePath, content)
    res.json({ message: "Done" });
});

app.use('/api/uploadsong', fileUpload());
app.post('/api/uploadsong', (req, res) => {
    let songFile;
    let uploadPath;

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    songFile = req.files.songFile;
    uploadPath = path.join(__dirname, 'public', 'songs', songFile.name);

    songFile.mv(uploadPath, function(err) {
        if (err) return res.status(500).send(err);
        res.json({ message: "Song uploaded successfully." });
        console.warn('! Song uploaded:', songFile.name);
    });
});

app.use('/api/uploadcoverart', fileUpload());
app.post('/api/uploadcoverart', (req, res) => {
    let songFile;
    let uploadPath;

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    songFile = req.files.songFile;
    uploadPath = path.join(__dirname, 'public', 'images', 'albums', songFile.name);

    songFile.mv(uploadPath, function(err) {
        if (err) return res.status(500).send(err);
        res.json({ message: "Album art uploaded successfully." });
    });
});

app.post('/api/save/playlist', async (req, res) => {
    var data = req.body;
    const filePath = path.join(__dirname, 'playlist.json');
    const content = JSON.stringify(data, null, 2);
    await fs.writeFile(filePath, content);
    res.json({ message: "Done" });
    console.log('!!! Playlist Updated');
});