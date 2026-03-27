const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generates a plain-English risk summary for a route.
 * Returns a single sentence suitable for display to passengers.
 */
const generateRiskSummary = async ({ origin, destination, riskScore, incidentCount, period = 30 }) => {
  try {
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    });

    const prompt = `You are writing a short safety note for passengers booking a bus ticket in Nigeria.
Route: ${origin} to ${destination}
Risk level: ${riskScore}
Incidents in the last ${period} days: ${incidentCount}

Write ONE short sentence (max 15 words) summarising the safety situation on this route for a passenger. Be factual and clear. Do not use alarming language. Examples: "3 incidents reported on this corridor this month — exercise caution." or "This route has a clean safety record for the past 30 days."`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (err) {
    console.error('Gemini API error:', err.message);
    // Fallback to rule-based summary
    if (incidentCount === 0) return 'No incidents reported on this route in the last 30 days.';
    if (riskScore === 'High') return `${incidentCount} incidents reported on this corridor — take precautions.`;
    return `${incidentCount} incident${incidentCount > 1 ? 's' : ''} reported on this route recently.`;
  }
};

module.exports = { generateRiskSummary };
