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

const navLinks = document.querySelectorAll(".nav-links a");
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

    const { error } = await supabaseClient.from("messages").insert({
      name: contactForm.name.value,
      email: contactForm.email.value,
      message: contactForm.message.value,
    });

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
