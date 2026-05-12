export interface Address {
  label?: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  isDefault?: boolean;
}

export interface SpecDetail {
  name: string;
  value: string;
}

export interface SpecGroup {
  group: string;
  specs: SpecDetail[];
}

export interface Specification {
  id: string;
  _id?: string;
  details: SpecGroup[];
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  photo: string;
  status?: string;
  addresses?: Address[];
}

export interface AdminUserEvent {
  id: string;
  type: string;
  title: string;
  time: string;
}

export interface ApiResponse<T> {
  status: string;
  data: {
    data: T;
  };
  total?: number;
  page?: number;
  limit?: number;
  countsByStatus?: { unread: number; read: number; archived: number };
  meta?: {
    recentEvents: AdminUserEvent[];
  };
}

export interface AuthResponse {
  status: string;
  token?: string;
  data: {
    user: User;
  };
}

export interface ProfileResponse {
  status: string;
  data: {
    user: User;
  };
}

export interface UploadResponse {
  status: string;
  url: string;
}
