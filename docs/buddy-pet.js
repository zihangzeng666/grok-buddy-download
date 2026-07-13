/**
 * Live pixel pet — same 16×16 sprites & palettes as PetCreatureView / PetMood.
 * Cycles moods and drives CSS variables so the whole page shifts color with Buddy.
 */
(function () {
  "use strict";

  // --- Palettes (match PetMood.swift 0–1 RGB) ---
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
      fps: 2,
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
      fps: 8,
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

  // Sprites from PetCreatureView.swift
  const SHAPES = {
    idle: [
      [0,0,0,0,0,2,2,0,0,2,2,0,0,0,0,0],
      [0,0,0,0,2,1,1,2,2,1,1,2,0,0,0,0],
      [0,0,0,2,1,1,1,1,1,1,1,1,2,0,0,0],
      [0,0,2,1,1,1,1,1,1,1,1,1,1,2,0,0],
      [0,2,1,1,7,7,1,1,1,1,7,7,1,1,2,0],
      [0,2,1,7,7,7,1,1,1,1,7,7,7,1,2,0],
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,1,1,1,1,1,7,7,7,7,1,1,1,1,1,2],
      [2,1,1,1,1,7,7,7,7,7,7,1,1,1,1,2],
      [0,2,1,1,1,7,7,7,7,7,7,1,1,1,2,0],
      [0,2,1,1,1,1,7,7,7,7,1,1,1,1,2,0],
      [0,0,2,1,1,1,1,1,1,1,1,1,1,2,0,0],
      [0,0,0,2,1,1,1,1,1,1,1,1,2,0,0,0],
      [0,0,0,2,9,9,2,2,2,2,9,9,2,0,0,0],
      [0,0,0,0,2,2,0,0,0,0,2,2,0,0,0,0],
    ],
    thinking: [
      [0,0,0,0,0,0,0,5,5,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,2,1,1,2,0,0,0,0,0,0],
      [0,0,0,0,0,2,1,1,1,1,2,0,0,0,0,0],
      [0,0,0,0,2,9,1,1,1,1,9,2,0,0,0,0],
      [0,0,0,2,1,1,1,1,1,1,1,1,2,0,0,0],
      [0,0,2,1,1,7,7,1,1,7,7,1,1,2,0,0],
      [0,2,1,1,1,1,1,1,1,1,1,1,1,1,2,0],
      [0,2,1,1,1,1,1,1,1,1,1,1,1,1,2,0],
      [2,1,1,1,1,1,1,7,7,1,1,1,1,1,1,2],
      [2,1,1,1,1,1,7,7,7,7,1,1,1,1,1,2],
      [0,2,1,1,1,1,7,7,7,7,1,1,1,1,2,0],
      [0,2,9,1,1,1,1,1,1,1,1,1,1,9,2,0],
      [0,0,2,9,1,1,1,1,1,1,1,1,9,2,0,0],
      [0,0,0,2,2,1,1,1,1,1,1,2,2,0,0,0],
      [0,0,0,0,2,9,9,2,2,9,9,2,0,0,0,0],
      [0,0,0,0,0,2,2,0,0,2,2,0,0,0,0,0],
    ],
    working: [
      [0,0,0,0,2,2,5,5,5,5,2,2,0,0,0,0],
      [0,0,0,2,9,9,9,9,9,9,9,9,2,0,0,0],
      [0,0,2,9,1,1,1,1,1,1,1,1,9,2,0,0],
      [0,2,9,1,1,1,1,1,1,1,1,1,1,9,2,0],
      [0,2,1,1,1,1,1,1,1,1,1,1,1,1,2,0],
      [2,1,1,1,7,7,1,1,1,1,7,7,1,1,1,2],
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,1,1,1,1,1,5,5,5,5,1,1,1,1,1,2],
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [0,2,1,1,7,7,7,7,7,7,7,7,1,1,2,0],
      [0,2,9,1,7,7,7,7,7,7,7,7,1,9,2,0],
      [0,0,2,9,1,1,1,1,1,1,1,1,9,2,0,0],
      [0,0,2,2,9,9,2,2,2,2,9,9,2,2,0,0],
      [0,0,2,5,2,0,0,0,0,0,0,2,5,2,0,0],
      [0,0,2,2,0,0,0,0,0,0,0,0,2,2,0,0],
    ],
    speaking: [
      [0,2,2,0,0,0,0,0,0,0,0,0,2,2,0,0],
      [2,5,1,2,0,0,0,0,0,0,0,2,1,5,2,0],
      [2,1,1,1,2,0,0,0,0,0,2,1,1,1,2,0],
      [0,2,1,1,1,2,2,2,2,2,1,1,1,2,0,0],
      [0,2,1,1,1,1,1,1,1,1,1,1,1,2,0,0],
      [2,1,1,7,7,1,1,1,1,1,1,7,7,1,1,2],
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,1,1,1,1,7,7,7,7,7,7,1,1,1,1,2],
      [0,2,1,1,7,7,7,7,7,7,7,7,1,1,2,0],
      [0,2,1,1,1,7,7,7,7,7,7,1,1,1,2,0],
      [0,0,2,1,1,1,1,1,1,1,1,1,1,2,0,0],
      [0,0,0,2,1,1,1,1,1,1,1,1,2,0,0,0],
      [0,0,0,2,9,1,2,2,2,2,1,9,2,0,0,0],
      [0,0,0,0,2,2,0,0,0,0,2,2,0,0,0,0],
    ],
    permission: [
      [0,0,0,0,0,0,0,2,2,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,2,1,1,2,0,0,0,0,0,0],
      [0,0,0,0,0,2,1,1,1,1,2,0,0,0,0,0],
      [0,0,0,0,2,1,1,5,5,1,1,2,0,0,0,0],
      [0,0,0,2,1,1,1,1,1,1,1,1,2,0,0,0],
      [0,0,2,1,1,7,7,1,1,7,7,1,1,2,0,0],
      [0,2,1,1,1,1,1,1,1,1,1,1,1,1,2,0],
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [0,2,1,1,1,1,7,7,7,7,1,1,1,1,2,0],
      [0,0,2,1,1,7,7,7,7,7,7,1,1,2,0,0],
      [0,0,0,2,1,1,7,7,7,7,1,1,2,0,0,0],
      [0,0,0,0,2,1,1,1,1,1,1,2,0,0,0,0],
      [0,0,0,0,0,2,1,1,1,1,2,0,0,0,0,0],
      [0,0,0,0,0,2,9,2,2,9,2,0,0,0,0,0],
      [0,0,0,0,0,0,2,0,0,2,0,0,0,0,0,0],
    ],
    done: [
      [0,0,0,0,0,0,5,5,5,5,0,0,0,0,0,0],
      [0,0,0,0,0,2,1,1,1,1,2,0,0,0,0,0],
      [0,0,5,0,2,1,1,1,1,1,1,2,0,5,0,0],
      [0,0,0,2,1,1,1,1,1,1,1,1,2,0,0,0],
      [0,0,2,1,1,7,7,1,1,7,7,1,1,2,0,0],
      [0,2,1,1,7,7,1,1,1,1,7,7,1,1,2,0],
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,1,1,1,1,1,7,7,7,7,1,1,1,1,1,2],
      [0,2,1,1,1,7,7,7,7,7,7,1,1,1,2,0],
      [0,2,1,1,1,7,7,7,7,7,7,1,1,1,2,0],
      [0,0,2,1,1,1,1,1,1,1,1,1,1,2,0,0],
      [0,0,0,2,1,1,1,1,1,1,1,1,2,0,0,0],
      [0,0,0,2,9,1,2,2,2,2,1,9,2,0,0,0],
      [0,0,5,0,2,2,0,0,0,0,2,2,0,5,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    ],
  };

  function cloneGrid(g) {
    return g.map((row) => row.slice());
  }

  function applyFace(s, moodId, frame) {
    switch (moodId) {
      case "idle":
        s[6][5] = 2; s[6][6] = 2; s[6][9] = 2; s[6][10] = 2;
        s[7][5] = 3; s[7][6] = 4; s[7][9] = 3; s[7][10] = 4;
        s[9][6] = 8; s[9][9] = 8;
        break;
      case "thinking":
        s[6][5] = 3; s[6][6] = 4; s[6][9] = 3; s[6][10] = 4;
        s[7][5] = 3; s[7][6] = 3; s[7][9] = 3; s[7][10] = 3;
        if (frame % 2 === 0) { s[5][6] = 4; s[5][10] = 4; }
        break;
      case "working":
        s[6][5] = 4; s[6][6] = 4; s[6][9] = 4; s[6][10] = 4;
        s[7][5] = 6; s[7][6] = 4; s[7][9] = 6; s[7][10] = 4;
        break;
      case "speaking":
        s[6][5] = 3; s[6][6] = 4; s[6][9] = 3; s[6][10] = 4;
        s[9][6] = 4; s[9][7] = 4; s[9][8] = 4; s[9][9] = 4;
        if (frame % 2 === 0) { s[10][7] = 4; s[10][8] = 4; }
        s[8][5] = 8; s[8][10] = 8;
        break;
      case "permission":
        s[6][5] = 3; s[6][6] = 3; s[6][9] = 3; s[6][10] = 3;
        s[7][5] = 3; s[7][6] = 4; s[7][9] = 3; s[7][10] = 4;
        s[9][7] = 4; s[9][8] = 4;
        break;
      case "done":
        s[6][5] = 2; s[6][6] = 1; s[7][5] = 1; s[7][6] = 2;
        s[6][9] = 1; s[6][10] = 2; s[7][9] = 2; s[7][10] = 1;
        s[9][6] = 2; s[9][7] = 1; s[9][8] = 1; s[9][9] = 2;
        s[10][7] = 2; s[10][8] = 2;
        s[8][5] = 8; s[8][10] = 8;
        break;
    }
  }

  function applyFX(s, moodId, frame) {
    switch (moodId) {
      case "thinking": {
        const dots = [[1, 12], [0, 13], [2, 14], [1, 14]];
        const d = dots[frame % dots.length];
        s[d[0]][d[1]] = 5;
        if (frame % 2 === 0) s[0][11] = 6;
        break;
      }
      case "working": {
        const gear = [[2, 2], [2, 13], [13, 2], [13, 13]];
        const g = gear[frame % 4];
        s[g[0]][g[1]] = 5;
        s[1][7] = frame % 2 === 0 ? 6 : 5;
        s[1][8] = frame % 2 === 0 ? 5 : 6;
        break;
      }
      case "speaking":
        if (frame % 2 === 0) { s[4][13] = 6; s[5][14] = 5; }
        else { s[5][13] = 5; s[6][14] = 6; }
        break;
      case "permission":
        s[0][7] = 5; s[1][7] = 5; s[2][7] = frame % 2 === 0 ? 5 : 0; s[3][7] = 5;
        break;
      case "done":
        if (frame % 2 === 0) { s[0][3] = 5; s[0][12] = 6; s[2][1] = 6; }
        else { s[1][2] = 6; s[1][13] = 5; s[3][14] = 5; }
        break;
      case "idle":
        if (frame === 0) s[3][3] = 6;
        if (frame === 2) s[3][12] = 6;
        break;
    }
  }

  function rgb(triplet) {
    return triplet.map((c) => Math.round(c * 255));
  }

  function cssRgb(triplet) {
    const [r, g, b] = rgb(triplet);
    return `rgb(${r}, ${g}, ${b})`;
  }

  function applyTheme(mood) {
    const root = document.documentElement;
    root.style.setProperty("--mood-primary", cssRgb(mood.primary));
    root.style.setProperty("--mood-secondary", cssRgb(mood.secondary));
    root.style.setProperty("--mood-belly", cssRgb(mood.belly));
    root.style.setProperty("--mood-outline", cssRgb(mood.outline));
    root.style.setProperty("--mood-accent", cssRgb(mood.accent));
    root.style.setProperty("--mood-glow", cssRgb(mood.glow));
    root.style.setProperty("--mood-cheek", cssRgb(mood.cheek));
  }

  function colorForCell(v, mood) {
    switch (v) {
      case 1: return rgb(mood.primary);
      case 2: return rgb(mood.outline);
      case 3: return [255, 255, 255];
      case 4: return [20, 26, 31];
      case 5: return rgb(mood.accent);
      case 6: return rgb(mood.glow);
      case 7: return rgb(mood.belly);
      case 8: return rgb(mood.cheek);
      case 9: return rgb(mood.secondary);
      default: return null;
    }
  }

  function drawPet(ctx, mood, frame, bounce) {
    const size = ctx.canvas.width;
    const cols = 16;
    const cell = Math.floor(size / 18);
    const grid = cols * cell;
    const ox = Math.floor((size - grid) / 2);
    const oy = Math.floor((size - grid) / 2) + bounce;

    ctx.clearRect(0, 0, size, size);

    // glow pad
    const pad = cell;
    ctx.fillStyle = `rgba(${rgb(mood.glow).join(",")},0.14)`;
    ctx.fillRect(ox - pad, oy - pad, grid + pad * 2, grid + pad * 2);

    const base = SHAPES[mood.id] || SHAPES.idle;
    const spr = cloneGrid(base);
    applyFace(spr, mood.id, frame);
    applyFX(spr, mood.id, frame);

    // shadow
    const sh = Math.max(1, Math.floor(cell / 6));
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        if (!spr[y][x]) continue;
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        ctx.fillRect(ox + x * cell + sh, oy + y * cell + sh, cell, cell);
      }
    }

    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const c = colorForCell(spr[y][x], mood);
        if (!c) continue;
        ctx.fillStyle = `rgb(${c[0]},${c[1]},${c[2]})`;
        ctx.fillRect(ox + x * cell, oy + y * cell, cell, cell);
      }
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

  function reduceMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function boot() {
    const canvases = Array.from(document.querySelectorAll("canvas.pet-live"));
    if (!canvases.length) return;

    canvases.forEach((c) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const css = c.clientWidth || 144;
      c.width = Math.floor(css * dpr);
      c.height = Math.floor(css * dpr);
    });

    let moodIndex = 0;
    let frame = 0;
    let lastFrameAt = performance.now();
    let lastMoodAt = performance.now();
    const moodHoldMs = 2800;

    const speechEl = document.getElementById("buddy-speech");
    const moodEl = document.getElementById("buddy-mood");
    const statusName = document.getElementById("status-name");
    const statusPct = document.getElementById("status-pct");
    const statusStage = document.getElementById("status-stage");
    const statusBar = document.getElementById("status-bar-fill");

    function setMood(i) {
      moodIndex = i % MOODS.length;
      const mood = MOODS[moodIndex];
      applyTheme(mood);
      if (speechEl) speechEl.textContent = mood.speech;
      if (moodEl) moodEl.textContent = mood.label;
      if (statusName) statusName.textContent = mood.label;
      if (statusPct) statusPct.textContent = mood.pct;
      if (statusStage) statusStage.textContent = "Stage: " + mood.stage;
      if (statusBar) statusBar.style.width = Math.round(mood.progress * 100) + "%";
    }

    setMood(0);

    if (reduceMotion()) {
      const mood = MOODS[0];
      canvases.forEach((c) => {
        const ctx = c.getContext("2d");
        ctx.imageSmoothingEnabled = false;
        drawPet(ctx, mood, 0, 0);
      });
      return;
    }

    function tick(now) {
      const mood = MOODS[moodIndex];
      const frameMs = 1000 / mood.fps;

      if (now - lastFrameAt >= frameMs) {
        frame = (frame + 1) % 4;
        lastFrameAt = now;
      }
      if (now - lastMoodAt >= moodHoldMs) {
        setMood(moodIndex + 1);
        frame = 0;
        lastMoodAt = now;
      }

      const bounce = bounceFor(MOODS[moodIndex].id, frame);
      canvases.forEach((c) => {
        const ctx = c.getContext("2d");
        ctx.imageSmoothingEnabled = false;
        drawPet(ctx, MOODS[moodIndex], frame, bounce * (c.width / 72));
      });

      requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
