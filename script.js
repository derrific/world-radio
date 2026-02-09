/*
    STATUS MESSAGE DECODER RING
    ===========================
    These are the messages displayed in the player #current-station element.
    
    1. "Connecting: [Station] . .. ..." (White/Standard)
       - The initial state. The user clicked, the old player was destroyed, 
       - and we are attempting to handshake with the new server.
       
    2. "Resolving Playlist . .. ..." (White/Standard)
       - Specific to .m3u or .pls files. We are fetching a text file first 
       - to find the real mp3 stream URL inside it.
       
    3. "[Station Name]" (Standard UI + Album Art)
       - SUCCESS. The 'playing' event has fired. Audio is audible.
       
    4. "Buffering . .. ..." (Orange)
       - The 'waiting' event fired AFTER playback had already started.
       - The connection is alive, but the internet is too slow to keep up.
       
    5. "Network Error (404/Offline)" (Red)
       - The server is down, the URL is wrong, or the stream is offline.
       
    6. "Format Not Supported / 404" (Red)
       - Browser Error Code 4. The browser connected but doesn't understand 
       - the audio format (e.g., WMA), or the file doesn't exist.
       
    7. "Media Decode Error" (Red)
       - Browser Error Code 3. The stream data is corrupt.
       
    8. "Autoplay Blocked" (Red)
       - The browser refused to play audio without a direct user gesture.
*/

// ===== DOM Elements =====
const stationGrid = document.getElementById('station-grid');
const currentStation = document.getElementById('current-station');
const currentCity = document.getElementById('current-city');
const currentTime = document.getElementById('current-time');
const currentImage = document.getElementById('current-image');
const currentGenres = document.getElementById('current-genres');
const clearBtn = document.getElementById('clear-btn');
const nowPlaying = document.getElementById('now-playing');

const toggleGenresBtn = document.getElementById('toggle-genres');
const toggleTimezonesBtn = document.getElementById('toggle-timezones');
const toggleFavoritesBtn = document.getElementById('toggle-favorites');
const genreFilter = document.getElementById('genre-filter');
const timezoneFilter = document.getElementById('timezone-filter');

const sortAlphaBtn = document.getElementById('sort-alpha');
const sortCityBtn = document.getElementById('sort-city');
const sortGenreBtn = document.getElementById('sort-genre');
const sortGeoBtn = document.getElementById('sort-geo');

const toggleGuideBtn = document.getElementById('toggle-guide');
const guideView = document.getElementById('guide-view');
const guideContent = document.getElementById('guide-content');
const guideLoading = document.getElementById('guide-loading');

// ===== State =====
let timeInterval;
let activeStationTimezone = null;
let currentAudio = null;
let hls = null;
let activePlayId = 0;
let metadataInterval = null;
let currentStationData = null;
let stationsWithImages = [];
let currentSortMode = 'alpha';
let showFavoritesOnly = false;

// ===== Time Display =====
function updateTime() {
    if (activeStationTimezone) {
        const now = new Date();
        try {
            const datePart = now.toLocaleDateString('en-US', {
                timeZone: activeStationTimezone,
                weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
            });
            const timePart = now.toLocaleTimeString('en-US', {
                timeZone: activeStationTimezone,
                hour: 'numeric', minute: '2-digit', second: '2-digit'
            });
            currentTime.innerHTML = `${datePart}<br>${timePart}`;
        } catch (e) {
            currentTime.textContent = "--";
        }
    }
}

