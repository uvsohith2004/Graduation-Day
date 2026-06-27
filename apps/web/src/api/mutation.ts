import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  handleGoogleSignIn, 
  createRegistration, 
  updateRegistration, 
  createUserQuery,
  getSignedUrl,
  handleUploadFile,
  checkEligibility
} from "@/services/fetch";

export const useCheckEligibilityMutation = () => {
  return useMutation({
    mutationFn: checkEligibility,
    onSuccess: () => {
      
      toast.success("Eligibility confirmed!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to check eligibility");
    }
  });
};

export const useGoogleSignInMutation = () => {
  return useMutation({
    mutationFn: handleGoogleSignIn,
    onError: () => {
      toast.error("Failed to sign in with Google");
    }
  });
};

export const useCreateRegistrationMutation = () => {
  return useMutation({
    mutationFn: createRegistration,
    onSuccess: () => {
      toast.success("Registration successful!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to register");
    }
  });
};

export const useUpdateRegistrationMutation = () => {
  return useMutation({
    mutationFn: updateRegistration,
    onSuccess: () => {
      toast.success("Registration updated successfully!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update registration");
    }
  });
};

export const useCreateUserQueryMutation = () => {
  return useMutation({
    mutationFn: createUserQuery,
    onSuccess: () => {
      toast.success("Query submitted successfully!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to submit query");
    }
  });
};

export const useGetPresignedUrlMutation = () => {
  return useMutation({
    mutationFn: getSignedUrl,
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to initiate file upload");
    }
  });
};

export const useUploadFileMutation = () => {
  return useMutation({
    mutationFn: handleUploadFile,
    onError: (error: any) => {
      toast.error(error?.message || "Failed to upload file");
    }
  });
};
