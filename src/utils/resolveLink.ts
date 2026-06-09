import { Platform } from 'react-native';

export function resolveLink(androidLink?: string, iosLink?: string, commonLink?: string): string | null {
  if (Platform.OS === 'android' && androidLink) {
    return androidLink;
  }
  if (Platform.OS === 'ios' && iosLink) {
    return iosLink;
  }
  if (commonLink) {
    return commonLink;
  }
  return null;
}
