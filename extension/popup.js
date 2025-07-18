// Simple markdown parser function
function parseMarkdown(text) {
  if (!text) return '';
  
  return text
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    
    // Bold and italic
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    
    // Code blocks
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    
    // Lists
    .replace(/^- (.*$)/gim, '<li>$1</li>')
    .replace(/^(\d+)\. (.*$)/gim, '<li>$2</li>')
    
    // Wrap lists in ul/ol tags
    .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
    
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
    
    // Blockquotes
    .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
    
    // Horizontal rules
    .replace(/^---$/gim, '<hr>')
    
    // Paragraphs (wrap text in p tags)
    .replace(/^(?!<[h|u|o|b|p|d])(.+)$/gim, '<p>$1</p>')
    
    // Clean up multiple p tags
    .replace(/<\/p>\s*<p>/g, '<br>')
    .replace(/<p><\/p>/g, '')
    .replace(/<p>(<[^>]+>.*<\/[^>]+>)<\/p>/g, '$1');
}

// Theme toggle functionality
document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("theme-toggle");
  const themeIcon = document.getElementById("theme-icon");

  // Load saved theme preference
  chrome.storage.sync.get(["theme"], (result) => {
    const currentTheme = result.theme || "light";
    document.documentElement.setAttribute("data-theme", currentTheme);
    if (currentTheme === "dark") {
      themeIcon.classList.remove("fa-moon");
      themeIcon.classList.add("fa-sun");
    } else {
      themeIcon.classList.remove("fa-sun");
      themeIcon.classList.add("fa-moon");
    }
  });

  // Toggle theme on click
  themeToggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    if (newTheme === "dark") {
      themeIcon.classList.remove("fa-moon");
      themeIcon.classList.add("fa-sun");
    } else {
      themeIcon.classList.remove("fa-sun");
      themeIcon.classList.add("fa-moon");
    }
    chrome.storage.sync.set({ theme: newTheme });
  });

  // Show empty card by default
  document.getElementById("summary-card").style.display = "none";
  document.getElementById("empty-card").style.display = "block";
});

// Handle summary type pill label
function getSummaryPillLabel(type) {
  switch (type) {
    case "brief": return "Brief Summary";
    case "detailed": return "Detailed Summary";
    case "bullets": return "Bullet Points";
    default: return "Summary";
  }
}

document.getElementById("summarize").addEventListener("click", async () => {
  const resultDiv = document.getElementById("result");
  const summaryCard = document.getElementById("summary-card");
  const emptyCard = document.getElementById("empty-card");
  const pill = document.getElementById("summary-pill");
  const summaryType = document.getElementById("summary-type").value;

  // Show loading in summary card
  summaryCard.style.display = "block";
  emptyCard.style.display = "none";
  pill.textContent = getSummaryPillLabel(summaryType);
  resultDiv.innerHTML = '<div class="loading"><div class="loader"></div></div>';

  // Get API key from storage
  chrome.storage.sync.get(["geminiApiKey"], async (result) => {
    if (!result.geminiApiKey) {
      resultDiv.innerHTML =
        "<p style='color: #dc3545;'>API key not found. Please set your API key in the extension options.</p>";
      return;
    }

    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      chrome.tabs.sendMessage(
        tab.id,
        { type: "GET_ARTICLE_TEXT" },
        async (res) => {
          if (!res || !res.text) {
            resultDiv.innerHTML =
              "<p style='color: #dc3545;'>Could not extract content from this page.</p>";
            return;
          }

          try {
            const summary = await getGeminiSummary(
              res.text,
              summaryType,
              result.geminiApiKey
            );
            // Render markdown content
            resultDiv.innerHTML = parseMarkdown(summary);
          } catch (error) {
            resultDiv.innerHTML = `<p style="color: #dc3545;">Error: ${
              error.message || "Failed to generate summary."
            }</p>`;
          }
        }
      );
    });
  });
});

// Copy button logic (icon button)
document.getElementById("copy-btn").addEventListener("click", () => {
  const resultDiv = document.getElementById("result");
  // Get text content without HTML tags for copying
  const summaryText = resultDiv.innerText || resultDiv.textContent;
  if (summaryText && summaryText.trim() !== "") {
    navigator.clipboard
      .writeText(summaryText)
      .then(() => {
        const copyBtn = document.getElementById("copy-btn");
        const icon = copyBtn.querySelector("i");
        icon.classList.remove("fa-copy");
        icon.classList.add("fa-check");
        setTimeout(() => {
          icon.classList.remove("fa-check");
          icon.classList.add("fa-copy");
        }, 1500);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  }
});
  
async function getGeminiSummary(text, summaryType, apiKey) {
  // Truncate very long texts to avoid API limits (typically around 30K tokens)
  const maxLength = 20000;
  const truncatedText =
    text.length > maxLength ? text.substring(0, maxLength) + "..." : text;

  let prompt;
  
  switch (summaryType) {
    case "brief":
      prompt = `Provide a brief summary of the following article in 2-3 sentences:\n\n${truncatedText}`;
      break;
    case "detailed":
      prompt = `Provide a detailed summary of the following article, covering all main points and key details:\n\n${truncatedText}`;
      break;
    case "bullets":
      prompt = `Summarize the following article in 5-7 key points. Format each point as a line starting with "- " (dash followed by a space). Do not use asterisks or other bullet symbols, only use the dash. Keep each point concise and focused on a single key insight from the article:\n\n${truncatedText}`;
      break;
    default:
      prompt = `Summarize the following article:\n\n${truncatedText}`;
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.2,
          },
        }),
      }
    );

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error?.message || "API request failed");
    }

    const data = await res.json();
    return (
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No summary available."
    );
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to generate summary. Please try again later.");
  }
}