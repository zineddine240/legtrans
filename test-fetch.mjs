async function run() {
  const res = await fetch("https://www.legtransdz.com/api/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "achourzineddine16@gmail.com" })
  });
  const text = await res.text();
  console.log("Status:", res.status);
  console.log("Body:", text);
}
run();
