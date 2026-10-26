// gallery.js —— 画廊页面：展示提取到的图片，支持勾选、全选/反选、批量下载为 PNG
(async () => {
  const grid = document.getElementById('grid');
  const empty = document.getElementById('empty');
  const countEl = document.getElementById('count');
  const progressEl = document.getElementById('progress');
  const downloadBtn = document.getElementById('download');

  // 从 session 存储读取 background 传来的图片列表
  const { images = [] } = await chrome.storage.session.get('images');

  if (!images.length) {
    empty.hidden = false;
    return;
  }

  // 渲染网格：每张图一个卡片（缩略图 + 尺寸 + 复选框）
  images.forEach((url, i) => {
    const card = document.createElement('div');
    card.className = 'card';

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = true;
    cb.dataset.url = url;

    const img = document.createElement('img');
    img.src = url;
    img.loading = 'lazy';
    img.referrerPolicy = 'no-referrer';

    const info = document.createElement('div');
    info.className = 'info';
    info.textContent = '加载中…';

    // 图片加载成功后显示真实尺寸
    img.onload = () => {
      info.textContent = `${img.naturalWidth} × ${img.naturalHeight}`;
    };

    card.appendChild(cb);
    card.appendChild(img);
    card.appendChild(info);
    grid.appendChild(card);
  });

  // 更新已选数量
  function updateCount() {
    const n = grid.querySelectorAll('input:checked').length;
    countEl.textContent = `已选 ${n} 张`;
  }
  grid.addEventListener('change', updateCount);
  updateCount();

  // 全选 / 反选
  document.getElementById('select-all').addEventListener('click', () => {
    grid.querySelectorAll('input').forEach((c) => (c.checked = true));
    updateCount();
  });
  document.getElementById('select-none').addEventListener('click', () => {
    grid.querySelectorAll('input').forEach((c) => (c.checked = !c.checked));
    updateCount();
  });

  // 把 Blob 转成 PNG（通过 canvas 统一格式）
  async function toPng(blob) {
    const bmp = await createImageBitmap(blob);
    const canvas = document.createElement('canvas');
    canvas.width = bmp.width;
    canvas.height = bmp.height;
    canvas.getContext('2d').drawImage(bmp, 0, 0);
    return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  }

  // 批量下载选中的图片
  downloadBtn.addEventListener('click', async () => {
    const checked = [...grid.querySelectorAll('input:checked')].map((c) => c.dataset.url);
    if (!checked.length) {
      alert('请先勾选要下载的图片');
      return;
    }

    downloadBtn.disabled = true;
    progressEl.hidden = false;
    let done = 0;
    let failed = 0;

    for (let i = 0; i < checked.length; i++) {
      progressEl.textContent = `下载中… ${i + 1} / ${checked.length}`;
      try {
        const res = await fetch(checked[i], { mode: 'cors', credentials: 'omit' });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const blob = await res.blob();
        const pngBlob = (await toPng(blob)) || blob;
        const objUrl = URL.createObjectURL(pngBlob);
        // 文件名：商品图_序号.png，序号补零到 3 位
        const filename = `商品图_${String(done + 1).padStart(3, '0')}.png`;
        await chrome.downloads.download({ url: objUrl, filename, saveAs: false });
        done++;
      } catch (e) {
        failed++;
      }
    }

    downloadBtn.disabled = false;
    progressEl.hidden = true;
    alert(`下载完成：成功 ${done} 张${failed ? `，失败 ${failed} 张` : ''}`);
  });
})();
