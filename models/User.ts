import mongoose, { Schema, model, models, InferSchemaType } from "mongoose";

// Define schema directly
const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Create type from schema
export type IUser = InferSchemaType<typeof UserSchema> & {
  _id: mongoose.Types.ObjectId;
};

// Export model
const User = models.User || model("User", UserSchema);
export default User;
