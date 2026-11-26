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
        name: 'Server 1 (VidLink Pro - Auto Multi-Sub)',
        badge: 'Auto Subtitles & 4K',
        supportsTv: true,
        getMovieUrl: (imdbId, startAt = 0, subUrl = '', subLabel = 'Malay') => {
            let url = `https://vidlink.pro/movie/${imdbId}?player=jw&primaryColor=e50914&autoplay=true`;
            if (startAt > 5) url += `&startAt=${startAt}`;
            if (subUrl) url += `&sub_file=${encodeURIComponent(subUrl)}&sub_label=${encodeURIComponent(subLabel)}`;
            return url;
        },
        getTvUrl: (imdbId, season, episode, startAt = 0, subUrl = '', subLabel = 'Malay') => {
            let url = `https://vidlink.pro/tv/${imdbId}/${season}/${episode}?player=jw&primaryColor=e50914&autoplay=true`;
            if (startAt > 5) url += `&startAt=${startAt}`;
            if (subUrl) url += `&sub_file=${encodeURIComponent(subUrl)}&sub_label=${encodeURIComponent(subLabel)}`;
            return url;
        }
    },
    {
        id: 'vidsrc-su',
        name: 'Server 2 (VidSrc SU - 1080p Ultra)',
        badge: 'Zero Ads / 1080p',
        supportsTv: true,
        getMovieUrl: (imdbId, startAt = 0, subUrl = '', subLabel = 'Malay') => {
            let url = `https://vidsrc.su/embed/movie/${imdbId}`;
            if (subUrl) url += `?sub_file=${encodeURIComponent(subUrl)}&sub_label=${encodeURIComponent(subLabel)}`;
            return url;
        },
        getTvUrl: (imdbId, season, episode, startAt = 0, subUrl = '', subLabel = 'Malay') => {
            let url = `https://vidsrc.su/embed/tv/${imdbId}/${season}/${episode}`;
            if (subUrl) url += `?sub_file=${encodeURIComponent(subUrl)}&sub_label=${encodeURIComponent(subLabel)}`;
            return url;
        }
    },
    {
        id: 'multiembed',
        name: 'Server 3 (MultiEmbed - Clean Stream)',
        badge: 'Fast & Reliable',
        supportsTv: true,
        getMovieUrl: (imdbId, startAt = 0, subUrl = '', subLabel = 'Malay') => {
            let url = `https://multiembed.mov/?video_id=${imdbId}`;
            if (subUrl) url += `&sub_file=${encodeURIComponent(subUrl)}&sub_label=${encodeURIComponent(subLabel)}`;
            return url;
        },
        getTvUrl: (imdbId, season, episode, startAt = 0, subUrl = '', subLabel = 'Malay') => {
            let url = `https://multiembed.mov/?video_id=${imdbId}&s=${season}&e=${episode}`;
            if (subUrl) url += `&sub_file=${encodeURIComponent(subUrl)}&sub_label=${encodeURIComponent(subLabel)}`;
            return url;
        }
    },
    {
        id: '2embed',
        name: 'Server 4 (2Embed Ultra - TV Series Ready)',
        badge: 'High Reliability',
        supportsTv: true,
        getMovieUrl: (imdbId, startAt = 0, subUrl = '', subLabel = 'Malay') => {
            let url = `https://2embed.skin/embed/${imdbId}`;
            if (subUrl) url += `?sub_file=${encodeURIComponent(subUrl)}&sub_label=${encodeURIComponent(subLabel)}`;
            return url;
        },
        getTvUrl: (imdbId, season, episode, startAt = 0, subUrl = '', subLabel = 'Malay') => {
            let url = `https://2embed.skin/embedtv/${imdbId}&s=${season}&e=${episode}`;
            if (subUrl) url += `&sub_file=${encodeURIComponent(subUrl)}&sub_label=${encodeURIComponent(subLabel)}`;
            return url;
        }
    },
    {
        id: 'vidsrc-to',
        name: 'Server 5 (VidSrc Pro - Backup Source)',
        badge: 'Alternative Backup',
        supportsTv: true,
        getMovieUrl: (imdbId, startAt = 0, subUrl = '', subLabel = 'Malay') => {
            let url = `https://vidsrc.to/embed/movie/${imdbId}`;
            if (subUrl) url += `?sub_file=${encodeURIComponent(subUrl)}&sub_label=${encodeURIComponent(subLabel)}`;
            return url;
        },
        getTvUrl: (imdbId, season, episode, startAt = 0, subUrl = '', subLabel = 'Malay') => {
            let url = `https://vidsrc.to/embed/tv/${imdbId}/${season}/${episode}`;
            if (subUrl) url += `?sub_file=${encodeURIComponent(subUrl)}&sub_label=${encodeURIComponent(subLabel)}`;
            return url;
        }
    },
    {
        id: 'vidsrc-cc',
        name: 'Server 6 (VidSrc CC)',
        badge: 'Auto Subtitles',
        supportsTv: true,
        getMovieUrl: (imdbId, startAt = 0, subUrl = '', subLabel = 'Malay') => {
            let url = `https://vidsrc.cc/v2/embed/movie/${imdbId}?autoPlay=true`;
            if (subUrl) url += `&sub_file=${encodeURIComponent(subUrl)}&sub_label=${encodeURIComponent(subLabel)}`;
            return url;
        },
        getTvUrl: (imdbId, season, episode, startAt = 0, subUrl = '', subLabel = 'Malay') => {
            let url = `https://vidsrc.cc/v2/embed/tv/${imdbId}/${season}/${episode}?autoPlay=true`;
            if (subUrl) url += `&sub_file=${encodeURIComponent(subUrl)}&sub_label=${encodeURIComponent(subLabel)}`;
            return url;
        }
    },
    {
        id: 'embedsu',
        name: 'Server 7 (EmbedSU)',
        badge: 'Clean & Fast',
        supportsTv: true,
        getMovieUrl: (imdbId, startAt = 0, subUrl = '', subLabel = 'Malay') => {
            let url = `https://embed.su/embed/movie/${imdbId}`;
            if (subUrl) url += `?sub_file=${encodeURIComponent(subUrl)}&sub_label=${encodeURIComponent(subLabel)}`;
            return url;
        },
        getTvUrl: (imdbId, season, episode, startAt = 0, subUrl = '', subLabel = 'Malay') => {
            let url = `https://embed.su/embed/tv/${imdbId}/${season}/${episode}`;
            if (subUrl) url += `?sub_file=${encodeURIComponent(subUrl)}&sub_label=${encodeURIComponent(subLabel)}`;
            return url;
        }
    },
    {
        id: 'smashystream',
        name: 'Server 8 (SmashyStream)',
        badge: 'High Speed',
        supportsTv: true,
        getMovieUrl: (imdbId, startAt = 0, subUrl = '', subLabel = 'Malay') => {
            let url = `https://player.smashy.stream/movie/${imdbId}`;
            if (subUrl) url += `?sub_file=${encodeURIComponent(subUrl)}&sub_label=${encodeURIComponent(subLabel)}`;
            return url;
        },
        getTvUrl: (imdbId, season, episode, startAt = 0, subUrl = '', subLabel = 'Malay') => {
            let url = `https://player.smashy.stream/tv/${imdbId}?s=${season}&e=${episode}`;
            if (subUrl) url += `&sub_file=${encodeURIComponent(subUrl)}&sub_label=${encodeURIComponent(subLabel)}`;
            return url;
        }
    },
    {
        id: 'vidsrc-in',
        name: 'Server 9 (VidSrc In)',
        badge: 'Alternative',
        supportsTv: true,
        getMovieUrl: (imdbId, startAt = 0, subUrl = '', subLabel = 'Malay') => {
            let url = `https://vidsrc.in/embed/movie?imdb=${imdbId}`;
            if (subUrl) url += `&sub_file=${encodeURIComponent(subUrl)}&sub_label=${encodeURIComponent(subLabel)}`;
            return url;
        },
        getTvUrl: (imdbId, season, episode, startAt = 0, subUrl = '', subLabel = 'Malay') => {
            let url = `https://vidsrc.in/embed/tv?imdb=${imdbId}&season=${season}&episode=${episode}`;
            if (subUrl) url += `&sub_file=${encodeURIComponent(subUrl)}&sub_label=${encodeURIComponent(subLabel)}`;
            return url;
        }
    }
];

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { STREAM_SERVERS };
}
