import { authClient } from "@/lib/auth-client"
import axios from "axios"
const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"

const axiosInstance = axios.create({ baseURL: BASE_URL, withCredentials: true })

export const handleGoogleSignIn = async () => {
  return await authClient.signIn.social({
    provider: "google",
    callbackURL: `${window.location.origin}/callback`,
  })
}
export const createRegistration = async (data: any) => {
  const res = await axiosInstance.post("/register", data)
  return res.data
}

export const updateRegistration = async (data: any) => {
  const res = await axiosInstance.put("/api/mutations/update-registration", data)
  return res.data
}

export const createUserQuery = async (data: any) => {
  const res = await axiosInstance.post("/api/mutations/create-user-query", data)
  return res.data
}

export const handleUploadFile = async ({ uploadUrl, file, onUploadProgress }: { uploadUrl: string, file: File, onUploadProgress?: (progressEvent: any) => void }) => {
  const res = await axios.put(uploadUrl, file, {
    headers: { "Content-Type": file.type },
    onUploadProgress,
  })
  return res.data
}

export const getSignedUrl = async ({ fileType, fileSize }: { fileType: string, fileSize: number }) => {
  const res = await axiosInstance.post("/api/mutations/get-upload-url", { fileType, fileSize })
  return res.data
}

export const getRegistration = async () => {
  const res = await axiosInstance.get("/register/ticket")
  return res.data
}

export const checkEligibility = async (rollNo: string) => {
  const res = await axiosInstance.post("/register/check-eligibility", { rollNo })
  return res.data
}
