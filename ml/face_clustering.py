"""
Face Clustering Service using DBSCAN algorithm
Groups similar faces into clusters representing the same person
"""

import json
from typing import List, Dict, Any, Optional
import numpy as np
from sklearn.cluster import DBSCAN


class FaceClusteringService:
    """Service for clustering faces into groups representing the same person."""
    
    def __init__(self, eps: float = 0.5, min_samples: int = 2):
        """
        Initialize the clustering service.
        
        Args:
            eps: Maximum distance between two samples to be considered as neighbors
            min_samples: Minimum number of samples in a cluster
        """
        self.eps = eps
        self.min_samples = min_samples
    
    def cluster_faces(
        self, 
        faces: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Cluster faces based on their descriptors.
        
        Args:
            faces: List of faces with 'id' and 'descriptor' keys
            
        Returns:
            List of clusters with face IDs
        """
        if len(faces) < self.min_samples:
            # Not enough faces to cluster
            return [{"cluster_id": i, "face_ids": [face["id"]]} 
                    for i, face in enumerate(faces)]
        
        # Extract descriptors as numpy array
        descriptors = np.array([face["descriptor"] for face in faces])
        
        # Run DBSCAN clustering
        clustering = DBSCAN(
            eps=self.eps, 
            min_samples=self.min_samples,
            metric="euclidean"
        ).fit(descriptors)
        
        # Group faces by cluster
        clusters: Dict[int, List[str]] = {}
        for i, label in enumerate(clustering.labels_):
            cluster_id = int(label)
            if cluster_id not in clusters:
                clusters[cluster_id] = []
            clusters[cluster_id].append(faces[i]["id"])
        
        # Convert to list format
        result = []
        for cluster_id, face_ids in clusters.items():
            result.append({
                "cluster_id": cluster_id,
                "face_ids": face_ids,
                "is_noise": cluster_id == -1  # DBSCAN uses -1 for noise points
            })
        
        return result
    
    def compute_cluster_centroid(
        self, 
        face_descriptors: List[List[float]]
    ) -> List[float]:
        """
        Compute the centroid of a cluster of face descriptors.
        
        Args:
            face_descriptors: List of face descriptors in the cluster
            
        Returns:
            Centroid descriptor
        """
        if not face_descriptors:
            return []
        
        centroid = np.mean(face_descriptors, axis=0)
        return centroid.tolist()
    
    def assign_to_cluster(
        self,
        face_descriptor: List[float],
        cluster_centroids: List[Dict[str, Any]],
        threshold: float = 0.6
    ) -> Optional[str]:
        """
        Assign a face to an existing cluster based on centroid distance.
        
        Args:
            face_descriptor: Face descriptor to assign
            cluster_centroids: List of clusters with 'id' and 'centroid' keys
            threshold: Maximum distance to consider a match
            
        Returns:
            Cluster ID if match found, None otherwise
        """
        descriptor = np.array(face_descriptor)
        best_match = None
        best_distance = threshold
        
        for cluster in cluster_centroids:
            centroid = np.array(cluster["centroid"])
            distance = np.linalg.norm(descriptor - centroid)
            
            if distance < best_distance:
                best_distance = distance
                best_match = cluster["id"]
        
        return best_match


def cluster_faces_from_json(faces_json: str) -> str:
    """
    Cluster faces from JSON input.
    
    Args:
        faces_json: JSON string with list of faces
        
    Returns:
        JSON string with clustering results
    """
    try:
        faces = json.loads(faces_json)
        service = FaceClusteringService()
        clusters = service.cluster_faces(faces)
        
        return json.dumps({
            "success": True,
            "clusters": clusters,
            "cluster_count": len(clusters)
        })
    except Exception as e:
        return json.dumps({
            "success": False,
            "error": str(e),
            "clusters": [],
            "cluster_count": 0
        })


if __name__ == "__main__":
    import sys
    
    # Example usage
    if len(sys.argv) < 2:
        print("Usage: python face_clustering.py '<faces_json>'")
        print("Example: python face_clustering.py '[{\"id\": \"1\", \"descriptor\": [...]}]'")
        sys.exit(1)
    
    result = cluster_faces_from_json(sys.argv[1])
    print(result)
