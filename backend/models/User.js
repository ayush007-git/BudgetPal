import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  emergencyQuestion: {
    type: String,
    required: [true, 'Emergency question is required'],
    trim: true
  },
  emergencyAnswer: {
    type: String,
    required: [true, 'Emergency answer is required'],
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: null
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Hash emergency answer before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('emergencyAnswer')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.emergencyAnswer = await bcrypt.hash(this.emergencyAnswer, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to compare emergency answer
userSchema.methods.compareEmergencyAnswer = async function(candidateAnswer) {
  return await bcrypt.compare(candidateAnswer, this.emergencyAnswer);
};

// Method to update password
userSchema.methods.updatePassword = async function(newPassword) {
  this.password = newPassword;
  return await this.save();
};

const User = mongoose.model('User', userSchema);

export default User;
