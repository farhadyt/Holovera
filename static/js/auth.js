// static/js/auth.js
document.addEventListener('DOMContentLoaded', function() {
    // Simplest possible implementation of password toggle
    function initializePasswordToggles() {
        // Get all toggle password buttons
        const toggleButtons = document.querySelectorAll('.toggle-password');
        
        toggleButtons.forEach(button => {
            // First, remove any existing click event listeners by cloning and replacing
            const newButton = button.cloneNode(true);
            if (button.parentNode) {
                button.parentNode.replaceChild(newButton, button);
            }
            
            // Now add the click event to the new button
            newButton.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Find the password input element
                // Start with the direct parent div to find the input
                const parentDiv = this.parentElement;
                if (!parentDiv) return;
                
                const input = parentDiv.querySelector('input[type="password"], input[type="text"]');
                if (!input) return;
                
                // Toggle password visibility
                if (input.type === 'password') {
                    input.type = 'text';
                    this.innerHTML = '<i class="fas fa-eye-slash"></i>';
                } else {
                    input.type = 'password';
                    this.innerHTML = '<i class="fas fa-eye"></i>';
                }
            });
        });
        
        console.log('Initialized', toggleButtons.length, 'password toggle buttons');
    }
    
    // Call immediately on page load
    initializePasswordToggles();
    
    // Also call after a short delay to catch any dynamic elements
    setTimeout(initializePasswordToggles, 500);
    setTimeout(initializePasswordToggles, 1000);
    
    // Logo hover effect
    const logos = document.querySelectorAll('.logo a, .header-container .logo a');
    
    logos.forEach(logo => {
        const logoGlow = logo.querySelector('.logo-glow');
        
        if (logoGlow) {
            logo.addEventListener('mouseenter', function() {
                logoGlow.classList.add('active');
            });
            
            logo.addEventListener('mouseleave', function() {
                logoGlow.classList.remove('active');
            });
        }
    });
    
    // Add scroll effect to navigation
    const nav = document.querySelector('.integrated-nav');
    
    if (nav) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        });
    }
    
    // Add similar scroll effect to site-header
    const header = document.querySelector('#site-header');
    
    if (header) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                header.style.background = 'rgba(6, 9, 15, 0.85)';
                header.style.backdropFilter = 'blur(10px)';
                header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.3)';
            } else {
                header.style.background = 'var(--header-bg)';
                header.style.backdropFilter = 'blur(10px)';
                header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.15)';
            }
        });
    }
    
    // Language dropdown - Təkmilləşdirilmiş versiya
    const langBtn = document.querySelector('.lang-btn');
    const langOptions = document.querySelector('.language-options');
    
    if (langBtn && langOptions) {
        // Drop-down toggle funksionallığı
        langBtn.addEventListener('click', function(e) {
            e.preventDefault();
            langOptions.classList.toggle('show');
        });
        
        // Drop-down bağlama
        document.addEventListener('click', function(e) {
            if (!langBtn.contains(e.target) && !langOptions.contains(e.target)) {
                langOptions.classList.remove('show');
            }
        });
        
        // Dil keçidi linkləri üçün event dinləyicilər
        const languageLinks = document.querySelectorAll('.language-options a.lang-option');
        languageLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                // URL-i aşkarlayırıq
                const currentPath = window.location.pathname;
                // İlk "/" simvoldan sonra ikinci "/" simvoluna qədər (dil kodu)
                const pathParts = currentPath.split('/');
                if (pathParts.length > 2) {
                    const langCode = this.getAttribute('data-lang');
                    if (langCode) {
                        // Sadəcə dil kodunu dəyişirik, qalan yol eyni qalır
                        pathParts[1] = langCode; 
                        const newUrl = pathParts.join('/');
                        window.location.href = newUrl;
                        e.preventDefault(); // Default davranışı dayandır
                    }
                }
            });
        });
    }
    
    // Auth dropdown functionality - similar to language dropdown
    const authBtn = document.querySelector('.auth-btn');
    const authOptions = document.querySelector('.auth-options');
    
    if (authBtn && authOptions) {
        // Making dropdown work with click
        authBtn.addEventListener('click', function(e) {
            // Only prevent default if we have a dropdown (logged in user)
            if (this.tagName.toLowerCase() === 'button') {
                e.preventDefault();
                authOptions.classList.toggle('show');
            }
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (authOptions && !authBtn.contains(e.target) && !authOptions.contains(e.target)) {
                authOptions.classList.remove('show');
            }
        });
    }
    
    // Message close functionality
    const closeButtons = document.querySelectorAll('.close-message');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            this.parentElement.style.display = 'none';
        });
    });
    
    // Add pulsing effect to the login button
    const loginBtn = document.querySelector('.auth-btn');
    if (loginBtn) {
        // Add subtle pulse animation for attention
        setTimeout(() => {
            loginBtn.classList.add('pulse');
            // Remove the pulse after some time
            setTimeout(() => {
                loginBtn.classList.remove('pulse');
            }, 2000);
        }, 1000);
    }
    
    // Fix layout shift issues
    const htmlElement = document.documentElement;
    const bodyElement = document.body;
    
    // Prevent initial layout shift by setting visible only when fully loaded
    window.addEventListener('load', function() {
        if (bodyElement.style.opacity !== '1') {
            bodyElement.style.opacity = '1';
        }
    });
    
    // Fix viewport issues
    let lastWidth = window.innerWidth;
    let ignoreResize = false;
    
    window.addEventListener('resize', function() {
        if (ignoreResize) return;
        
        // Address the issue of browser chrome showing/hiding on mobile
        if (Math.abs(lastWidth - window.innerWidth) < 20) {
            // Probably just the scrollbar or browser chrome
            ignoreResize = true;
            setTimeout(() => { 
                ignoreResize = false;
                lastWidth = window.innerWidth;
            }, 300);
            return;
        }
        
        lastWidth = window.innerWidth;
    });
    
    // XHR/Fetch error handling improvement
    const originalFetch = window.fetch;
    window.fetch = function() {
        return originalFetch.apply(this, arguments)
            .catch(error => {
                console.error('Network error during fetch:', error);
                // Show user-friendly error
                if (typeof showNotification === 'function') {
                    showNotification('error', 'Şəbəkə xətası baş verdi. Zəhmət olmasa internet bağlantınızı yoxlayın.');
                }
                throw error;
            });
    };
    
    // Global error handling for JSON parsing
    window.addEventListener('error', function(e) {
        if (e.message && e.message.includes('JSON')) {
            console.error('JSON Parse Error:', e);
            // Reload the page if it's a critical JSON error
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }
    });
    
    // Phone number format handler - global helper function
    window.formatPhoneNumber = function(phoneNumber) {
        // Əgər telefon nömrəsi verilmişsə
        if (!phoneNumber) return '';
        
        // Boşluqları təmizlə
        phoneNumber = phoneNumber.trim();
        
        // Əgər "+" işarəsi yoxdursa əlavə et
        if (!phoneNumber.startsWith('+')) {
            phoneNumber = '+' + phoneNumber;
        }
        
        return phoneNumber;
    };
    
    // Telefon nömrəsi formatı üçün validasiya
    window.validatePhoneNumber = function(phoneNumber) {
        // Sadə validasiya - minimum 10 rəqəm olmalıdır
        return /^\+\d{10,15}$/.test(phoneNumber);
    };
});