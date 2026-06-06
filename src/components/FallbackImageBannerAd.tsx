import React, { useMemo, useState } from 'react';
import {
  Image,
  ImageSourcePropType,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  useColorScheme,
} from 'react-native';
import { resolveLink } from '../utils/resolveLink';

export interface FallbackImageBannerAdProps {
  /**
   * The image to display in the banner.
   * Supports PNG, JPEG, WEBP, and GIF formats.
   */
  image: ImageSourcePropType;
  androidLink?: string;
  iosLink?: string;
  commonLink?: string;
  onPress?: (resolvedUrl: string) => void;
  onError?: (error: { type: 'NO_LINK' | 'LINK_FAILED'; message?: string }) => void;
  style?: ViewStyle;
  testID?: string;
  theme?: 'light' | 'dark' | 'auto';
}

export const FallbackImageBannerAd: React.FC<FallbackImageBannerAdProps> = ({
  image,
  androidLink,
  iosLink,
  commonLink,
  onPress,
  onError,
  style,
  testID,
  theme = 'auto',
}) => {
  const systemColorScheme = useColorScheme();
  const [imageError, setImageError] = useState(false);

  const activeTheme = theme === 'auto' ? (systemColorScheme || 'light') : theme;

  const styles = useMemo(() => {
    const isDark = activeTheme === 'dark';
    return StyleSheet.create({
      container: {
        width: 320,
        height: 50,
        backgroundColor: isDark ? '#1c1c1c' : '#ffffff',
        borderRadius: 8,
        borderColor: isDark ? '#333333' : '#e0e0e0',
        borderWidth: 1,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
      },
      image: {
        width: '100%',
        height: '100%',
      },
      fallbackIcon: {
        backgroundColor: isDark ? '#333333' : '#e0e0e0',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
      },
      fallbackIconText: {
        color: isDark ? '#ffffff' : '#000000',
        fontSize: 12,
        fontWeight: 'bold',
      },
      adLabel: {
        position: 'absolute',
        top: 4,
        right: 8,
        fontSize: 10,
        fontWeight: '500',
        color: isDark ? '#777777' : '#999999',
        backgroundColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.7)',
        paddingHorizontal: 4,
        borderRadius: 4,
        overflow: 'hidden',
      },
    });
  }, [activeTheme]);

  const handlePress = async () => {
    const resolvedUrl = resolveLink(androidLink, iosLink, commonLink);

    if (!resolvedUrl) {
      onError?.({ type: 'NO_LINK', message: 'No valid link provided for this platform.' });
      return;
    }

    try {
      const canOpen = await Linking.canOpenURL(resolvedUrl);
      if (canOpen) {
        await Linking.openURL(resolvedUrl);
        onPress?.(resolvedUrl);
      } else {
        onError?.({ type: 'LINK_FAILED', message: `Cannot open URL: ${resolvedUrl}` });
      }
    } catch (err) {
      onError?.({
        type: 'LINK_FAILED',
        message: err instanceof Error ? err.message : 'Unknown linking error',
      });
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={handlePress}
      activeOpacity={0.8}
      testID={testID}
      accessibilityRole="link"
      accessibilityLabel="Advertisement banner"
    >
      {imageError ? (
        <View style={styles.fallbackIcon}>
          <Text style={styles.fallbackIconText}>Ad</Text>
        </View>
      ) : (
        <Image
          source={image}
          style={styles.image}
          resizeMode="cover"
          onError={() => setImageError(true)}
        />
      )}
      <Text style={styles.adLabel} pointerEvents="none">
        AD
      </Text>
    </TouchableOpacity>
  );
};
