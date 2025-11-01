import 'dart:ui' as ui;
import 'package:flutter/material.dart';
import 'package:flutter_shaders/flutter_shaders.dart';
import 'package:fog_edge_blur/fog_edge_blur_meta_check.dart';

import 'blur_side.dart';
import 'blur_side_base.dart';
import 'fog_edge_child.dart';

/// Defines which side of the widget the blur or fog effect is applied to.
enum EdgeAlign { top, bottom, right, left }
/// Controls blur rendering precision and GPU cost.
enum BlurQuality { low, medium, high }

/// {@template fog_edge_blur}
/// A customizable widget that applies a soft, shader-based fog or blur
/// effect along one edge of its child content.
///
/// `FogEdgeBlur` combines a [child] (the main content)
/// with an optional [FogEdgeChild] that decorates the blurred edge area.
///
/// This allows you to build advanced UI effects such as:
/// * Fading top/bottom overlays
/// * Scrollable content with soft fog edges
/// * Glassmorphism transitions
///
/// ---
///
/// Example:
/// ```dart
/// FogEdgeBlur(
///   edgeAlign: EdgeAlign.bottom,
///   fogEdgeChild: FogEdgeChild(
///     heightBlur: 160,
///     colorEdge: Colors.white.withOpacity(0.15),
///     child: Center(
///       child: Icon(Icons.keyboard_arrow_up_rounded, color: Colors.white),
///     ),
///   ),
///   child: Image.asset('assets/mountain.jpg', fit: BoxFit.cover),
/// )
/// ```
///
/// {@endtemplate}
class FogEdgeBlur extends StatelessWidget {
  /// The main content to be displayed behind the fog edge.
  final Widget child;

  /// The sigma (strength) of the blur effect.
  final double sigma;

  /// Defines which edge (top, bottom, left, or right) gets the fog effect.
  final EdgeAlign edgeAlign;

  /// Controls rendering quality and kernel size.
  final BlurQuality quality;

  /// Intensity of the blur-to-clear gradient.
  final double edgeIntensity;

  /// Optional overlay content displayed *above* the blurred edge.
  ///
  /// This can contain small decorations, icons, or gradients
  /// that appear within the fog region.
  final FogEdgeChild fogEdgeChild;

  const FogEdgeBlur({
    super.key,
    required this.child,
    required this.edgeAlign,
    this.sigma = 10.0,
    this.quality = BlurQuality.high,
    this.edgeIntensity = 0.08,
    required this.fogEdgeChild,
  });

  /// Preloads shader programs for horizontal and vertical passes.
  static Future<void> precacheShaders() async {
    await Future.wait([
      ShaderBuilder.precacheShader('packages/fog_edge_blur/shaders/blur_horizontal.frag'),
      ShaderBuilder.precacheShader('packages/fog_edge_blur/shaders/blur_vertical.frag'),
    ]);
  }

  @override
  Widget build(BuildContext context) {

    final blurSides = ResponsiveBlurSides(
      top: edgeAlign == EdgeAlign.top ? fogEdgeChild.heightEdge : 0.0,
      bottom: edgeAlign == EdgeAlign.bottom ? fogEdgeChild.heightEdge : 0.0,
      left: edgeAlign == EdgeAlign.left ? fogEdgeChild.heightEdge : 0.0,
      right: edgeAlign == EdgeAlign.right ? fogEdgeChild.heightEdge : 0.0,
    );

    Widget blurEffect = ShaderBuilder((context, horizontalShader, _) {
      return ShaderBuilder((context, verticalShader, _) {
        return AnimatedSampler((image, size, canvas) {
          ui.Picture? horizontalPicture;
          ui.Image? horizontalImage;
          try {
            final normalizedBlurSides = _calculateNormalizedBlurSides(blurSides, size);
            horizontalPicture = _createHorizontalPass(
              horizontalShader,
              image,
              size,
              normalizedBlurSides,
            );
            horizontalImage = horizontalPicture.toImageSync(
              size.width.toInt(),
              size.height.toInt(),
            );

            verticalShader
              ..setFloat(0, size.width)
              ..setFloat(1, size.height)
              ..setFloat(2, _getAdjustedSigma())
              ..setFloat(3, normalizedBlurSides.top)
              ..setFloat(4, normalizedBlurSides.bottom)
              ..setFloat(5, normalizedBlurSides.left)
              ..setFloat(6, normalizedBlurSides.right)
              ..setFloat(7, 0.0)
              ..setFloat(8, edgeIntensity)
              ..setFloat(9, _getAdjustedKernelSize());

            verticalShader.setImageSampler(0, horizontalImage);
            verticalShader.setImageSampler(1, image);

            final paint = Paint()
              ..shader = verticalShader
              ..blendMode = BlendMode.srcOver;

            canvas.drawRect(Rect.fromLTWH(0, 0, size.width, size.height), paint);
          } catch (_) {
            canvas.drawImage(image, Offset.zero, Paint());
          } finally {
            horizontalImage?.dispose();
            horizontalPicture?.dispose();
          }
        }, child: child);
      }, assetKey: 'packages/fog_edge_blur/shaders/blur_vertical.frag');
    }, assetKey: 'packages/fog_edge_blur/shaders/blur_horizontal.frag');

    // If a FogEdgeChild is provided, stack it above the blur region
    return FutureBuilder<bool>(
      future: FogEdgeBlurCheck.isImpellerEnabled(),
      builder: (context, snapshot) {

        if(snapshot.data == true) {
          throw FlutterError(
              'Please make sure to add the following meta-data inside the <application> tag of your AndroidManifest.xml to disable Impeller:\n\n'
                  '    <meta-data\n'
                  '        android:name="io.flutter.embedding.android.EnableImpeller"\n'
                  '        android:value="false" />\n\n'
                  'This is required for the FogEdgeBlur plugin to work correctly.'
          );
        }

        return LayoutBuilder(
          builder: (context, constraints) {

            bool isInvalidHeight = (edgeAlign == EdgeAlign.top || edgeAlign == EdgeAlign.bottom)
                && fogEdgeChild.heightEdge >= constraints.maxHeight;

            bool isInvalidWidth = (edgeAlign == EdgeAlign.left || edgeAlign == EdgeAlign.right)
                && fogEdgeChild.heightEdge >= constraints.maxWidth;

            if (isInvalidHeight || isInvalidWidth) {
              throw FlutterError(
                  'FogEdgeBlur: The heightEdge of fogEdgeChild is too large for the widget.\n'
                      'For top/bottom edges, heightEdge must be smaller than the widget height.\n'
                      'For left/right edges, heightEdge must be smaller than the widget width.\n'
                      'Please adjust heightEdge for a proper fog effect.'
              );
            }

            return Stack(
              children: [
                blurEffect,
                _buildFogEdgeOverlay(context),
              ],
            );
          }
        );
      }
    );
  }

