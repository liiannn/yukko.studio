const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const WEBHOOK_SECRET = Deno.env.get("WEBHOOK_SECRET");
const NOTIFY_EMAIL = "junoitte@gmail.com";

Deno.serve(async (req) => {
  if (WEBHOOK_SECRET) {
    const incomingSecret = req.headers.get("x-webhook-secret");
    if (incomingSecret !== WEBHOOK_SECRET) {
      return new Response("Unauthorized", { status: 401 });
    }
  }

  const payload = await req.json();
  const record = payload.record ?? {};
  const { name, email, message } = record;

  const emailResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "onboarding@resend.dev",
      to: NOTIFY_EMAIL,
      subject: "Нове повідомлення з сайту",
      text: `Ім'я: ${name}\nEmail: ${email}\nПовідомлення: ${message}`,
    }),
  });

  if (!emailResponse.ok) {
    const errText = await emailResponse.text();
    console.error("Resend API error:", errText);
    return new Response(JSON.stringify({ error: errText }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
