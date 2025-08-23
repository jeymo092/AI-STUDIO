
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowRight,
  Camera,
  Image as ImageIcon,
  Sparkles,
  Wand2,
  Crop,
  Palette,
  Sliders,
  User,
  Zap,
  Eraser,
  Edit,
  Settings
} from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import { Alert, Dimensions, ScrollView, Text, TouchableOpacity, View, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PermissionService } from '../services/permissionService';

const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 768; // Define a breakpoint for smaller screens

export default function HomeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Handle processing type selection with image picker
  const handleProcessingTypeSelect = async (type: string) => {
    console.log(`Selected processing type: ${type}`);
    
    try {
      // First, pick an image
      const hasPermission = await checkAndRequestPermissions('media');
      
      if (!hasPermission) {
        const permissionMessage = Platform.OS === 'android' 
          ? 'Storage permission is needed to select photos for processing.'
          : 'Photo library access is needed to select photos for processing.';
          
        Alert.alert(
          'Permission Required', 
          permissionMessage,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Grant Permission', onPress: async () => {
              const granted = await checkAndRequestPermissions('media');
              if (granted) {
                handleProcessingTypeSelect(type);
              }
            }}
          ]
        );
        return;
      }

      console.log('Launching image library for processing type:', type);
      const result = await ImagePicker.launchImageLibraryAsync(
        PermissionService.getOptimalImagePickerConfig()
      );

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        console.log('Image selected for processing:', type);

        // Navigate to image processor with the selected image and processing type
        router.push({
          pathname: '/image-processor',
          params: { 
            selectedImage: imageUri,
            imageUri: imageUri,
            processingType: type
          }
        });
      }
    } catch (error) {
      console.error('Error selecting image for processing:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  // Check and request permissions on mount
  useEffect(() => {
    let mounted = true;

    const initializeApp = async () => {
      try {
        if (!mounted) return;

        console.log('Initializing permissions for platform:', Platform.OS);

        // For Android, we need to be more explicit about permissions
        if (Platform.OS === 'android') {
          // Check media library permission
          const { status: mediaStatus } = await ImagePicker.getMediaLibraryPermissionsAsync();
          console.log('Media library permission status:', mediaStatus);

          if (mediaStatus !== 'granted' && mounted) {
            console.log('Requesting media library permission...');
            const { status: newMediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            console.log('Media library permission result:', newMediaStatus);
            
            if (newMediaStatus !== 'granted') {
              console.warn('Media library permission denied');
            }
          }

          if (!mounted) return;

          // Check camera permission
          const { status: cameraStatus } = await ImagePicker.getCameraPermissionsAsync();
          console.log('Camera permission status:', cameraStatus);

          if (cameraStatus !== 'granted' && mounted) {
            console.log('Requesting camera permission...');
            const { status: newCameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
            console.log('Camera permission result:', newCameraStatus);
            
            if (newCameraStatus !== 'granted') {
              console.warn('Camera permission denied');
            }
          }
        } else {
          // iOS permission handling
          const [mediaStatus, cameraStatus] = await Promise.all([
            ImagePicker.getMediaLibraryPermissionsAsync(),
            ImagePicker.getCameraPermissionsAsync()
          ]);

          console.log('iOS - Media status:', mediaStatus.status, 'Camera status:', cameraStatus.status);

          if (mediaStatus.status !== 'granted') {
            await ImagePicker.requestMediaLibraryPermissionsAsync();
          }
          
          if (cameraStatus.status !== 'granted') {
            await ImagePicker.requestCameraPermissionsAsync();
          }
        }
      } catch (error) {
        console.error('App initialization failed:', error);
        if (mounted) {
          console.error('Initialization error details:', {
            name: error?.name || 'Unknown',
            message: error?.message || 'Unknown error',
            platform: Platform.OS
          });
        }
      }
    };

    initializeApp();

    return () => {
      mounted = false;
      console.log('HomeScreen cleanup');
    };
  }, []);

  const pickImage = async () => {
    try {
      console.log('Pick image started on platform:', Platform.OS);
      
      // Check if we're on web
      if (Platform.OS === 'web') {
        // Web fallback - create file input
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';

        input.onchange = (event) => {
          const file = (event.target as HTMLInputElement).files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
              const base64 = e.target?.result as string;
              console.log('Selected image (web):', base64.substring(0, 100) + '...');

              router.push({
                pathname: '/image-processor',
                params: { selectedImage: base64 }
              });
            };
            reader.readAsDataURL(file);
          }
        };

        input.click();
        return;
      }

      // Native platform handling (Android/iOS)
      const hasPermission = await checkAndRequestPermissions('media');

      if (!hasPermission) {
        const permissionMessage = Platform.OS === 'android' 
          ? 'Storage permission is needed to select photos. Please grant permission in your device settings.'
          : 'Photo library access is needed to select photos. Please grant permission in your device settings.';
          
        Alert.alert(
          'Permission Required', 
          permissionMessage,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => router.push('/permission') }
          ]
        );
        return;
      }

      console.log('Launching image library...');
      const result = await ImagePicker.launchImageLibraryAsync(
        PermissionService.getOptimalImagePickerConfig()
      );

      console.log('Image picker result:', result.canceled ? 'canceled' : 'success');

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        setSelectedImage(imageUri);
        console.log('Image selected successfully:', imageUri.substring(0, 50) + '...');

        // Navigate to image processor with the selected image
        router.push({
          pathname: '/image-processor',
          params: { 
            selectedImage: imageUri,
            imageUri: imageUri
          }
        });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      const errorMessage = Platform.OS === 'android' 
        ? 'Failed to pick image. Please make sure you have granted storage permission.'
        : 'Failed to pick image. Please try again.';
      Alert.alert('Error', errorMessage);
    }
  };

  const takePhoto = async () => {
    try {
      console.log('Take photo started on platform:', Platform.OS);
      
      if (Platform.OS === 'web') {
        Alert.alert('Not Available', 'Camera is not available on web. Please use "Select Image" instead.');
        return;
      }

      const hasPermission = await checkAndRequestPermissions('camera');

      if (!hasPermission) {
        const permissionMessage = Platform.OS === 'android' 
          ? 'Camera permission is needed to take photos. Please grant permission in your device settings.'
          : 'Camera access is needed to take photos. Please grant permission in your device settings.';
          
        Alert.alert(
          'Permission Required', 
          permissionMessage,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => router.push('/permission') }
          ]
        );
        return;
      }

      console.log('Launching camera...');
      const result = await ImagePicker.launchCameraAsync(
        PermissionService.getOptimalCameraConfig()
      );

      console.log('Camera result:', result.canceled ? 'canceled' : 'success');

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        setSelectedImage(imageUri);
        console.log('Photo taken successfully:', imageUri.substring(0, 50) + '...');

        // Navigate to image processor with the taken photo
        router.push({
          pathname: '/image-processor',
          params: { 
            selectedImage: imageUri,
            imageUri: imageUri
          }
        });
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      const errorMessage = Platform.OS === 'android' 
        ? 'Failed to take photo. Please make sure you have granted camera permission.'
        : 'Failed to take photo. Please try again.';
      Alert.alert('Error', errorMessage);
    }
  };

  const checkAndRequestPermissions = async (type: 'media' | 'camera') => {
    try {
      console.log(`Checking ${type} permission on ${Platform.OS}`);
      
      if (type === 'media') {
        return await PermissionService.ensureMediaLibraryPermission();
      } else {
        return await PermissionService.ensureCameraPermission();
      }
    } catch (error) {
      console.error('Permission check failed:', error);
      return false;
    }
  };

  const ToolButton = ({ icon: Icon, title, onPress, featured = false, newFeature = false }) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        width: featured ? (width - 80) / 2 : (width - 100) / 3,
        height: featured ? 120 : 100,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        position: 'relative'
      }}
    >
      {newFeature && (
        <View style={{
          position: 'absolute',
          top: 8,
          right: 8,
          backgroundColor: '#00D4FF',
          paddingHorizontal: 8,
          paddingVertical: 2,
          borderRadius: 10
        }}>
          <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>New</Text>
        </View>
      )}

      {featured ? (
        <View
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 8,
            backgroundColor: '#FF6B9D'
          }}
        >
          <Icon size={28} color="white" />
        </View>
      ) : (
        <Icon size={24} color="white" style={{ marginBottom: 8 }} />
      )}

      <Text style={{
        color: 'white',
        fontSize: featured ? 16 : 14,
        fontWeight: featured ? '600' : '500',
        textAlign: 'center'
      }}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#1a1a1a' }}>
      {/* Hero Section */}
      <View style={{
        height: height * 0.6,
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        {/* Background gradient */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 107, 157, 0.2)'
          }}
        />

        {/* Header */}
        <View style={{
          position: 'absolute',
          top: 60,
          left: 0,
          right: 0,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 20
        }}>
          <Text style={{
            fontSize: 28,
            fontWeight: 'bold',
            color: 'white'
          }}>
            Ai Studio
          </Text>

          <View style={{ flexDirection: 'row', gap: 15 }}>
            <TouchableOpacity 
              activeOpacity={0.7}
              style={{
                width: 44,
                height: 44,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: 22,
                alignItems: 'center',
                justifyContent: 'center'
              }}>
              <Sparkles size={20} color="white" />
            </TouchableOpacity>

            <TouchableOpacity 
              activeOpacity={0.7}
              style={{
                width: 44,
                height: 44,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: 22,
                alignItems: 'center',
                justifyContent: 'center'
              }}>
              <Settings size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Main content */}
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 40
        }}>
          <Text style={{
            fontSize: 48,
            fontWeight: '300',
            color: 'white',
            textAlign: 'center',
            marginBottom: 20,
            lineHeight: 56
          }}>
            Beautify{'\n'}Images
          </Text>

          <TouchableOpacity
            onPress={pickImage}
            activeOpacity={0.8}
            style={{
              backgroundColor: 'white',
              paddingHorizontal: 30,
              paddingVertical: 15,
              borderRadius: 25,
              flexDirection: 'row',
              alignItems: 'center'
            }}
          >
            <Text style={{
              color: '#1a1a1a',
              fontSize: 16,
              fontWeight: '600',
              marginRight: 8
            }}>
              Try Now
            </Text>
            <ArrowRight size={16} color="#1a1a1a" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tools Section */}
      <View style={{
        flex: 1,
        backgroundColor: '#1a1a1a',
        paddingHorizontal: 20,
        paddingTop: 20
      }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Primary tools */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 20
          }}>
            <ToolButton 
              icon={ImageIcon} 
              title="Remove BG" 
              onPress={pickImage}
              featured={true}
            />
            <ToolButton 
              icon={Sparkles} 
              title="Enhance" 
              onPress={pickImage}
              featured={true}
            />
          </View>

          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 20
          }}>
            <ToolButton 
              icon={User} 
              title="AI Beautify" 
              onPress={pickImage}
              featured={true}
            />
          </View>

          {/* Processing Options - Grid Layout */}
          <View style={{ marginBottom: 32 }}>
            <Text style={{ 
              color: 'white', 
              fontSize: isSmallScreen ? 18 : 20, 
              fontWeight: 'bold', 
              marginBottom: isSmallScreen ? 16 : 20 
            }}>
              Choose Processing Type
            </Text>

            {/* Grid Container */}
            <View style={{ 
              flexDirection: 'row', 
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              gap: isSmallScreen ? 8 : 12
            }}>
              {/* Remove Background */}
              <TouchableOpacity 
                onPress={() => handleProcessingTypeSelect('Background Removal')}
                style={{ 
                  backgroundColor: '#374151', 
                  padding: isSmallScreen ? 12 : 16, 
                  borderRadius: 16, 
                  borderWidth: 1,
                  borderColor: '#4B5563',
                  alignItems: 'center',
                  width: isSmallScreen ? '48%' : '31%',
                  minHeight: isSmallScreen ? 120 : 140,
                  justifyContent: 'center'
                }}
              >
                <View style={{ 
                  backgroundColor: '#8B5CF6', 
                  padding: isSmallScreen ? 10 : 12, 
                  borderRadius: 12, 
                  marginBottom: 8 
                }}>
                  <User size={isSmallScreen ? 20 : 24} color="white" />
                </View>
                <Text style={{ 
                  color: 'white', 
                  fontSize: isSmallScreen ? 14 : 16, 
                  fontWeight: '600',
                  textAlign: 'center',
                  marginBottom: 4
                }}>
                  Remove Background
                </Text>
                <Text style={{ 
                  color: '#D1D5DB', 
                  fontSize: isSmallScreen ? 11 : 12, 
                  textAlign: 'center',
                  lineHeight: 16
                }}>
                  Auto remove background
                </Text>
              </TouchableOpacity>

              {/* Object Eraser */}
              <TouchableOpacity 
                onPress={() => handleProcessingTypeSelect('Object Eraser')}
                style={{ 
                  backgroundColor: '#374151', 
                  padding: isSmallScreen ? 12 : 16, 
                  borderRadius: 16, 
                  borderWidth: 1,
                  borderColor: '#4B5563',
                  alignItems: 'center',
                  width: isSmallScreen ? '48%' : '31%',
                  minHeight: isSmallScreen ? 120 : 140,
                  justifyContent: 'center'
                }}
              >
                <View style={{ 
                  backgroundColor: '#F97316', 
                  padding: isSmallScreen ? 10 : 12, 
                  borderRadius: 12, 
                  marginBottom: 8 
                }}>
                  <Eraser size={isSmallScreen ? 20 : 24} color="white" />
                </View>
                <Text style={{ 
                  color: 'white', 
                  fontSize: isSmallScreen ? 14 : 16, 
                  fontWeight: '600',
                  textAlign: 'center',
                  marginBottom: 4
                }}>
                  Object Eraser
                </Text>
                <Text style={{ 
                  color: '#D1D5DB', 
                  fontSize: isSmallScreen ? 11 : 12, 
                  textAlign: 'center',
                  lineHeight: 16
                }}>
                  Remove objects
                </Text>
              </TouchableOpacity>

              {/* Image Enhancer */}
              <TouchableOpacity 
                onPress={() => handleProcessingTypeSelect('Image Enhancement')}
                style={{ 
                  backgroundColor: '#374151', 
                  padding: isSmallScreen ? 12 : 16, 
                  borderRadius: 16, 
                  borderWidth: 1,
                  borderColor: '#4B5563',
                  alignItems: 'center',
                  width: isSmallScreen ? '48%' : '31%',
                  minHeight: isSmallScreen ? 120 : 140,
                  justifyContent: 'center'
                }}
              >
                <View style={{ 
                  backgroundColor: '#10B981', 
                  padding: isSmallScreen ? 10 : 12, 
                  borderRadius: 12, 
                  marginBottom: 8 
                }}>
                  <Sparkles size={isSmallScreen ? 20 : 24} color="white" />
                </View>
                <Text style={{ 
                  color: 'white', 
                  fontSize: isSmallScreen ? 14 : 16, 
                  fontWeight: '600',
                  textAlign: 'center',
                  marginBottom: 4
                }}>
                  Enhancer
                </Text>
                <Text style={{ 
                  color: '#D1D5DB', 
                  fontSize: isSmallScreen ? 11 : 12, 
                  textAlign: 'center',
                  lineHeight: 16
                }}>
                  Enhance quality
                </Text>
              </TouchableOpacity>

              {/* Style Transfer */}
              <TouchableOpacity 
                onPress={() => handleProcessingTypeSelect('Style Transfer')}
                style={{ 
                  backgroundColor: '#374151', 
                  padding: isSmallScreen ? 12 : 16, 
                  borderRadius: 16, 
                  borderWidth: 1,
                  borderColor: '#4B5563',
                  alignItems: 'center',
                  width: isSmallScreen ? '48%' : '31%',
                  minHeight: isSmallScreen ? 120 : 140,
                  justifyContent: 'center'
                }}
              >
                <View style={{ 
                  backgroundColor: '#EC4899', 
                  padding: isSmallScreen ? 10 : 12, 
                  borderRadius: 12, 
                  marginBottom: 8 
                }}>
                  <Palette size={isSmallScreen ? 20 : 24} color="white" />
                </View>
                <Text style={{ 
                  color: 'white', 
                  fontSize: isSmallScreen ? 14 : 16, 
                  fontWeight: '600',
                  textAlign: 'center',
                  marginBottom: 4
                }}>
                  Style Transfer
                </Text>
                <Text style={{ 
                  color: '#D1D5DB', 
                  fontSize: isSmallScreen ? 11 : 12, 
                  textAlign: 'center',
                  lineHeight: 16
                }}>
                  Apply art styles
                </Text>
              </TouchableOpacity>

              {/* Crop & Resize */}
              <TouchableOpacity 
                onPress={() => handleProcessingTypeSelect('Crop & Resize')}
                style={{ 
                  backgroundColor: '#374151', 
                  padding: isSmallScreen ? 12 : 16, 
                  borderRadius: 16, 
                  borderWidth: 1,
                  borderColor: '#4B5563',
                  alignItems: 'center',
                  width: isSmallScreen ? '48%' : '31%',
                  minHeight: isSmallScreen ? 120 : 140,
                  justifyContent: 'center'
                }}
              >
                <View style={{ 
                  backgroundColor: '#3B82F6', 
                  padding: isSmallScreen ? 10 : 12, 
                  borderRadius: 12, 
                  marginBottom: 8 
                }}>
                  <Crop size={isSmallScreen ? 20 : 24} color="white" />
                </View>
                <Text style={{ 
                  color: 'white', 
                  fontSize: isSmallScreen ? 14 : 16, 
                  fontWeight: '600',
                  textAlign: 'center',
                  marginBottom: 4
                }}>
                  Crop & Resize
                </Text>
                <Text style={{ 
                  color: '#D1D5DB', 
                  fontSize: isSmallScreen ? 11 : 12, 
                  textAlign: 'center',
                  lineHeight: 16
                }}>
                  Crop precisely
                </Text>
              </TouchableOpacity>

              {/* Filters */}
              <TouchableOpacity 
                onPress={() => handleProcessingTypeSelect('Filters')}
                style={{ 
                  backgroundColor: '#374151', 
                  padding: isSmallScreen ? 12 : 16, 
                  borderRadius: 16, 
                  borderWidth: 1,
                  borderColor: '#4B5563',
                  alignItems: 'center',
                  width: isSmallScreen ? '48%' : '31%',
                  minHeight: isSmallScreen ? 120 : 140,
                  justifyContent: 'center'
                }}
              >
                <View style={{ 
                  backgroundColor: '#F59E0B', 
                  padding: isSmallScreen ? 10 : 12, 
                  borderRadius: 12, 
                  marginBottom: 8 
                }}>
                  <Sliders size={isSmallScreen ? 20 : 24} color="white" />
                </View>
                <Text style={{ 
                  color: 'white', 
                  fontSize: isSmallScreen ? 14 : 16, 
                  fontWeight: '600',
                  textAlign: 'center',
                  marginBottom: 4
                }}>
                  Filters
                </Text>
                <Text style={{ 
                  color: '#D1D5DB', 
                  fontSize: isSmallScreen ? 11 : 12, 
                  textAlign: 'center',
                  lineHeight: 16
                }}>
                  Creative effects
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Secondary tools */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            marginBottom: 20
          }}>
            <ToolButton 
              icon={Wand2} 
              title="AI Portraits" 
              onPress={pickImage}
            />
            <ToolButton 
              icon={Palette} 
              title="AI Filters" 
              onPress={pickImage}
              newFeature={true}
            />
            <ToolButton 
              icon={Zap} 
              title="Improve clarity" 
              onPress={pickImage}
            />
          </View>

          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            marginBottom: 20
          }}>
            <ToolButton 
              icon={Eraser} 
              title="Eraser" 
              onPress={pickImage}
            />
            <ToolButton 
              icon={Edit} 
              title="Edit" 
              onPress={pickImage}
            />
            <ToolButton 
              icon={Sliders} 
              title="Adjust" 
              onPress={pickImage}
            />
          </View>

          {/* Camera option */}
          <TouchableOpacity
            onPress={takePhoto}
            activeOpacity={0.7}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              padding: 20,
              borderRadius: 15,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 20,
              marginBottom: 40,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.2)'
            }}
          >
            <Camera size={24} color="white" style={{ marginRight: 12 }} />
            <Text style={{
              color: 'white',
              fontSize: 16,
              fontWeight: '600'
            }}>
              Take Photo
            </Text>
          </TouchableOpacity>

          {/* Page indicator */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 30
          }}>
            <View style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: 'white',
              marginHorizontal: 4
            }} />
            <View style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              marginHorizontal: 4
            }} />
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
