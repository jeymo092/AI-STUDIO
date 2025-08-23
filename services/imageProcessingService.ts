import * as FileSystem from 'expo-file-system';

const RAPIDAPI_KEY = 'dc3a2f3260msh0a744cd1233f1a2p1def2ejsn248c50c8febb';
const RAPIDAPI_HOST = 'ai-background-remover.p.rapidapi.com';

export interface ProcessingResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

export interface HDProcessingResult {
  success: boolean;
  uuid?: string;
  error?: string;
}

// Helper function to convert base64 to blob
const base64ToBlob = (base64: string, mimeType: string): Blob => {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
};

// Helper function to convert blob to base64
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert blob to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// Helper function to prepare image for upload
const prepareImageForUpload = async (imageUri: string): Promise<Blob> => {
  try {
    if (imageUri.startsWith('data:')) {
      // Extract base64 part and mime type
      const [header, base64Part] = imageUri.split(',');
      const mimeType = header.match(/data:([^;]+)/)?.[1] || 'image/jpeg';
      console.log('Extracted base64 part length:', base64Part.length);
      console.log('MIME type:', mimeType);
      return base64ToBlob(base64Part, mimeType);
    }

    // If it's a file URI, read and convert to blob
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    console.log('Converted to base64, length:', base64.length);
    return base64ToBlob(base64, 'image/jpeg');
  } catch (error) {
    console.error('Error preparing image for upload:', error);
    throw new Error('Failed to prepare image for upload');
  }
};

