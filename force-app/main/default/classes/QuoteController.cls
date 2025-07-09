public with sharing class QuoteController {

    // LWC가 기회 정보와 제품 목록을 한번에 받아서 쉽게 사용할 수 있도록,
    // 데이터를 담아둘 '데이터 바구니(Wrapper Class)'를 먼저 정의합니다.
    public class QuoteData {
        @AuraEnabled public Opportunity opportunity;
        @AuraEnabled public List<OpportunityLineItem> lineItems;
    }

    // LWC에서 호출할 수 있도록 @AuraEnabled 어노테이션을 추가합니다.
    // cacheable=true는 결과를 임시 저장하여 성능을 높여줍니다.
    @AuraEnabled(cacheable=true)
    public static QuoteData getQuoteDetails(Id opportunityId) {
        // 반환할 데이터를 담을 인스턴스를 생성합니다.
        QuoteData data = new QuoteData();

        // [데이터 조회 1] 기회의 상세 정보를 가져옵니다.
        // 이전에 우리가 직접 만든 커스텀 필드들의 API 이름(__c로 끝나는)을 모두 포함시킵니다.
        data.opportunity = [
            SELECT Id, Name, Amount, Account.Name,
                   Exterior_Color__c, Interior_Color__c, Tax_Benefit__c, 
                   Shipping_Fee__c, Registration_Fee__c
            FROM Opportunity
            WHERE Id = :opportunityId
        ];

        // [데이터 조회 2] 기회에 연결된 모든 제품(차량, 옵션) 목록을 가져옵니다.
        data.lineItems = [
            SELECT Id, PricebookEntry.Product2.Name, TotalPrice, Quantity
            FROM OpportunityLineItem
            WHERE OpportunityId = :opportunityId
            ORDER BY CreatedDate ASC
        ];

        // 모든 데이터를 담은 '바구니'를 반환합니다.
        return data;
    }
}