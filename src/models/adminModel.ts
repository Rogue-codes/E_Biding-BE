import mongoose from "mongoose";
import bcrypt from "bcryptjs";
export type TAdmin = {
  _id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userName: string;
  isAdmin:boolean;
};

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
    default: "simple@123",
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
    unique: true,
  },
  isAdmin:{
    type: Boolean,
    default: false,
  }
});

adminSchema.methods.confirmPassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const Admin = mongoose.model<TAdmin>("Admin", adminSchema);

export default Admin;
