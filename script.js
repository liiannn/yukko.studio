const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

document.querySelectorAll(".fade-in").forEach((el) => observer.observe(el));

const navLinks = document.querySelectorAll(".nav-mark");
const sections = document.querySelectorAll("section[id], header[id]");

const navObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navLinks.forEach((link) => {
          link.classList.toggle(
            "active",
            link.getAttribute("href") === `#${entry.target.id}`
          );
        });
      }
    });
  },
  { rootMargin: "-64px 0px -60% 0px", threshold: 0 }
);

sections.forEach((section) => navObserver.observe(section));

const siteHeader = document.querySelector(".site-header");
let lastScrollY = window.scrollY;

if (siteHeader) {
  window.addEventListener(
    "scroll",
    () => {
      const currentY = window.scrollY;
      const scrollingDown = currentY > lastScrollY;

      siteHeader.classList.toggle("nav-hidden", currentY > 80 && scrollingDown);
      lastScrollY = currentY;
    },
    { passive: true }
  );
}

const localClock = document.getElementById("local-clock");

if (localClock) {
  const updateClock = () => {
    const time = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    localClock.textContent = `LOCAL TIME: ${time}`;
  };

  updateClock();
  setInterval(updateClock, 1000);
}

const spotlight = document.querySelector(".spotlight");

if (spotlight && window.matchMedia("(hover: hover)").matches) {
  document.addEventListener("mousemove", (e) => {
    spotlight.style.setProperty("--x", `${e.clientX}px`);
    spotlight.style.setProperty("--y", `${e.clientY}px`);
  });
}

const cometCanvas = document.getElementById("comet-trail");

if (
  cometCanvas &&
  window.matchMedia("(hover: hover)").matches &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches
) {
  const ctx = cometCanvas.getContext("2d");
  const MAX_TRAIL = 7;
  const TRAIL_LIFE = 400;
  const MIN_DIST = 6;

  let trail = [];
  let mouseX = null;
  let mouseY = null;
  let lastX = null;
  let lastY = null;

  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    cometCanvas.width = window.innerWidth * dpr;
    cometCanvas.height = window.innerHeight * dpr;
    cometCanvas.style.width = `${window.innerWidth}px`;
    cometCanvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animate() {
    const now = performance.now();
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    if (
      mouseX !== null &&
      (lastX === null || Math.hypot(mouseX - lastX, mouseY - lastY) >= MIN_DIST)
    ) {
      trail.push({ x: mouseX, y: mouseY, t: now });
      lastX = mouseX;
      lastY = mouseY;
      if (trail.length > MAX_TRAIL) trail.shift();
    }

    trail = trail.filter((p) => now - p.t < TRAIL_LIFE);

    trail.forEach((p) => {
      const lifeT = (now - p.t) / TRAIL_LIFE;
      const alpha = Math.max(0, 0.8 * (1 - lifeT));
      const radius = 2.5 * (1 - lifeT * 0.7);

      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(229, 199, 174, ${alpha})`;
      ctx.fill();
    });

    if (mouseX !== null) {
      ctx.beginPath();
      ctx.arc(mouseX, mouseY, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(245, 236, 224, 0.95)";
      ctx.fill();
    }

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}

const SUPABASE_URL = "https://vjgvzqkbdxdsxdjclchh.supabase.co";
const SUPABASE_KEY = "sb_publishable_Eg3tykKkB8sQZ0_rDrv-DA_liLzCyVI";

let supabaseClient = null;
try {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
} catch (err) {
  console.error("Supabase client failed to initialize:", err);
}

const contactForm = document.getElementById("contact-form");
const formStatus = document.getElementById("form-status");

if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!supabaseClient) {
      formStatus.textContent = "Something went wrong. Please try again.";
      formStatus.classList.add("error");
      console.error("Supabase client is not available.");
      return;
    }

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    formStatus.classList.remove("error");
    formStatus.textContent = "Sending…";

    const { data, error } = await supabaseClient.from("messages").insert({
      name: contactForm.name.value,
      email: contactForm.email.value,
      message: contactForm.message.value,
    });

    console.log("data:", data);
    console.log("error:", error);

    submitBtn.disabled = false;

    if (error) {
      formStatus.textContent = "Something went wrong. Please try again.";
      formStatus.classList.add("error");
      console.error(error);
      return;
    }

    formStatus.textContent = "Thank you, message sent";
    contactForm.reset();
  });
}
