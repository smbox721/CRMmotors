import { LightningElement, api, wire, track } from 'lwc';
import getProductsByFamily from '@salesforce/apex/ProductConfiguratorController.getProductsByFamily';
import getProductsByParent from '@salesforce/apex/ProductConfiguratorController.getProductsByParent';
import createOppLineItems from '@salesforce/apex/ProductConfiguratorController.createOppLineItems';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ProductConfigurator extends LightningElement {
    @api recordId; // 기회(Opportunity)의 ID를 자동으로 받아옵니다.
    currentStep = 'step1';
    isSaving = false;

    // 선택된 값들을 저장할 변수
    selectedModelId;
    selectedTrimId;
    @track selectedOptionIds = [];

    // 데이터를 담을 변수
    baseModelOptions;
    trimOptions;
    optionOptions;

    // 1단계: '기본 모델' 제품군을 가진 제품 목록을 가져옵니다.
    @wire(getProductsByFamily, { family: '기본 모델' })
    wiredBaseModels({ error, data }) {
        if (data) {
            this.baseModelOptions = data.map(item => ({ label: item.Name, value: item.Id }));
        } else if (error) { this.handleError(error); }
    }

    // 2단계: 선택된 모델에 따른 '트림' 목록을 가져옵니다.
    @wire(getProductsByParent, { parentProductId: '$selectedModelId', family: '트림' })
    wiredTrims({ error, data }) {
        if (data) {
            this.trimOptions = data.map(item => ({ label: item.Name, value: item.Id }));
        } else if (error) { this.handleError(error); }
    }
    
    // 4단계: 선택된 트림에 따른 '옵션' 목록을 가져옵니다.
    @wire(getProductsByParent, { parentProductId: '$selectedTrimId', family: '옵션' })
    wiredOptions({ error, data }) {
        if (data) {
            this.optionOptions = data.map(item => ({ label: item.Name, value: item.Id }));
        } else if (error) { this.handleError(error); }
    }

    // 각 단계인지 확인하는 getter
    get isStep1() { return this.currentStep === 'step1'; }
    get isStep2() { return this.currentStep === 'step2'; }
    get isStep3() { return this.currentStep === 'step3'; }
    get isStep4() { return this.currentStep === 'step4'; }
    get isStep5() { return this.currentStep === 'step5'; }
    get currentStepValue() { return this.currentStep; }


    // 선택 처리 로직
    handleSelection(event) {
        if (event.target.name === 'baseModels') {
            this.selectedModelId = event.detail.value;
        } else if (event.target.name === 'trims') {
            this.selectedTrimId = event.detail.value;
        }
    }
    handleOptionSelection(event){
        this.selectedOptionIds = event.detail.value;
    }

    // 다음/이전 버튼 로직
    handleNext() {
        if (this.currentStep === 'step1') this.currentStep = 'step2';
        else if (this.currentStep === 'step2') this.currentStep = 'step3';
        else if (this.currentStep === 'step3') this.currentStep = 'step4';
        else if (this.currentStep === 'step4') this.currentStep = 'step5';
    }

    handlePrevious() {
        if (this.currentStep === 'step5') this.currentStep = 'step4';
        else if (this.currentStep === 'step4') this.currentStep = 'step3';
        else if (this.currentStep === 'step3') this.currentStep = 'step2';
        else if (this.currentStep === 'step2') this.currentStep = 'step1';
    }

    // 최종 저장 로직
    handleSave() {
        this.isSaving = true;
        const finalProductIds = [this.selectedTrimId, ...this.selectedOptionIds];
        
        createOppLineItems({ opportunityId: this.recordId, productIds: finalProductIds })
            .then(result => {
                this.dispatchEvent(new ShowToastEvent({ title: '성공', message: result, variant: 'success' }));
                this.closeModal();
            })
            .catch(error => {
                this.handleError(error);
            })
            .finally(() => {
                this.isSaving = false;
            });
    }

    closeModal() {
        // 빠른 작업(Quick Action)에서 창을 닫는 표준 이벤트입니다.
        this.dispatchEvent(new CustomEvent('close'));
    }

    handleError(error) {
        console.error('An error occurred:', error);
        const message = error.body ? error.body.message : 'Unknown error';
        this.dispatchEvent(new ShowToastEvent({ title: '오류 발생', message: message, variant: 'error' }));
    }

    // 최종 확인 화면에 표시될 이름 getter들
    get selectedModelName() { return this.baseModelOptions?.find(m => m.value === this.selectedModelId)?.label; }
    get selectedTrimName() { return this.trimOptions?.find(t => t.value === this.selectedTrimId)?.label; }
    get finalOptions(){
        return this.optionOptions?.filter(opt => this.selectedOptionIds.includes(opt.value)) || [];
    }
}