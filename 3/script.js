// Audio — 3:34 to 3:52 loop
var audio = new Audio('../ambience.mp3');
audio.loop = true;
var audioStart = 220; // 3:40
var audioEnd = 227;   // 3:47
audio.currentTime = audioStart;
audio.volume = 0.4;
audio.addEventListener('timeupdate', function() {
  if (audio.currentTime >= audioEnd) audio.currentTime = audioStart;
});
var audioStarted = false;
function startAudio() {
  if (audioStarted) return;
  audioStarted = true;
  audio.play().catch(function() {});
}

var fullText = "At first, his dreams were chaotic; then in a short while they became dialectic in nature. The stranger dreamed that he was in the center of a circular amphitheater which was more or less the burnt temple; clouds of taciturn students filled the tiers of seats; the faces of the farthest ones hung at a distance of many centuries and as high as the stars, but their features were completely precise. The man lectured his pupils on anatomy, cosmography, and magic: the faces listened anxiously and tried to answer understandingly, as if they guessed the importance of that examination which would redeem one of them from his condition of empty illusion and interpolate him into the real world. Asleep or awake, the man thought over the answers of his phantoms, did not allow himself to be deceived by imposters, and in certain perplexities he sensed a growing intelligence. He was seeking a soul worthy of participating in the universe.";

var allWords = fullText.split(' ');

var ovalWords = [];
for (var i = 0; i < allWords.length; i += 3) {
  ovalWords.push(allWords[i]);
}

var scatterWords = [];
for (var i = 0; i < allWords.length; i += 4) {
  scatterWords.push(allWords[i]);
}

var container = document.getElementById('textContainer');
var ovalEls = [];
var scatterEls = [];

var ASSEMBLED_SIZE = 1.4;
var PARA_WIDTH = 65;

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function randInt(min, max) {
  return Math.floor(rand(min, max + 1));
}

function chance(p) {
  return Math.random() < p;
}

// ── Mixed Images — flowers and stars ──
var imageFiles = [];
[3,4,5,6,7,11,14,16,19,20,21,23,26,27,29].forEach(function(n) {
  imageFiles.push('../flowers/flowers_' + n + '.gif');
});

var imageFilters = [
  'sepia(1) saturate(3) hue-rotate(220deg) brightness(0.8)',   // blue-purple
  'sepia(1) saturate(2) hue-rotate(260deg) brightness(0.7)'    // deeper purple
];

var activeImages = [];

function placeImage() {
  var img = document.createElement('img');
  img.src = imageFiles[Math.floor(Math.random() * imageFiles.length)];
  img.className = 'section-img';
  var size = rand(300, 650);
  img.style.width = size + 'px';
  img.style.height = 'auto';
  img.style.position = 'absolute';
  img.style.opacity = '0';
  img.style.transition = 'opacity 1.5s ease, left 2s ease, top 2s ease';
  img.style.pointerEvents = 'none';
  img.style.zIndex = Math.floor(rand(1, 10));
  img.style.filter = imageFilters[Math.floor(Math.random() * imageFilters.length)];
  img.style.mixBlendMode = 'difference';
  img.style.left = rand(-30, window.innerWidth - 120) + 'px';
  img.style.top = rand(-30, window.innerHeight - 120) + 'px';
  container.appendChild(img);
  activeImages.push(img);
  requestAnimationFrame(function() {
    requestAnimationFrame(function() {
      img.style.opacity = '1';
    });
  });
}

function placeImageNearOval(wordIndex) {
  var img = document.createElement('img');
  img.src = imageFiles[Math.floor(Math.random() * imageFiles.length)];
  img.className = 'section-img';
  var size = rand(200, 500);
  img.style.width = size + 'px';
  img.style.height = 'auto';
  img.style.position = 'absolute';
  img.style.opacity = '0';
  img.style.transition = 'opacity 1.5s ease, left 2s ease, top 2s ease';
  img.style.pointerEvents = 'none';
  img.style.zIndex = Math.floor(rand(1, 10));
  img.style.filter = imageFilters[Math.floor(Math.random() * imageFilters.length)];
  img.style.mixBlendMode = 'difference';

  // Position near the oval path
  var t = (wordIndex / ovalWords.length) * Math.PI * 2 + rand(-0.5, 0.5);
  var ovalCX = window.innerWidth * 0.50;
  var ovalCY = window.innerHeight * 0.48;
  var rX = window.innerWidth * 0.34 * rand(0.5, 1.2);
  var rY = window.innerHeight * 0.28 * rand(0.5, 1.2);
  var x = ovalCX + Math.cos(t) * rX - size / 2;
  var y = ovalCY + Math.sin(t) * rY - size / 2;

  img.style.left = x + 'px';
  img.style.top = y + 'px';
  container.appendChild(img);
  activeImages.push(img);
  requestAnimationFrame(function() {
    requestAnimationFrame(function() {
      img.style.opacity = '1';
    });
  });
}

