import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "@/store";
import { 
  Ticket, LogOut, User, MenuIcon, Home, Calendar, Sparkles
} from "lucide-react";

import { authClient } from "@/lib/auth-client"; 

import { Button } from "@repo/ui/components/button";
import { Sheet, SheetContent, SheetFooter } from "@repo/ui/components/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { cn } from "@repo/ui/lib/utils"; 
import { ThemeToggle } from "./theme-toggle";
import { Logo } from "./logo";
export function Navbar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { data: session } = authClient.useSession();
  
  const { user, isLoggedIn, setUser, logout } = useAuthStore();

  useEffect(() => {
    if (session?.user) {
      setUser({
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      });
    } else if (session === null) {
      // If explicitly null (logged out), clear the store
      setUser(null);
    }
  }, [session, setUser]);

  const handleNavigate = (path: string) => {
    navigate({ to: path });
    setOpen(false);
  };

  const handleLogout = async () => {
    await authClient.signOut();
    logout();
    navigate({ to: "/" });
  };

  return (
    <header
      className={cn(
        "fixed top-4 left-0 right-0 z-50",
        "mx-auto w-full max-w-5xl rounded-full border border-border/60",
        "bg-background/80 supports-[backdrop-filter]:bg-background/60 backdrop-blur-md"
      )}
    >
      <nav className="mx-auto flex h-14 items-center justify-between px-4">
        
        {/* LEFT: Brand */}
        <div 
          className="flex cursor-pointer items-center gap-2 rounded-full px-3 py-1.5 transition-colors hover:bg-accent/50"
          onClick={() => handleNavigate("/")}
        >
          <Logo/>
          <p className="font-bold text-sm tracking-wide">VITS ALUMNI HUB</p>
        </div>

        {/* MIDDLE: Desktop Nav */}
        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" size="sm" onClick={() => handleNavigate("/")} className="rounded-full h-8 px-4 text-xs font-medium">
            Home
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleNavigate("/register")} className="rounded-full h-8 px-4 text-xs font-medium">
            Register
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleNavigate("/schedule")} className="rounded-full h-8 px-4 text-xs font-medium">
            Schedule
          </Button>
        </div>

        {/* RIGHT: Actions (Desktop & Mobile trigger) */}
        <div className="flex items-center gap-3">
          <div className="hidden md:block">
            <ThemeToggle />
          </div>

          <div className="hidden md:flex items-center gap-2">
            {isLoggedIn && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full border border-border/50 p-0 overflow-hidden">
                    <Avatar className="h-full w-full">
                      <AvatarImage src={user.image || ""} alt={user.name || "User"} />
                      <AvatarFallback className="bg-secondary text-xs">
                        {user.name?.charAt(0).toUpperCase() || <User className="w-3 h-3" />}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-background/95 backdrop-blur-xl border-border rounded-xl">
                  <div className="px-3 py-2">
                    <p className="text-sm font-semibold truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator className="bg-border/50" />
                  <DropdownMenuItem onClick={() => handleNavigate("/tickets")} className="cursor-pointer py-2.5">
                    <Ticket className="mr-2 h-4 w-4 text-primary" />
                    My Tickets
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive py-2.5 focus:text-destructive focus:bg-destructive/10">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button size="sm" onClick={() => handleNavigate("/signin")} className="rounded-full h-8 px-4 text-xs bg-primary text-primary-foreground">
                  Sign In
                </Button>
              </>
            )}
          </div>

          {/* MOBILE: Drawer/Sheet Trigger */}
          <Sheet open={open} onOpenChange={setOpen}>
            <span className="md:hidden">  <ThemeToggle /></span>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setOpen(!open)}
              className="md:hidden rounded-full h-9 w-9 border border-border/50"
            >
              <MenuIcon className="size-4" />
            </Button>
            <SheetContent
              className="bg-background/95 supports-[backdrop-filter]:bg-background/80 border-r border-border/50 backdrop-blur-xl p-0 w-64"
              showCloseButton={false}
              side="left"
            >
              <div className="flex flex-col h-full">
                <div className="p-4 border-b border-border/50 flex justify-between items-center">
                  <p className="font-bold text-sm tracking-wide">VITS ALUMNI HUB</p>
                
                </div>
                
                <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
                  <Button variant="ghost" className="justify-start text-sm h-10" onClick={() => handleNavigate("/")}>
                    <Home className="mr-3 h-4 w-4" /> Home
                  </Button>
                  <Button variant="ghost" className="justify-start text-sm h-10" onClick={() => handleNavigate("/register")}>
                    <Sparkles className="mr-3 h-4 w-4" /> Register
                  </Button>
                  <Button variant="ghost" className="justify-start text-sm h-10" onClick={() => handleNavigate("/schedule")}>
                    <Calendar className="mr-3 h-4 w-4" /> Schedule
                  </Button>

                  {session && (
                    <>
                      <div className="my-4 border-t border-border/50" />
                      <Button variant="ghost" className="justify-start text-sm h-10" onClick={() => handleNavigate("/tickets")}>
                        <Ticket className="mr-3 h-4 w-4" /> My Tickets
                      </Button>
                    </>
                  )}
                </div>

                <SheetFooter className="p-4 border-t border-border/50">
                  {isLoggedIn && user ? (
                    <div className="flex flex-col gap-3 w-full">
                      <div className="flex items-center gap-3 px-2">
                        <Avatar className="h-8 w-8 border border-border">
                          <AvatarImage src={user.image || ""} />
                          <AvatarFallback>{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold truncate">{user.name}</span>
                        </div>
                      </div>
                      <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" /> Sign Out
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 w-full">
                  
                      <Button className="w-full rounded-full" onClick={() => handleNavigate("/signin")}>Sign In</Button>
                    </div>
                  )}
                </SheetFooter>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
