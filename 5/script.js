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
function initAudio() {
  startAudio();
  ['click', 'mousemove', 'touchstart', 'keydown', 'pointerdown', 'scroll'].forEach(function(evt) {
    document.removeEventListener(evt, initAudio);
  });
}
['click', 'mousemove', 'touchstart', 'keydown', 'pointerdown', 'scroll'].forEach(function(evt) {
  document.addEventListener(evt, initAudio);
});

// ── Images ──
var imageFiles = [];
[3,4,5,6,7,11,14,16,19,20,21,23,26,27,29].forEach(function(n) {
  imageFiles.push('../flowers/flowers_' + n + '.gif');
});
[39,40,41,42,43,44,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,68].forEach(function(n) {
  imageFiles.push('../space/space_' + n + '.gif');
});
var imageFilter = 'sepia(1) saturate(6) hue-rotate(10deg) brightness(0.8)';

var activeImages = [];

var fullText = "He understood that modeling the incoherent and vertiginous matter of which dreams are composed was the most difficult task that a man could undertake, even though he should penetrate all the enigmas of a superior and inferior order; much more difficult than weaving a rope out of sand or coining the faceless wind. He swore he would forget the enormous hallucination which had thrown him off at first, and he sought another method of work. Before putting it into execution, he spent a month recovering his strength, which had been squandered by his delirium. He abandoned all premeditation of dreaming and almost immediately succeeded in sleeping a reasonable part of each day. The few times that he had dreams during this period, he paid no attention to them. Before resuming his task, he waited until the moon's disk was perfect. Then, in the afternoon, he purified himself in the waters of the river, worshiped the planetary gods, pronounced the prescribed syllables of a mighty name, and went to sleep. He dreamed almost immediately, with his heart throbbing.";

var allWords = fullText.split(' ');

var container = document.getElementById('textContainer');
var wordEls = [];

var ASSEMBLED_SIZE = 1.0;
var PARA_WIDTH = 45;

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function randInt(min, max) {
  return Math.floor(rand(min, max + 1));
}

var screenW = window.innerWidth;
var screenH = window.innerHeight;

