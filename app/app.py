# app/app.py
import os
import io
from flask import Flask, request, jsonify, render_template, send_file
import numpy as np
import cv2
import face_recognition
from datetime import datetime
import traceback

import utils
from db import mark_attendance_unique, get_all_attendance

app = Flask(__name__, template_folder='templates', static_folder='static')
APP_ROOT = os.path.dirname(os.path.abspath(__file__))
FACES_DIR = os.path.join(APP_ROOT, '..', 'faces')
os.makedirs(FACES_DIR, exist_ok=True)

# Load known dataset encodings at startup
DATASET_DIR = os.path.join(APP_ROOT, 'dataset')
KNOWN_ENCODINGS = []
KNOWN_NAMES = []
KNOWN_ROLLS = []  # <- new: parallel list of roll numbers (may be None)

def reload_known_faces():
    global KNOWN_ENCODINGS, KNOWN_NAMES, KNOWN_ROLLS
    KNOWN_ENCODINGS = []
    KNOWN_NAMES = []
    KNOWN_ROLLS = []
    if not os.path.exists(DATASET_DIR):
        print("Dataset folder not found at", DATASET_DIR)
        return
    for name in sorted(os.listdir(DATASET_DIR)):
        person_dir = os.path.join(DATASET_DIR, name)
        if not os.path.isdir(person_dir):
            continue

        # try to read roll_no.txt in person directory (optional)
        roll_value = None
        roll_file = os.path.join(person_dir, "roll_no.txt")
        try:
            if os.path.exists(roll_file):
                with open(roll_file, "r", encoding="utf-8") as rf:
                    raw = rf.read().strip()
                    if raw != "":
                        roll_value = raw
        except Exception as e:
            print("Error reading roll_no for", name, e)

        for fname in os.listdir(person_dir):
            if not fname.lower().endswith(('.jpg', '.jpeg', '.png')):
                continue
            path = os.path.join(person_dir, fname)
            try:
                img = face_recognition.load_image_file(path)
                encs = face_recognition.face_encodings(img)
                if encs:
                    KNOWN_ENCODINGS.append(encs[0])
                    KNOWN_NAMES.append(name)
                    KNOWN_ROLLS.append(roll_value)  # keep roll aligned with encoding
            except Exception as e:
                print("Error loading dataset image:", path, e)

reload_known_faces()
print("Loaded known names:", KNOWN_NAMES)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/health")
def health():
    return jsonify({"status": "ok"})

@app.route("/reload_dataset", methods=["POST"])
def reload_dataset_route():
    reload_known_faces()
    return jsonify({"loaded": len(KNOWN_NAMES), "names": KNOWN_NAMES})

@app.route("/recognize", methods=["POST"])
def recognize():
    try:
        if 'image' not in request.files:
            return jsonify({"error": "no image"}), 400
        data = request.files['image'].read()
        npimg = np.frombuffer(data, np.uint8)
        frame = cv2.imdecode(npimg, cv2.IMREAD_COLOR)
        if frame is None:
            return jsonify({"error": "bad image"}), 400

        processed, scale = utils.preprocess_frame_for_detection(frame)
        rgb = cv2.cvtColor(processed, cv2.COLOR_BGR2RGB)
        face_locations = face_recognition.face_locations(rgb, model='hog')
        face_encodings = face_recognition.face_encodings(rgb, face_locations)

        results = []
        threshold = float(os.getenv("CONFIDENCE_THRESHOLD", "0.5"))
        for (top, right, bottom, left), enc in zip(face_locations, face_encodings):
            name = "Unknown"
            confidence = 0.0
            roll_no = None
            if KNOWN_ENCODINGS:
                dists = face_recognition.face_distance(KNOWN_ENCODINGS, enc)
                best = int(np.argmin(dists))
                bestd = float(dists[best])
                if bestd < threshold:
                    name = KNOWN_NAMES[best]
                    confidence = round(((1 - bestd) * 100), 2)
                    # include roll if available
                    roll_no = KNOWN_ROLLS[best]

            if name != "Unknown":
                confidence = min(confidence + 15, 100.0)

            results.append({
                "name": name,
                "confidence": confidence,
                "roll_no": roll_no,
                "box": [int(top), int(right), int(bottom), int(left)]
            })
        return jsonify({"faces": results})
    except Exception as e:
        print("recognize error:", e)
        traceback.print_exc()
        return jsonify({"error": "server error"}), 500

@app.route("/mark", methods=["POST"])
def mark():
    try:
        roll_no = request.form.get("roll_no")
        name = request.form.get("name")
        confidence = float(request.form.get("confidence", 0.0))
        # fallback: if client didn't supply roll_no but name is known, use in-memory map
        if not roll_no and name and KNOWN_NAMES:
            try:
                idx = KNOWN_NAMES.index(name)
                candidate = KNOWN_ROLLS[idx]
                if candidate:
                    roll_no = candidate
            except ValueError:
                pass

        if 'image' not in request.files or not name:
            return jsonify({"error": "name and image required"}), 400
        img_bytes = request.files['image'].read()

        safe = "".join(c for c in name if c.isalnum() or c in (" ", "_", "-")).strip()
        person_dir = os.path.join(FACES_DIR, safe)
        os.makedirs(person_dir, exist_ok=True)
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        fname = f"{ts}.jpg"
        fpath = os.path.join(person_dir, fname)
        with open(fpath, "wb") as f:
            f.write(img_bytes)

        inserted = mark_attendance_unique(roll_no, name, confidence, fpath)
        return jsonify({"marked": inserted, "path": fpath, "used_roll_no": roll_no})
    except Exception as e:
        print("mark error", e)
        traceback.print_exc()
        return jsonify({"error": "server error"}), 500

@app.route("/attendance/json")
def attendance_json():
    rows = get_all_attendance()
    for r in rows:
        if isinstance(r.get('timestamp'), (str, bytes)):
            continue
        r['timestamp'] = r['timestamp'].strftime("%Y-%m-%d %H:%M:%S")
    return jsonify(rows)

@app.route("/attendance/csv")
def attendance_csv():
    rows = get_all_attendance()
    for r in rows:
        if not isinstance(r.get('timestamp'), str):
            r['timestamp'] = r['timestamp'].strftime("%Y-%m-%d %H:%M:%S")
    fname = f"attendance_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    import csv
    with open(fname, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["name", "confidence", "image_path", "timestamp"])
        w.writeheader()
        w.writerows(rows)
    return send_file(fname, as_attachment=True)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
