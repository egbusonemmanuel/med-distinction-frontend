const API_URL = import.meta.env.VITE_API_URL;



// =====================
// User Profile
// lib/api.js
export async function fetchUserProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, role, level, access')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}



// =====================
// Leaderboard & Groups
// =====================
export async function fetchLeaderboard() {
  try {
    const res = await fetch(`${API_URL}/api/leaderboard`);
    if (!res.ok) throw new Error(`Failed to fetch leaderboard: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("❌ fetchLeaderboard error:", err);
    return [];
  }
}

export async function fetchGroups() {
  try {
    const res = await fetch(`${API_URL}/api/groups`);
    if (!res.ok) throw new Error(`Failed to fetch groups: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("❌ fetchGroups error:", err);
    return [];
  }
}

// =====================
// AI Analyze
// =====================
export async function analyzePrompt(prompt) {
  try {
    const res = await fetch(`${API_URL}/api/ai/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    if (!res.ok) throw new Error(`AI analyze failed: ${res.status}`);
    const data = await res.json();
    return data.reply || null;
  } catch (err) {
    console.error("❌ analyzePrompt error:", err);
    return null;
  }
}

// =====================
// Library Files (GridFS)
// =====================
export async function fetchLibraryFiles() {
  try {
    const res = await fetch(`${API_URL}/api/library`);
    if (!res.ok) throw new Error(`Failed to fetch library files: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("❌ fetchLibraryFiles error:", err);
    return [];
  }
}

export async function uploadFile(file) {
  if (!file) return null;

  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch(`${API_URL}/api/library/upload`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error(`File upload failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("❌ uploadFile error:", err);
    return null;
  }
}

export async function downloadFile(fileId) {
  try {
    const res = await fetch(`${API_URL}/api/library/file/${fileId}`);
    if (!res.ok) throw new Error(`File download failed: ${res.status}`);
    const blob = await res.blob();
    return blob;
  } catch (err) {
    console.error("❌ downloadFile error:", err);
    return null;
  }
}
