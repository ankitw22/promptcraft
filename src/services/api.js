// API Service for AI Agent
const API_URL = 'https://api.gtwy.ai/api/v2/model/chat/completion';

/**
 * Call the AI agent API.
 * Returns an object: { text, parsed }
 *   text   — the display text (migration.new_content.content if present, else raw response)
 *   parsed — the full parsed JSON from the API (may be null if not JSON)
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
      variables,
    };

    console.log('API Request:', requestBody);

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        pauthkey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const contentType = response.headers.get('content-type');

    if (contentType && contentType.includes('text/event-stream')) {
      console.log('Detected SSE streaming response');
      return await handleSSEStream(response, onChunk);
    } else {
      console.log('Detected regular JSON response');
      const data = await response.json();
      return extractResponse(data);
    }
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

/**
 * Handle SSE streaming. Returns { text, parsed }.
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

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));

            if (data.event === 'delta' && data.content) {
              fullText += data.content;
              if (onChunk) onChunk(data.content);
            } else if (data.event === 'start') {
              console.log('Stream started:', data);
            } else if (data.event === 'done') {
              console.log('Stream done event received');
              if (data.response?.data?.content) {
                fullText = data.response.data.content;
              } else if (typeof data.response === 'string') {
                // The response string might itself be JSON — keep it as-is,
                // extractResponse will unwrap it after the stream ends
                fullText = data.response;
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

    // Try to parse accumulated text as JSON
    const trimmed = fullText.trim();
    if (trimmed.startsWith('{')) {
      try {
        const parsed = JSON.parse(trimmed);
        return extractResponse(parsed);
      } catch (_) {
        // Not valid JSON
      }
    }

    return { text: fullText, parsed: null };
  } catch (error) {
    console.error('SSE stream processing failed:', error);
    throw error;
  }
}

/**
 * Given a parsed JSON body from the API, return { text, parsed }.
 * text  = the content to display in the optimised panel
 * parsed = the raw parsed object for inspecting continue/migration/changes
 */
function extractResponse(data) {
  console.log('=== COMPLETE API RESPONSE ===');
  console.log(JSON.stringify(data, null, 2));
  console.log('=== END RESPONSE ===');

  // If data arrived as a string, try re-parsing it
  if (typeof data === 'string') {
    try {
      return extractResponse(JSON.parse(data));
    } catch (_) {
      return { text: data, parsed: null };
    }
  }

  // If response field is a JSON string, unwrap and recurse into it
  // e.g. { "response": "{\"continue\":true, \"migration\":{...}}" }
  if (typeof data.response === 'string') {
    const trimmedResp = data.response.trim();
    if (trimmedResp.startsWith('{') || trimmedResp.startsWith('[')) {
      try {
        const inner = JSON.parse(trimmedResp);
        return extractResponse(inner);
      } catch (_) {
        // Not JSON — fall through and use as plain text
        return { text: data.response, parsed: data };
      }
    }
    // Plain string response
    return { text: data.response, parsed: data };
  }

  // Prefer migration.new_content.content for display text
  let text = '';
  if (data.migration?.new_content?.content) {
    text = data.migration.new_content.content;
  } else if (data.response?.data?.content) {
    text = data.response.data.content;
  } else if (data.message?.content) {
    text = data.message.content;
  } else if (typeof data.message === 'string') {
    text = data.message;
  } else if (data.text) {
    text = data.text;
  } else if (data.output) {
    text = data.output;
  } else if (data.content) {
    text = data.content;
  } else if (data.choices?.[0]?.message?.content) {
    text = data.choices[0].message.content;
  } else {
    text = JSON.stringify(data, null, 2);
  }

  console.log('Extracted text:', text.slice(0, 200));
  return { text, parsed: data };
}

/**
 * Generate a unique thread ID.
 */
export function generateThreadId() {
  return `thread_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}
