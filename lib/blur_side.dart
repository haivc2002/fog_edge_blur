
import 'blur_side_base.dart';

// blur_side.dart
import 'blur_side_base.dart';

class BlurSides extends BlurSidesBase {
  const BlurSides({
    super.top,
    super.bottom,
    super.left,
    super.right,
  });

  factory BlurSides.vertical({double top = 0.0, double bottom = 0.0}) =>
      BlurSides(top: top, bottom: bottom);

// You can add more factory constructors if needed, like horizontal, all, etc.
}

class ResponsiveBlurSides extends BlurSidesBase {
  const ResponsiveBlurSides({
    super.top,
    super.bottom,
    super.left,
    super.right,
  });
}