import { useState } from "react";

export default function Register() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const handleCheckEmail = async () => {
    try {
      const res = await fetch("http://localhost:3001/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message);
        return;
      }

      setError("");
      setStep(2); // lanjut ke password
    } catch (err) {
      setError("Terjadi kesalahan server");
    }
  };

  const handleRegister = async () => {
    try {
      const res = await fetch("http://localhost:3001/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message);
        return;
      }

      setError("");
      setStep(3); // lanjut ke OTP
    } catch (err) {
      setError("Terjadi kesalahan server");
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const res = await fetch("http://localhost:3001/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message);
        return;
      }

      setError("");
      alert("Registrasi berhasil dan OTP terverifikasi!");
    } catch (err) {
      setError("Terjadi kesalahan server");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Register</h1>

      {step === 1 && (
        <div>
          <input
            type="email"
            placeholder="Masukkan email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 w-full mb-2"
          />
          <button
            onClick={handleCheckEmail}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Lanjut
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <p>Email: <strong>{email}</strong></p>
          <input
            type="password"
            placeholder="Masukkan password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 w-full mb-2"
          />
          <button
            onClick={handleRegister}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Daftar
          </button>
        </div>
      )}

      {step === 3 && (
        <div>
          <p>Email: <strong>{email}</strong></p>
          <input
            type="text"
            placeholder="Masukkan kode OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="border p-2 w-full mb-2"
          />
          <button
            onClick={handleVerifyOtp}
            className="bg-purple-500 text-white px-4 py-2 rounded"
          >
            Verifikasi OTP
          </button>
        </div>
      )}

      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}
