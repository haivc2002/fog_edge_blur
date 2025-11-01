import 'package:flutter/services.dart';

class FogEdgeBlurCheck {
  static const _channel = MethodChannel('fog_edge_blur');

  static Future<bool> isImpellerEnabled() async {
    try {
      final bool result = await _channel.invokeMethod('isImpellerEnabled');
      return result;
    } catch (e) {
      print('Error checking EnableImpeller: $e');
      return false;
    }
  }
}
