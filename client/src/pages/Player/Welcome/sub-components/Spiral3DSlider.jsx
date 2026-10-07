/**
 * Spiral3DSlider — ported from componentry.dev/r/spiral-3d-slider.json
 * (07/10). "A compact, autoplaying image gallery that responds to scroll
 * along a smooth 3D spiral." Ported to plain JSX/PropTypes (source is
 * TypeScript for Next.js). Requires three.js + @react-three/fiber
 * (installed) — used by HistorySection for the project's photo gallery.
 */

import { Suspense, useEffect, useMemo, useRef } from "react";
import PropTypes from "prop-types";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import {
  DoubleSide,
  LinearFilter,
  SRGBColorSpace,
  TextureLoader,
} from "three";
import { WebGLErrorBoundary, WebGLFallback } from "@/components/ui/webgl-error-boundary";
import { cn } from "@/lib/utils";

const vertexShader = `
  uniform float uBend;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec3 transformed = position;
    float curve = 1.0 - cos(position.x * 3.14159265);
    transformed.z -= curve * uBend;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D uTexture;
  uniform float uImageAspect;
  uniform float uPlaneAspect;
  uniform float uBlur;
  varying vec2 vUv;

  vec2 coverUv(vec2 uv) {
    vec2 scale = vec2(1.0);
    if (uImageAspect > uPlaneAspect) {
      scale.x = uPlaneAspect / uImageAspect;
    } else {
      scale.y = uImageAspect / uPlaneAspect;
    }
    return (uv - 0.5) * scale + 0.5;
  }

  void main() {
    vec2 uv = coverUv(vUv);
    vec2 stepSize = vec2(0.0065) * uBlur;
    vec4 color = texture2D(uTexture, uv) * 0.23;

    color += texture2D(uTexture, uv + vec2(stepSize.x, 0.0)) * 0.12;
    color += texture2D(uTexture, uv - vec2(stepSize.x, 0.0)) * 0.12;
    color += texture2D(uTexture, uv + vec2(stepSize.x * 2.0, 0.0)) * 0.06;
    color += texture2D(uTexture, uv - vec2(stepSize.x * 2.0, 0.0)) * 0.06;
    color += texture2D(uTexture, uv + vec2(0.0, stepSize.y)) * 0.12;
    color += texture2D(uTexture, uv - vec2(0.0, stepSize.y)) * 0.12;
    color += texture2D(uTexture, uv + vec2(0.0, stepSize.y * 2.0)) * 0.06;
    color += texture2D(uTexture, uv - vec2(0.0, stepSize.y * 2.0)) * 0.06;
    color += texture2D(uTexture, uv + stepSize) * 0.025;
    color += texture2D(uTexture, uv - stepSize) * 0.025;

    float luminance = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));
    color.rgb = mix(vec3(luminance), color.rgb, 1.18);
    color.rgb = (color.rgb - 0.5) * 1.08 + 0.5;
    float brightness = 1.04 - min(uBlur * 0.025, 0.07);
    gl_FragColor = vec4(clamp(color.rgb * brightness, 0.0, 1.0), 1.0);
  }
`;

function wrappedPosition(value, length) {
  const wrapped = ((value % length) + length) % length;
  return wrapped > length / 2 ? wrapped - length : wrapped;
}

function imageAspect(texture) {
  const image = texture.image;
  const width = image?.naturalWidth ?? image?.width ?? 1;
  const height = image?.naturalHeight ?? image?.height ?? 1;
  return width / Math.max(height, 1);
}

function SpiralScene({
  items,
  targetProgressRef,
  radius,
  verticalGap,
  cardWidth,
  cardAspectRatio,
  autoRotate,
  autoSpeed,
  smoothing,
  blurStrength,
  bend,
  reducedMotion,
  lastInteraction,
}) {
  const sceneItems = useMemo(
    () => Array.from({ length: Math.max(items.length, 16) }, (_, index) => items[index % items.length]),
    [items]
  );
  const textures = useLoader(TextureLoader, sceneItems.map((item) => item.src));
  const { gl, viewport } = useThree();
  const progress = useRef(0);
  const meshes = useRef([]);
  const materials = useRef([]);

  const uniforms = useMemo(
    () =>
      textures.map((texture) => ({
        uTexture: { value: texture },
        uImageAspect: { value: imageAspect(texture) },
        uPlaneAspect: { value: cardAspectRatio },
        uBlur: { value: 0 },
        uBend: { value: 0 },
      })),
    [cardAspectRatio, textures]
  );

  useEffect(() => {
    textures.forEach((texture) => {
      texture.colorSpace = SRGBColorSpace;
      texture.minFilter = LinearFilter;
      texture.magFilter = LinearFilter;
      texture.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
      texture.needsUpdate = true;
    });
  }, [gl, textures]);

  useFrame((_state, delta) => {
    if (autoRotate && !reducedMotion.current && performance.now() - lastInteraction.current > 450) {
      targetProgressRef.current += autoSpeed * Math.min(delta, 0.05);
    }

    const frameScale = Math.min(delta * 60, 3);
    const ease = reducedMotion.current ? 1 : 1 - Math.pow(1 - smoothing, frameScale);
    progress.current += (targetProgressRef.current - progress.current) * ease;

    const factor = Math.max(viewport.factor, 1);
    const planeWidth = Math.min(cardWidth / factor, viewport.width * 0.225);
    const planeHeight = planeWidth / cardAspectRatio;
    const spiralRadius = Math.min(radius / factor, viewport.width * 0.245);
    const gap = Math.min(verticalGap / factor, viewport.height * 0.082);
    const count = sceneItems.length;

    meshes.current.forEach((mesh, index) => {
      const material = materials.current[index];
      if (!mesh || !material) return;

      const position = wrappedPosition(index - progress.current, count);
      const angle = position * 0.78;
      const depth = (Math.cos(angle) + 1) / 2;
      const distance = Math.min(Math.abs(position) / (count * 0.43), 1);
      const scale = 0.74 + depth * 0.26;

      mesh.position.set(Math.sin(angle) * spiralRadius, -position * gap, Math.cos(angle) * 2.55);
      mesh.rotation.set(0, Math.sin(angle) * -1.12, 0);
      mesh.scale.set(planeWidth * scale, planeHeight * scale, 1);

      material.uniforms.uBlur.value = Math.pow(distance, 1.28) * blurStrength;
      material.uniforms.uBend.value = planeWidth * bend;
      material.uniforms.uPlaneAspect.value = cardAspectRatio;
    });
  });

  return (
    <>
      {sceneItems.map((item, index) => (
        <mesh
          key={`${item.src}-${index}`}
          ref={(node) => {
            meshes.current[index] = node;
          }}
          frustumCulled={false}
        >
          <planeGeometry args={[1, 1, 48, 2]} />
          <shaderMaterial
            ref={(node) => {
              materials.current[index] = node;
            }}
            uniforms={uniforms[index]}
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            side={DoubleSide}
            depthTest
            depthWrite
          />
        </mesh>
      ))}
    </>
  );
}

