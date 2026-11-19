(function ($) {
    'use strict';

    var thim_landing = {
        slickslider: function () {
            var item_filter = $('.list-demo__item'),
                item_description = $('.list-demo-category-description'),
                wrapper = $('.animation-sequence');
            item_description.hide();
            $(".filter-button-group .list-demo-category__btn").click(function () {
                var item_data = $(this).data('filter');
                $('.filter-button-group .list-demo-category__btn').removeClass('active');
                $(this).addClass('active')

                if (wrapper.length > 0) {
                    item_filter.hide().addClass('demo-hidden');
                    wrapper.find(item_data).each(function (i) {
                        var self = $(this);
                        $(self).show()
                        setTimeout(function () {
                            $(self).removeClass('demo-hidden');
                        }, 80 * (i + 1));
                    });
                    if (item_description.length > 0) {
                        item_description.hide();
                        $(item_data).show();
                    }
                } else {
                    item_filter.hide();
                    item_description.hide();
                    $(item_data).show();
                }

            });
        },
    }
    $(document).ready(function () {
        thim_landing.slickslider;

    })
    $(window).on('elementor/frontend/init', function () {
        elementorFrontend.hooks.addAction('frontend/element_ready/thim-ekits-list-demo.default',
            thim_landing.slickslider)

    })

    // install app
    const installApp = document.getElementById("install-app");
    const actionApp = document.getElementById("action-app");

    if (installApp) {
        installApp.addEventListener('keyup', function () {
            if (actionApp) {
                if (this.value.length > 0) {
                    actionApp.removeAttribute('disabled')
                } else {
                    actionApp.setAttribute('disabled', 'disabled')
                }
            }
        })
    }
    if (actionApp) {
        actionApp.addEventListener("click", function () {
            if (!this.hasAttribute('disabled')) {
                window.open(`https://maxsale.storepify.app/authenticate/oauth?shop=${installApp.value}`, '_blank')
            }
        })
    }

    // Testimonial slick
    $('.slider-content').slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
        fade: true,
        infinite: false,
        asNavFor: '.slider-thumb',
    });
    $('.slider-thumb').slick({
        infinite: true,
        centerPadding: '0',
        slidesToShow: 3,
        slidesToScroll: 1,
        asNavFor: '.slider-content',
        centerMode: true,
        dots: false,
        arrows: false,
        focusOnSelect: true,
        vertical: true,
    });

    $(document).ready(function () {
        $(document).on('click', '#view-more-addons, .popup-tabs .e-n-tabs-heading', function (e) {
            e.stopPropagation()
            $('body').addClass('add-ons-open')
        })

        $(document).on('click', '.close-add-ons, .close-popup-tabs', function (e) {
            $('body').removeClass('add-ons-open')
        })
        $(document).on('click', '.add-ons-more, .e-n-tabs-content > div, .e-n-tabs-content .elementor-widget-image', function (e) {
            e.stopPropagation()
        })
        $(document).on('click', '.demo-show-popup', function (e) {
            e.stopPropagation()
            $(this).toggleClass('show')
        })
        $(document).on('click', '.list-demo__item__popup__content', function (e) {
            e.stopPropagation()
        })
    });

    var $element = $('.elementor-fixed .back-to-top__swapper');

    if ($element) {
        $(window).scroll(function () {
            if ($(this).scrollTop() > 100) {
                $element.addClass('scrolldown').removeClass('scrollup');
            } else {
                $element.addClass('scrollup').removeClass('scrolldown');
            }
        });

        $element.on('click', function () {
            $('html,body').animate({ scrollTop: '0px' }, 800);
            return false;
        });
    }

    jQuery(document).ready(function () {
        const headerOffset = 80;

        function onScroll() {
            const scrollPos = jQuery(document).scrollTop() + headerOffset + 1;

            jQuery('#thim-ekits-menu-landing-eduma a[href^="#"]').each(function () {
                const currLink = jQuery(this);
                const refElement = jQuery(currLink.attr("href"));

                if (refElement.length) {
                    const refTop = refElement.offset().top;
                    const refBottom = refTop + refElement.outerHeight();

                    if (scrollPos >= refTop && scrollPos < refBottom) {
                        jQuery('#thim-ekits-menu-landing-eduma a').removeClass("active");
                        currLink.addClass("active");
                        return false;
                    }
                }
            });
        }

        jQuery(document).on("scroll", onScroll);

        jQuery('#thim-ekits-menu-landing-eduma a[href^="#"]').on('click', function (e) {
            e.preventDefault();

            const target = this.hash;
            const $target = jQuery(target);

            if ($target.length) {
                jQuery(document).off("scroll");

                jQuery('#thim-ekits-menu-landing-eduma a').removeClass('active');
                jQuery(this).addClass('active');

                jQuery('html, body').animate({
                    scrollTop: $target.offset().top - headerOffset
                }, 500, function () {
                    jQuery(document).on("scroll", onScroll);
                    onScroll();
                });
            }
        });

        onScroll();
    });


    // ==========================================
    // Features Autoplay Widget
    // ==========================================
    function initFeaturesAutoplay(wrapper) {
        var tabs = wrapper.querySelectorAll('.features-autoplay__tab');
        var dots = wrapper.querySelectorAll('.features-autoplay__dot');
        var images = wrapper.querySelectorAll('.features-autoplay__image');
        var imageTrack = wrapper.querySelector('.features-autoplay__image-track');
        var imageWrap = wrapper.querySelector('.features-autoplay__image-wrap');
        var trackFill = wrapper.querySelector('.features-autoplay__track-fill');
        var progressBars = wrapper.querySelectorAll('.features-autoplay__progress-bar');
        var accentColor = wrapper.getAttribute('data-accent') || '#3B59FF';
        var autoplayMs = parseInt(wrapper.getAttribute('data-speed'), 10) || 4000;
        var enableAuto = wrapper.getAttribute('data-autoplay') !== 'false';
        var totalTabs = tabs.length;

        if (!totalTabs) return;

        var currentIndex = 0;
        var autoplayTimer = null;

        // ── Filmstrip sizing ─────────────────────────────────
        // Set mỗi image = containerWidth (px), track = N * containerWidth
        function setupTrackSize() {
            if (!imageWrap || !imageTrack) return;
            var w = imageWrap.offsetWidth;
            if (!w) return;
            imageTrack.style.width = (w * totalTabs) + 'px';
            images.forEach(function (img) {
                img.style.width = w + 'px';
                img.style.flexShrink = '0';
            });
        }

        // Slide filmstrip đến đúng vị trí (px)
        function slideToImage(index) {
            if (!imageWrap || !imageTrack) return;
            var w = imageWrap.offsetWidth;
            // Disable transition on first load (no animation at init)
            imageTrack.style.transform = 'translateX(-' + (index * w) + 'px)';
        }

        // ── Position dots evenly along track ─────────────────
        function positionDots() {
            var trackEl = wrapper.querySelector('.features-autoplay__track');
            if (!trackEl || !trackEl.offsetHeight) return;
            dots.forEach(function (dot, i) {
                var pct = totalTabs > 1 ? (i / (totalTabs - 1)) * 100 : 50;
                dot.style.top = pct + '%';
            });
        }

        // ── Update track fill + dot colors ───────────────────
        function updateTrack(activeIndex) {
            var pct = totalTabs > 1 ? (activeIndex / (totalTabs - 1)) * 100 : 100;
            if (trackFill) {
                trackFill.style.height = pct + '%';
                trackFill.style.background = accentColor;
            }
            dots.forEach(function (dot, i) {
                if (i < activeIndex) {
                    // Passed dot: solid accent
                    dot.style.background = accentColor;
                    dot.style.borderColor = accentColor;
                    dot.style.boxShadow = 'none';
                } else if (i === activeIndex) {
                    // Active dot: white fill + accent ring (droip style)
                    dot.style.background = '#ffffff';
                    dot.style.borderColor = accentColor;
                    dot.style.boxShadow = '0 0 0 4px ' + hexToRgba(accentColor, 0.18);
                } else {
                    // Future dot: gray
                    dot.style.background = '#d8d8d8';
                    dot.style.borderColor = 'transparent';
                    dot.style.boxShadow = 'none';
                }
                dot.classList.toggle('is-active', i === activeIndex);
            });
        }

        // Helper: hex color → rgba string
        function hexToRgba(hex, alpha) {
            var r = 0, g = 0, b = 0;
            if (hex.length === 4) {
                r = parseInt(hex[1] + hex[1], 16);
                g = parseInt(hex[2] + hex[2], 16);
                b = parseInt(hex[3] + hex[3], 16);
            } else if (hex.length === 7) {
                r = parseInt(hex.slice(1, 3), 16);
                g = parseInt(hex.slice(3, 5), 16);
                b = parseInt(hex.slice(5, 7), 16);
            }
            return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
        }

        // ── Activate tab by index ─────────────────────────────
        function activateTab(index) {
            index = Math.max(0, Math.min(index, totalTabs - 1));

            // Reset progress bars instantly
            progressBars.forEach(function (bar) {
                bar.style.transition = 'none';
                bar.style.width = '0%';
            });

            // Tab classes
            tabs.forEach(function (tab) { tab.classList.remove('is-active'); });
            if (tabs[index]) tabs[index].classList.add('is-active');

            // Slide filmstrip
            slideToImage(index);

            currentIndex = index;
            updateTrack(index);

            // Restart progress bar animation
            if (enableAuto) {
                setTimeout(function () {
                    var bar = progressBars[index];
                    if (bar) {
                        bar.style.transition = 'width ' + autoplayMs + 'ms linear';
                        bar.style.width = '100%';
                    }
                }, 30);
            }
        }

        // ── Autoplay ──────────────────────────────────────────
        function nextTab() {
            activateTab((currentIndex + 1) % totalTabs);
        }
        function startAutoplay() {
            if (!enableAuto) return;
            stopAutoplay();
            autoplayTimer = setInterval(nextTab, autoplayMs);
        }
        function stopAutoplay() {
            if (autoplayTimer) { clearInterval(autoplayTimer); autoplayTimer = null; }
        }

        // ── Events ────────────────────────────────────────────
        tabs.forEach(function (tab, i) {
            tab.addEventListener('click', function () {
                stopAutoplay(); activateTab(i); startAutoplay();
            });
        });
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                stopAutoplay(); activateTab(i); startAutoplay();
            });
        });

        // ── Init — disable transition for first paint ─────────
        function init() {
            setupTrackSize();
            positionDots();

            // No transition on first render
            if (imageTrack) imageTrack.style.transition = 'none';
            activateTab(0);

            // Re-enable transition after first paint
            requestAnimationFrame(function () {
                requestAnimationFrame(function () {
                    if (imageTrack) imageTrack.style.transition = '';
                    startAutoplay();
                });
            });
        }

        init();

        // Resize: re-setup sizes + re-slide without animation
        var resizeTimer;
        window.addEventListener('resize', function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
                if (imageTrack) imageTrack.style.transition = 'none';
                setupTrackSize();
                slideToImage(currentIndex);
                positionDots();
                updateTrack(currentIndex);
                requestAnimationFrame(function () {
                    if (imageTrack) imageTrack.style.transition = '';
                });
            }, 100);
        });
    }

    // Init all features-autoplay widgets on page
    function initAllFeaturesAutoplay() {
        var wrappers = document.querySelectorAll('.features-autoplay');
        wrappers.forEach(function (w) {
            if (!w.getAttribute('data-fa-init')) {
                w.setAttribute('data-fa-init', '1');
                initFeaturesAutoplay(w);
            }
        });
    }

    $(document).ready(function () {
        initAllFeaturesAutoplay();
    });

    $(window).on('elementor/frontend/init', function () {
        elementorFrontend.hooks.addAction(
            'frontend/element_ready/thim-ekits-features-autoplay.default',
            function ($element) {
                var w = $element[0].querySelector('.features-autoplay');
                if (w) {
                    w.setAttribute('data-fa-init', '');
                    initFeaturesAutoplay(w);
                }
            }
        );
    });

})(jQuery);


