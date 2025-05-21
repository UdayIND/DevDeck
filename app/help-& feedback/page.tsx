import { redirect } from 'next/navigation';
export default function LegacyHelpFeedback() {
  redirect('/help-and-feedback');
  return null;
} 