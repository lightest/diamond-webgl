// uniform float uLightDirection; // 1 or -1

float sampleSkyboxMonochrome(const vec3 direction) {
    float z = uLightDirection * direction.z;
    return 0.8 * mix(0.3, 2.0, step(0.4, z) * step(z, 0.95));
}
