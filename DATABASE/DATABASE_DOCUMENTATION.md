# International Business Game - Database Documentation

## Overview
This database schema is designed for a Monopoly-like International Business game deployed on Supabase (PostgreSQL). It supports multiplayer game sessions, property ownership, bidding systems, and all game mechanics.

## Database Schema

### 1. Static Data Tables

#### `board_spaces`
All squares on the game board (40 positions).
- **space_id**: Primary key
- **position**: Board position (0-39)
- **name**: Space name (e.g., "Japan", "Jail", "Start")
- **space_type**: ENUM (property, start, jail, chance, uno, party_house, travelling_duty, roadways, custom, airways, resort, waterways, petroleum, railways)
- **property_color**: ENUM (BLUE, RED, GREEN, YELLOW, WHITE) - only for properties
- **base_price**: Purchase price for properties
- **mortgage_value**: Mortgage value (typically 50% of base_price)

#### `properties`
Detailed property information for buyable spaces.
- **property_id**: Primary key
- **space_id**: Foreign key to board_spaces
- **name**: Property name
- **property_color**: Color group (BLUE, RED, GREEN, YELLOW, WHITE)
- **base_price**: Purchase cost
- **house_price**: Cost to add one house
- **hotel_price**: Cost to add hotel (after 3 houses)
- **mortgage_value**: Mortgage value
- **base_rent**: Rent with no houses
- **rent_1_house**: Rent with 1 house
- **rent_2_houses**: Rent with 2 houses
- **rent_3_houses**: Rent with 3 houses
- **rent_hotel**: Rent with hotel

#### `special_cards`
Chance and UNO cards.
- **card_id**: Primary key
- **card_type**: ENUM (chance, uno)
- **title**: Card title
- **description**: Card description
- **card_action**: ENUM (pay_money, receive_money, go_to_jail, submit_passport, make_repairs, win_prize, move_to_space, advance_to_go, get_out_of_jail_free)
- **action_value**: Amount for pay/receive actions
- **target_space**: Target position for move actions
- **is_get_out_of_jail_free**: Boolean for special cards

#### `avatar_options`
Available player avatars.
- **avatar_id**: Primary key
- **name**: Avatar name
- **image_url**: Avatar image URL
- **is_active**: Whether avatar is available

### 2. Game Management Tables

#### `games`
Individual game sessions (parties).
- **game_id**: UUID primary key
- **host_player_id**: UUID of host player
- **status**: ENUM (waiting_for_players, in_progress, finished, cancelled)
- **max_players**: Maximum players (set by host)
- **current_player_turn_id**: UUID of current player
- **turn_order**: Array of player UUIDs in turn order
- **join_code**: 6-character unique code for joining
- **total_money_in_game**: Total money ($100,000)
- **starting_money_per_player**: Calculated based on player count
- **current_dice_roll**: Current dice value
- **created_at**: Game creation timestamp
- **started_at**: Game start timestamp
- **finished_at**: Game end timestamp

#### `players`
Players in a specific game.
- **player_id**: UUID primary key
- **game_id**: Foreign key to games
- **user_id**: Optional Supabase Auth user ID
- **name**: Player display name
- **avatar_id**: Foreign key to avatar_options
- **money**: Current money
- **position**: Current board position (0-39)
- **in_jail**: Boolean - is player in jail
- **jail_turns_left**: Turns remaining in jail (max 3)
- **is_bankrupt**: Boolean - is player bankrupt
- **is_host**: Boolean - is this the host
- **order_in_turn**: Turn order position (unique per game)
- **last_dice_roll**: Last dice value
- **has_left_game**: Boolean - did player leave
- **left_at**: Timestamp when player left
- **get_out_of_jail_free_cards**: Count of "Get Out of Jail Free" cards

### 3. Property Ownership & Development

#### `property_ownership`
Tracks who owns which properties and their development level.
- **ownership_id**: UUID primary key
- **property_id**: Foreign key to properties
- **player_id**: Foreign key to players (NULL if unowned)
- **game_id**: Foreign key to games
- **houses_count**: Number of houses (0-3)
- **has_hotel**: Boolean - has hotel (after 3 houses)
- **is_mortgaged**: Boolean - is property mortgaged
- **purchased_at**: Purchase timestamp

### 4. Transactions

#### `transactions`
All money transactions in the game.
- **transaction_id**: UUID primary key
- **game_id**: Foreign key to games
- **from_player_id**: UUID of payer (NULL for bank)
- **to_player_id**: UUID of receiver (NULL for bank)
- **transaction_type**: ENUM (property_purchase, rent_payment, house_purchase, hotel_purchase, bidding, property_sale, bail_payment, pass_go, card_payment, card_receive, mortgage, unmortgage)
- **amount**: Transaction amount
- **property_id**: Related property (if applicable)
- **description**: Transaction description
- **created_at**: Transaction timestamp

### 5. Bidding System

#### `bidding_sessions`
Property auctions/bidding sessions.
- **bidding_id**: UUID primary key
- **game_id**: Foreign key to games
- **property_id**: Foreign key to properties
- **seller_player_id**: UUID of seller (NULL if bank selling)
- **status**: ENUM (active, completed, cancelled)
- **minimum_bid**: Minimum acceptable bid
- **current_highest_bid**: Current highest bid amount
- **current_highest_bidder_id**: UUID of highest bidder
- **started_at**: Auction start timestamp
- **ended_at**: Auction end timestamp

#### `bids`
Individual bids in an auction.
- **bid_id**: UUID primary key
- **bidding_id**: Foreign key to bidding_sessions
- **player_id**: Foreign key to players
- **bid_amount**: Bid amount
- **created_at**: Bid timestamp

