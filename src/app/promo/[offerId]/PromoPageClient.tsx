'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import CustomerPromoPage from '@/components/CustomerPromoPage';
import { useOffers } from '@/contexts/OffersContext';
import { Offer } from '@/contexts/OffersContext';

interface PromoPageClientProps {
  offerId: string;
  merchantName: string;
}

export default function PromoPageClient({ offerId, merchantName }: PromoPageClientProps) {
  const { offers } = useOffers();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Find the offer by ID from your real promo wizard data
    const foundOffer = offers.find(o => o.id === offerId);
    
    if (foundOffer && foundOffer.isActive) {
      setOffer(foundOffer);
    } else {
      setOffer(null);
    }
    
    setLoading(false);
  }, [offerId, offers]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!offer) {
    notFound();
  }

  return (
    <CustomerPromoPage 
      offer={offer} 
      merchantName={merchantName}
    />
  );
}
