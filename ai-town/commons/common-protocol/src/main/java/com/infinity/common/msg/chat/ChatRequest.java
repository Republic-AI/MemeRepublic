package com.infinity.common.msg.chat;

import com.infinity.common.msg.BaseMsg;
import com.infinity.common.msg.ProtocolCommon;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

//聊天
public class ChatRequest extends BaseMsg<ChatRequest.RequestData> {

    @Override
    public int getType() {
        return ProtocolCommon.MSG_TYPE_CHAT;
    }

    @Override
    public int getCommand() {
        return ProtocolCommon.kChatCommand;
    }

    public static int getCmd() {
        return ProtocolCommon.kChatCommand;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class RequestData {
        //是否弹幕:0：是，1：否
        public int barrage;
        //类型：0：文字，1：语音
        private int type;
        //聊天信息
        public String context;
        //npc id
        public Long npcId;
        //发送者名字
        public String sender;
    }
}
