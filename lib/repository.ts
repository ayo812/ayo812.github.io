import * as mockRepository from "@/lib/mock-repository";
import * as supabaseRepository from "@/lib/supabase-repository";
import { hasServiceRoleSupabaseConfig } from "@/lib/supabase/client";
import { type HomeState, type PlayerIdentity } from "@/lib/types";

const useSupabase = () => hasServiceRoleSupabaseConfig();

export const repository = {
  async createSubmissionIntent(...args: Parameters<typeof mockRepository.createSubmissionIntent>) {
    return useSupabase() ? supabaseRepository.createSubmissionIntent(...args) : mockRepository.createSubmissionIntent(...args);
  },
  async finalizeSubmission(...args: Parameters<typeof mockRepository.finalizeSubmission>) {
    return useSupabase() ? supabaseRepository.finalizeSubmission(...args) : mockRepository.finalizeSubmission(...args);
  },
  async getAdminDashboard() {
    return useSupabase() ? supabaseRepository.getAdminDashboard() : mockRepository.getAdminDashboard();
  },
  async getCurrentHunt(previewState?: HomeState) {
    if (previewState && process.env.NODE_ENV !== "production") {
      return mockRepository.getCurrentHunt(previewState);
    }
    return useSupabase() ? supabaseRepository.getCurrentHunt() : mockRepository.getCurrentHunt(previewState);
  },
  async getHistory(identity: PlayerIdentity) {
    return useSupabase() ? supabaseRepository.getHistory(identity) : mockRepository.getHistory(identity);
  },
  async getHomePageData(identity: PlayerIdentity, previewState?: HomeState) {
    if (previewState && process.env.NODE_ENV !== "production") {
      return mockRepository.getHomePageData(identity, previewState);
    }
    return useSupabase() ? supabaseRepository.getHomePageData(identity) : mockRepository.getHomePageData(identity, previewState);
  },
  async getLeaderboardData(...args: Parameters<typeof mockRepository.getLeaderboardData>) {
    return useSupabase() ? supabaseRepository.getLeaderboardData(...args) : mockRepository.getLeaderboardData(...args);
  },
  async getSubmissionSummary() {
    return useSupabase() ? supabaseRepository.getSubmissionSummary() : mockRepository.getSubmissionSummary();
  },
  async createChallengeSuggestions(count = 3) {
    return useSupabase() ? supabaseRepository.createChallengeSuggestions(count) : mockRepository.createChallengeSuggestions(count);
  },
  async listReminderRecipients() {
    return useSupabase() ? supabaseRepository.listReminderRecipients() : mockRepository.listReminderRecipients();
  },
  async publishResults() {
    return useSupabase() ? supabaseRepository.publishResults() : mockRepository.publishResults();
  },
  async reviewSubmission(...args: Parameters<typeof mockRepository.reviewSubmission>) {
    return useSupabase() ? supabaseRepository.reviewSubmission(...args) : mockRepository.reviewSubmission(...args);
  },
  async setReminder(identityId: string, enabled: boolean, email?: string) {
    return useSupabase() ? supabaseRepository.setReminder(identityId, enabled, email) : mockRepository.setReminder(identityId, enabled);
  },
  async updateHunt(...args: Parameters<typeof mockRepository.updateHunt>) {
    const [input] = args;
    if (input.previewState && process.env.NODE_ENV !== "production") {
      return mockRepository.updateHunt(...args);
    }
    return useSupabase() ? supabaseRepository.updateHunt(...args) : mockRepository.updateHunt(...args);
  }
};