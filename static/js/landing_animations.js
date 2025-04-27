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

// Müştəri rəyləri slider funksiyası - tam yenilənmiş
function initTestimonialSlider() {
    console.log("Müştəri rəyləri slayderi inisializasiya olunur...");
    
    const testimonialsList = document.querySelector('.testimonials-list');
    const testimonialItems = document.querySelectorAll('.testimonial-item');
    const prevBtn = document.querySelector('.testimonial-btn.prev');
    const nextBtn = document.querySelector('.testimonial-btn.next');
    const dots = document.querySelectorAll('.testimonial-dot');
    
    if (!testimonialsList || !testimonialItems.length || !prevBtn || !nextBtn) {
        console.error("Müştəri rəyləri elementləri tapılmadı");
        return;
    }
    
    let currentIndex = 0;
    let isAnimating = false;
    const animationDuration = 600;
    const totalItems = testimonialItems.length;
    
    // Bütün elementləri gizlət
    testimonialItems.forEach((item, index) => {
        item.classList.remove('active', 'prev', 'next');
        item.style.opacity = '0';
    });
    
    // İlkin vəziyyəti təyin et
    function setInitialState() {
        // Aktiv element
        testimonialItems[currentIndex].classList.add('active');
        testimonialItems[currentIndex].style.opacity = '1';
        
        // Əvvəlki element
        const prevIndex = (currentIndex - 1 + totalItems) % totalItems;
        testimonialItems[prevIndex].classList.add('prev');
        testimonialItems[prevIndex].style.opacity = '0.5';
        
        // Sonrakı element
        const nextIndex = (currentIndex + 1) % totalItems;
        testimonialItems[nextIndex].classList.add('next');
        testimonialItems[nextIndex].style.opacity = '0.5';
        
        // Aktiv nöqtə
        if (dots && dots.length) {
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentIndex);
            });
        }
    }
    
    // Slaydı dəyiş
    function changeSlide(newIndex) {
        if (isAnimating || newIndex === currentIndex) return;
        
        isAnimating = true;
        
        // Əvvəlki statusları sıfırla
        const prevItem = document.querySelector('.testimonial-item.prev');
        const activeItem = document.querySelector('.testimonial-item.active');
        const nextItem = document.querySelector('.testimonial-item.next');
        
        if (prevItem) prevItem.classList.remove('prev');
        if (activeItem) activeItem.classList.remove('active');
        if (nextItem) nextItem.classList.remove('next');
        
        // İndeksi yenilə
        currentIndex = newIndex;
        
        // Yeni statusları təyin et
        const newPrevIndex = (currentIndex - 1 + totalItems) % totalItems;
        const newNextIndex = (currentIndex + 1) % totalItems;
        
        // Keçid zamanı kiçik gecikmə 
        setTimeout(() => {
            // Əvvəlki element
            testimonialItems[newPrevIndex].classList.add('prev');
            testimonialItems[newPrevIndex].style.opacity = '0.5';
            
            // Aktiv element
            testimonialItems[currentIndex].classList.add('active');
            testimonialItems[currentIndex].style.opacity = '1';
            
            // Sonrakı element
            testimonialItems[newNextIndex].classList.add('next');
            testimonialItems[newNextIndex].style.opacity = '0.5';
            
            // Digər bütün elementləri gizlət
            testimonialItems.forEach((item, index) => {
                if (index !== currentIndex && index !== newPrevIndex && index !== newNextIndex) {
                    item.classList.remove('active', 'prev', 'next');
                    item.style.opacity = '0';
                }
            });
            
            // Nöqtələri yenilə
            if (dots && dots.length) {
                dots.forEach((dot, index) => {
                    dot.classList.toggle('active', index === currentIndex);
                });
            }
            
            // Animasiya tamamlandı
            setTimeout(() => {
                isAnimating = false;
            }, animationDuration);
        }, 50);
    }
    
    // Əvvəlki slayd düyməsi
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            const newIndex = (currentIndex - 1 + totalItems) % totalItems;
            changeSlide(newIndex);
        });
    }
    
    // Sonrakı slayd düyməsi
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const newIndex = (currentIndex + 1) % totalItems;
            changeSlide(newIndex);
        });
    }
    
    // Nöqtə indikatorları
    if (dots && dots.length) {
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                changeSlide(index);
            });
        });
    }
    
    // Touch hadisələri üçün dəstək
    let touchStartX = 0;
    let touchEndX = 0;
    
    // Touch başlanğıcı
    testimonialsList.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    // Touch sonu
    testimonialsList.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
    
    // Swipe istiqamətini müəyyən et
    function handleSwipe() {
        const swipeThreshold = 50;
        
        if (touchEndX < touchStartX - swipeThreshold) {
            // Sola swipe - növbəti elementa keç
            const newIndex = (currentIndex + 1) % totalItems;
            changeSlide(newIndex);
        } 
        else if (touchEndX > touchStartX + swipeThreshold) {
            // Sağa swipe - əvvəlki elementa keç
            const newIndex = (currentIndex - 1 + totalItems) % totalItems;
            changeSlide(newIndex);
        }
    }
    
    // İlkin vəziyyəti təyin et
    setInitialState();
    
    // Avtomatik slayd dəyişimi
    let autoSlideInterval;
    
    function startAutoSlide() {
        autoSlideInterval = setInterval(() => {
            const newIndex = (currentIndex + 1) % totalItems;
            changeSlide(newIndex);
        }, 5000);
    }
    
    function stopAutoSlide() {
        clearInterval(autoSlideInterval);
    }
    
    // Hover zamanı avto dəyişimi dayandır
    testimonialsList.addEventListener('mouseenter', stopAutoSlide);
    testimonialsList.addEventListener('mouseleave', startAutoSlide);
    
    // Avtomatik dəyişimi başlat
    startAutoSlide();
    
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