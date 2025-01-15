package com.infinity.ai.platform.npc.goap.action.data;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SaleData extends BaseData {
    private Long buyerNpcId;
    //买家NPC
    private String buyerNpc;

    //卖给买家的具体物品信息
    private List<SaleItem> items;
}
