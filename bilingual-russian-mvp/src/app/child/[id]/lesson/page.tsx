"use client";

import { Suspense } from "react";
import { LoadingScreen } from "@/components/ui";
import LessonPageInner from "./LessonInner";

export default function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <LessonPageInner params={params} />
    </Suspense>
  );
}
