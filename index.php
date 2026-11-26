<?php
/**
 * CineStream TV & Movie Web App
 * Entry point for XAMPP / Apache / PHP Built-in Server
 */

// If direct request for index.php, serve index.html
if (file_exists(__DIR__ . '/index.html')) {
    include __DIR__ . '/index.html';
    exit;
}

echo "CineStream TV - Error loading interface.";
