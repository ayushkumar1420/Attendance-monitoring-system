import * as faceapi from '@vladmandic/face-api';

let modelsLoaded = false;

// Loads SSD MobileNet, Face Landmark 68, and Face Recognition models from jsdelivr CDN
export const loadFaceModels = async () => {
  if (modelsLoaded) return;
  
  const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
  
  await Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
  ]);
  
  modelsLoaded = true;
  console.log('Face-api models loaded successfully from CDN');
};

// Extracts a 128-D descriptor array from a video element
export const detectFaceDescriptor = async (videoElement) => {
  if (!modelsLoaded) throw new Error('Models not loaded yet');

  const detection = await faceapi.detectSingleFace(videoElement)
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection) return null;
  return detection.descriptor; // Float32Array(128)
};

// Computes geometric distance between two descriptors
export const euclideanDistance = (d1, d2) => {
  if (d1.length !== d2.length) throw new Error('Descriptors must be same length');
  let sum = 0;
  for (let i = 0; i < d1.length; i++) {
    sum += Math.pow(d1[i] - d2[i], 2);
  }
  return Math.sqrt(sum);
};

// Computes cosine similarity between two descriptors (alternative)
export const cosineSimilarity = (d1, d2) => {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < d1.length; i++) {
    dotProduct += d1[i] * d2[i];
    normA += Math.pow(d1[i], 2);
    normB += Math.pow(d2[i], 2);
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

// Loops all registered students, finds closest match under threshold
export const findBestMatch = (queryDescriptor, students, threshold = 0.55) => {
  let bestMatch = null;
  let minDistance = Infinity;

  for (const student of students) {
    if (!student.face_descriptor || student.face_descriptor.length === 0) continue;
    
    // Convert DB array back to Float32Array
    const dbDescriptor = new Float32Array(student.face_descriptor);
    const distance = euclideanDistance(queryDescriptor, dbDescriptor);

    if (distance < minDistance) {
      minDistance = distance;
      bestMatch = student;
    }
  }

  if (minDistance <= threshold && bestMatch) {
    // Confidence roughly mapped from distance: 0 dist = 100%, threshold dist = 50%
    const confidence = Math.max(0, 1 - (minDistance / (threshold * 2)));
    return { student: bestMatch, distance: minDistance, confidence };
  }

  return null;
};
