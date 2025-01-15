package com.infinity.ai.platform.npc.goap.action;

import com.infinity.ai.platform.map.object.MapObject;
import com.infinity.ai.platform.npc.NPC;
import com.infinity.ai.platform.npc.goap.action.data.MoveData;
import com.infinity.ai.platform.npc.map.Position;
import com.infinity.common.msg.platform.npc.NpcActionRequest;
import lombok.extern.slf4j.Slf4j;

import java.util.Map;

// 移动行动类
@Slf4j
public class MoveToAction extends Action<NpcActionRequest.MoveData> {
    private Position targetPosition; // 目标位置

    public MoveToAction(Map<Integer, Action> preActions) {
        super(preActions);
    }

    @Override
    public String content(NPC npc, NpcActionRequest.MoveData params) {
        return MoveData.builder().target(params.getOid()).build().toJsonString();
    }

    public MoveToAction(Map<String, Boolean> preconditions, Map<String, Boolean> effects, Position targetPosition, int cost) {
        super(preconditions, effects, cost);
        this.targetPosition = targetPosition;
    }

    @Override
    public ActionEnumType getActionType() {
        return ActionEnumType.Move;
    }

    @Override
    public boolean canDoing(NPC npc, NpcActionRequest.MoveData params) {
        return true;
    }

    //移动NPC到目标位置
    @Override
    public void perform(NPC npc, NpcActionRequest.MoveData params) {
        log.debug("MoveToAction perform,npcId={}", npc.getId());
        //获取目标对象坐标
        MapObject mapObject = findMapObj(params.getOid());

        //广播给所有客户端
        sendMessage(npc, "oid", mapObject.name);
    }

    @Override
    public void afterPerform(NPC npc, Map<String, Object> params) {
        //todo 移动结束，告知PYTHON
        npc.getNpcDataListener().notifyProperty(false);
    }
}


