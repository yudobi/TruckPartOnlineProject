import { AUTH_REFRESH_ACCESS_TOKEN } from "@admin/api-endpoints"
import { apiClient, ApiError } from "@admin/lib/api-client"

export async function refreshAccessToken(
  refresh: string
): Promise<{ access: string; refresh: string }> {
  try {
    const response = await apiClient.post(AUTH_REFRESH_ACCESS_TOKEN, {
      refresh: refresh,
    })
    return response.data
  } catch (error) {
    if (error instanceof ApiError) {
      const { responseData } = error
      if (responseData?.refresh?.[0]) {
        throw new Error(responseData.refresh[0])
      }
      if (responseData?.message) {
        throw new Error(responseData.message)
      }
      throw new Error()
    }
    throw new Error()
  }
}
