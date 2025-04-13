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
  
    def send_to_ai(transcript)
      url = "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=AIzaSyCuZDCq2Z2SSDAT3mb5uNYJiaaWarTn1Es"
  
      # إعداد الطلبات
      body1 = {
        contents: [
          {
            role: 'user',
            parts: [
              { text: "Hi, this is extracted caption from YouTube video. Can you summarize it without missing any points? Don't reveal who you are. Your name is Qumma AI. #{transcript}" }
            ]
          }
        ]
      }.to_json
  
      body2 = {
        contents: [
          {
            role: 'user',
            parts: [
              { text: "Hi, this is extracted caption from YouTube video. Can you summarize it into flash cards to make it easy for kids to understand? Don't reveal who you are. Your name is Qumma AI. #{transcript}" }
            ]
          }
        ]
      }.to_json
  
      # إرسال الطلبات باستخدام HTTParty
      response1 = HTTParty.post(
        url,
        headers: { 'Content-Type' => 'application/json' },
        body: body1
      )
      response2 = HTTParty.post(
        url,
        headers: { 'Content-Type' => 'application/json' },
        body: body2
      )
  
      # تحليل الردود
      begin
        parsed_response1 = JSON.parse(response1.body)
        ai_response_text1 = parsed_response1.dig('candidates', 0, 'content', 'parts', 0, 'text')
  
        parsed_response2 = JSON.parse(response2.body)
        ai_response_text2 = parsed_response2.dig('candidates', 0, 'content', 'parts', 0, 'text')
  
        return [ai_response_text1, ai_response_text2]
      rescue => e
        Rails.logger.error "Error parsing AI responses: #{e.message}"
        return [nil, nil]
      end
    end


end