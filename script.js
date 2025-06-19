document.addEventListener("DOMContentLoaded", function () {
  // ======================
  // 1. Smooth Scrolling
  // ======================
  function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        e.preventDefault();
        const targetId = this.getAttribute("href");
        if (targetId === "#") return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          window.scrollTo({
            top: targetElement.offsetTop - 80,
            behavior: "smooth",
          });
        }
      });
    });
  }

  // ======================
  // 2. Active Navigation
  // ======================
  function setupActiveNavHighlight() {
    const sections = document.querySelectorAll("section");
    const navItems = document.querySelectorAll("nav ul li a");

    window.addEventListener("scroll", function () {
      let current = "";
      sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;

        if (pageYOffset >= sectionTop - 100) {
          current = section.getAttribute("id");
        }
      });

      navItems.forEach((item) => {
        item.classList.remove("active");
        if (item.getAttribute("href").includes(current)) {
          item.classList.add("active");
        }
      });
    });
  }

  // ======================
  // 3. Mobile Menu (Fixed Version)
  // ======================
  function setupMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav');

    if (!menuToggle || !nav) {
      console.error("Mobile menu elements not found!");
      return;
    }

    menuToggle.addEventListener('click', function() {
      nav.classList.toggle('active');
    });

    document.querySelectorAll('nav ul li a').forEach(link => {
      link.addEventListener('click', function() {
        nav.classList.remove('active');
      });
    });
  }

  // ======================
  // 4. Scroll Animations
  // ======================
  function setupScrollAnimations() {
    const animateElements = [
      ".education-item",
      ".project-item",
      ".service-item",
      ".timeline-item",
      ".animate-in",
      ".experience-section .animate-in"
    ].map(selector => document.querySelectorAll(selector))
     .flat();

    animateElements.forEach((element) => {
      if (element) {
        element.style.opacity = "0";
        element.style.transform = "translateY(30px)";
        element.style.transition = "all 0.6s ease";
      }
    });

    const animateOnScroll = function () {
      animateElements.forEach((element) => {
        if (element) {
          const elementPosition = element.getBoundingClientRect().top;
          const windowHeight = window.innerHeight;

          if (elementPosition < windowHeight - 100) {
            element.style.opacity = "1";
            element.style.transform = "translateY(0)";
          }
        }
      });
    };

    window.addEventListener("scroll", animateOnScroll);
    animateOnScroll();
  }

  // ======================
  // 5. Image Handling
  // ======================
  function setupImageHandling() {
    document.querySelectorAll(".edu-image img").forEach((img) => {
      const handleImageLoad = function () {
        const container = this.closest(".edu-image");
        if (this.naturalHeight > this.naturalWidth) {
          container?.classList.add("portrait");
        } else {
          container?.classList.remove("portrait");
        }
      };

      img.onload = handleImageLoad;
      if (img.complete) handleImageLoad.call(img);
    });
  }

  // ======================
  // 6. Project Sliders
  // ======================
  function setupProjectSliders() {
    document.querySelectorAll(".project-slider").forEach((slider) => {
      const slides = slider.querySelector(".slides");
      const slideItems = slider.querySelectorAll(".slide");
      const prevBtn = slider.querySelector(".prev");
      const nextBtn = slider.querySelector(".next");

      let currentIndex = 0;
      const totalSlides = slideItems.length;

      function updateSlider() {
        slides.style.transform = `translateX(-${currentIndex * 100}%)`;
      }

      nextBtn?.addEventListener("click", () => {
        currentIndex = (currentIndex + 1) % totalSlides;
        updateSlider();
      });

      prevBtn?.addEventListener("click", () => {
        currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        updateSlider();
      });

      let touchStartX = 0;
      let touchEndX = 0;

      slides?.addEventListener("touchstart", (e) => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      slides?.addEventListener("touchend", (e) => {
        touchEndX = e.changedTouches[0].screenX;
        if (touchEndX < touchStartX - 50) {
          currentIndex = (currentIndex + 1) % totalSlides;
        } else if (touchEndX > touchStartX + 50) {
          currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        }
        updateSlider();
      }, { passive: true });

      updateSlider();
    });
  }

  // ======================
  // Initialize Everything
  // ======================
  function init() {
    setupSmoothScrolling();
    setupActiveNavHighlight();
    setupMobileMenu();
    setupScrollAnimations();
    setupImageHandling();
    setupProjectSliders();
  }

  init();
});

document.addEventListener("DOMContentLoaded", function() {
  // Mobile Menu Functionality
  function setupMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav');
    
    if (menuToggle && nav) {
      // Toggle menu on click
      menuToggle.addEventListener('click', function() {
        nav.classList.toggle('active');
        
        // Prevent body scroll when menu is open
        if (nav.classList.contains('active')) {
          document.body.style.overflow = 'hidden';
        } else {
          document.body.style.overflow = '';
        }
      });
      
      // Close menu when clicking on a link
      document.querySelectorAll('nav ul li a').forEach(link => {
        link.addEventListener('click', function() {
          nav.classList.remove('active');
          document.body.style.overflow = '';
        });
      });
      
      // Close menu when clicking outside
      document.addEventListener('click', function(e) {
        if (!nav.contains(e.target) && !menuToggle.contains(e.target)) {
          nav.classList.remove('active');
          document.body.style.overflow = '';
        }
      });
    }
  }

  // Active Navigation Highlight
  function setupActiveNavHighlight() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('nav ul li a');
    
    window.addEventListener('scroll', function() {
      let current = '';
      
      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (window.scrollY >= sectionTop - 100) {
          current = section.getAttribute('id');
        }
      });
      
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').includes(current)) {
          link.classList.add('active');
        }
      });
    });
  }

  // Initialize all navigation-related functions
  function initNavigation() {
    setupMobileMenu();
    setupActiveNavHighlight();
  }

  // Start initialization
  initNavigation();
});