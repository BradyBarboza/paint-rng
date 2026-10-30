// Find the HTML elements that JavaScript needs to update.
const canvas = document.querySelector('#canvas');
const context = canvas.getContext('2d');
const rollButton = document.querySelector('#roll');
const guidance = document.querySelector('#guidance');
const clearButton = document.querySelector('#clear');
const clearDialog = document.querySelector('#clear-dialog');

// These variables remember the current tools and drawing.
let colour = null;
let brushSize = 0;
let activePointer = null;
let currentStroke = null;
let strokes = [];

// Keep strokes as points so resizing can redraw the picture without erasing it.
function paintStroke(stroke) {
  context.strokeStyle = stroke.colour;
  context.fillStyle = stroke.colour;
  context.lineWidth = stroke.size;
  context.lineCap = 'round';
  context.lineJoin = 'round';
  context.beginPath();
  context.arc(stroke.points[0].x, stroke.points[0].y, stroke.size / 2, 0, Math.PI * 2);
  context.fill();
  if (stroke.points.length > 1) {
    context.beginPath();
    context.moveTo(stroke.points[0].x, stroke.points[0].y);
    for (let i = 1; i < stroke.points.length; i++) {
      context.lineTo(stroke.points[i].x, stroke.points[i].y);
    }
    context.stroke();
  }
}

function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.round(window.innerWidth * ratio);
  canvas.height = Math.round(window.innerHeight * ratio);
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  for (let i = 0; i < strokes.length; i++) {
    paintStroke(strokes[i]);
  }
}

// Return a whole number from min to max, including both ends.
function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// These colours share a bright, playful style. The player still cannot choose.
const palette = ['#F0449C', '#7047EB', '#3984E8', '#1AA89A', '#F2B63F', '#EF7650', '#CE4D69', '#5264BB'];
function randomColour() {
  const choices = palette.filter(function (item) { return item !== colour; });
  return choices[randomNumber(0, choices.length - 1)];
}

function roll() {
  stopDrawing();
  // Pick randomly from every size except the previous roll's size.
  colour = randomColour();
  if (brushSize === 0) {
    brushSize = randomNumber(4, 64);
  } else {
    let nextSize = randomNumber(4, 63);
    if (nextSize >= brushSize) nextSize++;
    brushSize = nextSize;
  }
  const swatch = document.querySelector('#swatch');
  const brush = document.querySelector('#brush');
  swatch.className = 'colour-dot';
  brush.className = 'brush-dot';
  swatch.textContent = '';
  brush.textContent = '';
  swatch.style.backgroundColor = colour;
  brush.style.backgroundColor = colour;
  // The preview is scaled to fit; the numeric value is the actual brush width.
  const previewSize = Math.max(3, brushSize * 0.5);
  brush.style.width = previewSize + 'px';
  brush.style.height = previewSize + 'px';
  document.querySelector('#colour-value').textContent = colour.toUpperCase();
  document.querySelector('#size-value').textContent = brushSize + ' px';
  document.querySelector('#status').textContent = 'Rolled colour ' + colour + ' and a ' + brushSize + ' pixel brush. Draw on the canvas.';
  document.querySelector('#heading').textContent = 'Click and drag to paint.';
  document.querySelector('#description').textContent = 'Use your new colour and brush size to draw on the canvas.';
  document.querySelector('#detail').textContent = 'Click the dice again for a new colour and brush size.';
  document.querySelector('#hint').textContent = 'Click + drag to paint · Roll again anytime';
  canvas.classList.add('ready');
  // The animation is visual only; it never delays the new tools.
  rollButton.classList.add('rolling');
}

