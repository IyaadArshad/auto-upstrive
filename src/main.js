const AuthorizationHeader = process.env.AUTH_HEADER
const UserId = process.env.USER_ID

export default async ({ req, res, log, error }) => {

  const emotions = [
    "happy",
    "ecstatic",
    "inspired",
    "calm"
  ]

  const selectedEmotion = emotions[Math.floor(Math.random() * emotions.length)];

  if (!AuthorizationHeader || !UserId) {
    return req.json({
      "success": false,
      "message": "Required environment variables are not set."
    });
  }

  try {
    // POST Request to 	https://api.upstrivesystem.com/api/respondToDailyQuestion

    const response = await fetch('https://api.upstrivesystem.com/api/respondToDailyQuestion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': process.env.AUTH_HEADER
      },
      body: JSON.stringify({
        "emotion": selectedEmotion,
        "created_date": Date.now(),
        "user_id": UserId,
        "type": "daily",
        "day_code": new Date().toISOString().slice(0, 10),
        "message": "",
        "reasonsList": []
      })
    });
  } catch (err) {
    error(err);
    return req.json({
      "success": false,
      "message": "An error occurred while making the request."
    })
  }

  return req.json({
    "success": true,
    "message": "Successfully responded to the daily question.",
    "selectedEmotion": selectedEmotion,
    "response": {
      data: await response.json()
    }
  });
};