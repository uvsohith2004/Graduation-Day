import { useState, useRef, useEffect, useLayoutEffect } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useQueryClient } from "@tanstack/react-query"
import { useContactMessagesQuery, useContactMessageThreadQuery, type ContactMessage } from "@/api/admin-queries"
import { useReplyToContactMutation, useSyncEmailRepliesMutation } from "@/api/mutation"
import gsap from "gsap"

// UI Components
import { Button } from "@repo/ui/components/button"
import { Input } from "@repo/ui/components/input"
import { Textarea } from "@repo/ui/components/textarea"
import { ScrollArea } from "@repo/ui/components/scroll-area"
import { Loader2, Reply, Mail, Search, CheckCircle2, CornerDownLeft, ChevronLeft, RefreshCcw } from "lucide-react"

export const Route = createFileRoute("/dashboard/messages")({
  component: DashboardMessages,
})

function DashboardMessages() {
  const queryClient = useQueryClient()
  const { data: messages, isLoading } = useContactMessagesQuery()
  const replyMutation = useReplyToContactMutation()
  const syncMutation = useSyncEmailRepliesMutation()

  // State
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [replySubject, setReplySubject] = useState("")
  const [replyBody, setReplyBody] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  // Refs for GSAP scoping
  const listRef = useRef<HTMLDivElement>(null)
  const detailRef = useRef<HTMLDivElement>(null)

  const selectedMessage = messages?.find(m => m.id === selectedId)
  
  const { data: threadData, isLoading: threadLoading } = useContactMessageThreadQuery(selectedId)

  // Filter messages based on search
  const filteredMessages = messages?.filter(msg => 
    msg.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    msg.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // GSAP: Initial Load Stagger
  useEffect(() => {
    if (!isLoading && filteredMessages?.length && listRef.current) {
      const items = listRef.current.querySelectorAll('.message-item')
      gsap.fromTo(
        items,
        { opacity: 0, x: -10 },
        { opacity: 1, x: 0, stagger: 0.03, duration: 0.3, ease: "power2.out" }
      )
    }
  }, [isLoading, messages]) 

  // GSAP: Animate the detail pane when selection changes
  useLayoutEffect(() => {
    if (selectedId && detailRef.current) {
      gsap.fromTo(
        detailRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
      )
    }
  }, [selectedId])

  // SEAMLESS AUTO-SYNC
  useEffect(() => {
    const runAutoSync = async () => {
      try {
        await syncMutation.mutateAsync()
        queryClient.invalidateQueries({ queryKey: ["admin", "contactMessages"] })
        if (selectedId) {
          queryClient.invalidateQueries({ queryKey: ["admin", "contactMessageThread", selectedId] })
        }
      } catch (e) {
        // silent fail for auto sync
      }
    }
    runAutoSync()
  }, [])

  const handleSelectMessage = (msg: ContactMessage) => {
    setSelectedId(msg.id)
    setReplySubject(`Re: Contact from ${msg.name}`)
    setReplyBody("") 
  }

  const handleSendReply = async () => {
    if (!selectedMessage || !replySubject || !replyBody) return
    
    await replyMutation.mutateAsync({
      messageId: selectedMessage.id,
      subject: replySubject,
      body: replyBody
    })
    
    setReplyBody("")
    queryClient.invalidateQueries({ queryKey: ["admin", "contactMessages"] })
    queryClient.invalidateQueries({ queryKey: ["admin", "contactMessageThread", selectedMessage.id] })
  }

  const handleSync = async () => {
    await syncMutation.mutateAsync()
    queryClient.invalidateQueries({ queryKey: ["admin", "contactMessages"] })
    if (selectedId) {
      queryClient.invalidateQueries({ queryKey: ["admin", "contactMessageThread", selectedId] })
    }
  }

  if (isLoading) return (
    <div className="flex h-[70vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
    </div>
  )

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-h-225 max-w-400 mx-auto overflow-hidden bg-background border border-border rounded-xl">
      
      {/* GLOBAL HEADER */}
      <div className="flex-none flex items-center justify-between px-4 md:px-6 py-4 border-b border-border bg-muted/10 shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Inbox</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Triage and respond to incoming requests.</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleSync}
          disabled={syncMutation.isPending}
          className="h-8 shadow-sm"
        >
          <RefreshCcw className={`h-3.5 w-3.5 mr-2 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
          Sync Emails
        </Button>
      </div>

      {/* SPLIT PANE LAYOUT */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT PANE: Master List */}
        <div className={`w-full md:w-87.5 lg:w-105 flex-none flex-col border-r border-border bg-card relative h-full overflow-hidden ${selectedId ? 'hidden md:flex' : 'flex'}`}>
          
          {/* Search/Filter Bar */}
          <div className="p-4 border-b border-border bg-background/50 z-10 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
              <Input 
                placeholder="Search senders..." 
                className="pl-9 h-9 bg-muted/30 border-border shadow-none text-sm rounded-lg focus-visible:ring-1"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* THE FIX: Hard-locked wrapper for Left ScrollArea */}
          <div className="flex-1 overflow-hidden min-h-0">
            <ScrollArea className="h-full w-full">
              <div ref={listRef} className="pb-4">
                {!filteredMessages?.length ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">No messages found.</div>
                ) : (
                  filteredMessages.map((msg) => {
                    const isSelected = selectedId === msg.id
                    return (
                      <button
                        key={msg.id}
                        onClick={() => handleSelectMessage(msg)}
                        className={`message-item w-full text-left px-5 py-4 border-b border-border/40 transition-colors duration-200 group
                          ${isSelected ? 'bg-primary/5 border-l-2 border-l-primary' : 'hover:bg-muted/30 border-l-2 border-l-transparent'}
                        `}
                      >
                        <div className="flex justify-between items-baseline mb-1">
                          <span className={`text-sm font-semibold truncate pr-2 ${isSelected ? 'text-foreground' : 'text-foreground/80'}`}>
                            {msg.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                            {new Date(msg.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <div className="text-xs font-medium text-foreground/70 truncate mb-1.5">
                          {msg.email}
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground truncate pr-4 line-clamp-1">
                            {msg.message}
                          </p>
                          {msg.isReplied && (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 opacity-80" />
                          )}
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* RIGHT PANE: Detail & Reply Composer */}
        <div className={`flex-1 flex-col bg-background min-w-0 h-full overflow-hidden ${!selectedId ? 'hidden md:flex' : 'flex'}`}>
          {!selectedMessage ? (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground/50 h-full">
              <Mail className="h-12 w-12 mb-4 opacity-20" />
              <p className="text-sm font-medium">Select a message to read and reply.</p>
            </div>
          ) : (
            <div className="flex flex-col h-full overflow-hidden relative" ref={detailRef}>
              
              {/* FIXED TOP: Thread Header */}
              <div className="flex-none shrink-0 p-4 md:p-6 border-b border-border/50 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 z-10 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="md:hidden mr-2 -ml-2 shrink-0 h-8 w-8 text-muted-foreground hover:text-foreground" 
                      onClick={() => setSelectedId(null)}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div>
                      <h2 className="text-lg md:text-xl font-bold text-foreground tracking-tight line-clamp-1">{selectedMessage.name}</h2>
                      <a href={`mailto:${selectedMessage.email}`} className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors mt-0.5 md:mt-1 block line-clamp-1">
                        {selectedMessage.email}
                      </a>
                    </div>
                  </div>
                  
                  <div className="text-right shrink-0 ml-4 flex flex-col items-end justify-center">
                    <span className="text-[10px] md:text-xs text-muted-foreground font-mono block mb-1 md:mb-2">
                      {new Date(selectedMessage.createdAt).toLocaleString(undefined, { 
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                      })}
                    </span>
                    {selectedMessage.isReplied && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] md:text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        <CheckCircle2 className="mr-1 h-3 w-3" /> Replied
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* THE FIX: Hard-locked wrapper for Right ScrollArea */}
              <div className="flex-1 overflow-hidden min-h-0 relative">
                <ScrollArea className="h-full w-full">
                  
                  {/* 1. The Original Message */}
                  <div className="p-4 md:p-8 pb-4">
                    <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap warp-break-word max-w-3xl">
                      {selectedMessage.message}
                    </p>
                  </div>
                  
                  {/* Replied Thread */}
                  {threadLoading ? (
                    <div className="flex justify-center p-4">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground/50" />
                    </div>
                  ) : (
                    threadData?.replies.map((reply) => {
                      const isAdmin = reply.sender === 'admin' || (selectedMessage && !reply.sender.includes(selectedMessage.email));
                      return (
                        <div key={reply.id} className="p-4 md:px-8 pb-4 border-t border-border/30">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-primary">
                              {isAdmin ? 'Admin' : reply.sender}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {new Date(reply.createdAt).toLocaleString(undefined, { 
                                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                              })}
                            </span>
                          </div>
                          <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap max-w-3xl">
                            {reply.message}
                          </p>
                        </div>
                      )
                    })
                  )}

                  {/* 2. The Reply Composer */}
                  <div className="p-3 md:p-4 m-3 md:m-4 mt-4 bg-muted/20 border border-border rounded-xl focus-within:ring-1 focus-within:ring-ring transition-shadow mb-12">
                    
                    <div className="flex items-center px-3 py-2 border-b border-border/50">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider w-14 md:w-16">Subject</span>
                      <Input 
                        value={replySubject}
                        onChange={(e) => setReplySubject(e.target.value)}
                        className="flex-1 h-7 border-0 bg-transparent shadow-none text-sm px-0 focus-visible:ring-0 font-medium"
                      />
                    </div>

                    <div className="p-3">
                      <Textarea 
                        value={replyBody}
                        onChange={(e) => setReplyBody(e.target.value)}
                        placeholder={`Reply to ${selectedMessage.name}...`}
                        className="min-h-30 resize-none border-0 bg-transparent shadow-none text-sm p-0 focus-visible:ring-0"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between px-3 pb-3 pt-1 gap-3 sm:gap-0">
                      <p className="text-[10px] text-muted-foreground items-center hidden sm:flex">
                        <CornerDownLeft className="h-3 w-3 mr-1" /> Use a professional tone.
                      </p>
                      <Button 
                        onClick={handleSendReply}
                        disabled={replyMutation.isPending || !replyBody.trim()}
                        className="h-9 sm:h-8 px-4 rounded-md shadow-sm font-medium transition-all w-full sm:w-auto"
                      >
                        {replyMutation.isPending ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                        ) : (
                          <Reply className="h-3.5 w-3.5 mr-1.5" />
                        )}
                        Send Reply
                      </Button>
                    </div>

                  </div>

                </ScrollArea>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  )
}
