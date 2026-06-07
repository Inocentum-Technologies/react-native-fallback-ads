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

export interface FallbackImageBannerAdProps {
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
  animationType?: 'flip' | '3d-flip' | 'fade' | 'none';
  androidLink?: string;
  iosLink?: string;
  commonLink?: string;
  onPress?: (resolvedUrl: string) => void;
  onError?: (error: { type: 'NO_LINK' | 'LINK_FAILED' | 'NO_IMAGE'; message?: string }) => void;
  style?: ViewStyle;
  testID?: string;
  theme?: 'light' | 'dark' | 'auto';
}

export const FallbackImageBannerAd: React.FC<FallbackImageBannerAdProps> = ({
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
  const [layoutHeight, setLayoutHeight] = useState(50);

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
    if (!hasMultipleImages || animationType === 'none' || animationType === '3d-flip') return {};

    switch (animationType) {
      case 'fade':
        return {
          opacity: animValue.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
        };
      case 'flip':
        return {
          transform: [
            {
              rotateX: animValue.interpolate({
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
    if (animationType !== '3d-flip') return { faceAStyle: {}, faceBStyle: {} };

    const translateYVal = layoutHeight / 2;
    const d = 400; // perspective distance

    const getScale = (thetaDeg: number, isFaceA: boolean) => {
      const theta = (thetaDeg * Math.PI) / 180;
      const sinT = Math.sin(theta);
      const cosT = Math.cos(theta);

      const zCorner = -translateYVal + translateYVal * sinT + translateYVal * cosT;
      const sCorner = d / (d - zCorner);

      const zLocalActual = isFaceA ? translateYVal * sinT : translateYVal * cosT;
      const sActual = d / (d - zLocalActual);

      const boxScale = thetaDeg === 45 ? 0.8 : (thetaDeg === 30 || thetaDeg === 60 ? 0.866 : 1.0);

      return boxScale * (sCorner / sActual);
    };

    const inputRange = [0, 0.333, 0.5, 0.667, 1];

    return {
      faceAStyle: {
        position: 'absolute' as const,
        backfaceVisibility: 'hidden' as const,
        transform: [
          { perspective: d },
          {
            scale: animValue.interpolate({
              inputRange,
              outputRange: [0, 30, 45, 60, 90].map((deg) => getScale(deg, true)),
            }),
          },
          {
            translateY: animValue.interpolate({
              inputRange,
              outputRange: [0, -0.5, -0.7071, -0.866, -1].map((val) => val * translateYVal),
            }),
          },
          {
            rotateX: animValue.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', '90deg'],
            }),
          },
        ],
      },
      faceBStyle: {
        position: 'absolute' as const,
        backfaceVisibility: 'hidden' as const,
        transform: [
          { perspective: d },
          {
            scale: animValue.interpolate({
              inputRange,
              outputRange: [0, 30, 45, 60, 90].map((deg) => getScale(deg, false)),
            }),
          },
          {
            translateY: animValue.interpolate({
              inputRange,
              outputRange: [1, 0.866, 0.7071, 0.5, 0].map((val) => val * translateYVal),
            }),
          },
          {
            rotateX: animValue.interpolate({
              inputRange: [0, 1],
              outputRange: ['-90deg', '0deg'],
            }),
          },
        ],
      },
    };
  }, [animationType, animValue, layoutHeight]);

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={handlePress}
      activeOpacity={0.8}
      testID={testID}
      accessibilityRole="link"
      accessibilityLabel="Advertisement banner"
      onLayout={(event) => {
        const { height } = event.nativeEvent.layout;
        if (height) {
          setLayoutHeight(height);
        }
      }}
    >
      {imageError || !currentImageSource ? (
        <View style={styles.fallbackIcon}>
          <Text style={styles.fallbackIconText}>Ad</Text>
        </View>
      ) : animationType === '3d-flip' ? (
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
