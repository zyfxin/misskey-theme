import * as React from "react"
import {
  CheckIcon,
  Code2Icon,
  CopyIcon,
  ExternalLinkIcon,
  MoonIcon,
  PaletteIcon,
  SearchIcon,
  SparklesIcon,
  SunIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Toaster } from "@/components/ui/sonner"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { serializeTheme, themes, type ThemeEntry } from "@/data/themes"
import { cn } from "@/lib/utils"

type FilterMode = "all" | "dark" | "light"

const FILTER_LABELS: Record<FilterMode, string> = {
  all: "全部",
  dark: "深色",
  light: "浅色",
}

function getPreviewStyle(entry: ThemeEntry) {
  return {
    "--preview-bg": entry.preview.bg,
    "--preview-panel": entry.preview.panel,
    "--preview-fg": entry.preview.fg,
    "--preview-accent": entry.preview.accent,
    "--preview-line": entry.preview.line,
    "--preview-soft": entry.preview.soft,
  } as React.CSSProperties
}

async function copyText(text: string) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text)
      return
    } catch {
      // Fall back for embedded browsers that expose Clipboard but deny writes.
    }
  }

  const textarea = document.createElement("textarea")
  textarea.value = text
  textarea.setAttribute("readonly", "")
  textarea.style.position = "fixed"
  textarea.style.opacity = "0"
  document.body.appendChild(textarea)
  textarea.select()
  const copied = document.execCommand("copy")
  textarea.remove()

  if (!copied) {
    throw new Error("copy failed")
  }
}

