var editApp = angular.module('editApp', ['ngRoute']);

editApp.config(['$routeProvider', function($routeProvider) {
    $routeProvider
    // Home: display 3 canvas edit options
    .when('/home', {
        templateUrl: 'partials/home.html',
        controller: 'HomeController'
    })
    .when('/editor', {
        templateUrl: 'partials/editor.html',
        controller: 'mainController'
    })
    // Blank canvas
    .when('/editor/:editType/:canvasId/:width/:height', {
        templateUrl: 'partials/editor.html',
        controller: 'mainController'
    })
    // Blank canvas with background
    .when('/editor/:editType/:backgroundId', {
        templateUrl: 'partials/editor.html',
        controller: 'mainController'
    })
    // Re-edit canvas
    .when('/editor/:editType/:canvasId', {
        templateUrl: 'partials/editor.html',
        controller: 'mainController'
    })
    .otherwise({redirectTo: '/home'});
}]);





editApp.controller('mainController', ['$scope', '$http', '$routeParams',
function($scope, $http, $routeParams){
    $scope.state = {
        canvas: new fabric.Canvas('canvas'),
        ghostCanvas: document.createElement('canvas'),
        isActiveObject: false,
        textString: "",
        fontSize: 44,
        font: "",
        fontColor: "",
        fonts: [
            "Arial",
            "Serif"
        ],
        textAlign: [
            "left",
            "center",
            "right"
        ],
        lineHeight: [
            "1",
            "2",
            "3",
            "4"
        ],
        fontWeight: [
            "normal",
            "bold"
        ],
        backgroundImg: null,
        showTools: {

        },
        layers: {},
        historyLayers: [],
        clipArt: [
            "heart-clipart.png",
            "https://www.shareicon.net/data/128x128/2017/04/04/882436_media_512x512.png"
        ],
        scale: 1,
        dragOk: false,
        startX: 0,
        startY: 0,
        // Set to the item that was clicked otherwise -1.
        clickedItem: -1,
        resizePoint: -1,
        resizerRadius: 10,
        crop: -1,
        imageUpdated: true,
        // Text handler flag to only allow 1 text handler to exist
        isTextHandlerOn: false,
        // Layer change flag to allow mouseup know that something may have changed
        // pop that changed item into history array for undo
                                                                            // WARNING!@# make another array to keep all the changes to not polute layers
        layerChanged: false,

        // Testing for route
        editType: $routeParams.editType,
        canvasId: $routeParams.canvasId,
        backgroundId: $routeParams.backgroundId,
        // zoomHandler relies on w, h. 
        // Set w, h from createBlank from home.html
        // or if not createBlank set base on background image
        w: $routeParams.width,
        h: $routeParams.height
    };

    // Initialise canvas when editor.html view has finished loading.
    $scope.$on('$viewContentLoaded', function(event)
    { 
        console.log("Canvas init!");

        
        switch($scope.state.editType) {
            // Set canvas dimensions from params home.html
            // then store json and finalImage onto the server
            case "blankCanvas":
            console.log($scope.state.w, $scope.state.h);
                var canvas = $scope.state.canvas;
                canvas.setWidth($scope.state.w);
                canvas.setHeight($scope.state.h);

                $scope.state.layers = $scope.state.canvas._objects;
                console.log("hello")
                console.log($scope.state.layers);

                $scope.uploadCanvas(canvas);

               
                break;

            case "blankBackground":
                // width and height of canvas base on background image
                // set state w & h base on background image zoomHandler needs it!!   <--------
                $scope.getBackgroundImage($scope.state.backgroundId);
                $scope.uploadCanvas($scope.state.canvas);
                break;

            case "reedit":
                $scope.loadCanvas($scope.state.canvasId);
                break;
        }
    });



    // From home page when user pass canvasId from browse image option
    // get request should grab the json
    // parse the json and store in local state
    // turn base64 images into Image() objects to avoid painting stutter
    $scope.loadCanvas = function(canvasId) {
        // var data = {
        //     canvasId: canvasId
        // };
        // $http.get("", data).then(
        //     function(response) {
        //         console.log("loadCanvas success! response", response);
        //     }, 
        //     function(response) {
        //         console.log("loadCanvas failed! response:", response);
        //     }
        // );



    }


    // gets the background images from the server with backgroundId
    // to display to user for selection 
    $scope.getBackgroundImages = function(backgroundId) {
        console.log("getting background image");
        var data = {
            backgroundId: backgroundId
        };
        $http.get('', data).then(
            function(response) {
                console.log("getBackgroundImage success! response:", response);


                // var file = document.getElementById("imgFile").files[0];
                // // FileReader to read the image.
                // var fr = new FileReader();
                // // Image to get meta data on image such as size.
                // var image = new Image();

                // fr.onload = function(event) {
                //     image.onload = function(event) {
                //         // store background image into state.
                //         $scope.state.backgroundImg = image;
                //         $scope.setDimension(document.getElementById("canvas"));
                //         $scope.paintCanvas();
                //     }
                //     image.src = event.target.result;
                // }
                // fr.readAsDataURL(file); 

            },
            function(response) {
                console.log("getBackgroundImage failed! response:", response);
            }
        );
    }

    // Upload local canvas onto server
    // Use case:
    // 1. Saving canvas (storing json and final image onto server)
    // 2. Adding/updating background (inserting background into json and storing onto server)
    $scope.uploadCanvas = function(canvas) {
        canvas = $scope.state.canvas;
        // // Turn canvas into base64 png

        // // toDataURL() supported input formats:
        // // image/png, image/jpeg, image/jpg, image/gif, image/bmp, image/tiff, image/x-icon, image/svg+xml, image/webp, image/xxx
        // // toDataURL() supported output formats:
        // // image/png, image/jpeg, image/webp(chrome)

        // var finalImage = canvas.toDataURL("image/png");

        // // ignore trying to convert backgroundImg into base64, at the moment 
        // // data.canvasConfig.backgroundImage = binary format so it will be blank inside php and response should return blank as well


        // var ghostCanvas = $scope.state.ghostCanvas;
        // var gctx = ghostCanvas.getContext('2d');

        // ghostCanvas.width = $scope.state.backgroundImg.width;
        // ghostCanvas.height = $scope.state.backgroundImg.height;

        // gctx.drawImage($scope.state.backgroundImg, 0, 0);
        
        // var backgroundImage = ghostCanvas.toDataURL("image/png");

        // var data = {
        //     // use canvasId to name files. If you implement folders then use canvasId to name the folder too.
        //     canvasId: $scope.state.canvasId,
        //     // canvas101Static.json
        //     json: {
        //         canvasConfig: {
        //             cWidth: canvas.width,
        //             cHeight: canvas.height,
        //             backgroundImage: backgroundImage,
        //             displayType: null
        //         },
        //         layers: $scope.state.layers
        //     },
        //     // canvasId + fileExtension => canvas101Static.png 
        //     image: finalImage,
        //     fileExtension: ".png"
        // }


        // console.log(canvas._objects);

        $scope.loadTest(canvas._objects);
        // canvas.add(new fabric.Image(canvas._objects[0]._element, {top: 0, left: 0}));

        // canvas.add( new fabric.Image(canvas._objects));


        // $http.post('/php/upload.php', data).then(
        //     function(response){
        //         console.log("uploadCanvas success! response.data:", response.data);
        //     },
        //     function(response){
        //         console.log("uploadCanvas failed! response:", response);
        //     }
        // );    


    }







    $scope.loadTest = function(layers) {
        console.log("Enerting loadTest");
        var object = [...layers];
        console.log(object);
        for(var i=0; i < object.length; i++) {
            var o = object[i];
            console.log(o);
            switch(o.type) {
                case "image":
                    console.log("I'm an image", o);
                    // store image into layers.
                    var imgInstance = new fabric.Image(
                        o._element, 
                        {
                            left: o.left,
                            top: o.top,
                            angle: o.angle,
                            opacity: o.opacity,
                            scaleX: o.scaleX,
                            scaleY: o.scaleY,
                            flipX: o.flipX,
                            flipY: o.flipY
                        }
                    );
                    $scope.state.canvas.add(imgInstance);
                    break;
                case "text":
                    console.log("I'm a text", object[i]);
                    var text = new fabric.Text(
                        o.text, 
                        { 
                            left: o.left, 
                            top: o.top,
                            angle: o.angle,
                            opacity: o.opacity,
                            scaleX: o.scaleX,
                            scaleY: o.scaleY,
                            flipX: o.flipX,
                            flipY: o.flipY
                        }
                    );
                    $scope.state.canvas.add(text);
                    break;
            }
        }
    }






















    // Event handle which w ill be attached to onchange event 
    // listener of "choose file" (import) button.
    $scope.importImg = function(event) {
        console.log("importimg clicked")
        var file = document.getElementById("imgFile").files[0];
        // FileReader to read the image.
        var fr = new FileReader();
        // Image to get meta data on image such as size.
        var image = new Image();

        fr.onload = function(event) {
            image.onload = function(event) {
                // store background image into state.
                // $scope.state.backgroundImg = image;
                // $scope.setDimension(document.getElementById("canvas"));
                // $scope.paintCanvas();
                var canvas = $scope.state.canvas;
                var data = event.target.result;
                // fabric.Image.fromURL(data, function(image) {
                    var f_img = new fabric.Image(image);
                    canvas.setBackgroundImage(f_img);
                    canvas.renderAll();
                    
                    // add background image
                    // canvas.setBackgroundImage(image,
                    //     canvas.renderAll.bind(canvas)
                        // , {
                    //    scaleX: canvas.width / image.width,
                    //    scaleY: canvas.height / image.height
                    // }
                // );
                //  });
            }
            image.src = event.target.result;
        }
        fr.readAsDataURL(file);  
    }    

    // Set scale number for zoom functionality.
    $scope.zoomHandler = function(type) {
        var canvas = $scope.state.canvas;
        var zoom = canvas.getZoom();

        if(type === "in") {
            // set the zoom limit
            if(canvas.getZoom() > 2) {
                return;
            }

            zoom += 0.1;
            
        } else if(type === "out") {
            // set the zoom limit
            if (canvas.getZoom() < 0.4) { 
                return;
            }
            zoom -= 0.1;
        }
        
        canvas.setZoom(zoom);
        canvas.setHeight($scope.state.h * canvas.getZoom());
        canvas.setWidth($scope.state.w * canvas.getZoom());

    }


    // Set the canvas width and height to image width and height.
    $scope.setDimension = function(canvas) {
        var image = $scope.state.backgroundImg;
        canvas.width = image.width;
        canvas.height = image.height;
        console.log("width: ", image.width, ", height: ", image.height);
        console.log(canvas);
    }


    $scope.paintElement = function(canvas, element) {
        var ctx = canvas.getContext('2d');
        elementConfig = element.config;
        switch(element.type){
            case "fillText":

                var text = new fabric.Text(elementConfig.string, { left: 100, top: 100 });
                $scope.state.canvas.add(text);
                break;
            case "drawImage":
                console.log(elementConfig);
                var imgInstance = new fabric.Image(element.config.image, {
                left: 100,
                top: 100,
                angle: 0,
                opacity: 0.85
              });
              $scope.state.canvas.add(imgInstance);
                break;
        }
    }





    // Paint the layers in controller section.
    $scope.paintLayers = function() {
        // setTimeout(function() {
            $scope.state.layers.forEach(function(element, index) {


                // Layers: from layers option in html
                console.log("painting layer:", element, index);
                var mainCanvas = document.getElementById('canvas');
                var layerCanvas = document.getElementById(index+"Layer");
                var ctx = layerCanvas.getContext('2d');
                layerCanvas.style = "background: white;"

                var isWidthGreater;
                var aspectRatio = mainCanvas.width / mainCanvas.height;

                mainCanvas.width > mainCanvas.height
                ? isWidthGreater = true
                : isWidthGreater = false;

                // Set up the correct ratio for the layers display
                if (isWidthGreater) {
                    layerCanvas.width = 130;
                    layerCanvas.height = 130 / aspectRatio;
                } else {
                    layerCanvas.height = 100;
                    layerCanvas.width = 100 * aspectRatio;
                }

                var scaleWidth = $scope.getScale('small', mainCanvas.width, layerCanvas.width);
                var scaleHeight = $scope.getScale('small', mainCanvas.height, layerCanvas.height);

                ctx.scale(scaleWidth, scaleHeight);

                $scope.clearCanvas(layerCanvas);
                ctx.save();
                $scope.rotateCanvas(element, ctx);

                $scope.paintElement(layerCanvas, element);
                ctx.restore();
            });
        // },1500);
    }


    $scope.getScale = function(type, originalLength, adjustedLength) {
        if(type === 'small') {
            return adjustedLength / originalLength;
        } else if ( type === ' large') {
            return originalLength / adjustedLength;
        }
        // type didn't match getScale failed!
        console.log("getScale failed! Type doesn't match");
        return -1;
    }



    $scope.addTextHandler = function(xpos, ypos) {
        var ctx = document.getElementById('canvas').getContext('2d');
        ctx.font = $scope.state.fontSize + "px " + $scope.state.font;

        var text = new fabric.Text(
            $scope.state.textString, 
            { 
                left: 100,
                top: 100,
                fontSize: $scope.state.fontSize,
                fill: $scope.state.fontColor,
            }
        );
        $scope.state.canvas.add(text);

        $scope.state.historyLayers = [];
        $scope.paintLayers();
        $scope.setDefaultValues();
    }



    $scope.addImageHandler = function(event) {
        var file = document.getElementById("addImgFile").files[0];
        // FileReader to read the image.
        var fr = new FileReader();
        // Image to get meta data on image such as size.
        // var image = new Image();

        fr.onload = function(event) {

            let image = new Image();

            image.onload = function() {
                
                // store image into layers.
                var imgInstance = new fabric.Image(image, {
                    left: 100,
                    top: 100,
                    angle: 0,
                    opacity: 0.85
                });
                $scope.state.canvas.add(imgInstance);
                
                console.log($scope.state.layers);
                $scope.state.historyLayers = [];
                // $scope.paintCanvas();
                $scope.paintLayers();
            
            };
            image.src = fr.result;
        }
        fr.readAsDataURL(file);  
        
    }


    $scope.setImageFlip = function(type) {
        var element = $scope.state.layers[$scope.state.clickedItem];
        // // If it is not an image, do nothing
        // if(element.type !== 'drawImage') {
        //     return;
        // }
        var canvas = $scope.state.canvas;
        // var config = $scope.state.layers[$scope.state.clickedItem].config;
        switch(type) {
            case 'horizontal':
                // config.flipH = config.flipH * -1;                
                canvas.getActiveObject().set('flipX', canvas.getActiveObject().get('flipX') === true ? false : true);
                break;
            case 'vertical':
                // config.flipV = config.flipV * -1;
                canvas.getActiveObject().set('flipY', canvas.getActiveObject().get('flipY') === true ? false : true);
                
                break;
        }
        canvas.renderAll();
        $scope.paintLayers();
    }

   
    $scope.deleteLayer = function() {
        // If no item was clicked, do nothing

        var canvas = $scope.state.canvas;
        console.log(canvas.getActiveObject());
        // canvas.remove(canvas.getActiveObject());

        $scope.paintCanvas();
        $scope.paintLayers();
    }

    $scope.selectLayer = function(layerIndex) {
        $scope.state.clickedItem = layerIndex;
        $scope.paintCanvas();
        $scope.paintLayers();
    }



    $scope.resizeWithScale = function(config, distance) {
        // Get scale
        var scale = config.width / config.height;

        // new width aka adjusted width
        config.width += distance;

        // adjusted height
        config.height = config.width / scale;
    }



    $scope.renderAll = function() {
        var canvas = $scope.state.canvas;
        canvas.renderAll();
    }
    // Mouse click event handler to check if mouse click co-ord
    // is within item co-ord in the config.
    $scope.mouseDown = function(event) {
        var canvas = $scope.state.canvas;
        $scope.state.isActiveObject = canvas.getActiveObject();
        console.log($scope.state.isActiveObject);
        $scope.$apply();
    }

   
    // Set the canvas mouse listeners to our handlers.
    $scope.setCanvasListeners = function() {
        var canvas = $scope.state.canvas;
        // canvas.onmousedown = $scope.mouseDown;
        canvas.on('mouse:down', $scope.mouseDown);
        // canvas.onmouseup = $scope.mouseUp;
        // canvas.onmousemove = $scope.mouseMove;
       
    }



    // After all above functions are declared envoke these.
    $scope.setCanvasListeners();

    // undo and redo functions
    $scope.popLayerTo = function(fromLayers, toLayers) {
        console.log(fromLayers, toLayers);
        var lastElement = fromLayers.pop();
        console.log(lastElement);
        toLayers.push(lastElement);
        console.log("After push", fromLayers, toLayers);
        $scope.paintCanvas();
        $scope.paintLayers();
    }


    // $scope.$apply();

}]);



















