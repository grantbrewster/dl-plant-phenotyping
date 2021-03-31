const Result = {
	0: "Fresh",
	1: "Rotten"
};

// import * as tf from '@tensorflow/tfjs';


$("#image-selector").change(function () {
	let reader = new FileReader();
	reader.onload = function () {
        let dataURL = reader.result;
		$("#selected-image").attr("src", dataURL);
		$("#prediction-list").empty();
    }

	let file = $("#image-selector").prop('files')[0];
	reader.readAsDataURL(file);
});

$( document ).ready(function() {
	$('.progress-bar').hide();
});


let model;

$("#loadBtn").click(async function () {
    console.log("hit");
    $('.progress-bar').show();
	console.log("model loading");
	
    // const handler = tfn.io.fileSystem("./path/to/your/model.json");
    // model = await tf.loadModel(handler);
    // model = await tf.loadGraphModel("model/model_js/model.json");
	model = await tf.loadLayersModel('model_2/model.json');
	$('#loadBtn').html('Model Loaded');
	$('#loadBtn').addClass('disabled');
	$('.progress-bar').hide();
});

const width = 128;
const height = 128;

function toMaskImageData(
    segmentation, num_classes, maskBackground = true) {

  const data = segmentation;
  const bytes = new Uint8ClampedArray(width * height * 4);

  for (let i = 0; i < height * width; ++i) {
    const shouldMask = maskBackground ? 1 - data[i] : data[i];
    // alpha will determine how dark the mask should be.
	const alpha = shouldMask * 255;

	const predictedClass = data[i];
	const j = i * 4;

	const classChoiceBG = data[2*i];
	const classChoicePlant = data[2*i+1];

	if (classChoiceBG < classChoicePlant){
		bytes[j + 0] = 0;
		bytes[j + 1] = 255;
		bytes[j + 2] = 0;
		bytes[j + 3] = .75 * 255;
	} else {
		bytes[j + 0] = 0;
		bytes[j + 1] = 0;
		bytes[j + 2] = 0;
		bytes[j + 3] = .75 * 255;
	}
  }

  return new ImageData(bytes, width, height);
};


$("#predictBtn").click(async function () {
    let image = $('#selected-image').get(0);
    
	console.log("Predict Clicked");
	
	let pre_image = tf.browser.fromPixels(image, 3)
		.resizeNearestNeighbor([width, height])
		.expandDims()
        .toFloat();
         
	let predict_result = await model.predict(pre_image);

	result = predict_result.dataSync();

	console.log(result);

	imgData = toMaskImageData(result, false);

    // for(var i=0;i<result.length;i++){
    //     result[i]=result[i]*255.0 + 128.0;
	// }

	// create an offscreen canvas
	var canvas = document.createElement("canvas");
	var ctx = canvas.getContext("2d");

	// size the canvas to your desired image
	canvas.width=width;
	canvas.height=height;

	ctx.putImageData(imgData, 0, 0);


	// ctx.drawImage(imgData, 0, 0);

	// // create imageData object
	// var idata = ctx.createImageData(width, height);

	// idata.data.set(buffer);

	// // update canvas with new data
	// ctx.putImageData(idata, 0, 0);

	var dataUri = canvas.toDataURL();

	$("#predicted-image").attr("src", dataUri);

});

