public with sharing class ProductConfiguratorController {

    /**
     * @description 제품군(Family)을 기준으로 활성화된 제품 목록을 조회합니다. (1단계: 모델 선택용)
     * @param family (예: '기본 모델')
     * @return 제품 레코드 목록
     */
    @AuraEnabled(cacheable=true)
    public static List<Product2> getProductsByFamily(String family) {
        // '제품군(Family)' 필드를 사용하여 제품을 필터링합니다.
        return [
            SELECT Id, Name, Description 
            FROM Product2 
            WHERE Family = :family AND IsActive = true
            ORDER BY Name
        ];
    }

    /**
     * @description 선택된 상위 제품에 종속된 하위 제품 목록을 조회합니다. (2, 4단계: 트림 및 옵션 선택용)
     * @param parentProductId (상위 제품의 ID)
     * @param family (찾으려는 하위 제품의 제품군)
     * @return 제품 레코드 목록
     */
    @AuraEnabled(cacheable=true)
    public static List<Product2> getProductsByParent(Id parentProductId, String family) {
        // [확인 완료] 우리가 만든 Parent_Product__c 필드를 사용하여 하위 제품을 조회합니다.
        return [
            SELECT Id, Name, Description 
            FROM Product2 
            WHERE Parent_Product__c = :parentProductId AND Family = :family AND IsActive = true
            ORDER BY Name
        ];
    }

    /**
     * @description 최종 선택된 제품들을 기회(Opportunity)의 라인 아이템으로 추가합니다.
     * @param opportunityId (현재 기회의 ID)
     * @param productIds (선택된 모든 제품들의 ID 목록)
     * @return 성공 또는 실패 메시지
     */
    @AuraEnabled
    public static String createOppLineItems(Id opportunityId, List<Id> productIds) {
        // 기존에 연결된 제품이 있다면 삭제하여, 항상 새로운 견적으로 갱신합니다.
        List<OpportunityLineItem> existingItems = [SELECT Id FROM OpportunityLineItem WHERE OpportunityId = :opportunityId];
        if (!existingItems.isEmpty()) {
            delete existingItems;
        }

        Opportunity opp = [SELECT Pricebook2Id FROM Opportunity WHERE Id = :opportunityId LIMIT 1];
        Id pricebookId = opp.Pricebook2Id;

        if (pricebookId == null) {
            pricebookId = [SELECT Id FROM Pricebook2 WHERE IsStandard = true LIMIT 1].Id;
            // 기회에 표준 가격표를 연결해줍니다.
            opp.Pricebook2Id = pricebookId;
            update opp;
        }

        List<PricebookEntry> entries = [
            SELECT Id, Product2Id 
            FROM PricebookEntry 
            WHERE Product2Id IN :productIds AND Pricebook2Id = :pricebookId
        ];
        
        Map<Id, Id> productToEntryMap = new Map<Id, Id>();
        for (PricebookEntry entry : entries) {
            productToEntryMap.put(entry.Product2Id, entry.Id);
        }
        
        List<OpportunityLineItem> itemsToInsert = new List<OpportunityLineItem>();
        for (Id productId : productIds) {
            if (productToEntryMap.containsKey(productId)) {
                itemsToInsert.add(new OpportunityLineItem(
                    OpportunityId = opportunityId,
                    PricebookEntryId = productToEntryMap.get(productId),
                    Quantity = 1,
                    UnitPrice = 0 // UnitPrice는 시스템이 PricebookEntry를 통해 자동으로 설정합니다.
                ));
            }
        }

        if (!itemsToInsert.isEmpty()) {
            insert itemsToInsert;
        }
        
        return itemsToInsert.size() + '개의 제품이 견적에 성공적으로 추가되었습니다.';
    }
}