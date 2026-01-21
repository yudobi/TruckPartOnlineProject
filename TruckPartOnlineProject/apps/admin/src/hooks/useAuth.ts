import { useContext } from "react"
import { AuthContext } from "@/contexts/AuthContext"

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useLoginContext must be used within a LoginProvider")
  }
  return context
}
