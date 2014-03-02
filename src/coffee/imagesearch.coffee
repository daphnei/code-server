https = require("https")
Q = require("q")

cx = '017716653312651474242%3Af1wy4gpl-78'
key = 'AIzaSyAwNFSNnkwld4r-GF3yYcaH0DBkpbck6sw'
num = 1
safe = 'high'
searchType = 'image'
imgType = ''

baseUrl = 'https://www.googleapis.com/customsearch/v1?'

#https://www.googleapis.com/customsearch/v1?q=pineapple&cx=017716653312651474242%3Af1wy4gpl-78&num=2&safe=medium&searchType=image&key=AIzaSyAwNFSNnkwld4r-GF3yYcaH0DBkpbck6sw
exports.findImage = (keyword) ->
	deferred = Q.defer()

	keyword = keyword.replace('%', '')

	console.log("In here yo!")
	#&imgType=#{imgType}&
	url = "#{baseUrl}q=#{keyword}&cx=#{cx}&key=#{key}&num=#{num}&safe=#{safe}&searchType=#{searchType}&rights=cc_publicdomain+cc_noncommercial"
	https.get url, (stream) ->
		console.log(url)
		buffer = ""
		stream.on 'data', (packet) ->
			buffer += packet
		stream.on 'end', () ->
			console.log "Buffer is: "
			console.log buffer
			data = JSON.parse(buffer)
			console.log(buffer)
			if (data? && data.items? && data.items.length > 0)
				console.log "GOOD"
				imageLink = data.items[0].link
				deferred.resolve(imageLink)
			else
				console.log "BAD"
				deferred.reject()

	return deferred.promise

