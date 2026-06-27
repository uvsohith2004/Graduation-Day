import { useQuery } from "@tanstack/react-query"
import { getDashboardStats } from "../services/fetch"

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

export const useAdminDashboardStatsQuery = () => {
  return useQuery<DashboardStatsResponse, Error>({
    queryKey: ["admin", "dashboardStats"],
    queryFn: async () => {
      const data = await getDashboardStats()
      return data
    },
    refetchInterval:10000,
  })
}
