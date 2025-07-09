import { LightningElement, track } from 'lwc';

export default class VehicleQuoteSummary extends LightningElement {
    @track showDetails = false;

    // 샘플 데이터 (실제 데이터는 Apex 또는 API 연동)
    carPrice = '20,580,000';
    totalPrice = '20,756,900';
    registrationFee = '80,000';
    model = '레이';
    trim = '1.0 가솔린 그래비티';
    colorExterior = '아쿠아 민트';
    colorInterior = '블랙';
    options = ['드라이브 와이즈 II', '8인치 내비게이션', '스타일(그래비티)'];
    carImageUrl = 'https://yourdomain.com/path-to-kia-ray-image.png';

    get expandIcon() {
        return this.showDetails ? 'utility:chevrondown' : 'utility:chevronright';
    }

    toggleDetails() {
        this.showDetails = !this.showDetails;
    }
}
