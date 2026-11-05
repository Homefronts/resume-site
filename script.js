const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const EMAIL = "sdandloff@gmail.com";
const SECTIONS = ["index", "timeline", "value", "specs", "projects", "work", "contact"];

const header = document.querySelector(".site-header");
const menu = document.getElementById("mobile-nav");
const menuBtn = document.querySelector(".menu-btn");
const menuLinks = menu.querySelectorAll("a");
const progress = document.querySelector(".progress");
const desktopLinks = document.querySelectorAll(".nav-desktop a");
const cover = document.getElementById("to-top-veil");
const contact = document.getElementById("contact-panel");
const contactForm = document.getElementById("contact-form");
const contactError = document.getElementById("contact-error");
const contactSend = document.getElementById("contact-send");
const nameField = contactForm.querySelector('input[name="name"]');
const copyBtn = document.querySelector("[data-copy-email]");
const mailBtn = document.getElementById("contact-mail");

let menuOpen = false;
let fading = false;

function lockPage(on) {
  document.documentElement.style.overflow = on ? "hidden" : "";
}

function jumpTo(href) {
  document.querySelector(href)?.scrollIntoView({ behavior: "auto", block: "start" });
  history.replaceState(null, "", href);
}

function setMenu(open) {
  menuOpen = open;
  menu.classList.toggle("is-open", open);
  menu.setAttribute("aria-hidden", String(!open));
  menu.setAttribute("aria-modal", String(open));
  menu.inert = !open;
  menuBtn.setAttribute("aria-expanded", String(open));
  menuBtn.textContent = open ? "Close" : "Menu";
  menuLinks.forEach((link) => {
    link.tabIndex = open ? 0 : -1;
  });

  if (open) lockPage(true);
  else {
    window.setTimeout(() => {
      if (!menuOpen && !contact.classList.contains("is-open")) lockPage(false);
    }, prefersReduced ? 0 : 320);
  }
  header.classList.toggle("is-solid", open || window.scrollY > 8);
}

function fadeTo(href) {
  if (fading) return;

  if (prefersReduced || menuOpen || !cover) {
    jumpTo(href);
    setMenu(false);
    return;
  }

  fading = true;
  cover.classList.add("is-on");

  window.setTimeout(() => {
    jumpTo(href);
    const hero = href === "#index" ? document.querySelectorAll("#index .reveal") : null;
    hero?.forEach((el) => el.classList.remove("is-in"));

    window.setTimeout(() => {
      cover.classList.remove("is-on");
      if (hero) {
        requestAnimationFrame(() => {
          hero.forEach((el) => el.classList.add("is-in"));
        });
      }
      window.setTimeout(() => {
        fading = false;
      }, 480);
    }, 70);
  }, 280);
}

function setContact(open) {
  contact.classList.toggle("is-open", open);
  contact.setAttribute("aria-hidden", String(!open));
  contact.setAttribute("aria-modal", String(open));
  contact.inert = !open;

  if (open) {
    lockPage(true);
    window.setTimeout(() => nameField?.focus(), prefersReduced ? 0 : 280);
    return;
  }

  const wait = prefersReduced ? 0 : 320;
  window.setTimeout(() => {
    if (!contact.classList.contains("is-open") && !menuOpen) lockPage(false);
  }, wait);
  window.setTimeout(() => {
    if (contact.classList.contains("is-open")) return;
    contact.classList.remove("is-sent");
    contactError.hidden = true;
    contactError.textContent = "";
    contactSend.disabled = false;
    contactSend.textContent = "Send message";
    if (mailBtn) mailBtn.href = "mailto:" + EMAIL;
  }, wait);
}

function mailtoLink(name, email, message) {
  if (!name) return "mailto:" + EMAIL;
  const subject = "Resume site — " + name;
  const body = message + "\n\n— " + name + "\n" + email;
  return "mailto:" + EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
}

function openMail(href) {
  const link = document.createElement("a");
  link.href = href;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function onScreen(el, view) {
  const box = el.getBoundingClientRect();
  const headerH = 72;
  if (box.bottom <= 0 || box.top >= view) return 0;

  let t = 1;
  if (box.top > headerH) t = (view - box.top) / Math.max(1, view - headerH);
  else if (box.bottom < view) t = box.bottom / view;

  t = Math.min(1, Math.max(0, t));
  if (t > 0 && t < 1) t = t * t * (3 - 2 * t);
  return t;
}

function onScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const value = max > 0 ? Math.min(1, window.scrollY / max) : 0;
  progress.style.setProperty("--progress", String(value));
  header.classList.toggle("is-solid", menuOpen || value > 0.02);

  let current = SECTIONS[0];
  for (const id of SECTIONS) {
    const el = document.getElementById(id);
    if (el && el.getBoundingClientRect().top <= 96) current = id;
  }
  desktopLinks.forEach((link) => {
    link.classList.toggle("is-active", link.getAttribute("href") === "#" + current);
  });

  if (prefersReduced) return;
  const view = window.innerHeight;
  for (const id of SECTIONS) {
    const el = document.getElementById(id);
    if (!el) continue;
    const next = onScreen(el, view).toFixed(3);
    if (el.dataset.enter === next) continue;
    el.dataset.enter = next;
    el.style.setProperty("--enter", next);
  }
}

menuBtn.addEventListener("click", () => setMenu(!menuOpen));

document.querySelectorAll("[data-go]").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    jumpTo(link.getAttribute("href"));
    setMenu(false);
  });
});

document.querySelectorAll("[data-fade]").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    fadeTo(link.getAttribute("href"));
  });
});

document.querySelectorAll("[data-contact]").forEach((el) => {
  el.addEventListener("click", () => setContact(true));
});

document.querySelectorAll("[data-contact-close]").forEach((el) => {
  el.addEventListener("click", () => setContact(false));
});

copyBtn?.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(EMAIL);
    copyBtn.textContent = "Copied";
    window.setTimeout(() => {
      copyBtn.textContent = "Copy";
    }, 1600);
  } catch {
    copyBtn.textContent = "Copy";
  }
});

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (contactSend.disabled) return;

  const data = new FormData(contactForm);
  if (String(data.get("company") || "").trim()) {
    contact.classList.add("is-sent");
    return;
  }

  const name = String(data.get("name") || "").trim();
  const email = String(data.get("email") || "").trim();
  const message = String(data.get("message") || "").trim();
  if (!name || !email || !message) {
    contactError.hidden = false;
    contactError.textContent = "Fill in name, email, and a message.";
    return;
  }

  const href = mailtoLink(name, email, message);
  if (mailBtn) mailBtn.href = href;
  contactSend.disabled = true;
  contactSend.textContent = "Opening";
  contactError.hidden = true;
  openMail(href);
  contactForm.reset();
  contact.classList.add("is-sent");
  contactSend.disabled = false;
  contactSend.textContent = "Send message";
});

window.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (contact.classList.contains("is-open")) {
    setContact(false);
    return;
  }
  setMenu(false);
});

window.matchMedia("(min-width: 1024px)").addEventListener("change", (event) => {
  if (event.matches) setMenu(false);
});

if (!prefersReduced) document.documentElement.classList.add("section-fade");

let frame = 0;
window.addEventListener(
  "scroll",
  () => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      onScroll();
    });
  },
  { passive: true },
);
onScroll();

const reveals = document.querySelectorAll(".reveal");
if (prefersReduced) {
  reveals.forEach((el) => el.classList.add("is-in"));
} else {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      }
    },
    { threshold: 0.1 },
  );
  reveals.forEach((el) => io.observe(el));
}
