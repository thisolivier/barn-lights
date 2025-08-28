precision highp float;
uniform float elapsed;
uniform vec3 colorA;
uniform vec3 colorB;
uniform float strobeSpeed;
void main(){
  float phase = step(0.5, fract(elapsed * strobeSpeed));
  vec3 resultColor = mix(colorA, colorB, phase);
  gl_FragColor = vec4(resultColor, 1.0);
}