### 6. Game Log

#### `game_events`
Complete game event history.
- **event_id**: UUID primary key
- **game_id**: Foreign key to games
- **player_id**: Foreign key to players (if applicable)
- **event_type**: Event type (dice_roll, property_purchase, rent_paid, jail_entry, etc.)
- **event_data**: JSONB with event-specific data
- **created_at**: Event timestamp

## Key Relationships

```
games (1) ----< (N) players
games (1) ----< (N) property_ownership
games (1) ----< (N) transactions
games (1) ----< (N) bidding_sessions
games (1) ----< (N) game_events

players (1) ----< (N) property_ownership
players (1) ----< (N) transactions (as from_player)
players (1) ----< (N) transactions (as to_player)
players (1) ----< (N) bids

board_spaces (1) ----< (1) properties
properties (1) ----< (N) property_ownership
properties (1) ----< (N) bidding_sessions

bidding_sessions (1) ----< (N) bids
```

## Game Mechanics Implementation

### Money Distribution
- **Total money**: $100,000 per game
- **Starting money per player**: Calculated as `total_money_in_game / player_count`
- **Passing Go**: $1,500 bonus (recorded as transaction)

### Property Development
- **Houses**: 0-3 houses per property
- **Hotel**: Requires 3 houses, replaces them
- **Building rules**: Can build unevenly across color groups
- **Rent calculation**: Based on houses/hotel count

### Jail System
- **Entry**: Landing on jail space
- **Bail**: $500 to get out immediately
- **Max turns**: 3 turns in jail, then free
- **Tracking**: `in_jail` boolean + `jail_turns_left` counter

### Property Groups
- **5 color groups**: BLUE, RED, GREEN, YELLOW, WHITE
- **Group ownership**: Query property_ownership to check if player owns ≥3 properties of same color

### Player Leaving
- **has_left_game**: Set to TRUE when player leaves
- **Properties**: Set player_id to NULL in property_ownership (properties become unowned)
- **Game continues**: Game only ends when 1 player remains OR all others bankrupt

### Winning Conditions
Game ends when:
1. Only 1 player remains (others have left)
2. All other players are bankrupt

### Bidding
- **Trigger**: When player wants to sell property above mortgage value
- **Process**: Create bidding_session, collect bids, award to highest bidder
- **Minimum bid**: Must exceed mortgage value

## Row Level Security (RLS)

RLS is enabled on game-specific tables to ensure players can only access data from games they're participating in.

- **games**: Players can view games they're in
- **players**: Players can view all players in same game
- **property_ownership**: Players can view ownership in their game
- **transactions**: Players can view transactions in their game
- **bidding_sessions**: Players can view bidding in their game
- **bids**: Players can view bids in their game
- **game_events**: Players can view events in their game

Static tables (board_spaces, properties, special_cards, avatar_options) have RLS disabled for public read access.

## Indexes

Performance indexes are created on:
- Game status and join codes
- Player game associations
- Property ownership queries
- Transaction lookups
- Bidding session queries
- Game event timestamps

## Triggers

### `update_player_updated_at`
Automatically updates the `updated_at` timestamp on players table whenever a row is updated.

## Deployment Instructions

1. **Create Supabase project**
   - Go to https://supabase.com
   - Create new project
   - Note your project URL and anon key

2. **Run the schema**
   - In Supabase Dashboard → SQL Editor
   - Copy and paste the entire `schema.sql` file
   - Execute the SQL

3. **Seed static data**
   - Populate `board_spaces` with all 40 board positions
   - Populate `properties` with all property details
   - Populate `special_cards` with Chance and UNO cards
   - Populate `avatar_options` with available avatars

4. **Configure environment variables**
   - Add Supabase URL and anon key to your Vercel project
   - Set up Supabase Auth if using authentication

## Example Queries

### Get all properties owned by a player
```sql
SELECT p.*, po.houses_count, po.has_hotel, po.is_mortgaged
FROM property_ownership po
JOIN properties p ON po.property_id = p.property_id
WHERE po.player_id = 'player-uuid' AND po.game_id = 'game-uuid';
```

### Check if player owns a color group (≥3 properties)
```sql
SELECT property_color, COUNT(*) as count
FROM property_ownership po
JOIN properties p ON po.property_id = p.property_id
WHERE po.player_id = 'player-uuid' AND po.game_id = 'game-uuid'
GROUP BY property_color
HAVING COUNT(*) >= 3;
```

### Get current game state
```sql
SELECT g.*, 
       (SELECT json_agg(p) FROM players p WHERE p.game_id = g.game_id AND p.has_left_game = FALSE) as active_players,
       (SELECT json_agg(po) FROM property_ownership po WHERE po.game_id = g.game_id) as properties
FROM games g
WHERE g.game_id = 'game-uuid';
```

### Calculate rent for a property
```sql
SELECT 
    CASE 
        WHEN po.has_hotel THEN p.rent_hotel
        WHEN po.houses_count = 3 THEN p.rent_3_houses
        WHEN po.houses_count = 2 THEN p.rent_2_houses
        WHEN po.houses_count = 1 THEN p.rent_1_house
        ELSE p.base_rent
    END as rent_amount
FROM property_ownership po
JOIN properties p ON po.property_id = p.property_id
WHERE po.property_id = 1 AND po.game_id = 'game-uuid';
```

## Next Steps

1. Create seed data file with board spaces and properties
2. Implement API endpoints in your backend
3. Set up real-time subscriptions for game updates
4. Implement game logic in your application code
5. Add validation and business logic in database functions or application layer
