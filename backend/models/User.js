// models/User.js

const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

// 1. Define the SCHEMA — the blueprint
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],  // validation
      trim: true,                             // removes extra spaces
      maxlength: [50, 'Name cannot exceed 50 characters']
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,                           // no two users same email
      lowercase: true,                        // always store as lowercase
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email'        // regex validation
      ]
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false  // NEVER return password in queries automatically
    },

    createdAt: {
      type: Date,
      default: Date.now
    }
  }
)

// 2. MIDDLEWARE — runs automatically before saving
// This encrypts the password before it hits the database
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return
  }
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

// 3. INSTANCE METHOD — a function available on every user object
// Used during login to check if entered password matches stored hash
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

// 4. Create the MODEL from the schema
const User = mongoose.model('User', UserSchema)

module.exports = User