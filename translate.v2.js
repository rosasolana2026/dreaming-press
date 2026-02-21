// Auto language detection + translation
// Uses Google Translate proxy redirect — the only approach that reliably works
// on static sites across all browsers and mobile

(function () {
  const SUPPORTED = {
    es: "Español", fr: "Français", de: "Deutsch", he: "עברית",
    pt: "Português", it: "Italiano", ja: "日本語", ko: "한국어",
    zh: "中文", ar: "العربية", ru: "Русский", hi: "हिंदी",
    nl: "Nederlands", pl: "Polski", tr: "Türkçe", sv: "Svenska",
    da: "Dansk", fi: "Suomi", no: "Norsk", uk: "Українська"
  };

  const BASE = "https://rosalinda-blog.life.conway.tech";

  function getSaved() {
    try { return localStorage.getItem("rosaLang"); } catch(e) { return null; }
  }
  function setSaved(lang) {
    try { localStorage.setItem("rosaLang", lang); } catch(e) {}
  }

  // Build Google Translate URL for a given language
  function translateUrl(lang) {
    return "https://translate.google.com/translate?sl=en&tl=" + lang + "&u=" + encodeURIComponent(BASE + location.pathname);
  }

  // Are we inside Google Translate's framed view?
  var onProxy = location.hostname === "translate.googleusercontent.com" ||
                location.hostname.indexOf("translate.goog") !== -1 ||
                document.referrer.indexOf("translate.google") !== -1;

  var raw = navigator.language || navigator.userLanguage || "en";
  var browserLang = raw.split("-")[0].toLowerCase();
  var saved = getSaved();

  // Build language switcher UI
  function buildUI(currentLang) {
    var bar = document.createElement("div");
    bar.style.cssText = "position:fixed;bottom:1.2rem;right:1.2rem;z-index:9999;font-family:Inter,sans-serif";

    var menu = document.createElement("div");
    menu.style.cssText = [
      "display:none;flex-direction:column;position:absolute;bottom:2.8rem;right:0",
      "background:#1a1812;border-radius:10px;overflow:hidden",
      "box-shadow:0 4px 24px rgba(0,0,0,0.35);max-height:55vh;overflow-y:auto;min-width:145px"
    ].join(";");

    function makeOpt(label, code) {
      var o = document.createElement("div");
      o.textContent = label;
      o.style.cssText = "padding:0.55rem 1rem;color:#faf8f4;font-size:0.82rem;cursor:pointer;white-space:nowrap;border-bottom:1px solid rgba(255,255,255,0.05)";
      o.addEventListener("mouseover", function(){ o.style.background="rgba(255,255,255,0.09)"; });
      o.addEventListener("mouseout", function(){ o.style.background=""; });
      o.addEventListener("click", function(){
        setSaved(code);
        if (code === "en") {
          // Go back to original site
          var path = location.pathname + location.search.replace(/[?&]_x_tr_[^&]*/g,"");
          window.location.href = BASE + path;
        } else {
          window.location.href = translateUrl(code);
        }
      });
      return o;
    }

    menu.appendChild(makeOpt("🇺🇸 English", "en"));
    Object.entries(SUPPORTED).forEach(function(e){ menu.appendChild(makeOpt(e[1], e[0])); });

    var pill = document.createElement("div");
    pill.style.cssText = [
      "background:#1a1812;color:#faf8f4;font-size:0.75rem",
      "padding:0.45rem 0.85rem;border-radius:999px;cursor:pointer",
      "letter-spacing:0.05em;user-select:none;box-shadow:0 2px 10px rgba(0,0,0,0.3)"
    ].join(";");
    pill.textContent = (currentLang && currentLang !== "en")
      ? "🌐 " + currentLang.toUpperCase()
      : "🌐 EN";

    pill.addEventListener("click", function(e){
      e.stopPropagation();
      menu.style.display = menu.style.display === "flex" ? "none" : "flex";
    });
    document.addEventListener("click", function(){ menu.style.display = "none"; });

    bar.appendChild(menu);
    bar.appendChild(pill);
    document.body.appendChild(bar);
  }

  document.addEventListener("DOMContentLoaded", function () {
    // If we're on the proxy, just show the switcher with current lang
    if (onProxy) {
      
      
      buildUI(getSaved() || "en");
      return;
    }

    // On the original site: check if we should redirect
    var target = saved || (SUPPORTED[browserLang] ? browserLang : "en");

    if (target !== "en" && !onProxy) {
      // First visit or returning user who prefers non-English → redirect to proxy
      setSaved(target);
      window.location.replace(translateUrl(target));
      return;
    }

    // English or no match — just show the switcher
    buildUI("en");
  });
})();
