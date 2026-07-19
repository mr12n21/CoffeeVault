export interface User {
  id: string;
  email: string;
  password_hash: string;
  created_at: string;
}

export type PublicUser = Omit<User, "password_hash">;
