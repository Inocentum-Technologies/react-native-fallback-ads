import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  ImageSourcePropType,
  Linking,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  useWindowDimensions,
  View,
} from 'react-native';
import { resolveLink } from '../utils/resolveLink';

export interface FallbackFullscreenAdProps {
  /**
   * The portrait image to display when the device is in portrait orientation.
   * Supports PNG, JPEG, WEBP, and GIF formats.
   */
  portraitImage: ImageSourcePropType;
  /**
   * The landscape image to display when the device is in landscape orientation.
   * Falls back to `portraitImage` if not provided.
   */
  landscapeImage?: ImageSourcePropType;
  /**
   * Whether the ad is visible.
   */
  visible?: boolean;
  /**
   * Callback when the ad is dismissed (close button pressed or background tapped).
   */
  onDismiss?: () => void;
  androidLink?: string;
  iosLink?: string;
  commonLink?: string;
  onPress?: (resolvedUrl: string) => void;
  onError?: (error: { type: 'NO_LINK' | 'LINK_FAILED' | 'NO_IMAGE'; message?: string }) => void;
  /**
   * Whether to show the close button. Default is true.
   */
  showCloseButton?: boolean;
  /**
   * Number of seconds to wait before showing the close button.
   * A countdown badge is shown during this period. Default is 5.
   */
  closeDelay?: number;
  testID?: string;
  theme?: 'light' | 'dark' | 'auto';
}

export const FallbackFullscreenAd: React.FC<FallbackFullscreenAdProps> = ({
  portraitImage,
  landscapeImage,
  visible = true,
  onDismiss,
  androidLink,
  iosLink,
  commonLink,
  onPress,
  onError,
  showCloseButton = true,
  closeDelay = 5,
  testID,
  theme = 'auto',
}) => {
  const systemColorScheme = useColorScheme();
  const [imageError, setImageError] = useState(false);
  const [countdown, setCountdown] = useState(closeDelay);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { width, height } = useWindowDimensions();

  // Reset and start countdown whenever the modal becomes visible
  useEffect(() => {
    if (visible && showCloseButton && closeDelay > 0) {
      setCountdown(closeDelay);
      countdownRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (!visible) {
      // Reset for next open
      setCountdown(closeDelay);
    }
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, [visible, showCloseButton, closeDelay]);

  const isLandscape = width > height;
  const activeTheme = theme === 'auto' ? (systemColorScheme || 'light') : theme;

  // Use landscapeImage for landscape, fallback to portraitImage
  const imageSource: ImageSourcePropType = isLandscape && landscapeImage
    ? landscapeImage
    : portraitImage;

  // Reset error state when the source changes (e.g. orientation switch)
  useEffect(() => {
    setImageError(false);
  }, [imageSource]);

  const styles = useMemo(() => {
    const isDark = activeTheme === 'dark';
    return StyleSheet.create({
      overlay: {
        flex: 1,
        backgroundColor: '#000000',
      },
      imageWrapper: {
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: isDark ? '#1c1c1c' : '#000000',
      },
      image: {
        width: '100%',
        height: '100%',
      },
      fallbackIcon: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: isDark ? '#333333' : '#e0e0e0',
      },
      fallbackIconText: {
        color: isDark ? '#ffffff' : '#000000',
        fontSize: 16,
        fontWeight: 'bold',
      },
      adLabel: {
        position: 'absolute',
        bottom: 16,
        left: 16,
        fontSize: 10,
        fontWeight: 'bold',
        color: '#eeeeee',
        backgroundColor: 'rgba(0,0,0,0.55)',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 4,
        overflow: 'hidden',
      },
      closeButton: {
        position: 'absolute',
        top: 48,
        right: 16,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        ...Platform.select({
          ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.4,
            shadowRadius: 4,
          },
          android: {
            elevation: 6,
          },
        }),
      },
      closeButtonText: {
        fontSize: 16,
        lineHeight: 18,
        color: '#ffffff',
        fontWeight: '600',
      },
      countdownBadge: {
        position: 'absolute',
        top: 48,
        right: 16,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0,0,0,0.55)',
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.35)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
      },
      countdownText: {
        fontSize: 13,
        lineHeight: 15,
        color: '#ffffff',
        fontWeight: '700',
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
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      testID={testID}
      onRequestClose={onDismiss}
      accessibilityViewIsModal
    >
      {/* Fullscreen touchable — tapping anywhere on the image opens the link */}
      <TouchableOpacity
        style={styles.overlay}
        onPress={handlePress}
        activeOpacity={1}
        accessibilityRole="link"
        accessibilityLabel="Advertisement"
      >
        <View style={styles.imageWrapper}>
          {imageError ? (
            <View style={styles.fallbackIcon}>
              <Text style={styles.fallbackIconText}>Ad</Text>
            </View>
          ) : (
            <Image
              source={imageSource}
              style={styles.image}
              resizeMode="cover"
              onError={() => {
                setImageError(true);
                onError?.({ type: 'NO_IMAGE', message: 'Failed to load ad image.' });
              }}
            />
          )}
          <Text style={styles.adLabel} pointerEvents="none">
            AD
          </Text>
        </View>
      </TouchableOpacity>

      {/* Close / countdown badge — floats above the image, does not trigger the link */}
      {showCloseButton && (
        countdown > 0 ? (
          <View
            style={styles.countdownBadge}
            accessibilityLabel={`Ad closes in ${countdown} seconds`}
          >
            <Text style={styles.countdownText}>{countdown}</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onDismiss}
            accessibilityRole="button"
            accessibilityLabel="Close advertisement"
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        )
      )}
    </Modal>
  );
};
