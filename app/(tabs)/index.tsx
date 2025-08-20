
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
import { Alert, Dimensions, ScrollView, Text, TouchableOpacity, View, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Check and request permissions on mount
  useEffect(() => {
    let mounted = true;
    
    const initializeApp = async () => {
      try {
        if (!mounted) return;
        
        console.log('Initializing app...');
        
        // Check media library permission
        const { status: mediaStatus } = await ImagePicker.getMediaLibraryPermissionsAsync();
        console.log('Media library permission status:', mediaStatus);
        
        if (mediaStatus !== 'granted' && mounted) {
          const { status: newMediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          console.log('Requested media library permission:', newMediaStatus);
        }
        
        if (!mounted) return;
        
        // Check camera permission
        const { status: cameraStatus } = await ImagePicker.getCameraPermissionsAsync();
        console.log('Camera permission status:', cameraStatus);
        
        if (cameraStatus !== 'granted' && mounted) {
          const { status: newCameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
          console.log('Requested camera permission:', newCameraStatus);
        }
      } catch (error) {
        console.error('App initialization failed:', error);
        if (mounted) {
          console.error('Initialization error details:', {
            name: error?.name || 'Unknown',
            message: error?.message || 'Unknown error'
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
      const hasPermission = await checkAndRequestPermissions('media');
      
      if (!hasPermission) {
        Alert.alert(
          'Permission Required', 
          'Camera roll access is needed to select photos. Please grant permission in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => router.push('/permission') }
          ]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaType.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        setSelectedImage(imageUri);
        console.log('Image selected successfully:', imageUri);
        
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
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takePhoto = async () => {
    try {
      const hasPermission = await checkAndRequestPermissions('camera');
      
      if (!hasPermission) {
        Alert.alert(
          'Permission Required', 
          'Camera access is needed to take photos. Please grant permission in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => router.push('/permission') }
          ]
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaType.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        setSelectedImage(imageUri);
        console.log('Photo taken successfully:', imageUri);
        
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
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const checkAndRequestPermissions = async (type: 'media' | 'camera') => {
    try {
      if (type === 'media') {
        const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          const { status: newStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          return newStatus === 'granted';
        }
        return true;
      } else {
        const { status } = await ImagePicker.getCameraPermissionsAsync();
        if (status !== 'granted') {
          const { status: newStatus } = await ImagePicker.requestCameraPermissionsAsync();
          return newStatus === 'granted';
        }
        return true;
      }
    } catch (error) {
      console.error('Permission check failed:', error);
      return false;
    }
  };

  const ToolButton = ({ icon: Icon, title, onPress, featured = false, newFeature = false }) => (
    <TouchableOpacity
      onPress={onPress}
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
            <TouchableOpacity style={{
              width: 44,
              height: 44,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: 22,
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sparkles size={20} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity style={{
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
