let video;
let poseNet;
let poses = [];
let fps = 16;
let skeleton;
let prevemotion = '';
let emotion = '';

let ht = 0; //happy time
let hm = 0; //happy moment
let nt = 0; // neutral time
let nm = 0; // neutral moment
let at = 0; // angry time
let am = 0; // angry moment
let temp = 0;



function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(width, height);

  // Create a new poseNet method with a single detection
  poseNet = ml5.poseNet(video, modelReady);
  // This sets up an event that fills the global variable "poses"
  // with an array every time new poses are detected
  poseNet.on('pose', function(results) {
    poses = results;
  });
  // Hide the video element, and just show the canvas
  video.hide();
}

function modelReady() {
  select('#status').html('Model Loaded');
}

function mousePressed(){
  console.log(JSON.stringify(poses))
}

function draw() {
  image(video, 0, 0, width, height);
  strokeWeight(2);

   if (poses.length > 0) {
     let pose = poses[0].pose;
     skeleton = poses[0].skeleton;
     mousePressed();

  // Extract keypoints from each frame
  for (let i = 0; i < pose.keypoints.length; i++){
    let x = pose.keypoints[i].position.x;
    let y = pose.keypoints[i].position.y;
    fill(0,255,0);
    ellipse(x, y, 16, 16);
  }

  // Loop for the skeleton appearance on the screen
    for (let i = 0; i < skeleton.length; i++) {
        let a = skeleton[i][0];
        let b = skeleton[i][1];
        strokeWeight(2);
        stroke(255);
        line(a.position.x, a.position.y, b.position.x, b.position.y)

    }


  // Here represented 3 emotions: Happy, Neutral and Angry.
  // "Happy" pose comparing the coordinates of wrists and eyes. Where both wrists must be located higher than eyes
  // "Neutral" pose comparing elbow, wrist and shoulders coordinates. Where person must stay in morely upright position
  // "Angry" pose comparing wrist location between each other. Where wrist crossed
  // "Other" pose is optional pose. Where poses which not considered automatically becomes "Other"
  if (pose.rightWrist.y < pose.rightEye.y && pose.leftWrist.y < pose.leftEye.y){
		prevemotion = emotion;
		emotion = 'Happy';
  } else if (pose.leftWrist.x > pose.leftElbow.x && pose.leftElbow.x > pose.leftShoulder.x && pose.rightWrist.y > pose.rightShoulder.y && pose.leftWrist.y > pose.leftShoulder.y){
      prevemotion = emotion;
  		emotion = 'Neutral';
  } else if (Math.abs(pose.leftWrist.x - pose.rightWrist.x) < 60 && Math.abs(pose.leftWrist.y - pose.rightWrist.y) < 60 && Math.abs(pose.leftWrist.y - pose.leftElbow.y) < 20){
      prevemotion = emotion;
  		emotion = 'Angry';
  } else {
    prevemotion = emotion;
    emotion = 'Other';
  }


  // Here I try to count the time on each poses by counting frame per second.
  if (prevemotion == emotion) {
	  if (emotion == 'Happy') {
		ht++;
		temp++;
  } else if (emotion == 'Neutral') {
		nt++;
		temp++;
  } else if (emotion == 'Angry') {
		at++;
		temp++;
	  } else {

	  }
  } else {
    // When emotion have been changed, I increment the number of each moment by 1.
    // But the duration of the moment must not less than 3 seconds.
    // To identify it, I create the temp counter which identify the time of the previous pose and leter reseted.
	  if (prevemotion == 'Happy' && temp > (fps*3)) {
		hm++;
		temp = 0;
  } else if (prevemotion == 'Neutral' && temp > (fps*3)) {
		nm++;
		temp = 0;
  } else if (prevemotion == 'Angry' && temp > (fps*3)) {
		am++;
		temp = 0;
	  }
  }



  // Here each emotion displayed in the video and filled by approriate color
  textSize(30);
  if (emotion == 'Happy') {
	fill(0,255,0); //green color
} else if (emotion == 'Neutral') {
	fill(255,255,0); //yellow color
} else if (emotion == 'Angry') {
	fill(255,0,100); // red color
  } else {
	fill(255, 255, 255); // white color
  }
  textSize(20);
  text('Emotion ' + emotion, 475, 400);

  fill(0, 255, 0);
  textSize(13);
  text('Happy: ' + hm + ' times (' + nf(ht/fps, 2, 2) + 's)', 475, 425);
  fill(255, 255, 0);
  textSize(13);
  text('Neutral: ' + nm + ' times (' + nf(nt/fps, 2, 2) + 's)', 475, 450);
  fill(255, 0, 100);
  textSize(13);
  text('Angry: ' + am + ' times (' + nf(at/fps, 2, 2) + 's)', 475, 475);

}
}
