import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { FallbackFullscreenVideoAd, FallbackFullscreenVideoAdProps } from './FallbackFullscreenVideoAd';

export interface FallbackRewardedVideoAdProps extends Omit<FallbackFullscreenVideoAdProps, 'onVideoEnd' | 'onCountdownEnd' | 'forceWatchToEnd' | 'closeButtonAccessory'> {
  /**
   * Callback when the user earns a reward.
   */
  onReward?: () => void;
}

export const FallbackRewardedVideoAd: React.FC<FallbackRewardedVideoAdProps> = ({
  onReward,
  onDismiss,
  closeDelay,
  ...rest
}) => {
  const isExplicitCloseDelay = closeDelay !== undefined;
  const [rewardEarned, setRewardEarned] = useState(false);
  const rewardedRef = useRef(false);

  useEffect(() => {
    if (rest.visible) {
      setRewardEarned(false);
      rewardedRef.current = false;
    }
  }, [rest.visible]);

  const grantReward = () => {
    if (!rewardedRef.current) {
      rewardedRef.current = true;
      onReward?.();
    }
  };

  const handleVideoEnd = () => {
    // Once the video fully ends, the user has definitely earned the reward
    // (whether there was a close delay or not).
    grantReward();
    onDismiss?.();
  };

  const handleCountdownEnd = () => {
    // When the countdown ends, the close button will automatically appear.
    // We mark the reward as earned so they get a badge, but we do NOT auto-dismiss.
    if (isExplicitCloseDelay) {
      setRewardEarned(true);
    }
  };

  const handleDismiss = () => {
    // If they manually dismiss the ad after the countdown finished (earning the reward),
    // grant it before dismissing.
    if (rewardEarned) {
      grantReward();
    }
    onDismiss?.();
  };

  const badge = rewardEarned ? (
    <View style={styles.rewardBadge}>
      <Text style={styles.rewardBadgeText}>Rewarded</Text>
    </View>
  ) : undefined;

  return (
    <FallbackFullscreenVideoAd
      {...rest}
      closeDelay={closeDelay}
      onDismiss={handleDismiss}
      forceWatchToEnd={!isExplicitCloseDelay}
      onVideoEnd={handleVideoEnd}
      onCountdownEnd={handleCountdownEnd}
      closeButtonAccessory={badge}
    />
  );
};

const styles = StyleSheet.create({
  rewardBadge: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  rewardBadgeText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});
