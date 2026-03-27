const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const operatorSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  companyName: { type: String, required: true },
  phone: { type: String },
  rcNumber: { type: String },       // CAC registration number
  address: { type: String },
  status: {
    type: String,
    enum: ['pending', 'verified', 'suspended'],
    default: 'verified',            // auto-verify for hackathon; change to 'pending' in production
  },
}, { timestamps: true });

operatorSchema.methods.comparePassword = async function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

operatorSchema.statics.hashPassword = async (plain) => bcrypt.hash(plain, 12);

module.exports = mongoose.model('Operator', operatorSchema);
