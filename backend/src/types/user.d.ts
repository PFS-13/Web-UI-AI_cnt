export {};

declare global {
  namespace Express {
    interface User {
      id: string;
      username: string;
      email: string;
      image_url?: string;
    }

    interface Request {
      user?: User;
    }
  }
}
