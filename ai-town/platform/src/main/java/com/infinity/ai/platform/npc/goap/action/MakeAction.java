package com.infinity.ai.platform.npc.goap.action;

import com.infinity.ai.platform.manager.NpcBagManager;
import com.infinity.ai.platform.map.object.MapObject;
import com.infinity.ai.platform.npc.NPC;
import com.infinity.ai.platform.npc.goap.action.data.ItemData;
import com.infinity.ai.platform.npc.goap.action.data.MakeData;
import com.infinity.common.config.data.ItemCfg;
import com.infinity.common.config.manager.GameConfigManager;
import com.infinity.common.config.manager.ItemBaseDataManager;
import com.infinity.common.consts.GoodsSource;
import com.infinity.common.msg.platform.npc.NpcActionRequest;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

//制作行动类
@Slf4j
public class MakeAction extends Action<NpcActionRequest.MakeData> {

    public MakeAction(Map<Integer, Action> preActions) {
        super(preActions);
    }

    @Override
    public String content(NPC npc, NpcActionRequest.MakeData params) {
        List<ItemData> cost = new ArrayList<>();
        List<NpcActionRequest.Item> items = params.items;
        if (items != null) {
            ItemBaseDataManager cfgManager = GameConfigManager.getInstance().getItemBaseDataManager();
            for (NpcActionRequest.Item item : items) {
                ItemCfg cfg = cfgManager.getItemConfigWithID(item.itemId);
                String name = cfg == null ? "" : cfg.getName();
                cost.add(ItemData.builder().count(item.count).itemId(item.itemId).itemName(name).build());
            }
        }

        return MakeData.builder().oid(params.oid).cost(cost).build().toJsonString();
    }

    public MakeAction(Map<String, Boolean> preconditions, Map<String, Boolean> effects, int cost) {
        super(preconditions, effects, cost);
    }

    @Override
    public ActionEnumType getActionType() {
        return ActionEnumType.Make;
    }

    @Override
    public boolean canDoing(NPC npc, NpcActionRequest.MakeData params) {
        return true;
    }

    @Override
    public void perform(NPC npc, NpcActionRequest.MakeData params) {
        log.debug("MakeAction perform,npcId={}", npc.getId());
        //地图上厨房桌子的ID
        MapObject mapObject = findMapObj(params.getOid());

        //广播给所有客户端
        Long bid = this.getBid();
        List<NpcActionRequest.Item> items = params.getItems() == null ? Collections.EMPTY_LIST : params.getItems();
        sendMessage(npc, "oid", mapObject.name, "items", items);

        //更新NPC背包信息，如：减少物品数量
        NpcBagManager bag = npc.getHolder().bag;
        items.stream().forEach(item -> bag.addGoods(item.itemId, item.count * -1, false, GoodsSource.Feeding));
    }

    @Override
    public void afterPerform(NPC npc, Map<String, Object> params) {
        //todo 同步当前行为给python
        npc.getNpcDataListener().notifyProperty(false);
    }
}