// ===== Playlist Resolution =====
async function fetchStreamFromPlaylist(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed: ${response.status}`);
        const text = await response.text();
        const match = text.match(/(https?:\/\/[^\s"']+)$/m) || text.match(/(https?:\/\/[^\s"']+)/);
        return match ? match[1] : url;
    } catch (error) {
        console.warn("Playlist parsing failed:", error);
        return url;
    }
}

// ===== Stop Playback =====
function stopPlayback() {
    activePlayId++;
    
    // Reset the Tab Title manually
    document.title = "World Radio";

    if (currentAudio) { 
        currentAudio.pause(); 
        currentAudio.removeAttribute('src'); 
        currentAudio.load();
        currentAudio = null; 
    }
    if (hls) { hls.destroy(); hls = null; }
    if (metadataInterval) { clearInterval(metadataInterval); metadataInterval = null; }
    
    // Clear Media Session (Lock Screen)
    if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = "none";
        navigator.mediaSession.metadata = null;
    }

    currentStation.textContent = "Select a station";
    currentCity.textContent = "";
    nowPlaying.textContent = "";
    nowPlaying.style.display = "none";
    currentTime.textContent = "";
    currentGenres.innerHTML = "";
    currentImage.style.display = 'none';
    currentImage.src = "";
    currentStationData = null;
    activeStationTimezone = null;
    if (timeInterval) clearInterval(timeInterval);
}

// ===== Metadata Handler =====
function handleMetadata(metadata) {
    let title = null;
    if (metadata.StreamTitle) title = metadata.StreamTitle;
    else if (metadata.TITLE) title = metadata.TITLE;
    else if (metadata.title) title = metadata.title;
    else if (typeof metadata === 'string') title = metadata;
    
    if (title && title.trim() && title !== nowPlaying.textContent) {
        nowPlaying.textContent = title;
        nowPlaying.style.display = "block";
        console.log("Now Playing:", title);
    }
}

// ===== Play Station =====
async function playStation(station) {
    activePlayId++;
    const myPlayId = activePlayId;
    currentStationData = station;
    let playUrl = station.url;
    
    // 1. SET LOADING STATE UI
    // Hide the normal "happy" UI elements
    currentImage.style.display = 'none';
    currentCity.style.display = 'none';
    currentTime.style.display = 'none';
    currentGenres.style.display = 'none';
    nowPlaying.style.display = 'none';
    
    // Show the "working" UI
    currentStation.innerHTML = `Connecting: ${station.name}<span class="loading-dots"></span>`;
    currentStation.className = "status-message"; // Temporarily use status styling
    
    // Kill previous players
    if (currentAudio) { 
        currentAudio.pause(); 
        currentAudio.removeAttribute('src'); 
        currentAudio.load();
        currentAudio = null; 
    }
    if (hls) { hls.destroy(); hls = null; }
    if (metadataInterval) { clearInterval(metadataInterval); metadataInterval = null; }
    
    // Resolve M3U/PLS
    if ((playUrl.includes('.m3u') || playUrl.includes('.pls')) && !playUrl.includes('.m3u8')) {
        currentStation.innerHTML = `Resolving Playlist<span class="loading-dots"></span>`;
        playUrl = await fetchStreamFromPlaylist(playUrl);
    }
    if (myPlayId !== activePlayId) return;
    
    const isHLS = playUrl.includes('.m3u8');
    
    currentAudio = new Audio();
    
    // Attach Event Listeners for Status Updates
    setupAudioListeners(currentAudio, station);

    // Use HLS.js for m3u8 streams
    if (isHLS && Hls.isSupported()) {
        console.log("Using HLS.js for:", playUrl);
        hls = new Hls();
        hls.loadSource(playUrl);
        hls.attachMedia(currentAudio);
        
        hls.on(Hls.Events.FRAG_PARSING_METADATA, (event, data) => {
             // ... existing metadata logic ...
             if (data.samples) {
                data.samples.forEach(sample => {
                    let str = "";
                    for (let i = 0; i < sample.data.length; i++) {
                        if (sample.data[i] >= 32 && sample.data[i] <= 126) {
                            str += String.fromCharCode(sample.data[i]);
                        }
                    }
                    if (str.includes("TIT2") || str.includes("TPE1")) {
                        const cleanText = str.replace(/TIT2|TPE1|TRCK/g, "").trim();
                        if (cleanText.length > 2) handleMetadata(cleanText);
                    }
                });
            }
        });
        
        hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
                // Try to explain the HLS error
                let errorMsg = "Stream Error";
                if (data.type === Hls.ErrorTypes.NETWORK_ERROR) errorMsg = "Network Error (404/Offline)";
                else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) errorMsg = "Media Decode Error";
                else errorMsg = "Fatal Stream Error";
                
                showErrorState(station, errorMsg);
                hls.destroy(); 
            }
        });
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
            if (myPlayId === activePlayId) {
                currentAudio.play().catch(e => showErrorState(station, "Autoplay Blocked"));
            }
        });
    } else {
        // Standard Audio
        currentAudio.src = playUrl;
        currentAudio.play().catch(e => showErrorState(station, "Autoplay Blocked"));
    }
    
    // Start Metadata (UI will show it only after playing starts)
    startMetadataPolling(playUrl, station);
}

function setupAudioListeners(audio, station) {
    let hasPlayedOnce = false;

    // 1. PLAYING: The feed is actually playing audio
    audio.addEventListener('playing', () => {
        hasPlayedOnce = true;
        
        // --- NEW: Update Tab Title ---
        document.title = `▶ ${station.name}`;
        
        // --- NEW: Update Lock Screen / Control Center ---
        if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: station.name,
                artist: station.city,
                artwork: [
                    { src: station.image, sizes: '512x512', type: 'image/webp' }
                ]
            });
            
            // Handle Lock Screen "Play" button (if they paused and want to resume)
            navigator.mediaSession.setActionHandler('play', () => {
                audio.play();
            });
            
            // Handle Lock Screen "Pause" button
            navigator.mediaSession.setActionHandler('pause', () => {
                // We use your existing stop function or just pause the audio
                if (typeof stopPlayback === 'function') {
                    stopPlayback(); 
                } else {
                    audio.pause();
                }
            });
            
            navigator.mediaSession.setActionHandler('stop', () => {
                if (typeof stopPlayback === 'function') stopPlayback();
            });
        }

        // Restore Normal UI
        currentStation.className = ""; 
        currentStation.textContent = station.name;
        
        currentCity.textContent = station.city;
        currentCity.style.display = 'block';
        
        activeStationTimezone = station.timezone;
        updateTime();
        if (timeInterval) clearInterval(timeInterval);
        timeInterval = setInterval(updateTime, 1000);
        currentTime.style.display = 'block';

        // Re-build genres
        currentGenres.innerHTML = '';
        if (station.genres) {
            station.genres.split(',').forEach(g => {
                const genreName = g.trim();
                const span = document.createElement('span');
                span.textContent = genreName;
                span.className = 'genre-tag';
                span.addEventListener('click', () => toggleGenreFilter(genreName));
                currentGenres.appendChild(span);
                currentGenres.appendChild(document.createTextNode(' '));
            });
        }
        currentGenres.style.display = 'block';
        
        currentImage.src = station.image;
        currentImage.style.display = 'block';
    });

    // 2. PAUSE/END: Reset the Tab Title
    audio.addEventListener('pause', () => {
        document.title = "World Radio";
    });
    
    audio.addEventListener('ended', () => {
        document.title = "World Radio";
    });

    // 3. BUFFERING: Feed is connected but empty/loading
    audio.addEventListener('waiting', () => {
        if (hasPlayedOnce) {
            currentStation.className = "status-message";
            currentStation.innerHTML = `Buffering<span class="loading-dots"></span>`;
        }
    });
    
    // 4. ERROR: Feed died or refused connection
    audio.addEventListener('error', (e) => {
        document.title = "Error - World Radio"; // Update tab on error
        let msg = "Unknown Error";
        if (audio.error) {
            switch (audio.error.code) {
                case 1: msg = "Aborted by User"; break;
                case 2: msg = "Network Error (Decode)"; break;
                case 3: msg = "Decode Error"; break;
                case 4: msg = "Format Not Supported / 404"; break;
            }
        }
        showErrorState(station, msg);
    });
}

function showErrorState(station, message) {
    currentStation.className = "status-message error-message";
    currentStation.textContent = `${message}: ${station.name}`;
    
    // Keep other UI elements hidden
    currentImage.style.display = 'none';
    currentCity.style.display = 'none';
    currentTime.style.display = 'none';
}

function startMetadataPolling(url, station) {
    checkMetadataMultiple(url, station);
    metadataInterval = setInterval(() => checkMetadataMultiple(url, station), 20000);
}

async function checkMetadataMultiple(url, station) {
    // Try station-specific APIs based on URL patterns
    if (url.includes('radiofrance') || url.includes('fip')) {
        await checkFIPMetadata(url);
    } else if (url.includes('wqxr') || url.includes('wnyc') || url.includes('q2stream')) {
        await checkWNYCMetadata(url);
    } else if (url.includes('bbc')) {
        await checkBBCMetadata(url);
    } else if (url.includes('srg-ssr')) {
        await checkSwissMetadata(url);
    }
}

async function checkFIPMetadata(url) {
    try {
        let endpoint = 'fip';
        if (url.includes('fippop')) endpoint = 'fip_pop';
        else if (url.includes('fiphiphop')) endpoint = 'fip_hiphop';
        else if (url.includes('fip-webradio2')) endpoint = 'fip_jazz';
        else if (url.includes('fip-webradio3')) endpoint = 'fip_groove';
        else if (url.includes('fip-webradio4')) endpoint = 'fip_world';
        else if (url.includes('fip-webradio5')) endpoint = 'fip_nouveautes';
        else if (url.includes('fip-webradio8')) endpoint = 'fip_electro';
        else if (url.includes('fipsacrefrancais')) endpoint = 'fip_sacre_francais';
        
        const response = await fetch(`https://www.radiofrance.fr/fip/api/live/webradios/${endpoint}`);
        const data = await response.json();
        if (data?.now?.firstLine) {
            const artist = data.now.firstLine.title || '';
            const title = data.now.secondLine?.title || '';
            if (artist || title) handleMetadata(`${artist}${artist && title ? ' - ' : ''}${title}`);
        }
    } catch (e) { /* fail silently */ }
}

