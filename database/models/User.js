import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  registrationDate: { type: Date, default: Date.now },
  dob: { type: Date, required: true },
  monthlySalary: { type: Number, required: true },
  purchasePower: { type: Number, default: 0 },
  password: { type: String, required: true },
});

const User = mongoose.model("User", UserSchema);

export default User;
