const mongoose = require("mongoose");
const AppError = require('./../utils/appError');
const { v4: uuidv4 } = require('uuid');

const RefreshTokenSchema = new mongoose.Schema({
  token: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  expiryDate: Date,
});

RefreshTokenSchema.statics.createToken = async function (userId) {
  // Delete all user refresh token before new creation
  if (!userId) {
    return new AppError('Param not provided for refreshToken creation!', 403);
  }
  await this.deleteMany({user: userId});

  // Adds process.env.JWT_REFRESH_TOKEN_EXPIRES_IN seconds
  let expiredAt = Math.round((new Date().getTime() / 1000) + (process.env.JWT_REFRESH_TOKEN_EXPIRES_IN / 1000));
  let _token = uuidv4();
  let _object = new this({
    token: _token,
    user: userId,
    expiryDate: expiredAt
  });

  let refreshToken = await _object.save();

  return refreshToken.token;
};

RefreshTokenSchema.statics.verifyExpiration = (token) => {
  return token.expiryDate.getTime() < Math.round((new Date().getTime() / 1000));
}

const RefreshToken = mongoose.model("RefreshToken", RefreshTokenSchema);

module.exports = RefreshToken;