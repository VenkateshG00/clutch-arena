'use client'

import { type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-[#181D30] flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-[#94A3B8]" />
      </div>
      <h3 className="text-lg font-semibold text-[#F8FAFC] mb-2">{title}</h3>
      <p className="text-sm text-[#94A3B8] max-w-sm mb-6">{description}</p>
      {action && (
        <Button onClick={action.onClick} className="bg-[#8B5CF6] hover:bg-[#7C3AED]">
          {action.label}
        </Button>
      )}
    </div>
  )
}
