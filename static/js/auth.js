// static/js/auth.js
document.addEventListener('DOMContentLoaded', function() {
    // Password visibility toggle
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');
    
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Find the password input field
            const passwordField = this.previousElementSibling;
            
            // Toggle password visibility
            if (passwordField.type === 'password') {
                passwordField.type = 'text';
                this.innerHTML = '<i class="fas fa-eye-slash"></i>';
            } else {
                passwordField.type = 'password';
                this.innerHTML = '<i class="fas fa-eye"></i>';
            }
        });
    });

    // Logo hover effect - IMPROVED: More robust selector to work across all pages
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
});