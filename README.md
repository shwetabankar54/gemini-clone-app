# Gemini Clone App

A React-based clone of Google's Gemini AI interface with real-time AI responses powered by the Google Gemini API.

## ✨ Features

- Interactive chat interface with Google Gemini AI
- Real-time AI responses with typing animation
- Suggestion cards for quick prompts
- Clean and modern UI matching Google's Gemini design
- Sidebar navigation with chat history
- Error handling for API failures
- Responsive design

## 🛠️ Tech Stack

- **React 19** - UI library
- **Vite** - Build tool and development server
- **Google Generative AI SDK** - Gemini API integration
- **CSS** - Styling

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/shwetabankar54/gemini-clone-app.git
cd Gemini_Clone_App
```

2. Install dependencies:
```bash
npm install
```

3. Set up your Google Gemini API key:
   - Get your API key from [Google AI Studio](https://aistudio.google.com/apikey)
   - Create a `.env` file in the root directory
   - Add your API key:
   ```
   VITE_GOOGLE_API_KEY=your_api_key_here
   ```

4. Run the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

## 📁 Project Structure

```
Gemini_Clone_App/
├── src/
│   ├── components/
│   │   ├── Main.jsx          # Main chat interface
│   │   ├── Main.css
│   │   ├── Sidebar.jsx       # Navigation sidebar
│   │   └── Sidebar.css
│   ├── config/
│   │   └── gemini.js         # Gemini API configuration
│   ├── context/
│   │   └── Context.jsx       # Global state management
│   ├── assets/
│   │   └── assets.js         # App icons and images
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── .env                      # Environment variables (API key)
├── index.html
├── package.json
└── vite.config.js
```

## 🔧 Configuration

The app uses the **Gemini 2.5 Flash** model for fast and efficient responses. You can modify the model in `src/config/gemini.js`:

```javascript
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
});
```

Available models:
- `gemini-2.5-flash` - Fast responses (recommended)
- `gemini-2.5-pro` - More capable, slower responses
- `gemini-3-flash-preview` - Latest preview version

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 👩‍💻 Author

**Shweta Bankar**

## 📄 License

This project is for educational purposes.
