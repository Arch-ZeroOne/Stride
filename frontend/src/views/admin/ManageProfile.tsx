import { useEffect, useState } from "react";
import client from "../../axiosClient";
import Swal from "sweetalert2";
import { Save, Upload, User, Loader2 } from "lucide-react";

interface AdminProfile {
  id: number;
  username: string;
  email: string;
  profile_image: string | null;
}

function Managerofile() {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [username, setUsername] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ───────── GET PROFILE ───────── */
  const getProfile = async () => {
    try {
      setLoading(true);
      const res = await client.get("/admin/profile");
      setProfile(res.data);
      setUsername(res.data.username);
      setError(null);
    } catch {
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProfile();
  }, []);

  /* ───────── UPDATE USERNAME ───────── */
  const handleSave = async () => {
    if (!username.trim()) {
      Swal.fire("Error", "Username cannot be empty", "error");
      return;
    }

    try {
      setSaving(true);
      await client.put("/admin/profile", { username });
      Swal.fire("Success", "Profile updated!", "success");
      getProfile();
    } catch {
      Swal.fire("Error", "Update failed", "error");
    } finally {
      setSaving(false);
    }
  };

  /* ───────── UPLOAD IMAGE ───────── */
  const handleUpload = async () => {
    if (!imageFile) return;

    const formData = new FormData();
    formData.append("image", imageFile);

    try {
      setSaving(true);
      await client.post("/admin/profile/image", formData);
      Swal.fire("Success", "Profile image updated!", "success");
      setImageFile(null);
      getProfile();
    } catch {
      Swal.fire("Error", "Upload failed", "error");
    } finally {
      setSaving(false);
    }
  };

  /* ───────── LOADING SCREEN ───────── */
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-slate-400">
        <Loader2 className="animate-spin mr-2" /> Loading profile...
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex h-screen items-center justify-center text-red-400">
        {error || "Profile not found"}
      </div>
    );
  }

  /* ───────── UI ───────── */
  return (
    <div
      className="flex justify-center items-center h-screen"
      style={{ background: "#0a0f1a", color: "#e2e8f0" }}
    >
      <div
        className="w-full max-w-md p-6 rounded-2xl space-y-4"
        style={{
          background: "#0d1321",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* TITLE */}
        <h2 className="text-xl font-bold flex items-center gap-2">
          <User size={18} /> Admin Profile
        </h2>

        {/* IMAGE */}
        <div className="flex flex-col items-center gap-2">
          <img
            src={
              profile.profile_image ||
              "https://cdn-icons-png.flaticon.com/512/149/149071.png"
            }
            className="w-24 h-24 rounded-full object-cover"
          />

          <input
            type="file"
            onChange={(e) =>
              setImageFile(e.target.files ? e.target.files[0] : null)
            }
            className="text-xs"
          />

          <button
            onClick={handleUpload}
            disabled={saving || !imageFile}
            className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs"
            style={{
              background: "rgba(16,185,129,0.12)",
              border: "1px solid rgba(16,185,129,0.2)",
              color: "#10b981",
            }}
          >
            <Upload size={12} /> Upload Image
          </button>
        </div>

        {/* USERNAME */}
        <div className="space-y-1">
          <p className="text-xs text-slate-400">Username</p>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-[#151b27] outline-none"
          />
        </div>

        {/* EMAIL (READ ONLY) */}
        <div className="space-y-1">
          <p className="text-xs text-slate-400">Email</p>
          <input
            value={profile.email}
            readOnly
            className="w-full px-3 py-2 rounded-lg bg-[#0a0f1a]"
          />
        </div>

        {/* SAVE BUTTON */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-2 rounded-xl font-semibold flex justify-center gap-2"
          style={{
            background: "linear-gradient(135deg, #10b981, #059669)",
            color: "#fff",
          }}
        >
          {saving ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <>
              <Save size={14} /> Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default Managerofile;
