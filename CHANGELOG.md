## 0.0.2
- Initial release of the FogEdgeBlur plugin.
- Added fog edge blur for customizable top - bottom - right - left overlays.

## 0.0.3
- Fix the scroll touch area on the blurry region.
- Limiting Sigma values to ensure UI quality.

## 0.0.5
- Improve edge blur transition logic to scale proportionally to the blur region size.
- Fix streaking/stretching artifacts at the blur boundary when `edgeIntensity` is set to 0.0.

## 0.0.6
- **New Feature**: Introduce `BlurVersion` enum to support dual rendering pipelines (`original` and `advanced`).
- **Original Mode** (Default): Uses a highly optimized hardware-accelerated gradient mix for ultra-smooth 120fps performance without banding artifacts.
- **Advanced Mode**: Implements true dynamic-radius variable blur. Includes Minimum Sigma Clamping, Sub-threshold Soft Blending, and AAA-grade Interleaved Gradient Noise (IGN) dithering to eliminate pixelation and banding.

## 0.0.7
- Fix broken demo images in README.md.

## 0.0.12
- **New Feature**: Added support for Swift Package Manager (SPM). This prepares the plugin for Flutter 3.44+ where SPM becomes the default for iOS and macOS.