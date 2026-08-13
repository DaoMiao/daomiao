/* =================================================================
   主交互脚本 - 导航 / 滚动动画 / B站懒加载 / 作品筛选 / Lightbox
   ================================================================= */

(function() {
  'use strict';

  // ============== 1. 顶部导航滚动状态 ==============
  const topNav = document.querySelector('.top-nav');
  const sideNav = document.querySelector('.side-nav');
  const navDots = document.querySelectorAll('.nav-dot');

  function updateNav() {
    // 顶部导航缩小
    if (window.scrollY > 80) {
      topNav.classList.add('scrolled');
    } else {
      topNav.classList.remove('scrolled');
    }

    // 侧边点导航高亮
    const scrollPos = window.scrollY + window.innerHeight / 3;
    let currentSection = 'hero';

    document.querySelectorAll('section[id]').forEach(section => {
      const top = section.offsetTop;
      const bottom = top + section.offsetHeight;
      if (scrollPos >= top && scrollPos < bottom) {
        currentSection = section.id;
      }
    });

    navDots.forEach(dot => {
      dot.classList.toggle('active', dot.dataset.section === currentSection);
    });
  }

  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  // ============== 2. 移动端菜单 ==============
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('open');
      navMenu.classList.toggle('open');
    });

    // 点击菜单项后收起
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('open');
        navMenu.classList.remove('open');
      });
    });
  }

  // ============== 3. Reveal 滚动动画 ==============
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // 错落延迟
        const delay = Math.min(entry.target.dataset.delay || 0, 4) * 80;
        setTimeout(() => {
          entry.target.classList.add('active');
        }, delay);
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -80px 0px'
  });

  document.querySelectorAll('.reveal').forEach(el => {
    revealObserver.observe(el);
  });

  // ============== 4. 技能条动画 ==============
  const skillBars = document.querySelectorAll('.skill-bar-fill');
  const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const width = entry.target.dataset.width || '0%';
        entry.target.style.width = width;
        skillObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  skillBars.forEach(bar => skillObserver.observe(bar));

  // ============== 5. B站视频懒加载 ==============
  // 当视频卡片进入视口时，将封面替换为B站iframe
  const videoCards = document.querySelectorAll('.video-card[data-bvid]');

  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const card = entry.target;
        const bvid = card.dataset.bvid;
        const placeholder = card.querySelector('.video-placeholder');

        if (placeholder && bvid) {
          // 创建iframe替换占位
          const iframe = document.createElement('iframe');
          iframe.src = `https://player.bilibili.com/player.html?bvid=${bvid}&autoplay=0&danmaku=0&high_quality=1&no_related=1`;
          iframe.scrolling = 'no';
          iframe.border = '0';
          iframe.frameBorder = '0';
          iframe.allowFullscreen = true;
          iframe.style.cssText = 'width: 100%; height: 100%; border: none; position: absolute; inset: 0;';
          iframe.setAttribute('sandbox', 'allow-top-navigation allow-same-origin allow-forms allow-scripts');

          const thumb = card.querySelector('.video-thumb');
          thumb.appendChild(iframe);
          thumb.querySelector('.video-platform-tag').style.display = 'none';
          placeholder.style.opacity = '0';

          videoObserver.unobserve(card);
        }
      }
    });
  }, { threshold: 0.25 });

  videoCards.forEach(card => videoObserver.observe(card));

  // ============== 6. 视频平台Tab切换 ==============
  const platformBtns = document.querySelectorAll('.platform-btn');
  const videoLists = document.querySelectorAll('.video-list');

  platformBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const platform = btn.dataset.platform;

      platformBtns.forEach(b => b.classList.toggle('active', b === btn));
      videoLists.forEach(list => {
        list.classList.toggle('active', list.dataset.platform === platform);
      });
    });
  });

  // ============== 7. 作品集Tab筛选 ==============
  const tabBtns = document.querySelectorAll('.tab-btn');
  const workCards = document.querySelectorAll('.work-card');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.dataset.category;

      tabBtns.forEach(b => b.classList.toggle('active', b === btn));

      workCards.forEach(card => {
        const cardCat = card.dataset.category;
        if (category === 'all' || cardCat === category) {
          card.style.display = '';
          // 触发重新观察以淡入
          setTimeout(() => card.classList.add('active'), 50);
        } else {
          card.style.display = 'none';
          card.classList.remove('active');
        }
      });
    });
  });

  // ============== 8. 作品点击 - Lightbox ==============
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = lightbox ? lightbox.querySelector('.lightbox-close') : null;

  function openLightbox(src) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { lightboxImg.src = ''; }, 300);
  }

  // 为有真实图片的卡片绑定点击放大（wide卡片除外，含项目卡片和系列头图）
  document.querySelectorAll('.work-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (card.classList.contains('work-card-wide')) return;
      const img = card.querySelector('.work-image img');
      if (img && img.src) {
        openLightbox(img.src);
      }
    });
  });

  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  // ESC 关闭 lightbox
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox && lightbox.classList.contains('open')) {
      closeLightbox();
    }
  });

  // ============== 9. 平滑滚动锚点 ==============
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId.length < 2) return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const offset = 80;
        const y = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });
  });

  // ============== 10. 占位检测已移除 - 印谱/节气作品已就位 ==============

  console.log('%c🌾 稻喵的个人网站已就绪', 'background: linear-gradient(135deg, #7c3aed, #2563eb); color: white; padding: 8px 16px; border-radius: 4px; font-weight: bold;');
  console.log('%c欢迎来到我的个人作品集 ✨', 'color: #94a3b8; font-style: italic;');
})();