function fadeOutAllImages() {
  activeImages.forEach(function(img) {
    img.style.opacity = '0';
  });
  setTimeout(function() {
    activeImages.forEach(function(img) {
      if (img.parentNode) img.remove();
    });
    activeImages = [];
  }, 2000);
}

// ── Oval word placement ──
var ovalCenterX = 50;
var ovalCenterY = 48;
var ovalRadiusX = 34;
var ovalRadiusY = 28;

ovalWords.forEach(function(word, i) {
  var el = document.createElement('div');
  el.className = 'word';
  el.textContent = word;
  el.style.fontSize = rand(1.0, 1.6) + 'vw';

  var t = (i / ovalWords.length) * Math.PI * 2;
  var radiusWobble = rand(0.9, 1.1);
  var angleJitter = rand(-0.15, 0.15);
  var x = ovalCenterX + Math.cos(t + angleJitter) * ovalRadiusX * radiusWobble + rand(-3, 3);
  var y = ovalCenterY + Math.sin(t + angleJitter) * ovalRadiusY * radiusWobble + rand(-2, 2);

  x = Math.max(3, Math.min(93, x));
  y = Math.max(5, Math.min(92, y));

  el.style.left = x + 'vw';
  el.style.top = y + 'vh';
  container.appendChild(el);
  ovalEls.push({ el: el, index: i });
});

var ovalStagger = 400;
var ovalStartTime = 1000;

ovalEls.forEach(function(item, i) {
  setTimeout(function() {
    item.el.classList.add('visible');
    item.el.style.opacity = '1';

    // Start audio with first word
    if (i === 0) startAudio();

    // Place images — some along oval, some random
    if (chance(0.3)) {
      setTimeout(function() {
        if (chance(0.6)) {
          placeImageNearOval(i);
        } else {
          placeImage();
        }
      }, rand(100, 500));
    }

    if (i > 3 && i % 2 === 0) {
      setTimeout(function() {
        doSwapOn(ovalEls);
      }, 800);
    }
  }, ovalStartTime + i * ovalStagger);
});

var ovalDoneTime = ovalStartTime + ovalWords.length * ovalStagger + 1000;

// Swap images during oval phase
var imgSwapInterval = setInterval(function() {
  if (activeImages.length >= 2) {
    var idxA = randInt(0, activeImages.length - 1);
    var idxB;
    do { idxB = randInt(0, activeImages.length - 1); } while (idxB === idxA);

    var imgA = activeImages[idxA];
    var imgB = activeImages[idxB];

    var leftA = imgA.style.left;
    var topA = imgA.style.top;

    imgA.style.left = imgB.style.left;
    imgA.style.top = imgB.style.top;
    imgB.style.left = leftA;
    imgB.style.top = topA;
  }

  // Occasionally add/remove images
  if (chance(0.25) && activeImages.length < 10) {
    placeImage();
  }
  if (chance(0.2) && activeImages.length > 4) {
    var removeIdx = randInt(0, activeImages.length - 1);
    var toRemove = activeImages[removeIdx];
    toRemove.style.opacity = '0';
    activeImages.splice(removeIdx, 1);
    setTimeout(function() {
      if (toRemove.parentNode) toRemove.remove();
    }, 1500);
  }
}, 4000);

var ovalSwapCount = 12;
for (var s = 0; s < ovalSwapCount; s++) {
  (function(delay) {
    setTimeout(function() {
      doSwapOn(ovalEls);
    }, ovalDoneTime + delay);
  })(s * 1000);
}

