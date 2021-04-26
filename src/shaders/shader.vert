attribute vec3 aPosition; // in [-0.5,+0.5]^3

uniform mat4 uMVPMatrix;

varying vec3 vPosition; // in [-0.5,+0.5]^3

void main(void)
{
    gl_Position = uMVPMatrix * vec4(aPosition, 1.0);
    vPosition = aPosition;
}
