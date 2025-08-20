import * as FileSystem from 'expo-file-system';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Download, Loader2, Share2 } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, Animated, Dimensions, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ResultsScreenProps {
  originalImage?: string;
  processedImage?: string;
  processingType?: string;
}

export default function ResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { width, height } = Dimensions.get('window');
  const isSmallScreen = width < 375;
  const isMediumScreen = width >= 375 && width < 768;

  // Get parameters from navigation
  const originalImage = params.originalImage as string;
  const processedImage = params.processedImage as string;
  const processingType = params.processingType as string || "Background Removal";

  // For testing - use a sample image if no image is provided
  const testImageUri = "https://picsum.photos/400/400";

  // Handle local file URIs properly
  const [displayOriginalImage, setDisplayOriginalImage] = useState(originalImage || testImageUri);
  const [displayProcessedImage, setDisplayProcessedImage] = useState(processedImage || testImageUri);

  console.log('Display Original Image URI:', displayOriginalImage);
  console.log('Display Processed Image URI:', displayProcessedImage);

  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  const [spinValue] = useState(new Animated.Value(0));
  const [originalImageError, setOriginalImageError] = useState(false);
  const [processedImageError, setProcessedImageError] = useState(false);

  console.log('Results Screen - Original Image:', originalImage);
  console.log('Results Screen - Processed Image:', processedImage);
  console.log('Results Screen - Processing Type:', processingType);
  console.log('Results Screen - All Params:', params);
  console.log('Results Screen - Params Type:', typeof params);

  // Handle image URIs on mount
  useEffect(() => {
    const handleImages = async () => {
      try {
        // For file:// URIs, try to copy to documents directory for better access
        if (originalImage && originalImage.startsWith('file://')) {
          try {
            const fileName = originalImage.split('/').pop() || 'original.jpg';
            const newPath = `${FileSystem.documentDirectory}original_${Date.now()}_${fileName}`;

            await FileSystem.copyAsync({
              from: originalImage,
              to: newPath
            });
            console.log('Copied original to:', newPath);
            setDisplayOriginalImage(newPath);
          } catch (copyError) {
            console.error('Failed to copy original:', copyError);
            // Fallback to original URI with cache busting
            const cacheBuster = Date.now();
            setDisplayOriginalImage(`${originalImage}?t=${cacheBuster}`);
          }
        }

        if (processedImage && processedImage.startsWith('file://')) {
          try {
            const fileName = processedImage.split('/').pop() || 'processed.jpg';
            const newPath = `${FileSystem.documentDirectory}processed_${Date.now()}_${fileName}`;

            await FileSystem.copyAsync({
              from: processedImage,
              to: newPath
            });
            console.log('Copied processed to:', newPath);
            setDisplayProcessedImage(newPath);
          } catch (copyError) {
            console.error('Failed to copy processed:', copyError);
            // Fallback to original URI with cache busting
            const cacheBuster = Date.now();
            setDisplayProcessedImage(`${processedImage}?t=${cacheBuster}`);
          }
        }
      } catch (error) {
        console.error('Error handling images:', error);
        // Ultimate fallback - use original URIs
        if (originalImage) setDisplayOriginalImage(originalImage);
        if (processedImage) setDisplayProcessedImage(processedImage);
      }
    };

    handleImages();
  }, [originalImage, processedImage]);

  // Start spinning animation
  useEffect(() => {
    const spin = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    );
    spin.start();

    // Simulate processing time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => {
      spin.stop();
      clearTimeout(timer);
    };
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleBack = () => {
    router.back();
  };

  const handleDownload = async () => {
    try {
      console.log('Downloading processed image...');

      if (!displayProcessedImage) {
        Alert.alert('Error', 'No processed image to download');
        return;
      }

      // In a real app, you would implement actual download functionality
      // For now, we'll simulate the download process
      Alert.alert(
        'Download Started',
        'Your processed image is being downloaded to your device.',
        [
          {
            text: 'OK',
            onPress: () => console.log('Download confirmed')
          }
        ]
      );
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'Failed to download image');
    }
  };

  const handleShare = async () => {
    try {
      console.log('Sharing processed image...');

      if (!displayProcessedImage) {
        Alert.alert('Error', 'No processed image to share');
        return;
      }

      // In a real app, you would use Expo Sharing or React Native Share
      // For now, we'll simulate the share process
      Alert.alert(
        'Share Image',
        'Choose how you want to share your processed image:',
        [
          {
            text: 'Social Media',
            onPress: () => console.log('Share to social media')
          },
          {
            text: 'Save to Gallery',
            onPress: () => console.log('Save to gallery')
          },
          {
            text: 'Send Message',
            onPress: () => console.log('Send via message')
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      );
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Error', 'Failed to share image');
    }
  };

  const retryImageLoad = async () => {
    setOriginalImageError(false);
    setProcessedImageError(false);

    try {
      // Try multiple approaches for retry
      if (originalImage && originalImage.startsWith('file://')) {
        try {
          // First try: Copy to documents directory
          const fileName = originalImage.split('/').pop() || 'original.jpg';
          const newPath = `${FileSystem.documentDirectory}original_retry_${Date.now()}_${fileName}`;

          await FileSystem.copyAsync({
            from: originalImage,
            to: newPath
          });
          console.log('Retry: Copied original to:', newPath);
          setDisplayOriginalImage(newPath);
        } catch (copyError) {
          console.error('Retry: Failed to copy original:', copyError);

          // Second try: Use cache busting
          const cacheBuster = Date.now();
          const cacheBustUri = `${originalImage}?t=${cacheBuster}`;
          console.log('Retry: Trying cache busting:', cacheBustUri);
          setDisplayOriginalImage(cacheBustUri);
        }
      }

      if (processedImage && processedImage.startsWith('file://')) {
        try {
          // First try: Copy to documents directory
          const fileName = processedImage.split('/').pop() || 'processed.jpg';
          const newPath = `${FileSystem.documentDirectory}processed_retry_${Date.now()}_${fileName}`;

          await FileSystem.copyAsync({
            from: processedImage,
            to: newPath
          });
          console.log('Retry: Copied processed to:', newPath);
          setDisplayProcessedImage(newPath);
        } catch (copyError) {
          console.error('Retry: Failed to copy processed:', copyError);

          // Second try: Use cache busting
          const cacheBuster = Date.now();
          const cacheBustUri = `${processedImage}?t=${cacheBuster}`;
          console.log('Retry: Trying cache busting:', cacheBustUri);
          setDisplayProcessedImage(cacheBustUri);
        }
      }
    } catch (error) {
      console.error('Error in retry:', error);
      Alert.alert('Error', 'Failed to retry loading images');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
      {/* Header */}
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingHorizontal: isSmallScreen ? 16 : 24, 
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#374151'
      }}>
        <TouchableOpacity onPress={handleBack} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <ArrowLeft size={24} color="white" />
          <Text style={{ color: 'white', fontSize: 18, fontWeight: '600', marginLeft: 8 }}>
            Back
          </Text>
        </TouchableOpacity>

        <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>
          {processingType} Results
        </Text>

        <View style={{ width: 80 }} />
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Results Container */}
        <View style={{ padding: isSmallScreen ? 16 : 24 }}>
          {/* Original Image */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ 
              color: 'white', 
              fontSize: isSmallScreen ? 16 : 18, 
              fontWeight: '600', 
              marginBottom: 12 
            }}>
              Original Image
            </Text>
            <View style={{ 
              width: '100%', 
              height: isSmallScreen ? 200 : 250, 
              backgroundColor: '#374151', 
              borderRadius: 16, 
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: '#4B5563'
            }}>
                               {!originalImageError && displayOriginalImage ? (
                  <Image 
                    source={{ uri: displayOriginalImage }} 
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                    onError={(error) => {
                      console.error('Original image load error:', error);
                      console.error('Failed URI:', displayOriginalImage);
                      setOriginalImageError(true);
                    }}
                    onLoad={() => {
                      console.log('Original image loaded successfully!');
                      console.log('Loaded URI:', displayOriginalImage);
                    }}
                  />
                ) : (
                 <View style={{ 
                   flex: 1, 
                   alignItems: 'center', 
                   justifyContent: 'center',
                   backgroundColor: '#6B7280'
                 }}>
                                       <Text style={{ color: '#D1D5DB', fontSize: 16 }}>
                      {originalImageError ? 'Failed to load image' : 'No original image'}
                    </Text>
                    {originalImageError && (
                      <>
                        <Text style={{ color: '#9CA3AF', fontSize: 12, marginTop: 8, textAlign: 'center' }}>
                          URI: {displayOriginalImage}
                        </Text>
                        <TouchableOpacity 
                          onPress={retryImageLoad}
                          style={{ 
                            backgroundColor: '#8B5CF6', 
                            paddingHorizontal: 16, 
                            paddingVertical: 8, 
                            borderRadius: 8, 
                            marginTop: 12 
                          }}
                        >
                          <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>
                            Retry
                          </Text>
                        </TouchableOpacity>
                      </>
                    )}
                 </View>
               )}
            </View>
          </View>

                     {/* Processed Image */}
           <View style={{ marginBottom: 32 }}>
             <Text style={{ 
               color: 'white', 
               fontSize: isSmallScreen ? 16 : 18, 
               fontWeight: '600', 
               marginBottom: 12 
             }}>
               Processed Image
             </Text>
             <View style={{ 
               width: '100%', 
               height: isSmallScreen ? 200 : 250, 
               backgroundColor: '#8B5CF6', 
               borderRadius: 16, 
               overflow: 'hidden',
               borderWidth: 1,
               borderColor: '#A78BFA'
             }}>
               {isLoading ? (
                 <View style={{ 
                   flex: 1, 
                   alignItems: 'center', 
                   justifyContent: 'center',
                   backgroundColor: '#A78BFA'
                 }}>
                   <Animated.View style={{ transform: [{ rotate: spin }] }}>
                     <Loader2 size={48} color="white" />
                   </Animated.View>
                   <Text style={{ 
                     color: 'white', 
                     fontSize: 16, 
                     marginTop: 16,
                     textAlign: 'center'
                   }}>
                     Processing your image...
                   </Text>
                   <Text style={{ 
                     color: '#E0E7FF', 
                     fontSize: 14, 
                     marginTop: 8,
                     textAlign: 'center'
                   }}>
                     Please wait while AI removes the background
                   </Text>
                 </View>
                               ) : !processedImageError && displayProcessedImage ? (
                  <Image 
                    source={{ uri: displayProcessedImage }} 
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                    onError={(error) => {
                      console.error('Processed image load error:', error);
                      console.error('Failed URI:', displayProcessedImage);
                      setProcessedImageError(true);
                    }}
                    onLoad={() => {
                      console.log('Processed image loaded successfully!');
                      console.log('Loaded URI:', displayProcessedImage);
                    }}
                  />
                ) : (
                  <View style={{ 
                    flex: 1, 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    backgroundColor: '#A78BFA'
                  }}>
                    <Text style={{ color: 'white', fontSize: 16 }}>
                      {processedImageError ? 'Failed to load processed image' : 'No processed image'}
                    </Text>
                    {processedImageError && (
                      <>
                        <Text style={{ color: '#E0E7FF', fontSize: 12, marginTop: 8, textAlign: 'center' }}>
                          URI: {displayProcessedImage}
                        </Text>
                        <TouchableOpacity 
                          onPress={retryImageLoad}
                          style={{ 
                            backgroundColor: '#8B5CF6', 
                            paddingHorizontal: 16, 
                            paddingVertical: 8, 
                            borderRadius: 8, 
                            marginTop: 12 
                          }}
                        >
                          <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>
                            Retry
                          </Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                )}
             </View>
           </View>

                     {/* Action Buttons */}
           <View style={{ 
             flexDirection: 'row', 
             justifyContent: 'space-between', 
             gap: 16,
             opacity: isLoading ? 0.5 : 1
           }}>
                         <TouchableOpacity 
               onPress={handleDownload}
               disabled={isLoading}
               style={{ 
                 flex: 1,
                 backgroundColor: '#8B5CF6', 
                 paddingVertical: 16, 
                 borderRadius: 12, 
                 alignItems: 'center',
                 flexDirection: 'row',
                 justifyContent: 'center'
               }}
             >
              <Download size={20} color="white" />
              <Text style={{ 
                color: 'white', 
                fontSize: 16, 
                fontWeight: '600', 
                marginLeft: 8 
              }}>
                Download
              </Text>
            </TouchableOpacity>

                         <TouchableOpacity 
               onPress={handleShare}
               disabled={isLoading}
               style={{ 
                 flex: 1,
                 backgroundColor: '#374151', 
                 paddingVertical: 16, 
                 borderRadius: 12, 
                 alignItems: 'center',
                 flexDirection: 'row',
                 justifyContent: 'center',
                 borderWidth: 1,
                 borderColor: '#4B5563'
               }}
             >
              <Share2 size={20} color="white" />
              <Text style={{ 
                color: 'white', 
                fontSize: 16, 
                fontWeight: '600', 
                marginLeft: 8 
              }}>
                Share
              </Text>
            </TouchableOpacity>
          </View>

          {/* Processing Info */}
          <View style={{ 
            marginTop: 24, 
            padding: 16, 
            backgroundColor: '#374151', 
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#4B5563'
          }}>
            <Text style={{ 
              color: 'white', 
              fontSize: 16, 
              fontWeight: '600', 
              marginBottom: 8 
            }}>
              Processing Details
            </Text>
            <Text style={{ color: '#D1D5DB', fontSize: 14, lineHeight: 20 }}>
              • Processing Type: {processingType}
            </Text>
            <Text style={{ color: '#D1D5DB', fontSize: 14, lineHeight: 20 }}>
              • Quality: High Definition
            </Text>
            <Text style={{ color: '#D1D5DB', fontSize: 14, lineHeight: 20 }}>
              • Format: PNG (Transparent Background)
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}