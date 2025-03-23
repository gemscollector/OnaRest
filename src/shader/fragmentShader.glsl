uniform vec3 uColor5;
uniform vec3 uColor6;
uniform vec3 uColor7;
uniform vec3 uColor8;
uniform vec3 uColor3;
uniform vec3 uColor4;
uniform float uScrollProgress;
uniform vec3 uColor1;
uniform vec3 uColor2;
varying vec3 vPosition;

void main() {
  vec2 coord = gl_PointCoord * 2.0 - 1.0;
  float dist = length(coord);

  if (dist > 1.0) {
    discard;
  }

  // "Фейковый" объём — освещение слева-сверху
  float light = dot(normalize(vec3(-0.3, 0.5, 0.5)), normalize(vec3(coord.x, coord.y, sqrt(1.0 - dist * dist))));
  light = clamp(light, 0.0, 1.0);

  float alpha = smoothstep(1.0, 0.5, dist);
  float progress = uScrollProgress;

  vec3 colorA = mix(uColor1, uColor2, vPosition.y * 0.5 + 0.5);
  vec3 colorB = mix(uColor3, uColor4, vPosition.y * 0.5 + 0.5);
  vec3 colorC = mix(uColor5, uColor6, vPosition.y * 0.5 + 0.5);
  vec3 colorD = mix(uColor7, uColor8, vPosition.y * 0.5 + 0.5);

  vec3 baseColor = colorA;

  if (progress < 0.33) {
    float p = smoothstep(0.0, 0.33, progress);
    baseColor = mix(colorA, colorB, p);
  } else if (progress < 0.66) {
    float p = smoothstep(0.33, 0.66, progress);
    baseColor = mix(colorB, colorC, p);
  } else {
    float p = smoothstep(0.66, 1.0, progress);
    baseColor = mix(colorC, colorD, p);
  }
  vec3 color = baseColor * light;

  gl_FragColor = vec4(color, alpha);
}