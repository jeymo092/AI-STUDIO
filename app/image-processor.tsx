
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
    ArrowLeft,
    Eraser,
    Image as ImageIcon,
    Palette,
    Settings,
    Sliders,
    Sparkles,
    Wand2,
    Camera,
    Zap,
    Grid3X3,
    Smile
} from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import { Alert, Dimensions, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    removeBackground,
    blurBackground,
    addGradientBackground,
    addColorBackground,
    addShadow,
    generateAIBackground,
    enhanceFace,
    submitHDProcessing,
    getHDResult,
    eraseObjects
} from '../services/imageProcessingService';

interface ToolButtonProps {
  icon: React.ReactNode;
  label: string;
  hasBadge?: boolean;
  badgeText?: string;
  onPress?: () => void;
}

const ToolButton: React.FC<ToolButtonProps> = ({
  icon,
  label,
  hasBadge = false,
  badgeText = "New",
  onPress
}) => {
  const { width } = Dimensions.get('window');
  const isSmallScreen = width < 375;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        paddingVertical: isSmallScreen ? 16 : 20
      }}
    >
      <View style={{ position: 'relative', alignItems: 'center' }}>
        <View
          style={{
            width: isSmallScreen ? 50 : 60,
            height: isSmallScreen ? 50 : 60,
            borderRadius: isSmallScreen ? 25 : 30,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 8
          }}
        >
          {icon}
        </View>
        {hasBadge && (
          <View style={{
            position: 'absolute',
            top: -4,
            right: -8,
            backgroundColor: '#00D4AA',
            borderRadius: 10,
            paddingHorizontal: 6,
            paddingVertical: 2
          }}>
            <Text style={{
              color: 'white',
              fontSize: 10,
              fontWeight: 'bold'
            }}>{badgeText}</Text>
          </View>
        )}
      </View>
      <Text style={{
        color: 'white',
        fontSize: isSmallScreen ? 12 : 14,
        textAlign: 'center',
        fontWeight: '500'
      }}>{label}</Text>
    </TouchableOpacity>
  );
};

