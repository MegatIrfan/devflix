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
        id: 'vidsrc-su',
        name: 'Server 1 (VidSrc SU - 1080p No Popups)',
        badge: 'Zero Ads / 1080p',
        supportsTv: true,
        getMovieUrl: (imdbId) => `https://vidsrc.su/embed/movie/${imdbId}`,
        getTvUrl: (imdbId, season, episode) => `https://vidsrc.su/embed/tv/${imdbId}/${season}/${episode}`
    },
    {
        id: 'multiembed',
        name: 'Server 2 (MultiEmbed - Clean Stream)',
        badge: 'No Popups',
        supportsTv: true,
        getMovieUrl: (imdbId) => `https://multiembed.mov/?video_id=${imdbId}`,
        getTvUrl: (imdbId, season, episode) => `https://multiembed.mov/?video_id=${imdbId}&s=${season}&e=${episode}`
    },
    {
        id: '2embed',
        name: 'Server 3 (2Embed Ultra - TV Series Ready)',
        badge: 'High Reliability',
        supportsTv: true,
        getMovieUrl: (imdbId) => `https://2embed.skin/embed/${imdbId}`,
        getTvUrl: (imdbId, season, episode) => `https://2embed.skin/embedtv/${imdbId}&s=${season}&e=${episode}`
    },
    {
        id: 'vidlink-jw',
        name: 'Server 4 (VidLink Pro - JWPlayer)',
        badge: 'Seamless Subs',
        supportsTv: true,
        getMovieUrl: (imdbId, startAt = 0) => `https://vidlink.pro/movie/${imdbId}?player=jw&primaryColor=e50914${startAt > 5 ? `&startAt=${startAt}` : ''}`,
        getTvUrl: (imdbId, season, episode, startAt = 0) => `https://vidlink.pro/tv/${imdbId}/${season}/${episode}?player=jw&primaryColor=e50914${startAt > 5 ? `&startAt=${startAt}` : ''}`
    },
    {
        id: 'vidsrc-to',
        name: 'Server 5 (VidSrc Pro - Backup Source)',
        badge: 'Alternative Backup',
        supportsTv: true,
        getMovieUrl: (imdbId) => `https://vidsrc.to/embed/movie/${imdbId}`,
        getTvUrl: (imdbId, season, episode) => `https://vidsrc.to/embed/tv/${imdbId}/${season}/${episode}`
    },
    {
        id: 'vidsrc-cc',
        name: 'Server 6 (VidSrc CC)',
        badge: 'Auto Subtitles',
        supportsTv: true,
        getMovieUrl: (imdbId) => `https://vidsrc.cc/v2/embed/movie/${imdbId}?autoPlay=true`,
        getTvUrl: (imdbId, season, episode) => `https://vidsrc.cc/v2/embed/tv/${imdbId}/${season}/${episode}?autoPlay=true`
    },
    {
        id: 'embedsu',
        name: 'Server 7 (EmbedSU)',
        badge: 'Clean & Fast',
        supportsTv: true,
        getMovieUrl: (imdbId) => `https://embed.su/embed/movie/${imdbId}`,
        getTvUrl: (imdbId, season, episode) => `https://embed.su/embed/tv/${imdbId}/${season}/${episode}`
    },
    {
        id: 'smashystream',
        name: 'Server 8 (SmashyStream)',
        badge: 'High Speed',
        supportsTv: true,
        getMovieUrl: (imdbId) => `https://player.smashy.stream/movie/${imdbId}`,
        getTvUrl: (imdbId, season, episode) => `https://player.smashy.stream/tv/${imdbId}?s=${season}&e=${episode}`
    },
    {
        id: 'vidsrc-in',
        name: 'Server 9 (VidSrc In)',
        badge: 'Alternative',
        supportsTv: true,
        getMovieUrl: (imdbId) => `https://vidsrc.in/embed/movie?imdb=${imdbId}`,
        getTvUrl: (imdbId, season, episode) => `https://vidsrc.in/embed/tv?imdb=${imdbId}&season=${season}&episode=${episode}`
    }
];

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { STREAM_SERVERS };
}
