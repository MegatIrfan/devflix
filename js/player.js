/**
 * CineStream TV - Seamless Netflix Video Player Controller
 * Plays movies and series automatically in background without exposing raw IDs
 */

class NetflixPlayer {
    constructor() {
        this.currentMedia = null;
        this.currentServerIndex = 0;
        this.servers = STREAM_SERVERS;
        this.historyKey = 'netflix_tv_history';
        this.progressKey = 'devflix_playback_progress_v2';
        this.lastKnownTime = 0;

        this.init();
    }

    init() {
        this.playerView = document.getElementById('tv-player');
        this.playerIframe = document.getElementById('player-screen-iframe');
        this.playerTitle = document.getElementById('player-title-display');
        this.playerSubtitle = document.getElementById('player-episode-display');
        this.backNav = document.getElementById('player-back-nav');
        this.serverSelect = document.getElementById('player-server-select');
        this.nextServerBtn = document.getElementById('player-next-server-btn');
        this.tvEpControls = document.getElementById('tv-ep-controls');
        this.seasonSelect = document.getElementById('player-season-select');
        this.episodeSelect = document.getElementById('player-episode-select');
        this.nextEpBtn = document.getElementById('player-next-ep-btn');
        this.fullscreenBtn = document.getElementById('player-fullscreen-btn');
        this.adShieldBadge = document.getElementById('adshield-status');

        this.populateServerOptions();
        this.bindEvents();
        this.setupCrossDomainProgressTracker();
    }

    setupCrossDomainProgressTracker() {
        // Track current playback time via embed postMessage APIs
        window.addEventListener('message', (e) => {
            try {
                let data = e.data;
                if (typeof data === 'string') {
                    try { data = JSON.parse(data); } catch(err) {}
                }
                if (!data) return;

                // Handle diverse embed player time messages (Vidlink, VidSrc, JWPlayer, etc.)
                const time = data.currentTime || data.time || data.progress || (data.data && data.data.currentTime);
                if (typeof time === 'number' && time > 2) {
                    this.lastKnownTime = Math.floor(time);
                    if (this.currentMedia && this.currentMedia.id) {
                        this.savePlaybackProgress(this.currentMedia.id, this.lastKnownTime);
                    }
                }
            } catch (err) {}
        });
    }

    savePlaybackProgress(id, seconds) {
        if (!id || seconds <= 0) return;
        try {
            const raw = localStorage.getItem(this.progressKey);
            const map = raw ? JSON.parse(raw) : {};
            map[id] = { time: Math.floor(seconds), updatedAt: Date.now() };
            localStorage.setItem(this.progressKey, JSON.stringify(map));
        } catch (e) {}
    }

    getPlaybackProgress(id) {
        if (!id) return 0;
        try {
            const raw = localStorage.getItem(this.progressKey);
            if (!raw) return 0;
            const map = JSON.parse(raw);
            return map[id] ? (map[id].time || 0) : 0;
        } catch (e) {
            return 0;
        }
    }

    populateServerOptions() {
        if (!this.serverSelect) return;
        this.serverSelect.innerHTML = '';
        this.servers.forEach((server, index) => {
            const opt = document.createElement('option');
            opt.value = index;
            opt.textContent = `${server.name} (${server.badge})`;
            if (index === this.currentServerIndex) opt.selected = true;
            this.serverSelect.appendChild(opt);
        });
    }