async function checkWNYCMetadata(url) {
    try {
        let station = 'wqxr';
        if (url.includes('q2stream')) station = 'q2';
        else if (url.includes('wnyc')) station = 'wnyc-fm';
        
        const response = await fetch(`https://api.wnyc.org/api/v1/whats_on/${station}/`);
        const data = await response.json();
        if (data?.current_show?.title) handleMetadata(data.current_show.title);
    } catch (e) { /* fail silently */ }
}

async function checkBBCMetadata(url) {
    try {
        let station = 'bbc_radio_three';
        if (url.includes('6music')) station = 'bbc_6music';
        else if (url.includes('radio_two')) station = 'bbc_radio_two';
        
        const response = await fetch(`https://rms.api.bbc.co.uk/v2/services/${station}/segments/latest?experience=domestic&limit=1`);
        const data = await response.json();
        if (data?.data?.[0]) {
            const item = data.data[0];
            const artist = item.titles?.primary || '';
            const title = item.titles?.secondary || '';
            if (artist || title) handleMetadata(`${artist}${artist && title ? ' - ' : ''}${title}`);
        }
    } catch (e) { /* fail silently */ }
}

async function checkSwissMetadata(url) {
    try {
        let channel = 'rsj';
        if (url.includes('rsp')) channel = 'rsp';
        else if (url.includes('rsc')) channel = 'rsc_de';
        
        const response = await fetch(`https://api.srgssr.ch/srgssr-radio/v2/stream/${channel}`);
        const data = await response.json();
        if (data?.nowPlaying?.title) handleMetadata(data.nowPlaying.title);
    } catch (e) { /* fail silently */ }
}

