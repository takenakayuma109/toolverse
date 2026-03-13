import type { Metadata } from 'next';
import ToolStudioPage from '@/components/studio/ToolStudioPage';

export const metadata: Metadata = {
  title: 'Tool Studio - Toolverse',
  description:
    'Create, manage, and publish your tools on the Toolverse platform.',
};

export default function StudioPage() {
  return <ToolStudioPage />;
}
