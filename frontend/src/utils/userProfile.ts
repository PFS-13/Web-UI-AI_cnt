// utils/userProfile.ts
// Utility functions untuk mengelola user profile data
// Siap untuk integrasi dengan backend API

export interface UserProfile {
  fullName: string;
  completedOnboarding: boolean;
  completedAt: string;
}

export const USER_PROFILE_KEY = 'userProfile';

/**
 * Mendapatkan user profile dari localStorage
 * @returns UserProfile | null
 */
export const getUserProfile = (): UserProfile | null => {
  try {
    const profile = localStorage.getItem(USER_PROFILE_KEY);
    return profile ? JSON.parse(profile) : null;
  } catch (error) {
    console.error('Error parsing user profile:', error);
    return null;
  }
};

/**
 * Menyimpan user profile ke localStorage
 * @param profile UserProfile data
 */
export const saveUserProfile = (profile: UserProfile): void => {
  try {
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.error('Error saving user profile:', error);
  }
};

/**
 * Mengecek apakah user sudah menyelesaikan onboarding
 * @returns boolean
 */
export const hasCompletedOnboarding = (): boolean => {
  const profile = getUserProfile();
  return profile?.completedOnboarding === true;
};

/**
 * Menghapus user profile dari localStorage
 */
export const clearUserProfile = (): void => {
  localStorage.removeItem(USER_PROFILE_KEY);
};

/**
 * Logout function yang menghapus semua data user
 */
export const logout = (): void => {
  clearUserProfile();
  // TODO: Tambahkan clear auth token jika diperlukan
  // localStorage.removeItem('auth_token');
  // sessionStorage.removeItem('auth_token');
};

/**
 * Validasi full name
 * @param name string
 * @returns { isValid: boolean, error?: string }
 */
export const validateFullName = (name: string): { isValid: boolean; error?: string } => {
  if (!name.trim()) {
    return { isValid: false, error: 'Full name is required.' };
  }
  if (name.trim().length < 2) {
    return { isValid: false, error: 'Full name must be at least 2 characters.' };
  }
  if (!/^[a-zA-Z\s]+$/.test(name.trim())) {
    return { isValid: false, error: 'Full name can only contain letters and spaces.' };
  }
  return { isValid: true };
};

/**
 * API function untuk mengirim user profile ke backend
 * TODO: Implementasi dengan backend API
 * @param profile UserProfile
 * @returns Promise<any>
 */
export const saveUserProfileToAPI = async (profile: UserProfile): Promise<any> => {
  // TODO: Implementasi dengan backend API
  // Contoh implementasi:
  /*
  const response = await fetch('/api/user/profile', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`
    },
    body: JSON.stringify(profile)
  });
  
  if (!response.ok) {
    throw new Error('Failed to save user profile');
  }
  
  return response.json();
  */
  
  // Simulasi API call untuk sekarang
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, profile });
    }, 1000);
  });
};
