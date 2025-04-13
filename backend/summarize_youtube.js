const axios = require('axios');
const fs = require('fs');
const prompt = require('prompt-sync')();
const { parseStringPromise } = require('xml2js');
const he = require('he');  // Import the 'he' library

function extractCaptionUrl(responseData) {
    try {
        // Extract ytInitialPlayerResponse JSON data
        const regex = /var ytInitialPlayerResponse = (\{.*?\});/s;
        let match = responseData.match(regex);

        if (!match) {
            // Try alternative pattern
            const altRegex = /ytInitialPlayerResponse\s*=\s*(\{.*?\});/s;
            match = responseData.match(altRegex);
        }

        if (match && match[1]) {
            const jsonString = match[1];
            const playerResponse = JSON.parse(jsonString);

            const captionTracks = playerResponse.captions?.playerCaptionsTracklistRenderer?.captionTracks;
            if (captionTracks && captionTracks.length > 0) {
                // You can choose the desired language here, defaulting to the first track
                let baseUrl = captionTracks[0].baseUrl;
                // Decode any unicode characters
                baseUrl = baseUrl.replace(/\\u0026/g, '&');
                return baseUrl;
            } else {
                console.log('No caption tracks found.');
                return null;
            }
        } else {
            console.log('No caption data found in the response.');
            return null;
        }
    } catch (error) {
        console.error('An error occurred while extracting the caption URL:', error);
        return null;
    }
}

function extractVideoId(input) {
    const regex = /(?:v=|\/)([0-9A-Za-z_-]{11})/;
    const match = input.match(regex);
    if (match && match[1]) {
        return match[1];
    } else if (/^[0-9A-Za-z_-]{11}$/.test(input)) {
        return input;
    } else {
        return null;
    }
}

async function fetchTranscript(captionUrl) {
    try {
        const response = await axios.get(captionUrl);
        const xmlData = response.data;

        // Parse the XML and extract the text content
        const result = await parseStringPromise(xmlData, { explicitArray: false });
        const transcript = result.transcript.text;

        if (Array.isArray(transcript)) {
            // Combine all text elements and decode HTML entities
            const transcriptText = transcript.map(item => he.decode(item._)).join(' ');
            return transcriptText;
        } else if (typeof transcript === 'object' && transcript._) {
            return he.decode(transcript._);
        } else {
            console.log("No transcript text found.");
            return null;
        }
    } catch (error) {
        console.error('Error fetching or parsing the transcript:', error.message);
        return null;
    }
}

(async function() {
    const userInput = prompt("Enter YouTube video URL or ID: ");
    const videoId = extractVideoId(userInput);

    if (!videoId) {
        console.log("Invalid YouTube video ID.");
        return;
    }

    const url = `https://www.youtube.com/watch?v=${videoId}`;
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
                'Accept-Language': 'en-US,en;q=0.9',
            }
        });
        const responseData = response.data;

        // // Save the response to an HTML file for inspection
        // fs.writeFileSync("youtube_response.html", responseData, "utf8");
        // console.log("Response saved to youtube_response.html");

        const captionUrl = extractCaptionUrl(responseData);
        if (captionUrl) {
            // Fetch the transcript
            const transcriptText = await fetchTranscript(captionUrl);
            if (transcriptText) {
                console.log(transcriptText);
            } else {
                console.log("Failed to extract transcript text.");
            }
        } else {
            console.log("Failed to extract caption URL.");
        }
    } catch (error) {
        console.error("Error fetching video data:", error.message);
    }
})();