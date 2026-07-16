const AudioManager = (function() {
  let currentMusic = null;
  let currentId = null;
  let nextMusic = null;

  function play(soundKey, volume = 0.18, fadeIn = 3000) {
    stop();
    try {
      const sound = new Howl({
        src: [`assets/audio/${soundKey}.mp3`],
        volume: 0,
        loop: true,
        preload: true,
      });
      currentId = sound.play();
      sound.fade(0, volume, fadeIn, currentId);
      currentMusic = sound;
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
      currentMusic.stop();
      currentMusic = null;
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
    setTimeout(() => old.stop(), duration + 200);

    // تشغيل الجديدة
    try {
      const sound = new Howl({
        src: [`assets/audio/${newSoundKey}.mp3`],
        volume: 0,
        loop: true,
        preload: true,
      });
      const id = sound.play();
      sound.fade(0, newVolume, duration, id);
      currentMusic = sound;
      currentId = id;
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
