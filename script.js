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
