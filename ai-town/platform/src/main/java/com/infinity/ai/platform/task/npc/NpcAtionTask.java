package com.infinity.ai.platform.task.npc;

import com.infinity.ai.platform.manager.NpcHolder;
import com.infinity.ai.platform.manager.NpcManager;
import com.infinity.common.base.exception.ResultCode;
import com.infinity.common.msg.ProtocolCommon;
import com.infinity.common.msg.platform.npc.NpcActionRequest;
import com.infinity.manager.task.BaseTask;
import lombok.extern.slf4j.Slf4j;

/**
 * python发过来的NPC行为
 * from: python
 * dest: 服务端
 */
@Slf4j
public class NpcAtionTask extends BaseTask<NpcActionRequest> {

    @Override
    public int getCommandID() {
        return ProtocolCommon.NPC_ACTION_COMMAND;
    }

    @Override
    public boolean run0() {
        NpcActionRequest msg = this.getMsg();
        log.debug("NpcAtionTask msg={}", msg.toString());
        long npcId = msg.getNpcId();
        if (npcId <= 0) {
            log.error("NpcAtionTask error, npcId params error,npcId={}", npcId);
            sendMessage(buildError(ResultCode.NPCID_FORMAT_ERROR, msg));
            return false;
        }

        NpcHolder npcHolder = NpcManager.getInstance().getOnlineNpcHolder(npcId);
        if (npcHolder == null) {
            log.debug("not found on line npc,npcId={}", npcId);
            sendMessage(buildError(ResultCode.NPC_NOT_EXIST_ERROR, msg));
            return false;
        }

        //执行行为
        try {
            npcHolder.getNpc().doAction(msg.getActionId(), msg.getData());
        }catch (Exception e){
            e.printStackTrace();
            npcHolder.getNpc().getNpcDataListener().notifyProperty(false);
        }
        return true;
    }
}
