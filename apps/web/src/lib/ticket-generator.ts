export const generateTicketImage = (ticket: any): Promise<string> => {
  const formatTicketDate = (dateStr: string) => {
    if (!dateStr) return "TBD";
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    }
    return dateStr;
  };
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return reject("No canvas context")

    const bgImage = new Image()
    bgImage.src = "/template.png"

    bgImage.onload = () => {
      canvas.width = bgImage.width
      canvas.height = bgImage.height
      ctx.drawImage(bgImage, 0, 0)

      const w = canvas.width
      const h = canvas.height

      const offsets = {
        textX: 0.431,
        fontSize: 0.017,
        nameY: 0.33,

        nameMaxWidth: 0.42,
        nameMinFontSize: 10,
        nameLineSpacing: 0.020,
        nameYAdjust: 0.010,

        hallTicketY: 0.387,
        branchY: 0.44,
        dateY: 0.494,
        timeY: 0.545,
        guestsY: 0.6,
        photoX: 0.824,
        photoY: 0.236,
        photoW: 0.15,
        photoH: 0.16,
        photoRadius: 0.018,
      }


      const renderName = (name: string) => {
        const maxW = w * offsets.nameMaxWidth
        const tX = w * offsets.textX
        const defaultSize = Math.floor(h * offsets.fontSize)
        const minSize = offsets.nameMinFontSize

        const setFont = (size: number) => {
          ctx.font = `bold ${size}px sans-serif`
        }

        // Helper: split name into two roughly equal halves at a word boundary
        const splitIntoTwoLines = (text: string): [string, string] => {
          const words = text.split(" ")
          if (words.length === 1) return [text, ""]
          // Find split point closest to middle character count
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
          return [words.slice(0, best).join(" "), words.slice(best).join(" ")]
        }

        // Helper: truncate text with ellipsis to fit maxW
        const truncateToFit = (text: string, size: number): string => {
          setFont(size)
          if (ctx.measureText(text).width <= maxW) return text
          let t = text
          while (t.length > 1 && ctx.measureText(t + "…").width > maxW) {
            t = t.slice(0, -1)
          }
          return t + "…"
        }

        ctx.fillStyle = "#000000"
        ctx.textAlign = "left"
        ctx.textBaseline = "middle"

        // --- STEP 1: Try single line at default font size ---
        setFont(defaultSize)
        if (ctx.measureText(name).width <= maxW) {
          ctx.fillText(name, tX, h * offsets.nameY)
          return
        }

        // --- STEP 2: Try two lines at default font size ---
        const [line1, line2] = splitIntoTwoLines(name)
        setFont(defaultSize)
        const l1fits = ctx.measureText(line1).width <= maxW
        const l2fits = line2 === "" || ctx.measureText(line2).width <= maxW

        if (l1fits && l2fits) {
          const baseY = h * (offsets.nameY - offsets.nameYAdjust)
          ctx.fillText(line1, tX, baseY)
          if (line2)
            ctx.fillText(line2, tX, baseY + h * offsets.nameLineSpacing)
          return
        }

        // --- STEP 3: Shrink font until both lines fit (down to minSize) ---
        for (let size = defaultSize - 1; size >= minSize; size--) {
          setFont(size)
          const fits1 = ctx.measureText(line1).width <= maxW
          const fits2 = line2 === "" || ctx.measureText(line2).width <= maxW
          if (fits1 && fits2) {
            const baseY = h * (offsets.nameY - offsets.nameYAdjust)
            ctx.fillText(line1, tX, baseY)
            if (line2)
              ctx.fillText(line2, tX, baseY + h * offsets.nameLineSpacing)
            return
          }
        }

        // --- STEP 4: Give up — clip both lines with ellipsis at minSize ---
        const clipped1 = truncateToFit(line1, minSize)
        const clipped2 = line2 ? truncateToFit(line2, minSize) : ""
        setFont(minSize)
        const baseY = h * (offsets.nameY - offsets.nameYAdjust)
        ctx.fillText(clipped1, tX, baseY)
        if (clipped2)
          ctx.fillText(clipped2, tX, baseY + h * offsets.nameLineSpacing)
      }
      // ────────────────────────────────────────────────────────────────────

      const defaultFontSize = Math.floor(h * offsets.fontSize)
      const tX = w * offsets.textX

      // Draw name with smart wrapping
      renderName(ticket.student_name.toUpperCase())

      // Draw remaining fields
      ctx.font = `bold ${defaultFontSize}px sans-serif`
      ctx.fillStyle = "#000000"
      ctx.textAlign = "left"
      ctx.textBaseline = "middle"

      ctx.fillText(
        ticket.hall_ticket_number.toUpperCase(),
        tX,
        h * offsets.hallTicketY
      )
      ctx.fillText(ticket.branch.toUpperCase(), tX, h * offsets.branchY)
      ctx.fillText(formatTicketDate(ticket.event_date), tX, h * offsets.dateY)
      ctx.fillText(ticket.event_time || "TBD", tX, h * offsets.timeY)
      ctx.fillText(ticket.guest_count.toString(), tX, h * offsets.guestsY)

      // Load Profile Photo
      const photo = new Image()
      photo.crossOrigin = "anonymous"
      photo.src = ticket.photo

      photo.onload = () => {
        const pX = w * offsets.photoX
        const pY = h * offsets.photoY
        const pW = w * offsets.photoW
        const pH = h * offsets.photoH
        const radius = Math.floor(w * offsets.photoRadius)

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
      reject(new Error("Failed to load /template.png from public folder."))
    }
  })
}
