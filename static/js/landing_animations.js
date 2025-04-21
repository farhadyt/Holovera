// static/js/landing_animations.js
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all animations and interactive elements
    initParallaxEffects();
    initScrollAnimations();
    initTestimonialSlider();
    initShowcaseLightbox();
    initBackToTop();
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 70, // Adjust for header height
                    behavior: 'smooth'
                });
            }
        });
    });
});

// Parallax scrolling effects
function initParallaxEffects() {
    window.addEventListener('scroll', function() {
        const scrollPosition = window.pageYOffset;
        
        // Apply parallax to section backgrounds
        document.querySelectorAll('.section-bg').forEach(bg => {
            const parent = bg.parentElement;
            const speed = bg.dataset.speed || 0.2;
            const yPos = -(scrollPosition - parent.offsetTop) * speed;
            bg.style.transform = `translateY(${yPos}px)`;
        });
        
        // Parallax for showcase items
        document.querySelectorAll('.showcase-item').forEach((item, index) => {
            const rect = item.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
            
            if (isVisible) {
                const scrollFactor = (rect.top - window.innerHeight) / -window.innerHeight;
                const translateY = scrollFactor * 20; // Adjust this value for more/less movement
                item.style.transform = `scale(1) translateY(${translateY}px)`;
            }
        });
    });
}

// Scroll-triggered animations using Intersection Observer
function initScrollAnimations() {
    // Create observer for fade-in animations
    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-visible');
                fadeObserver.unobserve(entry.target); // Only animate once
            }
        });
    }, {
        root: null,
        threshold: 0.15, // Trigger when 15% of element is visible
        rootMargin: '-50px'
    });
    
    // Apply to all elements with fade-in class
    document.querySelectorAll('.fade-in').forEach(element => {
        fadeObserver.observe(element);
    });
    
    // Create observer for slide-in animations
    const slideObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('slide-in-visible');
                slideObserver.unobserve(entry.target); // Only animate once
            }
        });
    }, {
        root: null,
        threshold: 0.15,
        rootMargin: '-50px'
    });
    
    // Apply to all elements with slide-in class
    document.querySelectorAll('.slide-in').forEach(element => {
        slideObserver.observe(element);
    });
    
    // Create observer for scale-in animations
    const scaleObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('scale-in-visible');
                scaleObserver.unobserve(entry.target); // Only animate once
            }
        });
    }, {
        root: null,
        threshold: 0.15,
        rootMargin: '-50px'
    });
    
    // Apply to all elements with scale-in class
    document.querySelectorAll('.scale-in').forEach(element => {
        scaleObserver.observe(element);
    });
    
    // Add a delay to staggered elements
    document.querySelectorAll('.stagger-item').forEach((item, index) => {
        item.style.transitionDelay = `${index * 0.1}s`;
    });
}