export function App() {
  const [filter, setFilter] = React.useState<FilterMode>("all")
  const [query, setQuery] = React.useState("")
  const [selectedId, setSelectedId] = React.useState(themes[0].theme.id)
  const [copiedId, setCopiedId] = React.useState<string | null>(null)

  const selectedTheme =
    themes.find((entry) => entry.theme.id === selectedId) ?? themes[0]
  const selectedCode = React.useMemo(
    () => serializeTheme(selectedTheme.theme),
    [selectedTheme]
  )

  const filteredThemes = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return themes.filter((entry) => {
      const matchesFilter =
        filter === "all" ? true : entry.theme.base === filter
      const searchable = [
        entry.theme.name,
        entry.theme.desc,
        entry.style,
        entry.mood,
        ...entry.tags,
      ]
        .join(" ")
        .toLowerCase()

      return matchesFilter && searchable.includes(normalizedQuery)
    })
  }, [filter, query])

  const themeStats = React.useMemo(
    () => ({
      total: themes.length,
      dark: themes.filter((entry) => entry.theme.base === "dark").length,
      light: themes.filter((entry) => entry.theme.base === "light").length,
    }),
    []
  )

  const handleCopy = React.useCallback(async (entry: ThemeEntry) => {
    try {
      await copyText(serializeTheme(entry.theme))
      setCopiedId(entry.theme.id)
      toast.success(`${entry.theme.name} 已复制`)
      window.setTimeout(() => setCopiedId(null), 1400)
    } catch {
      toast.error("复制失败，请手动选择代码")
    }
  }, [])

  const handleCardKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
    entry: ThemeEntry
  ) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return
    }

    event.preventDefault()
    setSelectedId(entry.theme.id)
  }

  return (
    <TooltipProvider>
      <main className="min-h-svh overflow-hidden bg-background text-foreground">
        <div className="app-shell">
          <header className="mx-auto flex w-full max-w-[1500px] flex-col gap-5 px-4 py-5 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8">
            <div className="flex max-w-3xl min-w-0 flex-col gap-3">
              <Badge variant="outline" className="w-fit">
                Misskey Theme Atelier
              </Badge>
              <div className="flex min-w-0 flex-col gap-2">
                <h1 className="font-heading text-4xl leading-none font-semibold sm:text-5xl">
                  Misskey 主题工坊
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                  黑白极简、黑金、浅色纸感、霓虹终端与更多风格。选中主题后复制完整
                  Misskey 主题 JSON。
                </p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <a
                    href="https://dc.hhhl.cc"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-8 items-center gap-1.5 rounded-[8px] border bg-card/70 px-3 font-medium text-foreground transition-colors hover:border-primary/70 hover:text-primary"
                  >
                    hhhl社区
                    <ExternalLinkIcon className="size-3.5" aria-hidden="true" />
                  </a>
                  <span className="inline-flex h-8 items-center rounded-[8px] border bg-card/50 px-3 font-mono">
                    @LF@dc.hhhl.cc
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 overflow-hidden rounded-[8px] border bg-card/75 text-center shadow-sm backdrop-blur md:min-w-[360px]">
              <div className="flex flex-col gap-1 border-r px-4 py-3">
                <span className="font-heading text-2xl leading-none">
                  {themeStats.total}
                </span>
                <span className="text-xs text-muted-foreground">主题</span>
              </div>
              <div className="flex flex-col gap-1 border-r px-4 py-3">
                <span className="font-heading text-2xl leading-none">
                  {themeStats.dark}
                </span>
                <span className="text-xs text-muted-foreground">深色</span>
              </div>
              <div className="flex flex-col gap-1 px-4 py-3">
                <span className="font-heading text-2xl leading-none">
                  {themeStats.light}
                </span>
                <span className="text-xs text-muted-foreground">浅色</span>
              </div>
            </div>
          </header>

          <section className="mx-auto grid w-full max-w-[1500px] gap-5 px-4 pb-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_430px] lg:px-8">
            <div className="flex min-w-0 flex-col gap-4">
              <div className="toolbar-panel flex flex-col gap-3 rounded-[8px] border bg-card/80 p-3 shadow-sm backdrop-blur lg:flex-row lg:items-center lg:justify-between">
                <div className="relative min-w-0 flex-1">
                  <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    className="h-10 rounded-[7px] pl-9"
                    placeholder="搜索颜色、风格、主题名"
                    aria-label="搜索主题"
                  />
                </div>

                <Tabs
                  value={filter}
                  onValueChange={(value) => setFilter(value as FilterMode)}
                >
                  <TabsList variant="default" className="grid w-full grid-cols-3">
                    <TabsTrigger value="all">
                      <PaletteIcon data-icon="inline-start" />
                      {FILTER_LABELS.all}
                    </TabsTrigger>
                    <TabsTrigger value="dark">
                      <MoonIcon data-icon="inline-start" />
                      {FILTER_LABELS.dark}
                    </TabsTrigger>
                    <TabsTrigger value="light">
                      <SunIcon data-icon="inline-start" />
                      {FILTER_LABELS.light}
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="theme-grid">
                {filteredThemes.map((entry) => {
                  const isSelected = entry.theme.id === selectedTheme.theme.id
                  const isCopied = copiedId === entry.theme.id

                  return (
                    <Card
                      key={entry.theme.id}
                      role="button"
                      tabIndex={0}
                      aria-pressed={isSelected}
                      data-selected={isSelected}
                      className="theme-card rounded-[8px]"
                      style={getPreviewStyle(entry)}
                      onClick={() => setSelectedId(entry.theme.id)}
                      onKeyDown={(event) => handleCardKeyDown(event, entry)}
                    >
                      <CardHeader className="relative">
                        <CardAction>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon-sm"
                                variant={isSelected ? "default" : "outline"}
                                aria-label={`复制 ${entry.theme.name}`}
                                onClick={(event) => {
                                  event.stopPropagation()
                                  void handleCopy(entry)
                                }}
                              >
                                {isCopied ? (
                                  <CheckIcon data-icon="inline-start" />
                                ) : (
                                  <CopyIcon data-icon="inline-start" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>复制主题代码</TooltipContent>
                          </Tooltip>
                        </CardAction>
                        <div className="flex min-w-0 flex-col gap-1 pr-10">
                          <CardTitle className="truncate">
                            {entry.theme.name}
                          </CardTitle>
                          <CardDescription className="truncate">
                            {entry.style} / {entry.mood}
                          </CardDescription>
                        </div>
                      </CardHeader>

                      <CardContent className="relative">
                        <div className="theme-preview" aria-hidden="true">
                          <div className="preview-rail">
                            <span />
                            <span />
                            <span />
                          </div>
                          <div className="preview-feed">
                            <span className="preview-chip" />
                            <span className="preview-line wide" />
                            <span className="preview-line" />
                            <span className="preview-button" />
                          </div>
                        </div>
                      </CardContent>

                      <CardFooter className="relative flex flex-wrap gap-2 rounded-b-[8px]">
                        <Badge variant="secondary">
                          {entry.theme.base === "dark" ? "Dark" : "Light"}
                        </Badge>
                        {entry.tags.slice(1).map((tag) => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </CardFooter>
                    </Card>
                  )
                })}
              </div>
            </div>

            <aside className="sticky-panel flex min-w-0 flex-col gap-4">
              <div
                className="selected-preview rounded-[8px] border p-4 shadow-sm"
                style={getPreviewStyle(selectedTheme)}
              >
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap gap-2">
                      <Badge variant="outline">
                        {selectedTheme.theme.base === "dark" ? "Dark" : "Light"}
                      </Badge>
                      <Badge variant="secondary">{selectedTheme.style}</Badge>
                    </div>
                    <h2 className="font-heading text-3xl leading-none font-semibold">
                      {selectedTheme.theme.name}
                    </h2>
                  </div>
                  <SparklesIcon className="mt-1 size-5 shrink-0 text-muted-foreground" />
                </div>

                <div className="selected-window" aria-hidden="true">
                  <div className="selected-nav">
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className="selected-content">
                    <span className="selected-avatar" />
                    <div className="selected-lines">
                      <span />
                      <span />
                      <span />
                    </div>
                    <span className="selected-accent" />
                  </div>
                </div>
              </div>

              <div className="code-panel flex min-h-0 flex-col rounded-[8px] border bg-card/90 shadow-sm backdrop-blur">
                <div className="flex items-center justify-between gap-3 border-b p-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <Code2Icon className="size-4 text-muted-foreground" />
                    <span className="truncate text-sm font-medium">
                      {selectedTheme.theme.id}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => void handleCopy(selectedTheme)}
                    className={cn(copiedId === selectedTheme.theme.id && "copy-ok")}
                  >
                    {copiedId === selectedTheme.theme.id ? (
                      <CheckIcon data-icon="inline-start" />
                    ) : (
                      <CopyIcon data-icon="inline-start" />
                    )}
                    复制主题
                  </Button>
                </div>

                <ScrollArea className="code-scroll min-h-0">
                  <pre className="p-4 font-mono text-xs leading-5">
                    <code>{selectedCode}</code>
                  </pre>
                </ScrollArea>
              </div>
            </aside>
          </section>
        </div>
      </main>
      <Toaster position="top-center" richColors />
    </TooltipProvider>
  )
}

export default App
