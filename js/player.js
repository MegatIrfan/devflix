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
        this.activeSubtitle = null; // { url, label, lang }
        this.availableSubtitles = [];
        this.parsedCues = []; // In-player subtitle cues
        this.subtitleInterval = null;

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
        this.setupSubtitleModal();
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
                if (typeof time === 'number' && time > 0) {
                    this.lastKnownTime = Math.floor(time);
                    if (this.currentMedia && this.currentMedia.id && this.lastKnownTime > 2) {
                        this.savePlaybackProgress(this.currentMedia.id, this.lastKnownTime);
                    }
                    this.updateSubtitleOverlay(time);
                }
            } catch (err) {}
        });
    }

    updateSubtitleOverlay(currentTime) {
        if (!this.parsedCues || this.parsedCues.length === 0) return;
        const overlay = document.getElementById('player-subtitle-overlay');
        const textElem = document.getElementById('player-subtitle-text');
        if (!overlay || !textElem) return;

        const currentCue = this.parsedCues.find(c => currentTime >= c.start && currentTime <= c.end);
        if (currentCue) {
            textElem.innerHTML = currentCue.text;
            overlay.classList.remove('hidden');
        } else {
            overlay.classList.add('hidden');
        }
    }

    startLocalSubtitleTimer() {
        if (this.subtitleTimer) clearInterval(this.subtitleTimer);
        this.subtitleTimer = setInterval(() => {
            if (this.parsedCues && this.parsedCues.length > 0 && this.isOpen()) {
                this.lastKnownTime = (this.lastKnownTime || 0) + 0.5;
                this.updateSubtitleOverlay(this.lastKnownTime);
            }
        }, 500);
    }

    stopLocalSubtitleTimer() {
        if (this.subtitleTimer) {
            clearInterval(this.subtitleTimer);
            this.subtitleTimer = null;
        }
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

    setupSubtitleModal() {
        const subBtn = document.getElementById('player-subtitle-search-btn');
        const modal = document.getElementById('player-subtitle-modal');
        const closeBtn = document.getElementById('close-sub-modal-btn');
        const langFilter = document.getElementById('sub-lang-filter');
        const searchInput = document.getElementById('sub-search-input');
        const externalBtn = document.getElementById('sub-open-external-btn');

        if (subBtn) {
            subBtn.onclick = (e) => {
                e.preventDefault();
                this.openSubtitleModal();
            };
        }

        if (closeBtn && modal) {
            closeBtn.onclick = () => modal.classList.add('hidden');
        }

        if (modal) {
            modal.onclick = (e) => {
                if (e.target === modal) modal.classList.add('hidden');
            };
        }

        if (langFilter) {
            langFilter.onchange = () => this.filterAndRenderSubtitles();
        }

        if (searchInput) {
            let timer = null;
            searchInput.oninput = () => {
                clearTimeout(timer);
                timer = setTimeout(() => this.filterAndRenderSubtitles(), 150);
            };
        }

        if (externalBtn) {
            externalBtn.onclick = (e) => {
                if (this.currentMedia && this.currentMedia.title) {
                    externalBtn.href = `https://subdl.com/search/${encodeURIComponent(this.currentMedia.title)}`;
                }
            };
        }
    }

    async openSubtitleModal() {
        const modal = document.getElementById('player-subtitle-modal');
        const titleDisplay = document.getElementById('sub-modal-media-title');
        const listContainer = document.getElementById('sub-results-list');
        const externalBtn = document.getElementById('sub-open-external-btn');

        if (!modal || !this.currentMedia) return;
        modal.classList.remove('hidden');

        const epContext = this.currentMedia.type === 'series' 
            ? ` (S${this.currentMedia.season}:E${this.currentMedia.episode})` 
            : '';
        if (titleDisplay) {
            titleDisplay.textContent = `${this.currentMedia.title}${epContext}`;
        }
        if (externalBtn) {
            externalBtn.href = `https://subdl.com/search/${encodeURIComponent(this.currentMedia.title)}`;
        }

        if (listContainer) {
            listContainer.innerHTML = `
                <div style="text-align:center;color:var(--text-muted,#aaa);padding:2.5rem 1rem;">
                    <div style="display:inline-block;width:30px;height:30px;border:3px solid rgba(255,255,255,0.2);border-top-color:var(--accent-red,#e50914);border-radius:50%;animation:spin 1s linear infinite;margin-bottom:0.75rem;"></div>
                    <div>Mencari subtitle dari OpenSubtitles v3 untuk <b>${this.currentMedia.title}</b>...</div>
                </div>
            `;
        }

        try {
            let endpoint = '';
            if (this.currentMedia.type === 'series') {
                const s = this.currentMedia.season || 1;
                const ep = this.currentMedia.episode || 1;
                endpoint = `https://opensubtitles-v3.strem.io/subtitles/series/${encodeURIComponent(this.currentMedia.id)}:${s}:${ep}.json`;
            } else {
                endpoint = `https://opensubtitles-v3.strem.io/subtitles/movie/${encodeURIComponent(this.currentMedia.id)}.json`;
            }

            const res = await fetch(endpoint);
            if (res.ok) {
                const data = await res.json();
                this.availableSubtitles = (data && Array.isArray(data.subtitles)) ? data.subtitles : [];
                this.filterAndRenderSubtitles();
            } else {
                throw new Error('API request failed');
            }
        } catch (err) {
            if (listContainer) {
                listContainer.innerHTML = `
                    <div style="text-align:center;color:#ff8888;padding:2rem;">
                        <p>⚠️ Gagal berhubung dengan OpenSubtitles secara terus.</p>
                        <p style="font-size:0.85rem;color:var(--text-muted,#aaa);margin-top:0.5rem;">
                            Anda boleh guna <b>Server 4 (VidLink Pro)</b> yang sedia ada berpuluh subtitle automatik, atau layari SubDL/Subscene.
                        </p>
                    </div>
                `;
            }
        }
    }

    filterAndRenderSubtitles() {
        const listContainer = document.getElementById('sub-results-list');
        const langFilter = document.getElementById('sub-lang-filter');
        const searchInput = document.getElementById('sub-search-input');
        if (!listContainer) return;

        const targetLang = langFilter ? langFilter.value : 'all';
        const q = searchInput ? searchInput.value.toLowerCase().trim() : '';

        const langNameMap = {
            may: 'Malay (Bahasa Melayu)',
            ind: 'Indonesian',
            eng: 'English',
            zho: 'Chinese',
            jpn: 'Japanese',
            kor: 'Korean',
            spa: 'Spanish',
            ara: 'Arabic',
            rus: 'Russian',
            fre: 'French',
            ger: 'German',
            ita: 'Italian',
            por: 'Portuguese',
            tur: 'Turkish',
            vie: 'Vietnamese',
            tha: 'Thai'
        };

        let matches = [...(this.availableSubtitles || [])];

        if (targetLang !== 'all') {
            matches = matches.filter(s => s.lang === targetLang);
        }

        if (q) {
            matches = matches.filter(s => {
                const langName = (langNameMap[s.lang] || s.lang || '').toLowerCase();
                const fn = (s.subtitleFileName || '').toLowerCase();
                const rn = (s.movieReleaseName || '').toLowerCase();
                return langName.includes(q) || fn.includes(q) || rn.includes(q);
            });
        }

        if (matches.length === 0) {
            listContainer.innerHTML = `
                <div style="text-align:center;color:var(--text-muted,#aaa);padding:2rem;">
                    Tiada fail subtitle dijumpai bagi kriteria bahasa ini.<br>
                    <small style="opacity:0.7;">Cuba pilih "All Languages" atau tukar ke Server 4 (VidLink Pro).</small>
                </div>
            `;
            return;
        }

        listContainer.innerHTML = '';

        matches.slice(0, 50).forEach((sub, idx) => {
            const item = document.createElement('div');
            item.style.cssText = `
                display: flex;
                align-items: center;
                justify-content: space-between;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                padding: 0.75rem 1rem;
                gap: 0.75rem;
                transition: all 0.2s;
            `;

            const langTitle = langNameMap[sub.lang] || sub.lang.toUpperCase();
            const fileName = sub.subtitleFileName || sub.movieReleaseName || `Subtitle #${idx + 1}`;
            const isCurrent = this.activeSubtitle && this.activeSubtitle.url === sub.url;

            item.innerHTML = `
                <div style="flex:1;overflow:hidden;">
                    <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.25rem;">
                        <span style="font-size:0.75rem;font-weight:700;padding:2px 8px;border-radius:6px;background:${isCurrent ? '#46d369' : '#e50914'};color:#fff;text-transform:uppercase;">
                            ${sub.lang}
                        </span>
                        <span style="font-size:0.9rem;font-weight:600;color:#fff;">${langTitle}</span>
                        ${sub.fpsMilli ? `<span style="font-size:0.75rem;color:var(--text-muted,#888);">${(sub.fpsMilli/1000).toFixed(1)} FPS</span>` : ''}
                    </div>
                    <div style="font-size:0.78rem;color:var(--text-muted,#aaa);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                        ${fileName}
                    </div>
                </div>
                <div style="display:flex;gap:0.4rem;align-items:center;">
                    <a href="${sub.url}" download="${fileName}" target="_blank" title="Download .srt" style="background:rgba(255,255,255,0.1);border:none;color:#fff;padding:0.45rem 0.7rem;border-radius:8px;font-size:0.8rem;text-decoration:none;display:inline-flex;align-items:center;">
                        💾 .srt
                    </a>
                    <button class="apply-sub-btn" style="background:${isCurrent ? '#46d369' : 'var(--accent-red,#e50914)'};border:none;color:#fff;font-weight:600;padding:0.45rem 0.9rem;border-radius:8px;font-size:0.8rem;cursor:pointer;">
                        ${isCurrent ? '✓ Digunakan' : 'Gunakan'}
                    </button>
                </div>
            `;

            const applyBtn = item.querySelector('.apply-sub-btn');
            if (applyBtn) {
                applyBtn.onclick = (e) => {
                    e.preventDefault();
                    this.applyCustomSubtitle(sub, langTitle);
                };
            }

            listContainer.appendChild(item);
        });
    }

    async applyCustomSubtitle(sub, langTitle) {
        this.activeSubtitle = {
            url: sub.url,
            label: langTitle,
            lang: sub.lang
        };

        const subBtn = document.getElementById('player-subtitle-search-btn');
        if (subBtn) {
            subBtn.innerHTML = `💬 Sub: ${sub.lang.toUpperCase()} ✓`;
            subBtn.style.background = '#46d369';
            subBtn.style.color = '#000';
            subBtn.style.fontWeight = '700';
        }

        // Close modal without resetting/black screening the video iframe
        const modal = document.getElementById('player-subtitle-modal');
        if (modal) modal.classList.add('hidden');

        // Fetch and parse subtitle cues for client-side overlay engine
        try {
            const resp = await fetch(sub.url);
            if (resp.ok) {
                const srtContent = await resp.text();
                this.parsedCues = this.parseSRT(srtContent);
                this.startLocalSubtitleTimer();
            }
        } catch(e) {
            console.warn('Could not load SRT for live overlay:', e);
        }
    }

    parseSRT(data) {
        const cues = [];
        if (!data) return cues;
        const normalized = data.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        const blocks = normalized.split('\n\n');

        const parseTime = (timeStr) => {
            if (!timeStr) return 0;
            const parts = timeStr.trim().split(':');
            if (parts.length < 3) return 0;
            const hrs = parseFloat(parts[0]) || 0;
            const mins = parseFloat(parts[1]) || 0;
            const secParts = parts[2].split(/[,.]/);
            const secs = parseFloat(secParts[0]) || 0;
            const millis = parseFloat(secParts[1] || 0) / 1000;
            return (hrs * 3600) + (mins * 60) + secs + millis;
        };

        for (const block of blocks) {
            const lines = block.trim().split('\n');
            if (lines.length >= 2) {
                const timeLineIndex = lines[0].includes('-->') ? 0 : 1;
                const timeLine = lines[timeLineIndex];
                if (timeLine && timeLine.includes('-->')) {
                    const [startStr, endStr] = timeLine.split('-->');
                    const textLines = lines.slice(timeLineIndex + 1).join('<br>');
                    cues.push({
                        start: parseTime(startStr),
                        end: parseTime(endStr),
                        text: textLines
                    });
                }
            }
        }
        return cues;
    }

    close() {
        this.stopLocalSubtitleTimer();
        this.parsedCues = [];
        const overlay = document.getElementById('player-subtitle-overlay');
        if (overlay) overlay.classList.add('hidden');

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
