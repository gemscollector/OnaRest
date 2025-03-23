attribute float aOffset;
attribute float aFrequency;
attribute float aAmplitude;

uniform float uTime;
varying vec3 vPosition;

void main() {
  vec3 pos = position;

  // Каждому партикулу — свой темп и силу колебания
  float move = sin(uTime * aFrequency + aOffset) * aAmplitude;
  float side = cos(uTime * aFrequency * 0.7 + aOffset * 2.0) * aAmplitude * 0.3;

  // Двигаем по Y и немного по X
  pos.y += move;
  pos.x += side;

  vPosition = pos;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  gl_PointSize = 18.0 / -mvPosition.z;
}