document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const sliderSections = document.querySelectorAll('.slider-section');
    const sliderWheel = document.querySelector('.slider-wheel');
    const backgroundVideo = document.getElementById('backgroundVideo');
    const landingTitle = document.getElementById('landing-title');
    const landingSubtitle = document.getElementById('landing-subtitle');
    
    // Get video sources from hidden container
    const videoSources = document.querySelectorAll('#videoSources source');
    const videos = Array.from(videoSources).map(source => ({
        src: source.getAttribute('data-src'),
        title: source.getAttribute('data-title'),
        subtitle: source.getAttribute('data-subtitle')
    }));
    
    // Initialize the current active section and video
    let currentSection = 1;
    let currentVideoIndex = 0;
    let isAnimating = false;
    
    // Function to update content based on video index
    function updateContent(videoIndex) {
        landingTitle.textContent = videos[videoIndex].title;
        landingSubtitle.textContent = videos[videoIndex].subtitle;
        
        // Update active section
        sliderSections.forEach(section => {
            section.classList.remove('active');
        });
        sliderSections[videoIndex].classList.add('active');
        
        // Rotate wheel to the selected section
        const degrees = (currentSection - (videoIndex + 1)) * 72;
        sliderWheel.style.transform = `rotate(${degrees}deg)`;
    }
    
    // Function to play next video when current one ends
    function setupVideoSequence() {
        backgroundVideo.addEventListener('ended', function() {
            // Move to next video
            currentVideoIndex = (currentVideoIndex + 1) % videos.length;
            
            // Create new video element
            const nextVideo = document.createElement('video');
            nextVideo.setAttribute('id', 'nextVideo');
            nextVideo.setAttribute('autoplay', '');
            nextVideo.setAttribute('muted', '');
            nextVideo.setAttribute('playsinline', '');
            nextVideo.style.opacity = '0';
            nextVideo.style.position = 'absolute';
            nextVideo.style.width = '100%';
            nextVideo.style.height = '100%';
            nextVideo.style.objectFit = 'cover';
            
            // Add source to video
            const source = document.createElement('source');
            source.setAttribute('src', videos[currentVideoIndex].src);
            source.setAttribute('type', 'video/mp4');
            nextVideo.appendChild(source);
            
            // Add next video to container
            backgroundVideo.parentNode.appendChild(nextVideo);
            
            // When the new video is loaded, fade it in
            nextVideo.addEventListener('loadeddata', function() {
                nextVideo.style.opacity = '1';
                
                // Update content
                updateContent(currentVideoIndex);
                
                // Remove old video after transition
                setTimeout(function() {
                    backgroundVideo.remove();
                    nextVideo.id = 'backgroundVideo';
                    backgroundVideo = nextVideo;
                    
                    // Setup for the next video
                    setupVideoSequence();
                }, 1000);
            });
            
            // Fallback in case video doesn't load
            setTimeout(function() {
                if (nextVideo.readyState < 3) {
                    nextVideo.style.opacity = '1';
                    updateContent(currentVideoIndex);
                    backgroundVideo.remove();
                    nextVideo.id = 'backgroundVideo';
                    backgroundVideo = nextVideo;
                    setupVideoSequence();
                }
            }, 5000);
        });
    }
    
    // Add click event to each section
    sliderSections.forEach((section, index) => {
        section.addEventListener('click', function() {
            if (isAnimating) return;
            isAnimating = true;
            
            // Get selected section
            const sectionNumber = parseInt(this.getAttribute('data-section'));
            if (sectionNumber === currentSection) {
                isAnimating = false;
                return;
            }
            
            // Update section state
            currentSection = sectionNumber;
            currentVideoIndex = sectionNumber - 1;
            
            // Create new video element
            const nextVideo = document.createElement('video');
            nextVideo.setAttribute('id', 'nextVideo');
            nextVideo.setAttribute('autoplay', '');
            nextVideo.setAttribute('muted', '');
            nextVideo.setAttribute('playsinline', '');
            nextVideo.style.opacity = '0';
            nextVideo.style.position = 'absolute';
            nextVideo.style.width = '100%';
            nextVideo.style.height = '100%';
            nextVideo.style.objectFit = 'cover';
            
            // Add source to video
            const source = document.createElement('source');
            source.setAttribute('src', videos[currentVideoIndex].src);
            source.setAttribute('type', 'video/mp4');
            nextVideo.appendChild(source);
            
            // Add next video to container
            backgroundVideo.parentNode.appendChild(nextVideo);
            
            // Fade out content
            landingTitle.style.opacity = '0';
            landingSubtitle.style.opacity = '0';
            
            // Rotate wheel
            const degrees = (currentSection - sectionNumber) * 72;
            sliderWheel.style.transform = `rotate(${degrees}deg)`;
            
            // Update active section
            sliderSections.forEach(section => {
                section.classList.remove('active');
            });
            sliderSections[currentVideoIndex].classList.add('active');
            
            // When the new video is loaded, fade it in
            nextVideo.addEventListener('loadeddata', function() {
                nextVideo.style.opacity = '1';
                
                // Wait for transition and then update content
                setTimeout(function() {
                    landingTitle.textContent = videos[currentVideoIndex].title;
                    landingSubtitle.textContent = videos[currentVideoIndex].subtitle;
                    landingTitle.style.opacity = '1';
                    landingSubtitle.style.opacity = '1';
                    
                    // Remove old video
                    backgroundVideo.remove();
                    nextVideo.id = 'backgroundVideo';
                    backgroundVideo = nextVideo;
                    
                    // Setup for the next video
                    setupVideoSequence();
                    isAnimating = false;
                }, 500);
            });
            
            // Fallback in case video doesn't load
            setTimeout(function() {
                if (isAnimating) {
                    nextVideo.style.opacity = '1';
                    landingTitle.textContent = videos[currentVideoIndex].title;
                    landingSubtitle.textContent = videos[currentVideoIndex].subtitle;
                    landingTitle.style.opacity = '1';
                    landingSubtitle.style.opacity = '1';
                    backgroundVideo.remove();
                    nextVideo.id = 'backgroundVideo';
                    backgroundVideo = nextVideo;
                    setupVideoSequence();
                    isAnimating = false;
                }
            }, 5000);
        });
    });
    
    // Initialize video sequence
    setupVideoSequence();
    
    // Update initial content
    updateContent(0);
});