import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';

const LOGO_FILENAME = 'business-logo.jpg';

function getLogoPath(): string {
  return `${FileSystem.documentDirectory}${LOGO_FILENAME}`;
}

export async function pickAndSaveBusinessLogo(): Promise<string | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Photo library permission is required to add a logo.');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.85,
  });

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  const destination = getLogoPath();
  await FileSystem.copyAsync({ from: result.assets[0].uri, to: destination });
  return destination;
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
