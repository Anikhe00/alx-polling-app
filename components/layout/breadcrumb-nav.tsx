import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronRight, Home } from "lucide-react"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbNavProps {
  items: BreadcrumbItem[]
}

export function BreadcrumbNav({ items }: BreadcrumbNavProps) {
  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
      <Link href="/dashboard">
        <Button variant="ghost" size="sm" className="h-6 px-2">
          <Home className="h-3 w-3" />
        </Button>
      </Link>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-1">
          <ChevronRight className="h-4 w-4" />
          {item.href ? (
            <Link href={item.href}>
              <Button variant="ghost" size="sm" className="h-6 px-2">
                {item.label}
              </Button>
            </Link>
          ) : (
            <span className="px-2 font-medium text-foreground">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  )
}

