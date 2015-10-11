(function(global) {

    // the callback for the Google Maps API request
    global.initMap = function() {

        // initial coords for the map
        var mapData = {

            // where 40 splits into I40 and Business-40
            center: {
                lat: 36.098344,
                lng: -80.015482
            },
            zoom: 12
        };

        // creates map object
        panorama = new google.maps.StreetViewPanorama(document.getElementById('street-view'));
        map = new google.maps.Map(document.getElementById('map'), mapData);
        sv = new google.maps.StreetViewService();
        // starts rest of app once the map is created
        start();

    }

    // houses the application so it could be invoked after the initMap callback is invoked
    var start = function(){

        // the starting marker data - the Model
        // TODO: Pass coords through StreetViewService which will return approx coords that have StreetViews assoicated with them
        var markerDataArr = [

            {
                title: "Regal Cinemas - Palladium",
                position: {
                    lat: 36.0347243,
                    lng: -79.9616307
                }
            },
            {
                title: "Piedmont Triad Internationl Airport",
                position: {
                    lat: 36.0867525,
                    lng: -79.9639517
                }
            },
            {
                title: "Deep River Golf Range",
                position: {
                    lat: 36.0477767,
                    lng: -79.964792
                }
            }
        ];



        function Controller(data){

            this.markersData = data;
        }

        Controller.prototype = {

            // initialize the listeners for map related events
            initMapListeners: function(){
                var self = this;
                map.addListener('click', function(e) {
                    var marker = self.addMarker(e.latLng, map);


                });
            },

            initMarkers: function(){

                var self = this;
                var markers = [];
                var n = self.markersData.length;

                self.markersData.forEach(function(item){

                    var mapMarker;

                    sv.getPanorama({ location: item.position, radius: 250 }, function(data,status){

                        n--;
                        var _m = pano.service.processSVData(data,status);
                        var marker = new Marker(data.location.description, _m, panorama);
                        marker = ko.observable(marker);
                        markers.push(marker);

                        if (n === 0){
                            self.markersVM = new MarkersViewModel(markers);
                            ko.applyBindings(self.markersVM);
                        }
                    });
                });
            },

            init: function(){
                this.initMapListeners();
                this.initMarkers();

            },

            addMarker: function(latLng, map) {

                var self = this;

                sv.getPanorama({ location: latLng, radius: 250 }, function(data,status){


                    var m = pano.service.processSVData(data,status);

                    var marker = new Marker(data.location.description,m,panorama);

                    self.markersVM.markers.push(ko.observable(marker));


                });

                //map.panTo(latLng);

            }



        }

        function MarkersViewModel(markers){

            var self = this;

            this.markers = ko.observableArray(markers);

            this.inputSelected = ko.observable(false);
            this.editingMarker = false;
            this.clickedMarker;
            this.clickedElement;


            this.editTitle = function(marker){
                console.log("Editing Title");
                if (!self.inputSelected() && !self.editingMarker){
                    marker.readyToEdit(false);
                    self.inputSelected(true);
                    self.editingMarker = true;
                }
            };

            this.doneEditing = function(marker, event){
                var title = marker.title();

                if(event.keyCode == 13){
                    self.editingMarker = false;
                    self.inputSelected(false);
                    marker.readyToEdit(!(marker.readyToEdit()));
                }

                else{
                    title += String.fromCharCode(event.keyCode);
                    marker.title(title);
                }
            };

            this.showPanorama = function(marker, event){


                if (self.clickedMarker === marker){

                    self.clickedElement.toggleClass("li-select").toggleClass("li-unselect");
                    $("#street-view").toggleClass("hide");

                }
                else {
                    $("#street-view").removeClass("hide");
                    self.clickedMarker = marker;

                    if ((self.clickedElement) && self.clickedElement.hasClass("li-select"))
                        self.clickedElement.toggleClass("li-select").toggleClass("li-unselect");

                    $(event.target).toggleClass("li-select").toggleClass("li-unselect");

                    pano.service.showPano(self.clickedMarker.mapMarker.panoID);
                    console.log(self.clickedMarker.mapMarker.panoID);

                    self.clickedElement = $(event.target);
                }


            }
        }

        var pano = {

            service: {

                showPano: function(panoID){
                    panorama.setPano(panoID);
                    panorama.setPov({
                        heading: 270,
                        pitch: 0
                    });
                    panorama.setVisible(true);

                },
                processSVData: function(data,status){
                    if (status === google.maps.StreetViewStatus.OK) {



                        marker = new google.maps.Marker({
                            position: data.location.latLng,
                            map: map,
                            title: data.location.description,
                            panoID: data.location.pano,
                        });

                        marker.addListener('click', function() {
                            $("#street-view").removeClass("hide");
                            // Set the Pano to use the passed panoID.

                            pano.service.showPano(this.panoID);

                        });


                    } else {
                        console.error('Street View data not found for this location.');
                    }

                    return marker;
                }
            }
        }

        function Marker(title, mapMarker){
            this.title = ko.observable(title) || ko.observale("No Title");
            this.mapMarker = mapMarker;
            this.readyToEdit = ko.observable(true);

        };


        var ctrl = new Controller(markerDataArr);
        ctrl.init();

    }


}(window));

