import { useEffect, useRef, useState } from "react";

// ---------------------------------------------------------------------
// Environment guards
// ---------------------------------------------------------------------

// Strict fine-pointer check, independent of viewport width. A touch
// device — including a touchscreen laptop — never gets a listener or a
// render loop attached, guaranteeing zero overhead on phones/tablets.
const supportsFinePointer = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(hover: hover) and (pointer: fine)").matches;

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------------------------------------------------------------------
// Math helpers
// ---------------------------------------------------------------------

const TAU = Math.PI * 2;
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const dist = (ax, ay, bx, by) => Math.hypot(bx - ax, by - ay);
const lerp = (a, b, t) => a + (b - a) * t;

// Shortest-path angle lerp so the body never spins the long way around
// when the target crosses the +-180deg seam.
function lerpAngle(from, to, t) {
  let diff = ((to - from + Math.PI) % TAU) - Math.PI;
  if (diff < -Math.PI) diff += TAU;
  return from + diff * t;
}

// Rotate a body-local offset (x = forward, y = lateral/right) into world
// space given the body's world position and heading angle.
function toWorld(localX, localY, bodyX, bodyY, angle) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    x: bodyX + localX * cos - localY * sin,
    y: bodyY + localX * sin + localY * cos,
  };
}

// Analytic 2-bone IK (law of cosines): given a start joint, a target
// point, and two segment lengths, returns the elbow/knee position that
// reaches (or reaches as close as possible toward) the target, bending
// to the requested side (+1 / -1) of the start->target line.
function solveTwoBoneIK(startX, startY, targetX, targetY, len1, len2, bendSign) {
  let dx = targetX - startX;
  let dy = targetY - startY;
  let d = Math.hypot(dx, dy) || 0.0001;

  // Clamp the target within reach so the chain never mathematically
  // breaks (NaNs) when the foot target is pushed beyond max/min reach.
  const maxReach = len1 + len2 - 0.01;
  const minReach = Math.abs(len1 - len2) + 0.01;
  const dClamped = clamp(d, minReach, maxReach);

  const ux = dx / d;
  const uy = dy / d;
  const endX = startX + ux * dClamped;
  const endY = startY + uy * dClamped;

  // a = distance from start to the foot of the perpendicular where the
  // two circles (radius len1 around start, radius len2 around target)
  // intersect; h = perpendicular half-chord height at that point.
  const a = clamp(
    (len1 * len1 - len2 * len2 + dClamped * dClamped) / (2 * dClamped),
    -len1,
    len1,
  );
  const h = Math.sqrt(Math.max(0, len1 * len1 - a * a));

  const midX = startX + ux * a;
  const midY = startY + uy * a;
  const perpX = -uy * h * bendSign;
  const perpY = ux * h * bendSign;

  return {
    kneeX: midX + perpX,
    kneeY: midY + perpY,
    footX: endX,
    footY: endY,
  };
}

// Slab-method ray/box intersection: returns the point where a ray fired
// from (cx, cy) at angle theta first exits the [0,0,w,h] rectangle. Used
// so every web spoke reaches exactly to the viewport edge regardless of
// aspect ratio.
function rayBoxExit(cx, cy, theta, w, h) {
  const dx = Math.cos(theta);
  const dy = Math.sin(theta);
  let tMax = Infinity;

  if (dx > 1e-6) tMax = Math.min(tMax, (w - cx) / dx);
  else if (dx < -1e-6) tMax = Math.min(tMax, (0 - cx) / dx);

  if (dy > 1e-6) tMax = Math.min(tMax, (h - cy) / dy);
  else if (dy < -1e-6) tMax = Math.min(tMax, (0 - cy) / dy);

  if (!isFinite(tMax) || tMax < 0) tMax = Math.max(w, h);
  return { x: cx + dx * tMax, y: cy + dy * tMax };
}

// ---------------------------------------------------------------------
// Tunables
// ---------------------------------------------------------------------

const COLLISION_RADIUS = 25; // px — head-to-cursor capture distance
const HEAD_FORWARD_OFFSET = 34; // mandibles sit this far ahead of body center
const BODY_LENGTH = 74; // cephalothorax + abdomen footprint
const BODY_WIDTH = 46;

