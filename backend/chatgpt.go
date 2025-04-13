package main

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/valyala/fasthttp"
)

// Chunk يمثل بنية الاستجابة لكل جزء من الرد (chunk)
type Chunk struct {
	Choices []struct {
		Delta struct {
			Role    string `json:"role"`
			Content string `json:"content"`
		} `json:"delta"`
		FinishReason *string `json:"finish_reason"`
	} `json:"choices"`
}

func main() {
	respBody, err := SendSummarifyRequest()
	if err != nil {
		fmt.Println("Error:", err)
		return
	}

	summaryText := ExtractText(respBody)
	fmt.Println(summaryText)
}

// SendSummarifyRequest يقوم بإرسال الطلب واسترجاع الاستجابة كـ []byte.
func SendSummarifyRequest() ([]byte, error) {
	body := `{
		"temperature":0.8,
		"max_tokens":4000,
		"model":"gpt-4o-mini",
		"language":"ar",
		"stream":true,
		"messages":[
		  {
			"role":"system",
			"content":"Act as a helpful assistant that summarises YouTube videos, to enable users to save time and better understand youtube videos, please use Markdown formatting and all your responses should be in Arabic."
		  },
		  {
			"role":"user",
			"content":"Please summarise this YouTube video transcript into short paragraphs covering the key points, each paragraph should be no longer that 50 words. \"Do not repeat your self.\n\nTranscript: [4.6] hi everyone today we're going to walk through building a Ruby on Rails application that is going to allow us to uh generate QR codes with a embedded logo in the middle of it to make this happen we're going to create a single form uh that's going to have a URL input that's going to be the destination of the QR code uh and also a file input for the user to upload a PNG logo uh that's going to be embedded in our generated QR code so let's take a look at how we can get everything started to get started we just need to run our rail's new command uh in our case I'm I'm going to use Tailwind but that's not something that is required to uh have everything working here so we just run our Ra's new command here and this is going to create our new rails application uh as well as bundle install all of the gems that we need so once this is complete we can move directly into that uh new directory that was created and start adding our functionality so now that we've created our rails app uh we just need to move into the directory that was created and uh run our scaffold command so for our scaffold command um we're only going to be creating a single model uh called QR code uh and we're going to give it a single attribute URL uh which is going to be a string that value is going to be uh the URL that the user will input into the field uh whenever they're uploading everything uh to create the combined QR code and to run our SCA command we just need to run bin rails generate scaffold so our scaffold command is going to generate the uh views uh models controllers uh everything that we need to be able to start creating these QR Code records since we're creating an application that has a single model uh another thing that I like adding is making sure our root route is set to the index page for the QR codes so to do that we can go into our routes page and add add root QR codes index so now whenever we start our application and go to Local Host 3000 um we will land uh directly on the index page uh for our QR codes you may have noticed that I haven't ran any of the generated migrations yet after we created our scaffold uh that is because um since we're going to be using active storage in this app um it is going to add its own migration so uh we're going to go ahead and install active storage uh and then migrate uh to add all of the uh new \n[187.519] migrations and tables um that the scaffold and active storage have added so we can do that with in rails active storage install okay now we can just uh migrate our database and this is going to run the migration for active storage as well as creating our QR code model that we scaffold previously to make sure everything is still working uh we can go ahead and start off the application really quick uh make sure that uh everything boots up and we're going to land directly on that QR code index page great so our root route is set up to go to the QR code uh index page and uh everything is ready to go so now that we have active storage installed and ready to go um we can start adding some of our attached image files uh to this QR code model here uh in our case we're going to have three different active storage attachments uh the first one is going to be called logo uh this is what the uh user is going to upload through the form the second one is called Original image so this is going to be a PNG of the QR code uh that gets generated originally and then the third is going to be a combined image which will be a composite of of the logo uh with a little bit of editing and processing um embedded in the middle of the uh original image so the QR code so this is going to be our QR code with the uh logo uh nice and neat in the middle there so now that active storage is add it all we have to do is add has one attached and the name of the attached file that we're looking to add so do has attached logo we'll go ahead and add the rest of the ones that we'll be needing as well okay so uh with active storage installed uh in just three lines we're able to uh attach three different images um all to our model so with this done uh we just need to update our controller so we'll go to cor codes controller and we're going to add logo to our safe params here so now uh when we add our uh logo file field to the form submit this to the controller uh this file field will be picked up with the rest of the pams uh and saved as a new active storage attachment to add the logo file field uh all we have to do is move over to the form so app views QR codes form and then we can copy what's here already for our URL this should be a pretty good start so we'll change this to logo change this to logo and this needs to be file field and don't need any class \n[373.0] stuff so we could delete the rest of this and uh I'm going to add one other small change here I'm going to add accept PNG so this uh is going to limit uh the files that are able to be selected um through the browser uh to just PNG uh this is by no means foolproof um but is just a quick and dirty way uh just to at least try to limit the types of files that we're going to allow in this logo field and as one more quick change uh we're going to add the uh uploaded logo just to the detail page of the QR code um just as an easy way to make sure uh that everything is getting stored correctly so we do that with image tag QR code and logo so this will fail uh if we do try to visit a detail page without a logo attached"
		  }
		]
	  }`

	req := fasthttp.AcquireRequest()
	defer fasthttp.ReleaseRequest(req)

	req.Header.SetMethod("POST")
	req.SetRequestURI("https://api.summarify.app/v1/chat/completions")
	req.Header.Set("Host", "api.summarify.app")
	req.Header.Set("User-Agent", "Summarify/113 CFNetwork/1494.0.7 Darwin/23.4.0")
	req.Header.Set("x-device-type", "iPhone14,2")
	req.Header.Set("x-timezone", "Asia/Riyadh")
	req.Header.Set("x-input-tokens", "4851")
	req.Header.Set("x-device", "0")
	req.Header.Set("x-os", "17.4.1")
	req.Header.Set("x-summary-type", "detailed")
	req.Header.Set("x-bundle-id", "nz.digitaltools.Tube-GPT")
	// يُفضل عدم تحديد Content-Length يدويًا
	req.Header.Set("x-url", "i9EcMnrXuq8")
	req.Header.Set("x-app-version", "2.13.2")
	req.Header.Set("x-duration", "31")
	req.Header.Set("Connection", "keep-alive")
	req.Header.Set("x-presentation-type", "app")
	req.Header.Set("Accept-Language", "ar")
	req.Header.Set("x-app-build", "113")
	req.Header.Set("x-user-id", "1B62F282-05C4-4CD7-A9D0-06D018CB69D6")
	req.Header.Set("Accept", "*/*")
	req.Header.SetContentType("application/json")
	req.Header.Set("x-api-key", "02054242-10F4-456C-878E-1B8DC1355F85")
	req.Header.Set("Accept-Encoding", "gzip, deflate, br")
	req.SetBody([]byte(body))

	resp := fasthttp.AcquireResponse()
	defer fasthttp.ReleaseResponse(resp)

	client := &fasthttp.Client{}
	if err := client.Do(req, resp); err != nil {
		return nil, fmt.Errorf("failed to send request: %w", err)
	}

	return resp.Body(), nil
}

// ExtractText يقوم بتحليل الاستجابة واستخلاص النصوص الموجودة في الحقل content.
func ExtractText(respBody []byte) string {
	lines := strings.Split(string(respBody), "\n")
	var sb strings.Builder

	for _, line := range lines {
		line = strings.TrimSpace(line)
		// نتأكد من أن السطر يبدأ بـ "data:"
		if strings.HasPrefix(line, "data:") {
			data := strings.TrimPrefix(line, "data:")
			data = strings.TrimSpace(data)
			// نتجاهل السطر الذي يحتوي على "[DONE]"
			if data == "[DONE]" || data == "" {
				continue
			}

			var chunk Chunk
			if err := json.Unmarshal([]byte(data), &chunk); err != nil {
				continue
			}
			// نجمع المحتوى الموجود في المفتاح content
			if len(chunk.Choices) > 0 {
				sb.WriteString(chunk.Choices[0].Delta.Content)
			}
		}
	}

	return sb.String()
}
