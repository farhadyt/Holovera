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
    const videos = document.querySelectorAll('.main-video, .thumbnail video');
    
    // Configuration
    const timeRunning = 7000; // 7 seconds duration
    const timeAutoNext = 7000; // Auto-rotate every 7 seconds
    let autoRotateTimer;
    let currentIndex = 0;
    let isTransitioning = false;
    let videosLoaded = 0;
    let totalVideos = videos.length;
    let loadingTimeout;
    
    // Track video loading progress
    function updateLoadingProgress() {
        videosLoaded++;
        console.log(`Video yükləndi: ${videosLoaded}/${totalVideos}`);
        
        // Only hide loading overlay when all videos are loaded
        if (videosLoaded >= totalVideos) {
            clearTimeout(loadingTimeout); // Clear safety timeout
            hideLoading();
            startVideoPlayback();
            resetTimeBar();
            startAutoRotation();
            
            // Ensure first slide's content is visible
            animateContentElements(items[currentIndex], true);
        }
    }
    
    // Initialize the slider
    function initSlider() {
        setupThumbnails();
        setupEventListeners();
        setupVideoLoadTracking();
        
        // Set a maximum timeout in case some videos take too long
        loadingTimeout = setTimeout(function() {
            console.log('Maksimum yüklənmə müddəti bitdi, səhifəni açırıq...');
            if (loadingOverlay && loadingOverlay.style.opacity !== '0') {
                hideLoading();
                startVideoPlayback();
                resetTimeBar();
                startAutoRotation();
                animateContentElements(items[currentIndex], true);
            }
        }, 10000); // 10 second maximum wait
    }
    
    // Track when all videos are loaded
    function setupVideoLoadTracking() {
        // For each main video and thumbnail video
        videos.forEach((video, index) => {
            // Add load event listeners
            if (video.readyState >= 3) { // HAVE_FUTURE_DATA or better
                console.log(`Video ${index} artıq yüklənib`);
                updateLoadingProgress();
            } else {
                console.log(`Video ${index} yüklənməsini gözləyirik...`);
                
                // Listen for when video can play
                video.addEventListener('canplay', function() {
                    console.log(`Video ${index} canplay eventi baş verdi`);
                    updateLoadingProgress();
                });
                
                video.addEventListener('loadeddata', function() {
                    console.log(`Video ${index} loadeddata eventi baş verdi`);
                    updateLoadingProgress();
                });
                
                // Also add error handler in case video fails to load
                video.addEventListener('error', function(e) {
                    console.error('Video yüklənməsi xətası:', e);
                    console.error('Video src:', video.querySelector('source')?.getAttribute('src'));
                    updateLoadingProgress(); // Count as "loaded" to avoid blocking
                });
            }
            
            // Force load by setting src attribute if not already set
            const source = video.querySelector('source');
            if (source) {
                const currentSrc = source.getAttribute('src');
                video.load();
            }
        });
        
        // Add loading safety timeout to clear loading screen after some time regardless
        setTimeout(function() {
            if (videosLoaded < totalVideos) {
                console.log(`Bütün videolar yüklənmədi, amma davam edirik. Yüklənmiş: ${videosLoaded}/${totalVideos}`);
                clearTimeout(loadingTimeout);
                hideLoading();
                startVideoPlayback();
                resetTimeBar();
                startAutoRotation();
                animateContentElements(items[currentIndex], true);
            }
        }, 8000); // 8 seconds safety
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
                thumbnailVideo.setAttribute('preload', 'auto');
                
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
            nextBtn.addEventListener('click', function(e) {
                e.preventDefault(); // Add this to prevent default behavior
                if (!isTransitioning) {
                    const nextIndex = (currentIndex + 1) % items.length;
                    switchToVideo(nextIndex);
                }
            });
            
            // Make sure button is properly clickable
            nextBtn.style.pointerEvents = 'auto';
            nextBtn.style.cursor = 'pointer';
            nextBtn.style.zIndex = '100';
        }
        
        // Previous button click
        if (prevBtn) {
            prevBtn.addEventListener('click', function(e) {
                e.preventDefault(); // Add this to prevent default behavior
                if (!isTransitioning) {
                    const prevIndex = (currentIndex - 1 + items.length) % items.length;
                    switchToVideo(prevIndex);
                }
            });
            
            // Make sure button is properly clickable
            prevBtn.style.pointerEvents = 'auto';
            prevBtn.style.cursor = 'pointer';
            prevBtn.style.zIndex = '100';
        }
        
        // Keyboard navigation
        document.addEventListener('keydown', function(e) {
            if (e.key === 'ArrowRight') {
                if (nextBtn) nextBtn.click();
            } else if (e.key === 'ArrowLeft') {
                if (prevBtn) prevBtn.click();
            }
        });
        
        // Make sure slider area is clickable in all browsers
        const sliderArea = document.querySelector('.carousel-container');
        if (sliderArea) {
            sliderArea.style.pointerEvents = 'auto';
            
            // Ensure all sub-elements are also clickable
            const interactiveElements = sliderArea.querySelectorAll('.thumbnail, .thumbnail .item, .arrows, .arrows button');
            interactiveElements.forEach(el => {
                el.style.pointerEvents = 'auto';
                el.style.cursor = 'pointer';
            });
        }
        
        // Special fix for Mozilla Firefox
        if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
            // Make thumbnail container higher z-index
            const thumbnail = document.querySelector('.thumbnail');
            if (thumbnail) {
                thumbnail.style.zIndex = '30';
                
                // Ensure each thumbnail is clickable
                const thumbnailItems = thumbnail.querySelectorAll('.item');
                thumbnailItems.forEach(item => {
                    item.style.pointerEvents = 'auto';
                    item.style.cursor = 'pointer';
                    item.style.position = 'relative';
                    item.style.zIndex = '31';
                });
            }
            
            // Make arrows higher z-index
            const arrows = document.querySelector('.arrows');
            if (arrows) {
                arrows.style.zIndex = '35';
                
                // Ensure buttons are clickable
                const buttons = arrows.querySelectorAll('button');
                buttons.forEach(button => {
                    button.style.pointerEvents = 'auto';
                    button.style.cursor = 'pointer';
                    button.style.position = 'relative';
                    button.style.zIndex = '36';
                });
            }
        }
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
    
    // New function to control content animation
    function animateContentElements(item, show) {
        // Get content elements that need animation
        const author = item.querySelector('.author');
        const title = item.querySelector('.title');
        const description = item.querySelector('.des');
        const buttons = item.querySelector('.buttons');
        
        // Elements array to handle together
        const elements = [author, title, description, buttons];
        
        // Reset animation properties
        elements.forEach(el => {
            if (!el) return;
            
            // Clear existing animation
            el.style.animation = 'none';
            el.style.opacity = show ? '0' : '1';
            
            // Force reflow to ensure animation reset
            el.offsetHeight;
        });
        
        if (show) {
            // Set up animations with staggered delays
            setTimeout(() => {
                if (author) {
                    author.style.animation = 'fadeIn 0.8s forwards';
                    author.style.animationDelay = '0.2s';
                }
                
                if (title) {
                    title.style.animation = 'fadeIn 0.8s forwards';
                    title.style.animationDelay = '0.4s';
                }
                
                if (description) {
                    description.style.animation = 'fadeIn 0.8s forwards';
                    description.style.animationDelay = '0.6s';
                }
                
                if (buttons) {
                    buttons.style.animation = 'fadeIn 0.8s forwards';
                    buttons.style.animationDelay = '0.8s';
                }
            }, 500); // Delay content animation by 0.5 seconds after video transition
        } else {
            // Fade out animation
            elements.forEach(el => {
                if (!el) return;
                el.style.animation = 'fadeOut 0.5s forwards';
            });
        }
    }
    
    // Add fadeOut animation if it doesn't exist in your CSS
    if (!document.getElementById('fadeOutAnimation')) {
        const style = document.createElement('style');
        style.id = 'fadeOutAnimation';
        style.textContent = `
            @keyframes fadeOut {
                from { opacity: 1; transform: translateY(0); }
                to { opacity: 0; transform: translateY(-20px); }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Switch to a specific video
    function switchToVideo(index) {
        if (isTransitioning || index === currentIndex) return;
        
        isTransitioning = true;
        
        // First, hide current content
        animateContentElements(items[currentIndex], false);
        
        // Wait briefly for content to fade out
        setTimeout(() => {
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
            
            // Update thumbnail active state with improved animation
            updateThumbnailActiveState();
            
            // Switch videos with fade transition
            setTimeout(function() {
                // Show the new video
                items.forEach((item, i) => {
                    item.style.opacity = i === currentIndex ? '1' : '0';
                    item.style.pointerEvents = i === currentIndex ? 'auto' : 'none';
                    
                    // If this is the new active item, get ready to animate its content
                    if (i === currentIndex) {
                        // Animate content separately after video appears
                        animateContentElements(item, true);
                    }
                });
                
                // Reset the transitioning state
                isTransitioning = false;
                
                // Restart auto-rotation
                startAutoRotation();
            }, 500);
        }, 300); // Wait for content to fade out
    }
    
    // Update the active state of thumbnails
    function updateThumbnailActiveState() {
        const thumbnails = document.querySelectorAll('.thumbnail .item');
        
        // First remove active class from all thumbnails
        thumbnails.forEach(thumbnail => {
            thumbnail.classList.remove('active');
        });
        
        // Force browser reflow to ensure animation triggers
        if (thumbnails[0]) thumbnails[0].offsetWidth;
        
        // Add active class with slight delay
        setTimeout(() => {
            thumbnails.forEach((thumbnail, i) => {
                if (i === currentIndex) {
                    thumbnail.classList.add('active');
                }
            });
        }, 50);
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
    
    // Check if the video element is supported
    function checkVideoSupport() {
        try {
            const video = document.createElement('video');
            if (typeof video.canPlayType === 'function') {
                // Browser supports video element
                return video.canPlayType('video/mp4') !== '';
            }
        } catch (error) {
            console.error('Video element not supported:', error);
        }
        
        return false;
    }
    
    // Start everything with browser check
    if (checkVideoSupport()) {
        // Browser supports video, initialize slider
        console.log('Brauzer video-nu dəstəkləyir, slider-i inicializasiya edirik...');
        initSlider();
    } else {
        // Browser does not support video, hide loading overlay and display fallback
        console.log('Brauzer video-nu dəstəkləmir, məlumat şəkli göstəriləcək...');
        if (loadingOverlay) {
            loadingOverlay.style.opacity = '0';
            setTimeout(function() {
                loadingOverlay.style.display = 'none';
            }, 200);
        }
    }
});