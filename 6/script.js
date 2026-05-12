// Audio — 5:07 to 5:27 loop
var audio = new Audio('../ambience.mp3');
audio.loop = true;
var audioStart = 307;
var audioEnd = 327;
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
// Try immediately
startAudio();
// Also try on any interaction as fallback
function initAudio() {
  startAudio();
  ['click', 'mousemove', 'touchstart', 'keydown', 'pointerdown', 'scroll'].forEach(function(evt) {
    document.removeEventListener(evt, initAudio);
  });
}
['click', 'mousemove', 'touchstart', 'keydown', 'pointerdown', 'scroll'].forEach(function(evt) {
  document.addEventListener(evt, initAudio);
});

// ── Mix of flowers + space images ──
var imageFiles = [];
[3,4,5,6,7,11,14,16,19,20,21,23,26,27,29].forEach(function(n) {
  imageFiles.push('../flowers/flowers_' + n + '.gif');
});
[39,40,41,42,43,44,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,68].forEach(function(n) {
  imageFiles.push('../space/space_' + n + '.gif');
});
var imageFilter = 'sepia(0.6) saturate(3) hue-rotate(330deg) brightness(1.1) contrast(0.9)';

function getImageFilter() {
  return imageFilter;
}
var activeImages = [];

function placeImageRandom() {
  var img = document.createElement('img');
  img.src = imageFiles[Math.floor(Math.random() * imageFiles.length)];
  img.style.position = 'absolute';
  var size = rand(280, 550);
  img.style.width = size + 'px';
  img.style.height = (size * rand(0.75, 1.1)) + 'px';
  img.style.objectFit = 'cover';
  img.style.opacity = '0';
  img.style.transition = 'opacity 1s ease';
  img.style.pointerEvents = 'none';
  img.style.zIndex = Math.floor(rand(1, 15));
  img.style.filter = getImageFilter();
  
  img.style.left = rand(-100, screenW - 100) + 'px';
  img.style.top = rand(-100, screenH - 100) + 'px';
  container.appendChild(img);
  activeImages.push(img);
  requestAnimationFrame(function() {
    requestAnimationFrame(function() { img.style.opacity = '0.85'; });
  });
  return img;
}

function fadeOutAllImages() {
  activeImages.forEach(function(img) {
    img.style.transition = 'opacity 2s ease';
    img.style.opacity = '0';
  });
  setTimeout(function() {
    activeImages.forEach(function(img) {
      if (img.parentNode) img.remove();
    });
    activeImages = [];
  }, 2500);
}

// Continuous image blink cycle — appear and disappear
var imgBlinkInterval = null;
function startImageBlink(fast) {
  var interval = fast ? 600 : 1200;
  var maxImgs = fast ? 14 : 10;
  imgBlinkInterval = setInterval(function() {
    if (activeImages.length < maxImgs) {
      placeImageRandom();
    }
    if (activeImages.length > 4 && Math.random() < 0.35) {
      var removeIdx = Math.floor(Math.random() * activeImages.length);
      var toRemove = activeImages[removeIdx];
      toRemove.style.transition = 'opacity 1s ease';
      toRemove.style.opacity = '0';
      activeImages.splice(removeIdx, 1);
      setTimeout(function() {
        if (toRemove.parentNode) toRemove.remove();
      }, 1200);
    }
  }, interval);
}

function stopImageBlink() {
  if (imgBlinkInterval) {
    clearInterval(imgBlinkInterval);
    imgBlinkInterval = null;
  }
}

var fullText = "He dreamed that it was warm, secret, about the size of a clenched fist, and of a garnet color within the penumbra of a human body as yet without face or sex; during fourteen lucid nights he dreampt of it with meticulous love. Every night he perceived it more clearly. He did not touch it; he only permitted himself to witness it, to observe it, and occasionally to rectify it with a glance. He perceived it and lived it from all angles and distances. On the fourteenth night he lightly touched the pulmonary artery with his index finger, then the whole heart, outside and inside. He was satisfied with the examination. He deliberately did not dream for a night; he took up the heart again, invoked the name of a planet, and undertook the vision of another of the principle organs. Within a year he had come to the skeleton and the eyelids. The innumerable hair was perhaps the most difficult task. He dreamed an entire man--a young man, but who did not sit up or talk, who was unable to open his eyes. Night after night, the man dreamt him asleep.";

var allWords = fullText.split(' ');
var container = document.getElementById('textContainer');

var ASSEMBLED_SIZE = 1.0;
var PARA_WIDTH = 50;

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function randInt(min, max) {
  return Math.floor(rand(min, max + 1));
}

var screenW = window.innerWidth;
var screenH = window.innerHeight;

var scatterWords = [];
for (var i = 0; i < allWords.length; i += 4) {
  var clean = allWords[i].replace(/[;,.\-]/g, '').trim();
  if (clean.length > 1) {
    scatterWords.push(clean);
  }
}

