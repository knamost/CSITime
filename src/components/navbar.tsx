"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { buttonVariants } from "@/components/ui/button-variants"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Moon, Sun, Search, Menu } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export function Navbar() {
  const { data: session } = useSession()
  const { setTheme } = useTheme()
  const router = useRouter()

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const query = new FormData(e.currentTarget).get("q")
    if (query) router.push(`/search?q=${query}`)
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 shadow-sm shadow-black/[0.02] dark:shadow-none">
      <div className="container mx-auto max-w-7xl flex h-14 items-center gap-4 px-4 md:px-8">
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>} />
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle className="text-left text-primary font-bold text-xl">CSITime</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4 py-4 px-2">
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="search" 
                    name="q"
                    placeholder="Search..." 
                    className="w-full pl-9 bg-muted/50 focus-visible:ring-1" 
                  />
                </form>
                <nav className="flex flex-col gap-2">
                  <Link href="/" className="px-2 py-1 text-lg font-medium hover:text-primary transition-colors">
                    Home
                  </Link>
                  <Link href="/search" className="px-2 py-1 text-lg font-medium hover:text-primary transition-colors">
                    Resources
                  </Link>
                  <Link href="/posts" className="px-2 py-1 text-lg font-medium hover:text-primary transition-colors">
                    Discussions
                  </Link>
                </nav>
                <div className="mt-auto border-t pt-4 flex flex-col gap-2">
                  {!session && (
                    <>
                      <Link href="/login" className={buttonVariants({ variant: "outline", className: "w-full" })}>Login</Link>
                      <Link href="/register" className={buttonVariants({ className: "w-full" })}>Register</Link>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl tracking-tight text-primary">CSITime</span>
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center gap-6 ml-4">
          <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
            Home
          </Link>
          <Link href="/search" className="text-sm font-medium hover:text-primary transition-colors">
            Resources
          </Link>
          <Link href="/posts" className="text-sm font-medium hover:text-primary transition-colors">
            Discussions
          </Link>
        </nav>
        
        <form onSubmit={handleSearch} className="flex-1 max-w-sm mx-auto hidden lg:flex relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            name="q"
            placeholder="Search subjects, resources..." 
            className="w-full pl-9 bg-muted/50 focus-visible:ring-1" 
          />
        </form>

        <div className="flex items-center gap-2 ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-9 w-9">
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>} />
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {session.user?.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>} />
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem className="flex flex-col items-start gap-1 p-2">
                  <span className="font-medium">{session.user?.name}</span>
                  <span className="text-xs text-muted-foreground">{session.user?.email}</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/profile" className="w-full">Profile</Link>
                </DropdownMenuItem>
                {session.user?.role === "ADMIN" || session.user?.role === "MODERATOR" ? (
                  <DropdownMenuItem>
                    <Link href="/admin" className="w-full">Dashboard</Link>
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuItem onClick={() => signOut()}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/login"  className={buttonVariants({ variant: "ghost", className: "hidden sm:inline-flex" })}>Login</Link>
              <Link href="/register"  className={buttonVariants()}>Register</Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
