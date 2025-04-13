const https = require('https');
const fs = require('fs');
const path = require('path');

// تجهيز البيانات المرسلة بصيغة JSON
const postData = JSON.stringify({
  agentSys: { 
    cText: "", 
    ctype: "text", 
    cImageData: "", 
    role: "system" 
  },
  prompts: [
    {
      ctype: "text",
      cImageData: "",
      cText: "create image: sow",
      role: "user"
    }
  ],
  idToken: "eyJhbGciOiJSUzI1NiIsImtpZCI6IjcxMTE1MjM1YTZjNjE0NTRlZmRlZGM0NWE3N2U0MzUxMzY3ZWViZTAiLCJ0eXAiOiJKV1QifQ.eyJwcm92aWRlcl9pZCI6ImFub255bW91cyIsImlzcyI6Imh0dHBzOi8vc2VjdXJldG9rZW4uZ29vZ2xlLmNvbS9haS1hZ2UiLCJhdWQiOiJhaS1hZ2UiLCJhdXRoX3RpbWUiOjE3NDMyODY1ODMsInVzZXJfaWQiOiJ2WnhiWHN0SzBuWnI5ckl0aHh1NXFWUHRLMk0yIiwic3ViIjoidlp4YlhzdEswblpyOXJJdGh4dTVxVlB0SzJNMiIsImlhdCI6MTc0NDI0NjU1NywiZXhwIjoxNzQ0MjUwMTU3LCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7fSwic2lnbl9pbl9wcm92aWRlciI6ImFub255bW91cyJ9fQ.Z9ycYcQSVE2DLRmA7ndcz5SY7H0RYC1tji4TXzxMgwEbK7oOFng4um96aQYZeF9l9zhMK2aUNt_FxZQKuJrBIMDN26-XtYrJzplVYfcVuSVUhohDRDvhP80tSjXErIbuKAgyFrO9-qMHyFlwd_76RMPLINkRPi--xJ3M0MyK0NEapG0s9hxPI9wMvdLO_7Cg-yzFOy22zdqFFoQIq75xn3S9xxEbP3f7Hxfap-nkyRvkmPl1AtuwBvKV9PqVBJgc5Eto69Yus79wnWUBMgiWRVNOzbX8MiTbp2kdOcEDGEfEOf2ki4r1dFP2Yez-XYjxYXBo0uSwAFxYxvDaTFS_EQ",
  settings: {
    top_p: 100,
    presence_penalty: 100,
    random_seed: -1,
    temperature: 100,
    modelCategory: "textToText",
    top_k: 100,
    frequency_penalty: 100,
    model: "DALL-E3"
  },
  modelCategory: "textToText",
  agentName: "claude-3-7-sonnet-20250219",
  model: "claude-3-7-sonnet-20250219",
  client: {
    plan: "",
    device: { appVersion: "25.04" }
  }
});

// إعداد خيارات الطلب HTTPS
const options = {
  hostname: 'us-central1-ai-age.cloudfunctions.net',
  port: 443,
  path: '/generateFromText',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': '*/*',
    'User-Agent': 'MakeNess AI Studio/4 CFNetwork/3826.400.120 Darwin/24.3.0',
    'Accept-Language': 'ar',
    'Content-Length': Buffer.byteLength(postData)
  }
};

// إنشاء الطلب
const req = https.request(options, res => {
  let responseBody = '';

  res.on('data', chunk => {
    responseBody += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200) {
      try {
        const responseJson = JSON.parse(responseBody);
        const base64Image = responseJson.data;

        // التأكد من أن السلسلة المستلمة غير فارغة
        if (!base64Image || base64Image.length === 0) {
          throw new Error("Image data is empty!");
        }

        // تحديد مسار حفظ الصورة – يمكن استخدام مسار مطلق للتأكد من صلاحيات الكتابة
        const outputPath = path.join(__dirname, "output.png");

        // محاولة كتابة الملف مع تغليف العملية في try/catch
        fs.writeFile(outputPath, base64Image, { encoding: 'base64' }, err => {
          if (err) {
            console.error("An error occurred while saving the image file:", err);
          } else {
            console.log("save successfully ✓:", outputPath);
          }
        });
      } catch (err) {
        console.error("An error occurred while processing data:", err);
      }
    } else {
      console.error(`Request failed: ${res.statusCode} - ${res.statusMessage}`);
    }
  });
});

req.on('error', error => {
  console.error("An error occurred in the request:", error);
});

// إرسال البيانات
req.write(postData);
req.end();