// ===== Filters =====
function createGenreFilter() {
    const container = document.getElementById('genre-checkboxes');
    const allGenres = new Set();
    radioStations.forEach(s => {
        if (s.genres) s.genres.split(',').forEach(g => allGenres.add(g.trim()));
    });
    
    Array.from(allGenres).sort().forEach(genre => {
        const label = document.createElement('label');
        label.className = 'filter-item';
        label.innerHTML = `<input type="checkbox" value="${genre}" class="genre-checkbox"> ${genre}`;
        label.querySelector('input').addEventListener('change', filterStations);
        container.appendChild(label);
    });
}

function createTimezoneFilter() {
    const container = document.getElementById('timezone-checkboxes');
    const allTz = new Set();
    radioStations.forEach(s => { if (s.timezone) allTz.add(s.timezone); });
    
    // Sort by UTC offset (east to west)
    const sorted = Array.from(allTz).sort((a, b) => {
        const now = new Date();
        const offsetA = new Date(now.toLocaleString('en-US', { timeZone: a })).getTime();
        const offsetB = new Date(now.toLocaleString('en-US', { timeZone: b })).getTime();
        return offsetB - offsetA;
    });
    
    // Group timezones that share the same current offset
    const groups = [];
    sorted.forEach(tz => {
        const now = new Date();
        const offset = new Date(now.toLocaleString('en-US', { timeZone: tz })).getTime();
        const existing = groups.find(g => g.offset === offset);
        if (existing) {
            existing.codes.push(tz);
        } else {
            groups.push({ offset, codes: [tz] });
        }
    });
    
    groups.forEach(group => {
        const label = document.createElement('label');
        label.className = 'filter-item';
        const displayName = group.codes.join(' / ');
        label.innerHTML = `<input type="checkbox" value="${group.codes.join(',')}" class="tz-checkbox"> ${displayName}`;
        label.querySelector('input').addEventListener('change', filterStations);
        container.appendChild(label);
    });
}

