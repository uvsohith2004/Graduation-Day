import { authClient } from "@/lib/auth-client"
import axios from "axios"
const BASE_URL = "/api-proxy"

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

export const getDashboardStats = async () => {
  const res = await axiosInstance.get("/admin/dashboard-stats")
  return res.data
}

export const getOverviewStats = async () => {
  const res = await axiosInstance.get("/admin/overview")
  return res.data
}

export const getBranchData = async (branch: string, type: "registered" | "unregistered") => {
  const res = await axiosInstance.get(`/admin/branch-data?branch=${encodeURIComponent(branch)}&type=${type}`)
  return res.data
}

export const getAllUsers = async () => {
  const res = await axiosInstance.get("/admin/users")
  return res.data
}

export const sendAdminOtp = async (targetUserId: string) => {
  const res = await axiosInstance.post("/admin/send-otp", { targetUserId })
  return res.data
}

export const verifyAdminOtp = async ({ targetUserId, code }: { targetUserId: string; code: string }) => {
  const res = await axiosInstance.post("/admin/verify-otp", { targetUserId, code })
  return res.data
}

export const submitContactMessage = async (message: string) => {
  const res = await axiosInstance.post("/contact", { message })
  return res.data
}

export const getContactMessages = async () => {
  const res = await axiosInstance.get("/admin/contact-messages")
  return res.data
}

export const replyToContactMessage = async (data: { messageId: string, subject: string, body: string }) => {
  const res = await axiosInstance.post("/admin/contact-messages/reply", data)
  return res.data
}

// --- New API functions for Branches and Registration Management ---

export const getPublicBranches = async () => {
  const res = await axiosInstance.get("/public/branches")
  return res.data
}

export const getBranches = async () => {
  const res = await axiosInstance.get("/admin/branches")
  return res.data
}

export const createBranch = async (data: { name: string; venue: string; date: string; time: string }) => {
  const res = await axiosInstance.post("/admin/branches", data)
  return res.data
}

export const updateBranch = async (data: { id: string, payload: { name: string; venue: string; date: string; time: string } }) => {
  const res = await axiosInstance.put(`/admin/branches/${data.id}`, data.payload)
  return res.data
}

export const deleteBranch = async (id: string) => {
  const res = await axiosInstance.delete(`/admin/branches/${id}`)
  return res.data
}

export const deleteRegistration = async (id: string) => {
  const res = await axiosInstance.delete(`/admin/registration/${id}`)
  return res.data
}

export const deleteEligibility = async (rollNo: string) => {
  const res = await axiosInstance.delete(`/admin/eligibility/${rollNo}`)
  return res.data
}

export const addEligibility = async (data: { rollNumber: string, studentName: string, branch: string }) => {
  const res = await axiosInstance.post("/admin/eligibility", data)
  return res.data
}

export const importEligibility = async (data: { rows: any[], branch: string }) => {
  const res = await axiosInstance.post("/admin/eligibility/import", data)
  return res.data
}

export const getImportErrors = async () => {
  const res = await axiosInstance.get("/admin/import-errors")
  return res.data
}

export const clearImportErrors = async () => {
  const res = await axiosInstance.delete("/admin/import-errors")
  return res.data
}

export const getTemplate = async () => {
  const res = await axiosInstance.get("/public/template")
  return res.data
}

export const saveTemplate = async (data: { bgImageUrl: string; config: any }) => {
  const res = await axiosInstance.post("/admin/template", data)
  return res.data
}
