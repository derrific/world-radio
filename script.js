const stationGrid = document.getElementById('station-grid');
const currentStation = document.getElementById('current-station');
const currentCity = document.getElementById('current-city');
const currentTime = document.getElementById('current-time');
const currentImage = document.getElementById('current-image');
const currentGenres = document.getElementById('current-genres');
const clearBtn = document.getElementById('clear-btn');
const nowPlaying = document.getElementById('now-playing');


let timeInterval;
let activeStationTimezone = null;

// Global Player Variables
let currentAudio = null;
let hls = null;
let activePlayId = 0;
let metadataInterval = null;

function updateTime() {
    if (activeStationTimezone) {
        const now = new Date();
        try {
            // Get Date
            const datePart = now.toLocaleDateString('en-US', {
                timeZone: activeStationTimezone,
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });

            // Get Time (Added seconds back)
            const timePart = now.toLocaleTimeString('en-US', {
                timeZone: activeStationTimezone,
                hour: 'numeric',
                minute: '2-digit',
                second: '2-digit'
            });

            // Stack them with a line break
            currentTime.innerHTML = `${datePart}<br>${timePart}`;
        } catch (e) {
            currentTime.textContent = "--";
        }
    }
}

async function fetchStreamFromPlaylist(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch playlist: ${response.status}`);
        const text = await response.text();
        const match = text.match(/(https?:\/\/[^\s"']+)$/m) || text.match(/(https?:\/\/[^\s"']+)/);
        if (match) return match[1];
        return url;
    } catch (error) {
        console.warn("Playlist parsing failed, using original URL:", error);
        return url;
    }
}

// NEW: Function to stop everything and reset UI
function stopPlayback() {
    // Increment ticket to invalidate any pending loads
    activePlayId++;

    // Kill Player
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.removeAttribute('src');
        currentAudio = null;
    }
    if (hls) {
        hls.destroy();
        hls = null;
    }
if (window.metadataInterval) clearInterval(window.metadataInterval);
    // Reset UI
    currentStation.textContent = "Select a station";
    currentCity.textContent = "";
    nowPlaying.textContent = "";
    nowPlaying.style.display = "none"; // <--- Resets it to hidden for the next station
    currentTime.textContent = "";
    currentGenres.innerHTML = "";

    // Hide Image
    currentImage.style.display = 'none';
    currentImage.src = "";

    // Stop Clock
    activeStationTimezone = null;
    if (timeInterval) clearInterval(timeInterval);
}

async function playStation(station) {
    activePlayId++;
    const myPlayId = activePlayId;

    let playUrl = station.url;

    // Kill Previous Player
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.removeAttribute('src');
        currentAudio = null;
    }
    if (hls) {
        hls.destroy();
        hls = null;
    }

    // Reset Metadata
    nowPlaying.textContent = ""; 
    nowPlaying.style.display = "none";
    if (metadataInterval) clearInterval(metadataInterval);

    // Resolve M3U/PLS files if needed
    if (playUrl.includes('.m3u') || playUrl.includes('.pls')) {
        if (!playUrl.includes('.m3u8')) {
            playUrl = await fetchStreamFromPlaylist(playUrl);
        }
    }

    if (myPlayId !== activePlayId) return;

    // Determine Player Type
    if (Hls.isSupported() && (playUrl.includes('.m3u8'))) {
        hls = new Hls();
        hls.loadSource(playUrl);

        currentAudio = new Audio();
        hls.attachMedia(currentAudio);

        // 1. Listen for In-Stream Metadata (Standard HLS)
        hls.on(Hls.Events.FRAG_PARSING_METADATA, function (event, data) {
            if (data.samples) {
                data.samples.forEach(sample => {
                    const unit = sample.data;
                    let str = "";
                    for (let i = 0; i < unit.length; i++) {
                        if (unit[i] >= 32 && unit[i] <= 126) {
                            str += String.fromCharCode(unit[i]);
                        }
                    }
                    if (str.includes("TIT2") || str.includes("TPE1")) {
                        const cleanText = str.replace(/TIT2|TPE1|TRCK/g, "").trim();
                        if (cleanText.length > 2) {
                            nowPlaying.textContent = cleanText;
                            nowPlaying.style.display = "block";
                        }
                    }
                });
            }
        });

        hls.on(Hls.Events.ERROR, function (event, data) {
            if (data.fatal) {
                hls.destroy();
                // Fallback to standard audio if HLS fails
                currentAudio.src = playUrl;
                currentAudio.play().catch(e => console.error("HLS Fallback failed:", e));
            }
        });
        
        hls.on(Hls.Events.MANIFEST_PARSED, function() {
            if (myPlayId === activePlayId) {
                currentAudio.play().catch(e => console.error("HLS Play failed:", e));
            }
        });

        // 2. FORCE EXTERNAL METADATA CHECK (The Fix)
        // Even though it's HLS, we poll the proxy in case the stream lacks embedded tags
        if (metadataInterval) clearInterval(metadataInterval);
        checkMetadata(playUrl);
        metadataInterval = setInterval(() => checkMetadata(playUrl), 15000);
    }
    else {
        // STANDARD AUDIO PLAYER
        currentAudio = new Audio();
        // Removed unnecessary crossOrigin and nocache logic here
        
        currentAudio.src = playUrl;
        currentAudio.play().catch(e => console.error("Playback failed:", e));

        checkMetadata(playUrl); 
        metadataInterval = setInterval(() => checkMetadata(playUrl), 15000);
    }

    // UI Updates
    currentStation.textContent = station.name;
    currentCity.textContent = station.city;

    // Genre Logic
    currentGenres.innerHTML = '';
    if (station.genres) {
        station.genres.split(',').forEach(g => {
            const genreName = g.trim();
            const span = document.createElement('span');
            span.textContent = genreName;
            span.style.cursor = 'pointer';
            span.className = 'genre-tag';
            span.addEventListener('click', () => toggleGenreFilter(genreName));
            currentGenres.appendChild(span);
            currentGenres.appendChild(document.createTextNode(' '));
        });
    }

    currentImage.src = station.image;
    currentImage.style.display = 'block';

    activeStationTimezone = station.timezone;
    updateTime();
    if (timeInterval) clearInterval(timeInterval);
    timeInterval = setInterval(updateTime, 1000);
}

// NEW: Extract unique genres and build checkboxes
function createGenreFilter() {
    const genreContainer = document.getElementById('genre-checkboxes');
    const allGenres = new Set();

    // 1. Extract and Clean Genres
    radioStations.forEach(station => {
        if (station.genres) {
            station.genres.split(',').forEach(g => {
                allGenres.add(g.trim());
            });
        }
    });

    // 2. Sort Alphabetically
    const sortedGenres = Array.from(allGenres).sort();

    // 3. Create HTML
    sortedGenres.forEach(genre => {
        const label = document.createElement('label');
        label.className = 'genre-item';
        label.innerHTML = `
            <input type="checkbox" value="${genre}" class="genre-checkbox">
            ${genre}
        `;

        // Add Change Listener
        label.querySelector('input').addEventListener('change', filterStations);

        genreContainer.appendChild(label);
    });
}

function filterStations() {
    // Get all checked values
    const checkedBoxes = document.querySelectorAll('.genre-checkbox:checked');
    const selectedGenres = Array.from(checkedBoxes).map(cb => cb.value);

    // Toggle Clear Button Visibility
    if (selectedGenres.length > 0) {
        clearBtn.style.display = 'inline-block';
    } else {
        clearBtn.style.display = 'none';
    }

    const stationDivs = document.querySelectorAll('.station-item');

    stationDivs.forEach(div => {
        // If nothing checked, show all
        if (selectedGenres.length === 0) {
            div.style.display = 'block';
            return;
        }

        // Get genres from the data attribute
        const stationGenres = div.dataset.genres;

        // Check if station has ANY of the selected genres
        const isMatch = selectedGenres.some(genre => stationGenres.includes(genre));

        div.style.display = isMatch ? 'block' : 'none';
    });
}

function toggleGenreFilter(genreName) {
    const checkboxes = document.querySelectorAll('.genre-checkbox');
    checkboxes.forEach(cb => {
        if (cb.value === genreName) {
            cb.checked = !cb.checked; // Toggle the checkbox
            cb.dispatchEvent(new Event('change')); // Trigger the filter logic
        }
    });
}

function init() {
    // 1. Build Filter UI
    createGenreFilter();

    // 2. Build Grid
    const stationsWithImages = radioStations.map(station => ({
        ...station,
        image: `radio-images/${station.imageFilename || station.name}.webp`
    }));

    // Setup Stop Click Listener
    currentImage.addEventListener('click', stopPlayback);

    stationsWithImages.forEach(station => {
        const div = document.createElement('div');
        div.className = 'station-item';

        // CRITICAL: Store genres in dataset for the filter to read later
        div.dataset.genres = station.genres || "";

        div.innerHTML = `
            <img src="${station.image}" alt="${station.name}" onerror="this.src='https://via.placeholder.com/150?text=No+Image'">
            <p>${station.name}</p>
        `;

        div.addEventListener('click', () => {
            playStation(station);
        });

        stationGrid.appendChild(div);
    });
}

init();

clearBtn.addEventListener('click', () => {
    // Uncheck all boxes
    document.querySelectorAll('.genre-checkbox').forEach(cb => cb.checked = false);
    // Reset grid
    filterStations();
});

async function checkMetadata(url) {
    if (!url) return;
    
    // 1. Try to fetch the stream title using a proxy (bypasses CORS & reads SHOUTcast metadata)
    try {
        const metadataUrl = `https://radio-metadata-proxy.herokuapp.com/metadata?url=${encodeURIComponent(url)}`;
        const response = await fetch(metadataUrl);
        const data = await response.json();
        
        if (data.title && data.title !== nowPlaying.textContent) {
            nowPlaying.textContent = data.title;
            nowPlaying.style.display = "block";
        }
    } catch (e) {
        // Fail silently
    }
}