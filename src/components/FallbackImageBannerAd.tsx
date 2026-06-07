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
      if (animationType === 'none') {
        setCurrentIndex((prev) => (prev + 1) % displayImages.length);
      } else if (animationType === 'fade') {
        Animated.sequence([
          Animated.timing(animValue, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(({ finished }) => {
          if (finished) {
            setCurrentIndex((prev) => (prev + 1) % displayImages.length);
            Animated.timing(animValue, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }).start();
          }
        });
      } else if (animationType === 'flip') {
        Animated.sequence([
          Animated.timing(animValue, {
            toValue: 0.5,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(({ finished }) => {
          if (finished) {
            setCurrentIndex((prev) => (prev + 1) % displayImages.length);
            Animated.timing(animValue, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }).start(() => {
              // Reset back to 0 without animation so we can flip again
              animValue.setValue(0);
            });
          }
        });
      } else if (animationType === '3d-flip') {
        Animated.timing(animValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }).start(({ finished }) => {
          if (finished) {
            setCurrentIndex((prev) => (prev + 1) % displayImages.length);
            animValue.setValue(0);
          }
        });
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

  const currentImageSource = displayImages[currentIndex];
  const nextImageSource = displayImages[(currentIndex + 1) % displayImages.length];

  const animatedStyle = useMemo(() => {
    if (!hasMultipleImages || animationType === 'none' || animationType === '3d-flip') return {};

    if (animationType === 'fade') {
      return {
        opacity: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 0],
        }),
      };
    }

    if (animationType === 'flip') {
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
    }

    return {};
  }, [hasMultipleImages, animationType, animValue]);

  const faceAStyle = useMemo(() => {
    if (animationType !== '3d-flip') return {};
    const translateYVal = layoutHeight / 2;
    const d = 400; // perspective distance

    // Helper to compute scale at angle theta (in degrees)
    const getScale = (thetaDeg: number, isFaceA: boolean) => {
      const theta = (thetaDeg * Math.PI) / 180;
      const sinT = Math.sin(theta);
      const cosT = Math.cos(theta);

      // Box center is at Z = -translateYVal.
      // Corner is offset from box center by translateYVal * sinT in Z and translateYVal * cosT in Z.
      const zCorner = -translateYVal + translateYVal * sinT + translateYVal * cosT;
      const sCorner = d / (d - zCorner);

      // In React Native, the view is projected relative to its local center.
      // The local Z coordinate of the edge is translateYVal * sinT for Face A, and translateYVal * cosT for Face B.
      const zLocalActual = isFaceA ? translateYVal * sinT : translateYVal * cosT;
      const sActual = d / (d - zLocalActual);

      // Base box scale (shrinks to 0.8 at 45 deg)
      let boxScale = 1.0;
      if (thetaDeg === 30 || thetaDeg === 60) boxScale = 0.866;
      else if (thetaDeg === 45) boxScale = 0.8;

      return boxScale * (sCorner / sActual);
    };

    return {
      position: 'absolute' as const,
      backfaceVisibility: 'hidden' as const,
      transform: [
        { perspective: d },
        {
          scale: animValue.interpolate({
            inputRange: [0, 0.333, 0.5, 0.667, 1],
            outputRange: [
              getScale(0, true),
              getScale(30, true),
              getScale(45, true),
              getScale(60, true),
              getScale(90, true),
            ],
          }),
        },
        {
          translateY: animValue.interpolate({
            inputRange: [0, 0.333, 0.5, 0.667, 1],
            outputRange: [
              0,
              -0.5 * translateYVal,
              -0.7071 * translateYVal,
              -0.866 * translateYVal,
              -translateYVal,
            ],
          }),
        },
        {
          rotateX: animValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '90deg'],
          }),
        },
      ],
    };
  }, [animationType, animValue, layoutHeight]);

  const faceBStyle = useMemo(() => {
    if (animationType !== '3d-flip') return {};
    const translateYVal = layoutHeight / 2;
    const d = 400; // perspective distance

    // Helper to compute scale at angle theta (in degrees)
    const getScale = (thetaDeg: number, isFaceA: boolean) => {
      const theta = (thetaDeg * Math.PI) / 180;
      const sinT = Math.sin(theta);
      const cosT = Math.cos(theta);

      const zCorner = -translateYVal + translateYVal * sinT + translateYVal * cosT;
      const sCorner = d / (d - zCorner);

      const zLocalActual = isFaceA ? translateYVal * sinT : translateYVal * cosT;
      const sActual = d / (d - zLocalActual);

      let boxScale = 1.0;
      if (thetaDeg === 30 || thetaDeg === 60) boxScale = 0.866;
      else if (thetaDeg === 45) boxScale = 0.8;

      return boxScale * (sCorner / sActual);
    };

    return {
      position: 'absolute' as const,
      backfaceVisibility: 'hidden' as const,
      transform: [
        { perspective: d },
        {
          scale: animValue.interpolate({
            inputRange: [0, 0.333, 0.5, 0.667, 1],
            outputRange: [
              getScale(0, false),
              getScale(30, false),
              getScale(45, false),
              getScale(60, false),
              getScale(90, false),
            ],
          }),
        },
        {
          translateY: animValue.interpolate({
            inputRange: [0, 0.333, 0.5, 0.667, 1],
            outputRange: [
              translateYVal,
              0.866 * translateYVal,
              0.7071 * translateYVal,
              0.5 * translateYVal,
              0,
            ],
          }),
        },
        {
          rotateX: animValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['-90deg', '0deg'],
          }),
        },
      ],
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
