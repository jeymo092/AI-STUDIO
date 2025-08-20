import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { AlertCircle, Image as ImageIcon } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { Alert, AppState, Dimensions, Linking, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PermissionScreen() {
  console.log('PermissionScreen component rendered!');
  const router = useRouter();
  const { width } = Dimensions.get('window');
  const isSmallScreen = width < 375;
  const isMediumScreen = width >= 375 && width < 768;

  // Check permission status when component mounts and when app comes back to foreground
  useEffect(() => {
    const checkPermissionAndOpenGallery = async () => {
      const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
      if (status === 'granted') {
        console.log('Permission granted, opening photo gallery...');
        openPhotoGallery();
      }
    };

    // Check permission when component mounts
    checkPermissionAndOpenGallery();

    // Set up listener for when app comes back to foreground (after user grants permission)
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        checkPermissionAndOpenGallery();
      }
    });

    return () => subscription?.remove();
  }, []);

  const openPhotoGallery = async () => {
    try {
             const result = await ImagePicker.launchImageLibraryAsync({
         mediaTypes: [ImagePicker.MediaType.Images],
         allowsEditing: false,
         quality: 1,
       });

             if (!result.canceled && result.assets[0]) {
         console.log('Image selected:', result.assets[0].uri);
         // Go directly to Remove BG processing
         console.log('Starting Remove BG processing from permission page...');
         router.push({
           pathname: '/(tabs)',
           params: { 
             selectedImage: result.assets[0].uri,
             triggerBackgroundRemoval: 'true'
           }
         });
       }
    } catch (error) {
      console.error('Error opening photo gallery:', error);
      Alert.alert(
        'Error',
        'Failed to open photo gallery. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleGoToSettings = async () => {
    try {
      // Open device settings
      await Linking.openSettings();
      console.log('Settings opened successfully');
    } catch (error) {
      console.error('Failed to open settings:', error);
      Alert.alert(
        'Error',
        'Unable to open settings. Please manually go to your device settings and grant photo permissions.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000000' }}>
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        paddingHorizontal: isSmallScreen ? 24 : isMediumScreen ? 32 : 40
      }}>
        {/* Permission Dialog */}
        <View style={{
          backgroundColor: '#1F2937',
          borderRadius: isSmallScreen ? 16 : 20,
          padding: isSmallScreen ? 24 : isMediumScreen ? 32 : 40,
          alignItems: 'center',
          width: '100%',
          maxWidth: 400
        }}>
          {/* Icon with Badge */}
          <View style={{ position: 'relative', marginBottom: isSmallScreen ? 20 : 24 }}>
            <View style={{
              width: isSmallScreen ? 80 : isMediumScreen ? 96 : 112,
              height: isSmallScreen ? 80 : isMediumScreen ? 96 : 112,
              backgroundColor: '#374151',
              borderRadius: isSmallScreen ? 40 : isMediumScreen ? 48 : 56,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 2,
              borderColor: '#4B5563'
            }}>
              <ImageIcon 
                size={isSmallScreen ? 36 : isMediumScreen ? 44 : 52} 
                color="white" 
              />
            </View>
            {/* Exclamation Badge */}
            <View style={{
              position: 'absolute',
              bottom: -4,
              right: -4,
              backgroundColor: '#F97316',
              borderRadius: isSmallScreen ? 12 : 16,
              width: isSmallScreen ? 24 : isMediumScreen ? 32 : 40,
              height: isSmallScreen ? 24 : isMediumScreen ? 32 : 40,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 2,
              borderColor: '#1F2937'
            }}>
              <AlertCircle 
                size={isSmallScreen ? 12 : isMediumScreen ? 16 : 20} 
                color="white" 
              />
            </View>
          </View>

          {/* Main Heading */}
          <Text style={{
            color: 'white',
            fontSize: isSmallScreen ? 20 : isMediumScreen ? 24 : 28,
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: isSmallScreen ? 16 : 20,
            lineHeight: isSmallScreen ? 28 : isMediumScreen ? 32 : 36
          }}>
            Permission required to{'\n'}access your photos
          </Text>

          {/* Instructions */}
          <View style={{ 
            marginBottom: isSmallScreen ? 24 : 32,
            alignItems: 'flex-start',
            width: '100%'
          }}>
            <Text style={{
              color: 'white',
              fontSize: isSmallScreen ? 14 : isMediumScreen ? 16 : 18,
              marginBottom: isSmallScreen ? 12 : 16,
              textAlign: 'center',
              width: '100%'
            }}>
              Please go to Settings
            </Text>
            
            <View style={{ width: '100%' }}>
              <Text style={{
                color: 'white',
                fontSize: isSmallScreen ? 14 : isMediumScreen ? 16 : 18,
                marginBottom: isSmallScreen ? 8 : 12,
                lineHeight: isSmallScreen ? 20 : isMediumScreen ? 24 : 28
              }}>
                1. Click <Text style={{ fontWeight: 'bold' }}>Permissions</Text>
              </Text>
              
              <Text style={{
                color: 'white',
                fontSize: isSmallScreen ? 14 : isMediumScreen ? 16 : 18,
                marginBottom: isSmallScreen ? 8 : 12,
                lineHeight: isSmallScreen ? 20 : isMediumScreen ? 24 : 28
              }}>
                2. Find and tap <Text style={{ fontWeight: 'bold' }}>Storage</Text>
              </Text>
              
              <Text style={{
                color: 'white',
                fontSize: isSmallScreen ? 14 : isMediumScreen ? 16 : 18,
                lineHeight: isSmallScreen ? 20 : isMediumScreen ? 24 : 28
              }}>
                3. Choose <Text style={{ fontWeight: 'bold' }}>Allow</Text>
              </Text>
            </View>
          </View>

          {/* Settings Button */}
          <TouchableOpacity
            onPress={handleGoToSettings}
            style={{
              width: '100%',
              backgroundColor: '#3B82F6',
              borderRadius: isSmallScreen ? 12 : 16,
              paddingVertical: isSmallScreen ? 14 : 18,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: isSmallScreen ? 12 : 16,
              // Gradient effect using multiple backgrounds
              shadowColor: '#3B82F6',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8
            }}
          >
            <Text style={{
              color: 'white',
              fontSize: isSmallScreen ? 16 : isMediumScreen ? 18 : 20,
              fontWeight: '600'
            }}>
              Go to Settings
            </Text>
          </TouchableOpacity>

          {/* Open Gallery Button */}
          <TouchableOpacity
            onPress={openPhotoGallery}
            style={{
              width: '100%',
              backgroundColor: '#10B981',
              borderRadius: isSmallScreen ? 12 : 16,
              paddingVertical: isSmallScreen ? 14 : 18,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: isSmallScreen ? 12 : 16,
              shadowColor: '#10B981',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8
            }}
          >
            <Text style={{
              color: 'white',
              fontSize: isSmallScreen ? 16 : isMediumScreen ? 18 : 20,
              fontWeight: '600'
            }}>
              Open Photo Gallery
            </Text>
          </TouchableOpacity>

          {/* Back Button */}
          <TouchableOpacity
            onPress={handleBack}
            style={{
              paddingVertical: isSmallScreen ? 8 : 12,
              paddingHorizontal: isSmallScreen ? 16 : 20
            }}
          >
            <Text style={{
              color: '#9CA3AF',
              fontSize: isSmallScreen ? 14 : 16,
              fontWeight: '500'
            }}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
