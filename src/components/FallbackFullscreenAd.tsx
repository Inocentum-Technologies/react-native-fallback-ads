import React from 'react';
import { ImageSourcePropType } from 'react-native';
import { FallbackFullscreenImageAd } from './FallbackFullscreenImageAd';
import { FallbackFullscreenVideoAd } from './FallbackFullscreenVideoAd';

export interface FallbackFullscreenAdProps {
  /**
   * The portrait image to display when the device is in portrait orientation.
   * Supports PNG, JPEG, WEBP, and GIF formats.
   * Required unless portraitVideo is provided.
   */
  portraitImage?: ImageSourcePropType;
  /**
   * The landscape image to display when the device is in landscape orientation.
   * Falls back to `portraitImage` if not provided.
   */
  landscapeImage?: ImageSourcePropType;
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
  onError?: (error: { type: 'NO_LINK' | 'LINK_FAILED' | 'NO_IMAGE' | 'NO_VIDEO'; message?: string }) => void;
  /**
   * Whether to show the close button. Default is true.
   */
  showCloseButton?: boolean;
  /**
   * Number of seconds to wait before showing the close button (Default is 5).
   */
  closeDelay?: number;
  testID?: string;
  theme?: 'light' | 'dark' | 'auto';
}

export const FallbackFullscreenAd: React.FC<FallbackFullscreenAdProps> = (props) => {
  const isVideo = !!(props.portraitVideo || props.landscapeVideo);

  if (isVideo) {
    return (
      <FallbackFullscreenVideoAd
        portraitVideo={props.portraitVideo}
        landscapeVideo={props.landscapeVideo}
        visible={props.visible}
        onDismiss={props.onDismiss}
        link={props.link}
        onPress={props.onPress}
        onError={props.onError}
        showCloseButton={props.showCloseButton}
        closeDelay={props.closeDelay}
        testID={props.testID}
        theme={props.theme}
      />
    );
  }

  return (
    <FallbackFullscreenImageAd
      portraitImage={props.portraitImage}
      landscapeImage={props.landscapeImage}
      visible={props.visible}
      onDismiss={props.onDismiss}
      link={props.link}
      onPress={props.onPress}
      onError={props.onError}
      showCloseButton={props.showCloseButton}
      closeDelay={props.closeDelay}
      testID={props.testID}
      theme={props.theme}
    />
  );
};
