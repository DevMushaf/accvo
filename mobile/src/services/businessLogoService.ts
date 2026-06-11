import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Image } from 'react-native';

import type { BusinessLogoShape } from '@/types/settings';

const LOGO_FILENAME = 'business-logo.jpg';
const WIDE_ASPECT_THRESHOLD = 1.4;

export const LOGO_PDF_MAX_W = 168;
export const LOGO_PDF_MAX_H = 140;
export const LOGO_PREVIEW_MAX = 128;

export function fitLogoDimensions(
  naturalWidth: number,
  naturalHeight: number,
  maxWidth = LOGO_PDF_MAX_W,
  maxHeight = LOGO_PDF_MAX_H,
): { width: number; height: number } {
  if (naturalWidth <= 0 || naturalHeight <= 0) {
    return { width: maxWidth, height: maxHeight };
  }
  const scale = Math.min(maxWidth / naturalWidth, maxHeight / naturalHeight);
  return {
    width: Math.round(naturalWidth * scale),
    height: Math.round(naturalHeight * scale),
  };
}

function getLogoPath(): string {
  return `${FileSystem.documentDirectory}${LOGO_FILENAME}`;
}

export function detectLogoShape(width: number, height: number): BusinessLogoShape {
  if (height <= 0) return 'square';
  return width / height > WIDE_ASPECT_THRESHOLD ? 'wide' : 'square';
}

async function getImageDimensions(
  uri: string,
  fallbackWidth: number,
  fallbackHeight: number,
): Promise<{ width: number; height: number }> {
  if (fallbackWidth > 0 && fallbackHeight > 0) {
    return { width: fallbackWidth, height: fallbackHeight };
  }

  return new Promise((resolve) => {
    Image.getSize(
      uri,
      (width, height) => resolve({ width, height }),
      () => resolve({ width: fallbackWidth || 1, height: fallbackHeight || 1 }),
    );
  });
}

export interface PickLogoResult {
  uri: string;
  shape: BusinessLogoShape;
  width: number;
  height: number;
}

/** Pick an image from the library — cropping happens in LogoCropModal. */
export async function pickLogoImage(): Promise<string | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Photo library permission is required to add a logo.');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: false,
    quality: 1,
  });

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  return result.assets[0].uri;
}

export async function saveCroppedLogo(sourceUri: string): Promise<PickLogoResult> {
  const destination = getLogoPath();
  await FileSystem.copyAsync({ from: sourceUri, to: destination });

  const { width, height } = await getImageDimensions(destination, 0, 0);
  const shape = detectLogoShape(width, height);

  return { uri: destination, shape, width, height };
}

function resolveLogoFilePath(logoUri: string): string {
  return logoUri.split('?')[0];
}

export async function getBusinessLogoDataUri(logoUri: string | null): Promise<string | null> {
  if (!logoUri) return null;

  const filePath = resolveLogoFilePath(logoUri);
  const info = await FileSystem.getInfoAsync(filePath);
  if (!info.exists) return null;

  const base64 = await FileSystem.readAsStringAsync(filePath, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const isPng = filePath.toLowerCase().includes('.png');
  const mime = isPng ? 'image/png' : 'image/jpeg';
  return `data:${mime};base64,${base64}`;
}

export async function removeBusinessLogo(logoUri: string | null): Promise<void> {
  if (!logoUri) return;
  const filePath = resolveLogoFilePath(logoUri);
  const info = await FileSystem.getInfoAsync(filePath);
  if (info.exists) {
    await FileSystem.deleteAsync(filePath, { idempotent: true });
  }
}
