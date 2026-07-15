const Transition = (function() {
  const cache = {};

  // تحميل مسبق وصامت للمشهد التالي (نص HTML فقط)، دون عرضه أو تشغيل سكربتاته بعد
  function preload(url) {
    if (!cache[url]) {
      cache[url] = fetch(url).then(res => res.text());
    }
    return cache[url];
  }

  // كشف المشهد فعليًا: يُستدعى فقط في لحظة الانتقال السينمائي
  function loadScene(url, container, onReady) {
    preload(url)
      .then(html => {
        container.innerHTML = html;
        requestAnimationFrame(() => {
          executeSceneScripts(container);
          container.querySelector('.scene-content')?.classList.add('active');
          if (typeof onReady === 'function') onReady();
        });
      })
      .catch(err => console.error(err));
  }

  function executeSceneScripts(container) {
    const scripts = container.querySelectorAll('script');
    scripts.forEach(script => {
      const newScript = document.createElement('script');
      if (script.src) {
        newScript.src = script.src;
      } else {
        newScript.textContent = script.textContent;
      }
      document.body.appendChild(newScript);
      newScript.remove();
    });
  }

  return { loadScene, preload };
})();
