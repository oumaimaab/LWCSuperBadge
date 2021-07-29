/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-expressions */
import { LightningElement, wire, api, track } from "lwc";
import BOATMC from "@salesforce/messageChannel/BoatMessageChannel__c";
import getBoats from "@salesforce/apex/BoatDataService.getBoats";
import { publish, MessageContext } from "lightning/messageService";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { updateRecord } from "lightning/uiRecordApi";
import { refreshApex } from "@salesforce/apex";
import updateBoatList from "@salesforce/apex/BoatDataService.updateBoatList";

const columns = [
    { label: "Name", fieldName: "Name", editable: true },
    { label: "Length", fieldName: "Length__c", editable: true },
    { label: "Price", fieldName: "Price__c", type: "currency", editable: true },
    { label: "Description", fieldName: "Description__c", editable: true }
];

const SUCCESS_TITLE = "Success";
const MESSAGE_SHIP_IT = "Ship it!";
const SUCCESS_VARIANT = "success";
const ERROR_TITLE = "Error";
const ERROR_VARIANT = "error";
const CONST_ERROR = "An error has occured";
export default class BoatSearchResults extends LightningElement {
    data = [];
    columns = columns;
    rowOffset = 0;
    subscription = null;
    @track boatTypeId;
    @track boats;
    error = undefined;
    isLoading = false;
    @track draftValues = [];
    @wire(MessageContext)
    messageContext;

    @wire(getBoats, { boatTypeId: "$boatTypeId" })
    wiredBoats({ error, data }) {
        if (data) {
            this.boats = data;
            this.isLoading = false;
            this.notifyLoading(this.isLoading);
        } else if (error) {
            this.boats = undefined;
            this.error = error;
        }
    }
    updateSelectedTile(event) {
        this.selectedBoatId = event.detail.boatId;
        this.sendMessageService(this.selectedBoatId);
    }
    @api
    async refresh() {
        this.isLoading = true;
        await refreshApex(this.boats);
        this.notifyLoading(false);
    }

    @api
    searchBoats(boatTypeId) {
        this.isLoading = true;
        this.notifyLoading(this.isLoading);
        this.boatTypeId = boatTypeId;
    }
    handleSave(event) {
        // notify loading
        this.isLoading = true;
        this.notifyLoading(this.isLoading);
        const updatedFields = event.detail.draftValues;
        const recordInputs = this.updatedFields.slice().map((draft) => {
            const fields = Object.assign({}, draft);
            return { fields };
        });
        console.log(JSON.stringify(recordInputs));
        const promises = recordInputs.map((recordInput) =>
            updateRecord(recordInput)
        );
        Promise.all(promises)
            .then((res) => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: SUCCESS_TITLE,
                        message: MESSAGE_SHIP_IT,
                        variant: SUCCESS_VARIANT
                    })
                );
                this.draftValues = [];
                return this.refresh();
            })
            .catch((error) => {
                this.error = error;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: ERROR_TITLE,
                        message: CONST_ERROR,
                        variant: ERROR_VARIANT
                    })
                );
                this.notifyLoading(false);
            })
            .finally(() => {
                this.draftValues = [];
            });
        // Update the records via Apex
        // updateBoatList({data: updatedFields})
        // .then(() => {})
        // .catch(error => {})
        // .finally(() => {});
    }

    notifyLoading(isLoading) {
        // isLoading
        //   ? dispatchEvent(new CustomEvent("loading"))
        //   : dispatchEvent( CustomEvent("doneloading"));

        if (isLoading) {
            this.dispatchEvent(new CustomEvent("loading"));
        } else {
            this.dispatchEvent(CustomEvent("doneloading"));
        }
    }
    sendMessageService(boatId) {
        publish(this.messageContext, BOATMC, { recordId: boatId });
    }
}