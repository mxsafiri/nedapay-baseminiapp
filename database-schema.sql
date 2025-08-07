-- NedaPay Base MiniApp Database Schema
-- Run this SQL in your Supabase SQL Editor to create the required tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create merchants table
CREATE TABLE IF NOT EXISTS public.merchants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT,
    wallet_address TEXT,
    business_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create offers table
CREATE TABLE IF NOT EXISTS public.offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID REFERENCES public.merchants(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    discount_percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
    code TEXT NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE,
    redemptions INTEGER DEFAULT 0,
    max_redemptions INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID REFERENCES public.merchants(id) ON DELETE CASCADE,
    customer_wallet TEXT,
    amount NUMERIC(18,8) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USDC',
    status TEXT NOT NULL DEFAULT 'pending',
    transaction_hash TEXT,
    offer_id UUID REFERENCES public.offers(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_merchants_wallet_address ON public.merchants(wallet_address);
CREATE INDEX IF NOT EXISTS idx_merchants_email ON public.merchants(email);
CREATE INDEX IF NOT EXISTS idx_offers_merchant_id ON public.offers(merchant_id);
CREATE INDEX IF NOT EXISTS idx_offers_code ON public.offers(code);
CREATE INDEX IF NOT EXISTS idx_offers_is_active ON public.offers(is_active);
CREATE INDEX IF NOT EXISTS idx_transactions_merchant_id ON public.transactions(merchant_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_customer_wallet ON public.transactions(customer_wallet);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_merchants_updated_at 
    BEFORE UPDATE ON public.merchants 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_offers_updated_at 
    BEFORE UPDATE ON public.offers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic policies - you can customize these)
-- Allow users to read all merchants (for public directory)
CREATE POLICY "Allow public read access to merchants" ON public.merchants
    FOR SELECT USING (true);

-- Allow users to insert their own merchant record
CREATE POLICY "Allow users to insert own merchant record" ON public.merchants
    FOR INSERT WITH CHECK (true);

-- Allow users to update their own merchant record
CREATE POLICY "Allow users to update own merchant record" ON public.merchants
    FOR UPDATE USING (true);

-- Allow public read access to active offers
CREATE POLICY "Allow public read access to active offers" ON public.offers
    FOR SELECT USING (is_active = true);

-- Allow merchants to manage their own offers
CREATE POLICY "Allow merchants to manage own offers" ON public.offers
    FOR ALL USING (true);

-- Allow public read access to transactions (you may want to restrict this)
CREATE POLICY "Allow public read access to transactions" ON public.transactions
    FOR SELECT USING (true);

-- Allow users to insert transactions
CREATE POLICY "Allow users to insert transactions" ON public.transactions
    FOR INSERT WITH CHECK (true);

-- Insert some sample data for testing
INSERT INTO public.merchants (id, email, wallet_address, business_name) VALUES 
    ('550e8400-e29b-41d4-a716-446655440000', 'demo@nedapay.com', '0xDemo123...', 'Demo Merchant')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.offers (merchant_id, title, description, discount_percentage, code, max_redemptions) VALUES 
    ('550e8400-e29b-41d4-a716-446655440000', 'Welcome Offer', 'Get 10% off your first purchase', 10.00, 'WELCOME10', 100)
ON CONFLICT (code) DO NOTHING;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Success message
SELECT 'NedaPay database schema created successfully!' as message;
