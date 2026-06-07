# Advertise Our Apps

This file contains ready-to-use ad configurations for **Inocentum Technologies** apps.
Copy the examples below into your project to promote our apps using `react-native-fallback-ads`.

---

## Apps

### 📒 CashBook — Expense Tracker

> A simple, privacy-friendly personal finance tracker for Android.

| Field | Value |
|---|---|
| **Package ID** | `in.inocentum.cashbook` |
| **Google Play** | https://play.google.com/store/apps/details?id=in.inocentum.cashbook |
| **Category** | Finance |

---

## Ad Image Sizes
>
> | Ad Format | Dimensions |
> |---|---|
> | Text Banner icon | 40 × 40 |
> | Image Banner | 320 × 50 |
> | MREC | 300 × 250 |
> | Fullscreen Portrait | 1080 × 1920 |
> | Fullscreen Landscape | 1920 × 1080 |

---

### 1. FallbackTextBannerAd

A compact `300 × 50` text-based banner with an icon, title, and subtitle.

```tsx
import { FallbackTextBannerAd } from 'react-native-fallback-ads';

<FallbackTextBannerAd
  icon={{ uri: 'https://placehold.co/40x40.png' }}
  title="CashBook – Expense Tracker"
  subtitle="Track expenses easily. Download free!"
  androidLink="https://play.google.com/store/apps/details?id=in.inocentum.cashbook"
  onPress={(url) => console.log('CashBook ad tapped:', url)}
  onError={(err) => console.warn('Ad error:', err)}
  theme="auto"
/>
```

---

### 2. FallbackImageBannerAd

A `320 × 50` image banner. Supports a single image or an array of images that cycle automatically.

#### Single image

```tsx
import { FallbackImageBannerAd } from 'react-native-fallback-ads';

<FallbackImageBannerAd
  image={{ uri: 'https://placehold.co/320x50.png' }}
  androidLink="https://play.google.com/store/apps/details?id=in.inocentum.cashbook"
  onPress={(url) => console.log('CashBook ad tapped:', url)}
  onError={(err) => console.warn('Ad error:', err)}
  theme="auto"
/>
```

#### Multiple cycling images (with 3D flip transition)

```tsx
import { FallbackImageBannerAd } from 'react-native-fallback-ads';

<FallbackImageBannerAd
  images={[
    { uri: 'https://placehold.co/320x50/4CAF50/ffffff.png?text=CashBook+Banner+1' },
    { uri: 'https://placehold.co/320x50/2196F3/ffffff.png?text=CashBook+Banner+2' },
    { uri: 'https://placehold.co/320x50/FF9800/ffffff.png?text=CashBook+Banner+3' },
  ]}
  switchInterval={5000}
  animationType="3d-flip"
  androidLink="https://play.google.com/store/apps/details?id=in.inocentum.cashbook"
  onPress={(url) => console.log('CashBook ad tapped:', url)}
  onError={(err) => console.warn('Ad error:', err)}
  theme="auto"
/>
```

---

### 3. FallbackMrecAd

A `300 × 250` medium rectangle — the standard "box" ad format.

#### Single image

```tsx
import { FallbackMrecAd } from 'react-native-fallback-ads';

<FallbackMrecAd
  image={{ uri: 'https://placehold.co/300x250.png' }}
  androidLink="https://play.google.com/store/apps/details?id=in.inocentum.cashbook"
  onPress={(url) => console.log('CashBook ad tapped:', url)}
  onError={(err) => console.warn('Ad error:', err)}
  theme="auto"
/>
```

#### Multiple cycling images (with fade transition)

```tsx
import { FallbackMrecAd } from 'react-native-fallback-ads';

<FallbackMrecAd
  images={[
    { uri: 'https://placehold.co/300x250/4CAF50/ffffff.png?text=CashBook+MREC+1' },
    { uri: 'https://placehold.co/300x250/2196F3/ffffff.png?text=CashBook+MREC+2' },
  ]}
  switchInterval={6000}
  animationType="fade"
  androidLink="https://play.google.com/store/apps/details?id=in.inocentum.cashbook"
  onPress={(url) => console.log('CashBook ad tapped:', url)}
  onError={(err) => console.warn('Ad error:', err)}
  theme="auto"
/>
```

---

### 4. FallbackFullscreenAd

A full-screen interstitial rendered in a `Modal`. Show this between app screens or on app launch.
The close button appears after the `closeDelay` countdown (default: 5 seconds).

```tsx
import { useState } from 'react';
import { FallbackFullscreenAd } from 'react-native-fallback-ads';

const [adVisible, setAdVisible] = useState(true);

<FallbackFullscreenAd
  visible={adVisible}
  portraitImage={{ uri: 'https://placehold.co/1080x1920.png' }}
  landscapeImage={{ uri: 'https://placehold.co/1920x1080.png' }}
  showCloseButton={true}
  closeDelay={5}
  androidLink="https://play.google.com/store/apps/details?id=in.inocentum.cashbook"
  onPress={(url) => console.log('CashBook ad tapped:', url)}
  onDismiss={() => setAdVisible(false)}
  onError={(err) => console.warn('Ad error:', err)}
  theme="auto"
/>
```

---

### 5. FallbackBannerAd (mixed)

A smart banner that randomly picks from an array of text and/or image ad configs.
Use this when you want to A/B test different creatives without managing state yourself.

```tsx
import { useRef } from 'react';
import { FallbackBannerAd, FallbackBannerAdRef } from 'react-native-fallback-ads';

const bannerRef = useRef<FallbackBannerAdRef>(null);

<FallbackBannerAd
  ref={bannerRef}
  theme="auto"
  data={[
    // Text variant
    {
      type: 'text',
      icon: { uri: 'https://placehold.co/40x40.png' },
      title: 'CashBook – Expense Tracker',
      subtitle: 'Track expenses easily. Download free!',
      androidLink: 'https://play.google.com/store/apps/details?id=in.inocentum.cashbook',
    },
    // Image variant 1
    {
      type: 'image',
      image: { uri: 'https://placehold.co/320x50/4CAF50/ffffff.png?text=CashBook+Banner+1' },
      androidLink: 'https://play.google.com/store/apps/details?id=in.inocentum.cashbook',
    },
    // Image variant 2
    {
      type: 'image',
      image: { uri: 'https://placehold.co/320x50/2196F3/ffffff.png?text=CashBook+Banner+2' },
      androidLink: 'https://play.google.com/store/apps/details?id=in.inocentum.cashbook',
    },
  ]}
  onError={(err) => console.warn('Ad error:', err)}
/>

// Optionally refresh to pick a new random ad:
// bannerRef.current?.refresh();
```

