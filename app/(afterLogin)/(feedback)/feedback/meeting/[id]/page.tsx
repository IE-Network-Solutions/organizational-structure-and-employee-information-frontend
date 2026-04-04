import { redirect } from 'next/navigation';

interface PageProps {
  params: { id: string };
}

export default function MeetingIdRedirectPage({ params }: PageProps) {
  redirect(`/feedback/meeting?id=${encodeURIComponent(params.id)}`);
}