const CREEP_SPEED = 3.1; // px/frame-equivalent, far from target
const STALK_SPEED = 1.35; // px/frame-equivalent, near target
const FAR_NEAR_THRESHOLD = 260; // px
const SPEED_DAMPING = 0.08; // organic accel/decel toward target speed
const TURN_RATE = 0.09; // body heading lerp factor
const IDLE_AFTER_MS = 480; // no mousemove for this long => decelerate to idle

const STEP_THRESHOLD = 34; // px foot must drift before a step triggers
const STEP_DURATION_MIN = 90; // ms
const STEP_DURATION_MAX = 170; // ms
const STEP_LIFT = 13; // px parabolic arc height while stepping
const STANCE_SCALE_TRAPPED = 0.58; // crouched/alert stance once captured

const BREATH_FREQ = 0.0016; // idle breathing oscillation speed
const BREATH_AMOUNT = 0.045; // scale amplitude

// Leg definitions: 8 legs, front-to-back pairs, diagonal alternating
// gait grouping (classic tetrapod-style alternation looks organic for
// an 8-legged gait without needing full biomechanical simulation).
//   side: -1 = left, +1 = right
//   forward: shoulder position along the body's long axis
//   group: 0 / 1 — only one leg per group steps at a time
const LEG_DEFS = [
  { side: -1, forward: 30, group: 0 }, // L1
  { side: 1, forward: 30, group: 1 }, // R1
  { side: -1, forward: 10, group: 1 }, // L2
  { side: 1, forward: 10, group: 0 }, // R2
  { side: -1, forward: -10, group: 0 }, // L3
  { side: 1, forward: -10, group: 1 }, // R3
  { side: -1, forward: -30, group: 1 }, // L4
  { side: 1, forward: -30, group: 0 }, // R4
].map((def, i) => ({
  ...def,
  id: i,
  coxaLen: 14,
  femurLen: 46,
  tibiaLen: 50,
  // Fan the resting foot angle: front legs point forward, rear legs
  // point backward, all legs splayed well out to the side — gives the
  // ~180-220px full leg span called for in the spec.
  restForward: def.forward * 2.05,
  restLateral: def.side * 102,
  phase: (i / 8) * TAU,
}));

// ---------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------

