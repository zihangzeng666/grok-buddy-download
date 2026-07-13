/**
 * Live pixel pet + full-page mood theme.
 * Performance: one offscreen draw → blit; color lerp; full pause when hidden;
 * throttle CSS vars; fewer floating bits; reduced-motion short-circuit.
 */
(function () {
  "use strict";

  const MOODS = [
    {
      id: "idle",
      label: "Idle",
      speech: "Stand by — nothing run yet…",
      stage: "Stand by",
      pct: "0%",
      progress: 0.06,
      primary: [0.45, 0.85, 0.95],
      secondary: [0.25, 0.55, 0.85],
      belly: [0.75, 0.95, 1.0],
      outline: [0.15, 0.35, 0.55],
      accent: [1.0, 0.55, 0.75],
      glow: [0.55, 0.95, 1.0],
      cheek: [1.0, 0.6, 0.7],
      fps: 3,
    },
    {
      id: "thinking",
      label: "Thinking",
      speech: "Thinking hard about the next step…",
      stage: "Reasoning",
      pct: "~35%",
      progress: 0.35,
      primary: [0.65, 0.45, 0.95],
      secondary: [0.35, 0.25, 0.7],
      belly: [0.85, 0.75, 1.0],
      outline: [0.25, 0.15, 0.45],
      accent: [1.0, 0.85, 0.3],
      glow: [0.75, 0.55, 1.0],
      cheek: [0.95, 0.55, 0.85],
      fps: 5,
    },
    {
      id: "working",
      label: "Working",
      speech: "Busy with tools right now…",
      stage: "Running tools",
      pct: "~62%",
      progress: 0.62,
      primary: [0.25, 0.95, 0.55],
      secondary: [0.1, 0.55, 0.35],
      belly: [0.55, 1.0, 0.75],
      outline: [0.05, 0.3, 0.18],
      accent: [1.0, 0.9, 0.2],
      glow: [0.2, 1.0, 0.7],
      cheek: [0.4, 0.9, 0.5],
      fps: 7,
    },
    {
      id: "speaking",
      label: "Speaking",
      speech: "Writing the reply…",
      stage: "Writing",
      pct: "~78%",
      progress: 0.78,
      primary: [1.0, 0.55, 0.85],
      secondary: [0.75, 0.25, 0.55],
      belly: [1.0, 0.8, 0.9],
      outline: [0.45, 0.12, 0.35],
      accent: [0.4, 0.95, 1.0],
      glow: [1.0, 0.7, 0.95],
      cheek: [1.0, 0.4, 0.55],
      fps: 6,
    },
    {
      id: "permission",
      label: "Needs you",
      speech: "Waiting for you to approve something…",
      stage: "Permission",
      pct: "~50%",
      progress: 0.5,
      primary: [1.0, 0.75, 0.2],
      secondary: [0.85, 0.45, 0.1],
      belly: [1.0, 0.92, 0.55],
      outline: [0.55, 0.3, 0.05],
      accent: [1.0, 0.35, 0.25],
      glow: [1.0, 0.85, 0.35],
      cheek: [1.0, 0.55, 0.3],
      fps: 5,
    },
    {
      id: "done",
      label: "Done",
      speech: "Done! Last task finished.",
      stage: "Last task finished",
      pct: "100%",
      progress: 1,
      primary: [0.4, 1.0, 0.55],
      secondary: [0.15, 0.7, 0.4],
      belly: [0.75, 1.0, 0.8],
      outline: [0.08, 0.4, 0.22],
      accent: [1.0, 0.85, 0.25],
      glow: [0.55, 1.0, 0.75],
      cheek: [1.0, 0.55, 0.65],
      fps: 4,
    },
  ];

  const KEYS = ["primary", "secondary", "belly", "outline", "accent", "glow", "cheek"];

  const SHAPES = {
    idle: [
      [0,0,0,0,0,2,2,0,0,2,2,0,0,0,0,0],[0,0,0,0,2,1,1,2,2,1,1,2,0,0,0,0],
      [0,0,0,2,1,1,1,1,1,1,1,1,2,0,0,0],[0,0,2,1,1,1,1,1,1,1,1,1,1,2,0,0],
      [0,2,1,1,7,7,1,1,1,1,7,7,1,1,2,0],[0,2,1,7,7,7,1,1,1,1,7,7,7,1,2,0],
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],[2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,1,1,1,1,1,7,7,7,7,1,1,1,1,1,2],[2,1,1,1,1,7,7,7,7,7,7,1,1,1,1,2],
      [0,2,1,1,1,7,7,7,7,7,7,1,1,1,2,0],[0,2,1,1,1,1,7,7,7,7,1,1,1,1,2,0],
      [0,0,2,1,1,1,1,1,1,1,1,1,1,2,0,0],[0,0,0,2,1,1,1,1,1,1,1,1,2,0,0,0],
      [0,0,0,2,9,9,2,2,2,2,9,9,2,0,0,0],[0,0,0,0,2,2,0,0,0,0,2,2,0,0,0,0],
    ],
    thinking: [
      [0,0,0,0,0,0,0,5,5,0,0,0,0,0,0,0],[0,0,0,0,0,0,2,1,1,2,0,0,0,0,0,0],
      [0,0,0,0,0,2,1,1,1,1,2,0,0,0,0,0],[0,0,0,0,2,9,1,1,1,1,9,2,0,0,0,0],
      [0,0,0,2,1,1,1,1,1,1,1,1,2,0,0,0],[0,0,2,1,1,7,7,1,1,7,7,1,1,2,0,0],
      [0,2,1,1,1,1,1,1,1,1,1,1,1,1,2,0],[0,2,1,1,1,1,1,1,1,1,1,1,1,1,2,0],
      [2,1,1,1,1,1,1,7,7,1,1,1,1,1,1,2],[2,1,1,1,1,1,7,7,7,7,1,1,1,1,1,2],
      [0,2,1,1,1,1,7,7,7,7,1,1,1,1,2,0],[0,2,9,1,1,1,1,1,1,1,1,1,1,9,2,0],
      [0,0,2,9,1,1,1,1,1,1,1,1,9,2,0,0],[0,0,0,2,2,1,1,1,1,1,1,2,2,0,0,0],
      [0,0,0,0,2,9,9,2,2,9,9,2,0,0,0,0],[0,0,0,0,0,2,2,0,0,2,2,0,0,0,0,0],
    ],
    working: [
      [0,0,0,0,2,2,5,5,5,5,2,2,0,0,0,0],[0,0,0,2,9,9,9,9,9,9,9,9,2,0,0,0],
      [0,0,2,9,1,1,1,1,1,1,1,1,9,2,0,0],[0,2,9,1,1,1,1,1,1,1,1,1,1,9,2,0],
      [0,2,1,1,1,1,1,1,1,1,1,1,1,1,2,0],[2,1,1,1,7,7,1,1,1,1,7,7,1,1,1,2],
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],[2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,1,1,1,1,1,5,5,5,5,1,1,1,1,1,2],[2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [0,2,1,1,7,7,7,7,7,7,7,7,1,1,2,0],[0,2,9,1,7,7,7,7,7,7,7,7,1,9,2,0],
      [0,0,2,9,1,1,1,1,1,1,1,1,9,2,0,0],[0,0,2,2,9,9,2,2,2,2,9,9,2,2,0,0],
      [0,0,2,5,2,0,0,0,0,0,0,2,5,2,0,0],[0,0,2,2,0,0,0,0,0,0,0,0,2,2,0,0],
    ],
    speaking: [
      [0,2,2,0,0,0,0,0,0,0,0,0,2,2,0,0],[2,5,1,2,0,0,0,0,0,0,0,2,1,5,2,0],
      [2,1,1,1,2,0,0,0,0,0,2,1,1,1,2,0],[0,2,1,1,1,2,2,2,2,2,1,1,1,2,0,0],
      [0,2,1,1,1,1,1,1,1,1,1,1,1,2,0,0],[2,1,1,7,7,1,1,1,1,1,1,7,7,1,1,2],
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],[2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],[2,1,1,1,1,7,7,7,7,7,7,1,1,1,1,2],
      [0,2,1,1,7,7,7,7,7,7,7,7,1,1,2,0],[0,2,1,1,1,7,7,7,7,7,7,1,1,1,2,0],
      [0,0,2,1,1,1,1,1,1,1,1,1,1,2,0,0],[0,0,0,2,1,1,1,1,1,1,1,1,2,0,0,0],
      [0,0,0,2,9,1,2,2,2,2,1,9,2,0,0,0],[0,0,0,0,2,2,0,0,0,0,2,2,0,0,0,0],
    ],
    permission: [
      [0,0,0,0,0,0,0,2,2,0,0,0,0,0,0,0],[0,0,0,0,0,0,2,1,1,2,0,0,0,0,0,0],
      [0,0,0,0,0,2,1,1,1,1,2,0,0,0,0,0],[0,0,0,0,2,1,1,5,5,1,1,2,0,0,0,0],
      [0,0,0,2,1,1,1,1,1,1,1,1,2,0,0,0],[0,0,2,1,1,7,7,1,1,7,7,1,1,2,0,0],
      [0,2,1,1,1,1,1,1,1,1,1,1,1,1,2,0],[2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],[0,2,1,1,1,1,7,7,7,7,1,1,1,1,2,0],
      [0,0,2,1,1,7,7,7,7,7,7,1,1,2,0,0],[0,0,0,2,1,1,7,7,7,7,1,1,2,0,0,0],
      [0,0,0,0,2,1,1,1,1,1,1,2,0,0,0,0],[0,0,0,0,0,2,1,1,1,1,2,0,0,0,0,0],
      [0,0,0,0,0,2,9,2,2,9,2,0,0,0,0,0],[0,0,0,0,0,0,2,0,0,2,0,0,0,0,0,0],
    ],
    done: [
      [0,0,0,0,0,0,5,5,5,5,0,0,0,0,0,0],[0,0,0,0,0,2,1,1,1,1,2,0,0,0,0,0],
      [0,0,5,0,2,1,1,1,1,1,1,2,0,5,0,0],[0,0,0,2,1,1,1,1,1,1,1,1,2,0,0,0],
      [0,0,2,1,1,7,7,1,1,7,7,1,1,2,0,0],[0,2,1,1,7,7,1,1,1,1,7,7,1,1,2,0],
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],[2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,1,1,1,1,1,7,7,7,7,1,1,1,1,1,2],[0,2,1,1,1,7,7,7,7,7,7,1,1,1,2,0],
      [0,2,1,1,1,7,7,7,7,7,7,1,1,1,2,0],[0,0,2,1,1,1,1,1,1,1,1,1,1,2,0,0],
      [0,0,0,2,1,1,1,1,1,1,1,1,2,0,0,0],[0,0,0,2,9,1,2,2,2,2,1,9,2,0,0,0],
      [0,0,5,0,2,2,0,0,0,0,2,2,0,5,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    ],
  };

  function cloneGrid(g) {
    return g.map((r) => r.slice());
  }

  function applyFace(s, moodId, frame) {
    if (moodId === "idle") {
      s[6][5] = 2; s[6][6] = 2; s[6][9] = 2; s[6][10] = 2;
      s[7][5] = 3; s[7][6] = 4; s[7][9] = 3; s[7][10] = 4;
      s[9][6] = 8; s[9][9] = 8;
    } else if (moodId === "thinking") {
      s[6][5] = 3; s[6][6] = 4; s[6][9] = 3; s[6][10] = 4;
      s[7][5] = 3; s[7][6] = 3; s[7][9] = 3; s[7][10] = 3;
      if (frame % 2 === 0) { s[5][6] = 4; s[5][10] = 4; }
    } else if (moodId === "working") {
      s[6][5] = 4; s[6][6] = 4; s[6][9] = 4; s[6][10] = 4;
      s[7][5] = 6; s[7][6] = 4; s[7][9] = 6; s[7][10] = 4;
    } else if (moodId === "speaking") {
      s[6][5] = 3; s[6][6] = 4; s[6][9] = 3; s[6][10] = 4;
      s[9][6] = 4; s[9][7] = 4; s[9][8] = 4; s[9][9] = 4;
      if (frame % 2 === 0) { s[10][7] = 4; s[10][8] = 4; }
      s[8][5] = 8; s[8][10] = 8;
    } else if (moodId === "permission") {
      s[6][5] = 3; s[6][6] = 3; s[6][9] = 3; s[6][10] = 3;
      s[7][5] = 3; s[7][6] = 4; s[7][9] = 3; s[7][10] = 4;
      s[9][7] = 4; s[9][8] = 4;
    } else if (moodId === "done") {
      s[6][5] = 2; s[6][6] = 1; s[7][5] = 1; s[7][6] = 2;
      s[6][9] = 1; s[6][10] = 2; s[7][9] = 2; s[7][10] = 1;
      s[9][6] = 2; s[9][7] = 1; s[9][8] = 1; s[9][9] = 2;
      s[10][7] = 2; s[10][8] = 2;
      s[8][5] = 8; s[8][10] = 8;
    }
  }

  function applyFX(s, moodId, frame) {
    if (moodId === "thinking") {
      const dots = [[1, 12], [0, 13], [2, 14], [1, 14]];
      const d = dots[frame % 4];
      s[d[0]][d[1]] = 5;
      if (frame % 2 === 0) s[0][11] = 6;
    } else if (moodId === "working") {
      const gear = [[2, 2], [2, 13], [13, 2], [13, 13]];
      const g = gear[frame % 4];
      s[g[0]][g[1]] = 5;
      s[1][7] = frame % 2 === 0 ? 6 : 5;
      s[1][8] = frame % 2 === 0 ? 5 : 6;
    } else if (moodId === "speaking") {
      if (frame % 2 === 0) { s[4][13] = 6; s[5][14] = 5; }
      else { s[5][13] = 5; s[6][14] = 6; }
    } else if (moodId === "permission") {
      s[0][7] = 5; s[1][7] = 5; s[2][7] = frame % 2 === 0 ? 5 : 0; s[3][7] = 5;
    } else if (moodId === "done") {
      if (frame % 2 === 0) { s[0][3] = 5; s[0][12] = 6; s[2][1] = 6; }
      else { s[1][2] = 6; s[1][13] = 5; s[3][14] = 5; }
    } else if (moodId === "idle") {
      if (frame === 0) s[3][3] = 6;
      if (frame === 2) s[3][12] = 6;
    }
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function lerpTriplet(a, b, t) {
    return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
  }

  function blendMood(from, to, t) {
    const out = {
      id: t < 0.5 ? from.id : to.id,
      label: t < 0.5 ? from.label : to.label,
      speech: t < 0.5 ? from.speech : to.speech,
      stage: t < 0.5 ? from.stage : to.stage,
      pct: t < 0.5 ? from.pct : to.pct,
      progress: lerp(from.progress, to.progress, t),
      fps: lerp(from.fps, to.fps, t),
    };
    for (let i = 0; i < KEYS.length; i++) {
      const k = KEYS[i];
      out[k] = lerpTriplet(from[k], to[k], t);
    }
    return out;
  }

  function cssRgb(t) {
    return "rgb(" + ((t[0] * 255 + 0.5) | 0) + "," + ((t[1] * 255 + 0.5) | 0) + "," + ((t[2] * 255 + 0.5) | 0) + ")";
  }

  function cellColor(v, mood) {
    switch (v) {
      case 1: return mood.primary;
      case 2: return mood.outline;
      case 3: return [1, 1, 1];
      case 4: return [0.08, 0.1, 0.12];
      case 5: return mood.accent;
      case 6: return mood.glow;
      case 7: return mood.belly;
      case 8: return mood.cheek;
      case 9: return mood.secondary;
      default: return null;
    }
  }

  function bounceFor(moodId, frame) {
    if (moodId === "idle") return frame === 1 || frame === 3 ? -1 : 0;
    if (moodId === "working" || moodId === "thinking" || moodId === "speaking") {
      return frame % 2 === 0 ? -1 : 0;
    }
    if (moodId === "done") return frame === 0 ? -2 : 0;
    return 0;
  }

  function drawPet(ctx, mood, frame, bouncePx) {
    const size = ctx.canvas.width;
    const cell = Math.max(4, (size / 18) | 0);
    const grid = 16 * cell;
    const ox = ((size - grid) / 2) | 0;
    const oy = (((size - grid) / 2) | 0) + bouncePx;

    ctx.clearRect(0, 0, size, size);

    const glow = mood.glow;
    ctx.fillStyle =
      "rgba(" +
      ((glow[0] * 255) | 0) +
      "," +
      ((glow[1] * 255) | 0) +
      "," +
      ((glow[2] * 255) | 0) +
      ",0.16)";
    ctx.fillRect(ox - cell, oy - cell, grid + cell * 2, grid + cell * 2);

    const spr = cloneGrid(SHAPES[mood.id] || SHAPES.idle);
    applyFace(spr, mood.id, frame);
    applyFX(spr, mood.id, frame);

    const sh = Math.max(1, (cell / 6) | 0);
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        if (!spr[y][x]) continue;
        ctx.fillStyle = "rgba(0,0,0,0.32)";
        ctx.fillRect(ox + x * cell + sh, oy + y * cell + sh, cell, cell);
      }
    }

    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const c = cellColor(spr[y][x], mood);
        if (!c) continue;
        ctx.fillStyle =
          "rgb(" +
          ((c[0] * 255) | 0) +
          "," +
          ((c[1] * 255) | 0) +
          "," +
          ((c[2] * 255) | 0) +
          ")";
        ctx.fillRect(ox + x * cell, oy + y * cell, cell, cell);
      }
    }
  }

  function reduceMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function boot() {
    const nodes = Array.from(document.querySelectorAll("canvas.pet-live"));
    if (!nodes.length) return;

    const surfaces = nodes.map((c) => {
      const ctx = c.getContext("2d", { alpha: true });
      ctx.imageSmoothingEnabled = false;
      return { canvas: c, ctx: ctx };
    });

    function sizeCanvases() {
      for (let i = 0; i < surfaces.length; i++) {
        const c = surfaces[i].canvas;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const css = c.clientWidth || 144;
        const w = Math.max(48, (css * dpr) | 0);
        if (c.width !== w || c.height !== w) {
          c.width = w;
          c.height = w;
          surfaces[i].ctx.imageSmoothingEnabled = false;
        }
      }
    }
    sizeCanvases();

    const master = document.createElement("canvas");
    const hero = document.getElementById("pet-canvas") || surfaces[0].canvas;
    master.width = hero.width;
    master.height = hero.height;
    const mctx = master.getContext("2d", { alpha: true });
    mctx.imageSmoothingEnabled = false;

    let fromIdx = 0;
    let toIdx = 1;
    let frame = 0;
    let lastFrameAt = 0;
    let blendStart = 0;
    const holdMs = 2600;
    const blendMs = 780;
    let phase = "hold";
    let phaseStart = 0;
    let raf = 0;
    let lastUiLabel = "";
    let lastThemeKey = "";
    let lastThemeAt = 0;
    let running = false;

    const speechEl = document.getElementById("buddy-speech");
    const moodEl = document.getElementById("buddy-mood");
    const chrome = document.getElementById("chrome-mood");
    const statusName = document.getElementById("status-name");
    const statusPct = document.getElementById("status-pct");
    const statusStage = document.getElementById("status-stage");
    const statusBar = document.getElementById("status-bar-fill");
    let themeMeta = document.querySelector('meta[name="theme-color"]');

    function applyTheme(mood, force) {
      // quantize to avoid thrashing style for near-identical frames
      const key =
        ((mood.primary[0] * 32) | 0) +
        "-" +
        ((mood.primary[1] * 32) | 0) +
        "-" +
        ((mood.primary[2] * 32) | 0) +
        "-" +
        ((mood.accent[0] * 32) | 0) +
        "-" +
        ((mood.glow[0] * 32) | 0);
      const now = performance.now();
      if (!force && key === lastThemeKey && now - lastThemeAt < 40) return;
      lastThemeKey = key;
      lastThemeAt = now;

      const r = document.documentElement.style;
      r.setProperty("--mood-primary", cssRgb(mood.primary));
      r.setProperty("--mood-secondary", cssRgb(mood.secondary));
      r.setProperty("--mood-belly", cssRgb(mood.belly));
      r.setProperty("--mood-outline", cssRgb(mood.outline));
      r.setProperty("--mood-accent", cssRgb(mood.accent));
      r.setProperty("--mood-glow", cssRgb(mood.glow));
      r.setProperty("--mood-cheek", cssRgb(mood.cheek));

      if (!themeMeta) {
        themeMeta = document.createElement("meta");
        themeMeta.name = "theme-color";
        document.head.appendChild(themeMeta);
      }
      themeMeta.content = cssRgb(mood.primary);
    }

    function updateUi(mood) {
      if (mood.label !== lastUiLabel) {
        lastUiLabel = mood.label;
        if (speechEl) speechEl.textContent = mood.speech;
        if (moodEl) moodEl.textContent = mood.label;
        if (chrome) chrome.textContent = mood.label;
        if (statusName) statusName.textContent = mood.label;
        if (statusPct) statusPct.textContent = mood.pct;
        if (statusStage) statusStage.textContent = "Stage: " + mood.stage;
      }
      if (statusBar) statusBar.style.width = ((mood.progress * 100 + 0.5) | 0) + "%";
    }

    function currentMood(now) {
      if (phase === "hold") return MOODS[fromIdx];
      const t = Math.min(1, (now - blendStart) / blendMs);
      const s = t * t * (3 - 2 * t);
      return blendMood(MOODS[fromIdx], MOODS[toIdx], s);
    }

    function blitAll() {
      for (let i = 0; i < surfaces.length; i++) {
        const s = surfaces[i];
        s.ctx.imageSmoothingEnabled = false;
        s.ctx.clearRect(0, 0, s.canvas.width, s.canvas.height);
        s.ctx.drawImage(master, 0, 0, s.canvas.width, s.canvas.height);
      }
    }

    function paint(mood, frameN) {
      if (master.width !== hero.width || master.height !== hero.height) {
        master.width = hero.width;
        master.height = hero.height;
        mctx.imageSmoothingEnabled = false;
      }
      const bounce = bounceFor(mood.id, frameN) * (master.width / 72);
      drawPet(mctx, mood, frameN, bounce);
      blitAll();
    }

    if (reduceMotion()) {
      const m = MOODS[0];
      applyTheme(m, true);
      updateUi(m);
      paint(m, 0);
      return;
    }

    function advancePhase(now) {
      if (phase === "hold" && now - phaseStart >= holdMs) {
        phase = "blend";
        blendStart = now;
        toIdx = (fromIdx + 1) % MOODS.length;
      } else if (phase === "blend" && now - blendStart >= blendMs) {
        phase = "hold";
        phaseStart = now;
        fromIdx = toIdx;
      }
    }

    function tick(now) {
      if (!running) return;

      if (document.hidden) {
        raf = 0;
        return;
      }

      const mood = currentMood(now);
      applyTheme(mood, false);
      updateUi(mood);

      const frameMs = 1000 / Math.max(2, mood.fps);
      let needPaint = false;

      if (now - lastFrameAt >= frameMs) {
        frame = (frame + 1) % 4;
        lastFrameAt = now;
        needPaint = true;
      } else if (phase === "blend" && now - lastFrameAt >= 33) {
        // ~30fps during color blend is enough for smooth theme + pet
        lastFrameAt = now;
        needPaint = true;
      }

      if (needPaint) paint(mood, frame);
      advancePhase(now);
      raf = requestAnimationFrame(tick);
    }

    function start() {
      if (running) return;
      running = true;
      const now = performance.now();
      lastFrameAt = now;
      phaseStart = now;
      raf = requestAnimationFrame(tick);
    }

    function stop() {
      running = false;
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    }

    applyTheme(MOODS[0], true);
    updateUi(MOODS[0]);
    paint(MOODS[0], 0);
    start();

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        stop();
      } else {
        sizeCanvases();
        paint(currentMood(performance.now()), frame);
        start();
      }
    });

    let resizeTimer = 0;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        sizeCanvases();
        paint(currentMood(performance.now()), frame);
      }, 120);
    });

    // lightweight floating bits (single place — no HTML duplicate)
    const bits = document.getElementById("fun-bits");
    if (bits && !bits.childElementCount) {
      const n = window.innerWidth < 700 ? 6 : 10;
      const frag = document.createDocumentFragment();
      for (let i = 0; i < n; i++) {
        const s = document.createElement("span");
        s.style.left = Math.random() * 100 + "%";
        s.style.animationDuration = 14 + Math.random() * 18 + "s";
        s.style.animationDelay = -Math.random() * 16 + "s";
        s.style.opacity = String(0.12 + Math.random() * 0.28);
        frag.appendChild(s);
      }
      bits.appendChild(frag);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
