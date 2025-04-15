// static/js/video-slider.js
document.addEventListener('DOMContentLoaded', function () {
    const carousel = document.querySelector('.carousel');
    const list = carousel.querySelector('.list');
    const items = list.querySelectorAll('.item');
    const thumbnails = carousel.querySelectorAll('.thumbnail .item');
    const nextBtn = document.getElementById('next');
    const prevBtn = document.getElementById('prev');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const timeBar = document.querySelector('.carousel .time');

    const timeRunning = 7000; // Total cycle time
    const timeAutoNext = 7000;
    const videoPlaybackRate = 0.6; // Significantly slow down video playback
    let runNextAuto;
    let currentIndex = 0;
    let isInitialized = false;

    // --- Hide loading overlay
    function hideLoading() {
        if (loadingOverlay) {
            loadingOverlay.style.opacity = '0';
            setTimeout(() => loadingOverlay.style.display = 'none', 800);
        }
    }

    // --- Preload videos and track loading progress
    function preloadVideos(callback) {
        const videos = document.querySelectorAll('.carousel video');
        let loadedCount = 0;

        videos.forEach(video => {
            // Reset video attributes
            video.setAttribute('playsinline', '');
            video.setAttribute('muted', '');
            video.setAttribute('preload', 'auto');
            video.muted = true;

            // Apply slow playback rate immediately
            video.playbackRate = videoPlaybackRate;

            video.addEventListener('loadeddata', () => {
                loadedCount++;
                console.log(`Video ${loadedCount} loaded`, video.duration / videoPlaybackRate);
                if (loadedCount === videos.length) callback();
            });

            video.addEventListener('error', () => {
                console.warn('Video loading error:', video.src);
                loadedCount++;
                if (loadedCount === videos.length) callback();
            });

            video.load();
        });

        setTimeout(() => {
            if (loadedCount < videos.length) {
                console.warn('Timeout: Proceeding with incomplete video loading');
                callback();
            }
        }, 5000);
    }

    // --- Initialize time bar animation
    function initTimeBar() {
        if (timeBar) {
            // Reset time bar
            timeBar.style.transition = 'none';
            timeBar.style.width = '100%';
            
            // Trigger reflow
            timeBar.offsetWidth;

            // Apply transition for reducing width
            timeBar.style.transition = `width ${timeRunning}ms linear`;
            timeBar.style.width = '0%';
        }
    }

    // --- Update active thumbnail highlighting
    function updateActiveThumbnail(index) {
        thumbnails.forEach((thumb, i) => {
            thumb.classList.toggle('active', i === index);
        });
    }

    // --- Reset all videos (pause and rewind)
    function resetVideos() {
        items.forEach(item => {
            const video = item.querySelector('video');
            if (video) {
                video.pause();
                video.currentTime = 0;
                video.playbackRate = videoPlaybackRate;
            }
        });
    }

    // --- Transition to selected video index with animations
// --- Transition to selected video index with animations
function transitionTo(index) {
    if (index === currentIndex || carousel.classList.contains('transitioning')) return;

    carousel.classList.add('transitioning');

    const currentItem = items[currentIndex];
    const nextItem = items[index];
    const currentVideo = currentItem.querySelector('video');
    const nextVideo = nextItem.querySelector('video');

    // Reset next video and prepare for transition
    nextVideo.currentTime = 0;
    nextVideo.playbackRate = videoPlaybackRate;

    // Start preparing next video early
    nextItem.style.opacity = '1';
    nextItem.style.zIndex = '3';
    nextVideo.classList.add('animating-in');

    // Add transition class to current video
    currentVideo.classList.add('animating-out');

    setTimeout(() => {
        // Fully prepare next video
        nextVideo.classList.add('animate');
        
        // Attempt to play next video
        nextVideo.play().catch(e => console.log('Autoplay prevented:', e));
    }, 100);

    setTimeout(() => {
        // Complete transition
        currentVideo.classList.remove('animating-out');
        nextVideo.classList.remove('animating-in', 'animate');
        
        // Reset current video
        currentVideo.pause();
        currentVideo.currentTime = 0;
        
        // Update visual states
        currentItem.style.opacity = '0';
        currentItem.style.zIndex = '';
        nextItem.style.zIndex = '2';

        // Update index and UI
        currentIndex = index;
        updateActiveThumbnail(index);
        carousel.classList.remove('transitioning');
        
        // Restart time bar and auto-rotation
        initTimeBar();
        startAutoRotation();
    }, 1200);
}

    // --- Go to next video
    function showNext() {
        const nextIndex = (currentIndex + 1) % items.length;
        transitionTo(nextIndex);
    }

    // --- Go to previous video
    function showPrev() {
        const prevIndex = (currentIndex - 1 + items.length) % items.length;
        transitionTo(prevIndex);
    }

    // --- Auto rotate videos every few seconds
    function startAutoRotation() {
        clearTimeout(runNextAuto);
        runNextAuto = setTimeout(() => {
            if (document.visibilityState === 'visible') {
                showNext();
            } else {
                startAutoRotation(); // Try again later if hidden
            }
        }, timeAutoNext);
    }

    // --- Handle thumbnail click transitions
    function handleThumbnailClick() {
        thumbnails.forEach((thumb, index) => {
            thumb.addEventListener('click', () => {
                transitionTo(index);
            });
        });
    }

    // --- Initialization logic
    function initialize() {
        if (isInitialized) return;
        isInitialized = true;

        items[currentIndex].style.opacity = '1';
        updateActiveThumbnail(currentIndex);

        const currentVideo = items[currentIndex].querySelector('video');
        if (currentVideo) {
            // Set playback rate before playing
            currentVideo.playbackRate = videoPlaybackRate;
            currentVideo.play().catch(e => console.log('Autoplay error:', e));
        }

        hideLoading();
        initTimeBar();
        startAutoRotation();
    }

    // --- Handle visibility (tab change)
    document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'visible') {
            startAutoRotation();
            const currentVideo = items[currentIndex].querySelector('video');
            if (currentVideo) {
                currentVideo.playbackRate = videoPlaybackRate;
                currentVideo.play().catch(() => {});
            }
        } else {
            clearTimeout(runNextAuto);
        }
    });

    // --- Set event listeners
    nextBtn.addEventListener('click', showNext);
    prevBtn.addEventListener('click', showPrev);
    handleThumbnailClick();

    // --- Start everything
    preloadVideos(initialize);
});