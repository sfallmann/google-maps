


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
            title: "Progressive Business Media",
            position: {
                lat: 36.073982,
                lng: -79.950307
            }
        },
        {
            title: "Piedmont Triad Internationl Airport",
            position: {
                lat: 36.0999608,
                lng: -79.9647609
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

    function Marker(title, mapMarker, panorama){
        this.title = ko.observable(title) || ko.observale("No Title");
        this.mapMarker = mapMarker;
        this.readyToEdit = ko.observable(true);
        this.panorama = panorama;

    };

    var markers = ko.observableArray();

    global.initMap = function() {
        map = new google.maps.Map(document.getElementById('map'), mapData);

        map.addListener('click', function(e) {
            placeMarkerAndPanTo(e.latLng, map);
        });


        markerDataArr.forEach(function(markerData){
            markerData.map = map;

            var mapMarker = new google.maps.Marker(markerData);
            var panorama = map.getStreetView();
            //panorama.setPosition(markerData);

            var marker = new Marker(markerData.title, mapMarker, "" );
            markers.push(ko.observable(marker));
        });
        console.log(markers());
    }

    function placeMarkerAndPanTo(latLng, map) {

        if (markers().length < 9){
            var mapMarker = new google.maps.Marker({
                position: latLng,
                map: map
            });

            var marker = new Marker("No Title", mapMarker);
            markers.push(ko.observable(marker));

            map.panTo(latLng);
        }
        else{
            alert( " There can only be 8 markers in the list! ");
        }
    }


    function MarkersViewModel(){
        var self = this;

        self.markers = markers;
        self.inputSelected = ko.observable(false);

        self.editTitle = function(marker){

            marker.readyToEdit(!(marker.readyToEdit()));
            self.inputSelected(true);
        };

        self.doneEditing = function(marker, event){
            var title = marker.title();

            if(event.keyCode == 13){
                self.inputSelected(false);
                marker.readyToEdit(!(marker.readyToEdit()));
            }

            else{
                title += String.fromCharCode(event.keyCode);
                marker.title(title);
            }
        };

    }

    ko.applyBindings(new MarkersViewModel());

}(window));

