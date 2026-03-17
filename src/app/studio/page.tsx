'use client';

import PageLayout from '@/components/layout/PageLayout';
import ToolStudioPage from '@/components/studio/ToolStudioPage';

export default function StudioPage() {
  return (
    <PageLayout currentPage="studio">
      <ToolStudioPage />
    </PageLayout>
  );
}
