import { Metadata } from 'next';
import PromoPageClient from './PromoPageClient';

interface PageProps {
  params: {
    offerId: string;
  };
  searchParams: {
    code?: string;
    merchant?: string;
  };
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const merchantName = searchParams.merchant || 'Merchant';
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const currentUrl = `${baseUrl}/promo/${params.offerId}?merchant=${encodeURIComponent(merchantName)}`;

  return {
    title: `Special Offer at ${merchantName} | NEDApay`,
    description: `Check out this amazing deal at ${merchantName}! Powered by NEDApay.`,
    openGraph: {
      title: `Special Offer at ${merchantName}`,
      description: `Check out this amazing deal at ${merchantName}!`,
      type: 'website',
      url: currentUrl,
    },
    twitter: {
      card: 'summary_large_image',
      title: `Special Offer at ${merchantName}`,
      description: `Check out this amazing deal at ${merchantName}!`,
    },
    other: {
      // Farcaster Frame metadata
      'fc:frame': 'vNext',
      'fc:frame:image': `${baseUrl}/api/og/promo/${params.offerId}`,
      'fc:frame:button:1': 'Copy Code',
      'fc:frame:button:1:action': 'post',
      'fc:frame:button:1:target': `${baseUrl}/api/frame/copy-code/${params.offerId}`,
      'fc:frame:button:2': 'Visit Store',
      'fc:frame:button:2:action': 'link',
      'fc:frame:button:2:target': currentUrl,
      'fc:frame:post_url': `${baseUrl}/api/frame/promo/${params.offerId}`,
    },
  };
}

export default function PromoPage({ params, searchParams }: PageProps) {
  return (
    <PromoPageClient 
      offerId={params.offerId}
      merchantName={searchParams.merchant || 'Your Business'}
    />
  );
}
