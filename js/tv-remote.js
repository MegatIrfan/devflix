/**
 * DevFlix Android TV & Remote Controller Engine
 * Features:
 * 1. Virtual Mouse Tracker / Air Mouse Pointer (smooth 60fps D-Pad cursor navigation)
 * 2. Spatial Navigation (D-Pad) with Netflix-Style Slide-Out Drawer Sidebar
 * 3. 10-Foot Leanback UI with zero double-border artifacts
 */

class TVRemoteController {
    constructor() {
        this.isTVMode = false;
        this.isSidebarOpen = false;
        this.isMouseMode = true; // Default to Virtual Mouse Tracker per user request!
        this.currentFocusedElement = null;
        this.lastMainContentFocused = null;
        this.remoteBarTimeout = null;

        // Virtual Mouse Physics & State
        this.mouseX = window.innerWidth / 2;
        this.mouseY = window.innerHeight / 2;
        this.mouseVelX = 0;
        this.mouseVelY = 0;
        this.mouseKeys = { up: false, down: false, left: false, right: false };
        this.lastHoveredElement = null;
        this.cursorEl = null;
        this.isMouseDown = false;
        this.moveHoldDuration = 0;

        // Key Codes for Android TV, Tizen, WebOS, FireTV, and Keyboard
        this.KEYS = {
            UP: [19, 38],                 // DPAD_UP / ArrowUp
            DOWN: [20, 40],               // DPAD_DOWN / ArrowDown
            LEFT: [21, 37],               // DPAD_LEFT / ArrowLeft
            RIGHT: [22, 39],              // DPAD_RIGHT / ArrowRight
            ENTER: [13, 23, 66],          // DPAD_CENTER / Enter
            BACK: [4, 8, 27, 10009],      // DPAD_BACK / Escape / Backspace / Tizen Return
            PLAY_PAUSE: [179],            // MediaPlayPause
            REWIND: [227],                // MediaRewind
            FAST_FWD: [228],              // MediaFastForward
            TOGGLE_MOUSE: [77]            // 'M' key shortcut
        };

        this.init();
    }

    init() {
        // Detect TV device or saved preference
        this.detectTVEnvironment();
        this.initVirtualCursor();
        
        // Remove old OSD bar if it exists
        const oldOsd = document.getElementById('tv-remote-osd');
        if (oldOsd) oldOsd.remove();

        this.bindKeyListeners();
        this.bindFocusListeners();
        
        // Listen to native PC mouse movement so real PC mouse is never hidden or blocked
        window.addEventListener('mousemove', () => {
            if (this.cursorEl && !this.isTVMode) {
                this.cursorEl.style.display = 'none';
            }
        });
        
        // Mode toggle buttons
        const tvModeBtn = document.getElementById('tv-mode-toggle-btn');
        if (tvModeBtn) {
            tvModeBtn.onclick = () => this.toggleTVMode();
            if (this.isTVMode) {
                tvModeBtn.classList.add('active');
                tvModeBtn.innerHTML = '📺 TV Mode: ON';
            }
        }

        const mouseModeBtn = document.getElementById('tv-mouse-toggle-btn');
        if (mouseModeBtn) {
            mouseModeBtn.onclick = () => this.toggleMouseMode();
            this.updateMouseBtnUI();
        }

        // Start 60fps mouse tracker loop
        this.startMouseLoop();

        // Initial setup
        setTimeout(() => {
            if (!this.isMouseMode) {
                this.ensureInitialFocus();
            }
        }, 800);
    }

    detectTVEnvironment() {
        const ua = navigator.userAgent.toLowerCase();
        const isTV = ua.includes('android tv') || 
                     ua.includes('googletv') || 
                     ua.includes('smarttv') || 
                     ua.includes('smart-tv') || 
                     ua.includes('tizen') || 
                     ua.includes('webos') || 
                     ua.includes('hbbtv') || 
                     ua.includes('crkey') || 
                     ua.includes('aftt') || 
                     ua.includes('aftm') ||
                     ua.includes('aftb');

        const savedMode = localStorage.getItem('devflix_tv_mode');
        if (savedMode === 'true' || (savedMode === null && isTV)) {
            this.setTVMode(true);
        }

        const savedMouseMode = localStorage.getItem('devflix_tv_mouse_mode');
        if (savedMouseMode !== null) {
            this.isMouseMode = (savedMouseMode === 'true');
        } else {
            this.isMouseMode = false; // Keep default off on PC so real PC mouse is untouched
        }

        if (this.isMouseMode && this.cursorEl) {
            this.cursorEl.style.display = 'block';
        }
    }

    setTVMode(enabled) {
        this.isTVMode = enabled;
        localStorage.setItem('devflix_tv_mode', enabled ? 'true' : 'false');
        
        if (enabled) {
            document.body.classList.add('tv-mode');
            this.showOSDNotice('📺 Android TV Mode: Active');
        } else {
            document.body.classList.remove('tv-mode');
            document.body.classList.remove('sidebar-expanded');
            this.showOSDNotice('🖥️ Desktop Mode: Active');
        }

        const toggleBtn = document.getElementById('tv-mode-toggle-btn');
        if (toggleBtn) {
            toggleBtn.classList.toggle('active', enabled);
            toggleBtn.innerHTML = enabled ? '📺 TV Mode: ON' : '📺 TV Mode';
        }
    }

