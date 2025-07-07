import { LightningElement } from 'lwc';
import createTestDrive from "@salesforce/apex/TestDriveController.createTestDrive";
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class TestDriveForm extends LightningElement {
    customerName = '';
    carModel = '';
    driveDate = '';
    driveTime='';

    carModelOptions = [
    { label: '모닝', value: '모닝' },
    { label: '레이', value: '레이' },
    { label: 'k5', value: 'k5' },
    { label: 'k9', value: 'k9' },
];

    handleInputChange(event) {
        const field = event.target.dataset.id;
        this[field] = event.target.value;
    }

    async handleSave() {
        // 데이터 검증 추가
        if (!this.customerName || !this.carModel || !this.driveDate || !this.driveTime) {
            this.dispatchEvent(new ShowToastEvent({
                title: '입력 오류',
                message: '모든 필드를 입력해주세요.',
                variant: 'error'
            }));
            return;
        }

        console.log('🧾 제출 전:', {
        customerName: this.customerName,
        carModel: this.carModel,
        driveDate: this.driveDate,
        driveTime: this.driveTime
    });
        try {
            const datetimeString = `${this.driveDate}T${this.driveTime}:00.000Z`;
            const driveDateTime = new Date(datetimeString); 
            
            console.log('📅 변환된 DateTime:', driveDateTime);
            
            await createTestDrive({
                customerName: this.customerName,
                carModel: this.carModel,
                driveDate: driveDateTime
            });

            this.dispatchEvent(new ShowToastEvent({
                title: '성공',
                message: '시승 신청이 저장되었습니다.',
                variant: 'success'
            }));

            this.customerName = '';
            this.carModel = '';
            this.driveDate = '';
            this.driveTime = '';

            console.log('제출 값:', {
            customerName: this.customerName,
            carModel: this.carModel,
            driveDate: driveDateTime
            });

        } catch (error) {
            console.log('⚠️ error (raw):', error);
            try {
                console.log('🧾 error JSON:', JSON.stringify(error));
            } catch(e) {
                console.log('❌ JSON.stringify 실패:', e);
            }

            // 더 자세한 에러 메시지 처리
            let errorMessage = '저장 실패';
            if (error.body && error.body.message) {
                errorMessage = error.body.message;
            } else if (error.message) {
                errorMessage = error.message;
            } else if (typeof error === 'string') {
                errorMessage = error;
            }

            this.dispatchEvent(new ShowToastEvent({
                title: '에러',
                message: errorMessage,
                variant: 'error'
            }));

        }
    }
    
}