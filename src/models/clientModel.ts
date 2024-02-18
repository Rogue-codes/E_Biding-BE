import mongoose from "mongoose";
import bcrypt from "bcryptjs";
export type TClient = {
  _id: string;
  companyName: string;
  companyAddress: string;
  phoneNumber: string;
  alternatePhoneNumber: string;
  RcNumber: string;
  postalCode: boolean;
  name: string;
  email: string;
  cacDoc: string;
  password: string;
  isVerified: boolean;
  verificationCode: string | null;
  verificationCodeExpiresIn: Date |  null;
  status: "pending" | "approved";
  confirmPassword: (password: string) => boolean
};

const clientSchema = new mongoose.Schema({
  companyName: {
    type: String,
    unique: true,
    required: true,
  },
  companyAddress: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  alternatePhoneNumber: {
    type: String,
    required: true,
  },
  RcNumber: {
    type: String,
    required: true,
    unique: true,
  },
  postalCode: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  cacDoc: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationCode: {
    type: String,
  },
  verificationCodeExpiresIn: {
    type: Date,
  },
  status: {
    type: String,
    enum: ["pending", "approved"],
    required: true,
    default: "pending"
  },
});

clientSchema.methods.confirmPassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

clientSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);

  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, salt);
  }

  next();
});

const Client = mongoose.model<TClient>("Client", clientSchema);

export default Client;
