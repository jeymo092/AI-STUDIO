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

    // Use the same approach as other functions for consistency
    const base64Image = await imageToBase64(imageUri);
    console.log('Image converted to base64, length:', base64Image.length);

    const response = await fetch('https://ai-background-remover.p.rapidapi.com/image/matte/v1', {
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

    console.log('API Response status:', response.status);
    console.log('Response headers:', response.headers.get('content-type'));

    if (!response.ok) {
      const errorText = await response.text();
      console.log('API Error response:', errorText);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

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
      return base64Part;
    }

    // If it's a file URI, read and convert to base64
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return base64;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw new Error('Failed to convert image to base64');
  }
};

// Blur background
export const blurBackground = async (imageUri: string): Promise<ProcessingResult> => {
  try {
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
    console.error('Background blur error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
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
    const base64Image = await imageToBase64(imageUri);

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

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const result = await response.json();

    if (result.image) {
      return {
        success: true,
        imageUrl: `data:image/png;base64,${result.image}`
      };
    } else {
      throw new Error('No processed image returned');
    }
  } catch (error) {
    console.error('Shadow error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
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

// Enhance face
export const enhanceFace = async (imageUri: string): Promise<ProcessingResult> => {
  try {
    const base64Image = await imageToBase64(imageUri);

    const response = await fetch('https://ai-background-remover.p.rapidapi.com/image/enhance/v1', {
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
      throw new Error('No enhanced image returned');
    }
  } catch (error) {
    console.error('Face enhancement error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
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