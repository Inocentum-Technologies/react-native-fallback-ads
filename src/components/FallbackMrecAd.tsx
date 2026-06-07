import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
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

export interface FallbackMrecAdProps {
  /**
   * The single image to display in the banner.
   * Supports PNG, JPEG, WEBP, and GIF formats.
   */
  image?: ImageSourcePropType;
  /**
   * An array of images to cycle through. If provided, this overrides `image`.
   */
  images?: ImageSourcePropType[];
  /**
   * The duration in milliseconds to show each image before switching. Default is 5000ms.
   */
  switchInterval?: number;
  /**
   * The animation type to use when switching images. Default is 'flip'.
   */
  animationType?: 'flip' | '3d-flip' | '3d-flip-horizontal' | 'fade' | 'none';
  androidLink?: string;
  iosLink?: string;
  commonLink?: string;
  onPress?: (resolvedUrl: string) => void;
  onError?: (error: { type: 'NO_LINK' | 'LINK_FAILED' | 'NO_IMAGE'; message?: string }) => void;
  style?: ViewStyle;
  testID?: string;
  theme?: 'light' | 'dark' | 'auto';
}

export const FallbackMrecAd: React.FC<FallbackMrecAdProps> = ({
  image,
  images,
  switchInterval = 5000,
  animationType = 'flip',
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [layoutWidth, setLayoutWidth] = useState(300);
  const [layoutHeight, setLayoutHeight] = useState(250);

  const animValue = useRef(new Animated.Value(0)).current;

  const displayImages = useMemo(() => {
    return images && images.length > 0 ? images : (image ? [image] : []);
  }, [images, image]);

  const hasMultipleImages = displayImages.length > 1;

  useEffect(() => {
    if (!hasMultipleImages) return;

    const interval = setInterval(() => {
      const nextIndex = () => setCurrentIndex((prev) => (prev + 1) % displayImages.length);
      const resetAnim = () => animValue.setValue(0);

      switch (animationType) {
        case 'none':
          nextIndex();
          break;
        case 'fade':
          Animated.timing(animValue, { toValue: 1, duration: 300, useNativeDriver: true }).start(({ finished }) => {
            if (finished) {
              nextIndex();
              Animated.timing(animValue, { toValue: 0, duration: 300, useNativeDriver: true }).start();
            }
          });
          break;
        case 'flip':
          Animated.timing(animValue, { toValue: 0.5, duration: 300, useNativeDriver: true }).start(({ finished }) => {
            if (finished) {
              nextIndex();
              Animated.timing(animValue, { toValue: 1, duration: 300, useNativeDriver: true }).start(() => resetAnim());
            }
          });
          break;
        case '3d-flip':
        case '3d-flip-horizontal':
          Animated.timing(animValue, { toValue: 1, duration: 1000, useNativeDriver: true }).start(({ finished }) => {
            if (finished) {
              nextIndex();
              resetAnim();
            }
          });
          break;
      }
    }, switchInterval);

    return () => clearInterval(interval);
  }, [hasMultipleImages, displayImages.length, switchInterval, animationType, animValue]);

  const activeTheme = theme === 'auto' ? (systemColorScheme || 'light') : theme;

  const styles = useMemo(() => {
    const isDark = activeTheme === 'dark';
    return StyleSheet.create({
      container: {
        width: 300,
        height: 250,
        backgroundColor: isDark ? '#1c1c1c' : '#ffffff',
        borderRadius: 8,
        borderColor: isDark ? '#333333' : '#e0e0e0',
        borderWidth: 1,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
      },
      imageContainer: {
        width: '100%',
        height: '100%',
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
        fontWeight: 'bold',
        color: isDark ? '#eeeeee' : '#222222',
        backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.8)',
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

  const currentImageSource = displayImages[currentIndex];
  const nextImageSource = displayImages[(currentIndex + 1) % displayImages.length];

  const animatedStyle = useMemo(() => {
    if (!hasMultipleImages || animationType === 'none' || animationType === '3d-flip' || animationType === '3d-flip-horizontal') return {};

    switch (animationType) {
      case 'fade':
        return {
          opacity: animValue.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
        };
      case 'flip':
        return {
          transform: [
            {
              rotateY: animValue.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: ['0deg', '-90deg', '0deg'],
              }),
            },
          ],
        };
      default:
        return {};
    }
  }, [hasMultipleImages, animationType, animValue]);

  const { faceAStyle, faceBStyle } = useMemo(() => {
    if (animationType !== '3d-flip' && animationType !== '3d-flip-horizontal') return { faceAStyle: {}, faceBStyle: {} };

    const d = 1000; // perspective distance
    const isHorizontal = animationType === '3d-flip-horizontal';
    const translationVal = (isHorizontal ? layoutWidth / 2 : layoutHeight / 2) - 0.5;

    // Synthesize translateZ to avoid Android invariant violations and matrix animated bugs
    const translateZNegative = isHorizontal ? [
      { rotateY: '90deg' },
      { translateX: translationVal },
      { rotateY: '-90deg' },
    ] : [
      { rotateX: '-90deg' },
      { translateY: translationVal },
      { rotateX: '90deg' },
    ];

    const translateZPositive = isHorizontal ? [
      { rotateY: '90deg' },
      { translateX: -translationVal },
      { rotateY: '-90deg' },
    ] : [
      { rotateX: '-90deg' },
      { translateY: -translationVal },
      { rotateX: '90deg' },
    ];

    if (isHorizontal) {
      return {
        faceAStyle: {
          position: 'absolute' as const,
          backfaceVisibility: 'hidden' as const,
          transform: [
            { perspective: d },
            ...translateZNegative,
            {
              rotateY: animValue.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '-90deg'],
              }),
            },
            ...translateZPositive,
          ],
        },
        faceBStyle: {
          position: 'absolute' as const,
          backfaceVisibility: 'hidden' as const,
          transform: [
            { perspective: d },
            ...translateZNegative,
            {
              rotateY: animValue.interpolate({
                inputRange: [0, 1],
                outputRange: ['90deg', '0deg'],
              }),
            },
            ...translateZPositive,
          ],
        },
      };
    } else {
      return {
        faceAStyle: {
          position: 'absolute' as const,
          backfaceVisibility: 'hidden' as const,
          transform: [
            { perspective: d },
            ...translateZNegative,
            {
              rotateX: animValue.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '-90deg'],
              }),
            },
            ...translateZPositive,
          ],
        },
        faceBStyle: {
          position: 'absolute' as const,
          backfaceVisibility: 'hidden' as const,
          transform: [
            { perspective: d },
            ...translateZNegative,
            {
              rotateX: animValue.interpolate({
                inputRange: [0, 1],
                outputRange: ['90deg', '0deg'],
              }),
            },
            ...translateZPositive,
          ],
        },
      };
    }
  }, [animationType, animValue, layoutWidth, layoutHeight]);

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={handlePress}
      activeOpacity={0.8}
      testID={testID}
      accessibilityRole="link"
      accessibilityLabel="Advertisement banner"
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        if (width) setLayoutWidth(width);
        if (height) setLayoutHeight(height);
      }}
    >
      {imageError || !currentImageSource ? (
        <View style={styles.fallbackIcon}>
          <Text style={styles.fallbackIconText}>Ad</Text>
        </View>
      ) : animationType === '3d-flip' || animationType === '3d-flip-horizontal' ? (
        <View style={styles.imageContainer}>
          <Animated.View style={[styles.imageContainer, faceAStyle]}>
            <Image
              source={currentImageSource}
              style={styles.image}
              resizeMode="cover"
              onError={() => setImageError(true)}
            />
          </Animated.View>
          <Animated.View style={[styles.imageContainer, faceBStyle]}>
            <Image
              source={nextImageSource}
              style={styles.image}
              resizeMode="cover"
              onError={() => setImageError(true)}
            />
          </Animated.View>
        </View>
      ) : (
        <Animated.View style={[styles.imageContainer, animatedStyle]}>
          <Image
            source={currentImageSource}
            style={styles.image}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        </Animated.View>
      )}
      <Text style={styles.adLabel} pointerEvents="none">
        AD
      </Text>
    </TouchableOpacity>
  );
};
