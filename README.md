# 🎬 CineStream TV - Watch Any Movie or TV Series by IMDb ID

A sleek, responsive, and modern TV & Movie web application that allows you to browse, search, and stream **any movie or TV show using its IMDb ID** (e.g. `tt1375666`, `tt0816692`, `tt0944947`).

---

## ✨ Features

- **Direct Play by IMDb ID**: Enter or paste any IMDb ID (`tt...`) to instantly resolve metadata and stream.
- **Deep Linking Support**: Play directly via URL parameters:
  - Movie: `http://localhost/tv/?play=tt1375666` or `http://localhost/tv/?id=tt0816692`
  - TV Series: `http://localhost/tv/?play=tt0944947&type=series&season=1&episode=1`
- **8 Fast Streaming Server Providers**: Switch between 8 high-speed embed providers (VidSrc Pro, VidLink Ultra, AutoEmbed, MultiEmbed, VidSrc In, SmashyStream, VidSrc VIP, 2Embed) in case of buffering or downtime.
- **TV Series Episode Navigator**: Interactive Season & Episode selector with Next / Previous episode controls.
- **Instant Metadata Engine**: Automatically pulls posters, backdrops, ratings, synopsis, and episode lists using Cinemeta & IMDb with zero setup or API keys required.
- **Live Search & Filtering**: Real-time debounce search for movie titles, genres (Action, Sci-Fi, Drama, Horror, Comedy, etc.), and IMDb IDs.
- **Watchlist & History**:
  - **Continue Watching** section that remembers what you watched, which server, and TV episode progress.
  - **My List** bookmarks saved locally in the browser (`localStorage`).
- **Cinema UI**: Dark cinematic interface inspired by Apple TV and Netflix, optimized for Mobile, Desktop, and Smart TV browsers.

---

## 🚀 How to Run

### Method 1: Using XAMPP (Apache)
1. Ensure this folder is placed in `C:\xampp\htdocs\tv`.
2. Open the **XAMPP Control Panel** and click **Start** next to **Apache**.
3. Open your browser and navigate to:
   ```
   http://localhost/tv/
   ```

### Method 2: Using PHP Built-in Server
Open PowerShell in `c:\xampp\htdocs\tv` and run:
```powershell
php -S localhost:8000
```
Then visit: `http://localhost:8000/`

### Method 3: Direct Browser File
You can also directly open `c:\xampp\htdocs\tv\index.html` in Chrome, Edge, or Firefox.

---

## 🍿 Example IMDb IDs to Test

| Title | Type | IMDb ID | Quick Link |
|---|---|---|---|
| Inception | Movie | `tt1375666` | [Play Inception](http://localhost/tv/?play=tt1375666) |
| Interstellar | Movie | `tt0816692` | [Play Interstellar](http://localhost/tv/?play=tt0816692) |
| The Dark Knight | Movie | `tt0468569` | [Play The Dark Knight](http://localhost/tv/?play=tt0468569) |
| Dune: Part Two | Movie | `tt15239678` | [Play Dune 2](http://localhost/tv/?play=tt15239678) |
| Oppenheimer | Movie | `tt15398776` | [Play Oppenheimer](http://localhost/tv/?play=tt15398776) |
| Game of Thrones | TV Series | `tt0944947` | [Play GoT S1E1](http://localhost/tv/?play=tt0944947&type=series&season=1&episode=1) |
| Breaking Bad | TV Series | `tt0903747` | [Play Breaking Bad S1E1](http://localhost/tv/?play=tt0903747&type=series&season=1&episode=1) |
| Stranger Things | TV Series | `tt4574334` | [Play Stranger Things S1E1](http://localhost/tv/?play=tt4574334&type=series&season=1&episode=1) |

---

## 📂 Project Structure

```
c:\xampp\htdocs\tv\
├── index.html        # Main Cinema TV application
├── index.php         # PHP server-side router
├── api/
│   └── proxy.php     # Optional lightweight CORS proxy for metadata
├── css/
│   └── style.css     # Responsive Cinema dark UI & player styles
├── js/
│   ├── servers.js    # 8 embed streaming providers configuration
│   ├── player.js     # Video player controller & TV episode navigator
│   └── app.js        # Catalogs, metadata fetcher, search, watchlist
└── README.md         # Documentation & guide
```
