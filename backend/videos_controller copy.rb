class VideosController < ApplicationController
    require 'net/http'
    require 'uri'
    require 'json'
    require 'nokogiri'
    require 'cgi'
    require 'httparty' # تأكد من إضافة HTTParty
  
    # GET /videos/:id
    def show
      video_id = params[:id]
  
      Rails.logger.debug "Received video_id: #{video_id}"
  
      unless valid_video_id?(video_id)
        Rails.logger.debug "Invalid video ID: #{video_id}"
        render json: { error: 'Invalid YouTube video ID.' }, status: :bad_request
        return
      end
  
      begin
        response_data = fetch_video_page(video_id)
        Rails.logger.debug "Fetched video page data: #{response_data[0..500]}" # عرض أول 500 حرف فقط لتجنب الفيض
        caption_url = extract_caption_url(response_data)
  
        if caption_url
          Rails.logger.debug "Extracted caption URL: #{caption_url}"
          transcript_text = fetch_transcript(caption_url)
          if transcript_text
            Rails.logger.debug "Transcript extracted successfully."
  
            # استدعاء دالة الذكاء الاصطناعي
            ai_response_text1, ai_response_text2 = send_to_ai(transcript_text)
            Rails.logger.debug "AI Response Text1: #{ai_response_text1}"
            Rails.logger.debug "AI Response Text2: #{ai_response_text2}"
  
            if ai_response_text1 && ai_response_text2
              render json: { 
                transcript: transcript_text, 
                "summarize ai": ai_response_text1,
                "summarize ai flash card": ai_response_text2
              }, status: :ok
            else
              render json: { 
                transcript: transcript_text, 
                ai_error: 'Failed to get AI responses.' 
              }, status: :ok
            end
          else
            Rails.logger.debug "Failed to extract transcript text."
            render json: { error: 'Failed to extract transcript text.' }, status: :unprocessable_entity
          end
        else
          Rails.logger.debug "Failed to extract caption URL."
          render json: { error: 'Failed to extract caption URL.' }, status: :unprocessable_entity
        end
      rescue => e
        Rails.logger.error "Error fetching video data: #{e.message}"
        render json: { error: "Error fetching video data: #{e.message}" }, status: :internal_server_error
      end
    end
  
    private
  
    def valid_video_id?(input)
      regex = /\A(?:[0-9A-Za-z_-]{11})\z/
      input.match?(regex)
    end
  
    def fetch_video_page(video_id)
      url = "https://www.youtube.com/watch?v=#{video_id}"
      uri = URI.parse(url)
      response = Net::HTTP.get_response(uri)
      response.body
    end
  
    def extract_caption_url(response_data)
      regex = /var ytInitialPlayerResponse\s*=\s*(\{.*?\});/m
      match = response_data.match(regex)
  
      Rails.logger.debug "Regex match result: #{match.inspect}"
  
      return nil unless match && match[1]
      # أو يمكنك استخدام:
      # return nil unless match&.
  
      begin
        player_response = JSON.parse(match[1])
        Rails.logger.debug "Player response: #{player_response.inspect}"
  
        caption_tracks = player_response.dig('captions', 'playerCaptionsTracklistRenderer', 'captionTracks')
        Rails.logger.debug "Caption tracks: #{caption_tracks.inspect}"
  
        return nil unless caption_tracks&.any?
  
        caption_url = caption_tracks.first['baseUrl'].gsub('\\u0026', '&')
        Rails.logger.debug "Caption URL: #{caption_url}"
  
        caption_url
      rescue JSON::ParserError => e
        Rails.logger.error "JSON parsing error: #{e.message}"
        nil
      end
    end
  
    def fetch_transcript(caption_url)
      uri = URI.parse(caption_url)
      response = Net::HTTP.get(uri)
      xml_data = response
  
      document = Nokogiri::XML(xml_data)
      transcript = []
  
      document.xpath('//transcript/text').each do |element|
        transcript << CGI.unescapeHTML(element.text || '')
      end
  
      transcript.join(' ')
    rescue => e
      Rails.logger.error "Error fetching or parsing the transcript: #{e.message}"
      nil
    end

    def send_to_ai(transcript, prompt_type: 1)
      require 'httparty'
      require 'json'
    
      return nil unless api_key
    
      prompt_1 = <<~PROMPT
        You are an AI assistant specializing in summarizing YouTube videos.
        Your task is to analyze the provided transcript and provide a comprehensive summary of the topics covered.
        The summary should be within 1500 words and include the following:
    
        1. **List of Main Topics Covered:**
           - Provide a numbered list of the main topics discussed in the video.
    
        2. **Detailed Summary:**
           For each main topic, include:
           - **Topic Title** - 
             - Brief description and key points of the topic.
             - Include any relevant subtopics or important details.
    
        3. **Sources and References:**
           - Provide sources, references, or links related to the topics discussed in the video.
           - Ensure that the links are relevant and credible.
    
        4. **Roadmap of Concepts:**
           - Create a roadmap that outlines and clarifies the key concepts presented in the transcript.
           - The roadmap should help in understanding the flow and relationship between different concepts.
    
        Here is the transcript:
        ---
        #{transcript}
        ---
      PROMPT
    
      prompt_2 = <<~PROMPT
        You are an AI assistant specializing in summarizing YouTube videos.
        Your task is to analyze the provided transcript and provide a comprehensive summary of the topics covered, specifying the exact hours, minutes, and seconds when these topics were discussed.
        The summary should be within 1500 words and include the following:
    
        1. **List of Main Topics Covered:**
           - Provide a numbered list of the main topics discussed in the video.
    
        2. **Detailed Summary:**
           For each main topic, include:
           - **Topic Title** - Starts at [hh:mm:ss]
             - Brief description and key points of the topic.
             - Include any relevant subtopics or important details.
    
        3. **Sources and References:**
           - Provide sources, references, or links related to the topics discussed in the video.
           - Ensure that the links are relevant and credible.
    
        4. **Roadmap of Concepts:**
           - Create a roadmap that outlines and clarifies the key concepts presented in the transcript.
           - The roadmap should help in understanding the flow and relationship between different concepts.
    
        Here is the transcript:
        ---
        #{transcript}
        ---
      PROMPT
    
      prompt_text = prompt_type == 1 ? prompt_1 : prompt_2
    
      headers = {
        'Content-Type' => 'application/json',
        'Authorization' => "Bearer #{api_key}"
      }
    
      body = {
        model: 'gpt-3.5-turbo', # يمكنك تغييره لـ gpt-4 إذا حاب
        messages: [
          {
            role: 'user',
            content: prompt_text
          }
        ],
        max_tokens: 2500
      }.to_json
    
      begin
        response = HTTParty.post(
          'https://api.openai.com/v1/chat/completions',
          headers: headers,
          body: body
        )
    
        if response.code == 200
          parsed_response = JSON.parse(response.body)
          ai_response_text = parsed_response['choices'][0]['message']['content']
          Rails.logger.info "ChatGPT API Status: \e[32mG0000000000000000D\e[0m"
          return { summarize_ai: ai_response_text }
        else
          Rails.logger.info "ChatGPT API Status: \e[31mBAAAAAAAAAAAAAAAAD\e[0m"
          Rails.logger.error "ChatGPT API Error: #{response.body}"
          return nil
        end    
      rescue => e
        Rails.logger.error "ChatGPT API Exception: #{e.message}"
        nil
      end
    end
end