export default function CustomCursor() {
  const [enabled] = useState(() => supportsFinePointer());

  const sceneCanvasRef = useRef(null);
  const raf = useRef(null);

  // Everything below is mutable simulation state kept in refs so the
  // 60fps loop never triggers a React re-render.
  const world = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    const reduceMotion = prefersReducedMotion();
    const sceneCanvas = sceneCanvasRef.current;
    const sceneCtx = sceneCanvas?.getContext("2d");
    if (!sceneCtx) return;

    // Offscreen bitmap the massive web is drawn into exactly once, on
    // capture. It is never cleared afterward — drawImage-ing it each
    // frame is what makes the web "permanently etched" without paying
    // the cost of regenerating hundreds of curve segments every frame.
    const webBitmap = document.createElement("canvas");
    const webCtx = webBitmap.getContext("2d");

    const initialMouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    world.current = {
      dpr: 1,
      viewportW: window.innerWidth,
      viewportH: window.innerHeight,
      mouse: { ...initialMouse },
      lastMouseMoveAt: 0,
      body: {
        x: initialMouse.x - 220,
        y: initialMouse.y - 220,
        angle: 0,
        speed: 0,
      },
      captured: false,
      webCenter: null,
      legs: LEG_DEFS.map((def) => {
        const shoulder = toWorld(
          def.forward,
          def.side * (BODY_WIDTH / 2),
          initialMouse.x - 220,
          initialMouse.y - 220,
          0,
        );
        const rest = toWorld(
          def.restForward,
          def.restLateral,
          initialMouse.x - 220,
          initialMouse.y - 220,
          0,
        );
        return {
          def,
          currentX: rest.x,
          currentY: rest.y,
          shoulderX: shoulder.x,
          shoulderY: shoulder.y,
          stepping: false,
          stepFromX: rest.x,
          stepFromY: rest.y,
          stepToX: rest.x,
          stepToY: rest.y,
          stepStart: 0,
          stepDuration: 130,
        };
      }),
      shockwave: [], // ring/particle burst played once on capture
      hidden: document.hidden,
    };

    // --- Canvas sizing --------------------------------------------------

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      world.current.dpr = dpr;
      world.current.viewportW = w;
      world.current.viewportH = h;

      sceneCanvas.width = w * dpr;
      sceneCanvas.height = h * dpr;
      sceneCanvas.style.width = `${w}px`;
      sceneCanvas.style.height = `${h}px`;
      sceneCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

      webBitmap.width = w * dpr;
      webBitmap.height = h * dpr;
      webCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // If the web was already spun before a resize, redraw it at the
      // same anchor point against the new viewport bounds so it still
      // reaches every corner/edge.
      if (world.current.captured && world.current.webCenter) {
        drawMassiveWeb(webCtx, world.current.webCenter.x, world.current.webCenter.y, w, h, reduceMotion);
      }
    };
    resize();
    window.addEventListener("resize", resize);

    // --- Input ------------------------------------------------------------

    const handleMove = (e) => {
      world.current.mouse.x = e.clientX;
      world.current.mouse.y = e.clientY;
      world.current.lastMouseMoveAt = performance.now();
    };
    window.addEventListener("mousemove", handleMove, { passive: true });

    const handleVisibility = () => {
      world.current.hidden = document.hidden;
      if (!document.hidden && raf.current == null) {
        raf.current = requestAnimationFrame(loop);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    // --- Web generation (runs exactly once, on capture) -----------------

    function drawWebStrand(ctx, ax, ay, bx, by, sagAmount) {
      const nx = -(by - ay);
      const ny = bx - ax;
      const nLen = Math.hypot(nx, ny) || 1;
      const midX = (ax + bx) / 2 + (nx / nLen) * sagAmount;
      const midY = (ay + by) / 2 + (ny / nLen) * sagAmount;

      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.quadraticCurveTo(midX, midY, bx, by);
      ctx.strokeStyle = "rgba(244, 246, 251, 0.8)";
      ctx.lineWidth = 1.1;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.quadraticCurveTo(midX + (nx / nLen) * 1.4, midY + (ny / nLen) * 1.4, bx, by);
      ctx.strokeStyle = "rgba(0, 210, 255, 0.22)";
      ctx.lineWidth = 0.7;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.quadraticCurveTo(midX - (nx / nLen) * 1.4, midY - (ny / nLen) * 1.4, bx, by);
      ctx.strokeStyle = "rgba(229, 27, 35, 0.18)";
      ctx.lineWidth = 0.7;
      ctx.stroke();

      return { midX, midY };
    }

    function drawMassiveWeb(ctx, cx, cy, w, h, reduce) {
      ctx.clearRect(0, 0, w, h);

      const SPOKE_COUNT = reduce ? 10 : 18;
      const spokeAngles = [];
      for (let i = 0; i < SPOKE_COUNT; i++) spokeAngles.push((i / SPOKE_COUNT) * TAU);

      // Explicit corner anchors (screen-covering, anchored to all 4
      // corners as specified) merged in alongside the evenly spaced ring.
      const cornerAngles = [
        Math.atan2(0 - cy, 0 - cx),
        Math.atan2(0 - cy, w - cx),
        Math.atan2(h - cy, 0 - cx),
        Math.atan2(h - cy, w - cx),
      ];
      const allAngles = [...spokeAngles, ...cornerAngles].sort((a, b) => a - b);

      const spokePoints = allAngles.map((theta) => rayBoxExit(cx, cy, theta, w, h));

      // Radial spokes, center -> edge/corner
      spokePoints.forEach((p) => {
        const d = dist(cx, cy, p.x, p.y);
        drawWebStrand(ctx, cx, cy, p.x, p.y, reduce ? 0 : d * 0.012 * (Math.random() < 0.5 ? 1 : -1));
      });

      // Concentric orb-weave rings connecting consecutive spokes at
      // increasing radius fractions, with organic sag on every segment.
      const ringFractions = reduce ? [0.35, 0.7, 1] : [0.14, 0.28, 0.44, 0.6, 0.76, 0.9, 1];
      ringFractions.forEach((frac) => {
        for (let i = 0; i < spokePoints.length; i++) {
          const p1 = spokePoints[i];
          const p2 = spokePoints[(i + 1) % spokePoints.length];
          const ax = cx + (p1.x - cx) * frac;
          const ay = cy + (p1.y - cy) * frac;
          const bx = cx + (p2.x - cx) * frac;
          const by = cy + (p2.y - cy) * frac;
          const segLen = dist(ax, ay, bx, by);
          drawWebStrand(ctx, ax, ay, bx, by, reduce ? 0 : segLen * 0.05);
        }
      });

      if (!reduce) {
        // Micro-filament cross-ties: short connectors tying adjacent
        // rings together for texture, concentrated more densely near
        // the hub the way a real orb-weaver reinforces the center.
        ctx.strokeStyle = "rgba(244, 246, 251, 0.28)";
        ctx.lineWidth = 0.6;
        for (let ring = 0; ring < ringFractions.length - 1; ring++) {
          const fracA = ringFractions[ring];
          const fracB = ringFractions[ring + 1];
          const density = ring < 2 ? spokePoints.length : Math.floor(spokePoints.length / 2);
          for (let i = 0; i < density; i++) {
            const idx = Math.floor((i / density) * spokePoints.length);
            const p = spokePoints[idx];
            const ax = cx + (p.x - cx) * fracA + (Math.random() - 0.5) * 6;
            const ay = cy + (p.y - cy) * fracA + (Math.random() - 0.5) * 6;
            const bx = cx + (p.x - cx) * fracB + (Math.random() - 0.5) * 6;
            const by = cy + (p.y - cy) * fracB + (Math.random() - 0.5) * 6;
            ctx.beginPath();
            ctx.moveTo(ax, ay);
            ctx.lineTo(bx, by);
            ctx.stroke();
          }
        }

        // Dense hub spiral right around the capture point.
        ctx.beginPath();
        const turns = 3.2;
        const steps = 90;
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          const angle = t * turns * TAU;
          const r = t * 34;
          const px = cx + Math.cos(angle) * r;
          const py = cy + Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = "rgba(0, 210, 255, 0.45)";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Static silk debris particles scattered out from the hub.
        for (let i = 0; i < 60; i++) {
          const angle = Math.random() * TAU;
          const r = Math.random() * Math.min(w, h) * 0.42;
          const px = cx + Math.cos(angle) * r;
          const py = cy + Math.sin(angle) * r;
          const alpha = Math.max(0.05, 0.45 - r / (Math.min(w, h) * 0.9));
          ctx.beginPath();
          ctx.arc(px, py, Math.random() * 1.1 + 0.3, 0, TAU);
          ctx.fillStyle = `rgba(244, 246, 251, ${alpha.toFixed(3)})`;
          ctx.fill();
        }
      }

      // Impact core glow at the capture point.
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 30);
      glow.addColorStop(0, "rgba(229, 27, 35, 0.55)");
      glow.addColorStop(1, "rgba(229, 27, 35, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, 30, 0, TAU);
      ctx.fill();
    }

    function triggerCapture(mx, my) {
      const w = world.current;
      w.captured = true;
      w.webCenter = { x: mx, y: my };
      drawMassiveWeb(webCtx, mx, my, w.viewportW, w.viewportH, reduceMotion);

      if (!reduceMotion) {
        const now = performance.now();
        w.shockwave.push({ type: "ring", bornAt: now, life: 480 });
        const burstCount = 22;
        for (let i = 0; i < burstCount; i++) {
          const angle = Math.random() * TAU;
          const speed = 2.2 + Math.random() * 4.5;
          w.shockwave.push({
            type: "particle",
            x: mx,
            y: my,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            bornAt: now,
            life: 380 + Math.random() * 260,
          });
        }
      }
    }

    // --- Body drawing -----------------------------------------------------

    function drawLeg(ctx, shoulderX, shoulderY, footX, footY, def, now) {
      const bendSign = def.side; // left legs bend one way, right the other
      const coxaAngle = Math.atan2(footY - shoulderY, footX - shoulderX);
      const coxaEndX = shoulderX + Math.cos(coxaAngle) * def.coxaLen;
      const coxaEndY = shoulderY + Math.sin(coxaAngle) * def.coxaLen;

      const ik = solveTwoBoneIK(
        coxaEndX,
        coxaEndY,
        footX,
        footY,
        def.femurLen,
        def.tibiaLen,
        bendSign,
      );

      ctx.lineJoin = "round";
      ctx.lineCap = "round";

      // Ground contact shadow
      ctx.beginPath();
      ctx.ellipse(footX, footY + 1.5, 4.5, 2.2, 0, 0, TAU);
      ctx.fillStyle = "rgba(5, 14, 26, 0.35)";
      ctx.fill();

      // Coxa
      ctx.beginPath();
      ctx.moveTo(shoulderX, shoulderY);
      ctx.lineTo(coxaEndX, coxaEndY);
      ctx.strokeStyle = "#0b1f3a";
      ctx.lineWidth = 5;
      ctx.stroke();

      // Femur
      ctx.beginPath();
      ctx.moveTo(coxaEndX, coxaEndY);
      ctx.lineTo(ik.kneeX, ik.kneeY);
      ctx.strokeStyle = "#0b1f3a";
      ctx.lineWidth = 4.2;
      ctx.stroke();

      // Femur crimson accent edge
      ctx.beginPath();
      ctx.moveTo(coxaEndX, coxaEndY);
      ctx.lineTo(ik.kneeX, ik.kneeY);
      ctx.strokeStyle = "rgba(229, 27, 35, 0.5)";
      ctx.lineWidth = 1.1;
      ctx.stroke();

      // Tibia (thinner, tapered look)
      ctx.beginPath();
      ctx.moveTo(ik.kneeX, ik.kneeY);
      ctx.lineTo(ik.footX, ik.footY);
      ctx.strokeStyle = "#13345d";
      ctx.lineWidth = 2.6;
      ctx.stroke();

      // Knee joint highlight
      ctx.beginPath();
      ctx.arc(ik.kneeX, ik.kneeY, 2.4, 0, TAU);
      ctx.fillStyle = "rgba(0, 210, 255, 0.55)";
      ctx.fill();

      // Foot tip
      ctx.beginPath();
      ctx.arc(ik.footX, ik.footY, 1.6, 0, TAU);
      ctx.fillStyle = "#e51b23";
      ctx.fill();
    }

    function drawBody(ctx, body, breathScale, captured) {
      ctx.save();
      ctx.translate(body.x, body.y);
      ctx.rotate(body.angle);

      // Abdomen (rear)
      ctx.save();
      ctx.translate(-BODY_LENGTH * 0.34, 0);
      ctx.scale(breathScale, breathScale);
      ctx.beginPath();
      ctx.ellipse(0, 0, BODY_LENGTH * 0.4, BODY_WIDTH * 0.46, 0, 0, TAU);
      const abdomenGrad = ctx.createRadialGradient(-6, -6, 2, 0, 0, BODY_LENGTH * 0.4);
      abdomenGrad.addColorStop(0, "#13345d");
      abdomenGrad.addColorStop(1, "#050e1a");
      ctx.fillStyle = abdomenGrad;
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "rgba(229, 27, 35, 0.55)";
      ctx.stroke();
      // Carapace crimson chevron accents
      ctx.beginPath();
      ctx.moveTo(-14, 0);
      ctx.lineTo(4, -9);
      ctx.moveTo(-14, 0);
      ctx.lineTo(4, 9);
      ctx.moveTo(2, 0);
      ctx.lineTo(18, -7);
      ctx.moveTo(2, 0);
      ctx.lineTo(18, 7);
      ctx.strokeStyle = captured ? "rgba(229, 27, 35, 0.9)" : "rgba(229, 27, 35, 0.65)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      // Cephalothorax (front)
      ctx.save();
      ctx.translate(BODY_LENGTH * 0.28, 0);
      ctx.scale(breathScale, breathScale);
      ctx.beginPath();
      ctx.ellipse(0, 0, BODY_LENGTH * 0.28, BODY_WIDTH * 0.36, 0, 0, TAU);
      const headGrad = ctx.createRadialGradient(4, -4, 1, 0, 0, BODY_LENGTH * 0.3);
      headGrad.addColorStop(0, "#1b4a7a");
      headGrad.addColorStop(1, "#0b1f3a");
      ctx.fillStyle = headGrad;
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "rgba(0, 210, 255, 0.45)";
      ctx.stroke();

      // Ocular nodes — glowing cyan, brighter/alert when trapped
      const eyePositions = [
        [10, -7],
        [10, 7],
        [4, -11],
        [4, 11],
      ];
      eyePositions.forEach(([ex, ey]) => {
        ctx.beginPath();
        ctx.arc(ex, ey, captured ? 2.2 : 1.7, 0, TAU);
        ctx.fillStyle = captured ? "rgba(0, 210, 255, 0.95)" : "rgba(0, 210, 255, 0.8)";
        ctx.shadowColor = "rgba(0, 210, 255, 0.9)";
        ctx.shadowBlur = captured ? 7 : 4;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Mandibles
      ctx.beginPath();
      ctx.moveTo(16, -4);
      ctx.lineTo(24, -2);
      ctx.moveTo(16, 4);
      ctx.lineTo(24, 2);
      ctx.strokeStyle = "#e51b23";
      ctx.lineWidth = 1.6;
      ctx.stroke();
      ctx.restore();

      ctx.restore();
    }

    // --- Main loop ----------------------------------------------------------

    const loop = () => {
      const w = world.current;
      if (w.hidden) {
        raf.current = null;
        return;
      }

      const now = performance.now();
      const idle = now - w.lastMouseMoveAt > IDLE_AFTER_MS;

      // Look target always follows the raw mouse (head keeps tracking
      // the cursor even once trapped, per spec's micro-vibration note).
      const lookX = w.mouse.x;
      const lookY = w.mouse.y;

      // Move target is the mouse while hunting, and pins to the fixed
      // web center forever once captured, so the body naturally
      // decelerates to a stop right at the web hub and never drifts.
      const moveX = w.captured ? w.webCenter.x : w.mouse.x;
      const moveY = w.captured ? w.webCenter.y : w.mouse.y;

      // --- Steering ---
      const desiredAngle = Math.atan2(lookY - w.body.y, lookX - w.body.x);
      w.body.angle = reduceMotion
        ? desiredAngle
        : lerpAngle(w.body.angle, desiredAngle, TURN_RATE);

      const distToMove = dist(w.body.x, w.body.y, moveX, moveY);
      let desiredSpeed;
      if (idle || w.captured) {
        desiredSpeed = 0;
      } else {
        desiredSpeed = distToMove > FAR_NEAR_THRESHOLD ? CREEP_SPEED : STALK_SPEED;
      }
      // Never overshoot: ease out as we approach the target itself.
      desiredSpeed = Math.min(desiredSpeed, distToMove * 0.15);

      w.body.speed = reduceMotion
        ? desiredSpeed
        : lerp(w.body.speed, desiredSpeed, SPEED_DAMPING);

      if (distToMove > 0.5 && w.body.speed > 0.01) {
        const moveAngle = Math.atan2(moveY - w.body.y, moveX - w.body.x);
        const step = Math.min(w.body.speed, distToMove);
        w.body.x += Math.cos(moveAngle) * step;
        w.body.y += Math.sin(moveAngle) * step;
      }

      // --- Collision detection (only while still hunting) ---
      const headX = w.body.x + Math.cos(w.body.angle) * HEAD_FORWARD_OFFSET;
      const headY = w.body.y + Math.sin(w.body.angle) * HEAD_FORWARD_OFFSET;
      if (!w.captured && dist(headX, headY, w.mouse.x, w.mouse.y) < COLLISION_RADIUS) {
        triggerCapture(w.mouse.x, w.mouse.y);
      }

      // --- Leg IK + gait ---
      const stanceScale = w.captured ? STANCE_SCALE_TRAPPED : 1;
      const groupBusy = [false, false];
      w.legs.forEach((leg) => {
        if (leg.stepping) groupBusy[leg.def.group] = true;
      });

      w.legs.forEach((leg) => {
        const shoulder = toWorld(
          leg.def.forward,
          leg.def.side * (BODY_WIDTH / 2),
          w.body.x,
          w.body.y,
          w.body.angle,
        );
        leg.shoulderX = shoulder.x;
        leg.shoulderY = shoulder.y;

        const ideal = toWorld(
          leg.def.restForward * stanceScale,
          leg.def.restLateral * stanceScale,
          w.body.x,
          w.body.y,
          w.body.angle,
        );

        if (leg.stepping) {
          const t = reduceMotion
            ? 1
            : clamp((now - leg.stepStart) / leg.stepDuration, 0, 1);
          if (t >= 1) {
            leg.currentX = leg.stepToX;
            leg.currentY = leg.stepToY;
            leg.stepping = false;
          } else {
            const lift = Math.sin(t * Math.PI) * STEP_LIFT;
            leg.renderX = lerp(leg.stepFromX, leg.stepToX, t);
            leg.renderY = lerp(leg.stepFromY, leg.stepToY, t) - lift;
          }
        }

        if (!leg.stepping) {
          leg.renderX = leg.currentX;
          leg.renderY = leg.currentY;

          const drift = dist(leg.currentX, leg.currentY, ideal.x, ideal.y);
          if (drift > STEP_THRESHOLD && !groupBusy[leg.def.group] && !idle) {
            // Step slightly past the ideal point, in the direction of
            // travel, so the foot doesn't immediately need to re-step
            // (anticipatory placement — a hallmark of natural gaits).
            const travelAngle = w.body.angle;
            const overshoot = Math.min(drift * 0.4, 22);
            leg.stepFromX = leg.currentX;
            leg.stepFromY = leg.currentY;
            leg.stepToX = ideal.x + Math.cos(travelAngle) * overshoot * (w.captured ? 0 : 1);
            leg.stepToY = ideal.y + Math.sin(travelAngle) * overshoot * (w.captured ? 0 : 1);
            leg.stepStart = now;
            leg.stepDuration = reduceMotion
              ? 1
              : STEP_DURATION_MIN +
                Math.random() * (STEP_DURATION_MAX - STEP_DURATION_MIN);
            leg.stepping = true;
            groupBusy[leg.def.group] = true;
          }
        }

        // Trapped micro-vibration: tiny per-leg twitch, amplified when
        // the mouse is close to the web (the spider "reacting" to it)
        // without ever letting the foot leave its planted position by
        // more than a couple of pixels.
        if (w.captured && !reduceMotion) {
          const proximity = clamp(
            1 - dist(w.mouse.x, w.mouse.y, w.webCenter.x, w.webCenter.y) / 260,
            0,
            1,
          );
          const amp = 0.6 + proximity * 2.2;
          leg.renderX =
            (leg.stepping ? leg.renderX : leg.currentX) +
            Math.sin(now * 0.02 + leg.def.phase) * amp;
          leg.renderY =
            (leg.stepping ? leg.renderY : leg.currentY) +
            Math.cos(now * 0.017 + leg.def.phase) * amp;
        }
      });

      // --- Render ---
      sceneCtx.clearRect(0, 0, w.viewportW, w.viewportH);

      if (w.captured) {
        sceneCtx.drawImage(webBitmap, 0, 0, w.viewportW, w.viewportH);
      }

      // Shockwave burst (plays once, then self-removes)
      if (w.shockwave.length) {
        w.shockwave = w.shockwave.filter((p) => now - p.bornAt < p.life);
        w.shockwave.forEach((p) => {
          const t = (now - p.bornAt) / p.life;
          if (p.type === "ring") {
            sceneCtx.beginPath();
            sceneCtx.arc(w.webCenter.x, w.webCenter.y, 6 + t * 90, 0, TAU);
            sceneCtx.strokeStyle = `rgba(0, 210, 255, ${(1 - t) * 0.8})`;
            sceneCtx.lineWidth = 3 * (1 - t) + 0.5;
            sceneCtx.stroke();
            sceneCtx.beginPath();
            sceneCtx.arc(w.webCenter.x, w.webCenter.y, 3 + t * 60, 0, TAU);
            sceneCtx.strokeStyle = `rgba(229, 27, 35, ${(1 - t) * 0.7})`;
            sceneCtx.lineWidth = 2 * (1 - t) + 0.5;
            sceneCtx.stroke();
          } else {
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.96;
            p.vy *= 0.96;
            sceneCtx.beginPath();
            sceneCtx.arc(p.x, p.y, 1.6 * (1 - t) + 0.3, 0, TAU);
            sceneCtx.fillStyle = `rgba(244, 246, 251, ${(1 - t) * 0.9})`;
            sceneCtx.fill();
          }
        });
      }

      // Legs behind the body
      w.legs.forEach((leg) => {
        drawLeg(sceneCtx, leg.shoulderX, leg.shoulderY, leg.renderX, leg.renderY, leg.def, now);
      });

      const breathScale = reduceMotion
        ? 1
        : 1 + Math.sin(now * BREATH_FREQ) * BREATH_AMOUNT;
      drawBody(sceneCtx, w.body, breathScale, w.captured);

      raf.current = requestAnimationFrame(loop);
    };

    raf.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMove);
      document.removeEventListener("visibilitychange", handleVisibility);
      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current = null;
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <canvas
      ref={sceneCanvasRef}
      className="spider-scene-canvas fixed inset-0 pointer-events-none z-[9998]"
      aria-hidden="true"
    />
  );
}
