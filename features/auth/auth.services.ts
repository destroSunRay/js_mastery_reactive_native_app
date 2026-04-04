/**
 * Authentication Services
 * Better-auth client integration for authentication operations
 */

import * as Linking from "expo-linking";

import { FRONTEND_URL } from "@/utils/consts/env";
import client from "./auth.config";

import type {
  ChangePasswordData,
  CreateOrganizationData,
  InviteMemberData,
  LoginCredentials,
  ResetPasswordData,
  SignUpCredentials,
  SocialProvider,
  UpdateOrganizationData,
  UpdateProfileData,
} from "./auth.types";

/**
 * Authentication Service Class
 * Provides methods for all auth-related operations
 */
export class AuthService {
  /**
   * Sign in with email and password
   */
  static async signInWithEmail(credentials: LoginCredentials) {
    return await client.signIn.email({
      email: credentials.email,
      password: credentials.password,
      rememberMe: credentials.rememberMe,
    });
  }

  /**
   * Sign in with social provider
   */
  static async signInWithSocial(
    provider: SocialProvider,
    callbackURL?: string,
  ) {
    return client.signIn.social({
      provider,
      callbackURL: callbackURL || Linking.createURL("/dashboard"),
    });
  }

  /**
   * Sign up with email and password
   */
  static async signUpWithEmail(credentials: SignUpCredentials) {
    return await client.signUp.email({
      name: credentials.name,
      email: credentials.email,
      password: credentials.password,
      image: credentials.image,
    });
  }

  /**
   * Sign out current user
   */
  static async signOut() {
    return await client.signOut();
  }

  /**
   * Get current session and user
   */
  static async getSession() {
    return await client.getSession();
  }

  /**
   * Send password reset email
   */
  static async sendPasswordReset(data: ResetPasswordData) {
    return await client.requestPasswordReset({
      email: data.email,
      redirectTo: `${FRONTEND_URL}/login`,
    });
  }

  /**
   * Reset password with token
   */
  static async resetPassword(data: ChangePasswordData) {
    return await client.resetPassword({
      token: data.token,
      newPassword: data.password,
    });
  }

  /**
   * Verify email with token
   */
  static async verifyEmail(token: string) {
    return await client.verifyEmail({
      query: {
        token,
      },
    });
  }

  /**
   * Update user profile
   */
  static async updateProfile(data: UpdateProfileData) {
    // Ensure preferences is null or undefined to match expected type
    const { preferences, ...rest } = data;
    return await client.updateUser({
      ...rest,
      preferences: JSON.stringify(preferences),
    });
  }

  /**
   * Change password for users who already have a password
   */
  static async changePassword(data: {
    currentPassword: string;
    newPassword: string;
    revokeOtherSessions?: boolean;
  }) {
    return await client.changePassword({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
      revokeOtherSessions: data.revokeOtherSessions ?? true,
    });
  }

  /**
   * List all linked accounts for the current user
   */
  static async listAccounts() {
    return await client.listAccounts();
  }
  /**
   * Link social account to current user
   */
  static async linkAccount(
    provider: SocialProvider,
    callbackURL: string = Linking.createURL("/dashboard"),
  ) {
    return client.signIn.social(
      {
        provider,
        callbackURL,
      },
      // {
      //   onError: (error) => {
      //     console.error('Error linking account:', error);
      //     toast.error('Failed to link account. Please try again.');
      //   },
      //   onSuccess: () => {
      //     toast.success('Account linked successfully!');
      //   },
      // }
    );
  }

  /**
   * Get user's sessions
   */
  static async getSessions() {
    return await client.listSessions();
  }

  /**
   * Revoke a specific session
   */
  static async revokeSession(token: string) {
    return await client.revokeSession({
      token,
    });
  }

  /**
   * Revoke all other sessions (keep current)
   */
  static async revokeOtherSessions() {
    return await client.revokeOtherSessions();
  }
}

