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
  // 3. Mobile Menu
  // ======================
  function setupMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav');
    
    menuToggle.addEventListener('click', function() {
      nav.classList.toggle('active');
      menuToggle.classList.toggle('active');
    });

    // Close menu when clicking on a link
    const navLinks = document.querySelectorAll('nav ul li a');
    navLinks.forEach(link => {
      link.addEventListener('click', function() {
        nav.classList.remove('active');
        menuToggle.classList.remove('active');
      });
    });
  }

  // ======================
  // 4. Scroll Animations
  // ======================
  function setupScrollAnimations() {
    const animateOnScroll = function () {
      const elements = document.querySelectorAll(
        ".education-item, .project-item, .service-item, .timeline-item"
      );

      elements.forEach((element) => {
        const elementPosition = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;

        if (elementPosition < windowHeight - 100) {
          element.style.opacity = "1";
          element.style.transform = "translateY(0)";
        }
      });
    };

    // Set initial state for animation
    const elementsToAnimate = document.querySelectorAll(
      ".education-item, .project-item, .service-item, .timeline-item"
    );
    elementsToAnimate.forEach((element) => {
      element.style.opacity = "0";
      element.style.transform = "translateY(30px)";
      element.style.transition = "all 0.6s ease";
    });

    window.addEventListener("scroll", animateOnScroll);
    animateOnScroll(); // Run once on page load
  }

  // ======================
  // 5. Image Handling
  // ======================
  function setupImageHandling() {
    const eduImages = document.querySelectorAll(".edu-image img");
    eduImages.forEach((img) => {
      img.onload = function () {
        const container = this.closest(".edu-image");
        if (this.naturalHeight > this.naturalWidth) {
          container.classList.add("portrait");
        } else {
          container.classList.remove("portrait");
        }
      };
      if (img.complete) img.onload();
    });
  }

  // ======================
  // 6. Project Sliders
  // ======================
  function setupProjectSliders() {
    const sliders = document.querySelectorAll(".project-slider");

    sliders.forEach((slider) => {
      const slides = slider.querySelector(".slides");
      const slideItems = slider.querySelectorAll(".slide");
      const prevBtn = slider.querySelector(".prev");
      const nextBtn = slider.querySelector(".next");

      let currentIndex = 0;
      const totalSlides = slideItems.length;

      // Set initial position
      updateSlider();

      // Next button click
      nextBtn.addEventListener("click", () => {
        currentIndex = (currentIndex + 1) % totalSlides;
        updateSlider();
      });

      // Previous button click
      prevBtn.addEventListener("click", () => {
        currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        updateSlider();
      });

      function updateSlider() {
        slides.style.transform = `translateX(-${currentIndex * 100}%)`;
      }

      // Optional: Touch support for mobile
      let touchStartX = 0;
      let touchEndX = 0;

      slides.addEventListener(
        "touchstart",
        (e) => {
          touchStartX = e.changedTouches[0].screenX;
        },
        { passive: true }
      );

      slides.addEventListener(
        "touchend",
        (e) => {
          touchEndX = e.changedTouches[0].screenX;
          handleSwipe();
        },
        { passive: true }
      );

      function handleSwipe() {
        if (touchEndX < touchStartX - 50) {
          // Swipe left - next
          currentIndex = (currentIndex + 1) % totalSlides;
        } else if (touchEndX > touchStartX + 50) {
          // Swipe right - previous
          currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        }
        updateSlider();
      }
    });
  }

  // ======================
  // 7. CV Download Handling
  // ======================
  function setupCVHandling() {
    // View CV button
    document.querySelectorAll('.download-btn.view-btn').forEach(button => {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        const pdfUrl = this.getAttribute('href');
        console.log('CV viewed:', pdfUrl);
        window.open(pdfUrl, '_blank');
      });
    });

    // Download CV button
    document.querySelectorAll('.download-btn:not(.view-btn)').forEach(button => {
      button.addEventListener('click', function(e) {
        // Let default download behavior proceed
        console.log('CV download initiated');
      });
    });
  }

  // ======================
  // 8. Skills Animations
  // ======================
  function setupSkillsAnimations() {
    const animateElements = document.querySelectorAll(".animate-in");

    // Set initial state for animation
    animateElements.forEach((element) => {
      element.style.opacity = "0";
      element.style.transform = "translateY(30px)";
      element.style.transition = "all 0.6s ease";
    });

    // Function to check if element is in viewport
    const animateOnScroll = function () {
      animateElements.forEach((element) => {
        const elementPosition = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;

        if (elementPosition < windowHeight - 100) {
          element.style.opacity = "1";
          element.style.transform = "translateY(0)";
        }
      });
    };

    // Run on load and scroll
    window.addEventListener("scroll", animateOnScroll);
    animateOnScroll(); // Run once on page load
  }

  // ======================
  // 9. Experience Animations
  // ======================
  function setupExperienceAnimations() {
    const experienceElements = document.querySelectorAll(
      ".experience-section .animate-in"
    );

    // Set initial state
    experienceElements.forEach((element) => {
      element.style.opacity = "0";
      element.style.transform = "translateY(30px)";
      element.style.transition = "all 0.6s ease";
    });

    const animateExperienceOnScroll = function () {
      experienceElements.forEach((element) => {
        const elementPosition = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;

        if (elementPosition < windowHeight - 100) {
          element.style.opacity = "1";
          element.style.transform = "translateY(0)";
        }
      });
    };

    window.addEventListener("scroll", animateExperienceOnScroll);
    animateExperienceOnScroll(); // Run once on page load
  }

  // Initialize all features
 // ======================
// 10. Rating Slip Button Handling
// ======================
function setupRatingSlipButtons() {
    // View button
    document.querySelectorAll('.rating-slip-button.view').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const pdfUrl = this.getAttribute('href');
            console.log('Rating slip viewed:', pdfUrl);
            window.open(pdfUrl, '_blank');
            
            // You could add analytics here
            // trackButtonClick('View Rating Slip');
        });
    });

    // Download button
    document.querySelectorAll('.rating-slip-button.download').forEach(button => {
        button.addEventListener('click', function(e) {
            console.log('Rating slip download initiated');
            
            // Let default download behavior proceed
            // You could add analytics here
            // trackButtonClick('Download Rating Slip');
        });
    });
}

// Update your init function to include this
function init() {
    setupSmoothScrolling();
    setupActiveNavHighlight();
    setupMobileMenu();
    setupScrollAnimations();
    setupImageHandling();
    setupProjectSliders();
    setupSkillsAnimations();
    setupExperienceAnimations();
    setupRatingSlipButtons(); // Add this line
    console.log("All JavaScript features initialized");
}

  // Start everything
  init();
});