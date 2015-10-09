


(function(global) {

    var mapData = {

        // where 40 splits into I40 and Business-40
        center: {
            lat: 36.098344,
            lng: -80.015482
        },
        zoom: 12
    };

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

    var markers = ko.observableArray();

    global.initMap = function() {
        map = new google.maps.Map(document.getElementById('map'), mapData);

        map.addListener('click', function(e) {
            placeMarkerAndPanTo(e.latLng, map);
        });


        markerDataArr.forEach(function(markerData){
            markerData.map = map;

            var mapMarker = new google.maps.Marker(markerData);

            /*
            var panorama = new google.maps.StreetViewPanorama(
                document.getElementById('street-view'),
                {
                position: markerData.position,
                zoom: 1,
                visible: false
            });
            */

            var panorama = new google.maps.StreetViewPanorama(
                document.getElementById('street-view'),
                {
                    position: markerData.position   ,
                    pov: {heading: 165, pitch: 0},
                    zoom: 1,
                    visible: false
                }
            );

            console.log(markerData.position.lat);


            //panorama.setVisible(false);

            var marker = new Marker(markerData.title, mapMarker, panorama);
            markers.push(ko.observable(marker));
        });

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


    function MarkersViewModel(){
        var self = this;

        self.markers = markers;
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

    var markersViewModel = new MarkersViewModel();

    ko.applyBindings(markersViewModel);

}(window));

