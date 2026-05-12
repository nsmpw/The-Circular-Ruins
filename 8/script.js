// Audio — 5:07 to 5:27, gradually slows down
var audio = new Audio('../ambience.mp3');
audio.loop = false;
var audioStart = 307;
var audioEnd = 327;
audio.currentTime = audioStart;
audio.volume = 0.4;
audio.preservesPitch = false;
audio.webkitPreservesPitch = false;

var minPlaybackRate = 0.3;

audio.addEventListener('timeupdate', function() {
  if (audio.currentTime >= audioEnd) {
    audio.currentTime = audioStart;
  }
});

function slowAudioLoop() {
  if (audio.paused) { requestAnimationFrame(slowAudioLoop); return; }
  if (audio.playbackRate > minPlaybackRate) {
    audio.playbackRate = Math.max(minPlaybackRate, audio.playbackRate - 0.0005);
  }
  requestAnimationFrame(slowAudioLoop);
}

var audioStarted = false;
function startAudio() {
  if (audioStarted) return;
  audioStarted = true;
  audio.playbackRate = 1.0;
  audio.play().catch(function() {});
  slowAudioLoop();
}

function initAudio() {
  startAudio();
  document.removeEventListener('click', initAudio);
  document.removeEventListener('mousemove', initAudio);
}
document.addEventListener('click', initAudio);
document.addEventListener('mousemove', initAudio);

var fullText = "The wizard carried out the orders he had been given. He devoted a certain length of time (which finally proved to be two years) to instructing him in the mysteries of the universe and the cult of fire. Secretly, he was pained at the idea of being separated from him. On the pretext of pedagogical necessity, each day he increased the number of hours dedicated to dreaming. He also remade the right shoulder, which was somewhat defective. At times, he was disturbed by the impression that all this had already happened . . . In general, his days were happy; when he closed his eyes, he thought: Now I will be with my son. Or, more rarely: The son I have engendered is waiting for me and will not exist if I do not go to him.";

var allWords = fullText.split(' ');
var container = document.getElementById('textContainer');

var screenW = window.innerWidth;
var screenH = window.innerHeight;

// ── Images — stars with warm amber filter ──
var imageFiles = [
  '../stars/2.gif',
  '../stars/3.gif',
  '../stars/17.gif',
  '../stars/10.gif',
  '../stars/13.gif',
  '../stars/14.gif',
  '../stars/16.gif'
];

var imageFilter = 'sepia(1) saturate(3) hue-rotate(30deg) brightness(0.75)';

function rand(min, max) {
  return min + Math.random() * (max - min);
}

// Pick scattered words — every 4th word
var scatterWords = [];
for (var i = 0; i < allWords.length; i += 4) {
  var clean = allWords[i].replace(/[;,.\(\)]/g, '').trim();
  if (clean.length > 1) {
    scatterWords.push(clean);
  }
}

// Shuffle
var shuffled = scatterWords.slice();
for (var j = shuffled.length - 1; j > 0; j--) {
  var k = Math.floor(Math.random() * (j + 1));
  var tmp = shuffled[j];
  shuffled[j] = shuffled[k];
  shuffled[k] = tmp;
}

// ====================================
// Phase 1: Scatter in a curved band with images
// ====================================

var wordEls = [];
var imgEls = [];
var sizes = [1.0, 1.2, 1.4, 1.6, 1.8];
var scatterDelay = 350;
var placedRects = [];
var PADDING = 20;

// Safe area — avoid the brown vignette edges
var safeLeft = screenW * 0.1;
var safeRight = screenW * 0.9;
var safeTop = screenH * 0.1;
var safeBottom = screenH * 0.88;

function rectsOverlap(a, b) {
  return !(a.right + PADDING < b.left ||
           b.right + PADDING < a.left ||
           a.bottom + PADDING < b.top ||
           b.bottom + PADDING < a.top);
}

