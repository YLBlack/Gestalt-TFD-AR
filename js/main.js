/* ============================================================
   GESTALT: The Fifth Day — Arabic fan site
   No dependencies. Graceful degradation throughout.
   ============================================================ */
(function () {
  "use strict";

  var docEl = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // ?motion=full — تجاوز صريح لتقليل حركة النظام (لاختبار البومة الطائرة)
  if (window.location.search.indexOf("motion=full") !== -1) {
    reduceMotion = false;
    docEl.classList.add("motion-full");
  }
  if (reduceMotion) docEl.classList.add("no-motion");

  var body = document.body;

  /* ---------------------------------------------------------
     1) شاشة التحذير — الدخول إلى الموقع
  --------------------------------------------------------- */
  var splash = document.getElementById("splash");
  var enterBtn = document.getElementById("enterBtn");

  function enterSite() {
    if (!splash) return;
    splash.classList.add("gone");
    // إزالة العنصر من شجرة الوصولية بعد انتهاء الانتقال
    setTimeout(function () {
      if (splash.classList.contains("gone")) splash.remove();
    }, 600);
    body.classList.remove("locked");
    startReveals();
    startOwls();
  }

  if (enterBtn) {
    enterBtn.addEventListener("click", enterSite);
    // ?nosplash — تخطّي شاشة التحذير (للمشاركة المباشرة والاختبار)
    if (window.location.search.indexOf("nosplash") !== -1) enterSite();
  }

  // ?scroll=story — تمرير فوري إلى قسم محدد (للاختبار ولقطات الشاشة)
  var scrollMatch = window.location.search.match(/[?&]scroll=([a-zA-Z-]+)/);
  if (scrollMatch) {
    var target = document.getElementById(scrollMatch[1]);
    if (target) target.scrollIntoView({ behavior: "instant", block: "start" });
  }

  // ?show=story — إزاحة المحتوى بدون تمرير (لبيئات اللقطات التي لا تعيد الرسم بعد scroll)
  var showMatch = window.location.search.match(/[?&]show=([a-zA-Z-]+)/);
  if (showMatch) {
    var showEl = document.getElementById(showMatch[1]);
    if (showEl) {
      var top = showEl.getBoundingClientRect().top + (window.scrollY || 0);
      document.body.style.transform = "translateY(-" + Math.max(0, top - 70) + "px)";
    }
  }

  /* ---------------------------------------------------------
     2) الكتابة بالآلة الكاتبة (مثل cps=40 في اللعبة)
  --------------------------------------------------------- */
  var TYPE_CPS = 40;

  function typeWriter(el) {
    if (!el) return;
    if (reduceMotion) {
      el.classList.add("shown");
      return;
    }
    var full = el.getAttribute("data-text") || el.textContent;
    el.setAttribute("data-text", full);
    el.textContent = "";
    el.classList.add("shown");
    var i = 0;
    // مؤقّت لكل عنصر على حدة — حتى لا يلغي صندوقٌ واحد كتابة صندوق آخر
    if (el._twTimer) clearInterval(el._twTimer);
    el._twTimer = setInterval(function () {
      i += 1;
      el.textContent = full.slice(0, i);
      if (i >= full.length) {
        clearInterval(el._twTimer);
        el._twTimer = null;
      }
    }, 1000 / TYPE_CPS);
  }

  /* ---------------------------------------------------------
     3) كشف تدريجي عند التمرير
  --------------------------------------------------------- */
  var revealsStarted = false;

  function startReveals() {
    if (revealsStarted) return;
    // ?reveal=all — أظهر كل الصناديق فورًا (للطباعة والفهرسة ولقطات الشاشة)
    if (window.location.search.indexOf("reveal=all") !== -1) {
      document.querySelectorAll(".tw-box, .card, .q-line, .dev-box").forEach(function (el) {
        el.classList.add("shown");
      });
      document.querySelectorAll(".tw").forEach(function (el) { el.classList.add("shown"); });
      revealsStarted = true;
      return;
    }
    if (!("IntersectionObserver" in window)) {
      // متصفح قديم: أظهر كل شيء فورًا
      document.querySelectorAll(".tw-box, .card, .q-line, .dev-box").forEach(function (el) {
        el.classList.add("shown");
      });
      return;
    }
    revealsStarted = true;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        io.unobserve(el);
        el.classList.add("shown");
        if (el.classList.contains("tw-box") || el.classList.contains("q-line")) {
          typeWriter(el.querySelector(".tw") || el);
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll(".tw-box, .card, .q-line, .dev-box").forEach(function (el) {
      io.observe(el);
    });
  }

  /* ---------------------------------------------------------
     4) البومة — تعبر الشاشة بين حين وآخر
        القيم منسوخة من تعريف owlanim في game/definitions.rpy:
        pause 8.0 → أول ظهور بعد 8 ثوانٍ من الدخول
        إطار الجناح كل 0.7 ثانية (owlanim1/owlanim2)
        xalign 0→3 خلال 8 ثوانٍ خطية → عبور مرئي ≈ 3.8 ثانية
        ثم تُعاد الحركة كل 8 ثوانٍ
  --------------------------------------------------------- */
  var OWL_FIRST_DELAY = 8000;
  var OWL_CYCLE = 8000;
  var OWL_CLEANUP = 4200;
  var owlStarted = false;
  function spawnOwl(perched) {
    // مع تقليل الحركة: بومة جالسة ثابتة فقط (perched) — بلا عبور ولا رفرفة
    if (reduceMotion && !perched) return;
    var hero = document.getElementById("hero");
    if (!hero || document.querySelector(".owl")) return;

    var owl = document.createElement("div");
    owl.className = reduceMotion ? "owl perched wing-a" : "owl wing-a";
    owl.setAttribute("aria-hidden", "true");

    var a = document.createElement("img");
    a.src = "assets/owl1.png";
    a.alt = "";
    a.className = "a";

    var b = document.createElement("img");
    b.src = "assets/owl2.png";
    b.alt = "";
    b.className = "b";

    owl.appendChild(a);
    owl.appendChild(b);
    hero.appendChild(owl);

    if (perched) return; // جالسة: صفر حركة — احترام كامل لتقليل الحركة

    requestAnimationFrame(function () {
      owl.classList.add("flying");
    });

    var flap = setInterval(function () {
      owl.classList.toggle("wing-a");
      owl.classList.toggle("wing-b");
    }, 700);

    setTimeout(function () {
      clearInterval(flap);
      owl.remove();
    }, OWL_CLEANUP);
  }

  function scheduleOwl(isFirst) {
    if (reduceMotion) return;
    var delay = isFirst ? OWL_FIRST_DELAY : OWL_CYCLE;
    setTimeout(function () {
      spawnOwl();
      scheduleOwl(false);
    }, delay);
  }

  // تبدأ دورة البومة عند الدخول إلى الموقع (وليس تحميل الصفحة) —
  // مثل اللعبة حيث يبدأ العد عند عرض المشهد. ?owl=now يُظهرها فورًا للاختبار.
  function startOwls() {
    if (owlStarted) return;
    owlStarted = true;
    // ?owl=now — بومة فور الدخول: طائرة عاديًا، جالسة مع تقليل الحركة
    if (window.location.search.indexOf("owl=now") !== -1) spawnOwl(reduceMotion);
    if (reduceMotion) return; // بومة واحدة جالسة تكفي — بلا دورة
    scheduleOwl(true);
  }

  /* ---------------------------------------------------------
     5) زر التعريب — يتفعّل تلقائيًا إذا وُجد ملف التعريب
  --------------------------------------------------------- */
  var locBtn = document.getElementById("locDownload");
  var locStatus = document.getElementById("locStatus");

  if (locBtn) {
    fetch(locBtn.getAttribute("href"), { method: "HEAD" })
      .then(function (res) {
        if (!res.ok) return;
        locBtn.hidden = false;
        locBtn.removeAttribute("aria-disabled");
        if (locStatus) {
          locStatus.innerHTML = "حالة التعريب: <strong>مكتمل ومتاح للتنزيل</strong>";
        }
      })
      .catch(function () { /* الملف غير موجود — يبقى الزر معطلًا */ });
  }

  /* ---------------------------------------------------------
     6) الموسيقى — زر اختياري فقط
  --------------------------------------------------------- */
  var audioToggle = document.getElementById("audioToggle");
  var ambience = document.getElementById("ambience");

  function setAudioUI(on) {
    if (!audioToggle) return;
    audioToggle.classList.toggle("on", on);
    audioToggle.setAttribute("aria-pressed", on ? "true" : "false");
  }

  if (audioToggle && ambience) {
    audioToggle.addEventListener("click", function () {
      if (ambience.paused) {
        ambience.volume = 0.45;
        var p = ambience.play();
        if (p && typeof p.catch === "function") {
          p.catch(function () { setAudioUI(false); });
        }
        setAudioUI(true);
      } else {
        ambience.pause();
        ambience.currentTime = 0;
        setAudioUI(false);
      }
    });

    // إيقاف الموسيقى عند مغادرة التبويب
    document.addEventListener("visibilitychange", function () {
      if (document.hidden && !ambience.paused) {
        ambience.pause();
        setAudioUI(false);
      }
    });
  }
})();
