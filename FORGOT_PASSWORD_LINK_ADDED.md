# Penambahan Forgot Password pada Input Password

## ✅ **Fitur yang Ditambahkan:**

Link "Forgot password?" pada halaman input password yang mengarahkan ke halaman reset password.

## 🔧 **Implementasi:**

### **Forgot Password Link:**
```typescript
{/* Forgot Password Link */}
<div className={styles.linkContainer}>
  <button 
    type="button" 
    onClick={() => navigate('/reset-password')} 
    className={styles.textButton}
  >
    Forgot password?
  </button>
</div>
```

### **Back to Login Link:**
```typescript
{/* Back to Login Link */}
<div className={styles.linkContainer}>
  <button 
    type="button" 
    onClick={handleEditEmail} 
    className={styles.textButton}
  >
    Back to login
  </button>
</div>
```

## 🎨 **Layout Halaman Sekarang:**

```
┌─────────────────────────────────┐
│           AuthHeader            │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│        Welcome back             │
│  Enter your password for        │
│  test@example.com               │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  [Email] [Edit]                 │
│  [Password] [👁]                │
│  [Continue]                      │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│      Forgot password?           │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│      Back to login              │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  Terms | Privacy Policy         │
└─────────────────────────────────┘
```

## 🎯 **Functionality:**

### **Forgot Password:**
- ✅ **Click**: Navigate ke `/reset-password`
- ✅ **Style**: Menggunakan `.textButton` (underline, hover effect)
- ✅ **Position**: Di bawah form, di atas "Back to login"

### **Back to Login:**
- ✅ **Click**: Navigate ke `/login` dengan replace
- ✅ **Style**: Menggunakan `.textButton` (underline, hover effect)
- ✅ **Position**: Di bawah "Forgot password?"

## 🚀 **Testing:**

### **1. Test Forgot Password Link:**
- Akses `/input-password`
- Klik "Forgot password?"
- Harus redirect ke `/reset-password`

### **2. Test Back to Login Link:**
- Akses `/input-password`
- Klik "Back to login"
- Harus redirect ke `/login`

### **3. Test Hover Effects:**
- Hover pada "Forgot password?" → Color berubah
- Hover pada "Back to login" → Color berubah

## 📱 **Responsive Design:**

- ✅ **Mobile Friendly**: Link mudah di-tap di mobile
- ✅ **Consistent Spacing**: Menggunakan `.linkContainer` untuk spacing
- ✅ **Touch Target**: Button memiliki area yang cukup untuk touch

## 🎨 **Style yang Digunakan:**

### **linkContainer:**
```css
.linkContainer {
  text-align: center;
  margin: 1.5rem 0;
}
```

### **textButton:**
```css
.textButton {
  background: none;
  border: none;
  color: #6b7280;
  font-size: 0.875rem;
  cursor: pointer;
  text-decoration: underline;
  transition: color 0.2s ease;
}

.textButton:hover {
  color: #374151;
}
```

## 🔄 **Flow Penggunaan:**

1. **User di Input Password** → Lupa password
2. **Klik "Forgot password?"** → Redirect ke Reset Password
3. **Di Reset Password** → Input email dan reset
4. **Kembali ke Login** → Login dengan password baru

## 📝 **Catatan:**

- Link "Forgot password?" menggunakan `navigate('/reset-password')`
- Link "Back to login" menggunakan `handleEditEmail()` yang sudah ada
- Kedua link menggunakan style yang sama untuk konsistensi
- Siap untuk integrasi dengan backend API

Sekarang halaman input password memiliki link "Forgot password?" yang mengarahkan ke halaman reset password! 🎉
