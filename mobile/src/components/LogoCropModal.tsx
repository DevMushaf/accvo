import { ImageEditor, type ImageData } from 'expo-dynamic-image-crop';

interface LogoCropModalProps {
  visible: boolean;
  imageUri: string | null;
  onComplete: (data: ImageData) => void;
  onCancel: () => void;
}

/** Full-screen freeform crop — works the same on iOS and Android. */
export function LogoCropModal({ visible, imageUri, onComplete, onCancel }: LogoCropModalProps) {
  if (!visible || !imageUri) return null;

  return (
    <ImageEditor
      isVisible={visible}
      imageUri={imageUri}
      onEditingComplete={onComplete}
      onEditingCancel={onCancel}
      dynamicCrop
      useModal
    />
  );
}
