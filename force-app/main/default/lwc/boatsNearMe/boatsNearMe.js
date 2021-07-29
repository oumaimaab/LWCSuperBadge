/* eslint-disable no-unused-expressions */
import { LightningElement, track, wire, api } from "lwc";
import getBoatsByLocation from "@salesforce/apex/BoatDataService.getBoatsByLocation";
import { ShowToastEvent } from "lightning/platformShowToastEvent";


// imports
const LABEL_YOU_ARE_HERE = "You are here!";
const ICON_STANDARD_USER = "standard:user";
const ERROR_TITLE = "Error loading Boats Near Me";
const ERROR_VARIANT = "error";
export default class BoatsNearMe extends LightningElement {
  @api boatTypeId;
  @track mapMarkers = [];
  @track isLoading = true;
  @track isRendered = false;
  latitude;
  longitude;

  // Add the wired method from the Apex Class
  // Name it getBoatsByLocation, and use latitude, longitude and boatTypeId
  // Handle the result and calls createMapMarkers
  @wire(getBoatsByLocation, {
    latitude: "$latitude",
    longitude: "$longitude",
    boatTypeId: "$boatTypeId"
  })
  wiredBoatsJSON({ error, data }) {
    // let boats = JSON.deserialize(data, String.class);
    if (data) {
      this.createMapMarkers(JSON.parse(data));
      this.isLoading = false;
    } else if (error) {
      console.log(error);
      const evt = new ShowToastEvent({
        title: ERROR_TITLE,
        message: LABEL_YOU_ARE_HERE,
        variant: ERROR_VARIANT
      });
      this.dispatchEvent(evt);
    }
  }

  // Controls the isRendered property
  // Calls getLocationFromBrowser()
  renderedCallback() {
    if (this.isRendered === false) {
      this.getLocationFromBrowser();
    }
    this.isRendered = true;
  }

  // Gets the location from the Browser
  // position => {latitude and longitude}
  getLocationFromBrowser() {
    navigator.geolocation.getCurrentPosition((position) => {
      this.latitude = position.coords.latitude;
      this.longitude = position.coords.longitude;
    });
  }

  // Creates the map markers
  createMapMarkers(boatData) {
    this.mapMarkers = boatData.map((boatReloaded) => {
      return {
        location: {
          Latitude: boatReloaded.Geolocation__Latitude__s,
          Longitude: boatReloaded.Geolocation__Longitude__s
        },
        title: boatReloaded.Name
      };
    });
    this.mapMarkers.unshift({
      location: {
        Latitude: this.latitude,
        Longitude: this.longitude
      },
      title: LABEL_YOU_ARE_HERE,
      icon: ICON_STANDARD_USER
    });
    this.isLoading = false;
    // console.log(this.latitude + "" + this.longitude);

    // const newMarkers = boatData.map(boat => {...});
    // newMarkers.unshift({...});
  }
}
