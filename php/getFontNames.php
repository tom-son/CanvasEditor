<?php

	// folder name
	$dir = "fonts";
	// array to store folder names
	$fontNames = array();

	$response["error"] = false;
    $response["errorMsg"] = "";
    
	// check Directory 
	if(is_dir($dir)){
		// open Directory
    	$handle = opendir($dir);
    	// check to see if files are readable
    	while(false !== ($folder = readdir($handle))){
    		// check for valid folders
            if (preg_match("/^[a-zA-Z0-9_]+$/", $folder) == 1){
            	// store the names into fontNames
            	$fontNames[] = $folder;
            }
    	}
    	// close $handle
    	closedir($handle);
	}
	else {
    	// display error mesage
        $response["error"] = true;
        $response["errorMsg"] = "Cannot open Directory";
	}

    // return list of font Names
	print_r(json_encode($fontNames));


?>