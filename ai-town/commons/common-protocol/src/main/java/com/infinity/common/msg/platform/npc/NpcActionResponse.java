package com.infinity.common.msg.platform.npc;

import com.infinity.common.msg.BaseMsg;
import com.infinity.common.msg.ProtocolCommon;

//登出
public class NpcActionResponse extends BaseMsg {

    @Override
    public int getType() {
        return ProtocolCommon.MSG_TYPE_PLATFORM;
    }

    @Override
    public int getCommand() {
        return ProtocolCommon.NPC_ACTION_COMMAND;
    }

    public static int getCmd() {
        return ProtocolCommon.NPC_ACTION_COMMAND;
    }
}
