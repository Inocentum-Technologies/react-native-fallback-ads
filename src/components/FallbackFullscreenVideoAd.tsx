import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Linking,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  useWindowDimensions,
  View,
  UIManager,
} from 'react-native';

// Load video player dynamically to support optional peer dependencies
let videoLibrary: 'react-native-video' | 'expo-video' | null = null;
let NativeVideo: any = null;
let ExpoVideoView: any = null;
let useExpoVideoPlayer: any = null;

const isRCTVideoLinked = () => {
  if (UIManager.getViewManagerConfig) {
    return UIManager.getViewManagerConfig('RCTVideo') != null;
  }
  return (UIManager as any).RCTVideo != null;
};

try {
  const rnVideo = require('react-native-video');
  if (rnVideo && isRCTVideoLinked()) {
    NativeVideo = rnVideo.default || rnVideo;
    videoLibrary = 'react-native-video';
  } else {
    throw new Error('react-native-video not linked');
  }
} catch (e) {
  try {
    const expoVideo = require('expo-video');
    ExpoVideoView = expoVideo.VideoView;
    useExpoVideoPlayer = expoVideo.useVideoPlayer;
    if (ExpoVideoView && useExpoVideoPlayer) {
      videoLibrary = 'expo-video';
    } else {
      throw new Error('expo-video invalid exports');
    }
  } catch (err) {
    // No video library installed
  }
}

// Wrapper component for expo-video since it requires using hooks
const ExpoVideoWrapper = ({ source, visible, onEnd, onError, onProgress, style }: any) => {
  const player = useExpoVideoPlayer(source, (p: any) => {
    p.loop = false;
    p.timeUpdateEventInterval = 0.25; // Emit time update 4 times a second
  });

  useEffect(() => {
    if (visible) {
      player.play();
    } else {
      player.pause();
    }
  }, [visible, player]);

  useEffect(() => {
    const playToEndSub = player.addListener('playToEnd', () => {
      onEnd?.();
    });
    const statusSub = player.addListener('statusChange', (event: any) => {
      if (event.status === 'error') {
        onError?.(event.error);
      }
    });
    const timeUpdateSub = player.addListener('timeUpdate', (event: any) => {
      const duration = player.duration ?? 0;
      if (duration > 0) {
        onProgress?.(event.currentTime / duration);
      }
    });
    return () => {
      playToEndSub.remove();
      statusSub.remove();
      timeUpdateSub.remove();
    };
  }, [player, onEnd, onError, onProgress]);

  return <ExpoVideoView player={player} style={style} nativeControls={false} contentFit="cover" />;
};

export interface FallbackFullscreenVideoAdProps {
  /**
   * The portrait video source to play.
   * Can be a local asset (require) or remote URL/URI object.
   */
  portraitVideo?: any;
  /**
   * The landscape video source to play.
   * Falls back to `portraitVideo` if not provided.
   */
  landscapeVideo?: any;
  /**
   * Whether the ad is visible.
   */
  visible?: boolean;
  /**
   * Callback when the ad is dismissed (close button pressed or background tapped).
   */
  onDismiss?: () => void;
  link?: string;
  onPress?: (resolvedUrl: string) => void;
  onError?: (error: { type: 'NO_LINK' | 'LINK_FAILED' | 'NO_VIDEO'; message?: string }) => void;
  /**
   * Whether to show the close button. Default is true.
   */
  showCloseButton?: boolean;
  /**
   * Number of seconds to wait before showing the close button (for normal ads, defaults to 5)
   * or watching before auto-dismissal and reward (for rewarded ads).
   */
  closeDelay?: number;
  testID?: string;
  theme?: 'light' | 'dark' | 'auto';
  /**
   * If true, countdown doesn't run and the close button is hidden until parent dismisses the ad.
   */
  forceWatchToEnd?: boolean;
  /**
   * Callback when the video finishes playing.
   */
  onVideoEnd?: () => void;
  /**
   * Callback when the close delay countdown reaches 0.
   */
  onCountdownEnd?: () => void;
  /**
   * Optional React node to render next to the close button (e.g., a badge).
   */
  closeButtonAccessory?: React.ReactNode;
}

