// ===== DOM Elements =====
const stationGrid = document.getElementById('station-grid');
const currentStation = document.getElementById('current-station');
const currentCity = document.getElementById('current-city');
const currentTime = document.getElementById('current-time');
const currentImage = document.getElementById('current-image');
const currentGenres = document.getElementById('current-genres');
const clearBtn = document.getElementById('clear-btn');
const nowPlaying = document.getElementById('now-playing');
const identifyBtn = document.getElementById('identify-btn');
const identifyResult = document.getElementById('identify-result');

const toggleGenresBtn = document.getElementById('toggle-genres');
const toggleTimezonesBtn = document.getElementById('toggle-timezones');
const genreFilter = document.getElementById('genre-filter');
const timezoneFilter = document.getElementById('timezone-filter');

const sortAlphaBtn = document.getElementById('sort-alpha');
const sortCityBtn = document.getElementById('sort-city');
const sortGeoBtn = document.getElementById('sort-geo');

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
    if (currentAudio) { 
        currentAudio.pause(); 
        currentAudio.removeAttribute('src'); 
        currentAudio.load();
        currentAudio = null; 
    }
    if (hls) { hls.destroy(); hls = null; }
    if (metadataInterval) { clearInterval(metadataInterval); metadataInterval = null; }
    
    currentStation.textContent = "Select a station";
    currentCity.textContent = "";
    nowPlaying.textContent = "";
    nowPlaying.style.display = "none";
    currentTime.textContent = "";
    currentGenres.innerHTML = "";
    currentImage.style.display = 'none';
    currentImage.src = "";
    identifyBtn.style.display = 'none';
    identifyResult.textContent = "";
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
    
    // Kill previous players
    if (currentAudio) { 
        currentAudio.pause(); 
        currentAudio.removeAttribute('src'); 
        currentAudio.load();
        currentAudio = null; 
    }
    if (hls) { hls.destroy(); hls = null; }
    if (metadataInterval) { clearInterval(metadataInterval); metadataInterval = null; }
    
    nowPlaying.textContent = "";
    nowPlaying.style.display = "none";
    identifyResult.textContent = "";
    
    // Resolve M3U/PLS (but not m3u8)
    if ((playUrl.includes('.m3u') || playUrl.includes('.pls')) && !playUrl.includes('.m3u8')) {
        playUrl = await fetchStreamFromPlaylist(playUrl);
    }
    if (myPlayId !== activePlayId) return;
    
    const isHLS = playUrl.includes('.m3u8');
    
    // Use HLS.js for m3u8 streams
    if (isHLS && Hls.isSupported()) {
        console.log("Using HLS.js for:", playUrl);
        hls = new Hls();
        hls.loadSource(playUrl);
        currentAudio = new Audio();
        hls.attachMedia(currentAudio);
        
        hls.on(Hls.Events.FRAG_PARSING_METADATA, (event, data) => {
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
                hls.destroy(); hls = null;
                currentAudio.src = playUrl;
                currentAudio.play().catch(e => console.error("HLS Fallback failed:", e));
            }
        });
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
            if (myPlayId === activePlayId) {
                currentAudio.play().catch(e => console.error("HLS Play failed:", e));
            }
        });
        startMetadataPolling(playUrl, station);
    } else {
        playWithStandardAudio(playUrl, myPlayId);
    }
    
    // UI Updates
    currentStation.textContent = station.name;
    currentCity.textContent = station.city;
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
    
    currentImage.src = station.image;
    currentImage.style.display = 'block';
    identifyBtn.style.display = 'flex';
    
    activeStationTimezone = station.timezone;
    updateTime();
    if (timeInterval) clearInterval(timeInterval);
    timeInterval = setInterval(updateTime, 1000);
}

function playWithStandardAudio(playUrl, myPlayId) {
    console.log("Using standard audio for:", playUrl);
    currentAudio = new Audio();
    currentAudio.src = playUrl;
    currentAudio.play().catch(e => console.error("Playback failed:", e));
    startMetadataPolling(playUrl, currentStationData);
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
    
    const tzOrder = ['Pacific/Auckland','Asia/Jerusalem','Europe/London','Europe/Lisbon','Europe/Paris',
        'Europe/Brussels','Europe/Amsterdam','Europe/Berlin','Europe/Zurich','America/Sao_Paulo',
        'America/Recife','America/New_York','America/Toronto','America/Chicago','America/Denver',
        'America/Edmonton','America/Los_Angeles','America/Vancouver'];
    
    const sorted = Array.from(allTz).sort((a,b) => {
        const iA = tzOrder.indexOf(a), iB = tzOrder.indexOf(b);
        if (iA === -1 && iB === -1) return a.localeCompare(b);
        if (iA === -1) return 1;
        if (iB === -1) return -1;
        return iA - iB;
    });
    
    sorted.forEach(tz => {
        const label = document.createElement('label');
        label.className = 'filter-item';
        // Format timezone for display
        const displayTz = tz.replace(/_/g, ' ').split('/').pop();
        label.innerHTML = `<input type="checkbox" value="${tz}" class="tz-checkbox"> ${displayTz}`;
        label.querySelector('input').addEventListener('change', filterStations);
        container.appendChild(label);
    });
}

