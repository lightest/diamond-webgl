#ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
#else
  precision mediump float;
#endif

uniform vec3 uEyePosition;

void main(void)
{
    gl_FragColor = vec4(vec3(1) + 0.000001 * uEyePosition, 1);
}