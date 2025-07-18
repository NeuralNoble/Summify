function getArticleText() {
    const article = document.querySelector("article");
    if (article) return article.innerText;
  
    // fallback
    const paragraphs = Array.from(document.querySelectorAll("p"));
    return paragraphs.map((p) => p.innerText).join("\n");
}

function isYouTubeVideo() {
    return window.location.hostname === 'www.youtube.com' && 
           window.location.pathname === '/watch' && 
           window.location.search.includes('v=');
}

function getVideoId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('v');
}

// Completely new approach: Direct YouTube data extraction
function extractYouTubeContent() {
    if (!isYouTubeVideo()) {
        return { text: 'Not on a YouTube video page', type: 'error' };
    }

    const videoId = getVideoId();
    console.log('Extracting content for video ID:', videoId);

    let content = '';
    let extractedData = {
        title: '',
        description: '',
        channel: '',
        views: '',
        comments: [],
        transcript: '',
        otherContent: []
    };

    // Method 1: Direct access to YouTube's internal data
    try {
        // Access YouTube's internal data directly from the window object
        if (window.ytInitialData) {
            console.log('Found ytInitialData on window object');
            const ytData = window.ytInitialData;
            
            // Navigate through the data structure to find video info
            if (ytData.contents && ytData.contents.twoColumnWatchNextResults) {
                const results = ytData.contents.twoColumnWatchNextResults.results.results.contents;
                
                // Extract from primary info
                if (results[0] && results[0].videoPrimaryInfoRenderer) {
                    const primaryInfo = results[0].videoPrimaryInfoRenderer;
                    
                    // Get title
                    if (primaryInfo.title && primaryInfo.title.runs) {
                        extractedData.title = primaryInfo.title.runs.map(run => run.text).join('');
                        console.log('Found title from ytInitialData:', extractedData.title);
                    }
                    
                    // Get view count
                    if (primaryInfo.viewCount && primaryInfo.viewCount.videoViewCountRenderer) {
                        const viewCount = primaryInfo.viewCount.videoViewCountRenderer.viewCount;
                        if (viewCount && viewCount.runs) {
                            extractedData.views = viewCount.runs.map(run => run.text).join('');
                            console.log('Found views from ytInitialData:', extractedData.views);
                        }
                    }
                }
                
                // Extract from secondary info
                if (results[1] && results[1].videoSecondaryInfoRenderer) {
                    const secondaryInfo = results[1].videoSecondaryInfoRenderer;
                    
                    // Get description
                    if (secondaryInfo.description && secondaryInfo.description.runs) {
                        extractedData.description = secondaryInfo.description.runs.map(run => run.text).join('');
                        console.log('Found description from ytInitialData:', extractedData.description.length);
                    }
                    
                    // Get channel info
                    if (secondaryInfo.owner && secondaryInfo.owner.videoOwnerRenderer) {
                        const owner = secondaryInfo.owner.videoOwnerRenderer;
                        if (owner.title && owner.title.runs) {
                            extractedData.channel = owner.title.runs.map(run => run.text).join('');
                            console.log('Found channel from ytInitialData:', extractedData.channel);
                        }
                    }
                }
            }
        }
        
        // Access player response data
        if (window.ytInitialPlayerResponse) {
            console.log('Found ytInitialPlayerResponse on window object');
            const playerData = window.ytInitialPlayerResponse;
            
            if (playerData.videoDetails) {
                const details = playerData.videoDetails;
                
                if (!extractedData.title && details.title) {
                    extractedData.title = details.title;
                }
                if (!extractedData.description && details.shortDescription) {
                    extractedData.description = details.shortDescription;
                }
                if (!extractedData.channel && details.author) {
                    extractedData.channel = details.author;
                }
                if (!extractedData.views && details.viewCount) {
                    extractedData.views = details.viewCount + ' views';
                }
            }
        }
        
        // Try to access comments data
        if (window.ytInitialData && window.ytInitialData.contents) {
            const contents = window.ytInitialData.contents;
            
            // Look for comments in various possible locations
            const commentSections = [
                contents.twoColumnWatchNextResults?.results?.results?.contents?.[2],
                contents.twoColumnWatchNextResults?.secondaryResults?.secondaryResults?.results,
                contents.twoColumnWatchNextResults?.results?.results?.contents?.find(c => c.itemSectionRenderer?.sectionIdentifier === 'comment-item-section')
            ];
            
            for (const section of commentSections) {
                if (section && section.itemSectionRenderer) {
                    const comments = section.itemSectionRenderer.contents;
                    if (comments && Array.isArray(comments)) {
                        const commentTexts = comments
                            .slice(0, 10)
                            .map(comment => {
                                if (comment.commentThreadRenderer?.comment?.commentRenderer?.contentText?.runs) {
                                    return comment.commentThreadRenderer.comment.commentRenderer.contentText.runs
                                        .map(run => run.text).join('');
                                }
                                return null;
                            })
                            .filter(text => text && text.length > 10);
                        
                        if (commentTexts.length > 0) {
                            extractedData.comments = commentTexts;
                            console.log('Found comments from ytInitialData:', commentTexts.length);
                            break;
                        }
                    }
                }
            }
        }
        
    } catch (error) {
        console.log('Error accessing YouTube internal data:', error);
    }

    // Method 2: Try to access data from script tags if not available on window
    if (!extractedData.title || !extractedData.description) {
        try {
            const scripts = document.querySelectorAll('script');
            for (const script of scripts) {
                const scriptText = script.textContent;
                
                // Look for ytInitialData in script content
                if (scriptText.includes('ytInitialData')) {
                    const match = scriptText.match(/var ytInitialData = ({.+?});/);
                    if (match) {
                        const ytData = JSON.parse(match[1]);
                        
                        if (!extractedData.title && ytData.contents?.twoColumnWatchNextResults?.results?.results?.contents?.[0]?.videoPrimaryInfoRenderer?.title?.runs) {
                            extractedData.title = ytData.contents.twoColumnWatchNextResults.results.results.contents[0].videoPrimaryInfoRenderer.title.runs
                                .map(run => run.text).join('');
                        }
                        
                        if (!extractedData.description && ytData.contents?.twoColumnWatchNextResults?.results?.results?.contents?.[1]?.videoSecondaryInfoRenderer?.description?.runs) {
                            extractedData.description = ytData.contents.twoColumnWatchNextResults.results.results.contents[1].videoSecondaryInfoRenderer.description.runs
                                .map(run => run.text).join('');
                        }
                    }
                }
            }
        } catch (error) {
            console.log('Error parsing script data:', error);
        }
    }

    // Method 3: Fallback to DOM extraction with very specific selectors
    if (!extractedData.title) {
        // Try to find title in the most specific way possible
        const titleElement = document.querySelector('h1.ytd-video-primary-info-renderer') ||
                           document.querySelector('ytd-video-primary-info-renderer h1') ||
                           document.querySelector('#title h1') ||
                           document.querySelector('h1');
        
        if (titleElement) {
            extractedData.title = titleElement.textContent.trim();
            console.log('Found title from DOM fallback:', extractedData.title);
        }
    }

    if (!extractedData.description) {
        // Try to find description in the most specific way possible
        const descElement = document.querySelector('#description #description-text') ||
                          document.querySelector('#description') ||
                          document.querySelector('ytd-video-secondary-info-renderer #description');
        
        if (descElement) {
            extractedData.description = descElement.textContent.trim();
            console.log('Found description from DOM fallback:', extractedData.description.length);
        }
    }

    // Method 4: Extract any visible text content as fallback
    if (!extractedData.title && !extractedData.description) {
        console.log('Attempting to extract any visible content...');
        
        // Get all text content from the page
        const allText = document.body.innerText;
        const lines = allText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        
        // Filter out common YouTube UI text
        const filteredLines = lines.filter(line => 
            line.length > 10 && 
            line.length < 500 &&
            !line.includes('Follow along using the transcript') &&
            !line.includes('Show transcript') &&
            !line.includes('Hide transcript') &&
            !line.includes('Subscribe') &&
            !line.includes('Like') &&
            !line.includes('Share') &&
            !line.includes('Comment') &&
            !line.includes('Reply') &&
            !line.includes('Edit') &&
            !line.includes('Delete') &&
            !line.includes('YouTube') &&
            !line.includes('Sign in') &&
            !line.includes('Create account') &&
            !line.includes('Settings') &&
            !line.includes('Help') &&
            !line.includes('About') &&
            !line.includes('Terms') &&
            !line.includes('Privacy') &&
            !line.includes('Policy') &&
            !line.includes('Copyright') &&
            !line.includes('©')
        );
        
        if (filteredLines.length > 0) {
            // Take the first few meaningful lines
            extractedData.otherContent = filteredLines.slice(0, 10);
            console.log('Found fallback content:', extractedData.otherContent.length);
        }
    }

    // Build the final content string
    if (extractedData.title) {
        content += `Video Title: ${extractedData.title}\n\n`;
    }

    if (extractedData.channel) {
        content += `Channel: ${extractedData.channel}\n`;
    }

    if (extractedData.views) {
        content += `Views: ${extractedData.views}\n`;
    }

    if (extractedData.description && extractedData.description.length > 10) {
        content += `\nDescription:\n${extractedData.description}\n\n`;
    }

    if (extractedData.transcript && extractedData.transcript.length > 50) {
        content += `Transcript:\n${extractedData.transcript}\n\n`;
    }

    if (extractedData.comments.length > 0) {
        content += `Top Comments:\n${extractedData.comments.join('\n\n')}\n\n`;
    }

    if (extractedData.otherContent.length > 0) {
        content += `Additional Content:\n${extractedData.otherContent.join('\n\n')}\n\n`;
    }

    // If we still have very little content, provide detailed debugging info
    const hasTitle = extractedData.title && extractedData.title.length > 0;
    const hasDescription = extractedData.description && extractedData.description.length > 10;
    const hasTranscript = extractedData.transcript && extractedData.transcript.length > 50;
    const hasComments = extractedData.comments.length > 0;
    const hasOtherContent = extractedData.otherContent.length > 0;

    if (!hasTitle && !hasDescription && !hasTranscript && !hasComments && !hasOtherContent) {
        content = `Unable to extract meaningful content from this YouTube video. 

Debug Information:
- Video ID: ${videoId}
- URL: ${window.location.href}
- Title found: ${hasTitle}
- Description found: ${hasDescription}
- Transcript found: ${hasTranscript}
- Comments found: ${hasComments}
- Other content found: ${hasOtherContent}

Possible solutions:
1. Refresh the page and wait for it to fully load
2. Scroll down to load more content
3. Check if the video has a transcript option (click "..." menu)
4. Try a different video with more content
5. The video may have limited text content

Technical details:
- ytInitialData available: ${!!window.ytInitialData}
- ytInitialPlayerResponse available: ${!!window.ytInitialPlayerResponse}
- Page title: "${document.title}"
- Body text length: ${document.body.innerText.length}`;
    }

    console.log('Final content length:', content.length);
    console.log('Content preview:', content.substring(0, 500) + '...');

    return { text: content, type: 'youtube', videoId: videoId };
}

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
    if (req.type === "GET_ARTICLE_TEXT") {
        // Check if we're on a YouTube video page
        if (isYouTubeVideo()) {
            const result = extractYouTubeContent();
            sendResponse(result);
            return;
        }
        
        // Fallback to regular article extraction
        const text = getArticleText();
        sendResponse({ text, type: 'article' });
    }
});