function filterStations() {
    const checkedGenres = Array.from(document.querySelectorAll('.genre-checkbox:checked')).map(cb => cb.value);
    const checkedTz = Array.from(document.querySelectorAll('.tz-checkbox:checked')).map(cb => cb.value);
    
    clearBtn.style.display = (checkedGenres.length > 0 || checkedTz.length > 0 || showFavoritesOnly) ? 'inline-block' : 'none';
    
    document.querySelectorAll('.station-item').forEach(div => {
        if (checkedGenres.length === 0 && checkedTz.length === 0 && !showFavoritesOnly) {
            div.style.display = 'block';
            return;
        }
        
        const stationGenres = div.dataset.genres || "";
        const stationTz = div.dataset.timezone || "";
        const stationCategory = div.dataset.category || "";
        
        const genreMatch = checkedGenres.length === 0 || checkedGenres.some(g => stationGenres.includes(g));
        const tzMatch = checkedTz.length === 0 || checkedTz.some(tzGroup => tzGroup.split(',').includes(stationTz));
        const favMatch = !showFavoritesOnly || stationCategory === 'favorite';
        
        div.style.display = (genreMatch && tzMatch && favMatch) ? 'block' : 'none';
    });
}

function toggleGenreFilter(genreName) {
    document.querySelectorAll('.genre-checkbox').forEach(cb => {
        if (cb.value === genreName) {
            cb.checked = !cb.checked;
            cb.dispatchEvent(new Event('change'));
        }
    });
}

// ===== Sorting =====
function sortStations(mode) {
    currentSortMode = mode;
    
    // Update button visual states immediately
    [sortAlphaBtn, sortCityBtn, sortGeoBtn, sortGenreBtn].forEach(btn => btn?.classList.remove('active'));
    if (mode === 'alpha') sortAlphaBtn?.classList.add('active');
    else if (mode === 'city') sortCityBtn?.classList.add('active');
    else if (mode === 'geo') sortGeoBtn?.classList.add('active');
    else if (mode === 'genre') sortGenreBtn?.classList.add('active');

    // CHECK: Are we looking at the Guide?
    if (guideView.style.display !== 'none') {
        // If Guide is open, just re-render it (it handles its own sorting now)
        renderGuide();
        return; 
    }

    // Otherwise, Standard Grid Sorting Logic...
    let sorted;
    let showTimezoneHeaders = false;
    let showGenreHeaders = false;
    
    if (mode === 'alpha') {
        sorted = [...stationsWithImages].sort((a, b) => a.name.localeCompare(b.name));
    } else if (mode === 'city') {
        sorted = [...stationsWithImages].sort((a, b) => a.city.localeCompare(b.city));
    } else if (mode === 'geo') {
        showTimezoneHeaders = true;
        sorted = [...stationsWithImages].sort((a, b) => {
            const now = new Date();
            const offsetA = new Date(now.toLocaleString('en-US', { timeZone: a.timezone })).getTime();
            const offsetB = new Date(now.toLocaleString('en-US', { timeZone: b.timezone })).getTime();
            if (offsetA !== offsetB) return offsetA - offsetB;
            return a.city.localeCompare(b.city);
        });
    } else if (mode === 'genre') {
        showGenreHeaders = true;
        const allGenres = new Set();
        stationsWithImages.forEach(s => {
            if (s.genres) s.genres.split(',').forEach(g => allGenres.add(g.trim()));
        });
        const sortedGenres = Array.from(allGenres).sort((a, b) => a.localeCompare(b));
        
        sorted = [];
        sortedGenres.forEach(genre => {
            const stationsInGenre = stationsWithImages
                .filter(s => s.genres && s.genres.includes(genre))
                .sort((a, b) => a.name.localeCompare(b.name));
            stationsInGenre.forEach(s => {
                sorted.push({ ...s, _currentGenre: genre });
            });
        });
    }
    
    renderStationGrid(sorted, showTimezoneHeaders, showGenreHeaders);
}

