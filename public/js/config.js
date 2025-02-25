var config = {
    accentColor: '#ffffff', // Player Accent Color
    font: {
        family: 'Arial, Helvetica, sans-serif', // Font Family (for fonts from google fonts you'll need to edit index.css)
        italic: true, // This one is self-explanitory
    },
    visualizer: {
        color: [ // Colors for the Visualiser (Must Have Exactly 3 Items)
            {color: '#ffffff', position: 0},
            {color: '#ffffff', position: 0.67},
            {color: '#ffffff', position: 1}
        ],
        meterWidth: 12, // Width of Meters (in pixels) for the Visualizer
        meterGap: 12, // Gap Between Meters
        caps: false, // Add caps to the tops of the visualizer, which slowly fall down when music gets quieter
        capColor: '#ffffff',
        capHeight: 2, // Height of the caps (in pixels)
    },
    background: {
        type: 'video', // Type of background to use (video, image, none)
        url: '/images/background.mp4', // Link to video or image to use as the background
    },
    progressBar: {
        glow: false, // Add a glow effect to the progress bar, which matches the accent color.
    },
    details: { // Song Details
        trackColor: '',
        artistColor: '',
        albumColor: '',
        albumArtCornerRadius: 24,
        albumArtRotation: '10', // Rotation (in degrees) of the album art on the Y axis
        albumArtShadow: true, // Enable Album Art Shadow (MUST HAVE THE LATEST OBS TO WORK)
        detailsRotation: '0', // Rotation (in degrees) of the song details, visualizer, and progress bar.
    }
}