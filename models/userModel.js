const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!']
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  photo: {
    type: String,
    default: 'default.jpg'
  },
  roles: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role"
    }
  ],
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // This only works on CREATE and SAVE!!!
      validator: function(el) {
        return el === this.password;
      },
      message: 'Passwords are not the same!'
    }
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  verified: {
    type: Boolean,
    default: false
  },
  verifiedAt: {
    type: Date,
    select: false
  },
  verifyToken: {
    type: String,
    select: false
  },
  verifyExpires: {
    type: Date,
    select: false
  },
  verifyNotHashedToken: {
    type: String
  },
  is2FAEnabled: {
    type: Boolean,
    default: false
  },
  active: {
    type: Boolean,
    default: true,
    select: false
  },
});

userSchema.pre('save', async function(next) {
  // this middleware is expected to run only on creation of NEW USERs
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();
  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  // Delete passwordConfirm field
  this.passwordConfirm = undefined;

  //Generates account verification token only if 
  if (this.isNew) {
    this.createVerifyToken()
  }
  next();
});

userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();
  // Invalidates valid password time
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Populates role reference object after creation
userSchema.post('save', async function(doc, next) {
  this.populate({path: 'roles', select: '-__v' });
  next();
});

userSchema.pre(/^find/, function(next) {
  // this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.IsValidPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.isAccountVerified = async function(email) {
  return this.verified;
};

userSchema.methods.changedPasswordAfterIssuedAccessToken = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10 );
    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

userSchema.methods.createPasswordResetToken = function() {
  const pwdResetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(pwdResetToken).digest('hex');
  // Expires in 10 minutes
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return pwdResetToken;
};

userSchema.methods.createVerifyToken = function() {
  const notHashedToken = crypto.randomBytes(32).toString('hex');
  this.verifyNotHashedToken = notHashedToken;
  this.verifyToken = crypto.createHash('sha256').update(notHashedToken).digest('hex');
  // Expires in 30 days = 43220 minutes
  this.verifyExpires = Date.now() + 43220 * 60 * 1000;

  return notHashedToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
