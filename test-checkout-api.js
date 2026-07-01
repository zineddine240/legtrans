const checkoutId = "01ks0ehjcf3pxm0883h74ymzk8";
const secretKey = "test_sk_1rGuPbDz67HEFjfoOhNhFiKdRk9kexk24YHiGRuE";

async function check() {
  const isLive = secretKey.startsWith("live_");
  const url = isLive
    ? `https://pay.chargily.net/api/v2/checkouts/${checkoutId}`
    : `https://pay.chargily.net/test/api/v2/checkouts/${checkoutId}`;

  console.log("Fetching from:", url);
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
  });

  const text = await response.text();
  console.log("Status:", response.status);
  console.log("Body:", text);
}

check();
