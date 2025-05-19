"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { LayoutDashboard, MessageSquare, Settings, Menu, X } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function NavigationBar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const handleDisconnect = () => {
    // Clear local storage
    localStorage.removeItem("surveyCompleted")
    localStorage.removeItem("ceFiExperience")
    localStorage.removeItem("deFiExperience")
    localStorage.removeItem("riskPreference")

    // Redirect to home
    router.push("/")
  }

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4 mr-2" /> },
    { href: "/prompt", label: "AI Prompt", icon: <MessageSquare className="h-4 w-4 mr-2" /> },
    { href: "/settings", label: "Settings", icon: <Settings className="h-4 w-4 mr-2" /> },
  ]

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center font-bold text-xl">
              <span className="text-primary mr-2">XRP</span>
              <span>AI Trading</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  pathname === item.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex md:items-center md:space-x-2">
            <ModeToggle />
            <Button variant="destructive" size="sm" onClick={handleDisconnect}>
              Disconnect Wallet
            </Button>
          </div>

          {/* Mobile Navigation */}
          <div className="flex items-center space-x-2 md:hidden">
            <ModeToggle />
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between py-2">
                    <div className="font-bold text-lg">Menu</div>
                    <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                      <X className="h-5 w-5" />
                    </Button>
                  </div>

                  <div className="flex flex-col space-y-3 py-4">
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                          pathname === item.href
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        }`}
                      >
                        {item.icon}
                        {item.label}
                      </Link>
                    ))}
                  </div>

                  <div className="mt-auto">
                    <Button variant="destructive" className="w-full" onClick={handleDisconnect}>
                      Disconnect Wallet
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
