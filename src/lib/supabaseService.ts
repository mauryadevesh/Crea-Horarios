import { supabase, supabaseUrl, supabaseAnonKey } from "./supabase";

export interface SupabaseHealthResult {
  isConfigured: boolean;
  reachable: boolean;
  tableAccessible: boolean;
  error?: string;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function checkSupabaseConnection(
  maxRetries = 3,
  initialDelayMs = 800
): Promise<SupabaseHealthResult> {
  if (!supabase || !supabaseUrl || !supabaseAnonKey) {
    return {
      isConfigured: false,
      reachable: false,
      tableAccessible: false,
      error: "Supabase credentials are not configured in .env",
    };
  }

  let attempt = 0;
  let lastError: Error | null = null;

  while (attempt < maxRetries) {
    try {
      const response = await fetch(`${supabaseUrl}/auth/v1/settings`, {
        headers: { apikey: supabaseAnonKey },
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok && response.status !== 401 && response.status !== 403) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const { error: dbError } = await supabase
        .from("attendance_state")
        .select("user_id")
        .limit(1);

      if (dbError && dbError.code === "42P01") {
        return {
          isConfigured: true,
          reachable: true,
          tableAccessible: false,
          error: "Table 'attendance_state' does not exist. Run supabase/schema.sql in SQL editor.",
        };
      }

      return {
        isConfigured: true,
        reachable: true,
        tableAccessible: !dbError,
        error: dbError?.message,
      };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      attempt++;
      if (attempt < maxRetries) {
        await sleep(initialDelayMs * Math.pow(2, attempt - 1));
      }
    }
  }

  return {
    isConfigured: true,
    reachable: false,
    tableAccessible: false,
    error: lastError?.message || "Failed to reach Supabase after retries",
  };
}
