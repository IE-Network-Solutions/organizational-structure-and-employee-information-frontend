import { redirect } from 'next/navigation';

/** Landing overview removed — send leftover /bsc links to My Scorecard */
export default function BscLandingRedirect() {
  redirect('/bsc/my-scorecard');
}
