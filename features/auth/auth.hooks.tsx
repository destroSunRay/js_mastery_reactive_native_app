/**
 * Authentication Hooks
 * React Query hooks for authentication operations with better-auth
 */

import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { usePostHog } from "posthog-react-native";
import { useEffect, useState } from "react";
import {
  AuthService,
  OrganizationService,
  SubscriptionService,
} from "./auth.services";
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
  UserPreferences,
} from "./auth.types";

// Query keys for React Query
export const authQueryKeys = {
  all: ["auth"] as const,
  user: () => [...authQueryKeys.all, "user"] as const,
  session: () => [...authQueryKeys.all, "session"] as const,
  organizations: () => [...authQueryKeys.all, "organizations"] as const,
  organization: (id: string) => [...authQueryKeys.organizations(), id] as const,
  members: (organizationId: string) =>
    [...authQueryKeys.organization(organizationId), "members"] as const,
  invitations: (organizationId: string) =>
    [...authQueryKeys.organization(organizationId), "invitations"] as const,
  subscription: () => [...authQueryKeys.user(), "subscription"] as const,
} as const;

/**
 * Get current session and user
 */
export const useAuth = () => {
  return useQuery({
    queryKey: authQueryKeys.session(),
    queryFn: () => AuthService.getSession(),
    select: (data) => data?.data || null, // Return full response for flexibility
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Get current user only
 */
export const useUser = () => {
  return useSuspenseQuery({
    queryKey: authQueryKeys.session(),
    queryFn: () => AuthService.getSession(),
    select: (response) => {
      // const { data: response } = result;
      const user = response?.data?.user || null;
      const session = response?.data?.session || null;
      const userPreferences = user?.preferences
        ? (JSON.parse(user.preferences) as UserPreferences)
        : null;
      return {
        user,
        isAuthenticated: !!user,
        session,
        userPreferences,
      };
    },
  });
};

/**
 * Sign in with email and password
 */
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      AuthService.signInWithEmail(credentials),
    onSuccess: (data) => {
      if (data?.error?.code === "EMAIL_NOT_VERIFIED") {
        console.error("Email not verified. Please check your inbox.", {
          duration: 5000,
        });
        return;
      }
      // Update the session cache
      queryClient.setQueryData(authQueryKeys.session(), data);
      console.log("Successfully signed in!");
    },
    onError: (error: Error) => {
      console.error(error.message || "Failed to sign in");
    },
  });
};

/**
 * Sign up with email and password
 */
export const useSignUp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: SignUpCredentials) =>
      AuthService.signUpWithEmail(credentials),
    onSuccess: (data) => {
      // Update the session cache
      queryClient.setQueryData(authQueryKeys.session(), data);
      console.log(
        "Account created successfully! Please check your email to verify your account.",
      );
    },
    onError: (error: Error) => {
      console.error(error.message || "Failed to sign up");
    },
  });
};

/**
 * Sign out current user
 */
export const useLogout = () => {
  const queryClient = useQueryClient();
  const posthog = usePostHog();
  const router = useRouter();

  return useMutation({
    mutationFn: () => AuthService.signOut(),
    onSuccess: () => {
      posthog.capture("user_logged_out");
      posthog?.reset();
      // Clear all auth-related cache
      queryClient.removeQueries({ queryKey: authQueryKeys.all });
      queryClient.setQueryData(authQueryKeys.session(), null);
      router.replace("/login");
    },
    onError: (error: Error) => {
      console.error(error.message || "Failed to sign out");
    },
  });
};

/**
 * Send password reset email
 */
export const useSendPasswordReset = () => {
  return useMutation({
    mutationFn: (data: ResetPasswordData) =>
      AuthService.sendPasswordReset(data),
    onSuccess: () => {
      console.log("Password reset email sent! Check your inbox.");
    },
    onError: (error: Error) => {
      console.error(error.message || "Failed to send password reset email");
    },
  });
};

/**
 * Reset password with token
 */
export const useResetPassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ChangePasswordData) => AuthService.resetPassword(data),
    onSuccess: () => {
      // Clear session as user needs to sign in again
      queryClient.setQueryData(authQueryKeys.session(), null);
      console.log(
        "Password reset successfully! Please sign in with your new password.",
      );
    },
    onError: (error: Error) => {
      console.error(error.message || "Failed to reset password");
    },
  });
};

/**
 * Verify email with token
 */
export const useVerifyEmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) => AuthService.verifyEmail(token),
    onSuccess: () => {
      // Refetch session to get updated user data
      queryClient.invalidateQueries({ queryKey: authQueryKeys.session() });
      console.log("Email verified successfully!");
    },
    onError: (error: Error) => {
      console.error(error.message || "Failed to verify email");
    },
  });
};

