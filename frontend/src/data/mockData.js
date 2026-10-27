/**
 * Re-exports dataset from src/services/mockApi.js for backwards compatibility
 */
import {
  initialStudents,
  initialJobs,
  initialApplications,
  initialInterviews,
  initialOffers,
  initialCompanies,
  initialAnalytics,
} from '../services/mockApi.js';

export const mockStudents = initialStudents;
export const mockJobs = initialJobs;
export const mockApplications = initialApplications;
export const mockInterviews = initialInterviews;
export const mockPlacements = initialOffers;
export const mockCompanies = initialCompanies;
export const mockAnalytics = initialAnalytics;
