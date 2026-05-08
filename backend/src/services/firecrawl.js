const axios = require('axios');

const FIRECRAWL_URL = 'https://api.firecrawl.dev/v1/scrape';

/**
 * Scrape product info from JioMart (primary) or BigBasket (fallback).
 * Never throws — always returns a string.
 * @param {string} productName
 * @returns {string} markdown content or ''
 */
async function scrapeProduct(productName) {
  const headers = {
    Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}`,
    'Content-Type': 'application/json',
  };

  const scrapeConfig = {
    formats: ['markdown'],
    onlyMainContent: true,
    waitFor: 2000,
  };

  // --- Primary: JioMart ---
  try {
    const jioRes = await axios.post(
      FIRECRAWL_URL,
      {
        url: `https://www.jiomart.com/search#q=${encodeURIComponent(productName)}&t=all`,
        ...scrapeConfig,
      },
      { headers }
    );

    const markdown = jioRes.data?.data?.markdown;
    if (markdown && markdown.trim().length > 0) {
      return markdown;
    }
  } catch (err) {
    console.error('[firecrawl:jiomart]', err.message);
  }

  // --- Fallback: BigBasket ---
  try {
    const bbRes = await axios.post(
      FIRECRAWL_URL,
      {
        url: `https://www.bigbasket.com/ps/?q=${encodeURIComponent(productName)}`,
        ...scrapeConfig,
      },
      { headers }
    );

    const markdown = bbRes.data?.data?.markdown;
    if (markdown && markdown.trim().length > 0) {
      return markdown;
    }
  } catch (err) {
    console.error('[firecrawl:bigbasket]', err.message);
  }

  return '';
}

module.exports = { scrapeProduct };
