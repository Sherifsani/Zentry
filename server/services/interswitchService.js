const axios = require('axios');
const crypto = require('crypto');

/**
 * Computes SHA512 hash of concatenated fields for Interswitch Webpay.
 * Hash formula: SHA512(txn_ref + amount + product_id + site_redirect_url + mac_key)
 */
const computeHash = (txnRef, amountKobo, productId, redirectUrl, macKey) => {
  const raw = `${txnRef}${amountKobo}${productId}${redirectUrl}${macKey}`;
  return crypto.createHash('sha512').update(raw).digest('hex');
};

/**
 * Builds the Interswitch Webpay payment form fields.
 * The frontend creates a hidden form with these fields and auto-submits it.
 *
 * Sandbox credentials (from Interswitch docbase):
 *   product_id: 6204
 *   pay_item_id: 101
 *   mac_key: E187B1191265B18338B5DEBAF9F38FEC37B170FF582D4666DAB1F098304D5EE7F3BE15540461FE92F1D40332FDBBA34579034EE2AC78B1A1B8D9A321974025C4
 */
const buildPaymentPayload = ({ txnRef, amount, customerName, customerEmail, redirectUrl }) => {
  const amountInKobo = Math.round(amount * 100);
  const productId = process.env.INTERSWITCH_PRODUCT_ID;
  const payItemId = process.env.INTERSWITCH_PAY_ITEM_ID;
  const macKey = process.env.INTERSWITCH_MAC_KEY;
  const siteRedirectUrl = redirectUrl || process.env.PAYMENT_CALLBACK_URL;

  const hash = computeHash(txnRef, amountInKobo, productId, siteRedirectUrl, macKey);

  return {
    product_id: productId,
    pay_item_id: payItemId,
    amount: amountInKobo.toString(),
    txn_ref: txnRef,
    cust_id: txnRef,
    cust_name: customerName || '',
    cust_email: customerEmail || '',
    site_redirect_url: siteRedirectUrl,
    currency: '566', // NGN
    hash,
  };
};

/**
 * Verifies a transaction with Interswitch query API.
 * Interswitch sends txnref, amount, resp back to your redirect URL.
 * You MUST verify server-side — never trust the redirect params alone.
 *
 * Hash header for verification: SHA512(product_id + txn_ref + mac_key)
 */
const verifyPayment = async (txnRef, amount) => {
  try {
    const amountInKobo = Math.round(amount * 100);
    const productId = process.env.INTERSWITCH_PRODUCT_ID;
    const macKey = process.env.INTERSWITCH_MAC_KEY;
    const baseUrl = process.env.INTERSWITCH_BASE_URL;

    const hashHeader = crypto
      .createHash('sha512')
      .update(`${productId}${txnRef}${macKey}`)
      .digest('hex');

    const url = `${baseUrl}/collections/api/v1/gettransaction.json?productid=${productId}&transactionreference=${txnRef}&amount=${amountInKobo}`;

    const { data } = await axios.get(url, {
      headers: { Hash: hashHeader },
    });

    return {
      success: data.ResponseCode === '00',
      txnRef,
      amount: data.Amount,
      responseCode: data.ResponseCode,
      raw: data,
    };
  } catch (err) {
    console.error('Interswitch verify error:', err.response?.data || err.message);
    return { success: false, responseCode: 'ERROR', raw: err.message };
  }
};

const getWebpayUrl = () => `${process.env.INTERSWITCH_BASE_URL}/collections/w/pay`;

module.exports = { buildPaymentPayload, verifyPayment, getWebpayUrl };
