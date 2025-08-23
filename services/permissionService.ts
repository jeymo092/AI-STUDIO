
import * as ImagePicker from 'expo-image-picker';
import { Platform, Alert, Linking } from 'react-native';

export interface PermissionResult {
  granted: boolean;
  canAskAgain: boolean;
  status: string;
}

export class PermissionService {
  static async checkMediaLibraryPermission(): Promise<PermissionResult> {
    try {
      if (Platform.OS === 'web') {
        return { granted: true, canAskAgain: false, status: 'granted' };
      }

      const { status, canAskAgain } = await ImagePicker.getMediaLibraryPermissionsAsync();
      console.log('Media library permission check:', { status, canAskAgain, platform: Platform.OS });
      
      return {
        granted: status === 'granted',
        canAskAgain: canAskAgain ?? true,
        status
      };
    } catch (error) {
      console.error('Error checking media library permission:', error);
      return { granted: false, canAskAgain: false, status: 'undetermined' };
    }
  }

  static async requestMediaLibraryPermission(): Promise<PermissionResult> {
    try {
      if (Platform.OS === 'web') {
        return { granted: true, canAskAgain: false, status: 'granted' };
      }

      console.log('Requesting media library permission...');
      const { status, canAskAgain } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('Media library permission request result:', { status, canAskAgain, platform: Platform.OS });
      
      return {
        granted: status === 'granted',
        canAskAgain: canAskAgain ?? true,
        status
      };
    } catch (error) {
      console.error('Error requesting media library permission:', error);
      return { granted: false, canAskAgain: false, status: 'undetermined' };
    }
  }

  static async checkCameraPermission(): Promise<PermissionResult> {
    try {
      if (Platform.OS === 'web') {
        return { granted: false, canAskAgain: false, status: 'denied' };
      }

      const { status, canAskAgain } = await ImagePicker.getCameraPermissionsAsync();
      console.log('Camera permission check:', { status, canAskAgain, platform: Platform.OS });
      
      return {
        granted: status === 'granted',
        canAskAgain: canAskAgain ?? true,
        status
      };
    } catch (error) {
      console.error('Error checking camera permission:', error);
      return { granted: false, canAskAgain: false, status: 'undetermined' };
    }
  }

  static async requestCameraPermission(): Promise<PermissionResult> {
    try {
      if (Platform.OS === 'web') {
        return { granted: false, canAskAgain: false, status: 'denied' };
      }

      console.log('Requesting camera permission...');
      const { status, canAskAgain } = await ImagePicker.requestCameraPermissionsAsync();
      console.log('Camera permission request result:', { status, canAskAgain, platform: Platform.OS });
      
      return {
        granted: status === 'granted',
        canAskAgain: canAskAgain ?? true,
        status
      };
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      return { granted: false, canAskAgain: false, status: 'undetermined' };
    }
  }

  static async ensureMediaLibraryPermission(): Promise<boolean> {
    let permission = await this.checkMediaLibraryPermission();
    
    if (!permission.granted && permission.canAskAgain) {
      permission = await this.requestMediaLibraryPermission();
    }
    
    if (!permission.granted && !permission.canAskAgain) {
      this.showPermissionDeniedAlert('media');
      return false;
    }
    
    return permission.granted;
  }

  static async ensureCameraPermission(): Promise<boolean> {
    let permission = await this.checkCameraPermission();
    
    if (!permission.granted && permission.canAskAgain) {
      permission = await this.requestCameraPermission();
    }
    
    if (!permission.granted && !permission.canAskAgain) {
      this.showPermissionDeniedAlert('camera');
      return false;
    }
    
    return permission.granted;
  }

  static showPermissionDeniedAlert(type: 'media' | 'camera') {
    const permissionName = type === 'media' 
      ? (Platform.OS === 'android' ? 'Storage' : 'Photo Library')
      : 'Camera';
      
    const message = Platform.OS === 'android'
      ? `${permissionName} permission is required. Please grant it in your device settings.`
      : `${permissionName} access is required. Please grant it in your device settings.`;

    Alert.alert(
      'Permission Required',
      message,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Settings',
          onPress: () => {
            if (Platform.OS === 'ios') {
              Linking.openURL('app-settings:');
            } else {
              Linking.openSettings();
            }
          }
        }
      ]
    );
  }

  static getOptimalImagePickerConfig() {
    return {
      mediaTypes: [ImagePicker.MediaType.Images] as ImagePicker.MediaType[],
      allowsEditing: Platform.OS === 'ios', // Better on iOS
      aspect: Platform.OS === 'ios' ? [4, 3] as [number, number] : undefined,
      quality: Platform.OS === 'android' ? 0.7 : 0.8, // Lower quality on Android for better performance
      exif: false, // Don't include EXIF data
      base64: false, // Don't include base64 to save memory
    };
  }

  static getOptimalCameraConfig() {
    return {
      mediaTypes: [ImagePicker.MediaType.Images] as ImagePicker.MediaType[],
      allowsEditing: Platform.OS === 'ios',
      aspect: Platform.OS === 'ios' ? [4, 3] as [number, number] : undefined,
      quality: Platform.OS === 'android' ? 0.6 : 0.8, // Even lower quality for camera on Android
      exif: false,
      base64: false,
    };
  }
}
