const canvas = document.getElementById("drawing_canvas");

const ctx = canvas.getContext("2d");

ctx.lineCap = "round";
ctx.lineJoin = "round";

let history = [];

let tool = "brush";

let color = document.getElementById("color_picker").value;
let lineWidth = document.getElementById("size_picker").value;

let drawing = false;

let startX;
let startY;

canvas.addEventListener("pointerdown", startDrawing);
canvas.addEventListener("pointermove", draw);
canvas.addEventListener("pointerup", stopDrawing);
canvas.addEventListener("pointercancel", stopDrawing);

document.getElementById("brush_button").addEventListener("click", () => { tool = "brush"; });
document.getElementById("eraser_button").addEventListener("click", () => { tool = "eraser"; });
document.getElementById("color_picker").addEventListener("input", event => { color = event.target.value; });
document.getElementById("picker_button").addEventListener("click", () => { tool = "picker"; });
document.getElementById("size_picker").addEventListener("input", event => { lineWidth = Number(event.target.value); });
document.getElementById("undo_button").addEventListener("click", undo);
document.getElementById("clear_button").addEventListener("click", clearCanvas);

function startDrawing(event) {
  startX = event.offsetX;
  startY = event.offsetY;

  if (tool === "picker") {
    pickColor(event);
    return;
	}

	drawing = true;

  canvas.setPointerCapture(event.pointerId);

  saveState();

  if (tool === "brush") {
    drawDot();
  }
  if (tool === "eraser") {
    eraseDot();
  }

  // Start a fresh path for movement
  ctx.beginPath();
  ctx.moveTo(startX, startY);
}

function drawDot() {
	ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(startX, startY, lineWidth / 2, 0, Math.PI * 2);
  ctx.fill();
}

function eraseDot() {
	ctx.save();

  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.arc(startX, startY, lineWidth / 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function draw(event) {
  if (!drawing) return;

  let x = event.offsetX;
  let y = event.offsetY;

  if (tool === "brush") {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;

    ctx.lineTo(x, y);
    ctx.stroke();
  }

  if (tool === "eraser") {
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineWidth = lineWidth;

    ctx.lineTo(x, y);
    ctx.stroke();

    ctx.globalCompositeOperation = "source-over";
	}
}

function stopDrawing() {
  drawing = false;
}

function pickColor(event) {
  let x = event.offsetX;
  let y = event.offsetY;

  let pixel = ctx.getImageData(x, y, 1, 1).data;
  let opacity = pixel[3];

  if (opacity < 255) {
  	color = "#ffffff";
  } else {
  	let r = pixel[0];
	  let g = pixel[1];
	  let b = pixel[2];

	  color = "#" +
	    r.toString(16).padStart(2, "0") +
	    g.toString(16).padStart(2, "0") +
	    b.toString(16).padStart(2, "0");
  }

  document.getElementById("color_picker").value = color;
}

function saveState() {
  history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
  if (history.length > 10) { history.shift(); }
}

function undo() {
  if (history.length === 0) return;

  let previous = history.pop();

  ctx.putImageData(previous, 0, 0);
}

function clearCanvas() {
  saveState();

  ctx.clearRect(0, 0, canvas.width, canvas.height);
}
