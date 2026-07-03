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
uniform float blurVersion;
uniform float kernelSize;
uniform sampler2D uTexture;
out vec4 FragColor;

float getGaussianWeight(int offset, float sig) {
    float x = float(offset);
    return exp(-0.5 * x * x / (sig * sig));
}

float smootherstep(float edge0, float edge1, float x) {
    float t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
    return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

void main() {
    vec2 fragCoord = FlutterFragCoord().xy;
    vec2 uv = fragCoord / uViewSize;
    if (isAndroid > 0.5) {
        uv.y = 1.0 - uv.y;
    }
    vec4 color = texture(uTexture, uv);
    if (sigma <= 0.0) {
        FragColor = color;
        return;
    }
    float topEdge = topExtent * uViewSize.y;
    float bottomEdge = (1.0 - bottomExtent) * uViewSize.y;
    float leftEdge = leftExtent * uViewSize.x;
    float rightEdge = (1.0 - rightExtent) * uViewSize.x;
    float kSizeFloat = max(kernelSize, 1.0);
    int kSize = int(kSizeFloat);
    bool inTop = topExtent > 0.0 && fragCoord.y < (topEdge + kSizeFloat);
    bool inBottom = bottomExtent > 0.0 && fragCoord.y > (bottomEdge - kSizeFloat);
    bool inLeft = leftExtent > 0.0 && fragCoord.x < leftEdge;
    bool inRight = rightExtent > 0.0 && fragCoord.x > rightEdge;
    bool inBlurRegion = inTop || inBottom || inLeft || inRight;
    if (!inBlurRegion) {
        FragColor = color;
        return;
    }

    float effectiveSigma = sigma;
    float subThresholdBlend = 1.0;

    if (blurVersion > 0.5) {
        bool realTop = topExtent > 0.0 && fragCoord.y < topEdge;
        bool realBottom = bottomExtent > 0.0 && fragCoord.y > bottomEdge;
        bool realLeft = inLeft;
        bool realRight = inRight;
        bool inRealBlur = realTop || realBottom || realLeft || realRight;

        if (!inRealBlur) {
            effectiveSigma = sigma;
            subThresholdBlend = 1.0;
        } else {
            float edgeDistance = 1e6;
            if (realTop) edgeDistance = min(edgeDistance, topEdge - fragCoord.y);
            if (realBottom) edgeDistance = min(edgeDistance, fragCoord.y - bottomEdge);
            if (realLeft) edgeDistance = min(edgeDistance, leftEdge - fragCoord.x);
            if (realRight) edgeDistance = min(edgeDistance, fragCoord.x - rightEdge);

            float blurZoneSize = 1.0;
            if (realTop) blurZoneSize = topEdge;
            else if (realBottom) blurZoneSize = uViewSize.y - bottomEdge;
            else if (realLeft) blurZoneSize = leftEdge;
            else if (realRight) blurZoneSize = uViewSize.x - rightEdge;

            float transitionWidth = blurZoneSize * edgeIntensity;
            float blendFactor = 1.0;
            if (transitionWidth > 0.0) {
                blendFactor = smootherstep(0.0, 1.0, edgeDistance / transitionWidth);
            }

            const float MIN_SIGMA = 3.0;
            float targetSigma = sigma * blendFactor;

            if (targetSigma <= 0.01) {
                FragColor = color;
                return;
            }

            effectiveSigma = max(targetSigma, MIN_SIGMA);
            subThresholdBlend = clamp(targetSigma / MIN_SIGMA, 0.0, 1.0);
            subThresholdBlend = smootherstep(0.0, 1.0, subThresholdBlend);
        }
    }

    vec4 sumColor = vec4(0.0);
    float weightSum = 0.0;

    if (kSize <= 15) {
        for (int i = -15; i <= 15; ++i) {
            if (i < -kSize || i > kSize) continue;
            float weight = getGaussianWeight(i, effectiveSigma);
            if (weight < 0.001) continue;
            vec2 offset = vec2(float(i) / uViewSize.x, 0.0);
            vec2 sampleUV = clamp(uv + offset, vec2(0.0), vec2(1.0));
            sumColor += texture(uTexture, sampleUV) * weight;
            weightSum += weight;
        }
    } else if (kSize <= 30) {
        for (int i = -30; i <= 30; ++i) {
            if (i < -kSize || i > kSize) continue;
            float weight = getGaussianWeight(i, effectiveSigma);
            if (weight < 0.001) continue;
            vec2 offset = vec2(float(i) / uViewSize.x, 0.0);
            vec2 sampleUV = clamp(uv + offset, vec2(0.0), vec2(1.0));
            sumColor += texture(uTexture, sampleUV) * weight;
            weightSum += weight;
        }
    } else if (kSize <= 50) {
        for (int i = -50; i <= 50; ++i) {
            if (i < -kSize || i > kSize) continue;
            float weight = getGaussianWeight(i, effectiveSigma);
            if (weight < 0.001) continue;
            vec2 offset = vec2(float(i) / uViewSize.x, 0.0);
            vec2 sampleUV = clamp(uv + offset, vec2(0.0), vec2(1.0));
            sumColor += texture(uTexture, sampleUV) * weight;
            weightSum += weight;
        }
    } else {
        for (int i = -100; i <= 100; ++i) {
            if (i < -kSize || i > kSize) continue;
            float weight = getGaussianWeight(i, effectiveSigma);
            if (weight < 0.001) continue;
            vec2 offset = vec2(float(i) / uViewSize.x, 0.0);
            vec2 sampleUV = clamp(uv + offset, vec2(0.0), vec2(1.0));
            sumColor += texture(uTexture, sampleUV) * weight;
            weightSum += weight;
        }
    }

    vec4 blurredColor = sumColor / weightSum;

    if (blurVersion > 0.5) {
        FragColor = mix(color, blurredColor, subThresholdBlend);
    } else {
        FragColor = blurredColor;
    }
}