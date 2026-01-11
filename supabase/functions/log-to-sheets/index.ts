import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GoogleSheetsConfig {
  spreadsheet_id: string;
  sheet_name: string;
  service_account_credentials: string;
  is_enabled: boolean;
}

interface RequestPayload {
  formData: Record<string, unknown>;
  sourceUrl: string;
  testConnection?: boolean;
}

// Generate JWT for Google API authentication
async function generateGoogleJWT(credentials: { client_email: string; private_key: string }): Promise<string> {
  const header = { alg: "RS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: credentials.client_email,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const encoder = new TextEncoder();
  const headerB64 = btoa(JSON.stringify(header)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const signatureInput = `${headerB64}.${payloadB64}`;

  // Import the private key
  const pemHeader = "-----BEGIN PRIVATE KEY-----";
  const pemFooter = "-----END PRIVATE KEY-----";
  let pemContents = credentials.private_key;
  pemContents = pemContents.replace(pemHeader, "").replace(pemFooter, "").replace(/\s/g, "");
  
  const binaryKey = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));
  
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    encoder.encode(signatureInput)
  );

  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  return `${headerB64}.${payloadB64}.${signatureB64}`;
}

// Exchange JWT for access token
async function getAccessToken(credentials: { client_email: string; private_key: string }): Promise<string> {
  const jwt = await generateGoogleJWT(credentials);
  
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get access token: ${error}`);
  }

  const data = await response.json();
  return data.access_token;
}

// Append row to Google Sheet
async function appendToSheet(
  accessToken: string,
  spreadsheetId: string,
  sheetName: string,
  values: string[]
): Promise<void> {
  const range = `${sheetName}!A:Z`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      values: [values],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to append to sheet: ${error}`);
  }
}

// Get sheet metadata to check headers
async function getSheetHeaders(
  accessToken: string,
  spreadsheetId: string,
  sheetName: string
): Promise<string[]> {
  const range = `${sheetName}!1:1`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    // If no headers exist, return empty array
    return [];
  }

  const data = await response.json();
  return data.values?.[0] || [];
}

// Set headers in sheet
async function setSheetHeaders(
  accessToken: string,
  spreadsheetId: string,
  sheetName: string,
  headers: string[]
): Promise<void> {
  const range = `${sheetName}!A1`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`;

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      values: [headers],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to set headers: ${error}`);
  }
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get Google Sheets config
    const { data: configData, error: configError } = await supabase
      .from("google_sheets_config")
      .select("*")
      .limit(1)
      .single();

    if (configError || !configData) {
      console.log("No Google Sheets config found");
      return new Response(
        JSON.stringify({ success: false, error: "Google Sheets not configured" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const config = configData as GoogleSheetsConfig;

    // Check if integration is enabled
    if (!config.is_enabled) {
      console.log("Google Sheets integration is disabled");
      return new Response(
        JSON.stringify({ success: false, error: "Google Sheets integration disabled" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate config
    if (!config.spreadsheet_id || !config.service_account_credentials) {
      console.log("Google Sheets config incomplete");
      return new Response(
        JSON.stringify({ success: false, error: "Google Sheets configuration incomplete" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { formData, sourceUrl, testConnection } = await req.json() as RequestPayload;

    // Parse credentials
    let credentials;
    try {
      credentials = JSON.parse(config.service_account_credentials);
    } catch {
      console.error("Failed to parse service account credentials");
      return new Response(
        JSON.stringify({ success: false, error: "Invalid service account credentials format" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get access token
    console.log("Getting Google access token...");
    const accessToken = await getAccessToken(credentials);

    // If this is a test connection request
    if (testConnection) {
      console.log("Testing connection to spreadsheet...");
      await getSheetHeaders(accessToken, config.spreadsheet_id, config.sheet_name);
      return new Response(
        JSON.stringify({ success: true, message: "Connection successful" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get current headers
    const existingHeaders = await getSheetHeaders(accessToken, config.spreadsheet_id, config.sheet_name);
    
    // Build headers from form data + timestamp + source
    const formFields = Object.keys(formData);
    const requiredHeaders = ["timestamp", "source_url", ...formFields];
    
    // Check if we need to add new headers
    const newHeaders = requiredHeaders.filter(h => !existingHeaders.includes(h));
    
    let allHeaders = existingHeaders;
    if (existingHeaders.length === 0 || newHeaders.length > 0) {
      allHeaders = [...new Set([...existingHeaders, ...requiredHeaders])];
      await setSheetHeaders(accessToken, config.spreadsheet_id, config.sheet_name, allHeaders);
      console.log("Updated headers:", allHeaders);
    }

    // Build row values in header order
    const timestamp = new Date().toISOString();
    const rowValues = allHeaders.map(header => {
      if (header === "timestamp") return timestamp;
      if (header === "source_url") return sourceUrl;
      return String(formData[header] ?? "");
    });

    // Append row
    console.log("Appending row to sheet...");
    await appendToSheet(accessToken, config.spreadsheet_id, config.sheet_name, rowValues);

    console.log("Successfully logged to Google Sheets");
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error logging to Google Sheets:", errorMessage);
    
    // Return success: false but 200 status to not break form submission
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