// Testimonials slider
function initTestimonialSlider() {
    const testimonialsList = document.querySelector('.testimonials-list');
    if (!testimonialsList) return;
    
    const testimonialItems = document.querySelectorAll('.testimonial-item');
    const prevBtn = document.querySelector('.testimonial-btn.prev');
    const nextBtn = document.querySelector('.testimonial-btn.next');
    
    let currentIndex = 0;
    let isAnimating = false;
    const animationDuration = 500; // ms
    
    // Set initial active state
    updateActiveState();
    
    // Previous button click
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            if (isAnimating) return;
            isAnimating = true;
            
            currentIndex = (currentIndex - 1 + testimonialItems.length) % testimonialItems.length;
            updateSlider();
            
            setTimeout(() => {
                isAnimating = false;
            }, animationDuration);
        });
    }
    
    // Next button click
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            if (isAnimating) return;
            isAnimating = true;
            
            currentIndex = (currentIndex + 1) % testimonialItems.length;
            updateSlider();
            
            setTimeout(() => {
                isAnimating = false;
            }, animationDuration);
        });
    }
    
    function updateSlider() {
        // Translate testimonials list
        testimonialsList.style.transform = `translateX(-${currentIndex * 100}%)`;
        updateActiveState();
    }
    
    function updateActiveState() {
        testimonialItems.forEach((item, index) => {
            if (index === currentIndex) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
    
    // Auto-rotate testimonials every 5 seconds
    let autoRotateInterval = setInterval(() => {
        if (document.visibilityState === 'visible' && !isAnimating) {
            nextBtn.click();
        }
    }, 5000);
    
    // Pause auto-rotation when user interacts
    [prevBtn, nextBtn].forEach(btn => {
        if (btn) {
            btn.addEventListener('mouseenter', () => {
                clearInterval(autoRotateInterval);
            });
            
            btn.addEventListener('mouseleave', () => {
                autoRotateInterval = setInterval(() => {
                    if (document.visibilityState === 'visible' && !isAnimating) {
                        nextBtn.click();
                    }
                }, 5000);
            });
        }
    });
}

// Showcase gallery lightbox
function initShowcaseLightbox() {
    const showcaseItems = document.querySelectorAll('.showcase-item');
    if (showcaseItems.length === 0) return;
    
    // Create lightbox container if not present
    let lightbox = document.querySelector('.showcase-lightbox');
    if (!lightbox) {
        lightbox = document.createElement('div');
        lightbox.className = 'showcase-lightbox';
        lightbox.innerHTML = `
            <div class="lightbox-content">
                <img src="" alt="Full size image" class="lightbox-image">
                <div class="lightbox-close"><i class="fas fa-times"></i></div>
            </div>
        `;
        document.body.appendChild(lightbox);
    }
    
    const lightboxImage = lightbox.querySelector('.lightbox-image');
    const lightboxClose = lightbox.querySelector('.lightbox-close');
    
    // Open lightbox when clicking a showcase item
    showcaseItems.forEach(item => {
        item.addEventListener('click', function() {
            const imgSrc = this.querySelector('img').src;
            lightboxImage.src = imgSrc;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        });
    });
    
    // Close lightbox when clicking the close button
    if (lightboxClose) {
        lightboxClose.addEventListener('click', function() {
            lightbox.classList.remove('active');
            document.body.style.overflow = ''; // Restore scrolling
        });
    }
    
    // Close lightbox when clicking outside of image
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) {
            lightbox.classList.remove('active');
            document.body.style.overflow = ''; // Restore scrolling
        }
    });
    
    // Close lightbox with escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            lightbox.classList.remove('active');
            document.body.style.overflow = ''; // Restore scrolling
        }
    });
}

// Back to top button
function initBackToTop() {
    const backToTopBtn = document.querySelector('.back-to-top');
    if (!backToTopBtn) return;
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 500) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });
    
    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Add CSS animation classes based on viewport scrolling
document.addEventListener('DOMContentLoaded', function() {
    // Add animation classes to elements
    const aboutFeatures = document.querySelectorAll('.about-feature');
    aboutFeatures.forEach((feature, index) => {
        feature.classList.add('fade-in', 'stagger-item');
        feature.style.transitionDelay = `${index * 0.15}s`;
    });
    
    const stepItems = document.querySelectorAll('.step-item');
    stepItems.forEach((step, index) => {
        step.classList.add('fade-in', 'stagger-item');
        step.style.transitionDelay = `${index * 0.15}s`;
    });
    
    const audienceCards = document.querySelectorAll('.audience-card');
    audienceCards.forEach((card, index) => {
        card.classList.add('slide-in', 'stagger-item');
        card.style.transitionDelay = `${index * 0.15}s`;
    });
    
    const showcaseItems = document.querySelectorAll('.showcase-item');
    showcaseItems.forEach((item, index) => {
        item.classList.add('scale-in', 'stagger-item');
        item.style.transitionDelay = `${index * 0.1}s`;
    });
    
    // Initialize the filtering tabs for showcase items
    initShowcaseFilter();
});

// Filter items in showcase section
function initShowcaseFilter() {
    const tabs = document.querySelectorAll('.showcase-tab');
    const items = document.querySelectorAll('.showcase-item');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Filter items
            const filter = this.getAttribute('data-filter');
            
            items.forEach(item => {
                if (filter === 'all' || item.getAttribute('data-category') === filter) {
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
    
    // Set initial active tab
    if (tabs.length > 0) {
        tabs[0].classList.add('active');
    }
}