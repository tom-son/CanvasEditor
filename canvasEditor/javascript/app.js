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
    .when('/editor/:editType/', {
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
        // Keep track of id to use for objects. Must increment when used.
        zIndex: 0,
        // Unique number to set zindex for objects
        // always incremented when used
        idHelper: 0,
        textString: "",
        fontSize: 44,
        font: "",
        fontColor: "",
        // gets fonts from loadFonts()
        fonts: [],
        // keep track of all fonts used in canvas
        fontsUsed: [],
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
        layers: [],
        historyLayers: [],
        clipArt: [
            // "heart-clipart.png",
            // "https://www.shareicon.net/data/128x128/2017/04/04/882436_media_512x512.png"
        ],

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

    $scope.init = function() {
        $scope.loadClipArts();
        $scope.loadFonts();
    }

    // Initialise canvas when editor.html view has finished loading.
    $scope.$on('$viewContentLoaded', function(event)
    { 
        console.log("Canvas init!");

        var canvas = $scope.state.canvas;
        
        
        $scope.state.layers = canvas._objects;

        switch($scope.state.editType) {
            // Set canvas dimensions from params home.html
            // then store json and finalImage onto the server
            case "blankCanvas":
            console.log($scope.state.w, $scope.state.h);
                
                canvas.setWidth($scope.state.w);
                canvas.setHeight($scope.state.h);

                $scope.state.layers = $scope.state.canvas._objects;

                // $scope.uploadCanvas(canvas);

               
                break;

            case "blankBackground":
                // width and height of canvas base on background image
                // set state w & h base on background image zoomHandler needs it!!   <--------
                $scope.paintBackgroundImage($scope.state.backgroundImg);
                $scope.uploadCanvas($scope.state.canvas);
                break;

            case "reedit":
                $scope.getJson($scope.state.canvasId);
                break;
        }
    });



    $scope.loadClipArts = function() {
        $http.get("/php/getClipArt.php").then(
            function(response) {
                console.log("loadClipArts success! response", response.data);
                    
                var data = response.data;
                
                response.data.forEach(function(clipArtObject){

                    var img = new Image();
                    img.onload = function() {
                        $scope.state.clipArt.push(img);
                    };
                    img.src = clipArtObject.base64;

                });
                // console.log($scope.state.clipArt);
            },
            function(response) {
                console.log("loadCanvas failed! response:", response);
            }
        );
    }
    // populate the scope.state.font with fonts from server.
    $scope.loadFonts = function() {
        $http.post("/php/getFontNames.php").then(
            function(response) {
                console.log("getFontNames succes! response:", response);
                $scope.state.fonts = response.data;
            },
            function(response) {
                console.log("getFontNames failed! response:", response);
            }
        );
    }

    // From home page when user pass canvasId from browse image optƒion
    // get request should grab the json
    // parse the json and store in local state
    // turn base64 images into Image() objects to avoid painting stutter
    $scope.getJson = function(canvasId) {
        var data = {
            canvasId: canvasId
        }
        console.log("data",data);

        // data = JSON.stringify(data);

        $http.post("/php/getJson.php", data ).then(
            function(response) {
                console.log("getJson success! response", response);
                var data = response.data;
                
                // $scope.paintCanvas($scope.state.canvas, data.layers);
                $scope.loadCanvas(data);

            },
            function(response) {
                console.log("getJson failed! response:", response);
            }
        );
    }


    $scope.imageToBase64 = function(image) {
        var base64;

        console.log("image from imageToBase64",image);

        var ghostCanvas = $scope.state.ghostCanvas;
        var gctx = ghostCanvas.getContext('2d');

        ghostCanvas.width = image.width;
        ghostCanvas.height = image.height;

        gctx.drawImage(image, 0, 0);
        
        base64 = ghostCanvas.toDataURL("image/png");
        
        return base64;
    }

    // Upload local canvas onto server
    // Use case:
    // 1. Saving canvas (storing json and final image onto server)
    // 2. Adding/updating background (inserting background into json and storing onto server)
    $scope.uploadCanvas = function(canvas) {
        var finalImage = $scope.getCanvas64();
        var backgroundImage = Object.assign({}, canvas.backgroundImage);
        // create new array and push new object aka deference of canvas._objects properties into layers
        var layers = [];
        canvas._objects.forEach(function(element) {
            // push type: layer.type because when Object.assign(layer)
            // some properties are not saved, mainly in the object prototype
            // where type is started. So we re-save type into our new object
            switch(element.type) {
                case "image":
                    layers.push(Object.assign(
                        {
                            id: element.id,
                            type: element.type,
                            left: element.left,
                            top: element.top,
                            angle: element.angle,
                            opacity: element.opacity,
                            zIndex: element.zIndex,
                            scaleX: element.scaleX,
                            scaleY: element.scaleY,
                            _element: element._element,
                            _originalElement: element._originalElement
                        }, 
                        {}
                    ));
                    break;
                case "text":
                    layers.push(Object.assign(
                        {
                            id: element.id,
                            type: element.type,
                            text: element.text,
                            fontFamily: element.fontFamily,
                            left: element.left,
                            top: element.top,
                            angle: element.angle,
                            opacity: element.opacity,
                            fontSize: element.fontSize,
                            fill: element.fill,
                            zIndex: element.zIndex,
                            scaleX: element.scaleX,
                            scaleY: element.scaleY
                        }, 
                        {}
                    ));
                    break;
            }
            
        });

        console.log(layers);

        // If there's a background image turn images into base64
        if( Object.keys(backgroundImage).length !== 0 ) {
            console.log("base64 background");
            backgroundImage._element = $scope.imageToBase64(canvas.backgroundImage._element);
            backgroundImage._originalElement = $scope.imageToBase64(canvas.backgroundImage._originalElement);
        }

        // Go through canvas object and convert all images in layers into base64
        layers.forEach(function(layer, index) {
            console.log("base64 layers");
            if(layer.type === "image") {
                layer._element = $scope.imageToBase64(layer._element);
                layer._originalElement = $scope.imageToBase64(layer._originalElement);
            }
        });

        var data = {
            // Use canvasId to name files
            // e.g. canvasId.json, canvasId.fileExtension
            canvasId: $scope.state.canvasId,
            json: {
                canvasConfig: {
                    idHelper: $scope.state.idHelper,
                    zIndex: $scope.state.zIndex,
                    fontsUsed: $scope.state.fontsUsed,
                    cWidth: canvas.width,
                    cHeight: canvas.height,
                    displayType: ''
                },
                backgroundImage: backgroundImage,
                layers: layers
                
            },
            image: finalImage,
            fileExtension: ".png"
        }

        console.log("uploadToServer sending data: ",data);
        $http.post('/php/uploadToServer.php', data).then(
            function(response){
                console.log("uploadCanvas success! json and png saved to server:");
            },
            function(response){
                console.log("uploadCanvas failed! response:", response);
            }
        );    
    }






    $scope.loadCanvas = function(data) {
        var canvas = $scope.state.canvas;
        var canvasConfig = data.canvasConfig;

        

        $scope.state.idHelper = data.canvasConfig.idHelper;
        $scope.state.zIndex = data.canvasConfig.zIndex;
        $scope.state.fontsUsed = data.canvasConfig.fontsUsed;
        canvas.setWidth(canvasConfig.cWidth);
        canvas.setHeight(canvasConfig.cHeight);

        $scope.addFontsUsed();

        var layers = data.layers;

        layers.forEach(function(element, index) {
            if(element.type === "image") {
                var image = new Image();

                image.onload = function() {
                    // return function(image) {
                        element._element = image;
                        element._originalElement = image;


                        // document.body.appendChild(image);
                        $scope.paintElement(canvas, element);
                    // }
                    
                }
                image.src = element._element;
            } else if (element.type === "text") {
                  $scope.paintElement(canvas, element);
            }
        });

        console.log("Loaded canvas with these objects",layers);
        // $scope.updateZindexs(layers);

    }


    $scope.getCanvas64 = function() {
        var canvas = $scope.state.canvas;

        var img = document.createElement('img');
        img.src = canvas.toDataURL('image/png');

        document.body.appendChild(img);


        return canvas.toDataURL('image/png');
    }

    // background option to fill background to canvas if background is smaller
    $scope.backgroundFillCanvas = function(canvas, background) {
        background.set({
            width: canvas.width, 
            height: canvas.height, 
            originX: 'left', 
            originY: 'top'    
        });

        canvas.setBackgroundImage(background, canvas.renderAll.bind(canvas));
    }









    // $scope.updateFont = function() {
    //     console.log($scope.state.font);

    //     $scope.loadAndUse($scope.state.font);
    // }

    $scope.loadAndUse = function(font) {
        // console.log(font);
        var myfont = new FontFaceObserver(font);
        myfont.load()
          .then(function() {
            // when font is loaded, use it.
            // canvas.getActiveObject().set("fontFamily", font);
            var canvas = $scope.state.canvas;
            canvas.requestRenderAll();
            // $scope.renderAll();
            console.log("font loaded success!");
          }).catch(function(e) {
            console.log(e)
            alert('font loading failed ' + font);
          });
      }

      $scope.getFont = function() {
        // check if found has already been used therefore imported to css
        var found = $scope.state.fontsUsed.find(function(fontCofig){
            return fontCofig.name === $scope.state.font;
        });
        console.log("found", found);
        if(found !== undefined) return;

        var data = {
            fontName: $scope.state.font
        };

        $http.post('/php/getFont.php', data).then(
            function(response) {
                console.log("getFont success! response:", response);
                $scope.addFontCss($scope.state.font, response.data.file.path);

                // keep track of all the loaded css to avoid dupilcates
                $scope.state.fontsUsed.push({
                    name: $scope.state.font, 
                    path: response.data.file.path});
                
                $scope.loadAndUse($scope.state.font);
            },
            function(response) {
                console.log("getFont failed! response:", response);
            }
        );
      }

    $scope.addFontCss = function(font, path) {
        var css = document.createElement("style");
        css.type = "text/css";
        css.innerHTML = "@font-face { font-family: '"+font+"'; src: url('/php/"+path+"') format('truetype');}";
        document.body.appendChild(css);
    }

    $scope.addFontsUsed = function() {
        $scope.state.fontsUsed.forEach(function(fontConfig){
            $scope.addFontCss(fontConfig.name, fontConfig.path);
        });
    }

    $scope.fontChanged = function() {
        var canvas = $scope.state.canvas;
        if(!canvas.getActiveObject()) return;
        canvas.getActiveObject().set('fontFamily', $scope.state.font);
        $scope.getFont();
       console.log("getActiveObject from font changed!", canvas.getActiveObject());
    }








    $scope.paintBackgroundImage = function() {
        console.log($scope.state.backgroundImg);
        var canvas = $scope.state.canvas;
        var image = $scope.state.backgroundImg;
        var img = new fabric.Image(image);
        canvas.setBackgroundImage(img, function(img) {
            img.set({
                originX: 'center', 
                originY: 'center'
            });
            canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
            canvas.centerObject(img);
         });
         
    }

    // Event handle which will be attached to onchange event 
    // listener of "choose file" (import) button.
    $scope.storeBackground = function(event) {
        console.log("importImg clicked");
        var file = document.getElementById("imgFile").files[0];
        // FileReader to read the image.
        var fr = new FileReader();
        // Image to get meta data on image such as size.
        var image = new Image();

        fr.onload = function(event) {
            image.onload = function(event) {
                $scope.state.backgroundImg = image;
                console.log($scope.state.backgroundImg);
            }
            image.src = event.target.result;
        }
        fr.readAsDataURL(file);  
    }   



    // Event handle which will be attached to onchange event 
    // listener of "choose file" (import) button.
    $scope.importImg = function(event) {
        console.log("importImg clicked");
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
                    var img = new fabric.Image(image);
                    console.log(img);
                    
                    
                    
                    canvas.setBackgroundImage(img, function(img) {
                        img.set({
                            // Needed to position backgroundImage at 0/0
                            width: canvas.getWidth(),//Number(canvas.width),
                            height: canvas.getHeight(),//Number(canvas.height),
                            // Needed to position backgroundImage at 0/0
                            // originX: 'left',
                            // originY: 'top'
                        });
                        canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
                        canvas.centerObject(img);
                     });
                     
                    
                    console.log(img);
                    // $scope.backgroundFillCanvas(canvas, f_img);
                    // canvas.setBackgroundImage(f_img);
                    canvas.renderAll();
            }
            // console.log("image.src = ", event.target.result);
            image.src = event.target.result;
        }
        fr.readAsDataURL(file);  
    }    

    // Set scale number for zoom functionality.
    $scope.zoomHandler = function(type) {
        console.log("zoomHandler clicked");
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


    $scope.updateZindexs = function() {
        var canvas = $scope.state.canvas;
        canvas._objects.forEach(function(element){
            canvas.moveTo(element, element.zIndex);
        });
    }

    $scope.paintElement = function(canvas, element) {
        switch(element.type){
            case "text":
                
                var text = new fabric.Text(element.text, {
                    id: element.id,
                    fontFamily: element.fontFamily,
                    left: element.left,
                    top: element.top,
                    angle: element.angle,
                    opacity: element.opacity,
                    fontSize: element.fontSize,
                    fill: element.fill,
                    zIndex: element.zIndex,
                    scaleX: element.scaleX,
                    scaleY: element.scaleY
                });
                canvas.add(text);
                console.log("The zIndex of this text is", element.zIndex);
                canvas.moveTo(text, element.zIndex);
                break;
            case "image":
                var image = new fabric.Image(element._element, {
                    id: element.id,
                    left: element.left,
                    top: element.top,
                    angle: element.angle,
                    opacity: element.opacity,
                    zIndex: element.zIndex,
                    scaleX: element.scaleX,
                    scaleY: element.scaleY
                });
                canvas.add(image);
                // canvas.moveTo(image, element.zIndex);
                canvas.moveTo(image, element.zIndex);
                break;
        }
    }


    $scope.paintCanvas = function(layers) {
        var canvas = $scope.state.canvas;
        for(var i=0; i < layers.length; i++) {
            $scope.paintElement(canvas, layers[i]);
        }
    }

    $scope.paintClipArtPreview = function(canvas) {
        var width = canvas.getWidth();
        var height = canvas.getHeight();
        var image = object._element;
        var key = 0;
        var clipArt = $scope.state.clipArt;

        for(key; key < clipArt.length; key++) {
            var preview = document.getElementById(key+"ClipArt");
        }
    }



    // Paint the layers in controller section.
    $scope.paintLayers = function() {
        var canvas = $scope.state.canvas;
        // var layers = $scope.state.layers;
        var layers = canvas._objects;
        if(!layers) return;


        // layers.forEach(function(element, index) {


        //     // Layers: from layers option in html
        //     console.log("painting layer:", element, index);
            
        //     var layerCanvas = new fabric.StaticCanvas(index+"Layer");

        //     var isWidthGreater;
        //     var aspectRatio = canvas.getWidth() / canvas.getHeight();

        //     canvas.getWidth() > canvas.getHeight()
        //     ? isWidthGreater = true
        //     : isWidthGreater = false;
        //     console.log("aspectRatio", aspectRatio);
            
        //     c = document.getElementById(index+"Layer");

        //     // Set up the correct ratio for the layers display
        //     if (isWidthGreater) {
        //         layerCanvas.set('height', 100);
        //         layerCanvas.set('width', 100 * aspectRatio);
        //         // c.height = 100;
        //         // c.width = 100 * aspectRatio;
        //     } else {
        //         layerCanvas.set('width', 130);
        //         layerCanvas.set('height', 130 / aspectRatio);
        //         // c.width = 130;
        //         // c.height = 130 / aspectRatio;
        //     }

        //     layerCanvas.setZoom(layerCanvas.getWidth() / canvas.getWidth() );
            
        //     $scope.paintElement(layerCanvas, element);
        //     layerCanvas.backgroundColor="white";
        //     layerCanvas.renderAll();

        //     // canvas.setZoom(zoom);
        //     // canvas.setHeight($scope.state.h * canvas.getZoom());
        //     // canvas.setWidth($scope.state.w * canvas.getZoom());
                

        // });
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
        var canvas = $scope.state.canvas;
        // before you use increment to keep each unique
        $scope.state.zIndex++;
        $scope.state.idHelper++;
        var text = new fabric.Text(
            $scope.state.textString, 
            { 
                id: $scope.state.idHelper,
                // Create own z-index property for object
                zIndex: $scope.state.zIndex,
                fontSize: $scope.state.fontSize,
                fill: $scope.state.fontColor,
                fontFamily: $scope.state.font
            }
        );

        canvas.add(text);
        canvas.centerObject(text);
        canvas.moveTo(text, text.zIndex);
        $scope.state.historyLayers = [];
        $scope.paintLayers();

        // $scope.setDefaultValues();
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
                var canvas = $scope.state.canvas;
                $scope.state.zIndex++;
                $scope.state.idHelper++;
                // store image into layers.
                var imgInstance = new fabric.Image(image, 
                    {
                        id: $scope.state.idHelper,
                        // Create own z-index property for object
                        zIndex: $scope.state.zIndex
                    }
                );
                canvas.add(imgInstance);
                canvas.centerObject(imgInstance);
                canvas.moveTo(imgInstance, imgInstance.zIndex);
                console.log($scope.state.layers);

                $scope.state.historyLayers = [];
                $scope.paintLayers();
            
            };
            image.src = fr.result;
        }
        fr.readAsDataURL(file);     
    }


    $scope.addClipArtHandler = function(image) {
        console.log("adding clip art");
        console.log(image);
        var canvas = $scope.state.canvas;
                $scope.state.zIndex++;
                $scope.state.idHelper++;
                // store image into layers.
                var imgInstance = new fabric.Image(image, 
                    {
                        id: $scope.state.idHelper,
                        // Create own z-index property for object
                        zIndex: $scope.state.zIndex
                    }
                );
                console.log("Image instance is : ",imgInstance);
                canvas.add(imgInstance);
                canvas.centerObject(imgInstance);
                canvas.moveTo(imgInstance, imgInstance.zIndex);

                $scope.paintLayers();
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
        
        $scope.state.historyLayers.push(canvas.getActiveObject());

        canvas.remove(canvas.getActiveObject());
        console.log($scope.state.historyLayers);

        $scope.paintLayers();
        // return removed;
    }

    $scope.selectLayer = function(layerIndex) {
        $scope.state.clickedItem = layerIndex;
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



    $scope.mouseDown = function(event) {
        var canvas = $scope.state.canvas;
        // if no object clicked, do nothing
        if(!canvas.getActiveObject()) return;
        $scope.state.isActiveObject = canvas.getActiveObject();
        $scope.updateZIndex(canvas.getActiveObject());
        

        // For some reason when cloning object type and maybe other properties are not saved. Add them..
        $scope.state.historyLayers.push(Object.assign({type: canvas.getActiveObject().type, id: canvas.getActiveObject().id}, canvas.getActiveObject()));

        $scope.$apply();
    }

    $scope.mouseUp = function(event) {
        var canvas = $scope.state.canvas;
        if(!canvas.getActiveObject()) return;
        $scope.paintLayers();
        

        console.log($scope.state.historyLayers);
    }

    $scope.undo = function() {
        var canvas = $scope.state.canvas;
        var history = $scope.state.historyLayers;

        if(history.length <= 0) return;

        var redoItem = history.pop();

        canvas._objects.forEach(function(object, index){
            if(object.id === redoItem.id) {
                canvas.remove(object);
            }
            
        });

        console.log(redoItem);


        $scope.paintElement(canvas, redoItem);

        
        // $scope.renderAll();
        // canvas.remove(canvas.getActiveObject());
        // console.log(redoItem);

        console.log($scope.state.historyLayers);
    }
   
    // Set the canvas mouse listeners to our handlers.
    $scope.setCanvasListeners = function() {
        var canvas = $scope.state.canvas;
        // canvas.onmousedown = $scope.mouseDown;
        canvas.on('mouse:down', $scope.mouseDown);
        canvas.on('mouse:up', $scope.mouseUp);
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
        $scope.paintLayers();
    }


    $scope.updateZIndex = function(layer) {
        var canvas = $scope.state.canvas;
        // Increment before use to keep zindex unique
        $scope.state.zIndex++;
        layer.zIndex = $scope.state.zIndex;
        canvas.moveTo(layer, layer.zIndex);
    }


    $scope.init();
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
    $scope.state = {
        canvasIds: [],
    };

    $scope.init = function() {
        $scope.getCanvasIds();
    }

    

    // // Initialise canvas when home.html view has finished loading.
    // $scope.$on('$viewContentLoaded', function(event)
    // { 
    //     console.log("Home.html init!");
    //     $scope.getCanvasIds();
    //     console.log($scope.state.canvasIds);
    // });

   $scope.getCanvasIds = function() {
        $http.get('/php/getFolderNames.php').then(
            function(response) {
                $scope.state.canvasIds = response.data;
                console.log("success!", $scope.state.canvasIds);
                // update view
                // $scope.$apply();
            },
            function(response) {
                console.log("failed!", response);
            }
        )
   }


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
        var file = document.getElementById('imgFile');

        if(file.value == '') {
            alert("Please select a background.");
            return;
        }
        var path = "#!/editor/blankBackground";
        location.href = path;
    }

    $scope.browseExisiting = function(canvasId) {
        console.log("Browse existing");


        if(canvasId == '') {
            alert("Please select an existing image.");
            return;
        }

        console.log("Re-edit existing image:",canvasId);
        var path = "#!/editor/reedit/" + canvasId;
        location.href = path;
    }


    $scope.init();
}]);

