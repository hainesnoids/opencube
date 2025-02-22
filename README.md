# openCube
HTML5 Audio Player for Web Streams and other sorts of things.

# Installation
## Dependencies
> You can install all dependencies automatically by running `npm install`.
- `http-server`
## Running OpenCube
Run the command `npm start`.
# Configuration
## Adding / Removing songs
> This may be tedious, as much of the song-related stuff is hardcoded.
### 1. Add the song file(s)
Place your songs into the `/public/songs` folder.
### 2. Add your songs to the playlist
Open `/public/playlist.js`, and copy one of the list items to the end of the array. Fill in the details, and keep note of the album name for the next step.
### 3. Album Art
1. Search for the album on https://odesli.co/ and download the album art from there. Place it in `/public/images/albums`.
2. Rename it to the **exact name** of the album as defined in the song playlist. **This is case sensitive.**

## Customizing Colors
1. Open `css/index.css` in a text editor, open your text editor's "Find and Replace" menu, search for `#ffffff` (no case sensitivity), and replace it with whatever accent color you choose (in hexidecimal).
2. Open `js/index.js` in a text editor, open your text editor's "Find and Replace" menu, search for `#ffffff` (no case sensitivity), and replace it with whatever accent color you choose (in hexidecimal).
> There is support for gradients in the visualizer, however I won't tell you how.

##  Video Background
### Removing the Video Background
1. Search for the following in index.html:
```
                <video autoplay muted loop class="bg-video">
                    <source src="images/background.mp4">
                </video>
```
2. Replace it with nothing.

It will now fall back to the image background, and you can now use that instead.

© 2025 Hainesnoids & Weather Ranch