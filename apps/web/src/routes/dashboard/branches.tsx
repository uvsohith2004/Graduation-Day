import { useState, useRef, useEffect, useLayoutEffect } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useQueryClient } from "@tanstack/react-query"
import { useBranchesQuery } from "@/api/admin-queries"
import { useCreateBranchMutation, useDeleteBranchMutation, useUpdateBranchMutation } from "@/api/mutation"
import gsap from "gsap"
import { format, parse, isValid } from "date-fns"

// UI Components
import { Button } from "@repo/ui/components/button"
import { Input } from "@repo/ui/components/input"
import { Calendar } from "@repo/ui/components/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@repo/ui/components/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table"
import { Loader2, Trash2, Plus, X, MapPin, Building2, Check, Clock, CalendarDays, CalendarIcon, Edit2 } from "lucide-react"


export const Route = createFileRoute("/dashboard/branches")({
  component: DashboardBranches,
})

function DashboardBranches() {
  const queryClient = useQueryClient()
  const { data: branches, isLoading } = useBranchesQuery()

  const [isCreating, setIsCreating] = useState(false)
  const [editingBranchId, setEditingBranchId] = useState<string | null>(null)
  const deckRef = useRef<HTMLDivElement>(null)
  const minuteInputRef = useRef<HTMLInputElement>(null)

  // Delete Dialog State
  const [deleteBranchId, setDeleteBranchId] = useState<string | null>(null)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")

  // Form State
  const [name, setName] = useState("")
  const [venue, setVenue] = useState("")
  
  // Date State
  const [dateStr, setDateStr] = useState("")
  const [dateObj, setDateObj] = useState<Date | undefined>(undefined)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  
  // Time State
  const [hour, setHour] = useState("09")
  const [minute, setMinute] = useState("00")
  const [period, setPeriod] = useState<"AM" | "PM">("AM")

  const createMutation = useCreateBranchMutation()
  const deleteMutation = useDeleteBranchMutation()
  const updateMutation = useUpdateBranchMutation()

  // GSAP Animations
  useLayoutEffect(() => {
    if (isCreating && deckRef.current) {
      gsap.fromTo(
        deckRef.current,
        { height: 0, opacity: 0, overflow: "hidden" },
        { height: "auto", opacity: 1, duration: 0.4, ease: "power3.out" }
      )
    }
  }, [isCreating])

  useEffect(() => {
    if (!isLoading && branches) {
      gsap.fromTo(
        ".stagger-row",
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, stagger: 0.04, duration: 0.3, ease: "power2.out" }
      )
    }
  }, [isLoading, branches])

  const toggleDeck = () => {
    if (isCreating && deckRef.current) {
      gsap.to(deckRef.current, {
        height: 0,
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          setIsCreating(false)
          setEditingBranchId(null)
          setName("")
          setVenue("")
          setDateStr("")
          setDateObj(undefined)
          setHour("09")
          setMinute("00")
          setPeriod("AM")
        }
      })
    } else {
      setIsCreating(true)
    }
  }

  // --- Date Logic ---
  const handleDateStringChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setDateStr(val)
    const parsed = parse(val, "dd-MM-yyyy", new Date())
    if (isValid(parsed)) setDateObj(parsed)
  }

  const handleCalendarSelect = (selectedDate: Date | undefined) => {
    setDateObj(selectedDate)
    if (selectedDate) {
      setDateStr(format(selectedDate, "dd-MM-yyyy"))
      setIsCalendarOpen(false)
    }
  }

  // --- Strict Time Logic ---
  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '') 
    if (val.length === 0) {
      setHour("")
      return
    }

    if (val.length === 1) {
       const num = parseInt(val, 10)
       if (num > 1) {
         setHour(`0${num}`)
         minuteInputRef.current?.focus()
         return
       }
    }

    if (val.length > 2) val = val.slice(0, 2)
    const num = parseInt(val, 10)
    if (num > 12) val = "12"

    setHour(val)
    
    if (val.length === 2 && minuteInputRef.current) {
      minuteInputRef.current.focus()
    }
  }

  const handleHourBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const currentVal = e.target.value;
    if (!currentVal || currentVal === "00" || currentVal === "0") setHour("12")
    else if (currentVal.length === 1 && parseInt(currentVal, 10) > 0) setHour(`0${currentVal}`)
  }

  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '') 
    if (val.length === 0) {
      setMinute("")
      return
    }

    if (val.length === 1) {
       const num = parseInt(val, 10)
       if (num > 5) {
         setMinute(`0${num}`)
         return
       }
    }

    if (val.length > 2) val = val.slice(0, 2)
    const num = parseInt(val, 10)
    if (num > 59) val = "59"

    setMinute(val)
  }

  const handleMinuteBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const currentVal = e.target.value;
    if (!currentVal) setMinute("00")
    else if (currentVal.length === 1) setMinute(`0${currentVal}`)
  }

  // --- Actions ---
  const handleEdit = (b: any) => {
    setEditingBranchId(b.id)
    setName(b.name)
    setVenue(b.venue)
    setDateStr(b.date)
    setDateObj(parse(b.date, "dd-MM-yyyy", new Date()))
    
    // Parse time like "09:00 AM"
    const [timePart, periodPart] = b.time.split(" ")
    const [h, m] = timePart.split(":")
    setHour(h)
    setMinute(m)
    setPeriod(periodPart as "AM" | "PM")
    
    if (!isCreating) {
      setIsCreating(true)
    }
  }

  const handleCreate = async () => {
    if (!name || !venue || !dateStr || !hour || !minute) return
    const formattedTime = `${hour}:${minute} ${period}`
    
    if (editingBranchId) {
      await updateMutation.mutateAsync({ id: editingBranchId, payload: { name, venue, date: dateStr, time: formattedTime } })
    } else {
      await createMutation.mutateAsync({ name, venue, date: dateStr, time: formattedTime })
    }
    
    setName("")
    setVenue("")
    setDateStr("")
    setDateObj(undefined)
    setHour("09")
    setMinute("00")
    setPeriod("AM")
    setEditingBranchId(null)
    toggleDeck()
    queryClient.invalidateQueries({ queryKey: ["admin", "branches"] })
  }

  const handleDelete = async () => {
    if (deleteBranchId && deleteConfirmText.toLowerCase() === 'confirm') {
      await deleteMutation.mutateAsync(deleteBranchId)
      queryClient.invalidateQueries({ queryKey: ["admin", "branches"] })
      setDeleteBranchId(null)
      setDeleteConfirmText("")
    }
  }

  return (
    <div className="space-y-6 max-w-350 mx-auto pb-12 min-h-screen">
      {/* THE HEADER STAYS RENDERED ALWAYS */}
      <div className="flex items-center justify-between stagger-row">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Branches</h1>
          <p className="text-muted-foreground mt-1 text-sm">Design and deploy your network nodes.</p>
        </div>
        <Button 
          onClick={toggleDeck}
          variant={isCreating ? "secondary" : "default"}
          disabled={isLoading}
          className="rounded-xl px-4 transition-all duration-300"
        >
          {isCreating ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
          {isCreating ? "Cancel" : "New Branch"}
        </Button>
      </div>

     {isLoading ? (
        /* LOCKING THE LAYOUT: Same border, same padding, same height as the Table */
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="h-11 bg-muted/40 border-b border-border w-full flex items-center px-6">
             <div className="h-3 w-24 bg-muted-foreground/10 rounded animate-pulse"></div>
          </div>
          <div className="divide-y divide-border/50">
            {[1, 2, 3, 4].map((i) => (
              /* MATCHES THE TABLE ROW HEIGHT & PADDING EXACTLY */
              <div key={i} className="flex items-center justify-between px-6 py-4 h-18">
                <div className="flex flex-col gap-2 w-1/3">
                  <div className="h-4 w-32 bg-muted-foreground/10 rounded animate-pulse"></div>
                  <div className="h-3 w-24 bg-muted-foreground/10 rounded animate-pulse"></div>
                </div>
                <div className="flex gap-6 w-1/3">
                  <div className="h-4 w-20 bg-muted-foreground/10 rounded animate-pulse"></div>
                  <div className="h-4 w-20 bg-muted-foreground/10 rounded animate-pulse"></div>
                </div>
                <div className="h-8 w-8 bg-muted-foreground/10 rounded-md animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden stagger-row shadow-sm">
          
          {/* THE COMMAND DECK */}
          {isCreating && (
            <div ref={deckRef} className="border-b border-border bg-muted/20 overflow-hidden">
              <div className="p-6 flex flex-col gap-6">
                
                {/* Top Line: Branch & Venue */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Branch Identifier</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                      <Input 
                        autoFocus
                        className="pl-9 bg-background border-border h-11 rounded-lg focus-visible:ring-1 shadow-none" 
                        value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Computer Science Engineering" 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Venue Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                      <Input 
                        className="pl-9 bg-background border-border h-11 rounded-lg focus-visible:ring-1 shadow-none" 
                        value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="e.g. KVR Main Convention Hall" 
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom Line: Date, Time & Action */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                  
                  {/* Date Picker */}
                  <div className="md:col-span-5 space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Schedule Date</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                        <Input 
                          className="pl-9 bg-background border-border h-11 rounded-lg font-mono text-sm focus-visible:ring-1 shadow-none" 
                          value={dateStr} 
                          onChange={handleDateStringChange} 
                          placeholder="DD-MM-YYYY" 
                        />
                      </div>
                      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                        <PopoverTrigger >
                          <Button variant="outline" size="icon" className="h-11 w-11 rounded-lg border-border shadow-none shrink-0 bg-background hover:bg-muted/50">
                            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 border-border shadow-sm rounded-xl" align="end">
                          <Calendar
                            mode="single"
                            selected={dateObj}
                            onSelect={handleCalendarSelect}
                            
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  {/* Secure & Animated Time Picker */}
                  <div className="md:col-span-5 space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Time Allocation</label>
                    <div className="flex items-center h-11 bg-background border border-border rounded-lg px-3 focus-within:ring-1 focus-within:ring-ring transition-shadow">
                      <Clock className="h-4 w-4 text-muted-foreground/60 mr-2 shrink-0" />
                      
                      <Input 
                        className="w-9 p-0 border-0 bg-transparent text-center font-mono text-base focus-visible:ring-0 shadow-none h-auto" 
                        maxLength={2}
                        value={hour}
                        onChange={handleHourChange}
                        onBlur={handleHourBlur}
                        onFocus={(e) => e.target.select()}
                        placeholder="12"
                      />
                      <span className="text-muted-foreground/30 font-mono font-bold mx-0.5 mb-1">:</span>
                      <Input 
                        ref={minuteInputRef}
                        className="w-9 p-0 border-0 bg-transparent text-center font-mono text-base focus-visible:ring-0 shadow-none h-auto" 
                        maxLength={2}
                        value={minute}
                        onChange={handleMinuteChange}
                        onBlur={handleMinuteBlur}
                        onFocus={(e) => e.target.select()}
                        placeholder="00"
                      />

                      {/* Smooth CSS-Based Sliding Toggle */}
                      <div className="ml-auto relative flex items-center bg-muted/50 p-1 rounded-md w-18 h-7.5 border border-border/50">
                        <div 
                          className={`absolute left-1 top-1 bottom-1 w-7.5 bg-background border border-border/50 rounded-lg shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${period === "PM" ? "translate-x-8" : "translate-x-0"}`} 
                        />
                        <button 
                          onClick={() => setPeriod("AM")}
                          className={`relative z-10 flex-1 text-center text-[10px] font-bold transition-colors duration-200 ${period === "AM" ? "text-foreground" : "text-muted-foreground hover:text-foreground/70"}`}
                        >
                          AM
                        </button>
                        <button 
                          onClick={() => setPeriod("PM")}
                          className={`relative z-10 flex-1 text-center text-[10px] font-bold transition-colors duration-200 ${period === "PM" ? "text-foreground" : "text-muted-foreground hover:text-foreground/70"}`}
                        >
                          PM
                        </button>
                      </div>

                    </div>
                  </div>

                  {/* Submit Action */}
                  <div className="md:col-span-2">
                    <Button 
                      className="h-11 w-full rounded-lg shadow-none" 
                      onClick={handleCreate} 
                      disabled={createMutation.isPending || updateMutation.isPending || !name || !venue || !dateStr}
                    >
                      {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                      {editingBranchId ? "Update" : "Add"}
                    </Button>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* The Flattened Data Table */}
          <Table>
            <TableHeader className="bg-muted/40 border-b border-border">
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-11 font-medium text-muted-foreground pl-6">Branch & Venue</TableHead>
                <TableHead className="h-11 font-medium text-muted-foreground">Schedule</TableHead>
                <TableHead className="h-11 font-medium text-muted-foreground text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {branches?.map((b) => (
                <TableRow key={b.id} className="transition-colors hover:bg-muted/30 group">
                  <TableCell className="pl-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-sm text-foreground">{b.name}</span>
                      <span className="text-xs text-muted-foreground flex items-center mt-1">
                        <MapPin className="h-3 w-3 mr-1 opacity-70" />
                        {b.venue}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                      <span className="flex items-center font-mono">
                        <CalendarDays className="h-3.5 w-3.5 mr-2 opacity-70" />
                        {b.date}
                      </span>
                      <span className="flex items-center font-mono">
                        <Clock className="h-3.5 w-3.5 mr-2 opacity-70" />
                        {b.time}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-6 py-4">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="opacity-0 group-hover:opacity-100 transition-opacity rounded-md hover:bg-muted hover:text-foreground h-8 w-8 mr-1"
                      onClick={() => handleEdit(b)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="opacity-0 group-hover:opacity-100 transition-opacity rounded-md hover:bg-destructive/10 hover:text-destructive h-8 w-8"
                      onClick={() => setDeleteBranchId(b.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {branches?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <p className="text-sm">No branches configured.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteBranchId} onOpenChange={(open) => {
        if (!open) {
          setDeleteBranchId(null)
          setDeleteConfirmText("")
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the branch.
              Please type <strong>confirm</strong> to continue.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input 
              value={deleteConfirmText} 
              onChange={(e) => setDeleteConfirmText(e.target.value)} 
              placeholder="Type confirm to delete..." 
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setDeleteBranchId(null)
              setDeleteConfirmText("")
            }}>Cancel</Button>
            <Button 
              variant="destructive" 
              disabled={deleteConfirmText.toLowerCase() !== 'confirm' || deleteMutation.isPending}
              onClick={handleDelete}
            >
              {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Delete Branch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
