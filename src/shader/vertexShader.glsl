attribute vec3 aInitialPosition;
attribute float aOffset;
attribute float aFrequency;
attribute float aAmplitude;
attribute float aDelay;

uniform float uTime;
uniform vec2 uMouse;
uniform float uStrength;

varying vec3 vPosition;

void main() {
  vec3 pos = aInitialPosition;

  // Базовая анимация (дыхание)
  float move = sin(uTime * aFrequency + aOffset) * aAmplitude;
  float side = cos(uTime * aFrequency * 0.7 + aOffset * 2.0) * aAmplitude * 0.3;
  pos.y += move;
  pos.x += side;

  // =============================
  // Реакция на мышку (притяжение)
  // vec3 mousePos = vec3(uMouse, 0.0);
  // float distToMouse = distance(vec3(pos.x, pos.y, 0.0), mousePos);
  // vec3 dir = normalize(mousePos - vec3(pos.x, pos.y, 0.0));

  // float rawForce = 1.0 - clamp(distToMouse / 5.0, 0.0, 1.0);
  // float force = smoothstep(0.0, 1.0, rawForce) * uStrength * (1.0 - aDelay);

  vec3 toMouse = vec3(uMouse, 0.0) - vec3(pos.x, pos.y, 0.0);
  float dist = length(toMouse);
  float force = (1.0 - clamp(dist / 5.0, 0.0, 1.0)) * uStrength * (1.0 - aDelay);
  pos += normalize(toMouse) * force * 0.4;

  // =============================

  vPosition = pos;
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  float size = 40.0 / -mvPosition.z;
size *= smoothstep(40.0, 10.1, -mvPosition.z); // усилить передний
size *= smoothstep(-2.0, 1.5, pos.y);
gl_PointSize = size;
}