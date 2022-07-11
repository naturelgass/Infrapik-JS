function infrapik(){
    infra = {
        
        init: function(sourceID, canvasID, presetFilterName) {

            this.initWorker(); // https://www.kevinhoyt.com/2018/10/31/transferable-imagedata/

            var thisParent = this;

            this.canvas = document.getElementById(canvasID);
            this.ctx = this.canvas.getContext("2d");

            this.img = new Image();
            this.img.crossOrigin = '';
            this.img.onload = function(){
                thisParent.canvas.width = this.width;
                thisParent.canvas.height = this.height;
                thisParent.ctx.drawImage(this, 0, 0);
            };

            this.img.src = document.getElementById(sourceID).src;
            this.currentSource = this.img;

            this.initPresetfilters();
            this.attachListeners();

            this.initPreset(presetFilterName);

            /* --- Check if Logs is checked --- */
            this.showLogs = localStorage.getItem("infraLogs");
            if(this.showLogs != this.logsCheck.checked.toString()){
                this.logsCheck.click();
            }

        },

        initWorker: function() {
            if (window.Worker) {
                this.processor = new Worker("js/worker.js?v=" + Math.floor(Math.random() * 600) + 1);
            } else {
                console.log('Your browser doesn\'t support web workers.')
            }
        },

        showLogs: 1,
        customSaveID: 0,
        currentFX: "",
        colorMatrixObject: {},
        joinedFilters: "",
        blendDirCtx: "",

        webCamStatus: "stoped",
        loopFrame: 1, reqFrameID: null,
        mediaConfig: { video: true },
        webCam: Array.apply(null, document.querySelectorAll('.webCam .btn')),

        hiddenCanvas: document.querySelector('#hidden-canvas'),

        video: document.getElementById('video'),

        presetName: document.getElementById("presetName"),
        openSavePreset: document.getElementById("openSavePreset"),
        closeBtn: Array.apply(null, document.querySelectorAll('.modalDialog .close')),

        colorMatrix: document.getElementById("svgcolormatrix"),

        imgSource: Array.apply(null, document.querySelectorAll('.imgSource')),
        orgImage: document.getElementsByClassName('orgImage'),

        channelSliders: Array.apply(null, document.querySelectorAll('.mixChannels input[type="range"]')),
        filtersSliders: Array.apply(null, document.querySelectorAll('.mixFilters input[type="range"]')),
        fxSliders: Array.apply(null, document.querySelectorAll('.fxSliders input[type="range"]')),

        presetFilters: document.getElementById('presetFilters'),
        blendDir: document.getElementById('blendDir'),
        blendColor: document.getElementById('blendColor'),
        blendToColor: document.getElementById('blendToColor'),
        blendMix: document.getElementById('blendMix'),
        logsCheck: document.getElementById('showLogs'),
        resetBtns: Array.apply(null, document.querySelectorAll('form')),


        /* ---- Picture Effects: https://codepen.io/airen/embed/aaZaPP ---- */
        /* ---- More amazing filter: https://bennettfeely.com/image-effects/ ---- */
        /* ---- More Funky filters to implement: https://testdrive-archive.azurewebsites.net/graphics/hands-on-css3/hands-on_svg-filter-effects.htm ---- */

        preFilters: [

            { group:"", title: "Default",  name:"base", matrix:"1.000 0.000 0.000 0.000 0.000 0.000 1.000 0.000 0.000 0.000 0.000 0.000 1.000 0.000 0.000 0.000 0.000 0.000 1.000 0.000", hue:"0", saturate:"0", brightness:"0", contrast:"0", grayscale:"0", sepia:"0", blend:"normal", color:"", tocolor:"", dir: "" },
            { group:"Mix Filters", title: "Infra to Blue", name: "red2blue", matrix: "1.000 0.500 0.000 0.000 0.000 0.000 1.000 0.000 0.000 0.000 0.000 -0.100 1.000 0.000 0.000 0.000 0.000 0.000 1.000 0.000", hue:"-123", saturate:"23", brightness:"-5", contrast:"24", grayscale:"0", sepia:"2", blend:"normal", color:"", tocolor:"", dir: "" },
            { group:"Mix Filters", title: "Duo Tone", name: "duotone", matrix: "0.950 0.000 0.000 0.000 0.050 0.650 0.000 0.000 0.000 0.150 0.150 0.000 0.000 0.000 0.500 0.000 0.000 0.000 1.000 0.000", hue:"0", saturate:"0", brightness:"0", contrast:"0", grayscale:"0", sepia:"0", blend:"normal", color:"", tocolor:"", dir: "" },
            { group:"Mix Filters", title: "Duo Burn", name: "duoburn", matrix: "0.900 0.000 0.000 0.000 0.400 0.950 0.000 0.000 0.000 -0.100 -0.200 0.000 0.000 0.000 0.650 0.000 0.000 0.000 1.000 0.000", hue:"0", saturate:"0", brightness:"0", contrast:"0", grayscale:"0", sepia:"0", blend:"normal", color:"", tocolor:"", dir: "" },
            { group:"Mix Filters", title: "Monochrome", name: "monochrome", matrix: "0.950 0.000 0.000 0.000 0.050 0.850 0.000 0.000 0.000 0.150 0.500 0.000 0.000 0.000 0.500 0.000 0.000 0.000 1.000 0.000", hue:"0", saturate:"0", brightness:"0", contrast:"0", grayscale:"0", sepia:"0", blend:"normal", color:"", tocolor:"", dir: "" },
            { group:"Mix Filters", title: "Duo Tint", name: "duotint", matrix: "0.360 0.000 0.000 0.000 0.020 0.440 0.000 0.000 0.000 0.060 0.400 0.000 0.000 0.000 0.160 0.000 0.000 0.000 1.000 0.000", hue:"0", saturate:"0", brightness:"0", contrast:"0", grayscale:"0", sepia:"0", blend:"normal", color:"", tocolor:"", dir: "" },
            { group:"Mix Filters", title: "Chrome", name: "chrome", matrix: "1.398 -0.316 0.065 -0.273 0.201 -0.051 1.278 -0.080 -0.273 0.201 -0.051 0.119 1.151 -0.290 0.215 0.000 0.000 0.000 1.000 0.000", hue:"0", saturate:"0", brightness:"0", contrast:"0", grayscale:"0", sepia:"0", blend:"normal", color:"", tocolor:"", dir: "" },
            { group:"Mix Filters", title: "Brownie", name: "brownie", matrix:"0.599 0.345 -0.270 0 0.180 -0.037 0.860 0.150 0 -0.150 0.241 -0.074 0.449 0 -0.050 0 0 0 1 0", hue:"0", saturate:"0", brightness:"0", contrast:"0", grayscale:"0", sepia:"0", blend:"normal", color:"", tocolor:"", dir: "" },
            { group:"Mix Filters", title: "Polaroid", name: "polaroid", matrix:"1.438 -0.062 -0.062 0 0 -0.122 1.378 -0.122 0 0 -0.016 -0.016 1.483 0 0 0 0 0 1 0", hue:"0", saturate:"0", brightness:"0", contrast:"0", grayscale:"0", sepia:"0", blend:"normal", color:"", tocolor:"", dir: "" },
            { group:"Mix Filters", title: "Vintage Pinhole", name: "vintagepinhole", matrix:"0.627 0.320 -0.039 0 0 0.025 0.644 0.032 0 0 0.046 -0.085 0.524 0 0 0 0 0 1 0", hue:"0", saturate:"0", brightness:"0", contrast:"0", grayscale:"0", sepia:"0", blend:"normal", color:"", tocolor:"", dir: "" },
            { group:"Mix Filters", title: "Kodachrome", name: "kodachrome", matrix:"1.128 -0.396 -0.039 0 0 -0.164 1.083 -0.054 0 0 -0.167 -0.560 1.601 0 0 0 0 0 1 0", hue:"0", saturate:"0", brightness:"0", contrast:"0", grayscale:"0", sepia:"0", blend:"normal", color:"", tocolor:"", dir: "" },
            { group:"Mix Filters", title: "Technicolor", name: "technicolor", matrix:"1.912 -0.854 -0.091 0 -0.050 -0.308 1.765 -0.106 0 -0.290 -0.231 -0.750 1.847 0 0.110 0 0 0 1 0", hue:"0", saturate:"0", brightness:"0", contrast:"0", grayscale:"0", sepia:"0", blend:"normal", color:"", tocolor:"", dir: "" },
            { group:"Mix Filters", title: "Noir", name: "noir", matrix: "0.150 1.300 -0.250 0.100 -0.200 0.150 1.300 -0.250 0.100 -0.200 0.150 1.300 -0.250 0.100 -0.200 0.000 0.000 0.000 1.000 0.000", hue:"0", saturate:"0", brightness:"0", contrast:"0", grayscale:"0", sepia:"0", blend:"normal", color:"", tocolor:"", dir: "" },

            { group:"Color Blends", title: "Blend Blue", name:"blendblue", matrix:"1.000 0.000 0.000 0.000 0.000 0.000 1.000 0.000 0.000 0.000 0.000 0.000 1.000 0.000 0.000 0.000 0.000 0.000 1.000 0.000", hue:"0", saturate:"0", brightness:"0", contrast:"20", grayscale:"50", sepia:"0", blend:"luminosity", color:"#0066BF", tocolor:"#0066BF", dir: "" },
            { group:"Color Blends", title: "Blend Orange", name:"blendorange", matrix:"1.000 0.000 0.000 0.000 0.000 0.000 1.000 0.000 0.000 0.000 0.000 0.000 1.000 0.000 0.000 0.000 0.000 0.000 1.000 0.000", hue:"0", saturate:"0", brightness:"0", contrast:"20", grayscale:"50", sepia:"0", blend:"luminosity", color:"#FCA300", tocolor:"#FCA300", dir: "" },
            { group:"Color Blends", title: "Blend Purple", name:"blendpurple", matrix:"1.000 0.000 0.000 0.000 0.000 0.000 1.000 0.000 0.000 0.000 0.000 0.000 1.000 0.000 0.000 0.000 0.000 0.000 1.000 0.000", hue:"0", saturate:"0", brightness:"0", contrast:"20", grayscale:"50", sepia:"0", blend:"luminosity", color:"#663399", tocolor:"#663399", dir: "" },
            { group:"Color Blends", title: "Blend Pink", name:"blendpink", matrix:"1.000 0.000 0.000 0.000 0.000 0.000 1.000 0.000 0.000 0.000 0.000 0.000 1.000 0.000 0.000 0.000 0.000 0.000 1.000 0.000", hue:"0", saturate:"0", brightness:"0", contrast:"20", grayscale:"50", sepia:"0", blend:"luminosity", color:"#EA4C89", tocolor:"#EA4C89", dir: "" },

            { group:"Gradient Blends", title: "Blue Pink", name:"bluepink", matrix:"1.000 0.000 0.000 0.000 0.000 0.000 1.000 0.000 0.000 0.000 0.000 0.000 1.000 0.000 0.000 0.000 0.000 0.000 1.000 0.000", hue:"0", saturate:"0", brightness:"0", contrast:"20", grayscale:"50", sepia:"0", blend:"luminosity", color:"#0066BF", tocolor:"#EA4C89", dir: "UpLeft" },
            { group:"Gradient Blends", title: "Green Blue", name:"greenblue", matrix:"1.000 0.000 0.000 0.000 0.000 0.000 1.000 0.000 0.000 0.000 0.000 0.000 1.000 0.000 0.000 0.000 0.000 0.000 1.000 0.000", hue:"0", saturate:"0", brightness:"0", contrast:"20", grayscale:"50", sepia:"0", blend:"screen", color:"#4cea5e", tocolor:"#0066BF", dir: "Down" },
            { group:"Gradient Blends", title: "Purple Orange", name:"purpleorange", matrix:"1.000 0.000 0.000 0.000 0.000 0.000 1.000 0.000 0.000 0.000 0.000 0.000 1.000 0.000 0.000 0.000 0.000 0.000 1.000 0.000", hue:"0", saturate:"0", brightness:"0", contrast:"20", grayscale:"50", sepia:"0", blend:"overlay", color:"#EA4C89", tocolor:"#FCA300", dir: "Left" },
            { group:"Gradient Blends", title: "Yellow Blue", name:"yellowblue", matrix:"1.000 0.000 0.000 0.000 0.000 0.000 1.000 0.000 0.000 0.000 0.000 0.000 1.000 0.000 0.000 0.000 0.000 0.000 1.000 0.000", hue:"0", saturate:"0", brightness:"0", contrast:"20", grayscale:"50", sepia:"0", blend:"luminosity", color:"#FEDD31", tocolor:"#55ACEE", dir: "DownRight" },

            { group:"Other", title: "Dilate", name:"dilate", options: [3], slider: [ { min: 1, max: 10, step: 1 }] },
            { group:"Other", title: "Erode ", name:"erode", options: [3], slider: [ { min: 1, max: 10, step: 1 }]  },
            { group:"Other", title: "Turbulence ", name:"turbulence", options: [60, 90], slider: [ { min: 1, max: 100, step: 1 }, { min: 1, max: 100, step: 1 }] },
            { group:"Other", title: "GaussianBlur ", name:"gaussianblur", options: [5, 5], slider: [ { min: 1, max: 10, step: 1 }, { min: 1, max: 10, step: 1 }] },

            { group:"Experimental", title: "RGB Split", name:"rgbsplit", options: [-5, 0, 5], slider: [ { min: -50, max: 50, step: 1 }, { min: -50, max: 50, step: 1 }, { min: -50, max: 50, step: 1 } ]},
            { group:"Experimental", title: "Tilt Shift", name:"tiltshift", options: [0.4, 0.5], slider: [{ min: 0, max: 0.9, step: .1 }, { min: 0.1, max: 1, step: .1 } ], dir: "Down"},
            { group:"Experimental", title: "Threshold", name:"threshold", options: 128, slider: [{ min: 0, max: 200, step: 1 }] },
            { group:"Experimental", title: "Hdr Effect", name:"hdreffect", options: [128, 3], slider: [{ min: 0, max: 128, step: 1 }, { min: 1, max: 5, step: .1 }] },
            { group:"Experimental", title: "Pixelate", name:"pixelate", options: 12, slider: [{ min: 1, max: 30, step: 1 }] },
            { group:"Experimental", title: "Flip Image", name:"flipImage" },

            { group:"Experimental", title: "Sobel", name:"sobel", options: [255], slider: [{ min: 0, max: 255, step: 1 }] },
            { group:"Experimental", title: "Laplace", name:"laplace", brightness:"100", options: [-1, -1, -1, -1, 8, -1, -1, -1, -1] },

            { group:"Experimental", title: "Negative", name:"negative", options: [255, 255, 255], slider: [{ min: 0, max: 255, step: 1 }, { min: 0, max: 255, step: 1 }, { min: 0, max: 255, step: 1 }] },
            { group:"Experimental", title: "Ascii", name:"ascii", options: [15], slider: [{ min: 15, max: 50, step: 1 }], blend: "difference" },
            { group:"Experimental", title: "Shape Blend", name:"shapeBlend", options: [10], slider: [{ min: 10, max: 20, step: 1 }], blend: "luminosity" },

            
            { group:"Experimental", title: "Pop Art", name:"popart", options: [2], slider: [{ min: 2, max: 5, step: 1 }], blend: "hard-light" },

            

            { group:"Experimental", title: "Sharpen", name:"sharpen", options: [2], slider: [{ min: 1, max: 5, step: .1 }] },
            { group:"Experimental", title: "Emboss", name:"emboss", options: [1], slider: [{ min: 1, max: 5, step: .1 }] }

        ],

        initPresetfilters: function(){

            var option, optgroup;
            var preGroups = []; for (i = 0; i < this.preFilters.length; i++) { preGroups.push(this.preFilters[i].group); }
            preGroups = this.remove_duplicates_es6(preGroups)

            for (b = 0; b < preGroups.length; b++) {
                if(preGroups[b] !== ""){
                    optgroup = document.createElement('optgroup' );
                    optgroup.label = preGroups[b];
                    for (i = 0; i < this.preFilters.length; i++) {
                        if(this.preFilters[i].group == optgroup.label){
                            option = document.createElement( 'option' );
                            option.value = this.preFilters[i].name;
                            option.text = this.preFilters[i].title;
                            optgroup.appendChild(option);
                        }
                    }
                    this.presetFilters.add(optgroup);
                } else {
                    option = document.createElement( 'option' );
                    option.value = this.preFilters[b].name;
                    option.text = this.preFilters[b].title;
                    option.setAttribute("selected", "selected");
                    option.className = "base";
                    this.presetFilters.add(option);
                }
            }

            optgroup = document.createElement('optgroup' );
            optgroup.label = "Custom";
            optgroup.className = "custom";
            this.presetFilters.add(optgroup);

        },

        attachListeners: function(){

            var thisParent = this;

            /* Setup WebWorker messaging */
            this.processor.onmessage = function(event){
                thisParent.ctx.putImageData(data.imageData, 0, 0); 
            };

            /* ---- Set FX Options ---- */
            this.fxSliders.forEach(function(rangeSlider) {
                rangeSlider.addEventListener('change', function() {
                    thisParent.updateFilter();
                });
            });

            /* ---- Update Belend Mix Color ---- */
            this.blendDir.addEventListener('change', function() {
                thisParent.updateFilter();
            });

            /* ---- Update Belend Mix Color ---- */
            this.blendColor.addEventListener('change', function() {
                thisParent.updateFilter();
            });

            /* ---- Update Belend To Mix Color ---- */
            this.blendToColor.addEventListener('change', function() {
                thisParent.updateFilter();
            });        
            
            /* ---- Set Blend Mix Modes ---- */
            this.blendMix.addEventListener('change', function() {
                thisParent.updateFilter();
            });

            /* --- Reset Buttons --- */
            this.resetBtns.forEach(function(rstBtn) {
                rstBtn.addEventListener('reset', function() {
                    thisParent.resetALL(this);
                });
            });

            /* ---- Channels Sliders ---- */
            this.channelSliders.forEach(function(rangeSlider) {
                var t = rangeSlider;
                thisParent.updateMatrix(t.id, t.value / 10);
                rangeSlider.addEventListener('input', function() {
                    thisParent.onChannelRangeChange(rangeSlider);
                }, false);
            });

            /* ---- Filters Sliders ---- */
            this.filtersSliders.forEach(function(rangeSlider) {
                rangeSlider.addEventListener('input', function() {
                    thisParent.onFiltersRangeChange(rangeSlider);
                }, false);
            });            
            
            /* ---- Save Preset ---- */
            this.closeBtn.forEach(function(dialog) {
                dialog.addEventListener('click', function() {
                    thisParent.openSavePreset.className = "modalDialog";
                });
            });                  
            
            /* ---- Update Preset Filters ---- */
            this.presetFilters.addEventListener('change', function() {
                thisParent.setPresetFilter(thisParent.presetFilters.value);
            });

            this.logsCheck.addEventListener('click', function() {
                thisParent.showLogs = this.checked
                thisParent.updateFilter();
            });

            /* ---- video 'play' event listener ---- */
            video.addEventListener('play', function() {
                thisParent.webCamRun();
            });

        },

        updateMatrix: function(colorID, value) {
            this.colorMatrixObject[colorID] = value.toString();
            var matrixArray = [];
            for (var val in this.colorMatrixObject) {
                matrixArray.push(this.colorMatrixObject[val]);
            }
            this.colorMatrix.setAttribute("values", matrixArray.join(' '));
        },

        onChannelRangeChange: function(rangeSlider) {
            var sliderValue = ((Math.round(rangeSlider.value * 10) / 10) / 10).toFixed(3);
            rangeSlider.previousElementSibling.innerHTML = sliderValue;
            this.updateMatrix(rangeSlider.id, sliderValue);
            this.updateFilter();
        },

        onFiltersRangeChange: function(rangeSlider){
            var sliderValue = Math.round(rangeSlider.value * 10) / 10;
            rangeSlider.previousElementSibling.innerHTML = sliderValue;
            this.updateFilter();
        },
        
        setFXSliders: function(){
            if ('slider' in this.currentFX){
                for (i = 0; i < 3; i++) {
                    if(i < this.currentFX.slider.length) {
                        this.fxSliders[i].disabled = false;
                        this.fxSliders[i].min = this.currentFX.slider[i].min,
                        this.fxSliders[i].max = this.currentFX.slider[i].max,
                        this.fxSliders[i].step = this.currentFX.slider[i].step,
                        this.fxSliders[i].value = this.currentFX.options[i];
                        this.fxSliders[i].previousElementSibling.innerHTML = this.currentFX.options[i];
                    } else {
                        this.fxSliders[i].value = 0;
                        this.fxSliders[i].disabled = true;
                        this.fxSliders[i].previousElementSibling.innerHTML = 0;
                    }
                }
            } else {
                for (i = 0; i < 3; i++) {
                    this.fxSliders[i].min = 0;
                    this.fxSliders[i].value = 0;
                    this.fxSliders[i].disabled = true;
                    this.fxSliders[i].previousElementSibling.innerHTML = 0;
                }
            }
        },

        updateFilter: function(){

            var fxList = [];

            /* ---- Update Mix Blend Settings ---- */
            for (i = 0; i < this.filtersSliders.length; i++) {
                var fx = this.filtersSliders[i].getAttribute('data-fx');
                var amp = this.filtersSliders[i].getAttribute('data-amp');
                var rangeValue = this.filtersSliders[i].value;

                if(fx == "saturate") {
                    rangeValue = (rangeValue * 1 + 100);
                } else if(fx == "brightness") {
                    rangeValue = (rangeValue * 1 + 100);
                } else if(fx == "contrast"){
                    rangeValue = (rangeValue * 1 + 100);
                }

                fxList.push(fx + "(" + rangeValue + "" + amp +")");
            }

            var mainFilters = fxList.join(" ");

            /* ---- Draw with Filters ---- */
            fxList.push("url('#svgfilter')");

            if(this.currentFX.group == "Other"){

                if(this.currentFX.name == "dilate"){

                    var svgElem = document.getElementById("svgfilterDilate");
                    var effect = svgElem.querySelector("feMorphology");
                    effect.setAttribute("radius", this.fxSliders[0].value);
                    fxList.push("url('#svgfilterDilate')");

                } else if(this.currentFX.name == "erode"){

                    var svgElem = document.getElementById("svgfilterErode");
                    var effect = svgElem.querySelector("feMorphology");
                    effect.setAttribute("radius", this.fxSliders[0].value);
                    fxList.push("url('#svgfilterErode')");

                } else if(this.currentFX.name == "turbulence"){

                    var svgElem = document.getElementById("svgfilterTurbulence");
                    var effect = svgElem.querySelector("feTurbulence");
                    effect.setAttribute("baseFrequency", this.fxSliders[0].value / 1000);
                    effect = svgElem.querySelector("feDisplacementMap");
                    effect.setAttribute("scale", this.fxSliders[1].value);                            
                    fxList.push("url('#svgfilterTurbulence')");

                } else if(this.currentFX.name == "gaussianblur"){

                    var svgElem = document.getElementById("gaussianBlur");
                    var effect = svgElem.querySelector("feGaussianBlur");
                    effect.setAttribute("stdDeviation", this.fxSliders[0].value + " " + this.fxSliders[1].value);
                    fxList.push("url('#gaussianBlur')");

                }
            }

            this.joinedFilters = fxList.join(" ");

            /* --- Set Blend Direction --- */
            if(this.blendDir.value == "Down"){
                this.blendDirCtx = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
                this.linerDir = [this.canvas.width / 2, 0, this.canvas.width / 2, this.canvas.height];
            } else if(this.blendDir.value == "DownLeft"){
                this.blendDirCtx = this.ctx.createLinearGradient(this.canvas.width, 0, 0, this.canvas.height);
                this.linerDir = [0, 0, this.canvas.width, this.canvas.height];
            } else if(this.blendDir.value == "Left"){
                this.blendDirCtx = this.ctx.createLinearGradient(this.canvas.width, this.canvas.height, 0, this.canvas.height);
                this.linerDir = [0, this.canvas.height / 2, this.canvas.width, this.canvas.height / 2];
            } else if(this.blendDir.value == "UpLeft"){
                this.blendDirCtx = this.ctx.createLinearGradient(this.canvas.width, this.canvas.height, 0, 0);
                this.linerDir = [0, 0, this.canvas.width, this.canvas.height];
            } else if(this.blendDir.value == "Up"){
                this.blendDirCtx = this.ctx.createLinearGradient(0, this.canvas.height, 0, 0);
                this.linerDir = [this.canvas.width / 2, 0, this.canvas.width / 2, this.canvas.height];
            } else if(this.blendDir.value == "UpRight"){
                this.blendDirCtx = this.ctx.createLinearGradient(0, this.canvas.height, this.canvas.width, 0);
                this.linerDir = [this.canvas.width, 0, 0, this.canvas.height];
            } else if(this.blendDir.value == "Right"){
                this.blendDirCtx = this.ctx.createLinearGradient(0, this.canvas.height, this.canvas.width, this.canvas.height);
                this.linerDir = [0, this.canvas.height / 2, this.canvas.width, this.canvas.height / 2];
            } else {
                this.blendDir.value = "DownRight";
                this.blendDirCtx = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
                this.linerDir = [this.canvas.width, 0, 0, this.canvas.height];
            }

            this.blendDirCtx.addColorStop(0, this.blendColor.value);
            this.blendDirCtx.addColorStop(1, this.blendToColor.value);

            for (i = 0; i < 2; i++) {
                this.fxSliders[i].previousElementSibling.innerHTML = this.fxSliders[i].value;
            }

            this.filtersLog(mainFilters, this.showLogs);

            /* --- Main Canavs Draw --- */
            if(this.webCamStatus == "stoped"){
                this.processCanvas(this.img);
            }
        },

        processCanvas: function(ImageInput) {
            this.ctx.fillStyle = this.blendDirCtx;
            this.ctx.fillRect(0,0, this.canvas.width, this.canvas.height);
            this.ctx.save();
            this.ctx.globalCompositeOperation = this.blendMix.value;
            this.ctx.filter = this.joinedFilters;
            this.ctx.drawImage(ImageInput, 0, 0, this.canvas.width, this.canvas.height);
            this.ctx.restore();

            if(this.currentFX.group == "Experimental") {
                try {
                    var imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);

                    this[this.presetFilters.value](
                        imageData,
                        this.currentFX.options,
                        [this.fxSliders[0].value, this.fxSliders[1].value, this.fxSliders[2].value]
                    );

                } catch(err) {
                    console.log(err);
                }
            }
        },

        webCamRun: function(){
            var thisParent = this;
            this.loop = function () {
                thisParent.processCanvas(thisParent.video);
                thisParent.reqFrameID = requestAnimationFrame(this.loop);
            }.bind(this);
            this.loop();
        },

        initWebCam: function(){
            var thisParent = this;
            if(thisParent.tracks){
                thisParent.tracks.forEach(function(track) {
                    if (track.readyState == 'live') {
                        track.stop(); thisParent.tracks = null;
                        window.cancelAnimationFrame(thisParent.reqFrameID);
                        thisParent.switchSource("stoped", thisParent.img, "base");
                    }
                });
            } else {                        
                if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                    navigator.mediaDevices.getUserMedia(thisParent.mediaConfig).then(function(stream) {
                        thisParent.video.srcObject = stream;
                        thisParent.tracks = stream.getTracks();
                        thisParent.video.play();
                        thisParent.switchSource("playing", thisParent.video, "chrome");
                    });
                }
            }
        },

        switchSource: function(status, origin, filter){
            this.webCam[0].className = "btn " + status;
            this.initPreset(filter);
            this.imgSource[0].style.display = (status == "playing") ? "none" : "inline-block";
            this.canvas.width = origin.width;
            this.canvas.height = origin.height;
            this.currentSource = origin;
        },

        filtersLog: function(mainFilters, showFilterLogs){
            var filtersOutput = document.getElementById("filtersOutput");
            if(showFilterLogs){
                filtersOutput.style.display = "block";
                filtersOutput.innerHTML = mainFilters + "<br>" + this.colorMatrix.getAttribute("values");
            } else {
                filtersOutput.style.display = "none";
            }
            localStorage.setItem("infraLogs", showFilterLogs);
        },

        savePreset: function(){
            this.openSavePreset.className = "modalDialog active";
            this.presetName.value = "";
        },

        saveFX: function(){
            var customSet = this.getFX();

            if(customSet.title){
                customFX = document.querySelectorAll('.custom');
                option = document.createElement( 'option' );
                option.value = customSet.name;
                option.text = customSet.title;
                customFX[0].appendChild(option);
                this.preFilters.push(customSet);

                localStorage.setItem("infrapic" + this.customSaveID, JSON.stringify(customSet));
                this.customSaveID+=1;

                this.openSavePreset.className = "modalDialog";
            } else {
                alert("Please enter Custom Preset name...");
            }            
        },

        getFX: function(){
            var customPreset = {
                group:"Custom", title: this.presetName.value, infrapic: "infrapic",
                name: this.presetName.value.replace(/[^a-z0-9]/gi,''), matrix: this.colorMatrix.getAttribute("values"),
                blend: this.blendMix.value, color: this.blendColor.value, tocolor: this.blendToColor.value, dir: this.blendDir.value
            }

            for (i = 0; i < this.filtersSliders.length; i++) {
                var fxValName = this.filtersSliders[i].getAttribute('data-fx');
                if(fxValName == "hue-rotate") { fxValName = "hue" }
                customPreset[fxValName] = this.filtersSliders[i].value;
            }
            return customPreset;
        },

        setPresetFilter: function(filterName){
            this.resetMixChannels(filterName);
            this.setFXSliders();
            this.resetFilters(filterName);
            this.updateFilter();
        },

        loadCustomPresets: function(){
            for (var i = 0; i < localStorage.length; i++){
                var customPreset = String(localStorage.getItem(localStorage.key(i)));
                if(customPreset.includes("infrapic")){
                    var pre = JSON.parse(customPreset);
                    customFX = document.querySelectorAll('.custom');
                    option = document.createElement( 'option' );
                    option.value = pre.name;
                    option.text = pre.title;
                    customFX[0].appendChild(option);
                    this.preFilters.push(pre);
                    this.customSaveID+=1;
                }
            }
        },

        resetFilters: function(filterName) {
            
            var thisParent = this;

            for (i = 0; i < this.preFilters.length; i++) {
                if(this.preFilters[i].name == filterName){

                    /* Css Fitlers */
                    this.filtersSliders.forEach(function(filterSlider) {

                        var thisFilter = filterSlider.getAttribute('data-fx');
                        var t = filterSlider;

                        if(thisFilter == "hue-rotate"){
                            t.value = thisParent.preFilters[i].hue || 0;
                        } else if(thisFilter == "saturate"){
                            t.value = thisParent.preFilters[i].saturate || 0;
                        } else if(thisFilter == "brightness"){
                            t.value = thisParent.preFilters[i].brightness || 0;
                        } else if(thisFilter == "contrast"){
                            t.value = thisParent.preFilters[i].contrast || 0;
                        } else if(thisFilter == "grayscale"){
                            t.value = thisParent.preFilters[i].grayscale || 0;
                        } else if(thisFilter == "sepia"){
                            t.value = thisParent.preFilters[i].sepia || 0;
                        }
                        filterSlider.previousElementSibling.innerHTML = t.value;
                        
                    });

                }
            }
        },

        resetMixChannels: function(filterName) {
            var thisParent = this;

            for (i = 0; i < this.preFilters.length; i++) {
                if(this.preFilters[i].name == filterName){

                    this.currentFX = this.preFilters[i];

                    if(!this.preFilters[i].hasOwnProperty('matrix')) {
                        this.preFilters[i].matrix = this.preFilters[0].matrix;
                    }

                    if(this.preFilters[i].hasOwnProperty('matrix')) {

                        var colorMatrix = document.getElementById("svgcolormatrix");
                        this.colorMatrix.setAttribute("values", this.preFilters[i].matrix);

                        /* Mix Channels */
                        var matrixArr = this.preFilters[i].matrix.split(" ");
                        var channelSliders = Array.apply(null, document.querySelectorAll('.mixChannels input[type="range"]'));

                        var arrPos = 0;
                        this.channelSliders.forEach(function(rangeSlider) {
                            var t = rangeSlider; t.value = matrixArr[arrPos] * 10;
                            rangeSlider.previousElementSibling.innerHTML = matrixArr[arrPos]; arrPos+=1;
                        });

                        var matrixNo = 0;
                        this.channelSliders.forEach(function(rangeSlider) {
                            var t = rangeSlider;
                            thisParent.colorMatrixObject[t.id] = matrixArr[matrixNo];
                            matrixNo += 1;
                        });
                    }

                    /* ---- Blend Color ---- */
                    this.blendColor.value = this.preFilters[i].color || "#E74C3C";
                    this.blendToColor.value = this.preFilters[i].tocolor || "#F1C40F";

                    /* ---- Blend Mode ---- */
                    this.blendMix.value = this.preFilters[i].blend;

                    /* ---- Blend Direction ---- */
                    this.blendDir.value = this.preFilters[i].dir;
                    

                }
                
            }
            
        },

        readURL: function(input){
            var thisParent = this;
            var ext = input.files[0]['name'].substring(input.files[0]['name'].lastIndexOf('.') + 1).toLowerCase();

            if (input.files && input.files[0] && (ext == "bmp" || ext == "svg" || ext == "tiff" || ext == "gif" || ext == "png" || ext == "jpeg" || ext == "jpg")) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    thisParent.resetFX();
                    thisParent.img.src = e.target.result;
                    document.getElementsByClassName('orgImage')[0].src = e.target.result;
                }

                reader.readAsDataURL(input.files[0]);

            } else {
                alert("Please select: BMP, GIF, JPEG, SVG, TIFF or PNG image file!");
            }

        },

        download: function(){
            var response = prompt("Give a name to Download image:", "infrapic");

            if (response == null || response == "") { } else {
                var download = document.getElementById("download");
                var image = document.getElementById("filteredImage").toDataURL("image/png")
                    .replace("image/png", "image/octet-stream");
                download.setAttribute("download", response + ".png");
                download.setAttribute("href", image);
            }

        },

        resetFX: function(){
            var resetBtns = Array.apply(null, document.querySelectorAll('form'));
            this.resetBtns.forEach(function(rstBtn) {
                rstBtn.reset();
            });
        },

        resetALL: function(elem){
            var thisParent = this;
            var resetType = elem.getAttribute('data-id');
            if(resetType == 'presetFilters'){
                this.resetMixChannels('base');
            }
            
            setTimeout(function(){

                thisParent.channelSliders.forEach(function(rangeSlider) {
                    var t = rangeSlider;
                    thisParent.updateMatrix(t.id, t.value / 10);
                    thisParent.onChannelRangeChange(rangeSlider)
                });

                
                thisParent.filtersSliders.forEach(function(rangeSlider) {
                    thisParent.onFiltersRangeChange(rangeSlider);
                });
                
                
                thisParent.updateFilter();

            }, 100);
        },

        remove_duplicates_es6: function(arr) {
            let s = new Set(arr);
            let it = s.values();
            return Array.from(it);
        },

        initPreset: function(filter){
            var thisParent = this;
            this.loadCustomPresets();
            this.presetFilters.value = filter;
            this.presetFilters.dispatchEvent(new Event("change"));
            setTimeout(function(){
                thisParent.updateFilter();
            });
        },

        changeSinContrast: function(par, opt) {
            var dPow = opt[1]; //4
            var iMid = opt[0]; //128
            if (par > 0 && par < iMid) {
                par = Math.sin( Math.PI * ((90-(par/dPow)) / 180)) * par;
            } else if (par >= iMid) {
                par = Math.sin( Math.PI * ((90-((256-par))/dPow)/180) ) * par;
            }
            return par;
        },

        pixelate: function(imageData, options, sliders){
            // get a block size (see demo for this approach)
            var size = sliders[0] / 100,
                w = this.canvas.width * size,
                h = this.canvas.height * size;

            // draw the original image at a fraction of the final size
            this.ctx.drawImage(this.currentSource, 0, 0, w, h);

            // turn off image aliasing
            this.ctx.msImageSmoothingEnabled = false;
            this.ctx.mozImageSmoothingEnabled = false;
            this.ctx.webkitImageSmoothingEnabled = false;
            this.ctx.imageSmoothingEnabled = false;

            // enlarge the minimized image to full size    
            this.ctx.drawImage(this.canvas, 0, 0, w, h, 0, 0, this.canvas.width, this.canvas.height);
        },

        flipImage: function(imageData, options, sliders){
            var data = imageData.data;
            var imgd2 = imageData;
            var data2 = imageData.data;

            for (var x = 0; x < imageData.width/2; x++) {
                for (var y = 0; y < imageData.height; y++) {

                    var i = (y*imageData.width + x);
                    var i2 = (y*imageData.width + ((imageData.width-1)-x));

                    var iP1 = data2[i*4];
                    var iP2 = data2[i*4+1];
                    var iP3 = data2[i*4+2];

                    data[i*4]   = data[i2*4]; // red
                    data[i*4+1] = data[i2*4+1]; // green
                    data[i*4+2] = data[i2*4+2]; // blue

                    data[i2*4]   = iP1; // red
                    data[i2*4+1] = iP2; // green
                    data[i2*4+2] = iP3; // blue
                }
            }

            this.ctx.putImageData(imageData, 0, 0);
        },

        hdreffect: function(imageData, options, sliders){
            // get current image data
            if(Array.isArray(options)){
                var iMid = options[0]; //128
                var dPow = options[1]; //3
                
                for (var i=0; i < imageData.data.length; i+=4) {
                    imageData.data[i+0] = this.changeSinContrast(imageData.data[i+0], sliders);
                    imageData.data[i+1] = this.changeSinContrast(imageData.data[i+1], sliders);
                    imageData.data[i+2] = this.changeSinContrast(imageData.data[i+2], sliders);
                }
            }

            // put image data back to context
            this.ctx.putImageData(imageData, 0, 0);
        },

        rgbsplit: function(imageData, options, sliders) {

            var rOffset = Number(sliders[0]),
                gOffset = Number(sliders[1]),
                bOffset = Number(sliders[2]);

            const arr = new Uint8ClampedArray(imageData.data);
            for (let i = 0; i < arr.length; i += 4) {
                arr[i + 0 + rOffset * 4] = imageData.data[i + 0]; // Red
                arr[i + 1 + gOffset * 4] = imageData.data[i + 1]; // Green
                arr[i + 2 + bOffset * 4] = imageData.data[i + 2]; // Blue
            }
            var imgData = new ImageData(arr, imageData.width, imageData.height);
            this.ctx.putImageData(imgData, 0, 0);
        },

        threshold: function(imageData, options, sliders) {
            var d = imageData.data;
            for (var i=0; i<d.length; i+=4) {
                var r = d[i];
                var g = d[i+1];
                var b = d[i+2];
                var v = (0.2126*r + 0.7152*g + 0.0722*b >= sliders[0]) ? 255 : 0;
                d[i] = d[i+1] = d[i+2] = v
            }
            this.ctx.putImageData(imageData, 0, 0);
        },

        sobel: function(imageData, options, sliders) {
            var vertical  = this.convolution(imageData, [-1, -2, -1, 0, 0, 0, 1, 2, 1]);
            var horizontal = this.convolution(imageData, [-1, 0, 1, -2, 0, 2, -1, 0, 1]);

            var final_image = this.createImageData(vertical.width, vertical.height);
            for (var i=0; i<final_image.data.length; i+=4) {
                // make the vertical gradient red
                var v = Math.abs(vertical.data[i]);
                final_image.data[i] = v;
                // make the horizontal gradient green
                var h = Math.abs(horizontal.data[i]);
                final_image.data[i+1] = h;
                // and mix in some blue for aesthetics
                final_image.data[i+2] = (v+h) / 4;
                final_image.data[i+3] = sliders[0]; // opaque alpha
            }

            this.ctx.putImageData(final_image, 0, 0);
        },

        laplace: function(imageData, options, sliders) {
            this.ctx.putImageData(this.convolution(imageData, options), 0, 0);
        },

        emboss: function(imageData, options, sliders) {
            var s = sliders[0];
            this.ctx.putImageData(this.convolution(imageData, [-2*s, -1*s, 0, -1*s, 1, 1*s, 0, 1*s, 2*s]), 0, 0);            
        },

        sharpen: function(imageData, options, sliders){
            var s = sliders[0];
            this.ctx.putImageData(this.convolution(imageData, [0, -1*s, 0, -1*s, 1 + 4*s, -1*s, 0, -1*s, 0]), 0, 0);
        },
        
        tiltshift: function(imageData, options, sliders) {

            var gradArr = [this.canvas.width / 2, 0, this.canvas.width / 2, this.canvas.height];
            if(this.linerDir){ gradArr = this.linerDir; };

            // draw image and get normal version
            var ptrnNormal = this.ctx.createPattern(this.canvas, "repeat");

            // get blurry version

            var r = 1, intensity = sliders[0];
            for( var i = 0, ii = 16; i < ii; i++) {
                var rNext = 1 - intensity * (i + 1) / ii;
                this.ctx.drawImage(this.canvas, 0, 0, this.canvas.width * r | 0, this.canvas.height * r | 0, 0, 0, this.canvas.width * rNext | 0, this.canvas.height * rNext | 0);
                r = rNext;
            }
            this.ctx.drawImage(this.canvas, 0, 0, this.canvas.width * r | 0, this.canvas.height * r | 0, 0, 0, this.canvas.width, this.canvas.height);
            var ptrnBlurry = this.ctx.createPattern(this.canvas, "repeat");

            this.canvas.width |= 0;
            var sizeCore = sliders[1],
                grd = this.ctx.createLinearGradient(gradArr[0], gradArr[1], gradArr[2], gradArr[3]);

            grd.addColorStop(0, "black");
            grd.addColorStop(sizeCore, "transparent");
            grd.addColorStop(sizeCore, "transparent");
            grd.addColorStop(1, "black");

            // paint the gradient/mask
            this.ctx.globalCompositeOperation = "source-over";
            this.ctx.fillStyle = grd;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            // blurry version in the gradient/mask
            this.ctx.fillStyle = ptrnBlurry;
            this.ctx.globalCompositeOperation = "source-in";
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            // normal version underneath
            this.ctx.fillStyle = ptrnNormal;
            this.ctx.globalCompositeOperation = "destination-atop";
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            // restore globalCompositeOperation
            this.ctx.globalCompositeOperation = "source-over";

        },

        convolution: function(imageData, weights) {
            var opaque = 1,
                side = Math.round(Math.sqrt(weights.length)),
                halfSide = Math.floor(side/2),
                src = imageData.data,
                sw = imageData.width,
                sh = imageData.height;
            // pad output by the convolution matrix
            var w = sw,
                h = sh,
                output = this.createImageData(w, h),
                dst = output.data;
            // go through the destination image pixels
            var alphaFac = opaque ? 1 : 0;
            for (var y=0; y<h; y++) {
                for (var x=0; x<w; x++) {
                    var sy = y;
                    var sx = x;
                    var dstOff = (y*w+x)*4;
                    // calculate the weighed sum of the source image pixels that
                    // fall under the convolution matrix
                    var r=0, g=0, b=0, a=0;
                    for (var cy=0; cy<side; cy++) {
                        for (var cx=0; cx<side; cx++) {
                            var scy = sy + cy - halfSide;
                            var scx = sx + cx - halfSide;
                            if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
                                var srcOff = (scy*sw+scx)*4;
                                var wt = weights[cy*side+cx];
                                r += src[srcOff] * wt;
                                g += src[srcOff+1] * wt;
                                b += src[srcOff+2] * wt;
                                a += src[srcOff+3] * wt;
                            }
                        }
                    }
                    dst[dstOff] = r;
                    dst[dstOff+1] = g;
                    dst[dstOff+2] = b;
                    dst[dstOff+3] = a + alphaFac*(255-a);
                }
            }

            return output;
        },

        grayscale: function(imageData, options) {
            var d = imageData.data;
            for (var i=0; i<d.length; i+=4) {
                var r = d[i];
                var g = d[i+1];
                var b = d[i+2];
                // CIE luminance for the RGB
                var v = 0.2126*r + 0.7152*g + 0.0722*b;
                d[i] = d[i+1] = d[i+2] = v
            }
            this.ctx.putImageData(imageData, 0, 0);
        },

        rgbAdjust: function(imageData, options, sliders) {
            var d = imageData.data;
            for (var i = 0; i < d.length; i +=4) {
                d[i] *= options[0];		//R
                d[i + 1] *= options[1];	//G
                d[i + 2] *= options[2];	//B
            }
            this.ctx.putImageData(this.convolution(imageData, options), 0, 0);
        },

        brightness: function(imageData, options, sliders) {
            var d = imageData.data;
            for (var i = 0; i < d.length; i += 4) {
                d[i] += options;
                d[i + 1] += options;
                d[i + 2] += options;
            }
            this.ctx.putImageData(imageData, 0, 0);
        },

        negative: function(imageData, options, sliders) {
            var pixels = imageData.data;
            for (var i = 0; i < pixels.length; i += 4) {
                pixels[i]   = sliders[0] - pixels[i];   // red
                pixels[i+1] = sliders[1] - pixels[i+1]; // green
                pixels[i+2] = sliders[2] - pixels[i+2]; // blue
                // i+3 is alpha (the fourth element)
            }
            this.ctx.putImageData(imageData, 0, 0);

            /*
            this.processor.postMessage({
                post: {
                    imageData: imageData,
                    filter: "negative",
                    options: options,
                    sliders: sliders
                }                
            });
            */
            
        },

        getAverageRGB: function(frame){
            const length = frame.data.length / 4;
            
            let r = 0;
            let g = 0;
            let b = 0;
          
            for (let i = 0; i < length; i++) {
                r += frame.data[i * 4 + 0];
                g += frame.data[i * 4 + 1];
                b += frame.data[i * 4 + 2];
            }

            return {
                r: r / length,
                g: g / length,
                b: b / length,
            };
        },

        ascii: function(imageData, options, sliders) {

            var width = this.canvas.width
                height = this.canvas.height,
                fontHeight = parseInt(sliders[0]),
                hiddenContext = this.hiddenCanvas.getContext('2d'),
                charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&()/\\+<>';

            if (width && height) {
                this.hiddenCanvas.width = width;
                this.hiddenCanvas.height = height;

                hiddenContext.drawImage(this.currentSource, 0, 0, width, height);

                this.ctx.textBaseline = 'top';
                this.ctx.font = `${fontHeight}px Consolas`;
            
                var text = this.ctx.measureText('@');
                var fontWidth = parseInt(text.width);

                //this.ctx.clearRect(0, 0, width, height);

                for (let y = 0; y < height; y += fontHeight) {
                    for (let x = 0; x < width; x += fontWidth) {
                        const frameSection = hiddenContext.getImageData(x, y, fontWidth, fontHeight);
                        const { r, g, b } = this.getAverageRGB(frameSection);
                        const randomCharacter = charset[Math.floor(Math.random() * charset.length)];
                
                        this.ctx.fillStyle = `rgb(${r},${g},${b})`;
                        
                        // this.ctx.fillRect(x, y, fontWidth, fontHeight);
                        this.ctx.fillText(randomCharacter, x, y);

                    }
                }
            }

        },

        shapeBlend: function(imageData, options, sliders) {

            var width = this.canvas.width
                height = this.canvas.height,
                shapeSize = parseInt(sliders[0]),
                hiddenContext = this.hiddenCanvas.getContext('2d'),
                charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&()/\\+<>';

            if (width && height) {
                this.hiddenCanvas.width = width;
                this.hiddenCanvas.height = height;

                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

                hiddenContext.fillStyle = this.blendDirCtx;
                hiddenContext.fillRect(0,0, this.canvas.width, this.canvas.height);
                hiddenContext.globalCompositeOperation = this.blendMix.value;
                hiddenContext.filter = this.joinedFilters;
                hiddenContext.drawImage(this.currentSource, 0, 0, width, height);
                
                for (let y = 0; y < height; y += shapeSize) {
                    for (let x = 0; x < width; x += shapeSize) {
                        const frameSection = hiddenContext.getImageData(x, y, shapeSize, shapeSize);
                        const { r, g, b } = this.getAverageRGB(frameSection);
                
                        var sSize = parseInt(sliders[0] / 2);
                        this.ctx.fillStyle = `rgb(${r},${g},${b})`;
                        this.ctx.beginPath();
                        this.ctx.arc(x + sSize, y + sSize, sSize, 0, 2 * Math.PI);
                        this.ctx.fill();
                    }
                }
            }

        },

        popart: function(imageData, options, sliders) {

            var picSizeX = this.canvas.width / sliders[0],
                picSizeY = this.canvas.height / sliders[0];

            this.ctx.fillStyle = this.blendDirCtx;
            this.ctx.fillRect(0,0, this.canvas.width, this.canvas.height);
            this.ctx.globalCompositeOperation = this.blendMix.value;
            this.ctx.filter = this.joinedFilters;

            for (y = 0; y < this.canvas.height; y += picSizeY) {
                for (x = 0; x < this.canvas.width; x += picSizeX) {
                    this.ctx.drawImage(this.currentSource, x,  y, picSizeX, picSizeY);
                }
            }

        },

        createImageData: function(w,h){
            return this.canvas.getContext('2d').createImageData(w,h);
        }

    };
    return infra;
}