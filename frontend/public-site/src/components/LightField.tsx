import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

type Props = {
  formProgress: number;
};

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;
  uniform float uTime;
  uniform float uScroll;
  uniform float uFormProgress;
  uniform vec2 uMouse;
  uniform vec2 uResolution;
  varying vec2 vUv;

  #define PI 3.141592653589793

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amp = 0.5;
    mat2 rot = mat2(0.8, -0.6, 0.6, 0.8);
    for (int i = 0; i < 5; i++) {
      value += amp * noise(p);
      p = rot * p * 2.02;
      amp *= 0.5;
    }
    return value;
  }

  vec3 aurora(vec2 uv) {
    vec2 p = uv;
    p.y += sin(p.x * 5.0 + uTime * 0.35) * 0.055;
    float ribbon = 0.0;
    for (int i = 0; i < 4; i++) {
      float fi = float(i);
      float y = 0.2 + fi * 0.16 + sin(p.x * (2.2 + fi) + uTime * (0.22 + fi * 0.04)) * 0.075;
      float band = smoothstep(0.105, 0.0, abs(p.y - y - fbm(p * (2.1 + fi) + fi) * 0.08));
      ribbon += band * (0.5 - fi * 0.05);
    }
    vec3 blue = vec3(0.29, 0.49, 1.0);
    vec3 cyan = vec3(0.37, 0.89, 0.82);
    vec3 violet = vec3(0.62, 0.55, 0.95);
    vec3 col = mix(blue, cyan, uv.x);
    col = mix(col, violet, smoothstep(0.55, 1.0, uv.y));
    return col * ribbon * 0.75;
  }

  vec3 gridScene(vec2 uv) {
    vec2 p = (uv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);
    float perspective = 1.0 / max(0.18, (p.y + 0.82));
    vec2 gp = vec2(p.x * perspective, p.y * perspective + uTime * 0.03) * 13.0;
    vec2 g = abs(fract(gp) - 0.5) / fwidth(gp);
    float line = 1.0 - min(min(g.x, g.y), 1.0);
    float sweep = smoothstep(0.02, 0.0, abs(uv.x + uv.y - 1.0 - sin(uTime * 0.18) * 0.8));
    vec3 spectrum = mix(vec3(0.29,0.49,1.0), vec3(0.37,0.89,0.82), uv.x);
    spectrum = mix(spectrum, vec3(1.0,0.69,0.48), sweep * 0.8);
    return spectrum * (line * 0.09 + sweep * 0.18);
  }

  vec3 caustics(vec2 uv) {
    vec2 p = uv * 7.0;
    float a = fbm(p + vec2(uTime * 0.14, 0.0));
    float b = fbm(p * 1.6 - vec2(0.0, uTime * 0.12));
    float c = abs(sin((a + b) * 10.0 + uTime * 0.55));
    float line = smoothstep(0.78, 1.0, c);
    float noon = 0.72 + 0.28 * sin((uScroll - 0.42) * PI);
    return mix(vec3(0.37,0.89,0.82), vec3(1.0,0.69,0.48), uv.y) * line * noon * 0.28;
  }

  vec3 shaft(vec2 uv) {
    vec2 p = uv - 0.5;
    float x = abs(p.x + (uMouse.x - 0.5) * 0.08);
    float column = smoothstep(0.42, 0.02, x) * smoothstep(-0.12, 0.72, p.y);
    float rays = pow(max(0.0, 1.0 - x * 2.2), 2.0) * (0.34 + 0.66 * fbm(vec2(p.x * 3.0, p.y * 6.0 - uTime * 0.22)));
    float lift = smoothstep(0.0, 1.0, uFormProgress);
    vec3 col = mix(vec3(1.0,0.72,0.44), vec3(0.37,0.89,0.82), uv.y + lift * 0.22);
    return col * (column * 0.18 + rays * column * (0.24 + lift * 0.34));
  }

  vec3 trails(vec2 uv) {
    vec2 p = uv - vec2(0.68 + (uMouse.x - 0.5) * 0.06, 0.42 + (uMouse.y - 0.5) * 0.04);
    float r = length(p);
    float a = atan(p.y, p.x) + uTime * 0.045;
    float arcs = smoothstep(0.01, 0.0, abs(fract(a * 6.0 / PI + r * 5.0) - 0.5) - 0.46);
    arcs *= smoothstep(0.04, 0.2, r) * smoothstep(0.72, 0.24, r);
    float stars = step(0.993, noise(floor(uv * 160.0))) * 0.32;
    return vec3(0.82, 0.9, 1.0) * arcs * 0.12 + vec3(0.62,0.55,0.95) * arcs * 0.05 + stars;
  }

  vec3 galaxy(vec2 uv) {
    vec2 p = uv - 0.5;
    float band = smoothstep(0.34, 0.0, abs(p.y + p.x * 0.28 + sin(p.x * 3.0 + uTime * 0.08) * 0.035));
    float dust = fbm(uv * 6.0 + vec2(uTime * 0.03, -uTime * 0.02));
    return (vec3(0.37,0.89,0.82) * 0.2 + vec3(0.62,0.55,0.95) * 0.34) * band * (0.4 + dust * 0.8);
  }

  vec3 sceneAt(float idx, vec2 uv) {
    if (idx < 0.5) return aurora(uv);
    if (idx < 1.5) return gridScene(uv);
    if (idx < 2.5) return caustics(uv);
    if (idx < 3.5) return shaft(uv);
    if (idx < 4.5) return trails(uv);
    return galaxy(uv);
  }

  void main() {
    vec2 uv = vUv;
    float s = clamp(uScroll, 0.0, 0.999) * 5.0;
    float idx = floor(s);
    float mixAmount = smoothstep(0.18, 0.82, fract(s));
    vec3 col = mix(sceneAt(idx, uv), sceneAt(min(5.0, idx + 1.0), uv), mixAmount);
    vec2 m = uv - uMouse;
    float mouseGlow = exp(-dot(m, m) * 18.0) * 0.08;
    col += vec3(0.37,0.89,0.82) * mouseGlow;
    float vignette = smoothstep(1.0, 0.12, length(uv - 0.5));
    col *= 0.72 + vignette * 0.46;
    gl_FragColor = vec4(col, 0.86);
  }
