package com.infinity.ai.platform.npc.goap.action;

import com.infinity.ai.platform.map.object.MapObject;
import com.infinity.ai.platform.npc.NPC;
import com.infinity.ai.platform.npc.goap.action.data.DinningData;
import com.infinity.common.msg.platform.npc.NpcActionRequest;
import lombok.extern.slf4j.Slf4j;

import java.util.Map;

//吃行为
@Slf4j
public class DinningAction extends Action<NpcActionRequest.DinningData> {

    public DinningAction(Map<Integer, Action> preActions) {
        super(preActions);
    }

    @Override
    public String content(NPC npc, NpcActionRequest.DinningData params) {
        return DinningData.builder().oid(params.oid).build().toJsonString();
    }

    public DinningAction(Map<String, Boolean> preconditions, Map<String, Boolean> effects, int cost) {
        super(preconditions, effects, cost);
    }

    @Override
    public ActionEnumType getActionType() {
        return ActionEnumType.Dinning;
    }

    @Override
    public boolean canDoing(NPC npc, NpcActionRequest.DinningData params) {
        return true;
    }

    @Override
    public void perform(NPC npc, NpcActionRequest.DinningData params) {
        log.debug("DinningAction perform,npcId={}", npc.getId());
        //获取床的坐标
        MapObject mapObject = findMapObj(params.getOid());

        //广播给所有客户端
        sendMessage(npc, "oid", mapObject.name);
    }

    @Override
    public void afterPerform(NPC npc, Map<String, Object> params) {
        npc.getNpcDataListener().notifyProperty(false);
    }
}
