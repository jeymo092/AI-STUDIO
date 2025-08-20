import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowRight,
  Crop,
  Eraser,
  Image as ImageIcon,
  Palette,
  Settings,
  Sliders,
  User,
  Wand2,
  Zap
} from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, Dimensions, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ToolButtonProps {
  icon: React.ReactNode;
  label: string;
  isLarge?: boolean;
  isGradient?: boolean;
  hasBadge?: boolean;
  badgeText?: string;
  onPress?: () => void;
}

const ToolButton: React.FC<ToolButtonProps> = ({
  icon,
  label,
  isLarge = false,
  isGradient = false,
  hasBadge = false,
  badgeText = "New",
  onPress
}) => {
  const { width } = Dimensions.get('window');
  const isSmallScreen = width < 375;
  const isMediumScreen = width >= 375 && width < 768;
  const isLargeScreen = width >= 768;

  const buttonSize = isLarge
    ? (isSmallScreen ? 70 : isMediumScreen ? 80 : 90)
    : (isSmallScreen ? 56 : isMediumScreen ? 64 : 72);

  const iconSize = isLarge
    ? (isSmallScreen ? 24 : isMediumScreen ? 28 : 32)
    : (isSmallScreen ? 20 : isMediumScreen ? 24 : 28);

  const fontSize = isSmallScreen ? 10 : isMediumScreen ? 12 : 14;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        width: buttonSize,
        height: buttonSize,
        marginHorizontal: isSmallScreen ? 4 : isMediumScreen ? 8 : 12
      }}
    >
      <View style={{ position: 'relative' }}>
        <View
          style={{
            borderRadius: buttonSize / 2,
            alignItems: 'center',
            justifyContent: 'center',
            width: buttonSize,
            height: buttonSize,
            backgroundColor: isGradient ? '#8B5CF6' : '#374151',
            borderWidth: isGradient ? 0 : 1,
            borderColor: '#4B5563'
          }}
        >
          {icon}
        </View>
        {hasBadge && (
          <View style={{
            position: 'absolute',
            top: -4,
            right: -4,
            backgroundColor: '#3B82F6',
            borderRadius: 12,
            paddingHorizontal: isSmallScreen ? 6 : 8,
            paddingVertical: isSmallScreen ? 2 : 4
          }}>
            <Text style={{
              color: 'white',
              fontSize: isSmallScreen ? 10 : 12,
              fontWeight: 'bold'
            }}>{badgeText}</Text>
          </View>
        )}
      </View>
      <Text style={{
        color: 'white',
        fontSize: fontSize,
        marginTop: isSmallScreen ? 6 : 8,
        textAlign: 'center',
        fontWeight: '500'
      }}>{label}</Text>
    </TouchableOpacity>
  );
};

