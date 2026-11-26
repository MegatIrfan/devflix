/**
 * DevFlix Cinema TV Application Logic
 * Interactive Movie & TV Browser with Geist Font, Preview Modal & Recommendations First,
 * Live Video Background Hover Preview, Country & Genre Filtering, Sorting & Multi-Server Playback
 */

// Global Bulletproof Fallback Poster Generator
function getFallbackPoster(title, year) {
    const safeTitle = (title || 'Movie').replace(/[<>&"]/g, '');
    const safeYear = (year || '2024').replace(/[<>&"]/g, '');
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450">
        <defs>
            <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#222222"/>
                <stop offset="100%" stop-color="#0c0c0c"/>
            </linearGradient>
            <linearGradient id="redG" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#e50914"/>
                <stop offset="100%" stop-color="#990000"/>
            </linearGradient>
        </defs>
        <rect width="300" height="450" fill="url(#bg)"/>
        <rect x="20" y="20" width="38" height="38" rx="8" fill="url(#redG)"/>
        <text x="39" y="46" font-family="-apple-system, sans-serif" font-weight="900" font-size="22" fill="#ffffff" text-anchor="middle">D</text>
        <circle cx="150" cy="195" r="34" fill="rgba(255,255,255,0.08)"/>
        <polygon points="144,182 163,195 144,208" fill="#ffffff"/>
        <text x="150" y="295" font-family="-apple-system, sans-serif" font-weight="700" font-size="18" fill="#ffffff" text-anchor="middle">
            <tspan x="150" dy="0">${safeTitle.length > 20 ? safeTitle.substring(0, 18) + '...' : safeTitle}</tspan>
            <tspan x="150" dy="26" font-size="14" fill="#a3a3a3">${safeYear}</tspan>
        </text>
    </svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg.trim());
}

// Multi-Tiered Image Error Handler (Metahub CDN -> SVG Fallback)
window.handleImgError = function(img) {
    if (!img) return;
    const stage = parseInt(img.dataset.stage || '0', 10);
    const id = img.dataset.id;
    const title = decodeURIComponent(img.dataset.title || 'Movie');
    const year = img.dataset.year || '';

    if (stage === 0 && id && id.startsWith('tt') && !img.src.includes('images.metahub.space')) {
        img.dataset.stage = '1';
        img.src = `https://images.metahub.space/poster/medium/${id}/img`;
        return;
    }

    img.dataset.stage = '2';
    img.onerror = null;
    img.src = getFallbackPoster(title, year);
};

function getBestPosterUrl(item) {
    if (item.poster && item.poster.startsWith('http')) return item.poster;
    if (item.id && item.id.startsWith('tt')) return `https://images.metahub.space/poster/medium/${item.id}/img`;
    return getFallbackPoster(item.title, item.year);
}

// K-DRAMA & KOREAN CINEMA COLLECTION
const KOREAN_DRAMAS_COLLECTION = [
    { id: 'tt10919420', title: 'Squid Game', type: 'series', year: '2021', country: 'Korea', genres: 'Action, Drama, Mystery', matchScore: 99, match: '99% Match', duration: '2 Seasons', age: '18+', overview: 'Hundreds of cash-strapped players accept a strange invitation to compete in children\'s games with deadly high stakes.' },
    { id: 'tt14169960', title: 'All of Us Are Dead', type: 'series', year: '2022', country: 'Korea', genres: 'Action, Drama, Horror', matchScore: 98, match: '98% Match', duration: '1 Season', age: '18+', overview: 'A high school becomes ground zero for a zombie virus outbreak. Trapped students must fight their way out.' },
    { id: 'tt16345474', title: 'The Glory', type: 'series', year: '2022', country: 'Korea', genres: 'Drama, Mystery, Thriller', matchScore: 99, match: '99% Match', duration: '1 Season', age: '18+', overview: 'A woman lives for revenge against her childhood bullies who destroyed her life.' },
    { id: 'tt10850932', title: 'Crash Landing on You', type: 'series', year: '2019', country: 'Korea', genres: 'Comedy, Drama, Romance', matchScore: 98, match: '98% Match', duration: '1 Season', age: '16+', overview: 'A South Korean heiress accidentally paraglides into North Korea and into the life of an army officer.' },
    { id: 'tt13433802', title: 'Vincenzo', type: 'series', year: '2021', country: 'Korea', genres: 'Action, Comedy, Crime', matchScore: 97, match: '97% Match', duration: '1 Season', age: '16+', overview: 'During a visit to his motherland, a Korean-Italian mafia lawyer gives an unrivaled conglomerate a taste of its own medicine.' },
    { id: 'tt11612120', title: 'Sweet Home', type: 'series', year: '2020', country: 'Korea', genres: 'Action, Drama, Horror', matchScore: 96, match: '96% Match', duration: '3 Seasons', age: '18+', overview: 'As humans turn into savage monsters, one troubled teen and his apartment neighbors fight to survive.' },
    { id: 'tt7053188', title: 'Kingdom', type: 'series', year: '2019', country: 'Korea', genres: 'Action, Drama, Horror', matchScore: 98, match: '98% Match', duration: '2 Seasons', age: '18+', overview: 'While strange rumors about their ill King grip a kingdom, the crown prince must face a mysterious plague.' },
    { id: 'tt5994364', title: 'Goblin (Guardian)', type: 'series', year: '2016', country: 'Korea', genres: 'Drama, Fantasy, Romance', matchScore: 98, match: '98% Match', duration: '1 Season', age: '16+', overview: 'An immortal goblin seeks a human bride to end his cursed life, encountering a grim reaper.' },
    { id: 'tt4927092', title: 'Descendants of the Sun', type: 'series', year: '2016', country: 'Korea', genres: 'Action, Comedy, Drama', matchScore: 97, match: '97% Match', duration: '1 Season', age: '16+', overview: 'A love story between Captain Yoo Shi Jin of South Korean Special Forces and Doctor Kang Mo Yeon.' },
    { id: 'tt29583707', title: 'My Demon', type: 'series', year: '2023', country: 'Korea', genres: 'Comedy, Drama, Fantasy', matchScore: 96, match: '96% Match', duration: '1 Season', age: '16+', overview: 'A pitiless demon becomes powerless after getting entangled with an icy heiress.' },
    { id: 'tt21609352', title: 'Moving', type: 'series', year: '2023', country: 'Korea', genres: 'Action, Adventure, Fantasy', matchScore: 99, match: '99% Match', duration: '1 Season', age: '18+', overview: 'Children with secret superhuman powers and their parents with painful pasts face enormous looming perils.' },
    { id: 'tt11239560', title: 'Itaewon Class', type: 'series', year: '2020', country: 'Korea', genres: 'Drama, Romance', matchScore: 97, match: '97% Match', duration: '1 Season', age: '16+', overview: 'An ex-con and his friends fight to make their ambitious dreams for their street bar a reality.' },
    { id: 'tt27587845', title: 'Queen of Tears', type: 'series', year: '2024', country: 'Korea', genres: 'Comedy, Drama, Romance', matchScore: 98, match: '98% Match', duration: '1 Season', age: '16+', overview: 'The queen of department stores and the prince of supermarkets weather a marital crisis until love miraculously begins to bloom again.' },
    { id: 'tt5342392', title: 'Signal', type: 'series', year: '2016', country: 'Korea', genres: 'Crime, Drama, Mystery', matchScore: 98, match: '98% Match', duration: '1 Season', age: '16+', overview: 'Detectives from the present and a detective from the past communicate via walkie-talkie to solve unsolved crimes.' },
    { id: 'tt10220588', title: 'Hotel Del Luna', type: 'series', year: '2019', country: 'Korea', genres: 'Action, Comedy, Drama', matchScore: 97, match: '97% Match', duration: '1 Season', age: '16+', overview: 'A supernatural hotel caters only to ghosts before they move on to the afterlife.' },
    { id: 'tt13309062', title: 'True Beauty', type: 'series', year: '2020', country: 'Korea', genres: 'Comedy, Drama, Romance', matchScore: 96, match: '96% Match', duration: '1 Season', age: '13+', overview: 'A high school girl masters the art of makeup to hide her bare face and conquer insecurity.' },
    { id: 'tt20869502', title: 'Extraordinary Attorney Woo', type: 'series', year: '2022', country: 'Korea', genres: 'Drama, Law', matchScore: 98, match: '98% Match', duration: '1 Season', age: '16+', overview: 'A brilliant young attorney with Asperger\'s syndrome tackles challenges in the courtroom and beyond.' },
    { id: 'tt17013898', title: 'Twenty-Five Twenty-One', type: 'series', year: '2022', country: 'Korea', genres: 'Drama, Romance', matchScore: 97, match: '97% Match', duration: '1 Season', age: '16+', overview: 'In a time when dreams seem out of reach, a teen fencer pursues big ambitions and meets a hardworking young man.' },
    { id: 'tt18274648', title: 'Business Proposal', type: 'series', year: '2022', country: 'Korea', genres: 'Comedy, Romance', matchScore: 97, match: '97% Match', duration: '1 Season', age: '16+', overview: 'An employee goes on a blind date in her friend\'s place to scare the guy away, only to find he is her CEO.' },
    { id: 'tt6751668', title: 'Parasite', type: 'movie', year: '2019', country: 'Korea', genres: 'Drama, Thriller, Comedy', matchScore: 99, match: '99% Match', duration: '2h 12m', age: '16+', overview: 'Greed and class discrimination threaten the newly formed relationship between the wealthy Park family and the destitute Kim clan.' },
    { id: 'tt5700672', title: 'Train to Busan', type: 'movie', year: '2016', country: 'Korea', genres: 'Action, Horror, Thriller', matchScore: 98, match: '98% Match', duration: '1h 58m', age: '18+', overview: 'While a zombie virus breaks out in South Korea, passengers struggle to survive on the train from Seoul to Busan.' },
    { id: 'tt27829144', title: 'Exhuma', type: 'movie', year: '2024', country: 'Korea', genres: 'Horror, Mystery, Thriller', matchScore: 97, match: '97% Match', duration: '2h 14m', age: '18+', overview: 'The process of excavating an ominous grave unleashes dreadful consequences buried underneath.' }
];

// LATEST 2025 - 2026 BLOCKBUSTER RELEASES
const LATEST_2026_MOVIES = [
    {
        id: 'tt21361444',
        title: 'Avengers: Secret Wars',
        type: 'movie',
        year: '2026',
        country: 'USA',
        matchScore: 99,
        match: '99% Match',
        duration: '2h 55m',
        age: '16+',
        genres: 'Action, Adventure, Sci-Fi',
        trailerKey: 'Way9Dexny3w',
        poster: 'https://images.metahub.space/poster/medium/tt21361444/img',
        background: 'https://images.metahub.space/background/medium/tt21361444/img',
        overview: 'Earth\'s mightiest heroes join forces across multiple realities in the climactic showdown across the Marvel Multiverse.'
    },
    {
        id: 'tt9218128',
        title: 'Gladiator II',
        type: 'movie',
        year: '2024',
        country: 'USA',
        matchScore: 98,
        match: '98% Match',
        duration: '2h 28m',
        age: '18+',
        genres: 'Action, Adventure, Drama',
        trailerKey: '4rgYUipGJNo',
        poster: 'https://images.metahub.space/poster/medium/tt9218128/img',
        background: 'https://images.metahub.space/background/medium/tt9218128/img',
        overview: 'Years after witnessing the death of Maximus, Lucius must enter the Colosseum after his home is conquered by tyrannical Roman emperors.'
    },
    {
        id: 'tt1757678',
        title: 'Avatar: Fire and Ash',
        type: 'movie',
        year: '2025',
        country: 'USA',
        matchScore: 99,
        match: '99% Match',
        duration: '3h 10m',
        age: '13+',
        genres: 'Action, Adventure, Fantasy',
        trailerKey: 'd9MyW72ELq0',
        poster: 'https://images.metahub.space/poster/medium/tt1757678/img',
        background: 'https://images.metahub.space/background/medium/tt1757678/img',
        overview: 'Jake Sully and Neytiri encounter an aggressive, volcanic clan of Na\'vi known as the Ash People on Pandora.'
    },
    {
        id: 'tt22084616',
        title: 'Spider-Man 4',
        type: 'movie',
        year: '2026',
        country: 'USA',
        matchScore: 98,
        match: '98% Match',
        duration: '2h 20m',
        age: '13+',
        genres: 'Action, Adventure, Sci-Fi',
        trailerKey: '73_1biulkYk',
        poster: 'https://images.metahub.space/poster/medium/tt22084616/img',
        background: 'https://images.metahub.space/background/medium/tt22084616/img',
        overview: 'Peter Parker navigates a new era of street-level threats in New York City with unexpected allies.'
    },
    {
        id: 'tt19850008',
        title: 'The Batman Part II',
        type: 'movie',
        year: '2026',
        country: 'USA',
        matchScore: 99,
        match: '99% Match',
        duration: '2h 50m',
        age: '18+',
        genres: 'Action, Crime, Drama',
        trailerKey: 'mqqft2x_Aa4',
        poster: 'https://images.metahub.space/poster/medium/tt19850008/img',
        background: 'https://images.metahub.space/background/medium/tt19850008/img',
        overview: 'Bruce Wayne delves deeper into Gotham\'s corrupted underworld as new criminal masterminds emerge from the shadows.'
    },
    {
        id: 'tt9603208',
        title: 'Mission: Impossible - The Final Reckoning',
        type: 'movie',
        year: '2025',
        country: 'USA',
        matchScore: 98,
        match: '98% Match',
        duration: '2h 45m',
        age: '16+',
        genres: 'Action, Adventure, Thriller',
        trailerKey: 'YoHD9XEInc0',
        poster: 'https://images.metahub.space/poster/medium/tt9603208/img',
        background: 'https://images.metahub.space/background/medium/tt9603208/img',
        overview: 'Ethan Hunt and his IMF team embark on their ultimate mission to stop the omnipotent Entity once and for all.'
    },
    {
        id: 'tt13186482',
        title: 'Mufasa: The Lion King',
        type: 'movie',
        year: '2024',
        country: 'USA',
        matchScore: 97,
        match: '97% Match',
        duration: '1h 58m',
        age: 'PG',
        genres: 'Adventure, Animation, Drama',
        trailerKey: 'YoHD9XEInc0',
        poster: 'https://images.metahub.space/poster/medium/tt13186482/img',
        background: 'https://images.metahub.space/background/medium/tt13186482/img',
        overview: 'Rafiki recounts the legendary rise of Mufasa, an orphaned cub who became the beloved king of the Pride Lands.'
    },
    {
        id: 'tt14513804',
        title: 'Captain America: Brave New World',
        type: 'movie',
        year: '2025',
        country: 'USA',
        matchScore: 97,
        match: '97% Match',
        duration: '2h 15m',
        age: '13+',
        genres: 'Action, Adventure, Sci-Fi',
        trailerKey: 'YoHD9XEInc0',
        poster: 'https://images.metahub.space/poster/medium/tt14513804/img',
        background: 'https://images.metahub.space/background/medium/tt14513804/img',
        overview: 'Sam Wilson finds himself in the middle of an international incident following a meeting with the newly elected U.S. President.'
    }
];

// 1. TOP 10 RANKED MOVIES TODAY (Numbered 1 - 10)
const NETFLIX_TOP_10 = [
    {
        id: 'tt6263850',
        title: 'Deadpool & Wolverine',
        type: 'movie',
        year: '2024',
        country: 'USA',
        matchScore: 99,
        match: '99% Match',
        duration: '2h 08m',
        age: '18+',
        genres: 'Action, Comedy, Sci-Fi',
        trailerKey: '73_1biulkYk',
        poster: 'https://images.metahub.space/poster/medium/tt6263850/img',
        background: 'https://images.metahub.space/background/medium/tt6263850/img',
        overview: 'Wolverine is recovering from his injuries when he crosses paths with the loudmouth Deadpool. They team up to defeat a common enemy.'
    },
    {
        id: 'tt15239678',
        title: 'Dune: Part Two',
        type: 'movie',
        year: '2024',
        country: 'USA',
        matchScore: 99,
        match: '99% Match',
        duration: '2h 46m',
        age: '16+',
        genres: 'Action, Adventure, Sci-Fi',
        trailerKey: 'Way9Dexny3w',
        poster: 'https://images.metahub.space/poster/medium/tt15239678/img',
        background: 'https://images.metahub.space/background/medium/tt15239678/img',
        overview: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.'
    },
    {
        id: 'tt15398776',
        title: 'Oppenheimer',
        type: 'movie',
        year: '2023',
        country: 'USA',
        matchScore: 98,
        match: '98% Match',
        duration: '3h 00m',
        age: '18+',
        genres: 'Biography, Drama, History',
        trailerKey: 'uYPbbksJxIg',
        poster: 'https://images.metahub.space/poster/medium/tt15398776/img',
        background: 'https://images.metahub.space/background/medium/tt15398776/img',
        overview: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.'
    },
    {
        id: 'tt1375666',
        title: 'Inception',
        type: 'movie',
        year: '2010',
        country: 'USA',
        matchScore: 99,
        match: '99% Match',
        duration: '2h 28m',
        age: '16+',
        genres: 'Action, Sci-Fi, Thriller',
        trailerKey: 'YoHD9XEInc0',
        poster: 'https://images.metahub.space/poster/medium/tt1375666/img',
        background: 'https://images.metahub.space/background/medium/tt1375666/img',
        overview: 'A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.'
    },
    {
        id: 'tt0816692',
        title: 'Interstellar',
        type: 'movie',
        year: '2014',
        country: 'USA',
        matchScore: 97,
        match: '97% Match',
        duration: '2h 49m',
        age: '13+',
        genres: 'Adventure, Drama, Sci-Fi',
        trailerKey: 'zSWdZVtXT7E',
        poster: 'https://images.metahub.space/poster/medium/tt0816692/img',
        background: 'https://images.metahub.space/background/medium/tt0816692/img',
        overview: 'A team of explorers travels through a wormhole in space in an attempt to ensure humanity\'s survival.'
    },
    {
        id: 'tt0468569',
        title: 'The Dark Knight',
        type: 'movie',
        year: '2008',
        country: 'USA',
        matchScore: 99,
        match: '99% Match',
        duration: '2h 32m',
        age: '16+',
        genres: 'Action, Crime, Drama',
        trailerKey: 'EXeTwQWrcwY',
        poster: 'https://images.metahub.space/poster/medium/tt0468569/img',
        background: 'https://images.metahub.space/background/medium/tt0468569/img',
        overview: 'When the menace known as the Joker wreaks havoc and chaos on Gotham, Batman must accept one of the greatest tests of his ability.'
    },
    {
        id: 'tt14577672',
        title: 'Godzilla x Kong: The New Empire',
        type: 'movie',
        year: '2024',
        country: 'USA',
        matchScore: 94,
        match: '94% Match',
        duration: '1h 55m',
        age: '13+',
        genres: 'Action, Sci-Fi',
        trailerKey: 'lV1OOlGwExM',
        poster: 'https://images.metahub.space/poster/medium/tt14577672/img',
        background: 'https://images.metahub.space/background/medium/tt14577672/img',
        overview: 'Two ancient titans, Godzilla and Kong, clash in an epic battle as humans unravel their origins and connection to Skull Island.'
    },
    {
        id: 'tt22022452',
        title: 'Inside Out 2',
        type: 'movie',
        year: '2024',
        country: 'USA',
        matchScore: 96,
        match: '96% Match',
        duration: '1h 36m',
        age: 'PG',
        genres: 'Animation, Adventure, Comedy',
        trailerKey: 'LEjhY15eCx0',
        poster: 'https://images.metahub.space/poster/medium/tt22022452/img',
        background: 'https://images.metahub.space/background/medium/tt22022452/img',
        overview: 'Teenager Riley\'s mind undergoes sudden demolition to make room for brand-new Emotions: Anxiety, Envy, Ennui, and Embarrassment.'
    },
    {
        id: 'tt0133093',
        title: 'The Matrix',
        type: 'movie',
        year: '1999',
        country: 'USA',
        matchScore: 96,
        match: '96% Match',
        duration: '2h 16m',
        age: '16+',
        genres: 'Action, Sci-Fi',
        trailerKey: 'vKQi3bBA1y8',
        poster: 'https://images.metahub.space/poster/medium/tt0133093/img',
        background: 'https://images.metahub.space/background/medium/tt0133093/img',
        overview: 'A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.'
    },
    {
        id: 'tt0111161',
        title: 'The Shawshank Redemption',
        type: 'movie',
        year: '1994',
        country: 'USA',
        matchScore: 99,
        match: '99% Match',
        duration: '2h 22m',
        age: '16+',
        genres: 'Drama, Crime',
        trailerKey: 'PLl99DlL6b4',
        poster: 'https://images.metahub.space/poster/medium/tt0111161/img',
        background: 'https://images.metahub.space/background/medium/tt0111161/img',
        overview: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.'
    }
];

// 2. TRENDING MOVIES
const TRENDING_MOVIES = [
    {
        id: 'tt18411490',
        title: 'Alien: Romulus',
        type: 'movie',
        year: '2024',
        country: 'USA',
        matchScore: 95,
        match: '95% Match',
        duration: '1h 59m',
        age: '18+',
        genres: 'Horror, Sci-Fi, Thriller',
        trailerKey: 'x0XDEhP4MQs',
        poster: 'https://images.metahub.space/poster/medium/tt18411490/img',
        background: 'https://images.metahub.space/background/medium/tt18411490/img',
        overview: 'While scavenging the deep ends of a derelict space station, a group of young colonizers come face-to-face with the most terrifying life form.'
    },
    {
        id: 'tt1160419',
        title: 'Dune: Part One',
        type: 'movie',
        year: '2021',
        country: 'USA',
        matchScore: 96,
        match: '96% Match',
        duration: '2h 35m',
        age: '13+',
        genres: 'Sci-Fi, Adventure',
        trailerKey: 'n9xhJrPXop4',
        poster: 'https://images.metahub.space/poster/medium/tt1160419/img',
        background: 'https://images.metahub.space/background/medium/tt1160419/img',
        overview: 'Paul Atreides travels to the most dangerous planet in the universe to ensure the future of his family and people.'
    },
    {
        id: 'tt1630029',
        title: 'Avatar: The Way of Water',
        type: 'movie',
        year: '2022',
        country: 'USA',
        matchScore: 95,
        match: '95% Match',
        duration: '3h 12m',
        age: '13+',
        genres: 'Action, Sci-Fi, Adventure',
        trailerKey: 'd9MyW72ELq0',
        poster: 'https://images.metahub.space/poster/medium/tt1630029/img',
        background: 'https://images.metahub.space/background/medium/tt1630029/img',
        overview: 'Jake Sully lives with his newfound family on Pandora. Once a familiar threat returns, Jake must work with Neytiri.'
    },
    {
        id: 'tt1877830',
        title: 'The Batman',
        type: 'movie',
        year: '2022',
        country: 'USA',
        matchScore: 94,
        match: '94% Match',
        duration: '2h 56m',
        age: '16+',
        genres: 'Action, Crime, Drama',
        trailerKey: 'mqqft2x_Aa4',
        poster: 'https://images.metahub.space/poster/medium/tt1877830/img',
        background: 'https://images.metahub.space/background/medium/tt1877830/img',
        overview: 'When a sadistic serial killer begins murdering key political figures in Gotham, Batman is forced to investigate.'
    },
    {
        id: 'tt10872600',
        title: 'Spider-Man: No Way Home',
        type: 'movie',
        year: '2021',
        country: 'USA',
        matchScore: 98,
        match: '98% Match',
        duration: '2h 28m',
        age: '13+',
        genres: 'Action, Adventure, Sci-Fi',
        trailerKey: 'JfVOs4VSpmA',
        poster: 'https://images.metahub.space/poster/medium/tt10872600/img',
        background: 'https://images.metahub.space/background/medium/tt10872600/img',
        overview: 'With Spider-Man\'s identity now revealed, Peter asks Doctor Strange for help. Dangerous foes from other worlds appear.'
    },
    {
        id: 'tt1745960',
        title: 'Top Gun: Maverick',
        type: 'movie',
        year: '2022',
        country: 'USA',
        matchScore: 97,
        match: '97% Match',
        duration: '2h 10m',
        age: '13+',
        genres: 'Action, Drama',
        trailerKey: 'giXco2jaZ_4',
        poster: 'https://images.metahub.space/poster/medium/tt1745960/img',
        background: 'https://images.metahub.space/background/medium/tt1745960/img',
        overview: 'After thirty years, Maverick is still pushing the envelope as a top naval aviator, but must confront ghosts of his past.'
    },
    {
        id: 'tt9362722',
        title: 'Spider-Man: Across the Spider-Verse',
        type: 'movie',
        year: '2023',
        country: 'USA',
        matchScore: 99,
        match: '99% Match',
        duration: '2h 20m',
        age: 'PG',
        genres: 'Animation, Action, Adventure',
        trailerKey: 'cqGjhVJWtEg',
        poster: 'https://images.metahub.space/poster/medium/tt9362722/img',
        background: 'https://images.metahub.space/background/medium/tt9362722/img',
        overview: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its existence.'
    },
    {
        id: 'tt12584954',
        title: 'Twisters',
        type: 'movie',
        year: '2024',
        country: 'USA',
        matchScore: 93,
        match: '93% Match',
        duration: '2h 02m',
        age: '13+',
        genres: 'Action, Adventure, Thriller',
        trailerKey: 'Jb8p2D1h914',
        poster: 'https://images.metahub.space/poster/medium/tt12584954/img',
        background: 'https://images.metahub.space/background/medium/tt12584954/img',
        overview: 'An update to the 1996 film centered on a pair of storm chasers who risk their lives to test an experimental weather alert system.'
    }
];

// 3. BINGE-WORTHY TV SHOWS (KOREA, USA, UK)
const POPULAR_TV_SERIES = [
    {
        id: 'tt10919420',
        title: 'Squid Game',
        type: 'series',
        year: '2021–',
        country: 'Korea',
        matchScore: 99,
        match: '99% Match',
        duration: '2 Seasons',
        age: '18+',
        genres: 'Action, Drama, Mystery, Thriller',
        trailerKey: 'oqxAJKy0ii4',
        poster: 'https://images.metahub.space/poster/medium/tt10919420/img',
        background: 'https://images.metahub.space/background/medium/tt10919420/img',
        overview: 'Hundreds of cash-strapped players accept a strange invitation to compete in children\'s games for a tempting prize with deadly stakes.'
    },
    {
        id: 'tt4574334',
        title: 'Stranger Things',
        type: 'series',
        year: '2016–',
        country: 'USA',
        matchScore: 99,
        match: '99% Match',
        duration: '4 Seasons',
        age: '16+',
        genres: 'Drama, Fantasy, Horror, Sci-Fi',
        trailerKey: 'b9EkMc79ZSU',
        poster: 'https://images.metahub.space/poster/medium/tt4574334/img',
        background: 'https://images.metahub.space/background/medium/tt4574334/img',
        overview: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange girl.'
    },
    {
        id: 'tt0903747',
        title: 'Breaking Bad',
        type: 'series',
        year: '2008–2013',
        country: 'USA',
        matchScore: 99,
        match: '99% Match',
        duration: '5 Seasons',
        age: '18+',
        genres: 'Crime, Drama, Thriller',
        trailerKey: 'HhesaQXLuRY',
        poster: 'https://images.metahub.space/poster/medium/tt0903747/img',
        background: 'https://images.metahub.space/background/medium/tt0903747/img',
        overview: 'A chemistry teacher diagnosed with lung cancer turns to manufacturing and selling methamphetamine with a former student.'
    },
    {
        id: 'tt0944947',
        title: 'Game of Thrones',
        type: 'series',
        year: '2011–2019',
        country: 'USA',
        matchScore: 98,
        match: '98% Match',
        duration: '8 Seasons',
        age: '18+',
        genres: 'Action, Adventure, Drama',
        trailerKey: 'KPLWWIOCOOQ',
        poster: 'https://images.metahub.space/poster/medium/tt0944947/img',
        background: 'https://images.metahub.space/background/medium/tt0944947/img',
        overview: 'Nine noble families fight for control over the mythical lands of Westeros, while an ancient enemy returns after millennia.'
    },
    {
        id: 'tt1190634',
        title: 'The Boys',
        type: 'series',
        year: '2019–',
        country: 'USA',
        matchScore: 97,
        match: '97% Match',
        duration: '4 Seasons',
        age: '18+',
        genres: 'Action, Comedy, Sci-Fi',
        trailerKey: '06rueu_fh30',
        poster: 'https://images.metahub.space/poster/medium/tt1190634/img',
        background: 'https://images.metahub.space/background/medium/tt1190634/img',
        overview: 'A fun and irreverent take on what happens when superheroes abuse their superpowers rather than use them for good.'
    },
    {
        id: 'tt3581920',
        title: 'The Last of Us',
        type: 'series',
        year: '2023–',
        country: 'USA',
        matchScore: 98,
        match: '98% Match',
        duration: '1 Season',
        age: '18+',
        genres: 'Action, Adventure, Drama, Horror',
        trailerKey: 'uLtkt8BonwM',
        poster: 'https://images.metahub.space/poster/medium/tt3581920/img',
        background: 'https://images.metahub.space/background/medium/tt3581920/img',
        overview: 'After a global pandemic destroys civilization, a hardened survivor takes charge of a 14-year-old girl who may be humanity\'s last hope.'
    },
    {
        id: 'tt2442560',
        title: 'Peaky Blinders',
        type: 'series',
        year: '2013–2022',
        country: 'UK',
        matchScore: 98,
        match: '98% Match',
        duration: '6 Seasons',
        age: '18+',
        genres: 'Crime, Drama',
        trailerKey: 'oVzVdvGIC7U',
        poster: 'https://images.metahub.space/poster/medium/tt2442560/img',
        background: 'https://images.metahub.space/background/medium/tt2442560/img',
        overview: 'A gangster family epic set in 1900s England, centering on a gang who sew razor blades in the peaks of their caps, and their fierce boss Tommy Shelby.'
    }
];

// 4. BLOCKBUSTER ACTION & ADVENTURE
const ACTION_MOVIES = [
    {
        id: 'tt4154796',
        title: 'Avengers: Endgame',
        type: 'movie',
        year: '2019',
        country: 'USA',
        matchScore: 99,
        match: '99% Match',
        duration: '3h 01m',
        age: '13+',
        genres: 'Action, Adventure, Sci-Fi',
        trailerKey: 'TcMBFSGVi1c',
        poster: 'https://images.metahub.space/poster/medium/tt4154796/img',
        background: 'https://images.metahub.space/background/medium/tt4154796/img',
        overview: 'After devastating events, the universe is in ruins. With the help of allies, the Avengers assemble once more to reverse Thanos\' actions.'
    },
    {
        id: 'tt4154756',
        title: 'Avengers: Infinity War',
        type: 'movie',
        year: '2018',
        country: 'USA',
        matchScore: 99,
        match: '99% Match',
        duration: '2h 29m',
        age: '13+',
        genres: 'Action, Adventure, Sci-Fi',
        trailerKey: '6ZfuNTqbHE8',
        poster: 'https://images.metahub.space/poster/medium/tt4154756/img',
        background: 'https://images.metahub.space/background/medium/tt4154756/img',
        overview: 'The Avengers and their allies must be willing to sacrifice all in an attempt to defeat the powerful Thanos before his blitz of ruin.'
    },
    {
        id: 'tt0120737',
        title: 'The Lord of the Rings: The Fellowship of the Ring',
        type: 'movie',
        year: '2001',
        country: 'UK',
        matchScore: 99,
        match: '99% Match',
        duration: '2h 58m',
        age: '13+',
        genres: 'Action, Adventure, Fantasy',
        trailerKey: 'V75dMMIW2B4',
        poster: 'https://images.metahub.space/poster/medium/tt0120737/img',
        background: 'https://images.metahub.space/background/medium/tt0120737/img',
        overview: 'A meek Hobbit from the Shire and eight companions set out on a journey to destroy the One Ring and save Middle-earth.'
    },
    {
        id: 'tt2934292',
        title: 'John Wick: Chapter 4',
        type: 'movie',
        year: '2023',
        country: 'USA',
        matchScore: 95,
        match: '95% Match',
        duration: '2h 49m',
        age: '18+',
        genres: 'Action, Crime, Thriller',
        trailerKey: 'qEVUtrk8_B4',
        poster: 'https://images.metahub.space/poster/medium/tt2934292/img',
        background: 'https://images.metahub.space/background/medium/tt2934292/img',
        overview: 'John Wick uncovers a path to defeating The High Table, facing off against a powerful new enemy.'
    },
    {
        id: 'tt1392190',
        title: 'Mad Max: Fury Road',
        type: 'movie',
        year: '2015',
        country: 'USA',
        matchScore: 97,
        match: '97% Match',
        duration: '2h 00m',
        age: '16+',
        genres: 'Action, Adventure, Sci-Fi',
        trailerKey: 'hEJnMQG9ev8',
        poster: 'https://images.metahub.space/poster/medium/tt1392190/img',
        background: 'https://images.metahub.space/background/medium/tt1392190/img',
        overview: 'In a post-apocalyptic wasteland, a woman rebels against a tyrannical ruler with the aid of a group of female prisoners.'
    },
    {
        id: 'tt0172495',
        title: 'Gladiator',
        type: 'movie',
        year: '2000',
        country: 'USA',
        matchScore: 95,
        match: '95% Match',
        duration: '2h 35m',
        age: '16+',
        genres: 'Action, Adventure, Drama',
        trailerKey: 'owK1qxDselE',
        poster: 'https://images.metahub.space/poster/medium/tt0172495/img',
        background: 'https://images.metahub.space/background/medium/tt0172495/img',
        overview: 'A former Roman General sets out to exact vengeance against the corrupt emperor who murdered his family and sent him into slavery.'
    }
];

// 5. MIND-BENDING SCI-FI
const SCIFI_MOVIES = [
    {
        id: 'tt6723592',
        title: 'Tenet',
        type: 'movie',
        year: '2020',
        country: 'USA',
        matchScore: 94,
        match: '94% Match',
        duration: '2h 30m',
        age: '13+',
        genres: 'Action, Sci-Fi, Thriller',
        trailerKey: 'LdOM0x0WVSc',
        poster: 'https://images.metahub.space/poster/medium/tt6723592/img',
        background: 'https://images.metahub.space/background/medium/tt6723592/img',
        overview: 'Armed with only one word, Tenet, and fighting for the survival of the entire world, a Protagonist journeys through a twilight world of international espionage.'
    },
    {
        id: 'tt2543164',
        title: 'Arrival',
        type: 'movie',
        year: '2016',
        country: 'USA',
        matchScore: 96,
        match: '96% Match',
        duration: '1h 56m',
        age: '13+',
        genres: 'Drama, Mystery, Sci-Fi',
        trailerKey: 'tFMo3UJ4B4g',
        poster: 'https://images.metahub.space/poster/medium/tt2543164/img',
        background: 'https://images.metahub.space/background/medium/tt2543164/img',
        overview: 'A linguist works with the military to communicate with alien lifeforms after twelve mysterious spacecraft appear.'
    },
    {
        id: 'tt1856101',
        title: 'Blade Runner 2049',
        type: 'movie',
        year: '2017',
        country: 'USA',
        matchScore: 95,
        match: '95% Match',
        duration: '2h 44m',
        age: '16+',
        genres: 'Action, Drama, Mystery, Sci-Fi',
        trailerKey: 'gCcx85zbxz4',
        poster: 'https://images.metahub.space/poster/medium/tt1856101/img',
        background: 'https://images.metahub.space/background/medium/tt1856101/img',
        overview: 'Young Blade Runner K discovers a secret that leads him to track down former Blade Runner Rick Deckard.'
    },
    {
        id: 'tt0482571',
        title: 'The Prestige',
        type: 'movie',
        year: '2006',
        country: 'UK',
        matchScore: 97,
        match: '97% Match',
        duration: '2h 10m',
        age: '13+',
        genres: 'Drama, Mystery, Sci-Fi',
        trailerKey: 'o4gHCmTQDVI',
        poster: 'https://images.metahub.space/poster/medium/tt0482571/img',
        background: 'https://images.metahub.space/background/medium/tt0482571/img',
        overview: 'Two stage magicians engage in a bitter rivalry to create the ultimate illusion while sacrificing everything.'
    }
];

// 6. HORROR & SUSPENSE
const HORROR_MOVIES = [
    {
        id: 'tt5052448',
        title: 'Get Out',
        type: 'movie',
        year: '2017',
        country: 'USA',
        matchScore: 96,
        match: '96% Match',
        duration: '1h 44m',
        age: '18+',
        genres: 'Horror, Mystery, Thriller',
        trailerKey: 'DzfpyUB60YY',
        poster: 'https://images.metahub.space/poster/medium/tt5052448/img',
        background: 'https://images.metahub.space/background/medium/tt5052448/img',
        overview: 'A young African-American visits his white girlfriend\'s parents for the weekend, discovering disturbing secrets.'
    },
    {
        id: 'tt7784604',
        title: 'Hereditary',
        type: 'movie',
        year: '2018',
        country: 'USA',
        matchScore: 93,
        match: '93% Match',
        duration: '2h 07m',
        age: '18+',
        genres: 'Drama, Horror, Mystery',
        trailerKey: 'V6wWKNij_1M',
        poster: 'https://images.metahub.space/poster/medium/tt7784604/img',
        background: 'https://images.metahub.space/background/medium/tt7784604/img',
        overview: 'A grieving family is haunted by tragic and disturbing occurrences after the death of their secretive grandmother.'
    },
    {
        id: 'tt6644200',
        title: 'A Quiet Place',
        type: 'movie',
        year: '2018',
        country: 'USA',
        matchScore: 95,
        match: '95% Match',
        duration: '1h 30m',
        age: '16+',
        genres: 'Drama, Horror, Sci-Fi',
        trailerKey: 'WR7cc5t7tv8',
        poster: 'https://images.metahub.space/poster/medium/tt6644200/img',
        background: 'https://images.metahub.space/background/medium/tt6644200/img',
        overview: 'A family must navigate their lives in silence to avoid mysterious creatures that hunt by sound.'
    }
];

// 7. CRITICALLY ACCLAIMED DRAMAS & ASIAN HITS
const DRAMA_MOVIES = [
    {
        id: 'tt6751668',
        title: 'Parasite',
        type: 'movie',
        year: '2019',
        country: 'Korea',
        matchScore: 99,
        match: '99% Match',
        duration: '2h 12m',
        age: '16+',
        genres: 'Drama, Thriller, Comedy',
        trailerKey: '5xH0RZE3y4E',
        poster: 'https://images.metahub.space/poster/medium/tt6751668/img',
        background: 'https://images.metahub.space/background/medium/tt6751668/img',
        overview: 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.'
    },
    {
        id: 'tt0245429',
        title: 'Spirited Away',
        type: 'movie',
        year: '2001',
        country: 'Japan',
        matchScore: 98,
        match: '98% Match',
        duration: '2h 05m',
        age: 'PG',
        genres: 'Animation, Adventure, Fantasy',
        trailerKey: 'ByXuk9QqQkk',
        poster: 'https://images.metahub.space/poster/medium/tt0245429/img',
        background: 'https://images.metahub.space/background/medium/tt0245429/img',
        overview: 'During her family\'s move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits.'
    },
    {
        id: 'tt0110912',
        title: 'Pulp Fiction',
        type: 'movie',
        year: '1994',
        country: 'USA',
        matchScore: 98,
        match: '98% Match',
        duration: '2h 34m',
        age: '18+',
        genres: 'Crime, Drama',
        trailerKey: 's7EdQ4FqbhY',
        poster: 'https://images.metahub.space/poster/medium/tt0110912/img',
        background: 'https://images.metahub.space/background/medium/tt0110912/img',
        overview: 'The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in tales of violence and redemption.'
    },
    {
        id: 'tt0068646',
        title: 'The Godfather',
        type: 'movie',
        year: '1972',
        country: 'USA',
        matchScore: 99,
        match: '99% Match',
        duration: '2h 55m',
        age: '18+',
        genres: 'Crime, Drama',
        trailerKey: 'sY1S34973zA',
        poster: 'https://images.metahub.space/poster/medium/tt0068646/img',
        background: 'https://images.metahub.space/background/medium/tt0068646/img',
        overview: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.'
    },
    {
        id: 'tt0109830',
        title: 'Forrest Gump',
        type: 'movie',
        year: '1994',
        country: 'USA',
        matchScore: 98,
        match: '98% Match',
        duration: '2h 22m',
        age: '13+',
        genres: 'Drama, Romance, Comedy',
        trailerKey: 'bLvqoHBptjg',
        poster: 'https://images.metahub.space/poster/medium/tt0109830/img',
        background: 'https://images.metahub.space/background/medium/tt0109830/img',
        overview: 'The history of the United States unfolds through the perspective of an Alabama man with an IQ of 75.'
    }
];

// Helper Functions for Live Cinemeta API Data Formatting
function formatRuntime(runtime) {
    if (!runtime) return '2h 10m';
    if (typeof runtime === 'string' && (runtime.includes('h') || runtime.includes('m'))) return runtime;
    const mins = parseInt(runtime, 10);
    if (isNaN(mins)) return '2h 10m';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function formatCinemetaItem(m, fallbackType = 'movie') {
    const type = m.type || fallbackType;
    const yearStr = String(m.releaseInfo || m.year || '2024').substring(0, 4);
    const score = Math.floor(92 + (parseInt((m.id || '').replace(/\D/g, '').slice(-2) || '50', 10) % 7));
    const genresStr = Array.isArray(m.genres) ? m.genres.join(', ') : (m.genres || 'Action, Drama');
    const runtimeStr = m.runtime ? (type === 'series' ? `${m.runtime}` : formatRuntime(m.runtime)) : (type === 'series' ? 'TV Series' : '2h 10m');
    const posterUrl = m.poster || `https://images.metahub.space/poster/medium/${m.id}/img`;
    const bgUrl = m.background || `https://images.metahub.space/background/medium/${m.id}/img`;

    return {
        id: m.id,
        title: m.name,
        type: type,
        year: yearStr,
        country: m.country || (genresStr.includes('Animation') ? 'Japan' : (genresStr.includes('Drama') && (m.name || '').match(/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uac00-\ud7af]/) ? 'Korea' : 'USA')),
        matchScore: score,
        match: `${score}% Match`,
        duration: runtimeStr,
        age: type === 'series' ? '18+' : '16+',
        genres: genresStr,
        trailerKey: 'Way9Dexny3w',
        poster: posterUrl,
        background: bgUrl,
        overview: m.description || 'Watch now with ultra-fast multi-server streaming.'
    };
}

class NetflixApp {
    constructor() {
        this.selectedMedia = null;
        this.currentHero = null;
        this.watchlistKey = 'devflix_user_watchlist';
        this.cacheKey = 'devflix_api_catalog_cache_v4';
        this.currentGenre = 'all';
        this.currentCountry = 'all';
        this.currentSort = 'featured';
        this.currentYear = 'all';
        this.displayedCount = 24;

        this.videoTimer = null;
        this.isMuted = true;

        // Categorized arrays loaded directly from API
        this.latestMovies = [];
        this.top10Movies = [];
        this.trendingMovies = [];
        this.popularSeries = [];
        this.actionMovies = [];
        this.scifiMovies = [];
        this.horrorMovies = [];
        this.dramaMovies = [];
        this.allTitles = [];

        // Check if cached API data exists in localStorage for instant boot
        const cached = this.loadApiCache();
        if (cached && cached.top10 && cached.top10.length > 0) {
            this.applyApiCatalogs(cached);
        } else {
            this.applyFallbackCatalogs();
        }

        this.init();
    }

    loadApiCache() {
        try {
            const raw = localStorage.getItem(this.cacheKey);
            return raw ? JSON.parse(raw) : null;
        } catch (e) { return null; }
    }

    saveApiCache(data) {
        try {
            localStorage.setItem(this.cacheKey, JSON.stringify(data));
        } catch (e) {}
    }

    applyApiCatalogs(data) {
        this.latestMovies = data.latest || [];
        this.top10Movies = data.top10 || [];
        this.trendingMovies = data.trending || [];
        this.popularSeries = data.series || [];
        this.actionMovies = data.action || [];
        this.scifiMovies = data.scifi || [];
        this.horrorMovies = data.horror || [];
        this.dramaMovies = data.drama || [];

        this.allTitles = this.deduplicateTitles([
            ...this.latestMovies,
            ...this.top10Movies,
            ...this.trendingMovies,
            ...this.popularSeries,
            ...this.actionMovies,
            ...this.scifiMovies,
            ...this.horrorMovies,
            ...this.dramaMovies
        ]);

        if (!this.currentHero && this.allTitles.length > 0) {
            this.currentHero = this.trendingMovies[0] || this.top10Movies[0] || this.allTitles[0];
        }
    }

    applyFallbackCatalogs() {
        this.latestMovies = [...LATEST_2026_MOVIES];
        this.top10Movies = [...NETFLIX_TOP_10];
        this.trendingMovies = [...TRENDING_MOVIES];
        this.popularSeries = [...POPULAR_TV_SERIES];
        this.actionMovies = [...ACTION_MOVIES];
        this.scifiMovies = [...SCIFI_MOVIES];
        this.horrorMovies = [...HORROR_MOVIES];
        this.dramaMovies = [...DRAMA_MOVIES];

        this.allTitles = this.deduplicateTitles([
            ...this.latestMovies,
            ...this.top10Movies,
            ...this.trendingMovies,
            ...this.popularSeries,
            ...this.actionMovies,
            ...this.scifiMovies,
            ...this.horrorMovies,
            ...this.dramaMovies
        ]);

        this.currentHero = this.top10Movies[0] || this.allTitles[0];
    }

    deduplicateTitles(list) {
        const seen = new Set();
        return list.filter(item => {
            if (!item || !item.id || seen.has(item.id)) return false;
            seen.add(item.id);
            return true;
        });
    }

    init() {
        this.renderAllRails();
        this.renderFeaturedSidePosters();
        this.setupHeroBillboard();
        this.setupGenreFilter();
        this.setupSortControls();
        this.setupAtoZControls();
        this.setupTVRemoteNavigation();
        this.setupSidebarNavigation();
        this.setupMobileNavigation();
        this.setupSearch();
        this.setupInfoModal();
        this.renderContinueWatching();
        this.setupRailArrows();
        this.setupLoadMore();
        this.setupSoundToggle();

        // Listen for history updates
        window.addEventListener('netflix_history_changed', () => {
            this.renderContinueWatching();
            this.renderFeaturedSidePosters();
        });

        // Pull dynamic live titles from Cinemeta API in real-time!
        this.fetchLiveCinemetaCatalogs();
    }

    renderAllSkeletons() {
        const rails = ['latest-rail', 'top10-rail', 'trending-rail', 'tvseries-rail', 'action-rail', 'scifi-rail', 'horror-rail', 'drama-rail'];
        rails.forEach(id => {
            const container = document.getElementById(id);
            if (container) {
                container.innerHTML = '';
                for (let i = 0; i < 7; i++) {
                    const sk = document.createElement('div');
                    sk.className = id === 'latest-rail' 
                        ? 'vision-card-portrait latest-expand-card skeleton-card-pulse' 
                        : 'vision-mini-card skeleton-card-pulse';
                    container.appendChild(sk);
                }
            }
        });
    }

    async fetchLiveCinemetaCatalogs() {
        const fetchCatalog = async (url) => {
            try {
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    return (data && Array.isArray(data.metas)) ? data.metas : [];
                }
            } catch (e) {
                console.warn('Cinemeta catalog fetch error:', url, e);
            }
            return [];
        };

        try {
            // Show skeleton loading if first visit without cache
            const hasExisting = this.top10Movies && this.top10Movies.length > 0;
            if (!hasExisting) {
                this.renderAllSkeletons();
            }

            // Real-time parallel fetch across Cinemeta catalogs (No API key needed, unlimited, fast CDN)
            const [topMoviesRaw, topSeriesRaw, actionRaw, scifiRaw, horrorRaw, dramaRaw] = await Promise.all([
                fetchCatalog('https://v3-cinemeta.strem.io/catalog/movie/top.json'),
                fetchCatalog('https://v3-cinemeta.strem.io/catalog/series/top.json'),
                fetchCatalog('https://v3-cinemeta.strem.io/catalog/movie/top/genre=Action.json'),
                fetchCatalog('https://v3-cinemeta.strem.io/catalog/movie/top/genre=Sci-Fi.json'),
                fetchCatalog('https://v3-cinemeta.strem.io/catalog/movie/top/genre=Horror.json'),
                fetchCatalog('https://v3-cinemeta.strem.io/catalog/movie/top/genre=Drama.json')
            ]);

            const topMovies = topMoviesRaw.map(m => formatCinemetaItem(m, 'movie'));
            const topSeries = topSeriesRaw.map(m => formatCinemetaItem(m, 'series'));
            const action = actionRaw.map(m => formatCinemetaItem(m, 'movie'));
            const scifi = scifiRaw.map(m => formatCinemetaItem(m, 'movie'));
            const horror = horrorRaw.map(m => formatCinemetaItem(m, 'movie'));
            const drama = dramaRaw.map(m => formatCinemetaItem(m, 'movie'));

            if (topMovies.length > 0) {
                // Filter 2024 - 2026 releases for Latest Blockbusters
                const latest = topMovies.filter(m => parseInt(m.year, 10) >= 2024);
                const latestList = latest.length >= 6 ? latest.slice(0, 12) : topMovies.slice(0, 10);
                const top10List = topMovies.slice(0, 10);
                const trendingList = topMovies.slice(10, 25);

                const freshCatalogs = {
                    latest: latestList,
                    top10: top10List,
                    trending: trendingList,
                    series: topSeries.slice(0, 15),
                    action: action.slice(0, 15),
                    scifi: scifi.slice(0, 15),
                    horror: horror.slice(0, 15),
                    drama: drama.slice(0, 15),
                    timestamp: Date.now()
                };

                // Update application state with 100% dynamic live data
                this.applyApiCatalogs(freshCatalogs);

                // Re-render UI with live data
                this.renderAllRails();
                this.renderFeaturedSidePosters();
                if (this.currentHero) this.updateHeroDisplay(this.currentHero, false);

                // Cache to localStorage for instant subsequent loads
                this.saveApiCache(freshCatalogs);
            }
        } catch (err) {
            console.error('Error fetching live Cinemeta catalogs:', err);
        }
    }

    setupHeroBillboard() {
        this.updateHeroDisplay(this.currentHero, false);

        const playBtn = document.getElementById('hero-play-button');
        if (playBtn) {
            playBtn.onclick = () => {
                if (window.netflixPlayer) window.netflixPlayer.play(this.currentHero);
            };
        }

        const infoBtn = document.getElementById('hero-info-button');
        if (infoBtn) {
            infoBtn.onclick = () => this.openInfoModal(this.currentHero);
        }
    }

    // ==========================================================
    // DYNAMIC HERO HOVER & VIDEO BACKGROUND SYSTEM
    // ==========================================================
    updateHeroDisplay(item, isPreview = false) {
        this.currentHero = item;
        const banner = document.getElementById('hero-billboard');
        const title = document.getElementById('hero-title');
        const overview = document.getElementById('hero-overview');
        const typeBadge = document.getElementById('hero-type-badge');
        const duration = document.getElementById('hero-duration');
        const match = document.getElementById('hero-match');
        const year = document.getElementById('hero-year');
        const age = document.getElementById('hero-age');
        const genres = document.getElementById('hero-genres');
        const previewTag = document.getElementById('live-preview-tag');

        if (title) title.textContent = item.title;
        if (overview) overview.textContent = item.overview;
        if (typeBadge) typeBadge.textContent = item.type === 'series' ? 'SERIES' : 'ORIGINAL';
        if (duration) duration.textContent = item.duration || (item.type === 'series' ? '4 Seasons' : '2h 15m');
        if (match) match.textContent = item.match || '98% Match';
        if (year) year.textContent = item.year;
        if (age) age.textContent = item.age || '16+';
        if (genres) genres.textContent = item.genres || 'Action • Sci-Fi';

        if (previewTag) {
            if (isPreview) previewTag.classList.remove('hidden');
            else previewTag.classList.add('hidden');
        }

        if (banner) {
            const bgUrl = item.background || `https://images.metahub.space/background/medium/${item.id}/img`;
            const backdropImg = document.getElementById('hero-backdrop-img');
            if (backdropImg) {
                backdropImg.style.backgroundImage = `url('${bgUrl}')`;
            } else {
                banner.style.backgroundImage = `url('${bgUrl}')`;
            }
        }
    }

    onHoverCard(item) {
        clearTimeout(this.videoTimer);

        // Update Billboard text and backdrop immediately
        this.updateHeroDisplay(item, true);

        // Trigger ambient background video after 400ms hover
        this.videoTimer = setTimeout(() => {
            this.playBackgroundVideo(item);
        }, 400);
    }

    onLeaveCard() {
        clearTimeout(this.videoTimer);
        this.stopBackgroundVideo();
        const previewTag = document.getElementById('live-preview-tag');
        if (previewTag) previewTag.classList.add('hidden');
    }

    playBackgroundVideo(item) {
        const videoLayer = document.getElementById('hero-video-layer');
        const backdropImg = document.getElementById('hero-backdrop-img');
        if (!videoLayer) return;

        // Clean high quality cinematic preview clips (mp4)
        const cinemataClips = [
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'
        ];

        const videoPreviews = {
            'tt4574334': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
            'tt6263850': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            'tt15239678': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            'tt13443470': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
            'tt18411490': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
        };

        const clipUrl = videoPreviews[item.id] || cinemataClips[Math.floor(Math.random() * cinemataClips.length)];

        // Clear previous video
        videoLayer.innerHTML = '';

        const video = document.createElement('video');
        video.id = 'hero-preview-video';
        video.src = clipUrl;
        video.autoplay = true;
        video.loop = true;
        video.muted = true;
        video.defaultMuted = true;
        video.playsInline = true;
        video.setAttribute('playsinline', '');
        video.setAttribute('webkit-playsinline', '');
        video.setAttribute('muted', '');

        video.onplaying = () => {
            videoLayer.classList.remove('hidden');
            videoLayer.classList.add('active');
            if (backdropImg) backdropImg.style.opacity = '0';
        };

        videoLayer.appendChild(video);
        videoLayer.classList.remove('hidden');
        videoLayer.classList.add('active');

        // Play video
        const p = video.play();
        if (p !== undefined) {
            p.then(() => {
                if (backdropImg) backdropImg.style.opacity = '0';
            }).catch(() => {
                video.muted = true;
                video.play().catch(() => {});
            });
        }
    }

    stopBackgroundVideo() {
        const videoLayer = document.getElementById('hero-video-layer');
        const backdropImg = document.getElementById('hero-backdrop-img');
        if (!videoLayer) return;
        videoLayer.classList.remove('active');
        videoLayer.classList.add('hidden');
        videoLayer.innerHTML = '';
        if (backdropImg) backdropImg.style.opacity = '1';
    }

    setupSoundToggle() {
        const btn = document.getElementById('hero-sound-btn');
        if (!btn) return;

        btn.onclick = (e) => {
            e.stopPropagation();
            this.isMuted = !this.isMuted;
            const iconMuted = btn.querySelector('.sound-icon-muted');
            const iconUnmuted = btn.querySelector('.sound-icon-unmuted');

            if (this.isMuted) {
                iconMuted?.classList.remove('hidden');
                iconUnmuted?.classList.add('hidden');
            } else {
                iconMuted?.classList.add('hidden');
                iconUnmuted?.classList.remove('hidden');
            }

            const videoEl = document.getElementById('hero-preview-video');
            if (videoEl) {
                videoEl.muted = this.isMuted;
            }
        };
    }

    // ==========================================================
    // CARD ATTACHMENTS WITH HOVER & INTERACTIVITY
    // ==========================================================
    attachCardInteractions(card, item) {
        // Hover: updates Hero Billboard and triggers video background!
        card.onmouseenter = () => this.onHoverCard(item);
        card.onmouseleave = () => this.onLeaveCard();

        // Focus (TV Remote navigation): also previews on Hero Billboard!
        card.onfocus = () => this.onHoverCard(item);
        card.onblur = () => this.onLeaveCard();

        // Click / Enter: opens the interactive Preview & Recommendations modal!
        card.onclick = () => {
            this.onLeaveCard();
            this.openInfoModal(item);
        };
        card.onkeydown = (e) => {
            if (e.key === 'Enter') {
                this.onLeaveCard();
                this.openInfoModal(item);
            }
        };
    }

    renderAllRails() {
        this.renderLatestBlockbustersRail(this.latestMovies, document.getElementById('latest-rail'));
        this.renderTop10Rail(this.top10Movies, document.getElementById('top10-rail'));
        this.renderStandardRail(this.trendingMovies, document.getElementById('trending-rail'));
        this.renderStandardRail(this.popularSeries, document.getElementById('tvseries-rail'));
        this.renderStandardRail(this.actionMovies, document.getElementById('action-rail'));
        this.renderStandardRail(this.scifiMovies, document.getElementById('scifi-rail'));
        this.renderStandardRail(this.horrorMovies, document.getElementById('horror-rail'));
        this.renderStandardRail(this.dramaMovies, document.getElementById('drama-rail'));
    }

    renderLatestBlockbustersRail(items, container) {
        if (!container) return;
        container.innerHTML = '';
        (items || []).forEach(item => {
            if (!item) return;
            const card = document.createElement('div');
            card.className = 'vision-card-portrait latest-expand-card';
            card.tabIndex = 0;
            const posterSrc = getBestPosterUrl(item);
            const isSeries = item.type === 'series';
            const subLabel = isSeries 
                ? (item.year || 'Series')
                : (item.duration || item.year || '2025');

            card.innerHTML = `
                <img class="card-poster" src="${posterSrc}" alt="${item.title}" loading="lazy" referrerpolicy="no-referrer"
                     data-id="${item.id}" data-title="${encodeURIComponent(item.title)}" data-year="${item.year || ''}" onerror="window.handleImgError(this)">
                <div class="vision-card-gradient"></div>

                <!-- Floating Center Play Icon on Hover -->
                <div class="card-center-play-badge">
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><polygon points="7 5 19 12 7 19 7 5"/></svg>
                </div>

                <div class="vision-card-meta">
                    <div class="card-category-tag">
                        <span class="n-mark">D</span>
                        <span>${isSeries ? 'SERIES' : 'BLOCKBUSTER'}</span>
                        <span style="margin-left:auto;color:#ffffff;background:var(--netflix-red);padding:2px 7px;border-radius:6px;font-size:0.62rem;font-weight:800;">${item.year || 'NEW'}</span>
                    </div>

                    <h3 class="card-title-text">${item.title}</h3>

                    <div class="card-score-row">
                        <span class="badge-match">${item.match || `${item.matchScore || 98}% Match`}</span>
                        <span style="color:rgba(255,255,255,0.7);font-size:0.75rem;">${subLabel}</span>
                        ${item.age ? `<span style="border:1px solid rgba(255,255,255,0.3);padding:1px 5px;border-radius:4px;font-size:0.66rem;color:#ddd;">${item.age}</span>` : ''}
                    </div>

                    <p class="card-genre-sub">${item.genres || 'Action • Adventure'}</p>

                    <!-- Expand Content Body on Hover -->
                    <div class="card-hover-expand-content">
                        <p class="card-expand-overview">${item.overview || 'Explore this latest blockbuster release on DevFlix.'}</p>
                        <div class="card-expand-actions">
                            <button class="card-expand-play-btn" title="Watch Now">
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"/></svg>
                                <span>Play</span>
                            </button>
                            <button class="card-expand-info-btn" title="More Info">
                                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                            </button>
                        </div>
                    </div>
                </div>
            `;

            // Play button click inside expanded card
            const playBtn = card.querySelector('.card-expand-play-btn');
            if (playBtn) {
                playBtn.onclick = (e) => {
                    e.stopPropagation();
                    if (window.netflixPlayer) window.netflixPlayer.play(item);
                };
            }

            // More info button click inside expanded card
            const infoBtn = card.querySelector('.card-expand-info-btn');
            if (infoBtn) {
                infoBtn.onclick = (e) => {
                    e.stopPropagation();
                    this.openInfoModal(item);
                };
            }

            this.attachCardInteractions(card, item);
            container.appendChild(card);
        });
    }

    renderTop10Rail(items, container) {
        if (!container) return;
        container.innerHTML = '';
        items.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'vision-mini-card';
            card.tabIndex = 0;
            const rank = index + 1;
            const posterSrc = getBestPosterUrl(item);

            card.innerHTML = `
                <div class="top10-rank-pill">#${rank}</div>
                <img class="mini-poster" src="${posterSrc}" alt="${item.title}" loading="lazy" referrerpolicy="no-referrer"
                     data-id="${item.id}" data-title="${encodeURIComponent(item.title)}" data-year="${item.year || ''}" onerror="window.handleImgError(this)">
                <div class="mini-card-gradient"></div>
                <div class="mini-card-info">
                    <span class="tag">#${rank} TODAY</span>
                    <h4 class="title">${item.title}</h4>
                    <span class="genre">${item.match || '98% Match'} • ${item.year}</span>
                </div>
            `;

            this.attachCardInteractions(card, item);
            container.appendChild(card);
        });
    }

    renderStandardRail(items, container) {
        if (!container) return;
        container.innerHTML = '';
        items.forEach(item => {
            const card = document.createElement('div');
            card.className = 'vision-mini-card';
            card.tabIndex = 0;
            const posterSrc = getBestPosterUrl(item);
            const typeLabel = item.type === 'series' ? 'SERIES' : 'FILM';

            card.innerHTML = `
                <img class="mini-poster" src="${posterSrc}" alt="${item.title}" loading="lazy" referrerpolicy="no-referrer"
                     data-id="${item.id}" data-title="${encodeURIComponent(item.title)}" data-year="${item.year || ''}" onerror="window.handleImgError(this)">
                <div class="mini-card-gradient"></div>
                <div class="mini-card-info">
                    <span class="tag">${typeLabel}</span>
                    <h4 class="title">${item.title}</h4>
                    <span class="genre">${item.genres ? item.genres.split(',')[0] : 'Feature'} • ${item.year}</span>
                </div>
            `;

            this.attachCardInteractions(card, item);
            container.appendChild(card);
        });
    }

    renderFeaturedSidePosters() {
        const sideContainer = document.getElementById('featured-side-posters');
        if (!sideContainer) return;
        sideContainer.innerHTML = '';

        // Continue Watching: prioritize user's actual watch history if available, else API popular series!
        const history = window.netflixPlayer ? window.netflixPlayer.getHistory() : [];
        const sideTitles = [];

        if (history && history.length > 0) {
            sideTitles.push(...history.slice(0, 2));
        }

        const pool = (this.popularSeries && this.popularSeries.length > 0) ? this.popularSeries : POPULAR_TV_SERIES;
        const fallbacks = [
            pool[0],
            pool[1],
            pool[2],
            POPULAR_TV_SERIES[0],
            POPULAR_TV_SERIES[1]
        ].filter(Boolean);

        for (const fb of fallbacks) {
            if (sideTitles.length >= 2) break;
            if (fb && !sideTitles.some(s => s.id === fb.id)) {
                sideTitles.push(fb);
            }
        }

        sideTitles.forEach((item, index) => {
            if (!item) return;
            const card = document.createElement('div');
            card.className = 'vision-card-portrait';
            card.tabIndex = 0;
            const posterSrc = getBestPosterUrl(item);
            const progressPct = item.progress || (index === 0 ? '72%' : '45%');
            const subLabel = item.type === 'series' 
                ? (item.season ? `S${item.season}:E${item.episode || 1} • Resume` : '45m left')
                : (item.duration || '2h 10m');

            card.innerHTML = `
                <img class="card-poster" src="${posterSrc}" alt="${item.title}" loading="lazy" referrerpolicy="no-referrer"
                     data-id="${item.id}" data-title="${encodeURIComponent(item.title)}" data-year="${item.year || ''}" onerror="window.handleImgError(this)">
                <div class="vision-card-gradient"></div>

                <!-- Floating Center Play Icon on Hover -->
                <div class="card-center-play-badge">
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><polygon points="7 5 19 12 7 19 7 5"/></svg>
                </div>

                <div class="vision-card-meta">
                    <!-- Progress Bar for Continue Watching -->
                    <div class="card-watch-progress" title="${progressPct} watched">
                        <div class="card-watch-progress-fill" style="width: ${progressPct};"></div>
                    </div>

                    <div class="card-category-tag">
                        <span class="n-mark">D</span>
                        <span>${item.type === 'series' ? 'SERIES' : 'FILM'}</span>
                        <span style="margin-left:auto;color:var(--netflix-red);font-weight:800;font-size:0.68rem;letter-spacing:1px;">RESUME</span>
                    </div>

                    <h3 class="card-title-text">${item.title}</h3>

                    <div class="card-score-row">
                        <span class="badge-match">${item.match || '98% Match'}</span>
                        <span style="color:rgba(255,255,255,0.7);font-size:0.75rem;">${subLabel}</span>
                    </div>

                    <p class="card-genre-sub">${item.genres || 'Action • Sci-Fi'}</p>

                    <!-- Expand Content Body on Hover -->
                    <div class="card-hover-expand-content">
                        <p class="card-expand-overview">${item.overview || 'Continue watching where you left off.'}</p>
                        <div class="card-expand-actions">
                            <button class="card-expand-play-btn" title="Resume Playback">
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"/></svg>
                                <span>Play</span>
                            </button>
                            <button class="card-expand-info-btn" title="More Info">
                                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                            </button>
                        </div>
                    </div>
                </div>
            `;

            // Play button click inside expanded card
            const playBtn = card.querySelector('.card-expand-play-btn');
            if (playBtn) {
                playBtn.onclick = (e) => {
                    e.stopPropagation();
                    if (window.netflixPlayer) window.netflixPlayer.play(item);
                };
            }

            // More info button click inside expanded card
            const infoBtn = card.querySelector('.card-expand-info-btn');
            if (infoBtn) {
                infoBtn.onclick = (e) => {
                    e.stopPropagation();
                    this.openInfoModal(item);
                };
            }

            this.attachCardInteractions(card, item);
            sideContainer.appendChild(card);
        });
    }

    // ==========================================================
    // GENRE & COUNTRY / REGION FILTERING & SORTING LOGIC
    // ==========================================================
    setupGenreFilter() {
        const pills = document.querySelectorAll('.glass-pill, .genre-pill');
        pills.forEach(pill => {
            pill.onclick = () => {
                pills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');

                this.currentYear = 'all';

                if (pill.dataset.year) {
                    this.currentYear = pill.dataset.year;
                    this.currentCountry = 'all';
                    this.currentGenre = 'all';
                } else if (pill.dataset.country) {
                    this.currentCountry = pill.dataset.country;
                    this.currentGenre = 'all';
                } else {
                    this.currentGenre = pill.dataset.genre || 'all';
                    this.currentCountry = 'all';
                }

                this.displayedCount = 30;
                this.applyFilterAndSort();
            };
        });
    }

    setupSortControls() {
        const dropdown = document.getElementById('sort-dropdown');
        if (dropdown) {
            dropdown.onchange = () => {
                this.currentSort = dropdown.value;
                this.displayedCount = 30;
                if (this.currentSort === 'title') {
                    this.browseAtoZ('all');
                } else {
                    this.applyFilterAndSort();
                }
            };
        }
    }

    // ==========================================================
    // A - Z ALPHABETICAL DIRECTORY & BULK API CRAWLER
    // ==========================================================
    setupAtoZControls() {
        // Individual letter pills
        document.querySelectorAll('.atoz-letter-pill').forEach(btn => {
            btn.onclick = (e) => {
                e.preventDefault();
                const letter = btn.getAttribute('data-letter') || 'all';
                this.browseAtoZ(letter);
            };
        });

        // "Fetch All A-Z" bulk crawler button
        const fetchAllBtn = document.getElementById('atoz-fetch-all-btn');
        if (fetchAllBtn) {
            fetchAllBtn.onclick = (e) => {
                e.preventDefault();
                this.fetchAllAtoZMovies();
            };
        }
    }

    browseAtoZ(letter = 'all') {
        const filteredSection = document.getElementById('filtered-view-section');
        const filteredGrid = document.getElementById('filtered-grid');
        const filteredTitle = document.getElementById('filtered-view-title');
        const filteredCount = document.getElementById('filtered-count');
        const loadMoreBtn = document.getElementById('load-more-btn');
        const regularSections = document.querySelectorAll('.spatial-section:not(#filtered-view-section)');

        regularSections.forEach(sec => sec.classList.add('hidden'));
        if (filteredSection) filteredSection.classList.remove('hidden');

        // Update active letter button
        document.querySelectorAll('.atoz-letter-pill').forEach(btn => {
            if (btn.getAttribute('data-letter') === letter) btn.classList.add('active');
            else btn.classList.remove('active');
        });

        // Filter and sort titles
        let matches = [];
        if (letter === 'all') {
            matches = [...this.allTitles].sort((a, b) => a.title.localeCompare(b.title));
            if (filteredTitle) filteredTitle.textContent = 'A - Z Directory (All Titles)';
        } else if (letter === 'num') {
            matches = this.allTitles.filter(item => {
                const clean = item.title.replace(/^(the|a|an)\s+/i, '').trim();
                return /^[0-9]/.test(clean);
            }).sort((a, b) => a.title.localeCompare(b.title));
            if (filteredTitle) filteredTitle.textContent = 'A - Z Directory: Numeric (#)';
        } else {
            const targetChar = letter.toUpperCase();
            matches = this.allTitles.filter(item => {
                const clean = item.title.replace(/^(the|a|an)\s+/i, '').trim().toUpperCase();
                return clean.startsWith(targetChar) || item.title.toUpperCase().startsWith(targetChar);
            }).sort((a, b) => a.title.localeCompare(b.title));
            if (filteredTitle) filteredTitle.textContent = `A - Z Directory: Letter "${targetChar}"`;

            // If few or no results found, automatically fetch from Cinemeta API in real time!
            if (matches.length < 15) {
                this.fetchSpecificLetter(letter);
            }
        }

        if (filteredCount) filteredCount.textContent = `${matches.length} Titles`;

        if (filteredGrid) {
            filteredGrid.innerHTML = '';
            if (matches.length === 0) {
                filteredGrid.innerHTML = `
                    <div style="grid-column: 1/-1; text-align: center; padding: 3rem 1rem; color: #a3a3a3;">
                        <p style="font-size: 1.15rem; font-weight: 700; color: #ffffff;">Pulling titles for "${letter.toUpperCase()}" from API...</p>
                        <p style="font-size: 0.85rem; margin-top: 0.4rem;">Connecting to Cinemeta Live Index...</p>
                        <div class="skeleton-card-pulse" style="width: 175px; height: 255px; margin: 1.5rem auto; border-radius: 18px;"></div>
                    </div>
                `;
            } else {
                matches.forEach(item => {
                    const card = document.createElement('div');
                    card.className = 'vision-mini-card';
                    card.tabIndex = 0;
                    const posterSrc = getBestPosterUrl(item);
                    const typeLabel = item.type === 'series' ? 'SERIES' : 'FILM';

                    card.innerHTML = `
                        <img class="mini-poster" src="${posterSrc}" alt="${item.title}" loading="lazy" referrerpolicy="no-referrer"
                             data-id="${item.id}" data-title="${encodeURIComponent(item.title)}" data-year="${item.year || ''}" onerror="window.handleImgError(this)">
                        <div class="mini-card-gradient"></div>
                        <div class="mini-card-info">
                            <span class="tag">${typeLabel}</span>
                            <h4 class="title">${item.title}</h4>
                            <span class="genre">${item.match || '98% Match'} • ${item.year}</span>
                        </div>
                    `;

                    this.attachCardInteractions(card, item);
                    filteredGrid.appendChild(card);
                });
            }
        }

        if (loadMoreBtn) loadMoreBtn.classList.add('hidden');
        filteredSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    async fetchSpecificLetter(letter) {
        try {
            const res = await fetch(`https://v3-cinemeta.strem.io/catalog/movie/top/search=${encodeURIComponent(letter)}.json`);
            if (res.ok) {
                const data = await res.json();
                if (data && Array.isArray(data.metas) && data.metas.length > 0) {
                    const formatted = data.metas.map(m => formatCinemetaItem(m, 'movie'));
                    this.allTitles = this.deduplicateTitles([...this.allTitles, ...formatted]);

                    // If user is still viewing this letter, refresh results view!
                    const activeLetterBtn = document.querySelector('.atoz-letter-pill.active');
                    if (activeLetterBtn && activeLetterBtn.getAttribute('data-letter') === letter) {
                        this.browseAtoZ(letter);
                    }
                }
            }
        } catch (e) {}
    }

    async fetchAllAtoZMovies() {
        const label = document.getElementById('atoz-fetch-label');
        const btn = document.getElementById('atoz-fetch-all-btn');
        if (label) label.textContent = 'Fetching A-Z (0%)...';
        if (btn) btn.style.pointerEvents = 'none';

        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        const fetchCatalog = async (url) => {
            try {
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    return (data && Array.isArray(data.metas)) ? data.metas : [];
                }
            } catch (e) {}
            return [];
        };

        let newItems = [];
        const batchSize = 5;

        for (let i = 0; i < letters.length; i += batchSize) {
            const batch = letters.slice(i, i + batchSize);
            const pct = Math.round((i / letters.length) * 100);
            if (label) label.textContent = `Fetching A-Z (${pct}%)...`;

            const batchResults = await Promise.all(batch.map(l => 
                fetchCatalog(`https://v3-cinemeta.strem.io/catalog/movie/top/search=${encodeURIComponent(l)}.json`)
            ));

            batchResults.forEach(metas => {
                if (metas && metas.length > 0) {
                    const formatted = metas.map(m => formatCinemetaItem(m, 'movie'));
                    newItems.push(...formatted);
                }
            });
        }

        // Also fetch skip=50 and skip=100 from top movies & series
        const [p1, p2, p3] = await Promise.all([
            fetchCatalog('https://v3-cinemeta.strem.io/catalog/movie/top/skip=50.json'),
            fetchCatalog('https://v3-cinemeta.strem.io/catalog/movie/top/skip=100.json'),
            fetchCatalog('https://v3-cinemeta.strem.io/catalog/series/top/skip=50.json')
        ]);
        if (p1 && p1.length > 0) newItems.push(...p1.map(m => formatCinemetaItem(m, 'movie')));
        if (p2 && p2.length > 0) newItems.push(...p2.map(m => formatCinemetaItem(m, 'movie')));
        if (p3 && p3.length > 0) newItems.push(...p3.map(m => formatCinemetaItem(m, 'series')));

        this.allTitles = this.deduplicateTitles([...this.allTitles, ...newItems]);

        // Save complete catalog to localStorage cache
        this.saveApiCache({
            latest: this.latestMovies,
            top10: this.top10Movies,
            trending: this.trendingMovies,
            series: this.popularSeries,
            action: this.actionMovies,
            scifi: this.scifiMovies,
            horror: this.horrorMovies,
            drama: this.dramaMovies,
            timestamp: Date.now()
        });

        if (label) label.textContent = `✓ All A-Z Ready (${this.allTitles.length}+ Titles)`;
        if (btn) btn.style.pointerEvents = 'auto';

        // Re-display current letter or view
        const activeLetterBtn = document.querySelector('.atoz-letter-pill.active');
        const activeLetter = activeLetterBtn ? activeLetterBtn.getAttribute('data-letter') : 'all';
        this.browseAtoZ(activeLetter);
    }

    applyFilterAndSort() {
        const filteredSection = document.getElementById('filtered-view-section');
        const filteredGrid = document.getElementById('filtered-grid');
        const filteredTitle = document.getElementById('filtered-view-title');
        const filteredCount = document.getElementById('filtered-count');
        const loadMoreBtn = document.getElementById('load-more-btn');

        // All normal spatial sections (Continue Watching, New & Popular, etc.)
        const regularSections = document.querySelectorAll('.spatial-section:not(#filtered-view-section)');

        if (this.currentGenre === 'all' && this.currentCountry === 'all' && this.currentYear === 'all' && this.currentSort === 'featured') {
            if (filteredSection) filteredSection.classList.add('hidden');
            regularSections.forEach(sec => sec.classList.remove('hidden'));
            return;
        }

        // Hide regular homepage rows when a filter or sort is applied
        regularSections.forEach(sec => sec.classList.add('hidden'));
        if (filteredSection) filteredSection.classList.remove('hidden');

        let results = [...this.allTitles];

        // Filter by Year if selected (e.g. 2026)
        if (this.currentYear !== 'all') {
            results = results.filter(item => String(item.year || '').includes(this.currentYear));
        }

        // Filter by Country if selected
        if (this.currentCountry !== 'all') {
            results = results.filter(item => item.country === this.currentCountry);
        }

        // Filter by Genre if selected
        if (this.currentGenre !== 'all') {
            results = results.filter(item => 
                item.genres && item.genres.toLowerCase().includes(this.currentGenre.toLowerCase())
            );
        }

        // Apply sorting
        if (this.currentSort === 'rating') {
            results.sort((a, b) => (b.matchScore || 90) - (a.matchScore || 90));
        } else if (this.currentSort === 'year') {
            results.sort((a, b) => parseInt(b.year || '2000', 10) - parseInt(a.year || '2000', 10));
        } else if (this.currentSort === 'title') {
            results.sort((a, b) => a.title.localeCompare(b.title));
        }

        if (filteredTitle) {
            let label = 'Filtered Movies';
            if (this.currentCountry !== 'all') {
                const map = { USA: 'Hollywood Hits', Korea: 'K-Drama & Korean Cinema', Japan: 'Anime & Japanese Masterpieces', UK: 'British Cinema' };
                label = map[this.currentCountry] || this.currentCountry;
            } else if (this.currentGenre !== 'all') {
                label = `${this.currentGenre} Movies & Series`;
            } else if (this.currentSort !== 'featured') {
                const sortNames = { rating: 'Highest Match', year: 'Newest First', title: 'Title A - Z' };
                label = `All Titles Sorted By: ${sortNames[this.currentSort] || this.currentSort}`;
            }
            filteredTitle.textContent = label;
        }

        if (filteredCount) {
            filteredCount.textContent = `Showing ${Math.min(this.displayedCount, results.length)} of ${results.length} titles`;
        }

        const visibleSlice = results.slice(0, this.displayedCount);

        if (loadMoreBtn) {
            loadMoreBtn.style.display = results.length > this.displayedCount ? 'inline-flex' : 'none';
        }

        if (filteredGrid) {
            filteredGrid.innerHTML = '';
            if (results.length === 0) {
                filteredGrid.innerHTML = `<p style="grid-column: 1/-1; color: var(--text-muted); padding: 2rem 0; font-size: 1.1rem;">No titles found in this category.</p>`;
                return;
            }

            visibleSlice.forEach(item => {
                const card = document.createElement('div');
                card.className = 'vision-mini-card';
                card.tabIndex = 0;
                card.style.flex = 'unset';
                card.style.width = '100%';
                card.style.minWidth = '0';
                card.style.height = '270px';
                const posterSrc = getBestPosterUrl(item);
                const typeLabel = item.type === 'series' ? 'SERIES' : 'FILM';

                card.innerHTML = `
                    <img class="mini-poster" src="${posterSrc}" alt="${item.title}" loading="lazy" referrerpolicy="no-referrer"
                         data-id="${item.id}" data-title="${encodeURIComponent(item.title)}" data-year="${item.year || ''}" onerror="window.handleImgError(this)">
                    <div class="mini-card-gradient"></div>
                    <div class="mini-card-info">
                        <span class="tag">${typeLabel}</span>
                        <h4 class="title">${item.title}</h4>
                        <span class="genre">${item.match || '97% Match'} • ${item.year}</span>
                    </div>
                `;

                this.attachCardInteractions(card, item);
                filteredGrid.appendChild(card);
            });
        }

        // Smooth scroll to top of results
        filteredSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // ==========================================================
    // INTERACTIVE PREVIEW MODAL & RECOMMENDED MOVIES
    // ==========================================================
    openInfoModal(media) {
        this.selectedMedia = media;
        const modal = document.getElementById('info-modal');
        const bg = document.getElementById('dialog-hero-bg');
        const title = document.getElementById('dialog-title');
        const overview = document.getElementById('dialog-overview');
        const year = document.getElementById('dialog-year');
        const age = document.getElementById('dialog-age');
        const duration = document.getElementById('dialog-duration');
        const genres = document.getElementById('dialog-genres');
        const match = document.getElementById('dialog-match');

        if (bg) {
            const bgUrl = media.background || `https://images.metahub.space/background/medium/${media.id}/img`;
            bg.style.backgroundImage = `url('${bgUrl}')`;
        }
        if (title) title.textContent = media.title;
        if (overview) overview.textContent = media.overview;
        if (year) year.textContent = media.year;
        if (age) age.textContent = media.age || '16+';
        if (duration) duration.textContent = media.duration || (media.type === 'series' ? 'TV Series' : '2h 15m');
        if (genres) genres.textContent = media.genres || 'Action, Drama';
        if (match) match.textContent = media.match || '98% Match';

        const playBtn = document.getElementById('dialog-play-btn');
        if (playBtn) {
            playBtn.onclick = () => {
                modal.classList.add('hidden');
                if (window.netflixPlayer) window.netflixPlayer.play(media);
            };
        }

        const watchlistBtn = document.getElementById('dialog-watchlist-btn');
        if (watchlistBtn) {
            watchlistBtn.onclick = () => this.toggleWatchlist(media);
        }

        // Render Recommended Movies in modal
        this.renderRecommendedInModal(media);

        if (modal) {
            modal.classList.remove('hidden');
            const dialog = modal.querySelector('.netflix-dialog');
            if (dialog) dialog.scrollTo({ top: 0, behavior: 'auto' });
        }
    }

    renderRecommendedInModal(media) {
        const grid = document.getElementById('dialog-recommended-grid');
        if (!grid) return;
        grid.innerHTML = '';

        const mediaGenres = (media.genres || '').toLowerCase().split(',').map(g => g.trim());

        const recommended = this.allTitles.filter(item => {
            if (item.id === media.id) return false;
            const itemGenres = (item.genres || '').toLowerCase();
            return mediaGenres.some(g => g && itemGenres.includes(g));
        }).slice(0, 6);

        const finalRecs = recommended.length >= 3 
            ? recommended 
            : this.allTitles.filter(i => i.id !== media.id).slice(0, 6);

        finalRecs.forEach(item => {
            const card = document.createElement('div');
            card.className = 'recommended-card';
            const posterSrc = getBestPosterUrl(item);

            card.innerHTML = `
                <div class="rec-poster">
                    <img src="${posterSrc}" alt="${item.title}" loading="lazy" referrerpolicy="no-referrer"
                         data-id="${item.id}" data-title="${encodeURIComponent(item.title)}" data-year="${item.year || ''}" onerror="window.handleImgError(this)">
                    <div class="rec-play-overlay">
                        <div class="poster-play-icon">
                            <svg viewBox="0 0 24 24"><polygon points="6 4 20 12 6 20 6 4"/></svg>
                        </div>
                    </div>
                </div>
                <div class="rec-body">
                    <h5 class="rec-title">${item.title}</h5>
                    <div class="rec-meta">
                        <span class="match-score">${item.match || '96% Match'}</span>
                        <span class="age-badge">${item.age || '16+'}</span>
                        <span style="color:#a3a3a3">${item.year}</span>
                    </div>
                    <p class="rec-desc">${item.overview || ''}</p>
                </div>
            `;

            // Clicking recommended movie in modal updates the modal to that movie!
            card.onclick = (e) => {
                e.stopPropagation();
                this.openInfoModal(item);
            };

            grid.appendChild(card);
        });
    }

    renderContinueWatching() {
        const rail = document.getElementById('continue-watching-rail');
        const row = document.getElementById('continue-watching-row');
        if (!rail || !row) return;

        const history = window.netflixPlayer ? window.netflixPlayer.getHistory() : [];
        if (history.length === 0) {
            row.classList.add('hidden');
            return;
        }

        row.classList.remove('hidden');
        rail.innerHTML = '';

        history.forEach(item => {
            const card = document.createElement('div');
            card.className = 'poster-card';
            card.tabIndex = 0;
            const sub = item.type === 'series' ? `S${item.season}:E${item.episode}` : 'Movie';
            const posterSrc = getBestPosterUrl(item);

            card.innerHTML = `
                <img src="${posterSrc}" alt="${item.title}" loading="lazy" referrerpolicy="no-referrer"
                     data-id="${item.id}" data-title="${encodeURIComponent(item.title)}" data-year="${item.year || ''}" onerror="window.handleImgError(this)">
                <div class="poster-overlay">
                    <div class="poster-play-icon">
                        <svg viewBox="0 0 24 24"><polygon points="6 4 20 12 6 20 6 4"/></svg>
                    </div>
                    <h4 class="poster-title-text">${item.title}</h4>
                    <div class="poster-card-meta">
                        <span style="color:var(--netflix-red);font-weight:700;">Resume ${sub}</span>
                    </div>
                </div>
            `;

            card.onclick = () => {
                if (window.netflixPlayer) window.netflixPlayer.play(item);
            };

            rail.appendChild(card);
        });
    }

    setupRailArrows() {
        // Support both old posters-rail-container and new spatial-section toggle buttons
        document.querySelectorAll('.spatial-section').forEach(section => {
            const rail = section.querySelector('.spatial-card-row');
            const prevBtn = section.querySelector('.rail-toggle-btn.prev');
            const nextBtn = section.querySelector('.rail-toggle-btn.next');

            if (rail && prevBtn) {
                prevBtn.onclick = (e) => {
                    e.stopPropagation();
                    rail.scrollBy({ left: -680, behavior: 'smooth' });
                };
            }
            if (rail && nextBtn) {
                nextBtn.onclick = (e) => {
                    e.stopPropagation();
                    rail.scrollBy({ left: 680, behavior: 'smooth' });
                };
            }
        });

        document.querySelectorAll('.posters-rail-container').forEach(container => {
            const rail = container.querySelector('.posters-rail');
            const leftBtn = container.querySelector('.rail-arrow.left');
            const rightBtn = container.querySelector('.rail-arrow.right');

            if (rail && leftBtn) {
                leftBtn.onclick = () => rail.scrollBy({ left: -600, behavior: 'smooth' });
            }
            if (rail && rightBtn) {
                rightBtn.onclick = () => rail.scrollBy({ left: 600, behavior: 'smooth' });
            }
        });
    }

    setupTVRemoteNavigation() {
        window.addEventListener('keydown', (e) => {
            if (window.netflixPlayer?.isOpen()) return;
            const searchOverlay = document.getElementById('search-overlay');
            if (searchOverlay && !searchOverlay.classList.contains('hidden')) return;

            const current = document.activeElement;
            const isCard = current?.classList?.contains('poster-card') || current?.classList?.contains('top10-card');

            if (!isCard) return;

            if (e.key === 'ArrowRight') {
                e.preventDefault();
                const next = current.nextElementSibling;
                if (next && (next.classList.contains('poster-card') || next.classList.contains('top10-card'))) {
                    next.focus();
                    next.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                }
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                const prev = current.previousElementSibling;
                if (prev && (prev.classList.contains('poster-card') || prev.classList.contains('top10-card'))) {
                    prev.focus();
                    prev.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                const currentRow = current.closest('.tv-row');
                const nextRow = currentRow?.nextElementSibling;
                const firstCardInNext = nextRow?.querySelector('.poster-card, .top10-card');
                if (firstCardInNext) {
                    firstCardInNext.focus();
                    firstCardInNext.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                const currentRow = current.closest('.tv-row');
                const prevRow = currentRow?.previousElementSibling;
                const firstCardInPrev = prevRow?.querySelector('.poster-card, .top10-card');
                if (firstCardInPrev) {
                    firstCardInPrev.focus();
                    firstCardInPrev.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                    document.getElementById('hero-play-button')?.focus();
                }
            }
        });
    }

    navigateToView(view) {
        document.querySelectorAll('.nav-pill, .menu-item, .bottom-nav-item').forEach(m => {
            m.classList.toggle('active', m.getAttribute('data-view') === view);
        });

        const filteredSection = document.getElementById('filtered-view-section');

        if (view === 'atoz') {
            this.browseAtoZ('all');
        } else if (view === 'movies') {
            this.currentGenre = 'all';
            this.filterByType('movie');
        } else if (view === 'series') {
            this.currentGenre = 'all';
            this.filterByType('series');
        } else if (view === 'recent') {
            this.filterRecentlyAdded();
        } else if (view === 'trending') {
            if (filteredSection) filteredSection.classList.add('hidden');
            document.querySelectorAll('.spatial-section:not(#filtered-view-section)').forEach(sec => sec.classList.remove('hidden'));
            document.getElementById('section-new-popular')?.scrollIntoView({ behavior: 'smooth' });
        } else if (view === 'languages') {
            if (filteredSection) filteredSection.classList.add('hidden');
            document.querySelectorAll('.spatial-section:not(#filtered-view-section)').forEach(sec => sec.classList.remove('hidden'));
            document.getElementById('country-pill-track')?.scrollIntoView({ behavior: 'smooth' });
        } else if (view === 'watchlist' || view === 'watchlater') {
            this.openWatchlistModal();
        } else {
            if (filteredSection) filteredSection.classList.add('hidden');
            const regularSections = document.querySelectorAll('.spatial-section:not(#filtered-view-section)');
            regularSections.forEach(sec => sec.classList.remove('hidden'));
            const mainContainer = document.getElementById('vision-main-content');
            if (mainContainer) mainContainer.scrollTo({ top: 0, behavior: 'smooth' });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        if (typeof this.closeMobileDrawer === 'function') {
            this.closeMobileDrawer();
        }
    }

    setupSidebarNavigation() {
        document.querySelectorAll('.nav-pill, .menu-item[data-view]').forEach(item => {
            item.onclick = (e) => {
                e.preventDefault();
                const view = item.getAttribute('data-view');
                if (view) this.navigateToView(view);
            };
        });
    }

    setupMobileNavigation() {
        const sidebar = document.getElementById('vision-sidebar');
        const backdrop = document.getElementById('mobile-drawer-backdrop');
        const menuBtn = document.getElementById('mobile-menu-btn');
        const closeBtn = document.getElementById('sidebar-mobile-close');
        const mobileSearchBtn = document.getElementById('mobile-search-btn');
        const searchInput = document.getElementById('quick-search-input');

        const openDrawer = () => {
            if (sidebar) sidebar.classList.add('mobile-open');
            if (backdrop) backdrop.classList.add('active');
            document.body.style.overflow = 'hidden';
        };

        const closeDrawer = () => {
            if (sidebar) sidebar.classList.remove('mobile-open');
            if (backdrop) backdrop.classList.remove('active');
            document.body.style.overflow = '';
        };

        this.closeMobileDrawer = closeDrawer;

        if (menuBtn) {
            menuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (sidebar && sidebar.classList.contains('mobile-open')) {
                    closeDrawer();
                } else {
                    openDrawer();
                }
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', closeDrawer);
        }

        if (backdrop) {
            backdrop.addEventListener('click', closeDrawer);
        }

        if (mobileSearchBtn) {
            mobileSearchBtn.addEventListener('click', () => {
                openDrawer();
                if (searchInput) {
                    setTimeout(() => {
                        searchInput.focus();
                        searchInput.select();
                    }, 180);
                }
            });
        }

        document.querySelectorAll('#mobile-bottom-nav .bottom-nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const view = item.getAttribute('data-view');
                if (view) this.navigateToView(view);
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && sidebar && sidebar.classList.contains('mobile-open')) {
                closeDrawer();
            }
        });
    }

    setupSearch() {
        const sidebarInput = document.getElementById('quick-search-input');
        if (sidebarInput) {
            let debounceTimer = null;

            const performSearch = async () => {
                const q = sidebarInput.value.trim().toLowerCase();
                const filteredSection = document.getElementById('filtered-view-section');
                const filteredGrid = document.getElementById('filtered-grid');
                const filteredTitle = document.getElementById('filtered-view-title');
                const filteredCount = document.getElementById('filtered-count');
                const loadMoreBtn = document.getElementById('load-more-btn');
                const regularSections = document.querySelectorAll('.spatial-section:not(#filtered-view-section)');

                if (!q) {
                    if (filteredSection) filteredSection.classList.add('hidden');
                    regularSections.forEach(sec => sec.classList.remove('hidden'));
                    return;
                }

                // Hide standard billboard and carousels when searching
                regularSections.forEach(sec => sec.classList.add('hidden'));
                if (filteredSection) filteredSection.classList.remove('hidden');

                // Instant match against in-memory catalog
                const localMatches = this.allTitles.filter(t => 
                    (t.title && t.title.toLowerCase().includes(q)) ||
                    (t.genres && t.genres.toLowerCase().includes(q)) ||
                    (t.overview && t.overview.toLowerCase().includes(q)) ||
                    (t.year && t.year.toString().includes(q))
                );

                const renderResults = (items, isSearchingLive = false) => {
                    if (filteredTitle) filteredTitle.textContent = `🔍 Search results for "${q}"`;
                    if (filteredCount) {
                        filteredCount.textContent = isSearchingLive 
                            ? `Searching global database...` 
                            : `(${items.length} titles found)`;
                    }
                    if (loadMoreBtn) loadMoreBtn.style.display = 'none';

                    if (filteredGrid) {
                        filteredGrid.innerHTML = '';
                        if (items.length === 0) {
                            if (isSearchingLive) {
                                // Show modern pulsing skeleton loader instead of premature 'not found'
                                filteredGrid.innerHTML = `
                                    <div style="grid-column: 1/-1; display:flex; align-items:center; gap:0.85rem; color: rgba(255,255,255,0.7); font-size: 1.05rem; padding: 2.5rem 0;">
                                        <div style="width: 22px; height: 22px; border: 2.5px solid rgba(255,255,255,0.2); border-top-color: var(--netflix-red); border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
                                        <span>Searching global cinema database for "${q}"...</span>
                                    </div>
                                    <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
                                `;
                            } else {
                                filteredGrid.innerHTML = `<p style="grid-column: 1/-1; color: var(--text-muted); font-size: 1.05rem; padding: 2.5rem 0;">No titles found for "${q}". Try checking the spelling or search another title.</p>`;
                            }
                            return;
                        }

                        items.forEach(item => {
                            const card = document.createElement('div');
                            card.className = 'vision-mini-card';
                            card.tabIndex = 0;
                            card.style.flex = 'unset';
                            card.style.width = '100%';
                            card.style.minWidth = '0';
                            card.style.height = '270px';
                            const posterSrc = getBestPosterUrl(item);
                            const typeLabel = item.type === 'series' ? 'SERIES' : 'FILM';

                            card.innerHTML = `
                                <img class="mini-poster" src="${posterSrc}" alt="${item.title}" loading="lazy" referrerpolicy="no-referrer"
                                     data-id="${item.id}" data-title="${encodeURIComponent(item.title)}" data-year="${item.year || ''}" onerror="window.handleImgError(this)">
                                <div class="mini-card-gradient"></div>
                                <div class="mini-card-info">
                                    <span class="tag">${typeLabel}</span>
                                    <h4 class="title">${item.title}</h4>
                                    <span class="genre">${item.match || '97% Match'} • ${item.year}</span>
                                </div>
                            `;

                            this.attachCardInteractions(card, item);
                            filteredGrid.appendChild(card);
                        });
                    }
                };

                // Render local matches or modern searching spinner immediately (NO PREMATURE 'NOT FOUND')
                renderResults(localMatches, localMatches.length === 0);
                filteredSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

                // Direct Client-Side Multi-Catalog Search (100% Standalone - No PHP Required!)
                try {
                    // Query both Movie and Series catalogs directly from public CDN APIs
                    const searchPromises = [
                        fetch(`https://v3-cinemeta.strem.io/catalog/movie/top/search=${encodeURIComponent(q)}.json`),
                        fetch(`https://v3-cinemeta.strem.io/catalog/series/top/search=${encodeURIComponent(q)}.json`)
                    ];

                    const responses = await Promise.allSettled(searchPromises);
                    let crawledMetas = [];

                    for (const resp of responses) {
                        if (resp.status === 'fulfilled' && resp.value && resp.value.ok) {
                            try {
                                const data = await resp.value.json();
                                if (data && data.metas && Array.isArray(data.metas)) {
                                    crawledMetas.push(...data.metas);
                                }
                            } catch (err) {}
                        }
                    }

                    if (crawledMetas.length > 0) {
                        const remoteMatches = crawledMetas.map(m => ({
                            id: m.id,
                            title: m.name,
                            type: m.type || 'movie',
                            year: String(m.year || m.releaseInfo || '2024'),
                            country: m.country || 'USA',
                            matchScore: Math.floor(92 + Math.random() * 7),
                            match: `${Math.floor(93 + Math.random() * 6)}% Match`,
                            duration: m.runtime || (m.type === 'series' ? 'TV Series' : '2h'),
                            age: '16+',
                            genres: Array.isArray(m.genres) ? m.genres.join(', ') : (m.genres || 'Drama, Action'),
                            poster: m.poster || `https://images.metahub.space/poster/medium/${m.id}/img`,
                            background: m.background || `https://images.metahub.space/background/medium/${m.id}/img`,
                            overview: m.description || `Watch ${m.name} now with ultra-fast multi-server streaming.`
                        }));

                        // If user hasn't typed something else meanwhile
                        if (sidebarInput.value.trim().toLowerCase() === q) {
                            const combined = this.deduplicateTitles([...localMatches, ...remoteMatches]);
                            this.allTitles = this.deduplicateTitles([...this.allTitles, ...remoteMatches]);
                            renderResults(combined, false);
                        }
                    } else if (localMatches.length === 0 && sidebarInput.value.trim().toLowerCase() === q) {
                        // Truly no results after crawler finished
                        renderResults([], false);
                    }
                } catch (e) {
                    if (localMatches.length === 0 && sidebarInput.value.trim().toLowerCase() === q) {
                        renderResults([], false);
                    }
                }
            };

            sidebarInput.oninput = () => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(performSearch, 250);
            };

            sidebarInput.onkeydown = (e) => {
                if (e.key === 'Enter') {
                    clearTimeout(debounceTimer);
                    performSearch();
                    if (window.innerWidth <= 768 && typeof this.closeMobileDrawer === 'function') {
                        this.closeMobileDrawer();
                    }
                } else if (e.key === 'Escape') {
                    sidebarInput.value = '';
                    performSearch();
                }
            };
        }
    }

    filterByType(type) {
        const filteredSection = document.getElementById('filtered-view-section');
        const filteredGrid = document.getElementById('filtered-grid');
        const filteredTitle = document.getElementById('filtered-view-title');
        const filteredCount = document.getElementById('filtered-count');
        const regularSections = document.querySelectorAll('.spatial-section:not(#filtered-view-section)');

        regularSections.forEach(sec => sec.classList.add('hidden'));
        if (filteredSection) filteredSection.classList.remove('hidden');

        const matches = this.allTitles.filter(item => item.type === type);
        if (filteredTitle) filteredTitle.textContent = type === 'movie' ? '🎬 Feature Movies' : '📺 TV Shows & Binge Series';
        if (filteredCount) filteredCount.textContent = `Showing ${matches.length} titles`;

        if (filteredGrid) {
            filteredGrid.innerHTML = '';
            matches.forEach(item => {
                const card = document.createElement('div');
                card.className = 'vision-mini-card';
                card.tabIndex = 0;
                card.style.flex = 'unset';
                card.style.width = '100%';
                card.style.minWidth = '0';
                card.style.height = '270px';
                const posterSrc = getBestPosterUrl(item);
                const typeLabel = item.type === 'series' ? 'SERIES' : 'FILM';

                card.innerHTML = `
                    <img class="mini-poster" src="${posterSrc}" alt="${item.title}" loading="lazy" referrerpolicy="no-referrer"
                         data-id="${item.id}" data-title="${encodeURIComponent(item.title)}" data-year="${item.year || ''}" onerror="window.handleImgError(this)">
                    <div class="mini-card-gradient"></div>
                    <div class="mini-card-info">
                        <span class="tag">${typeLabel}</span>
                        <h4 class="title">${item.title}</h4>
                        <span class="genre">${item.match || '97% Match'} • ${item.year}</span>
                    </div>
                `;

                this.attachCardInteractions(card, item);
                filteredGrid.appendChild(card);
            });
        }
        filteredSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    filterRecentlyAdded() {
        const filteredSection = document.getElementById('filtered-view-section');
        const filteredGrid = document.getElementById('filtered-grid');
        const filteredTitle = document.getElementById('filtered-view-title');
        const filteredCount = document.getElementById('filtered-count');
        const loadMoreBtn = document.getElementById('load-more-btn');
        const regularSections = document.querySelectorAll('.spatial-section:not(#filtered-view-section)');

        regularSections.forEach(sec => sec.classList.add('hidden'));
        if (filteredSection) filteredSection.classList.remove('hidden');

        // Curated & sorted by latest years (2024, 2023)
        const recentTitles = [...this.allTitles].sort((a, b) => {
            const yearA = parseInt(a.year || '2000', 10);
            const yearB = parseInt(b.year || '2000', 10);
            if (yearB !== yearA) return yearB - yearA;
            return (b.matchScore || 90) - (a.matchScore || 90);
        });

        if (filteredTitle) filteredTitle.textContent = '✨ Recently Added • Latest 2024 - 2025 Blockbusters';
        if (filteredCount) filteredCount.textContent = `Showing ${Math.min(30, recentTitles.length)} of ${recentTitles.length} latest releases`;

        if (loadMoreBtn) loadMoreBtn.style.display = recentTitles.length > 30 ? 'inline-flex' : 'none';

        if (filteredGrid) {
            filteredGrid.innerHTML = '';
            recentTitles.slice(0, 30).forEach(item => {
                const card = document.createElement('div');
                card.className = 'vision-mini-card';
                card.tabIndex = 0;
                card.style.flex = 'unset';
                card.style.width = '100%';
                card.style.minWidth = '0';
                card.style.height = '270px';
                const posterSrc = getBestPosterUrl(item);
                const typeLabel = item.type === 'series' ? 'SERIES' : 'NEW RELEASE';

                card.innerHTML = `
                    <img class="mini-poster" src="${posterSrc}" alt="${item.title}" loading="lazy" referrerpolicy="no-referrer"
                         data-id="${item.id}" data-title="${encodeURIComponent(item.title)}" data-year="${item.year || ''}" onerror="window.handleImgError(this)">
                    <div class="mini-card-gradient"></div>
                    <div class="mini-card-info">
                        <span class="tag" style="color:var(--accent-green);font-weight:800;">${typeLabel}</span>
                        <h4 class="title">${item.title}</h4>
                        <span class="genre">${item.year} • ${item.match || '98% Match'}</span>
                    </div>
                `;

                this.attachCardInteractions(card, item);
                filteredGrid.appendChild(card);
            });
        }

        filteredSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    setupInfoModal() {
        const closeBtn = document.getElementById('dialog-close-btn');
        const modal = document.getElementById('info-modal');
        if (closeBtn && modal) {
            closeBtn.onclick = () => modal.classList.add('hidden');
        }
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
                modal.classList.add('hidden');
            }
        });
    }

    toggleWatchlist(media) {
        try {
            let list = JSON.parse(localStorage.getItem(this.watchlistKey) || '[]');
            const idx = list.findIndex(m => m.id === media.id);
            const text = document.getElementById('dialog-watchlist-text');
            if (idx >= 0) {
                list.splice(idx, 1);
                if (text) text.textContent = '+ My List';
            } else {
                list.push(media);
                if (text) text.textContent = '✓ In My List';
            }
            localStorage.setItem(this.watchlistKey, JSON.stringify(list));
        } catch (e) {}
    }

    openWatchlistModal() {
        try {
            const list = JSON.parse(localStorage.getItem(this.watchlistKey) || '[]');
            const overlay = document.getElementById('search-overlay');
            const resultsGrid = document.getElementById('search-results-grid');
            if (overlay && resultsGrid) {
                overlay.classList.remove('hidden');
                const input = document.getElementById('search-input-field');
                if (input) input.placeholder = `My List (${list.length} titles)`;
                this.renderStandardRail(list.length > 0 ? list : this.allTitles.slice(0, 10), resultsGrid);
            }
        } catch (e) {}
    }
}

// Instantiate DevFlix App
document.addEventListener('DOMContentLoaded', () => {
    window.netflixApp = new NetflixApp();
});