shuffled.forEach(function(word, idx) {
  setTimeout(function() {
    if (idx === 0) startAudio();

    var el = document.createElement('div');
    el.style.position = 'absolute';
    el.style.fontFamily = '"DaVinci", cursive';
    el.style.fontStyle = 'italic';
    el.style.color = 'rgba(40, 22, 12, 1)';
    el.style.whiteSpace = 'nowrap';
    el.style.pointerEvents = 'none';
    el.style.opacity = '0';
    el.style.transition = 'opacity 1.5s ease';

    var size = sizes[Math.floor(Math.random() * sizes.length)];
    el.style.fontSize = size + 'vw';
    el.textContent = word;

    // Measure word size off-screen
    el.style.left = '-9999px';
    el.style.top = '-9999px';
    container.appendChild(el);
    var w = el.offsetWidth;
    var h = el.offsetHeight;

    // Find non-overlapping position within safe area
    var placed = false;
    for (var attempt = 0; attempt < 80; attempt++) {
      var progress = idx / shuffled.length;
      var baseX = safeLeft + progress * (safeRight - safeLeft);
      var curveY = 0.3 + 0.25 * Math.sin(progress * Math.PI * 1.2 - 0.3);
      var baseY = screenH * curveY;
      var xJitter = (Math.random() - 0.5) * screenW * 0.15;
      var yJitter = (Math.random() - 0.5) * screenH * 0.2;

      var x = Math.max(safeLeft, Math.min(safeRight - w, baseX + xJitter));
      var y = Math.max(safeTop, Math.min(safeBottom - h, baseY + yJitter));

      var candidate = { left: x, top: y, right: x + w, bottom: y + h };

      var overlaps = false;
      for (var j = 0; j < placedRects.length; j++) {
        if (rectsOverlap(candidate, placedRects[j])) {
          overlaps = true;
          break;
        }
      }

      if (!overlaps) {
        el.style.left = x + 'px';
        el.style.top = y + 'px';
        placedRects.push(candidate);
        placed = true;
        break;
      }
    }

    if (!placed) {
      el.style.display = 'none';
    }

    requestAnimationFrame(function() {
      el.style.opacity = '1';
    });
    wordEls.push(el);

    // Place image spread across screen
    if (Math.random() < 0.3) {
      var img = document.createElement('img');
      img.src = imageFiles[Math.floor(Math.random() * imageFiles.length)];
      img.style.position = 'absolute';
      img.style.width = rand(150, 350) + 'px';
      img.style.height = 'auto';
      img.style.opacity = '0';
      img.style.transition = 'opacity 1.5s ease';
      img.style.pointerEvents = 'none';
      img.style.zIndex = Math.floor(rand(1, 8));
      img.style.filter = imageFilter;
      img.style.mixBlendMode = 'difference';
      img.style.left = rand(safeLeft, safeRight - 200) + 'px';
      img.style.top = rand(safeTop, safeBottom - 200) + 'px';
      container.appendChild(img);
      requestAnimationFrame(function() {
        img.style.opacity = '0.85';
      });
      imgEls.push(img);
    }
  }, idx * scatterDelay);
});

// ====================================
// Phase 2: Fade first scatter, then second scatter with different words
// ====================================

var scatterTotalTime = shuffled.length * scatterDelay + 5000;

setTimeout(function() {
  // Fade out first scatter words
  wordEls.forEach(function(el, i) {
    setTimeout(function() {
      el.style.transition = 'opacity 1.5s ease';
      el.style.opacity = '0';
      setTimeout(function() {
        if (el.parentNode) el.remove();
      }, 1500);
    }, i * 30);
  });

  // Fade out images
  imgEls.forEach(function(img) {
    img.style.transition = 'opacity 2s ease';
    img.style.opacity = '0';
    setTimeout(function() {
      if (img.parentNode) img.remove();
    }, 2000);
  });
  imgEls = [];

  // After fade, start second scatter
  var fadeTime = wordEls.length * 30 + 2500;

  setTimeout(function() {
    startSecondScatter();
  }, fadeTime);
}, scatterTotalTime);

