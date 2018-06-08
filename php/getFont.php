<?php

	// fetch the json data from app.js
	$postData = file_get_contents("php://input");
	$request =  json_decode($postData);

    $response["error"] = false;
    $response["errorMsg"] = "";
    $fileExtension = null;
    $filePath = null;

    //variable to store the fonts 
	$dir = "fonts";
    //variable to store the project name
	$fontName = $dir.'/'.$request->fontName;

	// check Directory 
	if(is_dir($dir)){
		// open Main Directory
    	$handle = opendir($dir);
    	//check for folderName
    	if (is_dir($fontName)){
            // open Project Directory
    		$handle2 = opendir($fontName);
    		// check to see if files are readable
    		while(false !== ($file = readdir($handle)) && false !== ($file2 = readdir($handle2))){
    			// Checking to see if there are files inside the folder
    			if (is_file($fontName.'/'.$file2) && is_readable($fontName.'/'.$file2)){
    				// get only the  file
    				if (preg_match('/\.(ttf|eot)$/', $file2)){
    					// Store the path into a variable
    					$filePath = $fontName.'/'.$file2;
                        
                        // split the file to obtain the file extension
                        $seperate = explode(".",$file2);
                        // store the file extension into a vairable
                        $fileExtension = $seperate[1];
    				}		
    			}
    		}
    		// close handle
    		closedir($handle2);
    	}
    	else {
            // display error mesage
            $response["error"] = true;
            $response["errorMsg"] = "Cannot open".$fontName." Directory";
    	}
    	// close handle
    	closedir($handle);	
	}
	else {
        // display error mesage
    	$response["error"] = true;
        $response["errorMsg"] = "Cannot open".$dir." Directory";
	}

    // print out error if file path cannot be found 
    if(!$response["error"] && $filePath == null) {
        $response["error"] = true;
        $response["errorMsg"] = "File path is not defined.";
    }

    // print out error if file extension cannot be found 
    if(!$response["error"] && $fileExtension == null) {
        $response["error"] = true;
        $response["errorMsg"] = "File extension is not defined.";
    }

    // make a new object "file" and store the type and path info
    $response["file"]["type"] = $fileExtension;
    $response["file"]["path"] = $filePath;

    // return info
    print_r(json_encode($response));

?>