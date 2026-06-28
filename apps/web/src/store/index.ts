import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id?: string
  name?: string | null
  email?: string | null
  image?: string | null
}

interface AuthState {
  user: User | null
  isLoggedIn: boolean
  setUser: (user: User | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoggedIn: false,
      setUser: (user) => set({ user, isLoggedIn: !!user }),
      logout: () => set({ user: null, isLoggedIn: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
)

interface TicketData {
  id: string
  student_name: string
  hall_ticket_number: string
  branch: string
  will_attend: boolean
  guest_count: string
  photo: string
}

interface TicketState {
  hasTicket: boolean
  ticket: TicketData | null
  setTicket: (ticket: TicketData | null) => void
  clearTicket: () => void
}

export const useTicketStore = create<TicketState>()(
  persist(
    (set) => ({
      hasTicket: false,
      ticket: null,
      setTicket: (ticket) => set({ ticket, hasTicket: !!ticket }),
      clearTicket: () => set({ ticket: null, hasTicket: false }),
    }),
    {
      name: 'ticket-storage',
    }
  )
)

interface RegistrationState {
  step: number
  rollNo: string
  photoUrl: string
  photoPreview: string
  mobileNumber: string
  branch: string
  studentName: string
  willAttend: "Yes" | "No"
  guests: number

  setField: <K extends keyof Omit<RegistrationState, "setField" | "reset">>(field: K, value: RegistrationState[K]) => void
  reset: () => void
}

const initialRegistrationState = {
  step: 1,
  rollNo: "",
  photoUrl: "",
  photoPreview: "",
  mobileNumber: "",
  branch: "",
  studentName: "",
  willAttend: "Yes" as const,
  guests: 0,
}

export const useRegistrationStore = create<RegistrationState>()((set) => ({
  ...initialRegistrationState,
  setField: (field, value) => set((state) => ({ ...state, [field]: value })),
  reset: () => set(initialRegistrationState),
}))
