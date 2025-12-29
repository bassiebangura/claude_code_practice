"use client";

import dynamic from "next/dynamic";

const MainContent = dynamic(
  () => import("./main-content").then((mod) => mod.MainContent),
  { ssr: false }
);

interface MainContentWrapperProps {
  user?: {
    id: string;
    email: string;
  } | null;
  project?: {
    id: string;
    name: string;
    messages: any[];
    data: any;
    createdAt: Date;
    updatedAt: Date;
  };
}

export function MainContentWrapper({ user, project }: MainContentWrapperProps) {
  return <MainContent user={user} project={project} />;
}
