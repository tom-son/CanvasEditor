<?php

    // fetch the json data from app.js
	$postData = file_get_contents("php://input");
	$request =  json_decode($postData);

    
    // create a folder to store the files
	$folderName = "uploads";

	if (!file_exists($folderName)) {
    	mkdir("uploads/", 0777);
    	exit;
	} 

    // create a new folder for each project
	$projectName = $request->canvasId;
	$projectDir = $folderName."/".$projectName;

	if(!file_exists($projectDir)){
		mkdir($projectDir, 0777);
    	exit;
	}


    // fetching only the image data   
	$fileImage = $request->image;

    // create image name
    $imageName = $request->canvasId.$request->fileExtension;

    // seperate excess information to obtain the base64 data
    list($type, $fileImage) = explode(';', $fileImage);
	list(, $fileImage)      = explode(',', $fileImage);
	$fileImage = base64_decode($fileImage);

    // save and place into a folder 
	file_put_contents($projectDir.'/'.$imageName, $fileImage);

    // this obtains all the filelayers 
    $fileLayer = $request->json;
    $fileNameJSON = $request->canvasId.'.json';

    // create layers.json file
	$fileJSON = fopen($projectDir.'/'.$request->canvasId.'.json', 'w');
	fwrite($fileJSON, json_encode($fileLayer));
	fclose($fileJSON);



	
?>
