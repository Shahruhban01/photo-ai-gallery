"""
Face Recognition Service using face_recognition library
This module handles face detection and feature extraction
"""

import os
import json
from typing import List, Dict, Any, Tuple
import numpy as np

try:
    import face_recognition
    FACE_RECOGNITION_AVAILABLE = True
except ImportError:
    FACE_RECOGNITION_AVAILABLE = False
    print("Warning: face_recognition not available. Using mock implementation.")


class FaceRecognitionService:
    """Service for detecting and extracting face features from images."""
    
    def __init__(self, model: str = "hog"):
        """
        Initialize the face recognition service.
        
        Args:
            model: Face detection model ('hog' for CPU, 'cnn' for GPU)
        """
        self.model = model
    
    def detect_faces(self, image_path: str) -> List[Dict[str, Any]]:
        """
        Detect faces in an image and extract face descriptors.
        
        Args:
            image_path: Path to the image file
            
        Returns:
            List of detected faces with bounding boxes and descriptors
        """
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image not found: {image_path}")
        
        if not FACE_RECOGNITION_AVAILABLE:
            return []
        
        # Load image
        image = face_recognition.load_image_file(image_path)
        
        # Detect face locations
        face_locations = face_recognition.face_locations(image, model=self.model)
        
        # Get face encodings (descriptors)
        face_encodings = face_recognition.face_encodings(image, face_locations)
        
        faces = []
        for location, encoding in zip(face_locations, face_encodings):
            top, right, bottom, left = location
            faces.append({
                "bounding_box": {
                    "x": left,
                    "y": top,
                    "width": right - left,
                    "height": bottom - top
                },
                "descriptor": encoding.tolist(),
                "confidence": 1.0  # face_recognition doesn't provide confidence scores
            })
        
        return faces
    
    def compare_faces(
        self, 
        face_descriptor1: List[float], 
        face_descriptor2: List[float],
        tolerance: float = 0.6
    ) -> Tuple[bool, float]:
        """
        Compare two face descriptors to determine if they belong to the same person.
        
        Args:
            face_descriptor1: First face descriptor
            face_descriptor2: Second face descriptor
            tolerance: Distance threshold for considering faces as same person
            
        Returns:
            Tuple of (is_same_person, distance)
        """
        if not FACE_RECOGNITION_AVAILABLE:
            return False, 1.0
        
        encoding1 = np.array(face_descriptor1)
        encoding2 = np.array(face_descriptor2)
        
        distance = np.linalg.norm(encoding1 - encoding2)
        is_same = distance < tolerance
        
        return is_same, float(distance)
    
    def find_matches(
        self,
        face_descriptor: List[float],
        known_faces: List[Dict[str, Any]],
        tolerance: float = 0.6
    ) -> List[Dict[str, Any]]:
        """
        Find matching faces from a list of known faces.
        
        Args:
            face_descriptor: Face descriptor to match
            known_faces: List of known faces with 'id' and 'descriptor' keys
            tolerance: Distance threshold for matches
            
        Returns:
            List of matching faces with distance scores
        """
        matches = []
        
        for known_face in known_faces:
            is_same, distance = self.compare_faces(
                face_descriptor,
                known_face["descriptor"],
                tolerance
            )
            
            if is_same:
                matches.append({
                    "id": known_face.get("id"),
                    "distance": distance
                })
        
        # Sort by distance (closest matches first)
        matches.sort(key=lambda x: x["distance"])
        
        return matches


def process_image(image_path: str) -> str:
    """
    Process an image and return detected faces as JSON.
    
    Args:
        image_path: Path to the image file
        
    Returns:
        JSON string with detected faces
    """
    service = FaceRecognitionService()
    
    try:
        faces = service.detect_faces(image_path)
        return json.dumps({
            "success": True,
            "faces": faces,
            "count": len(faces)
        })
    except Exception as e:
        return json.dumps({
            "success": False,
            "error": str(e),
            "faces": [],
            "count": 0
        })


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python facial_recognition.py <image_path>")
        sys.exit(1)
    
    result = process_image(sys.argv[1])
    print(result)
