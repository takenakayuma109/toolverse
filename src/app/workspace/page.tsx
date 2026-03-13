import type { Metadata } from 'next';
import WorkspacePage from '@/components/workspace/WorkspacePage';

export const metadata: Metadata = {
  title: 'Workspace - Toolverse',
  description:
    'Your personal workspace on Toolverse. Manage your tools, projects, and settings.',
};

export default function WorkspaceRoute() {
  return <WorkspacePage />;
}
