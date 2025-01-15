package com.infinity.ai.platform.npc.goap.action;

import com.infinity.ai.platform.manager.NpcBagManager;
import com.infinity.ai.platform.manager.NpcHolder;
import com.infinity.ai.platform.manager.NpcManager;
import com.infinity.ai.platform.npc.NPC;
import com.infinity.ai.platform.npc.goap.action.data.SaleData;
import com.infinity.ai.platform.npc.goap.action.data.SaleItem;
import com.infinity.common.base.exception.BusinessException;
import com.infinity.common.base.exception.ResultCode;
import com.infinity.common.config.data.ItemCfg;
import com.infinity.common.config.manager.GameConfigManager;
import com.infinity.common.consts.GoodsConsts;
import com.infinity.common.consts.GoodsSource;
import com.infinity.common.msg.platform.npc.NpcActionRequest;
import lombok.extern.slf4j.Slf4j;

import java.util.Arrays;
import java.util.Map;

//销售行为
@Slf4j
public class SaleAction extends Action<NpcActionRequest.SaleData> {

    public SaleAction(Map<Integer, Action> preActions) {
        super(preActions);
    }

    @Override
    public String content(NPC npc, NpcActionRequest.SaleData params) {
        Long buyerNpcId = params.getBuyerNpcId().longValue();
        NpcHolder npcHolder = NpcManager.getInstance().getOnlineNpcHolder(Long.valueOf(buyerNpcId));
        String npcName = npcHolder == null ? "" : npcHolder.getNpc().name;

        ItemCfg cfg = GameConfigManager.getInstance().getItemBaseDataManager().getItemConfigWithID(params.getItemId());
        String name = cfg == null ? "" : cfg.getName();
        SaleItem item = SaleItem.builder().count(params.count).price(params.price).itemId(params.itemId).itemName(name).build();
        return SaleData.builder().buyerNpcId(buyerNpcId).buyerNpc(npcName).buyerNpc(npcName).items(Arrays.asList(item)).build().toJsonString();
    }

    public SaleAction(Map<String, Boolean> preconditions, Map<String, Boolean> effects, int cost) {
        super(preconditions, effects, cost);
    }

    @Override
    public ActionEnumType getActionType() {
        return ActionEnumType.Sale;
    }

    @Override
    public boolean canDoing(NPC npc, NpcActionRequest.SaleData params) {
        return true;
    }

    @Override
    public void perform(NPC npc, NpcActionRequest.SaleData params) {
        log.debug("SaleAction perform,npcId={}", npc.getId());
        //找到买家NPC
        NpcHolder buyerNpc = NpcManager.getInstance().getOnlineNpcHolder(params.getBuyerNpcId());
        if (buyerNpc == null) {
            throw new BusinessException(ResultCode.NPC_NOT_EXIST_ERROR);
        }

        //广播给所有客户端
        sendMessage(npc,
                "oid",
                params.oid,
                "itemId", params.itemId,
                "count", params.getCount(),
                "price", params.getPrice(),
                "buyerNpcId", params.getBuyerNpcId());

        //更新卖家背包信息，如：增加金币、减少物品数量
        long money = params.count * params.getPrice();
        NpcBagManager bag = npc.getHolder().bag;
        bag.addGoods(GoodsConsts.ITEM_MONEY_ID, (int) money, false, GoodsSource.SALE);
        bag.addGoods(params.itemId, -params.count, false, GoodsSource.SALE);

        //更新买家背包信息，如：减少金币、增加物品数量
        NpcBagManager buyerBag = buyerNpc.bag;
        buyerBag.addGoods(GoodsConsts.ITEM_MONEY_ID, (int) money * -1, false, GoodsSource.SALE);
        buyerBag.addGoods(params.itemId, params.count, false, GoodsSource.SALE);

        //todo 同步当前行为给python
        npc.getNpcDataListener().notifyProperty(false);
        buyerNpc.getNpc().getNpcDataListener().notifyProperty(false);
    }

    @Override
    public void afterPerform(NPC npc, Map<String, Object> params) {

    }
}