// =====================
// Phase 1: Flash words + images start appearing
// =====================
var flashEl = document.createElement('div');
flashEl.style.position = 'absolute';
flashEl.style.left = '50vw';
flashEl.style.top = '8vh';
flashEl.style.transform = 'translateX(-50%)';
flashEl.style.textAlign = 'center';
flashEl.style.fontSize = '1.8vw';
flashEl.style.fontFamily = '"DaVinci", cursive';
flashEl.style.fontStyle = 'italic';
flashEl.style.color = 'rgba(40, 22, 12, 1)';
flashEl.style.whiteSpace = 'nowrap';
flashEl.style.opacity = '0';
container.appendChild(flashEl);

var flashWordsList = [];
for (var f = 0; f < allWords.length; f += 5) {
  flashWordsList.push(allWords[f]);
}

var flashIndex = 0;
var flashDelay = 250;

setTimeout(function() {
  // Initial burst of 5 overlapping images
  for (var b = 0; b < 5; b++) {
    (function(idx) {
      setTimeout(function() { placeImageRandom(); }, idx * 300);
    })(b);
  }
  startImageBlink(true); // Fast during flash phase
  flashWordsFn();
}, 800);

function flashWordsFn() {
  if (flashIndex >= flashWordsList.length) {
    flashEl.style.opacity = '0';
    setTimeout(function() {
      if (flashEl.parentNode) flashEl.remove();
      setTimeout(function() {
        showScatter();
      }, 600);
    }, 400);
    return;
  }

  flashEl.textContent = flashWordsList[flashIndex];
  flashEl.style.opacity = '1';
  flashEl.style.fontSize = '1.8vw';

  setTimeout(function() {
    flashEl.style.opacity = '0';
    setTimeout(function() {
      flashIndex++;
      flashWordsFn();
    }, 100);
  }, flashDelay);
}

// ============================================
// Phase 2: All words fill the screen + swaps
// ============================================
var scatterEls = [];

