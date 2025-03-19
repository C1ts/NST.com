document.addEventListener('DOMContentLoaded', function() {
    // Debug variables
    const debug = {
        isScrolling: false,
        lastScrollPosition: 0,
        headerVisible: true
    };

    // Sample code with debugger statements
    function initializeDebugging() {
        console.log('Debugging initialized');
        // Debugger statement to pause execution in developer tools
        debugger;
        
        // This will help track scroll events for troubleshooting
        debug.isDebuggingEnabled = true;
        
        console.log('Debug mode enabled:', debug.isDebuggingEnabled);
        // Another debugger statement to pause execution
        debugger;
        
        return debug.isDebuggingEnabled;
    }

    // Initialize debugging if in development environment
    const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isDev) {
        initializeDebugging();
    }

    // Header scroll behavior
    const header = document.getElementById('main-header');
    let lastScrollY = window.scrollY;
    let scrollDirection = 'up';
    let scrollTimer;
    const scrollThreshold = 20; // How much scroll before direction change is detected
    const hideThreshold = 150; // How far down the page before header can hide

    // Handle scrolling behavior for header
    function handleHeaderScroll() {
        const currentScrollY = window.scrollY;
        
        // Determine scroll direction with improved sensitivity
        if (currentScrollY > lastScrollY + scrollThreshold) {
            scrollDirection = 'down';
        } else if (currentScrollY < lastScrollY - scrollThreshold) {
            scrollDirection = 'up';
        }
        
        // Apply header visibility based on scroll direction and position
        if (scrollDirection === 'down' && currentScrollY > hideThreshold) {
            header.classList.add('hidden');
        } else if (scrollDirection === 'up' || currentScrollY <= hideThreshold) {
            header.classList.remove('hidden');
        }
        
        // Apply scrolled class regardless of direction
        if (currentScrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        lastScrollY = currentScrollY;
        
        // Clear existing timer and set a new one
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => {
            // If user stops scrolling near the top, always show the header
            if (currentScrollY < hideThreshold) {
                header.classList.remove('hidden');
            }
        }, 250);
    }

    // Throttled event listener for scroll
    window.addEventListener('scroll', throttle(handleHeaderScroll, 50));

    // Better throttle function for smoother behavior
    function throttle(func, limit) {
        let lastFunc;
        let lastRan;
        return function() {
            const context = this;
            const args = arguments;
            if (!lastRan) {
                func.apply(context, args);
                lastRan = Date.now();
            } else {
                clearTimeout(lastFunc);
                lastFunc = setTimeout(function() {
                    if ((Date.now() - lastRan) >= limit) {
                        func.apply(context, args);
                        lastRan = Date.now();
                    }
                }, limit - (Date.now() - lastRan));
            }
        };
    }

    // Counter animation for stats
    function animateCounters() {
        const counters = document.querySelectorAll('.stat-number');
        const speed = 500; // Increased from 200 - higher value = slower animation
        
        counters.forEach(counter => {
            // Only animate if not already animated
            if (counter.classList.contains('animated')) return;
            
            const target = +counter.getAttribute('data-count');
            let count = 0;
            
            const updateCount = () => {
                const increment = target / speed;
                
                if (count < target) {
                    count += increment;
                    counter.textContent = Math.ceil(count);
                    setTimeout(updateCount, 5); // Increased from 1 to 5 milliseconds
                } else {
                    counter.textContent = target;
                    counter.classList.add('animated');
                }
            };
            
            updateCount();
        });
    }

    // Enhanced scroll animations
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Add visible class to trigger animation
                    entry.target.classList.add('visible');
                    
                    // If this is a stats section, start the counter animation
                    if (entry.target.closest('#stats')) {
                        animateCounters();
                    }
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        elements.forEach(element => {
            observer.observe(element);
        });
    };
    
    // Initialize animation on scroll
    animateOnScroll();

    // FAQ accordion functionality
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        const answer = question.nextElementSibling;
        
        // Initially hide all answers except the first one
        if (question !== faqQuestions[0]) {
            answer.style.display = 'none';
        }
        
        question.addEventListener('click', function() {
            // Toggle active class
            this.classList.toggle('active');
            
            // Toggle answer visibility
            if (answer.style.display === 'none' || answer.style.display === '') {
                answer.style.display = 'block';
            } else {
                answer.style.display = 'none';
            }
        });
    });

    // Initialize with first FAQ open
    if (faqQuestions.length > 0) {
        faqQuestions[0].classList.add('active');
        const firstAnswer = faqQuestions[0].nextElementSibling;
        if (firstAnswer) {
            firstAnswer.style.display = 'block';
        }
    }

    // Mobile menu toggle with animation
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('nav ul');
    
    // Toggle mobile menu
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            navMenu.classList.toggle('show');
        });
    }
    
    // Close mobile menu when clicking on a link
    const navLinks = document.querySelectorAll('nav ul li a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (navMenu.classList.contains('show')) {
                navMenu.classList.remove('show');
                menuToggle.classList.remove('active');
            }
        });
    });
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Calculate the offset to account for fixed header
                const headerHeight = header ? header.offsetHeight : 0;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Close mobile menu after clicking
                if (navMenu && navMenu.classList.contains('show')) {
                    navMenu.classList.remove('show');
                }
            }
        });
    });
    
    // Observer specifically for stats section
    const statsSection = document.getElementById('stats');
    
    if (statsSection) {
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Trigger counter animation when stats section is visible
                    animateCounters();
                    statsObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.2
        });
        
        statsObserver.observe(statsSection);
    }
    
    // Add parallax effect to hero background
    const heroSection = document.getElementById('hero');
    const heroBackground = document.querySelector('.hero-background');
    
    if (heroSection && heroBackground) {
        window.addEventListener('scroll', throttle(function() {
            const scrollPosition = window.scrollY;
            if (scrollPosition < heroSection.offsetHeight) {
                const translateY = scrollPosition * 0.3;
                heroBackground.style.transform = `translateY(${translateY}px)`;
                
                // Also adjust opacity for a fade effect
                const opacity = 1 - (scrollPosition / (heroSection.offsetHeight * 0.8));
                heroBackground.style.opacity = Math.max(opacity, 0.2);
            }
        }, 20));
    }
    
    // Animate video reveal
    const videoContainer = document.querySelector('.video-container');
    if (videoContainer) {
        setTimeout(() => {
            videoContainer.classList.add('animate__animated', 'animate__fadeIn');
            videoContainer.style.opacity = 1;
        }, 500);
    }
    
    // Hover effects for feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            const iconElement = this.querySelector('.feature-icon');
            if (iconElement) {
                iconElement.style.animation = 'none';
                setTimeout(() => {
                    iconElement.style.animation = 'float 3s ease-in-out infinite';
                }, 10);
            }
        });
    });
    
    // Add hover effects to elements
    function addHoverEffects() {
        // Add more hover effects here if needed
    }
    
    // Initialize hover effects
    addHoverEffects();
}); 