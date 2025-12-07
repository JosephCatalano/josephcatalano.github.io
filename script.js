document.addEventListener("DOMContentLoaded", () => {
  // GSAP setup
  try {
    gsap.registerPlugin(ScrollTrigger, TextPlugin, ScrollToPlugin);
  } catch (e) {
    console.error("GSAP plugin registration failed:", e);
  }

  const header = document.getElementById("header");
  const navLinks = document.querySelectorAll(".nav-link");
  const menuToggle = document.getElementById("menu-toggle");
  const navUl = document.querySelector(".nav-links");
  const yearSpan = document.getElementById("current-year");

  // Current year in footer
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  /* === Mobile Nav === */
  if (menuToggle && navUl) {
    menuToggle.addEventListener("click", () => {
      const isOpen = navUl.classList.toggle("open");
      menuToggle.classList.toggle("active", isOpen);
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      document.body.style.overflow = isOpen ? "hidden" : "";
    });
  }

  function closeMobileNav() {
    if (!navUl) return;
    if (navUl.classList.contains("open")) {
      navUl.classList.remove("open");
      menuToggle.classList.remove("active");
      menuToggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    }
  }

  /* === Smooth Scroll for nav links === */
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (!href || !href.startsWith("#")) return;

      e.preventDefault();
      const target = document.querySelector(href);
      if (!target) return;
      closeMobileNav();

      gsap.to(window, {
        duration: 0.8,
        scrollTo: { y: target, offsetY: header?.offsetHeight || 70 },
        ease: "power2.out",
      });
    });
  });

  /* === Active link on scroll === */
  const sections = document.querySelectorAll("main section[id]");

  sections.forEach((section) => {
    ScrollTrigger.create({
      trigger: section,
      start: "top center",
      end: "bottom center",
      onEnter: () => setActive(section.id),
      onEnterBack: () => setActive(section.id),
    });
  });

  function setActive(id) {
    navLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
    });
  }

  /* === Header shadow on scroll === */
  if (header) {
    ScrollTrigger.create({
      start: "top -10",
      end: 99999,
      toggleClass: { targets: header, className: "header-scrolled" },
    });
  }

  /* === Hero typing text (loop) === */
  const typingElement = document.getElementById("typing-effect");
  const phrases = [
    "Software Engineering B.Tech Student @ McMaster",
    "I&IT Technology Specialist / QA Tester – Ontario Public Service",
    "Full-Stack & IoT Developer",
    "Builder of tools like LedgerLeaf & IQ-Leaf",
  ];

  if (typingElement && gsap && TextPlugin) {
    let tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });
    phrases.forEach((phrase) => {
      tl.to(typingElement, {
        duration: 2,
        text: { value: phrase },
        ease: "none",
      }).to(typingElement, {
        duration: 0.4,
        opacity: 0,
        ease: "power2.out",
        delay: 1.2,
      }).set(typingElement, { opacity: 1 });
    });
  }

  /* === Hero entrance === */
  const heroTimeline = gsap.timeline({ defaults: { ease: "power3.out" } });
  heroTimeline
    .from(".hero-kicker", { opacity: 0, y: 20, duration: 0.5 })
    .from(".hero-title", { opacity: 0, y: 30, duration: 0.7 }, "-=0.2")
    .from(".hero-description", { opacity: 0, y: 20, duration: 0.6 }, "-=0.3")
    .from(".hero-actions .btn", { opacity: 0, y: 15, stagger: 0.15, duration: 0.4 }, "-=0.4")
    .from(".hero-meta .pill", { opacity: 0, y: 10, stagger: 0.1, duration: 0.35 }, "-=0.4")
    .from(".hero-right .status-card", { opacity: 0, y: 25, stagger: 0.2, duration: 0.6 }, "-=0.6");

  /* === Scroll-triggered animations === */
  const revealElements = (selector, offset = "80%") => {
    document.querySelectorAll(selector).forEach((el) => {
      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
          start: `top ${offset}`,
        },
        opacity: 0,
        y: 30,
        duration: 0.6,
        ease: "power2.out",
      });
    });
  };

  revealElements(".about-grid .content-box");
  revealElements(".timeline-item", "85%");
  revealElements(".project-card", "85%");
  revealElements(".education-card", "85%");
  revealElements(".skill-card", "85%");
  revealElements(".contact-card", "85%");

  /* === Project filtering === */
  const filterButtons = document.querySelectorAll(".btn-filter");
  const projectItems = document.querySelectorAll(".project-item");

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.getAttribute("data-filter");
      filterButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      projectItems.forEach((item) => {
        const tech = item.getAttribute("data-tech") || "";
        const shouldShow = filter === "all" || tech.includes(filter);
        item.style.display = shouldShow ? "block" : "none";
      });

      ScrollTrigger.refresh();
    });
  });

  /* === Project Modals === */
  const modalTriggers = document.querySelectorAll("[data-modal-target]");
  const modals = document.querySelectorAll(".modal");
  let lastFocused = null;

  function openModal(modal) {
    if (!modal) return;
    lastFocused = document.activeElement;
    modal.classList.add("active");
    document.body.style.overflow = "hidden";

    const closeBtn = modal.querySelector(".modal-close");
    if (closeBtn) closeBtn.focus();
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove("active");
    document.body.style.overflow = "";
    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus();
    }
  }

  modalTriggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const id = trigger.getAttribute("data-modal-target");
      const modal = document.getElementById(id);
      openModal(modal);
    });

    trigger.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const id = trigger.getAttribute("data-modal-target");
        const modal = document.getElementById(id);
        openModal(modal);
      }
    });
  });

  modals.forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal(modal);
    });

    const closeBtn = modal.querySelector(".modal-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => closeModal(modal));
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const activeModal = document.querySelector(".modal.active");
      if (activeModal) closeModal(activeModal);
    }
  });
});