function showScatter() {
  // Switch to normal image blink speed
  stopImageBlink();
  startImageBlink(false);

  var appearDelay = 400;
  var placedRects = [];
  var PADDING = 25;

  function rectsOverlap(a, b) {
    return !(a.right + PADDING < b.left ||
             b.right + PADDING < a.left ||
             a.bottom + PADDING < b.top ||
             b.bottom + PADDING < a.top);
  }

  scatterWords.forEach(function(word, i) {
    setTimeout(function() {
      var el = document.createElement('div');
      el.className = 'word scatter-word';
      el.textContent = word;
      el.style.fontSize = rand(0.9, 2.0) + 'vw';

      // Temporarily place off-screen to measure
      el.style.position = 'absolute';
      el.style.left = '-9999px';
      el.style.top = '-9999px';
      container.appendChild(el);
      var w = el.offsetWidth;
      var h = el.offsetHeight;

      // Try to find non-overlapping position
      var placed = false;
      for (var attempt = 0; attempt < 100; attempt++) {
        var zone = (i + attempt) % 5;
        var x, y;
        if (zone === 0) {
          x = rand(3, 20); y = rand(5, 90);
        } else if (zone === 1) {
          x = rand(70, 92); y = rand(5, 90);
        } else if (zone === 2) {
          x = rand(10, 85); y = rand(3, 25);
        } else if (zone === 3) {
          x = rand(10, 85); y = rand(70, 93);
        } else {
          x = rand(5, 90); y = rand(5, 90);
        }

        var px = x / 100 * screenW;
        var py = y / 100 * screenH;
        var candidate = { left: px, top: py, right: px + w, bottom: py + h };

        var overlaps = false;
        for (var j = 0; j < placedRects.length; j++) {
          if (rectsOverlap(candidate, placedRects[j])) {
            overlaps = true;
            break;
          }
        }

        if (!overlaps) {
          el.style.left = x + 'vw';
          el.style.top = y + 'vh';
          placedRects.push(candidate);
          placed = true;
          break;
        }
      }

      if (!placed) {
        // Hide word if no space found
        el.style.display = 'none';
      }

      scatterEls.push(el);

      requestAnimationFrame(function() {
        el.classList.add('visible');
      });

      if (Math.random() < 0.3) {
        var blinkLoop = function() {
          var nextBlink = rand(3000, 8000);
          setTimeout(function() {
            if (!el.parentNode || el.dataset.stopping === 'true') return;
            el.style.opacity = '0';
            setTimeout(function() {
              if (!el.parentNode || el.dataset.stopping === 'true') return;
              el.style.opacity = '1';
              blinkLoop();
            }, rand(600, 1500));
          }, nextBlink);
        };
        blinkLoop();
      }
    }, i * appearDelay);
  });

  var allPlacedTime = scatterWords.length * appearDelay;
  var endTime = allPlacedTime + 5000;

  setTimeout(function() {
    scatterEls.forEach(function(el) {
      el.dataset.stopping = 'true';
      el.style.opacity = '1';
    });

    // Stop image blink, fade images before assembly
    stopImageBlink();
    fadeOutAllImages();

    var measurer = document.createElement('div');
    measurer.style.position = 'absolute';
    measurer.style.visibility = 'hidden';
    measurer.style.fontFamily = '"DaVinci", cursive';
    measurer.style.fontStyle = 'italic';
    measurer.style.fontSize = ASSEMBLED_SIZE + 'vw';
    measurer.style.lineHeight = '2.2';
    measurer.style.whiteSpace = 'normal';
    measurer.style.textAlign = 'justify';
    measurer.style.wordSpacing = '0.4em';
    document.body.appendChild(measurer);

    allWords.forEach(function(word) {
      var span = document.createElement('span');
      span.textContent = word + ' ';
      measurer.appendChild(span);
    });

    var paraWidthPx = PARA_WIDTH / 100 * screenW;
    var offsetX = (screenW - paraWidthPx) / 2;

    // Set width and position to measure true height
    measurer.style.width = paraWidthPx + 'px';
    measurer.style.left = offsetX + 'px';
    measurer.style.top = '0px';

    // Force layout recalc
    void measurer.offsetHeight;
    var paraHeight = Math.max(measurer.getBoundingClientRect().height, measurer.scrollHeight);
    var offsetY = Math.max(20, Math.floor((screenH - paraHeight) / 2));

    measurer.style.top = offsetY + 'px';
    measurer.style.visibility = 'visible';

    var spans = measurer.querySelectorAll('span');
    var targetPositions = [];

    spans.forEach(function(span) {
      var rect = span.getBoundingClientRect();
      targetPositions.push({ left: rect.left, top: rect.top });
    });

    document.body.removeChild(measurer);

    // Fade out all scatter words first
    scatterEls.forEach(function(el, i) {
      setTimeout(function() {
        el.style.transition = 'opacity 1.5s ease';
        el.style.opacity = '0';
        setTimeout(function() {
          if (el.parentNode) el.remove();
        }, 1500);
      }, i * 30);
    });

    // After scatter words gone, build complete paragraph
    var fadeOutTime = scatterEls.length * 30 + 2000;

    setTimeout(function() {
      // Fade out all images before paragraph appears
      fadeOutAllImages();

      // Wait for images to fully fade, then build paragraph
      setTimeout(function() {
        // Shuffle word indices for random appear order
        var indices = [];
        for (var ii = 0; ii < allWords.length; ii++) {
          if (targetPositions[ii]) indices.push(ii);
        }
        for (var r = indices.length - 1; r > 0; r--) {
          var s = Math.floor(Math.random() * (r + 1));
          var tmp = indices[r];
          indices[r] = indices[s];
          indices[s] = tmp;
        }

        indices.forEach(function(idx, seq) {
          setTimeout(function() {
            var el = document.createElement('div');
            el.className = 'word para-word';
            el.textContent = allWords[idx];
            el.style.fontSize = ASSEMBLED_SIZE + 'vw';
            el.style.left = targetPositions[idx].left + 'px';
            el.style.top = targetPositions[idx].top + 'px';
            container.appendChild(el);

            requestAnimationFrame(function() {
              el.classList.add('visible');
            });
          }, seq * 30);
        });

        // After assembly: show arrow, then fade
        var fillTime = indices.length * 30 + 3000;
        setTimeout(function() {
          var dialReturn = document.getElementById('dial-return');
          if (dialReturn) dialReturn.classList.add('glow');

          setTimeout(function() {
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
        }, fillTime);
      }, 2500);
    }, fadeOutTime);
  }, endTime);
}

// ── Word-Image collision: invert word color when overlapping images ──
var brownColor = 'rgba(40, 22, 12, 1)';
var invertedColor = '#ffffff';

function checkWordImageCollisions() {
  var wordEls = document.querySelectorAll('.word, .para-word');
  wordEls.forEach(function(wordEl) {
    if (!wordEl.parentNode) return;
    var wRect = wordEl.getBoundingClientRect();
    var touching = false;

    for (var ai = 0; ai < activeImages.length; ai++) {
      var img = activeImages[ai];
      if (!img.parentNode || parseFloat(img.style.opacity) < 0.3) continue;
      var iRect = img.getBoundingClientRect();

      if (!(wRect.right < iRect.left ||
            iRect.right < wRect.left ||
            wRect.bottom < iRect.top ||
            iRect.bottom < wRect.top)) {
        touching = true;
        break;
      }
    }

    if (touching) {
      wordEl.style.color = invertedColor;
      wordEl.style.textShadow = '0 0 8px rgba(255, 255, 255, 0.5)';
    } else {
      wordEl.style.color = brownColor;
      wordEl.style.textShadow = 'none';
    }
  });

  requestAnimationFrame(checkWordImageCollisions);
}

// Start collision detection
checkWordImageCollisions();

// ── Smoke cursor — fire colors ──
var mouseMoveCounter = 0;
var maxSmoke = 10;
var smokeColors = [
  'rgba(255, 80, 0, 0.3)',
  'rgba(255, 140, 0, 0.25)',
  'rgba(200, 50, 0, 0.3)',
  'rgba(180, 80, 0, 0.25)',
  'rgba(150, 40, 0, 0.3)',
  'rgba(120, 30, 0, 0.25)'
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