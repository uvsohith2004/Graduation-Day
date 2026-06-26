export const generateTicketImage = (ticket: any): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Create an off-screen canvas (in background)
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return reject("No canvas context");

    // Load background template
    const bgImage = new Image();
    bgImage.src = '/template.png';
    
    bgImage.onload = () => {
      // Set canvas exactly to image resolution
      canvas.width = bgImage.width;
      canvas.height = bgImage.height;
      ctx.drawImage(bgImage, 0, 0);

      const w = canvas.width;
      const h = canvas.height;

      // Final perfected offsets saved by the user
      const offsets = {
        textX: 0.431,
        fontSize: 0.017,
        nameY: 0.33,
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
      };

      // Draw Text
      ctx.font = `bold ${Math.floor(h * offsets.fontSize)}px sans-serif`;
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';

      const tX = w * offsets.textX;

      ctx.fillText(ticket.student_name.toUpperCase(), tX, h * offsets.nameY);
      ctx.fillText(ticket.hall_ticket_number.toUpperCase(), tX, h * offsets.hallTicketY);
      ctx.fillText(ticket.branch.toUpperCase(), tX, h * offsets.branchY);
      ctx.fillText("Dec 06, 2026", tX, h * offsets.dateY);
      ctx.fillText("09:00 AM", tX, h * offsets.timeY);
      ctx.fillText(ticket.guest_count.toString(), tX, h * offsets.guestsY);

      // Load Profile Photo
      const photo = new Image();
      photo.crossOrigin = 'anonymous'; // Important for CORS
      photo.src = ticket.photo;
      
      photo.onload = () => {
        const pX = w * offsets.photoX;
        const pY = h * offsets.photoY;
        const pW = w * offsets.photoW;
        const pH = h * offsets.photoH;
        const radius = Math.floor(w * offsets.photoRadius);

        const drawRoundedRect = (x: number, y: number, width: number, height: number, r: number) => {
          ctx.beginPath();
          ctx.moveTo(x + r, y);
          ctx.arcTo(x + width, y, x + width, y + height, r);
          ctx.arcTo(x + width, y + height, x, y + height, r);
          ctx.arcTo(x, y + height, x, y, r);
          ctx.arcTo(x, y, x + width, y, r);
          ctx.closePath();
        };

        // Draw photo with rounded clip
        ctx.save();
        drawRoundedRect(pX, pY, pW, pH, radius);
        ctx.clip();
        ctx.drawImage(photo, pX, pY, pW, pH);
        ctx.restore();

        // Draw blue border
        ctx.lineWidth = Math.floor(w * 0.003);
        ctx.strokeStyle = '#0a2351';
        ctx.beginPath();
        drawRoundedRect(pX, pY, pW, pH, radius);
        ctx.stroke();

        // Resolve with the Data URL (base64 image)
        resolve(canvas.toDataURL('image/png', 1.0));
      };

      photo.onerror = () => {
        reject(new Error("Failed to load profile photo for ticket generation."));
      };
    };

    bgImage.onerror = () => {
      reject(new Error("Failed to load /template.png from public folder."));
    };
  });
};
