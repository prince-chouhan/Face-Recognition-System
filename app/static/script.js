// app/static/script.js
let video = document.getElementById("video");
let overlay = document.getElementById("overlay");
let overlayCtx = overlay.getContext("2d");

let startBtn = document.getElementById("startBtn");
let stopBtn = document.getElementById("stopBtn");
let reloadBtn = document.getElementById("reloadDataset");
let presentList = document.getElementById("present");

let stream = null;
let intervalId = null;
const SEND_INTERVAL_MS = 900; // adjust for performance
const SCALE = 0.5;            // send half-size frame to server

async function startCamera() {
  stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
  video.srcObject = stream;
  await video.play();
}

async function captureAndSend() {
  if (!video || video.videoWidth === 0) return;
  const w = Math.floor(video.videoWidth * SCALE);
  const h = Math.floor(video.videoHeight * SCALE);
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, w, h);
  canvas.toBlob(async function(blob) {
    const fd = new FormData();
    fd.append("image", blob, "frame.jpg");
    try {
      const res = await fetch("/recognize", { method: "POST", body: fd });
      const data = await res.json();
      updatePresentList(data.faces);

      // clear overlay
      overlayCtx.clearRect(0, 0, overlay.width, overlay.height);

      // draw boxes for detected faces
      data.faces.forEach(f => {
        const [top, right, bottom, left] = f.box;
        const scaleBack = 1 / SCALE;
        const t = Math.max(0, Math.floor(top * scaleBack));
        const l = Math.max(0, Math.floor(left * scaleBack));
        const b = Math.min(video.videoHeight, Math.floor(bottom * scaleBack));
        const r = Math.min(video.videoWidth, Math.floor(right * scaleBack));

        overlayCtx.strokeStyle = "lime";
        overlayCtx.lineWidth = 2;
        overlayCtx.strokeRect(l, t, r - l, b - t);

        // draw name label
        if (f.name && f.name !== "Unknown") {
          overlayCtx.fillStyle = "lime";
          overlayCtx.font = "16px Arial";
          overlayCtx.fillText(f.name, l + 4, t - 4);
        }
      });

      // for each known face send a crop (full-size) to /mark
      for (const f of data.faces) {
        if (f.name && f.name !== "Unknown" && f.confidence > 50) {
          const [top,right,bottom,left] = f.box;
          const scaleBack = 1 / SCALE;
          const t = Math.max(0, Math.floor(top * scaleBack));
          const l = Math.max(0, Math.floor(left * scaleBack));
          const b = Math.min(video.videoHeight, Math.floor(bottom * scaleBack));
          const r = Math.min(video.videoWidth, Math.floor(right * scaleBack));
          if (b - t > 20 && r - l > 20) {
            const fullCanvas = document.createElement("canvas");
            fullCanvas.width = video.videoWidth; fullCanvas.height = video.videoHeight;
            fullCanvas.getContext("2d").drawImage(video, 0, 0);
            const cropCanvas = document.createElement("canvas");
            cropCanvas.width = r - l; cropCanvas.height = b - t;
            cropCanvas.getContext("2d").drawImage(fullCanvas, l, t, r-l, b-t, 0, 0, r-l, b-t);
            cropCanvas.toBlob(async function(cblob) {
              const fd2 = new FormData();
              fd2.append("image", cblob, "face.jpg");
              fd2.append("name", f.name);
              fd2.append("confidence", f.confidence);
              await fetch("/mark", { method: "POST", body: fd2 });
            }, 'image/jpeg', 0.9);
          }
        }
      }
    } catch (e) {
      console.log("send error", e);
    }
  }, "image/jpeg", 0.8);
}

function updatePresentList(faces) {
  presentList.innerHTML = "";
  const unique = {};
  faces.forEach(f => {
    if (!unique[f.name]) unique[f.name] = f.confidence;
    else unique[f.name] = Math.max(unique[f.name], f.confidence);
  });
  Object.keys(unique).forEach(name => {
    const li = document.createElement("li");
    li.textContent = `${name} (${unique[name].toFixed(1)}%)`;
    presentList.appendChild(li);
  });
}

startBtn.onclick = async () => {
  if (!stream) await startCamera();
  if (!intervalId) intervalId = setInterval(captureAndSend, SEND_INTERVAL_MS);
};

stopBtn.onclick = () => {
  if (intervalId) { clearInterval(intervalId); intervalId = null; }
  if (stream) {
    stream.getTracks().forEach(t => t.stop());
    stream = null;
  }
  overlayCtx.clearRect(0, 0, overlay.width, overlay.height);
};

reloadBtn.onclick = async () => {
  await fetch("/reload_dataset", { method: "POST" });
  alert("Dataset reloaded on server (if you added new images, now they will be used).");
};
