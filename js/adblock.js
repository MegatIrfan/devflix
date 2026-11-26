/**
 * DevFlix Native AdShield & Popup Blocker Engine
 * Silently neutralizes popups, redirects, frame-busting, scam alerts, and ad network trackers
 */
(function() {
    'use strict';

    let blockedCount = 0;

    // 1. Intercept and neutralize all rogue window.open calls (Popups & Popunders)
    const nativeOpen = window.open;
    window.open = function(url, name, specs) {
        blockedCount++;
        console.warn(`[DevFlix AdShield] 🛡️ Blocked popup #${blockedCount}:`, url || 'blank');
        updateBadge();
        return null; // Return null so popups cannot open or execute
    };

    // 2. Block rogue alert / confirm modals from deceptive ad networks
    const nativeAlert = window.alert;
    window.alert = function(msg) {
        if (typeof msg === 'string') {
            const lower = msg.toLowerCase();
            if (lower.includes('virus') || lower.includes('download') || lower.includes('win') || lower.includes('vpn') || lower.includes('update')) {
                blockedCount++;
                console.warn('[DevFlix AdShield] 🛡️ Blocked deceptive scam alert:', msg);
                updateBadge();
                return;
            }
        }
        return nativeAlert.apply(this, arguments);
    };

    // 3. Prevent rogue blur traps & popunder tab hijacks
    window.addEventListener('blur', () => {
        const player = document.getElementById('tv-player');
        if (player && !player.classList.contains('hidden')) {
            blockedCount++;
            updateBadge();
            // Automatically pull focus back to DevFlix instantly
            setTimeout(() => {
                window.focus();
            }, 50);
        }
    });

    // 4. Update AdShield status UI in the player bar
    function updateBadge() {
        const badge = document.getElementById('adshield-status');
        if (badge) {
            const countSpan = badge.querySelector('.adshield-count');
            if (countSpan) {
                countSpan.textContent = blockedCount > 0 ? `(${blockedCount} blocked)` : '';
            }
        }
    }

    // 5. DOM Mutation Watcher: Detect and eliminate rogue injected ad scripts / overlays
    const adPatterns = [
        'popcash', 'adsterra', 'bet365', 'propellerads', 'juicyads', 
        'clickadu', 'yllix', 'exoclick', 'trafficjunky', 'onclick', 'adguard'
    ];

    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node.tagName === 'SCRIPT' && node.src) {
                    const src = node.src.toLowerCase();
                    if (adPatterns.some(p => src.includes(p))) {
                        node.remove();
                        blockedCount++;
                        console.warn('[DevFlix AdShield] 🛡️ Removed rogue ad script:', src);
                        updateBadge();
                    }
                }
                // Kill unauthorized full-screen clickjack overlays injected at top-level
                if (node.tagName === 'DIV' && node.id && (node.id.includes('pop') || node.id.includes('ad-'))) {
                    if (node.style && node.style.position === 'fixed' && parseInt(node.style.zIndex || '0', 10) > 9000) {
                        node.remove();
                        blockedCount++;
                        updateBadge();
                    }
                }
            }
        }
    });

    if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            observer.observe(document.body, { childList: true, subtree: true });
        });
    }

    // 6. Anti-Redirect & Frame-Busting Defense
    // Embeds often try to redirect the parent tab to gambling/ad sites via window.top.location
    window.addEventListener('beforeunload', (e) => {
        const player = document.getElementById('tv-player');
        if (player && !player.classList.contains('hidden') && !window.devflixExplicitNavigation) {
            blockedCount++;
            updateBadge();
            console.warn('[DevFlix AdShield] 🛡️ Blocked rogue parent navigation/redirect attempt');
            e.preventDefault();
            e.returnValue = '';
            return '';
        }
    });

    // Expose Global AdShield API
    window.devflixAdBlock = {
        getBlockedCount: () => blockedCount,
        incrementCount: () => { blockedCount++; updateBadge(); },
        resetCount: () => { blockedCount = 0; updateBadge(); },
        updateBadge
    };
})();