    toggleTVMode() {
        this.setTVMode(!this.isTVMode);
    }

    setMouseMode(enabled) {
        this.isMouseMode = enabled;
        localStorage.setItem('devflix_tv_mouse_mode', enabled ? 'true' : 'false');

        if (enabled) {
            document.body.classList.add('tv-mouse-mode');
            this.showOSDNotice('🖱️ Virtual Mouse Tracker: Active');
            if (this.cursorEl) {
                this.cursorEl.style.display = 'block';
            }
        } else {
            document.body.classList.remove('tv-mouse-mode');
            this.showOSDNotice('🎮 D-Pad Focus Navigation: Active');
            if (this.cursorEl) {
                this.cursorEl.style.display = 'none';
            }
            this.ensureInitialFocus();
        }

        this.updateMouseBtnUI();
    }

    toggleMouseMode() {
        this.setMouseMode(!this.isMouseMode);
    }

    updateMouseBtnUI() {
        const mouseModeBtn = document.getElementById('tv-mouse-toggle-btn');
        if (mouseModeBtn) {
            mouseModeBtn.classList.toggle('active', this.isMouseMode);
            mouseModeBtn.innerHTML = this.isMouseMode ? '🖱️ Mouse Mode: ON' : '🎮 D-Pad Mode';
        }

        const osdLabel = document.getElementById('tv-osd-mouse-label');
        if (osdLabel) {
            osdLabel.textContent = this.isMouseMode ? 'Mouse: ON' : 'D-Pad: ON';
        }
    }

    /* ==========================================================
       VIRTUAL MOUSE TRACKER ENGINE (SMOOTH 60FPS AIR MOUSE)
       ========================================================== */
    initVirtualCursor() {
        let cursor = document.getElementById('tv-virtual-cursor');
        if (!cursor) {
            cursor = document.createElement('div');
            cursor.id = 'tv-virtual-cursor';
            cursor.className = 'tv-virtual-cursor';
            cursor.innerHTML = `
                <div class="cursor-pointer">
                    <svg viewBox="0 0 24 24" width="28" height="28" fill="none">
                        <path d="M4 4L11 20L14 13L21 10L4 4Z" fill="#e50914" stroke="#ffffff" stroke-width="1.8" stroke-linejoin="round"/>
                    </svg>
                </div>
                <div class="cursor-ripple"></div>
            `;
            document.body.appendChild(cursor);
        }
        this.cursorEl = cursor;
        this.updateCursorPosition();
    }

    updateCursorPosition() {
        if (!this.cursorEl) return;
        this.cursorEl.style.left = `${this.mouseX}px`;
        this.cursorEl.style.top = `${this.mouseY}px`;
    }

