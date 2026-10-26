// main.js —— 官网交互：滚动导航高亮、移动端汉堡菜单、滚动进入动画
(() => {
  // 1. 导航栏吸顶阴影
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 10);
  });

  // 2. 移动端汉堡菜单
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
  // 点击导航项后收起菜单
  navLinks.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => navLinks.classList.remove('open'));
  });

  // 3. 滚动进入视口时的淡入上移动画
  const revealEls = document.querySelectorAll(
    '.intro-card, .feature-card, .step, .section-title'
  );
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  revealEls.forEach((el) => {
    el.classList.add('reveal');
    io.observe(el);
  });

  // 4. 滚动时导航栏高亮当前区块
  const sections = ['intro', 'features', 'install'];
  const navMap = {};
  sections.forEach((id) => {
    navMap[id] = document.querySelector(`.nav-link[href="#${id}"]`);
  });
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          document.querySelectorAll('.nav-link').forEach((l) => l.classList.remove('active'));
          if (navMap[e.target.id]) navMap[e.target.id].classList.add('active');
        }
      });
    },
    { rootMargin: '-40% 0px -55% 0px' }
  );
  sections.forEach((id) => {
    const el = document.getElementById(id);
    if (el) spy.observe(el);
  });
})();
