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
uniform sampler2D uOriginalTexture;
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
    vec4 originalColor = texture(uOriginalTexture, uv);
    if (sigma <= 0.0) {
        FragColor = originalColor;
        return;
    }
    float topEdge = topExtent * uViewSize.y;
    float bottomEdge = (1.0 - bottomExtent) * uViewSize.y;
    float leftEdge = leftExtent * uViewSize.x;
    float rightEdge = (1.0 - rightExtent) * uViewSize.x;
    bool inTop = topExtent > 0.0 && fragCoord.y < topEdge;
    bool inBottom = bottomExtent > 0.0 && fragCoord.y > bottomEdge;
    bool inLeft = leftExtent > 0.0 && fragCoord.x < leftEdge;
    bool inRight = rightExtent > 0.0 && fragCoord.x > rightEdge;
    bool inBlurRegion = inTop || inBottom || inLeft || inRight;
    if (!inBlurRegion) {
        FragColor = originalColor;
        return;
    }

    float edgeDistance = 1e6;
    if (inTop) edgeDistance = min(edgeDistance, topEdge - fragCoord.y);
    if (inBottom) edgeDistance = min(edgeDistance, fragCoord.y - bottomEdge);
    if (inLeft) edgeDistance = min(edgeDistance, leftEdge - fragCoord.x);
    if (inRight) edgeDistance = min(edgeDistance, fragCoord.x - rightEdge);

    float blurZoneSize = 1.0;
    if (inTop) blurZoneSize = topEdge;
    else if (inBottom) blurZoneSize = uViewSize.y - bottomEdge;
    else if (inLeft) blurZoneSize = leftEdge;
    else if (inRight) blurZoneSize = uViewSize.x - rightEdge;

    float transitionWidth = blurZoneSize * edgeIntensity;

    if (blurVersion < 0.5) {
        float globalBlendFactor = 1.0;
        if (transitionWidth > 0.0) {
            globalBlendFactor = smoothstep(0.0, 1.0, edgeDistance / transitionWidth);
        }

        float kSizeFloat = max(kernelSize, 1.0);
        int kSize = int(kSizeFloat);
        vec4 sumColor = vec4(0.0);
        float weightSum = 0.0;

        if (kSize <= 15) {
            for (int j = -15; j <= 15; ++j) {
                if (j < -kSize || j > kSize) continue;
                float weight = getGaussianWeight(j, sigma);
                if (weight < 0.001) continue;
                vec2 offset = vec2(0.0, float(j) / uViewSize.y);
                vec2 sampleUV = clamp(uv + offset, vec2(0.0), vec2(1.0));
                sumColor += texture(uTexture, sampleUV) * weight;
                weightSum += weight;
            }
        } else if (kSize <= 30) {
            for (int j = -30; j <= 30; ++j) {
                if (j < -kSize || j > kSize) continue;
                float weight = getGaussianWeight(j, sigma);
                if (weight < 0.001) continue;
                vec2 offset = vec2(0.0, float(j) / uViewSize.y);
                vec2 sampleUV = clamp(uv + offset, vec2(0.0), vec2(1.0));
                sumColor += texture(uTexture, sampleUV) * weight;
                weightSum += weight;
            }
        } else if (kSize <= 50) {
            for (int j = -50; j <= 50; ++j) {
                if (j < -kSize || j > kSize) continue;
                float weight = getGaussianWeight(j, sigma);
                if (weight < 0.001) continue;
                vec2 offset = vec2(0.0, float(j) / uViewSize.y);
                vec2 sampleUV = clamp(uv + offset, vec2(0.0), vec2(1.0));
                sumColor += texture(uTexture, sampleUV) * weight;
                weightSum += weight;
            }
        } else {
            for (int j = -100; j <= 100; ++j) {
                if (j < -kSize || j > kSize) continue;
                float weight = getGaussianWeight(j, sigma);
                if (weight < 0.001) continue;
                vec2 offset = vec2(0.0, float(j) / uViewSize.y);
                vec2 sampleUV = clamp(uv + offset, vec2(0.0), vec2(1.0));
                sumColor += texture(uTexture, sampleUV) * weight;
                weightSum += weight;
            }
        }
        vec4 blurredColor = sumColor / weightSum;
        FragColor = mix(originalColor, blurredColor, globalBlendFactor);
        return;
    }

    const float MIN_SIGMA = 3.0;

    float blendFactor = 1.0;
    if (transitionWidth > 0.0) {
        blendFactor = smootherstep(0.0, 1.0, edgeDistance / transitionWidth);
    }

    float targetSigma = sigma * blendFactor;

    if (targetSigma <= 0.01) {
        FragColor = originalColor;
        return;
    }

    float effectiveSigma = max(targetSigma, MIN_SIGMA);
    float subThresholdBlend = clamp(targetSigma / MIN_SIGMA, 0.0, 1.0);
    subThresholdBlend = smootherstep(0.0, 1.0, subThresholdBlend);

    float kSizeFloat = max(kernelSize, 1.0);
    int kSize = int(kSizeFloat);
    vec4 sumColor = vec4(0.0);
    float weightSum = 0.0;

    if (kSize <= 15) {
        for (int j = -15; j <= 15; ++j) {
            if (j < -kSize || j > kSize) continue;
            float weight = getGaussianWeight(j, effectiveSigma);
            if (weight < 0.001) continue;
            vec2 offset = vec2(0.0, float(j) / uViewSize.y);
            vec2 sampleUV = clamp(uv + offset, vec2(0.0), vec2(1.0));
            sumColor += texture(uTexture, sampleUV) * weight;
            weightSum += weight;
        }
    } else if (kSize <= 30) {
        for (int j = -30; j <= 30; ++j) {
            if (j < -kSize || j > kSize) continue;
            float weight = getGaussianWeight(j, effectiveSigma);
            if (weight < 0.001) continue;
            vec2 offset = vec2(0.0, float(j) / uViewSize.y);
            vec2 sampleUV = clamp(uv + offset, vec2(0.0), vec2(1.0));
            sumColor += texture(uTexture, sampleUV) * weight;
            weightSum += weight;
        }
    } else if (kSize <= 50) {
        for (int j = -50; j <= 50; ++j) {
            if (j < -kSize || j > kSize) continue;
            float weight = getGaussianWeight(j, effectiveSigma);
            if (weight < 0.001) continue;
            vec2 offset = vec2(0.0, float(j) / uViewSize.y);
            vec2 sampleUV = clamp(uv + offset, vec2(0.0), vec2(1.0));
            sumColor += texture(uTexture, sampleUV) * weight;
            weightSum += weight;
        }
    } else {
        for (int j = -100; j <= 100; ++j) {
            if (j < -kSize || j > kSize) continue;
            float weight = getGaussianWeight(j, effectiveSigma);
            if (weight < 0.001) continue;
            vec2 offset = vec2(0.0, float(j) / uViewSize.y);
            vec2 sampleUV = clamp(uv + offset, vec2(0.0), vec2(1.0));
            sumColor += texture(uTexture, sampleUV) * weight;
            weightSum += weight;
        }
    }

    vec4 blurredColor = sumColor / weightSum;
    FragColor = mix(originalColor, blurredColor, subThresholdBlend);
}