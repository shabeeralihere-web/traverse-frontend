
export type UserRole = "traveler" | "operator" | "admin";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;

  profilePhoto?: string;
  phone?: string;
  bio?: string;
  isActive?: boolean;
  createdAt?: string;
}
