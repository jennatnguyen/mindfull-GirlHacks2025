import { useState } from 'react';

const useCameraFlip = () => {
  type Facing = 'front' | 'back';
  const [isFront, setIsFront] = useState(true);

  const toggleCameraType = () => {
    setIsFront(prev => !prev);
  };

  const cameraType: Facing = isFront ? 'front' : 'back';

  return { cameraType, toggleCameraType };
};

export default useCameraFlip;