/**
 * Organization Service Class (Simplified for now)
 * Note: Organization methods depend on the specific better-auth organization plugin implementation
 */
export class OrganizationService {
  /**
   * Create a new organization
   * Note: This method signature may need adjustment based on your backend implementation
   */
  static async createOrganization(data: CreateOrganizationData) {
    // This is a placeholder - you'll need to implement based on your backend API
    const response = await client.organization.create({
      name: data.name,
      slug: data.slug,
      logo: data.logo,
    });
    // If the response has a 'data' property, return it; otherwise, return the whole response
    return response.data ? response.data : response;
  }

  /**
   * Get user's organizations
   */
  static async getUserOrganizations() {
    return await client.organization.list();
  }

  /**
   * Update organization
   */
  static async updateOrganization(
    organizationId: string,
    data: UpdateOrganizationData,
  ) {
    const response = await client.organization.update({
      organizationId,
      data: {
        name: data.name,
        slug: data.slug,
        logo: data.logo,
      },
    });

    return response.data ? response.data : response;
  }

  /**
   * Invite member to organization
   */
  static async inviteMember(organizationId: string, data: InviteMemberData) {
    return await client.organization.inviteMember({
      organizationId,
      email: data.email,
      role: data.role,
    });
  }

  /**
   * Set the active organization for the current session
   */
  static async setActiveOrganization(organizationId: string) {
    return await client.organization.setActive({
      organizationId,
    });
  }

  /**
   * Get full organization details (members, invitations, etc.)
   */
  static async getFullOrganization(organizationId: string) {
    return await client.organization.getFullOrganization({
      query: { organizationId },
    });
  }

  /**
   * Accept an organization invitation
   */
  static async acceptInvitation(invitationId: string) {
    return await client.organization.acceptInvitation({
      invitationId,
    });
  }

  /**
   * Reject an organization invitation
   */
  static async rejectInvitation(invitationId: string) {
    return await client.organization.rejectInvitation({
      invitationId,
    });
  }

  /**
   * Remove a member from an organization
   */
  static async removeMember(organizationId: string, memberIdOrEmail: string) {
    return await client.organization.removeMember({
      organizationId,
      memberIdOrEmail,
    });
  }

  /**
   * Delete an organization
   */
  static async deleteOrganization(organizationId: string) {
    return await client.organization.delete({
      organizationId,
    });
  }
}

export class SubscriptionService {
  /**
   * Get current user's subscription
   */
  static async upgradeSubscription({
    planName,
    subscriptionId,
    referenceId,
    successUrl,
    cancelUrl,
  }: {
    planName: string;
    subscriptionId?: string;
    referenceId?: string;
    successUrl?: string;
    cancelUrl?: string;
  }) {
    return await client.subscription.upgrade({
      plan: planName,
      subscriptionId: subscriptionId,
      referenceId: referenceId,
      returnUrl: `${FRONTEND_URL}/settings/subscriptions`,
      successUrl: successUrl || `${FRONTEND_URL}/settings/subscriptions`,
      cancelUrl: cancelUrl || `${FRONTEND_URL}/settings/subscriptions`,
    });
  }

  static async listSubscriptions(referenceId?: string) {
    return await client.subscription.list({
      query: {
        referenceId,
      },
    });
  }

  static async cancelSubscription(
    subscriptionId: string,
    returnUrl: string = `${FRONTEND_URL}/settings/subscriptions`,
  ) {
    return await client.subscription.cancel({
      subscriptionId,
      returnUrl,
    });
  }

  static async openBillingPortal(
    returnUrl: string = `${FRONTEND_URL}/settings/subscriptions`,
  ) {
    return await client.subscription.billingPortal({
      returnUrl,
    });
  }

  static async restoreSubscription(subscriptionId: string) {
    return await client.subscription.restore({
      subscriptionId,
    });
  }
}

// Export the auth client for direct usage in hooks
export const authClient = client;
