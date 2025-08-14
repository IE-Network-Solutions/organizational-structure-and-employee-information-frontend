import React from 'react';
import { Button } from 'antd';
import { useRouter } from 'next/navigation';

const SubscriptionExpiredPage: React.FC<any> = ({ isAdmin }) => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold">
          <span className="text-black">Selamnew</span>
          <span className="text-blue"> Workspace</span>
        </h1>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-lg p-8 max-w-lg     w-full text-center shadow-lg">
        {/* Warning Icon */}
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto bg-yellow-100 rounded-full flex items-center justify-center animate-pulse">
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">!</span>
            </div>
          </div>
        </div>

        {/* Main Heading */}
        <h1 className="text-black font-bold text-xl mb-4">
          Subscription Expired
        </h1>

        {/* Description */}
        <p className="text-gray-700 mb-6">
          Your subscription has expired and you no longer have access to this
          application.
        </p>

        {/* Possible Reasons */}
        <div className="text-left mb-6">
          <p className="text-black mb-3">This could be because:</p>
          <ul className="text-gray-700 space-y-2">
            <li className="flex items-start">
              <span className="text-gray-500 mr-2">•</span>
              Your subscription period has ended
            </li>
            <li className="flex items-start">
              <span className="text-gray-500 mr-2">•</span>
              Payment was not processed successfully
            </li>
            <li className="flex items-start">
              <span className="text-gray-500 mr-2">•</span>
              Your account has been suspended
            </li>
          </ul>
        </div>

        {/* Call to Action */}
        <p className="text-gray-700 mb-6">
          To continue using this application, please renew your subscription.
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
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
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-gray-600">
            Make sure to reach out if you are facing any issues at:{' '}
            <button
              className="text-blue-600 underline hover:text-blue-700"
              onClick={() => router.push('/admin/profile')}
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
