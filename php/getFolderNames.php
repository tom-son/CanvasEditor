<?php

	// folder name
	$dir = "uploads";
	// array to store folder names
	$folderNames = array();
	
	// check Directory 
	if(is_dir($dir)){
		// open Directory
    	$handle = opendir($dir);
    	// check to see if files are readable
    	while(false !== ($folder = readdir($handle))){
    		// check for valid folders
            if (preg_match("/^[a-zA-Z0-9_]+$/", $folder) == 1){
            	$folderNames[] = $folder;
            }
    	}
    	// close $handle
    	closedir($handle);
	}
	else {
    	echo "<p>Cannot open Directory</p>";
	}

    // return list of folders
	print_r(json_encode($folderNames));


?>
