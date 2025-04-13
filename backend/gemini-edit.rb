require 'httparty'
require 'json'
require 'base64'

# استبدل بمفتاح API الخاص بك

# نقطة النهاية لـ Gemini Pro Vision
url = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=#{api_key1}"

# قراءة الصورة وتشفيرها بـ base64
image_path = '/Users/qppn/Desktop/rails/summarize-youtube-app/chat_bot.png'
image_data = Base64.strict_encode64(File.read(image_path))

# بناء body الطلب
body = {
  contents: [
    {
      parts: [
        { text: "Create me a prompt to describe this image" },
        { inline_data: { mime_type: "image/jpeg", data: image_data } }
      ]
    }
  ]
}.to_json

# إرسال الطلب باستخدام HTTParty
response = HTTParty.post(
  url,
  headers: { 'Content-Type' => 'application/json' },
  body: body
)

# التحقق من وجود أخطاء في الطلب
unless response.success?
  puts "HTTP Request failed with code #{response.code}"
  puts "Response body: #{response.body}"
  exit
end

# تحليل الرد وطباعته
parsed_response = JSON.parse(response.body)
puts "Full API Response:\n#{JSON.pretty_generate(parsed_response)}"

# استخراج نص الرد من AI
if parsed_response['candidates'] && parsed_response['candidates'][0] && 
   parsed_response['candidates'][0]['content'] && 
   parsed_response['candidates'][0]['content']['parts'] && 
   parsed_response['candidates'][0]['content']['parts'][0] && 
   parsed_response['candidates'][0]['content']['parts'][0]['text']
  
  ai_response_text = parsed_response['candidates'][0]['content']['parts'][0]['text']
  puts "AI Response: #{ai_response_text}"
else
  puts "No AI response found in the API response."
end