// ==========================================
// Animation Box with GSAP ScrollTrigger (Optimized)
// ==========================================
var thim_animation = {
    initialized: false,
    animation_box: function () {
        // Prevent multiple initializations
        if (thim_animation.initialized) return;
        
        jQuery(document).ready(function ($) {
            // Skip animations on mobile/tablet (1024px and below)
            if (window.innerWidth <= 1024) {
                // Just show elements immediately without animation
                const animateElements = document.querySelectorAll('.animate-box, .animate-box-group > *');
                animateElements.forEach(element => {
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                });
                thim_animation.initialized = true;
                return;
            }
            
            // Check if there are any animate elements on page first
            const animateElements = document.querySelectorAll('.animate-box, .animate-box-group');
            if (animateElements.length === 0) return;

            // Check if GSAP and ScrollTrigger are available
            if (typeof gsap === 'undefined') {
                // console.warn('GSAP not loaded, using lightweight fallback');
                
                // Lightweight IntersectionObserver fallback
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            if (entry.target.parentElement && entry.target.parentElement.classList.contains('animate-box-group')) {
                                // For group children, add staggered delay
                                const siblings = Array.from(entry.target.parentElement.children);
                                const index = siblings.indexOf(entry.target);
                                setTimeout(() => {
                                    entry.target.classList.add('animate-in');
                                }, index * 200);
                            } else {
                                // For single elements, animate immediately
                                entry.target.classList.add('animate-in');
                            }
                            observer.unobserve(entry.target);
                        }
                    });
                }, {
                    threshold: 0.1,
                    rootMargin: '0px 0px -50px 0px'
                });

                // Observe all animate elements and their children
                document.querySelectorAll('.animate-box, .animate-box-group > *').forEach(element => {
                    observer.observe(element);
                });
                thim_animation.initialized = true;
                return;
            }

            gsap.registerPlugin(ScrollTrigger);

            // Batch process single animate-box elements
            const singleBoxes = document.querySelectorAll('.animate-box');
            if (singleBoxes.length > 0) {
                gsap.set(singleBoxes, { opacity: 0, y: 50 });
                
                singleBoxes.forEach(box => {
                    gsap.to(box, {
                        opacity: 1,
                        y: 0,
                        duration: 1.2,
                        ease: "power2.out",
                        scrollTrigger: {
                            trigger: box,
                            start: "top 95%",
                            toggleActions: "play none none none",
                        },
                    });
                });
            }

            // Batch process group animate-box elements
            const groupBoxes = document.querySelectorAll('.animate-box-group');
            groupBoxes.forEach(group => {
                const children = Array.from(group.children);
                if (children.length === 0) return;
                
                gsap.set(children, { opacity: 0, y: 50 });
                
                children.forEach((child, index) => {
                    gsap.to(child, {
                        opacity: 1,
                        y: 0,
                        duration: 1.2,
                        ease: "power2.out",
                        delay: index * 0.2,
                        scrollTrigger: {
                            trigger: child,
                            start: "top 95%",
                            toggleActions: "play none none none",
                        },
                    });
                });
            });

            thim_animation.initialized = true;
        });
    }
};