function renderStationGrid(stations, showTimezoneHeaders = false, showGenreHeaders = false) {
    stationGrid.innerHTML = '';
    
    let currentOffset = null;
    let currentGenre = null;
    
    stations.forEach(station => {
        // Add timezone header if in geo mode and offset changed
        if (showTimezoneHeaders) {
            const now = new Date();
            const offset = new Date(now.toLocaleString('en-US', { timeZone: station.timezone })).getTime();
            
            if (offset !== currentOffset) {
                currentOffset = offset;
                
                const matchingTimezones = [...new Set(stations
                    .filter(s => {
                        const sOffset = new Date(now.toLocaleString('en-US', { timeZone: s.timezone })).getTime();
                        return sOffset === offset;
                    })
                    .map(s => s.timezone)
                )];
                
                const header = document.createElement('h2');
                header.className = 'timezone-header';
                header.textContent = matchingTimezones.join(' / ');
                stationGrid.appendChild(header);
            }
        }
        
        // Add genre header if in genre mode and genre changed
        if (showGenreHeaders && station._currentGenre !== currentGenre) {
            currentGenre = station._currentGenre;
            const header = document.createElement('h2');
            header.className = 'timezone-header';
            header.textContent = currentGenre;
            stationGrid.appendChild(header);
        }
        
        const div = document.createElement('div');
        div.className = 'station-item';
        div.dataset.genres = station.genres || "";
        div.dataset.timezone = station.timezone || "";
        div.dataset.category = station.category || "";
        div.dataset.guide = station.guideId || "";
        
        const isFavorite = station.category === 'favorite';
        const starIcon = isFavorite ? '<span class="favorite-star">★</span> ' : '';
        const guideIcon = station.guideId ? '<span title="Has Guide" style="font-size:10px; cursor:help"> 📅</span>' : '';
        
        // Clean the URL for display (remove http, www, and trailing slash)
        let displayUrl = '';
        if (station.homepage) {
            displayUrl = station.homepage
                .replace(/^https?:\/\//, '')
                .replace(/^www\./, '')
                .replace(/\/$/, '');
        }

        div.innerHTML = `
            <img src="${station.image}" alt="${station.name}" onerror="this.src='https://via.placeholder.com/150?text=No+Image'">
            <p class="station-name">${starIcon}${station.name}${guideIcon}</p>
            <p class="station-city">${station.city}</p>
            ${station.homepage ? `<a href="${station.homepage}" target="_blank" class="station-homepage" onclick="event.stopPropagation()">${displayUrl} ↗</a>` : ''}
        `;
        div.addEventListener('click', () => playStation(station));
        stationGrid.appendChild(div);
    });
    
    // Re-apply filters
    filterStations();
}

// ===== Toggle Handlers =====
toggleGenresBtn?.addEventListener('click', () => {
    const isVisible = genreFilter.style.display !== 'none';
    genreFilter.style.display = isVisible ? 'none' : 'block';
    toggleGenresBtn.textContent = isVisible ? 'Show Genres ▼' : 'Hide Genres ▲';
    toggleGenresBtn.classList.toggle('active', !isVisible);
});

toggleTimezonesBtn?.addEventListener('click', () => {
    const isVisible = timezoneFilter.style.display !== 'none';
    timezoneFilter.style.display = isVisible ? 'none' : 'block';
    toggleTimezonesBtn.textContent = isVisible ? 'Show Timezones ▼' : 'Hide Timezones ▲';
    toggleTimezonesBtn.classList.toggle('active', !isVisible);
});

toggleFavoritesBtn?.addEventListener('click', () => {
    showFavoritesOnly = !showFavoritesOnly;
    toggleFavoritesBtn.classList.toggle('active', showFavoritesOnly);
    filterStations();
});

clearBtn?.addEventListener('click', () => {
    document.querySelectorAll('.genre-checkbox, .tz-checkbox').forEach(cb => cb.checked = false);
    showFavoritesOnly = false;
    toggleFavoritesBtn?.classList.remove('active');
    filterStations();
});

// ===== Radio Guide Logic =====
const PIXELS_PER_HOUR = 200;
const GUIDE_HOURS = 24; 
const STICKY_WIDTH = 80;

toggleGuideBtn?.addEventListener('click', () => {
    const isVisible = guideView.style.display !== 'none';
    
    if (isVisible) {
        // CLOSING GUIDE
        guideView.style.display = 'none';
        stationGrid.style.display = 'grid'; 
        toggleGuideBtn.classList.remove('active');
        toggleGuideBtn.textContent = "📅 Radio Guide";
        
        // Show Genre Button again
        if (sortGenreBtn) sortGenreBtn.style.display = 'inline-block';
        
        // Re-render grid to be safe (restores previous view)
        sortStations(currentSortMode);
    } else {
        // OPENING GUIDE
        guideView.style.display = 'block';
        stationGrid.style.display = 'none'; 
        toggleGuideBtn.classList.add('active');
        toggleGuideBtn.textContent = "Close Guide ✖";
        
        // Hide Genre Button (Not supported in Guide view)
        if (sortGenreBtn) sortGenreBtn.style.display = 'none';
        
        // Fallback: If we were in Genre mode, switch to Alpha
        if (currentSortMode === 'genre') {
            sortStations('alpha'); 
        } else {
            renderGuide();
        }
    }
});

function renderGuide() {
    guideContent.innerHTML = ''; 
    guideLoading.style.display = 'none';

    // Create Scroll Container
    const scrollContainer = document.createElement('div');
    scrollContainer.className = 'guide-scroll-container';
    
    // 1. Time Setup
    const now = new Date();
    now.setMinutes(0, 0, 0); 
    const startTimeUTC = now.getTime();
    const totalWidth = STICKY_WIDTH + (GUIDE_HOURS * PIXELS_PER_HOUR);

    // 2. Render Header
    const headerRow = document.createElement('div');
    headerRow.className = 'guide-time-header';
    headerRow.style.width = `${totalWidth}px`;
    
    const stickyCorner = document.createElement('div');
    stickyCorner.className = 'guide-station-sticky'; 
    stickyCorner.style.height = '30px'; 
    stickyCorner.style.background = '#1a1a1a';
    stickyCorner.style.zIndex = '40'; 
    stickyCorner.style.borderBottom = 'none';
    stickyCorner.innerHTML = ''; 
    headerRow.appendChild(stickyCorner);
    
    for (let i = 0; i < GUIDE_HOURS; i++) {
        const hourTime = new Date(startTimeUTC + (i * 3600000));
        const marker = document.createElement('div');
        marker.className = 'guide-time-marker';
        marker.style.left = `${STICKY_WIDTH + (i * PIXELS_PER_HOUR)}px`; 
        marker.textContent = hourTime.toLocaleTimeString([], {hour: 'numeric', hour12: true}); 
        headerRow.appendChild(marker);
    }
    scrollContainer.appendChild(headerRow);

    // 3. Prepare & SORT Stations
    let guideStations = radioStations.filter(s => s.guideId);

    // --- Apply Sorting to Guide Rows ---
    if (currentSortMode === 'alpha') {
        guideStations.sort((a, b) => a.name.localeCompare(b.name));
    } else if (currentSortMode === 'city') {
        guideStations.sort((a, b) => a.city.localeCompare(b.city));
    } else if (currentSortMode === 'geo') {
        guideStations.sort((a, b) => {
            const now = new Date();
            const offsetA = new Date(now.toLocaleString('en-US', { timeZone: a.timezone })).getTime();
            const offsetB = new Date(now.toLocaleString('en-US', { timeZone: b.timezone })).getTime();
            if (offsetA !== offsetB) return offsetA - offsetB;
            return a.city.localeCompare(b.city);
        });
    }

    console.log(`Rendering Guide in mode: ${currentSortMode}`);
    console.log("Station Order:", guideStations.map(s => s.name));

    // 4. Render Rows
    const realNow = new Date();
    const minutesOffset = (realNow.getTime() - startTimeUTC) / 60000;

    if (minutesOffset >= 0) {
        const nowPixels = (minutesOffset / 60) * PIXELS_PER_HOUR;
        const nowLine = document.createElement('div');
        nowLine.className = 'current-time-line';
        nowLine.style.left = `${STICKY_WIDTH + nowPixels}px`;
        nowLine.style.zIndex = '15'; 
        nowLine.style.height = `${30 + (guideStations.length * 80)}px`; 
        scrollContainer.appendChild(nowLine);
    }

    guideStations.forEach(station => {
        const row = document.createElement('div');
        row.className = 'guide-row';
        row.style.width = `${totalWidth}px`;

        // Sticky Left Column (Updated with City)
        const sticky = document.createElement('div');
        sticky.className = 'guide-station-sticky';
        const imgPath = station.image || `radio-images/${station.imageFilename || station.name}.webp`;
        
        // --- NEW: Added City Div ---
        sticky.innerHTML = `
            <img src="${imgPath}" class="guide-station-img">
            <div class="guide-station-name">${station.name}</div>
            <div class="guide-station-city">${station.city}</div>
        `;
        sticky.addEventListener('click', () => playStation(station));
        row.appendChild(sticky);

        fetchScheduleForStation(station, row, startTimeUTC);
        scrollContainer.appendChild(row);
    });

    guideContent.appendChild(scrollContainer);
}

// REAL DATA FETCHING
async function fetchScheduleForStation(station, rowContainer, guideStartUTC) {
    
    // 1. CHECK: Do we have a real scraper for this station?
    if (station.guideId === 'wkcr') {
        try {
            const response = await fetch(`/.netlify/functions/guide?station=wkcr`);
            const data = await response.json();
            
            if (Array.isArray(data)) {
                data.forEach(show => {
                    renderShowItem({
                        title: show.title,
                        desc: show.desc, // The scraper sends "desc"
                        start: show.start,
                        duration: show.duration
                    }, station, rowContainer, guideStartUTC);
                });
                return; 
            }
        } catch (e) {
            console.error("Guide fetch failed:", e);
        }
    }
}

// Helper to draw the card (Shared by both Real and Mock data)
function renderShowItem(show, station, rowContainer, guideStartUTC) {
    // If it's real data, 'start' is the timestamp. If mock, it's 'startUTC'
    const start = show.start || show.startUTC;
    const durationMins = show.duration || show.durationMinutes;

    const item = document.createElement('div');
    item.className = 'guide-item';
    
    // Calculate Position
    const minutesFromStart = (start - guideStartUTC) / 60000;
    const leftPos = (minutesFromStart / 60) * PIXELS_PER_HOUR;
    const width = (durationMins / 60) * PIXELS_PER_HOUR;
    
    item.style.left = `${STICKY_WIDTH + leftPos}px`;
    item.style.width = `${width}px`;
    
    const dateObj = new Date(start);
    const stationTimeStr = dateObj.toLocaleTimeString('en-US', {
        timeZone: station.timezone,
        hour: 'numeric', 
        minute: '2-digit'
    });

    item.innerHTML = `
        <div class="guide-time-text">${stationTimeStr}</div>
        <div class="guide-show-title">${show.title}</div>
        <div class="guide-show-desc">${show.desc}</div>
    `;
    
    item.addEventListener('click', () => playStation(station));
    rowContainer.appendChild(item);
}
// Note: I renamed 'renderShowCard' to 'renderShowItem' in the helper to match

// ===== Sort Button Handlers =====
sortAlphaBtn?.addEventListener('click', () => sortStations('alpha'));
sortCityBtn?.addEventListener('click', () => sortStations('city'));
sortGenreBtn?.addEventListener('click', () => sortStations('genre'));
sortGeoBtn?.addEventListener('click', () => sortStations('geo'));

// ===== Initialization =====
function init() {
    createGenreFilter();
    createTimezoneFilter();
    
    stationsWithImages = radioStations.map(station => ({
        ...station,
        image: `radio-images/${station.imageFilename || station.name}.webp`
    }));
    
    currentImage?.addEventListener('click', stopPlayback);
    
    // Initial sort and render
    sortStations('geo'); 
}

init();
