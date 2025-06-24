"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import { FilterIcon, PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DatePicker from "@/components/date-picker"

export default function Navigation() {
  const router = useRouter()
  const pathname = usePathname()
  
  // Always start with default value to avoid hydration mismatch
  const [activeView, setActiveView] = React.useState("liste")
  const [mounted, setMounted] = React.useState(false)

  // Handle initial mount and localStorage
  React.useEffect(() => {
    setMounted(true)
    
    // Redirect from root to /liste or stored preference
    if (pathname === '/') {
      const stored = localStorage.getItem('navigation-view')
      const targetView = stored && ['liste', 'woche', 'monat'].includes(stored) ? stored : 'liste'
      router.replace(`/${targetView}`)
      return
    }

    // Update activeView based on current pathname
    if (pathname === '/woche') {
      setActiveView('woche')
    } else if (pathname === '/monat') {
      setActiveView('monat')
    } else if (pathname === '/liste') {
      setActiveView('liste')
    }
  }, [pathname, router])

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveView(value)
    
    // Save to localStorage
    localStorage.setItem('navigation-view', value)
    
    // Navigate to the corresponding URL
    router.push(`/${value}`)
  }

  // Don't render tabs until mounted to avoid hydration issues
  if (!mounted) {
    return (
      <div className="flex items-center justify-between w-full border-b bg-card px-6 py-3">
        {/* Left side - Date Picker */}
        <div className="flex items-center gap-5">
          <DatePicker />
        </div>

        {/* Center - Navigation Tabs - Loading state */}
        <div className="flex items-center">
          <div className="h-9 w-48 bg-muted rounded-lg animate-pulse" />
        </div>

        {/* Right side - Action Buttons */}
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="text-sm">
            <FilterIcon className="mr-2 h-4 w-4" />
            Termine filtern
          </Button>
          <Button size="sm" className="text-sm">
            <PlusIcon className="mr-2 h-4 w-4" />
            Neuer Termin
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between w-full border-b bg-card px-6 py-3 shadow-sm">
      {/* Left side - Date Picker */}
      <div className="flex items-center gap-5">
        <DatePicker />
      </div>

      {/* Center - Navigation Tabs */}
      <Tabs value={activeView} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="liste" className="text-sm">
            Liste
          </TabsTrigger>
          <TabsTrigger value="woche" className="text-sm">
            Woche
          </TabsTrigger>
          <TabsTrigger value="monat" className="text-sm">
            Monat
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Right side - Action Buttons */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" className="text-sm">
          <FilterIcon className="mr-2 h-4 w-4" />
          Termine filtern
        </Button>
        <Button size="sm" className="text-sm">
          <PlusIcon className="mr-2 h-4 w-4" />
          Neuer Termin
        </Button>
      </div>
    </div>
  )
}