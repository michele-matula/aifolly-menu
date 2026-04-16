import { Suspense } from 'react';
import PendingContent from './pending-content';

export default function SignupPendingPage() {
  return (
    <Suspense>
      <PendingContent />
    </Suspense>
  );
}
