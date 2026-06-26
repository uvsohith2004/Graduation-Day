import { ArrowUpRight } from "lucide-react"
import { useNavigate } from "@tanstack/react-router"

import footerData from "@/constants/footer-data"
import { Logo } from "../logo"

export function Footer() {
  const navigate = useNavigate()

  const handleNavigate = (path: string) => {
    navigate({ to: path })
  }

  return (
    <footer className="border-t border-border/60 bg-background pt-16 pb-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-16 flex flex-col items-center justify-between gap-8 md:flex-row md:items-start">
          {/* Brand */}
          <div className="flex flex-col items-center text-center md:items-start md:text-left">
            <div className="mb-4 flex items-center gap-2">
              <Logo />

              <span className="text-xl font-bold tracking-tight text-foreground">
                {footerData.brandName}
              </span>
            </div>

            <p className="max-w-xs text-sm text-muted-foreground">
              {footerData.description}
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-8 sm:gap-16">
            <div className="flex flex-col gap-4 text-center md:text-left">
              <span className="text-sm font-semibold tracking-wider text-foreground uppercase">
                {footerData.event.title}
              </span>

              <button
                onClick={() => handleNavigate("/schedule")}
                className="text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                {footerData.event.schedule}
              </button>

              <button
                onClick={() => handleNavigate("/register")}
                className="text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                {footerData.event.register}
              </button>
            </div>

            <div className="flex flex-col gap-4 text-center md:text-left">
              <span className="text-sm font-semibold tracking-wider text-foreground uppercase">
                {footerData.connect.title}
              </span>

              <a
                href={footerData.connect.websiteUrl}
                className="flex items-center justify-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary md:justify-start"
              >
                {footerData.connect.collegeWebsite}
                <ArrowUpRight className="h-3 w-3" />
              </a>

              <button
                onClick={() => handleNavigate("/signin")}
                className="text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                {footerData.connect.alumniLogin}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-border/50 pt-8 text-xs text-muted-foreground sm:flex-row">
          <p>
            © {footerData.currentYear} {footerData.copyright}.{" "}
            {footerData.allRightsReserved}
          </p>

          <div className="flex gap-6">
            <a
              href={footerData.privacyPolicyUrl}
              className="transition-colors hover:text-foreground"
            >
              {footerData.privacyPolicy}
            </a>

            <a
              href={footerData.termsOfServiceUrl}
              className="transition-colors hover:text-foreground"
            >
              {footerData.termsOfService}
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
