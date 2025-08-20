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
  Sparkles,
  User,
  Wand2,
  Zap
} from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import { Alert, Dimensions, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle any side effects in useEffect instead of during render
  useEffect(() => {
    // This effect can be used for initial data fetching or subscriptions
    // For this component, it seems like no specific initial setup is needed beyond state initialization.
    // The original code had logic to handle params, which is now simplified in the new `processImage` flow.
    // If there were persistent settings or data to load, they would go here.
  }, []);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to make this work!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      // Check if the operation was not cancelled and an asset was selected
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri);
        setProcessedImage(null); // Reset processed image when a new one is selected
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Sorry, we need camera permissions to make this work!');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      // Check if the operation was not cancelled and an asset was selected
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri);
        setProcessedImage(null); // Reset processed image when a new one is taken
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const processImage = () => {
    if (!selectedImage) {
      Alert.alert('No Image', 'Please select an image first');
      return;
    }

    // Navigate to a new screen for image processing
    router.push({
      pathname: '/image-processor',
      params: { imageUri: selectedImage }
    });
  };

  // This component's UI is simplified to focus on image selection and feature browsing.
  // The detailed ToolButton component from the original code is not directly used here in the same way,
  // but the concept of features is presented differently.
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View style={{
          paddingHorizontal: 20,
          paddingVertical: 30,
          alignItems: 'center'
        }}>
          <Text style={{
            fontSize: 32,
            fontWeight: 'bold',
            color: '#fff',
            marginBottom: 8
          }}>
            AI Image Editor
          </Text>
          <Text style={{
            fontSize: 16,
            color: '#888',
            textAlign: 'center'
          }}>
            Transform your photos with AI-powered editing tools
          </Text>
        </View>

        {/* Image Selection */}
        <View style={{ paddingHorizontal: 20, marginBottom: 30 }}>
          <Text style={{
            fontSize: 20,
            fontWeight: '600',
            color: '#fff',
            marginBottom: 20
          }}>
            Get Started
          </Text>

          <View style={{ flexDirection: 'row', gap: 15 }}>
            <TouchableOpacity
              onPress={pickImage}
              style={{
                flex: 1,
                backgroundColor: '#1a1a1a',
                padding: 20,
                borderRadius: 15,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#333'
              }}
            >
              <ImageIcon size={30} color="#fff" />
              <Text style={{
                color: '#fff',
                fontSize: 16,
                fontWeight: '500',
                marginTop: 10
              }}>
                Choose Photo
              </Text>
              <Text style={{
                color: '#888',
                fontSize: 12,
                marginTop: 5,
                textAlign: 'center'
              }}>
                From gallery
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={takePhoto}
              style={{
                flex: 1,
                backgroundColor: '#1a1a1a',
                padding: 20,
                borderRadius: 15,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#333'
              }}
            >
              <Zap size={30} color="#fff" />
              <Text style={{
                color: '#fff',
                fontSize: 16,
                fontWeight: '500',
                marginTop: 10
              }}>
                Take Photo
              </Text>
              <Text style={{
                color: '#888',
                fontSize: 12,
                marginTop: 5,
                textAlign: 'center'
              }}>
                With camera
              </Text>
            </TouchableOpacity>
          </View>

          {selectedImage && (
            <TouchableOpacity
              onPress={processImage}
              style={{
                backgroundColor: '#007AFF',
                padding: 15,
                borderRadius: 10,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 20
              }}
            >
              <Text style={{
                color: '#fff',
                fontSize: 16,
                fontWeight: '600',
                marginRight: 8
              }}>
                Edit Selected Image
              </Text>
              <ArrowRight size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        {/* Features */}
        <View style={{ paddingHorizontal: 20, marginBottom: 30 }}>
          <Text style={{
            fontSize: 20,
            fontWeight: '600',
            color: '#fff',
            marginBottom: 20
          }}>
            AI-Powered Features
          </Text>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 15 }}>
            {[
              { icon: Sparkles, title: 'AI Enhance', desc: 'Auto improve quality' },
              { icon: Palette, title: 'Style Transfer', desc: 'Artistic filters' },
              { icon: Eraser, title: 'Background Remove', desc: 'Smart cutout' },
              { icon: Crop, title: 'Smart Crop', desc: 'Perfect framing' },
              { icon: Sliders, title: 'Color Adjust', desc: 'Professional tuning' },
              { icon: Wand2, title: 'Magic Fix', desc: 'One-click enhance' }
            ].map((feature, index) => (
              <View
                key={index}
                style={{
                  width: (width - 55) / 2, // Adjusted for padding and gap
                  backgroundColor: '#1a1a1a',
                  padding: 15,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: '#333'
                }}
              >
                <feature.icon size={24} color="#007AFF" />
                <Text style={{
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: '500',
                  marginTop: 8
                }}>
                  {feature.title}
                </Text>
                <Text style={{
                  color: '#888',
                  fontSize: 12,
                  marginTop: 2
                }}>
                  {feature.desc}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Bottom spacing to prevent content from being hidden by safe area */}
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}