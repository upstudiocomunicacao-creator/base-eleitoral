import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type InvitePayload = {
  fullName?: string;
  email?: string;
  phone?: string | null;
  role?: string;
  linkedState?: string | null;
  linkedCity?: string | null;
  linkedNeighborhood?: string | null;
  redirectTo?: string;
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return json({ error: "Supabase function secrets are not configured." }, 500);
    }

    const authorization = request.headers.get("Authorization");
    if (!authorization) {
      return json({ error: "Missing authenticated user." }, 401);
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authorization } },
    });
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData.user) {
      return json({ error: "Invalid authenticated user." }, 401);
    }

    const { data: callerProfile, error: profileError } = await adminClient
      .from("users_profiles")
      .select("*")
      .eq("auth_user_id", userData.user.id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (profileError || !callerProfile) {
      return json({ error: "Caller profile not found." }, 403);
    }

    if (!["admin", "coordenacao_geral"].includes(callerProfile.role)) {
      return json({ error: "Only admin or coordenação geral can invite users." }, 403);
    }

    const payload = await request.json() as InvitePayload;
    const email = payload.email?.trim().toLowerCase();
    const fullName = payload.fullName?.trim();
    const role = payload.role?.trim() || "visualizador";

    if (!email || !fullName) {
      return json({ error: "Name and email are required." }, 400);
    }

    const allowedRoles = new Set([
      "admin",
      "coordenacao_geral",
      "coordenador_regional",
      "operador_campo",
      "lideranca",
      "visualizador",
    ]);

    if (!allowedRoles.has(role)) {
      return json({ error: "Invalid role." }, 400);
    }

    const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, {
      redirectTo: payload.redirectTo,
      data: {
        full_name: fullName,
        invited_by: userData.user.id,
      },
    });

    if (inviteError || !inviteData.user) {
      return json({ error: inviteError?.message || "Could not create invite." }, 400);
    }

    const profilePayload = {
      auth_user_id: inviteData.user.id,
      campaign_id: callerProfile.campaign_id,
      full_name: fullName,
      email,
      phone: payload.phone || null,
      role,
      status: "ativo",
      linked_state: payload.linkedState || callerProfile.linked_state || "RJ",
      linked_city: payload.linkedCity || callerProfile.linked_city || "Maricá",
      linked_neighborhood: payload.linkedNeighborhood || null,
    };

    const { data: profile, error: upsertError } = await adminClient
      .from("users_profiles")
      .upsert(profilePayload, { onConflict: "auth_user_id" })
      .select("*")
      .single();

    if (upsertError) {
      return json({ error: upsertError.message }, 400);
    }

    return json({
      authUserId: inviteData.user.id,
      profile,
    });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Unexpected invite error." }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}
