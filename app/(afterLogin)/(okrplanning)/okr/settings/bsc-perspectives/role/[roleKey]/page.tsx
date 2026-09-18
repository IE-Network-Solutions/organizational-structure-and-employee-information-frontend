import { redirect } from 'next/navigation';

export default function RedirectLegacyPerspectiveRolePage({
  params,
}: {
  params: { roleKey: string };
}) {
  redirect(
    `/okr/settings/bsc-perspective-assignment/role/${encodeURIComponent(params.roleKey)}`,
  );
}
