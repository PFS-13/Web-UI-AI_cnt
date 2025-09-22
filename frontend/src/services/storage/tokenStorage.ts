const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

export const tokenStorage = {
  getToken(): string | null {
    try {
      return sessionStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error getting token from storage:', error);
      return null;
    }
  },

  setToken(token: string): void {
    try {
      sessionStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
      console.error('Error setting token in storage:', error);
    }
  },

  removeToken(): void {
    try {
      sessionStorage.removeItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error removing token from storage:', error);
    }
  },

  getUser(): any | null {
    try {
      const userData = sessionStorage.getItem(USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user from storage:', error);
      return null;
    }
  },

  setUser(user: any): void {
    try {
      sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error setting user in storage:', error);
    }
  },

  removeUser(): void {
    try {
      sessionStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error('Error removing user from storage:', error);
    }
  },

  clear(): void {
    try {
      this.removeToken();
      this.removeUser();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
};
