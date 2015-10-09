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
            this.markersVM;

            this.sv = new google.maps.StreetViewService();


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


                self.markersData.forEach(function(item){
                    item.map = map;

                    var mapMarker = new google.maps.Marker(item);

                    console.log(self.sv.getPanorama({ location: item.position, radius: 500 }, processSVData));




                    var marker = new Marker(item.title, mapMarker, panorama);
                    markers.push(ko.observable(marker));
                });

                return markers;

            },

            init: function(){
                this.initMapListeners();
                this.markersVM = new MarkersViewModel(this.initMarkers());
                ko.applyBindings(this.markersVM);
                console.log(this.markersVM);
            },

            addMarker: function(latLng, map) {

                var mapMarker = new google.maps.Marker({
                    position: latLng,
                    map: map
                });

                var panorama = new google.maps.StreetViewPanorama(
                    document.getElementById('street-view'),
                    {
                        position: latLng,
                        pov: {heading: 165, pitch: 0},
                        zoom: 1,
                        visible: false
                    }
                );

                var marker = new Marker("No Title", mapMarker, panorama);
                this.markersVM.markers.push(ko.observable(marker));

                map.panTo(latLng);

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
                console.log(self);
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

                $("#street-view").removeClass("hide");

                if ((self.clickedMarker) &&  self.clickedMarker !== marker){
                    self.clickedMarker.panorama.setVisible(false);
                    self.clickedElement.toggleClass("btn-primary").toggleClass("btn-success");
                }

                if (self.clickedMarker !== marker){

                    $(event.target).toggleClass("btn-primary").toggleClass("btn-success");
                    marker.panorama.setVisible(true);

                    self.clickedElement = $(event.target);
                    self.clickedMarker = marker;
                }

            }
        }


        function processSVData(data, status) {


            var marker;

            if (status === google.maps.StreetViewStatus.OK) {

                marker = new google.maps.Marker({
                    position: data.location.latLng,
                    map: map,
                    title: data.location.description
                });

                panorama.setPano(data.location.pano);
                panorama.setPov({
                    heading: 270,
                    pitch: 0
                });
                panorama.setVisible(true);

                marker.addListener('click', function() {
                    var markerPanoID = data.location.pano;
                    // Set the Pano to use the passed panoID.
                    panorama.setPano(markerPanoID);
                    panorama.setPov({
                        heading: 270,
                        pitch: 0
                    });
                    panorama.setVisible(true);
                });
            } else {
                console.error('Street View data not found for this location.');
            }

            console.log(marker, panorama);
            var mp =  {marker: marker, panorama: panorama};
            return mp;

        }


        function Marker(title, mapMarker, panorama){
            this.title = ko.observable(title) || ko.observale("No Title");
            this.mapMarker = mapMarker;
            this.readyToEdit = ko.observable(true);
            this.panorama = panorama;

        };


        var ctrl = new Controller(markerDataArr);
        ctrl.init();


    }


}(window));