`;

export function LightField({ formProgress }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(formProgress);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    progressRef.current = formProgress;
  }, [formProgress]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setFallback(true);
      return;
    }

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    } catch {
      setFallback(true);
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uScroll: { value: 0 },
        uFormProgress: { value: progressRef.current },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uResolution: { value: new THREE.Vector2(1, 1) }
      }
    });
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 768 ? 1.35 : 1.8));
    host.appendChild(renderer.domElement);
    host.classList.add('is-live');

    let width = 0;
    let height = 0;
    let raf = 0;
    let targetScroll = 0;
    let smoothScroll = 0;
    let targetMouse = new THREE.Vector2(0.5, 0.5);
    let visible = true;
    const start = performance.now();

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      renderer.setSize(width, height, false);
      material.uniforms.uResolution.value.set(width, height);
    };

    const updateScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      targetScroll = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    };

    const updateMouse = (event: PointerEvent) => {
      targetMouse.set(event.clientX / window.innerWidth, 1 - event.clientY / window.innerHeight);
    };

    const visibility = () => {
      visible = document.visibilityState === 'visible';
      if (visible && !raf) animate();
    };

    const animate = () => {
      if (!visible) {
        raf = 0;
        return;
      }
      smoothScroll += (targetScroll - smoothScroll) * 0.08;
      material.uniforms.uTime.value = (performance.now() - start) / 1000;
      material.uniforms.uScroll.value = smoothScroll;
      material.uniforms.uFormProgress.value += (progressRef.current - material.uniforms.uFormProgress.value) * 0.1;
      material.uniforms.uMouse.value.lerp(targetMouse, 0.08);
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };

    resize();
    updateScroll();
    animate();
    window.addEventListener('resize', resize);
    window.addEventListener('scroll', updateScroll, { passive: true });
    window.addEventListener('pointermove', updateMouse, { passive: true });
    document.addEventListener('visibilitychange', visibility);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', updateScroll);
      window.removeEventListener('pointermove', updateMouse);
      document.removeEventListener('visibilitychange', visibility);
      cancelAnimationFrame(raf);
      host.classList.remove('is-live');
      renderer.domElement.remove();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={hostRef} className={fallback ? 'light-field fallback' : 'light-field'} aria-hidden="true" />;
}
