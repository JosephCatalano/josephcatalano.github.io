(() => {
  const root = document.documentElement;
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  $("#year").textContent = new Date().getFullYear();

  /* Toast */
  const toast = $("#toast");
  let toastTimer;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
  }

  /* Header state + scroll progress */
  const header = $("#header");
  const progress = $(".scroll-progress span");
  const pathTrack = $("#path-track");
  const pathFg = $("#path-fg");
  const stages = $$(".stage");

  function onScroll() {
    const y = scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    header.classList.toggle("scrolled", y > 12);
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;

    if (pathTrack && !reduceMotion) {
      const r = pathTrack.getBoundingClientRect();
      const start = innerHeight * 0.85;
      const end = innerHeight * 0.35;
      const t = Math.min(1, Math.max(0, (start - r.top) / (start - end)));
      pathFg.style.strokeDashoffset = String(1 - t);
      stages.forEach((s, i) => s.classList.toggle("lit", t >= i / stages.length + 0.02));
    }
  }
  if (reduceMotion) stages.forEach((s) => s.classList.add("lit"));
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);
  onScroll();

  /* Mobile nav */
  const menuBtn = $("#menu-toggle");
  const navList = $("#nav-links");
  function setMenu(open) {
    navList.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  menuBtn.addEventListener("click", () => setMenu(!navList.classList.contains("open")));
  $$(".nav-link").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  /* Active nav link */
  const navMap = new Map($$(".nav-link").map((a) => [a.getAttribute("href").slice(1), a]));
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        $$(".nav-link").forEach((a) => a.classList.remove("active"));
        navMap.get(entry.target.id)?.classList.add("active");
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  $$("main section[id]").forEach((s) => sectionObserver.observe(s));

  /* Reveal + count-up */
  function countUp(el) {
    const to = parseFloat(el.dataset.to);
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    if (reduceMotion) return;
    const duration = 1200;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (to * eased).toFixed(decimals);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in");
        $$(".count", entry.target).forEach(countUp);
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  $$(".reveal").forEach((el) => revealObserver.observe(el));

  /* Copy email */
  $$(".copy-email").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const email = btn.dataset.email;
      try {
        await navigator.clipboard.writeText(email);
        showToast("Email copied to clipboard");
      } catch {
        location.href = `mailto:${email}`;
      }
    });
  });

  /* Theme toggle + token inspector */
  const inspector = $("#token-inspector");
  const tokenList = $("#token-list");
  const tokenNames = ["--bg", "--surface", "--ink", "--accent", "--signal"];
  let inspectorTimer;

  function readTokens() {
    const cs = getComputedStyle(root);
    return Object.fromEntries(tokenNames.map((n) => [n, cs.getPropertyValue(n).trim()]));
  }

  $("#theme-toggle").addEventListener("click", () => {
    const before = readTokens();
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    localStorage.setItem("theme", next);
    $('meta[name="theme-color"]').setAttribute("content", next === "dark" ? "#0B0E0D" : "#F4F2EC");
    const after = readTokens();

    tokenList.replaceChildren(
      ...tokenNames.map((n) => {
        const li = document.createElement("li");
        const name = document.createElement("span");
        name.textContent = n;
        const val = document.createElement("b");
        const swatch = document.createElement("i");
        swatch.style.background = after[n];
        val.append(swatch, `${before[n]} → ${after[n]}`);
        li.append(name, val);
        return li;
      })
    );
    inspector.classList.add("show");
    clearTimeout(inspectorTimer);
    inspectorTimer = setTimeout(() => inspector.classList.remove("show"), 3200);
  });

  /* EWRS migration scrubber */
  const range = $("#ng-range");
  if (range) {
    const versionEl = $("#ng-version");
    const checks = $$(".chk");
    const work = $$(".ng-work li");
    const update = () => {
      const v = Number(range.value);
      const pct = ((v - 12) / 9) * 100;
      range.style.setProperty("--fill", `${pct}%`);
      versionEl.textContent = `v${v}`;
      checks.forEach((c) => c.classList.toggle("on", v >= Number(c.dataset.on)));
      work.forEach((li) => li.classList.toggle("done", v >= Number(li.dataset.at)));
    };
    range.addEventListener("input", update);
    update();

    // Auto-play the upgrade once when it scrolls into view
    if (!reduceMotion) {
      const io = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          io.disconnect();
          let v = 12;
          const step = setInterval(() => {
            if (document.activeElement === range || v >= 21) return clearInterval(step);
            range.value = ++v;
            update();
          }, 260);
        },
        { threshold: 0.6 }
      );
      io.observe(range);
    } else {
      range.value = 21;
      update();
    }
  }

  /* CALM invitation handshake */
  const hs = $("#handshake");
  if (hs) {
    const steps = $$(".hs-step", hs);
    const log = $("#hs-log");
    const consoleEl = $(".hs-console", hs);
    const stateEl = $("#hs-state");
    const nextBtn = $("#hs-next");
    const replayBtn = $("#hs-replay");
    const resetBtn = $("#hs-reset");

    const script = [
      { state: "issued", log: "$ invite.create(team) → token sent, sha256(token) stored", next: "Redeem link" },
      { state: "consumed", log: "$ invite.redeem(token) → hash match, conditional update ok, membership created", next: "Start session" },
      { state: "active", log: "$ session → registration state in JWT, proxy + API guards pass", next: null },
    ];
    let i = 0;

    function render() {
      steps.forEach((s, idx) => {
        s.classList.toggle("is-active", idx === i);
        s.classList.toggle("is-done", idx < i);
      });
      stateEl.textContent = script[i].state;
      log.textContent = script[i].log;
      consoleEl.className = "hs-console" + (i > 0 ? " ok" : "");
      nextBtn.hidden = !script[i].next;
      if (script[i].next) nextBtn.textContent = script[i].next;
      replayBtn.disabled = i === 0;
    }

    nextBtn.addEventListener("click", () => { if (i < script.length - 1) { i++; render(); } });
    replayBtn.addEventListener("click", () => {
      stateEl.textContent = "rejected";
      log.textContent = "$ invite.redeem(token) → rejected: invitation already used. Nothing changed.";
      consoleEl.className = "hs-console err";
      void consoleEl.offsetWidth;
      consoleEl.classList.add("flash");
    });
    resetBtn.addEventListener("click", () => { i = 0; render(); });
    render();
  }

  /* IQ-Leaf gauge drift + manual pump */
  const gauge = $(".gauge");
  if (gauge) {
    const gaugeFill = $(".gauge-bar span", gauge);
    const gaugeVal = $(".gauge-val", gauge);
    const waterBtn = $("#water-btn");
    let level = 42;
    let pumping = false;
    const draw = (suffix = "") => {
      gaugeFill.style.width = `${level}%`;
      gaugeVal.textContent = `${level}%${suffix}`;
    };
    if (!reduceMotion) {
      setInterval(() => {
        if (pumping) return;
        level = level < 30 ? 68 : level - 2;
        draw(level >= 68 ? " · auto-watered" : "");
      }, 1400);
    }
    waterBtn?.addEventListener("click", () => {
      pumping = true;
      waterBtn.disabled = true;
      waterBtn.textContent = "pump: ON · relay closed";
      gauge.classList.add("pumping");
      level = 72;
      draw(" · pumping");
      setTimeout(() => {
        pumping = false;
        gauge.classList.remove("pumping");
        waterBtn.disabled = false;
        waterBtn.textContent = "Water now";
        draw(" · watered");
      }, 1800);
    });
  }

  /* Build card cursor spotlight */
  $("#builds-grid")?.addEventListener("pointermove", (e) => {
    const card = e.target.closest(".build");
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${e.clientX - r.left}px`);
    card.style.setProperty("--my", `${e.clientY - r.top}px`);
  });

  /* RevealAid eligibility evaluator (illustrative rules) */
  const elig = $("#elig");
  if (elig) {
    const prov = $("#el-prov");
    const enrol = $("#el-enrol");
    const income = $("#el-income");
    const incomeOut = $("#el-income-out");
    const result = $("#el-result");
    const LIMIT = 100;
    const rules = {
      prov: () => [prov.value === "Ontario", `Residency: ${prov.value}${prov.value === "Ontario" ? "" : " (requires Ontario)"}`],
      enrol: () => [enrol.value === "full-time", `Enrolment: ${enrol.value}${enrol.value === "full-time" ? "" : " (requires full-time)"}`],
      income: () => [Number(income.value) <= LIMIT, Number(income.value) <= LIMIT ? "Income within threshold" : `Income over $${LIMIT}k threshold`],
    };
    const evaluate = () => {
      incomeOut.textContent = `$${income.value}k`;
      const failed = [];
      Object.entries(rules).forEach(([key, fn]) => {
        const [pass, label] = fn();
        const li = $(`[data-rule="${key}"]`, elig);
        $("span", li).className = pass ? "ok" : "fail";
        $("em", li).textContent = label;
        if (!pass) failed.push(key);
      });
      const passed = 3 - failed.length;
      result.classList.toggle("is-fail", failed.length > 0);
      result.textContent = failed.length
        ? `NOT ELIGIBLE · ${passed} of 3 rules · failed: ${failed.map((k) => ({ prov: "residency", enrol: "enrolment", income: "income" })[k]).join(", ")}`
        : "ELIGIBLE · 3 of 3 rules · traceable";
    };
    [prov, enrol, income].forEach((el) => el.addEventListener("input", evaluate));
    evaluate();
  }

  /* Runnable mini terminals */
  $$(".mini-terminal").forEach((term) => {
    const lines = $$("p", term);
    const cmdSpan = $("span", lines[0]);
    if (!cmdSpan) return;
    term.removeAttribute("aria-hidden");
    const cmdText = cmdSpan.textContent;
    const outLines = lines.slice(1);
    const outputs = outLines.map((p) => p.textContent);

    const bar = document.createElement("div");
    bar.className = "term-bar";
    bar.append(...[0, 1, 2].map(() => document.createElement("i")));
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "term-run";
    btn.textContent = "▶ run";
    btn.setAttribute("aria-label", `Run ${cmdText}`);
    bar.append(btn);
    term.prepend(bar);

    let timers = [];
    const play = () => {
      timers.forEach(clearTimeout);
      timers = [];
      btn.disabled = true;
      term.classList.add("running");
      cmdSpan.textContent = "";
      outLines.forEach((p) => { p.textContent = ""; p.classList.remove("spin"); });
      let t = 0;
      [...cmdText].forEach((ch) => timers.push(setTimeout(() => (cmdSpan.textContent += ch), (t += 22))));
      outLines.forEach((p, i) => {
        timers.push(setTimeout(() => { p.classList.add("spin"); p.textContent = "running…"; }, (t += 220)));
        timers.push(setTimeout(() => { p.classList.remove("spin"); p.textContent = outputs[i]; }, (t += 650)));
      });
      timers.push(setTimeout(() => {
        term.classList.remove("running");
        btn.disabled = false;
        btn.textContent = "↻ re-run";
      }, (t += 60)));
    };
    btn.addEventListener("click", play);

    if (!reduceMotion) {
      const io = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        play();
      }, { threshold: 0.7 });
      io.observe(term);
    }
  });

  /* Pipeline flows: trace a request through each boundary while in view */
  $$(".boundaries").forEach((box) => {
    const nodes = $$("span", box);
    if (!nodes.length) return;
    const status = document.createElement("p");
    status.className = "flow-status";
    box.append(status);
    let idx = -1;
    let timer = null;
    const step = () => {
      idx = (idx + 1) % (nodes.length + 1);
      nodes.forEach((n, i) => {
        n.classList.toggle("is-lit", i === idx);
        n.classList.toggle("is-done", i < idx);
      });
      status.innerHTML = idx < nodes.length
        ? `stage ${idx + 1}/${nodes.length} → <b></b>`
        : `✓ traced through ${nodes.length} boundaries`;
      if (idx < nodes.length) status.querySelector("b").textContent = nodes[idx].textContent;
    };
    const start = () => { if (!timer) { step(); timer = setInterval(step, 900); } };
    const stop = () => { clearInterval(timer); timer = null; };
    box.addEventListener("pointerenter", stop);
    box.addEventListener("pointerleave", () => { if (!reduceMotion) start(); });
    nodes.forEach((n, i) => n.addEventListener("pointerenter", () => { idx = i - 1; step(); }));

    if (reduceMotion) {
      status.textContent = `${nodes.length} boundaries`;
      return;
    }
    new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()), { threshold: 0.4 }).observe(box);
  });

  /* Builds filter tabs */
  const filterBtns = $$(".filter-btn");
  const buildCards = $$("#builds-grid .build");
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const cat = btn.dataset.filter;
      filterBtns.forEach((b) => {
        const active = b === btn;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-selected", String(active));
      });
      buildCards.forEach((card) => {
        const cats = (card.dataset.cat || "").split(" ");
        const match = cat === "all" || cats.includes(cat);
        const wasHidden = card.classList.contains("is-filtered-out");
        card.classList.toggle("is-filtered-out", !match);
        if (match && wasHidden && !reduceMotion) {
          card.classList.remove("just-shown");
          void card.offsetWidth;
          card.classList.add("just-shown");
        }
      });
    });
  });

  /* Command Palette (Cmd+K / Ctrl+K) */
  const cmdBackdrop = $("#cmd-backdrop");
  const cmdInput = $("#cmd-input");
  const cmdTrigger = $("#cmd-trigger");
  const cmdClose = $("#cmd-close");
  const cmdItems = $$("#cmd-list li");
  let selectedIdx = 0;

  function visibleCmdItems() {
    return cmdItems.filter((li) => !li.hidden);
  }

  function highlightCmd(idx) {
    const vis = visibleCmdItems();
    if (!vis.length) return;
    selectedIdx = (idx + vis.length) % vis.length;
    cmdItems.forEach((li) => li.classList.remove("is-selected"));
    vis[selectedIdx].classList.add("is-selected");
    vis[selectedIdx].scrollIntoView({ block: "nearest" });
  }

  function openCmd() {
    if (!cmdBackdrop) return;
    cmdBackdrop.hidden = false;
    cmdInput.value = "";
    cmdItems.forEach((li) => (li.hidden = false));
    highlightCmd(0);
    setTimeout(() => cmdInput.focus(), 10);
  }

  function closeCmd() {
    if (!cmdBackdrop) return;
    cmdBackdrop.hidden = true;
  }

  function runCmdItem(li) {
    if (!li) return;
    const action = li.dataset.action;
    closeCmd();
    if (action === "goto") {
      const el = $(li.dataset.target);
      el?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    } else if (action === "copy-email") {
      navigator.clipboard?.writeText("joseph1catalano@gmail.com").then(() => showToast("Email copied to clipboard"));
    } else if (action === "theme") {
      $("#theme-toggle")?.click();
    } else if (action === "link") {
      window.open(li.dataset.url, "_blank", "noopener,noreferrer");
    }
  }

  cmdTrigger?.addEventListener("click", openCmd);
  cmdClose?.addEventListener("click", closeCmd);
  cmdBackdrop?.addEventListener("click", (e) => {
    if (e.target === cmdBackdrop) closeCmd();
  });

  cmdInput?.addEventListener("input", () => {
    const q = cmdInput.value.trim().toLowerCase();
    cmdItems.forEach((li) => {
      li.hidden = !li.textContent.toLowerCase().includes(q);
    });
    highlightCmd(0);
  });

  cmdItems.forEach((li) => {
    li.addEventListener("click", () => runCmdItem(li));
  });

  addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      if (cmdBackdrop?.hidden) openCmd();
      else closeCmd();
      return;
    }
    if (cmdBackdrop && !cmdBackdrop.hidden) {
      if (e.key === "Escape") {
        e.preventDefault();
        closeCmd();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        highlightCmd(selectedIdx + 1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        highlightCmd(selectedIdx - 1);
      } else if (e.key === "Enter") {
        e.preventDefault();
        const vis = visibleCmdItems();
        runCmdItem(vis[selectedIdx]);
      }
    }
  });
})();