export default function Spiral3DSlider({
  items,
  className,
  radius,
  verticalGap,
  cardWidth,
  cardAspectRatio,
  autoRotate,
  autoSpeed,
  scrollSensitivity,
  smoothing,
  blurStrength,
  bend,
  fov,
  ariaLabel,
}) {
  const stageRef = useRef(null);
  const targetProgress = useRef(0);
  const previousScroll = useRef(0);
  const lastWheelTime = useRef(0);
  const lastInteraction = useRef(0);
  const visible = useRef(false);
  const reducedMotion = useRef(false);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    previousScroll.current = window.scrollY;
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotionPreference = () => {
      reducedMotion.current = motionQuery.matches;
    };
    syncMotionPreference();
    motionQuery.addEventListener("change", syncMotionPreference);

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible.current = Boolean(entry?.isIntersecting);
      },
      { threshold: 0.08 }
    );
    observer.observe(stage);

    const handlePageScroll = () => {
      const scrollY = window.scrollY;
      const delta = scrollY - previousScroll.current;
      previousScroll.current = scrollY;
      if (visible.current && performance.now() - lastWheelTime.current > 80) {
        lastInteraction.current = performance.now();
        const boundedDelta = Math.sign(delta) * Math.min(Math.abs(delta), 160);
        targetProgress.current += boundedDelta * scrollSensitivity;
      }
    };
    window.addEventListener("scroll", handlePageScroll, { passive: true });

    return () => {
      observer.disconnect();
      motionQuery.removeEventListener("change", syncMotionPreference);
      window.removeEventListener("scroll", handlePageScroll);
    };
  }, [scrollSensitivity]);

  const handleWheel = (event) => {
    lastWheelTime.current = performance.now();
    lastInteraction.current = lastWheelTime.current;
    const delta = Math.sign(event.deltaY) * Math.min(Math.abs(event.deltaY), 160);
    targetProgress.current += delta * scrollSensitivity;
  };

  if (!items.length) return null;

  return (
    <div
      ref={stageRef}
      role="region"
      aria-label={ariaLabel}
      className={cn("relative min-h-[26rem] w-full overflow-hidden bg-[#0d0d1a]", className)}
      onWheel={handleWheel}
    >
      <WebGLErrorBoundary fallback={<WebGLFallback className="absolute inset-0 h-full w-full" />}>
        <div className="absolute inset-0">
          <Canvas
            dpr={[1, 1.75]}
            camera={{ position: [0, 0, 10], fov, near: 0.1, far: 100 }}
            gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
          >
            <Suspense fallback={null}>
              <SpiralScene
                items={items}
                targetProgressRef={targetProgress}
                radius={radius}
                verticalGap={verticalGap}
                cardWidth={cardWidth}
                cardAspectRatio={cardAspectRatio}
                autoRotate={autoRotate}
                autoSpeed={autoSpeed}
                smoothing={smoothing}
                blurStrength={blurStrength}
                bend={bend}
                reducedMotion={reducedMotion}
                lastInteraction={lastInteraction}
              />
            </Suspense>
          </Canvas>
        </div>
      </WebGLErrorBoundary>

      <div className="sr-only">
        <p>{ariaLabel}</p>
        <ul>
          {items.map((item, index) => (
            <li key={`${item.src}-description-${index}`}>{item.alt}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

Spiral3DSlider.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({ src: PropTypes.string.isRequired, alt: PropTypes.string.isRequired }))
    .isRequired,
  className: PropTypes.string,
  radius: PropTypes.number,
  verticalGap: PropTypes.number,
  cardWidth: PropTypes.number,
  cardAspectRatio: PropTypes.number,
  autoRotate: PropTypes.bool,
  autoSpeed: PropTypes.number,
  scrollSensitivity: PropTypes.number,
  smoothing: PropTypes.number,
  blurStrength: PropTypes.number,
  bend: PropTypes.number,
  fov: PropTypes.number,
  ariaLabel: PropTypes.string,
};

Spiral3DSlider.defaultProps = {
  className: "",
  radius: 190,
  verticalGap: 56,
  cardWidth: 220,
  cardAspectRatio: 3 / 2,
  autoRotate: true,
  autoSpeed: 0.13,
  scrollSensitivity: 0.0024,
  smoothing: 0.065,
  blurStrength: 1.65,
  bend: 0.17,
  fov: 44,
  ariaLabel: "TicTacToang development history gallery",
};
