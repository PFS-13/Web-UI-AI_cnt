import { useEffect, useState, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "./services";
import type { User } from "./types";
export default function ChangePasswordPage(): JSX.Element {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [touched, setTouched] = useState({ new: false, confirm: false });
  const passwordsMatch = newPassword === confirmPassword;
  const isValid = newPassword.length >= 8 && passwordsMatch;
  const navigate = useNavigate();

  useEffect(() => {
      const checkUser = async () => {
        try {
          const user = await authAPI.getMe(); 
          if (!user) {
            navigate("/login");
          } else {
            console.log("Authenticated user:", user);
            setUser(user as User);
          }
        } catch (err) {
          console.error("Error fetching user:", err);
          navigate("/login");
        }
      };
  
      checkUser();
    }, [navigate]); 

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ new: true, confirm: true });

    console.log("New password:", newPassword);
    try {
      if (!user) throw new Error("User not authenticated");
      authAPI.changePassword(user.id,newPassword);
      alert("Password berhasil diubah. Silakan login kembali.");
      navigate("/login");
    } catch (err) {
      console.error("Error changing password:", err);
      alert("Gagal mengubah password. Silakan coba lagi.");
    }

  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-6">
        <h1 className="text-2xl font-semibold mb-4">Ganti Password</h1>
        <p className="text-sm text-gray-500 mb-6">
          Masukkan password baru dan konfirmasi.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, new: true }))}
                placeholder="Minimal 8 karakter"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-2 top-2 text-sm text-gray-600"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {touched.new &&
              newPassword.length > 0 &&
              newPassword.length < 8 && (
                <p className="text-xs text-red-600 mt-1">
                  Password harus minimal 8 karakter.
                </p>
              )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, confirm: true }))}
              placeholder="Ketik ulang password"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            {touched.confirm &&
              confirmPassword.length > 0 &&
              !passwordsMatch && (
                <p className="text-xs text-red-600 mt-1">
                  Konfirmasi tidak cocok.
                </p>
              )}
          </div>

          {/* Button */}
          <div className="pt-2">
            <button
              type="submit"
              className={`w-full py-2 rounded-2xl font-medium shadow-sm transition disabled:opacity-60 disabled:cursor-not-allowed ${
                isValid
                  ? "bg-indigo-600 text-white hover:bg-indigo-700"
                  : "bg-gray-200 text-gray-700"
              }`}
              disabled={!isValid}
            >
              Tampilkan di Console
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-2">
            Catatan: tombol akan menampilkan password baru di console
            (developer tools).
          </p>
        </form>
      </div>
    </div>
  );
}
