package com.infinity.ai.platform.npc.goap.action;

import com.infinity.ai.platform.manager.NpcBagManager;
import com.infinity.ai.platform.manager.NpcHolder;
import com.infinity.ai.platform.manager.NpcManager;
import com.infinity.ai.platform.npc.NPC;
import com.infinity.ai.platform.npc.goap.action.data.BuyData;
import com.infinity.ai.platform.npc.goap.action.data.SaleItem;
import com.infinity.common.base.exception.BusinessException;
import com.infinity.common.base.exception.ResultCode;
import com.infinity.common.config.data.ItemCfg;
import com.infinity.common.config.manager.GameConfigManager;
import com.infinity.common.consts.GoodsConsts;
import com.infinity.common.consts.GoodsSource;
import com.infinity.common.msg.platform.npc.NpcActionRequest;
import lombok.extern.slf4j.Slf4j;

import java.util.Map;

//购买行为
@Slf4j
public class BuyAction extends Action<NpcActionRequest.BuyData> {

    public BuyAction(Map<Integer, Action> preActions) {
        super(preActions);
    }

    @Override
    public String content(NPC npc, NpcActionRequest.BuyData params) {
        Long sellerNpcId = params.getSellerNpcId().longValue();
        NpcHolder npcHolder = NpcManager.getInstance().getOnlineNpcHolder(Long.valueOf(sellerNpcId));
        String npcName = npcHolder == null ? "" : npcHolder.getNpc().name;

        ItemCfg cfg = GameConfigManager.getInstance().getItemBaseDataManager().getItemConfigWithID(params.getItemId());
        String name = cfg == null ? "" : cfg.getName();
        SaleItem item = SaleItem.builder().count(params.count).price(params.price).itemId(params.itemId).itemName(name).build();
        return BuyData.builder().buyerNpcId(sellerNpcId).buyerNpc(npcName).item(item).build().toJsonString();
    }

    public BuyAction(Map<String, Boolean> preconditions, Map<String, Boolean> effects, int cost) {
        super(preconditions, effects, cost);
    }

    @Override
    public ActionEnumType getActionType() {
        return ActionEnumType.Buy;
    }

    @Override
    public boolean canDoing(NPC npc, NpcActionRequest.BuyData params) {
        return true;
    }

    @Override
    public void perform(NPC npc, NpcActionRequest.BuyData params) {
        log.debug("BuyAction perform,npcId={}", npc.getId());
        //找到卖家NPC
        NpcHolder sellerNpc = NpcManager.getInstance().getOnlineNpcHolder(params.getSellerNpcId());
        if (sellerNpc == null) {
            throw new BusinessException(ResultCode.NPC_NOT_EXIST_ERROR);
        }

        //广播给所有客户端
        sendMessage(npc,
                "oid",
                params.oid,
                "itemId", params.itemId,
                "count", params.getCount(),
                "price", params.getPrice(),
                "buyerNpcId", params.getSellerNpcId());

        //更新买家背包信息，如：增加金币、减少物品数量
        long money = params.count * params.getPrice();
        NpcBagManager bag = npc.getHolder().bag;
        bag.addGoods(GoodsConsts.ITEM_MONEY_ID, (int) money * -1, false, GoodsSource.BUY);
        bag.addGoods(params.itemId, params.count, false, GoodsSource.BUY);

        //更新卖家背包信息，如：减少金币、增加物品数量
        NpcBagManager sellerBag = sellerNpc.bag;
        sellerBag.addGoods(GoodsConsts.ITEM_MONEY_ID, (int) money, false, GoodsSource.BUY);
        sellerBag.addGoods(params.itemId, params.count * -1, false, GoodsSource.BUY);

        //todo 同步当前行为给python
        npc.getNpcDataListener().notifyProperty(false);
        sellerNpc.getNpc().getNpcDataListener().notifyProperty(false);
    }

    @Override
    public void afterPerform(NPC npc, Map<String, Object> params) {

    }
}
