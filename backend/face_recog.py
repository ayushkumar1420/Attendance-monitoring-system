import sys
import os
import json

# Try to import deepface. If not available, we gracefully fallback
try:
    from deepface import DeepFace
except ImportError:
    print("UNKNOWN")
    sys.exit(0)

if len(sys.argv) < 2:
    print("UNKNOWN")
    sys.exit(1)

image_path = sys.argv[1]
db_path = "faces"

# Ensure faces directory exists
if not os.path.exists(db_path):
    print("UNKNOWN")
    sys.exit(0)

# Ensure there are actually images in the faces directory
has_images = any(f.endswith('.jpg') or f.endswith('.png') for f in os.listdir(db_path))
if not has_images:
    print("UNKNOWN")
    sys.exit(0)

try:
    # Use DeepFace to find the face in the database
    # enforce_detection=False prevents crashing if no face is clearly detected in the webcam capture
    results = DeepFace.find(img_path=image_path, db_path=db_path, enforce_detection=False, silent=True)
    
    if len(results) > 0 and len(results[0]) > 0:
        # Get the identity (file path) of the closest match
        matched_identity = results[0].iloc[0]['identity']
        
        # Extract filename without extension (which is the User _id)
        filename = os.path.basename(matched_identity)
        user_id, _ = os.path.splitext(filename)
        
        print(user_id)
    else:
        print("UNKNOWN")
except Exception as e:
    # Print UNKNOWN for any error so the Node backend doesn't crash parsing JSON/errors
    # print(f"Error: {e}") 
    print("UNKNOWN")
