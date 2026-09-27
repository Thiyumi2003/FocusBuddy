export interface SessionUser {
  id?: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Workspace {
  id?: string;
  mode: 'team' | 'personal';
  name: string;
  code: string | null;
  members: number;
  role: 'admin' | 'member' | null;
  category?: string;
}