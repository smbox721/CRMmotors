public with sharing class TestDriveController {
@AuraEnabled(cacheable=false)
public static void createTestDrive(String customerName, String carModel, DateTime driveDate) {
    try {
        System.debug('=== TestDriveController.createTestDrive 시작 ===');
        System.debug('customerName: ' + customerName);
        System.debug('carModel: ' + carModel);
        System.debug('driveDate: ' + driveDate);
        
        if (String.isBlank(customerName)) {
            throw new AuraHandledException('고객 이름이 비어 있습니다.');
        }
        
        if (String.isBlank(carModel)) {
            throw new AuraHandledException('차량 모델이 비어 있습니다.');
        }
        
        if (driveDate == null) {
            throw new AuraHandledException('시승 날짜가 비어 있습니다.');
        }

        Account acc;
        List<Account> accounts = [SELECT Id FROM Account WHERE Name = :customerName LIMIT 1];
        if (accounts.isEmpty()) {
            acc = new Account(Name = customerName);
            insert acc;
            System.debug('새로운 Account 생성: ' + acc.Id);
        } else {
            acc = accounts[0];
            System.debug('기존 Account 사용: ' + acc.Id);
        }

        Test_Drive__c td = new Test_Drive__c(
            Account__c = acc.Id,
            Test_Drive_Vehicle__c = carModel,
            Test_drive_Date__c = driveDate
        );

        insert td;
        System.debug('Test_Drive__c 레코드 생성 완료: ' + td.Id);
        System.debug('=== TestDriveController.createTestDrive 완료 ===');
        
    } catch (Exception e) {
        System.debug('=== TestDriveController.createTestDrive 에러 ===');
        System.debug('에러 메시지: ' + e.getMessage());
        System.debug('에러 타입: ' + e.getTypeName());
        System.debug('스택 트레이스: ' + e.getStackTraceString());
        throw new AuraHandledException('시승 신청 저장 중 오류가 발생했습니다: ' + e.getMessage());
    }
}

}