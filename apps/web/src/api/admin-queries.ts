import { useQuery } from "@tanstack/react-query"
import { getDashboardStats, getOverviewStats, getBranchData, getAllUsers, getContactMessages,  getImportErrors } from "../services/fetch"

export interface RegisteredAlumni {
  id: string
  student_name: string
  hall_ticket_number: string
  branch: string
  mobile_number: string
  will_attend: boolean
  guest_count: string
  email: string
  createdAt: string
}

export interface UnregisteredAlumni {
  id: number
  studentName: string
  rollNumber: string
  branch: string
}

export interface DashboardStatsResponse {
  registered: RegisteredAlumni[]
  unregistered: UnregisteredAlumni[]
}

export interface OverviewStats {
  branches: Record<string, { registered: number; unregistered: number; total: number }>
  totalRegistered: number
  totalEligible: number
  totalUnregistered: number
  totalUsers: number
  totalLogins: number
}

export interface UserRecord {
  id: string
  name: string
  email: string
  image: string | null
  role: string | null
  createdAt: string
}

export interface ContactMessage {
  id: string
  userId: string
  email: string
  name: string
  message: string
  isReplied: boolean
  createdAt: string
}

export const useAdminDashboardStatsQuery = () => {
  return useQuery<DashboardStatsResponse, Error>({
    queryKey: ["admin", "dashboardStats"],
    queryFn: async () => {
      const data = await getDashboardStats()
      return data
    },
    refetchInterval: 10000,
  })
}

export const useOverviewStatsQuery = () => {
  return useQuery<OverviewStats, Error>({
    queryKey: ["admin", "overview"],
    queryFn: getOverviewStats,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
    refetchInterval: 30000,
  })
}

export const useBranchDataQuery = (branch: string | null, type: "registered" | "unregistered") => {
  return useQuery({
    queryKey: ["admin", "branchData", branch, type],
    queryFn: () => getBranchData(branch!, type),
    enabled: !!branch,
    staleTime: 60000,
    gcTime: 5 * 60 * 1000,
  })
}

export const useAllUsersQuery = () => {
  return useQuery<UserRecord[], Error>({
    queryKey: ["admin", "users"],
    queryFn: getAllUsers,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
  })
}

export const useContactMessagesQuery = () => {
  return useQuery<ContactMessage[], Error>({
    queryKey: ["admin", "contactMessages"],
    queryFn: getContactMessages,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
  })
}

export interface BranchRecord {
  id: string
  name: string
  venue: string
  date: string
  time: string
  createdAt: string
}

export const useBranchesQuery = () => {
  return useQuery<BranchRecord[], Error>({
    queryKey: ["admin", "branches"],
    queryFn: async () => {
      const { getBranches } = await import("../services/fetch");
      return getBranches();
    },
    staleTime: 60000,
  })
}

export const useImportErrorsQuery = () => {
  return useQuery<any[]>({
    queryKey: ["admin", "importErrors"],
    queryFn: getImportErrors,
  })
}

export const useTemplateQuery = () => {
  return useQuery<any>({
    queryKey: ["admin", "template"],
    queryFn: async () => {
      const { getTemplate } = await import("../services/fetch");
      return getTemplate();
    },
    staleTime: 60000,
  })
}
