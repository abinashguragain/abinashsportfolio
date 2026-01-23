import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input sanitization helpers
function sanitizeString(input: unknown, maxLength = 10000): string {
  if (typeof input !== 'string') return '';
  // Remove potentially dangerous HTML/script tags
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
    .slice(0, maxLength);
}

function sanitizeObject(obj: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeString(item) : item
      );
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

// Validate table name against allowed tables
const ALLOWED_TABLES = [
  'hero_content', 'about_content', 'services', 'cta_content', 
  'testimonials', 'footer_content', 'footer_links', 'social_links',
  'blog_posts', 'blog_categories', 'blog_tags', 'blog_post_categories', 'blog_post_tags',
  'authors', 'experiences', 'experience_page_content',
  'nav_links', 'navigation_settings', 'site_settings', 'seo_settings',
  'google_sheets_config', 'third_party_integrations', 'contact_submissions'
];

function isValidTable(table: string): boolean {
  return ALLOWED_TABLES.includes(table);
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.log('Admin action rejected: No authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized: No token provided' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with user's JWT
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify user is authenticated
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      console.log('Admin action rejected: Invalid token', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check admin role using service client
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data: roleData, error: roleError } = await serviceClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError || !roleData) {
      console.log(`Admin action rejected: User ${user.email} is not an admin`);
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const body = await req.json();
    const { action, table, data, recordId } = body;

    // Validate table name
    if (!table || !isValidTable(table)) {
      console.log(`Admin action rejected: Invalid table "${table}"`);
      return new Response(
        JSON.stringify({ error: 'Invalid table name' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate action
    const validActions = ['insert', 'update', 'upsert', 'delete'];
    if (!action || !validActions.includes(action)) {
      console.log(`Admin action rejected: Invalid action "${action}"`);
      return new Response(
        JSON.stringify({ error: 'Invalid action' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize input data
    const sanitizedData = data ? sanitizeObject(data) : null;

    // Get request metadata for logging
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    let result;
    let error;

    // Perform the action using service client (bypasses RLS for logging)
    switch (action) {
      case 'insert':
        ({ data: result, error } = await serviceClient
          .from(table)
          .insert(sanitizedData)
          .select());
        break;
      case 'update':
        if (!recordId) {
          return new Response(
            JSON.stringify({ error: 'Record ID required for update' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        ({ data: result, error } = await serviceClient
          .from(table)
          .update(sanitizedData)
          .eq('id', recordId)
          .select());
        break;
      case 'upsert':
        ({ data: result, error } = await serviceClient
          .from(table)
          .upsert(sanitizedData)
          .select());
        break;
      case 'delete':
        if (!recordId) {
          return new Response(
            JSON.stringify({ error: 'Record ID required for delete' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        ({ data: result, error } = await serviceClient
          .from(table)
          .delete()
          .eq('id', recordId)
          .select());
        break;
    }

    if (error) {
      console.error(`Admin action error: ${error.message}`, { action, table, user: user.email });
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log the activity (using service client to bypass RLS INSERT restriction)
    const logEntry = {
      user_id: user.id,
      user_email: user.email || 'unknown',
      action: `${action}:${table}`,
      table_name: table,
      record_id: recordId || (result?.[0]?.id?.toString()) || null,
      details: {
        data_keys: sanitizedData ? Object.keys(sanitizedData) : null,
        timestamp: new Date().toISOString()
      },
      ip_address: ipAddress,
      user_agent: userAgent.slice(0, 500)
    };

    const { error: logError } = await serviceClient
      .from('admin_activity_logs')
      .insert(logEntry);

    if (logError) {
      console.error('Failed to log admin activity:', logError.message);
      // Don't fail the request if logging fails
    }

    console.log(`Admin action successful: ${action} on ${table} by ${user.email}`);

    return new Response(
      JSON.stringify({ data: result, success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('Admin action error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
