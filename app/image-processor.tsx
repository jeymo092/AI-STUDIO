import { useLocalSearchParams, useRouter } from 'expo-router';
import {
    ArrowLeft,
    Eraser,
    Image as ImageIcon,
    Palette,
    Settings,
    Sliders,
    Sparkles,
    Wand2
} from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, Dimensions, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
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

  const buttonSize = isLarge
    ? (isSmallScreen ? 70 : isMediumScreen ? 80 : 90)
    : (isSmallScreen ? 56 : isMediumScreen ? 64 : 72);

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

export default function ImageProcessorScreen() {
  console.log('ImageProcessorScreen rendered!');
  console.log('=== REMOVE BG SCREEN LOADED ===');
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);
  const { width } = Dimensions.get('window');
  const isSmallScreen = width < 375;
  const isMediumScreen = width >= 375 && width < 768;

  const selectedImage = params.selectedImage as string;
  console.log('Selected image:', selectedImage);
  console.log('All params:', params);

  const handleBack = () => {
    router.back();
  };

  const processBackgroundRemoval = async () => {
    setIsProcessing(true);

    try {
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('Background removed successfully!');

      // Navigate to results screen with the images
      router.push({
        pathname: '/results',
        params: {
          originalImage: selectedImage,
          processedImage: selectedImage, // In real app, this would be the processed image
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

  const handleEnhance = () => {
    Alert.alert('Enhance', 'Enhance feature coming soon!');
  };

  const handleBeautify = () => {
    Alert.alert('AI Beautify', 'AI Beautify feature coming soon!');
  };

  const handlePortraits = () => {
    Alert.alert('AI Portraits', 'AI Portraits feature coming soon!');
  };

  const handleFilters = () => {
    Alert.alert('AI Filters', 'AI Filters feature coming soon!');
  };

  const handleClarity = () => {
    Alert.alert('Improve Clarity', 'Improve Clarity feature coming soon!');
  };

  const handleEraser = () => {
    Alert.alert('Eraser', 'Eraser feature coming soon!');
  };



  const handleAdjust = () => {
    Alert.alert('Adjust', 'Adjust feature coming soon!');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1a0033' }}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                 {/* Header */}
         <View style={{
           flexDirection: 'row',
           justifyContent: 'space-between',
           alignItems: 'center',
           paddingHorizontal: isSmallScreen ? 16 : isMediumScreen ? 24 : 32,
           paddingVertical: isSmallScreen ? 12 : 16
         }}>
           <TouchableOpacity onPress={handleBack}>
             <ArrowLeft size={isSmallScreen ? 20 : 24} color="white" />
           </TouchableOpacity>
                       <Text style={{
              color: 'white',
              fontSize: isSmallScreen ? 18 : isMediumScreen ? 20 : 24,
              fontWeight: 'bold'
            }}>REMOVE BG - WORKING!</Text>
           <TouchableOpacity>
             <Settings size={isSmallScreen ? 20 : 24} color="white" />
           </TouchableOpacity>
         </View>

                 {/* Image Display with Remove BG Features */}
         <View style={{
           paddingHorizontal: isSmallScreen ? 16 : isMediumScreen ? 24 : 32,
           paddingVertical: isSmallScreen ? 16 : 24
         }}>
           <View style={{
             width: '100%',
             height: isSmallScreen ? 300 : isMediumScreen ? 350 : 400,
             backgroundColor: '#1F2937',
             borderRadius: isSmallScreen ? 12 : 16,
             overflow: 'hidden',
             position: 'relative'
           }}>
             {selectedImage ? (
               <Image
                 source={{ uri: selectedImage }}
                 style={{
                   width: '100%',
                   height: '100%',
                   resizeMode: 'contain'
                 }}
               />
             ) : (
               <View style={{ alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                 <ImageIcon size={isSmallScreen ? 48 : 56} color="#6B7280" />
                 <Text style={{
                   color: '#9CA3AF',
                   fontSize: isSmallScreen ? 14 : 16,
                   marginTop: 12
                 }}>
                   No image selected
                 </Text>
               </View>
             )}

             {/* Remove BG Overlay Features */}
             <View style={{
               position: 'absolute',
               top: 0,
               left: 0,
               right: 0,
               bottom: 0,
               backgroundColor: 'rgba(0, 0, 0, 0.3)',
               justifyContent: 'center',
               alignItems: 'center'
             }}>
               <View style={{
                 backgroundColor: 'rgba(0, 0, 0, 0.8)',
                 borderRadius: 12,
                 padding: 20,
                 alignItems: 'center'
               }}>
                 <Text style={{
                   color: 'white',
                   fontSize: isSmallScreen ? 16 : 18,
                   fontWeight: 'bold',
                   marginBottom: 8
                 }}>
                   Remove Background
                 </Text>
                 <Text style={{
                   color: '#D1D5DB',
                   fontSize: isSmallScreen ? 12 : 14,
                   textAlign: 'center'
                 }}>
                   AI will automatically detect and remove the background
                 </Text>
               </View>
             </View>
           </View>
         </View>

        {/* Processing Status */}
        {isProcessing && (
          <View style={{
            paddingHorizontal: isSmallScreen ? 16 : isMediumScreen ? 24 : 32,
            marginBottom: isSmallScreen ? 16 : 24
          }}>
            <View style={{
              backgroundColor: '#1F2937',
              borderRadius: isSmallScreen ? 12 : 16,
              padding: isSmallScreen ? 16 : 20,
              flexDirection: 'row',
              alignItems: 'center'
            }}>
              <View style={{
                width: isSmallScreen ? 20 : 24,
                height: isSmallScreen ? 20 : 24,
                borderRadius: isSmallScreen ? 10 : 12,
                borderWidth: 2,
                borderColor: '#3B82F6',
                borderTopColor: 'transparent',
                animation: 'spin 1s linear infinite'
              }} />
              <Text style={{
                color: 'white',
                fontSize: isSmallScreen ? 14 : 16,
                marginLeft: 12,
                fontWeight: '500'
              }}>
                Processing your image...
              </Text>
            </View>
          </View>
        )}

                 {/* Remove BG Tools Section */}
         <View style={{
           paddingHorizontal: isSmallScreen ? 16 : isMediumScreen ? 24 : 32,
           paddingBottom: isSmallScreen ? 24 : 32
         }}>
           <Text style={{
             color: 'white',
             fontSize: isSmallScreen ? 18 : isMediumScreen ? 20 : 24,
             fontWeight: 'bold',
             marginBottom: isSmallScreen ? 16 : 20
           }}>
             Remove BG Features
           </Text>

           {/* Main Remove BG Button */}
           <View style={{
             marginBottom: isSmallScreen ? 24 : 32,
             alignItems: 'center'
           }}>
             <TouchableOpacity
               onPress={processBackgroundRemoval}
               style={{
                 width: '100%',
                 backgroundColor: '#8B5CF6',
                 borderRadius: isSmallScreen ? 16 : 20,
                 paddingVertical: isSmallScreen ? 18 : 22,
                 alignItems: 'center',
                 justifyContent: 'center',
                 flexDirection: 'row',
                 shadowColor: '#8B5CF6',
                 shadowOffset: { width: 0, height: 4 },
                 shadowOpacity: 0.3,
                 shadowRadius: 12,
                 elevation: 8
               }}
             >
               <ImageIcon size={isSmallScreen ? 24 : 28} color="white" style={{ marginRight: 12 }} />
               <Text style={{
                 color: 'white',
                 fontSize: isSmallScreen ? 18 : 20,
                 fontWeight: 'bold'
               }}>
                 {isProcessing ? "Processing..." : "Remove Background"}
               </Text>
             </TouchableOpacity>
           </View>

                       {/* Additional Remove BG Options */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: isSmallScreen ? 24 : 32
            }}>
              <ToolButton
                icon={<Eraser size={isSmallScreen ? 20 : isMediumScreen ? 24 : 28} color="white" />}
                label="Manual Erase"
                onPress={handleEraser}
              />
              <ToolButton
                icon={<Sliders size={isSmallScreen ? 20 : isMediumScreen ? 24 : 28} color="white" />}
                label="Fine Tune"
                onPress={handleAdjust}
              />
              <ToolButton
                icon={<Sparkles size={isSmallScreen ? 20 : isMediumScreen ? 24 : 28} color="white" />}
                label="AI Enhance"
                onPress={handleBeautify}
              />
            </View>

           {/* Background Options */}
           <View style={{
             flexDirection: 'row',
             justifyContent: 'space-between',
             alignItems: 'center'
           }}>
             <ToolButton
               icon={<Palette size={isSmallScreen ? 20 : isMediumScreen ? 24 : 28} color="white" />}
               label="New Background"
               hasBadge={true}
               badgeText="Pro"
               onPress={handleFilters}
             />
             <ToolButton
               icon={<Sparkles size={isSmallScreen ? 20 : isMediumScreen ? 24 : 28} color="white" />}
               label="AI Enhance"
               onPress={handleBeautify}
             />
             <ToolButton
               icon={<Wand2 size={isSmallScreen ? 20 : isMediumScreen ? 24 : 28} color="white" />}
               label="Auto Fix"
               onPress={handleEnhance}
             />
           </View>
         </View>
      </ScrollView>
    </SafeAreaView>
  );
}