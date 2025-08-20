
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

// Convert image URI to base64 for API
const imageToBase64 = async (imageUri: string): Promise<string> => {
  try {
    console.log('Converting image to base64...');
    console.log('Image URI type:', typeof imageUri);
    console.log('Image URI starts with data:', imageUri.startsWith('data:image/'));
    
    if (imageUri.startsWith('data:image/')) {
      // Already base64
      const base64Part = imageUri.split(',')[1];
      console.log('Extracted base64 part length:', base64Part.length);
      return base64Part;
    }
    
    // For file URIs, we'll need to read the file
    console.log('Fetching image from URI...');
    const response = await fetch(imageUri);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }
    
    const blob = await response.blob();
    console.log('Blob size:', blob.size, 'type:', blob.type);
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const result = reader.result as string;
          const base64Part = result.split(',')[1];
          console.log('FileReader conversion successful, length:', base64Part.length);
          resolve(base64Part);
        } catch (err) {
          console.error('Error processing FileReader result:', err);
          reject(err);
        }
      };
      reader.onerror = (err) => {
        console.error('FileReader error:', err);
        reject(new Error('FileReader failed to read image'));
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Image to base64 conversion error:', error);
    throw new Error(`Failed to convert image to base64: ${error.message}`);
  }
};

// Remove background (matte)
export const removeBackground = async (imageUri: string): Promise<ProcessingResult> => {
  try {
    console.log('Starting background removal process...');
    console.log('Image URI length:', imageUri.length);
    
    const base64Image = await imageToBase64(imageUri);
    console.log('Base64 conversion successful, length:', base64Image.length);
    
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
    console.log('API Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error response:', errorText);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('API Response result keys:', Object.keys(result));
    
    if (result.image) {
      console.log('Background removal successful!');
      return {
        success: true,
        imageUrl: `data:image/png;base64,${result.image}`
      };
    } else {
      console.error('No image in response:', result);
      throw new Error('No processed image returned from API');
    }
  } catch (error) {
    console.error('Background removal error:', error);
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        success: false,
        error: 'Network error: Unable to connect to image processing service'
      };
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Full error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    return {
      success: false,
      error: errorMessage
    };
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
