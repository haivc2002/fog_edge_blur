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
  fog_edge_blur: ^0.0.1
```

```bash
flutter pub get
```

# FogEdgeBlur Demo

<p align="center"> <table> <tr> <td align="center"> <img src="https://raw.githubusercontent.com/haivc2002/fog_edge_blur/main/demo/static_demo.png" width="300" /> <br><b>Static Image</b> </td> <td align="center"> <img src="https://raw.githubusercontent.com/haivc2002/fog_edge_blur/main/demo/demo_animation.gif" width="300" /> <br><b>Animated GIF</b> </td> </tr> </table> </p>

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