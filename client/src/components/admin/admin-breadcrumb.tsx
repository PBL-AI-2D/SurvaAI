'use client'

import Link from 'next/link'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import React from 'react'

export type BreadcrumbItemType = {
  label: string
  href?: string
  icon?: React.ReactNode
}

interface PageBreadcrumbProps {
  items: BreadcrumbItemType[]
}

export function AdminBreadcrumb({ items }: PageBreadcrumbProps) {
  if (!items?.length) return null

  const lastIndex = items.length - 1

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => {
          const isLast = index === lastIndex
          const Content = (
            <span className="inline-flex justify-center items-center gap-2">
              {item.icon && <span className="size-4">{item.icon}</span>}
              <span>{item.label}</span>
            </span>
          )

          return (
            <React.Fragment key={index}>
              <BreadcrumbItem>
                {isLast || !item.href ? (
                  <BreadcrumbPage>{Content}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={item.href}>{Content}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
