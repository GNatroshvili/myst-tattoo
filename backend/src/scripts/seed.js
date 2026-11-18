import "dotenv/config";
import { connectDB, disconnectDB } from "../config/db.js";
import { env } from "../config/env.js";
import { Style } from "../models/Style.js";

/**
 * Adds the starting tattoo styles, once: `npm run seed`.
 * Does nothing when the database already has styles, so it is safe to run again.
 */
const styles = [
  { en: "Fine line", ka: "წვრილი ხაზი" },
  { en: "Blackwork", ka: "ბლექვორკი" },
  { en: "Ornamental", ka: "ორნამენტული" },
  { en: "Botanical", ka: "ბოტანიკური" },
  { en: "Lettering", ka: "წარწერები" },
];

await connectDB(env.mongoUri);
if ((await Style.countDocuments()) > 0) {
  console.log("[seed] styles already exist, nothing added");
} else {
  // one by one, so they keep this order (the list is sorted by creation time)
  for (const name of styles) await Style.create({ name });
  console.log(`[seed] added ${styles.length} styles`);
}
await disconnectDB();
