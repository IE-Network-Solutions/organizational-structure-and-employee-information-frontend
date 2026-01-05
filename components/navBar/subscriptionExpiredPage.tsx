import React from 'react';
import { Button } from 'antd';
import { useRouter } from 'next/navigation';

const SubscriptionExpiredPage: React.FC<any> = ({ isAdmin }) => {
  const router = useRouter();

  return (
    <div
      className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4"
      data-cy="subscription-expired-page"
    >
      {/* Header */}
      <div className="mb-8 text-center" data-cy="subscription-expired-header">
        <h1 className="text-2xl font-bold" data-cy="subscription-expired-title">
          <span
            className="text-black"
            data-cy="subscription-expired-title-selamnew"
          >
            Selamnew
          </span>
          <span
            className="text-blue"
            data-cy="subscription-expired-title-workspace"
          >
            {' '}
            Workspace
          </span>
        </h1>
      </div>

      {/* Main Content Card */}
      <div
        className="bg-white rounded-lg p-8 max-w-lg     w-full text-center shadow-lg"
        data-cy="subscription-expired-content-card"
      >
        {/* Warning Icon */}
        <div
          className="mb-6"
          data-cy="subscription-expired-warning-icon-container"
        >
          <div
            className="w-16 h-16 mx-auto bg-yellow-100 rounded-full flex items-center justify-center animate-pulse"
            data-cy="subscription-expired-warning-icon-outer"
          >
            <div
              className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center"
              data-cy="subscription-expired-warning-icon-inner"
            >
              <span
                className="text-white font-bold text-lg"
                data-cy="subscription-expired-warning-icon-text"
              >
                !
              </span>
            </div>
          </div>
        </div>

        {/* Main Heading */}
        <h1
          className="text-black font-bold text-xl mb-4"
          data-cy="subscription-expired-main-heading"
        >
          Subscription Expired
        </h1>

        {/* Description */}
        <p
          className="text-gray-700 mb-6"
          data-cy="subscription-expired-description"
        >
          Your subscription has expired and you no longer have access to this
          application.
        </p>

        {/* Possible Reasons */}
        <div
          className="text-left mb-6"
          data-cy="subscription-expired-reasons-container"
        >
          <p
            className="text-black mb-3"
            data-cy="subscription-expired-reasons-title"
          >
            This could be because:
          </p>
          <ul
            className="text-gray-700 space-y-2"
            data-cy="subscription-expired-reasons-list"
          >
            <li
              className="flex items-start"
              data-cy="subscription-expired-reason-1"
            >
              <span
                className="text-gray-500 mr-2"
                data-cy="subscription-expired-reason-1-bullet"
              >
                •
              </span>
              Your subscription period has ended
            </li>
            <li
              className="flex items-start"
              data-cy="subscription-expired-reason-2"
            >
              <span
                className="text-gray-500 mr-2"
                data-cy="subscription-expired-reason-2-bullet"
              >
                •
              </span>
              Payment was not processed successfully
            </li>
            <li
              className="flex items-start"
              data-cy="subscription-expired-reason-3"
            >
              <span
                className="text-gray-500 mr-2"
                data-cy="subscription-expired-reason-3-bullet"
              >
                •
              </span>
              Your account has been suspended
            </li>
          </ul>
        </div>

        {/* Call to Action */}
        <p
          className="text-gray-700 mb-6"
          data-cy="subscription-expired-call-to-action"
        >
          To continue using this application, please renew your subscription.
        </p>

        {/* Action Buttons */}
        <div className="space-y-3" data-cy="subscription-expired-actions">
          {isAdmin && (
            <Button
              size="middle"
              className="w-64 text-white bg-blue hover:bg-blue-700 border-blue-600 border-none"
              onClick={() => router.push('/admin/dashboard')}
            >
              Renew Subscription
            </Button>
          )}
        </div>

        {/* Footer */}
        <div
          className="mt-8 pt-6 border-t border-gray-200"
          data-cy="subscription-expired-footer"
        >
          <p
            className="text-gray-600"
            data-cy="subscription-expired-footer-text"
          >
            Make sure to reach out if you are facing any issues at:{' '}
            <button
              className="text-blue-600 underline hover:text-blue-700"
              onClick={() => router.push('/admin/profile')}
              data-cy="subscription-expired-footer-link"
            >
              The selamnew team link
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionExpiredPage;
