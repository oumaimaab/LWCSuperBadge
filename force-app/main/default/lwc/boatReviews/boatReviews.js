import { LightningElement,api,track } from 'lwc';
import getAllReviews from '@salesforce/apex/BoatDataService.getAllReviews';
import { NavigationMixin } from 'lightning/navigation';

// imports
export default class BoatReviews extends NavigationMixin(LightningElement) {
    // Private
    @track boatId;
    @track error;
    @track boatReviews;
    isLoading;
    
    // Getter and Setter to allow for logic to run on recordId change
    @api
    get recordId() { 
        return this.boatId;
    }
    set recordId(value) {
      //sets boatId attribute
      this.setAttribute('boatId',value);
      //sets boatId assignment
      this.boatId = value;
      //get reviews associated with boatId
      this.getReviews();
    }
    
    // Getter to determine if there are reviews to display
    @api
    get reviewsToShow() {
        return this.boatReviews;
     }
    
    // Public method to force a refresh of the reviews invoking getReviews
    @api
    refresh() {
        this.getReviews();
     }
    
    // Imperative Apex call to get reviews for given boat
    // returns immediately if boatId is empty or null
    // sets isLoading to true during the process and false when it’s completed
    // Gets all the boatReviews from the result, checking for errors.

    getReviews() {
        if (!this.boatId) {
            return;
        }
        this.isLoading = true;
        getAllReviews({boatId:this.boatId}).then(
            reviews =>{
                this.boatReviews = reviews;
                this.isLoading = false
            }
        ).catch(error => {
            this.error = error;
        });
     }
    
    // Helper method to use NavigationMixin to navigate to a given record on click
    navigateToRecord(event) { 
        event.preventDefault();
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.recordId,
                objectApiName: 'User',
                actionName: 'view'
            }
        });
     }
  }
  