"use client";

import { useAdminInfiniteSurveyQuestions } from "../../hooks/useAdminSurveyQuestion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMemo } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";

interface QuestionListProps {
  surveyId: string;
}

export const QuestionList = ({ surveyId }: QuestionListProps) => {
  const { isLoggedIn, loading: authLoading } = useAuth();
  const shouldFetch = isLoggedIn && !authLoading;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    totalCount,
    isLoading,
    isError,
  } = useAdminInfiniteSurveyQuestions(surveyId, shouldFetch);

  const allQuestions = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) || [];
  }, [data]);

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading questions...</p>;
  if (isError) return <p className="text-sm text-destructive">Failed to load questions.</p>;

  return (
    <div className="space-y-3">
      {allQuestions.map((q, index) => (
        <Card key={q.id} className="text-foreground p-0">
          <CardContent className="p-4 space-y-2">
            <p className="text-sm font-semibold">
              {index + 1}. {q.teks_pertanyaan}
            </p>
            <p className="text-xs text-muted-foreground">
              Type: {q.tipe_pertanyaan} • Required: {q.is_required ? "Yes" : "No"}
            </p>

            {q.opsi && Array.isArray(q.opsi) && q.opsi.length > 0 ? (
              <div>
                <p className="text-sm font-medium">Options:</p>
                <ul className="list-disc list-inside text-sm text-muted-foreground pl-4">
                  {q.opsi.map((opsi: string, idx: number) => (
                    <li key={idx}>{opsi}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm italic text-muted-foreground">No options provided.</p>
            )}
          </CardContent>
        </Card>
      ))}

      {hasNextPage && (
        <div className="flex flex-col w-full items-center gap-2 mb-4">
          <span className="text-xs text-muted-foreground">
            Showing {allQuestions.length} of {totalCount} questions
            ({totalCount - allQuestions.length} remaining)
          </span>
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="w-fit sm:text-sm text-xs"
          >
            {isFetchingNextPage ? "Loading..." : "Load more"}
          </Button>
        </div>
      )}
    </div>
  );
};
