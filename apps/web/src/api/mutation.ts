import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  handleGoogleSignIn,
  createRegistration,
  updateRegistration,
  createUserQuery,
  getSignedUrl,
  handleUploadFile,
  checkEligibility,
  sendAdminOtp,
  verifyAdminOtp,
  submitContactMessage,
  createBranch,
  updateBranch,
  deleteBranch,
  deleteRegistration,
  deleteEligibility,
  addEligibility,
  importEligibility,
  replyToContactMessage,
  clearImportErrors,
  saveTemplate,
  syncEmailReplies,
} from "@/services/fetch"

export const useCheckEligibilityMutation = () => {
  return useMutation({
    mutationFn: checkEligibility,
    onSuccess: () => {
      toast.success("Eligibility confirmed!")
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to check eligibility")
    },
  })
}

export const useGoogleSignInMutation = () => {
  return useMutation({
    mutationFn: handleGoogleSignIn,
    onError: () => {
      toast.error("Failed to sign in with Google")
    },
  })
}

export const useCreateRegistrationMutation = () => {
  return useMutation({
    mutationFn: createRegistration,
    onSuccess: () => {
      toast.success("Registration successful!")
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to register")
    },
  })
}

export const useUpdateRegistrationMutation = () => {
  return useMutation({
    mutationFn: updateRegistration,
    onSuccess: () => {
      toast.success("Registration updated successfully!")
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update registration")
    },
  })
}

export const useCreateUserQueryMutation = () => {
  return useMutation({
    mutationFn: createUserQuery,
    onSuccess: () => {
      toast.success("Query submitted successfully!")
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to submit query")
    },
  })
}

export const useGetPresignedUrlMutation = () => {
  return useMutation({
    mutationFn: getSignedUrl,
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to initiate file upload")
    },
  })
}

export const useUploadFileMutation = () => {
  return useMutation({
    mutationFn: handleUploadFile,
    onError: (error: any) => {
      toast.error(error?.message || "Failed to upload file")
    },
  })
}

export const useSendAdminOtpMutation = () => {
  return useMutation({
    mutationFn: sendAdminOtp,
    onSuccess: () => {
      toast.success("OTP sent to user's email")
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to send OTP")
    },
  })
}

export const useVerifyAdminOtpMutation = () => {
  return useMutation({
    mutationFn: verifyAdminOtp,
    onSuccess: () => {
      toast.success("User promoted to admin!")
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "OTP verification failed")
    },
  })
}

export const useSubmitContactMutation = () => {
  return useMutation({
    mutationFn: submitContactMessage,
    onSuccess: () => {
      toast.success("Message sent successfully!")
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to send message")
    },
  })
}

export const useReplyToContactMutation = () => {
  return useMutation({
    mutationFn: replyToContactMessage,
    onSuccess: () => {
      toast.success("Reply sent successfully!")
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to send reply")
    },
  })
}

// --- New Mutations for Admin Dashboard ---

export const useCreateBranchMutation = () => {
  return useMutation({
    mutationFn: createBranch,
    onSuccess: () => toast.success("Branch created successfully!"),
    onError: (error: any) => toast.error(error?.response?.data?.message || "Failed to create branch"),
  })
}

export const useUpdateBranchMutation = () => {
  return useMutation({
    mutationFn: updateBranch,
    onSuccess: () => toast.success("Branch updated successfully!"),
    onError: (error: any) => toast.error(error?.response?.data?.message || "Failed to update branch"),
  })
}

export const useDeleteBranchMutation = () => {
  return useMutation({
    mutationFn: deleteBranch,
    onSuccess: () => {
      toast.success("Branch deleted")
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete branch")
    },
  })
}

export const useClearImportErrorsMutation = () => {
  return useMutation({
    mutationFn: clearImportErrors,
    onSuccess: () => {
      toast.success("Trash cleared successfully")
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to clear trash")
    },
  })
}

export const useDeleteRegistrationMutation = () => {
  return useMutation({
    mutationFn: deleteRegistration,
    onSuccess: () => toast.success("Registration deleted successfully!"),
    onError: (error: any) => toast.error(error?.response?.data?.message || "Failed to delete registration"),
  })
}

export const useDeleteEligibilityMutation = () => {
  return useMutation({
    mutationFn: deleteEligibility,
    onSuccess: () => toast.success("Unregistered user deleted successfully!"),
    onError: (error: any) => toast.error(error?.response?.data?.message || "Failed to delete user"),
  })
}

export const useAddEligibilityMutation = () => {
  return useMutation({
    mutationFn: addEligibility,
    onSuccess: () => toast.success("User added successfully!"),
    onError: (error: any) => toast.error(error?.response?.data?.message || "Failed to add user"),
  })
}

export const useImportEligibilityMutation = () => {
  return useMutation({
    mutationFn: importEligibility,
    onSuccess: (data) => toast.success(`Imported ${data.count} users successfully!`),
    onError: (error: any) => toast.error(error?.response?.data?.message || "Failed to import users"),
  })
}

export const useSaveTemplateMutation = () => {
  return useMutation({
    mutationFn: saveTemplate,
    onSuccess: () => toast.success("Template saved successfully!"),
    onError: (error: any) => toast.error(error?.response?.data?.message || "Failed to save template"),
  })
}

export const useSyncEmailRepliesMutation = () => {
  return useMutation({
    mutationFn: syncEmailReplies,
    onError: (error: any) => toast.error(error?.response?.data?.message || "Failed to sync emails"),
  })
}