    startMouseLoop() {
        const tick = () => {
            if (this.isMouseMode) {
                this.handleMousePhysics();
            }
            requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }

    handleMousePhysics() {
        const anyKeyPressed = this.mouseKeys.up || this.mouseKeys.down || this.mouseKeys.left || this.mouseKeys.right;

        if (anyKeyPressed) {
            this.moveHoldDuration += 1;
        } else {
            this.moveHoldDuration = 0;
        }

        // Speed ramp: starts at 10px and accelerates smoothly up to 26px per frame
        const currentSpeed = Math.min(10 + (this.moveHoldDuration * 0.45), 26);

        // Direction calculation
        let targetVx = 0;
        let targetVy = 0;

        if (this.mouseKeys.left) targetVx -= currentSpeed;
        if (this.mouseKeys.right) targetVx += currentSpeed;
        if (this.mouseKeys.up) targetVy -= currentSpeed;
        if (this.mouseKeys.down) targetVy += currentSpeed;

        // Smooth momentum interpolation
        this.mouseVelX += (targetVx - this.mouseVelX) * 0.4;
        this.mouseVelY += (targetVy - this.mouseVelY) * 0.4;

        if (Math.abs(this.mouseVelX) > 0.05 || Math.abs(this.mouseVelY) > 0.05) {
            this.mouseX += this.mouseVelX;
            this.mouseY += this.mouseVelY;

            // Bounds constrain to visible window
            this.mouseX = Math.max(12, Math.min(window.innerWidth - 12, this.mouseX));
            this.mouseY = Math.max(12, Math.min(window.innerHeight - 12, this.mouseY));

            this.updateCursorPosition();
            this.handleMouseHover();
            this.handleEdgeAutoScroll();
        }
    }

    handleMouseHover() {
        const hovered = document.elementFromPoint(this.mouseX, this.mouseY);
        if (!hovered) return;

        // Check if cursor is over a movie card
        const card = hovered.closest('.vision-card-portrait, .vision-mini-card, .recommended-card');
        if (card !== this.lastHoveredElement) {
            if (this.lastHoveredElement && this.lastHoveredElement.onmouseleave) {
                this.lastHoveredElement.onmouseleave();
            }
            this.lastHoveredElement = card;
            if (card && card.onmouseenter) {
                card.onmouseenter();
            }
        }

        // Check if hovering clickable interactive element
        const isClickable = hovered.closest('button, a, input, select, .nav-pill, .glass-pill, .atoz-letter-pill, .vision-card-portrait, .vision-mini-card, .recommended-card');
        if (this.cursorEl) {
            this.cursorEl.classList.toggle('cursor-hovering', !!isClickable);
        }

        // Expand sidebar when mouse hovers over left sidebar
        const isOverSidebar = !!hovered.closest('.vision-sidebar');
        if (isOverSidebar && !this.isSidebarOpen) {
            this.openSidebar();
        } else if (!isOverSidebar && this.isSidebarOpen && !document.activeElement.closest('.vision-sidebar')) {
            this.closeSidebar();
        }
    }

    handleEdgeAutoScroll() {
        const edgeThreshold = 75;
        const mainContent = document.getElementById('vision-main-content') || window;

        // Vertical page scroll when cursor touches top/bottom edges
        if (this.mouseY < edgeThreshold) {
            window.scrollBy({ top: -16, behavior: 'auto' });
        } else if (this.mouseY > window.innerHeight - edgeThreshold) {
            window.scrollBy({ top: 16, behavior: 'auto' });
        }

        // Horizontal rail scroll when cursor touches left/right edge of horizontal row
        const hovered = document.elementFromPoint(this.mouseX, this.mouseY);
        const rail = hovered ? hovered.closest('.spatial-card-row') : null;
        if (rail) {
            const rect = rail.getBoundingClientRect();
            if (this.mouseX > rect.right - 100) {
                rail.scrollBy({ left: 24, behavior: 'auto' });
            } else if (this.mouseX < rect.left + 100) {
                rail.scrollBy({ left: -24, behavior: 'auto' });
            }
        }
    }

    simulateVirtualClick() {
        if (!this.cursorEl) return;
        
        // Trigger ripple click effect
        this.cursorEl.classList.remove('clicking');
        void this.cursorEl.offsetWidth; // Force reflow
        this.cursorEl.classList.add('clicking');

        const target = document.elementFromPoint(this.mouseX, this.mouseY);
        if (!target) return;

        // If target is an input field, focus it directly
        if (target.tagName === 'INPUT' || target.closest('input')) {
            const input = target.tagName === 'INPUT' ? target : target.closest('input');
            input.focus();
            return;
        }

        // Trigger native click on element
        target.click();

        // If clicking on a sidebar navigation pill, automatically close sidebar
        if (target.closest('.sidebar-nav .nav-pill')) {
            setTimeout(() => {
                this.closeSidebar();
            }, 150);
        }
    }

    /* ==========================================================
       SIDEBAR & SPATIAL D-PAD NAVIGATION HELPERS
       ========================================================== */
    openSidebar() {
        this.isSidebarOpen = true;
        document.body.classList.add('sidebar-expanded');
    }

    closeSidebar() {
        this.isSidebarOpen = false;
        document.body.classList.remove('sidebar-expanded');
    }

    enterSidebar() {
        this.openSidebar();
        const activeNav = document.querySelector('.sidebar-nav .nav-pill.active') || 
                          document.getElementById('nav-home') || 
                          document.querySelector('.sidebar-nav .nav-pill');
        if (activeNav) {
            this.focusElement(activeNav);
        }
    }

    returnToMainContent() {
        this.closeSidebar();

        if (this.lastMainContentFocused && 
            this.isElementVisible(this.lastMainContentFocused) && 
            !this.lastMainContentFocused.closest('.vision-sidebar')) {
            this.focusElement(this.lastMainContentFocused);
            return;
        }

        const focusables = this.getFocusableElements().filter(el => !el.closest('.vision-sidebar'));
        if (focusables.length === 0) return;

        const inViewport = focusables.filter(el => {
            const r = el.getBoundingClientRect();
            return r.top >= 0 && r.bottom <= window.innerHeight + 100;
        });

        const pool = inViewport.length > 0 ? inViewport : focusables;

        const priorities = [
            document.getElementById('hero-play-button'),
            document.querySelector('.latest-expand-card'),
            document.querySelector('.vision-mini-card'),
            document.getElementById('quick-search-input'),
            document.querySelector('.glass-pill.active')
        ];

        for (const p of priorities) {
            if (p && pool.includes(p) && this.isElementVisible(p)) {
                this.focusElement(p);
                return;
            }
        }

        this.focusElement(pool[0]);
    }

    createTVRemoteOSD() {
        const osd = document.getElementById('tv-remote-osd');
        if (osd) osd.remove();
    }

    showOSDNotice(message) {
        let notice = document.getElementById('tv-osd-notice');
        if (!notice) {
            notice = document.createElement('div');
            notice.id = 'tv-osd-notice';
            notice.className = 'tv-osd-notice';
            document.body.appendChild(notice);
        }

        notice.textContent = message;
        notice.classList.add('visible');

        clearTimeout(this.remoteBarTimeout);
        this.remoteBarTimeout = setTimeout(() => {
            notice.classList.remove('visible');
        }, 3000);
    }

    ensureInitialFocus() {
        if (document.activeElement && document.activeElement !== document.body) return;
        
        const candidates = [
            document.getElementById('hero-play-button'),
            document.querySelector('.latest-expand-card'),
            document.querySelector('.vision-mini-card'),
            document.getElementById('quick-search-input'),
            document.getElementById('nav-home')
        ];

        for (const el of candidates) {
            if (el && this.isElementVisible(el)) {
                this.focusElement(el);
                break;
            }
        }
    }

    bindKeyListeners() {
        window.addEventListener('keydown', (e) => {
            const keyCode = e.keyCode || e.which;
            const key = e.key;

            // Shortcut 'M' toggles Mouse Mode vs D-Pad Mode
            if (this.KEYS.TOGGLE_MOUSE.includes(keyCode) && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
                this.toggleMouseMode();
                return;
            }

            // BACK BUTTON (Remote Back, Escape, Backspace)
            if (this.KEYS.BACK.includes(keyCode) || key === 'Escape' || key === 'Backspace') {
                if (this.handleBackKey(e)) {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                }
            }

            // ==========================================
            // MOUSE TRACKER MODE KEYDOWN HANDLER
            // ==========================================
            if (this.isMouseMode) {
                if (this.KEYS.UP.includes(keyCode) || key === 'ArrowUp') {
                    this.mouseKeys.up = true;
                    e.preventDefault();
                    return;
                }
                if (this.KEYS.DOWN.includes(keyCode) || key === 'ArrowDown') {
                    this.mouseKeys.down = true;
                    e.preventDefault();
                    return;
                }
                if (this.KEYS.LEFT.includes(keyCode) || key === 'ArrowLeft') {
                    this.mouseKeys.left = true;
                    e.preventDefault();
                    return;
                }
                if (this.KEYS.RIGHT.includes(keyCode) || key === 'ArrowRight') {
                    this.mouseKeys.right = true;
                    e.preventDefault();
                    return;
                }

                if (this.KEYS.ENTER.includes(keyCode) || key === 'Enter') {
                    e.preventDefault();
                    this.simulateVirtualClick();
                    return;
                }
            }

            // ==========================================
            // D-PAD FOCUS MODE KEYDOWN HANDLER
            // ==========================================
            if (!this.isMouseMode) {
                if (this.KEYS.ENTER.includes(keyCode) || key === 'Enter') {
                    if (this.handleEnterKey(e)) {
                        return;
                    }
                }

                let direction = null;
                if (this.KEYS.UP.includes(keyCode) || key === 'ArrowUp') direction = 'up';
                else if (this.KEYS.DOWN.includes(keyCode) || key === 'ArrowDown') direction = 'down';
                else if (this.KEYS.LEFT.includes(keyCode) || key === 'ArrowLeft') direction = 'left';
                else if (this.KEYS.RIGHT.includes(keyCode) || key === 'ArrowRight') direction = 'right';

                if (direction) {
                    if (document.activeElement && document.activeElement.tagName === 'INPUT') {
                        const input = document.activeElement;
                        if (direction === 'up' || direction === 'down') {
                            e.preventDefault();
                            this.navigateSpatial(direction);
                            return;
                        }
                        if (direction === 'left' && input.selectionStart === 0 && input.selectionEnd === 0) {
                            e.preventDefault();
                            this.enterSidebar();
                            return;
                        }
                        if (direction === 'right' && input.selectionStart === input.value.length) {
                            const clearBtn = document.getElementById('quick-search-clear');
                            if (clearBtn && !clearBtn.classList.contains('hidden')) {
                                e.preventDefault();
                                this.focusElement(clearBtn);
                                return;
                            }
                        }
                        // Allow cursor navigation inside text input
                        return;
                    }

                    e.preventDefault();
                    this.navigateSpatial(direction);
                }
            }
        }, { passive: false });

        window.addEventListener('keyup', (e) => {
            const keyCode = e.keyCode || e.which;
            const key = e.key;

            if (this.isMouseMode) {
                if (this.KEYS.UP.includes(keyCode) || key === 'ArrowUp') this.mouseKeys.up = false;
                if (this.KEYS.DOWN.includes(keyCode) || key === 'ArrowDown') this.mouseKeys.down = false;
                if (this.KEYS.LEFT.includes(keyCode) || key === 'ArrowLeft') this.mouseKeys.left = false;
                if (this.KEYS.RIGHT.includes(keyCode) || key === 'ArrowRight') this.mouseKeys.right = false;
            }
        });
    }

    bindFocusListeners() {
        document.addEventListener('focusin', (e) => {
            if (this.currentFocusedElement && this.currentFocusedElement !== e.target) {
                this.currentFocusedElement.classList.remove('tv-focused');
            }
            this.currentFocusedElement = e.target;
            if (e.target && e.target.classList && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
                e.target.classList.add('tv-focused');
            }

            if (e.target && e.target.closest && e.target.closest('.vision-sidebar')) {
                this.openSidebar();
            } else if (e.target && !e.target.closest('.vision-sidebar')) {
                this.closeSidebar();
            }
        });
    }

    handleBackKey(e) {
        // 1. TV Player is open -> Close player and return to center
        const playerView = document.getElementById('tv-player');
        if (playerView && !playerView.classList.contains('hidden')) {
            if (window.netflixPlayer) {
                window.netflixPlayer.close();
                this.returnToMainContent();
                return true;
            }
        }

        // 2. Info Modal is open -> Close modal and return to center
        const infoModal = document.getElementById('info-modal');
        if (infoModal && !infoModal.classList.contains('hidden')) {
            infoModal.classList.add('hidden');
            this.returnToMainContent();
            return true;
        }

        // 3. Search input is focused -> Blur search and return to center
        const searchInput = document.getElementById('quick-search-input');
        if (document.activeElement === searchInput) {
            searchInput.blur();
            this.returnToMainContent();
            return true;
        }

        // 4. In Sidebar -> Close sidebar and return to main content!
        if (document.activeElement && document.activeElement.closest('.vision-sidebar')) {
            this.returnToMainContent();
            return true;
        }

        // 5. In Mouse mode -> Center virtual cursor on screen
        if (this.isMouseMode) {
            this.mouseX = window.innerWidth / 2;
            this.mouseY = window.innerHeight / 2;
            this.updateCursorPosition();
            this.handleMouseHover();
            return true;
        }

        // 6. If already in main content in D-pad mode -> Jump into sidebar!
        this.enterSidebar();
        return true;
    }

    handleEnterKey(e) {
        const cur = document.activeElement;
        if (!cur || cur === document.body) {
            this.ensureInitialFocus();
            return true;
        }

        if (cur.tagName === 'SELECT' || cur.tagName === 'INPUT') {
            return false;
        }

        if (cur.closest('.sidebar-nav') && cur.classList.contains('nav-pill')) {
            cur.click();
            setTimeout(() => {
                this.returnToMainContent();
            }, 120);
            return true;
        }

        cur.click();
        return true;
    }

    getFocusableElements() {
        const playerView = document.getElementById('tv-player');
        if (playerView && !playerView.classList.contains('hidden')) {
            const selector = '.player-back-btn, #player-season-select, #player-episode-select, #player-next-ep-btn, #player-server-select, #player-next-server-btn, #player-fullscreen-btn';
            return Array.from(playerView.querySelectorAll(selector)).filter(el => this.isElementVisible(el));
        }

        const infoModal = document.getElementById('info-modal');
        if (infoModal && !infoModal.classList.contains('hidden')) {
            const selector = '#dialog-close-btn, #dialog-play-btn, #dialog-watchlist-btn, .dialog-recommended-card, .dialog-recommended-card button';
            return Array.from(infoModal.querySelectorAll(selector)).filter(el => this.isElementVisible(el));
        }

        const selectors = [
            '.sidebar-brand-logo',
            '.sidebar-nav .nav-pill',
            '#quick-search-input',
            '#quick-search-clear',
            '#tv-mouse-toggle-btn',
            '#tv-mode-toggle-btn',
            '.glass-pill',
            '#sort-dropdown',
            '.atoz-letter-pill',
            '#atoz-fetch-all-btn',
            '#hero-sound-btn',
            '#hero-play-button',
            '#hero-info-button',
            '.vision-card-portrait',
            '.vision-mini-card',
            '.filtered-card',
            '#load-more-btn'
        ];

        const all = Array.from(document.querySelectorAll(selectors.join(',')));
        return all.filter(el => this.isElementVisible(el));
    }

    isElementVisible(el) {
        if (!el || !el.getBoundingClientRect) return false;
        if (el.closest('.hidden')) return false;
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
    }

    navigateSpatial(direction) {
        let current = document.activeElement;
        const focusables = this.getFocusableElements();
        
        if (focusables.length === 0) return;

        if (!current || current === document.body || !focusables.includes(current)) {
            this.ensureInitialFocus();
            return;
        }

        const isCurrentlyInSidebar = !!current.closest('.vision-sidebar');

        // RULE 1: If currently in sidebar and pressing RIGHT -> ALWAYS return to main content!
        if (isCurrentlyInSidebar && direction === 'right') {
            this.returnToMainContent();
            return;
        }

        // RULE 2: If currently in sidebar and pressing UP/DOWN -> Navigate strictly inside sidebar nav items
        if (isCurrentlyInSidebar && (direction === 'up' || direction === 'down')) {
            const sidebarItems = focusables.filter(el => el.closest('.vision-sidebar'));
            const idx = sidebarItems.indexOf(current);
            if (direction === 'down' && idx >= 0 && idx < sidebarItems.length - 1) {
                this.focusElement(sidebarItems[idx + 1]);
                return;
            }
            if (direction === 'up' && idx > 0) {
                this.focusElement(sidebarItems[idx - 1]);
                return;
            }
            return;
        }

        // RULE 3: If in a horizontal movie card row
        const currentRow = current.closest('.spatial-card-row');
        if (currentRow) {
            const rowCards = Array.from(currentRow.querySelectorAll('.vision-card-portrait, .vision-mini-card')).filter(el => this.isElementVisible(el));
            const cardIdx = rowCards.indexOf(current);

            // 3A. Left / Right navigation inside current row
            if (direction === 'right' && cardIdx >= 0 && cardIdx < rowCards.length - 1) {
                this.focusElement(rowCards[cardIdx + 1]);
                return;
            }
            if (direction === 'left' && cardIdx > 0) {
                this.focusElement(rowCards[cardIdx - 1]);
                return;
            }
            if (direction === 'left' && cardIdx === 0) {
                this.enterSidebar();
                return;
            }

            // 3B. Deterministic UP navigation between sections
            if (direction === 'up') {
                const currentSection = current.closest('.spatial-section');
                const allSections = Array.from(document.querySelectorAll('.spatial-section:not(.hidden)'));
                const secIdx = allSections.indexOf(currentSection);

                if (secIdx > 0) {
                    const prevSection = allSections[secIdx - 1];
                    const prevCards = Array.from(prevSection.querySelectorAll('.vision-card-portrait, .vision-mini-card, .hero-btn-play, .latest-expand-card')).filter(el => this.isElementVisible(el));
                    if (prevCards.length > 0) {
                        const curRect = current.getBoundingClientRect();
                        const curX = curRect.left + curRect.width / 2;
                        let bestCard = prevCards[0];
                        let minDx = Infinity;
                        for (const c of prevCards) {
                            const cr = c.getBoundingClientRect();
                            const cx = cr.left + cr.width / 2;
                            const dx = Math.abs(cx - curX);
                            if (dx < minDx) {
                                minDx = dx;
                                bestCard = c;
                            }
                        }
                        this.focusElement(bestCard);
                        return;
                    }
                } else if (secIdx === 0) {
                    // Topmost section (Continue Watching / Hero): jump directly UP to A-Z bar or Search Bar!
                    const atozTarget = document.querySelector('.atoz-letter-pill.active') ||
                                       document.querySelector('.atoz-letter-pill');
                    if (atozTarget && this.isElementVisible(atozTarget)) {
                        this.focusElement(atozTarget);
                        return;
                    }
                    const searchInput = document.getElementById('quick-search-input');
                    if (searchInput && this.isElementVisible(searchInput)) {
                        this.focusElement(searchInput);
                        return;
                    }
                }
            }

            // 3C. Deterministic DOWN navigation between sections
            if (direction === 'down') {
                const currentSection = current.closest('.spatial-section');
                const allSections = Array.from(document.querySelectorAll('.spatial-section:not(.hidden)'));
                const secIdx = allSections.indexOf(currentSection);

                if (secIdx >= 0 && secIdx < allSections.length - 1) {
                    const nextSection = allSections[secIdx + 1];
                    const nextCards = Array.from(nextSection.querySelectorAll('.vision-card-portrait, .vision-mini-card, .latest-expand-card')).filter(el => this.isElementVisible(el));
                    if (nextCards.length > 0) {
                        const curRect = current.getBoundingClientRect();
                        const curX = curRect.left + curRect.width / 2;
                        let bestCard = nextCards[0];
                        let minDx = Infinity;
                        for (const c of nextCards) {
                            const cr = c.getBoundingClientRect();
                            const cx = cr.left + cr.width / 2;
                            const dx = Math.abs(cx - curX);
                            if (dx < minDx) {
                                minDx = dx;
                                bestCard = c;
                            }
                        }
                        this.focusElement(bestCard);
                        return;
                    }
                }
            }
        }

        // RULE 4: If in main content and pressing LEFT, check if there's anything else to the left in main content
        if (!isCurrentlyInSidebar && direction === 'left') {
            const curRect = current.getBoundingClientRect();
            const mainContentItems = focusables.filter(el => !el.closest('.vision-sidebar') && el !== current);
            
            const itemsToLeft = mainContentItems.filter(el => {
                const r = el.getBoundingClientRect();
                return r.right < curRect.left - 6;
            });

            if (itemsToLeft.length === 0) {
                this.enterSidebar();
                return;
            }
        }

        // RULE 5: SEARCH INPUT & CLEAR BUTTON NAVIGATION
        const isSearchInput = current.id === 'quick-search-input';
        const isSearchClear = current.id === 'quick-search-clear';
        if (isSearchInput || isSearchClear) {
            if (direction === 'up') {
                // Navigate UP to top header: prefer active glass-pill, any glass-pill, or right action buttons
                const targetHeader = document.querySelector('.country-pill-track .glass-pill.active') ||
                                     document.querySelector('.country-pill-track .glass-pill') ||
                                     document.getElementById('tv-mouse-toggle-btn') ||
                                     document.getElementById('sort-dropdown');
                if (targetHeader && this.isElementVisible(targetHeader)) {
                    this.focusElement(targetHeader);
                    return;
                }
            } else if (direction === 'down') {
                // Navigate DOWN to search results or A-Z alphabet bar
                const filteredSection = document.getElementById('filtered-view-section');
                if (filteredSection && !filteredSection.classList.contains('hidden')) {
                    const firstResultCard = filteredSection.querySelector('.vision-mini-card');
                    if (firstResultCard && this.isElementVisible(firstResultCard)) {
                        this.focusElement(firstResultCard);
                        return;
                    }
                }
                const atozTarget = document.querySelector('.atoz-letter-pill.active') ||
                                   document.querySelector('.atoz-letter-pill');
                if (atozTarget && this.isElementVisible(atozTarget)) {
                    this.focusElement(atozTarget);
                    return;
                }
                const heroPlay = document.getElementById('hero-play-button');
                if (heroPlay && this.isElementVisible(heroPlay)) {
                    this.focusElement(heroPlay);
                    return;
                }
            } else if (direction === 'left') {
                if (isSearchClear) {
                    const searchInput = document.getElementById('quick-search-input');
                    if (searchInput) {
                        this.focusElement(searchInput);
                        return;
                    }
                } else {
                    this.enterSidebar();
                    return;
                }
            } else if (direction === 'right') {
                if (isSearchInput) {
                    const clearBtn = document.getElementById('quick-search-clear');
                    if (clearBtn && !clearBtn.classList.contains('hidden')) {
                        this.focusElement(clearBtn);
                        return;
                    }
                }
            }
        }

        // RULE 6: A-Z ALPHABET DIRECTORY BAR NAVIGATION
        if (current.closest('.atoz-alphabet-bar')) {
            if (direction === 'up') {
                // Moving UP from A-Z bar -> ALWAYS go to Search Bar!
                const searchInput = document.getElementById('quick-search-input');
                if (searchInput && this.isElementVisible(searchInput)) {
                    this.focusElement(searchInput);
                    return;
                }
            } else if (direction === 'down') {
                // Moving DOWN from A-Z bar -> Go to search results or hero/first row
                const filteredSection = document.getElementById('filtered-view-section');
                if (filteredSection && !filteredSection.classList.contains('hidden')) {
                    const firstResultCard = filteredSection.querySelector('.vision-mini-card');
                    if (firstResultCard && this.isElementVisible(firstResultCard)) {
                        this.focusElement(firstResultCard);
                        return;
                    }
                }
                const heroPlay = document.getElementById('hero-play-button');
                if (heroPlay && this.isElementVisible(heroPlay)) {
                    this.focusElement(heroPlay);
                    return;
                }
                const firstCard = document.querySelector('.spatial-card-row .vision-card-portrait, .spatial-card-row .vision-mini-card');
                if (firstCard && this.isElementVisible(firstCard)) {
                    this.focusElement(firstCard);
                    return;
                }
            } else if (direction === 'left') {
                const pills = Array.from(document.querySelectorAll('.atoz-letter-pill'));
                const pIdx = pills.indexOf(current);
                if (pIdx === 0) {
                    this.enterSidebar();
                    return;
                } else if (pIdx > 0) {
                    this.focusElement(pills[pIdx - 1]);
                    return;
                }
            } else if (direction === 'right') {
                const pills = Array.from(document.querySelectorAll('.atoz-letter-pill'));
                const pIdx = pills.indexOf(current);
                if (pIdx >= 0 && pIdx < pills.length - 1) {
                    this.focusElement(pills[pIdx + 1]);
                    return;
                }
            }
        }

        // RULE 7: TOP HEADER NAVIGATION
        const isHeader = !!(current.closest('.vision-top-header') || current.closest('.country-pill-track') || current.closest('.header-right-actions'));
        if (isHeader && direction === 'down') {
            // Moving DOWN from top header -> ALWAYS go to Search Bar!
            const searchInput = document.getElementById('quick-search-input');
            if (searchInput && this.isElementVisible(searchInput)) {
                this.focusElement(searchInput);
                return;
            }
        }

        // RULE 8: FILTERED RESULTS GRID (SEARCH VIEW)
        if (current.closest('#filtered-grid')) {
            const gridCards = Array.from(document.querySelectorAll('#filtered-grid .vision-mini-card'));
            const cIdx = gridCards.indexOf(current);
            const curR = current.getBoundingClientRect();

            if (direction === 'up') {
                // Check if there is any card directly above in the grid
                const cardsAbove = gridCards.filter(c => {
                    const r = c.getBoundingClientRect();
                    return r.bottom <= curR.top + 10;
                });
                if (cardsAbove.length === 0) {
                    // Top row of search results: move UP directly to search bar!
                    const searchInput = document.getElementById('quick-search-input');
                    if (searchInput && this.isElementVisible(searchInput)) {
                        this.focusElement(searchInput);
                        return;
                    }
                }
            } else if (direction === 'left' && cIdx >= 0) {
                // Check if this card is on the leftmost column of the grid
                const cardsLeft = gridCards.filter(c => {
                    const r = c.getBoundingClientRect();
                    return r.right <= curR.left - 6 && Math.abs(r.top - curR.top) < 50;
                });
                if (cardsLeft.length === 0) {
                    this.enterSidebar();
                    return;
                }
            }
        }

        // RULE 9: HERO BILLBOARD (CONTINUE WATCHING)
        if (current.closest('.vision-hero-card') && direction === 'up') {
            const atozTarget = document.querySelector('.atoz-letter-pill.active') ||
                               document.querySelector('.atoz-letter-pill');
            if (atozTarget && this.isElementVisible(atozTarget)) {
                this.focusElement(atozTarget);
                return;
            }
            const searchInput = document.getElementById('quick-search-input');
            if (searchInput && this.isElementVisible(searchInput)) {
                this.focusElement(searchInput);
                return;
            }
        }

        // Generic 2D Spatial Distance Calculation
        const curRect = current.getBoundingClientRect();
        const curCenter = {
            x: curRect.left + curRect.width / 2,
            y: curRect.top + curRect.height / 2
        };

        let bestCandidate = null;
        let minDistance = Infinity;

        for (const candidate of focusables) {
            if (candidate === current) continue;
            if (!isCurrentlyInSidebar && candidate.closest('.vision-sidebar')) continue;

            const candRect = candidate.getBoundingClientRect();
            const candCenter = {
                x: candRect.left + candRect.width / 2,
                y: candRect.top + candRect.height / 2
            };

            const dx = candCenter.x - curCenter.x;
            const dy = candCenter.y - curCenter.y;

            let isDirectionalMatch = false;

            switch (direction) {
                case 'right':
                    isDirectionalMatch = dx > 8 && (candRect.right > curRect.right);
                    break;
                case 'left':
                    isDirectionalMatch = dx < -8 && (candRect.left < curRect.left);
                    break;
                case 'down':
                    isDirectionalMatch = dy > 8 && (candRect.bottom > curRect.bottom);
                    break;
                case 'up':
                    isDirectionalMatch = dy < -8 && (candRect.top < curRect.top);
                    break;
            }

            if (!isDirectionalMatch) continue;

            const primaryDist = (direction === 'left' || direction === 'right') ? Math.abs(dx) : Math.abs(dy);
            const secondaryDist = (direction === 'left' || direction === 'right') ? Math.abs(dy) : Math.abs(dx);
            
            const weightedDist = primaryDist + (secondaryDist * 2.2);

            if (weightedDist < minDistance) {
                minDistance = weightedDist;
                bestCandidate = candidate;
            }
        }

        if (bestCandidate) {
            this.focusElement(bestCandidate);
        }
    }

    onPlayerOpened() {
        // Save current mouse mode state before entering media player
        this.savedModeBeforePlayer = this.isMouseMode;
        
        // Auto-switch to Keypad (D-Pad) mode for TV media player
        this.setMouseMode(false);
        if (this.cursorEl) {
            this.cursorEl.style.display = 'none';
        }
        
        this.showOSDNotice('🎮 Keypad Mode: Player Controls Active');

        setTimeout(() => {
            const playerView = document.getElementById('tv-player');
            if (playerView && !playerView.classList.contains('hidden')) {
                const backBtn = playerView.querySelector('.player-back-btn');
                if (backBtn) {
                    this.focusElement(backBtn);
                }
            }
        }, 120);
    }

    onPlayerClosed() {
        // Restore previous mouse/keypad mode state
        if (typeof this.savedModeBeforePlayer === 'boolean') {
            this.setMouseMode(this.savedModeBeforePlayer);
        }
        this.savedModeBeforePlayer = null;
        this.returnToMainContent();
    }

    focusElement(el) {
        if (!el) return;
        
        if (el.tabIndex < 0) {
            el.tabIndex = 0;
        }

        const isSidebar = !!el.closest('.vision-sidebar');
        const isModalOrPlayer = !!(el.closest('#info-modal') || el.closest('#tv-player'));

        if (!isSidebar && !isModalOrPlayer) {
            this.lastMainContentFocused = el;
            this.closeSidebar();
        } else if (isSidebar) {
            this.openSidebar();
        }

        el.focus({ preventScroll: true });

        const row = el.closest('.spatial-card-row') || el.closest('.country-pill-track') || el.closest('.atoz-alphabet-bar');
        if (row) {
            el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        } else {
            el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
        }
    }
}

// Global TV Remote Controller Instance
window.addEventListener('DOMContentLoaded', () => {
    window.tvRemote = new TVRemoteController();
});
