# app/controllers/videos_controller.rb

class VideosController < ApplicationController
  require 'uri'
  require 'json'
  require 'rexml/document'
  require 'cgi'
  require 'typhoeus'

  # GET /videos/:id
  def show
    video_id = params[:id]

    Rails.logger.debug "Received video_id: #{video_id}"

    # Check for user_cookie
    cookie_token = cookies[:user_cookie]

    unless cookie_token.present?
      Rails.logger.error "No valid cookie found"
      render json: { error: 'No valid cookie found' }, status: :unauthorized
      return
    end

    # Validate cookie in database
    @user = User.find_by(cookie_token: cookie_token)
    
    unless @user
      Rails.logger.error "Invalid user for cookie_token: #{cookie_token}"
      render json: { error: 'Invalid cookie token' }, status: :unauthorized
      return
    end

    # Validate video ID
    unless valid_video_id?(video_id)
      Rails.logger.debug "Invalid video ID: #{video_id}"
      render json: { error: 'Invalid YouTube video ID.' }, status: :bad_request
      return
    end

    begin
      response_data = fetch_video_page(video_id)
      
      if response_data.nil?
        Rails.logger.error "fetch_video_page returned nil for video_id: #{video_id}"
        render json: { error: 'Failed to fetch video page' }, status: :unprocessable_entity
        return
      end

      # Extract caption URL and video metadata
      extraction_result = extract_caption_url_and_metadata(response_data)
      
      if extraction_result.nil?
        render json: { error: 'No captions found or failed to extract metadata' }, status: :not_found
        return
      end

      caption_url = extraction_result[:caption_url]
      video_metadata = extraction_result[:metadata]

      # Fetch transcript with timestamps
      transcript_with_time = fetch_transcript(caption_url)
      
      if transcript_with_time.nil?
        render json: { error: 'Failed to fetch transcript' }, status: :unprocessable_entity
        return
      end

      # Create clean transcript (without timestamps)
      transcript_clean = transcript_with_time.map { |t| t['text'] }.join(' ')

      # Calculate word count
      word_count = transcript_clean.split.size

      # Format transcript with timestamps as strings in hh:mm:ss - speech
      transcript_with_time_formatted = transcript_with_time.map do |t|
        formatted_time = format_time_hms(t['start'])
        "#{formatted_time} - #{t['text']}"
      end.join("\n")

      # Send both versions to AI for summarization
      ai_summary_clean = send_to_ai(transcript_clean, prompt_type: 1)
      ai_summary_with_time = send_to_ai(transcript_with_time_formatted, prompt_type: 2)

      # Prepare the response
      render json: {
        video_id: video_id,                                       # Video ID
        words: word_count,                                        # Total word count
        video_title: video_metadata[:title],                      # Video title
        creator_channel: video_metadata[:creator_channel],      # Creator channel name
        description: video_metadata[:description],              # Video description
        video_length: video_metadata[:video_length],            # Video length in seconds
        publication_date: video_metadata[:publication_date],    # Publication date
        is_public: video_metadata[:is_public],                  # Public or private
        transcript_clean: transcript_clean,                     # Version 1: Clean transcript
        transcript_with_time: transcript_with_time,             # Version 2: Transcript with time
        transcript_with_time_2: transcript_with_time_formatted, # Version 3: Transcript with formatted time
        ai_summary_clean: ai_summary_clean,                       # Version 4: AI summary (clean)
        ai_summary_with_time: ai_summary_with_time,                # Version 5: AI summary (with time)
        raw_transcript: transcript_with_time                     # Version 6: Raw transcript
      }, status: :ok

    rescue => e
      Rails.logger.error "Unexpected error in show method: #{e.class} - #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      render json: { error: "Unexpected error: #{e.message}" }, status: :internal_server_error
    end
  end

  private

  # Validates the YouTube video ID format
  def valid_video_id?(input)
    regex = /\A[0-9A-Za-z_-]{11}\z/
    input.match?(regex)
  end

  # Fetches the YouTube video page HTML
  def fetch_video_page(video_id)
    url = "https://www.youtube.com/watch?v=#{video_id}"
    
    begin
      response = Typhoeus.get(
        url,
        headers: {
          'User-Agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
          'Accept-Language' => 'en-US,en;q=0.9'
        },
        timeout: 10
      )

      if response.success?
        response.body
      else
        Rails.logger.error "Failed to fetch video page. Status: #{response.code}"
        nil
      end
    rescue StandardError => e
      Rails.logger.error "Error fetching video page: #{e.message}"
      nil
    end
  end

  # Extracts the caption URL and video metadata from the video page HTML
  def extract_caption_url_and_metadata(response_data)
    begin
      # First attempt using regex
      regex = /var ytInitialPlayerResponse\s*=\s*(\{.*?\});/m
      match = response_data.match(regex)

      # If first pattern fails, try alternative pattern
      unless match
        alt_regex = /ytInitialPlayerResponse\s*=\s*(\{.*?\});/m
        match = response_data.match(alt_regex)
      end

      if match && match[1]
        json_string = match[1]
        player_response = JSON.parse(json_string)
        
        # Extract caption URL
        caption_tracks = player_response.dig('captions', 'playerCaptionsTracklistRenderer', 'captionTracks')
        
        if caption_tracks && !caption_tracks.empty?
          base_url = caption_tracks[0]['baseUrl'].gsub('\\u0026', '&')
        else
          Rails.logger.info 'No caption tracks found.'
          return nil
        end

        # Extract video metadata
        video_details = player_response.dig('videoDetails')
        microformat = player_response.dig('microformat', 'playerMicroformatRenderer')

        metadata = {
          title: video_details['title'],
          creator_channel: video_details['author'],
          description: video_details['shortDescription'],
          video_length: video_details['lengthSeconds'].to_i,
          publication_date: microformat['publishDate'], # Format: YYYY-MM-DD
          is_public: !video_details['isPrivate']  # Assuming 'isPrivate' boolean exists
        }

        return { caption_url: base_url, metadata: metadata }
      else
        Rails.logger.info 'No caption data found in the response.'
        nil
      end
    rescue => e
      Rails.logger.error "An error occurred while extracting the caption URL and metadata: #{e.message}"
      nil
    end
  end

  # Fetches and parses the transcript from the caption URL
  def fetch_transcript(caption_url)
    begin
      response = Typhoeus.get(caption_url)

      if response.success?
        xml_data = response.body
        document = REXML::Document.new(xml_data)
        
        transcript_elements = document.elements.to_a('transcript/text')
        
        transcript_data = transcript_elements.map do |element|
          start_time = element.attributes['start'].to_f
          duration = element.attributes['dur'] ? element.attributes['dur'].to_f : 0.0
          text = CGI.unescapeHTML(element.text || '').strip
          {
            'start' => start_time,
            'duration' => duration,
            'text' => text
          }
        end

        transcript_data
      else
        Rails.logger.error "Failed to fetch transcript. Status: #{response.code}"
        nil
      end
    rescue => e
      Rails.logger.error "Error fetching or parsing the transcript: #{e.message}"
      nil
    end
  end

  # Converts seconds to "hh:mm:ss" format
  def format_time_hms(seconds)
    total_seconds = seconds.floor
    hours = (total_seconds / 3600).floor
    minutes = ((total_seconds % 3600) / 60).floor
    secs = total_seconds % 60
    "#{format('%02d', hours)}:#{format('%02d', minutes)}:#{format('%02d', secs)}"
  end

  # Sends the transcript to the AI for summarization
  # Sends the transcript to the ChatGPT API for summarization
  def send_to_ai(transcript, prompt_type: 1)
    require 'httparty'
    require 'json'
    
    # إعداد نص الموجه (prompt) بحسب نوع الطلب
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
  
    # إعداد الرؤوس كما هو مطلوب
    headers = {
      'Content-Type' => 'application/json',
      'User-Agent' => 'Summarify/113 CFNetwork/1494.0.7 Darwin/23.4.0',
      'x-device-type' => 'iPhone14,2',
      'x-timezone' => 'Asia/Riyadh',
      'x-input-tokens' => '4851',
      'x-device' => '0',
      'x-os' => '17.4.1',
      'x-summary-type' => 'detailed',
      'x-bundle-id' => 'nz.digitaltools.Tube-GPT',
      'x-url' => 'i9EcMnrXuq8',
      'x-app-version' => '2.13.2',
      'x-duration' => '31',
      'Connection' => 'keep-alive',
      'x-presentation-type' => 'app',
      'Accept-Language' => 'ar',
      'x-app-build' => '113',
      'x-user-id' => '1B62F282-05C4-4CD7-A9D0-06D018CB69D6',
      'Accept' => '*/*',
      'x-api-key' => '02054242-10F4-456C-878E-1B8DC1355F85',
      'Accept-Encoding' => 'gzip, deflate, br'
    }
    
    # إعداد جسم الطلب (body) كما في كود Go مع تفعيل وضع التدفق (stream)
    body = {
      temperature: 0.8,
      max_tokens: 4000,
      model: 'gpt-4o-mini',
      language: 'ar',
      stream: true,
      messages: [
        {
          role: 'system',
          content: "Act as a helpful assistant that summarises YouTube videos, to enable users to save time and better understand youtube videos, please use Markdown formatting and all your responses should be in Arabic."
        },
        {
          role: 'user',
          content: prompt_text
        }
      ]
    }.to_json
    
    begin
      response = HTTParty.post(
        'https://api.summarify.app/v1/chat/completions',
        headers: headers,
        body: body
      )
      
      if response.code == 200
        ai_text = ""
        # تقسيم الاستجابة إلى أسطر ومعالجة كل سطر
        response.body.each_line do |line|
          line = line.strip
          # التأكد من أن السطر يبدأ بـ "data:"
          next unless line.start_with?("data:")
          data_str = line.sub(/^data:\s*/, '')
          # تخطي الأسطر التي تحتوي على [DONE] أو فارغة
          next if data_str == "[DONE]" || data_str.empty?
          begin
            chunk = JSON.parse(data_str)
            # استخراج النص من المفتاح delta -> content
            if chunk["choices"] && chunk["choices"][0] && chunk["choices"][0]["delta"] && chunk["choices"][0]["delta"]["content"]
              ai_text << chunk["choices"][0]["delta"]["content"]
            end
          rescue JSON::ParserError => e
            Rails.logger.error "JSON Parsing error: #{e.message}"
            next
          end
        end
        Rails.logger.info "\e[32mSummarify API Status: Success\e[0m"
        return { summarize_ai: ai_text }
      else
        Rails.logger.error "\e[31mSummarify API Error: #{response.body}\e[0m"
        return nil
      end
    rescue => e
      Rails.logger.error "\e[31mSummarify API Exception: #{e.message}\e[0m"
      nil
    end
  end  
end