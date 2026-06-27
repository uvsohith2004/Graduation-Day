import footerData from "@/constants/footer-data"
import { Logo } from "../logo"

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background py-12 md:py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="flex flex-col items-center text-center">
          
          <div className="mb-4 flex items-center justify-center gap-3">
            <Logo />
            <span className="text-xl font-bold tracking-tight text-foreground">
              {footerData.brandName}
            </span>
          </div>

          <p className="mb-10 max-w-md text-sm leading-relaxed text-muted-foreground">
            {footerData.description}
          </p>

          <div className="flex w-full flex-col items-center justify-between gap-4 border-t border-border/40 pt-8 text-xs text-muted-foreground sm:flex-row">
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
      </div>
    </footer>
  )
}
