let isDisease = false;

const maxPixelArea = 8960;
const maxArea = 8110.0;
const maxWeight = 422.1;

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
	$('#leaf-area').hide();
	$('#leaf-weight').hide();
});


const width = 128;
const height = 128;
var pixel_count = 0;
function toMaskImageData(
    segmentation, num_classes, maskBackground = true) {

  const data = segmentation;
  const bytes = new Uint8ClampedArray(width * height * 4);
  pixel_count = 0;

  for (let i = 0; i < height * width; ++i) {
    const shouldMask = maskBackground ? 1 - data[i] : data[i];
    // alpha will determine how dark the mask should be.
	const alpha = shouldMask * 255;

	const predictedClass = data[i];
	const j = i * 4;

	const classChoiceBG = data[2*i];
	const classChoicePlant = data[2*i+1];

	if (classChoiceBG < classChoicePlant){
		pixel_count = pixel_count + 1;
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



let model;
let leaf_area_model;
let leaf_weight_model;

$("#loadBtn").click(async function () {
    console.log("hit");
    $('.progress-bar').show();
	console.log("model loading");
	
	model = await tf.loadLayersModel('model_2/model.json');

	$('.progress-bar').hide();
	$('#leaf-area').show();
	$('#leaf-weight').show();
	isDisease = false;

	$("#predictDiseaseBtn").addClass('disabled');
	$("#predictBtn").removeClass('disabled');
	$('#predicted-image').show();

	$('#output-dis').hide();
});

$("#predictBtn").click(async function () {
	let image = $('#selected-image').get(0);
	
    
	console.log("Predict Clicked");
	$('.progress-bar').show();
	
	let pre_image = tf.browser.fromPixels(image, 3)
		.resizeNearestNeighbor([width, height])
		.expandDims()
        .toFloat();
         
	let predict_result = await model.predict(pre_image);

	result = predict_result.dataSync();

	imgData = toMaskImageData(result, false);

	console.log(pixel_count);


	// create an offscreen canvas
	var canvas = document.createElement("canvas");
	var ctx = canvas.getContext("2d");

	// size the canvas to your desired image
	canvas.width=width;
	canvas.height=height;

	ctx.putImageData(imgData, 0, 0);

	var dataUri = canvas.toDataURL();

	$("#predicted-image").attr("src", dataUri);

	let frac = pixel_count / maxPixelArea;


	document.getElementById('area-val').innerText = (frac * maxArea).toFixed(3);

	document.getElementById('weight-val').innerText = (frac * maxWeight).toFixed(3);



	// $('#leaf-area').innerhtml(frac * maxArea);
	// $('#leaf-weight').html(frac * maxWeight);

	

	$('.progress-bar').hide();

});




const Result = {
	0: "Healthy",
	1: "Multiple Diseases",
	2: "Rust",
	3: "Scab"
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
	$('#output-dis').hide();
});

let diseaseModel;

const d_width = 224;
const d_height = 224;

$("#loadDiseaseBtn").click(async function () {
    console.log("hit disease");
    $('.progress-bar').show();
	diseaseModel = await tf.loadLayersModel('diseaseModel2/model.json');
	// $('#loadDiseaseBtn').html('Model Loaded');
	// $('#loadDiseaseBtn').addClass('disabled');
	$('.progress-bar').hide();

	$('#output-dis').show();
	isDisease = true;

	$("#predictDiseaseBtn").removeClass('disabled');
	$("#predictBtn").addClass('disabled');


	$('#leaf-area').hide();
	$('#leaf-weight').hide();


	$('#predicted-image').hide();

});


$("#predictDiseaseBtn").click(async function () {
	console.log("hit disease prediction");
	$('.progress-bar').show();

	$('#predictDiseaseBtn').html('LOADING');

    let image = $('#selected-image').get(0);
	
	let pre_image = tf.browser.fromPixels(image, 3)
		.resizeNearestNeighbor([d_width, d_height])
		.expandDims()
		.toFloat();

	const b = tf.scalar(255);

	let img = tf.div(pre_image, b);

	const result = await diseaseModel.predict(img).dataSync();

	const output = tf.argMax(result).dataSync()[0];

	const string_res = Result[output];

	$('#analysis').show();

	let prob_output = Result[0] + ' ' + result[0].toFixed(3) + '\n\n';
	prob_output += Result[1] + ' ' + result[1].toFixed(3) + '\n\n';
	prob_output += Result[2] + ' ' + result[2].toFixed(3) + '\n\n';
	prob_output += Result[3] + ' ' + result[3].toFixed(3) + '\n\n';

	document.getElementById('analysis').innerText = `
		Disease Prediction: ${string_res}\n
		Probabilities (not to be confused with confidence):\n\n ${prob_output}
	`;

	// $("#predicted-image").attr("src", dataUri);
	$('.progress-bar').hide();

	$('#predictDiseaseBtn').html('Predict Disease');

});
