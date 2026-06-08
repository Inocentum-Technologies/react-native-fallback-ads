# react-native-fallback-ads

> Lightweight, JS-only fallback ad components for React Native & Expo — no native modules, no native linking required.

[![npm version](https://img.shields.io/npm/v/react-native-fallback-ads.svg)](https://www.npmjs.com/package/react-native-fallback-ads)
[![license](https://img.shields.io/npm/l/react-native-fallback-ads.svg)](LICENSE)
[![peer: react-native ≥ 0.83](https://img.shields.io/badge/react--native-%E2%89%A50.83-blue)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-ready-blue?logo=typescript)](https://www.typescriptlang.org)

When your primary ad SDK fails to load — network errors, no fill, SDK initialisation issues, ad blockers — `react-native-fallback-ads` lets you drop in a polished, self-contained ad unit in seconds. All components are written in pure JavaScript/TypeScript with zero native dependencies.

---

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Components](#components)
  - [FallbackBannerAd](#fallbackbannerad)
  - [FallbackTextBannerAd](#fallbacktextbannerad)
  - [FallbackImageBannerAd](#fallbackimagebannerad)
  - [FallbackMrecAd](#fallbackmrecad)
  - [FallbackFullscreenAd](#fallbackfullscreenad)
- [Utilities](#utilities)
  - [resolveLink](#resolvelink)
- [Link Resolution](#link-resolution)
- [Theme Support](#theme-support)
- [TypeScript](#typescript)
- [Requirements](#requirements)
- [Support Us](#support-us)
- [Advertise Our Apps](SUPPORT.md)

---

## Features

- ✅ **Zero native code** — pure JS/TS, works with Expo Go and managed workflow
- 🎨 **Light / dark / auto theme** support on every component
- 🔁 **Multi-image cycling** with smooth animations (`flip`, `3d-flip`, `fade`, `none`)
- 📱 **Platform-aware links** — set separate Android & iOS deep-links, or a single common URL
- 🖼 **Fullscreen interstitial** with configurable close-button delay and countdown badge
- ♿ **Accessible** — every component ships with proper `accessibilityRole` and `accessibilityLabel`
- 🔧 **Fully typed** — complete TypeScript definitions included

---

## Installation

```bash
npm install react-native-fallback-ads
# or
yarn add react-native-fallback-ads
```

No `pod install`, no `expo prebuild`, no `npx react-native link` needed.

---

## Components

### FallbackBannerAd

A smart banner that accepts an array of mixed text/image ad configs and randomly selects one to display. Exposes a `ref` with a `refresh()` method to pick a new random ad on demand.

```tsx
import { useRef } from 'react';
import { FallbackBannerAd, FallbackBannerAdRef } from 'react-native-fallback-ads';

const bannerRef = useRef<FallbackBannerAdRef>(null);

<FallbackBannerAd
  ref={bannerRef}
  theme="auto"
  data={[
    {
      type: 'text',
      icon: require('./assets/app-icon.png'),
      title: 'My Awesome App',
      subtitle: 'Download it free today',
      link: 'https://example.com/app',
    },
    {
      type: 'image',
      image: require('./assets/banner.png'),
      link: 'https://example.com/promo',
    },
  ]}
/>

// Refresh the displayed ad at any time:
bannerRef.current?.refresh();
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `BannerAdItem[]` | **required** | Array of text or image ad configs |
| `style` | `ViewStyle` | — | Override container styles |
| `theme` | `'light' \| 'dark' \| 'auto'` | `'auto'` | Color scheme |
| `testID` | `string` | — | Test identifier |

#### Ref methods

| Method | Description |
|--------|-------------|
| `refresh()` | Randomly selects a new ad from `data` |

---

### FallbackTextBannerAd

A compact `300 × 50` banner with an icon, title, and subtitle row. Best used as a house-ad or cross-promotion unit.

```tsx
import { FallbackTextBannerAd } from 'react-native-fallback-ads';

<FallbackTextBannerAd
  icon={require('./assets/icon.png')}
  title="Try Our Pro Plan"
  subtitle="Unlock all features — starting at $2.99"
  link="https://example.com/pro"
  onPress={(url) => console.log('Opened:', url)}
  onError={(err) => console.warn('Ad error:', err)}
  theme="auto"
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `ImageSourcePropType` | **required** | App icon or logo displayed on the left |
| `title` | `string` | **required** | Primary text (bold) |
| `subtitle` | `string` | **required** | Secondary text |
| `link` | `string` | — | The destination link to open when the ad is tapped |
| `onPress` | `(url: string) => void` | — | Called after the link is successfully opened |
| `onError` | `(err: AdError) => void` | — | Called when the link cannot be resolved or opened |
| `style` | `ViewStyle` | — | Override container styles |
| `theme` | `'light' \| 'dark' \| 'auto'` | `'auto'` | Color scheme |
| `testID` | `string` | — | Test identifier |

---

### FallbackImageBannerAd

A `320 × 50` image banner that supports a single image or an array of images that cycle automatically with smooth animations.

```tsx
import { FallbackImageBannerAd } from 'react-native-fallback-ads';

// Single image
<FallbackImageBannerAd
  image={require('./assets/banner.png')}
  link="https://example.com"
  theme="auto"
/>

// Cycling images with 3D flip transition
<FallbackImageBannerAd
  images={[
    require('./assets/banner1.png'),
    require('./assets/banner2.png'),
    require('./assets/banner3.png'),
  ]}
  switchInterval={4000}
  animationType="3d-flip"
  link="https://example.com"
  onPress={(url) => console.log('Tapped:', url)}
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `image` | `ImageSourcePropType` | — | Single image to display |
| `images` | `ImageSourcePropType[]` | — | Array of images to cycle (overrides `image`) |
| `switchInterval` | `number` | `5000` | Milliseconds between image switches |
| `animationType` | `'flip' \| '3d-flip' \| 'fade' \| 'none'` | `'flip'` | Transition animation |
| `link` | `string` | — | The destination link to open when the ad is tapped |
| `onPress` | `(url: string) => void` | — | Called after the link is successfully opened |
| `onError` | `(err: AdError) => void` | — | Called on link or image errors |
| `style` | `ViewStyle` | — | Override container styles |
| `theme` | `'light' \| 'dark' \| 'auto'` | `'auto'` | Color scheme |
| `testID` | `string` | — | Test identifier |

---

### FallbackMrecAd

A `300 × 250` medium rectangle (MREC) image ad — the industry-standard "box" format. Supports all the same cycling and animation options as `FallbackImageBannerAd`, plus a horizontal 3D flip variant.

```tsx
import { FallbackMrecAd } from 'react-native-fallback-ads';

<FallbackMrecAd
  images={[
    require('./assets/mrec1.png'),
    require('./assets/mrec2.png'),
  ]}
  switchInterval={6000}
  animationType="3d-flip-horizontal"
  link={
    Platform.select({
      android: 'market://details?id=com.example.app',
      ios: 'https://apps.apple.com/app/id123456789',
      default: 'https://example.com',
    })
  }
  onPress={(url) => console.log('Opened:', url)}
  theme="dark"
/>
```

#### Props

Same as `FallbackImageBannerAd`, with one additional `animationType` option:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `animationType` | `'flip' \| '3d-flip' \| '3d-flip-horizontal' \| 'fade' \| 'none'` | `'flip'` | Transition animation (adds horizontal 3D flip) |

All other props are identical to [`FallbackImageBannerAd`](#fallbackimagebannerad).

---

### FallbackFullscreenAd

A full-screen interstitial ad rendered inside a React Native `Modal`. Supports portrait and landscape images, an optional close button with a configurable countdown delay, and orientation-aware image switching.

```tsx
import { useState } from 'react';
import { FallbackFullscreenAd } from 'react-native-fallback-ads';

const [adVisible, setAdVisible] = useState(false);

<FallbackFullscreenAd
  visible={adVisible}
  portraitImage={require('./assets/interstitial-portrait.png')}
  landscapeImage={require('./assets/interstitial-landscape.png')}
  showCloseButton={true}
  closeDelay={5}
  link="https://example.com/promo"
  onPress={(url) => console.log('Ad tapped:', url)}
  onDismiss={() => setAdVisible(false)}
  onError={(err) => console.warn('Ad error:', err)}
  theme="auto"
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `portraitImage` | `ImageSourcePropType` | **required** | Image shown in portrait orientation |
| `landscapeImage` | `ImageSourcePropType` | — | Image shown in landscape; falls back to `portraitImage` |
| `visible` | `boolean` | `true` | Controls modal visibility |
| `onDismiss` | `() => void` | — | Called when the close button is pressed or back button is tapped (Android) |
| `showCloseButton` | `boolean` | `true` | Whether to show the close button |
| `closeDelay` | `number` | `5` | Seconds before the close button becomes tappable; a countdown badge is shown during this period |
| `link` | `string` | — | The destination link to open when the ad is tapped |
| `onPress` | `(url: string) => void` | — | Called after the link is successfully opened |
| `onError` | `(err: AdError) => void` | — | Called on link or image errors |
| `theme` | `'light' \| 'dark' \| 'auto'` | `'auto'` | Color scheme |
| `testID` | `string` | — | Test identifier |

---

## Utilities

### resolveLink

A standalone helper that picks the right URL for the current platform. Useful if you want to open the link manually.

```ts
import { resolveLink } from 'react-native-fallback-ads';

const url = resolveLink(
  'market://details?id=com.example.app', // androidLink
  'https://apps.apple.com/app/id123',    // iosLink
  'https://example.com',                  // commonLink (fallback)
);

// Returns:
//   Android → 'market://details?id=com.example.app'
//   iOS     → 'https://apps.apple.com/app/id123'
//   Other   → 'https://example.com'
//   No match → null
```

---

## Link Resolution

You can use React Native's `Platform.select` directly in the `link` prop to provide platform-specific URLs, or you can use our included `resolveLink` helper manually if needed.

---

## Error Handling

All ad components accept an `onError` callback that receives one of the following error objects:

```ts
type AdError =
  | { type: 'NO_LINK';    message?: string }  // No link provided for this platform
  | { type: 'LINK_FAILED'; message?: string } // Linking.openURL failed
  | { type: 'NO_IMAGE';   message?: string }  // Image failed to load
```

---

## Theme Support

All components accept a `theme` prop:

| Value | Behaviour |
|-------|-----------|
| `'auto'` *(default)* | Follows the device's system color scheme via `useColorScheme()` |
| `'light'` | Forces light theme |
| `'dark'` | Forces dark theme |

---

## TypeScript

All props interfaces and utility types are exported from the package root:

```ts
import type {
  // Component props
  FallbackBannerAdProps,
  FallbackBannerAdRef,
  FallbackTextBannerAdProps,
  FallbackImageBannerAdProps,
  FallbackMrecAdProps,
  FallbackFullscreenAdProps,

  // Data types
  BannerAdItem,
  BannerAdTextData,
  BannerAdImageData,
} from 'react-native-fallback-ads';
```

---

## Requirements

| Dependency | Minimum version |
|------------|----------------|
| `react` | `>= 19.2.0` |
| `react-native` | `>= 0.83.0` |

Works with **Expo SDK 52+** (managed & bare workflow) and plain **React Native CLI** projects.

---

## Support Us

This library is free and open-source. If it saves you time, please consider supporting the developers by checking out our app:

### 📒 CashBook — Expense Tracker

> A simple, privacy-friendly personal finance tracker for Android.

[![Get it on Google Play](https://img.shields.io/badge/Google%20Play-CashBook-green?logo=google-play&logoColor=white)](https://play.google.com/store/apps/details?id=in.inocentum.cashbook)

You can show your support in three easy ways:

1. **⭐ Download & leave a 5-star review** — it helps the app reach more people and keeps us motivated to maintain this library.

2. **💎 Purchase the Premium Add-on** — unlock extra features inside CashBook and directly fund continued development of open-source tools like this one.

3. **📢 Display one of our ads in your app** — a free, zero-effort way to give back. Ready-to-use code examples for every ad format are in **[SUPPORT.md](SUPPORT.md)**.

👉 [Open CashBook on Google Play](https://play.google.com/store/apps/details?id=in.inocentum.cashbook)

Thank you — every download and review genuinely makes a difference! 🙏

---

## License

MIT © [Inocentum Technologies](https://github.com/Inocentum-Technologies)
