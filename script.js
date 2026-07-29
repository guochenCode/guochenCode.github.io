const header = document.querySelector("[data-header]");
const navToggle = document.querySelector("[data-nav-toggle]");
const navigation = document.querySelector("[data-nav]");

document.querySelectorAll("[data-current-year]").forEach((element) => {
  element.textContent = String(new Date().getFullYear());
});

const setNavigationState = (isOpen) => {
  if (!header || !navToggle) {
    return;
  }

  header.classList.toggle("is-nav-open", isOpen);
  document.body.classList.toggle("nav-open", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
  navToggle.setAttribute("aria-label", isOpen ? "关闭导航" : "打开导航");
};

navToggle?.addEventListener("click", () => {
  setNavigationState(navToggle.getAttribute("aria-expanded") !== "true");
});

navigation?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setNavigationState(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setNavigationState(false);
  }
});

window.addEventListener(
  "scroll",
  () => header?.classList.toggle("is-scrolled", window.scrollY > 20),
  { passive: true }
);

document.querySelectorAll(".experience-item").forEach((item) => {
  item.addEventListener("toggle", () => {
    if (!item.open) {
      return;
    }

    document.querySelectorAll(".experience-item").forEach((otherItem) => {
      if (otherItem !== item) {
        otherItem.removeAttribute("open");
      }
    });
  });
});

const carousel = document.querySelector("[data-carousel]");

