

# The End Game: Blip Protocol 🎮

A futuristic team-based competitive puzzle game platform with a dark sci-fi theme, neon accents, and immersive gaming UI.

---

## 1. Theme & Design System
- Dark sci-fi color palette with neon blue/purple/cyan accents
- Glassmorphism cards with backdrop blur and glowing borders
- Neon glowing buttons with hover pulse animations
- Animated progress bars and smooth page transitions
- Fully responsive layout for desktop and mobile

## 2. Authentication — Team Login
- Login page with Team ID + Password fields
- Futuristic styled form with neon accents
- Mock credentials (e.g., team1/password1 through team30/password30)
- Redirect to Game Dashboard on successful login
- Auth context to manage logged-in team state

## 3. Game Dashboard
- Central hub after login showing:
  - **Start Game** button (begins the 2-hour timer)
  - Current level indicator with progress visualization
  - Game countdown timer (2-hour total)
  - Sidebar showing available Power Stones and active effects
- Animated level map showing all 15 levels (locked/unlocked/completed)

## 4. Level System (15 Levels)
- Sequential unlock: Level N+1 locked until N is completed
- Each level displays a puzzle/question with an answer input and submit button
- Correct/incorrect feedback with animations
- Lock icons on locked levels, checkmarks on completed ones
- Mock puzzle data for all 15 levels

## 5. Power Stones System
- **Shield Stone**: Protects from Block attacks (toggle on/off)
- **Block Stone**: Block another team for 2 minutes (select target team)
- Stone rewards: earned after completing Level 4 and Level 8
- Sidebar panel shows available stones, cooldowns, and active effects
- Last 20 minutes of game: all powers disabled

## 6. Blip Protocol Events
- **First Blip** (at 45 min): 15 random teams frozen for 5 minutes, special puzzle for early release + bonus points
- **Second Blip** (at 1 hour): Remaining 15 teams frozen
- Full-screen animated alerts and countdown overlays during Blip events
- Visual freeze effect on the game screen when team is blipped

## 7. Notifications System
- Toast notifications for:
  - Level unlocked
  - Block attack received / Shield activated
  - Blip start/end alerts
  - Stone earned
- Styled with neon/sci-fi theme

## 8. Admin Dashboard
- Separate admin login/page at `/admin`
- Live team list with scores and current levels
- Real-time leaderboard with animated rank changes
- Admin controls to trigger Blip events and freeze/unfreeze teams
- Mock Socket.IO client setup for simulated real-time updates

## 9. Architecture
- Context providers for Auth, Game State, and Timer
- Service layer with mock data (structured for easy backend swap later)
- Clean component-based folder structure: `/components`, `/pages`, `/layouts`, `/services`, `/context`
- Socket.IO client imported and structured (connecting to mock/simulated events)

