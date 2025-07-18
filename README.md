# Summify



A powerful Chrome extension that uses Google's Gemini AI to generate intelligent summaries of web articles and YouTube videos. Transform long articles and videos into concise, readable summaries with multiple formatting options.

## 🌟 Features

### 🤖 AI-Powered Summarization
- **Multiple Summary Types**: Choose from brief, detailed, or bullet-point summaries
- **Google Gemini AI**: Powered by Google's advanced language model
- **Smart Content Extraction**: Automatically detects and extracts article content and YouTube video information
- **High-Quality Output**: Generate professional, well-structured summaries

### 🎨 User Experience
- **Dark/Light Theme Toggle**: Switch between themes with a single click
- **Persistent Preferences**: Your theme choice is remembered across sessions
- **Modern UI**: Clean, intuitive interface with smooth animations
- **Responsive Design**: Works perfectly in Chrome's popup interface

### 📝 Advanced Text Rendering
- **Markdown Support**: Rich formatting with headers, lists, emphasis, and more
- **Professional Typography**: Clean, readable text with proper spacing
- **Code Highlighting**: Syntax highlighting for technical content
- **Link Support**: Clickable links in summaries

### 🔧 Easy Setup
- **Simple Installation**: Download and load into Chrome in minutes
- **API Key Management**: Secure storage of your Gemini API key
- **One-Time Setup**: Configure once and use everywhere
- **No Account Required**: Works with just your API key

## 📋 Summary Types

### 1. **Brief Summary**
- 2-3 sentence overview
- Perfect for quick understanding
- Ideal for busy readers and video viewers

### 2. **Detailed Summary**
- Comprehensive coverage of main points
- Includes key details and insights
- Great for thorough understanding of articles and videos

### 3. **Bullet Points**
- 5-7 key points formatted as a list
- Easy to scan and reference
- Perfect for note-taking from articles and videos

## 🚀 Installation & Setup

### Step 1: Download the Extension
1. Download the `ai-summary-extension.zip` file
2. Extract the ZIP file to a location on your computer
3. You should see a folder with all the extension files

### Step 2: Load in Chrome
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right corner)
3. Click "Load unpacked"
4. Select the extracted folder containing the extension files
5. The extension should now appear in your extensions list

### Step 3: Get Your API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your new API key

### Step 4: Configure the Extension
1. Click the extension icon in your Chrome toolbar
2. If no API key is set, the options page will open automatically
3. Paste your Gemini API key in the input field
4. Click "Save Settings"
5. You're ready to use the extension!

## 📖 How to Use

### YouTube Video Summarization
- **Navigate** to any YouTube video you want to summarize
- **Ensure transcripts are available** (click the "..." menu and select "Show transcript" if available)
- **Click** the AI Summary extension icon in your toolbar
- **Select** your preferred summary type from the dropdown
- **Click** "Summarize This Video"
- **Wait** for the AI to generate your summary using video transcript, description, and comments
- **Copy** the summary using the "Copy Summary" button

1. **Navigate** to any article or webpage you want to summarize
2. **Click** the AI Summary extension icon in your toolbar
3. **Select** your preferred summary type from the dropdown
4. **Click** "Summarize This Page"
5. **Wait** for the AI to generate your summary
6. **Copy** the summary using the "Copy Summary" button

### Tips for Best Results
- Works best with articles, blog posts, news content, and YouTube videos
- Ensure the page has loaded completely before summarizing
- For YouTube videos, enable transcripts for better summarization results
- For longer content, the extension automatically truncates content to stay within API limits
- Use different summary types based on your needs:
  - **Brief**: Quick overview
  - **Detailed**: Comprehensive analysis
  - **Bullet Points**: Easy reference

## 🎨 Theme Customization

### Switching Themes
- Click the "Dark Theme" toggle in the top-right corner of the popup
- The theme switches instantly with smooth animations
- Your preference is automatically saved

### Theme Features
- **Light Theme**: Clean white background with dark text
- **Dark Theme**: Dark background with light text for reduced eye strain
- **Automatic Persistence**: Your choice is remembered across browser sessions
- **Consistent Styling**: All elements adapt seamlessly to your chosen theme

## 🔧 Technical Details

### Supported Content
- News articles and blog posts
- Documentation and guides
- Research papers and academic content
- YouTube videos (with transcripts, descriptions, and comments)
- Any webpage with substantial text content

### Content Extraction
- Automatically detects article content using smart selectors
- For YouTube videos, extracts title, description, transcript, and comments
- Falls back to paragraph extraction if needed
- Handles various website structures and layouts

### API Integration
- Uses Google's Gemini 1.5 Flash model
- Secure API key storage in Chrome's sync storage
- Automatic content truncation to stay within API limits
- Error handling for API failures and network issues

## 🛠️ File Structure

```
summary-extension/
├── manifest.json          # Extension configuration
├── popup.html            # Main user interface
├── popup.js              # Core functionality and UI logic
├── content.js            # Content extraction from web pages
├── background.js         # Background service worker
├── options.html          # Settings page for API key
├── options.js            # Settings page functionality
└── icon.png              # Extension icon
```

## 🔒 Privacy & Security

### Data Handling
- **No Data Collection**: The extension doesn't collect or store your personal data
- **Local Processing**: Content extraction happens locally in your browser
- **Secure API Calls**: Only article content is sent to Google's Gemini API
- **No Tracking**: No analytics or tracking scripts included

### API Key Security
- **Chrome Storage**: Your API key is stored securely in Chrome's sync storage
- **Local Only**: API key never leaves your browser
- **No Sharing**: Your key is not shared with any third parties


### Getting Help
- Check that your API key has sufficient quota
- Ensure the webpage has substantial text content
- Try different summary types for varying results
- Refresh the page if content seems to be loading dynamically
- if still has error please open create an issue

## 🚀 Future Enhancements

### Planned Features
- **Smart Content Detection**: Improved article extraction algorithms
- **Summary History**: Save and manage previous summaries
- **Export Options**: Save summaries as PDF, Word, or Markdown
- **Custom Prompts**: User-defined summary styles

- **Reading Mode**: Clean reading view before summarization

### Potential Improvements
- **Multiple AI Providers**: Support for other AI models
- **Advanced Filtering**: Remove ads and irrelevant content
- **Content Analysis**: Sentiment analysis and key topic extraction
- **Collaboration Features**: Share summaries with team members


## 🤝 Contributing

Contributions are welcome! Feel free to submit issues, feature requests, or pull requests.

