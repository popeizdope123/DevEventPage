import { Schema, model, models, Model, Types } from "mongoose";
import Event from "./event.model";

export interface IBooking {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

// Pragmatic email check: local part, "@", domain with a TLD, no whitespace.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const bookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event ID is required"],
      index: true, // speeds up "bookings for an event" queries
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true, // normalize so the same address is always stored identically
      validate: {
        validator: (value: string): boolean => EMAIL_PATTERN.test(value),
        message: "Please provide a valid email address",
      },
    },
  },
  { timestamps: true } // auto-manages createdAt / updatedAt
);

bookingSchema.pre("save", async function () {
  // Only hit the database when the reference is new or has changed.
  if (!this.isNew && !this.isModified("eventId")) return;

  const eventExists = await Event.exists({ _id: this.eventId })
    .session(this.$session());
  if (!eventExists) {
    throw new Error(`Event with ID "${this.eventId.toString()}" does not exist`);
  }
});

// Reuse the compiled model during hot reloads to avoid OverwriteModelError.
const Booking: Model<IBooking> =
  (models.Booking as Model<IBooking> | undefined) ??
  model<IBooking>("Booking", bookingSchema);

export default Booking;
