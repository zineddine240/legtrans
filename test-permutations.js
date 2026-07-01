const crypto = require("crypto");

const secretKey = "test_sk_1rGuPbDz67HEFjfoOhNhFiKdRk9kexk24YHiGRuE";
const signatureHeader = "ac97b8964dfb7af1b5d062380c12cddefd27f598825ba68c10614d6c25eba52d";
const rawBody = `{"id":"01ks0ej1a1c6c6agkef4pswp2s","entity":"event","type":"checkout.paid","data":{"id":"01ks0ehjcf3pxm0883h74ymzk8","fees":0,"amount":3000,"entity":"checkout","locale":"ar","status":"paid","account":{"id":"01ks04e3k27wt49067cyp920re","nif":null,"nis":null,"logo":null,"mode":"test","name":"Zineddine ACHOUR","listed":true,"status":"active","address":null,"website":null,"featured":false,"latitude":null,"longitude":null,"created_at":1779194859,"store_type":null,"updated_at":1779202981,"company_name":null,"legal_status":null,"store_photos":null,"support_phone":null,"trade_register":null,"store_categories":null,"webhook_endpoint":"https:\\/\\/legtransdz.com\\/api\\/chargily\\/webhook","satim_credentials":null,"verification_status":"unverified"},"currency":"dzd","discount":null,"livemode":false,"metadata":{"plan":"pro","user_id":"HzS2gQZtRVVxEm0dBylCtaayMxd2"},"created_at":1779205458,"invoice_id":null,"updated_at":1779205473,"customer_id":"01ks0carxmhfbfhb36w93g2dm0","description":null,"failure_url":"https:\\/\\/legtransdz.com\\/payment\\/failed","success_url":"https:\\/\\/legtransdz.com\\/payment\\/success","checkout_url":"http:\\/\\/pay.chargily.dz\\/test\\/checkouts\\/01ks0ehjcf3pxm0883h74ymzk8\\/pay","payment_method":"edahabia","payment_link_id":null,"fees_on_customer":0,"fees_on_merchant":0,"shipping_address":{"country":"dz"},"webhook_endpoint":null,"earnings_consumed":0,"fulfillment_status":"unfulfilled","notification_status":"pending","pass_fees_to_customer":null,"deposit_transaction_id":null,"amount_without_discount":0,"paid_checkouts_consumed":0,"collect_shipping_address":0,"chargily_pay_fees_allocation":"merchant"},"created_at":1779205473,"updated_at":1779205473,"livemode":false}`;

function test(payload, name) {
  const computed = crypto.createHmac("sha256", secretKey).update(payload).digest("hex");
  if (computed === signatureHeader) {
    console.log(`FOUND MATCH: ${name}`);
    return true;
  }
  return false;
}

if (test(rawBody, "Exact Raw")) process.exit(0);
if (test(rawBody + "\\n", "Trailing newline")) process.exit(0);
if (test(rawBody + "\\r\\n", "Trailing CRLF")) process.exit(0);
if (test(rawBody.trim(), "Trimmed")) process.exit(0);
if (test(rawBody.replace(/\\/\\//g, "/"), "Unescaped slashes")) process.exit(0);
if (test(JSON.stringify(JSON.parse(rawBody)), "JSON minified")) process.exit(0);
if (test(JSON.stringify(JSON.parse(rawBody), null, 2), "JSON formatted")) process.exit(0);
if (test(JSON.stringify(JSON.parse(rawBody)).replace(/\\//g, '\\\\/'), "JSON minified with escaped slashes")) process.exit(0);

const parsed = JSON.parse(rawBody);
// Try without the "data" wrapper? No
console.log("No match found for standard permutations.");
