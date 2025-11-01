import 'package:flutter/material.dart';

/// {@template fog_edge_child}
/// A configuration model that defines the content and visual edge
/// properties used by [FogEdgeBlur] or similar widgets.
///
/// `FogEdgeChild` allows you to specify:
///
/// * **[heightEdge]** – The vertical height (in logical pixels) of the fog/blur edge.
///   This defines how tall the blurred edge area will appear.
///
/// * **[child]** – The widget content displayed above the fog edge.
///   You can pass any widget, such as a text, image, or layout structure.
///
/// * **[colorEdge]** – The color tint applied to the fog edge area.
///   Set this to transparent for a natural blur effect, or use a
///   subtle color overlay to match your design theme.
///
/// Example usage:
/// ```dart
/// FogEdgeChild(
///   heightEdge: 160,
///   colorEdge: Colors.white,
///   child: Center(
///     child: Text(
///       'Hello FogEdge!',
///       style: TextStyle(color: Colors.white, fontSize: 20),
///     ),
///   ),
/// )
/// ```
///
/// This class is typically used as a parameter inside a parent widget
/// such as [FogEdgeBlur] or [FogEdgeContainer].
/// {@endtemplate}
class FogEdgeChild {
  /// The vertical height (in logical pixels) of the fog/blur edge.
  final double heightEdge;

  /// The widget content displayed above the fog/blur edge.
  final Widget? child;

  /// The color tint applied to the fog/blur edge area.
  /// Use [Colors.transparent] for no tint.
  final Color colorEdge;

  /// Creates a configuration for a fog edge content area.
  ///
  /// [heightEdge] defines the height of the blurred area,
  /// [child] is displayed above it, and [colorEdge] adds an optional color overlay.
  const FogEdgeChild({
    required this.heightEdge,
    this.child,
    this.colorEdge = Colors.transparent,
  });
}
