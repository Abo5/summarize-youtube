require 'net/http'
require 'uri'
require 'json'
require 'rexml/document'
require 'cgi'
require 'readline'

def extract_caption_url(response_data)
  begin
    # استخراج بيانات ytInitialPlayerResponse
    regex = /var ytInitialPlayerResponse = (\{.*?\});/m
    match = response_data.match(regex)

    unless match
      # محاولة نمط بديل
      alt_regex = /ytInitialPlayerResponse\s*=\s*(\{.*?\});/m
      match = response_data.match(alt_regex)
    end

    if match && match[1]
      json_string = match[1]
      player_response = JSON.parse(json_string)

      caption_tracks = player_response.dig('captions', 'playerCaptionsTracklistRenderer', 'captionTracks')
      if caption_tracks && !caption_tracks.empty?
        base_url = caption_tracks[0]['baseUrl']
        # فك ترميز الحروف unicode
        base_url.gsub('\\u0026', '&')
      else
        puts 'No caption tracks found.'
        nil
      end
    else
      puts 'No caption data found in the response.'
      nil
    end
  rescue => e
    puts "An error occurred while extracting the caption URL: #{e.message}"
    nil
  end
end

def extract_video_id(input)
  regex = /(?:v=|\/)([0-9A-Za-z_-]{11})/
  match = input.match(regex)
  if match && match[1]
    match[1]
  elsif /^[0-9A-Za-z_-]{11}$/.match?(input)
    input
  else
    nil
  end
end

def fetch_transcript(caption_url)
  begin
    response = HTTParty.get(caption_url)
    
    if response.success?
      xml_data = response.body
      document = REXML::Document.new(xml_data)
      
      transcript = document.elements.collect('transcript/text') do |element|
        CGI.unescapeHTML(element.text || '')
      end
      
      transcript.join(' ')
    else
      STDERR.puts "Failed to fetch transcript. Status: #{response.code}"
      nil
    end
  rescue => e
    STDERR.puts "Error fetching or parsing the transcript: #{e.message}"
    nil
  end
end


def main
  print 'Enter YouTube video URL or ID: '
  user_input = gets.chomp
  video_id = extract_video_id(user_input)

  unless video_id
    puts 'Invalid YouTube video ID.'
    return
  end

  url = "https://www.youtube.com/watch?v=#{video_id}"
  begin
    uri = URI.parse(url)
    response = Net::HTTP.get_response(uri)
    response_data = response.body

    # استخراج رابط الترجمة
    caption_url = extract_caption_url(response_data)
    if caption_url
      # جلب النصوص
      transcript_text = fetch_transcript(caption_url)
      if transcript_text
        puts transcript_text
      else
        puts 'Failed to extract transcript text.'
      end
    else
      puts 'Failed to extract caption URL.'
    end
  rescue => e
    puts "Error fetching video data: #{e.message}"
  end
end

main()

