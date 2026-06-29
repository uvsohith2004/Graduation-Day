import { createFileRoute } from '@tanstack/react-router'
import { useState, useRef, useEffect } from 'react'
import { useTemplateQuery } from '@/api/admin-queries'
import { useSaveTemplateMutation, useGetPresignedUrlMutation, useUploadFileMutation } from '@/api/mutation'
import { Button } from '@repo/ui/components/button'
import { Input } from '@repo/ui/components/input'
import { Label } from '@repo/ui/components/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@repo/ui/components/dialog'
import { Loader2, Save, ImagePlus, Beaker, Eye, EyeOff, Lock, Unlock, WrapText, AlignLeft, AlignCenter, AlignRight, Type, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import { generateTicketImage } from '@/lib/ticket-generator'

export const Route = createFileRoute('/dashboard/template-editor')({
  component: TemplateEditor,
})

const createFieldConfig = (overrides: any) => ({
  x: 0.43, y: 0.33, w: 0.3, h: 0.05, 
  fontSize: 0.017, minFontSize: 0.010,
  isEnabled: true, isLocked: false, autoWrap: false,
  fontFamily: "sans-serif", textAlign: "left", color: "#000000",
  ...overrides
})

const DEFAULT_CONFIG = {
  name: createFieldConfig({ y: 0.33, w: 0.42, autoWrap: true }),
  hallTicket: createFieldConfig({ y: 0.387 }),
  branch: createFieldConfig({ y: 0.44 }),
  date: createFieldConfig({ y: 0.494 }),
  time: createFieldConfig({ y: 0.545 }),
  guests: createFieldConfig({ y: 0.6 }),
  photo: { x: 0.824, y: 0.236, w: 0.15, h: 0.16, radius: 0.018, isEnabled: true, isLocked: false }
}

const FIELD_LABELS = {
  name: "Student Name",
  hallTicket: "Hall Ticket",
  branch: "Branch",
  date: "Event Date",
  time: "Event Time",
  guests: "Guest Count",
  photo: "Profile Photo"
}

const FIELD_ICONS: Record<string, React.ReactNode> = {
  name: <Type className="w-4 h-4" />,
  hallTicket: <Type className="w-4 h-4" />,
  branch: <Type className="w-4 h-4" />,
  date: <Type className="w-4 h-4" />,
  time: <Type className="w-4 h-4" />,
  guests: <Type className="w-4 h-4" />,
  photo: <ImageIcon className="w-4 h-4" />,
}

// Dummy user for testing
const MOCK_TICKET = {
  student_name: "veera ventakata stayasai siva kumar",
  hall_ticket_number: "21K61A05I2",
  branch: "CSE",
  event_date: "24-03-2025",
  event_time: "10:00 AM",
  guest_count: 2,
  photo: "/template.png"
}

function TemplateEditor() {
  const { data: templateData, isLoading } = useTemplateQuery()
  const { mutate: saveTemplate, isPending: isSaving } = useSaveTemplateMutation()
  const { mutateAsync: getPresignedUrl } = useGetPresignedUrlMutation()
  const { mutateAsync: uploadFile } = useUploadFileMutation()

  const [bgImage, setBgImage] = useState<string | null>(null)
  const [config, setConfig] = useState<any>(DEFAULT_CONFIG)
  const [activeField, setActiveField] = useState<string | null>(null)
  
  // Track image aspect ratio dynamically
  const [aspectRatio, setAspectRatio] = useState<number>(4/3)

  const containerRef = useRef<HTMLDivElement>(null)
  const [testImage, setTestImage] = useState<string | null>(null)
  const [isGeneratingTest, setIsGeneratingTest] = useState(false)

  const lastSavedConfig = useRef<string>("")
  const lastSavedBg = useRef<string | null>(null)

  useEffect(() => {
    if (templateData) {
      if (templateData.bgImageUrl) {
        setBgImage(templateData.bgImageUrl)
        lastSavedBg.current = templateData.bgImageUrl
      }
      if (templateData.config) {
        setConfig(templateData.config)
        lastSavedConfig.current = JSON.stringify(templateData.config)
      }
    }
  }, [templateData])

  useEffect(() => {
    const timer = setInterval(() => {
      const currentConfigStr = JSON.stringify(config)
      if (currentConfigStr !== lastSavedConfig.current || bgImage !== lastSavedBg.current) {
        saveTemplate({ bgImageUrl: bgImage || "", config }, {
          onSuccess: () => {
            lastSavedConfig.current = currentConfigStr
            lastSavedBg.current = bgImage
            toast.success("Auto-saved template changes")
          }
        })
      }
    }, 60000) // 1 minute
    
    return () => clearInterval(timer)
  }, [config, bgImage, saveTemplate])

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget
    if (naturalWidth && naturalHeight) {
      setAspectRatio(naturalWidth / naturalHeight)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be smaller than 2MB")
      return
    }

    const objectUrl = URL.createObjectURL(file)
    setBgImage(objectUrl) // instant preview
    
    toast.loading("Uploading image...", { id: "upload" })
    
    try {
      const { uploadUrl, fileUrl } = await getPresignedUrl({ fileType: file.type, fileSize: file.size })
      await uploadFile({ uploadUrl, file })
      setBgImage(fileUrl || objectUrl)
      toast.success("Image uploaded successfully!", { id: "upload" })
    } catch (error) {
      toast.error("Upload failed", { id: "upload" })
      console.error(error)
    }
  }

  const handleSave = () => {
    saveTemplate({ bgImageUrl: bgImage || "", config }, {
      onSuccess: () => {
        lastSavedConfig.current = JSON.stringify(config)
        lastSavedBg.current = bgImage
        toast.success("Template saved manually")
      }
    })
  }

  const handleTestGenerate = async () => {
    setIsGeneratingTest(true)
    try {
      // Overwrite the template generator defaults temporarily using global object if needed,
      // but generateTicketImage pulls from DB. Wait, if we want to test unsaved changes, 
      // we need to pass the config to generateTicketImage.
      // Since generateTicketImage reads from DB by default, let's inject it.
      // But we can't easily inject without modifying generateTicketImage.
      // We will just temporarily save it to DB (since only admin is doing this).
      // Or we can modify generateTicketImage to accept an optional template param.
      // Let's just save it first, then generate.
      toast.loading("Saving changes to test...", { id: "test-gen" })
      saveTemplate({ bgImageUrl: bgImage || "", config }, {
        onSuccess: async () => {
          toast.loading("Generating test ticket...", { id: "test-gen" })
          try {
            const result = await generateTicketImage(MOCK_TICKET)
            setTestImage(result)
            toast.success("Test generated!", { id: "test-gen" })
          } catch(e: any) {
            toast.error(e.message || "Generation failed", { id: "test-gen" })
          } finally {
            setIsGeneratingTest(false)
          }
        },
        onError: () => {
          toast.error("Failed to save changes before testing", { id: "test-gen" })
          setIsGeneratingTest(false)
        }
      })
    } catch (error: any) {
      setIsGeneratingTest(false)
    }
  }

  // --- Safe Drag and Drop Logic using Pointer Capture ---
  // Using refs for instantaneous values across fast pointer moves
  const dragState = useRef<{ active: boolean; field: string; mode: string | null; startX: number; startY: number; startConfig: any }>({
    active: false,
    field: '',
    mode: null,
    startX: 0,
    startY: 0,
    startConfig: null
  })

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>, field: string, resizeMode: string | null = null) => {
    e.stopPropagation()
    setActiveField(field)
    
    if (config[field]?.isLocked) return // Cannot drag or resize if locked
    
    dragState.current = {
      active: true,
      field,
      mode: resizeMode,
      startX: e.clientX,
      startY: e.clientY,
      startConfig: { ...config[field] }
    }
    
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.current.active || !containerRef.current) return
    
    const { field, mode, startX, startY, startConfig } = dragState.current
    const containerRect = containerRef.current.getBoundingClientRect()
    
    const dx = (e.clientX - startX) / containerRect.width
    const dy = (e.clientY - startY) / containerRect.height

    setConfig((prev: any) => {
      const newConfig = { ...prev }
      const fieldData = { ...startConfig }

      if (mode === null) {
        // Dragging
        fieldData.x = Math.max(0, Math.min(1 - fieldData.w, fieldData.x + dx))
        fieldData.y = Math.max(0, Math.min(1 - fieldData.h, fieldData.y + dy))
      } else {
        // Resizing
        if (mode.includes('e')) {
          fieldData.w = Math.max(0.01, Math.min(1 - fieldData.x, fieldData.w + dx))
        }
        if (mode.includes('w')) {
          const newW = Math.max(0.01, fieldData.w - dx)
          const deltaW = fieldData.w - newW
          fieldData.x = Math.max(0, fieldData.x + deltaW)
          fieldData.w = newW
        }
        if (mode.includes('s')) {
          fieldData.h = Math.max(0.01, Math.min(1 - fieldData.y, fieldData.h + dy))
        }
        if (mode.includes('n')) {
          const newH = Math.max(0.01, fieldData.h - dy)
          const deltaH = fieldData.h - newH
          fieldData.y = Math.max(0, fieldData.y + deltaH)
          fieldData.h = newH
        }
      }

      newConfig[field] = fieldData
      return newConfig
    })
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragState.current.active) {
      dragState.current.active = false
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
  }

  if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin w-8 h-8" /></div>

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Ticket Template Editor</h1>
          <p className="text-muted-foreground text-sm">Drag and drop fields to customize ticket layout</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Label htmlFor="bg-upload" className="cursor-pointer border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            <ImagePlus className="w-4 h-4 mr-2" />
            Upload Background
          </Label>
          <Input id="bg-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          
          <Dialog>
            <DialogTrigger 
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2" 
              onClick={handleTestGenerate} 
              disabled={isGeneratingTest}
            >
              {isGeneratingTest ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Beaker className="w-4 h-4 mr-2" />}
              Test Generate
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Test Ticket Result</DialogTitle>
              </DialogHeader>
              <div className="flex justify-center p-4 bg-muted rounded-md mt-4">
                {testImage ? (
                  <img src={testImage} alt="Test Ticket" className="max-w-full h-auto rounded shadow" />
                ) : (
                  <Loader2 className="w-8 h-8 animate-spin" />
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Template
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Top Toolbar - Full Width */}
        <div className="w-full bg-card p-2 px-4 rounded-xl border border-border flex items-center min-h-15 overflow-x-auto">
            {activeField ? (
              <div className="flex flex-nowrap items-center gap-3">
                <span className="flex items-center gap-2 mr-2 px-3 py-1.5 bg-muted rounded-md text-sm font-medium whitespace-nowrap">
                  {FIELD_ICONS[activeField]}
                  {FIELD_LABELS[activeField as keyof typeof FIELD_LABELS]}
                </span>
                
                <div className="flex items-center gap-1 border-r border-border pr-3">
                  <Button variant={config[activeField].isEnabled ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setConfig({...config, [activeField]: {...config[activeField], isEnabled: !config[activeField].isEnabled}})} title={config[activeField].isEnabled ? "Disable" : "Enable"}>
                    {config[activeField].isEnabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                  </Button>
                  <Button variant={config[activeField].isLocked ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setConfig({...config, [activeField]: {...config[activeField], isLocked: !config[activeField].isLocked}})} title={config[activeField].isLocked ? "Unlock" : "Lock"}>
                    {config[activeField].isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4 text-muted-foreground" />}
                  </Button>
                </div>

                {activeField !== 'photo' && (
                  <div className="flex items-center gap-1 border-r border-border pr-3">
                    <Button variant={config[activeField].autoWrap ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setConfig({...config, [activeField]: {...config[activeField], autoWrap: !config[activeField].autoWrap}})} title="Auto Wrap">
                      <WrapText className="w-4 h-4" />
                    </Button>
                    <Button variant={config[activeField].textAlign === 'left' ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setConfig({...config, [activeField]: {...config[activeField], textAlign: 'left'}})} title="Align Left">
                      <AlignLeft className="w-4 h-4" />
                    </Button>
                    <Button variant={config[activeField].textAlign === 'center' ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setConfig({...config, [activeField]: {...config[activeField], textAlign: 'center'}})} title="Align Center">
                      <AlignCenter className="w-4 h-4" />
                    </Button>
                    <Button variant={config[activeField].textAlign === 'right' ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setConfig({...config, [activeField]: {...config[activeField], textAlign: 'right'}})} title="Align Right">
                      <AlignRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                <div className="flex items-center gap-2 pl-1">
                  <div className="flex items-center rounded-md border border-input bg-background p-1 hover:bg-accent transition-colors">
                    <Input 
                      type="color" 
                      value={config[activeField].color?.length === 7 ? config[activeField].color : "#cccccc"} 
                      className="w-6 h-6 p-0 border-0 cursor-pointer"
                      title="Box Color"
                      onChange={(e) => setConfig({ ...config, [activeField]: { ...config[activeField], color: e.target.value }})} 
                    />
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground" onClick={() => setConfig({ ...config, [activeField]: { ...config[activeField], color: 'rgba(0,0,0,0.15)' }})}>
                    Clear Color
                  </Button>
                </div>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground italic">Select a field on the canvas to use tools</span>
            )}
          </div>

          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Main Canvas Area */}
          <div 
            className="flex-1 bg-muted/30 p-4 sm:p-8 rounded-xl border border-border flex justify-center items-center overflow-x-auto w-full min-h-[60vh]"
            onClick={() => setActiveField(null)}
          >
          <div 
            ref={containerRef}
            className={`relative shadow-2xl bg-white select-none touch-none rounded-sm overflow-hidden ${!bgImage ? 'border-2 border-dashed border-border' : ''}`} 
            style={{ width: '100%', maxWidth: '900px', aspectRatio: aspectRatio }}
          >
            {bgImage ? (
              <img src={bgImage} onLoad={handleImageLoad} alt="Template Background" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
            ) : (
              <div className="absolute inset-0 w-full h-full bg-slate-100 flex flex-col items-center justify-center text-slate-400 pointer-events-none">
                 <ImagePlus className="w-12 h-12 mb-4 opacity-50" />
                 <span className="font-medium text-lg">No Background Image</span>
                 <span className="text-sm mt-1">Please upload a template background to begin mapping fields.</span>
              </div>
            )}
            
            {/* Draggable Fields */}
            {Object.keys(config).map((key) => {
              const field = config[key]
              const isActive = activeField === key
              return (
                  <div
                    key={key}
                    onPointerDown={(e) => { e.stopPropagation(); handlePointerDown(e, key); }}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    onClick={(e) => e.stopPropagation()}
                    className={`absolute flex items-center justify-center cursor-move transition-colors
                      ${isActive ? 'z-10 border-2 border-primary' : 'z-0 border border-black/30 hover:bg-black/10'}
                      ${!field.isEnabled ? 'opacity-40 grayscale' : ''}
                    `}
                    style={{
                      left: `${field.x * 100}%`,
                      top: `${field.y * 100}%`,
                      width: `${field.w * 100}%`,
                      height: `${field.h * 100}%`,
                      backgroundColor: field.color || 'rgba(0,0,0,0.15)',
                      touchAction: 'none'
                    }}
                  >
                    <span className={`text-[10px] sm:text-xs font-semibold px-1 py-0.5 sm:px-2 sm:py-1 rounded truncate pointer-events-none ${isActive ? 'bg-primary text-primary-foreground' : 'bg-black text-white'} ${field.isLocked ? 'opacity-50' : ''}`}>
                      {FIELD_LABELS[key as keyof typeof FIELD_LABELS]} {field.isLocked && <Lock className="inline w-3 h-3 ml-1" />}
                    </span>

               
                    {isActive && !field.isLocked && (
                      <>
                        <div className="absolute top-0 bottom-0 left-0 w-3 cursor-ew-resize hover:bg-primary/50" onPointerDown={(e) => handlePointerDown(e, key, 'w')} />
                        <div className="absolute top-0 bottom-0 right-0 w-3 cursor-ew-resize hover:bg-primary/50" onPointerDown={(e) => handlePointerDown(e, key, 'e')} />
                        <div className="absolute left-0 right-0 top-0 h-3 cursor-ns-resize hover:bg-primary/50" onPointerDown={(e) => handlePointerDown(e, key, 'n')} />
                        <div className="absolute left-0 right-0 bottom-0 h-3 cursor-ns-resize hover:bg-primary/50" onPointerDown={(e) => handlePointerDown(e, key, 's')} />
                        
                        <div className="absolute -left-1.5 -top-1.5 w-4 h-4 bg-primary rounded-full cursor-nwse-resize shadow-md" onPointerDown={(e) => handlePointerDown(e, key, 'nw')} />
                        <div className="absolute -right-1.5 -top-1.5 w-4 h-4 bg-primary rounded-full cursor-nesw-resize shadow-md" onPointerDown={(e) => handlePointerDown(e, key, 'ne')} />
                        <div className="absolute -left-1.5 -bottom-1.5 w-4 h-4 bg-primary rounded-full cursor-nesw-resize shadow-md" onPointerDown={(e) => handlePointerDown(e, key, 'sw')} />
                        <div className="absolute -right-1.5 -bottom-1.5 w-4 h-4 bg-primary rounded-full cursor-nwse-resize shadow-md" onPointerDown={(e) => handlePointerDown(e, key, 'se')} />
                      </>
                    )}
                  </div>
              )
            })}
          </div>
        </div>

        {/* Sidebar Properties */}
        <div className="w-full lg:w-80 bg-card rounded-xl border border-border shadow-sm shrink-0 lg:sticky lg:top-6">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-lg text-foreground">Properties</h3>
          </div>
          <div className="p-4 space-y-6 max-h-[70vh] overflow-y-auto">
            {!activeField ? (
              <p className="text-muted-foreground text-sm text-center py-8">Select a field on the canvas to edit its properties.</p>
            ) : (() => {
              const field = config[activeField];
              return (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-foreground mb-4">{FIELD_LABELS[activeField as keyof typeof FIELD_LABELS]} Properties</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-xs">X Position (%)</Label>
                        <Input 
                          type="number" 
                          value={Math.round(field.x * 100)} 
                          disabled={field.isLocked}
                          onChange={(e) => setConfig({ ...config, [activeField]: { ...field, x: Number(e.target.value) / 100 }})} 
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Y Position (%)</Label>
                        <Input 
                          type="number" 
                          value={Math.round(field.y * 100)} 
                          disabled={field.isLocked}
                          onChange={(e) => setConfig({ ...config, [activeField]: { ...field, y: Number(e.target.value) / 100 }})} 
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Width (%)</Label>
                        <Input 
                          type="number" 
                          value={Math.round(field.w * 100)} 
                          disabled={field.isLocked}
                          onChange={(e) => setConfig({ ...config, [activeField]: { ...field, w: Number(e.target.value) / 100 }})} 
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Height (%)</Label>
                        <Input 
                          type="number" 
                          value={Math.round(field.h * 100)} 
                          disabled={field.isLocked}
                          onChange={(e) => setConfig({ ...config, [activeField]: { ...field, h: Number(e.target.value) / 100 }})} 
                        />
                      </div>
                    </div>
                  </div>

                  {activeField !== 'photo' && (
                    <>
                      <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-border">
                         <div className="space-y-1">
                            <Label className="text-xs">Font Family</Label>
                            <select 
                               className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                               value={field.fontFamily || "sans-serif"}
                               onChange={(e) => setConfig({...config, [activeField]: {...field, fontFamily: e.target.value}})}
                            >
                              <option value="sans-serif">Sans Serif</option>
                              <option value="serif">Serif</option>
                              <option value="monospace">Monospace</option>
                              <option value="Arial">Arial</option>
                              <option value="Times New Roman">Times</option>
                              <option value="Courier New">Courier</option>
                              <option value="Georgia">Georgia</option>
                              <option value="Trebuchet MS">Trebuchet MS</option>
                            </select>
                         </div>
                         <div className="space-y-1">
                            <Label className="text-xs">Font Scale</Label>
                            <Input 
                              type="number" 
                              step="0.5"
                              value={Number(((field.fontSize || 0.017) * 1000).toFixed(1))} 
                              onChange={(e) => setConfig({ ...config, [activeField]: { ...field, fontSize: Number(e.target.value) / 1000 }})} 
                            />
                         </div>
                      </div>
                      
                      {field.autoWrap && (
                        <div className="space-y-1">
                           <Label className="text-xs">Min Font Scale (For Wrap)</Label>
                           <Input 
                             type="number" step="0.5"
                             value={Number(((field.minFontSize || 0.010) * 1000).toFixed(1))}
                             onChange={(e) => setConfig({...config, [activeField]: {...field, minFontSize: Number(e.target.value) / 1000}})}
                           />
                           <p className="text-[10px] text-muted-foreground mt-1">Text shrinks to this size before truncating.</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )
            })()}
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
