<?php
    
    // directory Name
	$dir = "clipArt";
 
    // array to store names of the files
    $fileImages = array();
    $fileImageSeperate = array();

	// check Directory 
	if(is_dir($dir)){
		// open Directory
    	$handle = opendir($dir);
    	// check to see if files are readable
    	while(false !== ($file = readdir($handle))){
    		// checks for any files in the folder 
        	if(is_file($dir.'/'.$file) && is_readable($dir.'/'.$file)){
                // collect only png files
                if (preg_match('/\.(png)$/', $file)){
                     $fileImages[] = $file;
                }
        	}
    	}
    	closedir($handle);
    	//$fileImages = array_reverse($fileImages);
		}
		else {
    		echo "<p>Cannot open Directory</p>";
		}
        
        // array to store the base64 images
        $filearray = array();
        $filecontent = array();

        // loop all the images and encode in base 64
        foreach($fileImages as $name){
            $path = $dir.'/'.$name;
            array_push($filecontent,$path);
            $fileName = file_get_contents($path);
            $encodedImage = base64_encode($fileName);
            $src = 'data:'.mime_content_type($path).';base64,'.$encodedImage;
            $object["name"] = $name;
            $object["base64"] = $src;
            array_push($filearray, $object);
        } 

        // json string with front code
        //$base64 = array();
 
        /*  
        foreach ($filearray as $tag) {
            foreach ($filecontent as $key) {
                 $src = 'data:'.mime_content_type($key).';base64,'.$tag;
                 array_push($base64, $src);
            }
        }
        */

        // Echo out a sample image
        print_r(json_encode($filearray));


       

?>