package com.infinity.ai.platform.task.npc;

import com.infinity.ai.PNpc;
import com.infinity.ai.platform.manager.NpcHolder;
import com.infinity.ai.platform.manager.NpcManager;
import com.infinity.ai.platform.manager.Player;
import com.infinity.ai.platform.manager.PlayerManager;
import com.infinity.common.consts.ErrorCode;
import com.infinity.common.msg.BaseMsg;
import com.infinity.common.msg.ProtocolCommon;
import com.infinity.common.msg.platform.npc.NpcData;
import com.infinity.common.msg.platform.player.QueryCharaterRequest;
import com.infinity.common.msg.platform.player.QueryCharaterResponse;
import com.infinity.manager.task.BaseTask;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

/**
 * 玩家登录后查询玩家NPC信息
 * from:H5客户端
 * target:platform
 */
@Slf4j
public class QueryPlayerNpcTask extends BaseTask<QueryCharaterRequest> {

    @Override
    public int getCommandID() {
        return ProtocolCommon.CHARATER_QUERY_COMMAND;
    }

    @Override
    public boolean run0() {
        QueryCharaterRequest msg = this.getMsg();
        long playerId = msg.getPlayerId();
        if (playerId <= 0) {
            log.error("QueryPlayerNpcTask error, playerId params error,playerId={}", playerId);
            return true;
        }

        //校验用户是否在线
        Player player = PlayerManager.getInstance().getOnlinePlayerWithID(playerId);
        if (player == null) {
            //用户不在线
            sendErrorMsg(ErrorCode.PlayerNotOnlineError, ErrorCode.PlayerNotOnlieErrorMessage, msg);
            return true;
        }

        sendMessage(buildResponse(player, msg));
        return false;
    }

    private BaseMsg buildResponse(Player player, QueryCharaterRequest msg) {
        QueryCharaterResponse response = new QueryCharaterResponse();
        response.setRequestId(msg.getRequestId());
        response.setSessionId(msg.getSessionId());
        response.setPlayerId(player.getPlayerID());

        QueryCharaterResponse.ResponseData data = new QueryCharaterResponse.ResponseData();

        //当前登录玩家的npc
        Long npcId = player.getPlayerModel().get_v().getNpc().getNpcId();
        npcId = (npcId == null) ? 0L : npcId;
        if (npcId > 0) {
            NpcHolder npcHolder = NpcManager.getInstance().getNpcHolderIgnoreOnline(npcId);
            if (npcHolder != null) {
                PNpc npc = npcHolder.getNpcModel();
                NpcData myNpc = PlayerNpcSetTask.buildNpcData(npc);
                data.setMyNpc(myNpc);
            }
        }

        //其他玩家的npc
        List<NpcData> otherNpc = new ArrayList<>();
        Map<Long, NpcHolder> onlineNpcMap = NpcManager.getInstance().getOnlineNpcMap();
        Iterator<Map.Entry<Long, NpcHolder>> iter = onlineNpcMap.entrySet().iterator();
        while (iter.hasNext()) {
            Map.Entry<Long, NpcHolder> entry = iter.next();
            if (entry.getKey().longValue() == npcId.longValue()) {
                continue;
            }

            PNpc npc = entry.getValue().getNpcModel();
            if (npc == null) {
                NpcManager.getInstance().removeOnlineNpc(entry.getKey());
                continue;
            }

            NpcData myNpc = PlayerNpcSetTask.buildNpcData(entry.getValue().getNpcModel());
            otherNpc.add(myNpc);
        }

        data.setOtherNpc(otherNpc);
        response.setData(data);
        return response;
    }
}