/**
 * Update user profile
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileData) => AuthService.updateProfile(data),
    onSuccess: () => {
      // Refetch session to get updated user data
      queryClient.invalidateQueries({ queryKey: authQueryKeys.session() });
    },
    onError: (error: Error) => {
      console.error(error.message || "Failed to update profile");
    },
  });
};

/**
 * Change password for authenticated users who already have a password
 */
export const useChangePassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      currentPassword: string;
      newPassword: string;
      revokeOtherSessions?: boolean;
    }) => AuthService.changePassword(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authQueryKeys.session() });
      console.log("Password changed successfully!");
    },
    onError: (error: Error) => {
      console.error(error.message || "Failed to change password");
    },
  });
};

/**
 * List all linked accounts for the current user
 */
export const useListAccounts = () => {
  return useQuery({
    queryKey: [...authQueryKeys.user(), "accounts"],
    queryFn: () => AuthService.listAccounts(),
  });
};

/**
 * Link social account
 */
export const useLinkAccount = () => {
  const queryClient = useQueryClient();
  const [localProvider, setLocalProvider] = useState<SocialProvider | null>(
    null,
  );

  return useMutation({
    mutationFn: ({
      provider,
      callbackURL = window.location.origin + "/dashboard",
    }: {
      provider: SocialProvider;
      callbackURL?: string;
    }) => {
      setLocalProvider(provider);
      return AuthService.linkAccount(provider, callbackURL);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authQueryKeys.session() });
      console.log(`Redirecting to ${localProvider} account!`);
    },
    onError: (error: Error) => {
      console.error(error.message || "Failed to link account");
    },
  });
};

/**
 * Get user sessions
 */
export const useSessions = () => {
  return useQuery({
    queryKey: [...authQueryKeys.session(), "all"],
    queryFn: () => AuthService.getSessions(),
    // enabled: false, // Only fetch when explicitly called
  });
};

/**
 * Revoke a session
 */
export const useRevokeSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) => AuthService.revokeSession(token),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...authQueryKeys.session(), "all"],
      });
      console.log("Session revoked successfully");
    },
    onError: (error: Error) => {
      console.error(error.message || "Failed to revoke session");
    },
  });
};

/**
 * Revoke all other sessions
 */
export const useRevokeOtherSessions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => AuthService.revokeOtherSessions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...authQueryKeys.session(), "all"],
      });
      console.log("All other sessions revoked successfully");
    },
    onError: (error: Error) => {
      console.error(error.message || "Failed to revoke other sessions");
    },
  });
};

// Organization Hooks

/**
 * Get user's organizations
 */
export const useOrganizations = () => {
  return useQuery({
    queryKey: authQueryKeys.organizations(),
    queryFn: () => OrganizationService.getUserOrganizations(),
  });
};

/**
 * Create a new organization
 */
export const useCreateOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrganizationData) =>
      OrganizationService.createOrganization(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: authQueryKeys.organizations(),
      });
      console.log("Organization created successfully!");
    },
    onError: (error: Error) => {
      console.error(error.message || "Failed to create organization");
    },
  });
};

/**
 * Update organization
 */
export const useUpdateOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      organizationId,
      data,
    }: {
      organizationId: string;
      data: UpdateOrganizationData;
    }) => OrganizationService.updateOrganization(organizationId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: authQueryKeys.organizations(),
      });
      queryClient.invalidateQueries({
        queryKey: authQueryKeys.organization(variables.organizationId),
      });
      console.log("Organization updated successfully!");
    },
    onError: (error: Error) => {
      console.error(error.message || "Failed to update organization");
    },
  });
};

/**
 * Invite member to organization
 */
export const useInviteMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      organizationId,
      data,
    }: {
      organizationId: string;
      data: InviteMemberData;
    }) => OrganizationService.inviteMember(organizationId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: authQueryKeys.invitations(variables.organizationId),
      });
      console.log("Member invited successfully!");
    },
    onError: (error: Error) => {
      console.error(error.message || "Failed to invite member");
    },
  });
};

/**
 * Set active organization for the session
 */
export const useSetActiveOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (organizationId: string) =>
      OrganizationService.setActiveOrganization(organizationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: authQueryKeys.session(),
      });
      queryClient.invalidateQueries({
        queryKey: authQueryKeys.user(),
      });
    },
    onError: (error: Error) => {
      console.error(error.message || "Failed to switch organization");
    },
  });
};

