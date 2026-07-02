import { getTemplate } from "@/services/fetch"

const DEFAULT_CONFIG = {
  name: { x: 0.43, y: 0.33, w: 0.42, h: 0.05, fontSize: 0.017 },
  hallTicket: { x: 0.43, y: 0.387, w: 0.3, h: 0.05, fontSize: 0.017 },
  branch: { x: 0.43, y: 0.44, w: 0.3, h: 0.05, fontSize: 0.017 },
  date: { x: 0.43, y: 0.494, w: 0.3, h: 0.05, fontSize: 0.017 },
  time: { x: 0.43, y: 0.545, w: 0.3, h: 0.05, fontSize: 0.017 },
  venue: { x: 0.43, y: 0.6, w: 0.3, h: 0.05, fontSize: 0.017 },
  guests: { x: 0.43, y: 0.65, w: 0.3, h: 0.05, fontSize: 0.017 },
  photo: { x: 0.824, y: 0.236, w: 0.15, h: 0.16, radius: 0.018 },
}

export const generateTicketImage = async (ticket: any): Promise<string> => {
  const formatTicketDate = (dateStr: string) => {
    if (!dateStr) return "TBD"
    const parts = dateStr.split("-")
    if (parts.length === 3) {
      const [day, month, year] = parts
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      })
    }
    return dateStr
  }

  let templateData = null
  try {
    templateData = await getTemplate()
  } catch (e) {
    console.error("Failed to fetch template, using defaults", e)
  }

  const bgSrc = templateData?.bgImageUrl
  if (!bgSrc) {
    return Promise.reject(
      new Error(
        "No template background configured. Please upload an image in the Template Editor."
      )
    )
  }
  const config = templateData?.config || DEFAULT_CONFIG

  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return reject("No canvas context")

      const getProxiedUrl = (url: string) => {
        if (!url || url.startsWith("data:")) return url;
        // Check if the URL is external
        if (url.startsWith("http")) {
          return `/api-proxy/api/mutations/proxy-image?url=${encodeURIComponent(url)}`;
        }
        return url;
      };

      const bgImage = new Image()
      bgImage.crossOrigin = "anonymous"
      bgImage.src = getProxiedUrl(bgSrc)

      bgImage.onload = () => {
        canvas.width = bgImage.width
        canvas.height = bgImage.height
        ctx.drawImage(bgImage, 0, 0)

        const w = canvas.width
        const h = canvas.height

        const renderText = (text: string, fieldConfig: any) => {
          if (!fieldConfig || fieldConfig.isEnabled === false) return

          const maxW = w * fieldConfig.w
          const defaultFontSize = Math.floor(h * (fieldConfig.fontSize || 0.017))
          const minFontSize = Math.floor(h * (fieldConfig.minFontSize || 0.01))
          const tX = w * fieldConfig.x
          const fontFam = fieldConfig.fontFamily || "sans-serif"
          const align = fieldConfig.textAlign || "left"

          ctx.fillStyle = fieldConfig.color || "#000000"
          ctx.textAlign = align as CanvasTextAlign
          ctx.textBaseline = "middle"

          const setFont = (size: number) => {
            ctx.font = `bold ${size}px ${fontFam}`
          }

          const calcDrawX = () => {
            if (align === "center") return tX + maxW / 2
            if (align === "right") return tX + maxW
            return tX
          }

          const drawX = calcDrawX()

          if (fieldConfig.autoWrap) {
            setFont(defaultFontSize)
            if (ctx.measureText(text).width <= maxW) {
              const tY = h * fieldConfig.y + (h * fieldConfig.h) / 2
              ctx.fillText(text, drawX, tY)
              return
            }

            const words = text.split(" ")
            if (words.length > 1) {
              let best = 1
              let bestDiff = Infinity
              const total = text.length
              let acc = 0
              for (let i = 0; i < words.length - 1; i++) {
                acc += words[i].length + 1
                const diff = Math.abs(acc - total / 2)
                if (diff < bestDiff) {
                  bestDiff = diff
                  best = i + 1
                }
              }
              const line1 = words.slice(0, best).join(" ")
              const line2 = words.slice(best).join(" ")

              if (
                ctx.measureText(line1).width <= maxW &&
                ctx.measureText(line2).width <= maxW
              ) {
                const lineSpacing = defaultFontSize * 1.2
                const startY =
                  h * fieldConfig.y + (h * fieldConfig.h) / 2 - lineSpacing / 2
                ctx.fillText(line1, drawX, startY)
                ctx.fillText(line2, drawX, startY + lineSpacing)
                return
              }

              setFont(minFontSize)
              if (
                ctx.measureText(line1).width <= maxW &&
                ctx.measureText(line2).width <= maxW
              ) {
                const lineSpacing = minFontSize * 1.2
                const startY =
                  h * fieldConfig.y + (h * fieldConfig.h) / 2 - lineSpacing / 2
                ctx.fillText(line1, drawX, startY)
                ctx.fillText(line2, drawX, startY + lineSpacing)
                return
              }

              const truncateToFit = (str: string) => {
                let t = str
                while (t.length > 1 && ctx.measureText(t + "…").width > maxW)
                  t = t.slice(0, -1)
                return t + "…"
              }
              const lineSpacing = minFontSize * 1.2
              const startY =
                h * fieldConfig.y + (h * fieldConfig.h) / 2 - lineSpacing / 2
              ctx.fillText(truncateToFit(line1), drawX, startY)
              ctx.fillText(truncateToFit(line2), drawX, startY + lineSpacing)
              return
            }
          }

          setFont(defaultFontSize)
          if (ctx.measureText(text).width > maxW) setFont(minFontSize)
          let t = text
          while (t.length > 1 && ctx.measureText(t + "…").width > maxW)
            t = t.slice(0, -1)
          if (t.length < text.length) t += "…"
          const tY = h * fieldConfig.y + (h * fieldConfig.h) / 2
          ctx.fillText(t, drawX, tY)
        }

        // Draw all text fields
        renderText(ticket.student_name.toUpperCase(), config.name)
        renderText(ticket.hall_ticket_number.toUpperCase(), config.hallTicket)
        renderText(ticket.branch.toUpperCase(), config.branch)
        renderText(formatTicketDate(ticket.event_date), config.date)
        renderText(ticket.event_time || "TBD", config.time)
        renderText((ticket.venue || "").toUpperCase(), config.venue)
        renderText(ticket.guest_count.toString(), config.guests)

        // Load Profile Photo
        const pConf = config.photo
        if (!pConf || pConf.isEnabled === false) {
          resolve(canvas.toDataURL("image/png", 1.0))
          return
        }

        const photo = new Image()
        photo.crossOrigin = "anonymous"
        photo.src = getProxiedUrl(ticket.photo)

        photo.onload = () => {
          const pX = w * pConf.x
          const pY = h * pConf.y
          const pW = w * pConf.w
          const pH = h * pConf.h
          const radius = Math.floor(w * (pConf.radius || 0.018))

          const drawRoundedRect = (
            x: number,
            y: number,
            width: number,
            height: number,
            r: number
          ) => {
            ctx.beginPath()
            ctx.moveTo(x + r, y)
            ctx.arcTo(x + width, y, x + width, y + height, r)
            ctx.arcTo(x + width, y + height, x, y + height, r)
            ctx.arcTo(x, y + height, x, y, r)
            ctx.arcTo(x, y, x + width, y, r)
            ctx.closePath()
          }

          ctx.save()
          drawRoundedRect(pX, pY, pW, pH, radius)
          ctx.clip()
          ctx.drawImage(photo, pX, pY, pW, pH)
          ctx.restore()

          ctx.lineWidth = Math.floor(w * 0.003)
          ctx.strokeStyle = "#0a2351"
          ctx.beginPath()
          drawRoundedRect(pX, pY, pW, pH, radius)
          ctx.stroke()

          resolve(canvas.toDataURL("image/png", 1.0))
        }

        photo.onerror = () => {
          reject(new Error("Failed to load profile photo for ticket generation."))
        }
      }

      bgImage.onerror = () => {
        reject(new Error("Failed to load ticket background image."))
      }
    })
  }
