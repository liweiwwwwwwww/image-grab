// background.js —— service worker，负责消息转发：接收图片列表并打开画廊页面
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'SHOW_GALLERY') {
    // 把提取到的图片列表临时存到 session 存储，画廊页面打开后从这里读取
    chrome.storage.session
      .set({ images: msg.images || [] })
      .then(() => {
        chrome.tabs.create({ url: chrome.runtime.getURL('gallery.html') });
        sendResponse({ ok: true });
      });
    return true; // 表示异步调用 sendResponse
  }
});