/**
 * Get full organization details (members, invitations)
 */
export const useFullOrganization = (organizationId: string) => {
  return useQuery({
    queryKey: authQueryKeys.organization(organizationId),
    queryFn: () => OrganizationService.getFullOrganization(organizationId),
    enabled: !!organizationId,
  });
};

/**
 * Accept an organization invitation
 */
export const useAcceptInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId: string) =>
      OrganizationService.acceptInvitation(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: authQueryKeys.organizations(),
      });
      console.log("Invitation accepted!");
    },
    onError: (error: Error) => {
      console.error(error.message || "Failed to accept invitation");
    },
  });
};

/**
 * Reject an organization invitation
 */
export const useRejectInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId: string) =>
      OrganizationService.rejectInvitation(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: authQueryKeys.organizations(),
      });
      console.log("Invitation rejected");
    },
    onError: (error: Error) => {
      console.error(error.message || "Failed to reject invitation");
    },
  });
};

/**
 * Remove a member from an organization
 */
export const useRemoveMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      organizationId,
      memberIdOrUserId,
    }: {
      organizationId: string;
      memberIdOrUserId: string;
    }) => OrganizationService.removeMember(organizationId, memberIdOrUserId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: authQueryKeys.organization(variables.organizationId),
      });
      queryClient.invalidateQueries({
        queryKey: authQueryKeys.members(variables.organizationId),
      });
      console.log("Member removed");
    },
    onError: (error: Error) => {
      console.error(error.message || "Failed to remove member");
    },
  });
};

/**
 * Delete an organization
 */
export const useDeleteOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (organizationId: string) =>
      OrganizationService.deleteOrganization(organizationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: authQueryKeys.organizations(),
      });
      console.log("Group deleted");
    },
    onError: (error: Error) => {
      console.error(error.message || "Failed to delete group");
    },
  });
};

/**
 * Subscription Hooks
 */

/**
 * Upgrade user subscription
 */
export const useUpgradeSubscription = () => {
  return useMutation({
    mutationFn: (data: {
      planName: string;
      subscriptionId?: string;
      referenceId?: string;
      returnUrl?: string;
      successUrl?: string;
      cancelUrl?: string;
    }) => SubscriptionService.upgradeSubscription(data),
    onSuccess: (data) => {
      // Redirect to checkout URL
      if (data?.data?.url) {
        window.location.href = data.data.url;
      }
      console.log("Redirecting to subscription checkout...");
    },
    onError: (error: Error) => {
      console.error(error.message || "Failed to upgrade subscription");
    },
    meta: {
      invalidateQueries: [authQueryKeys.subscription()],
    },
  });
};

export const useSuspenseGetSubscriptions = () => {
  const {
    data: { user },
  } = useUser();

  return useSuspenseQuery({
    queryKey: authQueryKeys.subscription(),
    queryFn: () => SubscriptionService.listSubscriptions(user?.id),
  });
};

export const useGetSubscriptions = () => {
  const { data, error } = useSuspenseGetSubscriptions();
  if (error) {
    return [];
  }
  return data;
};

export const useGetAciveSubscription = () => {
  const subscriptions = useGetSubscriptions();
  const subscriptionData = Array.isArray(subscriptions)
    ? subscriptions
    : subscriptions?.data || [];
  return (
    subscriptionData.find(
      (sub) => sub.status === "active" || sub.status === "trialing",
    ) || null
  );
};

export const useCancelSubscription = () => {
  return useMutation({
    mutationFn: ({ subscriptionId }: { subscriptionId: string }) =>
      SubscriptionService.cancelSubscription(subscriptionId),
    meta: {
      invalidateQueries: [authQueryKeys.all],
    },
  });
};

export const useRestoreSubscription = () => {
  return useMutation({
    mutationFn: ({ subscriptionId }: { subscriptionId: string }) =>
      SubscriptionService.restoreSubscription(subscriptionId),
    meta: {
      invalidateQueries: [authQueryKeys.all],
    },
  });
};

export const useIdentifyUser = () => {
  const posthog = usePostHog();
  const {
    data: { user, isAuthenticated },
  } = useUser();
  const userId = user?.id || null;
  const activeSubscription = useGetAciveSubscription();

  useEffect(() => {
    if (isAuthenticated && userId) {
      posthog?.identify(userId, {
        hasActiveSubscription: !!activeSubscription,
        subscriptionPlan: activeSubscription?.plan || null,
      });
    } else {
      posthog?.reset();
    }
  }, [isAuthenticated, userId, user, activeSubscription, posthog]);
};
