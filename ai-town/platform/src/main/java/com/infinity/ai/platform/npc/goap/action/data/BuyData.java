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
public class BuyData extends BaseData {
    //卖家NPC，在谁那里买
    private Long buyerNpcId;
    //卖家NPC，在谁那里买
    private String buyerNpc;
    //买家买到的具体物品信息
    private SaleItem item;
}
