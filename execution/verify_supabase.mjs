import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

function parseEnvFile() {
  const envPath = path.resolve(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) {
    return {};
  }
  const content = fs.readFileSync(envPath, "utf-8");
  const env = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      env[key] = val;
    }
  }
  return env;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function verifyConnection(maxRetries = 3) {
  const env = parseEnvFile();
  const url = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;

  console.log("=========================================");
  console.log("Supabase Connection Verification");
  console.log("=========================================");

  if (!url || !anonKey) {
    console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env");
    process.exit(1);
  }

  console.log(`Target URL: ${url}`);
  const client = createClient(url, anonKey);

  let attempt = 0;
  while (attempt < maxRetries) {
    attempt++;
    console.log(`[Attempt ${attempt}/${maxRetries}] Checking connection...`);

    try {
      const { data, error } = await client
        .from("attendance_state")
        .select("user_id")
        .limit(1);

      if (error) {
        if (error.code === "42P01") {
          console.log("Database reachable, but table 'attendance_state' does not exist.");
          console.log("Run supabase/schema.sql in your Supabase SQL editor to create it.");
          return;
        }
        console.warn(`Query warning (${error.code || "ERR"}): ${error.message}`);
      } else {
        console.log("SUCCESS: Connected to Supabase and 'attendance_state' table is verified.");
        return;
      }
    } catch (err) {
      console.warn(`Connection attempt ${attempt} failed: ${err.message}`);
      if (attempt < maxRetries) {
        const backoff = 1000 * Math.pow(2, attempt - 1);
        console.log(`Retrying in ${backoff}ms...`);
        await sleep(backoff);
      } else {
        console.error("All connection retry attempts failed.");
        console.error("Verify your project URL and network connectivity.");
        process.exit(1);
      }
    }
  }
}

verifyConnection().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
