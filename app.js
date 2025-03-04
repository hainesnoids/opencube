const express = require('express');
const path = require('path');
const fs = require('fs').promises
const bodyParser = require('body-parser');
const app = express();
const PORT = 80;

function getLocalIp(){
    'use strict';

    const { networkInterfaces } = require('os');

    const nets = networkInterfaces();
    const results = {}; // Or just '{}', an empty object

    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
            // 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
            const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
            if (net.family === familyV4Value && !net.internal) {
                if (!results[name]) {
                    results[name] = [];
                }
                results[name].push(net.address);
            }
        }
    }
    return results["en0"][0]
}

app.use(express.static(path.join(__dirname, 'public')));
app.listen(PORT, () => {});

app.use('/dashboard', express.static(path.join(__dirname, 'dashboard')));
app.use('/api/save', bodyParser.json());

console.log(`OpenCube is now running at http://localhost:${PORT}`)
console.log(`Access the dashboard at http://${getLocalIp()}:${PORT}/dashboard`)

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

var doirefresh = false

app.get('/api/shuffle', (req, res) => {
    shufflePlaylist()
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