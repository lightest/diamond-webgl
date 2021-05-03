// uniform float uLightDirection; // 1 or -1

float sampleSkyboxMonochrome(const vec3 direction) {
    float z = uLightDirection * direction.z;
    return 0.8 + 0.8 * smoothstep(0.5, 0.7, z) * (1.0 - smoothstep(0.97, 0.98, z));
}
