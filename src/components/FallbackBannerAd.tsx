import React, { useMemo, useState } from 'react';
import {
  Image,
  ImageSourcePropType,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  useColorScheme,
} from 'react-native';
import { resolveLink } from '../utils/resolveLink';

export interface FallbackBannerAdProps {
  // Required content
  icon: ImageSourcePropType;
  title: string;
  subtitle: string;

  // Links
  androidLink?: string;
  iosLink?: string;
  commonLink?: string;

  // Callbacks
  onPress?: (resolvedUrl: string) => void;
  onError?: (error: { type: 'NO_LINK' | 'LINK_FAILED'; message?: string }) => void;

  // Styling & behavior
  style?: ViewStyle;
  testID?: string;

  // NEW: theme control
  theme?: 'light' | 'dark' | 'auto'; // default: 'light'
}

export const FallbackBannerAd: React.FC<FallbackBannerAdProps> = ({
  icon,
  title,
  subtitle,
  androidLink,
  iosLink,
  commonLink,
  onPress,
  onError,
  style,
  testID,
  theme = 'light',
}) => {
  const systemColorScheme = useColorScheme();
  const [imageError, setImageError] = useState(false);

  const activeTheme = theme === 'auto' ? (systemColorScheme || 'light') : theme;

  const styles = useMemo(() => {
    const isDark = activeTheme === 'dark';
    return StyleSheet.create({
      container: {
        width: 300,
        height: 50,
        backgroundColor: isDark ? '#1c1c1c' : '#ffffff',
        borderRadius: 8,
        padding: 8,
        flexDirection: 'row',
        alignItems: 'center',
      },
      iconContainer: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
      },
      icon: {
        width: '100%',
        height: '100%',
      },
      fallbackIcon: {
        backgroundColor: isDark ? '#333333' : '#e0e0e0',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 4,
      },
      fallbackIconText: {
        color: isDark ? '#ffffff' : '#000000',
        fontSize: 10,
        fontWeight: 'bold',
      },
      textContainer: {
        flex: 1,
        justifyContent: 'center',
      },
      title: {
        color: isDark ? '#ffffff' : '#000000',
        fontSize: 14,
        fontWeight: 'bold',
      },
      subtitle: {
        color: isDark ? '#aaaaaa' : '#666666',
        fontSize: 12,
      },
      adLabel: {
        position: 'absolute',
        top: 4,
        right: 8,
        fontSize: 10,
        fontWeight: '500',
        color: isDark ? '#777777' : '#999999',
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
      testID={testID}
      accessibilityRole="link"
      accessibilityLabel={`${title}, ${subtitle}, advertisement`}
    >
      <View style={styles.iconContainer}>
        {imageError ? (
          <View style={styles.fallbackIcon}>
            <Text style={styles.fallbackIconText}>Ad</Text>
          </View>
        ) : (
          <Image
            source={icon}
            style={styles.icon}
            resizeMode="contain"
            onError={() => setImageError(true)}
          />
        )}
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      <Text style={styles.adLabel} pointerEvents="none">
        AD
      </Text>
    </TouchableOpacity>
  );
};
