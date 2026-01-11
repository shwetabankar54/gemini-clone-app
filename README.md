# Gemini Clone App

> **This is how we think Gemini should look.** A fresh take on Google's AI interface — replacing the traditional flat design with immersive glassmorphism and a living, breathing WebGL orb that responds to your interactions.

## Features

### Chat
- Real-time AI responses powered by Gemini 2.5 Flash
- Markdown rendering with code syntax highlighting
- Edit and resend previous prompts
- Copy prompts to clipboard
- Speech-to-text input via microphone

### UI/UX
- Glassmorphism design with blur effects
- Animated WebGL orb background (powered by OGL)
- Smooth transitions and loading animations
- Collapsible sidebar navigation
- Toast notifications

### Data
- Chat history persisted in localStorage
- Delete individual chats with animation
- Auto-generated chat titles via AI

### Security
- XSS protection via DOMPurify sanitization
- Secure API key handling via environment variables

### Shortcuts
- `Ctrl+Shift+O` - New chat

## Tech Stack

| Package | Purpose |
|---------|---------|
| React 19 | UI framework |
| Vite 7 | Build tool |
| @google/generative-ai | Gemini API |
| OGL | WebGL orb animation |
| Marked | Markdown parsing |
| DOMPurify | HTML sanitization |

## Installation

```bash
git clone https://github.com/shwetabankar54/gemini-clone-app.git
cd gemini-clone-app
npm install
```

Create `.env` file:
```
VITE_GOOGLE_API_KEY=your_api_key_here
```

Get your API key from [Google AI Studio](https://aistudio.google.com/apikey)

```bash
npm run dev
```

Open `http://localhost:5173`

## Project Structure

```
src/
├── components/
│   ├── Main.jsx        # Chat interface, message bubbles, input
│   ├── Sidebar.jsx     # Navigation, chat history, delete
│   └── Orb.jsx         # WebGL shader animation
├── config/
│   └── gemini.js       # API setup, title generation
├── context/
│   └── Context.jsx     # Global state, chat logic
└── assets/             # SVG icons
```

## Configuration

Model can be changed in `src/config/gemini.js`:

```javascript
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",  // Fast responses
    // model: "gemini-2.5-pro", // More capable
});
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview build |

## Authors

- **Krishna Sonji**
- **Shweta Bankar**
