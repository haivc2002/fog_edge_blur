/// Base class for blur side definitions that can be extended by different blur types
class BlurSidesBase {
  /// The blur intensity for the top region (0.0 to 1.0).
  final double top;

  /// The blur intensity for the bottom region (0.0 to 1.0).
  final double bottom;

  /// The blur intensity for the left region (0.0 to 1.0).
  final double left;

  /// The blur intensity for the right region (0.0 to 1.0).
  final double right;

  const BlurSidesBase({
    this.top = 0.0,
    this.bottom = 0.0,
    this.left = 0.0,
    this.right = 0.0,
  });
}