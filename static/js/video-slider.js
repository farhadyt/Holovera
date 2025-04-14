document.addEventListener('DOMContentLoaded', function() {
    // Element seçiciləri
    const carousel = document.querySelector('.carousel');
    const nextBtn = document.querySelector('#next');
    const prevBtn = document.querySelector('#prev');
    const timeRunning = 7000; // 7 saniyə avtomatik keçid
    const timeAutoNext = 7000; // 7 saniyə avtomatik keçid
    
    // İlk video elementini aktivləşdirin
    const firstVideo = document.querySelector('.list .item:first-child .main-video');
    if (firstVideo) {
        firstVideo.muted = true;
        firstVideo.play();
    }
    
    // Kiçik videolar üçün loop
    const thumbnailVideos = document.querySelectorAll('.thumbnail .item video');
    thumbnailVideos.forEach(video => {
        video.muted = true;
        video.play();
    });
    
    // İlk thumbnail'i aktiv et
    const thumbnailItems = document.querySelectorAll('.thumbnail .item');
    if (thumbnailItems.length > 0) {
        thumbnailItems[0].classList.add('active');
    }
    
    // Avtomatik slider başlatma
    let runTimeOut;
    let runNextAuto = setTimeout(() => {
        nextBtn.click();
    }, timeAutoNext);
    
    // Slider funksiyası
    function showSlider(type) {
        // Mövcud aktivləşdirilmiş elementi aşkar etmək
        const sliderItems = document.querySelectorAll('.carousel .list .item');
        const thumbnailItems = document.querySelectorAll('.carousel .thumbnail .item');
        
        // Current active video elementini dayandır
        const currentActiveVideo = document.querySelector('.list .item:nth-child(1) .main-video');
        if (currentActiveVideo) {
            currentActiveVideo.pause();
        }
        
        if (type === 'next') {
            // İlk elementi son mövqeyə köçürün
            const firstItem = carousel.querySelector('.list .item:first-child');
            carousel.querySelector('.list').appendChild(firstItem);
            
            // İlk thumbnail'i son mövqeyə köçürün
            const firstThumbnail = carousel.querySelector('.thumbnail .item:first-child');
            carousel.querySelector('.thumbnail').appendChild(firstThumbnail);
            
            // Aktiv sinif mənimsədin
            thumbnailItems.forEach(item => item.classList.remove('active'));
            carousel.querySelector('.thumbnail .item:first-child').classList.add('active');
            
            // Animasiya sinfi əlavə edin
            carousel.classList.add('next');
        } else {
            // Son elementi ilk mövqeyə köçürün
            const lastItem = carousel.querySelector('.list .item:last-child');
            carousel.querySelector('.list').prepend(lastItem);
            
            // Son thumbnail'i ilk mövqeyə köçürün
            const lastThumbnail = carousel.querySelector('.thumbnail .item:last-child');
            carousel.querySelector('.thumbnail').prepend(lastThumbnail);
            
            // Aktiv sinif mənimsədin
            thumbnailItems.forEach(item => item.classList.remove('active'));
            carousel.querySelector('.thumbnail .item:first-child').classList.add('active');
            
            // Animasiya sinfi əlavə edin
            carousel.classList.add('prev');
        }
        
        // İndi aktiv olan yeni video elementini işə salın
        const newActiveVideo = document.querySelector('.list .item:nth-child(1) .main-video');
        if (newActiveVideo) {
            newActiveVideo.currentTime = 0;
            newActiveVideo.play();
        }
        
        // Geri sayım başlat
        clearTimeout(runTimeOut);
        runTimeOut = setTimeout(() => {
            carousel.classList.remove('next');
            carousel.classList.remove('prev');
        }, 3000); // 3 saniyə animasiya müddəti
        
        // Auto next restart
        clearTimeout(runNextAuto);
        runNextAuto = setTimeout(() => {
            nextBtn.click();
        }, timeAutoNext);
        
        // Zaman çubuğu animasiyası
        const timeBar = document.querySelector('.carousel .time');
        timeBar.style.width = '100%';
        timeBar.style.transition = 'none';
        
        setTimeout(() => {
            timeBar.style.width = '0';
            timeBar.style.transition = `width ${timeRunning}ms linear`;
        }, 50);
    }
    
    // Next düyməsi hadisəsi
    nextBtn.addEventListener('click', function() {
        showSlider('next');
    });
    
    // Previous düyməsi hadisəsi
    prevBtn.addEventListener('click', function() {
        showSlider('prev');
    });
    
    // Thumbnail tiklanma hadisəsi 
    thumbnailItems.forEach((item, index) => {
        item.addEventListener('click', function() {
            // Cari aktiv element indeksini al
            const currentActive = Array.from(thumbnailItems).findIndex(item => item.classList.contains('active'));
            
            // İndekslər arası fərqə görə slider istiqamətini təyin et
            const clicksNeeded = index - currentActive;
            
            if (clicksNeeded > 0) {
                // Lazım olduğu qədər "next" çağır
                for (let i = 0; i < clicksNeeded; i++) {
                    setTimeout(() => {
                        nextBtn.click();
                    }, i * 100);
                }
            } else if (clicksNeeded < 0) {
                // Lazım olduğu qədər "prev" çağır
                for (let i = 0; i < Math.abs(clicksNeeded); i++) {
                    setTimeout(() => {
                        prevBtn.click();
                    }, i * 100);
                }
            }
        });
    });
    
    // İlk zaman çubuğu animasiyası
    const timeBar = document.querySelector('.carousel .time');
    timeBar.style.width = '100%';
    
    setTimeout(() => {
        timeBar.style.width = '0';
        timeBar.style.transition = `width ${timeRunning}ms linear`;
    }, 50);
});