import { useMemo, useRef, useEffect } from 'react';
import { Animated } from 'react-native';

export type AdAnimationType = 'flip' | '3d-flip' | '3d-flip-horizontal' | 'fade' | 'none';

export interface UseAdAnimationOptions {
  animationType: AdAnimationType;
  hasMultipleImages: boolean;
  imageCount: number;
  switchInterval: number;
  layoutWidth?: number;
  layoutHeight?: number;
  onNextIndex: () => void;
}

export interface UseAdAnimationResult {
  animValue: Animated.Value;
  animatedStyle: object;
  faceAStyle: object;
  faceBStyle: object;
}

/**
 * Shared animation hook for fallback ad components.
 *
 * Handles the interval-driven image switching and computes the animated styles
 * for all supported animation types:
 *  - `none`   — instant switch, no animation
 *  - `fade`   — cross-fade between images
 *  - `flip`   — 2D rotateX (vertical) page-flip
 *  - `3d-flip`            — 3D vertical flip (rotateX)
 *  - `3d-flip-horizontal` — 3D horizontal flip (rotateY)
 */
export function useAdAnimation({
  animationType,
  hasMultipleImages,
  imageCount,
  switchInterval,
  layoutWidth = 300,
  layoutHeight = 250,
  onNextIndex,
}: UseAdAnimationOptions): UseAdAnimationResult {
  const animValue = useRef(new Animated.Value(0)).current;

  // Stable ref so the interval closure always sees the latest callback without
  // being re-registered every time the parent re-renders.
  const onNextIndexRef = useRef(onNextIndex);
  useEffect(() => {
    onNextIndexRef.current = onNextIndex;
  }, [onNextIndex]);

  useEffect(() => {
    if (!hasMultipleImages) return;

    const interval = setInterval(() => {
      const nextIndex = () => onNextIndexRef.current();
      const resetAnim = () => animValue.setValue(0);

      switch (animationType) {
        case 'none':
          nextIndex();
          break;
        case 'fade':
          Animated.timing(animValue, { toValue: 1, duration: 300, useNativeDriver: true }).start(
            ({ finished }) => {
              if (finished) {
                nextIndex();
                Animated.timing(animValue, {
                  toValue: 0,
                  duration: 300,
                  useNativeDriver: true,
                }).start();
              }
            },
          );
          break;
        case 'flip':
          Animated.timing(animValue, { toValue: 0.5, duration: 300, useNativeDriver: true }).start(
            ({ finished }) => {
              if (finished) {
                nextIndex();
                Animated.timing(animValue, {
                  toValue: 1,
                  duration: 300,
                  useNativeDriver: true,
                }).start(() => resetAnim());
              }
            },
          );
          break;
        case '3d-flip':
        case '3d-flip-horizontal':
          Animated.timing(animValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }).start(({ finished }) => {
            if (finished) {
              nextIndex();
              resetAnim();
            }
          });
          break;
      }
    }, switchInterval);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMultipleImages, imageCount, switchInterval, animationType, animValue]);

  // ─── Simple animated style (fade / flip) ────────────────────────────────────
  const animatedStyle = useMemo(() => {
    if (
      !hasMultipleImages ||
      animationType === 'none' ||
      animationType === '3d-flip' ||
      animationType === '3d-flip-horizontal'
    ) {
      return {};
    }

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

  // ─── 3D flip face styles ─────────────────────────────────────────────────────
  const { faceAStyle, faceBStyle } = useMemo(() => {
    if (animationType !== '3d-flip' && animationType !== '3d-flip-horizontal') {
      return { faceAStyle: {}, faceBStyle: {} };
    }

    const d = 1000; // perspective distance
    const isHorizontal = animationType === '3d-flip-horizontal';
    const translationVal = (isHorizontal ? layoutWidth / 2 : layoutHeight / 2) - 0.5;

    // Synthesise translateZ using rotation pairs to avoid Android matrix animation
    // invariant violations.
    const translateZNegative = isHorizontal
      ? [
          { rotateY: '90deg' },
          { translateX: translationVal },
          { rotateY: '-90deg' },
        ]
      : [
          { rotateX: '-90deg' },
          { translateY: translationVal },
          { rotateX: '90deg' },
        ];

    const translateZPositive = isHorizontal
      ? [
          { rotateY: '90deg' },
          { translateX: -translationVal },
          { rotateY: '-90deg' },
        ]
      : [
          { rotateX: '-90deg' },
          { translateY: -translationVal },
          { rotateX: '90deg' },
        ];

    const rotateKey = isHorizontal ? 'rotateY' : 'rotateX';

    return {
      faceAStyle: {
        position: 'absolute' as const,
        backfaceVisibility: 'hidden' as const,
        transform: [
          { perspective: d },
          ...translateZNegative,
          {
            [rotateKey]: animValue.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', isHorizontal ? '-90deg' : '-90deg'],
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
            [rotateKey]: animValue.interpolate({
              inputRange: [0, 1],
              outputRange: [isHorizontal ? '90deg' : '90deg', '0deg'],
            }),
          },
          ...translateZPositive,
        ],
      },
    };
  }, [animationType, animValue, layoutWidth, layoutHeight]);

  return { animValue, animatedStyle, faceAStyle, faceBStyle };
}
