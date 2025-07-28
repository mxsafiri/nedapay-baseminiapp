import CustomerRewardsHub from '@/components/CustomerRewardsHub';

interface RewardsPageProps {
  params: {
    merchantId: string;
  };
  searchParams: {
    merchant?: string;
    logo?: string;
  };
}

export default function RewardsPage({ params, searchParams }: RewardsPageProps) {
  const merchantName = searchParams.merchant || 'Coffee Corner';
  const merchantLogo = searchParams.logo || '/merchant-logo.png';

  return (
    <CustomerRewardsHub 
      merchantName={merchantName}
      merchantLogo={merchantLogo}
    />
  );
}

export async function generateMetadata({ params, searchParams }: RewardsPageProps) {
  const merchantName = searchParams.merchant || 'Merchant';
  
  return {
    title: `${merchantName} Rewards - NEDApay`,
    description: `Earn points, collect NFTs, and redeem rewards at ${merchantName}`,
  };
}