if (carousel) {
  const track = carousel.querySelector("[data-carousel-track]");
  const viewport = carousel.querySelector(".carousel-viewport");
  const slides = Array.from(carousel.querySelectorAll("[data-carousel-slide]"));
  const previousButton = carousel.querySelector("[data-carousel-prev]");
  const nextButton = carousel.querySelector("[data-carousel-next]");
  const dotsContainer = carousel.querySelector("[data-carousel-dots]");
  const status = carousel.querySelector("[data-carousel-status]");
  const autoplayToggle = carousel.querySelector("[data-carousel-toggle]");
  const autoplayToggleIcon = carousel.querySelector("[data-carousel-toggle-icon]");
  const autoplayToggleLabel = carousel.querySelector("[data-carousel-toggle-label]");
  const lightbox = document.querySelector("[data-lightbox]");
  const lightboxImage = lightbox?.querySelector("[data-lightbox-image]");
  const lightboxCaption = lightbox?.querySelector("[data-lightbox-caption]");
  const lightboxClose = lightbox?.querySelector("[data-lightbox-close]");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const dots = Array.from(carousel.querySelectorAll("[data-carousel-thumb]"));
  let activeIndex = 0;
  let timer = null;
  let pointerStart = null;
  let lastSwipeAt = 0;
  let lightboxTrigger = null;
  let isLightboxOpen = false;
  let autoplayPaused = prefersReducedMotion;

  const showSlide = (nextIndex) => {
    activeIndex = (nextIndex + slides.length) % slides.length;
    track.style.transform = `translateX(-${activeIndex * 100}%)`;

    slides.forEach((slide, index) => {
      const isActive = index === activeIndex;
      slide.setAttribute("aria-hidden", String(!isActive));
      slide.querySelectorAll("button, a").forEach((element) => {
        element.tabIndex = isActive ? 0 : -1;
      });
    });

    dots.forEach((dot, index) => {
      const isActive = index === activeIndex;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-current", isActive ? "true" : "false");

      if (isActive && dotsContainer && dotsContainer.scrollWidth > dotsContainer.clientWidth) {
        const targetLeft = dot.offsetLeft - (dotsContainer.clientWidth - dot.clientWidth) / 2;
        dotsContainer.scrollTo({
          left: targetLeft,
          behavior: prefersReducedMotion ? "auto" : "smooth",
        });
      }
    });

    if (status) {
      status.textContent = `${activeIndex + 1} / ${slides.length}`;
    }
  };

  const stopAutoplay = () => {
    window.clearInterval(timer);
    timer = null;
  };

  const startAutoplay = (force = false) => {
    if (
      autoplayPaused ||
      timer ||
      isLightboxOpen ||
      document.hidden ||
      (!force && carousel.matches(":hover")) ||
      (!force && carousel.contains(document.activeElement))
    ) {
      return;
    }

    timer = window.setInterval(() => showSlide(activeIndex + 1), 4200);
  };

  const updateAutoplayControl = () => {
    autoplayToggle?.setAttribute("aria-pressed", String(autoplayPaused));
    autoplayToggle?.setAttribute("aria-label", autoplayPaused ? "继续自动播放" : "暂停自动播放");

    if (autoplayToggleIcon) {
      autoplayToggleIcon.textContent = autoplayPaused ? "▶" : "Ⅱ";
    }

    if (autoplayToggleLabel) {
      autoplayToggleLabel.textContent = autoplayPaused ? "播放" : "暂停";
    }
  };

  if (dots.length === 0) {
    slides.forEach((_, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "carousel-dot";
      dot.setAttribute("aria-label", `查看第 ${index + 1} 张截图`);
      dotsContainer?.append(dot);
      dots.push(dot);
    });
  }

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      showSlide(index);
      stopAutoplay();
      startAutoplay();
    });
  });

  autoplayToggle?.addEventListener("click", () => {
    autoplayPaused = !autoplayPaused;
    updateAutoplayControl();

    if (autoplayPaused) {
      stopAutoplay();
    } else {
      startAutoplay(true);
    }
  });

  previousButton?.addEventListener("click", () => {
    showSlide(activeIndex - 1);
    stopAutoplay();
    startAutoplay();
  });

  nextButton?.addEventListener("click", () => {
    showSlide(activeIndex + 1);
    stopAutoplay();
    startAutoplay();
  });

  carousel.addEventListener("mouseenter", stopAutoplay);
  carousel.addEventListener("mouseleave", startAutoplay);
  carousel.addEventListener("focusin", stopAutoplay);
  carousel.addEventListener("focusout", (event) => {
    if (!carousel.contains(event.relatedTarget)) {
      startAutoplay();
    }
  });

  carousel.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
      return;
    }

    event.preventDefault();
    showSlide(activeIndex + (event.key === "ArrowRight" ? 1 : -1));
    stopAutoplay();
    startAutoplay();
  });

  viewport?.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    pointerStart = event.clientX;
  });

  viewport?.addEventListener("pointerup", (event) => {
    if (pointerStart === null) {
      return;
    }

    const distance = event.clientX - pointerStart;
    pointerStart = null;

    if (Math.abs(distance) < 45) {
      return;
    }

    lastSwipeAt = Date.now();
    showSlide(activeIndex + (distance < 0 ? 1 : -1));
    stopAutoplay();
    startAutoplay();
  });

  viewport?.addEventListener("pointercancel", () => {
    pointerStart = null;
  });

  viewport?.addEventListener(
    "click",
    (event) => {
      if (Date.now() - lastSwipeAt < 350) {
        event.preventDefault();
        event.stopPropagation();
      }
    },
    true
  );

  carousel.querySelectorAll("[data-lightbox-trigger]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      if (!lightbox || !lightboxImage || !lightboxCaption) {
        return;
      }

      const image = trigger.querySelector("img");
      const slide = trigger.closest("[data-carousel-slide]");
      const title = slide?.querySelector(".shot-caption h2")?.textContent ?? "项目截图";
      const description = slide?.querySelector(".shot-caption p")?.textContent ?? "";

      if (!image) {
        return;
      }

      lightboxTrigger = trigger;
      lightboxImage.src = image.currentSrc || image.src;
      lightboxImage.alt = image.alt;
      lightboxCaption.textContent = description ? `${title} · ${description}` : title;
      isLightboxOpen = true;
      stopAutoplay();
      lightbox.showModal();
    });
  });

  lightboxClose?.addEventListener("click", () => lightbox?.close());

  lightbox?.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      lightbox.close();
    }
  });

  lightbox?.addEventListener("close", () => {
    isLightboxOpen = false;
    lightboxImage?.removeAttribute("src");
    lightboxTrigger?.focus();
    startAutoplay();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopAutoplay();
    } else {
      startAutoplay();
    }
  });

  showSlide(0);
  updateAutoplayControl();
  startAutoplay();
}
