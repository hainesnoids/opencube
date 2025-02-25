# openCube
HTML5 Audio Player for Web Streams and other sorts of things.

# Installation
## Dependencies
> You can install all dependencies automatically by running `npm install`.
- `http-server`
## Running OpenCube
Run the command `npm start`.
# Configuration
For must stuff, use config.js
## Adding / Removing songs
> This may be tedious, as much of the song-related stuff is hardcoded.
### 1. Add the song file(s)
Place your songs into the `/public/songs` folder.
### 2. Add your songs to the playlist
Open `/public/playlist.js`, and copy one of the list items to the end of the array. Fill in the details, and keep note of the album name for the next step.
### 3. Album Art
1. Search for the album on https://odesli.co/ and download the album art from there. Place it in `/public/images/albums`.
2. Rename it to the **exact name** of the album as defined in the song playlist. **This is case sensitive.**

© 2025 Hainesnoids & Weather Ranch