// dragController is responsible for:
// - Dragging controller and toolbar window around the screen.
// - Hide the controller and toolbar window.
// - Display the controller and toolbar window with 
//      hotkey: mac: 'command + s' window: 'window + s'

editApp.controller('dragController', ['$scope',
function($scope){
    $scope.showControllers = {
        // Layers: false,
        Text: true,
        Image: false,
        "Clip Art": false
    };


    // Event handler to open the correct tool edit feature
    // Sets all element in showTools to false. Then turns
    // correct tool to true to display.
    $scope.openController = function(controllerName) {
        for(let controller in $scope.showControllers) {
            $scope.showControllers[controller] = false;
        }
        $scope.showControllers[controllerName] = true;
    };


    //Make the DIV element draggagle:
    $scope.dragElement = function(elmnt) {
        var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

        if (document.getElementById(elmnt.id + "header")) {
            /* if present, the header is where you move the DIV from:*/
            document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
        } else {
            /* otherwise, move the DIV from anywhere inside the DIV:*/
            elmnt.onmousedown = dragMouseDown;
        }

        function dragMouseDown(e) {
            e = e || window.event;
            // get the mouse cursor position at startup:
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            // call a function whenever the cursor moves:
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e = e || window.event;
            // calculate the new cursor position:
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            // set the element's new position:
            elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
            elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
        }

        function closeDragElement() {

            /* stop moving when mouse button is released:*/
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }

    

    $scope.minimise = function(id) {
        console.log(id);
        document.getElementById(id).style.display =  "none";
        alert("Alert: To display controller again press 'control + s'")

    }

    $scope.show = function(e) {
        if (e.ctrlKey && e.keyCode == 83) {
            console.log(e);
            document.getElementById('controller').style.display = "block";
            document.getElementById('layers').style.display = "block";
        }
    }

    document.addEventListener('keyup', $scope.show, false);
    
    $scope.dragElement(document.getElementById(("controller")));
    $scope.dragElement(document.getElementById(("layers")));
}]);



editApp.controller('HomeController', ['$scope', '$http',
function($scope, $http){


   


    $scope.createBlank = function() 
    {
        console.log("Create blank");
        var canvasId = document.getElementById("canvasId").value;
        var width = document.getElementById("cbcw").value;
        var height = document.getElementById("cbch").value;

        if(canvasId == '' || width == '' || height == '') {
            alert("Please fill in all of the canvas details.");
            return;
        }

        console.log("Create blank canvas:",canvasId, width, height);
        var path = "#!/editor/blankCanvas/" + canvasId + "/" + width + "/" + height;
        location.href = path;

    }

    $scope.createBlankWithBackground = function() {
        console.log("Create blank with background");
        var backgroundId = "";

        if(backgroundId == '') {
            alert("Please select a background.");
            return;
        }

        console.log("Create blank canvas with background:",backgroundId);
        var path = "#!/editor/blankBackground/" + backgroundId;
        location.href = path;
    }

    $scope.browseExisiting = function() {
        console.log("Browse existing");

        var canvasId = "";

        if(canvasId == '') {
            alert("Please select an existing image.");
            return;
        }

        console.log("Re-edit existing image:",canvasId);
        var path = "#!/editor/reedit/" + canvasId;
        location.href = path;
    }
}]);

