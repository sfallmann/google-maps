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
                title: "Regal Cinems - Palladium",
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

        var controller = function(){



        }

        function MarkersViewModel(initData){
            var self = this;

            this.initData = initData;

            self.markers = ko.observableArray();




            self.inputSelected = ko.observable(false);
            self.editingMarker = false;
            self.clickedMarker;
            self.clickedElement;

            self.editTitle = function(marker){
                if (!self.inputSelected() && !self.editingMarker){
                    marker.readyToEdit(false);
                    self.inputSelected(true);
                    self.editingMarker = true;
                }
            };

            self.doneEditing = function(marker, event){
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

            self.showPanorama = function(marker, event){

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

            };

        }


        MarkersViewModel.prototype = {

            init: function(){

                var self = this;
                this.sv = new google.maps.StreetViewService();

                self.initData.forEach(function(item){
                    item.map = map;
                    console.log(self.sv);
                    var mapMarker = new google.maps.Marker(item);

                    self.sv.getPanorama({ location: markerData.position }, processSVData);

                    var panorama = new google.maps.StreetViewPanorama(
                        document.getElementById('street-view'),
                        {
                            position: item.position   ,
                            pov: {heading: 165, pitch: 0},
                            zoom: 1,
                            visible: false
                        }
                    );

                    var marker = new Marker(item.title, mapMarker, panorama);
                    self.markers.push(ko.observable(marker));
                });

            }

        }


        map.addListener('click', function(e) {
            placeMarkerAndPanTo(e.latLng, map);
        });





        function processSVData(data, status){
            console.log(data, status);
        }

        function placeMarkerAndPanTo(latLng, map) {

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
            markers.push(ko.observable(marker));

            map.panTo(latLng);
        }


        function Marker(title, mapMarker, panorama){
            this.title = ko.observable(title) || ko.observale("No Title");
            this.mapMarker = mapMarker;
            this.readyToEdit = ko.observable(true);
            this.panorama = panorama;

        };




        var markersViewModel = new MarkersViewModel();

        ko.applyBindings(markersViewModel);

    }


}(window));

