-- International Business Game Database Schema
-- Designed for Supabase (PostgreSQL)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE game_status AS ENUM ('waiting_for_players', 'in_progress', 'finished', 'cancelled');
CREATE TYPE property_color AS ENUM ('BLUE', 'RED', 'GREEN', 'YELLOW', 'WHITE');
CREATE TYPE space_type AS ENUM ('property', 'start', 'jail', 'chance', 'uno', 'party_house', 'travelling_duty', 'roadways', 'custom', 'airways', 'resort', 'waterways', 'petroleum', 'railways', 'satellite');
CREATE TYPE card_type AS ENUM ('chance', 'uno');
CREATE TYPE card_action AS ENUM ('pay_money', 'receive_money', 'go_to_jail', 'submit_passport', 'make_repairs', 'win_prize', 'move_to_space', 'advance_to_go', 'get_out_of_jail_free');
CREATE TYPE transaction_type AS ENUM ('property_purchase', 'rent_payment', 'house_purchase', 'hotel_purchase', 'bidding', 'property_sale', 'bail_payment', 'pass_go', 'card_payment', 'card_receive', 'mortgage', 'unmortgage');
CREATE TYPE bidding_status AS ENUM ('active', 'completed', 'cancelled');

-- ============================================
-- STATIC DATA TABLES
-- ============================================

