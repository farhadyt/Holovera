// static/js/landing_animations.js
document.addEventListener('DOMContentLoaded', function() {
    console.log("Landing animations başlatılıyor - yüksek performans statik modu");
    
    // Tüm içeriği görünür hale getir
    forceAllContentVisible();
    
    // Statik bölüm ayırıcıları oluştur
    createStaticDividers();
    
    // Back to Top butonu oluştur
    setupBackToTopButton();
    
    // Temel işlevler
    initShowcaseFilter();
    initTestimonialSlider();
    initSmoothScrolling();
});

// Tüm içeriği görünür yap
function forceAllContentVisible() {
    const elements = document.querySelectorAll(
        '.section-container, ' +
        '.audience-card, ' +
        '.showcase-item, ' +
        '.about-feature, ' +
        '.step-item, ' +
        '.testimonial-item, ' +
        '.section-title, ' +
        '.section-subtitle, ' +
        '.fade-in, ' +
        '.slide-in, ' +
        '.scale-in, ' +
        'img'
    );
    elements.forEach(item => {
        item.style.opacity    = '1';
        item.style.visibility = 'visible';
        item.style.transform  = 'none';
    });
}

// Statik bölüm ayırıcıları oluştur
function createStaticDividers() {
    // Tüm bölüm ayırıcılarını bul ve içeriğini temizle
    document.querySelectorAll('.section-divider').forEach(divider => {
        divider.innerHTML = '';
        divider.classList.add('static-divider');
        
        // Basit, statik bir ayırıcı oluştur
        const dividerContent = document.createElement('div');
        dividerContent.className = 'static-divider-content';
        
        // Sadece statik bir çizgi
        const centerLine = document.createElement('div');
        centerLine.className = 'static-center-line';
        dividerContent.appendChild(centerLine);
        
        divider.appendChild(dividerContent);
    });
}

// Back to Top butonu ayarla
function setupBackToTopButton() {
    console.log("Back to Top düyməsi quraşdırılır...");
    
    // HTML-də düyməni yarat
    let backToTop = document.querySelector('.back-to-top');
    
    // Əgər düymə yoxdursa, əlavə et
    if (!backToTop) {
        console.log("Back to Top düyməsi HTML-də yoxdur, əlavə edilir...");
        
        backToTop = document.createElement('div');
        backToTop.className = 'back-to-top';
        backToTop.innerHTML = '<i class="fas fa-chevron-up"></i>';
        document.body.appendChild(backToTop);
        
        console.log("Back to Top düyməsi HTML-ə əlavə edildi");
    } else {
        console.log("Mövcud Back to Top düyməsi tapıldı");
    }
    
    // Xüsusi stillər əlavə et
    backToTop.style.position = 'fixed';
    backToTop.style.bottom = '30px';
    backToTop.style.right = '30px';
    backToTop.style.width = '60px';
    backToTop.style.height = '60px';
    backToTop.style.borderRadius = '50%';
    backToTop.style.backgroundColor = 'rgba(6, 9, 15, 0.9)';
    backToTop.style.border = '2px solid #4DF0FF';
    backToTop.style.color = '#4DF0FF';
    backToTop.style.display = 'flex';
    backToTop.style.alignItems = 'center';
    backToTop.style.justifyContent = 'center';
    backToTop.style.cursor = 'pointer';
    backToTop.style.zIndex = '9999';
    backToTop.style.boxShadow = '0 0 20px rgba(77, 240, 255, 0.4)';
    backToTop.style.opacity = '0';
    backToTop.style.visibility = 'hidden';
    
    // Scroll hadisəsi
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });
    
    // Kliklənmə hadisəsi
    backToTop.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Səhifə yükləndikdən sonra scroll yoxla
    if (window.pageYOffset > 300) {
        backToTop.classList.add('visible');
    }
    
    console.log("Back to Top düyməsi funksionallığı əlavə edildi");
}

// Showcase filtresi
function initShowcaseFilter() {
    const tabs = document.querySelectorAll('.showcase-tab');
    const items = document.querySelectorAll('.showcase-item');
    
    if (!tabs.length || !items.length) return;
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Aktif sekmeyi güncelle
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Öğeleri filtrele
            const filter = this.getAttribute('data-filter');
            
            items.forEach(item => {
                if (filter === 'all' || item.getAttribute('data-category') === filter) {
                    item.style.display = 'block';
                    item.style.opacity = '1';
                } else {
                    item.style.opacity = '0';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
    
    // İlk sekmeyi aktif olarak ayarla
    if (tabs.length > 0) {
        tabs[0].classList.add('active');
    }
}

// Müştəri rəyləri slider funksiyası
function initTestimonialSlider() {
    console.log("Müştəri rəyləri slayderi inisializasiya olunur...");
    
    const testimonialItems = document.querySelectorAll('.testimonial-item');
    const testimonialsList = document.querySelector('.testimonials-list');
    const prevBtn = document.querySelector('.testimonial-btn.prev');
    const nextBtn = document.querySelector('.testimonial-btn.next');
    
    if (!testimonialItems.length || !testimonialsList || !prevBtn || !nextBtn) {
        console.error("Müştəri rəyləri elementləri tapılmadı");
        return;
    }
    
    let currentIndex = 0;
    
    // İlk rəyi aktivləşdir
    testimonialItems[0].classList.add('active');
    
    // Transformation əlavə et
    testimonialItems.forEach((item, index) => {
        item.style.transform = `translateX(${index * 100}%)`;
    });
    
    // Əvvəlki rəyə keç
    prevBtn.addEventListener('click', function() {
        testimonialItems[currentIndex].classList.remove('active');
        currentIndex = (currentIndex - 1 + testimonialItems.length) % testimonialItems.length;
        testimonialItems[currentIndex].classList.add('active');
        updateSliderPosition();
        console.log(`Əvvəlki rəyə keçid: indeks ${currentIndex}`);
    });
    
    // Sonrakı rəyə keç
    nextBtn.addEventListener('click', function() {
        testimonialItems[currentIndex].classList.remove('active');
        currentIndex = (currentIndex + 1) % testimonialItems.length;
        testimonialItems[currentIndex].classList.add('active');
        updateSliderPosition();
        console.log(`Sonrakı rəyə keçid: indeks ${currentIndex}`);
    });
    
    // Slayderi yenilə
    function updateSliderPosition() {
        testimonialsList.style.transform = `translateX(-${currentIndex * 100}%)`;
    }
    
    console.log(`${testimonialItems.length} müştəri rəyi tapıldı və slider inisializasiya olundu`);
}

// Səhifə içi bağlantılar üçün yumşaq sürüşmə
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                window.scrollTo({
                    top: targetElement.offsetTop - 70,
                    behavior: 'smooth'
                });
            }
        });
    });
}