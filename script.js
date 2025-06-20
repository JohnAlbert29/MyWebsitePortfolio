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
    const mobileMenuToggle = document.createElement("div");
    mobileMenuToggle.className = "mobile-menu-toggle";
    mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
    document.querySelector("header .container").prepend(mobileMenuToggle);

    mobileMenuToggle.addEventListener("click", function () {
      document.querySelector("nav").classList.toggle("active");
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll("nav ul li a").forEach((link) => {
      link.addEventListener("click", function () {
        document.querySelector("nav").classList.remove("active");
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
  // Initialize All Features
  // ======================
  function init() {
    setupSmoothScrolling();
    setupActiveNavHighlight();
    setupMobileMenu();
    setupScrollAnimations();
    setupImageHandling();
    setupProjectSliders();

    console.log("All JavaScript features initialized");
  }

  // Start everything
  init();
});

// ======================
// 7. Skills Animations
// ======================
function setupSkillsAnimations() {
  // Animation on scroll for skills
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

// Update the init function to include skills animations
function init() {
  setupSmoothScrolling();
  setupActiveNavHighlight();
  setupMobileMenu();
  setupScrollAnimations();
  setupImageHandling();
  setupProjectSliders();
  setupSkillsAnimations();

  console.log("All JavaScript features initialized");
}

// ======================
// 8. Experience Animations
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

// Update init function
function init() {
  setupSmoothScrolling();
  setupActiveNavHighlight();
  setupMobileMenu();
  setupScrollAnimations();
  setupImageHandling();
  setupProjectSliders();
  setupSkillsAnimations();
  setupExperienceAnimations();

  console.log("All JavaScript features initialized");
}