  Widget _buildFogEdgeOverlay(BuildContext context) {
    final alignment = switch (edgeAlign) {
      EdgeAlign.top => Alignment.topCenter,
      EdgeAlign.bottom => Alignment.bottomCenter,
      EdgeAlign.left => Alignment.centerLeft,
      EdgeAlign.right => Alignment.centerRight,
    };

    final AlignmentGeometry alignmentYColor = switch (edgeAlign) {
      EdgeAlign.top => AlignmentGeometry.topCenter,
      EdgeAlign.bottom => AlignmentGeometry.bottomCenter,
      EdgeAlign.right => AlignmentGeometry.centerRight,
      EdgeAlign.left => AlignmentGeometry.centerLeft,
    };

    final AlignmentGeometry alignmentXColor = switch (edgeAlign) {
      EdgeAlign.top => AlignmentGeometry.bottomCenter,
      EdgeAlign.bottom => AlignmentGeometry.topCenter,
      EdgeAlign.right => AlignmentGeometry.centerLeft,
      EdgeAlign.left => AlignmentGeometry.centerRight,
    };

    return Align(
      alignment: alignment,
      child: SizedBox(
        height: edgeAlign == EdgeAlign.top || edgeAlign == EdgeAlign.bottom
            ? fogEdgeChild.heightEdge
            : double.infinity,
        width: edgeAlign == EdgeAlign.left || edgeAlign == EdgeAlign.right
            ? fogEdgeChild.heightEdge
            : double.infinity,
        child: DecoratedBox(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [fogEdgeChild.colorEdge, fogEdgeChild.colorEdge.withValues(alpha: 0)],
              begin: alignmentYColor,
              end: alignmentXColor
            )
          ),
          child: fogEdgeChild.child,
        ),
      ),
    );
  }

  ui.Picture _createHorizontalPass(
      ui.FragmentShader shader, ui.Image image, Size size, BlurSidesBase sides) {
    final recorder = ui.PictureRecorder();
    final canvas = Canvas(recorder);
    shader
      ..setFloat(0, size.width)
      ..setFloat(1, size.height)
      ..setFloat(2, _getAdjustedSigma())
      ..setFloat(3, sides.top)
      ..setFloat(4, sides.bottom)
      ..setFloat(5, sides.left)
      ..setFloat(6, sides.right)
      ..setFloat(7, 0.0)
      ..setFloat(8, _getAdjustedKernelSize());
    shader.setImageSampler(0, image);
    canvas.drawRect(Rect.fromLTWH(0, 0, size.width, size.height), Paint()..shader = shader);
    return recorder.endRecording();
  }

  double _getAdjustedSigma() {
    switch (quality) {
      case BlurQuality.low:
        return sigma > 10 ? sigma * 0.8 : sigma * 0.5;
      case BlurQuality.medium:
        return sigma > 10 ? sigma * 0.9 : sigma * 0.75;
      case BlurQuality.high:
        return sigma;
    }
  }

  double _getAdjustedKernelSize() {
    final baseKernel = (3.0 * _getAdjustedSigma());
    switch (quality) {
      case BlurQuality.low:
        return (baseKernel * 0.6).clamp(5.0, 50.0);
      case BlurQuality.medium:
        return (baseKernel * 0.8).clamp(7.0, 75.0);
      case BlurQuality.high:
        return baseKernel.clamp(9.0, 100.0);
    }
  }

  BlurSidesBase _calculateNormalizedBlurSides(BlurSidesBase sides, Size size) {
    if (sides is ResponsiveBlurSides) {
      return BlurSidesBase(
        top: sides.top / size.height,
        bottom: sides.bottom / size.height,
        left: sides.left / size.width,
        right: sides.right / size.width,
      );
    }
    return sides;
  }
}
