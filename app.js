/*
 * Copyright (c) 2025 Weather Ranch, Hainesnoids & Brenden
 * All rights reserved.
 * 
 * This code is proprietary and may not be used without permission.
 */

const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const bodyParser = require('body-parser');
const multer = require('multer');
const musicMetadata = require('music-metadata');
const axios = require('axios');
const app = express();
const PORT = 80;

// Multer setup for file uploads
const upload = multer({ dest: 'public/songs/' });

function getLocalIp() {
    'use strict';
    const { networkInterfaces } = require('os');
    const nets = networkInterfaces();
    for (const name of Object.keys(nets)) {
        const interfaces = nets[name];
        for (const net of interfaces) {
            const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4;
            if (net.family === familyV4Value && !net.internal) {
                return net.address;
            }
        }
    }
    return '127.0.0.1';
}

app.use(express.static(path.join(__dirname, 'public')));
app.use('/playlister', express.static(path.join(__dirname, 'public', 'playlister')));
app.listen(PORT, () => {});

app.use('/dashboard', express.static(path.join(__dirname, 'dashboard')));
app.use('/api/save', bodyParser.json());

// Serve playlist.json
app.get('/playlist', (req, res) => {
    const filePath = path.join(__dirname, 'playlist.json');
    fs.readFile(filePath)
        .then(data => res.json(JSON.parse(data)))
        .catch(() => res.json([]));
});

// Upload song and process metadata
app.post('/api/upload-song', upload.single('song'), async (req, res) => {
    try {
        const filePath = path.join(__dirname, 'public', 'songs', req.file.filename);
        const originalName = req.file.originalname;
        const songName = path.parse(originalName).name;

        await fs.rename(filePath, path.join(__dirname, 'public', 'songs', originalName));
        const newFilePath = path.join(__dirname, 'public', 'songs', originalName);

        const metadata = await musicMetadata.parseFile(newFilePath);
        const songData = {
            name: metadata.common.title || songName,
            artist: metadata.common.artist || 'Unknown Artist',
            album: metadata.common.album || 'Unknown Album',
            url: `/songs/${originalName}`
        };

        let albumArtFile = `${songData.album}.jpg`;
        const albumArtPath = path.join(__dirname, 'public', 'images', 'albums', albumArtFile);

        if (metadata.common.picture && metadata.common.picture.length > 0) {
            const picture = metadata.common.picture[0];
            await fs.writeFile(albumArtPath, picture.data);
        } else {
            const apiKey = 'YOUR_LASTFM_API_KEY';
            const url = `http://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=${apiKey}&artist=${encodeURIComponent(songData.artist)}&album=${encodeURIComponent(songData.album)}&format=json`;
            const response = await axios.get(url);
            const imageUrl = response.data.album?.image?.find(img => img.size === 'large')?.['#text'];
            if (imageUrl) {
                const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
                await fs.writeFile(albumArtPath, Buffer.from(imageResponse.data));
            } else {
                albumArtFile = 'Default';
            }
        }

        songData.album = albumArtFile.replace('.jpg', '');

        let playlist = [];
        try {
            const data = await fs.readFile(path.join(__dirname, 'playlist.json'));
            playlist = JSON.parse(data);
        } catch (err) {}
        playlist.push(songData);
        await fs.writeFile(path.join(__dirname, 'playlist.json'), JSON.stringify(playlist, null, 2));

        res.json({ message: 'Song uploaded and processed', song: songData });
    } catch (err) {
        console.error('Error processing upload:', err);
        res.status(500).json({ message: 'Error uploading song' });
    }
});

// Save updated playlist
app.post('/api/save/playlist', bodyParser.json(), async (req, res) => {
    try {
        const playlistData = req.body;
        const filePath = path.join(__dirname, 'playlist.json');
        await fs.writeFile(filePath, JSON.stringify(playlistData, null, 2));
        console.log('Playlist saved to playlist.json');
        res.json({ message: 'Playlist saved' });
    } catch (err) {
        console.error('Error saving playlist:', err);
        res.status(500).json({ message: 'Error saving playlist' });
    }
});

console.log(`OpenCube is now running at http://localhost:${PORT}`);
console.log(`Access the playlister at http://${getLocalIp()}:${PORT}/playlister`);

async function shufflePlaylist() {
    try {
        const data = await fs.readFile(path.join(__dirname, 'playlist.json'));
        let array = JSON.parse(data);
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        const content = `const shuffled = ${JSON.stringify(array, null, 2)};`;
        const filePath = path.join(__dirname, 'public', 'js', 'playlist.js');
        await fs.writeFile(filePath, content);
        console.log('Playlist written to playlist.js');
    } catch (err) {
        console.error('Error in shufflePlaylist:', err);
    }
}
shufflePlaylist();

let doirefresh = false;

app.get('/api/shuffle', (req, res) => {
    shufflePlaylist();
    doirefresh = true;
    res.json({ message: "Done" });
});

app.get('/api/song', (req, res) => {
    res.json({ message: "Done" });
});

app.get('/api/advanceplaylist', (req, res) => {
    res.json({ message: "Done" });
});

app.get('/api/doirefresh', (req, res) => {
    res.json({ message: doirefresh });
    doirefresh = false;
});

app.post('/api/save/songlength', (req, res) => {
    const data = req.body;
    const filePath = path.join(__dirname, 'dashboard', 'clientData.json');
    const content = JSON.stringify({ "songLength": data.proglength });
    fs.writeFile(filePath, content)
        .then(() => res.json({ message: "Done" }))
        .catch(err => {
            console.error('Error writing songlength:', err);
            res.status(500).json({ message: "Error" });
        });
});

app.post('/api/save/songdata', (req, res) => {
    const data = req.body;
    const filePath = path.join(__dirname, 'dashboard', 'clientData.json');
    const content = JSON.stringify({ 
        "songLength": data.proglength, 
        "songProgress": data.i, 
        "song": data.idx 
    });
    fs.writeFile(filePath, content)
        .then(() => res.json({ message: "Done" }))
        .catch(err => {
            console.error('Error writing songdata:', err);
            res.status(500).json({ message: "Error" });
        });
});