// Initialize animations
jQuery(document).ready(function ($) {
    thim_animation.animation_box();
    
    // Button hover effect (separate from animation_box)
    $(".animate-button-hover").on("mouseenter", function(e) {
        let rect = this.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;
        $(this).css("--x", x + "px");
        $(this).css("--y", y + "px");
    });
    
    // Handle window resize - disable animations if resized to mobile
    let resizeTimer;
    $(window).on('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            if (window.innerWidth <= 1024) {
                // Disable animations on resize to mobile
                const animateElements = document.querySelectorAll('.animate-box, .animate-box-group > *');
                animateElements.forEach(element => {
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                });
            }
        }, 250);
    });
});

// Re-init for Elementor (only if not already initialized)
jQuery(window).on('elementor/frontend/init', function () {
    elementorFrontend.hooks.addAction('frontend/element_ready/global', function() {
        if (!thim_animation.initialized) {
            setTimeout(thim_animation.animation_box, 100);
        }
    });
});


// List Video
let playItems = document.querySelectorAll(".list-play__item");
if (playItems.length > 0) {
    playItems.forEach(function (link, index) {
        link.addEventListener("click", function (event) {
            let target = null
            if (event.target.classList.contains('list-play__item')) {
                target = event.target
            }
            if (event.target.closest('.list-play__item')) {
                target = event.target.closest('.list-play__item')
            }
            let dataList = target.getAttribute("data-list");
            let arrDataList = dataList.split('-')
            let keyLast = arrDataList[arrDataList.length - 1]
            let listVideo = target.closest(".list-video__wapper");
            let videoActive = listVideo.querySelector(".list-play__item.active");
            if (videoActive) {
                videoActive.classList.remove("active");
            }
            link.classList.add("active");
            let boxes = listVideo.querySelectorAll(".list-play__video");
            boxes.forEach((box, indexChild) => {
                box.classList.remove("active");
                let arrDataListTmp = box.getAttribute("data-list").split('-')
                let keyLastTmp = arrDataListTmp[arrDataListTmp.length - 1]
                if (parseInt(keyLast) === parseInt(keyLastTmp)) {
                    box.classList.add("active");
                }
            });
        });
    });
}

jQuery(window).on('elementor/frontend/init', () => {
    const addHandler = ($element) => {
        elementorFrontend.elementsHandler.addHandler(window.ThimEkits.ThimSlider, {
            $element,
        });
    };
    elementorFrontend.hooks.addAction('frontend/element_ready/thim-ekits-slide-custom.default', addHandler);
});

