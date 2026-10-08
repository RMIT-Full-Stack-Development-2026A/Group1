/**
 * AnimatedGradient — ported from componentry.dev/r/animated-gradient.json
 *. WebGL2 procedural gradient, zero dependencies in the original
 * registry item. Ported to plain JSX/PropTypes (source is TypeScript for
 * Next.js). Used by IntroSplash as the splash-screen background.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { WebGLErrorBoundary, WebGLFallback } from "@/components/ui/webgl-error-boundary";
import { cn } from "@/lib/utils";

const PatternShapes = { Checks: 0, Stripes: 1, Edge: 2 };

const presets = {
  Aurora: {
    color1: "#0a001a",
    color2: "#1a0b2e",
    color3: "#4cc9f0",
    rotation: -45,
    proportion: 60,
    scale: 0.6,
    speed: 15,
    distortion: 40,
    swirl: 80,
    swirlIterations: 10,
    softness: 100,
    offset: 200,
    shape: "Edge",
    shapeSize: 50,
  },
};

function hexToRgba(hex) {
  let r = 0;
  let g = 0;
  let b = 0;
  const a = 1;

  if (hex.startsWith("#")) {
    const c = hex.slice(1);
    if (c.length >= 6) {
      r = parseInt(c.slice(0, 2), 16) / 255;
      g = parseInt(c.slice(2, 4), 16) / 255;
      b = parseInt(c.slice(4, 6), 16) / 255;
    }
  }

  return [r, g, b, a];
}

// WebGL1 (not WebGL2): some machines report "Interactive WebGL content is unavailable" without WebGL2, and
// AuroraFlow already runs on WebGL1.
const VERTEX_SHADER = `
attribute vec4 a_position;
void main() {
  gl_Position = a_position;
}`;

const FRAGMENT_SHADER = `
precision highp float;

uniform float u_time;
uniform float u_pixelRatio;
uniform vec2 u_resolution;

uniform float u_scale;
uniform float u_rotation;
uniform vec4 u_color1;
uniform vec4 u_color2;
uniform vec4 u_color3;
uniform float u_proportion;
uniform float u_softness;
uniform float u_shape;
uniform float u_shapeScale;
uniform float u_distortion;
uniform float u_swirl;
uniform float u_swirlIterations;

#define TWO_PI 6.28318530718
#define PI 3.14159265358979323846

vec2 rotate(vec2 uv, float th) {
  return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
}

float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

float noise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = random(i);
  float b = random(i + vec2(1.0, 0.0));
  float c = random(i + vec2(0.0, 1.0));
  float d = random(i + vec2(1.0, 1.0));

  vec2 u = f * f * (3.0 - 2.0 * f);

  float x1 = mix(a, b, u.x);
  float x2 = mix(c, d, u.x);
  return mix(x1, x2, u.y);
}

vec4 blend_colors(vec4 c1, vec4 c2, vec4 c3, float mixer, float edgesWidth, float edge_blur) {
    vec3 color1 = c1.rgb * c1.a;
    vec3 color2 = c2.rgb * c2.a;
    vec3 color3 = c3.rgb * c3.a;

    float r1 = smoothstep(.0 + .35 * edgesWidth, .7 - .35 * edgesWidth + .5 * edge_blur, mixer);
    float r2 = smoothstep(.3 + .35 * edgesWidth, 1. - .35 * edgesWidth + edge_blur, mixer);

    vec3 blended_color_2 = mix(color1, color2, r1);
    float blended_opacity_2 = mix(c1.a, c2.a, r1);

    vec3 c = mix(blended_color_2, color3, r2);
    float o = mix(blended_opacity_2, c3.a, r2);
    return vec4(c, o);
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;

    float t = .5 * u_time;

    float noise_scale = .0005 + .006 * u_scale;

    uv -= .5;
    uv *= (noise_scale * u_resolution);
    uv = rotate(uv, u_rotation * .5 * PI);
    uv /= u_pixelRatio;
    uv += .5;

    float n1 = noise(uv * 1. + t);
    float n2 = noise(uv * 2. - t);
    float angle = n1 * TWO_PI;
    uv.x += 4. * u_distortion * n2 * cos(angle);
    uv.y += 4. * u_distortion * n2 * sin(angle);

    // WebGL1 requires a loop's bound to be a compile-time constant (GLSL ES
    // 1.00 loop restrictions; WebGL2/#version 300 es relaxed this, which is
    // why this compiled fine before the WebGL2->1 downgrade). Standard
    // WebGL1-safe pattern: loop to the real max (30, matches the clamp
    // above) and break early once past the dynamic iteration count.
    float iterations_number = ceil(clamp(u_swirlIterations, 1., 30.));
    for (int i = 1; i <= 30; i++) {
        if (float(i) > iterations_number) break;
        float fi = float(i);
        uv.x += clamp(u_swirl, 0., 2.) / fi * cos(t + fi * 1.5 * uv.y);
        uv.y += clamp(u_swirl, 0., 2.) / fi * cos(t + fi * 1. * uv.x);
    }

    float proportion = clamp(u_proportion, 0., 1.);

    float shape = 0.;
    float mixer = 0.;
    if (u_shape < .5) {
      vec2 checks_shape_uv = uv * (.5 + 3.5 * u_shapeScale);
      shape = .5 + .5 * sin(checks_shape_uv.x) * cos(checks_shape_uv.y);
      mixer = shape + .48 * sign(proportion - .5) * pow(abs(proportion - .5), .5);
    } else if (u_shape < 1.5) {
      vec2 stripes_shape_uv = uv * (.25 + 3. * u_shapeScale);
      float f = fract(stripes_shape_uv.y);
      shape = smoothstep(.0, .55, f) * smoothstep(1., .45, f);
      mixer = shape + .48 * sign(proportion - .5) * pow(abs(proportion - .5), .5);
    } else {
      float sh = 1. - uv.y;
      sh -= .5;
      sh /= (noise_scale * u_resolution.y);
      sh += .5;
      float shape_scaling = .2 * (1. - u_shapeScale);
      shape = smoothstep(.45 - shape_scaling, .55 + shape_scaling, sh + .3 * (proportion - .5));
      mixer = shape;
    }

    vec4 color_mix = blend_colors(u_color1, u_color2, u_color3, mixer, 1. - clamp(u_softness, 0., 1.), .01 + .01 * u_scale);

    gl_FragColor = vec4(color_mix.rgb, color_mix.a);
}
`;

// Stable default for object prop (avoids new reference each render)
const DEFAULT_ANIMATED_GRADIENT_STYLE = {};

export default function AnimatedGradient({ className = "", radius = "0px", style = DEFAULT_ANIMATED_GRADIENT_STYLE }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const frameIdRef = useRef(undefined);
  const startTimeRef = useRef(0);
  const [hasWebGLError, setHasWebGLError] = useState(false);

  const params = useMemo(() => presets.Aurora, []);

  useEffect(() => {
    if (hasWebGLError) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    try {
      const gl = canvas.getContext("webgl", {
        premultipliedAlpha: true,
        alpha: true,
        antialias: false,
        powerPreference: "high-performance",
      });
      if (!gl) {
        console.error("[AnimatedGradient] canvas.getContext('webgl') returned null — WebGL unavailable or canvas already bound to a different context type.");
        setHasWebGLError(true);
        return;
      }

      const vertexShader = gl.createShader(gl.VERTEX_SHADER);
      gl.shaderSource(vertexShader, VERTEX_SHADER);
      gl.compileShader(vertexShader);
      if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        console.error("[AnimatedGradient] vertex shader failed to compile:", gl.getShaderInfoLog(vertexShader));
        gl.deleteShader(vertexShader);
        setHasWebGLError(true);
        return;
      }

      const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
      gl.shaderSource(fragmentShader, FRAGMENT_SHADER);
      gl.compileShader(fragmentShader);
      if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        console.error("[AnimatedGradient] fragment shader failed to compile:", gl.getShaderInfoLog(fragmentShader));
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        setHasWebGLError(true);
        return;
      }

      const program = gl.createProgram();
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("[AnimatedGradient] program failed to link:", gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        setHasWebGLError(true);
        return;
      }
      gl.useProgram(program);

      const positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);

      const positionLocation = gl.getAttribLocation(program, "a_position");
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

      const uniforms = {
        u_time: gl.getUniformLocation(program, "u_time"),
        u_resolution: gl.getUniformLocation(program, "u_resolution"),
        u_pixelRatio: gl.getUniformLocation(program, "u_pixelRatio"),
        u_scale: gl.getUniformLocation(program, "u_scale"),
        u_rotation: gl.getUniformLocation(program, "u_rotation"),
        u_color1: gl.getUniformLocation(program, "u_color1"),
        u_color2: gl.getUniformLocation(program, "u_color2"),
        u_color3: gl.getUniformLocation(program, "u_color3"),
        u_proportion: gl.getUniformLocation(program, "u_proportion"),
        u_softness: gl.getUniformLocation(program, "u_softness"),
        u_shape: gl.getUniformLocation(program, "u_shape"),
        u_shapeScale: gl.getUniformLocation(program, "u_shapeScale"),
        u_distortion: gl.getUniformLocation(program, "u_distortion"),
        u_swirl: gl.getUniformLocation(program, "u_swirl"),
        u_swirlIterations: gl.getUniformLocation(program, "u_swirlIterations"),
      };

      const resize = () => {
        const width = container.clientWidth;
        const height = container.clientHeight;
        // render at 50% of native dpr (capped at 0.5×) — gradients
        // are smooth so upscaling is invisible, but it cuts shader cost ~4×
        // on hi-DPI screens.
        const scale = Math.min(window.devicePixelRatio || 1, 1) * 0.5;
        canvas.width = Math.max(1, Math.round(width * scale));
        canvas.height = Math.max(1, Math.round(height * scale));
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        gl.viewport(0, 0, canvas.width, canvas.height);
      };

      resize();
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(container);

      startTimeRef.current = performance.now();
      let lastFrameTime = 0;
      const TARGET_INTERVAL = 1000 / 30; // ~30 fps cap

      const animate = (time) => {
        // skip frames to cap at ~30 fps
        if (time - lastFrameTime < TARGET_INTERVAL) {
          frameIdRef.current = requestAnimationFrame(animate);
          return;
        }
        lastFrameTime = time;
        // pause when tab is hidden
        if (document.hidden) {
          frameIdRef.current = requestAnimationFrame(animate);
          return;
        }
        const elapsed = (time - startTimeRef.current) / 1000;
        const speed = (params.speed / 100) * 5;

        gl.uniform1f(uniforms.u_time, elapsed * speed + params.offset * 0.01);
        gl.uniform2f(uniforms.u_resolution, canvas.width, canvas.height);
        gl.uniform1f(uniforms.u_pixelRatio, window.devicePixelRatio || 1);
        gl.uniform1f(uniforms.u_scale, params.scale);
        gl.uniform1f(uniforms.u_rotation, (params.rotation * Math.PI) / 180);

        const c1 = hexToRgba(params.color1);
        const c2 = hexToRgba(params.color2);
        const c3 = hexToRgba(params.color3);
        gl.uniform4f(uniforms.u_color1, c1[0], c1[1], c1[2], c1[3]);
        gl.uniform4f(uniforms.u_color2, c2[0], c2[1], c2[2], c2[3]);
        gl.uniform4f(uniforms.u_color3, c3[0], c3[1], c3[2], c3[3]);

        gl.uniform1f(uniforms.u_proportion, params.proportion / 100);
        gl.uniform1f(uniforms.u_softness, params.softness / 100);
        gl.uniform1f(uniforms.u_shape, PatternShapes[params.shape]);
        gl.uniform1f(uniforms.u_shapeScale, params.shapeSize / 100);
        gl.uniform1f(uniforms.u_distortion, params.distortion / 50);
        gl.uniform1f(uniforms.u_swirl, params.swirl / 100);
        gl.uniform1f(uniforms.u_swirlIterations, params.swirl === 0 ? 0 : params.swirlIterations);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
        frameIdRef.current = requestAnimationFrame(animate);
      };

      frameIdRef.current = requestAnimationFrame(animate);

      return () => {
        if (frameIdRef.current !== undefined) cancelAnimationFrame(frameIdRef.current);
        resizeObserver.disconnect();
        // full GL cleanup to free GPU resources.
        // Removed WEBGL_lose_context.loseContext() -- it force-kills
        // the context immediately, and context restoration is asynchronous.
        // Under React 19 dev StrictMode, this effect's cleanup runs and the
        // effect re-mounts synchronously right after (double-invoke to catch
        // missing cleanup), before the lost context has a chance to restore,
        // so every gl.create*/compile call on the "new" getContext() result
        // returns null -- which shows up as a null shader-info-log
        // error. Deleting the program/shaders/buffer already frees the GPU
        // resources without blowing up the context itself.
        gl.deleteProgram(program);
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        gl.deleteBuffer(positionBuffer);
      };
    } catch (err) {
      console.error("[AnimatedGradient] setup threw:", err);
      setHasWebGLError(true);
      return undefined;
    }
  }, [hasWebGLError, params]);

  if (hasWebGLError) {
    return <WebGLFallback className={cn("absolute inset-0 overflow-hidden", className)} />;
  }

  return (
    <WebGLErrorBoundary fallback={<WebGLFallback className={cn("absolute inset-0 overflow-hidden", className)} />}>
      <div ref={containerRef} className={cn("absolute inset-0 overflow-hidden", className)} style={{ borderRadius: radius, ...style }}>
        <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />
      </div>
    </WebGLErrorBoundary>
  );
}

AnimatedGradient.propTypes = {
  className: PropTypes.string,
  radius: PropTypes.string,
  style: PropTypes.object,
};

// defaultProps removed — React 19 dropped support for defaultProps on
// function components. All defaults are now declared inline above.