function pointFromEvent(event) {
  const bounds = canvas.getBoundingClientRect();
  return { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
}

// Pointer events work with a mouse, touch screen, or stylus.
canvas.addEventListener('pointerdown', function (event) {
  if (!colour) {
    document.querySelector('#status').textContent = 'Click the dice first to get a colour and brush size.';
    rollButton.focus({ preventScroll: true });
    return;
  }
  if (event.button !== 0 || activePointer !== null) return;
  event.preventDefault();
  activePointer = event.pointerId;
  // Keep receiving events if the pointer moves outside the canvas.
  canvas.setPointerCapture(activePointer);
  currentStroke = { colour: colour, size: brushSize, points: [pointFromEvent(event)] };
  strokes.push(currentStroke);
  paintStroke(currentStroke);
  guidance.hidden = true;
  clearButton.hidden = false;
  document.querySelector('#save').hidden = false;
});

canvas.addEventListener('pointermove', function (event) {
  if (event.pointerId !== activePointer || !currentStroke) return;
  // Connect the last saved point to the pointer's new position.
  const previous = currentStroke.points[currentStroke.points.length - 1];
  const next = pointFromEvent(event);
  context.strokeStyle = currentStroke.colour;
  context.lineWidth = currentStroke.size;
  context.lineCap = 'round';
  context.beginPath();
  context.moveTo(previous.x, previous.y);
  context.lineTo(next.x, next.y);
  context.stroke();
  currentStroke.points.push(next);
});

function stopDrawing(event) {
  if (event && event.pointerId !== undefined && event.pointerId !== activePointer) return;
  if (activePointer !== null && canvas.hasPointerCapture(activePointer)) {
    canvas.releasePointerCapture(activePointer);
  }
  activePointer = null;
  currentStroke = null;
}

canvas.addEventListener('pointerup', stopDrawing);
canvas.addEventListener('pointercancel', stopDrawing);
canvas.addEventListener('lostpointercapture', stopDrawing);
window.addEventListener('blur', stopDrawing);
window.addEventListener('resize', resizeCanvas);
rollButton.addEventListener('click', roll);
rollButton.addEventListener('animationend', function () {
  rollButton.classList.remove('rolling');
});
clearButton.addEventListener('click', function () {
  stopDrawing();
  // Escape must cancel, even after a previous confirmed clear.
  clearDialog.returnValue = 'cancel';
  clearDialog.showModal();
});
clearDialog.addEventListener('close', function () {
  if (clearDialog.returnValue !== 'clear') return;
  strokes = [];
  resizeCanvas();
  guidance.hidden = false;
  clearButton.hidden = true;
  document.querySelector('#save').hidden = true;
  document.querySelector('#status').textContent = 'Canvas cleared. Your current colour and brush size are ready.';
  rollButton.focus();
});

resizeCanvas();

// localStorage keeps this small gallery between visits on the same browser.
const galleryKey = 'paint-rng-gallery';
const galleryDialog = document.querySelector('#gallery-dialog');
let drawings = [];
try {
  const stored = JSON.parse(localStorage.getItem(galleryKey) || '[]');
  if (Array.isArray(stored)) {
    drawings = stored.filter(function (item) {
      return item && typeof item.image === 'string' && item.image.startsWith('data:image/png;base64,') && typeof item.date === 'string';
    }).slice(0, 12);
  }
} catch (error) {
  // Painting and downloads still work when browser storage is unavailable.
}

function showNotice(message) {
  const notice = document.querySelector('#notice');
  notice.textContent = message;
  notice.hidden = false;
}

function downloadDrawing(drawing) {
  const link = document.createElement('a');
  link.href = drawing.image;
  link.download = 'paint-rng-' + drawing.date.replace(/[:.]/g, '-') + '.png';
  document.body.append(link);
  link.click();
  link.remove();
}

function renderGallery() {
  const list = document.querySelector('#gallery-list');
  list.replaceChildren();
  if (drawings.length === 0) {
    list.textContent = 'No saved drawings yet. Paint something, then click Save drawing.';
  }
  drawings.forEach(function (drawing, index) {
    const card = document.createElement('article');
    const image = document.createElement('img');
    image.src = drawing.image;
    image.alt = 'Saved drawing ' + (index + 1);
    const date = document.createElement('p');
    date.textContent = new Date(drawing.date).toLocaleString();
    const download = document.createElement('button');
    download.textContent = 'Download PNG';
    download.addEventListener('click', function () { downloadDrawing(drawing); });
    card.append(image, date, download);
    list.append(card);
  });
}

document.querySelector('#save').addEventListener('click', function () {
  stopDrawing();
  if (strokes.length === 0) return;
  // Export the visible canvas with a white background, without the controls.
  const picture = document.createElement('canvas');
  const scale = Math.min(1, 1600 / Math.max(canvas.width, canvas.height));
  picture.width = Math.round(canvas.width * scale);
  picture.height = Math.round(canvas.height * scale);
  const paint = picture.getContext('2d');
  paint.fillStyle = 'white';
  paint.fillRect(0, 0, picture.width, picture.height);
  paint.drawImage(canvas, 0, 0, picture.width, picture.height);
  const drawing = { image: picture.toDataURL('image/png'), date: new Date().toISOString() };
  if (drawings.length >= 12) {
    downloadDrawing(drawing);
    showNotice('Gallery is full. Your drawing was downloaded as a PNG instead.');
    return;
  }
  const updated = [drawing, ...drawings];
  try {
    localStorage.setItem(galleryKey, JSON.stringify(updated));
    drawings = updated;
    renderGallery();
    galleryDialog.showModal();
    showNotice('Drawing saved to My gallery.');
  } catch (error) {
    downloadDrawing(drawing);
    showNotice('Browser storage is unavailable or full. Your drawing was downloaded instead.');
  }
});

document.querySelector('#gallery-open').addEventListener('click', function () {
  stopDrawing();
  renderGallery();
  galleryDialog.showModal();
});
