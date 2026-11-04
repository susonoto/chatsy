# Components

React components that make up the Chatsy UI.

| File                | Responsibility                                      |
|---------------------|-----------------------------------------------------|
| `Lobby.tsx`         | Landing page with bento grid, create & join flows   |
| `ChatRoom.tsx`      | Active chat interface, messages, input, users list  |
| `ThemeSwitcher.tsx` | Floating theme selector (Glass / Neo / Night)       |
| `Background.tsx`    | Animated gradient orbs that adapt to the current theme |

All components use Framer Motion for entrance, hover, and layout animations.
They consume CSS variables defined in `../index.css` so they automatically adapt to the active theme.
