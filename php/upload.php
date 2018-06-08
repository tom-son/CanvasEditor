<?php


	//echo "helloworld";
	$postData = file_get_contents("php://input");
	$request =  json_decode($postData);

	//var_dump($request);

	$request->layer3 = "layer3";

	// echo $request;


	echo json_encode($request);
?>