export const FallbackFullscreenVideoAd: React.FC<FallbackFullscreenVideoAdProps> = ({
  portraitVideo,
  landscapeVideo,
  visible = true,
  onDismiss,
  link,
  onPress,
  onError,
  showCloseButton = true,
  closeDelay,
  testID,
  theme = 'auto',
  forceWatchToEnd = false,
  onVideoEnd,
  onCountdownEnd,
  closeButtonAccessory,
}) => {
  const systemColorScheme = useColorScheme();
  const { width, height } = useWindowDimensions();

  const onCountdownEndRef = useRef(onCountdownEnd);
  const onVideoEndRef = useRef(onVideoEnd);
  const onDismissRef = useRef(onDismiss);

  useEffect(() => {
    onCountdownEndRef.current = onCountdownEnd;
    onVideoEndRef.current = onVideoEnd;
    onDismissRef.current = onDismiss;
  }, [onCountdownEnd, onVideoEnd, onDismiss]);

  const isExplicitCloseDelay = closeDelay !== undefined;
  const effectiveCloseDelay = isExplicitCloseDelay ? closeDelay : 5;

  const [countdown, setCountdown] = useState(effectiveCloseDelay);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [videoProgress, setVideoProgress] = useState(0);

  // Lock phone orientation for video playback:
  // We determine whether the device is in portrait or landscape orientation at the moment 
  // the video ad starts playing (becomes visible), and we keep this orientation locked 
  // so that rotating the phone afterwards does not change the video source.
  const [videoOrientation, setVideoOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const wasVisible = useRef(false);

  useEffect(() => {
    if (visible && !wasVisible.current) {
      setVideoOrientation(width > height ? 'landscape' : 'portrait');
    }
    wasVisible.current = visible;
  }, [visible, width, height]);

  useEffect(() => {
    if (!visible) {
      // Reset countdown for next open
      setCountdown(effectiveCloseDelay);
      return;
    }

    if (showCloseButton && !forceWatchToEnd && effectiveCloseDelay > 0) {
      // DO NOT reset countdown here (it is already initialized or reset on close).
      // If we reset it here, parent re-renders that change dependencies will restart the countdown!
      countdownRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownRef.current!);
            onCountdownEndRef.current?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, [visible, showCloseButton, forceWatchToEnd, effectiveCloseDelay]);

  const activeTheme = theme === 'auto' ? (systemColorScheme || 'light') : theme;

  // Choose the locked orientation video source, fallback to portraitVideo
  const videoSource = videoOrientation === 'landscape' && landscapeVideo
    ? landscapeVideo
    : portraitVideo;

  const handleVideoEnd = () => {
    onVideoEndRef.current?.();
  };

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
      video: {
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
      topRightControls: {
        position: 'absolute',
        top: 48,
        right: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        zIndex: 10,
      },
      closeButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
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
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0,0,0,0.55)',
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.35)',
        justifyContent: 'center',
        alignItems: 'center',
      },
      countdownText: {
        fontSize: 13,
        lineHeight: 15,
        color: '#ffffff',
        fontWeight: '700',
      },
      progressBarContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.3)',
      },
      progressBarFill: {
        height: '100%',
        backgroundColor: '#ffffff', // Clean white progress bar
      },
    });
  }, [activeTheme]);

  const handlePress = async () => {
    if (!link) {
      onError?.({ type: 'NO_LINK', message: 'No valid link provided.' });
      return;
    }

    try {
      const canOpen = await Linking.canOpenURL(link);
      if (canOpen) {
        await Linking.openURL(link);
        onPress?.(link);
      } else {
        onError?.({ type: 'LINK_FAILED', message: `Cannot open URL: ${link}` });
      }
    } catch (err) {
      onError?.({
        type: 'LINK_FAILED',
        message: err instanceof Error ? err.message : 'Unknown linking error',
      });
    }
  };

  const renderVideo = () => {
    // Optional: avoid rendering native video completely if no valid source exists
    if (!videoSource) {
      return (
        <View style={styles.fallbackIcon}>
          <Text style={styles.fallbackIconText}>No Video Source</Text>
        </View>
      );
    }

    if (videoLibrary === 'react-native-video' && NativeVideo) {
      // Do not render react-native-video when the modal is hidden. 
      // Rendering it inside a hidden Modal on Android often causes Surface attachment crashes!
      if (!visible) return null;
      
      return (
        <NativeVideo
          source={videoSource}
          style={styles.video}
          resizeMode="cover"
          paused={false}
          onEnd={handleVideoEnd}
          onProgress={(data: any) => {
            if (data.seekableDuration > 0) {
              setVideoProgress(data.currentTime / data.seekableDuration);
            }
          }}
          onError={(err: any) => {
            onError?.({ type: 'NO_VIDEO', message: err?.error?.errorString || 'Video error' });
          }}
        />
      );
    }

    if (videoLibrary === 'expo-video' && ExpoVideoView) {
      return (
        <ExpoVideoWrapper
          source={videoSource}
          visible={visible}
          style={styles.video}
          onEnd={handleVideoEnd}
          onProgress={(progress: number) => setVideoProgress(progress)}
          onError={(err: any) => {
            onError?.({ type: 'NO_VIDEO', message: err?.message || 'Video error' });
          }}
        />
      );
    }


    return (
      <View style={styles.fallbackIcon}>
        <Text style={styles.fallbackIconText}>Video Player Not Installed</Text>
      </View>
    );
  };

  const showCountdown = showCloseButton && !forceWatchToEnd && countdown > 0;

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
      {/* Fullscreen touchable — tapping anywhere on the video opens the link */}
      <TouchableOpacity
        style={styles.overlay}
        onPress={handlePress}
        activeOpacity={1}
        accessibilityRole="link"
        accessibilityLabel="Advertisement"
      >
        <View style={styles.imageWrapper}>
          {renderVideo()}
          <Text style={styles.adLabel} pointerEvents="none">
            AD
          </Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarFill, { width: `${Math.min(100, Math.max(0, videoProgress * 100))}%` }]} />
          </View>
        </View>
      </TouchableOpacity>

      {/* Close / countdown badge — floats above the video, does not trigger the link */}
      {showCloseButton && (
        <View style={styles.topRightControls}>
          {showCountdown ? (
            <View
              style={styles.countdownBadge}
              accessibilityLabel={`Ad closes in ${countdown} seconds`}
            >
              <Text style={styles.countdownText}>{countdown}</Text>
            </View>
          ) : (
            !forceWatchToEnd && countdown === 0 && (
              <>
                {closeButtonAccessory}
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => onDismissRef.current?.()}
                  accessibilityRole="button"
                  accessibilityLabel="Close advertisement"
                  hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </>
            )
          )}
        </View>
      )}
    </Modal>
  );
};
