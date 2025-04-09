// Password visibility toggle
document.addEventListener('DOMContentLoaded', function() {
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');
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
    
    // Language dropdown
    const langBtn = document.querySelector('.lang-btn');
    const langOptions = document.querySelector('.language-options');
    
    if (langBtn && langOptions) {
        langBtn.addEventListener('click', function(e) {
            e.preventDefault();
            langOptions.classList.toggle('show');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!langBtn.contains(e.target) && !langOptions.contains(e.target)) {
                langOptions.classList.remove('show');
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
});