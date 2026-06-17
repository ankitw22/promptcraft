# API Integration Guide

## Overview

The PromptCraft now integrates with the Gateway AI API to provide real-time prompt optimization using AI agents.

## Changes Made

### 1. **API Service** (`src/services/api.js`)
- Created a dedicated API service for communicating with Gateway AI
- Supports both regular and streaming responses
- Handles authentication with `pauthkey`
- Includes error handling and response parsing

### 2. **API Key Management**
- New `ApiKeyModal` component for secure API key configuration
- API key stored in browser's `localStorage` for persistence
- Visual indicator showing API key configuration status

### 3. **Removed Mock Data**
- Removed all sample/dummy prompt data
- Removed typewriter simulation chunks (`CHUNK_A1`, `CHUNK_A2`, etc.)
- Removed checkpoint system (can be re-added if needed)
- Simplified state management for real API calls

### 4. **Updated Components**

#### **SetupScreen**
- Added API key configuration UI
- Shows status indicator (configured/not configured)
- Validates API key and prompt before allowing analysis
- Updated placeholder text to guide users

#### **PromptCoPilot** (Main Component)
- Integrated real API calls via `optimizePrompt()` function
- Added loading states: `idle`, `loading`, `typing`, `done`, `error`
- Implemented typewriter effect for displaying API responses
- Added error handling with retry functionality
- API key persistence via localStorage

#### **ReviewScreen**
- Simplified UI to show real-time optimization
- Removed complex checkpoint/review workflow
- Added loading, success, and error states
- Shows appropriate action buttons based on state

## API Configuration

### Endpoint
```
POST https://api.gtwy.ai/api/v2/model/chat/completion
```

### Headers
```json
{
  "pauthkey": "YOUR_API_KEY",
  "Content-Type": "application/json"
}
```

### Request Body
```json
{
  "user": "USER_PROMPT_TEXT",
  "agent_id": "6a322693f02b9cda1d7e865d",
  "thread_id": "UNIQUE_THREAD_ID",
  "response_type": "text",
  "variables": {
    "optimization_guidelines": "COMBINED_GUIDELINES_AND_MODES"
  }
}
```

### How Variables are Sent

The optimization guidelines are constructed from:
1. **Intent Lock** (user's optimization preferences)
2. **Selected Review Modes** with their descriptions

Example:
```
Use clear language.
Maintain original intent.
Improve structure and clarity.

Review Modes:
- Context Flow: Checks usage before definition...
- Redundancy: Finds repeated instructions...
- Token Reduction: Shortens phrasing...
```

## How It Works

### 1. **User Setup**
```
User → Configure API Key → Enter Prompt → Select Modes → Begin Analysis
```

### 2. **API Call Flow**
```javascript
beginAnalysis()
  → callOptimizeAPI()
    → optimizePrompt() [API Service]
      → Fetch API
        → Response received
          → typewriterEffect()
            → Display optimized prompt
```

### 3. **State Management**
- **idle**: Initial state, waiting to start
- **loading**: API call in progress
- **typing**: Typewriter effect displaying response
- **done**: Optimization complete
- **error**: API call failed, shows error message

## User Flow

1. **First Time User**:
   - App loads → Shows Setup Screen
   - Click "Configure" to enter API key
   - Enter prompt text
   - Select review modes
   - Click "Begin Analysis"

2. **During Optimization**:
   - Shows "Calling AI..." loading state
   - When response arrives, typewriter effect displays it
   - Can restart at any time

3. **After Completion**:
   - Can edit the optimized prompt
   - Can copy to clipboard
   - Can start new session
   - Can view final side-by-side comparison

## Testing the Integration

### 1. **Get Your API Key**
- Obtain your `pauthkey` from Gateway AI
- Click "Configure" button in the app
- Enter your API key

### 2. **Test with a Prompt**
```
# Role
You are a helpful AI assistant.

# Goal
Provide clear and concise answers.

# Process
1. Understand the question
2. Research if needed
3. Provide structured response
```

### 3. **Expected Response**
The AI agent will return an optimized version of your prompt with:
- Improved structure
- Better clarity
- Reduced redundancy
- Enhanced context flow

## Error Handling

### Common Errors

1. **Invalid API Key**
```
Error: API Error: 401 - Unauthorized
```
**Solution**: Check your API key in the configuration

2. **Network Error**
```
Error: Failed to fetch
```
**Solution**: Check internet connection

3. **Rate Limiting**
```
Error: API Error: 429 - Too Many Requests
```
**Solution**: Wait a moment and retry

4. **Invalid Response**
```
Error: Failed to optimize prompt
```
**Solution**: Check the API response format

## Customization

### Change Agent ID
Edit `src/services/api.js`:
```javascript
agent_id: '6a322693f02b9cda1d7e865d', // Change this
```

### Add Streaming Support
If the API supports streaming, you can use the `streamOptimizePrompt()` function:
```javascript
await streamOptimizePrompt({
  userPrompt,
  optimizationGuidelines,
  pauthkey: apiKey,
  onChunk: (chunk) => {
    // Handle each chunk
    setV2Draft(prev => prev + chunk);
  }
});
```

### Adjust Typewriter Speed
Edit `src/components/PromptCoPilot.jsx`:
```javascript
const typeChar = () => {
  const nextChunk = text.slice(currentIndex, currentIndex + 3); // Change chunk size
  typingTimerRef.current = setTimeout(typeChar, 20); // Change delay (ms)
};
```

## Security Notes

- API keys are stored in browser's `localStorage`
- Keys are never exposed in console logs (in production)
- Use HTTPS for all API calls
- Consider implementing backend proxy for additional security

## Next Steps

1. **Add More Features**:
   - Save/load prompt history
   - Multiple optimization iterations
   - Comparison view for iterations
   - Export optimized prompts

2. **Improve UX**:
   - Add progress indicators
   - Show token count
   - Add prompt templates
   - Multi-language support

3. **Analytics**:
   - Track optimization metrics
   - Success/failure rates
   - Average response times

## Support

For API-related issues, contact Gateway AI support.
For app-related issues, check the main README.md.
