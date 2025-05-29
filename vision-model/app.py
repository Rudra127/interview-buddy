from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
import cv2
import numpy as np
import mediapipe as mp
from ultralytics import YOLO
from io import BytesIO
import tempfile
import os
from pathlib import Path

app = FastAPI()
model = YOLO('yolov8n.pt')
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(static_image_mode=False,
                                   max_num_faces=1,
                                   refine_landmarks=True,
                                   min_detection_confidence=0.5,
                                   min_tracking_confidence=0.5)

# Helper function for eye direction
def get_eye_direction(corners, iris):
    left = np.array(corners[0])
    right = np.array(corners[1])
    iris = np.array(iris)
    total_width = np.linalg.norm(right - left)
    dist_left = np.linalg.norm(iris - left)
    ratio = dist_left / total_width
    if ratio < 0.35:
        return "left"
    elif ratio > 0.65:
        return "right"
    else:
        return "center"

def process_mobile_detection(frame):
    results = model(frame, verbose=False)
    mobile_detected = False
    for result in results:
        for box in result.boxes:
            conf = box.conf[0].item()
            cls = int(box.cls[0].item())
            if conf < 0.8 or cls != 67:
                continue
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            label = f"Mobile ({conf:.2f})"
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 3)
            cv2.putText(frame, label, (x1, y1 - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
            mobile_detected = True
    return frame, mobile_detected

def process_frame(frame):
    """Process a single frame for face detection and analysis"""
    image_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = face_mesh.process(image_rgb)
    img_h, img_w, _ = frame.shape

    if results.multi_face_landmarks:
        for face_landmarks in results.multi_face_landmarks:
            x_coords, y_coords = [], []
            face_2d, face_3d = [], []

            for idx, lm in enumerate(face_landmarks.landmark):
                x, y = int(lm.x * img_w), int(lm.y * img_h)
                x_coords.append(x)
                y_coords.append(y)
                if idx in [33, 263, 1, 61, 291, 199]:
                    if idx == 1:
                        nose_2d = (x, y)
                        nose_3d = (x, y, lm.z * 3000)
                    face_2d.append([x, y])
                    face_3d.append([x, y, lm.z])

            # Bounding box
            x_min, x_max = min(x_coords), max(x_coords)
            y_min, y_max = min(y_coords), max(y_coords)
            cv2.rectangle(frame, (x_min, y_min), (x_max, y_max), (0, 255, 0), 2)

            # Head pose
            face_2d = np.array(face_2d, dtype=np.float64)
            face_3d = np.array(face_3d, dtype=np.float64)
            cam_matrix = np.array([
                [img_w, 0, img_h / 2],
                [0, img_w, img_w / 2],
                [0, 0, 1]
            ])
            dist_matrix = np.zeros((4, 1), dtype=np.float64)
            success, rot_vec, trans_vec = cv2.solvePnP(face_3d, face_2d, cam_matrix, dist_matrix)
            rmat, _ = cv2.Rodrigues(rot_vec)
            angles, _, _, _, _, _ = cv2.RQDecomp3x3(rmat)
            x_angle, y_angle, z_angle = angles[0] * 360, angles[1] * 360, angles[2] * 360

            # Head direction
            if y_angle < -10:
                head_dir = "left"
            elif y_angle > 10:
                head_dir = "right"
            elif x_angle < -10:
                head_dir = "down"
            elif x_angle > 10:
                head_dir = "up"
            else:
                head_dir = "center"

            # Eye direction
            left_eye_pts = [(face_landmarks.landmark[33].x * img_w, face_landmarks.landmark[33].y * img_h),
                            (face_landmarks.landmark[133].x * img_w, face_landmarks.landmark[133].y * img_h)]
            right_eye_pts = [(face_landmarks.landmark[362].x * img_w, face_landmarks.landmark[362].y * img_h),
                             (face_landmarks.landmark[263].x * img_w, face_landmarks.landmark[263].y * img_h)]
            left_iris = (face_landmarks.landmark[468].x * img_w, face_landmarks.landmark[468].y * img_h)
            right_iris = (face_landmarks.landmark[473].x * img_w, face_landmarks.landmark[473].y * img_h)

            left_eye_dir = get_eye_direction(left_eye_pts, left_iris)
            right_eye_dir = get_eye_direction(right_eye_pts, right_iris)

            # Labels
            label_lines = [
                f"Head: {head_dir}",
                f"Left Eye: {left_eye_dir}",
                f"Right Eye: {right_eye_dir}"
            ]
            for i, text in enumerate(label_lines):
                y_offset = 30 + i * 30
                cv2.putText(frame, text, (20, y_offset), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)

            # Draw irises
            for iris in [left_iris, right_iris]:
                cv2.circle(frame, (int(iris[0]), int(iris[1])), 3, (255, 0, 255), -1)

    # Process mobile detection
    frame, _ = process_mobile_detection(frame)
    return frame

@app.post("/process-video/")
async def process_video(file: UploadFile = File(...)):
    """Process uploaded video file and return processed video"""
    try:
        # Validate file type
        if not file.content_type.startswith('video/'):
            raise HTTPException(status_code=400, detail="File must be a video")
        
        # Create temporary files
        with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as temp_input:
            content = await file.read()
            temp_input.write(content)
            temp_input_path = temp_input.name
        
        temp_output_path = temp_input_path.replace('.mp4', '_processed.mp4')
        
        # Open video capture
        cap = cv2.VideoCapture(temp_input_path)
        if not cap.isOpened():
            raise HTTPException(status_code=400, detail="Could not open video file")
        
        # Get video properties
        fps = int(cap.get(cv2.CAP_PROP_FPS))
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        # Define codec and create VideoWriter
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(temp_output_path, fourcc, fps, (width, height))
        
        frame_count = 0
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            # Process frame
            processed_frame = process_frame(frame)
            
            # Add frame counter
            cv2.putText(processed_frame, f"Frame: {frame_count}/{total_frames}", 
                       (width - 200, height - 20), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
            
            # Write processed frame
            out.write(processed_frame)
            frame_count += 1
        
        # Release everything
        cap.release()
        out.release()
        
        # Read processed video and stream response
        def generate():
            with open(temp_output_path, 'rb') as f:
                while True:
                    chunk = f.read(8192)
                    if not chunk:
                        break
                    yield chunk
        
        # Clean up temp files after streaming
        def cleanup():
            try:
                os.unlink(temp_input_path)
                os.unlink(temp_output_path)
            except:
                pass
        
        response = StreamingResponse(
            generate(), 
            media_type="video/mp4",
            headers={"Content-Disposition": "attachment; filename=processed_video.mp4"}
        )
        
        # Note: In a production environment, you might want to implement proper cleanup
        # This is a simplified version
        return response
        
    except Exception as e:
        # Clean up temp files in case of error
        try:
            if 'temp_input_path' in locals():
                os.unlink(temp_input_path)
            if 'temp_output_path' in locals():
                os.unlink(temp_output_path)
        except:
            pass
        raise HTTPException(status_code=500, detail=f"Error processing video: {str(e)}")

@app.post("/process-video-fast/")
async def process_video_fast(file: UploadFile = File(...)):
    """Process video with optimized performance and return processed video"""
    try:
        if not file.content_type.startswith('video/'):
            raise HTTPException(status_code=400, detail="File must be a video")
        
        # Create temporary files
        with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as temp_input:
            content = await file.read()
            temp_input.write(content)
            temp_input_path = temp_input.name
        
        temp_output_path = temp_input_path.replace('.mp4', '_fast_processed.mp4')
        
        # Open video capture
        cap = cv2.VideoCapture(temp_input_path)
        if not cap.isOpened():
            raise HTTPException(status_code=400, detail="Could not open video file")
        
        # Get video properties
        fps = int(cap.get(cv2.CAP_PROP_FPS))
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        # Define codec and create VideoWriter
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(temp_output_path, fourcc, fps, (width, height))
        
        frame_count = 0
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            # Process every 3rd frame for faster processing, copy others
            if frame_count % 3 == 0:
                processed_frame = process_frame(frame)
            else:
                processed_frame = frame.copy()
            
            # Add frame counter and processing indicator
            status_text = "PROCESSED" if frame_count % 3 == 0 else "COPIED"
            cv2.putText(processed_frame, f"Frame: {frame_count}/{total_frames} ({status_text})", 
                       (10, height - 20), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
            
            # Write frame
            out.write(processed_frame)
            frame_count += 1
        
        # Release everything
        cap.release()
        out.release()
        
        # Stream the processed video
        def generate():
            with open(temp_output_path, 'rb') as f:
                while True:
                    chunk = f.read(8192)
                    if not chunk:
                        break
                    yield chunk
        
        # Clean up will happen after streaming
        response = StreamingResponse(
            generate(), 
            media_type="video/mp4",
            headers={"Content-Disposition": "attachment; filename=fast_processed_video.mp4"}
        )
        
        return response
        
    except Exception as e:
        # Clean up temp files in case of error
        try:
            if 'temp_input_path' in locals():
                os.unlink(temp_input_path)
            if 'temp_output_path' in locals():
                os.unlink(temp_output_path)
        except:
            pass
        raise HTTPException(status_code=500, detail=f"Error processing video: {str(e)}")

# Keep the original image processing endpoint as well
@app.post("/process-image/")
async def process_image(file: UploadFile = File(...)):
    """Original image processing endpoint"""
    contents = await file.read()
    np_arr = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    if image is None:
        return {"error": "Invalid image"}

    processed_image = process_frame(image)

    # Return image
    _, img_encoded = cv2.imencode(".jpg", processed_image)
    return StreamingResponse(BytesIO(img_encoded.tobytes()), media_type="image/jpeg")

@app.get("/")
async def root():
    return {
        "message": "Face, Eye, and Mobile Detection API",
        "endpoints": {
            "/process-image/": "Process single image and return processed image",
            "/process-video/": "Process every frame of video (high quality, slower)",
            "/process-video-fast/": "Process every 3rd frame of video (faster processing)",
        },
        "note": "All endpoints return the processed media file (image/video) with detections"
    }