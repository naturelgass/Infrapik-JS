onmessage = function(event) {

    var imageData = event.data.post.imageData,
        filter = event.data.post.filter,
        options = event.data.post.options,
        sliders = event.data.post.sliders;

    if(filter == "negative"){
        var pixels = imageData.data;
        for (var i = 0; i < pixels.length; i += 4) {
            pixels[i]   = sliders[0] - pixels[i];   // red
            pixels[i+1] = sliders[1] - pixels[i+1]; // green
            pixels[i+2] = sliders[2] - pixels[i+2]; // blue
            // i+3 is alpha (the fourth element)
        }
    }

	postMessage({
        imageData: imageData,
        filter: filter,
        options: options,
        sliders: sliders
	});
};
