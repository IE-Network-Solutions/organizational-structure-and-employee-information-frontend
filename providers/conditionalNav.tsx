'use client';
import { usePathname } from 'next/navigation';
import Nav from '@/components/navBar';
import React from 'react';

/**
 * ConditionalNav component that conditionally renders the Nav component
 * based on the current pathname.
 *
 * @param children The child components to be rendered
 * @returns The Nav component with children inside, or just the children if the pathname is excluded
 */
const ConditionalNav: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const pathname = usePathname();
  const excludeNavPaths = [
    '/authentication/login',
    '/authentication/forgetPassword',
    '/onboarding',
    '/signup',
    '/not-found',
    '/surveys/[id]',
    '/job/[tenantID]/[jobId]',
  ];

  return (
    <>{excludeNavPaths.includes(pathname) ? children : <Nav>{children}</Nav>}</>
  );
};

export default ConditionalNav;
