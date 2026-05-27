const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
const TAVILY_API_URL = "https://api.tavily.com/search";

/**
 * Search the internet using Tavily API
 * @param {string} query - The search query
 * @param {number} maxResults - Maximum number of results to return (default: 5)
 * @returns {Promise<Array>} Array of search results
 */
export async function searchInternet(query, maxResults = 5) {
  try {
    if (!TAVILY_API_KEY) {
      throw new Error("TAVILY_API_KEY is not set in environment variables");
    }

    const payload = {
      api_key: TAVILY_API_KEY,
      query: query,
      max_results: maxResults,
      include_answer: true,
      include_raw_content: true,
    };

    const response = await fetch(TAVILY_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(
        `Tavily API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    // Extract and format results
    const results = data.results.map((result) => ({
      title: result.title,
      url: result.url,
      content: result.content,
      rawContent: result.raw_content,
    }));

    return {
      answer: data.answer,
      results: results,
      query: query,
    };
  } catch (error) {
    console.error("Internet search error:", error.message);
    throw error;
  }
}

/**
 * Format search results for AI context
 * @param {Object} searchData - Search results from Tavily
 * @returns {string} Formatted string for AI context
 */
export function formatSearchResults(searchData) {
  if (!searchData || !searchData.results) {
    return "";
  }

  let formatted = `Search Query: "${searchData.query}"\n`;
  formatted += `Direct Answer: ${searchData.answer || "No direct answer available"}\n\n`;
  formatted += "Sources:\n";

  searchData.results.forEach((result, index) => {
    formatted += `\n${index + 1}. **${result.title}**\n`;
    formatted += `   URL: ${result.url}\n`;
    formatted += `   Content: ${result.content}\n`;
  });

  return formatted;
}

/**
 * Test Tavily connection
 * @returns {Promise<boolean>} True if connection is successful
 */
export async function testTavilyConnection() {
  try {
    const result = await searchInternet("what is the current date", 1);
    console.log("Tavily connection test passed. Result:", result);
    return true;
  } catch (error) {
    console.error("Tavily connection test failed:", error.message);
    return false;
  }
}