function doSwapOn(els) {
  var visible = els.filter(function(w) {
    return w.el.classList.contains('visible') && w.el.parentNode;
  });
  if (visible.length < 2) return;

  var idxA = randInt(0, visible.length - 1);
  var idxB;
  do { idxB = randInt(0, visible.length - 1); } while (idxB === idxA);

  var a = visible[idxA].el;
  var b = visible[idxB].el;

  var rectA = a.getBoundingClientRect();
  var rectB = b.getBoundingClientRect();

  var floatA = document.createElement('div');
  floatA.className = 'float-word';
  floatA.textContent = a.textContent;
  floatA.style.fontSize = a.style.fontSize;
  floatA.style.left = rectA.left + 'px';
  floatA.style.top = rectA.top + 'px';
  document.body.appendChild(floatA);

  var floatB = document.createElement('div');
  floatB.className = 'float-word';
  floatB.textContent = b.textContent;
  floatB.style.fontSize = b.style.fontSize;
  floatB.style.left = rectB.left + 'px';
  floatB.style.top = rectB.top + 'px';
  document.body.appendChild(floatB);

  a.style.visibility = 'hidden';
  b.style.visibility = 'hidden';

  requestAnimationFrame(function() {
    floatA.style.left = rectB.left + 'px';
    floatA.style.top = rectB.top + 'px';
    floatB.style.left = rectA.left + 'px';
    floatB.style.top = rectA.top + 'px';
  });

  setTimeout(function() {
    a.style.left = rectB.left + 'px';
    a.style.top = rectB.top + 'px';
    b.style.left = rectA.left + 'px';
    b.style.top = rectA.top + 'px';

    a.style.visibility = 'visible';
    b.style.visibility = 'visible';

    floatA.style.opacity = '0';
    floatB.style.opacity = '0';

    setTimeout(function() {
      if (floatA.parentNode) floatA.remove();
      if (floatB.parentNode) floatB.remove();
    }, 800);
  }, 1600);
}

// ── Scatter phase ──
var scatterStartTime = ovalDoneTime + ovalSwapCount * 1000 + 2000;

setTimeout(function() {
  ovalEls.forEach(function(item, i) {
    if (i % 3 !== 0) {
      setTimeout(function() {
        item.el.classList.remove('visible');
        item.el.style.opacity = '0';
        setTimeout(function() {
          if (item.el.parentNode) item.el.remove();
        }, 1500);
      }, rand(0, 3000));
    }
  });

  scatterWords.forEach(function(word, i) {
    var el = document.createElement('div');
    el.className = 'word';
    el.textContent = word;
    el.style.fontSize = rand(0.9, 1.8) + 'vw';
    el.style.left = rand(3, 90) + 'vw';
    el.style.top = rand(8, 90) + 'vh';
    container.appendChild(el);
    scatterEls.push({ el: el, index: i });
  });

  var scatterStagger = 300;
  var scatterSwapAt = [3, 6, 10, 14, 18, 22, 26, 30];

  scatterEls.forEach(function(item, i) {
    setTimeout(function() {
      item.el.classList.add('visible');
      item.el.style.opacity = '1';

      if (scatterSwapAt.indexOf(i) !== -1) {
        setTimeout(function() {
          doSwapOn(scatterEls);
        }, 600);
      }
    }, i * scatterStagger);
  });

  var remainingOvalFadeTime = scatterWords.length * scatterStagger * 0.6;

  setTimeout(function() {
    ovalEls.forEach(function(item) {
      if (item.el.parentNode && item.el.classList.contains('visible')) {
        item.el.classList.remove('visible');
        item.el.style.opacity = '0';
        setTimeout(function() {
          if (item.el.parentNode) item.el.remove();
        }, 1500);
      }
    });
  }, remainingOvalFadeTime);

  var assembleTime = scatterWords.length * scatterStagger + 4000;

  setTimeout(function() {
    assembleIntoParagraph();
  }, assembleTime);

}, scatterStartTime);

