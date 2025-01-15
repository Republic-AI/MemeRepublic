package com.infinity.ai.platform.task.npc;

import com.infinity.ai.platform.manager.NpcManager;
import com.infinity.ai.platform.npc.NpcStarter;
import com.infinity.ai.platform.task.system.BroadcastMesage;
import com.infinity.ai.PNpc;
import com.infinity.ai.platform.manager.IDManager;
import com.infinity.ai.platform.manager.Player;
import com.infinity.ai.platform.manager.PlayerManager;
import com.infinity.common.config.data.NpcCfg;
import com.infinity.common.config.manager.GameConfigManager;
import com.infinity.common.config.manager.NpcCfgManager;
import com.infinity.common.consts.ErrorCode;
import com.infinity.common.consts.SysParamsConsts;
import com.infinity.common.msg.BaseMsg;
import com.infinity.common.msg.ProtocolCommon;
import com.infinity.common.msg.platform.player.CharaterSetRequest;
import com.infinity.common.msg.platform.player.CharaterSetResponse;
import com.infinity.common.msg.platform.npc.NpcData;
import com.infinity.common.msg.platform.npc.NpcNotifyRequest;
import com.infinity.common.utils.StringUtils;
import com.infinity.db.db.DBManager;
import com.infinity.manager.task.BaseTask;
import lombok.extern.slf4j.Slf4j;

/**
 * 玩家首次登录NPC角色设置
 */
@Slf4j
public class PlayerNpcSetTask extends BaseTask<CharaterSetRequest> {

    @Override
    public int getCommandID() {
        return ProtocolCommon.CHARATER_SET_COMMAND;
    }

    @Override
    public boolean run0() {
        CharaterSetRequest msg = this.getMsg();
        long playerId = msg.getPlayerId();
        if (playerId <= 0) {
            log.error("CatModifyTask error, playerId params error,playerId={}", playerId);
            return true;
        }

        //校验用户是否在线
        Player player = PlayerManager.getInstance().getOnlinePlayerWithID(playerId);
        if (player == null) {
            //用户不在线
            sendErrorMsg(ErrorCode.PlayerNotOnlineError, ErrorCode.PlayerNotOnlieErrorMessage, msg);
            return true;
        }

        //创建NPC
        PNpc npc = setCharater(player, msg);

        //返回创建的npc给玩家
        NpcData myNpc = buildNpcData(npc);
        sendMessage(buildResponse(myNpc, player, msg));

        //广播创建的npc给其他在线玩家
        //广播给所有的gateway
        broadcastNpc(myNpc, player, msg);
        return true;
    }

    private void broadcastNpc(NpcData myNpc, Player player, CharaterSetRequest msg) {
        NpcNotifyRequest response = new NpcNotifyRequest();
        response.setRequestId(msg.getRequestId());
        response.setSessionId(msg.getSessionId());
        response.setPlayerId(player.getPlayerID());
        NpcNotifyRequest.RequestData data = new NpcNotifyRequest.RequestData();
        data.setMyNpc(myNpc);
        response.setData(data);
        BroadcastMesage.getInstance().send(player.getPlayerID(), response.toString());
    }

    private PNpc setCharater(Player player, CharaterSetRequest msg) {
        //创建npc
        PNpc npc = null;
        try {
            npc = newDBNpc(msg);
            DBManager.add(npc);
            player.getPlayerModel().get_v().getNpc().setNpcId(npc.getId());
            player.getPlayerModel().get_v().getNpc().getNpcIds().add(npc.getId());
            NpcStarter.getInstance().start(npc);
        } catch (Exception e) {
            if (npc != null && npc.getId() > 0) {
                log.error("new npc[{},{}] fail, err: {}", npc.getId(), npc.getName(), e.getMessage());
                DBManager.delete(PNpc.class, npc.getId());
                player.getPlayerModel().get_v().getNpc().setNpcId(0L);
                player.getPlayerModel().get_v().getNpc().getNpcIds().remove(npc.getId());
                NpcManager.getInstance().removeOnlineNpc(npc.getId());
            }
            throw new IllegalStateException(e);
        }
        return npc;
    }

    public PNpc newDBNpc(CharaterSetRequest msg) {
        PNpc dbData = new PNpc();
        dbData.setId(IDManager.getInstance().getId());
        dbData.setPlayerId(msg.getPlayerId());

        CharaterSetRequest.RequestData charater = msg.getData();
        //角色模型
        if (charater.getModel() > 0)
            dbData.setModel(charater.getModel());
        //角色名称
        if (!StringUtils.isEmpty(charater.getName()))
            dbData.setName(charater.getName());
        //职业
        if (!StringUtils.isEmpty(charater.getCareer()))
            dbData.setCareer(charater.getCareer());
        //关键词
        if (!StringUtils.isEmpty(charater.getKeyword()))
            dbData.setKeyword(charater.getKeyword());
        //发型
        if (charater.getHair() > 0)
            dbData.setHair(charater.getHair());
        //top
        if (charater.getTop() > 0)
            dbData.setTop(charater.getTop());
        //bottoms
        if (charater.getBottoms() > 0)
            dbData.setBottoms(charater.getBottoms());

        NpcCfgManager npcCfgManager = GameConfigManager.getInstance().getNpcCfgManager();
        String defaultNpcCfgId = GameConfigManager.getInstance().getSysParamCfgManager()
                .getParameterValue(SysParamsConsts.SYS_DEFAULT_NPC, "10001");
        NpcCfg npcCfg = npcCfgManager.get(Integer.parseInt(defaultNpcCfgId));
        dbData.setX(npcCfg.getPositionX());
        dbData.setY(npcCfg.getPositionY());
        dbData.setSpeed(0);
        dbData.setCreatedate(System.currentTimeMillis());
        dbData.setType(npcCfg.getType());
        return dbData;
    }

    private BaseMsg buildResponse(NpcData myNpc, Player player, CharaterSetRequest msg) {
        CharaterSetResponse response = new CharaterSetResponse();
        response.setRequestId(msg.getRequestId());
        response.setSessionId(msg.getSessionId());
        response.setPlayerId(player.getPlayerID());

        CharaterSetResponse.ResponseData data = new CharaterSetResponse.ResponseData();
        data.setMyNpc(myNpc);
        response.setData(data);
        return response;
    }

    public static NpcData buildNpcData(PNpc npc) {
        NpcData myNpc = new NpcData();
        //NPC ID
        myNpc.setId(npc.getId());
        //NPC名字
        myNpc.setName(npc.getName());
        //NPC类型
        myNpc.setType(npc.getType());
        //模型ID
        myNpc.setModel(npc.getModel());
        //职业
        myNpc.setCareer(npc.getCareer());
        //关键词
        myNpc.setKeyword(npc.getKeyword());
        //发型
        myNpc.setHair(npc.getHair());
        //top
        myNpc.setTop(npc.getTop());
        //bottoms
        myNpc.setBottoms(npc.getBottoms());
        //NPC移动速度
        myNpc.setSpeed(npc.getSpeed());
        //NPC位置X
        myNpc.setX(npc.getX());
        //NPC位置Y
        myNpc.setY(npc.getY());
        return myNpc;
    }

}
