'use client';

import PageLayout from '@/components/layout/PageLayout';
import WorkspacePage from '@/components/workspace/WorkspacePage';

export default function WorkspaceRoute() {
  return (
    <PageLayout currentPage="workspace">
      <WorkspacePage />
    </PageLayout>
  );
}
