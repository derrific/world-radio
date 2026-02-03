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
        // Collect all unique genres, sorted alphabetically
        const allGenres = new Set();
        stationsWithImages.forEach(s => {
            if (s.genres) {
                s.genres.split(',').forEach(g => allGenres.add(g.trim()));
            }
        });
        const sortedGenres = Array.from(allGenres).sort((a, b) => a.localeCompare(b));
        
        // Build array with stations repeated under each genre
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
    
    // Update button states
    [sortAlphaBtn, sortCityBtn, sortGeoBtn, sortGenreBtn].forEach(btn => btn.classList.remove('active'));
    if (mode === 'alpha') sortAlphaBtn.classList.add('active');
    else if (mode === 'city') sortCityBtn.classList.add('active');
    else if (mode === 'geo') sortGeoBtn.classList.add('active');
    else if (mode === 'genre') sortGenreBtn.classList.add('active');
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
        
        const isFavorite = station.category === 'favorite';
        const starIcon = isFavorite ? '<span class="favorite-star">★</span> ' : '';
        
        div.innerHTML = `
            <img src="${station.image}" alt="${station.name}" onerror="this.src='https://via.placeholder.com/150?text=No+Image'">
            <p class="station-name">${starIcon}${station.name}</p>
            <p class="station-city">${station.city}</p>
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
    sortStations('alpha');
}

init();
