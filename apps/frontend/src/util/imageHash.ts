/**
 * Utility functions for image hashing to prevent duplicate submissions
 */

/**
 * Generates SHA-256 hash of an image in base64 format
 * @param imageBase64 Image in base64 format
 * @returns Promise resolving to hash string
 */
export const generateImageHash = async (imageBase64: string): Promise<string> => {
  try {
    // Clean the base64 data if it includes the prefix
    let base64Data = imageBase64;
    if (base64Data.includes('base64,')) {
      base64Data = imageBase64.split('base64,')[1];
    }

    // Convert base64 to array buffer for hashing
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Generate SHA-256 hash
    const hashBuffer = await crypto.subtle.digest('SHA-256', bytes.buffer);
    
    // Convert hash to hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashHex;
  } catch (error) {
    console.error('Error generating image hash:', error);
    // Fallback to timestamp-based unique ID if hashing fails
    return `fallback-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
  }
};

/**
 * Generates a perceptual hash of image data
 * This is a simplified implementation - for production use consider using a library
 * @param imageBase64 Image in base64 format 
 * @returns Promise resolving to perceptual hash string
 */
export const generatePerceptualHash = async (imageBase64: string): Promise<string> => {
  return new Promise((resolve) => {
    try {
      // Create an image element to draw to canvas
      const img = new Image();
      img.onload = () => {
        // Create small canvas (8x8) for perceptual hash
        const canvas = document.createElement('canvas');
        canvas.width = 8;
        canvas.height = 8;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          resolve(`fallback-${Date.now()}`);
          return;
        }
        
        // Draw image to small canvas to normalize size
        ctx.drawImage(img, 0, 0, 8, 8);
        
        // Get image data and calculate average
        const imageData = ctx.getImageData(0, 0, 8, 8).data;
        
        // Calculate average value of grayscale pixels
        let sum = 0;
        const grayValues = [];
        
        for (let i = 0; i < imageData.length; i += 4) {
          // Convert to grayscale using luminance formula
          const gray = 0.299 * imageData[i] + 0.587 * imageData[i + 1] + 0.114 * imageData[i + 2];
          sum += gray;
          grayValues.push(gray);
        }
        
        const avg = sum / grayValues.length;
        
        // Create hash string (1 for pixels above average, 0 for below)
        let hash = '';
        for (let i = 0; i < grayValues.length; i++) {
          hash += grayValues[i] > avg ? '1' : '0';
        }
        
        resolve(hash);
      };
      
      img.onerror = () => {
        resolve(`fallback-${Date.now()}`);
      };
      
      // Load the image from base64
      img.src = imageBase64.includes('base64,') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`;
    } catch (error) {
      console.error('Error generating perceptual hash:', error);
      resolve(`fallback-${Date.now()}`);
    }
  });
};

/**
 * Get combined image hash (uses both SHA-256 and perceptual hash)
 * @param imageBase64 Image in base64 format
 * @returns Promise resolving to combined hash string
 */
export const getImageFingerprint = async (imageBase64: string): Promise<string> => {
  try {
    const contentHash = await generateImageHash(imageBase64);
    const perceptualHash = await generatePerceptualHash(imageBase64);
    
    // Combine both hashes for better duplicate detection
    return `${contentHash.substring(0, 32)}_${perceptualHash}`;
  } catch (error) {
    console.error('Error generating image fingerprint:', error);
    return `fallback-${Date.now()}`;
  }
}; 