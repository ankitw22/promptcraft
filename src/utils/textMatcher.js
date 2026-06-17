/**
 * Text matching utilities to find which parts of original prompt
 * are covered in the optimized version
 */

/**
 * Extract key phrases from text (bigrams and trigrams)
 */
export function extractKeyPhrases(text) {
  // Remove special characters and normalize
  const normalized = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  const words = normalized.split(' ').filter(w => w.length > 2);
  const phrases = new Set();
  
  // Add individual meaningful words
  words.forEach(word => {
    if (word.length > 4) { // Only longer words
      phrases.add(word);
    }
  });
  
  // Add bigrams (2-word phrases)
  for (let i = 0; i < words.length - 1; i++) {
    phrases.add(`${words[i]} ${words[i + 1]}`);
  }
  
  // Add trigrams (3-word phrases)
  for (let i = 0; i < words.length - 2; i++) {
    phrases.add(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
  }
  
  return Array.from(phrases);
}

/**
 * Check if a phrase or its variations exist in target text
 */
function phraseExistsInText(phrase, targetText) {
  const normalizedTarget = targetText.toLowerCase();
  
  // Check exact phrase
  if (normalizedTarget.includes(phrase)) {
    return true;
  }
  
  // Check if all words of the phrase exist (even if not together)
  const words = phrase.split(' ');
  if (words.length > 1) {
    const allWordsExist = words.every(word => normalizedTarget.includes(word));
    return allWordsExist;
  }
  
  return false;
}

/**
 * Calculate coverage score for a line
 * Returns value between 0 and 1
 */
export function calculateLineCoverage(line, optimizedText) {
  if (!line || !line.trim() || !optimizedText) {
    return 0;
  }
  
  // Skip very short lines
  if (line.trim().length < 5) {
    return 0;
  }
  
  // Extract key phrases from this line
  const phrases = extractKeyPhrases(line);
  
  if (phrases.length === 0) {
    return 0;
  }
  
  // Count how many phrases are covered
  let coveredCount = 0;
  phrases.forEach(phrase => {
    if (phraseExistsInText(phrase, optimizedText)) {
      coveredCount++;
    }
  });
  
  // Return coverage ratio
  return coveredCount / phrases.length;
}

/**
 * Get coverage data for all lines in original prompt
 */
export function analyzePromptCoverage(originalPrompt, optimizedPrompt) {
  const lines = originalPrompt.split('\n');
  const coverage = [];
  
  lines.forEach((line, index) => {
    const score = calculateLineCoverage(line, optimizedPrompt);
    coverage.push({
      lineNumber: index + 1,
      text: line,
      coverageScore: score,
      isCovered: score > 0.5, // More than 50% phrases matched
    });
  });
  
  return coverage;
}

/**
 * Real-time coverage tracking during streaming
 * Returns updated coverage as optimized text grows
 */
export function getRealtimeCoverage(originalPrompt, partialOptimizedText) {
  return analyzePromptCoverage(originalPrompt, partialOptimizedText);
}