export default function ImageProcessorScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);
  const [mounted, setMounted] = useState(true);
  const { width, height } = Dimensions.get('window');
  const isSmallScreen = width < 375;

  const selectedImage = React.useMemo(() => {
    return (params.selectedImage || params.imageUri) as string;
  }, [params.selectedImage, params.imageUri]);

  useEffect(() => {
    return () => setMounted(false);
  }, []);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      // Fallback to home screen if no previous screen
      router.push('/(tabs)/');
    }
  };

  const processWithType = async (processingType: string, processingFunction: Function) => {
    if (!selectedImage) {
      Alert.alert('No Image', 'Please select an image first');
      return;
    }

    if (!mounted) return;

    setIsProcessing(true);

    try {
      console.log(`Starting ${processingType}...`);
      const result = await processingFunction(selectedImage);

      if (!mounted) return;

      if (result.success && result.imageUrl) {
        console.log(`${processingType} successful!`);

        router.push({
          pathname: '/results',
          params: {
            originalImage: selectedImage,
            processedImage: result.imageUrl,
            processingType: processingType
          }
        });
      } else {
        throw new Error(result.error || 'Failed to process image');
      }
    } catch (error) {
      console.error(`Error with ${processingType}:`, error);
      if (mounted) {
        Alert.alert(
          'Error',
          `Failed to process with ${processingType}. Please try again.`,
          [{ text: 'OK' }]
        );
      }
    } finally {
      if (mounted) {
        setIsProcessing(false);
      }
    }
  };

  const handleRemoveBG = () => {
    processWithType('Background Removal', removeBackground);
  };

  const handleEnhance = () => {
    processWithType('Face Enhancement', enhanceFace);
  };

  const handleBeautify = () => {
    processWithType('AI Beautify', addShadow);
  };

  const handlePortraits = () => {
    processWithType('AI Portraits', generateAIBackground);
  };

  const handleFilters = () => {
    processWithType('AI Filters', blurBackground);
  };

  const handleClarity = () => {
    processWithType('Improve Clarity', submitHDProcessing);
  };

  const handleEraser = () => {
    processWithType('Eraser Tool', eraseObjects);
  };

  const handleEdit = () => {
    processWithType('Edit Image', addGradientBackground);
  };

  const handleAdjust = () => {
    processWithType('Adjust Settings', (imageUri: string) => addColorBackground(imageUri, '#ffffff'));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1a1a1a' }}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingVertical: 16
        }}>
          <TouchableOpacity onPress={handleBack}>
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text style={{
            color: 'white',
            fontSize: 20,
            fontWeight: 'bold',
            letterSpacing: 1
          }}>Ai Studio</Text>
          <TouchableOpacity>
            <Settings size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Hero Section */}
        <View style={{
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingVertical: 40
        }}>
          {/* Profile Image with Split Effect */}
          <View style={{
            width: isSmallScreen ? 200 : 240,
            height: isSmallScreen ? 250 : 300,
            borderRadius: 20,
            overflow: 'hidden',
            marginBottom: 30,
            position: 'relative'
          }}>
            {selectedImage ? (
              <Image
                source={{ uri: selectedImage }}
                style={{
                  width: '100%',
                  height: '100%',
                  resizeMode: 'cover'
                }}
              />
            ) : (
              <View style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#333',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ImageIcon size={48} color="#666" />
                <Text style={{ color: '#666', marginTop: 8 }}>Select Image</Text>
              </View>
            )}
            
            {/* Split Line Effect */}
            <View style={{
              position: 'absolute',
              top: 0,
              left: '50%',
              width: 2,
              height: '100%',
              backgroundColor: 'rgba(255, 255, 255, 0.3)'
            }} />
          </View>

          {/* Title and CTA */}
          <View style={{ alignItems: 'flex-start', width: '100%', marginBottom: 20 }}>
            <Text style={{
              color: 'white',
              fontSize: isSmallScreen ? 28 : 32,
              fontWeight: 'bold',
              marginBottom: 8
            }}>Beautify</Text>
            <Text style={{
              color: 'white',
              fontSize: isSmallScreen ? 28 : 32,
              fontWeight: 'bold',
              marginBottom: 20
            }}>Faces</Text>
            
            <TouchableOpacity
              onPress={handleBeautify}
              style={{
                backgroundColor: 'white',
                borderRadius: 25,
                paddingHorizontal: 24,
                paddingVertical: 12,
                flexDirection: 'row',
                alignItems: 'center'
              }}
            >
              <Text style={{
                color: '#1a1a1a',
                fontSize: 16,
                fontWeight: '600',
                marginRight: 8
              }}>Try Now</Text>
              <ArrowLeft size={16} color="#1a1a1a" style={{ transform: [{ rotate: '180deg' }] }} />
            </TouchableOpacity>
          </View>

          {/* Central Enhance Button */}
          <View style={{
            alignItems: 'center',
            marginBottom: 40
          }}>
            <TouchableOpacity
              onPress={handleEnhance}
              style={{
                width: isSmallScreen ? 80 : 100,
                height: isSmallScreen ? 80 : 100,
                borderRadius: isSmallScreen ? 40 : 50,
                background: 'linear-gradient(135deg, #00D4AA 0%, #9C27B0 100%)',
                backgroundColor: '#00D4AA',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
                shadowColor: '#00D4AA',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 8
              }}
            >
              <Sparkles size={isSmallScreen ? 28 : 36} color="white" />
            </TouchableOpacity>
            <Text style={{
              color: 'white',
              fontSize: 16,
              fontWeight: '600'
            }}>Enhance</Text>
          </View>
        </View>

        {/* Tool Grid */}
        <View style={{
          paddingHorizontal: 20,
          paddingBottom: 40
        }}>
          {/* First Row */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 20
          }}>
            <ToolButton
              icon={<Grid3X3 size={24} color="white" />}
              label="Remove BG"
              onPress={handleRemoveBG}
            />
            <ToolButton
              icon={<Smile size={24} color="white" />}
              label="AI Beautify"
              onPress={handleBeautify}
            />
          </View>

          {/* Second Row */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 20
          }}>
            <ToolButton
              icon={<Camera size={24} color="white" />}
              label="AI Portraits"
              onPress={handlePortraits}
            />
            <ToolButton
              icon={<Palette size={24} color="white" />}
              label="AI Filters"
              hasBadge={true}
              badgeText="New"
              onPress={handleFilters}
            />
            <ToolButton
              icon={<Zap size={24} color="white" />}
              label="Improve clarity"
              onPress={handleClarity}
            />
          </View>

          {/* Third Row */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between'
          }}>
            <ToolButton
              icon={<Eraser size={24} color="white" />}
              label="Eraser"
              onPress={handleEraser}
            />
            <ToolButton
              icon={<Wand2 size={24} color="white" />}
              label="Edit"
              onPress={handleEdit}
            />
            <ToolButton
              icon={<Sliders size={24} color="white" />}
              label="Adjust"
              onPress={handleAdjust}
            />
          </View>
        </View>

        {/* Processing Status */}
        {isProcessing && (
          <View style={{
            paddingHorizontal: 20,
            marginBottom: 20
          }}>
            <View style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 16,
              padding: 20,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <View style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                borderWidth: 2,
                borderColor: '#00D4AA',
                borderTopColor: 'transparent',
                marginRight: 12
              }} />
              <Text style={{
                color: 'white',
                fontSize: 16,
                fontWeight: '500'
              }}>
                Processing your image...
              </Text>
            </View>
          </View>
        )}

        {/* Bottom Indicator */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'center',
          paddingBottom: 20
        }}>
          <View style={{
            width: 40,
            height: 4,
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            borderRadius: 2,
            marginHorizontal: 4
          }} />
          <View style={{
            width: 20,
            height: 4,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 2,
            marginHorizontal: 4
          }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
