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

    // Logo hover effect
    const logo = document.querySelector('.logo a');
    const logoGlow = document.querySelector('.logo-glow');
    
    if (logo && logoGlow) {
        logo.addEventListener('mouseenter', function() {
            logoGlow.classList.add('active');
        });
        
        logo.addEventListener('mouseleave', function() {
            logoGlow.classList.remove('active');
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
    
    // Message close functionality
    const closeButtons = document.querySelectorAll('.close-message');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            this.parentElement.style.display = 'none';
        });
    });
});