function startSecondScatter() {
  // Pick different words — every 4th word starting from index 2
  var scatter2Words = [];
  for (var i = 2; i < allWords.length; i += 4) {
    var clean = allWords[i].replace(/[;,.\(\)]/g, '').trim();
    if (clean.length > 1) {
      scatter2Words.push(clean);
    }
  }

  // Shuffle
  for (var j = scatter2Words.length - 1; j > 0; j--) {
    var k = Math.floor(Math.random() * (j + 1));
    var tmp = scatter2Words[j];
    scatter2Words[j] = scatter2Words[k];
    scatter2Words[k] = tmp;
  }

  var wordEls2 = [];
  var placedRects2 = [];

  scatter2Words.forEach(function(word, idx) {
    setTimeout(function() {
      var el = document.createElement('div');
      el.style.position = 'absolute';
      el.style.fontFamily = '"DaVinci", cursive';
      el.style.fontStyle = 'italic';
      el.style.color = 'rgba(40, 22, 12, 1)';
      el.style.whiteSpace = 'nowrap';
      el.style.pointerEvents = 'none';
      el.style.opacity = '0';
      el.style.transition = 'opacity 1.5s ease';

      var size = sizes[Math.floor(Math.random() * sizes.length)];
      el.style.fontSize = size + 'vw';
      el.textContent = word;

      // Measure off-screen
      el.style.left = '-9999px';
      el.style.top = '-9999px';
      container.appendChild(el);
      var w = el.offsetWidth;
      var h = el.offsetHeight;

      // Find non-overlapping position
      var placed = false;
      for (var attempt = 0; attempt < 80; attempt++) {
        var x = rand(safeLeft, safeRight - w);
        var y = rand(safeTop, safeBottom - h);

        var candidate = { left: x, top: y, right: x + w, bottom: y + h };

        var overlaps = false;
        for (var jj = 0; jj < placedRects2.length; jj++) {
          if (rectsOverlap(candidate, placedRects2[jj])) {
            overlaps = true;
            break;
          }
        }

        if (!overlaps) {
          el.style.left = x + 'px';
          el.style.top = y + 'px';
          placedRects2.push(candidate);
          placed = true;
          break;
        }
      }

      if (!placed) {
        el.style.display = 'none';
      }

      requestAnimationFrame(function() {
        el.style.opacity = '1';
      });
      wordEls2.push(el);

      // Images
      if (Math.random() < 0.25) {
        var img = document.createElement('img');
        img.src = imageFiles[Math.floor(Math.random() * imageFiles.length)];
        img.style.position = 'absolute';
        img.style.width = rand(150, 350) + 'px';
        img.style.height = 'auto';
        img.style.opacity = '0';
        img.style.transition = 'opacity 1.5s ease';
        img.style.pointerEvents = 'none';
        img.style.zIndex = Math.floor(rand(1, 8));
        img.style.filter = imageFilter;
        img.style.mixBlendMode = 'difference';
        img.style.left = rand(safeLeft, safeRight - 200) + 'px';
        img.style.top = rand(safeTop, safeBottom - 200) + 'px';
        container.appendChild(img);
        requestAnimationFrame(function() {
          img.style.opacity = '0.85';
        });
        imgEls.push(img);
      }
    }, idx * scatterDelay);
  });

  // After second scatter, fade and build paragraph
  var scatter2TotalTime = scatter2Words.length * scatterDelay + 5000;

  setTimeout(function() {
    // Fade out second scatter
    wordEls2.forEach(function(el, i) {
      setTimeout(function() {
        el.style.transition = 'opacity 1.5s ease';
        el.style.opacity = '0';
        setTimeout(function() {
          if (el.parentNode) el.remove();
        }, 1500);
      }, i * 30);
    });

    imgEls.forEach(function(img) {
      img.style.transition = 'opacity 2s ease';
      img.style.opacity = '0';
      setTimeout(function() {
        if (img.parentNode) img.remove();
      }, 2000);
    });
    imgEls = [];

    var fadeTime2 = wordEls2.length * 30 + 2500;

    setTimeout(function() {
      assembleIntoParagraph();
    }, fadeTime2);
  }, scatter2TotalTime);
}

// ====================================
// Centered paragraph assembly
// ====================================

function assembleIntoParagraph() {
  var sw = window.innerWidth;
  var sh = window.innerHeight;
  var PARA_WIDTH = 50;
  var ASSEMBLED_SIZE = 1.0;

  var measurer = document.createElement('div');
  measurer.style.position = 'absolute';
  measurer.style.visibility = 'hidden';
  measurer.style.fontFamily = '"DaVinci", cursive';
  measurer.style.fontStyle = 'italic';
  measurer.style.fontSize = ASSEMBLED_SIZE + 'vw';
  measurer.style.lineHeight = '2.2';
  measurer.style.whiteSpace = 'normal';
  measurer.style.textAlign = 'justify';
  measurer.style.wordSpacing = '0.3em';
  document.body.appendChild(measurer);

  allWords.forEach(function(word) {
    var span = document.createElement('span');
    span.textContent = word + ' ';
    measurer.appendChild(span);
  });

  var paraWidthPx = PARA_WIDTH / 100 * sw;
  var offsetX = (sw - paraWidthPx) / 2;

  measurer.style.width = paraWidthPx + 'px';
  measurer.style.left = offsetX + 'px';
  measurer.style.top = '0px';

  void measurer.offsetHeight;
  var paraHeight = Math.max(measurer.getBoundingClientRect().height, measurer.scrollHeight);
  var offsetY = Math.max(20, Math.floor((sh - paraHeight) / 2));

  measurer.style.top = offsetY + 'px';
  measurer.style.visibility = 'visible';

  var spans = measurer.querySelectorAll('span');
  var targetPositions = [];

  spans.forEach(function(span) {
    var rect = span.getBoundingClientRect();
    targetPositions.push({ left: rect.left, top: rect.top });
  });

  document.body.removeChild(measurer);

  // Build paragraph word by word in shuffled order
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
      el.style.position = 'absolute';
      el.style.fontFamily = '"DaVinci", cursive';
      el.style.fontStyle = 'italic';
      el.style.fontSize = ASSEMBLED_SIZE + 'vw';
      el.style.color = 'rgba(40, 22, 12, 1)';
      el.style.whiteSpace = 'nowrap';
      el.style.pointerEvents = 'auto';
      el.style.left = targetPositions[idx].left + 'px';
      el.style.top = targetPositions[idx].top + 'px';
      el.textContent = allWords[idx];
      el.style.opacity = '0';
      el.style.transition = 'opacity 0.5s ease, color 0.3s ease, text-shadow 0.3s ease';
      el.className = 'para-word';
      container.appendChild(el);

      requestAnimationFrame(function() {
        el.style.opacity = '1';
      });
    }, seq * 30);
  });

  // Show return arrow, then fade
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
}

// ====================================
// Smoke cursor — fire colors
// ====================================

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