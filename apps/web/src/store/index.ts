import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// --- Auth Store ---
interface User {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
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
);

// --- Registration Store ---
interface RegistrationState {
  step: number;
  rollNo: string;
  photoUrl: string;
  photoPreview: string;
  mobileNumber: string;
  branch: string;
  willAttend: "Yes" | "No";
  guests: number;
  
  setField: <K extends keyof Omit<RegistrationState, "setField" | "reset">>(field: K, value: RegistrationState[K]) => void;
  reset: () => void;
}

const initialRegistrationState = {
  step: 1,
  rollNo: "",
  photoUrl: "",
  photoPreview: "",
  mobileNumber: "",
  branch: "",
  willAttend: "Yes" as const,
  guests: 0,
};

export const useRegistrationStore = create<RegistrationState>()(
  persist(
    (set) => ({
      ...initialRegistrationState,
      setField: (field, value) => set((state) => ({ ...state, [field]: value })),
      reset: () => set(initialRegistrationState),
    }),
    {
      name: 'registration-storage',
    }
  )
);
