// Audio — 0:00 to 0:26 loop
var audio = new Audio('../ambience.mp3');
audio.loop = true;
var audioStart = 162; // 2:42
var audioEnd = 198;   // 3:18
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

// ── Flower images ──
var imageFiles = [];
[3,4,5,6,7,11,14,16,19,20,21,23,26,27,29].forEach(function(n) {
  imageFiles.push('../flowers/flowers_' + n + '.gif');
});
var imageFilters = [
  'sepia(1) saturate(5) hue-rotate(10deg) brightness(0.8)',
  'sepia(1) saturate(4) hue-rotate(160deg) brightness(0.75)'
];

function getRandomFilter() {
  return imageFilters[Math.floor(Math.random() * imageFilters.length)];
}

var activeImages = [];

var fullText = "After nine or ten nights he understood with a certain bitterness that he could expect nothing from those pupils who accepted his doctrine passively, but that he could expect something from those who occasionally dared to oppose him. The former group, although worthy of love and affection, could not ascend to the level of individuals; the latter pre-existed to a slightly greater degree. One afternoon he dismissed the vast illusory student body for good and kept only one pupil. He was a taciturn, sallow boy, at times intractable, and whose sharp features resembled of those of his dreamer. The brusque elimination of his fellow students did not disconcert him for long; after a few private lessons, his progress was enough to astound the teacher. Nevertheless, a catastrophe took place. One day, the man emerged from his sleep as if from a viscous desert, looked at the useless afternoon light which he immediately confused with the dawn, and understood that he had not dreamed. All that night and all day long, the intolerable lucidity of insomnia fell upon him. He tried exploring the forest, to lose his strength; among the hemlock he barely succeeded in experiencing several short snatches of sleep, veined with fleeting, rudimentary visions that were useless. He tried to assemble the student body but scarcely had he articulated a few brief words of exhortation when it became deformed and was then erased. In his almost perpetual vigil, tears of anger burned his old eyes.";

var allWords = fullText.split(' ');

var splitIndex = fullText.indexOf('Nevertheless,');
var para1Text = fullText.substring(0, splitIndex).trim();
var para2Text = fullText.substring(splitIndex).trim();
var para1Words = para1Text.split(' ');
var para2Words = para2Text.split(' ');

var container = document.getElementById('textContainer');
var para1Els = [];
var para2Els = [];

var ASSEMBLED_SIZE = 1.0;
var PARA_WIDTH = 28;

