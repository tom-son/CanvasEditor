<?php

	// fetch the json data from app.js
	$postData = file_get_contents("php://input");
	$request =  json_decode($postData);

    //fetch the folderNames
	$dir = "uploads";
	$folderName = $dir.'/'.$request->canvasId;
	// $folderName = $dir.'/'.'test1';


	// check Directory 
	if(is_dir($dir)){
		// open Main Directory
    	$handle = opendir($dir);
    	//check for folderName
    	if (is_dir($folderName)){
            // open Project Directory
    		$handle2 = opendir($folderName);
    		// check to see if files are readable
    		while(false !== ($file = readdir($handle)) && false !== ($file2 = readdir($handle2))){
    			// Checking to see if there are files inside the folder
    			if (is_file($folderName.'/'.$file2) && is_readable($folderName.'/'.$file2)){
    				// get only the json file
    				if (preg_match('/\.(json)$/', $file2)){
    					// match the path for the contents to be read
    					$fileDir = $folderName.'/'.$file2;
    					// get the contents of the json file
    					$jsonContents = file_get_contents($fileDir);
    				}		
    			}
    		}
    		// close handle
    		closedir($handle2);
    	}
    	else {
    		echo "<p>Cannot open Directory</p>";
    	}
    	// close handle
    	closedir($handle);	
	}
	else {
    	echo "<p>Cannot open Directory</p>";
	}
    
    // return contents of json file
	print_r($jsonContents);

?>