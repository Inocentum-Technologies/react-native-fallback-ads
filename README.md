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
    - [FallbackFullscreenImageAd](#fallbackfullscreenimagead)
    - [FallbackFullscreenVideoAd](#fallbackfullscreenvideoad)
    - [FallbackRewardedVideoAd](#fallbackrewardedvideoad)
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
- 🖼 **Fullscreen interstitial** with configurable close-button delay and countdown badge
- 🎁 **Rewarded video ad** support with custom watch-to-end or close-delay modes
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
| `mode` | `'manual' \| 'auto'` | `'manual'` | Refresh mode. If `'auto'`, the ad will automatically refresh every `refreshInterval` ms |
| `refreshInterval` | `number` | `5000` | Refresh interval in milliseconds (applicable when `mode` is `'auto'`) |
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

A unified, full-screen interstitial ad component rendered inside a React Native `Modal`. Under the hood, it automatically delegates to either `FallbackFullscreenImageAd` or `FallbackFullscreenVideoAd` based on whether video props (`portraitVideo` or `landscapeVideo`) are provided.

```tsx
import { useState } from 'react';
import { FallbackFullscreenAd } from 'react-native-fallback-ads';

const [adVisible, setAdVisible] = useState(false);

// Automatically renders FallbackFullscreenImageAd
<FallbackFullscreenAd
  visible={adVisible}
  portraitImage={require('./assets/interstitial-portrait.png')}
  landscapeImage={require('./assets/interstitial-landscape.png')}
  showCloseButton={true}
  closeDelay={5}
  link="https://example.com/promo"
  onDismiss={() => setAdVisible(false)}
/>

// Automatically renders FallbackFullscreenVideoAd
<FallbackFullscreenAd
  visible={adVisible}
  portraitVideo={require('./assets/video-portrait.mp4')}
  landscapeVideo={require('./assets/video-landscape.mp4')}
  showCloseButton={true}
  closeDelay={5}
  link="https://example.com/promo"
  onDismiss={() => setAdVisible(false)}
/>
```

#### Props

Since `FallbackFullscreenAd` serves as a wrapper, it accepts all props for both image and video fullscreen ads:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `visible` | `boolean` | `true` | Controls modal visibility |
| `portraitImage` | `ImageSourcePropType` | — | Portrait image source. (Used for Image Ads) |
| `landscapeImage` | `ImageSourcePropType` | — | Landscape image source. Falls back to `portraitImage`. (Used for Image Ads) |
| `portraitVideo` | `any` | — | Portrait video source (require or URI object). (Used for Video Ads) |
| `landscapeVideo` | `any` | — | Landscape video source. Falls back to `portraitVideo`. (Used for Video Ads) |
| `onDismiss` | `() => void` | — | Called when the close button is pressed or ad is dismissed |
| `link` | `string` | — | Destination URL when the ad is tapped |
| `onPress` | `(resolvedUrl: string) => void` | — | Callback after the link is successfully opened |
| `onError` | `(err: AdError) => void` | — | Callback on link, image, or video loading/playback errors |
| `showCloseButton` | `boolean` | `true` | Show/hide the close button |
| `closeDelay` | `number` | `5` | Countdown in seconds before close button is active |
| `theme` | `'light' \| 'dark' \| 'auto'` | `'auto'` | Theme scheme |
| `testID` | `string` | — | Test identifier |

---

### FallbackFullscreenImageAd

Specifically renders a fullscreen image ad.

```tsx
import { FallbackFullscreenImageAd } from 'react-native-fallback-ads';

<FallbackFullscreenImageAd
  visible={visible}
  portraitImage={require('./assets/portrait.png')}
  landscapeImage={require('./assets/landscape.png')}
  onDismiss={() => setVisible(false)}
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `visible` | `boolean` | `true` | Controls modal visibility |
| `portraitImage` | `ImageSourcePropType` | — | Portrait image source |
| `landscapeImage` | `ImageSourcePropType` | — | Landscape image source. Falls back to `portraitImage` |
| `onDismiss` | `() => void` | — | Called when the close button is pressed |
| `link` | `string` | — | Destination URL when the ad is tapped |
| `onPress` | `(resolvedUrl: string) => void` | — | Callback after the link is successfully opened |
| `onError` | `(err: { type: 'NO_LINK' \| 'LINK_FAILED' \| 'NO_IMAGE'; message?: string }) => void` | — | Callback on link or image load errors |
| `showCloseButton` | `boolean` | `true` | Show/hide the close button |
| `closeDelay` | `number` | `5` | Countdown in seconds before close button is active |
| `theme` | `'light' \| 'dark' \| 'auto'` | `'auto'` | Theme scheme |
| `testID` | `string` | — | Test identifier |

---

### FallbackFullscreenVideoAd

Specifically renders a fullscreen video ad.

#### Supported Video Players
To keep this library lightweight and avoid native linking conflicts, video players are not bundled directly. Instead, `FallbackFullscreenVideoAd` dynamically detects and supports the following player libraries if they are installed in the host project:
- **`react-native-video`**
- **`expo-video`**

> [!IMPORTANT]
> You must install either `react-native-video` or `expo-video` to use the fullscreen video ad component.

#### Steps to Use the Fullscreen Video Component:
1. **Install a supported video library**:
   Choose and install one of the supported video players in your host project:
   - **React Native CLI (or bare Expo)**:
     ```bash
     npm install react-native-video
     # or
     yarn add react-native-video
     ```
     *Note: Ensure the library is properly linked. For modern React Native versions, this is done automatically. If you're on an older version, run `pod install` inside the `ios` directory.*
   - **Expo Managed Workflow**:
     ```bash
     npx expo install expo-video
     ```
2. **Import the component**:
   ```tsx
   import { FallbackFullscreenVideoAd } from 'react-native-fallback-ads';
   ```
3. **Provide Video Sources**:
   Pass local requires (e.g., `require('./assets/ad.mp4')`) or remote source objects (e.g., `{ uri: 'https://example.com/ad.mp4' }`) to `portraitVideo` and `landscapeVideo` props.
4. **Orientation Lock Behavior**:
   To prevent visual glitches and layout shifts, the component locks its orientation to whichever mode (portrait or landscape) the device is in when the video begins playing. Rotating the phone during playback scales the video but does not switch the active source or reset playback progress.

```tsx
import { FallbackFullscreenVideoAd } from 'react-native-fallback-ads';

<FallbackFullscreenVideoAd
  visible={visible}
  portraitVideo={require('./assets/video-portrait.mp4')}
  landscapeVideo={require('./assets/video-landscape.mp4')}
  onDismiss={() => setVisible(false)}
  closeDelay={5}
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `visible` | `boolean` | `true` | Controls modal visibility |
| `portraitVideo` | `any` | — | Portrait video source (require or URI object) |
| `landscapeVideo` | `any` | — | Landscape video source. Falls back to `portraitVideo` |
| `onDismiss` | `() => void` | — | Called when the close button is pressed |
| `link` | `string` | — | Destination URL when the ad is tapped |
| `onPress` | `(resolvedUrl: string) => void` | — | Callback after the link is successfully opened |
| `onError` | `(err: { type: 'NO_LINK' \| 'LINK_FAILED' \| 'NO_VIDEO'; message?: string }) => void` | — | Callback on link or video loading/playback errors |
| `showCloseButton` | `boolean` | `true` | Show/hide the close button |
| `closeDelay` | `number` | `5` | Countdown in seconds before close button is active |
| `theme` | `'light' \| 'dark' \| 'auto'` | `'auto'` | Theme scheme |
| `forceWatchToEnd` | `boolean` | `false` | If true, countdown doesn't run and the close button is hidden until the video ends or parent dismisses the ad |
| `onVideoEnd` | `() => void` | — | Callback when the video finishes playing |
| `onCountdownEnd` | `() => void` | — | Callback when the close delay countdown reaches 0 |
| `closeButtonAccessory` | `React.ReactNode` | — | Optional React node to render next to the close button (e.g. badges) |
| `testID` | `string` | — | Test identifier |

---

### FallbackRewardedVideoAd

A specialized wrapper around `FallbackFullscreenVideoAd` tailored for rewarded ad placements. It provides reward hooks and supports two modes of interaction.

#### Rewarded Behavior and Modes:
- **Watch to End Mode (Default - no `closeDelay` provided)**:
  The user must watch the video until completion to earn the reward. The close button is hidden during playback, and once the video finishes, `onReward` is triggered and the ad automatically closes.
- **Countdown Mode (with `closeDelay` provided, e.g. `closeDelay={15}`)**:
  A countdown is shown. When the countdown completes, a green "Rewarded" badge appears next to the close button, indicating they can now close the ad to claim their reward. The ad remains open until the user taps the close button, at which point the `onReward` callback is triggered.

```tsx
import { FallbackRewardedVideoAd } from 'react-native-fallback-ads';

<FallbackRewardedVideoAd
  visible={visible}
  portraitVideo={require('./assets/rewarded-portrait.mp4')}
  onReward={() => console.log('User rewarded!')}
  onDismiss={() => setVisible(false)}
/>
```

#### Props

Inherits all props from `FallbackFullscreenVideoAdProps` except `onVideoEnd`, `onCountdownEnd`, `forceWatchToEnd`, and `closeButtonAccessory`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onReward` | `() => void` | — | Callback triggered when the reward condition is met |
| `onDismiss` | `() => void` | — | Callback when the ad is closed (either automatically after completion or manually after countdown) |
| `closeDelay` | `number` | — | If provided, allows closing after this many seconds to get reward. If omitted, forces watching to completion |

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
  | { type: 'NO_VIDEO';   message?: string }  // Video failed to load
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
  FallbackFullscreenImageAdProps,
  FallbackFullscreenVideoAdProps,
  FallbackRewardedVideoAdProps,

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

You can show your support in two easy ways:

1. **⭐ Try our app & share your feedback** — we invite you to try our new app. If you like it, please consider leaving a review or providing us feedback directly from the app. It helps the app reach more people and keeps us motivated to maintain this library.

2. **💎 Purchase the Premium Add-on** — unlock extra features inside CashBook and directly fund continued development of open-source tools like this one.

👉 [Open CashBook on Google Play](https://play.google.com/store/apps/details?id=in.inocentum.cashbook)

Thank you — every download and review genuinely makes a difference! 🙏

---

## License

MIT © [Inocentum Technologies](https://github.com/Inocentum-Technologies)
