const header = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelectorAll(".site-nav a");
const timelineItems = document.querySelectorAll(".timeline-item");
const filterButtons = document.querySelectorAll(".filter-button");
const projectCards = document.querySelectorAll(".project-card");
const skillTabs = document.querySelectorAll(".skill-tab");
const skillPanel = document.querySelector("#skill-panel");

const skillContent = {
  language: {
    title: "Java / Kotlin",
    text: "熟悉 Java、Kotlin，理解面向对象的封装、继承、多态，了解 Kotlin 协程、高阶函数和扩展函数。"
  },
  android: {
    title: "Android 组件与机制",
    text: "了解安卓四大组件、View 绘制流程、事件分发机制、RecyclerView 缓存机制和 Handler 消息机制。"
  },
  flutter: {
    title: "Flutter 跨平台经验",
    text: "有 Flutter 开发经验，了解常见 Widget 组件和三方库使用，实习中实践过 Riverpod、相机、图片裁剪与保存等能力。"
  },
  collab: {
    title: "版本控制与团队协作",
    text: "熟悉代码版本控制，具备团队协作开发经验，能够在既有业务模块中完成需求开发与体验优化。"
  }
};

navToggle?.addEventListener("click", () => {
  const isOpen = header.classList.toggle("is-nav-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    header.classList.remove("is-nav-open");
    navToggle?.setAttribute("aria-expanded", "false");
  });
});

timelineItems.forEach((item) => {
  const trigger = item.querySelector(".timeline-trigger");

  trigger?.addEventListener("click", () => {
    const isOpen = item.classList.toggle("is-open");
    trigger.setAttribute("aria-expanded", String(isOpen));
  });
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;

    filterButtons.forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");

    projectCards.forEach((card) => {
      const tags = card.dataset.tags?.split(" ") ?? [];
      const shouldShow = filter === "all" || tags.includes(filter);
      card.classList.toggle("is-hidden", !shouldShow);
    });
  });
});

skillTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const skill = tab.dataset.skill;
    const content = skillContent[skill];

    if (!content) {
      return;
    }

    skillTabs.forEach((item) => {
      item.classList.remove("is-active");
      item.setAttribute("aria-selected", "false");
    });

    tab.classList.add("is-active");
    tab.setAttribute("aria-selected", "true");
    skillPanel.innerHTML = `<h3>${content.title}</h3><p>${content.text}</p>`;
  });
});

const navObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      const currentLink = document.querySelector(`.site-nav a[href="#${entry.target.id}"]`);
      navLinks.forEach((link) => link.classList.remove("is-current"));
      currentLink?.classList.add("is-current");
    });
  },
  {
    rootMargin: "-35% 0px -55% 0px",
    threshold: 0
  }
);

document.querySelectorAll("main section[id]").forEach((section) => {
  navObserver.observe(section);
});
