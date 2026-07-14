const Transition = (function() {
  function loadScene(url, container) {
    container.style.display = 'block';
    container.innerHTML = '';
    const loader = document.createElement('div');
    loader.style.color = '#D4B28C';
    loader.style.textAlign = 'center';
    loader.style.marginTop = '40vh';
    loader.style.fontSize = '2rem';
    loader.textContent = '✦';
    container.appendChild(loader);

    fetch(url)
      .then(res => res.text())
      .then(html => {
        container.innerHTML = html;
        // ننتظر قليلاً حتى يتم بناء DOM ثم نشغل السكربت الخاص بالمشهد
        setTimeout(() => {
          executeSceneScripts(container);
          container.querySelector('.scene-content')?.classList.add('active');
        }, 100);
      })
      .catch(err => {
        container.innerHTML = '<p style="color:red;">تعذر تحميل المشهد.</p>';
        console.error(err);
      });
  }

  function executeSceneScripts(container) {
    // البحث عن وسوم script داخل المحتوى وتنفيذها
    const scripts = container.querySelectorAll('script');
    scripts.forEach(script => {
      const newScript = document.createElement('script');
      if (script.src) {
        newScript.src = script.src;
      } else {
        newScript.textContent = script.textContent;
      }
      document.body.appendChild(newScript);
      // إزالة بعد التنفيذ (اختياري)
      newScript.remove();
    });
  }

  return { loadScene };
})();