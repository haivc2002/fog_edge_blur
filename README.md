# FogEdgeBlur

FogEdgeBlur is a Flutter plugin that adds a customizable fog edge blur effect on top of your widgets, perfect for creating immersive UI headers, overlays, or artistic effects.

---

## Features

- Apply fog edge blur to the top, bottom, or custom edges of your widget.
- Customize the height, color, and opacity of the fog edge.
- Works seamlessly with `ListView`, `ScrollView`, or any child widget.
- Easy to integrate into your Flutter project.

---

## Installation

Add the plugin to your `pubspec.yaml`:

```yaml
dependencies:
  fog_edge_blur: ^x.x.x
```

```bash
flutter pub get
```

# FogEdgeBlur Demo

<p align="center"> <img src="https://raw.githubusercontent.com/haivc2002/fog_edge_blur/main/demo/static_demo.png" width="300" /> <br><b>Static Image</b> </p>

## 🚀 Rendering Algorithms: `original` vs `advanced`

FogEdgeBlur is powered by custom fragment shaders that run directly on the GPU. We provide two distinct rendering pipelines to suit your specific architectural needs.

### `BlurVersion.original` (Default & Recommended)
A highly optimized 2-pass separable Gaussian blur. Instead of calculating complex variable sigmas per fragment, it utilizes a hardware-accelerated gradient mix approach (`smoothstep`). This guarantees mathematically perfect isotropic blurring, completely eliminating banding or box-blur artifacts. It runs effortlessly at 120fps even on mid-range devices.

### `BlurVersion.advanced` (True Variable-Sigma Blur)
A mathematically accurate dynamic-radius blur. Rather than blending opacities, this pipeline dynamically scales the Gaussian `sigma` value per-pixel based on its spatial distance from the origin edge. 

To mitigate the inherent non-separable artifacts of a 2-pass variable blur, the `advanced` mode implements:
1. **Minimum Sigma Clamping**: Prevents Gaussian kernel spikes at near-zero values.
2. **Sub-threshold Soft Blending**: Ensures a buttery-smooth fade at the extreme outer edges of the transition zone.
3. **Interleaved Gradient Noise (IGN)**: Injects AAA-game-grade microscopic dithering to break up banding and pixelation, resulting in a natural, film-like grain.

---

## 🎛️ Understanding `edgeIntensity`

The `edgeIntensity` parameter dictates the spatial footprint of the blur transition. It acts as a normalized multiplier (from `0.0` to `1.0`) relative to the total bounding box of the fog edge.

For instance, if your `heightEdge` is `100px`:
- `edgeIntensity: 0.2` means the blur mathematically scales from 0 to its maximum over the first `20px`. The remaining `80px` will be fully blurred.
- `edgeIntensity: 1.0` stretches the gradient transition across the entire `100px` area.

**Visualizing the difference:**

<p align="center">
  <img src="https://raw.githubusercontent.com/haivc2002/fog_edge_blur/main/demo/demo_with_edgeIntensity_0.2.png" width="400" />
  <br><b>edgeIntensity: 0.2</b>
</p>

To fully appreciate the architectural difference between the `original` and `advanced` pipelines, we can set `edgeIntensity: 1.0`, forcing the variable sigma calculation to stretch across the entire item height:

<p align="center">
  <img src="https://raw.githubusercontent.com/haivc2002/fog_edge_blur/main/demo/demo_with_edgeIntensity_1.0.png" width="400" />
  <br><b>edgeIntensity: 1.0</b>
</p>

## Android Setup
Important: To ensure the plugin works correctly, you must disable Impeller in your Android project.
Add the following <meta-data> inside the <application> tag of your AndroidManifest.xml

```xml
<meta-data
    android:name="io.flutter.embedding.android.EnableImpeller"
    android:value="false" />
```

# Usage Example
```dart
FogEdgeBlur(
  edgeAlign: EdgeAlign.top,
  fogEdgeChild: FogEdgeChild(
    heightEdge: 160,
  ),
  child: ListView.builder(
    itemCount: 20,
    itemBuilder: (context, index) {
      return Center(
        child: Container(
          color: Colors.red,
          height: 100,
          width: 100,
          margin: EdgeInsets.only(bottom: 20),
        ),
      );
    },
  ),
)
```