# ⚡ Auto Upstrive Daily Question Responder

An automated serverless function that responds to daily questions on the Upstrive platform with randomly selected positive emotions. 🚀

## 🧰 Usage

### POST /

Automatically responds to the daily question with a random positive emotion.

**Required Environment Variables:**

- `AUTH_HEADER`: Authorization token for the Upstrive API
- `USER_ID`: User ID for the Upstrive platform
- `API_BASE_URL`: (Optional) Base URL for the API (defaults to `https://api.upstrivesystem.com`)

**Response**

Sample `200` Success Response:

```json
{
  "success": true,
  "message": "Successfully responded to the daily question.",
  "selectedEmotion": "happy",
  "response": {
    "data": {
      // API response data
    }
  }
}
```

Sample Error Response:

```json
{
  "success": false,
  "message": "An unexpected error occurred. Please try again."
}
```

## ⚙️ Configuration

| Setting           | Value         |
| ----------------- | ------------- |
| Runtime           | Node (18.0+)  |
| Entrypoint        | `src/main.js` |
| Build Commands    | `npm install` |
| Permissions       | `any`         |
| Timeout (Seconds) | 30            |

## 🔒 Environment Variables

| Variable     | Description                        | Required |
| ------------ | ---------------------------------- | -------- |
| AUTH_HEADER  | Authorization token for API access | Yes      |
| USER_ID      | User identifier                    | Yes      |
| API_BASE_URL | Base URL for the API (optional)    | No       |

## 📦 Dependencies

- Node.js 18.0+
- No external runtime dependencies (uses built-in fetch API)

## 🚀 Deployment

1. Set the required environment variables
2. Deploy to your serverless platform
3. Configure the function to trigger as needed (e.g., daily cron job)
