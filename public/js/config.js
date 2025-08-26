var config = {
    accentColor: '#ffffff', // Player Accent Color
    theme: 'default', // Theme to Use (default, watt, nemo, fyber, cube, benton)
    visualizer: {
        color: [ // Colors for the Visualiser (Must Have Exactly 3 Items)
            {color: '#ffffff', position: 0},
            {color: '#ffffff', position: 0.67},
            {color: '#ffffff', position: 1}
        ],
        colorSource: "album", // Source of the color (custom, album)
        meterWidth: 12, // Width of Meters (in pixels) for the Visualizer
        meterGap: 12, // Gap Between Meters
        caps: false, // Add caps to the tops of the visualizer, which slowly fall down when music gets quieter
        capColor: '#ffffff70',
        capHeight: 2, // Height of the caps (in pixels)
        //meterAlign: "center", // Where to align the meters. Can either be "bottom" or "center".
    },
    background: {
        type: 'albumblur', // Type of background to use (video, image, none)
        url: '/images/background2.jpg', // Link to video or image to use as the background
    },
    progressBar: {
        glow: false, // Add a glow effect to the progress bar, which matches the accent color.
    },
    details: { // Song Details
        trackColor: '',
        artistColor: '',
        albumColor: '',
        albumArtRotation: '0', // Rotation (in degrees) of the album art on the Y axis
        albumArtShadow: true, // Enable Album Art Shadow (MUST HAVE THE LATEST OBS TO WORK)
        detailsRotation: '0', // Rotation (in degrees) of the song details, visualizer, and progress bar.
    }
}
