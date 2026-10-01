import { Schema, SchemaTypeOptions, model, models, Model } from "mongoose";

export interface IEvent {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ISO_DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i;

/** Converts a title into a URL-friendly slug. */
function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // drop special characters
    .replace(/\s+/g, "-") // spaces -> hyphens
    .replace(/-+/g, "-") // collapse repeated hyphens
    .replace(/^-|-$/g, ""); // trim leading/trailing hyphens
}

/** Normalizes a date string to ISO format (YYYY-MM-DD); throws if invalid. */
function normalizeDate(value: string): string {
  // Date-only ISO strings are parsed as UTC, so keep them as-is to avoid timezone shifts.
  if (ISO_DATE_ONLY.test(value)) {
    const parsed = new Date(value);
    const [year, month, day] = value.split("-").map(Number);
    if (
      Number.isNaN(parsed.getTime()) ||
      parsed.getUTCFullYear() !== year ||
      parsed.getUTCMonth() + 1 !== month ||
      parsed.getUTCDate() !== day
    ) {
      throw new Error(`Invalid date: "${value}"`);
    }
    return value;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid date: "${value}"`);
  }

  // Use local components so free-form dates (e.g. "March 5, 2026") don't shift a day.
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Normalizes a time string (e.g. "9:30 AM", "14:00") to 24-hour HH:mm; throws if invalid. */
function normalizeTime(value: string): string {
  const match = TIME_PATTERN.exec(value.trim());
  if (!match) {
    throw new Error(`Invalid time: "${value}"`);
  }

  let hours = Number(match[1]);
  const minutes = Number(match[2] ?? "0");
  const meridiem = match[3]?.toLowerCase();

  if (meridiem) {
    if (hours < 1 || hours > 12) throw new Error(`Invalid time: "${value}"`);
    if (meridiem === "pm" && hours !== 12) hours += 12;
    if (meridiem === "am" && hours === 12) hours = 0;
  }

  if (hours > 23 || minutes > 59) {
    throw new Error(`Invalid time: "${value}"`);
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

/** Requires a non-empty array whose items are all non-empty strings. */
const nonEmptyStringArray = {
  validator: (items: string[]): boolean =>
    Array.isArray(items) &&
    items.length > 0 &&
    items.every((item) => item.trim().length > 0),
  message: "Must contain at least one non-empty item",
};

// `trim` runs before `required`, so whitespace-only strings are rejected.
const requiredString = (label: string): SchemaTypeOptions<string> => ({
  type: String,
  required: [true, `${label} is required`],
  trim: true,
});

const eventSchema = new Schema<IEvent>(
  {
    title: { ...requiredString("Title"), maxlength: 150 },
    // Generated in the pre-save hook, so it is intentionally not `required`.
    slug: { type: String, trim: true, lowercase: true },
    description: { ...requiredString("Description"), maxlength: 1000 },
    overview: { ...requiredString("Overview"), maxlength: 500 },
    image: requiredString("Image"),
    venue: requiredString("Venue"),
    location: requiredString("Location"),
    date: requiredString("Date"),
    time: requiredString("Time"),
    mode: {
      ...requiredString("Mode"),
      lowercase: true,
      enum: {
        values: ["online", "offline", "hybrid"],
        message: "Mode must be online, offline, or hybrid",
      },
    },
    audience: requiredString("Audience"),
    agenda: {
      type: [String],
      required: [true, "Agenda is required"],
      validate: nonEmptyStringArray,
    },
    organizer: requiredString("Organizer"),
    tags: {
      type: [String],
      required: [true, "Tags are required"],
      validate: nonEmptyStringArray,
    },
  },
  { timestamps: true } // auto-manages createdAt / updatedAt
);

// Unique index on slug guarantees one event per URL.
eventSchema.index({ slug: 1 }, { unique: true });

eventSchema.pre("save", async function () {
  // Regenerate the slug only when the title is new or has changed.
  if (this.isModified("title")) {
    this.slug = slugify(this.title);
    if (!this.slug) {
      throw new Error("Title must contain at least one alphanumeric character");
    }
  }

  if (this.isModified("date")) {
    this.date = normalizeDate(this.date);
  }

  if (this.isModified("time")) {
    this.time = normalizeTime(this.time);
  }
});

// Reuse the compiled model during hot reloads to avoid OverwriteModelError.
const Event: Model<IEvent> =
  (models.Event as Model<IEvent> | undefined) ?? model<IEvent>("Event", eventSchema);

export default Event;
