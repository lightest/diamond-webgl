precision lowp float;

uniform sampler2D uFullsizeTexture;
uniform sampler2D uBlurredTexture;

varying vec2 vSamplingPosition; // in [0,1]^2

void main() {
    vec3 color = texture2D(uFullsizeTexture, vSamplingPosition).rgb + texture2D(uBlurredTexture, vSamplingPosition).rgb;
    gl_FragColor = vec4(color, 1);
}