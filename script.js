

document.addEventListener('DOMContentLoaded', () => {

    console.log("DOM Content Loaded. Initializing script..."); // DEBUG LOG

    // --- === Global Setup === --- 
    try { // Add error handling for critical setup
        // Ensure ScrollToPlugin is also registered
        gsap.registerPlugin(ScrollTrigger, TextPlugin, ScrollToPlugin);
        console.log("GSAP Plugins Registered."); // DEBUG LOG
    } catch (e) {
        console.error("Failed to register GSAP plugins:", e);
        alert("Error initializing animations. Please check the console (F12)."); // User feedback
        return; // Stop script execution if plugins fail
    }

    const body = document.body;
    const header = document.getElementById('header');
    const navbarHeight = header ? header.offsetHeight : 70; // Fallback height

    // --- === 1. Custom Cursor (Optional) === --- 
    // ENTIRE CUSTOM CURSOR BLOCK REMOVED
    console.log("Custom Cursor Feature Disabled."); // DEBUG LOG


    // --- === 2. Smooth Scrolling & Active Nav Link === --- 
    console.log("Setting up Smooth Scroll & Nav Links."); // DEBUG LOG
    const navLinks = document.querySelectorAll('.nav-link');

    // Smooth scroll for internal links using GSAP ScrollToPlugin
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            // Ensure it's an internal link
            if (targetId && targetId.startsWith('#')) {
                e.preventDefault();
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    console.log(`Scrolling to: ${targetId}`); // Debug Log
                    gsap.to(window, {
                        duration: 1, // Duration of the scroll
                        scrollTo: {
                            y: targetElement, // Target element
                            offsetY: navbarHeight // Offset for fixed header
                        },
                        ease: "power2.inOut" // Smoother easing function
                    });
                    // Close mobile menu if open after clicking a link
                    closeMobileMenu();
                } else {
                    console.warn(`Target element not found for link: ${targetId}`); // Debug Log
                }
            }
        });
    });

    // Active link highlighting using ScrollTrigger
    document.querySelectorAll('main section[id]').forEach(section => {
        ScrollTrigger.create({
            trigger: section,
            start: `top ${navbarHeight + 100}px`, // Trigger when section top is 100px below the header bottom
            end: `bottom ${navbarHeight + 100}px`, // Trigger when section bottom is 100px below the header bottom
            // markers: true, // Uncomment for debugging scroll trigger positions
            onEnter: () => setActiveLink(section.id),
            onEnterBack: () => setActiveLink(section.id),
        });
    });

    function setActiveLink(sectionId) {
        console.log(`Setting active link for section: ${sectionId}`); // Debug Log
        navLinks.forEach(link => {
            link.classList.remove('active'); // Remove active from all first
            if (link.getAttribute('href') === `#${sectionId}`) {
                link.classList.add('active'); // Add to the matching link
            }
        });
        if ((window.pageYOffset < window.innerHeight * 0.6 && sectionId !== 'hero') || window.pageYOffset === 0) {
            if (window.pageYOffset === 0) console.log("At top, activating hero link."); // Debug Log
            navLinks.forEach(link => link.classList.remove('active')); // Ensure others aren't active
            const homeLink = document.querySelector('.nav-link[href="#hero"]');
            if (homeLink && !homeLink.classList.contains('active')) { // Only add if not already active
                homeLink.classList.add('active');
            }
        }
    }

    // Set initial active link on page load
    setTimeout(() => {
        console.log("Setting initial active link."); // DEBUG LOG
        let topSectionId = 'hero'; // Default
        let minTop = window.innerHeight;
        document.querySelectorAll('main section[id]').forEach(sec => {
            const rect = sec.getBoundingClientRect();
            if (rect.top >= -navbarHeight - 50 && rect.top < minTop) {
                minTop = rect.top;
                topSectionId = sec.id;
            }
        });
        setActiveLink(topSectionId);
    }, 250);

    // --- === 3. Header Scroll Effect === --- 
    console.log("Setting up Header Scroll Effect."); // DEBUG LOG
    ScrollTrigger.create({
        start: 'top -80',
        end: 99999,
        toggleClass: { className: 'scrolled', targets: '#header' }
    });

    // --- === 4. Mobile Menu Toggle === --- 
    console.log("Setting up Mobile Menu."); // DEBUG LOG
    const menuToggle = document.getElementById('menu-toggle');
    const navUl = document.querySelector('#navbar ul');

    if (menuToggle && navUl) {
        menuToggle.innerHTML = '<i class="fas fa-bars"></i><i class="fas fa-times" style="display: none;"></i>';
        menuToggle.addEventListener('click', () => {
            navUl.classList.toggle('active');
            menuToggle.classList.toggle('active');
            const isExpanded = navUl.classList.contains('active');
            menuToggle.setAttribute('aria-expanded', isExpanded);
            body.style.overflow = isExpanded ? 'hidden' : '';

            const iconBars = menuToggle.querySelector('.fa-bars');
            const iconTimes = menuToggle.querySelector('.fa-times');
            if (iconBars && iconTimes) {
                iconBars.style.display = isExpanded ? 'none' : 'inline-block';
                iconTimes.style.display = isExpanded ? 'inline-block' : 'none';
            }
        });
    }
    function closeMobileMenu() {
        if (navUl && navUl.classList.contains('active')) {
            navUl.classList.remove('active');
            menuToggle.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
            body.style.overflow = '';
            const iconBars = menuToggle.querySelector('.fa-bars');
            const iconTimes = menuToggle.querySelector('.fa-times');
            if (iconBars && iconTimes) {
                iconBars.style.display = 'inline-block';
                iconTimes.style.display = 'none';
            }
        }
    }

    // --- === 5. GSAP Hero Section Animation === --- 
    console.log("Setting up Hero Animation."); // DEBUG LOG
    const heroTl = gsap.timeline({
        defaults: { ease: "power3.out", duration: 0.8 },
        onStart: () => console.log("Hero Timeline Started"),
        onComplete: () => console.log("Hero Timeline Completed"),
        onInterrupt: () => console.warn("Hero Timeline Interrupted")
    });
    if (
        document.querySelector('.hero-title') &&
        document.querySelector('#typing-effect') &&
        document.querySelector('.hero-description')
    ) {
        heroTl
            .from('.hero-title', { opacity: 0, y: 50, duration: 1.0 }, "+=0.3")
            .to(
                '#typing-effect',
                {
                    duration: 2.5,
                    text: {
                        value: "Software Engineering B.Tech Student | QA Tester | Full-Stack & IoT Developer",
                        delimiter: " "
                    },
                    ease: "none"
                },
                "-=0.5"
            )
            .from('.hero-description', { opacity: 0, y: 20, duration: 0.6 }, "-=1.5")
            .from('.hero-links .btn', { opacity: 0, y: 20, stagger: 0.2, duration: 0.5 }, "-=1.2")
            .from('.scroll-down-indicator', { opacity: 0, y: -20, duration: 1, ease: "bounce.out" }, "-=0.5");
        console.log("Hero Animation Timeline Created.");
    } else {
        console.error("Hero animation elements not found!");
    }

    // --- === 6. GSAP Scroll-Triggered Animations === --- 
    console.log("Setting up Scroll-Triggered Animations."); // DEBUG LOG
    function createFadeUpAnimation(triggerElement, targets, staggerAmount = 0.2) {
        const targetElements = gsap.utils.toArray(targets);
        if (targetElements.length > 0) {
            gsap.from(targetElements, {
                scrollTrigger: {
                    trigger: triggerElement,
                    start: "top 85%",
                    toggleActions: "play none none none",
                },
                opacity: 0,
                y: 50,
                duration: 0.8,
                stagger: staggerAmount,
                ease: "power2.out",
            });
        } else {
            console.warn("No targets found for fade-up animation with trigger:", triggerElement);
        }
    }
    try {
        gsap.utils.toArray('.section-title').forEach(title =>
            createFadeUpAnimation(title, title, 0)
        );
        createFadeUpAnimation('#about .grid-about', '#about .about-text > *, #about .about-image', 0.15);
        createFadeUpAnimation('#projects .filter-buttons', '#projects .filter-buttons .btn', 0.1);
        gsap.utils.toArray('.project-item').forEach(item => createFadeUpAnimation(item, item, 0));
        gsap.utils.toArray('.education-item').forEach((item) => {
            const delay = parseFloat(item.dataset.animDelay || 0);
            gsap.from(item, {
                scrollTrigger: {
                    trigger: item,
                    start: "top 85%",
                    toggleActions: "play none none none"
                },
                opacity: 0,
                y: 50,
                duration: 0.8,
                delay: delay,
                ease: "power2.out",
            });
        });
        gsap.from('.skill-category', {
            scrollTrigger: {
                trigger: '.skills-container',
                start: "top 80%",
                toggleActions: "play none none none"
            },
            opacity: 0,
            y: 30,
            duration: 0.6,
            stagger: 0.1,
            ease: "power1.out",
        });
        createFadeUpAnimation(
            '#contact .contact-container',
            '#contact .contact-subtitle, #contact .contact-methods .contact-card, #contact .contact-location',
            0.15
        );
        gsap.utils.toArray('.timeline-item').forEach((item, index) => {
            const direction = index % 2 === 0 ? 'right' : 'left';
            gsap.from(item.querySelector('.timeline-content'), {
                scrollTrigger: {
                    trigger: item,
                    start: "top 90%",
                    toggleActions: "play none none none"
                },
                opacity: 0,
                x: direction === 'left' ? -60 : 60,
                duration: 0.8,
                ease: "power2.out",
            });
            gsap.from(item, {
                scrollTrigger: {
                    trigger: item,
                    start: "top 95%",
                    toggleActions: "play none none none"
                },
                opacity: 0,
                duration: 0.5,
            });
        });
        console.log("Scroll-Triggered Animations Applied.");
    } catch (e) {
        console.error("Error applying ScrollTrigger animations:", e);
    }

    // --- === 7. Project Filtering === --- 
    console.log("Setting up Project Filtering."); // DEBUG LOG
    const filterButtons = document.querySelectorAll('.btn-filter');
    const projectItems = document.querySelectorAll('.project-item');

    // Ensure initial state correct for display filtering
    projectItems.forEach(item => {
        item.style.opacity = 1;
        item.style.transform = 'none';
        item.style.display = 'flex';
    });

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filterValue = button.getAttribute('data-filter');
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            console.log(`Filtering projects by: ${filterValue}`);
            let hasVisibleItems = false;
            projectItems.forEach(item => {
                const techTags = item.getAttribute('data-tech')
                    ? item.getAttribute('data-tech').split(' ')
                    : [];
                const shouldShow = filterValue === 'all' || techTags.includes(filterValue);
                item.style.display = shouldShow ? 'flex' : 'none';
                if (shouldShow) hasVisibleItems = true;
            });
            setTimeout(() => {
                ScrollTrigger.refresh();
                console.log("ScrollTrigger refreshed after filtering.");
            }, 50);
        });
    });

    // --- === 8. Project Modals === --- 
    console.log("Setting up Project Modals."); // DEBUG LOG
    const modalTriggers = document.querySelectorAll('[data-modal-target]');
    const modals = document.querySelectorAll('.modal');
    const modalCloses = document.querySelectorAll('.modal-close');
    let lastFocusedElement;

    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const modalId = trigger.getAttribute('data-modal-target');
            const modal = document.getElementById(modalId);
            if (modal) openModal(modal);
        });
        trigger.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const modalId = trigger.getAttribute('data-modal-target');
                const modal = document.getElementById(modalId);
                if (modal) openModal(modal);
            }
        });
    });

    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal(modal);
        });
    });

    modalCloses.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            if (modal) closeModal(modal);
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal.active');
            if (activeModal) closeModal(activeModal);
        }
    });

    function openModal(modal) {
        console.log(`Opening modal: #${modal.id}`);
        lastFocusedElement = document.activeElement;
        modal.classList.add('active');
        body.style.overflow = 'hidden';
        setTimeout(() => {
            const focusableElements = modal.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const firstFocusable =
                modal.querySelector('.modal-close') ||
                (focusableElements.length > 0 ? focusableElements[0] : null);
            if (firstFocusable) {
                firstFocusable.focus();
                console.log("Focused element in modal:", firstFocusable);
            }
        }, 100);
    }

    function closeModal(modal) {
        console.log(`Closing modal: #${modal.id}`);
        modal.classList.remove('active');
        body.style.overflow = '';
        if (lastFocusedElement) {
            console.log("Returning focus to:", lastFocusedElement);
            try {
                lastFocusedElement.focus();
            } catch (e) {
                console.warn("Could not return focus:", e);
            }
        }
    }

    // --- === 9. Footer Current Year === --- 
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    // --- === 10. Optional: Particle Background === --- 
    const useParticleBg = false; // KEEP FALSE
    const particlesContainer = document.getElementById('particles-js');
    if (particlesContainer) {
        if (useParticleBg && typeof particlesJS !== 'undefined') {
            console.log("Initializing particles.js background.");
            particlesJS('particles-js', { /* config */ });
        } else {
            console.log("Particle background disabled or particles.js library not loaded.");
            particlesContainer.style.display = 'none';
        }
    }

    // --- === 11. Refresh ScrollTrigger on Load/Resize === --- 
    console.log("Setting up Load/Resize listeners for ScrollTrigger.refresh().");
    window.addEventListener('load', () => {
        console.log("Window Loaded. Refreshing ScrollTrigger.");
        setTimeout(() => {
            ScrollTrigger.refresh();
            console.log("ScrollTrigger refreshed after load.");
            let topSectionId = 'hero';
            let minTop = window.innerHeight;
            document.querySelectorAll('main section[id]').forEach(sec => {
                const rect = sec.getBoundingClientRect();
                if (rect.top >= -navbarHeight - 50 && rect.top < minTop) {
                    minTop = rect.top;
                    topSectionId = sec.id;
                }
            });
            setActiveLink(topSectionId);
            console.log("Initial active link set after load refresh.");
        }, 300);
    });

    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            console.log("Window Resized. Refreshing ScrollTrigger.");
            ScrollTrigger.refresh();
        }, 250);
    });

    console.log("Enhanced Portfolio Script Initialized Successfully.");

}); // End DOMContentLoaded
