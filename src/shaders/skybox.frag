precision lowp float;

uniform vec3 uEyePosition;
uniform float uOrthographic;
uniform float uASETSkybox;
uniform float uLightDirection; // 1 or -1

varying vec3 vPosition;

vec3 sampleSkybox(const vec3 direction) {
    float z = uLightDirection * direction.z;

    vec3 asetSkybox = vec3(
        step(0.70, z) * step(z, 0.98),
        step(0.0, z) * step(z, 0.70),
        step(0.98, z)
    );
    vec3 skybox = 0.8 * mix(vec3(0.3), vec3(2), step(0.4, z) * step(z, 0.95));

    return mix(skybox, asetSkybox, uASETSkybox);
}


void main(void) {
    vec3 fromEyeNormalized = normalize(mix(vPosition - uEyePosition, -uEyePosition, uOrthographic));
    vec3 skybox = sampleSkybox(fromEyeNormalized);
    gl_FragColor = vec4(skybox, 0.1) ;
}
