import fs from "fs";
import path from "path";

function verifyJsonDatabase(targetPath) {
  const filePath = targetPath || path.resolve(process.cwd(), "data/default_timetable_database.json");
  console.log("=========================================");
  console.log("JSON Database Integrity Verifier");
  console.log("=========================================");
  console.log(`Checking database file: ${filePath}`);

  if (!fs.existsSync(filePath)) {
    console.error(`Error: File does not exist at ${filePath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  let json;
  try {
    json = JSON.parse(raw);
  } catch (err) {
    console.error(`Error: Malformed JSON syntax - ${err.message}`);
    process.exit(1);
  }

  const candidate = json.data ?? json;
  if (!candidate || typeof candidate !== "object") {
    console.error("Error: Database root or 'data' field must be an object.");
    process.exit(1);
  }

  if (!Array.isArray(candidate.subjects)) {
    console.error("Error: Missing 'subjects' array in database.");
    process.exit(1);
  }

  if (typeof candidate.timetable !== "object" || candidate.timetable === null) {
    console.error("Error: Missing 'timetable' day map in database.");
    process.exit(1);
  }

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  for (const day of days) {
    if (!Array.isArray(candidate.timetable[day])) {
      console.warn(`Warning: Day '${day}' is missing or not an array.`);
    }
  }

  const slotCount = Array.isArray(candidate.slots) ? candidate.slots.length : 0;
  console.log("SUCCESS: JSON database is valid and consistent.");
  console.log(`- Version: ${json.version || "1.0.0"}`);
  console.log(`- Subjects: ${candidate.subjects.length}`);
  console.log(`- Total Scheduled Slots: ${slotCount}`);
}

const target = process.argv[2];
verifyJsonDatabase(target);