-- Board spaces (all squares on the board)
CREATE TABLE board_spaces (
    space_id SERIAL PRIMARY KEY,
    position INTEGER NOT NULL UNIQUE, -- Position on the board (0-39 or similar)
    name VARCHAR(100) NOT NULL,
    space_type space_type NOT NULL,
    property_color property_color, -- Only for property spaces
    base_price DECIMAL(10, 2), -- Purchase price for properties
    mortgage_value DECIMAL(10, 2), -- Mortgage value (typically half of base_price)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Properties (detailed property data)
CREATE TABLE properties (
    property_id SERIAL PRIMARY KEY,
    space_id INTEGER REFERENCES board_spaces(space_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    property_color property_color NOT NULL,
    base_price DECIMAL(10, 2) NOT NULL,
    house_price DECIMAL(10, 2) NOT NULL, -- Cost to add one house
    hotel_price DECIMAL(10, 2) NOT NULL, -- Cost to add hotel (after 3 houses)
    mortgage_value DECIMAL(10, 2) NOT NULL,
    -- Rent levels
    base_rent DECIMAL(10, 2) NOT NULL, -- Rent with no houses
    rent_1_house DECIMAL(10, 2) NOT NULL,
    rent_2_houses DECIMAL(10, 2) NOT NULL,
    rent_3_houses DECIMAL(10, 2) NOT NULL,
    rent_hotel DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Special cards (Chance and UNO cards)
CREATE TABLE special_cards (
    card_id SERIAL PRIMARY KEY,
    card_type card_type NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    card_action card_action NOT NULL,
    action_value DECIMAL(10, 2), -- For pay/receive money amounts
    target_space INTEGER, -- For move_to_space actions
    is_get_out_of_jail_free BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- GAME MANAGEMENT TABLES
-- ============================================

-- Games (Game parties)
CREATE TABLE games (
    game_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    host_player_id UUID, -- Will be set when host joins
    status game_status DEFAULT 'waiting_for_players',
    max_players INTEGER NOT NULL DEFAULT 4,
    current_player_turn_id UUID,
    turn_order UUID[], -- Array of player IDs in turn order
    join_code VARCHAR(6) UNIQUE NOT NULL,
    total_money_in_game DECIMAL(10, 2) DEFAULT 100000.00,
    starting_money_per_player DECIMAL(10, 2), -- Calculated based on player count
    current_dice_roll INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    finished_at TIMESTAMP WITH TIME ZONE
);

-- Players in a game
CREATE TABLE players (
    player_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID NOT NULL REFERENCES games(game_id) ON DELETE CASCADE,
    user_id UUID, -- Optional: Link to Supabase Auth users
    name VARCHAR(50) NOT NULL,
    money DECIMAL(10, 2) NOT NULL DEFAULT 0,
    position INTEGER NOT NULL DEFAULT 0, -- Current position on board
    in_jail BOOLEAN DEFAULT FALSE,
    jail_turns_left INTEGER DEFAULT 0,
    is_bankrupt BOOLEAN DEFAULT FALSE,
    is_host BOOLEAN DEFAULT FALSE,
    order_in_turn INTEGER NOT NULL,
    last_dice_roll INTEGER,
    has_left_game BOOLEAN DEFAULT FALSE,
    left_at TIMESTAMP WITH TIME ZONE,
    get_out_of_jail_free_cards INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(game_id, order_in_turn)
);

-- ============================================
-- PROPERTY OWNERSHIP & DEVELOPMENT
-- ============================================

-- Property ownership
CREATE TABLE property_ownership (
    ownership_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id INTEGER NOT NULL REFERENCES properties(property_id),
    player_id UUID REFERENCES players(player_id) ON DELETE SET NULL,
    game_id UUID NOT NULL REFERENCES games(game_id) ON DELETE CASCADE,
    houses_count INTEGER DEFAULT 0, -- 0-3
    has_hotel BOOLEAN DEFAULT FALSE,
    is_mortgaged BOOLEAN DEFAULT FALSE,
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(property_id, game_id)
);

-- ============================================
-- TRANSACTIONS
-- ============================================

-- All money transactions
CREATE TABLE transactions (
    transaction_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID NOT NULL REFERENCES games(game_id) ON DELETE CASCADE,
    from_player_id UUID REFERENCES players(player_id),
    to_player_id UUID REFERENCES players(player_id),
    transaction_type transaction_type NOT NULL,
    amount DECIMAL(10, 2),
    property_id INTEGER REFERENCES properties(property_id),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- BIDDING SYSTEM
-- ============================================

-- Property auctions/bidding
CREATE TABLE bidding_sessions (
    bidding_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID NOT NULL REFERENCES games(game_id) ON DELETE CASCADE,
    property_id INTEGER NOT NULL REFERENCES properties(property_id),
    seller_player_id UUID REFERENCES players(player_id), -- NULL if bank is selling
    status bidding_status DEFAULT 'active',
    minimum_bid DECIMAL(10, 2) NOT NULL,
    current_highest_bid DECIMAL(10, 2),
    current_highest_bidder_id UUID REFERENCES players(player_id),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE
);

-- Individual bids
CREATE TABLE bids (
    bid_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bidding_id UUID NOT NULL REFERENCES bidding_sessions(bidding_id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES players(player_id),
    bid_amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- GAME LOG / HISTORY
-- ============================================

-- Game events log
CREATE TABLE game_events (
    event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID NOT NULL REFERENCES games(game_id) ON DELETE CASCADE,
    player_id UUID REFERENCES players(player_id),
    event_type VARCHAR(50) NOT NULL, -- 'dice_roll', 'property_purchase', 'rent_paid', 'jail_entry', etc.
    event_data JSONB, -- Flexible storage for event-specific data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Games
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_games_join_code ON games(join_code);

-- Players
CREATE INDEX idx_players_game_id ON players(game_id);
CREATE INDEX idx_players_user_id ON players(user_id);
CREATE INDEX idx_players_is_bankrupt ON players(is_bankrupt);
CREATE INDEX idx_players_has_left_game ON players(has_left_game);

-- Property ownership
CREATE INDEX idx_property_ownership_game_id ON property_ownership(game_id);
CREATE INDEX idx_property_ownership_player_id ON property_ownership(player_id);
CREATE INDEX idx_property_ownership_property_id ON property_ownership(property_id);

-- Transactions
CREATE INDEX idx_transactions_game_id ON transactions(game_id);
CREATE INDEX idx_transactions_from_player ON transactions(from_player_id);
CREATE INDEX idx_transactions_to_player ON transactions(to_player_id);

-- Bidding
CREATE INDEX idx_bidding_sessions_game_id ON bidding_sessions(game_id);
CREATE INDEX idx_bidding_sessions_status ON bidding_sessions(status);
CREATE INDEX idx_bids_bidding_id ON bids(bidding_id);
CREATE INDEX idx_bids_player_id ON bids(player_id);

-- Game events
CREATE INDEX idx_game_events_game_id ON game_events(game_id);
CREATE INDEX idx_game_events_created_at ON game_events(created_at);

-- ============================================
-- TRIGGERS
-- ============================================

-- Update player updated_at timestamp
CREATE OR REPLACE FUNCTION update_player_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_player_updated_at
    BEFORE UPDATE ON players
    FOR EACH ROW
    EXECUTE FUNCTION update_player_updated_at();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_ownership ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bidding_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_events ENABLE ROW LEVEL SECURITY;

-- Games: Players can read games they're in
CREATE POLICY "Players can view games they're in" ON games
    FOR SELECT USING (
        game_id IN (
            SELECT game_id FROM players WHERE player_id = auth.uid()
        )
    );

-- Players: Players can read all players in their game
CREATE POLICY "Players can view players in same game" ON players
    FOR SELECT USING (
        game_id IN (
            SELECT game_id FROM players WHERE player_id = auth.uid()
        )
    );

-- Property ownership: Readable by players in the same game
CREATE POLICY "Players can view property ownership in their game" ON property_ownership
    FOR SELECT USING (
        game_id IN (
            SELECT game_id FROM players WHERE player_id = auth.uid()
        )
    );

-- Transactions: Readable by players in the same game
CREATE POLICY "Players can view transactions in their game" ON transactions
    FOR SELECT USING (
        game_id IN (
            SELECT game_id FROM players WHERE player_id = auth.uid()
        )
    );

-- Bidding sessions: Readable by players in the same game
CREATE POLICY "Players can view bidding in their game" ON bidding_sessions
    FOR SELECT USING (
        game_id IN (
            SELECT game_id FROM players WHERE player_id = auth.uid()
        )
    );

-- Bids: Readable by players in the same game
CREATE POLICY "Players can view bids in their game" ON bids
    FOR SELECT USING (
        bidding_id IN (
            SELECT bidding_id FROM bidding_sessions WHERE game_id IN (
                SELECT game_id FROM players WHERE player_id = auth.uid()
            )
        )
    );

-- Game events: Readable by players in the same game
CREATE POLICY "Players can view game events in their game" ON game_events
    FOR SELECT USING (
        game_id IN (
            SELECT game_id FROM players WHERE player_id = auth.uid()
        )
    );

-- Static tables (no RLS needed for public read)
ALTER TABLE board_spaces DISABLE ROW LEVEL SECURITY;
ALTER TABLE properties DISABLE ROW LEVEL SECURITY;
ALTER TABLE special_cards DISABLE ROW LEVEL SECURITY;