var screenW = window.innerWidth;
var screenH = window.innerHeight;

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function placeImagesAround(paraX, paraY, paraW, paraH, count) {
  // Place images around the paragraph — top, bottom, left, right, corners
  var positions = [
    { x: paraX - rand(200, 400), y: paraY + rand(-50, paraH * 0.3) },           // left top
    { x: paraX - rand(150, 350), y: paraY + rand(paraH * 0.4, paraH * 0.8) },   // left bottom
    { x: paraX + paraW + rand(50, 250), y: paraY + rand(-50, paraH * 0.3) },     // right top
    { x: paraX + paraW + rand(50, 250), y: paraY + rand(paraH * 0.4, paraH * 0.8) }, // right bottom
    { x: paraX + rand(0, paraW * 0.5), y: paraY - rand(150, 300) },              // above left
    { x: paraX + rand(paraW * 0.3, paraW), y: paraY + paraH + rand(30, 200) },   // below right
  ];

  for (var si = 0; si < Math.min(count, positions.length); si++) {
    (function(idx) {
      setTimeout(function() {
        var img = document.createElement('img');
        img.src = imageFiles[Math.floor(Math.random() * imageFiles.length)];
        img.style.position = 'absolute';
        var size = rand(200, 400);
        img.style.width = size + 'px';
        img.style.height = (size * rand(0.75, 1.1)) + 'px';
        img.style.objectFit = 'cover';
        img.style.opacity = '0';
        img.style.transition = 'opacity 1.2s ease';
        img.style.pointerEvents = 'none';
        img.style.zIndex = 2;
        img.style.filter = getRandomFilter();
        img.style.mixBlendMode = 'difference';

        img.style.left = positions[idx].x + 'px';
        img.style.top = positions[idx].y + 'px';

        container.appendChild(img);
        activeImages.push(img);
        requestAnimationFrame(function() {
          requestAnimationFrame(function() {
            img.style.opacity = '0.85';
          });
        });
      }, idx * 1000);
    })(si);
  }
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

setTimeout(function() {
  buildParagraph1();
}, 500);

function buildParagraph1() {
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

  para1Words.forEach(function(word) {
    var span = document.createElement('span');
    span.textContent = word + ' ';
    measurer.appendChild(span);
  });

  var paraWidthPx = PARA_WIDTH / 100 * screenW;
  var offsetX = screenW - paraWidthPx - (screenW * 0.15);
  var offsetY = screenH * 0.15;

  measurer.style.left = offsetX + 'px';
  measurer.style.top = offsetY + 'px';

  var spans = measurer.querySelectorAll('span');
  var targetPositions = [];

  spans.forEach(function(span) {
    var rect = span.getBoundingClientRect();
    targetPositions.push({ left: rect.left, top: rect.top });
  });

  document.body.removeChild(measurer);

  para1Words.forEach(function(word, i) {
    if (!targetPositions[i]) return;

    setTimeout(function() {
      var startX = rand(3, 90);
      var startY = rand(8, 90);

      var el = document.createElement('div');
      el.className = 'word';
      el.textContent = word;
      el.style.fontSize = rand(0.7, 2.2) + 'vw';
      el.style.left = startX + 'vw';
      el.style.top = startY + 'vh';
      container.appendChild(el);
      el.classList.add('visible');
      para1Els.push(el);

      requestAnimationFrame(function() {
        el.classList.add('move');
        setTimeout(function() {
          el.style.left = targetPositions[i].left + 'px';
          el.style.top = targetPositions[i].top + 'px';
          el.style.fontSize = ASSEMBLED_SIZE + 'vw';
        }, 100);
      });
    }, i * 200);
  });

  // Images appear surrounding the paragraph while it's forming
  var imgStartTime = para1Words.length * 200 * 0.3;
  var paraHeightEst = screenH * 0.5;
  setTimeout(function() {
    placeImagesAround(offsetX, offsetY, paraWidthPx, paraHeightEst, 4);
  }, imgStartTime);

  var para1DoneTime = para1Words.length * 200 + 10000;

  setTimeout(function() {
    scatterPara1();
  }, para1DoneTime);
}

function scatterPara1() {
  // Fade all images
  fadeOutAllImages();

  // Immediately fade out all words — no flying
  para1Els.forEach(function(el, i) {
    setTimeout(function() {
      el.style.transition = 'opacity 1.2s ease';
      el.style.opacity = '0';
      setTimeout(function() {
        if (el.parentNode) el.remove();
      }, 1500);
    }, i * 20);
  });

  setTimeout(function() {
    buildParagraph2();
  }, para1Els.length * 20 + 2000);
}

function buildParagraph2() {
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

  para2Words.forEach(function(word) {
    var span = document.createElement('span');
    span.textContent = word + ' ';
    measurer.appendChild(span);
  });

  var offsetX = screenW * 0.10;
  measurer.style.left = offsetX + 'px';
  measurer.style.top = '0px';

  var paraRect = measurer.getBoundingClientRect();
  var offsetY = screenH - paraRect.height - (screenH * 0.06);

  measurer.style.top = offsetY + 'px';

  var spans = measurer.querySelectorAll('span');
  var targetPositions = [];

  spans.forEach(function(span) {
    var rect = span.getBoundingClientRect();
    targetPositions.push({ left: rect.left, top: rect.top });
  });

  document.body.removeChild(measurer);

  para2Words.forEach(function(word, i) {
    if (!targetPositions[i]) return;

    setTimeout(function() {
      var startX = rand(3, 90);
      var startY = rand(8, 90);

      var el = document.createElement('div');
      el.className = 'word';
      el.textContent = word;
      el.style.fontSize = rand(0.7, 2.2) + 'vw';
      el.style.left = startX + 'vw';
      el.style.top = startY + 'vh';
      container.appendChild(el);
      el.classList.add('visible');
      para2Els.push(el);

      requestAnimationFrame(function() {
        el.classList.add('move');
        setTimeout(function() {
          el.style.left = targetPositions[i].left + 'px';
          el.style.top = targetPositions[i].top + 'px';
          el.style.fontSize = ASSEMBLED_SIZE + 'vw';
        }, 100);
      });
    }, i * 200);
  });

  // Images appear surrounding para2 while forming
  var imgStartTime2 = para2Words.length * 200 * 0.3;
  setTimeout(function() {
    var paraWidthPx2 = PARA_WIDTH / 100 * screenW;
    var paraHeightEst2 = screenH * 0.5;
    placeImagesAround(offsetX, offsetY, paraWidthPx2, paraHeightEst2, 4);
  }, imgStartTime2);

  // After paragraph 2 assembled, show return arrow, then fade
  var para2DoneTime = para2Words.length * 200 + 3000;

  setTimeout(function() {
    var dialReturn = document.getElementById('dial-return');
    if (dialReturn) dialReturn.classList.add('glow');

    setTimeout(function() {
      fadeOutAllImages();

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
  }, para2DoneTime);
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