    bindEvents() {
        // Back navigation button
        if (this.backNav) {
            this.backNav.onclick = () => this.close();
        }

        // Close on ESC
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen()) {
                this.close();
            }
        });

        // Server switcher dropdown
        if (this.serverSelect) {
            this.serverSelect.addEventListener('change', (e) => {
                this.currentServerIndex = parseInt(e.target.value, 10);
                this.loadIframe();
            });
        }

        // Quick Next Server button
        if (this.nextServerBtn) {
            this.nextServerBtn.onclick = () => {
                this.currentServerIndex = (this.currentServerIndex + 1) % this.servers.length;
                if (this.serverSelect) this.serverSelect.value = this.currentServerIndex;
                this.loadIframe();
            };
        }

        // Season change
        if (this.seasonSelect) {
            this.seasonSelect.addEventListener('change', (e) => {
                const season = parseInt(e.target.value, 10);
                this.updateEpisodesDropdown(season);
                this.playEpisode(season, 1);
            });
        }

        // Episode change
        if (this.episodeSelect) {
            this.episodeSelect.addEventListener('change', (e) => {
                const ep = parseInt(e.target.value, 10);
                const season = parseInt(this.seasonSelect.value, 10) || 1;
                this.playEpisode(season, ep);
            });
        }

        // Next Episode Button
        if (this.nextEpBtn) {
            this.nextEpBtn.onclick = () => {
                const curEp = this.currentMedia.episode || 1;
                const curSeason = this.currentMedia.season || 1;
                this.playEpisode(curSeason, curEp + 1);
            };
        }

        // Fullscreen Toggle
        if (this.fullscreenBtn) {
            this.fullscreenBtn.onclick = () => {
                if (!document.fullscreenElement) {
                    this.playerView.requestFullscreen().catch(() => {});
                } else {
                    document.exitFullscreen().catch(() => {});
                }
            };
        }
    }

    isOpen() {
        return this.playerView && !this.playerView.classList.contains('hidden');
    }

    /**
     * Start playing selected movie or show
     */
    play(media) {
        if (!media) return;
        this.currentMedia = {
            id: media.id,
            type: media.type === 'series' || media.type === 'tv' ? 'series' : 'movie',
            title: media.title,
            poster: media.poster,
            year: media.year,
            season: media.season || 1,
            episode: media.episode || 1,
            seriesInfo: media.seriesInfo || null
        };

        // Resume from saved playback timestamp
        const savedTime = this.getPlaybackProgress(this.currentMedia.id);
        this.lastKnownTime = savedTime || 0;

        if (this.playerTitle) {
            this.playerTitle.textContent = this.currentMedia.title;
        }

        // Setup TV series controls if show
        if (this.currentMedia.type === 'series') {
            if (this.tvEpControls) this.tvEpControls.classList.remove('hidden');
            this.setupTvControls();
        } else {
            if (this.tvEpControls) this.tvEpControls.classList.add('hidden');
            if (this.playerSubtitle) {
                this.playerSubtitle.textContent = `${this.currentMedia.year || ''} • Ultra HD 4K`;
            }
        }

        this.loadIframe();

        if (this.playerView) {
            this.playerView.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }

        this.saveToHistory();
    }

    async setupTvControls() {
        const id = this.currentMedia.id;

        // Render initial basic fallback seasons
        this.renderSeasonOptions([1, 2, 3, 4]);
        this.updateEpisodesDropdown(this.currentMedia.season);
        this.updateSubtitleText();

        try {
            // Fetch live Cinemeta episode index for accurate seasons and playable episodes
            const res = await fetch(`https://v3-cinemeta.strem.io/meta/series/${encodeURIComponent(id)}.json`);
            if (res.ok) {
                const data = await res.json();
                if (data && data.meta && Array.isArray(data.meta.videos) && data.meta.videos.length > 0) {
                    const validVideos = data.meta.videos.filter(v => typeof v.season === 'number' && v.season > 0);
                    const seasonsSet = new Set(validVideos.map(v => v.season));
                    const seasons = Array.from(seasonsSet).sort((a, b) => a - b);

                    this.currentMedia.seriesInfo = {
                        videos: validVideos,
                        seasons: seasons
                    };

                    this.renderSeasonOptions(seasons.length > 0 ? seasons : [1]);
                    this.updateEpisodesDropdown(this.currentMedia.season);
                    this.updateSubtitleText();
                }
            }
        } catch (e) {
            console.warn('Cinemeta series episodes fetch notice:', e);
        }
    }

    renderSeasonOptions(seasons) {
        if (!this.seasonSelect) return;
        this.seasonSelect.innerHTML = '';
        seasons.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s;
            opt.textContent = `Season ${s}`;
            if (s === this.currentMedia.season) opt.selected = true;
            this.seasonSelect.appendChild(opt);
        });
    }

    updateEpisodesDropdown(season) {
        if (!this.episodeSelect) return;
        this.episodeSelect.innerHTML = '';

        if (this.currentMedia.seriesInfo && this.currentMedia.seriesInfo.videos) {
            const epList = this.currentMedia.seriesInfo.videos
                .filter(v => v.season === season)
                .sort((a, b) => a.episode - b.episode);

            if (epList.length > 0) {
                epList.forEach(ep => {
                    const opt = document.createElement('option');
                    opt.value = ep.episode;
                    const cleanTitle = ep.title && !ep.title.toLowerCase().includes('undefined') ? ep.title : `Episode ${ep.episode}`;
                    opt.textContent = `Ep ${ep.episode}: ${cleanTitle}`;
                    if (ep.episode === this.currentMedia.episode) opt.selected = true;
                    this.episodeSelect.appendChild(opt);
                });
                return;
            }
        }

        // Default conservative fallback
        const maxEpisodes = 10;
        for (let ep = 1; ep <= maxEpisodes; ep++) {
            const opt = document.createElement('option');
            opt.value = ep;
            opt.textContent = `Episode ${ep}`;
            if (ep === this.currentMedia.episode) opt.selected = true;
            this.episodeSelect.appendChild(opt);
        }
    }

    updateSubtitleText() {
        if (!this.playerSubtitle) return;
        if (this.currentMedia.type === 'series') {
            this.playerSubtitle.textContent = `Season ${this.currentMedia.season} : Episode ${this.currentMedia.episode}`;
        }
    }

    playEpisode(season, episode) {
        this.currentMedia.season = season;
        this.currentMedia.episode = episode;
        this.lastKnownTime = 0;
        if (this.seasonSelect) this.seasonSelect.value = season;
        if (this.episodeSelect) this.episodeSelect.value = episode;
        this.updateSubtitleText();
        this.loadIframe();
        this.saveToHistory();
    }

    loadIframe() {
        if (!this.playerIframe || !this.currentMedia) return;
        const server = this.servers[this.currentServerIndex];
        let streamUrl = '';

        const startAt = this.lastKnownTime > 5 ? this.lastKnownTime : (this.getPlaybackProgress(this.currentMedia.id) || 0);

        if (this.currentMedia.type === 'series') {
            streamUrl = server.getTvUrl(this.currentMedia.id, this.currentMedia.season, this.currentMedia.episode, startAt);
        } else {
            streamUrl = server.getMovieUrl(this.currentMedia.id, startAt);
        }

        // Completely remove any sandbox attribute so video embeds never throw "sandboxed frame" error
        this.playerIframe.removeAttribute('sandbox');

        this.playerIframe.src = streamUrl;
    }

    close() {
        if (this.playerIframe) {
            this.playerIframe.src = 'about:blank';
        }
        if (this.playerView) {
            this.playerView.classList.add('hidden');
            document.body.style.overflow = '';
        }
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
        }
    }

    saveToHistory() {
        if (!this.currentMedia) return;
        try {
            let history = JSON.parse(localStorage.getItem(this.historyKey) || '[]');
            history = history.filter(item => item.id !== this.currentMedia.id);
            history.unshift({
                id: this.currentMedia.id,
                type: this.currentMedia.type,
                title: this.currentMedia.title,
                poster: this.currentMedia.poster,
                year: this.currentMedia.year,
                season: this.currentMedia.season,
                episode: this.currentMedia.episode,
                timestamp: Date.now()
            });
            if (history.length > 20) history = history.slice(0, 20);
            localStorage.setItem(this.historyKey, JSON.stringify(history));
            window.dispatchEvent(new CustomEvent('netflix_history_changed'));
        } catch (e) {}
    }

    getHistory() {
        try {
            return JSON.parse(localStorage.getItem(this.historyKey) || '[]');
        } catch (e) {
            return [];
        }
    }
}

// Global player instance
window.netflixPlayer = null;
document.addEventListener('DOMContentLoaded', () => {
    window.netflixPlayer = new NetflixPlayer();
});