export default function HomeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { width, height } = Dimensions.get('window');
  const isSmallScreen = width < 375;
  const isMediumScreen = width >= 375 && width < 768;
  const isLargeScreen = width >= 768;

  // Handle parameters when returning from permission page
  React.useEffect(() => {
    if (params.selectedImage && params.triggerBackgroundRemoval === 'true') {
      const imageUri = params.selectedImage as string;
      setSelectedImage(imageUri);
      setProcessedImage(null);
      console.log('Image received from permission page:', imageUri);

      // Process background removal
      processBackgroundRemoval(imageUri);

      // Clear the params to prevent re-processing
      router.setParams({});
    }
  }, [params]);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Sorry, we need camera roll permissions to make this work!',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: [ImagePicker.MediaType.Images],
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      setProcessedImage(null); // Reset processed image
      console.log('Image selected:', result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Sorry, we need camera permissions to make this work!',
        [{ text: 'OK' }]
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      setProcessedImage(null); // Reset processed image
      console.log('Photo taken:', result.assets[0].uri);
    }
  };

    const removeBackground = async () => {
    console.log('Remove BG button pressed!');
    console.log('Starting Remove BG process...');

    try {
      // Check if we have permission first
      const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
      console.log('Permission status:', status);

      if (status === 'granted') {
        // If we have permission, open photo gallery directly
        console.log('Permission already granted, opening photo gallery...');
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: [ImagePicker.MediaType.Images],
          allowsEditing: false,
          quality: 1,
        });

        if (!result.canceled && result.assets[0]) {
          setSelectedImage(result.assets[0].uri);
          setProcessedImage(null);
          console.log('Image selected:', result.assets[0].uri);

          // Go directly to Remove BG processing
          console.log('Starting Remove BG processing directly...');
          processBackgroundRemoval(result.assets[0].uri);
        }
      } else {
        // If no permission, navigate to permission page
        console.log('No permission, navigating to permission page...');
        router.push('/permission');
      }
    } catch (error) {
      console.error('Error in removeBackground:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  const processBackgroundRemoval = async (imageUri: string) => {
    setIsProcessing(true);

    try {
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // For demo purposes, we'll use the same image as "processed"
      // In a real app, you would send the image to an AI service
      setProcessedImage(imageUri);
      console.log('Background removed successfully!');

      // Navigate to results screen with the images
      console.log('Navigating to results with params:', {
        originalImage: imageUri,
        processedImage: imageUri,
        processingType: 'Background Removal'
      });

      router.push({
        pathname: '/results',
        params: {
          originalImage: imageUri,
          processedImage: imageUri, // In real app, this would be the processed image
          processingType: 'Background Removal'
        }
      });
    } catch (error) {
      console.error('Error removing background:', error);
      Alert.alert(
        'Error',
        'Failed to remove background. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Top Section */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: isSmallScreen ? 16 : isMediumScreen ? 24 : 32,
          paddingVertical: isSmallScreen ? 12 : 16
        }}>
          <Text style={{
            color: 'white',
            fontSize: isSmallScreen ? 20 : isMediumScreen ? 24 : 28,
            fontWeight: 'bold'
          }}>AI Studio</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              onPress={takePhoto}
              style={{
                width: isSmallScreen ? 36 : 40,
                height: isSmallScreen ? 36 : 40,
                backgroundColor: '#374151',
                borderRadius: isSmallScreen ? 18 : 20,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: isSmallScreen ? 12 : 16
              }}
            >
              <Sparkles size={isSmallScreen ? 18 : 20} color="#8B5CF6" />
            </TouchableOpacity>
            <TouchableOpacity style={{
              width: isSmallScreen ? 36 : 40,
              height: isSmallScreen ? 36 : 40,
              backgroundColor: '#374151',
              borderRadius: isSmallScreen ? 18 : 20,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: isSmallScreen ? 12 : 16
            }}>
              <Settings size={isSmallScreen ? 18 : 20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Center Section - Before/After Preview */}
        <View style={{
          paddingHorizontal: isSmallScreen ? 16 : isMediumScreen ? 24 : 32,
          paddingVertical: isSmallScreen ? 24 : isMediumScreen ? 32 : 40
        }}>
          <View style={{ position: 'relative' }}>
            {/* Preview Placeholder */}
            <View style={{
              width: '100%',
              height: isSmallScreen ? 280 : isMediumScreen ? 320 : 360,
              backgroundColor: '#4B5563',
              borderRadius: isSmallScreen ? 12 : 16,
              overflow: 'hidden',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <View style={{
                width: isSmallScreen ? 120 : isMediumScreen ? 140 : 160,
                height: isSmallScreen ? 120 : isMediumScreen ? 140 : 160,
                backgroundColor: '#6B7280',
                borderRadius: isSmallScreen ? 60 : isMediumScreen ? 70 : 80,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 24
              }}>
                <User size={isSmallScreen ? 48 : isMediumScreen ? 56 : 64} color="white" />
              </View>
              <Text style={{
                color: '#D1D5DB',
                fontSize: isSmallScreen ? 16 : 18,
                textAlign: 'center',
                marginBottom: 8
              }}>
                Select an image to get started
              </Text>
              <Text style={{
                color: '#9CA3AF',
                fontSize: isSmallScreen ? 14 : 16,
                textAlign: 'center'
              }}>
                Use the tools below to edit your photos
              </Text>
            </View>

            {/* Overlay text */}
            <View style={{
              position: 'absolute',
              top: isSmallScreen ? 16 : 24,
              left: isSmallScreen ? 16 : 24
            }}>
              <Text style={{
                color: 'white',
                fontSize: isSmallScreen ? 24 : isMediumScreen ? 30 : 36,
                fontWeight: 'bold'
              }}>Beautify</Text>
              <Text style={{
                color: 'white',
                fontSize: isSmallScreen ? 24 : isMediumScreen ? 30 : 36,
                fontWeight: 'bold'
              }}>Faces</Text>
            </View>

            {/* Try Now button */}
            <TouchableOpacity
              onPress={pickImage}
              style={{
                position: 'absolute',
                top: isSmallScreen ? 16 : 24,
                right: isSmallScreen ? 16 : 24,
                backgroundColor: 'white',
                borderRadius: isSmallScreen ? 16 : 20,
                paddingHorizontal: isSmallScreen ? 12 : 16,
                paddingVertical: isSmallScreen ? 6 : 8,
                flexDirection: 'row',
                alignItems: 'center'
              }}
            >
              <Text style={{
                color: 'black',
                fontWeight: '600',
                marginRight: 4,
                fontSize: isSmallScreen ? 12 : 14
              }}>Try Now</Text>
              <ArrowRight size={isSmallScreen ? 14 : 16} color="black" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Section - Tools Grid */}
        <View style={{
          paddingHorizontal: isSmallScreen ? 16 : isMediumScreen ? 24 : 32,
          paddingBottom: isSmallScreen ? 24 : 32
        }}>
          {/* First Row - Main Tools */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: isSmallScreen ? 24 : 32
          }}>
                         <ToolButton
               icon={<ImageIcon size={isSmallScreen ? 20 : isMediumScreen ? 24 : 28} color="white" />}
               label={isProcessing ? "Processing..." : "Remove BG"}
               onPress={removeBackground}
             />

            <ToolButton
              icon={<Wand2 size={isSmallScreen ? 24 : isMediumScreen ? 28 : 32} color="white" />}
              label="Enhance"
              isLarge={true}
              isGradient={true}
              onPress={() => console.log('Enhance pressed')}
            />
            <ToolButton
              icon={<Sparkles size={isSmallScreen ? 20 : isMediumScreen ? 24 : 28} color="white" />}
              label="AI Beautify"
              onPress={() => console.log('AI Beautify pressed')}
            />
          </View>

          {/* Second Row */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: isSmallScreen ? 24 : 32
          }}>
            <ToolButton
              icon={<User size={isSmallScreen ? 20 : isMediumScreen ? 24 : 28} color="white" />}
              label="AI Portraits"
              onPress={() => console.log('AI Portraits pressed')}
            />
            <ToolButton
              icon={<Palette size={isSmallScreen ? 20 : isMediumScreen ? 24 : 28} color="white" />}
              label="AI Filters"
              hasBadge={true}
              onPress={() => console.log('AI Filters pressed')}
            />
            <ToolButton
              icon={<Zap size={isSmallScreen ? 20 : isMediumScreen ? 24 : 28} color="white" />}
              label="Improve Clarity"
              onPress={() => console.log('Improve Clarity pressed')}
            />
          </View>

          {/* Third Row */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <ToolButton
              icon={<Eraser size={isSmallScreen ? 20 : isMediumScreen ? 24 : 28} color="white" />}
              label="Eraser"
              onPress={() => console.log('Eraser pressed')}
            />
            <ToolButton
              icon={<Crop size={isSmallScreen ? 20 : isMediumScreen ? 24 : 28} color="white" />}
              label="Edit"
              onPress={() => console.log('Edit pressed')}
            />
            <ToolButton
              icon={<Sliders size={isSmallScreen ? 20 : isMediumScreen ? 24 : 28} color="white" />}
              label="Adjust"
              onPress={() => console.log('Adjust pressed')}
            />
          </View>
        </View>

        {/* Bottom Indicator */}
        <View style={{ alignItems: 'center', paddingBottom: isSmallScreen ? 12 : 16 }}>
          <View style={{
            width: isSmallScreen ? 40 : isMediumScreen ? 48 : 56,
            height: isSmallScreen ? 3 : 4,
            backgroundColor: '#6B7280',
            borderRadius: isSmallScreen ? 1.5 : 2
          }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}