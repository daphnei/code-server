http = require("http")
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

	keyword = keyword.replace('%', '').replace('@', '').replace(',', '').replace('+', '')

	console.log("In here yo!")
	#&imgType=#{imgType}&
	url = "http://www.bing.com/images/search?q=#{keyword}"
	http.get url, (stream) ->
		buffer = ""
		stream.on 'data', (packet) ->
			buffer += packet
		stream.on 'end', () ->
			startReadIndex = buffer.indexOf("imgurl:", buffer.indexOf("dg_u")) + 13
			endReadIndex = buffer.indexOf('&quot;', startReadIndex)
			url = buffer.substring(startReadIndex, endReadIndex)
			console.log "Image is: " + url
			deferred.resolve url

	return deferred.promise

