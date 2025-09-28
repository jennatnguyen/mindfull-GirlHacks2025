import { useEffect, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';

const useCameraPermission = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    const requestCameraPermission = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'This app needs access to your camera to take photos.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        setHasPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
      } else {
        // For iOS, permissions are handled differently
        setHasPermission(true); // Assume permission is granted for iOS
      }
    };

    requestCameraPermission();
  }, []);

  return hasPermission;
};

export default useCameraPermission;