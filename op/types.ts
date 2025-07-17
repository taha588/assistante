export enum ChatRole {
  User = 'user',
  Model = 'model',
}

export interface Attachment {
  name: string;
  type: string;
  data: string; // Data URL for rendering
}

export interface Source {
  uri: string;
  title: string;
}

export interface Message {
  id: string;
  role: ChatRole;
  content: string;
  attachments?: Attachment[];
  sources?: Source[];
}

export interface Conversation {
  id:string;
  title: string;
  messages: Message[];
}

export interface GoogleProfile {
  name: string;
  email: string;
  picture: string;
  sub: string;
}

export interface AppUser {
  profile: GoogleProfile;
  country: string;
  language: string;
  languageName?: string;
  premiumExpiresAt?: number; // Changed from isPremium
  currencySymbol?: string;
}