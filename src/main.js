/**
 * Environment variables
 */
const AUTH_HEADER = process.env.AUTH_HEADER;
const USER_ID = process.env.USER_ID;
const API_BASE_URL =
  process.env.API_BASE_URL || 'https://api.upstrivesystem.com';

/**
 * Configuration constants
 */
const API_ENDPOINTS = {
  RESPOND_TO_DAILY_QUESTION: '/api/respondToDailyQuestion',
};

const EMOTIONS = ['happy', 'ecstatic', 'inspired', 'calm'];

const REQUEST_TIMEOUT = 30000; // 30 seconds

/**
 * Validates required environment variables
 * @returns {boolean} True if all required env vars are present
 */
function validateEnvironment() {
  const required = ['AUTH_HEADER', 'USER_ID'];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
    return false;
  }
  return true;
}

/**
 * Creates an AbortController with timeout
 * @param {number} timeoutMs - Timeout in milliseconds
 * @returns {AbortController} Configured abort controller
 */
function createTimeoutController(timeoutMs) {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeoutMs);
  return controller;
}

/**
 * Handles API response and extracts JSON data
 * @param {Response} response - Fetch API response object
 * @returns {Promise<Object>} Parsed JSON data
 * @throws {Error} If response is not ok or JSON parsing fails
 */
async function handleApiResponse(response) {
  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(
      `API request failed: ${response.status} ${response.statusText} - ${errorText}`
    );
  }

  try {
    return await response.json();
  } catch (parseError) {
    throw new Error(
      `Failed to parse API response as JSON: ${parseError.message}`
    );
  }
}

/**
 * Main serverless function handler
 * @param {Object} params - Function parameters
 * @param {Object} params._req - Request object (unused)
 * @param {Object} params.res - Response object
 * @param {Function} params.log - Logging function
 * @param {Function} params.error - Error logging function
 * @returns {Object} JSON response
 */
export default async ({ _req, res, log, error }) => {
  // Validate environment on startup
  if (!validateEnvironment()) {
    return res.json(
      {
        success: false,
        message:
          'Server configuration error: Missing required environment variables',
      },
      500
    );
  }

  try {
    // Select random emotion
    const selectedEmotion =
      EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)];

    log(`Selected emotion: ${selectedEmotion}`);

    // Prepare request payload
    const payload = {
      emotion: selectedEmotion,
      created_date: new Date().toISOString(),
      user_id: USER_ID,
      type: 'daily',
      day_code: new Date().toISOString().slice(0, 10),
      message: '',
      reasonsList: [],
    };

    log(
      `Making API request to: ${API_BASE_URL}${API_ENDPOINTS.RESPOND_TO_DAILY_QUESTION}`
    );

    // Create timeout controller
    const controller = createTimeoutController(REQUEST_TIMEOUT);

    // Make API request
    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.RESPOND_TO_DAILY_QUESTION}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: AUTH_HEADER,
          'User-Agent': 'auto-upstrive/1.0.0',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      }
    );

    // Handle API response
    const apiData = await handleApiResponse(response);

    log('API request successful');

    // Return success response
    return res.json({
      success: true,
      message: 'Successfully responded to the daily question.',
      selectedEmotion: selectedEmotion,
      response: {
        data: apiData,
      },
    });
  } catch (err) {
    // Handle different types of errors
    if (err.name === 'AbortError') {
      error('Request timed out');
      return res.json(
        {
          success: false,
          message: 'Request timed out. Please try again.',
        },
        408
      );
    }

    if (err.message.includes('Failed to parse API response')) {
      error(`JSON parsing error: ${err.message}`);
      return res.json(
        {
          success: false,
          message: 'Invalid response from server. Please try again later.',
        },
        502
      );
    }

    if (err.message.includes('API request failed')) {
      error(`API error: ${err.message}`);
      return res.json(
        {
          success: false,
          message: 'External service error. Please try again later.',
        },
        502
      );
    }

    // Generic error handling
    error(`Unexpected error: ${err.message}`);
    return res.json(
      {
        success: false,
        message: 'An unexpected error occurred. Please try again.',
      },
      500
    );
  }
};