function filterStations() {
    const checkedGenres = Array.from(document.querySelectorAll('.genre-checkbox:checked')).map(cb => cb.value);
    const checkedTz = Array.from(document.querySelectorAll('.tz-checkbox:checked')).map(cb => cb.value);
    
    clearBtn.style.display = (checkedGenres.length > 0 || checkedTz.length > 0) ? 'inline-block' : 'none';
    
    document.querySelectorAll('.station-item').forEach(div => {
        if (checkedGenres.length === 0 && checkedTz.length === 0) {
            div.style.display = 'block';
            return;
        }
        
        const stationGenres = div.dataset.genres || "";
        const stationTz = div.dataset.timezone || "";
        
        const genreMatch = checkedGenres.length === 0 || checkedGenres.some(g => stationGenres.includes(g));
        const tzMatch = checkedTz.length === 0 || checkedTz.includes(stationTz);
        
        div.style.display = (genreMatch && tzMatch) ? 'block' : 'none';
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
    
    // Geographic sorting: longitude-based, starting from NYC going east
    const geoOrder = {
        'America/New_York': 0, 'America/Toronto': 1, 'America/Chicago': 2,
        'America/Denver': 3, 'America/Edmonton': 4, 'America/Los_Angeles': 5,
        'America/Vancouver': 6, 'Pacific/Auckland': 7, 'Asia/Jerusalem': 8,
        'Europe/London': 9, 'Europe/Lisbon': 10, 'Europe/Paris': 11,
        'Europe/Brussels': 12, 'Europe/Amsterdam': 13, 'Europe/Berlin': 14,
        'Europe/Zurich': 15, 'America/Sao_Paulo': 16, 'America/Recife': 17
    };
    
    let sorted;
    if (mode === 'alpha') {
        sorted = [...stationsWithImages].sort((a, b) => a.name.localeCompare(b.name));
    } else if (mode === 'city') {
        sorted = [...stationsWithImages].sort((a, b) => a.city.localeCompare(b.city));
    } else if (mode === 'geo') {
        sorted = [...stationsWithImages].sort((a, b) => {
            const orderA = geoOrder[a.timezone] ?? 50;
            const orderB = geoOrder[b.timezone] ?? 50;
            if (orderA !== orderB) return orderA - orderB;
            return a.city.localeCompare(b.city);
        });
    }
    
    renderStationGrid(sorted);
    
    // Update button states
    [sortAlphaBtn, sortCityBtn, sortGeoBtn].forEach(btn => btn.classList.remove('active'));
    if (mode === 'alpha') sortAlphaBtn.classList.add('active');
    else if (mode === 'city') sortCityBtn.classList.add('active');
    else if (mode === 'geo') sortGeoBtn.classList.add('active');
}

function renderStationGrid(stations) {
    stationGrid.innerHTML = '';
    stations.forEach(station => {
        const div = document.createElement('div');
        div.className = 'station-item';
        div.dataset.genres = station.genres || "";
        div.dataset.timezone = station.timezone || "";
        
        div.innerHTML = `
            <img src="${station.image}" alt="${station.name}" onerror="this.src='https://via.placeholder.com/150?text=No+Image'">
            <p class="station-name">${station.name}</p>
            <p class="station-city">${station.city}</p>
        `;
        div.addEventListener('click', () => playStation(station));
        stationGrid.appendChild(div);
    });
    
    // Re-apply filters
    filterStations();
}

// ===== Audio Identification (Shazam-like) =====
// Note: This requires setting up ACRCloud or similar service
// For now, this is a placeholder that shows how it would work
identifyBtn?.addEventListener('click', async () => {
    identifyResult.textContent = "Listening...";
    identifyResult.className = "identify-result";
    identifyBtn.classList.add('listening');
    identifyBtn.querySelector('.identify-text').textContent = "Listening...";
    
    // This would require:
    // 1. Recording audio from the stream (Web Audio API)
    // 2. Sending to ACRCloud or similar service
    // 3. Displaying the result
    
    // Placeholder: After 3 seconds, show a message
    setTimeout(() => {
        identifyBtn.classList.remove('listening');
        identifyBtn.querySelector('.identify-text').textContent = "What's Playing?";
        
        // Check if we already have metadata
        if (nowPlaying.textContent && nowPlaying.style.display !== 'none') {
            identifyResult.textContent = `From metadata: ${nowPlaying.textContent}`;
        } else {
            identifyResult.textContent = "Audio identification requires ACRCloud API setup. See docs for integration.";
            identifyResult.className = "identify-result error";
        }
    }, 3000);
});

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

clearBtn?.addEventListener('click', () => {
    document.querySelectorAll('.genre-checkbox, .tz-checkbox').forEach(cb => cb.checked = false);
    filterStations();
});

// ===== Sort Button Handlers =====
sortAlphaBtn?.addEventListener('click', () => sortStations('alpha'));
sortCityBtn?.addEventListener('click', () => sortStations('city'));
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
    sortStations('alpha');
}

init();
