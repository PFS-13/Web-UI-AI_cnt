# Halaman Input Password untuk Login Manual

## 🎯 **Overview**

Halaman input password untuk login manual yang muncul ketika user memasukkan email yang sudah ada di database dan method loginnya adalah manual. Menggunakan struktur yang sama dengan halaman register.

## 📁 **File yang Dibuat:**

### 1. **Komponen InputPassword**
- `frontend/src/pages/auth/InputPassword/InputPassword.tsx`
- `frontend/src/pages/auth/InputPassword/index.ts`

### 2. **Routing**
- Route: `/input-password`
- Export di `frontend/src/pages/auth/index.ts`
- Import di `frontend/src/App.tsx`

## 🎨 **Fitur Halaman:**

### **UI Elements:**
- ✅ **Header**: AuthHeader (logo dan navigasi)
- ✅ **Title**: "Welcome back"
- ✅ **Subtitle**: Instruksi dengan email yang ditampilkan
- ✅ **Email Display**: Email read-only dengan tombol "Edit"
- ✅ **Password Input**: Input password dengan toggle visibility
- ✅ **Continue Button**: Button untuk melanjutkan login
- ✅ **Terms & Privacy**: Link ke terms dan privacy policy

### **Functionality:**
- ✅ **Email dari State**: Mengambil email dari location.state
- ✅ **Edit Email**: Tombol untuk kembali ke halaman login
- ✅ **Password Validation**: Validasi password minimal 6 karakter
- ✅ **Show/Hide Password**: Toggle untuk melihat password
- ✅ **Loading State**: Button menampilkan "Signing in..." saat loading
- ✅ **Mock Login**: Simulasi login dengan mock data
- ✅ **Redirect**: Setelah berhasil, redirect ke dashboard

## 🚀 **Cara Mengakses:**

### **Via URL Langsung (dengan state):**
```typescript
// Contoh navigasi dengan state
navigate('/input-password', { 
  state: { email: 'user@example.com' } 
});
```

### **Via URL Langsung (tanpa state):**
```
http://localhost:3000/input-password
```
*Note: Akan redirect ke /login jika tidak ada email di state*

## 🔧 **Konfigurasi:**

### **Email dari State:**
```typescript
useEffect(() => {
  const emailFromState = location.state?.email || '';
  if (emailFromState) {
    setEmail(emailFromState);
  } else {
    navigate('/login');
  }
}, [location.state, navigate]);
```

### **Simulasi Login:**
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setPasswordError('');
  setIsLoading(true);

  // Validasi password
  if (!password.trim()) {
    setPasswordError('Password is required.');
    setIsLoading(false);
    return;
  }

  if (password.length < 6) {
    setPasswordError('Password must be at least 6 characters.');
    setIsLoading(false);
    return;
  }

  try {
    console.log(`Login attempt for: ${email}`);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock user data
    const mockUser = {
      id: 'user-id',
      email: email,
      username: email.split('@')[0],
      is_active: true,
      provider: 'manual' as const,
    };
    
    const mockToken = 'mock-jwt-token';
    setUser(mockUser, mockToken);
    navigate('/dashboard');
    
  } catch (error) {
    setPasswordError('Invalid email or password. Please try again.');
  } finally {
    setIsLoading(false);
  }
};
```

## 📱 **UI Components:**

### **Email Display (Read-only):**
```typescript
<input
  id="email"
  type="email"
  value={email}
  className={`${styles.formInput} ${styles.emailDisabled}`}
  disabled
/>
<button onClick={handleEditEmail} className={styles.editButton}>
  Edit
</button>
```

### **Password Input dengan Toggle:**
```typescript
<input
  ref={passwordInputRef}
  id="password"
  type={showPassword ? 'text' : 'password'}
  value={password}
  onChange={handlePasswordChange}
  className={`${styles.formInput} ${styles.password}`}
/>
<button onClick={togglePasswordVisibility} className={styles.passwordToggle}>
  {/* Eye icon */}
</button>
```

## 🎯 **Validasi:**

### **Password Requirements:**
- ✅ **Required**: Password tidak boleh kosong
- ✅ **Minimum Length**: Minimal 6 karakter
- ✅ **Error Display**: Pesan error ditampilkan di bawah input

### **Error Messages:**
- "Password is required."
- "Password must be at least 6 characters."
- "Invalid email or password. Please try again."

## 🔄 **Flow Penggunaan:**

1. **User di halaman login** → Masukkan email yang sudah ada
2. **System check** → Email ada di database dengan method manual
3. **Redirect ke InputPassword** → Dengan email di state
4. **User input password** → Validasi password
5. **Submit** → Simulasi login dengan loading
6. **Success** → Redirect ke dashboard
7. **Error** → Tampilkan pesan error

## 📝 **Testing:**

### **Manual Testing:**
1. Navigate ke `/input-password` dengan state email
2. Input password yang valid (min 6 karakter)
3. Klik "Continue" → Loading state muncul
4. Tunggu 2 detik → Redirect ke dashboard
5. Test dengan password kosong → Error message
6. Test dengan password < 6 karakter → Error message
7. Klik "Edit" → Redirect ke login

### **URL Testing:**
```typescript
// Test dengan state
navigate('/input-password', { state: { email: 'test@example.com' } });

// Test tanpa state (harus redirect ke login)
navigate('/input-password');
```

## 🔄 **Future Enhancements:**

1. **Real API Integration**: Integrasi dengan backend API untuk login
2. **Remember Me**: Checkbox untuk remember login
3. **Forgot Password**: Link ke halaman reset password
4. **Rate Limiting**: Mencegah brute force attack
5. **Two-Factor Authentication**: Support untuk 2FA
6. **Social Login**: Opsi login dengan Google/Facebook

## 📝 **Catatan:**

- Halaman ini **membutuhkan email di state** untuk berfungsi
- Jika tidak ada email di state, akan redirect ke `/login`
- Menggunakan mock data untuk simulasi login
- Style mengikuti design system yang sudah ada
- Siap untuk integrasi dengan backend API

Halaman input password sekarang siap untuk testing dan dapat diakses via URL `/input-password`! 🎉
