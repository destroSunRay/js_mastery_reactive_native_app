import authClient from './auth.config';

export type User = typeof authClient.$Infer.Session.user & {
  preferences: UserPreferences;
};
export type Session = typeof authClient.$Infer.Session;

export type Organization = typeof authClient.$Infer.Organization;
export type Member = typeof authClient.$Infer.Member;
export type Invitation = typeof authClient.$Infer.Invitation;
export type Team = typeof authClient.$Infer.Team;
export type ActiveOrganization = typeof authClient.$Infer.ActiveOrganization;

// User preferences structure
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    push: boolean;
    budgetAlerts: boolean;
    goalReminders: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private';
    transactionVisibility: 'public' | 'private';
  };
}

// Auth form types
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignUpCredentials {
  name: string;
  email: string;
  password: string;
  image?: string;
}

export interface ResetPasswordData {
  email: string;
}

export interface ChangePasswordData {
  token: string;
  password: string;
}

export interface ChangePasswordWithCurrentData {
  currentPassword: string;
  newPassword: string;
  revokeOtherSessions?: boolean;
}

export interface UpdateProfileData {
  name?: string;
  image?: string;
  timezone?: string;
  locale?: string;
  currency?: string;
  preferences?: Partial<UserPreferences>;
}

// Organization form types
export interface CreateOrganizationData {
  name: string;
  slug: string;
  logo?: string;
}

export interface UpdateOrganizationData {
  name?: string;
  slug?: string;
  logo?: string;
}

export interface InviteMemberData {
  email: string;
  role: 'admin' | 'member';
}

// Social provider types
export type SocialProvider = 'google' | 'github';
