// api/models/Vendor.js
import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";


const StaffSchema = new Schema(
  {
    staffName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    staffId: { type: String },
    vendorId: { type: Schema.Types.ObjectId, ref: "Vendor", required: true },
    branch: { type: String },
    jobTitle: { type: String },
    jobRole: { type: String },
    password: { type: String },
    profileImage: {
          type: String,
          validate: {
            validator: function (value) {
              return (
                /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg))$/.test(value) ||
                value === null
              );
            },
            message: "Profile image must be a valid URL.",
          },
          default: null,
    },
    customPermissions: [{ permissionModule: {type: String}, permissions: [String] }],
    isVerified: { type: Boolean, default: false },
    status: { 
        type: String, 
        enum: ["active", "inactive", "no-show"], 
        default: "inactive" 
    },
    otp: { type: String },
    otpExpiry: { type: Date },
    createdAt: { type: Date, default: Date.now },
   
  },
  { timestamps: true }
);

StaffSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
StaffSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

export default model("Staff", StaffSchema);
