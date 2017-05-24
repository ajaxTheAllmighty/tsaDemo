'use strict';
var m = require('mithril');
module.exports = function (config) {
    var _myMap;
    var _point;
    var mapContainer = config.mapContainer;
    var onPointMove = config.onPointMove;
    var onMapClick = config.onMapClick;

    var Model = {
        latitude: '',
        longitude: '',
        name: '',
        address: {
            country: '',
            admArea: '',
            city: '',
            street: '',
            house: ''
        }
    }

    function checkCoordinate($coordinate) {
        if(isNaN($coordinate) || $coordinate === false || $coordinate == null || $coordinate == 0 || $coordinate == ''){
            return false;
        }
        return true;
    }

    function getYandexAddressByCoordinates(callback){
        ymaps.geocode([Model.latitude, Model.longitude]).then(function (res) {
            var firstGeoObject = res.geoObjects.get(0);
            var GeocoderMetaData = firstGeoObject.properties.get('metaDataProperty').GeocoderMetaData;
            var country = '',
                admArea = '',
                city = '',
                street = '',
                house = '';
            //build address
            function searchAddress($object){
                for(var prop in $object){
                    if(prop == 'PremiseNumber'){
                        house = $object[prop];
                    }
                    if(prop == 'ThoroughfareName'){
                        if(street == ''){
                            street = $object[prop];
                        }else{
                            street += ', ' + $object[prop];
                        }
                    }

                    if(prop == "DependentLocalityName"){
                        street = $object[prop];
                    }

                    if(prop == 'CountryName'){
                        country = $object[prop];
                    }
                    if(prop == 'LocalityName'){
                        city = $object[prop];
                    }
                    if(prop == 'AdministrativeAreaName'){
                        admArea = $object[prop];
                    }

                    if (typeof($object[prop]) == "object"){
                        searchAddress($object[prop]);
                    }
                }
            }
            searchAddress(GeocoderMetaData);
            callback({country: country, admArea: admArea, city: city, street: street, house: house});
        });
    }

    function drawPoint(config){
        Model.latitude = config.latitude;
        Model.longitude = config.longitude;
        Model.name = config.name;

        _myMap.setCenter([Model.latitude, Model.longitude]);
        _myMap.setZoom(15);
        _point = new ymaps.Placemark([Model.latitude, Model.longitude], {
            iconContent: '"' + Model.name + '"'
        }, {
            draggable: true,
            preset: 'islands#blackStretchyIcon'
        });

        _point.events.add('dragend', function (e) {
            var newCoordinates = _point.geometry.getCoordinates();
            Model.latitude = newCoordinates[0];
            Model.longitude = newCoordinates[1];
            onPointMove({latitude: Model.latitude, longitude: Model.longitude});
        });

        _myMap.geoObjects.add(_point);
    }

    function setPointCoordinate(config, callback){
        Model.latitude = config.latitude;
        Model.longitude = config.longitude;
        _point.geometry.setCoordinates([config.latitude, config.longitude]);
        getYandexAddressByCoordinates(callback);
    }

    function searchByYandex(address, callback){
        var searchResults = [];
        var searchControl = _myMap.controls.get('searchControl');
        searchControl.events.add('resultselect', function (event) {
            var index = event.get('index');
            var result = searchResults[index];
            var searchedCoordinates = result.geometry.getCoordinates();
            callback({
                latitude: searchedCoordinates[0],
                longitude: searchedCoordinates[1]
            })
        });
        searchControl.search(address).then(function(){
            searchResults = searchControl.getResultsArray();
        });
    }

    function init(){
        _myMap = new ymaps.Map(mapContainer,{center: [43.24,76.93], zoom: 13});
        var searchControl = _myMap.controls.get('searchControl');
        searchControl.options.set('noPlacemark', true);

        _myMap.events.add('click', function (e) {
            var coordinates = e.get('coords');
            onMapClick({
                latitude: coordinates[0],
                longitude: coordinates[1]
            })
        })
    }

    return {
        init: init,
        checkCoordinate: checkCoordinate,
        drawPoint: drawPoint,
        setPointCoordinate: setPointCoordinate,
        getYandexAddressByCoordinates: getYandexAddressByCoordinates,
        searchByYandex: searchByYandex,
        getSearchControl: function(){
            return _myMap.controls.get('searchControl');
        }
    }
};