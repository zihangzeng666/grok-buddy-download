/**
 * Highlights HUD mock — same buddy://live card as the hero, animated through
 * finish-digest + session wash. Layout matches FloatingPetRootView:
 *   notification (above) → speech → pet|bell → status
 */
(function () {
  "use strict";

  const card = document.getElementById("hl-card");
  const canvas = document.getElementById("hl-canvas");
  if (!card || !canvas) return;

  const el = {
    mood: document.getElementById("hl-mood"),
    speech: document.getElementById("hl-speech"),
    name: document.getElementById("hl-name"),
    pct: document.getElementById("hl-pct"),
    bar: document.getElementById("hl-bar"),
    stage: document.getElementById("hl-stage-label"),
    side: document.getElementById("hl-side"),
    digest: document.getElementById("hl-digest"),
    source: document.getElementById("hl-source"),
    line: document.getElementById("hl-line"),
    bullets: document.getElementById("hl-bullets"),
    sub: document.getElementById("hl-sub"),
    bell: document.getElementById("hl-bell"),
    petRow: document.getElementById("hl-pet-row"),
    phase: document.getElementById("hl-phase"),
  };

  const MOODS = {
    idle: {
      label: "Idle",
      speech: "Stand by — nothing run yet…",
      stage: "Stand by",
      name: "Stand by",
      pct: "0%",
      progress: 0.06,
      primary: "#73d9f2",
      glow: "#8cf2ff",
      shape: "idle",
    },
    working: {
      label: "Working",
      speech: "Busy with tools right now…",
      stage: "Running tools",
      name: "Working",
      pct: "~62%",
      progress: 0.62,
      primary: "#40f28c",
      glow: "#8cf2a8",
      shape: "working",
    },
    done: {
      label: "Done",
      speech: "Done! Last task finished.",
      stage: "Last task finished",
      name: "Done",
      pct: "100%",
      progress: 1,
      primary: "#59f28c",
      glow: "#8cf2a8",
      shape: "done",
    },
  };

  const AGENTS = [
    { id: "grok", color: "#59f28c", glow: "#8cf2a8", name: "grok · main" },
    { id: "claude", color: "#ffc740", glow: "#ffe08a", name: "claude · login" },
    { id: "codex", color: "#59e6f2", glow: "#8cf2ff", name: "codex · ship" },
  ];

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

  const ctx = canvas.getContext("2d");
  const S = 320 / 16;
  let shape = "idle";
  let primary = "#73d9f2";
  let frame = 0;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function shade(hex, f) {
    const n = hex.replace("#", "");
    const r = parseInt(n.slice(0, 2), 16);
    const g = parseInt(n.slice(2, 4), 16);
    const b = parseInt(n.slice(4, 6), 16);
    const s = (v) => Math.max(0, Math.min(255, Math.round(v * f)));
    return "#" + [s(r), s(g), s(b)].map((v) => v.toString(16).padStart(2, "0")).join("");
  }

  function drawPet() {
    const grid = SHAPES[shape].map((r) => r.slice());
    grid[6][5] = 2; grid[6][6] = 2; grid[6][9] = 2; grid[6][10] = 2;
    if (shape === "working" && frame % 2 === 0) {
      grid[5][4] = 5; grid[5][11] = 5;
    }
    const pal = {
      0: null,
      1: primary,
      2: "#0a1a14",
      5: "#ffe066",
      7: "#e8fff0",
      9: shade(primary, 0.45),
    };
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = "#080c0a";
    ctx.fillRect(0, 0, 320, 320);
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const c = pal[grid[y][x]];
        if (!c) continue;
        ctx.fillStyle = c;
        ctx.fillRect(x * S, y * S, S, S);
      }
    }
  }

  function setAccent(p, g) {
    primary = p;
    card.style.setProperty("--hl-accent", p);
    card.style.setProperty("--hl-glow", g || p);
    drawPet();
  }

  function applyMood(key) {
    const m = MOODS[key];
    shape = m.shape;
    setAccent(m.primary, m.glow);
    el.mood.textContent = m.label;
    el.speech.textContent = m.speech;
    el.name.textContent = m.name;
    el.pct.textContent = m.pct;
    el.bar.style.width = Math.round(m.progress * 100) + "%";
    el.stage.textContent = "Stage: " + m.stage;
  }

  function phase(t) {
    if (el.phase) el.phase.textContent = t;
  }

  function hop() {
    if (!el.petRow) return;
    el.petRow.classList.add("is-hop");
    setTimeout(() => el.petRow.classList.remove("is-hop"), 160);
  }

  function setBell(mode) {
    // hide | amber | green | open | invert
    if (!el.bell) return;
    el.bell.classList.remove("is-amber", "is-green", "is-invert");
    if (mode === "hide") {
      el.bell.hidden = true;
      el.bell.textContent = "🔔";
      return;
    }
    el.bell.hidden = false;
    if (mode === "amber") {
      el.bell.classList.add("is-amber");
      el.bell.textContent = "🔔";
    } else if (mode === "green") {
      el.bell.classList.add("is-green");
      el.bell.textContent = "🔔";
    } else if (mode === "open") {
      el.bell.classList.add("is-green");
      el.bell.textContent = "×";
    } else if (mode === "invert") {
      el.bell.classList.add("is-green", "is-invert");
      el.bell.textContent = "🔔";
    }
  }

  function flashBell(times) {
    return new Promise((resolve) => {
      let i = 0;
      function tick() {
        if (i >= times) {
          setBell("green");
          resolve();
          return;
        }
        setBell("invert");
        setTimeout(() => {
          setBell("green");
          setTimeout(() => {
            i += 1;
            tick();
          }, 90);
        }, 90);
      }
      tick();
    });
  }

  function openDigest(state) {
    el.digest.hidden = false;
    el.digest.classList.remove("is-amber", "is-green", "is-red");
    if (state === "polishing") {
      el.digest.classList.add("is-amber");
      el.source.textContent = "…";
      el.line.hidden = false;
      el.line.textContent = "Summarizing turn…";
      el.bullets.hidden = true;
      el.sub.hidden = true;
    } else {
      el.digest.classList.add("is-green");
      el.source.textContent = "cli";
      el.line.hidden = true;
      el.bullets.hidden = false;
      el.sub.hidden = false;
    }
  }

  function closeDigest() {
    el.digest.hidden = true;
    el.digest.classList.remove("is-amber", "is-green", "is-red");
  }

  function wash(agent, hold, fade) {
    return new Promise((resolve) => {
      setAccent(agent.color, agent.glow);
      el.side.textContent = agent.name;
      el.name.textContent = agent.name.split("·")[0].trim();
      card.classList.add("hl-wash");
      setTimeout(() => {
        card.classList.remove("hl-wash");
        setTimeout(resolve, fade);
      }, hold);
    });
  }

  function wait(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  async function loop() {
    phase("// demo · stand by");
    applyMood("idle");
    setBell("hide");
    closeDigest();
    el.side.textContent = "live preview";
    await wait(reduce ? 500 : 1500);

    phase("// working");
    applyMood("working");
    hop();
    await wait(reduce ? 500 : 2000);

    phase("// done · summarizing");
    applyMood("done");
    hop();
    setBell("amber");
    openDigest("polishing");
    el.speech.textContent = "Done! Polishing a digest…";
    await wait(reduce ? 500 : 1500);

    phase("// bell flash ×3");
    setBell("green");
    await flashBell(3);
    await wait(reduce ? 200 : 350);

    phase("// notification open · above chatbox");
    setBell("open");
    openDigest("ready");
    el.speech.textContent = "Done! Fixed the plus-sign login 500.";
    await wait(reduce ? 900 : 3200);

    phase("// dismiss");
    closeDigest();
    setBell("hide");
    await wait(reduce ? 300 : 800);

    phase("// session-switch wash");
    applyMood("working");
    el.speech.textContent = "Switching focus…";
    for (const agent of AGENTS) {
      phase("// wash → " + agent.id);
      await wash(agent, reduce ? 250 : 700, reduce ? 200 : 900);
      await wait(reduce ? 80 : 280);
    }

    el.side.textContent = "live preview";
    await wait(reduce ? 200 : 500);
    loop();
  }

  setInterval(() => {
    frame += 1;
    drawPet();
  }, 280);

  applyMood("idle");
  setBell("hide");
  closeDigest();
  loop();
})();
