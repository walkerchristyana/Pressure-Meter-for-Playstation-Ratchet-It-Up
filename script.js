//Loading -> Intro -> Classified -> Tutorial -> Allie (intro dialogue) -> Questions -> Meter -> Allie ending (2 paragraphs)
// -> Port (same) -> Overall ending -> Leaderboard
//DO NOT FORGET TO FIX THE ORDER!

document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);

  // ------------------------------------------------------------ FINAL COPY FRFRFR 
  // ------------------------------------------------------------ <33333333333
  const DEBUG_SEQ = ["d","e","b","u","g"];
  let debugBuffer = [];

  function enableDebugUI() {
    const btn = $("debugToggleBtn");
    if (btn) btn.classList.remove("debug-hidden");
  }

  // Enable if URL includes #debug
  if (location.hash.toLowerCase() === "#debug") {
    enableDebugUI();
  }

  // Secret key sequence
  window.addEventListener("keydown", (e) => {
    const k = (e.key || "").toLowerCase();
    if (!k) return;
    debugBuffer.push(k);
    if (debugBuffer.length > DEBUG_SEQ.length) debugBuffer.shift();
    if (debugBuffer.join("") === DEBUG_SEQ.join("")) {
      enableDebugUI();
      try { toast("Debug enabled."); } catch (_) {}
    }
  });



  // -------------------------------
  // Elements
  // -------------------------------
  const screens = Array.from(document.querySelectorAll(".screen"));

  const staticOverlay = $("staticOverlay");
  const redOverlay = $("redOverlay");
  const toastEl = $("toast");
  const takeoverTextEl = $("takeoverText");
  const fallZoneEl = $("fallZone");

  const caseToggleBtn = $("caseToggleBtn");
  const casePanel = $("casePanel");
  const caseCloseBtn = $("caseCloseBtn");
  const caseLogs = $("caseLogs");
  const caseOperativeLine = $("caseOperativeLine");
  const caseToolLine = $("caseToolLine");
  const caseMeterState = $("caseMeterState");
  const caseSubjectLine = $("caseSubjectLine");
  const caseSubjectBrief = $("caseSubjectBrief");
  const caseLockNotice = $("caseLockNotice");

  const debugBtn = $("debugBtn");
  const debugPanel = $("debugPanel");
  const debugCloseBtn = $("debugCloseBtn");

  const dbgScreen = $("dbgScreen");
  const dbgMeter = $("dbgMeter");
  const dbgAlliePressure = $("dbgAlliePressure");
  const dbgPortPressure = $("dbgPortPressure");
  const dbgTotal = $("dbgTotal");

  // -------------------------------
  // Audio
  // -------------------------------
  const A = {
    click: $("buttonClick"),
    score: $("scoreSound"),
    monster: $("monsterSound"),
    hum: $("ambienceHum"),
    sting: $("stingSound"),
    scratch: $("scratchSound"),
    whisper: $("whisperSound"),
    heartbeat: $("heartbeatSound"),
  };

  let audioUnlocked = false;

  function safePlay(audioEl, opts = {}) {
    if (!audioEl) return;
    try {
      if (opts.restart) audioEl.currentTime = 0;
      if (typeof opts.volume === "number") audioEl.volume = opts.volume;
      const p = audioEl.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    } catch (e) {}
  }

  function toast(msg, ms = 1200) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("on");
    setTimeout(() => toastEl.classList.remove("on"), ms);
  }

  function unlockAudioOnce() {
    if (audioUnlocked) return;
    audioUnlocked = true;

    // "prime" all audio so future play() works
    Object.values(A).forEach((el) => {
      if (!el) return;
      try {
        const oldVol = el.volume ?? 1;
        el.volume = 0.0;
        const p = el.play();
        if (p && typeof p.catch === "function") p.catch(() => {});
        setTimeout(() => {
          try { el.pause(); el.currentTime = 0; } catch(e){}
          el.volume = oldVol;
        }, 60);
      } catch (e) {}
    });

    toast("Audio unlocked.", 900);
  }

  window.addEventListener("pointerdown", unlockAudioOnce, { once: true });
  window.addEventListener("keydown", unlockAudioOnce, { once: true });

  function fadeTo(audioEl, target, ms = 320) {
    if (!audioEl) return;
    const start = audioEl.volume ?? 1;
    const t0 = performance.now();
    function tick(now) {
      const p = Math.min(1, (now - t0) / ms);
      audioEl.volume = start + (target - start) * p;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
//ERROR OCCCURED HERE CHECK IF AGAIN
  function loopAmbience(on) {
    if (!A.hum) return;
    try {
      if (on) {
        A.hum.loop = true;
        A.hum.volume = 0.0;
        safePlay(A.hum);
        fadeTo(A.hum, 0.30, 520);
      } else {
        fadeTo(A.hum, 0.0, 240);
        setTimeout(() => { try { A.hum.pause(); } catch(e){} }, 260);
      }
    } catch (e) {}
  }

  // -------------------------------
  // Horror visuals
  // -------------------------------
  function wait(ms){ return new Promise(r => setTimeout(r, ms)); }

  function flashTakeover(message, style = "red", ms = 420) {
    if (!takeoverTextEl) return;
    takeoverTextEl.textContent = message;
    takeoverTextEl.classList.remove("red", "blue");
    takeoverTextEl.classList.add("on");
    takeoverTextEl.classList.add(style);
    setTimeout(() => takeoverTextEl.classList.remove("on"), ms);
  }

  function rainWords(words, count = 10) {
    if (!fallZoneEl) return;
    const pool = Array.isArray(words) ? words : [String(words || "")];
    for (let i = 0; i < count; i++) {
      const w = document.createElement("div");
      w.className = "falling-word";
      w.textContent = pool[Math.floor(Math.random() * pool.length)] || "…";
      w.style.left = Math.floor(Math.random() * 92) + "vw";
      w.style.animationDuration = (1.2 + Math.random() * 1.6).toFixed(2) + "s";
      w.style.opacity = (0.35 + Math.random() * 0.6).toFixed(2);
      fallZoneEl.appendChild(w);
      setTimeout(() => w.remove(), 2600);
    }
  }

  function staticFlash(ms = 160) {
    if (!staticOverlay) return;
    staticOverlay.classList.add("on");
    setTimeout(() => staticOverlay.classList.remove("on"), ms);
  }

  function redFlash(ms = 160) {
    if (!redOverlay) return;
    redOverlay.classList.add("on");
    setTimeout(() => redOverlay.classList.remove("on"), ms);
  }

  function shake(screenId) {
    const el = $(screenId);
    if (!el) return;
    el.classList.add("shake");
    setTimeout(() => el.classList.remove("shake"), 260);
  }

  function flicker(screenId) {
    const el = $(screenId);
    if (!el) return;
    el.classList.add("flicker");
    setTimeout(() => el.classList.remove("flicker"), 360);
  }

  function applyFX(screenId, fx = {}) {
    if (fx.static) staticFlash(220);
    if (fx.red) redFlash(220);
    if (fx.shake) shake(screenId);
    if (fx.flicker) flicker(screenId);
  }

  async function runTakeoverScene(scene, screenId) {
    for (const beat of scene) {
      if (beat.fx) applyFX(screenId, beat.fx);
      if (beat.sound) safePlay(beat.sound, { restart: true });
      if (beat.rainWords) rainWords(beat.rainWords, beat.rainCount ?? 14);
      flashTakeover(beat.text, beat.style ?? "red", beat.ms ?? 520);
      await wait(beat.wait ?? 380);
    }
  }

  // -------------------------------
  // Typewriter FUNCTIONALITY GRLYPOP
  // -------------------------------
  async function type(el, text, speed = 18) {
    if (!el) return;
    el.dataset.fullText = text;
    el.textContent = "";

    let i = 0;
    let skipping = false;

    const onClick = () => (skipping = true);
    el.addEventListener("click", onClick, { once: true });

    return new Promise((resolve) => {
      const t = setInterval(() => {
        if (skipping) {
          clearInterval(t);
          el.textContent = text;
          resolve();
          return;
        }
        el.textContent += text[i] || "";
        i++;
        if (i >= text.length) {
          clearInterval(t);
          resolve();
        }
      }, speed);
    });
  }

  // -------------------------------
  // Screen helpers
  // -------------------------------
  function showScreen(id) {
    const next = $(id);
    if (!next) return;

    const current = screens.find((s) => s.classList.contains("active"));
    if (current && current.id === id) return;

    // Exit current screen//Exit scence
    if (current) {
      current.classList.remove("enter");
      current.classList.add("exit");
      setTimeout(() => {
        current.classList.remove("active", "exit", "fade-out");
        next.classList.add("active", "enter");
        setTimeout(() => next.classList.remove("enter"), 260);
      }, 170);
    } else {
      next.classList.add("active", "enter");
      setTimeout(() => next.classList.remove("enter"), 260);
    }
  }

  function activeScreenId(){
    const current = screens.find((s) => s.classList.contains("active"));
    return current ? current.id : "—";
  }

  // -------------------------------
  // Case file  Management (Note remember to make UI)
  // -------------------------------
  const player = { name: "", age: 0 };

  const CASE = {
    meterState: "LOCKED",
    lockMsg: "Case file locked until calibration completes.",
    logs: [],
    subject: "",
    subjectBrief: "",
  };

  function setMeterState(stateTxt) {
    CASE.meterState = stateTxt;
    if (caseMeterState) caseMeterState.textContent = `Meter State: ${CASE.meterState}`;
    updateDebugReadout();
  }

  function setSubject(subject, brief) {
    CASE.subject = subject;
    CASE.subjectBrief = brief || "";
    if (caseSubjectLine) caseSubjectLine.textContent = `Subject: ${CASE.subject}`;
    if (caseSubjectBrief) caseSubjectBrief.textContent = CASE.subjectBrief;
  }

  function escapeHtml(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  function logObs(subject, line, tag = "OBS") {
    const entry = { subject, line, tag, ts: Date.now() };
    CASE.logs.unshift(entry);
    renderCaseLogs();
  }

  function renderCaseLogs() {
    if (!caseLogs) return;
    caseLogs.innerHTML = "";
    CASE.logs.slice(0, 28).forEach((e) => {
      const div = document.createElement("div");
      div.className = "case-log";
      div.innerHTML = `
        <span class="case-tag">[${e.tag}]</span>
        <span>${escapeHtml(e.line)}</span>
        <div class="case-time">${new Date(e.ts).toLocaleTimeString()}</div>
      `;
      caseLogs.appendChild(div);
    });
  }

  function lockCaseFile(msg) {
    CASE.lockMsg = msg || CASE.lockMsg;
    if (caseLockNotice) caseLockNotice.textContent = CASE.lockMsg;
    if (caseToggleBtn) caseToggleBtn.disabled = true;
  }

  function unlockCaseFile(msg) {
    CASE.lockMsg = msg || "";
    if (caseLockNotice) caseLockNotice.textContent = CASE.lockMsg;
    if (caseToggleBtn) {
      caseToggleBtn.disabled = false;
      caseToggleBtn.classList.add("pulse");
      setTimeout(() => caseToggleBtn.classList.remove("pulse"), 650);
    }
  }

  caseToggleBtn?.addEventListener("click", () => {
    safePlay(A.click, { restart: true });
    casePanel.classList.toggle("open");
    casePanel.setAttribute("aria-hidden", casePanel.classList.contains("open") ? "false" : "true");
  });

  caseCloseBtn?.addEventListener("click", () => {
    safePlay(A.click, { restart: true });
    casePanel.classList.remove("open");
    casePanel.setAttribute("aria-hidden", "true");
  });

  // -------------------------------
  // Debug panel/ NOT VISIBLE
  // -------------------------------
  debugBtn?.addEventListener("click", () => {
    safePlay(A.click, { restart: true });
    debugPanel.classList.toggle("open");
  });

  debugCloseBtn?.addEventListener("click", () => {
    safePlay(A.click, { restart: true });
    debugPanel.classList.remove("open");
  });

  $("dbgTestAudioBtn")?.addEventListener("click", async () => {
    unlockAudioOnce();
    safePlay(A.click, { restart: true });
    await wait(120);
    safePlay(A.sting, { restart: true, volume: 0.55 });
    await wait(120);
    safePlay(A.monster, { restart: true, volume: 0.55 });
    toast("Audio test played.", 900);
  });

  $("dbgGiveAllieMeterBtn")?.addEventListener("click", () => {
    $("toAllieMeterBtn").disabled = false;
    toast("Allie meter unlocked (debug).", 900);
  });

  $("dbgGivePortMeterBtn")?.addEventListener("click", () => {
    $("toPortMeterBtn").disabled = false;
    toast("Port meter unlocked (debug).", 900);
  });

  // -------------------------------
  // Pressure labels + distortion + FOR ROOM ANGER AND HOSTILITY 
  // -------------------------------
  function pressureLabel(anger) {
    if (anger <= 1) return "calm";
    if (anger <= 2) return "uneasy";
    if (anger <= 3) return "tense";
    if (anger <= 4) return "hostile";
    return "critical";
  }

  function setBodyDistortion(level) {
    document.body.classList.remove("distort-1","distort-2","distort-3","distort-4","distort-5");
    if (level > 0) document.body.classList.add(`distort-${Math.min(5, level)}`);
  }

  // -------------------------------
  // Lie system + hint corruption SYSTEM  / three bugs in load check again
  // -------------------------------
  function clamp01(n){ return Math.max(0, Math.min(1, n)); }
  function scrambleText(s){
    const chars = String(s).split("");
    for (let i = chars.length - 1; i > 0; i--) { // check for loop, orignally big O error
      const j = Math.floor(Math.random() * (i + 1));
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    return chars.join("");
  }

  function decideResponseMode(subject, q) {
    const isAllie = subject === "allie";
    const mind = isAllie ? state.allieMind : state.portMind;
    const anger = isAllie ? state.allieAnger : state.portAnger;

    if (q.forceTruth) return "truth";
    if (q.forceLie) return "lie";
    if (q.denialTrigger) return "lie";//error fixed

    const base = isAllie
      ? { lie: 0.18, half: 0.20, loop: 0.08, silence: 0.05 }
      : { lie: 0.24, half: 0.18, loop: 0.12, silence: 0.07 };
//noted this is causing a error might debug 
    const toneBoost =
      q.tone === "safe" ? -0.18 :
      q.tone === "pressure" ? 0.10 :
      q.tone === "accuse" ? 0.18 :
      0.0;

    const suspicionBoost = mind.suspicion * 0.06;
    const fatigueBoost = mind.fatigue * 0.04;
    const angerBoost = anger * 0.05;
    const maskWeakness = (100 - mind.mask) / 100;

    let pLie = clamp01(base.lie + toneBoost + suspicionBoost + fatigueBoost);
    let pHalf = clamp01(base.half + (maskWeakness * 0.35) + (angerBoost * 0.12));
    let pLoop = clamp01(base.loop + (angerBoost * 0.35) + (fatigueBoost * 0.20));
    let pSilence = clamp01(base.silence + (angerBoost * 0.20) + (suspicionBoost * 0.18));

    if (q.tone === "safe") {
      pLoop *= 0.45; pSilence *= 0.4; pLie *= 0.55;
    }

    const scaryTotal = pLie + pHalf + pLoop + pSilence;
    const scale = scaryTotal > 0.92 ? 0.92 / scaryTotal : 1;
    pLie *= scale; pHalf *= scale; pLoop *= scale; pSilence *= scale;

    const pTruth = clamp01(1 - (pLie + pHalf + pLoop + pSilence));

    const roll = Math.random();
    const cut1 = pTruth;
    const cut2 = cut1 + pLie;
    const cut3 = cut2 + pHalf;
    const cut4 = cut3 + pLoop;

    if (roll < cut1) return "truth";
    if (roll < cut2) return "lie";
    if (roll < cut3) return "half";
    if (roll < cut4) return "loop";
    return "silence";
  }

  function buildHint(subject, q, mode) {
    const isAllie = subject === "allie";
    const anger = isAllie ? state.allieAnger : state.portAnger;
    const mind = isAllie ? state.allieMind : state.portMind;

    const baseHint = q.hint || "Watch the room. The meter reads the space, not the subject.";
    const fragments = [
      "Threat can be silent.",
      "Awareness increases when you name it.",
      "Stability drops when stories split.",
      "Resistance rises when you force meaning.",
      "The room reacts to certainty.",
      "The room loves a confident guess.",
    ];

    const corruption = clamp01((anger * 0.18) + (mind.suspicion * 0.12) + (mind.fatigue * 0.08));
    const whisper = fragments[Math.floor(Math.random() * fragments.length)];

    const suffix =
      corruption < 0.35 ? "" :
      corruption < 0.7 ? `  (whisper: ${whisper})` :
      `  (whisper: ${scrambleText(whisper)})`;

    const modeNudge =
      mode === "truth" ? "  Truth briefly stabilizes." :
      mode === "lie" ? "  Lies make the room louder." :
      mode === "half" ? "  Half-truths damage Stability." :
      mode === "loop" ? "  Loops mean Awareness is high." :
      "  Silence is also an answer.";

    return baseHint + modeNudge + suffix;
  }

  function setHint(subject, txt) {
    if (subject === "allie") $("allieHintText").textContent = txt || "";
    else $("portHintText").textContent = txt || "";
  }

  function setDialogue(subject, txt) {
    if (subject === "allie") return type($("allieDialogueText"), txt, 14);
    return type($("portDialogueText"), txt, 14);
  }

  function logMany(subject, arr, tag) {
    (arr || []).forEach((t) => logObs(subject, t, tag));
  }

  // -------------------------------
  // Question Banks// DO NOT EDIT OR CHANGE 
  // -------------------------------
  function makeQuestionBank(subject) {
    const isAllie = subject === "allie";
    if (isAllie) {
      return [
        {
          id: "A1", //CHANGE ALLIES CLOSET MONSTER TO A SHE #GIRLPOWER?
          label: "What happens when you’re alone in this room?",
          tone: "safe",
          truth: `Allie doesn’t blink. “When I’m alone, the room...heavier. Not like air—like pressure. Like something leaning in.”`,
          lie: `Allie shrugs too quickly. “Nothing. I just sit here.”`,
          followLabel: "Why did the room react when you said that?",
          follow: `Her voice drops. “Because it knows I’m lying. And now it’s closer.”`,
          obsTruth: ["Pressure increases when attention drops.", "Threat remains present without movement."],
          obsLie: ["Denial causes distortion.", "Threat responds to dismissal."],
          obsFollow: ["Honesty briefly stabilizes the space."],
          angerHit: 1,
          lieFX: { shake: true, static: true },
          followFX: { static: true },
          hint: "Threat may be present even without visible movement.",
        },
        {
          id: "A2",
          label: "Why do you keep looking at the corner?",
          tone: "safe",
          truth: `“Because it moves when I’m not watching. But it stops when I look.”`,
          lie: `“I’m not looking at anything.”`,
          followLabel: "Say its name.",
          follow: `She whispers, “It doesn’t have a name. That’s why it’s winning.”`,
          obsTruth: ["Eye contact increases Awareness.", "Threat hides when observed."],
          obsLie: ["Denial increases Resistance.", "Room's Stability drops slightly."],
          obsFollow: ["Naming increases threat response."],
          angerHit: 1,
          lieFX: { shake: true, flicker: true },
          followFX: { static: true },
          hint: "Boundary behavior hints at Awareness and Threat.",
        },
        {
          id: "A3",
          label: "What’s inside the closet?",
          tone: "pressure",
          truth: `Allie swallows. “Something that understands fear better than I do.”`,
          lie: `“Old clothes. Boxes.” The words barely leave her mouth.`,
          followLabel: "Why does it react when you deny it?",
          follow: `“Because pretending it isn’t there is how it wins.”`,
          obsTruth: ["Closet behaves like a living boundary.", "Threat remains present without contact."],
          obsLie: ["Dismissing it destabilizes the room.", "Proximity intensifies."],
          obsFollow: ["Denial increases distortion. Stability falls."],
          angerHit: 1,
          lieFX: { shake: true, static: true, flicker: true },
          followFX: { static: true, flicker: true },
          hint: "Closets = thresholds. Stability is usually lower near thresholds.",
        },
        {
          id: "A4",
          label: "Do you feel watched right now?",
          tone: "pressure",
          truth: `“Yes.” She doesn’t hesitate. “But not by you.”`,
          lie: `“No.” Her voice cracks.`,
          followLabel: "Then why is it breathing?",
          follow: `Allie stares past you. “Because you asked.”`,
          obsTruth: ["Threat feels immediate.", "Awareness rises when questioned."],
          obsLie: ["Lie causes static spike.", "Resistance increases."],
          obsFollow: ["Asking can increase Awareness."],
          angerHit: 1,
          lieFX: { static: true, flicker: true },
          followFX: { red: true, static: true },
          hint: "If the room reacts to questions, Awareness is high.",
        },
        {
          id: "A5",
          label: "Tell me what you did to make it angry.",
          tone: "accuse",
          denialTrigger: true,
          truth: `Allie shakes her head. “I didn’t make it angry. I noticed it.”`,
          lie: `“Nothing.” She’s lying before you finish speaking.`,
          followLabel: "So noticing it was enough?",
          follow: `“That’s the point.” She exhales. “It hates being seen.”`,
          obsTruth: ["Awareness increases when observed.", "Threat reacts to attention."],
          obsLie: ["Denial triggers pushback.", "Resistance spikes on accusation."],
          obsFollow: ["Truth stabilizes briefly. Then tension returns."],
          angerHit: 2,
          lieFX: { shake: true, static: true, flicker: true, red: true },
          followFX: { static: true },
          hint: "Accusations provoke Resistance and lies.",
        },
        {
          id: "A6",
          label: "If I leave, will it follow me?",
          tone: "pressure",
          truth: `Allie’s eyes go wet. “It already knows your name.”`,
          lie: `“No.” She says it like a prayer.`,
          followLabel: "Why did the temperature drop when you lied?",
          follow: `“Because it likes new hosts.”`,
          obsTruth: ["Threat extends beyond the room.", "Awareness includes the operative."],
          obsLie: ["Lie triggers environmental change.", "Stability drops fast."],
          obsFollow: ["Truth reveals pursuit behavior."],
          angerHit: 2,
          lieFX: { static: true, flicker: true, red: true },
          followFX: { static: true, flicker: true },
          hint: "If it 'knows' the player, Awareness is extreme.",
        },
      ];
    }

    // PORT BANK (includes murder scene of wife
    return [
      {
        id: "P1",
        label: "Why does it keep repeating the same sound?",
        tone: "safe",
        truth: `Port tilts his head. “Because it’s the only honest thing in here.”`,
        lie: `“It’s not repeating.”`,
        followLabel: "Say what it sounds like.",
        follow: `“A lock.” He smiles. “A lock that never opens.”`,
        obsTruth: ["Loop behavior suggests high Awareness.", "Stability is patterned, not safe."],
        obsLie: ["Denial distorts perception.", "Resistance rises."],
        obsFollow: ["Naming loops can amplify them."],
        angerHit: 1,
        lieFX: { static: true, flicker: true },
        followFX: { flicker: true },
        hint: "Loops often mean Awareness is high but Stability is brittle.",
      },
      {
        id: "P_WIFE",
        label: "Did you murder your wife?",
        tone: "accuse",
        forceLie: true,
        specialScene: "wife_murder",
        truth: `Port’s smile disappears.

He doesn’t answer you.
The room does.`,
        lie: `Port’s smile disappears.

He doesn’t answer you.
The room does.`,
        obsTruth: ["Accusation triggers violent environmental response.", "Threat Presence spikes instantly."],
        obsLie: ["Accusation triggers violent environmental response.", "Threat Presence spikes instantly."],
        angerHit: 2,
        lieFX: { shake: true, static: true, flicker: true, red: true },
        hint: "Some questions are not questions. They are triggers.",
      },
      {
        id: "P2",
        label: "What happens if I touch the door?",
        tone: "pressure",
        truth: `“It remembers your fingerprints.”`,
        lie: `“Nothing.” Port is too quick.`,
        followLabel: "Then why did the air change?",
        follow: `“Because the room heard you decide.”`,
        obsTruth: ["Threat interacts with intent.", "Awareness responds to choice."],
        obsLie: ["Lie increases pressure.", "Stability drops on denial."],
        obsFollow: ["Intent changes the environment."],
        angerHit: 1,
        lieFX: { shake: true, static: true },
        followFX: { static: true },
        hint: "If intent changes the room, Awareness is high.",
      },
      {
        id: "P3",
        label: "What did you sacrifice to keep it quiet?",
        tone: "accuse",
        denialTrigger: true,
        truth: `Port laughs once. “Quiet isn’t peace. It’s a trap.”`,
        lie: `“I didn’t sacrifice anything.”`,
        followLabel: "Then why are your hands shaking?",
        follow: `He looks at his palms. “Because it remembers what I did.”`,
        obsTruth: ["Quiet spaces can hide threats.", "Resistance rises with accusation."],
        obsLie: ["Denial triggers pushback.", "Threat presence increases."],
        obsFollow: ["Guilt destabilizes Stability."],
        angerHit: 2,
        lieFX: { static: true, flicker: true, red: true },
        followFX: { red: true },
        hint: "Accusations increase Resistance and trigger lies.",
      },
      {
        id: "P4",
        label: "Do you want me to save you?",
        tone: "pressure",
        truth: `Port’s voice is flat. “I want you to stop pretending you’re separate.”`,
        lie: `“Yes.” He says it like bait.`,
        followLabel: "Bait for what?",
        follow: `“For the part of you that thinks you can win.”`,
        obsTruth: ["Resistance targets identity.", "Awareness includes the operative."],
        obsLie: ["Lie is weaponized.", "Threat grows in confidence."],
        obsFollow: ["Room reacts to pride."],
        angerHit: 1,
        lieFX: { shake: true, static: true },
        followFX: { static: true },
        hint: "When dialogue attacks the player, Awareness is extreme.",
      },
      {
        id: "P5",
        label: "Tell me the real reason this place is here.",
        tone: "pressure",
        truth: `“Because you keep naming things wrong.”`,
        lie: `“Because I’m crazy.” Port smiles. “That’s what you want, right?”`,
        followLabel: "Why does it like misinterpretation?",
        follow: `“Because being wrong makes you loud.”`,
        obsTruth: ["Misinterpretation increases Threat.", "Awareness reacts to confidence."],
        obsLie: ["Self-labeling is a defensive lie.", "Resistance increases."],
        obsFollow: ["Wrong certainty destabilizes Stability."],
        angerHit: 1,
        lieFX: { flicker: true, static: true },
        followFX: { static: true },
        hint: "Wrong certainty is a Stability killer.",
      },
      {
        id: "P6",
        label: "If I leave, will you still be trapped?",
        tone: "safe",
        truth: `Port’s smile fades. “If you leave, you’ll bring it with you.”`,
        lie: `“No.”`,
        followLabel: "Why do you look relieved when you lie?",
        follow: `“Because lies are doors.”`,
        obsTruth: ["Threat extends beyond space.", "Awareness includes the operative."],
        obsLie: ["Lie changes emotional temperature.", "Stability drops."],
        obsFollow: ["Lies can open pathways."],
        angerHit: 1,
        lieFX: { static: true, flicker: true, red: true },
        followFX: { flicker: true },
        hint: "If it follows, Threat Presence is not localized.",
      },
    ];
  }

  // -------------------------------
  // Scoring/SYSTEM
  // -------------------------------
  function scoreRow(label, guess, actual) {
    const diff = Math.abs((guess ?? 0) - (actual ?? 0));
    const points = diff === 0 ? 4 : diff === 1 ? 3 : diff === 2 ? 2 : diff === 3 ? 1 : 0;
    return { label, guess, actual, diff, points };
  }

  function endingKeyFromScore(total, zeros) {
    if (total >= 14 && zeros === 0) return "safe";
    if (total >= 11) return "contained";
    if (total >= 8) return "fracture";
    return "breach";
  }

  function compute(guess, actual) {
    const rows = [
      scoreRow("Threat Presence", guess.threat, actual.threat),
      scoreRow("Awareness", guess.awareness, actual.awareness),
      scoreRow("Stability", guess.stability, actual.stability),
      scoreRow("Resistance", guess.resistance, actual.resistance),
    ];
    const total = rows.reduce((a, r) => a + r.points, 0);
    const zeros = rows.filter((r) => r.points === 0).length;
    return { rows, total, zeros };
  }

  // -------------------------------
  // Leaderboard
  // -------------------------------
  const LB_KEY = "mindscape_leaderboard_v2";
  function loadLB() {
    try { return JSON.parse(localStorage.getItem(LB_KEY) || "[]"); }
    catch (e) { return []; }
  }
  function saveLB(arr) {
    try { localStorage.setItem(LB_KEY, JSON.stringify(arr)); }
    catch (e) {}
  }
  function renderLB(arr) {
    const wrap = $("leaderboardList");
    if (!wrap) return;
    wrap.innerHTML = "";
    if (!arr.length) {
      wrap.innerHTML = `<p>No entries yet.</p>`;
      return;
    }
    arr.slice(0, 12).forEach((x, i) => {
      const p = document.createElement("p");
      p.textContent = `${i + 1}. ${x.name} — ${x.score}/32 (${x.ending})`;
      wrap.appendChild(p);
    });
  }

  $("dbgClearLBBtn")?.addEventListener("click", () => {
    saveLB([]);
    renderLB([]);
    toast("Leaderboard cleared.", 900);
  });

  // -------------------------------
  // Main state
  // -------------------------------
  const state = {
    allieBank: makeQuestionBank("allie"),
    portBank: makeQuestionBank("port"),
    allieAsked: 0,
    portAsked: 0,
    allieAnger: 0,
    portAnger: 0,
    allieMind: { suspicion: 0, fatigue: 0, mask: 100, lastMode: "truth", dissonance: 0 },
    portMind:  { suspicion: 0, fatigue: 0, mask: 100, lastMode: "truth", dissonance: 0 },
    unlockAt: 6,
    allieScore: 0, portScore: 0,
    totalScore: 0,
    allieEndingKey: "", portEndingKey: "", finalEndingKey: ""
  };

  const LIMITS = { allieCutoff: 6, portCutoff: 6 };

  function updateStatus(subject) {
    if (subject === "allie") {
      $("allieProgressLine").textContent = `Questions: ${state.allieAsked}/${state.unlockAt}`;
      $("alliePressureLine").textContent = `Room Pressure: ${pressureLabel(state.allieAnger)}`;
    } else {
      $("portProgressLine").textContent = `Questions: ${state.portAsked}/${state.unlockAt}`;
      $("portPressureLine").textContent = `Room Pressure: ${pressureLabel(state.portAnger)}`;
    }
    const worst = Math.max(state.allieAnger, state.portAnger);
    setBodyDistortion(Math.min(5, worst));
    updateDebugReadout();
  }

  function updateDebugReadout() {
    if (dbgScreen) dbgScreen.textContent = activeScreenId();
    if (dbgMeter) dbgMeter.textContent = CASE.meterState;
    if (dbgAlliePressure) dbgAlliePressure.textContent = pressureLabel(state.allieAnger);
    if (dbgPortPressure) dbgPortPressure.textContent = pressureLabel(state.portAnger);
    if (dbgTotal) dbgTotal.textContent = String(state.totalScore || 0);
  }

  // -------------------------------
  //  Question Buttons
  // -------------------------------
  function renderButtons(subject) {
    const isAllie = subject === "allie";
    const bank = isAllie ? state.allieBank : state.portBank;
    const container = isAllie ? $("allieQuestionButtons") : $("portQuestionButtons");
    const screenId = isAllie ? "allieQuestionsScreen" : "portQuestionsScreen";

    container.innerHTML = "";

    bank.forEach((q, idx) => {
      const btn = document.createElement("button");
      btn.textContent = q.label;

      btn.addEventListener("click", async () => {
        safePlay(A.click, { restart: true });
        setMeterState("ACTIVE");

        const mode = decideResponseMode(subject, q);
        const lied = (mode === "lie" || mode === "half" || mode === "loop" || mode === "silence");

        // Special Scene Hook (wife murder)
        if (!isAllie && q.specialScene === "wife_murder") {
          applyFX(screenId, { shake: true, static: true, red: true, flicker: true });
          safePlay(A.sting, { restart: true, volume: 0.65 });
          safePlay(A.heartbeat, { restart: true, volume: 0.22 });

          await runTakeoverScene([
            {
              text: "YOU MURDERED ME...",
              style: "red",
              ms: 650,
              fx: { shake: true, red: true, static: true, flicker: true },
              rainWords: ["YOU DID IT","LIAR","BLOOD","REMEMBER","SAY MY NAME"],
              rainCount: 18,
              sound: A.monster,
              wait: 420,
            },
            {
              text: "I WAS YOUR WIFE",
              style: "red",
              ms: 720,
              fx: { shake: true, red: true, static: true, flicker: true },
              rainWords: ["WIFE","RING","HOME","SCREAM","SILENCE"],
              rainCount: 16,
              sound: A.sting,
              wait: 520,
            },
          ], screenId);

          await setDialogue("port", `Port’s lips part like he wants to speak.

But the room speaks first.

“Don’t ask that.”`);

          logObs("port", "Trigger phrase caused hostile takeover response.", "ALERT");
          logMany("port", q.obsLie, "OBS");
          setHint("port", "Hint: Some questions wake the space up. Threat Presence can spike instantly.");

          state.portAnger += q.angerHit || 2;
          state.portMind.suspicion += 2;
          state.portMind.fatigue += 2;
          state.portMind.mask = Math.max(0, state.portMind.mask - 22);
          state.portMind.lastMode = "lie";

          bank.splice(idx, 1);
          state.portAsked += 1;

          if (state.portAsked >= state.unlockAt || state.portBank.length === 0) {
            $("toPortMeterBtn").disabled = false;
            logObs("port", "Pressure Meter ready: sufficient observations gathered.", "NOTE");
          }

          updateStatus("port");
          renderButtons("port");
          return;
        }

        // Lie / scary response behavior
        if (lied) {
          applyFX(screenId, q.lieFX || { static: true });
          safePlay(A.monster, { restart: true, volume: 0.55 });

          if (mode === "lie") {
            flashTakeover("LIAR", "red", 520);
            rainWords(["LIAR","DENY","WRONG","STOP LOOKING","IT SEES YOU"], 14);
          } else if (mode === "half") {
            flashTakeover("DISSONANCE", "red", 520);
            rainWords(["SPLIT STORY","UNSTABLE","DISSONANCE"], 12);
          } else if (mode === "loop") {
            flashTakeover("LOOP", "blue", 520);
            rainWords(["AGAIN","AGAIN","AGAIN"], 10);
          } else if (mode === "silence") {
            flashTakeover("...", "blue", 520);
            rainWords(["LISTEN","LISTEN","LISTEN"], 10);
          }

          if (isAllie) {
            state.allieAnger += q.angerHit || 1;
            state.allieMind.suspicion += (q.tone === "accuse" ? 2 : 1);
            state.allieMind.fatigue += 1;
            state.allieMind.mask = Math.max(0, state.allieMind.mask - (mode === "half" ? 18 : mode === "lie" ? 12 : 8));
            state.allieMind.lastMode = mode;
            if (mode === "half") state.allieMind.dissonance += 1;

            if (state.allieAnger >= LIMITS.allieCutoff) {
              applyFX("allieQuestionsScreen", { shake: true, static: true, flicker: true, red: true });
              safePlay(A.sting, { restart: true, volume: 0.60 });
              await setDialogue("allie", `${player.name}… stop. Stop looking at it. Please. I can’t—`);
              logObs("allie", "Inquiry terminated by panic response. Remaining questions unavailable.", "NOTE");
              state.allieBank = [];
              $("toAllieMeterBtn").disabled = false;
              setHint("allie", "Pressure Meter available: inquiry cut short.");
              updateStatus("allie");
              renderButtons("allie");
              return;
            }
          } else {
            state.portAnger += q.angerHit || 1;
            state.portMind.suspicion += (q.tone === "accuse" ? 2 : 1);
            state.portMind.fatigue += 1;
            state.portMind.mask = Math.max(0, state.portMind.mask - (mode === "half" ? 16 : mode === "lie" ? 10 : 7));
            state.portMind.lastMode = mode;
            if (mode === "half") state.portMind.dissonance += 1;

            safePlay(A.sting, { restart: true, volume: 0.55 });
            redFlash(420);
            shake("portQuestionsScreen");
            logObs("port", "Port’s tone shifts into threat. The room agrees.", "RESIST");

            if (state.portAnger >= LIMITS.portCutoff) {
              applyFX("portQuestionsScreen", { shake: true, static: true, flicker: true, red: true });
              safePlay(A.sting, { restart: true, volume: 0.60 });
              await setDialogue("port", `You don’t get to decide what I am. Ask again and the room will answer for me.`);
              logObs("port", "Inquiry terminated by rage response. Remaining questions unavailable.", "NOTE");
              state.portBank = [];
              $("toPortMeterBtn").disabled = false;
              setHint("port", "Pressure Meter available: inquiry cut short.");
              updateStatus("port");
              renderButtons("port");
              return;
            }
          }

          const lieText =
            mode === "lie" ? q.lie :
            mode === "half" ? `${q.lie}

${q.truth || ""}` :
            mode === "loop" ? `${q.lie}

${(q.lie || "").split(" ").slice(0, 6).join(" ")}...` :
            `...`;

          await setDialogue(subject, lieText.replaceAll("${NAME}", player.name));
// fix error here 
          const obsPack =
            mode === "lie" ? q.obsLie :
            mode === "half" ? (q.obsLie || []).concat(["Dissonance detected: Stability drops."]) :
            mode === "loop" ? (q.obsLie || []).concat(["Loop behavior detected: Awareness spikes."]) :
            (q.obsLie || []).concat(["Silence behavior: Resistance increases."]);

          logMany(subject, obsPack, "OBS");
          setHint(subject, buildHint(subject, q, mode));

          if (q.followLabel && q.follow) {
            bank[idx] = {
              id: q.id + "_F",
              label: q.followLabel,
              tone: "pressure",
              truth: q.follow,
              lie: q.follow,
              obsTruth: q.obsFollow || [],
              obsLie: q.obsFollow || [],
              angerHit: 1,
              lieFX: q.followFX || { static: true },
              hint: q.hint,
            };
          } else {
            bank.splice(idx, 1);
          }

          if (isAllie) state.allieAsked += 1;
          else state.portAsked += 1;

        } else {
          // Truth path
          await setDialogue(subject, q.truth.replaceAll("${NAME}", player.name));
          logMany(subject, q.obsTruth, "OBS");
          setHint(subject, buildHint(subject, q, "truth"));

          if (q.followLabel && q.follow) {
            bank[idx] = {
              id: q.id + "_F",
              label: q.followLabel,
              tone: "pressure",
              truth: q.follow,
              lie: q.follow,
              obsTruth: q.obsFollow || [],
              obsLie: q.obsFollow || [],
              angerHit: 1,
              lieFX: q.followFX || { static: true },
              hint: q.hint,
            };
          } else {
            bank.splice(idx, 1);
          }

          if (isAllie) state.allieAsked += 1;
          else state.portAsked += 1;
        }

        // Unlock meter rules
        if (isAllie) {
          if (state.allieAsked >= state.unlockAt || state.allieBank.length === 0) {
            $("toAllieMeterBtn").disabled = false;
            logObs("allie", "Pressure Meter ready: sufficient observations gathered.", "NOTE");
          }
          updateStatus("allie");
          renderButtons("allie");
        } else {
          if (state.portAsked >= state.unlockAt || state.portBank.length === 0) {
            $("toPortMeterBtn").disabled = false;
            logObs("port", "Pressure Meter ready: sufficient observations gathered.", "NOTE");
          }
          updateStatus("port");
          renderButtons("port");
        }
      });

      container.appendChild(btn);
    });
  }

  // -------------------------------
  // Clamp input
  // -------------------------------
  function clampNum(v) {
    const n = parseInt(v || "0", 10);
    return Math.max(0, Math.min(10, isNaN(n) ? 0 : n));
  }

  // -------------------------------
  // Story text blocks
  // -------------------------------
  const LOADING_TEXT = `Loading Mindscape…
Calibrating signal filters…
Stability check: unstable
Threat check: unknown
Awareness check: watching

Do not rush.
The room can tell.`;
// introduction block error, fixed loading
  function buildLetterText() {
    return `[CLASSIFIED BRIEF]
Operative: ${player.name || "UNKNOWN"}
Tool: Pressure Meter (Reactive)

Rule: The meter reads the space, not the subject.
Warning: Some spaces will lie back.`;
  }

  // -------------------------------
  // Start conditions
  // -------------------------------
  lockCaseFile("Case file locked until calibration completes.");
  setMeterState("LOCKED");

  // LOADING SCREEN: first thing you see
  type($("loadingText"), LOADING_TEXT, 14);
//error froze fixed code here
  $("loadingContinueBtn")?.addEventListener("click", async () => {
    unlockAudioOnce();
    safePlay(A.click, { restart: true });
    staticFlash(120);
    showScreen("introScreen");
    // Fallback if something prevents transition (ai code to stop bugs from happenbing)
    setTimeout(() => {
      const a = document.querySelector(".screen.active");
      if (!a || a.id !== "introScreen") {
        // hard swap
        document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active","enter","exit","fade-out"));
        $("introScreen")?.classList.add("active");
      }
    }, 240);
  });

  // INTRO -> CLASSIFIED
  $("introContinueBtn")?.addEventListener("click", async () => {
    safePlay(A.click, { restart: true });
    showScreen("letterScreen");
    await type($("letterText"), `A file slides under your door.

${buildLetterText()}`, 14);
  });

  // CLASSIFIED -> SETUP
  $("letterContinueBtn")?.addEventListener("click", () => {
    safePlay(A.click, { restart: true });
    showScreen("setupScreen");
  });

  // SETUP -> TUTORIAL
  $("setupBtn")?.addEventListener("click", async () => {
    safePlay(A.click, { restart: true });

    player.name = ($("playerName").value || "").trim() || "Operative";
    player.age = parseInt($("playerAge").value || "0", 10) || 0;

    caseOperativeLine.textContent = `Operative: ${player.name} (${player.age || "?"})`;
    caseToolLine.textContent = `Tool: Pressure Meter`;
    setMeterState("STANDBY");

    showScreen("tutorialScreen");

    await type(
      $("tutorialText"),
      `Calibration begins.

The meter’s needles are not measuring the person.
They are measuring the room's response to you noticing.

Safe questions reduce pressure.
Accusations increase Resistance.

Click slowly.
Or don’t.
The room can tell when you're rushing.`,
      14
    );

    $("tutorialHint").textContent = "Hint: Start safe. Pressure builds memory.";
  });

  // TUTORIAL -> ALLIE (Subject 1) + unlock case file + ambience
  $("tutorialNextBtn")?.addEventListener("click", async () => {
    safePlay(A.click, { restart: true });
    unlockCaseFile("Case file unlocked. The room will auto-log observations.");
    setMeterState("CALIBRATED");

    loopAmbience(true);

    setSubject("Allie", "Environment: Bedroom threshold. The closet behaves like a boundary.");
    logObs("allie", "Entered Subject 1 environment. Room reacts to observation.", "NOTE");

    showScreen("allieRoomScreen");
    await type(
      $("allieRoomText"),
      `Allie’s room is too quiet.
A corner keeps refusing your eyes.
The closet looks like a mouth.

You feel the meter warm up in your hand.`,
      14
    );
  });

  // ALLIE ENV -> ALLIE QUESTIONS with mini intro dialogue
  $("approachAllieBtn")?.addEventListener("click", async () => {
    safePlay(A.click, { restart: true });
    showScreen("allieQuestionsScreen");
    await setDialogue("allie", `Allie stares at you.

“You’re not supposed to be here, ${player.name}.”

Your breath fogs.
The room listens.`);
    setHint("allie", "Hint: Start safe. The room punishes certainty.");
    updateStatus("allie");
    renderButtons("allie");
    safePlay(A.whisper, { restart: true, volume: 0.40 });
  });

  // ALLIE -> METER
  $("toAllieMeterBtn")?.addEventListener("click", () => {
    safePlay(A.click, { restart: true });
    showScreen("allieMeterScreen");
    $("allieMeterNudge").textContent = "Interpret the SPACE. Not the person.";
    safePlay(A.scratch, { restart: true, volume: 0.45 });
  });

  // ALLIE SUBMIT -> 2 paragraph ending -> PORT DOSSIER
  $("submitAllieBtn")?.addEventListener("click", async () => {
    safePlay(A.click, { restart: true });

    const g = {
      threat: clampNum($("allieThreat").value),
      awareness: clampNum($("allieAwareness").value),
      stability: clampNum($("allieStability").value),
      resistance: clampNum($("allieResistance").value),
    };

    const allieActual = { threat: 7, awareness: 8, stability: 3, resistance: 6 };
    const { total, zeros } = compute(g, allieActual);

    state.allieScore = total;
    state.allieEndingKey = endingKeyFromScore(total, zeros);

    safePlay(A.score, { restart: true, volume: 0.55 });

    showScreen("allieEndingScreen");

    const para1 =
      state.allieEndingKey === "safe"
        ? "Your reading lands gently. The corner stops pushing back, just for a second, like the room is surprised you didn’t try to win. Allie’s shoulders drop, and the air feels less crowded."
      : state.allieEndingKey === "contained"
        ? "Your reading is careful, not perfect. The room still watches you, but it doesn’t lunge. Allie exhales in a way that sounds like relief and fear at the same time."
      : state.allieEndingKey === "fracture"
        ? "Your certainty shakes the space. The closet creaks like it’s laughing. The corner feels closer, not because it moved—because you named it wrong."
        : "You misread the room and it learns you. The air thickens. The corner becomes an audience. Allie flinches like she heard your thoughts out loud.";

    const para2 =
      `Allie whispers:
“Don’t take it personally. It just… collects people who guess.”

Your meter ticks once. Like a warning. Like a memory.`;

    await type($("allieEndingText"), `${para1}

${para2}`, 14);
  });

  // ALLIE ENDING -> PORT DOSSIER
  $("toPortDossierBtn")?.addEventListener("click", async () => {
    safePlay(A.click, { restart: true });

    setSubject("Port", "Environment: loop corridor. Sound repeats like a lock.");
    logObs("port", "Subject 2 dossier opened. Pattern repetition expected.", "NOTE");

    showScreen("portDossierScreen");
    await type(
      $("portDossierText"),
      `Subject 2: Port

His mindscape is a loop.
The room repeats itself because it wants you to.

Proceed carefully.
Being wrong is not harmless here.`,
      14
    );
  });

  // PORT DOSSIER -> PORT ENV
  $("enterPortMindspaceBtn")?.addEventListener("click", async () => {
    safePlay(A.click, { restart: true });

    logObs("port", "Entered Subject 2 environment. Pattern repetition detected.", "NOTE");

    showScreen("portRoomScreen");
    await type(
      $("portRoomText"),
      `Port’s room is not a room.
It’s a hallway that keeps returning you.
A sound repeats like a lock.

Your meter’s needle trembles.`,
      14
    );
  });

  // PORT ENV -> PORT QUESTIONS w/ intro dialogue
  $("approachPortBtn")?.addEventListener("click", async () => {
    safePlay(A.click, { restart: true });
    showScreen("portQuestionsScreen");
    await setDialogue("port", `Port smiles.

“Say it wrong again, ${player.name}.”

The hallway exhales.
Like it’s pleased.`);
    setHint("port", "Hint: Loops = Awareness. Quiet = trap.");
    updateStatus("port");
    renderButtons("port");
    safePlay(A.whisper, { restart: true, volume: 0.35 });
  });

  // PORT -> METER
  $("toPortMeterBtn")?.addEventListener("click", () => {
    safePlay(A.click, { restart: true });
    showScreen("portMeterScreen");
    $("portMeterNudge").textContent = "Interpret the SPACE. Your confidence is also pressure.";
    safePlay(A.scratch, { restart: true, volume: 0.45 });
  });

  // PORT SUBMIT -> mini ending -> OVERALL ENDING
  $("submitPortBtn")?.addEventListener("click", async () => {
    safePlay(A.click, { restart: true });

    const g = {
      threat: clampNum($("portThreat").value),
      awareness: clampNum($("portAwareness").value),
      stability: clampNum($("portStability").value),
      resistance: clampNum($("portResistance").value),
    };

    const portActual = { threat: 6, awareness: 9, stability: 2, resistance: 8 };
    const { total, zeros } = compute(g, portActual);

    state.portScore = total;
    state.portEndingKey = endingKeyFromScore(total, zeros);

    safePlay(A.score, { restart: true, volume: 0.55 });

    showScreen("portEndingScreen");

    const para1 =
      state.portEndingKey === "safe"
        ? "You read the pattern without feeding it. The loop stutters—just once—like the hallway is confused that you didn’t chase the bait."
      : state.portEndingKey === "contained"
        ? "You don’t fix the loop, but you don’t empower it either. The sound keeps repeating, but it feels… farther away."
      : state.portEndingKey === "fracture"
        ? "Your reading gives the loop a new rhythm. The hallway likes your mistake. It repeats it with pride."
        : "You become part of the pattern. Port’s smile feels practiced, and the hallway answers for him.";

    const para2 =
      `Port says:
“Lies are doors.”

The meter ticks like footsteps behind you.`;

    await type($("portEndingText"), `${para1}

${para2}`, 14);
  });

  // OVERALL ENDING + SCORE + SAVE LEADERBOARD
  $("toFinalEndingBtn")?.addEventListener("click", async () => {
    safePlay(A.click, { restart: true });

    state.totalScore = state.allieScore + state.portScore;

    if (state.totalScore >= 26) state.finalEndingKey = "CLEAN EXIT";
    else if (state.totalScore >= 20) state.finalEndingKey = "CONTAINED";
    else if (state.totalScore >= 14) state.finalEndingKey = "FRACTURE";
    else state.finalEndingKey = "BREACH";

    showScreen("finalEndingScreen");

    const endingText =
      state.finalEndingKey === "CLEAN EXIT" ? "You leave with your name still yours." :
      state.finalEndingKey === "CONTAINED" ? "You leave, but it follows at a distance." :
      state.finalEndingKey === "FRACTURE" ? "You leave, and something leaves with you." :
      "You do not leave. You only change rooms.";

    if (state.finalEndingKey === "BREACH") {
      safePlay(A.heartbeat, { restart: true, volume: 0.22 });
      await runTakeoverScene([
        { text: "BREACH", style: "red", ms: 700, fx: { shake: true, red: true, static: true, flicker: true }, rainWords: ["YOU ARE HERE","IT KNOWS YOU","WRONG NAME","BREACH"], rainCount: 18, sound: A.heartbeat, wait: 540 },
      ], "finalEndingScreen");
    } else {
      safePlay(A.sting, { restart: true, volume: 0.35 });
    }

    await type($("finalEndingText"), `${endingText}

Final Score: ${state.totalScore}/32`, 14);

    // Save leaderboard entry now (so it exists when they click)
    const lb = loadLB();
    lb.unshift({
      name: player.name || "Operative",
      score: state.totalScore,
      ending: state.finalEndingKey,
      ts: Date.now()
    });
    // sort best first, keep top 30
    lb.sort((a,b) => b.score - a.score || b.ts - a.ts);
    saveLB(lb);
  });

  // FINAL -> LEADERBOARD
  $("toLeaderboardBtn")?.addEventListener("click", () => {
    safePlay(A.click, { restart: true });
    showScreen("leaderboardScreen");

    $("lbName").textContent = player.name || "Operative";
    $("lbScore").textContent = String(state.totalScore || 0);
    $("lbEnding").textContent = state.finalEndingKey || "—";

    renderLB(loadLB());
    updateDebugReadout();
  });

  // Restart
  $("restartBtn")?.addEventListener("click", () => location.reload());
});
