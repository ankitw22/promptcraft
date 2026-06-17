// API Service for AI Agent
const API_URL = 'https://api.gtwy.ai/api/v2/model/chat/completion';

/**
 * Call the AI agent API
 * @param {string} userPrompt - The user's original prompt
 * @param {string} optimizationGuidelines - The optimization guidelines
 * @param {string} pauthkey - API authentication key
 * @param {string} threadId - Thread ID for conversation continuity (optional)
 * @returns {Promise<string>} - The optimized prompt response
 */
/**
 * Call the AI agent API with streaming support
 * @param {string} userPrompt - The user's original prompt
 * @param {Object} variables - Variables object to pass to the agent
 * @param {string} pauthkey - API authentication key
 * @param {Function} onChunk - Callback for each content chunk
 * @param {string} threadId - Thread ID for conversation continuity (optional)
 * @returns {Promise<string>} - The complete optimized prompt response
 */
export async function optimizePrompt({
  userPrompt,
  variables = {},
  pauthkey,
  onChunk = null,
  threadId = null,
}) {
  try {
    const requestBody = {
      user: userPrompt,
      agent_id: '6a322693f02b9cda1d7e865d',
      thread_id: threadId || generateThreadId(),
      response_type: 'text',
      variables: variables, // Pass variables as-is
    };

    console.log('API Request:', requestBody);

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'pauthkey': pauthkey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    // Check if response is streaming (SSE format)
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('text/event-stream')) {
      // Handle Server-Sent Events (SSE) streaming
      console.log('Detected SSE streaming response');
      return await handleSSEStream(response, onChunk);
    } else {
      // Handle regular JSON response
      console.log('Detected regular JSON response');
      const data = await response.json();
      return extractResponseFromJSON(data);
    }
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

/**
 * Handle Server-Sent Events (SSE) streaming response
 */
async function handleSSEStream(response, onChunk) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        console.log('Stream complete. Full text length:', fullText.length);
        break;
      }

      // Decode the chunk
      buffer += decoder.decode(value, { stream: true });
      
      // Process complete lines (SSE format: data: {...}\n)
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const jsonStr = line.slice(6); // Remove 'data: ' prefix
            const data = JSON.parse(jsonStr);
            
            // Handle different event types
            if (data.event === 'delta' && data.content) {
              // Stream each content chunk
              fullText += data.content;
              if (onChunk) {
                onChunk(data.content);
              }
            } else if (data.event === 'start') {
              console.log('Stream started:', data);
            } else if (data.event === 'done') {
              console.log('Stream done event received');
              // Extract final response if available
              if (data.response?.data?.content) {
                fullText = data.response.data.content;
              }
            }
          } catch (e) {
            console.warn('Failed to parse SSE line:', line, e);
          }
        }
      }
    }

    if (!fullText || fullText.trim().length === 0) {
      throw new Error('Empty response received from streaming API');
    }

    return fullText;
  } catch (error) {
    console.error('SSE stream processing failed:', error);
    throw error;
  }
}

/**
 * Extract response from regular JSON format
 */
function extractResponseFromJSON(data) {
  console.log('=== COMPLETE API RESPONSE ===');
  console.log(JSON.stringify(data, null, 2));
  console.log('=== END RESPONSE ===');
  
  let responseText = '';
  
  // Try different possible response structures
  if (typeof data === 'string') {
    responseText = data;
  } else if (data.response?.data?.content) {
    responseText = data.response.data.content;
  } else if (data.response) {
    responseText = typeof data.response === 'string' ? data.response : JSON.stringify(data.response);
  } else if (data.message?.content) {
    responseText = data.message.content;
  } else if (data.message) {
    responseText = typeof data.message === 'string' ? data.message : JSON.stringify(data.message);
  } else if (data.text) {
    responseText = data.text;
  } else if (data.output) {
    responseText = data.output;
  } else if (data.content) {
    responseText = data.content;
  } else if (data.data?.response) {
    responseText = data.data.response;
  } else if (data.choices?.[0]?.message?.content) {
    responseText = data.choices[0].message.content;
  } else if (data.result) {
    responseText = typeof data.result === 'string' ? data.result : JSON.stringify(data.result);
  } else {
    responseText = JSON.stringify(data, null, 2);
  }
  
  console.log('Extracted Response Text:', responseText);
  console.log('Text Length:', responseText.length);
  
  if (!responseText || responseText.trim().length === 0) {
    throw new Error('Empty response received from API');
  }
  
  return responseText;
}

/**
 * Generate a unique thread ID
 * @returns {string}
 */
function generateThreadId() {
  return `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Stream the AI response (if API supports streaming)
 * @param {Object} params - Same as optimizePrompt
 * @param {Function} onChunk - Callback for each chunk of data
 * @returns {Promise<void>}
 */
export async function streamOptimizePrompt({
  userPrompt,
  optimizationGuidelines,
  pauthkey,
  threadId = null,
  onChunk,
}) {
  try {
    const requestBody = {
      user: userPrompt,
      agent_id: '6a322693f02b9cda1d7e865d',
      thread_id: threadId || generateThreadId(),
      response_type: 'stream', // Change to stream if supported
      variables: {
        optimization_guidelines: optimizationGuidelines,
      },
    };

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'pauthkey': pauthkey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    // Check if streaming is supported
    if (response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        onChunk(chunk);
      }
    } else {
      // Fallback to regular response
      const data = await response.json();
      const fullText = data.response || data.text || data.message || '';
      onChunk(fullText);
    }
  } catch (error) {
    console.error('Streaming failed:', error);
    throw error;
  }
}
