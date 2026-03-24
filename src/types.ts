export type UserRole = "superadmin" | "admin" | "subadmin" | "user";

export interface UserPermissions {
  manageEvents: boolean;
  manageGallery: boolean;
  manageTimings: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: UserRole;
  createdAt: string;
  permissions?: UserPermissions;
}

export interface TempleEvent {
  id?: string;
  title: string;
  description: string;
  date: string;
  imageUrl: string;
  location: string;
  createdBy: string;
}

export interface GalleryItem {
  id?: string;
  imageUrl: string;
  caption: string;
  date: string;
  type: "darshan" | "general";
}

export interface TempleTiming {
  id?: string;
  name: string;
  time: string;
  category: "darshan" | "pooja";
}
