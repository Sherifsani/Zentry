const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const passengerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  passwordHash: { type: String, required: true },
}, { timestamps: true });

passengerSchema.methods.comparePassword = async function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

passengerSchema.statics.hashPassword = async (plain) => bcrypt.hash(plain, 12);

module.exports = mongoose.model('Passenger', passengerSchema);