// ── Assembly ──
function assembleIntoParagraph() {
  // Don't stop image swaps yet — keep them going during assembly
  // fadeOutAllImages(); -- removed, keep images visible

  var measurer = document.createElement('div');
  measurer.style.position = 'absolute';
  measurer.style.left = '-9999px';
  measurer.style.top = '-9999px';
  measurer.style.fontFamily = '"Apple Chancery", cursive';
  measurer.style.fontStyle = 'italic';
  measurer.style.fontSize = ASSEMBLED_SIZE + 'vw';
  measurer.style.lineHeight = '2.2';
  measurer.style.width = PARA_WIDTH + 'vw';
  measurer.style.whiteSpace = 'normal';
  measurer.style.textAlign = 'justify';
  document.body.appendChild(measurer);

  allWords.forEach(function(word, i) {
    var span = document.createElement('span');
    span.textContent = word + ' ';
    span.setAttribute('data-index', i);
    measurer.appendChild(span);
  });

  var screenW = window.innerWidth;
  var screenH = window.innerHeight;

  var offsetX = screenW * 0.05;
  measurer.style.left = offsetX + 'px';
  measurer.style.top = '0px';

  var paraRect = measurer.getBoundingClientRect();
  var offsetY = screenH - paraRect.height - 10;

  measurer.style.top = offsetY + 'px';

  var spans = measurer.querySelectorAll('span');
  var targetPositions = [];

  spans.forEach(function(span) {
    var rect = span.getBoundingClientRect();
    targetPositions.push({
      left: rect.left,
      top: rect.top
    });
  });

  document.body.removeChild(measurer);

  var scatterMap = {};
  scatterWords.forEach(function(word, i) {
    var allIdx = i * 4;
    scatterMap[allIdx] = scatterEls[i];
  });

  allWords.forEach(function(word, i) {
    setTimeout(function() {
      var el;

      if (scatterMap[i] && scatterMap[i].el.parentNode) {
        el = scatterMap[i].el;
        el.style.visibility = 'visible';
        el.style.opacity = '';
        el.classList.add('visible');
        el.classList.add('move');
      } else {
        el = document.createElement('div');
        el.className = 'word';
        el.textContent = word;
        el.style.fontSize = rand(0.9, 1.4) + 'vw';
        el.style.left = rand(3, 90) + 'vw';
        el.style.top = rand(8, 90) + 'vh';
        container.appendChild(el);
        el.classList.add('visible');

        requestAnimationFrame(function() {
          el.classList.add('move');
        });
      }

      if (!targetPositions[i]) return;

      setTimeout(function() {
        el.style.left = targetPositions[i].left + 'px';
        el.style.top = targetPositions[i].top + 'px';
        el.style.fontSize = ASSEMBLED_SIZE + 'vw';
      }, 100);

      // Add images during assembly
      if (chance(0.04)) {
        placeImage();
      }
    }, i * 80);
  });

  // After assembly, show return arrow and fade out after 10s
  var assembleTime = allWords.length * 80 + 3000;
  setTimeout(function() {
    // Show return arrow
    setTimeout(function() {
      var dialReturn = document.getElementById('dial-return');
      if (dialReturn) dialReturn.classList.add('glow');
    }, 1500);

    // After 10 seconds, fade everything out and stop audio
    setTimeout(function() {
      clearInterval(imgSwapInterval);
      fadeOutAllImages();
      // Fade audio
      var audioFade = setInterval(function() {
        if (audio.volume > 0.05) {
          audio.volume -= 0.05;
        } else {
          audio.volume = 0;
          audio.pause();
          clearInterval(audioFade);
        }
      }, 200);

      container.style.transition = 'opacity 2s ease';
      container.style.opacity = '0';
    }, 10000);
  }, assembleTime);
}

// ── Smoke cursor ──
var mouseMoveCounter = 0;
var maxSmoke = 10;
var smokeColors = [
  'rgba(255, 80, 0, 0.5)',
  'rgba(255, 140, 0, 0.4)',
  'rgba(200, 50, 0, 0.5)',
  'rgba(255, 200, 50, 0.35)',
  'rgba(120, 30, 0, 0.4)',
  'rgba(80, 20, 0, 0.35)'
];

function createSmoke(x, y) {
  var smoke = document.createElement('div');
  smoke.className = 'smoke';
  var size = 40 + Math.random() * 50;
  smoke.style.width = size + 'px';
  smoke.style.height = size + 'px';
  var color = smokeColors[Math.floor(Math.random() * smokeColors.length)];
  smoke.style.background = 'radial-gradient(circle, ' + color + ' 0%, transparent 70%)';
  smoke.style.left = (x + (Math.random() - 0.5) * 15) + 'px';
  smoke.style.top = (y + (Math.random() - 0.5) * 15) + 'px';
  document.body.appendChild(smoke);
  setTimeout(function() {
    smoke.style.transition = 'opacity 1.5s, transform 1.5s, filter 1.5s';
    smoke.style.opacity = '0';
    smoke.style.transform = 'translateY(-25px) scale(1.8)';
    smoke.style.filter = 'blur(18px)';
    setTimeout(function() { if (smoke.parentNode) smoke.remove(); }, 1500);
  }, 50);
  var allSmoke = document.querySelectorAll('.smoke');
  if (allSmoke.length > maxSmoke) allSmoke[0].remove();
}

document.addEventListener('mousemove', function(e) {
  mouseMoveCounter++;
  if (mouseMoveCounter % 4 === 0) createSmoke(e.clientX, e.clientY);
});