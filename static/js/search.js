// Search Overlay Functionality
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const searchButtons = document.querySelectorAll('.search-btn');
    const searchOverlay = document.querySelector('.search-overlay');
    const searchCloseBtn = document.querySelector('.search-close-btn');
    const searchInput = document.querySelector('.search-input');
    const searchForm = document.querySelector('.search-form');
    const recentSearchesList = document.querySelector('.recent-searches-list');
    
    // Open search overlay
    searchButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            searchOverlay.classList.add('active');
            setTimeout(() => {
                searchInput.focus();
            }, 300);
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        });
    });
    
    // Close search overlay
    if (searchCloseBtn) {
        searchCloseBtn.addEventListener('click', function() {
            searchOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
    
    // Close on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && searchOverlay && searchOverlay.classList.contains('active')) {
            searchOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    // Close if clicked outside content
    if (searchOverlay) {
        searchOverlay.addEventListener('click', function(e) {
            if (e.target === searchOverlay) {
                searchOverlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
    
    // Handle search form submission
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            const searchTerm = searchInput.value.trim();
            
            if (searchTerm) {
                // Save to recent searches
                saveRecentSearch(searchTerm);
            }
        });
    }
    
    // Recent searches functionality
    function saveRecentSearch(term) {
        let recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
        
        // Remove duplicates
        recentSearches = recentSearches.filter(search => search !== term);
        
        // Add to beginning
        recentSearches.unshift(term);
        
        // Keep only latest 5
        recentSearches = recentSearches.slice(0, 5);
        
        // Save to localStorage
        localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
        
        // Update UI
        updateRecentSearchesUI();
    }
    
    function updateRecentSearchesUI() {
        if (!recentSearchesList) return;
        
        const recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
        
        if (recentSearches.length === 0) {
            recentSearchesList.innerHTML = `<p>Hələ axtarış etməmisiniz.</p>`;
            return;
        }
        
        let html = '';
        recentSearches.forEach(term => {
            html += `
                <div class="recent-search-item">
                    <a href="?q=${encodeURIComponent(term)}" class="search-tag">
                        <i class="fas fa-history"></i> ${term}
                    </a>
                </div>
            `;
        });
        
        recentSearchesList.innerHTML = html;
    }
    
    // Initialize
    if (recentSearchesList) {
        updateRecentSearchesUI();
    }
    
    // Futuristic glow effect on input focus
    if (searchInput) {
        searchInput.addEventListener('focus', function() {
            this.style.boxShadow = '0 0 20px rgba(77, 240, 255, 0.5), inset 0 2px 10px rgba(0, 0, 0, 0.3)';
        });
        
        searchInput.addEventListener('blur', function() {
            this.style.boxShadow = 'inset 0 2px 10px rgba(0, 0, 0, 0.3)';
        });
    }
});