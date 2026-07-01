import crypto from "crypto";

const publicKey = "test_pk_TXXOtWlXG0SfbGkyyv0jbau6Z4Hu3yTimtARckxq";
const secretKey = "test_sk_1rGuPbDz67HEFjfoOhNhFiKdRk9kexk24YHiGRuE";
const signatureHeader = "6c218809166a20da66dc24aa8ca4186798aa1ebea3a7e876f498f7c582872c29";
const rawBody = `{"id":"01ks0ezqyg024tn5m40zncx6b6","entity":"event","type":"checkout.paid","data":{"id":"01ks0ezcydkgm249t7fhgsdc7d","fees":0,"amount":3000,"entity":"checkout","locale":"ar","status":"paid","account":{"id":"01ks04e3k27wt49067cyp920re","nif":null,"nis":null,"logo":null,"mode":"test","name":"Zineddine ACHOUR","listed":true,"status":"active","address":null,"website":null,"featured":false,"latitude":null,"longitude":null,"created_at":1779194859,"store_type":null,"updated_at":1779202981,"company_name":null,"legal_status":null,"store_photos":null,"support_phone":null,"trade_register":null,"store_categories":null,"webhook_endpoint":"https:\\/\\/legtransdz.com\\/api\\/chargily\\/webhook","satim_credentials":null,"verification_status":"unverified"},"currency":"dzd","discount":null,"livemode":false,"metadata":{"plan":"pro","user_id":"HzS2gQZtRVVxEm0dBylCtaayMxd2"},"created_at":1779205911,"invoice_id":null,"updated_at":1779205922,"customer_id":"01ks0carxmhfbfhb36w93g2dm0","description":null,"failure_url":"https:\\/\\/legtransdz.com\\/payment\\/failed","success_url":"https:\\/\\/legtransdz.com\\/payment\\/success","checkout_url":"http:\\/\\/pay.chargily.dz\\/test\\/checkouts\\/01ks0ezcydkgm249t7fhgsdc7d\\/pay","payment_method":"cib","payment_link_id":null,"fees_on_customer":0,"fees_on_merchant":0,"shipping_address":{"country":"dz"},"webhook_endpoint":null,"earnings_consumed":0,"fulfillment_status":"unfulfilled","notification_status":"pending","pass_fees_to_customer":null,"deposit_transaction_id":null,"amount_without_discount":0,"paid_checkouts_consumed":0,"collect_shipping_address":0,"chargily_pay_fees_allocation":"merchant"},"created_at":1779205922,"updated_at":1779205922,"account":{"id":"01ks04e3k27wt49067cyp920re","name":"Zineddine ACHOUR","store_type":null,"store_categories":null,"company_name":null,"logo":null,"legal_status":null,"address":null,"trade_register":null,"nis":null,"nif":null,"status":"active","verification_status":"unverified","listed":true,"featured":false,"mode":"test","webhook_endpoint":"https:\\/\\/legtransdz.com\\/api\\/chargily\\/webhook","created_at":1779194859,"updated_at":1779202981,"website":null,"support_phone":null,"latitude":null,"longitude":null,"store_photos":null},"livemode":false}`;

function test(key, name) {
  const computed = crypto.createHmac("sha256", key).update(rawBody).digest("hex");
  console.log(`${name}: ${computed} - Matches: ${computed === signatureHeader}`);
}

test(publicKey, "Public Key");
test(secretKey, "Secret Key");
// Try without prefix
test(secretKey.replace("test_sk_", ""), "Secret Key without prefix");
// Try with JSON stringified and parsed (in case of whitespace formatting)
try {
  const parsed = JSON.parse(rawBody);
  const minified = JSON.stringify(parsed);
  const computedMinified = crypto.createHmac("sha256", secretKey).update(minified).digest("hex");
  console.log(`Minified JSON Secret Key: ${computedMinified} - Matches: ${computedMinified === signatureHeader}`);
} catch (e) {
  console.error(e);
}
