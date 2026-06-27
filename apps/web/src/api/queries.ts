import { useQuery } from "@tanstack/react-query";

import { authClient } from "@/lib/auth-client";
import { getRegistration } from "@/services/fetch";

export const useRegistrationQuery = () => {
    const {data: session} = authClient.useSession()
    
    const query = useQuery({
        queryKey: ["registration", session?.user?.id],
        queryFn: getRegistration,
        enabled: !!session?.user?.id,   
      });
      return query

}
