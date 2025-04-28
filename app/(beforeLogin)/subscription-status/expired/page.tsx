'use client';
import { useGetSubscriptions } from '@/store/server/features/tenant-management/subscriptions/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { Button } from 'antd';

function SubscriptionExpired() {
  const { tenantId } = useAuthenticationStore();
  const { data: subscriptionsData, isLoading: subscriptionsLoading } =
    useGetSubscriptions(
      {
        filter: {
          tenantId: [tenantId],
        },
      },
      true,
      true,
    );
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '50px',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div className="flex justify-center">
        <img
          src="https://media-hosting.imagekit.io/44b13ecf0a4d46a5/screenshot_1745081481481.png?Expires=1839689482&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=mOOZNt9a-CL~SI7wd1EJyCwBaoTtAmv3XmVv83gXq3tf2~8NZLwyYlSg9qSLLGQKmS3aiKOB2mp0BrHoR3h1F8m8sXYOwBRGGOdfMm3KRRYhRrFZwsCoO1xhIpIRDV2AKiZk9x1B~P-gZqjXrg2xasygxiZ0RbvcvGV6GrOs2~quSHB9qjmDFvY1U8CH8~ugQqJaxVwPi3RLvesxOyUssvJv0AOoXMYRXnsS43xY5mktocpCr0tefAYyi3DJ9hZoS2RAfKlh43Xr1xP4c15NIVw8G6bdVSmQsSatWzy8yOS7Yr0tqQUtSMQFquScTFfKVauNFErOqxpqyPkF-ZmHtw__"
          alt="Subscription Expired"
          width="200"
          style={{ marginBottom: '20px', borderRadius: '10px' }}
        />
      </div>
      <h1 style={{ color: '#FF6F61' }}>Your Subscription Has Expired</h1>
      <p style={{ fontSize: '18px', color: '#555' }}>
        To continue enjoying our services, please renew your subscription or
        explore other plans.
      </p>
      <div style={{ marginTop: '30px' }}>
        <Button
          type="primary"
          style={{
            backgroundColor: '#FF6F61',
            borderColor: '#FF6F61',
            marginRight: '10px',
          }}
          //   onClick={() => alert('Renew Plan')}
        >
          Renew Current Plan
        </Button>
        <Button
          type="primary"
          // onClick={() => alert('Go to Plans')}
        >
          View Other Plans
        </Button>
      </div>
    </div>
  );
}

export default SubscriptionExpired;