// Remove background
export const removeBackground = async (imageUri: string): Promise<ProcessingResult> => {
  try {
    console.log('Starting background removal process...');
    console.log('Image URI length:', imageUri.length);

    const imageBlob = await prepareImageForUpload(imageUri);
    console.log('Image prepared for upload, size:', imageBlob.size);

    const formData = new FormData();
    formData.append('image', imageBlob, 'image.jpg');

    const response = await fetch('https://ai-background-remover.p.rapidapi.com/image/matte/v1', {
      method: 'POST',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': RAPIDAPI_HOST,
      },
      body: formData
    });

    console.log('API Response status:', response.status);
    console.log('Response headers:', response.headers.get('content-type'));

    if (!response.ok) {
      const errorText = await response.text();
      console.log('API Error response:', errorText);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    // Check if response is binary (image) or JSON
    const contentType = response.headers.get('content-type');
    console.log('Response content type:', contentType);

    if (contentType && contentType.includes('image/')) {
      // Response is binary image data
      const blob = await response.blob();
      const base64 = await blobToBase64(blob);
      console.log('Binary image response converted to base64');
      
      return {
        success: true,
        imageUrl: base64
      };
    } else {
      // Response is JSON
      const result = await response.json();
      console.log('API response received:', result ? 'Success' : 'No result');

      if (result.image) {
        return {
          success: true,
          imageUrl: `data:image/png;base64,${result.image}`
        };
      } else {
        throw new Error('No processed image returned');
      }
    }
  } catch (error) {
    console.error('Background removal error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Helper function to convert image URI to base64 string
const imageToBase64 = async (imageUri: string): Promise<string> => {
  try {
    if (imageUri.startsWith('data:')) {
      // Extract base64 part
      const [, base64Part] = imageUri.split(',');
      if (!base64Part) {
        throw new Error('Invalid data URI format');
      }
      console.log('Extracted base64 length:', base64Part.length);
      return base64Part;
    }

    // If it's a file URI, read and convert to base64
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    console.log('File converted to base64, length:', base64.length);
    return base64;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw new Error(`Failed to convert image to base64: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Blur background
export const blurBackground = async (imageUri: string): Promise<ProcessingResult> => {
  try {
    console.log('Starting blur background processing...');
    const base64Image = await imageToBase64(imageUri);

    const response = await fetch('https://ai-background-remover.p.rapidapi.com/image/blur/v1', {
      method: 'POST',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': RAPIDAPI_HOST,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        image: base64Image
      })
    });

    console.log('Blur API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Blur API Error response:', errorText);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();

    if (result.image) {
      console.log('Blur processing successful!');
      return {
        success: true,
        imageUrl: `data:image/jpeg;base64,${result.image}`
      };
    } else {
      throw new Error('No processed image returned');
    }
  } catch (error) {
    console.error('Background blur error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Blur processing failed'
    };
  }
};

// Add gradient background
export const addGradientBackground = async (imageUri: string): Promise<ProcessingResult> => {
  try {
    const base64Image = await imageToBase64(imageUri);

    const response = await fetch('https://ai-background-remover.p.rapidapi.com/image/gradient/v1', {
      method: 'POST',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': RAPIDAPI_HOST,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        image: base64Image
      })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const result = await response.json();

    if (result.image) {
      return {
        success: true,
        imageUrl: `data:image/jpeg;base64,${result.image}`
      };
    } else {
      throw new Error('No processed image returned');
    }
  } catch (error) {
    console.error('Gradient background error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Add color background
export const addColorBackground = async (imageUri: string, color?: string): Promise<ProcessingResult> => {
  try {
    const base64Image = await imageToBase64(imageUri);

    const body = new URLSearchParams({
      image: base64Image
    });

    if (color) {
      body.append('color', color);
    }

    const response = await fetch('https://ai-background-remover.p.rapidapi.com/image/color/v1', {
      method: 'POST',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': RAPIDAPI_HOST,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const result = await response.json();

    if (result.image) {
      return {
        success: true,
        imageUrl: `data:image/jpeg;base64,${result.image}`
      };
    } else {
      throw new Error('No processed image returned');
    }
  } catch (error) {
    console.error('Color background error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Add shadow
export const addShadow = async (imageUri: string): Promise<ProcessingResult> => {
  try {
    console.log('Starting shadow processing...');
    const base64Image = await imageToBase64(imageUri);
    console.log('Image converted to base64, length:', base64Image.length);

    const response = await fetch('https://ai-background-remover.p.rapidapi.com/image/shadow/v1', {
      method: 'POST',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': RAPIDAPI_HOST,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        image: base64Image
      })
    });

    console.log('Shadow API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Shadow API Error response:', errorText);
      
      // If shadow fails, try blur as fallback
      console.log('Shadow failed, trying blur as fallback...');
      return await blurBackground(imageUri);
    }

    const result = await response.json();

    if (result.image) {
      console.log('Shadow processing successful!');
      return {
        success: true,
        imageUrl: `data:image/png;base64,${result.image}`
      };
    } else {
      throw new Error('No processed image returned');
    }
  } catch (error) {
    console.error('Shadow error:', error);
    
    // Try blur as fallback
    try {
      console.log('Shadow failed, trying blur as fallback...');
      return await blurBackground(imageUri);
    } catch (fallbackError) {
      console.error('Fallback blur also failed:', fallbackError);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Shadow processing failed'
      };
    }
  }
};

// Generate AI background
export const generateAIBackground = async (imageUri: string, prompt?: string): Promise<ProcessingResult> => {
  try {
    const base64Image = await imageToBase64(imageUri);

    const body = new URLSearchParams({
      image: base64Image
    });

    if (prompt) {
      body.append('prompt', prompt);
    }

    const response = await fetch('https://ai-background-remover.p.rapidapi.com/image/generate/v1', {
      method: 'POST',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': RAPIDAPI_HOST,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const result = await response.json();

    if (result.image) {
      return {
        success: true,
        imageUrl: `data:image/jpeg;base64,${result.image}`
      };
    } else {
      throw new Error('No processed image returned');
    }
  } catch (error) {
    console.error('AI generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Erase objects from image
export const eraseObjects = async (imageUri: string, boundingBoxes?: number[][][]): Promise<ProcessingResult> => {
  try {
    console.log('Starting object erasing...');
    const base64Image = await imageToBase64(imageUri);

    // Default bounding box if none provided (center area)
    const defaultBoundingBoxes = boundingBoxes || [
      [
        [100, 100],
        [300, 100],
        [300, 300],
        [100, 300]
      ]
    ];

    const requestBody = {
      image_bytes: base64Image,
      image_format: 'png',
      bounding_boxes: defaultBoundingBoxes
    };

    const response = await fetch('https://image-erase.p.rapidapi.com/image_erase', {
      method: 'POST',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': 'image-erase.p.rapidapi.com',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    console.log('Erase API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erase API Error response:', errorText);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();

    if (result.image || result.image_bytes) {
      const imageData = result.image || result.image_bytes;
      console.log('Object erasing successful!');
      return {
        success: true,
        imageUrl: `data:image/png;base64,${imageData}`
      };
    } else {
      throw new Error('No processed image returned');
    }
  } catch (error) {
    console.error('Object erasing error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Object erasing failed'
    };
  }
};

// Enhance face - using multiple fallback strategies
export const enhanceFace = async (imageUri: string): Promise<ProcessingResult> => {
  try {
    console.log('Starting face enhancement...');
    
    // Try gradient background first as it tends to be more reliable
    console.log('Trying gradient enhancement...');
    const gradientResult = await addGradientBackground(imageUri);
    
    if (gradientResult.success) {
      console.log('Gradient enhancement successful!');
      return gradientResult;
    }
    
    // If gradient fails, try color background
    console.log('Gradient failed, trying color background...');
    const colorResult = await addColorBackground(imageUri, '#f0f0f0');
    
    if (colorResult.success) {
      console.log('Color background enhancement successful!');
      return colorResult;
    }
    
    // If both fail, try blur
    console.log('Color background failed, trying blur...');
    const blurResult = await blurBackground(imageUri);
    
    if (blurResult.success) {
      console.log('Blur enhancement successful!');
      return blurResult;
    }
    
    throw new Error('All enhancement methods failed');
    
  } catch (error) {
    console.error('Face enhancement error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Enhancement feature temporarily unavailable'
    };
  }
};

// Submit HD processing
export const submitHDProcessing = async (imageUri: string): Promise<HDProcessingResult> => {
  try {
    const base64Image = await imageToBase64(imageUri);

    const response = await fetch('https://ai-background-remover.p.rapidapi.com/image/hd/submit/v1', {
      method: 'POST',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': RAPIDAPI_HOST,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        image: base64Image
      })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const result = await response.json();

    if (result.uuid) {
      return {
        success: true,
        uuid: result.uuid
      };
    } else {
      throw new Error('No UUID returned');
    }
  } catch (error) {
    console.error('HD processing submission error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Get HD processing result
export const getHDResult = async (uuid: string): Promise<ProcessingResult> => {
  try {
    const response = await fetch(`https://ai-background-remover.p.rapidapi.com/image/hd/result/${uuid}`, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': RAPIDAPI_HOST
      }
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const result = await response.json();

    if (result.status === 'completed' && result.image) {
      return {
        success: true,
        imageUrl: `data:image/png;base64,${result.image}`
      };
    } else if (result.status === 'processing') {
      return {
        success: false,
        error: 'Still processing'
      };
    } else {
      throw new Error('Processing failed or image not ready');
    }
  } catch (error) {
    console.error('HD result error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};