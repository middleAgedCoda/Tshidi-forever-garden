// Service Worker for Tshidi's Forever Garden

const CACHE_NAME = 'tshidi-garden-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/styles/main.css',
    '/js/app.js',
    '/js/data.js',
    '/js/word-mode.js',
    '/js/number-mode.js',
    '/js/logic-mode.js',
    '/js/garden.js',
    '/manifest.json'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        })
    );
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request)
            .then(response => response || fetch(e.request))
    );
});
