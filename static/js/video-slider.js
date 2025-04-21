// static/js/video-slider.js
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const carousel = document.querySelector('.carousel');
    const list = document.querySelector('.list');
    const items = document.querySelectorAll('.list .item');
    const nextBtn = document.getElementById('next');
    const prevBtn = document.getElementById('prev');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const timeProgress = document.querySelector('.time-progress');
    
    // Configuration
    const timeRunning = 7000; // 7 seconds duration
    const timeAutoNext = 7000; // Auto-rotate every 7 seconds
    let autoRotateTimer;
    let currentIndex = 0;
    let isTransitioning = false;
    
    // Initialize the slider
    function initSlider() {
        setupThumbnails();
        setupEventListeners();
        hideLoading();
        startVideoPlayback();
        resetTimeBar();
        startAutoRotation();
    }
    
    // Create thumbnail items
    function setupThumbnails() {
        const thumbnailContainer = document.querySelector('.thumbnail');
        
        // Clear existing thumbnails
        if (thumbnailContainer) {
            thumbnailContainer.innerHTML = '';
            
            // Create thumbnails for each video
            items.forEach((item, index) => {
                const videoSrc = item.querySelector('video source').getAttribute('src');
                const title = item.querySelector('.author').textContent;
                
                const thumbnailItem = document.createElement('div');
                thumbnailItem.className = `item ${index === currentIndex ? 'active' : ''}`;
                thumbnailItem.dataset.index = index;
                
                // Create thumbnail video
                const thumbnailVideo = document.createElement('video');
                thumbnailVideo.muted = true;
                thumbnailVideo.loop = true;
                thumbnailVideo.playsInline = true;
                
                const thumbnailSource = document.createElement('source');
                thumbnailSource.src = videoSrc;
                thumbnailSource.type = 'video/mp4';
                
                thumbnailVideo.appendChild(thumbnailSource);
                thumbnailItem.appendChild(thumbnailVideo);
                
                // Add content info
                const content = document.createElement('div');
                content.className = 'content';
                content.textContent = title;
                
                thumbnailItem.appendChild(content);
                
                // Add click event to select this thumbnail
                thumbnailItem.addEventListener('click', function() {
                    if (!isTransitioning && index !== currentIndex) {
                        switchToVideo(index);
                    }
                });
                
                thumbnailContainer.appendChild(thumbnailItem);
                
                // Start playing the thumbnail video
                thumbnailVideo.load();
                thumbnailVideo.play().catch(e => {
                    console.log('Thumbnail video autoplay prevented:', e);
                });
            });
        }
    }
    
    // Set up event listeners
    function setupEventListeners() {
        // Next button click
        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                if (!isTransitioning) {
                    const nextIndex = (currentIndex + 1) % items.length;
                    switchToVideo(nextIndex);
                }
            });
        }
        
        // Previous button click
        if (prevBtn) {
            prevBtn.addEventListener('click', function() {
                if (!isTransitioning) {
                    const prevIndex = (currentIndex - 1 + items.length) % items.length;
                    switchToVideo(prevIndex);
                }
            });
        }
        
        // Keyboard navigation
        document.addEventListener('keydown', function(e) {
            if (e.key === 'ArrowRight') {
                nextBtn.click();
            } else if (e.key === 'ArrowLeft') {
                prevBtn.click();
            }
        });
    }
    
    // Start video playback
    function startVideoPlayback() {
        // Ensure the current video is playing
        const currentVideo = items[currentIndex].querySelector('video');
        if (currentVideo) {
            currentVideo.currentTime = 0;
            currentVideo.play().catch(e => {
                console.log('Main video autoplay prevented:', e);
            });
        }
        
        // Make sure the current item is visible
        items.forEach((item, i) => {
            item.style.opacity = i === currentIndex ? '1' : '0';
            item.style.pointerEvents = i === currentIndex ? 'auto' : 'none';
        });
    }
    
    // Switch to a specific video
    function switchToVideo(index) {
        if (isTransitioning || index === currentIndex) return;
        
        isTransitioning = true;
        
        // Update current index
        const previousIndex = currentIndex;
        currentIndex = index;
        
        // Get videos
        const currentVideo = items[currentIndex].querySelector('video');
        const previousVideo = items[previousIndex].querySelector('video');
        
        // Reset time bar
        resetTimeBar();
        
        // Play the new video
        if (currentVideo) {
            currentVideo.currentTime = 0;
            currentVideo.play().catch(e => {
                console.log('Video play error:', e);
            });
        }
        
        // Update thumbnail active state
        updateThumbnailActiveState();
        
        // Switch videos with fade transition
        setTimeout(function() {
            // Show the new video
            items.forEach((item, i) => {
                item.style.opacity = i === currentIndex ? '1' : '0';
                item.style.pointerEvents = i === currentIndex ? 'auto' : 'none';
            });
            
            // Reset the transitioning state
            isTransitioning = false;
            
            // Restart auto-rotation
            startAutoRotation();
        }, 500);
    }
    
    // Update the active state of thumbnails
    function updateThumbnailActiveState() {
        const thumbnails = document.querySelectorAll('.thumbnail .item');
        thumbnails.forEach((thumbnail, i) => {
            if (i === currentIndex) {
                thumbnail.classList.add('active');
            } else {
                thumbnail.classList.remove('active');
            }
        });
    }
    
    // Reset and start the time bar animation
    function resetTimeBar() {
        if (timeProgress) {
            // Reset and set width
            timeProgress.style.transition = 'none';
            timeProgress.style.width = '0%';
            
            // Force reflow to apply the change immediately
            timeProgress.offsetWidth;
            
            // Start animation
            timeProgress.style.transition = `width ${timeRunning}ms linear`;
            timeProgress.style.width = '100%';
        }
    }
    
    // Start auto-rotation
    function startAutoRotation() {
        // Clear any existing timer
        clearTimeout(autoRotateTimer);
        
        // Set new timer
        autoRotateTimer = setTimeout(function() {
            const nextIndex = (currentIndex + 1) % items.length;
            switchToVideo(nextIndex);
        }, timeAutoNext);
    }
    
    // Hide loading overlay
    function hideLoading() {
        if (loadingOverlay) {
            loadingOverlay.style.opacity = '0';
            setTimeout(function() {
                loadingOverlay.style.display = 'none';
            }, 800);
        }
    }
    
    // Start everything
    initSlider();
});