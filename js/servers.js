/**
 * DevFlix Video Streaming Server Providers
 * Supports playing by IMDb ID (e.g. tt1375666) or TMDB ID
 */

/**
 * DevFlix Video Streaming Server Providers
 * Supports playing by IMDb ID (e.g. tt1375666) or TMDB ID
 * Features JWPlayer & VidSrc with seamless subtitle switching without resetting playback
 */

/**
 * DevFlix Video Streaming Server Providers
 * Supports playing by IMDb ID (e.g. tt1375666) or TMDB ID
 * Verified working servers with seamless subtitle switching & TV series episode playback
 */

const STREAM_SERVERS = [
    {
        id: 'vidlink-jw',
        name: 'Server 1 (VidLink Pro - Multi-Sub & TMDB Auto-Match)',
        badge: 'Best Subtitles & Regional Asian',
        supportsTv: true,
        getMovieUrl: (id, startAt = 0, tmdbId = null) => {
            const playId = tmdbId || id;
            let url = `https://vidlink.pro/movie/${playId}?player=jw&primaryColor=e50914&autoplay=true`;
            if (startAt > 5) url += `&startAt=${startAt}`;
            return url;
        },
        getTvUrl: (id, season, episode, startAt = 0, tmdbId = null) => {
            const playId = tmdbId || id;
            let url = `https://vidlink.pro/tv/${playId}/${season}/${episode}?player=jw&primaryColor=e50914&autoplay=true`;
            if (startAt > 5) url += `&startAt=${startAt}`;
            return url;
        }
    },
    {
        id: 'multiembed',
        name: 'Server 2 (MultiEmbed - High Asian Compatibility)',
        badge: 'TMDB & Regional Streaming',
        supportsTv: true,
        getMovieUrl: (id, startAt = 0, tmdbId = null) => {
            if (tmdbId) return `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`;
            return `https://multiembed.mov/?video_id=${id}`;
        },
        getTvUrl: (id, season, episode, startAt = 0, tmdbId = null) => {
            if (tmdbId) return `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${season}&e=${episode}`;
            return `https://multiembed.mov/?video_id=${id}&s=${season}&e=${episode}`;
        }
    },
    {
        id: 'embedsu',
        name: 'Server 3 (EmbedSU - Fast Cloud)',
        badge: 'Zero Ads / TMDB Ready',
        supportsTv: true,
        getMovieUrl: (id, startAt = 0, tmdbId = null) => {
            const playId = tmdbId || id;
            return `https://embed.su/embed/movie/${playId}`;
        },
        getTvUrl: (id, season, episode, startAt = 0, tmdbId = null) => {
            const playId = tmdbId || id;
            return `https://embed.su/embed/tv/${playId}/${season}/${episode}`;
        }
    },
    {
        id: 'vidsrc-su',
        name: 'Server 4 (VidSrc SU - 1080p Ultra)',
        badge: 'Zero Ads / 1080p',
        supportsTv: true,
        getMovieUrl: (id) => `https://vidsrc.su/embed/movie/${id}`,
        getTvUrl: (id, season, episode) => `https://vidsrc.su/embed/tv/${id}/${season}/${episode}`
    },
    {
        id: '2embed',
        name: 'Server 5 (2Embed Ultra - TV Series Ready)',
        badge: 'High Reliability',
        supportsTv: true,
        getMovieUrl: (id, startAt = 0, tmdbId = null) => {
            const playId = tmdbId || id;
            return `https://2embed.skin/embed/${playId}`;
        },
        getTvUrl: (id, season, episode, startAt = 0, tmdbId = null) => {
            const playId = tmdbId || id;
            return `https://2embed.skin/embedtv/${playId}&s=${season}&e=${episode}`;
        }
    },
    {
        id: 'vidsrc-cc',
        name: 'Server 6 (VidSrc CC - Auto Subtitles)',
        badge: 'Auto Subtitles',
        supportsTv: true,
        getMovieUrl: (id, startAt = 0, tmdbId = null) => {
            const playId = tmdbId || id;
            return `https://vidsrc.cc/v2/embed/movie/${playId}?autoPlay=true`;
        },
        getTvUrl: (id, season, episode, startAt = 0, tmdbId = null) => {
            const playId = tmdbId || id;
            return `https://vidsrc.cc/v2/embed/tv/${playId}/${season}/${episode}?autoPlay=true`;
        }
    },
    {
        id: 'vidsrc-to',
        name: 'Server 7 (VidSrc Pro - Backup Source)',
        badge: 'Alternative Backup',
        supportsTv: true,
        getMovieUrl: (id) => `https://vidsrc.to/embed/movie/${id}`,
        getTvUrl: (id, season, episode) => `https://vidsrc.to/embed/tv/${id}/${season}/${episode}`
    },
    {
        id: 'smashystream',
        name: 'Server 8 (SmashyStream)',
        badge: 'High Speed',
        supportsTv: true,
        getMovieUrl: (id, startAt = 0, tmdbId = null) => {
            const playId = tmdbId || id;
            return `https://player.smashy.stream/movie/${playId}`;
        },
        getTvUrl: (id, season, episode, startAt = 0, tmdbId = null) => {
            const playId = tmdbId || id;
            return `https://player.smashy.stream/tv/${playId}?s=${season}&e=${episode}`;
        }
    },
    {
        id: 'vidsrc-in',
        name: 'Server 9 (VidSrc In)',
        badge: 'Alternative',
        supportsTv: true,
        getMovieUrl: (id) => `https://vidsrc.in/embed/movie?imdb=${id}`,
        getTvUrl: (id, season, episode) => `https://vidsrc.in/embed/tv?imdb=${id}&season=${season}&episode=${episode}`
    }
];

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { STREAM_SERVERS };
}
