// static/js/landing_animations.js - Statik versiyon, animasyonsuz
document.addEventListener('DOMContentLoaded', function() {
    console.log("Landing animations başlatılıyor - yüksek performans statik modu");
    
    // Tüm içeriği görünür hale getir
    forceAllContentVisible();
    
    // Statik bölüm ayırıcıları oluştur (animasyonsuz)
    createStaticDividers();
    
    // Back to Top butonu oluştur (kesin çalışan versiyon)
    createBackToTopButton();
    
    // Temel işlevler
    initShowcaseFilter();
    initSimpleTestimonialSlider();
    initSmoothScrolling();
});

// Tüm içeriği görünür yap
function forceAllContentVisible() {
    // Tüm içerik öğelerini görünür yap
    document.querySelectorAll('.section-container, .audience-card, .showcase-item, .about-feature, .step-item, .testimonial-item, .section-title, .section-subtitle, .fade-in, .slide-in, .scale-in, img').forEach(item => {
        if (item) {
            item.style.opacity = '1';
            item.style.visibility = 'visible';
            item.style.transform = 'none';
        }
    });
}

// Statik bölüm ayırıcıları oluştur - ANİMASYONSUZ
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
        
        // Futuristik grid çizgileri (statik)
        const gridLines = document.createElement('div');
        gridLines.className = 'static-grid-lines';
        dividerContent.appendChild(gridLines);
        
        divider.appendChild(dividerContent);
    });
}

// BACK TO TOP BUTONU - KESİN ÇALIŞAN VERSİYON
function createBackToTopButton() {
    // Önce varolan butonu kaldır
    let existingButton = document.querySelector('.back-to-top');
    if (existingButton) {
        existingButton.remove();
    }
    
    // Yeni buton oluştur
    const backToTop = document.createElement('div');
    backToTop.className = 'back-to-top';
    backToTop.id = 'backToTopBtn';
    
    // Ok ikonu
    const arrowIcon = document.createElement('i');
    arrowIcon.className = 'fas fa-chevron-up';
    backToTop.appendChild(arrowIcon);
    
    // CSS ekle (inline stil olarak)
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
    backToTop.style.transition = 'opacity 0.3s, visibility 0.3s';
    
    // Body'ye ekle
    document.body.appendChild(backToTop);
    
    // Kaydırma olayı dinleyicisi
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTop.style.opacity = '1';
            backToTop.style.visibility = 'visible';
        } else {
            backToTop.style.opacity = '0';
            backToTop.style.visibility = 'hidden';
        }
    });
    
    // Tıklama olayı
    backToTop.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Sayfa yüklendikten sonra scroll pozisyonunu kontrol et
    if (window.pageYOffset > 300) {
        backToTop.style.opacity = '1';
        backToTop.style.visibility = 'visible';
    }
    
    console.log('Back to Top butonu oluşturuldu ve doküman gövdesine eklendi.');
}

// Showcase filtresi (basit versiyon)
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

// Basit testimonial slider (minimum animasyon)
function initSimpleTestimonialSlider() {
    const testimonialItems = document.querySelectorAll('.testimonial-item');
    const testimonialsList = document.querySelector('.testimonials-list');
    const prevBtn = document.querySelector('.testimonial-btn.prev');
    const nextBtn = document.querySelector('.testimonial-btn.next');
    
    if (!testimonialItems.length || !testimonialsList || !prevBtn || !nextBtn) return;
    
    let currentIndex = 0;
    
    // İlk testimonial'ı göster
    testimonialItems[0].classList.add('active');
    
    // Önceki testimonial'a geç
    prevBtn.addEventListener('click', () => {
        testimonialItems[currentIndex].classList.remove('active');
        currentIndex = (currentIndex - 1 + testimonialItems.length) % testimonialItems.length;
        testimonialItems[currentIndex].classList.add('active');
        testimonialsList.style.transform = `translateX(-${currentIndex * 100}%)`;
    });
    
    // Sonraki testimonial'a geç
    nextBtn.addEventListener('click', () => {
        testimonialItems[currentIndex].classList.remove('active');
        currentIndex = (currentIndex + 1) % testimonialItems.length;
        testimonialItems[currentIndex].classList.add('active');
        testimonialsList.style.transform = `translateX(-${currentIndex * 100}%)`;
    });
}

// Sayfa içi bağlantılar için yumuşak kaydırma
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