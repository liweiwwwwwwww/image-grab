// content.js —— 在电商详情页右下角注入「获取图片」按钮，并负责扫描、提取页面里的商品图片
(() => {
  // 防止脚本被重复注入
  if (window.__imageGrabInjected) return;
  window.__imageGrabInjected = true;

  // 小于该尺寸（宽或高）的图片会被当作图标/占位图过滤掉
  const MIN_SIZE = 100;
  // 明显属于图标 / logo / 占位图等非商品图的 URL 特征
  const BLACKLIST = /(logo|icon|avatar|placeholder|loading|sprite|1x1|blank|emoji|btn|button|arrow|\.gif$|\.svg$)/i;

  // 1. 创建悬浮按钮
  const btn = document.createElement('button');
  btn.id = 'imagegrab-btn';
  btn.type = 'button';
  btn.textContent = '获取图片';
  btn.title = '图提取：提取本页所有商品图片';
  document.documentElement.appendChild(btn);

  // 2. 把相对路径 / 各种懒加载地址补全为绝对 URL 并去重
  const urls = new Set();
  function push(url) {
    if (!url || typeof url !== 'string') return;
    url = url.trim();
    if (!url || url.startsWith('data:')) return;
    try {
      const abs = new URL(url, location.href).href;
      if (abs.startsWith('http')) urls.add(abs);
    } catch (e) {
      /* 忽略无法解析的地址 */
    }
  }

  // 3. 核心提取逻辑
  function extractImages() {
    urls.clear();

    // 3.1 扫描 <img> 标签
    document.querySelectorAll('img').forEach((img) => {
      // 已加载出真实尺寸的，过滤掉过小的图片
      if (img.naturalWidth && img.naturalWidth < MIN_SIZE) return;
      if (img.naturalHeight && img.naturalHeight < MIN_SIZE) return;

      if (img.currentSrc) push(img.currentSrc);
      if (img.src) push(img.src);

      // srcset 里可能有不同清晰度版本
      const srcset = img.getAttribute('srcset');
      if (srcset) {
        srcset.split(',').forEach((part) => push(part.trim().split(/\s+/)[0]));
      }

      // 常见懒加载属性（各平台叫法不同，做兼容处理）
      ['data-src', 'data-lazy-src', 'data-original', 'data-echo'].forEach((attr) => {
        push(img.getAttribute(attr));
      });
      const dataSrcset = img.getAttribute('data-srcset');
      if (dataSrcset) {
        dataSrcset.split(',').forEach((part) => push(part.trim().split(/\s+/)[0]));
      }
    });

    // 3.2 扫描 background-image（背景图）
    document.querySelectorAll('*').forEach((el) => {
      let bg;
      try {
        bg = getComputedStyle(el).backgroundImage;
      } catch (e) {
        return;
      }
      if (!bg || bg === 'none') return;
      const re = /url\(["']?(.*?)["']?\)/g;
      let m;
      while ((m = re.exec(bg))) {
        if (m[1]) push(m[1]);
      }
    });

    // 3.3 过滤掉图标 / logo / 占位图
    return [...urls].filter((u) => !BLACKLIST.test(u));
  }

  // 4. 点击按钮：提取并交给后台打开画廊页面
  btn.addEventListener('click', () => {
    const images = extractImages();
    if (!images.length) {
      alert('图提取：未在当前页面提取到商品图片');
      return;
    }
    chrome.runtime.sendMessage({ type: 'SHOW_GALLERY', images }, (resp) => {
      if (chrome.runtime.lastError) {
        alert('图提取：' + (chrome.runtime.lastError.message || '发送失败'));
      }
    });
  });
})();
