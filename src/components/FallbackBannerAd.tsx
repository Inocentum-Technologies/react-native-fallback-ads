import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { ViewStyle } from 'react-native';
import { FallbackTextBannerAd, FallbackTextBannerAdProps } from './FallbackTextBannerAd';
import { FallbackImageBannerAd, FallbackImageBannerAdProps } from './FallbackImageBannerAd';

export type BannerAdTextData = Omit<FallbackTextBannerAdProps, 'style' | 'testID' | 'theme'> & { type: 'text' };
export type BannerAdImageData = Omit<FallbackImageBannerAdProps, 'style' | 'testID' | 'theme'> & { type: 'image' };

export type BannerAdItem = BannerAdTextData | BannerAdImageData;

export interface FallbackBannerAdProps {
  /**
   * Array of ad configurations (text or image ads).
   */
  data: BannerAdItem[];
  style?: ViewStyle;
  testID?: string;
  theme?: 'light' | 'dark' | 'auto';
}

export interface FallbackBannerAdRef {
  /**
   * Randomly selects a new ad from the provided data array.
   */
  refresh: () => void;
}

export const FallbackBannerAd = forwardRef<FallbackBannerAdRef, FallbackBannerAdProps>(({
  data,
  style,
  testID,
  theme = 'auto',
}, ref) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const refreshAd = () => {
    if (data && data.length > 0) {
      const randomIndex = Math.floor(Math.random() * data.length);
      setCurrentIndex(randomIndex);
    }
  };

  useImperativeHandle(ref, () => ({
    refresh: refreshAd,
  }));

  const dataLength = data?.length || 0;

  useEffect(() => {
    if (dataLength > 0) {
      refreshAd();
    }
  }, [dataLength]);

  if (!data || data.length === 0) {
    return null;
  }

  // Ensure index is within bounds in case data length changes
  const safeIndex = currentIndex >= data.length ? 0 : currentIndex;
  const currentAd = data[safeIndex];

  if (currentAd.type === 'text') {
    const { type, ...adProps } = currentAd;
    return (
      <FallbackTextBannerAd
        {...adProps}
        style={style}
        testID={testID}
        theme={theme}
      />
    );
  }

  if (currentAd.type === 'image') {
    const { type, ...adProps } = currentAd;
    return (
      <FallbackImageBannerAd
        {...adProps}
        style={style}
        testID={testID}
        theme={theme}
      />
    );
  }

  return null;
});

FallbackBannerAd.displayName = 'FallbackBannerAd';
