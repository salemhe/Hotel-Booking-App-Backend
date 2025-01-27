import { Schema, model } from "mongoose";

const UserSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    role: { type: String, enum: ["guest", "admin"], default: "guest" },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true } 
);

export default model("User", UserSchema);
