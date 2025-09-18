export {};

declare global {
  namespace Express {
    interface User {
      google_id: string;
      username: string;
      email: string;
      image_url?: string;
    }

    interface Request {
      user?: User;
    }
  }
}
