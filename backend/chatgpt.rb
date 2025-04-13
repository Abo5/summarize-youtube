require 'httparty'
require 'json'

class ChatgptService
  include HTTParty
  base_uri 'https://api.openai.com/v1'

  def initialize(api_key)
    @headers = {
      'Content-Type' => 'application/json',
      'Authorization' => "Bearer #{api_key}"
    }
  end

  def chat(prompt, model = 'gpt-3.5-turbo')
    body = {
      model: model,
      messages: [{ role: 'user', content: prompt }]
    }.to_json

    response = self.class.post('/chat/completions', headers: @headers, body: body)
    raise response['error']['message'] unless response.code == 200

    JSON.parse(response.body)['choices'][0]['message']['content']
  end
end

# Usage example:

service = ChatgptService.new(api_key_test)
response = service.chat('What is Ruby on Rails?')
puts "ChatGPT Response: #{response}"
