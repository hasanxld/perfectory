"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Preloader } from "./preloader"

export function PagePreloaderListener() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Create a proxy for router.push to track navigation
    const originalPush = router.push

    const handleNavigation = () => {
      setIsLoading(true)
      // Auto-hide preloader after 3 seconds max (fallback)
      const timeout = setTimeout(() => setIsLoading(false), 3000)
      return () => clearTimeout(timeout)
    }

    // Hook into Next.js navigation
    if (typeof window !== "undefined") {
      const handleRouteChange = () => {
        setIsLoading(true)
      }

      const handleRouteChangeComplete = () => {
        setIsLoading(false)
      }

      // Use NProgress or similar if available, otherwise rely on manual timing
      // This fires when route is being changed
      window.addEventListener("beforeunload", () => setIsLoading(true))

      return () => {
        window.removeEventListener("beforeunload", () => setIsLoading(true))
      }
    }
  }, [router])

  return <Preloader isLoading={isLoading} />
}
