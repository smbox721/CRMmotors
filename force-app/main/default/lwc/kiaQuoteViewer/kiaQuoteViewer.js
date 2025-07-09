import { LightningElement, api, wire, track } from 'lwc';
// Apex 컨트롤러의 getQuoteDetails 메소드를 import 합니다.
import getQuoteDetails from '@salesforce/apex/QuoteController.getQuoteDetails';

export default class KiaQuoteViewer extends LightningElement {
    // Opportunity 페이지에서 레코드 ID를 자동으로 받아옵니다.
    @api recordId;
    @track quoteData;
    error;

    // recordId가 변경될 때마다, Apex 메소드를 자동으로 호출하여 데이터를 가져옵니다.
    @wire(getQuoteDetails, { opportunityId: '$recordId' })
    wiredQuoteData({ error, data }) {
        if (data) {
            this.quoteData = data;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.quoteData = undefined;
        }
    }

    // 아래는 HTML에서 데이터를 쉽게 사용하기 위한 getter(계산 속성)들입니다.
    get baseCar() {
        return (this.quoteData && this.quoteData.lineItems) ? this.quoteData.lineItems[0] : null;
    }
    get baseCarName() {
        return this.baseCar ? this.baseCar.PricebookEntry.Product2.Name : '';
    }
    get baseCarPrice() {
        return this.baseCar ? this.baseCar.TotalPrice : 0;
    }
    get options() {
        return (this.quoteData && this.quoteData.lineItems && this.quoteData.lineItems.length > 1) ? this.quoteData.lineItems.slice(1) : [];
    }
    get opportunityAmount() {
         return this.quoteData ? this.quoteData.opportunity.Amount : 0;
    }
    get exteriorColor() {
        return this.quoteData ? this.quoteData.opportunity.Exterior_Color__c : '';
    }
    get interiorColor() {
        return this.quoteData ? this.quoteData.opportunity.Interior_Color__c : '';
    }
    get shippingFee() {
        return this.quoteData ? this.quoteData.opportunity.Shipping_Fee__c : 0;
    }
    get registrationFee() {
        return this.quoteData ? this.quoteData.opportunity.Registration_Fee__c : 0;
    }
    get totalPurchaseCost() {
        const oppAmount = this.opportunityAmount || 0;
        const shipping = this.shippingFee || 0;
        const registration = this.registrationFee || 0;
        return oppAmount + shipping + registration;
    }
}