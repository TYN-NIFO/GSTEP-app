import axiosPrivate from "./axiosPrivate";
import axiosPublic from "./axiosPublic";

export const apiRequest = async (
  method,
  url,
  data = {},
  usePrivate = true,
  isFormData = false
) => {
  const client = usePrivate ? axiosPrivate : axiosPublic;

  // Only set Content-Type for non-FormData requests
  const headers = !isFormData ? { "Content-Type": "application/json" } : undefined;

  return client({
    method,
    url,
    ...(method === "get" || method === "delete" ? { params: data } : { data }),
    ...(headers ? { headers } : {}),
  });
}; 