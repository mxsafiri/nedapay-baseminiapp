'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

export interface Offer {
  id: string;
  title: string;
  description: string;
  discount: number;
  code: string;
  template: string;
  pointsPerDollar: number;
  nftMilestone: number;
  redemptionRate: number;
  redemptionValue: number;
  colorTheme: string;
  logo?: File | null;
  createdAt: Date;
  expiryDate?: Date;
  isActive: boolean;
  usageCount: number;
  maxUsage?: number;
}

export interface PointsTransaction {
  id: string;
  type: 'earned' | 'redeemed' | 'bonus';
  amount: number;
  description: string;
  offerId?: string;
  timestamp: Date;
}

export interface UserPoints {
  totalPoints: number;
  lifetimeEarned: number;
  lifetimeRedeemed: number;
  transactions: PointsTransaction[];
}

interface OffersContextType {
  offers: Offer[];
  addOffer: (offer: Omit<Offer, 'id' | 'createdAt' | 'usageCount'>) => void;
  updateOffer: (id: string, updates: Partial<Offer>) => void;
  deleteOffer: (id: string) => void;
  getActiveOffers: () => Offer[];
  
  // Points management
  userPoints: UserPoints;
  addPoints: (amount: number, description: string, offerId?: string) => void;
  redeemPoints: (amount: number, description: string) => boolean;
  addBonusPoints: (amount: number, description: string) => void;
  getPointsHistory: () => PointsTransaction[];
  
  // Purchase simulation for earning points
  simulatePurchase: (offerId: string, purchaseAmount: number) => void;
}

const OffersContext = createContext<OffersContextType | undefined>(undefined);

export function OffersProvider({ children }: { children: ReactNode }) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [userPoints, setUserPoints] = useState<UserPoints>({
    totalPoints: 0, // Start with 0 - users earn points through real activity
    lifetimeEarned: 0,
    lifetimeRedeemed: 0,
    transactions: [] // Clean slate - no mock transactions
  });

  const addOffer = (offerData: Omit<Offer, 'id' | 'createdAt' | 'usageCount'>) => {
    const newOffer: Offer = {
      ...offerData,
      id: `offer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      usageCount: 0,
    };
    setOffers(prev => [newOffer, ...prev]);
  };

  const updateOffer = (id: string, updates: Partial<Offer>) => {
    setOffers(prev => prev.map(offer => 
      offer.id === id ? { ...offer, ...updates } : offer
    ));
  };

  const deleteOffer = (id: string) => {
    setOffers(prev => prev.filter(offer => offer.id !== id));
  };

  const getActiveOffers = () => {
    return offers.filter(offer => offer.isActive);
  };

  // Points management functions
  const addPoints = (amount: number, description: string, offerId?: string) => {
    const transaction: PointsTransaction = {
      id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'earned',
      amount,
      description,
      offerId,
      timestamp: new Date()
    };

    setUserPoints(prev => ({
      totalPoints: prev.totalPoints + amount,
      lifetimeEarned: prev.lifetimeEarned + amount,
      lifetimeRedeemed: prev.lifetimeRedeemed,
      transactions: [transaction, ...prev.transactions]
    }));
  };

  const redeemPoints = (amount: number, description: string): boolean => {
    if (userPoints.totalPoints < amount) {
      return false; // Insufficient points
    }

    const transaction: PointsTransaction = {
      id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'redeemed',
      amount: -amount,
      description,
      timestamp: new Date()
    };

    setUserPoints(prev => ({
      totalPoints: prev.totalPoints - amount,
      lifetimeEarned: prev.lifetimeEarned,
      lifetimeRedeemed: prev.lifetimeRedeemed + amount,
      transactions: [transaction, ...prev.transactions]
    }));

    return true;
  };

  const addBonusPoints = (amount: number, description: string) => {
    const transaction: PointsTransaction = {
      id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'bonus',
      amount,
      description,
      timestamp: new Date()
    };

    setUserPoints(prev => ({
      totalPoints: prev.totalPoints + amount,
      lifetimeEarned: prev.lifetimeEarned + amount,
      lifetimeRedeemed: prev.lifetimeRedeemed,
      transactions: [transaction, ...prev.transactions]
    }));
  };

  const getPointsHistory = (): PointsTransaction[] => {
    return userPoints.transactions;
  };

  // Purchase simulation for earning points
  const simulatePurchase = (offerId: string, purchaseAmount: number) => {
    const offer = offers.find(o => o.id === offerId);
    if (!offer || !offer.isActive) {
      return; // Offer not found or inactive
    }

    // Calculate points earned based on offer's pointsPerDollar rate
    const pointsEarned = Math.floor(purchaseAmount * offer.pointsPerDollar);
    
    // Add points transaction
    const transaction: PointsTransaction = {
      id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'earned',
      amount: pointsEarned,
      description: `Purchase: ${offer.title} - $${purchaseAmount} USDC`,
      offerId: offer.id,
      timestamp: new Date()
    };

    setUserPoints(prev => ({
      totalPoints: prev.totalPoints + pointsEarned,
      lifetimeEarned: prev.lifetimeEarned + pointsEarned,
      lifetimeRedeemed: prev.lifetimeRedeemed,
      transactions: [transaction, ...prev.transactions]
    }));

    // Update offer usage count
    updateOffer(offerId, {
      usageCount: offer.usageCount + 1
    });
  };

  return (
    <OffersContext.Provider value={{
      offers,
      addOffer,
      updateOffer,
      deleteOffer,
      getActiveOffers,
      
      // Points management
      userPoints,
      addPoints,
      redeemPoints,
      addBonusPoints,
      getPointsHistory,
      
      // Purchase simulation
      simulatePurchase,
    }}>
      {children}
    </OffersContext.Provider>
  );
}

export function useOffers() {
  const context = useContext(OffersContext);
  if (context === undefined) {
    throw new Error('useOffers must be used within an OffersProvider');
  }
  return context;
}
