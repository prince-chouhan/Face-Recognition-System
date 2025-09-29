# app/utils.py
import cv2
import numpy as np
from PIL import Image, ImageEnhance
import io

def clahe_enhance_bgr(bgr_img):
    try:
        ycrcb = cv2.cvtColor(bgr_img, cv2.COLOR_BGR2YCrCb)
        y, cr, cb = cv2.split(ycrcb)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
        y_eq = clahe.apply(y)
        merged = cv2.merge([y_eq, cr, cb])
        return cv2.cvtColor(merged, cv2.COLOR_YCrCb2BGR)
    except Exception:
        return bgr_img

def denoise_and_sharpen(bgr_img):
    try:
        img = Image.fromarray(cv2.cvtColor(bgr_img, cv2.COLOR_BGR2RGB))
        enhancer = ImageEnhance.Sharpness(img)
        img = enhancer.enhance(1.2)
        enhancer = ImageEnhance.Contrast(img)
        img = enhancer.enhance(1.05)
        return cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
    except Exception:
        return bgr_img

def preprocess_frame_for_detection(frame_bgr):
    """
    Preprocess without resizing (server will work on the frame client sends).
    Returns processed frame and scale=1.0 (so returned boxes are in same coords as received image).
    """
    processed = clahe_enhance_bgr(frame_bgr)
    processed = denoise_and_sharpen(processed)
    return processed, 1.0

def crop_face_from_image(full_bgr, top, right, bottom, left, padding=0.15):
    h, w = full_bgr.shape[:2]
    fh = bottom - top
    fw = right - left
    pad_h = int(fh * padding)
    pad_w = int(fw * padding)
    t = max(0, top - pad_h)
    l = max(0, left - pad_w)
    b = min(h, bottom + pad_h)
    r = min(w, right + pad_w)
    crop = full_bgr[t:b, l:r]
    crop = clahe_enhance_bgr(crop)
    crop = denoise_and_sharpen(crop)
    _, jpg = cv2.imencode('.jpg', crop, [int(cv2.IMWRITE_JPEG_QUALITY), 90])
    return jpg.tobytes()
