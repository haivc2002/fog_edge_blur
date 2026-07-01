#version 460 core
precision mediump float;
#include <flutter/runtime_effect.glsl>
uniform vec2 uViewSize;
uniform float sigma;
uniform float topExtent;
uniform float bottomExtent;
uniform float leftExtent;
uniform float rightExtent;
uniform float isAndroid;
uniform float edgeIntensity;
uniform float kernelSize;
uniform sampler2D uTexture;
uniform sampler2D uOriginalTexture;
out vec4 FragColor;
// Optimized Gaussian weight calculation
float getGaussianWeight(int offset, float sig) {
    float x = float(offset);
    return exp(-0.5 * x * x / (sig * sig));
}
void main() {
    vec2 fragCoord = FlutterFragCoord().xy;
    vec2 uv = fragCoord / uViewSize;
    // Fix coordinate system for cross-platform compatibility
    if (isAndroid > 0.5) {
        uv.y = 1.0 - uv.y;
    }
    vec4 originalColor = texture(uOriginalTexture, uv);
    // Early return if sigma is 0 - no blur needed
    if (sigma <= 0.0) {
        FragColor = originalColor;
        return;
    }
    // Calculate edge positions
    float topEdge = topExtent * uViewSize.y;
    float bottomEdge = (1.0 - bottomExtent) * uViewSize.y;
    float leftEdge = leftExtent * uViewSize.x;
    float rightEdge = (1.0 - rightExtent) * uViewSize.x;
    // Check blur regions
    bool inTop = topExtent > 0.0 && fragCoord.y < topEdge;
    bool inBottom = bottomExtent > 0.0 && fragCoord.y > bottomEdge;
    bool inLeft = leftExtent > 0.0 && fragCoord.x < leftEdge;
    bool inRight = rightExtent > 0.0 && fragCoord.x > rightEdge;
    bool inBlurRegion = inTop || inBottom || inLeft || inRight;
    if (!inBlurRegion) {
        FragColor = originalColor;
        return;
    }

    // Compute per-pixel localSigma for variable blur radius
    float localSigma = sigma;

    if (edgeIntensity > 0.0) {
        // Find distance from content boundary into blur zone, and the zone size
        float edgeDistance = 1e6;
        float blurZoneSize = 1.0;

        if (inTop) {
            float d = topEdge - fragCoord.y;
            if (d < edgeDistance) { edgeDistance = d; blurZoneSize = topEdge; }
        }
        if (inBottom) {
            float d = fragCoord.y - bottomEdge;
            if (d < edgeDistance) { edgeDistance = d; blurZoneSize = uViewSize.y - bottomEdge; }
        }
        if (inLeft) {
            float d = leftEdge - fragCoord.x;
            if (d < edgeDistance) { edgeDistance = d; blurZoneSize = leftEdge; }
        }
        if (inRight) {
            float d = fragCoord.x - rightEdge;
            if (d < edgeDistance) { edgeDistance = d; blurZoneSize = uViewSize.x - rightEdge; }
        }

        float transitionWidth = blurZoneSize * edgeIntensity;
        if (edgeDistance < transitionWidth) {
            localSigma = sigma * smoothstep(0.0, 1.0, edgeDistance / transitionWidth);
        }
    }

    // If localSigma is negligible, output original - no blur needed
    if (localSigma < 0.1) {
        FragColor = originalColor;
        return;
    }

    // Use kernel size provided from Dart side
    float kSizeFloat = max(kernelSize, 1.0);
    int kSize = int(kSizeFloat);
    vec4 sumColor = vec4(0.0);
    float weightSum = 0.0;
    // Optimized loop bounds based on kernel size for better performance
    if (kSize <= 15) {
        // Small blur: use tight loop bounds
        for (int j = -15; j <= 15; ++j) {
            if (j < -kSize || j > kSize) continue;
            float weight = getGaussianWeight(j, localSigma);
            if (weight < 0.001) continue; // Skip negligible weights
            vec2 offset = vec2(0.0, float(j) / uViewSize.y);
            vec2 sampleUV = uv + offset;
            sampleUV = clamp(sampleUV, vec2(0.0), vec2(1.0));
            sumColor += texture(uTexture, sampleUV) * weight;
            weightSum += weight;
        }
    } else if (kSize <= 30) {
        // Medium-small blur: use medium-small loop bounds
        for (int j = -30; j <= 30; ++j) {
            if (j < -kSize || j > kSize) continue;
            float weight = getGaussianWeight(j, localSigma);
            if (weight < 0.001) continue; // Skip negligible weights
            vec2 offset = vec2(0.0, float(j) / uViewSize.y);
            vec2 sampleUV = uv + offset;
            sampleUV = clamp(sampleUV, vec2(0.0), vec2(1.0));
            sumColor += texture(uTexture, sampleUV) * weight;
            weightSum += weight;
        }
    } else if (kSize <= 50) {
        // Medium blur: use medium loop bounds
        for (int j = -50; j <= 50; ++j) {
            if (j < -kSize || j > kSize) continue;
            float weight = getGaussianWeight(j, localSigma);
            if (weight < 0.001) continue; // Skip negligible weights
            vec2 offset = vec2(0.0, float(j) / uViewSize.y);
            vec2 sampleUV = uv + offset;
            sampleUV = clamp(sampleUV, vec2(0.0), vec2(1.0));
            sumColor += texture(uTexture, sampleUV) * weight;
            weightSum += weight;
        }
    } else {
        // Large blur: use full loop bounds
        for (int j = -100; j <= 100; ++j) {
            if (j < -kSize || j > kSize) continue;
            float weight = getGaussianWeight(j, localSigma);
            if (weight < 0.001) continue; // Skip negligible weights
            vec2 offset = vec2(0.0, float(j) / uViewSize.y);
            vec2 sampleUV = uv + offset;
            sampleUV = clamp(sampleUV, vec2(0.0), vec2(1.0));
            sumColor += texture(uTexture, sampleUV) * weight;
            weightSum += weight;
        }
    }
    // Direct output - blur radius itself varies per pixel, no alpha blending
    FragColor = sumColor / weightSum;
}