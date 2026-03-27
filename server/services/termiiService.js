const axios = require('axios');

/**
 * Normalises Nigerian phone numbers to 234XXXXXXXXXX format
 */
const normalisePhone = (phone) => {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('234')) return digits;
  if (digits.startsWith('0')) return '234' + digits.slice(1);
  return '234' + digits;
};

/**
 * Sends an SMS via Termii API
 */
const sendSMS = async (to, message) => {
  try {
    const phone = normalisePhone(to);
    const payload = {
      to: phone,
      from: process.env.TERMII_SENDER_ID || 'SafeTrack',
      sms: message,
      type: 'plain',
      channel: 'generic',
      api_key: process.env.TERMII_API_KEY,
    };

    const { data } = await axios.post(
      `${process.env.TERMII_BASE_URL || 'https://api.ng.termii.com/api'}/sms/send`,
      payload,
      { headers: { 'Content-Type': 'application/json' } }
    );

    console.log(`SMS sent to ${phone}:`, data.message_id || 'ok');
    return { success: true, data };
  } catch (err) {
    console.error('Termii SMS error:', err.response?.data || err.message);
    return { success: false, error: err.message };
  }
};

module.exports = { sendSMS, normalisePhone };
