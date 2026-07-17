const AudioManager = (function() {
  let currentMusic = null;
  let currentId = null;
  let introFadeTimer = null;
  let tailFadeTimer = null;

  function clearAutomationTimers() {
    if (introFadeTimer) {
      clearTimeout(introFadeTimer);
      introFadeTimer = null;
    }
    if (tailFadeTimer) {
      clearTimeout(tailFadeTimer);
      tailFadeTimer = null;
    }
  }

  function clearCurrentMusic() {
    clearAutomationTimers();
    currentMusic = null;
    currentId = null;
  }

  function scheduleElBakhtAutomation(sound, id, targetVolume) {
    const introDuration = 16000;
    const tailDuration = 18000;
    const startVolume = 0.01;

    sound.volume(startVolume, id);
    sound.fade(startVolume, targetVolume, introDuration, id);

    const scheduleTailFade = () => {
      const totalDuration = sound.duration(id) * 1000;
      if (!totalDuration || !isFinite(totalDuration)) return;

      const tailStartDelay = Math.max(0, totalDuration - tailDuration);
      tailFadeTimer = setTimeout(() => {
        if (currentMusic !== sound || currentId !== id) return;
        const currentVolume = typeof sound.volume === 'function' ? sound.volume(id) : targetVolume;
        sound.fade(currentVolume, 0, tailDuration, id);
      }, tailStartDelay);
    };

    if (sound.state() === 'loaded') {
      scheduleTailFade();
    } else {
      sound.once('load', scheduleTailFade);
    }

    sound.once('end', () => {
      if (currentMusic === sound && currentId === id) {
        if (typeof sound.unload === 'function') {
          sound.unload();
        }
        clearCurrentMusic();
      }
    });
  }

  function play(soundKey, volume = 0.18, fadeIn = 3000) {
    stop();
    try {
      const sound = new Howl({
        src: [`assets/audio/${soundKey}.mp3`],
        volume: 0,
        loop: false,
        preload: true,
      });
      currentId = sound.play();
      currentMusic = sound;

      if (soundKey === 'el-bakht') {
        scheduleElBakhtAutomation(sound, currentId, volume);
      } else {
        sound.fade(0, volume, fadeIn, currentId);
      }
    } catch(e) {}
  }

  function playSnippet(soundKey, start, duration, volume = 0.18, fadeIn = 2500) {
    stop();
    try {
      const sound = new Howl({
        src: [`assets/audio/${soundKey}.mp3`],
        volume: 0,
        loop: false,
        preload: true,
      });
      currentId = sound.play();
      sound.seek(start / 1000, currentId);
      sound.fade(0, volume, fadeIn, currentId);
      currentMusic = sound;
    } catch(e) {}
  }

  function playThreshold() {
    // Act I uses one continuous recording: start at 18s, then let the track play naturally.
    if (currentMusic) return;
    playSnippet('threshold', 18000, 190000, 0.18, 2500);
  }

  function stop() {
    if (currentMusic) {
      clearAutomationTimers();
      currentMusic.stop();
      if (typeof currentMusic.unload === 'function') {
        currentMusic.unload();
      }
      currentMusic = null;
      currentId = null;
    }
  }

  function fadeOut(duration = 2000) {
    if (currentMusic) {
      currentMusic.fade(currentMusic.volume(), 0, duration);
      setTimeout(() => stop(), duration);
    }
  }

  // ليست صمتًا كاملًا — فقط قربًا منه. تُستخدم في نهاية الفصل الأول:
  // الموسيقى تبقى تعزف، لكن بصوت يكاد لا يُسمع، ليشعر الجمهور بالغياب لا بالانقطاع.
  function fadeTo(volume = 0.02, duration = 4000) {
    if (currentMusic) {
      currentMusic.fade(currentMusic.volume(), volume, duration);
    }
  }

  // دالة جديدة: crossfade من الموسيقى الحالية إلى مقطع جديد
  function crossfadeTo(newSoundKey, newVolume = 0.15, duration = 4000) {
    if (!currentMusic) {
      play(newSoundKey, newVolume, duration);
      return;
    }
    // بدء تلاشي القديمة
    const old = currentMusic;
    old.fade(old.volume(), 0, duration);
    setTimeout(() => {
      old.stop();
      if (typeof old.unload === 'function') {
        old.unload();
      }
    }, duration + 200);

    // تشغيل الجديدة
    try {
      const sound = new Howl({
        src: [`assets/audio/${newSoundKey}.mp3`],
        volume: 0,
        loop: false,
        preload: true,
      });
      const id = sound.play();
      currentMusic = sound;
      currentId = id;
      if (newSoundKey === 'el-bakht') {
        scheduleElBakhtAutomation(sound, id, newVolume);
      } else {
        sound.fade(0, newVolume, duration, id);
      }
    } catch(e) {}
  }

  return {
    play,
    playSnippet,
    playThreshold,
    stop,
    fadeOut,
    fadeTo,
    crossfadeTo
  };
})();
