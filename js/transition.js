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

  function showDateCard(info, onComplete) {
    const card = document.getElementById('transitionInfo');
    if (!card) {
      if (typeof onComplete === 'function') onComplete();
      return;
    }

    const dateStack = card.querySelector('.date-stack');
    const locationText = card.querySelector('.location-text');
    const dateLines = [info.day, info.month, info.year].filter(Boolean);
    const locationLines = [info.location1, info.location2].filter(Boolean);

    dateStack.innerHTML = dateLines.join('<br>');
    locationText.innerHTML = locationLines.join('<br>');

    gsap.killTweensOf(card);
    gsap.set(card, { opacity: 0 });
    gsap.to(card, {
      opacity: 1,
      duration: 2.2,
      ease: 'power2.out',
      onComplete: () => {
        setTimeout(() => {
          gsap.to(card, {
            opacity: 0,
            duration: 2.6,
            ease: 'power2.inOut',
            onComplete: () => {
              if (typeof onComplete === 'function') onComplete();
            }
          });
        }, 2800);
      }
    });
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

  return { loadScene, preload, showDateCard };
})();
