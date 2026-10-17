(function () {
  const S = window.SITE;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const price = "$" + S.preorder.price;
  // A design with colour options is shown in one colour at a time: v = design with that colour's img/glow
  const variant = (d, ci) => (d.colors ? { ...d, img: d.colors[ci].img, glow: d.colors[ci].glow || d.glow, color: d.colors[ci].name } : d);
  const img = (d, view) => `img/${d.img}-${view}.${view === "front" || view === "back" ? "webp" : "jpg"}?v=${S.imgVersion || 1}`;

  // Text that comes from config
  const fill = (attr, value) => $$(`[${attr}]`).forEach((el) => (el.textContent = value));
  fill("data-brand", S.brand.name);
  fill("data-tagline", S.brand.tagline);
  fill("data-price", price);
  fill("data-unlock", S.preorder.unlockAt);
  fill("data-season", S.preorder.season);
  fill("data-year", new Date().getFullYear());
  document.title = `${S.brand.name} ${S.brand.tagline} · ${S.preorder.season} Pre-Orders`;
  if (S.brand.contactEmail) {
    $$("[data-contact]").forEach((a) => { a.href = "mailto:" + S.brand.contactEmail; a.hidden = false; });
  }

  // Hero print picker: the vest swaps and the print floods the background
  const heroVest = $("#heroVest");
  const flood = $(".hero__flood");
  const picker = $(".hero__picker");
  let heroIndex = 0;
  let autoTimer;

  function setHero(i, user) {
    const d = S.designs[i];
    heroIndex = i;
    $$(".chip", picker).forEach((c, j) => c.setAttribute("aria-pressed", String(j === i)));
    heroVest.classList.add("is-out");
    flood.classList.add("is-swapping");
    setTimeout(() => {
      heroVest.src = img(d, "front");
      heroVest.alt = `${d.name} impact vest, front`;
      flood.style.backgroundImage = `url("${img(d, "print")}")`;
      $("#heroName").textContent = d.name;
      $("#heroKicker").textContent = d.kicker;
      heroVest.classList.remove("is-out");
      flood.classList.remove("is-swapping");
    }, reduced ? 0 : 260);
    if (user) clearInterval(autoTimer);
  }

  S.designs.forEach((d, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chip";
    b.setAttribute("aria-label", d.name);
    b.innerHTML = `<span style="background-image:url('${img(d, "print")}')"></span>`;
    b.addEventListener("click", () => setHero(i, true));
    picker.appendChild(b);
  });
  setHero(0);
  if (!reduced) autoTimer = setInterval(() => setHero((heroIndex + 1) % S.designs.length), 4200);
  // preload fronts
  S.designs.forEach((d) => { const im = new Image(); im.src = img(d, "front"); });

  // Product cards
  const grid = $("#grid");
  S.designs.forEach((d, i) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = d.noBack ? "card card--noback reveal" : "card reveal";
    card.style.setProperty("--glow", d.glow);
    card.setAttribute("aria-label", `${d.name}, ${price} pre-order. View and reserve`);
    card.innerHTML = `
      <div class="card__print" style="background-image:url('${img(d, "print")}')"></div>
      <span class="card__tag">${String(i + 1).padStart(2, "0")} / ${String(S.designs.length).padStart(2, "0")}</span>
      <div class="card__vest">
        <img class="card__front" src="${img(d, "front")}" alt="" loading="lazy" width="1100" height="1268">
        ${d.noBack ? "" : `<img class="card__back" src="${img(d, "back")}" alt="" loading="lazy" width="1100" height="1295">`}
      </div>
      <div class="card__body">
        <div>
          <h3 class="card__name">${d.name}</h3>
          <p class="card__kicker">${d.kicker}</p>
          ${d.colors ? `<div class="swatches">${d.colors.map((c, j) => `<span class="swatch" data-ci="${j}" title="${c.name}" aria-label="${c.name}" aria-pressed="${j === 0}" style="--sw:${c.swatch}"></span>`).join("")}<span class="swatches__name">${d.colors[0].name}</span></div>` : ""}
        </div>
        <div class="card__price"><b>${price}</b><small>pre-order</small><br><span class="card__cta">Reserve</span></div>
      </div>`;
    card._ci = 0;
    $$(".swatch", card).forEach((sw) => sw.addEventListener("click", (e) => {
      e.stopPropagation(); // pick a colour on the card without opening it
      const ci = +sw.dataset.ci, v = variant(d, ci);
      card._ci = ci;
      $$(".swatch", card).forEach((x) => x.setAttribute("aria-pressed", String(x === sw)));
      $(".swatches__name", card).textContent = v.color;
      $(".card__front", card).src = img(v, "front");
      $(".card__print", card).style.backgroundImage = `url('${img(v, "print")}')`;
      card.style.setProperty("--glow", v.glow);
    }));
    card.addEventListener("click", () => openProduct(i, card._ci));
    grid.appendChild(card);
  });

  // Dialogs
  const product = $("#product");
  const sizes = $("#sizes");
  const openDialog = (dlg) => { if (!dlg.open) dlg.showModal(); };
  $$("dialog").forEach((dlg) => {
    dlg.addEventListener("click", (e) => {
      if (e.target === dlg || e.target.closest("[data-close]")) dlg.close();
    });
  });
  $$("[data-open-size]").forEach((b) => b.addEventListener("click", () => openDialog(sizes)));

  // Size buttons
  const sizeRow = $("#sizeRow");
  S.preorder.sizes.forEach((s) => {
    const l = document.createElement("label");
    l.className = "size";
    l.innerHTML = `<input type="radio" name="size" value="${s}" required><span>${s}</span>`;
    sizeRow.appendChild(l);
  });

  const views = [
    { key: "front", label: "Front" },
    { key: "back", label: "Back" },
    { key: "detail", label: "Zipper and print detail" },
    { key: "print", label: "Print swatch" },
  ];

  function showView(d, key) {
    const main = $("#pMain");
    const v = views.find((x) => x.key === key);
    main.src = img(d, key);
    main.alt = `${d.name} vest, ${v.label.toLowerCase()}`;
    main.classList.toggle("cover", key === "detail" || key === "print");
    $$(".thumb", $("#pThumbs")).forEach((t) => t.setAttribute("aria-pressed", String(t.dataset.key === key)));
  }

  function openProduct(i, ci = 0) {
    const base = S.designs[i];
    const d = variant(base, ci);
    $("#pKicker").textContent = `${S.preorder.season} · ${d.kicker}`;
    $("#pTitle").textContent = d.name;
    $("#pBlurb").textContent = d.blurb;
    $("#fDesign").value = d.color ? `${d.name} (${d.color})` : d.name;
    const colors = $("#pColors");
    colors.hidden = !base.colors;
    colors.innerHTML = "";
    (base.colors || []).forEach((c, j) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "pcolor";
      b.setAttribute("aria-pressed", String(j === ci));
      b.innerHTML = `<span class="swatch" style="--sw:${c.swatch}"></span>${c.name}`;
      b.addEventListener("click", () => { if (j !== ci) openProduct(i, j); });
      colors.appendChild(b);
    });
    const thumbs = $("#pThumbs");
    thumbs.innerHTML = "";
    views.filter((v) => !(d.noBack && v.key === "back")).forEach((v) => {
      const t = document.createElement("button");
      t.type = "button";
      t.className = "thumb";
      t.dataset.key = v.key;
      t.setAttribute("aria-label", v.label);
      t.innerHTML = `<img src="${img(d, v.key)}" alt="" loading="lazy">`;
      t.addEventListener("click", () => showView(d, v.key));
      thumbs.appendChild(t);
    });
    showView(d, "front");
    const f = $("#reserveForm");
    f.hidden = false;
    setMsg($("#reserveMsg"), "");
    openDialog(product);
    product.scrollTop = 0;
  }

  // Forms
  function setMsg(el, text, kind) {
    el.textContent = text;
    el.className = "form-msg" + (kind ? " " + kind : "");
  }

  async function submit(form, msgEl, okText) {
    if (!form.checkValidity()) {
      const bad = form.querySelector("input:invalid, select:invalid");
      const what = bad && bad.name === "size" ? "Pick a size." :
                   bad && bad.type === "checkbox" ? "Tick the box to confirm." :
                   bad && bad.type === "email" ? "Enter a valid email." : "Fill in the highlighted field.";
      setMsg(msgEl, what, "err");
      bad && bad.focus();
      return false;
    }
    if (form._gotcha && form._gotcha.value) return false;
    if (!S.formEndpoint) {
      setMsg(msgEl, "Reservations open very soon. This site is in preview, so nothing was sent.", "err");
      return false;
    }
    const btn = form.querySelector('[type="submit"]');
    const label = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Sending…";
    try {
      const data = new FormData(form);
      data.append("_subject", `${S.brand.name}: ${data.get("form")}${data.get("design") ? " · " + data.get("design") : ""}`);
      data.append("price", price);
      const res = await fetch(S.formEndpoint, { method: "POST", body: data, headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error(res.status);
      setMsg(msgEl, okText, "ok");
      form.reset();
      return true;
    } catch (e) {
      setMsg(msgEl, "That didn't go through. Check your connection and try again.", "err");
      return false;
    } finally {
      btn.disabled = false;
      btn.textContent = label;
    }
  }

  $("#reserveForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const design = $("#fDesign").value;
    const ok = await submit(e.target, $("#reserveMsg"), "");
    if (ok) {
      setMsg($("#reserveMsg"), `You're on the list for ${design}. We'll email you when it unlocks. Nothing to pay until then.`, "ok");
      $("#fDesign").value = design;
    }
  });
  $("#listForm").addEventListener("submit", (e) => {
    e.preventDefault();
    submit(e.target, $("#listMsg"), "You're in. We'll email you when new prints land.");
  });

  // Reveal on scroll
  if ("IntersectionObserver" in window && !reduced) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.15 });
    $$(".reveal").forEach((el, i) => { el.style.transitionDelay = (i % 2) * 90 + "ms"; io.observe(el); });
  } else {
    $$(".reveal").forEach((el) => el.classList.add("in"));
  }
})();
