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


let model;

$("#loadBtn").click(async function () {
    console.log("hit");
    $('.progress-bar').show();
    console.log("model loading");
    // const handler = tfn.io.fileSystem("./path/to/your/model.json");
    // model = await tf.loadModel(handler);
    // model = await tf.loadGraphModel("model/model_js/model.json");
    model = await tf.loadLayersModel('model_2/model.json');
	$('.progress-bar').hide();
});



$("#predictBtn").click(async function () {
    let image = $('#selected-image').get(0);
    
    console.log("Predict Clicked");
	
	let pre_image = tf.browser.fromPixels(image, 3)
		.resizeNearestNeighbor([128, 128])
		.expandDims()
        .toFloat();
         
    let predict_result = await model.predict(pre_image);

    const img_shape = [128, 128];

    console.log(predict_result);
    const segPred = tf.image.resizeNearestNeighbor(predict_result);
    console.log(segPred);
    const segMask = segPred.argMax(-1).reshape(img_shape);
    console.log(segMask);


	let order = Array.from(predict_result)
		.map(function (p, i) { 
			return {
				probability: p,
				className: Result[i] 
			};
		}).sort(function (a, b) {
			return b.probability - a.probability;
		}).slice(0, 2);

	$("#list").empty();
	order.forEach(function (p) {
		$("#list").append(`<li>${p.className}: ${parseInt(Math.trunc(p.probability * 100))} %</li>`);
	});
});

