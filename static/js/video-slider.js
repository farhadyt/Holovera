// Advanced video slider with targeted thumbnail animations
document.addEventListener('DOMContentLoaded', function() {
    // Element seçiciləri
    const carousel = document.querySelector('.carousel');
    const nextBtn = document.querySelector('#next');
    const prevBtn = document.querySelector('#prev');
    const timeRunning = 7000; // 7 saniyə avtomatik keçid
    const timeAutoNext = 7000; // 7 saniyə avtomatik keçid
    const loadingOverlay = document.getElementById('loadingOverlay'); // Ana loading overlay
    
    // Initialize video indices for targeted animations
    function initializeVideoIndices() {
        const items = document.querySelectorAll('.carousel .list .item');
        items.forEach((item, index) => {
            item.setAttribute('data-index', index % 5); // Cycle through 0-4 for the 5 positions
        });
    }
    
    // Call once at start
    initializeVideoIndices();
    
    // Preload all videos to ensure smooth transitions
    const preloadVideos = function() {
        const videos = document.querySelectorAll('.carousel video');
        videos.forEach(video => {
            video.setAttribute('playsinline', '');
            video.setAttribute('muted', '');
            video.setAttribute('preload', 'auto');
            video.muted = true;
            
            video.addEventListener('loadeddata', function() {
                this.classList.add('loaded');
            });
            
            video.load();
        });
    };
    
    // Immediate preload
    preloadVideos();
    
    // Hide loading overlay after all needed resources are loaded
    function hideLoading() {
        if (loadingOverlay) {
            loadingOverlay.style.opacity = '0';
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
            }, 500);
        }
    }

    // Initialize first video
    const firstVideo = document.querySelector('.list .item:first-child .main-video');
    if (firstVideo) {
        firstVideo.muted = true;
        firstVideo.play().catch(e => console.log('Auto-play prevented:', e));
        
        // Hide loading when first video is ready
        firstVideo.addEventListener('canplay', function() {
            hideLoading();
        });
        
        // Backup timeout in case video loading takes too long
        setTimeout(hideLoading, 4000);
    }
    
    // Initialize thumbnail videos
    const thumbnailVideos = document.querySelectorAll('.thumbnail .item video');
    thumbnailVideos.forEach(video => {
        video.muted = true;
        video.play().catch(e => {}); // Ignore errors for thumbnail videos
    });
    
    // Activate first thumbnail
    const thumbnailItems = document.querySelectorAll('.thumbnail .item');
    if (thumbnailItems.length > 0) {
        thumbnailItems[0].classList.add('active');
    }
    
    // Auto slider setup
    let runTimeOut;
    let runNextAuto = setTimeout(() => {
        nextBtn.click();
    }, timeAutoNext);
    
    // Go to target thumbnail position
    function animateToThumbnail(video, index) {
        // Add animating-out class which has targeted positions
        video.classList.add('animating-out');
    }
    
    // Come from target thumbnail position
    function animateFromThumbnail(video, index) {
        // First position at thumbnail
        video.classList.add('animating-in');
        
        // Force browser to recognize the initial position
        setTimeout(() => {
            // Then animate to full screen
            video.classList.add('animate');
        }, 50);
    }
    
    // Enhanced slider with targeted animations
    function showSlider(type) {
        // If already transitioning, don't stack animations
        if (carousel.classList.contains('transitioning')) {
            return;
        }
        
        // Add transitioning class for UI state
        carousel.classList.add('transitioning');
        
        // Handle transition based on direction
        if (type === 'next') {
            // Get current video and its index
            const currentItem = document.querySelector('.carousel .list .item:nth-child(1)');
            const currentVideo = currentItem.querySelector('.main-video');
            const currentIndex = currentItem.getAttribute('data-index');
            
            // Get next item that will become active
            const nextItem = document.querySelector('.carousel .list .item:nth-child(2)');
            const nextVideo = nextItem.querySelector('.main-video');
            const nextIndex = nextItem.getAttribute('data-index');
            
            // Make sure next video is ready
            nextVideo.currentTime = 0;
            nextVideo.play().catch(e => {});
            
            // Show both items during transition
            currentItem.style.zIndex = 3;
            nextItem.style.zIndex = 2;
            nextItem.style.opacity = 1;
            
            // Animate current video to its thumbnail position
            animateToThumbnail(currentVideo, currentIndex);
            
            // After current video shrinks
            setTimeout(() => {
                // Position next video at its thumbnail then animate to full screen
                animateFromThumbnail(nextVideo, nextIndex);
                
                // After the animation is done, reset DOM
                setTimeout(() => {
                    // Move first item to end
                    const firstItem = carousel.querySelector('.list .item:first-child');
                    carousel.querySelector('.list').appendChild(firstItem);
                    
                    // Move first thumbnail to end
                    const firstThumbnail = carousel.querySelector('.thumbnail .item:first-child');
                    carousel.querySelector('.thumbnail').appendChild(firstThumbnail);
                    
                    // Update active thumbnail
                    thumbnailItems.forEach(item => item.classList.remove('active'));
                    carousel.querySelector('.thumbnail .item:first-child').classList.add('active');
                    
                    // Clean up all animation classes
                    document.querySelectorAll('.main-video').forEach(video => {
                        video.classList.remove('animating-out', 'animating-in', 'animate');
                    });
                    
                    // Reset item styles
                    document.querySelectorAll('.carousel .list .item').forEach(item => {
                        item.style.zIndex = '';
                        item.style.opacity = '';
                    });
                    
                    // Remove transition class
                    carousel.classList.remove('transitioning');
                    
                    // Reinitialize indices for the updated order
                    initializeVideoIndices();
                    
                }, 1200); // Match animation duration
            }, 300); // Small delay to ensure the first animation is visible
            
        } else { // Previous
            // For prev direction, we need to move last item to first position
            const lastItem = carousel.querySelector('.list .item:last-child');
            const lastVideo = lastItem.querySelector('.main-video');
            const lastIndex = lastItem.getAttribute('data-index');
            
            // First position the last video at its thumbnail position (instantly)
            animateFromThumbnail(lastVideo, lastIndex);
            
            // Move it to first position
            carousel.querySelector('.list').prepend(lastItem);
            
            // Move last thumbnail to first
            const lastThumbnail = carousel.querySelector('.thumbnail .item:last-child');
            carousel.querySelector('.thumbnail').prepend(lastThumbnail);
            
            // Update active thumbnail
            thumbnailItems.forEach(item => item.classList.remove('active'));
            carousel.querySelector('.thumbnail .item:first-child').classList.add('active');
            
            // Make it visible
            lastItem.style.opacity = 1;
            lastItem.style.zIndex = 3;
            
            // Get the item that was first but is now second
            const secondItem = carousel.querySelector('.list .item:nth-child(2)');
            const secondVideo = secondItem.querySelector('.main-video');
            
            // Start playing the video
            lastVideo.currentTime = 0;
            lastVideo.play().catch(e => {});
            
            // Animate from thumbnail to full screen
            setTimeout(() => {
                lastVideo.classList.add('animate');
                
                // After animation completes
                setTimeout(() => {
                    // Clean up all animation classes
                    document.querySelectorAll('.main-video').forEach(video => {
                        video.classList.remove('animating-out', 'animating-in', 'animate');
                    });
                    
                    // Reset item styles
                    document.querySelectorAll('.carousel .list .item').forEach(item => {
                        item.style.zIndex = '';
                        item.style.opacity = '';
                    });
                    
                    // End transitioning state
                    carousel.classList.remove('transitioning');
                    
                    // Reinitialize indices
                    initializeVideoIndices();
                    
                }, 1200); // Match animation duration
            }, 50);
        }
        
        // Reset timeout
        clearTimeout(runTimeOut);
        
        // Auto next restart
        clearTimeout(runNextAuto);
        runNextAuto = setTimeout(() => {
            nextBtn.click();
        }, timeAutoNext);
        
        // Time bar animation
        const timeBar = document.querySelector('.carousel .time');
        timeBar.style.width = '100%';
        timeBar.style.transition = 'none';
        
        setTimeout(() => {
            timeBar.style.width = '0';
            timeBar.style.transition = `width ${timeRunning}ms linear`;
        }, 50);
    }
    
    // Next button click
    nextBtn.addEventListener('click', function() {
        showSlider('next');
    });
    
    // Previous button click
    prevBtn.addEventListener('click', function() {
        showSlider('prev');
    });
    
    // Thumbnail click handler 
    thumbnailItems.forEach((item, index) => {
        item.addEventListener('click', function() {
            // Find current active index
            const currentActive = Array.from(thumbnailItems).findIndex(
                item => item.classList.contains('active')
            );
            
            // Calculate clicks needed
            const clicksNeeded = index - currentActive;
            
            if (clicksNeeded > 0) {
                // Need to go forward
                for (let i = 0; i < clicksNeeded; i++) {
                    setTimeout(() => {
                        nextBtn.click();
                    }, i * 1500); // Increased delay between transitions
                }
            } else if (clicksNeeded < 0) {
                // Need to go backward
                for (let i = 0; i < Math.abs(clicksNeeded); i++) {
                    setTimeout(() => {
                        prevBtn.click();
                    }, i * 1500); // Increased delay between transitions
                }
            }
        });
    });
    
    // Initialize time bar
    const timeBar = document.querySelector('.carousel .time');
    timeBar.style.width = '100%';
    
    setTimeout(() => {
        timeBar.style.width = '0';
        timeBar.style.transition = `width ${timeRunning}ms linear`;
    }, 50);
});