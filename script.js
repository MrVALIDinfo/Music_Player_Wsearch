const searchInput = document.querySelector('.search-bar');
const playButton = document.getElementById('play-pause-btn');
const progressBar = document.getElementById('progress-bar');
const currentTimeEl = document.getElementById('current-time');
const totalTimeEl = document.getElementById('total-time');
const trackTitle = document.querySelector('.track-title');
const trackArtist = document.querySelector('.track-artist');
const trackAlbum = document.querySelector('.track-album');
const trackDescription = document.querySelector('.track-description');
const trackCover = document.getElementById('track-cover');

let audio = new Audio();
let isPlaying = false;
let currentTrackIndex = 0;
let currentResults = [];

const resultsContainer = document.createElement('div');
resultsContainer.style.position = 'absolute';
resultsContainer.style.top = '120px';
resultsContainer.style.background = 'rgba(20,20,20,0.95)';
resultsContainer.style.width = '400px';
resultsContainer.style.borderRadius = '10px';
resultsContainer.style.maxHeight = '300px';
resultsContainer.style.overflowY = 'auto';
resultsContainer.style.zIndex = '100';
resultsContainer.style.display = 'none';
document.querySelector('.search-container').appendChild(resultsContainer);

searchInput.addEventListener('input', async () => {
    const query = searchInput.value.trim();
    if (query.length < 2) {
        resultsContainer.style.display = 'none';
        return;
    }

    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=10`;

    const response = await fetch(url);
    const data = await response.json();

    resultsContainer.innerHTML = '';
    currentResults = data.results;

    if (!currentResults.length) {
        resultsContainer.innerHTML = '<p style="color:white; padding:10px;">Ничего не найдено</p>';
        resultsContainer.style.display = 'block';
        return;
    }

    currentResults.forEach((song, index) => {
        const item = document.createElement('div');
        item.style.padding = '10px';
        item.style.cursor = 'pointer';
        item.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
        item.innerHTML = `
            <strong style="color:white;">${song.trackName}</strong><br>
            <span style="color:gray;">${song.artistName} — ${song.collectionName}</span>
        `;
        item.addEventListener('click', () => loadTrack(index));
        item.addEventListener('mouseenter', () => item.style.background = 'rgba(255,255,255,0.1)');
        item.addEventListener('mouseleave', () => item.style.background = 'transparent');
        resultsContainer.appendChild(item);
    });

    resultsContainer.style.display = 'block';
});

function loadTrack(index) {
    const song = currentResults[index];
    if (!song) return;

    currentTrackIndex = index;

    trackTitle.textContent = song.trackName;
    trackArtist.textContent = `by ${song.artistName}`;
    trackAlbum.textContent = `Album: ${song.collectionName}`;
    trackCover.src = song.artworkUrl100.replace('100x100', '600x600');
    trackDescription.textContent = `Genre: ${song.primaryGenreName} | Release: ${song.releaseDate.slice(0, 10)}`;

    audio.src = song.previewUrl;
    audio.load();

    resultsContainer.style.display = 'none';
    searchInput.value = '';

    playAudio();
}

playButton.addEventListener('click', () => {
    if (isPlaying) pauseAudio();
    else playAudio();
});

function playAudio() {
    if (!audio.src) return;
    audio.play();
    isPlaying = true;
    playButton.textContent = '⏸';
}

function pauseAudio() {
    audio.pause();
    isPlaying = false;
    playButton.textContent = '▶';
}

audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
        const progress = (audio.currentTime / audio.duration) * 100;
        progressBar.value = progress;

        currentTimeEl.textContent = formatTime(audio.currentTime);
        totalTimeEl.textContent = formatTime(audio.duration);
    }
});

progressBar.addEventListener('input', () => {
    if (audio.duration) {
        const seekTime = (progressBar.value / 100) * audio.duration;
        audio.currentTime = seekTime;
    }
});

audio.addEventListener('ended', nextTrack);

document.getElementById('next-btn').addEventListener('click', nextTrack);
document.getElementById('prev-btn').addEventListener('click', prevTrack);

function nextTrack() {
    if (currentResults.length === 0) return;
    currentTrackIndex = (currentTrackIndex + 1) % currentResults.length;
    loadTrack(currentTrackIndex);
}

function prevTrack() {
    if (currentResults.length === 0) return;
    currentTrackIndex = (currentTrackIndex - 1 + currentResults.length) % currentResults.length;
    loadTrack(currentTrackIndex);
}

function formatTime(sec) {
    const minutes = Math.floor(sec / 60);
    const seconds = Math.floor(sec % 60);
    return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
}
