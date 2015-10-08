
(function(global) {



        global.initMap = function() {
        map = new google.maps.Map(document.getElementById('map'), {
            center: {
                lat: 36.098344,
                lng: -80.015482
            },
            zoom: 12


        });

        var marker = new google.maps.Marker({
            position: {
                lat: 36.073982,
                lng: -79.950307
            },
            map: map,
            title: 'Progressive Business Media'

        });

    }
}(window));

