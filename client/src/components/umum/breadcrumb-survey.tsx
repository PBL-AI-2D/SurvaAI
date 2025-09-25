'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useIsMobile } from '@/hooks/useMobile';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useUserSurvey } from '@/features/survey/hooks/useUserSurveys';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Newspaper, SlashIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react';

interface SurveyBreadcrumbNavProps {
  surveyId: string;
}

const NAV_OPTIONS = [
  { label: 'Edit', href: '/manage-survey/edit' },
  { label: 'Overview', href: '/manage-survey/overview' },
  { label: 'Responses', href: '/manage-survey/responses' },
  { label: 'Analysis', href: '/manage-survey/analysis' },
];

const ALLOWED_STATUSES = ['published', 'closed', 'archived'];

export function SurveyBreadcrumbNav({ surveyId }: SurveyBreadcrumbNavProps) {
  const pathname = usePathname();
  const isMobile = useIsMobile();

  const { isLoggedIn, loading: authLoading } = useAuth();
  const shouldFetch = isLoggedIn && !authLoading;
  const { data: survey, isLoading, isError } = useUserSurvey(surveyId, shouldFetch);

  if (isLoading || isError || !survey) return null;

  const isAllowedStatus = ALLOWED_STATUSES.includes(survey.status);
  const visibleNav = isAllowedStatus
    ? NAV_OPTIONS
    : NAV_OPTIONS.filter((item) => item.label === 'Edit');

  const active = visibleNav.find((item) =>
    pathname.startsWith(`${item.href}/${surveyId}`)
  );

  return (
    <Breadcrumb
      className="mt-2 select-none bg-background/60 backdrop-blur-md px-3 py-1 rounded-lg border border-border shadow-sm"
      style={{
        background: 'var(--glass-background)',
        borderColor: 'var(--glass-border)',
      }}
    >
      <BreadcrumbList className="flex flex-wrap gap-2 items-center">

        <Newspaper className="w-4 h-4"/>

        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/manage-survey">Manage Survey</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbSeparator />

        {isMobile ? (
          <BreadcrumbItem>
            <DropdownMenu>
              <DropdownMenuTrigger className="cursor-pointer flex gap-2 items-center text-foreground font-medium">
                {active?.label ?? 'Select'} <ChevronDown className="w-4 h-4"/>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {visibleNav.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link href={`${item.href}/${surveyId}`}>{item.label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </BreadcrumbItem>
        ) : (
          visibleNav.map((item, index) => {
            const isActive = pathname.startsWith(`${item.href}/${surveyId}`);
            const isLast = index === visibleNav.length - 1;

            return (
              <React.Fragment key={item.href}>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link
                      href={`${item.href}/${surveyId}`}
                      className={cn(
                        'font-semibold text-sm',
                        isActive ? 'text-foreground' : 'text-muted-foreground'
                      )}
                    >
                      {item.label}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {!isLast && (
                  <BreadcrumbSeparator>
                    <SlashIcon className="text-muted-foreground" />
                  </BreadcrumbSeparator>
                )}
              </React.Fragment>
            );
          })
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
