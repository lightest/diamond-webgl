precision lowp float;

uniform vec3 uEyePosition;
uniform float uOrthographic;
uniform float uASETSkybox;
uniform float uLightDirection; // 1 or -1

varying vec3 vPosition;// uniform float uLightDirection; // 1 or -1

float sampleSkyboxMonochrome(const vec3 direction) {
    float z = uLightDirection * direction.z;
    return 0.8 * step(z, 0.975) * (1.0 + step(0.6, z));
}

// uniform float uASETSkybox;

vec3 sampleSkybox(const vec3 direction) {
    vec3 skybox = vec3(sampleSkyboxMonochrome(direction));

    float z = uLightDirection * direction.z;
    vec3 asetSkybox = vec3(
        step(0.70, z) * step(z, 0.98),
        step(0.0, z) * step(z, 0.70),
        step(0.98, z)
    );

    return mix(skybox, asetSkybox, uASETSkybox);
}

void main(void) {
    vec3 fromEyeNormalized = normalize(mix(vPosition - uEyePosition, -uEyePosition, uOrthographic));
    vec3 skybox = sampleSkybox(fromEyeNormalized);
    gl_FragColor = vec4(skybox, 0.1) ;
}
