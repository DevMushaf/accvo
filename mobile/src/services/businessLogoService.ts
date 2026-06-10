import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';

import type { BusinessLogoShape } from '@/types/settings';

const LOGO_FILENAME = 'business-logo.jpg';
const WIDE_ASPECT_THRESHOLD = 1.4;

function getLogoPath(): string {
  return `${FileSystem.documentDirectory}${LOGO_FILENAME}`;
}

export function detectLogoShape(width: number, height: number): BusinessLogoShape {
  if (height <= 0) return 'square';
  return width / height > WIDE_ASPECT_THRESHOLD ? 'wide' : 'square';
}

export interface PickLogoResult {
  uri: string;
  shape: BusinessLogoShape;
}

export async function pickAndSaveBusinessLogo(): Promise<PickLogoResult | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Photo library permission is required to add a logo.');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [3, 1],
    quality: 0.85,
  });

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  const asset = result.assets[0];
  const destination = getLogoPath();
  await FileSystem.copyAsync({ from: asset.uri, to: destination });

  const shape = detectLogoShape(asset.width ?? 0, asset.height ?? 0);
  return { uri: destination, shape };
}

export async function getBusinessLogoDataUri(logoUri: string | null): Promise<string | null> {
  if (!logoUri) return null;

  const info = await FileSystem.getInfoAsync(logoUri);
  if (!info.exists) return null;

  const base64 = await FileSystem.readAsStringAsync(logoUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const isPng = logoUri.toLowerCase().includes('.png');
  const mime = isPng ? 'image/png' : 'image/jpeg';
  return `data:${mime};base64,${base64}`;
}

export async function removeBusinessLogo(logoUri: string | null): Promise<void> {
  if (!logoUri) return;
  const info = await FileSystem.getInfoAsync(logoUri);
  if (info.exists) {
    await FileSystem.deleteAsync(logoUri, { idempotent: true });
  }
}
