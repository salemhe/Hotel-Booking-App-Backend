import { Schema, model } from "mongoose";

const SessionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    token: { type: String, required: true },
    ipAddress: { type: String },
    device: { type: String }, // to track device or browser
    expiresAt: { type: Date, required: true }, 
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default model("Session", SessionSchema);
