uniform vec3 uColor1;
uniform vec3 uColor2;
varying vec3 vPosition;

void main() {
  // Координаты внутри точки от -1 до 1
  vec2 coord = gl_PointCoord * 2.0 - 1.0;
  float dist = length(coord);

  // Делаем форму круга — всё, что выходит за границу, отбрасываем
  if (dist > 1.0) {
    discard;
  }

  // Добавляем мягкое затухание к краям (для свечения)
  float alpha = smoothstep(1.0, 0.0, dist);

  // Градиент цвета по высоте (по Y координате)
  vec3 color = mix(uColor1, uColor2, vPosition.y * 0.5 + 0.5);

  // Выводим цвет и альфу
  gl_FragColor = vec4(color, alpha);
}