function placeImageRandom() {
  var img = document.createElement('img');
  img.src = imageFiles[Math.floor(Math.random() * imageFiles.length)];
  img.style.position = 'absolute';
  var size = rand(200, 450);
  img.style.width = size + 'px';
  img.style.height = (size * rand(0.7, 1.0)) + 'px';
  img.style.objectFit = 'cover';
  img.style.opacity = '0';
  img.style.transition = 'opacity 1.5s ease';
  img.style.pointerEvents = 'none';
  img.style.zIndex = Math.floor(rand(1, 10));
  img.style.filter = imageFilter;
  img.style.mixBlendMode = 'difference';
  img.style.left = rand(-50, screenW - 100) + 'px';
  img.style.top = rand(-50, screenH - 100) + 'px';
  container.appendChild(img);
  activeImages.push(img);
  requestAnimationFrame(function() {
    requestAnimationFrame(function() { img.style.opacity = '0.8'; });
  });
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

// ── Use all words in reading order for stairs ──
var pickedWords = [];
for (var i = 0; i < allWords.length; i++) {
  pickedWords.push({ word: allWords[i], origIndex: i });
}

// Split into groups of 6 words per staircase
var stairGroups = [];
var groupSize = 15;
for (var g = 0; g < pickedWords.length; g += groupSize) {
  stairGroups.push(pickedWords.slice(g, g + groupSize));
}

var currentGroup = 0;

// ── Cycle through stair groups ──
setTimeout(function() {
  showStairGroup();
}, 500);

function showStairGroup() {
  if (currentGroup >= stairGroups.length) {
    // All groups shown — fade images and show paragraph
    fadeOutAllImages();
    setTimeout(function() {
      assembleIntoParagraph();
    }, 3000);
    return;
  }

  var group = stairGroups[currentGroup];
  var groupEls = [];

  // Position words in a single diagonal staircase — top-left to bottom-right
  var startX = 12;
  var startY = 12;
  var endX = 85;
  var endY = 80;
  var stepX = (endX - startX) / (group.length - 1 || 1);
  var stepY = (endY - startY) / (group.length - 1 || 1);

  group.forEach(function(item, i) {
    var el = document.createElement('div');
    el.className = 'word';
    el.textContent = item.word;
    el.style.fontSize = '1.4vw';
    el.style.left = (startX + stepX * i) + 'vw';
    el.style.top = (startY + stepY * i) + 'vh';
    container.appendChild(el);
    groupEls.push(el);
    wordEls.push({ el: el, index: i, origIndex: item.origIndex });
  });

  // Fade in one by one
  groupEls.forEach(function(el, i) {
    setTimeout(function() {
      el.classList.add('visible');

      // Place image spread across screen (not near word)
      if (Math.random() < 0.18) {
        var img = document.createElement('img');
        img.src = imageFiles[Math.floor(Math.random() * imageFiles.length)];
        img.style.position = 'absolute';
        var size = rand(200, 400);
        img.style.width = size + 'px';
        img.style.height = (size * rand(0.7, 1.0)) + 'px';
        img.style.objectFit = 'cover';
        img.style.opacity = '0';
        img.style.transition = 'opacity 1s ease';
        img.style.pointerEvents = 'none';
        img.style.zIndex = Math.floor(rand(1, 10));
        img.style.filter = imageFilter;
        img.style.mixBlendMode = 'difference';
        img.style.left = rand(-50, screenW - 100) + 'px';
        img.style.top = rand(-50, screenH - 100) + 'px';
        container.appendChild(img);
        activeImages.push(img);
        requestAnimationFrame(function() {
          requestAnimationFrame(function() { img.style.opacity = '0.8'; });
        });
        // Auto-fade out after short lifespan
        (function(imgRef) {
          setTimeout(function() {
            imgRef.style.opacity = '0';
            setTimeout(function() {
              if (imgRef.parentNode) imgRef.remove();
              activeImages = activeImages.filter(function(a) { return a !== imgRef; });
            }, 1200);
          }, rand(2000, 4000));
        })(img);
      }
    }, i * 600);
  });

  // Hold the staircase, then fade out and show next
  var appearTime = groupEls.length * 600;
  var holdTime = 5000;

  setTimeout(function() {
    // Fade out this group
    groupEls.forEach(function(el, i) {
      setTimeout(function() {
        el.style.transition = 'opacity 1.5s ease';
        el.style.opacity = '0';
        setTimeout(function() {
          if (el.parentNode) el.remove();
        }, 1500);
      }, i * 50);
    });

    // Fade some images
    if (activeImages.length > 4) {
      for (var ri = 0; ri < 3; ri++) {
        if (activeImages.length > 0) {
          var removeIdx = Math.floor(Math.random() * activeImages.length);
          var toRemove = activeImages[removeIdx];
          toRemove.style.transition = 'opacity 1.5s ease';
          toRemove.style.opacity = '0';
          activeImages.splice(removeIdx, 1);
          (function(el) {
            setTimeout(function() {
              if (el.parentNode) el.remove();
            }, 1500);
          })(toRemove);
        }
      }
    }

    // Next group after fade
    setTimeout(function() {
      currentGroup++;
      showStairGroup();
    }, 2000);
  }, appearTime + holdTime);
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

function assembleIntoParagraph() {
  // Use fresh screen dimensions
  var sw = window.innerWidth;
  var sh = window.innerHeight;

  var measurer = document.createElement('div');
  measurer.style.position = 'absolute';
  measurer.style.visibility = 'hidden';
  measurer.style.fontFamily = '"Apple Chancery", cursive';
  measurer.style.fontStyle = 'italic';
  measurer.style.fontSize = ASSEMBLED_SIZE + 'vw';
  measurer.style.lineHeight = '2.2';
  measurer.style.whiteSpace = 'normal';
  measurer.style.textAlign = 'justify';
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
  var offsetY = Math.max(20, Math.floor((sh - paraHeight) / 2) - sh * 0.05);

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
      el.className = 'word';
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
}

// ── Smoke cursor — fire colors ──
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