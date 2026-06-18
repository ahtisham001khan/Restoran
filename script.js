document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // ==========================================
    // 1. NAVBAR SCROLL EFFECT
    // ==========================================
    const navbar = document.querySelector('.navbar-cus');
    if (navbar) {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 50;
            navbar.classList.toggle('scrolled', isScrolled);
            navbar.classList.toggle('shadow-lg', isScrolled);
        };
        
        window.addEventListener('scroll', handleScroll, { passive: true });
        // Initial check
        handleScroll();
    }

    // ==========================================
    // 2. AOS ANIMATIONS
    // ==========================================
    if (typeof AOS !== 'undefined' && AOS.init) {
        AOS.init({
            once: true,
            disable: 'mobile'
        });
    }

    // ==========================================
    // 2a. BACK-TO-TOP BUTTON
    // ==========================================
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        const toggleBackToTop = () => {
            backToTop.classList.toggle('visible', window.scrollY > 400);
        };
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        window.addEventListener('scroll', toggleBackToTop, { passive: true });
    }

    // ==========================================
    // 3. FOOD MENU TABS
    // ==========================================
    const tabLinks = document.querySelectorAll('.custom-menu-tabs .nav-link');
    if (tabLinks.length) {
        tabLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const tab = link.dataset.tab;
                
                // Update active state
                tabLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');

                // Filter menu items
                document.querySelectorAll('.menu-list-img').forEach(img => {
                    const item = img.closest('[data-cat]');
                    if (!item) return;
                    
                    const cats = (item.dataset.cat || '').split(/\s+/);
                    item.classList.toggle('d-none', !cats.includes(tab));
                });
            });
        });
    }

    // ==========================================
    // 4. TESTIMONIAL SLIDER
    // ==========================================
    const initTestimonialSlider = () => {
        const track = document.getElementById('testimonialTrack');
        const slides = track ? track.querySelectorAll('.testimonial-slide') : [];
        const dots = document.querySelectorAll('.dot');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        if (!track || slides.length === 0) return;

        let currentIndex = 0;
        let slideWidth = 0;
        let slidesPerView = getSlidesPerView();
        const totalSlides = slides.length;
        let autoPlayInterval = null;
        const AUTO_PLAY_DELAY = 5000;

        // Calculate slides per view
        function getSlidesPerView() {
            if (window.innerWidth < 576) return 1;
            if (window.innerWidth < 992) return 2;
            return 3;
        }

        // Update slider position
        function updateSlider(animate = true) {
            track.style.transition = animate ? 'transform 0.5s ease-in-out' : 'none';
            const offset = -currentIndex * slideWidth;
            track.style.transform = `translateX(${offset}px)`;
            
            // Update dots
            const maxIndex = totalSlides - slidesPerView;
            const activeDotIndex = currentIndex >= maxIndex ? maxIndex - 1 : currentIndex;
            dots.forEach((dot, i) => {
                dot.classList.toggle('active-dot', i === activeDotIndex);
            });
        }

        // Calculate slide width
        function calculateSlideWidth() {
            const container = track.closest('.testimonial-slider-container');
            if (!container) return;
            
            const containerWidth = container.offsetWidth;
            slidesPerView = getSlidesPerView();
            slideWidth = containerWidth / slidesPerView;
            
            slides.forEach(slide => {
                slide.style.flex = `0 0 ${slideWidth}px`;
                slide.style.minWidth = `${slideWidth}px`;
            });
            
            const maxIndex = totalSlides - slidesPerView;
            if (currentIndex > maxIndex) {
                currentIndex = Math.max(0, maxIndex);
            }
            updateSlider(false);
        }

        // Navigation functions
        const nextSlide = () => {
            const maxIndex = totalSlides - slidesPerView;
            currentIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1;
            updateSlider(true);
            resetAutoPlay();
        };

        const prevSlide = () => {
            const maxIndex = totalSlides - slidesPerView;
            currentIndex = currentIndex <= 0 ? maxIndex : currentIndex - 1;
            updateSlider(true);
            resetAutoPlay();
        };

        const goToSlide = (index) => {
            const maxIndex = totalSlides - slidesPerView;
            currentIndex = Math.min(index, maxIndex);
            updateSlider(true);
            resetAutoPlay();
        };

        // Auto-play
        const startAutoPlay = () => {
            if (autoPlayInterval) clearInterval(autoPlayInterval);
            autoPlayInterval = setInterval(nextSlide, AUTO_PLAY_DELAY);
        };

        const resetAutoPlay = () => {
            if (autoPlayInterval) {
                clearInterval(autoPlayInterval);
                autoPlayInterval = setInterval(nextSlide, AUTO_PLAY_DELAY);
            }
        };

        // Event Listeners
        if (nextBtn) nextBtn.addEventListener('click', nextSlide);
        if (prevBtn) prevBtn.addEventListener('click', prevSlide);

        dots.forEach(dot => {
            dot.addEventListener('click', () => {
                const index = parseInt(dot.dataset.index);
                goToSlide(index);
            });
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') nextSlide();
            if (e.key === 'ArrowLeft') prevSlide();
        });

        // Handle window resize
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(calculateSlideWidth, 250);
        });

        // Pause on hover (desktop)
        const sliderWrapper = track.closest('.testimonial-slider-wrapper');
        if (sliderWrapper) {
            sliderWrapper.addEventListener('mouseenter', () => {
                if (autoPlayInterval) {
                    clearInterval(autoPlayInterval);
                    autoPlayInterval = null;
                }
            });
            sliderWrapper.addEventListener('mouseleave', startAutoPlay);
        }

        // Initialize
        calculateSlideWidth();
        startAutoPlay();

        // Cleanup function (if needed)
        return () => {
            if (autoPlayInterval) clearInterval(autoPlayInterval);
        };
    };

    // Initialize slider after AOS animations complete
    if (typeof AOS !== 'undefined') {
        setTimeout(initTestimonialSlider, 300);
    } else {
        initTestimonialSlider();
    }

    // ==========================================
    // 5. COUNTER ANIMATION (On Scroll)
    // ==========================================
    const counters = document.querySelectorAll('.counter-number');
    if (counters.length) {
        const easeOutQuad = t => t * (2 - t);
        
        const animate = (el, start, end, duration) => {
            let startTime = null;
            const step = (ts) => {
                if (!startTime) startTime = ts;
                const progress = Math.min((ts - startTime) / duration, 1);
                const value = Math.floor(start + (end - start) * easeOutQuad(progress));
                el.textContent = value;
                if (progress < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    if (!el.classList.contains('counted')) {
                        const target = parseInt(el.textContent, 10) || 0;
                        animate(el, 0, target, 1500);
                        el.classList.add('counted');
                    }
                    observer.unobserve(el);
                }
            });
        }, { threshold: 0.6 });

        counters.forEach(c => observer.observe(c));
    }
});


document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const menuCards = Array.from(document.querySelectorAll('.menu-card'));
    const visibleCountEl = document.getElementById('visibleCount');

    // Filtering Function (uses bootstrap 'd-none' to preserve grid layout)
    function filterMenu() {
        const searchTerm = (searchInput.value || '').toLowerCase();
        const category = categoryFilter.value;
        let visible = 0;

        menuCards.forEach(card => {
            const titleEl = card.querySelector('h5');
            const title = titleEl ? titleEl.innerText.toLowerCase() : '';
            const cat = (card.getAttribute('data-category') || '').toLowerCase();

            const matchesSearch = title.includes(searchTerm);
            const matchesCategory = (category === 'all' || cat === category);

            if (matchesSearch && matchesCategory) {
                card.classList.remove('d-none');
                visible += 1;
            } else {
                card.classList.add('d-none');
            }
        });

        if (visibleCountEl) visibleCountEl.textContent = visible;
    }

    // Initialize visible count and attach events
    if (visibleCountEl) visibleCountEl.textContent = menuCards.length;
    searchInput.addEventListener('input', filterMenu);
    categoryFilter.addEventListener('change', filterMenu);
});


